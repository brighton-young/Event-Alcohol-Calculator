import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const EXTEND = (array1: Value[], array2: Value[]): Value[] => {
  return array1.concat(array2);
};

export default wrapFunction(EXTEND, {
  name: 'EXTEND',
  nargs: 2,
  types: ['array', 'array'],
});
