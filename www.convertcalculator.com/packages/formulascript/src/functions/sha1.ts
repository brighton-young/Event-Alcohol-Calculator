import sha1 from 'crypto-js/sha1';
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const SHA1 = async (ctx: Context, args: Deferred[]) => {
  const [_text] = getArgsOrNA(args, 1);
  const text = String(await _text(ctx));
  return sha1(text).toString();
};

export default SHA1;
