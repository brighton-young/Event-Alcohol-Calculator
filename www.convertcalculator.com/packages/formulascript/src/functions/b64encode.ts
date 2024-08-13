import { wrapFunction } from '../utils';

export const B64ENCODE = (s: string): string => {
  try {
    return btoa(s);
  } catch (error) {
    throw new Error('ERROR: failed to encode string');
  }
};

export default wrapFunction(B64ENCODE, {
  name: 'B64ENCODE',
  nargs: 1,
  types: ['string'],
});
