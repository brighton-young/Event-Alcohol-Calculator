import { wrapFunction } from '../utils';

/**
 * The RANGE function can create arrays of number values starting
 * and stopping at a certain value as well as stepping by a certain amount.
 *
 * @param start number value that marks the start of the range
 * @param stop number value that marks the end of the range (inclusive)
 * @param step number value that defines the size of each step
 *
 * @example RANGE(1, 10) // -> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * @example RANGE(10, 20) // -> [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
 * @example RANGE(10, 20, 2) // -> [10, 12, 14, 16, 18, 20]
 */
export const RANGE = (start: number, stop: number, step = 1): number[] => {
  if (step > 0) {
    if (start > stop) {
      throw new Error(
        '#VALUE! When using a positive step in RANGE the first argument (start) should be less than the second argument (stop)',
      );
    }

    const values: number[] = [];

    for (let i = start; i <= stop; i += step) {
      values.push(i);
    }

    return values;
  }

  if (step < 0) {
    if (start < stop) {
      throw new Error(
        '#VALUE! When using a negative step in RANGE the first argument (start) should be greater than the second argument (stop)',
      );
    }

    const values: number[] = [];

    for (let i = start; i >= stop; i += step) {
      values.push(i);
    }

    return values;
  }

  // step must be 0
  throw new Error('#VALUE! Third argument (step) in RANGE cannot be zero.');
};

export default wrapFunction(RANGE, {
  name: 'RANGE',
  nargs: 2,
  types: ['number', 'number', 'number'],
});
