import type { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

/**
 * COUNT will count all values.
 * COUNT will recursively count inside of other arrays.
 *
 * @param value, [value1] ... [valueN]
 * @returns number
 */
export const COUNT = (...values: Value[]): number => {
  let total = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (Array.isArray(value)) {
      total += COUNT(...value);
    } else {
      total += 1;
    }
  }

  return total;
};

export default wrapFunction(COUNT, {
  name: 'COUNT',
  nargs: 1,
  types: [],
});
