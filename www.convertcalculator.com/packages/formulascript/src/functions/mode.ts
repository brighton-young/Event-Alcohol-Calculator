import { wrapFunction } from '../utils';

export const MODE = (...values: (number | number[])[]): number => {
  const flatValues = values.flat();

  if (flatValues.length === 0) {
    throw new Error('#NULL!MODE expects at least one argument');
  }

  if (
    flatValues.some((value) => {
      return typeof value !== 'number';
    })
  ) {
    throw new Error(`#VALUE! MODE expects all arguments to be numbers`);
  }

  const counts = new Map<number, number>();

  for (let i = 0; i < flatValues.length; i++) {
    const value = flatValues[i];
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
  }

  let maxCount = 0;
  let maxValue = NaN;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      maxValue = value;
    }
  });

  return maxValue;
};

export default wrapFunction(MODE, {
  name: 'MODE',
  nargs: 1,
  types: ['number?', '*'],
});
