/**
 * @module formulascript/lexer (public)
 * @description This module contains formulascript lexer
 * @author Twan Walpot <twan@stay-bold.com>
 */

// TODO:
// - move to a state machine (later, much better)

/* eslint-disable lines-between-class-members */

import * as tokens from './tokens';

export type Token = {
  name: string;
  image: string;
  startOffset: number;
  endOffset: number;
  startLineno: number;
  endLineno: number;
};

type LexResult = Token[];

export const lex = (input: string): LexResult => {
  const lexer = new Lexer(input);
  return lexer.lex();
};

const whitespaceRe = /^\s+/;

const vocabulary = [
  tokens.Comment,

  tokens.Lambda,

  tokens.Float,
  tokens.Integer,
  tokens.StringLiteral,
  tokens.FormatString,

  // keywords
  tokens.True,
  tokens.False,

  tokens.Colon,
  tokens.Equals,
  tokens.QuestionMark,

  tokens.Or,
  tokens.And,
  tokens.LessThanOrEqual,
  tokens.GreaterThanOrEqual,
  tokens.NotEquals,

  tokens.ExclamationMark,
  tokens.Percent,
  tokens.Plus,
  tokens.Minus,
  tokens.Star,
  tokens.Slash,
  tokens.Carat,
  tokens.Ampersand,

  tokens.GreaterThan,
  tokens.LessThan,
  tokens.OpenParen,
  tokens.CloseParen,
  tokens.OpenBracket,
  tokens.CloseBracket,
  tokens.Comma,
  tokens.Semicolon,

  tokens.Identifier,
];

class Lexer {
  public offset: number;
  public lineno: number;
  public current: string;

  constructor(input: string) {
    this.current = input;
    this.offset = 0;
    this.lineno = 1;
  }

  move(offset: number) {
    this.offset += offset;
    this.current = this.current.slice(offset);
  }

  skip() {
    if (this.current.startsWith('\n')) {
      this.lineno += 1;
    }

    whitespaceRe.lastIndex = 0;
    const match = whitespaceRe.exec(this.current);
    if (match) {
      this.move(match[0].length);
    }
  }

  next(): Token {
    const { current } = this;

    for (let i = 0; i < vocabulary.length; i++) {
      const token = vocabulary[i];
      const image = getToken(token, current);
      if (image) {
        this.move(image.length);

        return {
          name: token.name,
          image,
          startOffset: this.offset - image.length,
          endOffset: this.offset,
          startLineno: this.lineno,
          endLineno: this.lineno,
        };
      }
    }

    const unkown: Token = {
      name: 'Unknown',
      image: current[0],
      startOffset: this.offset,
      endOffset: this.offset + 1,
      startLineno: this.lineno,
      endLineno: this.lineno,
    };

    this.move(1);

    return unkown;
  }

  lex(): LexResult {
    const stream: Token[] = [];

    while (this.current.length) {
      this.skip();

      if (this.current.length === 0) {
        break;
      }

      stream.push(this.next());
    }

    return stream;
  }
}

const getToken = (type: tokens.TokenType, text: string): string | null => {
  if (typeof type.pattern === 'string') {
    return getTokenFromString(type.pattern, text);
  }

  return getTokenFromRegExp(type.pattern, text, type.hints);
};

const getTokenFromString = (pattern: string, text: string): string | null => {
  if (pattern[0] === text[0] && text.startsWith(pattern)) {
    return pattern;
  }
  return null;
};

const getTokenFromRegExp = (
  pattern: RegExp,
  text: string,
  hints?: string[],
): string | null => {
  if (hints) {
    let matches = false;

    for (let i = 0; i < hints.length; i++) {
      const hint = hints[i];
      if (text[0] === hint) matches = true;
    }

    if (!matches) {
      return null;
    }
  }

  // this is important, otherwise the regex will start from the last match
  // eslint-disable-next-line no-param-reassign
  pattern.lastIndex = 0;
  const match = pattern.exec(text);

  if (match) {
    return match[0];
  }
  return null;
};
