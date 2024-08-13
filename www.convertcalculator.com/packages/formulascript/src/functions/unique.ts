import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const UNIQUE = async (ctx: Context, args: Deferred[]) => {
  const [_array, _colIndex] = getArgsOrNA(args, 1);

  const array = (await _array(ctx)) as Array<any>;

  if (!(array instanceof Array)) {
    throw new Error(
      `#VALUE! UNIQUE expects first argument to be a table not: ${typeof array}`,
    );
  }

  // If no column index is provided, we assume it is an array and not a table.
  if (!_colIndex) {
    const uniqueValues = new Set();

    return array.filter((value) => {
      if (uniqueValues.has(value)) {
        return false;
      }
      uniqueValues.add(value);
      return true;
    });
  }

  const colIndex = await _colIndex(ctx);
  const colIndexNumber = Number(colIndex);

  if (Number.isNaN(colIndexNumber)) {
    throw new Error(
      `#VALUE! UNIQUE expects second argument to be a number not: ${typeof colIndex}`,
    );
  }

  return array.reduce((acc, row) => {
    if (!(row instanceof Array)) {
      throw new Error('#VALUE! UNIQUE expects first argument to be a table');
    }

    const exists = acc.find((fRow) => {
      return fRow[colIndexNumber] === row[colIndexNumber];
    });

    if (exists) return acc;

    return [...acc, row];
  }, []);
};

export default UNIQUE;
