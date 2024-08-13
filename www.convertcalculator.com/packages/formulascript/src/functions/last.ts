import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const LAST = async (ctx: Context, args: Deferred[]) => {
  const [_array] = getArgsOrNA(args, 1);

  const array = (await _array(ctx)) as Array<any>;

  if (!(array instanceof Array || typeof array === 'string')) {
    throw new Error(
      `#VALUE! LAST expects its argument to be an ARRAY not: '${typeof array}'`,
    );
  }

  if (array.length > 0) return array.at(-1);

  throw new Error('#VALUE! Array in LAST is empty.');
};

export default LAST;
