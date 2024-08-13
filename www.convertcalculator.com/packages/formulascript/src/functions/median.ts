import { wrapFunction } from '../utils';

export const MEDIAN = (...values: (number | number[])[]): number => {
  const flatValues = values.flat();

  if (flatValues.length === 0) {
    throw new Error('#NULL!MEDIAN expects at least one argument');
  }

  if (
    flatValues.some((value) => {
      return typeof value !== 'number';
    })
  ) {
    throw new Error(`#VALUE! MEDIAN expects all arguments to be numbers`);
  }

  const sorted = flatValues.sort((a, b) => {
    return a - b;
  });
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

export default wrapFunction(MEDIAN, {
  name: 'MEDIAN',
  nargs: 1,
  types: ['number?', '*'],
});
