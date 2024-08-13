import { wrapFunction } from '../utils';

export const CONTAINS = (text: string, substring: string): boolean => {
  return text.includes(substring);
};

export default wrapFunction(CONTAINS, {
  name: 'CONTAINS',
  nargs: 2,
  types: ['string', 'string'],
});
