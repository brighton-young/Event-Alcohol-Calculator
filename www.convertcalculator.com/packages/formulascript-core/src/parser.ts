/**
 * @module formulascript/parser (public)
 * @description This module contains formulascript parser
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * The parser is a custom hand-written recursive descent parser. It is responsible
 * for parsing the source code into an AST. Tokenization is done on the fly by the
 * parser. The parser is also responsible for generating diagnostics (errors) which
 * can be used to generate useful syntax errors.
 */

// TODO:
// - [ ] bubble up errors, should keep the best one
// - [ ] improve diagnostics (think rust diagnostics), better types, focus on data not messages
// - [ ] performance
//    - [ ] predictive parsing
//    - [ ] token hints

/* eslint-disable lines-between-class-members */

import { Token, lex } from './lexer';
import type * as nodes from './nodes';
import * as tokens from './tokens';

type ParseError = {
  message: string;
  offset: number;
};

export type ParseResult = {
  ast: nodes.FormulaNode | null;
  errors: ParseError[];
  comments: Token[];
};

export const parse = (source: string): ParseResult => {
  const parser = new Parser(source);
  const ast = parser.try(parseFormula);
  return { ast, errors: parser.errors, comments: parser.comments };
};

class Parser {
  public index: number;
  public offset: number;
  public errors: ParseError[];
  public stream: Token[];
  public comments: Token[];

  constructor(public readonly source: string) {
    this.source = source;
    const [stream, comments] = extractComments(lex(source));
    this.stream = stream;
    this.index = 0;
    this.offset = 0;
    this.errors = [];
    this.comments = comments;
  }

  peek(lookahead: number = 0): Token | null {
    return this.stream[this.index + lookahead] ?? null;
  }

  advance(): Token | null {
    const token = this.peek();
    if (!token) {
      return null;
    }
    this.index += 1;
    this.offset += token.image.length;
    return token;
  }

  consume(
    tokenType: tokens.TokenType,
    ...alts: tokens.TokenType[]
  ): Token | null {
    if (!this.peek()) {
      return null;
    }

    if (this.peek()!.name === 'Unknown') {
      this.diagnose(
        `unknown token: ${this.peek()!.image} <-- remove this to fix the error`,
      );

      return null;
    }

    if (matchToken(this.peek(), tokenType, ...alts)) {
      return this.advance();
    }

    return null;
  }

  option<N>(rule: (parser: Parser) => N): N | null {
    const retIndex = this.index;
    const retOffset = this.offset;
    const result = rule(this);
    if (!result) {
      this.index = retIndex;
      this.offset = retOffset;
      return null;
    }
    return result;
  }

  many<N>(rule: () => N | null): N[] {
    const results: N[] = [];

    while (this.peek()) {
      const result = this.option(rule);
      if (result === null) {
        break;
      }
      results.push(result);
    }

    return results;
  }

  diagnose(message: string) {
    this.errors.push({
      message,
      offset: this.offset,
    });
  }

  try<N>(rule: (parser: Parser) => N | null): N | null {
    const result = rule(this);

    const rest = this.stream.slice(this.index);
    if (rest.length > 0) {
      if (this.errors.length === 0) {
        const unconsumed = this.source.slice(rest[0].startOffset);
        this.diagnose(
          `unconsumed input: -> ${unconsumed} <- remove this to fix the error`,
        );
      }
      return null;
    }

    return result;
  }
}

const matchToken = (
  token: Token | null,
  ...types: tokens.TokenType[]
): boolean => {
  if (!token) {
    return false;
  }

  for (let i = 0; i < types.length; i += 1) {
    const tokenToMatch = types[i];

    if (tokenToMatch.name === token.name) {
      return true;
    }
  }
  return false;
};

const isSoftKeyword = (
  token: Token | null,
  keyword: 'for' | 'in' | 'where',
): boolean => {
  if (!token) {
    return false;
  }

  if (token.name !== 'Identifier') {
    return false;
  }

  return token.image.toLowerCase() === keyword;
};

const extractComments = (stream: Token[]): [Token[], Token[]] => {
  const rest: Token[] = [];
  const comments: Token[] = [];

  stream.forEach((token) => {
    if (token.name === 'Comment') {
      comments.push(token);
    } else {
      rest.push(token);
    }
  });

  return [rest, comments];
};

