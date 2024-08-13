import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const SUM = (...values: Value[]) => {
  let total = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (typeof value === 'number') {
      total += value;
    } else if (Array.isArray(value)) {
      total += SUM(...value);
    } else {
      throw new Error('#VALUE! All arguments to SUM must be numbers');
    }
  }

  return total;
};

export default wrapFunction(SUM, {
  name: 'SUM',
  nargs: 1,
  types: ['number?', '*'],
});
