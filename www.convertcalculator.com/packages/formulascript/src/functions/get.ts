import { Context, Deferred } from 'formulascript/interpreter';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

import { getArgsOrNA } from '../utils';

const GET = async (ctx: Context, args: Deferred[]) => {
  const [_object, _key] = getArgsOrNA(args, 2);

  const objectValue = await _object(ctx);

  if (!isPlainObject(objectValue)) {
    throw new Error(
      `#VALUE! First argument to GET needs to be an object not: '${objectValue}'`,
    );
  }

  const key = String(await _key(ctx));

  const getUppercaseKeys = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).map(([k, value]) => {
        if (isArray(value)) {
          return [
            k.toUpperCase(),
            value.map((item) => {
              return isPlainObject(item) ? getUppercaseKeys(item) : item;
            }),
          ];
        }

        if (isPlainObject(value)) {
          return [k.toUpperCase(), getUppercaseKeys(value)];
        }

        return [k.toUpperCase(), value];
      }),
    );
  };

  const objectValueUppercases = getUppercaseKeys(objectValue);

  return get(objectValueUppercases, key.toUpperCase()) ?? null;
};

export default GET;