const parseFormula = (parser: Parser): nodes.FormulaNode => {
  const vars = parser.many(() => {
    const name = parser.consume(tokens.Identifier);

    if (!name) {
      return null;
    }

    const colon = parser.consume(tokens.Colon);

    if (!colon) {
      return null;
    }

    const equals = parser.consume(tokens.Equals);

    if (!equals) {
      parser.diagnose(
        `expected equals sign after variable name and colon: ${name.image} := ... <- rest of formula here`,
      );
      return null;
    }

    const expr = parseExpression(parser);

    if (!expr) {
      parser.diagnose(
        `expected expression after equals sign: ${name.image} := ... <- rest of formula here`,
      );
      return null;
    }

    return {
      name,
      colon,
      equals,
      expr,
    };
  });

  let endOffset = vars.length === 0 ? 0 : vars[vars.length - 1].expr.endOffset;

  let endLineno = vars.length === 0 ? 0 : vars[vars.length - 1].expr.endLineno;

  const body = parseExpression(parser);

  if (body) {
    endOffset = body.endOffset;
    endLineno = body.endLineno;
  }

  return {
    type: 'formula',
    body,
    vars,
    startOffset: 0,
    endOffset,
    startLineno: 0,
    endLineno,
  };
};

const parseExpression = (parser: Parser): nodes.ExprNode | null => {
  const expr = parseBinop(parser);

  if (!expr) {
    // possibly diagnose here?
    return null;
  }

  if (!matchToken(parser.peek(), tokens.QuestionMark)) {
    return expr;
  }

  const questionMark = parser.consume(tokens.QuestionMark)!;

  const truthy = parseBinop(parser);

  if (!truthy) {
    parser.diagnose(
      `expected expression after question mark: ${parser.source.slice(
        0,
        questionMark.endOffset,
      )} ... : ...`,
    );
    return null;
  }

  const colon = parser.consume(tokens.Colon);

  if (!colon) {
    parser.diagnose(
      `expected colon after truthy expression: ${parser.source.slice(
        0,
        truthy.endOffset,
      )} : ...`,
    );
    return null;
  }

  const falsy = parseBinop(parser);

  if (!falsy) {
    parser.diagnose(
      `expected expression after colon: ${parser.source.slice(
        0,
        colon.endOffset,
      )} ...`,
    );
    return null;
  }

  return {
    type: 'ternary',
    condition: expr,
    questionMark,
    truthy,
    colon,
    falsy,
    startOffset: expr.startOffset,
    endOffset: falsy.endOffset,
    startLineno: expr.startLineno,
    endLineno: falsy.endLineno,
  };
};

const matchBinopToken = (token: Token | null): boolean => {
  if (!token) {
    return false;
  }

  switch (token.name) {
    // first the multi character operators
    case 'LessThanOrEqual':
    case 'GreaterThanOrEqual':
    case 'NotEquals':
    case 'And':
    case 'Or':
    case 'Equals': // then the single character operators
    case 'LessThan':
    case 'GreaterThan':
    case 'Plus':
    case 'Minus':
    case 'Star':
    case 'Slash':
    case 'Carat':
    case 'Ampersand':
      return true;
    default:
      return false;
  }
};

const parseBinop = (parser: Parser): nodes.BinopNode | null => {
  const lhs = parseUnaryPostfix(parser);

  if (!lhs) {
    // possibly diagnose here?
    return null;
  }

  const rhs: {
    operator: Token;
    operand: nodes.PostfixUnaryNode;
  }[] = [];

  while (parser.peek() && matchBinopToken(parser.peek())) {
    const operator = parser.advance()!;
    const operand = parseUnaryPostfix(parser);

    if (!operand) {
      parser.diagnose(
        `expected expression after binary operator: ${parser.source.slice(
          0,
          operator.endOffset,
        )} ... <-- here`,
      );
      return null;
    }

    rhs.push({ operator, operand });
  }

  if (rhs.length === 0) {
    return lhs;
  }

  const last = rhs[rhs.length - 1];

  return {
    type: 'binop',
    lhs,
    rhs,
    startOffset: lhs.startOffset,
    endOffset: last.operand.endOffset,
    startLineno: lhs.startLineno,
    endLineno: last.operand.endLineno,
  };
};

const parseUnaryPostfix = (parser: Parser): nodes.PostfixUnaryNode | null => {
  const expr = parseUnaryPrefix(parser);

  if (!expr) {
    // possibly diagnose here?
    return null;
  }

  const postfix = parser.option(() => {
    return parser.consume(tokens.Percent);
  });

  if (postfix) {
    return {
      type: 'postfixUnary',
      operand: expr,
      operator: postfix,
      startOffset: expr.startOffset,
      endOffset: postfix.endOffset,
      startLineno: expr.startLineno,
      endLineno: postfix.endLineno,
    };
  }

  return expr;
};

