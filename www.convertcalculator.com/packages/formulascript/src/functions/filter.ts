import type { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

type FilterFunction = (ctx: Context, args: Value[]) => Promise<Value>;

type Predicate = FilterFunction | Value;

/**
 * The FILTER function is used to apply a function over each element of
 * an array (list/collection) the result of that function decides if that
 * element should remain in the array.
 *
 * @param array array of values you want to filter
 * @param f the function you want to apply to each element. Can be a built-in function or a lambda function
 *
 * @example FILTER(ARRAY(10, "20", "string", 10.2), ISNUMBER) // -> [10, 10.2]
 * @example FILTER(ARRAY(10, 3, -5, -10, 23, -8), function(x: x > 0)) // -> [10, 3, 23]
 */
// TODO: FILTER has to be implemented like this because other functions might still be old style.
// If and when FS is synchronous and eager, this can be simplified.
export const FILTER = async (
  ctx: Context,
  array: Value[],
  // f?: FilterFunction,
  predicate?: Predicate,
  target: Value = true,
): Promise<Value[]> => {
  const filtered: Value[] = [];

  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    // eslint-disable-next-line no-await-in-loop
    const result = await doFilter(ctx, element, predicate);

    if (result === target) {
      filtered.push(element);
    }
  }

  return filtered;
};

const doFilter = async (
  ctx: Context,
  element: Value,
  predicate?: Predicate,
): Promise<boolean> => {
  if (typeof predicate === 'undefined') {
    return Boolean(element);
  }

  if (typeof predicate === 'function') {
    const deferred = async () => {
      return element;
    };
    const result = await predicate(ctx, [deferred]);
    return Boolean(result);
  }

  if (Array.isArray(predicate)) {
    return predicate.includes(element);
  }

  return element === predicate;
};

export default wrapFunction(FILTER, {
  name: 'FILTER',
  nargs: 1,
  types: ['array', 'any', 'boolean'],
  passContext: true,
});
