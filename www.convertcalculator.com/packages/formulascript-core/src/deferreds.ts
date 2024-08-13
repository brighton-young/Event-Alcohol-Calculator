/**
 * @module formulascript/deferreds (private)
 * @description This module contains the deferred constructors used by the compiler
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * Deferreds are the core of the formulascript runtime. They are functions that
 * given a context will return a value. Deferreds take a context as input and
 * produce a value as output. By using deferreds we only need to compile expressions
 * once and can then evaluate them multiple times with different contexts.
 */

/* eslint-disable no-await-in-loop */

import { Value, Expression, Deferred } from './interpreter';

export type BinaryOperation = (lhs: Value, rhs: Value) => Value;

const parseNumber = (value: Value): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);

    if (!Number.isNaN(n)) {
      return n;
    }
  }

  if (value === null) {
    throw new Error("#VALUE! Expected a number but got 'null'");
  }

  if (typeof value === 'string') {
    throw new Error(`#VALUE! Expected a number but got a string: '${value}'`);
  }

  throw new Error(`#VALUE! Expected a number`);
};

export const BinaryOperations = {
  MOD: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) % parseNumber(rhs);
  },
  POW: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) ** parseNumber(rhs);
  },
  MUL: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) * parseNumber(rhs);
  },
  DIV: (lhs: Value, _rhs: Value) => {
    const rhs = parseNumber(_rhs);
    if (rhs === 0) {
      throw Error('#DIV/0 Right hand side of division is zero');
    }
    return parseNumber(lhs) / rhs;
  },
  ADD: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) + parseNumber(rhs);
  },
  SUB: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) - parseNumber(rhs);
  },

  CAT: (lhs: Value, rhs: Value) => {
    if (typeof lhs === 'boolean' || typeof rhs === 'boolean') {
      throw new Error('#VALUE! Cannot concatenate boolean values.');
    }
    return String(lhs) + String(rhs);
  },

  EQ: (lhs: Value, rhs: Value) => {
    return lhs === rhs;
  },
  LT: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) < parseNumber(rhs);
  },
  GT: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) > parseNumber(rhs);
  },
  LE: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) <= parseNumber(rhs);
  },
  GE: (lhs: Value, rhs: Value) => {
    return parseNumber(lhs) >= parseNumber(rhs);
  },
  NE: (lhs: Value, rhs: Value) => {
    return lhs !== rhs;
  },

  OR: (lhs: Value, rhs: Value) => {
    return lhs || rhs;
  },
  AND: (lhs: Value, rhs: Value) => {
    return lhs && rhs;
  },
} as const;

export type UnaryOperation = (value: Value) => Value;

export const UnaryOperations = {
  NEG: (value: Value) => {
    return -parseNumber(value);
  },
  POS: (value: Value) => {
    return +parseNumber(value);
  },
  SCALE: (value: Value) => {
    return parseNumber(value) / 100;
  },
  NOT: (value: Value) => {
    return !value;
  },
} as const;

// toplevel formula entrypoint
export const formula = (
  variables: [string, Expression][],
  expression: Expression,
): Deferred => {
  return async (ctx) => {
    for (let i = 0; i < variables.length; i++) {
      const [name, body] = variables[i];
      // eslint-disable-next-line no-await-in-loop
      const result = await ctx.evaluate(body);

      if (!ctx.store(name, result)) {
        if (result === undefined) {
          throw new Error(
            `Cannot assign to '${name}' as the right hand side is empty`,
          );
        }

        throw new Error(
          `#NAME? Cannot assign to '${name}' as it is already defined`,
        );
      }
    }

    return ctx.evaluate(expression);
  };
};

export const literal = (value: Value): Deferred => {
  return async () => {
    return value;
  };
};

export const variable = (name: string): Deferred => {
  return async (ctx) => {
    const value = ctx.load(name);

    if (value === undefined) {
      throw new Error(`#NAME? ${name}`);
    }

    if (value instanceof Error) {
      throw value;
    }

    return value;
  };
};

export const call = (expr: Expression, args: Expression[]): Deferred => {
  return async (ctx) => {
    const f = await ctx.evaluate(expr);

    if (typeof f !== 'function') {
      throw new Error(
        `#VALUE! Expresssion is not a function but '${typeof f}' and therefore not callable`,
      );
    }

    const result = await f(
      ctx,
      args.map((arg) => {
        return arg.deferred;
      }),
    );

    return result;
  };
};

