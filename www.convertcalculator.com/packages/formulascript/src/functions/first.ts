import type { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const FIRST = (array: Value[]) => {
  if (array.length === 0) {
    throw new Error('#VALUE! array in FIRST is empty');
  }
  return array[0];
};

export default wrapFunction(FIRST, {
  name: 'FIRST',
  nargs: 1,
  types: ['array'],
});
