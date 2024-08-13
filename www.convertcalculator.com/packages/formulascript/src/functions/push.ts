import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const PUSH = async (ctx: Context, args: Deferred[]) => {
  const [_array, _value] = getArgsOrNA(args, 2);

  const array = (await _array(ctx)) as Array<any>;

  if (!(array instanceof Array || typeof array === 'string')) {
    throw new Error(
      `#VALUE! PUSH expects the first argument to be an ARRAY not: '${typeof array}'`,
    );
  }

  const value = await _value(ctx);

  return [...array, value];
};

export default PUSH;
