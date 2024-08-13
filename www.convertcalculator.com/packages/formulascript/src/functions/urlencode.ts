import { wrapFunction } from '../utils';

const URLENCODE = (url: string): string => {
  return encodeURIComponent(url);
};

export default wrapFunction(URLENCODE, {
  name: 'URLENCODE',
  nargs: 1,
  types: ['string'],
});
