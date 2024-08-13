import type { Context, Deferred } from 'formulascript/interpreter';

const ARRAY = async (ctx: Context, args: Deferred[]) => {
  return Promise.all(
    args.map((arg) => {
      return arg(ctx);
    }),
  );
};

export default ARRAY;
