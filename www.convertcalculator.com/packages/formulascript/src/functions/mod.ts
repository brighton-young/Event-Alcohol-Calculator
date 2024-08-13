import { wrapFunction } from '../utils';

export const MOD = (n: number, divisor: number): number => {
  return n % divisor;
};

export default wrapFunction(MOD, {
  name: 'MOD',
  nargs: 2,
  types: ['number', 'number'],
});
