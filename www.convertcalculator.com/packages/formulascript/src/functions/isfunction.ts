import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ISFUNCTION = async (obj: Value): Promise<boolean> => {
  return typeof obj === 'function';
};

export default wrapFunction(ISFUNCTION, {
  name: 'ISFUNCTION',
  nargs: 1,
  types: ['any'],
});
