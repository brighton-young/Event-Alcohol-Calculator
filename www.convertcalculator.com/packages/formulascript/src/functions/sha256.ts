import sha256 from 'crypto-js/sha256';
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const SHA256 = async (ctx: Context, args: Deferred[]) => {
  const [_text] = getArgsOrNA(args, 1);
  const text = String(await _text(ctx));
  return sha256(text).toString();
};

export default SHA256;
