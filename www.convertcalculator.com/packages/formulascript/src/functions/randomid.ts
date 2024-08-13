import { Context, Deferred } from 'formulascript/interpreter';
import memoize from 'lodash/memoize';

import getRandomId from '@cc/shared/utils/getRandomId';

import { getArgsOrNA } from '../utils';

const getRandomIdMemoized = memoize((_ref) => {
  return getRandomId();
});

const RANDOMID = async (ctx: Context, args: Deferred[]) => {
  const [
    _ref = () => {
      return 1;
    },
  ] = getArgsOrNA(args, 0);

  const ref = await _ref(ctx);

  return getRandomIdMemoized(ref);
};

export default RANDOMID;
