import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const FINDINDEX = async (ctx: Context, array: Value[], f): Promise<Value> => {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    const deferred = async () => {
      return element;
    };
    // eslint-disable-next-line no-await-in-loop
    const found = await f(ctx, [deferred]);
    if (found) return i;
  }

  throw new Error('#NA no match found in the array provided to FIND');
};

export default wrapFunction(FINDINDEX, {
  name: 'FINDINDEX',
  nargs: 2,
  types: ['array', 'function'],
  passContext: true,
});
