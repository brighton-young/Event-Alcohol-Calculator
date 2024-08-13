import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

const parseNumber = (value: Value): number => {
  const n = Number(value);
  if (!Number.isNaN(n)) {
    return n;
  }
  throw new Error(
    `#VALUE! MIN expects all arguments to be numbers, not: '${typeof value}'`,
  );
};

export const MIN = (...values: (Value | Value[])[]): number => {
  let found: number = Infinity;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (Array.isArray(value)) {
      found = Math.min(found, MIN(...value));
    } else {
      found = Math.min(found, parseNumber(value));
    }
  }

  if (found === Infinity) {
    throw new Error('#NULL! No values to compare supplied to MIN');
  }

  return found;
};

export default wrapFunction(MIN, {
  name: 'MIN',
  nargs: 1,
  types: ['any', '*'],
});
