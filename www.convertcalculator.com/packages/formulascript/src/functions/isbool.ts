import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const ISBOOL = async (obj: Value): Promise<boolean> => {
  return typeof obj === 'boolean';
};

export default wrapFunction(ISBOOL, {
  name: 'ISBOOL',
  nargs: 1,
  types: ['any'],
});
