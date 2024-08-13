import { wrapFunction } from '../utils';

export const ROUND = (n: number, precision: number = 0) => {
  const scale = 10 ** precision;

  return n >= 0
    ? Math.round(n * scale) / scale
    : -Math.round(-n * scale) / scale;
};

export default wrapFunction(ROUND, {
  name: 'ROUND',
  nargs: 1,
  types: ['number', 'number'],
});
