import evalByQuery from '@cc/shared/utils/evalByQuery';
import { Context, Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

const getColumn = (
  table: Value[][],
  columnIndex: number,
  cache: Map<number, Value[]>,
) => {
  const existingItem = cache.get(columnIndex);

  if (existingItem) {
    return existingItem;
  }

  const column = table.map((row) => {
    return row[columnIndex];
  });

  cache.set(columnIndex, column);
  return column;
};

export const TABLEFILTER = async (
  ctx: Context,
  table: Value[][],
  ...filters: Value[]
): Promise<Value[][]> => {
  const rowsToKeep = new Array<boolean>(table.length).fill(true);
  const columnCache = new Map<number, Value[]>();

  if (filters.length % 2 !== 0) {
    throw new Error(
      'TABLEFILTER expects a matching number of columns and filters. Add a filter or remove a column at the end',
    );
  }

  for (let i = 0; i < filters.length; i += 2) {
    const columnIndex = filters[i];
    const query = filters[i + 1];

    if (typeof columnIndex !== 'number') {
      throw new Error(
        `TABLEFILTER expects column indexes to be numbers, but got ${typeof columnIndex} at argument ${
          i + 1
        }`,
      );
    }

    const column = getColumn(table, columnIndex, columnCache);

    for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
      const value = column[rowIndex];
      // eslint-disable-next-line no-await-in-loop
      const matches = await doFilter(ctx, value, query);
      if (!matches) {
        rowsToKeep[rowIndex] = false;
      }
    }
  }

  return table.filter((_, i) => {
    return rowsToKeep[i];
  });
};

const doFilter = async (
  ctx: Context,
  value: Value,
  query: Value,
): Promise<boolean> => {
  if (typeof query === 'function') {
    const deferred = async () => {
      return value;
    };
    const result = await query(ctx, [deferred]);
    return Boolean(result);
  }

  if (Array.isArray(query)) {
    return query.includes(value);
  }

  return evalByQuery({
    leftHandValue: value,
    query,
  });
};

export default wrapFunction(TABLEFILTER, {
  name: 'TABLEFILTER',
  nargs: 3,
  types: ['array'],
  passContext: true,
});
