import type { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

const TOLERANCE = 1.0e-7;

export const IRR = (values: Value[], guess?: number): number => {
  const allNumbers = values.every((value) => {
    return typeof value === 'number';
  });

  if (!allNumbers) {
    throw new Error(
      'IRR expects all values in the first argument to be numbers',
    );
  }

  const n = values.length;
  let x0 = guess || 0.1;

  let x1 = 0;

  for (let i = 0; i < 100; i++) {
    let fValue = 0;
    let fDerivative = 0;

    for (let j = 0; j < n; j++) {
      const value = values[j] as number;
      fValue += value / (1 + x0) ** j;
      fDerivative -= (j * value) / (1 + x0) ** (j + 1);
    }

    x1 = x0 - fValue / fDerivative;

    if (Math.abs(x1 - x0) <= TOLERANCE) {
      return x1;
    }

    x0 = x1;
  }

  throw new Error('IRR failed to converge');
};

export default wrapFunction(IRR, {
  name: 'IRR',
  nargs: 1,
  types: ['array', 'number'],
});
