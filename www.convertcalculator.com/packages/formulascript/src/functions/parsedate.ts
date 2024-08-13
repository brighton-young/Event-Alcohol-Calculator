import { wrapFunction } from '../utils';

export const PARSEDATE = (serial: number): Date => {
  return new Date(Date.UTC(0, 0, serial > 59 ? serial - 1 : serial));
};

export default wrapFunction(PARSEDATE, {
  name: 'PARSEDATE',
  nargs: 1,
  types: ['number'],
});
