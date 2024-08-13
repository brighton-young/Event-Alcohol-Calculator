import isArray from 'lodash/isArray';
import unzip from 'lodash/unzip';

import evalByQuery from '@cc/shared/utils/evalByQuery';
import isNil from '@cc/shared/utils/isNil';
import parseNumber from '@cc/shared/utils/parseNumber';
import sortMatrix from '@cc/shared/utils/sortMatrix';
import { Context, Deferred, Value } from 'formulascript/interpreter';

import { getArgsOrNA, getIndexes } from '../utils';

type Table = Value[][];

const FINDFIRST = async (ctx: Context, args: Deferred[]) => {
  const rows = await FINDMANY(ctx, args);

  return rows?.[0] || [];
};

const FINDMANY = async (ctx: Context, args: Deferred[]) => {
  const [_table, _columnIndex, _query, _sortIndex, _sortOrder] = args;

  const table = (await _table(ctx)) as Table;
  const isMatrix = Array.isArray(table) && Array.isArray(table[0]);

  if (!isMatrix) return [[]];

  const columnIndex = Number(await _columnIndex(ctx));
  const query = await _query(ctx);
  const matrix = table.filter((row) => {
    return evalByQuery({ leftHandValue: row[columnIndex], query });
  });

  if (!_sortOrder || !_sortIndex) return matrix;

  const sortOrder = await _sortOrder(ctx);
  const sortIndex = await _sortIndex(ctx);

  if (!sortOrder || !sortIndex) return matrix;

  return sortMatrix({ matrix, sortOrder, sortIndex });
};

const vlookup = (
  needle: any,
  table: Table,
  index: number,
  rangeLookup = false,
  rangeLookupHigherBound = false,
) => {
  if (isNil(needle) || isNil(index)) {
    return false;
  }

  if (!table || !(table instanceof Array)) {
    throw new Error(
      `#VALUE! Second argument to VLOOKUP should be a table not: '${typeof table}'`,
    );
  }

  const needleValue = parseNumber(needle);

  const value = table.reduce((reducedValue, row, rowIndex) => {
    if (reducedValue !== null || !row) return reducedValue;

    const cellValue = parseNumber(row[0]);

    if (cellValue === needleValue) {
      return row[index];
    }

    if (rangeLookup && typeof cellValue === 'string') {
      if (cellValue.toLowerCase().indexOf(String(needle).toLowerCase()) > -1) {
        return row[index];
      }
    }

    if (rangeLookup && typeof cellValue === 'number') {
      const prevResult = rowIndex > 0 ? table[rowIndex - 1][0] : 0;
      const nextResult =
        rowIndex < table.length - 1 ? table[rowIndex + 1][0] : 999999999;

      if (rowIndex === 0 && needle < cellValue) {
        return row[index];
      }

      if (needle > prevResult && needle < nextResult) {
        if (rangeLookupHigherBound && !!table[rowIndex + 1]) {
          return table[rowIndex + 1][index];
        }

        return row[index];
      }
    }

    return reducedValue;
  }, null);

  return value;
};

const VLOOKUP = async (ctx: Context, args: Deferred[]) => {
  // [any, Table, number, boolean?, boolean?]
  const [_needle, _table, _index, _rangeLookup, _rangeLookupHigherBound] =
    getArgsOrNA(args, 3);

  const needle = await _needle(ctx);
  const table = await _table(ctx);
  const index = await _index(ctx);
  const rangeLookup = _rangeLookup ? await _rangeLookup(ctx) : false;
  const rangeLookupHigherBound = _rangeLookupHigherBound
    ? await _rangeLookupHigherBound(ctx)
    : false;

  return vlookup(
    needle,
    table as Table,
    index as number,
    rangeLookup as boolean,
    rangeLookupHigherBound as boolean,
  );
};

const transposeCache = new WeakMap();

const hlookup = (
  needle: any,
  table: Table,
  index: number,
  rangeLookup = false,
) => {
  if (!Array.isArray(table) || !Array.isArray(table[0])) {
    throw new Error('#VALUE! Second argument to HLOOKUP should be a table');
  }

  let transposedTable = transposeCache.get(table);

  if (!transposedTable) {
    transposedTable = table[0].map((_, i) => {
      return table.map((row) => {
        return row[i];
      });
    });
    transposeCache.set(table, transposedTable);
  }

  return vlookup(needle, transposedTable, index, rangeLookup);
};

const HLOOKUP = async (ctx: Context, args: Deferred[]) => {
  // [any, Table, number, boolean]
  const [needle, table, index, rangeLookup] = getArgsOrNA(args, 3);
  return hlookup(
    (await needle(ctx)) as any,
    (await table(ctx)) as Table,
    (await index(ctx)) as number,
    rangeLookup ? ((await rangeLookup(ctx)) as boolean) : false,
  );
};

const INDEX = async (ctx: Context, args: Deferred[]) => {
  // [Table, number, number]
  const [_table, _rowIndex, _columnIndex] = getArgsOrNA(args, 2);

  const table = await _table(ctx);

  if (isNil(table)) {
    throw new Error('#VALUE! First argument to INDEX is empty');
  }

  const rowIndex = Number(await _rowIndex(ctx));
  const columnIndex = _columnIndex ? Number(await _columnIndex(ctx)) : null;

  if (isNil(columnIndex)) {
    return table[rowIndex] ?? null;
  }

  if (isNil(table[rowIndex])) return null;

  return table[rowIndex][columnIndex] ?? null;
};

const COLUMN = async (ctx: Context, args: Deferred[]) => {
  // [Table, number]
  const [_table, _index] = getArgsOrNA(args, 2);

  const table = await _table(ctx);
  const index = Number(await _index(ctx));

  if (!isArray(table)) return [];

  const transposedTable = unzip(table as Table);
  return transposedTable[index];
};

const ROW = async (ctx: Context, args: Deferred[]) => {
  // [Table, number]
  const [_table, _index] = getArgsOrNA(args, 2);
  const table = await _table(ctx);
  const index = Number(await _index(ctx));
  return !table || !isArray(table) ? [] : table[index];
};

const findifs = (sumRange, ...criteria) => {
  const criterionChunks = criteria.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2);

    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = [];
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  const indexesPerChunk = criterionChunks.map((criterionChunk) => {
    const [range, criterion] = criterionChunk;

    return getIndexes(range, criterion);
  });

  const intersectingIndexes = indexesPerChunk.shift().filter((v) => {
    return indexesPerChunk.every((a) => {
      return a.indexOf(v) !== -1;
    });
  });

  return sumRange[intersectingIndexes[0]];
};

const FINDIFS = async (ctx: Context, args: Deferred[]) => {
  // [any[], ...[any[], any]]
  const [_sumRange, ..._criteria] = getArgsOrNA(args, 3);

  // If we have an even number of arguments, the last one is the fallback value.
  const fallback = args.length % 2 === 0 ? args[args.length - 1] : null;

  const sumRange = await _sumRange(ctx);
  const criteria = [];
  for (let i = 0; i < _criteria.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    criteria.push(await _criteria[i](ctx));
  }

  if (fallback) {
    criteria.pop();
  }

  const result = findifs(sumRange, ...criteria);

  if (result !== undefined) {
    return result;
  }

  if (fallback) {
    return fallback(ctx);
  }

  throw new Error('#N/A! Cannot find value');
};

export const functions = {
  FINDFIRST,
  FINDMANY,
  VLOOKUP,
  HLOOKUP,
  INDEX,
  COLUMN,
  ROW,
  FINDIFS,
};
