import { wrapFunction } from '../utils';

export const JOIN = (array: string[], seperator: string): string => {
  array.forEach((item, index) => {
    if (typeof item !== 'string')
      throw new Error(
        `#VALUE! All arguments to JOIN must be strings, got '${typeof item}' at index ${index}`,
      );
  });
  return array.join(seperator);
};

export default wrapFunction(JOIN, {
  name: 'JOIN',
  nargs: 2,
  types: ['array', 'string'],
});
