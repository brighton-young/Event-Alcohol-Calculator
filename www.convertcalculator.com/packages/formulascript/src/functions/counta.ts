import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

/**
 * COUNTA will count all non-null values.
 * COUNTA will recursively count inside of other arrays.
 *
 * @param value, [value1] ... [valueN]
 * @returns number
 */
export const COUNTA = (...values: Value[]): number => {
  let total = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (Array.isArray(value)) {
      total += COUNTA(...value);
    } else if (value !== null) {
      total += 1;
    }
  }

  return total;
};

export default wrapFunction(COUNTA, {
  name: 'COUNTA',
  nargs: 1,
  types: [],
});
