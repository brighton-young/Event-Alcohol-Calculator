import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ISNUMBER = async (obj: Value): Promise<boolean> => {
  return typeof obj === 'number';
};

export default wrapFunction(ISNUMBER, {
  name: 'ISNUMBER',
  nargs: 1,
  types: ['any'],
});
