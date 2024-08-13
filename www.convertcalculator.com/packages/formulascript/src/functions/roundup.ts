import { wrapFunction } from '../utils';

export const ROUNDUP = (n: number, precision: number = 0): number => {
  const scale = 10 ** precision;
  return n >= 0 ? Math.ceil(n * scale) / scale : -Math.ceil(-n * scale) / scale;
};

export default wrapFunction(ROUNDUP, {
  name: 'ROUNDUP',
  nargs: 1,
  types: ['number', 'number'],
});
