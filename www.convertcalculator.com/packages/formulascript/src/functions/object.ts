import { Context, Deferred } from 'formulascript/interpreter';

const OBJECT = async (ctx: Context, args: Deferred[]) => {
  if (args.length % 2 !== 0) {
    throw new Error(
      '#VALUE! OBJECT expects an even number of arguments: name1, value1, name2, value2 ...',
    );
  }

  // we can evaluate all at once, since short circuiting is not supported
  const values = await Promise.all(
    args.map(async (arg) => {
      return arg(ctx);
    }),
  );

  const ret: { [key: string]: any } = {};

  const toString = (value: any): string => {
    const type = typeof value;
    if (type === 'string') return value;
    if (type === 'number') return String(value);
    throw new Error(
      `#VALUE! OBJECT expects uneven numbers to be strings (text) not '${type}'`,
    );
  };

  // step by two
  for (let i = 0; i < values.length; i += 2) {
    const name = toString(values[i]);
    const value = values[i + 1];
    ret[name] = value;
  }

  // TODO: fix Atom type def to allow Objects (and arrays properly)
  return ret as any;
};

export default OBJECT;
