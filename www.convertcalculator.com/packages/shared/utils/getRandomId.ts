import getRandomCharacter from './getRandomCharacter';

const UNMISTAKABLE_CHARS =
  '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';

const getRandomId = (charCount: number = 17): string => {
  return Array.from(new Array(charCount)).reduce((acc) => {
    return `${acc}${getRandomCharacter(UNMISTAKABLE_CHARS)}`;
  }, '');
};

export default getRandomId;
