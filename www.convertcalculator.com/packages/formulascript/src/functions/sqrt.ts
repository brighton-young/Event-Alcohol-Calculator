import { wrapFunction } from '../utils';

export const SQRT = (n: number) => {
  return Math.sqrt(n);
};

export default wrapFunction(SQRT, {
  name: 'SQRT',
  nargs: 1,
  types: ['number'],
});
