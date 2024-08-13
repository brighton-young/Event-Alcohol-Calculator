import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const POP = async (ctx: Context, args: Deferred[]) => {
  const [_array] = getArgsOrNA(args, 1);

  const array = (await _array(ctx)) as Array<any>;

  if (!(array instanceof Array || typeof array === 'string')) {
    throw new Error(
      `#VALUE! POP expects its argument to be an ARRAY not: '${typeof array}'`,
    );
  }

  return array.slice(0, -1);
};

export default POP;
