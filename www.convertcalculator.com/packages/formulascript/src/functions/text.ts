/* eslint-disable no-await-in-loop */
import { Context, Deferred, Value } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

import _text from './_text';

const CONCATENATE = async (ctx: Context, args: Deferred[]) => {
  // any[]
  const argValues = getArgsOrNA(args, 1);
  const values: Value[] = [];
  for (let i = 0; i < argValues.length; i++) {
    values.push(await argValues[i](ctx));
  }
  if (
    values.some((value) => {
      return typeof value === 'boolean';
    })
  ) {
    throw new Error('#VALUE! Cannot concatenate boolean values.');
  }
  return values.join('');
};

const UPPER = async (ctx: Context, args: Deferred[]) => {
  // [string]
  const [value] = getArgsOrNA(args, 1);
  return String(await value(ctx)).toUpperCase();
};

const VALUE = async (ctx: Context, args: Deferred[]) => {
  const [value] = getArgsOrNA(args, 1);
  const n = Number(await value(ctx));
  if (Number.isNaN(n)) {
    throw new Error('#VALUE! Argument must be a number.');
  }
  return n;
};

const CHAR = async (ctx: Context, args: Deferred[]) => {
  const [_n] = getArgsOrNA(args, 1);
  const n = Number(await _n(ctx));
  if (Number.isNaN(n)) {
    throw new Error('#VALUE! Argument must be a number.');
  }
  return String.fromCharCode(n);
};

const TEXT = async (ctx: Context, args: Deferred[]) => {
  const [value, format] = getArgsOrNA(args, 2);
  return _text((await value(ctx)) as number, (await format(ctx)) as string);
};

const LEFT = async (ctx: Context, args: Deferred[]) => {
  const [__text, _chars] = getArgsOrNA(args, 1);

  const text = await __text(ctx);
  const chars = _chars ? Number(await _chars(ctx)) : 1;

  if (Number.isNaN(chars)) {
    throw new Error('#VALUE! Second argument must be a number.');
  }
  return String(text).slice(0, chars);
};

const LEFTB = async (ctx: Context, args: Deferred[]) => {
  const [text, _chars] = getArgsOrNA(args, 1);
  const chars = _chars ? Number(await _chars(ctx)) : 1;
  const bytes = new TextEncoder().encode(String(await text(ctx)));
  return new TextDecoder().decode(bytes.slice(0, chars));
};

const LEN = async (ctx: Context, args: Deferred[]) => {
  const [_s] = getArgsOrNA(args, 1);

  const s = await _s(ctx);

  const len = (s as string | Array<any>).length;

  if (len === undefined) {
    throw new Error(
      `#VALUE! LEN expected a string or an array as argument: not ${typeof s}`,
    );
  }

  return len;
};

const SUBSTITUTE = async (ctx: Context, args: Deferred[]) => {
  const [__text, _target, _replacement, _n] = args;

  const text = String(await __text(ctx));
  const target = String(await _target(ctx));
  const replacement = String(await _replacement(ctx));

  if (_n !== undefined) {
    const n = Number(await _n(ctx));
    let index = 0;
    for (let i = 0; i < n; i++) {
      index = text.indexOf(target, index + 1);
    }
    return (
      text.slice(0, index) +
      replacement +
      text.slice(index + replacement.length)
    );
  }

  const reTarget = new RegExp(target, 'g');
  return text.replace(reTarget, replacement);
};

const RIGHT = async (ctx: Context, args: Deferred[]) => {
  const [__text, _chars] = getArgsOrNA(args, 1);

  const text = String(await __text(ctx));
  const chars = _chars ? Number(await _chars(ctx)) : 1;

  if (Number.isNaN(chars)) {
    throw new Error('#VALUE! Second argument must be a number.');
  }
  return text.slice(text.length - chars);
};

const RIGHTB = async (ctx: Context, args: Deferred[]) => {
  const [text, _chars] = getArgsOrNA(args, 1);
  const chars = _chars ? Number(await _chars(ctx)) : 1;
  const bytes = new TextEncoder().encode(String(await text(ctx)));
  return new TextDecoder().decode(bytes.slice(bytes.length - chars));
};

const SPLIT = async (ctx: Context, args: Deferred[]) => {
  const [__text, _delimiter] = getArgsOrNA(args, 2);

  const text = await __text(ctx);

  if (typeof text !== 'string') {
    throw new Error(
      '#VALUE! SPLIT expects its first argument be a string, not: ' +
        `'${typeof text}'`,
    );
  }

  const delimiter = await _delimiter(ctx);

  if (typeof delimiter !== 'string') {
    throw new Error(
      '#VALUE! SPLIT expects its second argument be a string, not: ' +
        `'${typeof text}'`,
    );
  }

  return String(text).split(String(delimiter));
};

const TRIM = async (ctx: Context, args: Deferred[]) => {
  const [_s] = getArgsOrNA(args, 1);

  const s = await _s(ctx);

  if (typeof s !== 'string') {
    throw new Error(
      `#VALUE! TRIM expects its argument be a string, not: ${typeof s}`,
    );
  }

  return s.trim();
};

export const functions = {
  CONCATENATE,
  UPPER,
  VALUE,
  CHAR,
  TEXT,
  LEFT,
  LEFTB,
  LEN,
  SUBSTITUTE,
  RIGHT,
  RIGHTB,
  SPLIT,
  TRIM,
};
