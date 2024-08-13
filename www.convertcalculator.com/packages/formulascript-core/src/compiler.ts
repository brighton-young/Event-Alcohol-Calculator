/**
 * @module formulascript/compiler (public)
 * @description This module contains the formula compiler
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * The compiler walks the AST and generates a deferred function that can be
 * evaluated by the interpreter. Deferreds are functions that given a context
 * will return a value. The compiler constructs a deferred function for each
 * node in the AST and then returns the deferred function for the entire AST.
 */

import * as deferreds from './deferreds';
import type { Code, Expression } from './interpreter';
import type { Token } from './lexer';
import type * as nodes from './nodes';
import { parse } from './parser';

export { nodes, parse };

export const compile = (source: string): Code => {
  const { ast, errors } = parse(source);

  if (!ast) {
    const deferred =
      errors.length > 0
        ? deferreds.error(errors[errors.length - 1].message)
        : deferreds.empty();

    return {
      expr: {
        deferred,
        startOffset: 0,
        endOffset: source.length,
        names: [],
      },
      source,
      names: [],
    };
  }

  const expr = compileFormula(ast);

  return {
    expr,
    source,
    names: expr.names,
  };
};

const compileFormula = (ast: nodes.FormulaNode): Expression => {
  if (!ast.body) {
    return {
      deferred: deferreds.empty(),
      names: [],
      startOffset: ast.startOffset,
      endOffset: ast.endOffset,
    };
  }

  const names: string[] = [];

  const vars: [string, Expression][] = ast.vars.map((v) => {
    const expr = compileExpression(v.expr);
    names.push(...expr.names);
    return [v.name.image, expr];
  });

  const body = compileExpression(ast.body);
  const deferred = deferreds.formula(vars, body);

  names.push(...body.names);

  return {
    deferred,
    names,
    startOffset: ast.startOffset,
    endOffset: ast.endOffset,
  };
};

const compileExpression = (node: nodes.ExprNode): Expression => {
  return compileTernary(node);
};

