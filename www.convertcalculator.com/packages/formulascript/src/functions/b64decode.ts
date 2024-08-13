import { wrapFunction } from '../utils';

export const B64DECODE = (s: string): string => {
  try {
    return atob(s);
  } catch (error) {
    throw new Error('ERROR: failed to decode string');
  }
};

export default wrapFunction(B64DECODE, {
  name: 'B64DECODE',
  nargs: 1,
  types: ['string'],
});
