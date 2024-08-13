/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const IF = async (ctx: Context, args: Deferred[]) => {
  const [condition, a, b] = getArgsOrNA(args, 1);
  if (await condition(ctx)) {
    return a ? a(ctx) : true;
  }
  return b ? b(ctx) : false;
};

const IFS = async (ctx: Context, args: Deferred[]) => {
  const pairs = getArgsOrNA(args, 2);

  for (let i = 0; i < pairs.length - 1; i += 2) {
    const condition = pairs[i];
    const value = pairs[i + 1];

    if (!value) {
      throw new Error('#VALUE! Missing value for condition');
    }
    if (await condition(ctx)) return value(ctx);
  }

  const oddNumberOfArgs = pairs.length % 2 !== 0;

  const fallback = oddNumberOfArgs ? pairs[pairs.length - 1] : undefined;

  if (fallback) {
    return fallback(ctx);
  }

  throw new Error('#VALUE! No condition was true in IFS');
};

const AND = async (ctx: Context, args: Deferred[]) => {
  const conditions = getArgsOrNA(args, 1);
  for (let i = 0; i < args.length; i++) {
    const condition = conditions[i];
    if (!(await condition(ctx))) {
      return false;
    }
  }
  return true;
};

const OR = async (ctx: Context, args: Deferred[]) => {
  const conditions = getArgsOrNA(args, 1);
  for (let i = 0; i < args.length; i++) {
    const condition = conditions[i];
    if (await condition(ctx)) {
      return true;
    }
  }
  return false;
};

const NOT = async (ctx: Context, args: Deferred[]) => {
  const [value] = getArgsOrNA(args, 1);
  return !(await value(ctx));
};

const CHOOSE = async (ctx: Context, args: Deferred[]) => {
  const [_index, ...options] = getArgsOrNA(args, 2);

  const index = Number(await _index(ctx));
  if (Number.isNaN(index)) {
    throw new Error('#VALUE! First argument must be number.');
  }

  if (index <= 0) {
    throw new Error('#NUM Index in CHOOSE must be 1 or higher.');
  }

  const value = options[index - 1];
  return value(ctx);
};

const ISNUMBER = async (ctx: Context, args: Deferred[]) => {
  const [_n] = getArgsOrNA(args, 1);
  // IMPORTANT: there must be no conversion
  // e.g. "19" is not a number
  const n = await _n(ctx);
  return typeof n === 'number' && Number.isFinite(n);
};

const ISBLANK = async (ctx: Context, args: Deferred[]) => {
  const [value] = args;
  // IMPORTANT: blank cells should be considered
  return (await value(ctx)) === null;
};

const SWITCH = async (ctx: Context, args: Deferred[]) => {
  const [_target, ...pairs] = getArgsOrNA(args, 3);

  const target = await _target(ctx);

  // default value must be last in args, only when args.length is
  // uneven since it's divided in pairs.
  const noMatch = pairs.length % 2 !== 0 ? args.pop() : undefined;

  for (let i = 0; i < pairs.length; i++) {
    // return value in switch
    if (i % 2 !== 0) continue;

    const predicate = pairs[i];
    if ((await predicate(ctx)) === target) {
      const value = pairs[i + 1];
      return value(ctx);
    }
  }
  if (noMatch === undefined) {
    throw new Error('#N/A! No matching values and no default provided.');
  }
  return noMatch(ctx);
};

const ISERROR = async (ctx: Context, args: Deferred[]) => {
  const [value] = getArgsOrNA(args, 1);
  try {
    await value(ctx);
    return false;
  } catch (error) {
    return true;
  }
};

export const functions = {
  IF,
  AND,
  OR,
  NOT,
  CHOOSE,
  ISNUMBER,
  ISBLANK,
  SWITCH,
  IFS,
  ISERROR,
};
