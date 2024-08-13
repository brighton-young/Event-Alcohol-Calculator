import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ISARRAY = async (obj: Value): Promise<boolean> => {
  return Array.isArray(obj);
};

export default wrapFunction(ISARRAY, {
  name: 'ISARRAY',
  nargs: 1,
  types: ['any'],
});
