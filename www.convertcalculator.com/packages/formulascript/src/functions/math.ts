/* eslint-disable no-await-in-loop */
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const ABS = async (ctx: Context, args: Deferred[]) => {
  const [_n] = getArgsOrNA(args, 1);
  const n = Number(await _n(ctx));
  if (Number.isNaN(n)) {
    throw new Error('#VALUE! Argument to ABS must be a number');
  }
  return Math.abs(n);
};

const CEILING = async (ctx: Context, args: Deferred[]) => {
  const [_n, _significance] = getArgsOrNA(args, 1);

  const n = Number(await _n(ctx));
  if (n === 0) {
    return 0;
  }

  const significance = _significance ? Number(await _significance(ctx)) : 1;

  if (significance === 0) {
    throw new Error('#DIV/0 Significance cannot be zero.');
  }

  if (Number.isNaN(significance))
    if (n > 0 && significance < 0) {
      throw new Error('#NUM Value and significance are distinct.');
    }

  return Math.ceil(n / significance) * significance;
};

const FLOOR = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  return Math.floor(Number(await n(ctx)));
};

const PI = async () => {
  return Math.PI;
};

const LOG = async (ctx: Context, args: Deferred[]) => {
  const [_n, _base] = getArgsOrNA(args, 1);
  const n = Number(await _n(ctx));
  const base = _base ? Number(await _n(ctx)) : 10;
  return Math.log(n) / Math.log(base);
};

const SIN = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  return Math.sin(Number(await n(ctx)));
};

const DIVIDE = async (ctx: Context, args: Deferred[]) => {
  const [_lhs, _rhs] = getArgsOrNA(args, 2);

  const lhs = Number(await _lhs(ctx));
  const rhs = Number(await _rhs(ctx));

  if (rhs !== 0) {
    return lhs / rhs;
  }
  throw new Error('#DIV/0 Cannot divide by zero.');
};

const MULTIPLY = async (ctx: Context, args: Deferred[]) => {
  const [lhs, rhs] = getArgsOrNA(args, 2);
  return Number(await lhs(ctx)) * Number(await rhs(ctx));
};

const INT = async (ctx: Context, args: Deferred[]) => {
  const [_n] = getArgsOrNA(args, 1);
  const n = Number(await _n(ctx));
  return n >= 0 ? Math.floor(n) : -Math.floor(-n);
};

const POWER = async (ctx: Context, args: Deferred[]) => {
  const [lhs, rhs] = getArgsOrNA(args, 1);
  return Number(await lhs(ctx)) ** Number(await rhs(ctx));
};

const TRUNC = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  return Math.trunc(Number(await n(ctx)));
};

const DEGREES = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  return (Number(await n(ctx)) * 180) / Math.PI;
};

const LN = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  return Math.log(Number(await n(ctx)));
};

const RAND = async () => {
  return Math.random();
};

const MROUND = async (ctx: Context, args: Deferred[]) => {
  //  [number, number]
  const [_n, _multiple] = getArgsOrNA(args, 2);

  const n = Number(await _n(ctx));
  const multiple = Number(await _multiple(ctx));

  return multiple === 0 ? 0 : Math.round(n / multiple) * multiple;
};

const RANDBETWEEN = async (ctx: Context, args: Deferred[]) => {
  // [number, number]
  const [_lower, _upper] = getArgsOrNA(args, 2);
  const lower = Number(await _lower(ctx));
  const upper = Number(await _upper(ctx));
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
};

const MINA = async (ctx: Context, args: Deferred[]) => {
  // [number, ...number[]]
  const deferredValues = getArgsOrNA(args, 2);
  const values = [];
  for (let i = 0; i < deferredValues.length; i++) {
    values.push(await deferredValues[i](ctx));
  }
  return Math.min(...values);
};

const MAXA = async (ctx: Context, args: Deferred[]) => {
  // [number, ...number[]]
  const deferredValues = getArgsOrNA(args, 1);
  const values = [];
  for (let i = 0; i < deferredValues.length; i++) {
    values.push(await deferredValues[i](ctx));
  }
  return Math.max(...values);
};

const ATAN = async (ctx: Context, args: Deferred[]) => {
  // [] [number]
  const [n] = getArgsOrNA(args, 1);
  const value = Number(await n(ctx));
  if (Number.isNaN(value)) {
    throw new Error(`#VALUE! First argument to ATAN must be a number`);
  }
  return Math.atan(value);
};

const EXP = async (ctx: Context, args: Deferred[]) => {
  // [number]
  const [n] = getArgsOrNA(args, 1);
  return Math.exp(Number(await n(ctx)));
};

const CEILINGMATH = async (ctx: Context, args: Deferred[]) => {
  // [number, number?, number?]
  const [_n, _significance, _mode] = getArgsOrNA(args, 1);

  const n = Number(await _n(ctx));
  const significance = _significance ? Number(await _significance(ctx)) : 1;
  const mode = _mode ? Number(await _mode(ctx)) : 1;

  if (significance === 0 || n === 0) {
    return 0;
  }
  const method = n < 0 && mode === -1 ? Math.floor : Math.ceil;
  return method(+(n / significance).toFixed(6)) * significance;
};

const EVEN = async (ctx: Context, args: Deferred[]) => {
  const [_n] = getArgsOrNA(args, 1);
  const n = Number(await _n(ctx));
  if (Number.isNaN(n)) {
    throw new Error('#VALUE! EVEN expects a numerical value.');
  }
  if (n === 0) {
    return n;
  }
  return Math.round(n / 2) * 2;
};

export const functions = {
  ABS,
  CEILING,
  FLOOR,
  PI,
  LOG,
  SIN,
  DIVIDE,
  MULTIPLY,
  INT,
  POWER,
  TRUNC,
  DEGREES,
  LN,
  RAND,
  MROUND,
  RANDBETWEEN,
  MINA,
  MAXA,
  ATAN,
  EXP,
  CEILINGMATH,
  EVEN,
};
