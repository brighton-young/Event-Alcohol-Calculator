import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ZIP = (...arrays: Value[][]): Value[] => {
  const base = arrays[0];

  // check if all arrays are of the same length
  if (
    arrays.some((array) => {
      return array.length !== base.length;
    })
  ) {
    throw new Error(
      `#VALUE! ZIP expects all arrays to be of the same length, got '${arrays
        .map((array) => {
          return array.length;
        })
        .join('-')}'`,
    );
  }

  const zipped = new Array(base.length);

  for (let i = 0; i < base.length; i++) {
    const entry = new Array(arrays.length);

    for (let j = 0; j < arrays.length; j++) {
      entry[j] = arrays[j][i];
    }
    zipped[i] = entry;
  }

  return zipped;
};

export default wrapFunction(ZIP, {
  name: 'ZIP',
  nargs: 2,
  types: ['array', 'array', '*'],
});