export const binop = (
  lhs: Expression,
  rhs: Expression,
  operation: BinaryOperation,
): Deferred => {
  return async (ctx) => {
    return operation(await ctx.evaluate(lhs), await ctx.evaluate(rhs));
  };
};

export const unaryop = (
  value: Expression,
  operation: UnaryOperation,
): Deferred => {
  return async (ctx) => {
    return operation(await ctx.evaluate(value));
  };
};

export const ternary = (
  condition: Expression,
  truthy: Expression,
  falsy: Expression,
): Deferred => {
  return async (ctx) => {
    const predicate = await ctx.evaluate(condition);
    return predicate ? ctx.evaluate(truthy) : ctx.evaluate(falsy);
  };
};

export const empty = (): Deferred => {
  return async () => {
    return null;
  };
};

export const lambda = (params: string[], body: Expression): Deferred => {
  if (new Set(params).size !== params.length) {
    return () => {
      throw new Error(
        '#VALUE! FUNCTION declaration is not allowed to have duplicate parameters.',
      );
    };
  }

  return async (parentCtx) => {
    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (parentCtx.load(param) !== undefined) {
        throw new Error(
          `#VALUE! FUNCTION declares duplicate parameter '${param}' with the same name as a builtin value`,
        );
      }
    }

    const parentFrame = parentCtx.cloneFrame();

    return async (ctx, args) => {
      // TODO: map all args to evaluated values then bind to parameter
      // this way all arguments have to be valid, hopefully reducing user
      // bugs where they expect different behavior

      const localFrame = ctx.cloneFrame();

      for (let i = 0; i < params.length; i++) {
        const arg = args[i];

        if (arg === undefined) {
          throw new Error(
            `#VALUE! Missing argument to user function at position: '${i + 1}'`,
          );
        }

        // eslint-disable-next-line no-await-in-loop
        const value = await ctx.evaluate({
          deferred: arg,
          // TODO: migrate to args -> Expression[]
          // this is not correct
          // args should be Expression[] not Deferred[], which would fix this
          // however, this is a breaking change for all formula functions
          startOffset: body.startOffset,
          endOffset: body.endOffset,
          names: body.names,
        });

        if (!ctx.store(params[i], value)) {
          if (value === undefined) {
            throw new Error(
              `Cannot assign to '${params[i]}' as its value would be empty`,
            );
          }
          throw new Error(
            `#NAME? Cannot assign to '${params[i]}' as it is already defined`,
          );
        }
      }

      ctx.capture(parentFrame);
      const result = await ctx.evaluate(body);
      ctx.restore(localFrame);

      return result;
    };
  };
};

export const error = (message: string): Deferred => {
  return async () => {
    throw new Error(`ERROR: ${message}`);
  };
};

export const array = (elements: Expression[]): Deferred => {
  return async (ctx) => {
    return Promise.all(
      elements.map((element) => {
        return ctx.evaluate(element);
      }),
    );
  };
};

export const comprehension = (
  expr: Expression,
  name: string,
  iter: Expression,
  cond: Expression | null = null,
): Deferred => {
  return async (ctx) => {
    const iterator = await ctx.evaluate(iter);

    if (!Array.isArray(iterator)) {
      throw new Error(
        `#VALUE! Cannot iterate over non-array value '${iterator}'`,
      );
    }

    const results: Value[] = [];

    for (let i = 0; i < iterator.length; i++) {
      const element = iterator[i];

      const localFrame = ctx.cloneFrame();

      if (!ctx.store(name, element)) {
        throw new Error(
          `#NAME? Cannot assign to '${name}' as it is already defined`,
        );
      }

      const result = await ctx.evaluate(expr);

      if (cond) {
        const predicate = await ctx.evaluate(cond);
        if (predicate) {
          results.push(result);
        }
      } else {
        results.push(result);
      }

      ctx.restore(localFrame);
    }

    return results;
  };
};

const display = (value: Value): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value === null) {
    return '<EMPTY>';
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (Array.isArray(value)) {
    return `[${value.map(display).join(', ')}]`;
  }

  if (typeof value === 'object') {
    return `{${Object.entries(value)
      .map(([key, val]) => {
        return `${key}: ${display(val)}`;
      })
      .join(', ')}}`;
  }

  return '<UNKNOWN>';
};

export const joinedString = (parts: (string | Expression)[]): Deferred => {
  return async (ctx) => {
    const strings: string[] = await Promise.all(
      parts.map(async (part) => {
        if (typeof part === 'string') {
          return part;
        }
        return display(await ctx.evaluate(part));
      }),
    );

    return strings.join('');
  };
};
