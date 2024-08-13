/* eslint-disable no-loss-of-precision */
import { wrapFunction } from '../utils';

const erf = (x: number): number => {
  const cof = [
    -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
    -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
    4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
    1.30365583558e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
    5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11,
    2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13,
    3.81e-16, 7.106e-15, -1.523e-15, -9.4e-17, 1.21e-16, -2.8e-17,
  ];

  let j = cof.length - 1;
  let isneg = false;
  let d = 0;
  let dd = 0;
  let tmp: number;

  if (x === 0) {
    return 0;
  }

  if (x < 0) {
    // eslint-disable-next-line no-param-reassign
    x = -x;
    isneg = true;
  }

  const t = 2 / (2 + x);
  const ty = 4 * t - 2;

  for (; j > 0; j--) {
    tmp = d;
    d = ty * d - dd + cof[j];
    dd = tmp;
  }

  const res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
  return isneg ? res - 1 : 1 - res;
};

const pdf = (x: number, mean: number, std: number) => {
  return Math.exp(
    -0.5 * Math.log(2 * Math.PI) -
      Math.log(std) -
      (x - mean) ** 2 / (2 * std * std),
  );
};

const cdf = (x: number, mean: number, std: number) => {
  return 0.5 * (1 + erf((x - mean) / Math.sqrt(2 * std * std)));
};

const NORMDIST = (
  x: number,
  mean = 0,
  stddev = 1,
  cumulative = true,
): number => {
  if (cumulative) return cdf(x, mean, stddev);
  return pdf(x, mean, stddev);
};

export default wrapFunction(NORMDIST, {
  name: 'NORMDIST',
  nargs: 1,
  types: ['number', 'number', 'number', 'boolean'],
});
