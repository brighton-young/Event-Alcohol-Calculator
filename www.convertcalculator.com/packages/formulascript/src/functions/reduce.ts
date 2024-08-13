import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

/**
 * The REDUCE function is used to apply a function over each element of
 * an array (list/collection) transforming that element and thus
 * transforming that array.
 *
 * @param array array of values you want to transform
 * @param f the function you want to apply to each element. Can be a built-in function or a lambda function
 *
 * @example REDUCE(ARRAY("string1", "string2", "etc"), UPPER) // -> ["STRING1", "STRING2", "ETC"]
 * @example REDUCE(RANGE(1, 10), function(x: x * 2)) // -> [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
 */
// TODO: REDUCE has to be implemented like this because other functions might still be old style.
// If and when FS is synchronous and eager, this can be simplified.
export const REDUCE = async (
  ctx: Context,
  array: Value[],
  f,
  start: Value,
): Promise<Value> => {
  let result: Value = start;

  for (let i = 0; i < array.length; i++) {
    const resultThisIteration = result;

    const element = array[i];
    const deferred = async () => {
      return element;
    };
    // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-loop-func
    result = await f(ctx, [
      deferred,
      async () => {
        return resultThisIteration;
      },
    ]);
  }

  return result;
};

export default wrapFunction(REDUCE, {
  name: 'REDUCE',
  nargs: 3,
  types: ['array', 'function'],
  passContext: true,
});
