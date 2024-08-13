import { wrapFunction } from '../utils';

export const LOG10 = (n: number): number => {
  return Math.log10(n);
};

export default wrapFunction(LOG10, {
  name: 'LOG10',
  nargs: 1,
  types: ['number'],
});
