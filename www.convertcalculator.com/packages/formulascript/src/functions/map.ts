/* eslint-disable no-await-in-loop */
import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

/**
 * The MAP function is used to apply a function over each element of
 * an array (list/collection) transforming that element and thus
 * transforming that array.
 *
 * @param array array of values you want to transform
 * @param f the function you want to apply to each element. Can be a built-in function or a lambda function
 *
 * @example MAP(ARRAY("string1", "string2", "etc"), UPPER) // -> ["STRING1", "STRING2", "ETC"]
 * @example MAP(RANGE(1, 10), function(x: x * 2)) // -> [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
 */
// TODO: MAP has to be implemented like this because other functions might still be old style.
// If and when FS is synchronous and eager, this can be simplified.
export const MAP = async (
  ctx: Context,
  array: Value[],
  f,
): Promise<Value[]> => {
  const out: Value[] = [];

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const deferred = async () => {
      return element;
    };
    const mapped = await f(ctx, [deferred]);
    out.push(mapped);
  }

  return out;
};

export default wrapFunction(MAP, {
  name: 'MAP',
  nargs: 2,
  types: ['array', 'function'],
  passContext: true,
});
