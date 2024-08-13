import { Context, Deferred } from 'formulascript/interpreter';

import { fetchData } from '../utils';

const TABLEFINDFIRST = async (ctx: Context, args: Deferred[]) => {
  const [reference, columnIndex, query, sortIndex, sortOrder] = args;

  const { calculatorId } = ctx.globals;

  const result = await fetchData({
    url: '/api/embed/get-tablefindfirst/',
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

export default TABLEFINDFIRST;
