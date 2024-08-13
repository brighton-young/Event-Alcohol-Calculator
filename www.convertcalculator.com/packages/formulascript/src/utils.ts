import type { Context, Deferred, Value } from 'formulascript/interpreter';
import memoize from 'lodash/memoize';

export const miniParser = (expression: string) => {
  const regEx = /[\w\s{}]+(?=[''!@#$%^&*(),.?":|<>=+\-/*])|((\w|\s)+)$/g;
  const matches = [...Array.from(new Set(String(expression).match(regEx)))];

  const newExpression = matches.reduce((reducedExpression, match) => {
    if (!Number.isNaN(Number(match))) return reducedExpression;

    return reducedExpression.replace(new RegExp(match, 'g'), `"${match}"`);
  }, String(expression));

  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict";return (${String(newExpression)})`)();
  } catch (e) {
    return false;
  }
};

// types?
export const getIndexes = (range: any, criterion: any) => {
  const criterionHasOperators = String(criterion).search(/[!<>=%]/) > -1;

  return range.reduce((reducedIndexes, value, index) => {
    if (
      miniParser(`${value}${!criterionHasOperators ? '==' : ''}${criterion}`)
    ) {
      return [...reducedIndexes, ...[index]];
    }

    return reducedIndexes;
  }, []);
};

export const getArgsOrNA = (args: Deferred[], n: number): Deferred[] => {
  if (args.length < n) {
    throw new Error('#N/A Not enough arguments supplied to function.');
  }
  return args;
};

export const fetchData = memoize(
  async ({
    method = 'POST',
    url,
    data = {},
    params = {},
  }: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: Record<string, any>;
    params?: Record<string, any>;
  }) => {
    const urlWithParams = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlWithParams.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(urlWithParams.href, {
        method,

        ...(method !== 'GET' && {
          body: JSON.stringify(data),
        }),

        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return undefined;

      const result = await response.json();

      return result;
    } catch (err) {
      return undefined;
    }
  },
  JSON.stringify,
);

export const roundTo = (n: number, decimals = 2): number => {
  const r = 10 ** decimals;
  return Math.round(n * r) / r;
};

export const wrapArgs = (args: any[]): Deferred[] => {
  return args.map((arg) => {
    return () => {
      return arg;
    };
  });
};

export const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    // otherwise Number('') === 0
    if (!value) {
      throw new Error();
    }

    if (value.indexOf(',') > -1) {
      throw new Error();
    }

    const n = Number(value);

    if (!Number.isNaN(n)) {
      return n;
    }
  }

  throw new Error();
};

type WrapOptions = {
  name: string;
  nargs: number;
  types: ValidatorType[];
  passContext?: boolean;
};

const validators = {
  any: (value: Value): Value => {
    return value;
  },
  number: (value: Value): number => {
    return parseNumber(value);
  },
  boolean: (value: Value): boolean => {
    if (typeof value === 'boolean') return value;

    if (value === 0 || value === 1) return Boolean(value);

    throw new Error();
  },
  array: (value: Value): Value[] => {
    if (Array.isArray(value)) return value;

    throw new Error();
  },
  function: (value: Value): Value => {
    if (typeof value === 'function') return value;

    throw new Error();
  },
  object: (value: Value): Record<string, Value> => {
    if (typeof value === 'object' && value !== null)
      return value as Record<string, Value>;

    throw new Error();
  },
  string: (value: Value): string => {
    if (typeof value === 'string') return value;

    throw new Error();
  },
};

type ValidatorType =
  | keyof typeof validators
  | `${keyof typeof validators}?`
  | '*';

const validate = (value: any, type: ValidatorType): any => {
  if (!type) return value;

  // allowFailure let's functions try to parse so we can immediately check
  // the good path e.g. number? -> if (typeof n === 'number')
  // this means the function does not first need to validate the number
  let allowFailure = false;
  let indexType = type;

  if (indexType.endsWith('?')) {
    allowFailure = true;
    indexType = indexType.slice(0, -1) as ValidatorType;
  }

  const validator = validators[indexType];

  if (validator === undefined) {
    throw new Error(`No validator for type: '${indexType}'`);
  }

  try {
    return validator(value);
  } catch (error) {
    if (allowFailure) return value;
    throw error;
  }
};

type FunctionToWrap =
  | ((ctx: Context, ...args: Value[]) => Value | Promise<Value>)
  | ((...args: Value[]) => Value | Promise<Value>);

export const wrapFunction = (
  f: FunctionToWrap,
  { nargs, types, name, passContext = false }: WrapOptions,
): Value => {
  return async (ctx: Context, args: Deferred[]) => {
    if (args.length < nargs) {
      throw new Error(
        `#N/A ${name} expects ${nargs} arguments but it got ${args.length}`,
      );
    }

    const validatedArgs = await Promise.all<Promise<Value>>(
      args.map(async (arg, i) => {
        const value = await arg(ctx);

        let type = types[i];
        if (type === '*') type = types[i - 1];

        try {
          return validate(value, type);
        } catch (error) {
          throw new Error(
            `#VALUE! ${name} expects its argument at position ${
              i + 1
            } to be of type '${type}' and not '${typeof value}'`,
          );
        }
      }),
    );

    if (passContext) {
      return f.call(null, ctx, ...validatedArgs);
    }

    return f.call(null, ...validatedArgs);
  };
};
