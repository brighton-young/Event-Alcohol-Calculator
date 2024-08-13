import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const INSERT = (
  array: Value[],
  value: Value,
  index: number,
): Value[] => {
  if (index < 0) {
    throw new Error(`#VALUE! INSERT expects a positive index, got '${index}'`);
  }

  if (index > array.length) {
    throw new Error(
      `INSERT expects an index smaller than the array length (${array.length}) but got '${index}'. Maybe you want to use PUSH instead?`,
    );
  }

  return [...array.slice(0, index), value, ...array.slice(index)];
};

export default wrapFunction(INSERT, {
  name: 'INSERT',
  nargs: 3,
  types: ['array', 'any', 'number'],
});
