import { Context, Deferred, Value } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

type Table = Array<Array<Value>>;

const TABLESORT = async (ctx: Context, args: Deferred[]) => {
  const [_table, _index, _order] = getArgsOrNA(args, 1);

  const table = (await _table(ctx)) as Table;

  if (!(table instanceof Array && table[0] instanceof Array)) {
    throw new Error(
      `#VALUE! TABLESORT expects its first argument to be a TABLE not: '${typeof table}'`,
    );
  }

  const index = _index ? await _index(ctx) : 0;

  if (typeof index !== 'number') {
    throw new Error(
      '#VALUE! TABLESORT expects third argument to be a number, not: ' +
        `'${typeof index}'`,
    );
  }

  const order = _order ? await _order(ctx) : 1;

  if (typeof order !== 'number') {
    throw new Error(
      '#VALUE! TABLESORT expects second argument to be a number, not: ' +
        `'${typeof order}'`,
    );
  }

  if (order > 1 || order < -1) {
    throw new Error(
      "#VALUE! TABLESORT third argument 'order' must be either 1 OR -1",
    );
  }

  const sortedTable = table.toSorted((a, b) => {
    if (a[index] === b[index]) return 0;

    return a[index] > b[index] ? order : -order;
  });

  return sortedTable;
};

export default TABLESORT;
