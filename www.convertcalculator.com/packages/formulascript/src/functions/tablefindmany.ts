import { Context, FsFunction } from 'formulascript/interpreter';

import { fetchData } from '../utils';

const TABLEFINDMANY = async (
  ctx: Context,
  [reference, columnIndex, query, sortIndex, sortOrder],
) => {
  const { calculatorId } = ctx.globals;

  const result = await fetchData({
    url: '/api/embed/get-tablefindmany/',
    method: 'GET',
    params: {
      calculatorId,
      reference: reference ? String(await reference(ctx)) : undefined,
      columnIndex: columnIndex ? await columnIndex(ctx) : undefined,
      query: query ? await query(ctx) : undefined,
      sortOrder: sortOrder ? await sortOrder(ctx) : undefined,
      sortIndex: sortIndex ? await sortIndex(ctx) : undefined,
    },
  });

  return result;
};

export default TABLEFINDMANY;
