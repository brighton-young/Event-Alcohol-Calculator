import { wrapFunction } from '../utils';

export const JSONPARSE = (s: string): any => {
  try {
    return JSON.parse(s);
  } catch (error) {
    throw new Error('ERROR: failed to parse JSON string');
  }
};

export default wrapFunction(JSONPARSE, {
  name: 'JSONPARSE',
  nargs: 1,
  types: ['string'],
});
