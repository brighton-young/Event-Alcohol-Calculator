import { Context, FsFunction, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

/**
 * The `FIND` function is used to search through an array (list/collection) by checking each value with a function.
 * The first value the function would return `true` for is the return value from `FIND`. If no value is found, an `NA`
 * error is returned.
 *
 * @param array array of values you want to FIND in
 * @param f the function you want to find with. Can be a built-in function or a lambda function
 *
 * @example // this example looks through the array and returns the first number value
 * FIND(ARRAY(true, "20", 12, "string", 10.2), ISNUMBER) // -> 12
 *
 * @example // this example looks through the array and returns the first value less than 0
 * FIND(ARRAY(10, 3, -5, -10, 23, -8), function(x: x < 0)) // -> -5
 */
// TODO: FIND has to be implemented like this because other functions might still be old style.
// If and when FS is synchronous and eager, this can be simplified.
export const FIND = async (ctx: Context, array: Value[], f): Promise<Value> => {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    const deferred = async () => {
      return element;
    };
    // eslint-disable-next-line no-await-in-loop
    const found = await f(ctx, [deferred]);
    if (found) return element;
  }

  throw new Error('#NA no match found in the array provided to FIND');
};

export default wrapFunction(FIND, {
  name: 'FIND',
  nargs: 2,
  types: ['array', 'function'],
  passContext: true,
});