const parseUnaryPrefix = (parser: Parser): nodes.PrefixUnaryNode | null => {
  const prefix = parser.option(() => {
    return parser.consume(tokens.ExclamationMark, tokens.Plus, tokens.Minus);
  });

  const expr = parseCall(parser);

  if (!expr) {
    return null;
  }

  if (prefix) {
    return {
      type: 'prefixUnary',
      operator: prefix,
      operand: expr,
      startOffset: prefix.startOffset,
      endOffset: expr.endOffset,
      startLineno: prefix.startLineno,
      endLineno: expr.endLineno,
    };
  }

  return expr;
};

const parseCall = (parser: Parser): nodes.CallNode | null => {
  const func = parseAtomic(parser);

  if (!func) {
    // possibly diagnose here?
    return null;
  }

  const calls = parser.many(() => {
    const open = parser.consume(tokens.OpenParen);
    if (!open) {
      return null;
    }

    if (matchToken(parser.peek(), tokens.CloseParen)) {
      const close = parser.consume(tokens.CloseParen);
      if (!close) {
        return null;
      }
      return { open, args: [], close };
    }

    const args = parser.many(() => {
      if (matchToken(parser.peek(), tokens.CloseParen)) {
        return null;
      }

      const arg = parser.option(() => {
        return parseExpression(parser);
      });

      if (!arg) {
        return null;
      }

      const separator = parser.option(() => {
        return parser.consume(tokens.Comma, tokens.Semicolon);
      });

      return { arg, separator };
    });

    const close = parser.consume(tokens.CloseParen);

    if (!close) {
      const endOffset =
        args.length === 0
          ? open.endOffset
          : args[args.length - 1].arg.endOffset;

      parser.diagnose(
        `missing closing parenthesis after function call: ${parser.source.slice(
          0,
          endOffset,
        )}) <-- here`,
      );
      return null;
    }

    return { open, args, close };
  });

  if (calls.length === 0) {
    return func;
  }

  const last = calls[calls.length - 1];

  return {
    type: 'call',
    func,
    calls,
    startOffset: func.startOffset,
    endOffset: last.close.endOffset,
    startLineno: func.startLineno,
    endLineno: last.close.endLineno,
  };
};

const parseAtomic = (parser: Parser): nodes.AtomicNode | null => {
  return parser.option(() => {
    const current = parser.peek();

    if (!current) {
      return null;
    }

    switch (current.name) {
      case 'Identifier':
        return parseIdentifier(parser);
      case 'Number':
        return parseNumber(parser);
      case 'String':
        return parseString(parser);
      case 'FormatString': {
        return parseFormatString(parser);
      }
      case 'True':
      case 'False':
        return parseBoolean(parser);
      case 'OpenParen':
        return parseBracketedExpression(parser);
      case 'OpenBracket':
        return parseArray(parser);
      case 'Lambda':
        return parseLambda(parser);

      default:
        return null;
    }
  });
};

const parseIdentifier = (parser: Parser): nodes.IdentifierNode | null => {
  const identifier = parser.consume(tokens.Identifier);
  if (!identifier) {
    return null;
  }
  return {
    type: 'identifier',
    value: identifier.image,
    startOffset: identifier.startOffset,
    endOffset: identifier.endOffset,
    startLineno: identifier.startLineno,
    endLineno: identifier.endLineno,
  };
};

const parseNumber = (parser: Parser): nodes.NumberNode | null => {
  const number = parser.consume(tokens.Float, tokens.Integer);
  if (!number) {
    return null;
  }
  return {
    type: 'number',
    value: number.image,
    startOffset: number.startOffset,
    endOffset: number.endOffset,
    startLineno: number.startLineno,
    endLineno: number.endLineno,
  };
};

const parseString = (parser: Parser): nodes.StringNode | null => {
  const string = parser.consume(tokens.StringLiteral);
  if (!string) {
    return null;
  }
  return {
    type: 'string',
    value: string.image,
    startOffset: string.startOffset,
    endOffset: string.endOffset,
    startLineno: string.startLineno,
    endLineno: string.endLineno,
  };
};

enum FormatStringState {
  Text,
  Expr,
}

