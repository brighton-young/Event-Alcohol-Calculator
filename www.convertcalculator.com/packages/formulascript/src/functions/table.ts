import { Context, Deferred } from 'formulascript/interpreter';

import { fetchData, getArgsOrNA } from '../utils';

const TABLE = async (ctx: Context, args: Deferred[]) => {
  const [_reference] = getArgsOrNA(args, 1);

  const { calculatorId } = ctx.globals;
  const reference = String(await _reference(ctx));

  const result = await fetchData({
    url: '/api/embed/get-table/',
    method: 'GET',
    params: {
      calculatorId,
      reference,
    },
  });

  return result;
};

export default TABLE;
