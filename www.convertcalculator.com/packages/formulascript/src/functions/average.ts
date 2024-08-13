import { wrapFunction } from '../utils';

export const AVERAGE = (...values: (number | number[])[]): number => {
  let sum = 0;
  let count = 0;

  const flatValues = values.flat();

  for (let i = 0; i < flatValues.length; i++) {
    const value = flatValues[i];

    if (typeof value !== 'number') {
      throw new Error(
        `#VAlUE! AVERAGE expects all arguments to be numbers, but got '${typeof value}'`,
      );
    }

    sum += value;
    count += 1;
  }

  // count cannot be 0, because we throw an error if no arguments are supplied
  // but just to be safe, we check anyway
  if (count === 0) {
    throw new Error('#NULL AVERAGE expects at least one argument');
  }

  return sum / count;
};

export default wrapFunction(AVERAGE, {
  name: 'AVERAGE',
  nargs: 1,
  types: ['number?', '*'],
});
