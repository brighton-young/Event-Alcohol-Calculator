import { wrapFunction } from '../utils';

export const TOJSON = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    throw new Error('ERROR: failed to create JSON string');
  }
};

export default wrapFunction(TOJSON, {
  name: 'TOJSON',
  nargs: 1,
  types: ['any'],
});
