/**
 * @module formulascript/tokens (public)
 * @description This module contains the tokens for the formulascript parser
 * @author Twan Walpot <twan@stay-bold.com>
 *
 * This modules contains the token definitions used by the parser.
 */

export type TokenType = {
  name: string;
  pattern: RegExp | string;
  hints?: string[];
};

export const Colon: TokenType = {
  name: 'Colon',
  pattern: ':',
};

export const Equals: TokenType = {
  name: 'Equals',
  pattern: '=',
};

export const QuestionMark: TokenType = {
  name: 'QuestionMark',
  pattern: '?',
};

export const Identifier: TokenType = {
  name: 'Identifier',
  // leading numbers are not allowed
  pattern: /[a-zA-Z_][\w|{|}]*/y,
};

export const ExclamationMark: TokenType = {
  name: 'ExclamationMark',
  pattern: '!',
};

export const Percent: TokenType = {
  name: 'Percent',
  pattern: '%',
};

export const Plus: TokenType = {
  name: 'Plus',
  pattern: '+',
};

export const Minus: TokenType = {
  name: 'Minus',
  pattern: '-',
};

export const Star: TokenType = {
  name: 'Star',
  pattern: '*',
};

export const Slash: TokenType = {
  name: 'Slash',
  pattern: '/',
};

export const Carat: TokenType = {
  name: 'Carat',
  pattern: '^',
};

export const Ampersand: TokenType = {
  name: 'Ampersand',
  pattern: '&',
};

export const Or: TokenType = {
  name: 'Or',
  pattern: '||',
};

export const And: TokenType = {
  name: 'And',
  pattern: '&&',
};

export const NotEquals: TokenType = {
  name: 'NotEquals',
  pattern: '<>',
};

export const GreaterThan: TokenType = {
  name: 'GreaterThan',
  pattern: '>',
};

export const LessThan: TokenType = {
  name: 'LessThan',
  pattern: '<',
};

export const GreaterThanOrEqual: TokenType = {
  name: 'GreaterThanOrEqual',
  pattern: '>=',
};

export const LessThanOrEqual: TokenType = {
  name: 'LessThanOrEqual',
  pattern: '<=',
};

export const OpenParen: TokenType = {
  name: 'OpenParen',
  pattern: '(',
};

export const CloseParen: TokenType = {
  name: 'CloseParen',
  pattern: ')',
};

export const OpenBracket: TokenType = {
  name: 'OpenBracket',
  pattern: '[',
};

export const CloseBracket: TokenType = {
  name: 'CloseBracket',
  pattern: ']',
};

export const Comma: TokenType = {
  name: 'Comma',
  pattern: ',',
};

export const Semicolon: TokenType = {
  name: 'Semicolon',
  pattern: ';',
};

export const Integer: TokenType = {
  name: 'Number',
  pattern: /\d(?:_?\d)*/y,
};

export const Float: TokenType = {
  name: 'Number',
  pattern: /\d*\.\d+/y,
};

export const StringLiteral: TokenType = {
  name: 'String',
  pattern: /('[^']*')|"[^"]*"/y,
  hints: ['"', "'"],
};

export const FormatString: TokenType = {
  name: 'FormatString',
  pattern: /(`[^`]*`)/y,
  hints: ['`'],
};

export const True: TokenType = {
  name: 'True',
  pattern: /true\b/iy,
  hints: ['t', 'T'],
};

export const False: TokenType = {
  name: 'False',
  pattern: /false\b/iy,
  hints: ['f', 'F'],
};

export const Lambda: TokenType = {
  name: 'Lambda',
  pattern: /function\b/iy,
  hints: ['f', 'F'],
};

export const Comment: TokenType = {
  name: 'Comment',
  pattern: /\/\/.*/y,
  hints: ['/'],
};