const compileTernary = (node: nodes.TernaryNode): Expression => {
  if (node.type !== 'ternary') {
    return compileBinop(node);
  }

  const condition = compileBinop(node.condition);
  const truthy = compileBinop(node.truthy);
  const falsy = compileBinop(node.falsy);

  const deferred = deferreds.ternary(condition, truthy, falsy);

  return {
    deferred,
    names: [...condition.names, ...truthy.names, ...falsy.names],
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

type BinopName =
  | 'And'
  | 'Or'
  | 'Equals'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'NotEquals'
  | 'Plus'
  | 'Minus'
  | 'Star'
  | 'Slash'
  | 'Carat'
  | 'Ampersand';

type BinopDef = {
  precedence: number;
  operation: deferreds.BinaryOperation;
};

const binaryOperations: Record<BinopName, BinopDef> = {
  And: {
    precedence: 0,
    operation: deferreds.BinaryOperations.AND,
  },
  Or: {
    precedence: 0,
    operation: deferreds.BinaryOperations.OR,
  },
  Equals: {
    precedence: 1,
    operation: deferreds.BinaryOperations.EQ,
  },
  GreaterThan: {
    precedence: 1,
    operation: deferreds.BinaryOperations.GT,
  },
  GreaterThanOrEqual: {
    precedence: 1,
    operation: deferreds.BinaryOperations.GE,
  },
  LessThan: {
    precedence: 1,
    operation: deferreds.BinaryOperations.LT,
  },
  LessThanOrEqual: {
    precedence: 1,
    operation: deferreds.BinaryOperations.LE,
  },
  NotEquals: {
    precedence: 1,
    operation: deferreds.BinaryOperations.NE,
  },
  Plus: {
    precedence: 2,
    operation: deferreds.BinaryOperations.ADD,
  },
  Minus: {
    precedence: 2,
    operation: deferreds.BinaryOperations.SUB,
  },
  Star: {
    precedence: 3,
    operation: deferreds.BinaryOperations.MUL,
  },
  Slash: {
    precedence: 3,
    operation: deferreds.BinaryOperations.DIV,
  },
  Carat: {
    precedence: 4,
    operation: deferreds.BinaryOperations.POW,
  },
  Ampersand: {
    precedence: 5,
    operation: deferreds.BinaryOperations.CAT,
  },
} as const;

type BinaryOperator = keyof typeof binaryOperations;

const peek = <T>(arr: T[]): T => {
  return arr[arr.length - 1];
};

const compileBinop = (node: nodes.BinopNode): Expression => {
  if (node.type !== 'binop') {
    return compilePostfixUnary(node);
  }

  const exprs: Expression[] = [compilePostfixUnary(node.lhs)];
  const operators: Token[] = [];

  node.rhs.forEach((rhsExpr) => {
    while (
      peek(operators) !== undefined &&
      binaryOperations[peek(operators)!.name as BinaryOperator].precedence >=
        binaryOperations[rhsExpr.operator.name as BinaryOperator].precedence
    ) {
      const op = operators.pop()!;
      const rhs = exprs.pop()!;
      const lhs = exprs.pop()!;
      const { operation } = binaryOperations[op.name as BinaryOperator];
      const deferred = deferreds.binop(lhs, rhs, operation);
      exprs.push({
        deferred,
        names: [...lhs.names, ...rhs.names],
        startOffset: lhs.startOffset,
        endOffset: rhs.endOffset,
      });
    }

    operators.push(rhsExpr.operator);
    exprs.push(compilePostfixUnary(rhsExpr.operand));
  });

  while (operators.length > 0) {
    const op = operators.pop()!;
    const rhs = exprs.pop()!;
    const lhs = exprs.pop()!;
    const { operation } = binaryOperations[op.name as BinaryOperator];
    const deferred = deferreds.binop(lhs, rhs, operation);
    exprs.push({
      deferred,
      names: [...lhs.names, ...rhs.names],
      startOffset: lhs.startOffset,
      endOffset: rhs.endOffset,
    });
  }

  const expr = exprs.pop()!;

  return {
    deferred: expr.deferred,
    names: expr.names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const unaryOperations = {
  Plus: deferreds.UnaryOperations.POS,
  Minus: deferreds.UnaryOperations.NEG,
  ExclamationMark: deferreds.UnaryOperations.NOT,
  Percent: deferreds.UnaryOperations.SCALE,
} as const;

type UnaryOperator = keyof typeof unaryOperations;

const compilePostfixUnary = (node: nodes.PostfixUnaryNode): Expression => {
  if (node.type !== 'postfixUnary') {
    return compilePrefixUnary(node);
  }

  const operand = compilePrefixUnary(node.operand);
  const operation = unaryOperations[node.operator.name as UnaryOperator];
  const deferred = deferreds.unaryop(operand, operation);

  return {
    deferred,
    names: operand.names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compilePrefixUnary = (node: nodes.PrefixUnaryNode): Expression => {
  if (node.type !== 'prefixUnary') {
    return compileCall(node);
  }

  const operand = compileCall(node.operand);
  const operation = unaryOperations[node.operator.name as UnaryOperator];
  const deferred = deferreds.unaryop(operand, operation);

  return {
    deferred,
    names: operand.names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileCall = (node: nodes.CallNode): Expression => {
  if (node.type !== 'call') {
    return compileAtomic(node);
  }

  const func = compileAtomic(node.func);

  let expr = func;

  for (let i = 0; i < node.calls.length; i++) {
    const call = node.calls[i];
    const args = call.args.map((arg) => {
      return compileExpression(arg.arg);
    });

    const deferred = deferreds.call(expr, args);
    expr = {
      deferred,
      names: expr.names.concat(
        ...args.map((arg) => {
          return arg.names;
        }),
      ),
      startOffset: call.open.startOffset,
      endOffset: call.close.endOffset,
    };
  }

  return {
    deferred: expr.deferred,
    names: expr.names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileAtomic = (node: nodes.AtomicNode): Expression => {
  switch (node.type) {
    case 'boolean': {
      return compileBoolean(node);
    }
    case 'string': {
      return compileString(node);
    }
    case 'formatString': {
      return compileFormatString(node);
    }
    case 'number': {
      return compileNumber(node);
    }
    case 'identifier': {
      return compileIdentifier(node);
    }
    case 'bracketed': {
      return compileBracketed(node);
    }
    case 'lambda': {
      return compileLambda(node);
    }
    case 'array': {
      return compileArray(node);
    }
    case 'arrayComp': {
      return compileArrayComp(node);
    }
    default: {
      // this should never happen
      // if it happens, it means we need to add a case
      const unreachable: never = node;
      throw new Error(`Unreachable: ${unreachable}`);
    }
  }
};

const compileBoolean = (node: nodes.BooleanNode): Expression => {
  return {
    deferred: deferreds.literal(node.value.toLowerCase() === 'true'),
    names: [],
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileString = (node: nodes.StringNode): Expression => {
  return {
    deferred: deferreds.literal(node.value.slice(1, -1)),
    names: [],
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileFormatString = (node: nodes.FormatStringNode): Expression => {
  const names: string[] = [];

  const parts = node.parts.map((part) => {
    if (part.type === 'text') {
      return part.value;
    }

    const expr = compileExpression(part.value);
    names.push(...expr.names);
    return expr;
  });

  return {
    deferred: deferreds.joinedString(parts),
    names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileNumber = (node: nodes.NumberNode): Expression => {
  const literal = node.value.replace(/_/g, '');
  return {
    deferred: deferreds.literal(Number(literal)),
    names: [],
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileIdentifier = (node: nodes.IdentifierNode): Expression => {
  return {
    deferred: deferreds.variable(node.value),
    names: [node.value],
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileBracketed = (node: nodes.BracketedNode): Expression => {
  return compileExpression(node.expr);
};

const compileLambda = (node: nodes.LambdaNode): Expression => {
  const params: string[] = [];

  node.signature?.params.forEach((param) => {
    params.push(param.name.image);
  });

  const body = compileExpression(node.body);

  const deferred = deferreds.lambda(params, body);

  const names = body.names.filter((name) => {
    return !params.includes(name);
  });

  return {
    deferred,
    names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileArray = (node: nodes.ArrayNode): Expression => {
  const elements = node.elements.map((element) => {
    return compileExpression(element.element);
  });

  const deferred = deferreds.array(elements);

  const names = elements.reduce((acc, element) => {
    return acc.concat(element.names);
  }, [] as string[]);

  return {
    deferred,
    names,
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};

const compileArrayComp = (node: nodes.ArrayCompNode): Expression => {
  // TODO: remove names from expr if they are `name`
  const expr = compileExpression(node.expr);
  const name = node.name.image;
  const iter = compileExpression(node.iter);

  expr.names = expr.names.filter((n) => {
    return n !== name;
  });

  let cond: Expression | null = null;

  if (node.cond) {
    cond = compileExpression(node.cond.expr);
  }

  const deferred = deferreds.comprehension(expr, name, iter, cond);

  return {
    deferred,
    names: expr.names.concat(iter.names),
    startOffset: node.startOffset,
    endOffset: node.endOffset,
  };
};