const parseFormatString = (parser: Parser): nodes.FormatStringNode | null => {
  const formatString = parser.consume(tokens.FormatString);
  if (!formatString) {
    return null;
  }

  const string = formatString.image.slice(1, -1);
  const parts: nodes.FormatStringNode['parts'] = [];

  let text = '';
  let expr = '';
  let state = FormatStringState.Text;

  const isEscaped = (index: number): boolean => {
    if (index === 0) {
      return false;
    }
    return string[index - 1] === '\\';
  };

  for (let i = 0; i < string.length; i += 1) {
    const char = string[i];

    switch (state) {
      case FormatStringState.Text: {
        if (char !== '{') {
          text += char;
          state = FormatStringState.Text;
          break;
        }

        if (isEscaped(i)) {
          text = text.slice(0, -1);
          text += char;
          break;
        }

        if (text.length > 0) {
          parts.push({
            type: 'text',
            value: text,
          });
          text = '';
        }

        state = FormatStringState.Expr;
        break;
      }
      case FormatStringState.Expr: {
        if (char !== '}') {
          expr += char;
          break;
        }

        if (expr === '') {
          parser.diagnose(`empty expression in format string not allowed`);
          return null;
        }

        const exprNode = parseExpression(new Parser(expr));

        if (!exprNode) {
          parser.diagnose(`syntax error in format string: ${expr} <-- here`);
          return null;
        }

        // TODO: patch up the offsets and line numbers

        parts.push({
          type: 'expr',
          value: exprNode,
        });

        expr = '';
        state = FormatStringState.Text;
        break;
      }
      default: {
        const unreachable: never = state;
        throw new Error(`invalid state ${unreachable}`);
      }
    }
  }

  if (state === FormatStringState.Expr) {
    parser.diagnose(
      `missing closing brace in format string: ${string} <-- here`,
    );
    return null;
  }

  if (text.length > 0) {
    parts.push({
      type: 'text',
      value: text,
    });
  }

  return {
    type: 'formatString',
    parts,
    startOffset: formatString.startOffset,
    endOffset: formatString.endOffset,
    startLineno: formatString.startLineno,
    endLineno: formatString.endLineno,
  };
};

const parseBoolean = (parser: Parser): nodes.BooleanNode | null => {
  const boolean = parser.consume(tokens.True, tokens.False);
  if (!boolean) {
    return null;
  }
  return {
    type: 'boolean',
    value: boolean.image,
    startOffset: boolean.startOffset,
    endOffset: boolean.endOffset,
    startLineno: boolean.startLineno,
    endLineno: boolean.endLineno,
  };
};

const parseBracketedExpression = (parser: Parser): nodes.AtomicNode | null => {
  const open = parser.consume(tokens.OpenParen);
  if (!open) {
    return null;
  }
  const expr = parseExpression(parser);
  if (!expr) {
    parser.diagnose(
      `expected expression after opening parenthesis: ${parser.source.slice(
        0,
        open.endOffset,
      )}) <-- here`,
    );
    return null;
  }

  const close = parser.consume(tokens.CloseParen);
  if (!close) {
    parser.diagnose(
      `expected closing parenthesis after expression: ${parser.source.slice(
        0,
        expr.endOffset,
      )}) <-- here`,
    );
    return null;
  }

  return {
    type: 'bracketed',
    open,
    expr,
    close,
    startOffset: open.startOffset,
    endOffset: close.endOffset,
    startLineno: open.startLineno,
    endLineno: close.endLineno,
  };
};

const parseLambda = (parser: Parser): nodes.LambdaNode | null => {
  const lambda = parser.consume(tokens.Lambda);

  if (!lambda) {
    return null;
  }

  const open = parser.consume(tokens.OpenParen);
  if (!open) {
    parser.diagnose(
      `expected opening parenthesis after function declaration: ${parser.source.slice(
        0,
        lambda.endOffset,
      )}(x: x + 1) <-- example`,
    );
    return null;
  }

  const signature = parser.option(() => {
    const params = parser.many(() => {
      const name = parser.consume(tokens.Identifier);

      const separator = parser.option(() => {
        return parser.consume(tokens.Comma, tokens.Semicolon);
      });

      if (!name) {
        return null;
      }

      return { name, separator };
    });

    const colon = parser.consume(tokens.Colon);
    if (!colon) {
      // maybe possible diagnosis here?
      return null;
    }

    return { params, colon };
  });

  const body = parseExpression(parser);
  if (!body) {
    const endOffset = signature ? signature.colon.endOffset : open.endOffset;
    parser.diagnose(
      `missing function body: ${parser.source.slice(
        0,
        endOffset,
      )} ... ) <-- here`,
    );
    return null;
  }

  const close = parser.consume(tokens.CloseParen);
  if (!close) {
    parser.diagnose(
      `missing closing parenthesis in function declaration: ${parser.source.slice(
        0,
        body.endOffset,
      )}) <-- here`,
    );
    return null;
  }

  return {
    type: 'lambda',
    lambda,
    open,
    signature,
    body,
    close,
    startOffset: lambda.startOffset,
    endOffset: close.endOffset,
    startLineno: lambda.startLineno,
    endLineno: close.endLineno,
  };
};

