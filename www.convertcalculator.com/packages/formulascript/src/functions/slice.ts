import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const SLICE = (
  array: Value[],
  start: number,
  stop?: number,
): Value[] => {
  if (start < 0) {
    throw new Error(
      `#VALUE! SLICE expects its second argument (start) to be greater than or equal to 0, got '${start}'`,
    );
  }
  if (start >= array.length) {
    throw new Error(
      `#VALUE! SLICE expects its second argument (start) to be less than the length of the array, got '${start}'. The length of the array is '${array.length}'`,
    );
  }
  return array.slice(start, stop !== undefined ? stop + 1 : undefined);
};

export default wrapFunction(SLICE, {
  name: 'SLICE',
  nargs: 2,
  types: ['array', 'number', 'number'],
});
