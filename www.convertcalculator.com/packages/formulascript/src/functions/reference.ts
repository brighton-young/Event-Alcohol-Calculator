import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const REFERENCE = async (ctx: Context, name: string): Promise<Value> => {
  const ref = ctx.load(name);

  if (ref === undefined) {
    throw new Error(`#NAME? Reference not found: ${name}`);
  }

  return ref;
};

export default wrapFunction(REFERENCE, {
  name: 'REFERENCE',
  nargs: 1,
  types: ['string'],
  passContext: true,
});