const parseArray = (
  parser: Parser,
): nodes.ArrayNode | nodes.ArrayCompNode | null => {
  const open = parser.consume(tokens.OpenBracket);

  if (!open) {
    return null;
  }

  if (matchToken(parser.peek(), tokens.CloseBracket)) {
    const close = parser.consume(tokens.CloseBracket)!;
    return {
      type: 'array',
      open,
      elements: [],
      close,
      startOffset: open.startOffset,
      endOffset: close.endOffset,
      startLineno: open.startLineno,
      endLineno: close.endLineno,
    };
  }

  const firstElement = parseExpression(parser);

  if (!firstElement) {
    parser.diagnose(`expected expression in array`);
    return null;
  }

  if (isSoftKeyword(parser.peek(), 'for')) {
    return parseArrayComprehension(parser, open, firstElement);
  }

  const firstSeparator = parser.option(() => {
    return parser.consume(tokens.Comma, tokens.Semicolon);
  });

  if (!firstSeparator) {
    const close = parser.consume(tokens.CloseBracket)!;

    if (!close) {
      parser.diagnose(`missing closing bracket after array`);
      return null;
    }

    return {
      type: 'array',
      open,
      elements: [
        {
          element: firstElement,
          separator: null,
        },
      ],
      close,
      startOffset: open.startOffset,
      endOffset: close.endOffset,
      startLineno: open.startLineno,
      endLineno: close.endLineno,
    };
  }

  const elements: {
    element: nodes.ExprNode;
    separator: Token | null;
  }[] = [
    {
      element: firstElement,
      separator: firstSeparator,
    },
  ];

  while (parser.peek() && !matchToken(parser.peek(), tokens.CloseBracket)) {
    const expr = parseExpression(parser);

    if (!expr) {
      parser.diagnose(`expected expression in array`);
      return null;
    }

    const separator = parser.option(() => {
      return parser.consume(tokens.Comma, tokens.Semicolon);
    });

    elements.push({
      element: expr,
      separator,
    });

    if (!separator) {
      break;
    }
  }

  const close = parser.consume(tokens.CloseBracket);

  if (!close) {
    parser.diagnose(`missing closing bracket after array`);
    return null;
  }

  return {
    type: 'array',
    open,
    elements,
    close,
    startOffset: open.startOffset,
    endOffset: close.endOffset,
    startLineno: open.startLineno,
    endLineno: close.endLineno,
  };
};

const parseArrayComprehension = (
  parser: Parser,
  open: Token,
  expr: nodes.ExprNode,
): nodes.ArrayCompNode | null => {
  // we know this token exists because we peeked it
  const forToken = parser.consume(tokens.Identifier)!;

  const name = parser.consume(tokens.Identifier);

  if (!name) {
    parser.diagnose(`expected identifier after 'for' keyword`);
    return null;
  }

  const inToken = parser.consume(tokens.Identifier);

  if (!inToken || !isSoftKeyword(inToken, 'in')) {
    parser.diagnose(`expected 'in' keyword after 'for' keyword`);
    return null;
  }

  const iter = parseExpression(parser);

  if (!iter) {
    parser.diagnose(`expected expression after 'in' keyword`);
    return null;
  }

  let cond: {
    where: Token;
    expr: nodes.ExprNode;
  } | null = null;

  const where = parser.option(() => {
    const token = parser.consume(tokens.Identifier);
    if (isSoftKeyword(token, 'where')) {
      return token;
    }
    return null;
  });

  if (where) {
    const condExpr = parseExpression(parser);

    if (!condExpr) {
      parser.diagnose(`expected expression after 'if' keyword`);
      return null;
    }

    cond = {
      where,
      expr: condExpr,
    };
  }

  const close = parser.consume(tokens.CloseBracket);

  if (!close) {
    parser.diagnose(`missing closing bracket after array comprehension`);
    return null;
  }

  return {
    type: 'arrayComp',
    open,
    expr,
    for: forToken,
    name,
    in: inToken,
    iter,
    cond,
    close,
    startOffset: open.startOffset,
    endOffset: close.endOffset,
    startLineno: open.startLineno,
    endLineno: close.endLineno,
  };
};
