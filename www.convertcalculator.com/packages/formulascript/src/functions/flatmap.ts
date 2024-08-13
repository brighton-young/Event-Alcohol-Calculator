/* eslint-disable no-await-in-loop */
import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const FLATMAP = async (
  ctx: Context,
  array: Value[],
  f,
): Promise<Value[]> => {
  return doFlatMap(ctx, array, f);
};

const doFlatMap = async (ctx: Context, array: Value[], f): Promise<Value[]> => {
  const out: Value[] = [];

  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    if (Array.isArray(element)) {
      const mapped = await doFlatMap(ctx, element, f);
      out.push(mapped);
    } else {
      const deferred = async () => {
        return element;
      };
      const mapped = await f(ctx, [deferred]);
      out.push(mapped);
    }
  }

  return out;
};

export default wrapFunction(FLATMAP, {
  name: 'FLATMAP',
  nargs: 2,
  types: ['array', 'function'],
  passContext: true,
});
