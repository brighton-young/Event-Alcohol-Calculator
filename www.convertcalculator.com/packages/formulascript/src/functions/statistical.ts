/* eslint-disable no-await-in-loop */
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA, getIndexes } from '../utils';

const getSumRange = (range: any[], sumRange: any[]) => {
  if (!range && !range.length && !sumRange && !sumRange.length) return [];

  if (!sumRange && !sumRange.length) return range;

  return sumRange;
};

const SUMIF = async (ctx: Context, args: Deferred[]) => {
  // [any[], any, any[]]
  const [_range, _criteria, _sumRange] = getArgsOrNA(args, 3);

  const range = (await _range(ctx)) as any[];
  const criteria = (await _criteria(ctx)) as any[];
  const sumRange = (await _sumRange(ctx)) as any[];

  const newSumRange = getSumRange(range, sumRange);

  const indexes = getIndexes(range, criteria);

  const result = indexes.reduce((reducedResult, foundIndex) => {
    return reducedResult + (Number(newSumRange[foundIndex]) || 0);
  }, 0);

  return result;
};

const SUMIFS = async (ctx: Context, args: Deferred[]) => {
  // [any[], ...[any[], any]]
  const [_sumRange, ..._criteria] = getArgsOrNA(args, 2);

  const sumRange = await _sumRange(ctx);
  const criteria = [];
  for (let i = 0; i < _criteria.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    criteria.push(await _criteria[i](ctx));
  }

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

  const result = intersectingIndexes.reduce((reducedResult, foundIndex) => {
    return reducedResult + sumRange[foundIndex] || 0;
  }, 0);

  return result;
};

const COUNTIF = async (ctx: Context, args: Deferred[]) => {
  // [any[], any]
  const [range, criterion] = getArgsOrNA(args, 2);
  const indexes = getIndexes(await range(ctx), await criterion(ctx));
  return indexes.length;
};

const COUNTIFS = async (ctx: Context, args: Deferred[]) => {
  // [...[any[], any]]
  const deferredValues = getArgsOrNA(args, 2); // .map((pair) => COUNTIF(pair));
  const counts = [];
  for (let i = 0; i < deferredValues.length; i += 2) {
    const range = deferredValues[i - 1];
    const criterion = deferredValues[i];
    counts.push(await COUNTIF(ctx, [range, criterion]));
  }
  return counts.reduce((acc, cur) => {
    return acc + cur;
  }, 0);
};

export const functions = {
  SUMIF,
  SUMIFS,
  COUNTIF,
  COUNTIFS,
};
