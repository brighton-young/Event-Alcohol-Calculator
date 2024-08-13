import { wrapFunction } from '../utils';

export const REGEXMATCH = async (
  text: string,
  regex: string,
  flags: string = 'g',
): Promise<boolean> => {
  const re = new RegExp(regex, flags);
  return re.test(text);
};

export default wrapFunction(REGEXMATCH, {
  name: 'REGEXMATCH',
  nargs: 2,
  types: ['string', 'string', 'string'],
});
