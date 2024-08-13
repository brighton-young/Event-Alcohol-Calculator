import { wrapFunction } from '../utils';

export const ROUNDDOWN = (n: number, precision: number = 0): number => {
  const scale = 10 ** precision;
  return n >= 0
    ? Math.floor(n * scale) / scale
    : -Math.floor(-n * scale) / scale;
};

export default wrapFunction(ROUNDDOWN, {
  name: 'ROUNDDOWN',
  nargs: 1,
  types: ['number', 'number'],
});
