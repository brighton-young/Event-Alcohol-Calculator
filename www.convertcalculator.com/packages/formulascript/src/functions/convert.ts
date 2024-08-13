import convert from 'convert';
import type { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const CONVERT = async (ctx: Context, args: Deferred[]) => {
  const [_value, _from, _to] = getArgsOrNA(args, 3);

  const value = Number(await _value(ctx));
  const from = String(await _from(ctx));
  const to = String(await _to(ctx));

  if (from === to) return value;

  return Number(convert(value, from as any).to(to as any));
};

export default CONVERT;
