import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const REMOVE = (array: Value[], index: number): Value[] => {
  if (index < 0) {
    throw new Error(`#VALUE! REMOVE expects a positive index, got '${index}'`);
  }

  if (index > array.length) {
    throw new Error(
      `REMOVE expects an index smaller than the array length (${array.length}) but got '${index}'. Maybe you want to use POP instead?`,
    );
  }

  return [...array.slice(0, index), ...array.slice(index + 1)];
};

export default wrapFunction(REMOVE, {
  name: 'REMOVE',
  nargs: 2,
  types: ['array', 'number'],
});
