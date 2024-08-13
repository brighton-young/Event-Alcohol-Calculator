import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ISSTRING = async (obj: Value): Promise<boolean> => {
  return typeof obj === 'string';
};

export default wrapFunction(ISSTRING, {
  name: 'ISSTRING',
  nargs: 1,
  types: ['any'],
});
