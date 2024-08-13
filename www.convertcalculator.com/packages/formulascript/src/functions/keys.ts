import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const KEYS = async (obj: Value): Promise<string[]> => {
  const keys = Object.keys(obj);
  return keys;
};

export default wrapFunction(KEYS, {
  name: 'KEYS',
  nargs: 1,
  types: ['object'],
});
