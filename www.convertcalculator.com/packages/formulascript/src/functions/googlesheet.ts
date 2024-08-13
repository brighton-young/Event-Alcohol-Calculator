import { Context, Deferred } from 'formulascript/interpreter';
import isNil from 'lodash/isNil';

import { fetchData, getArgsOrNA } from '../utils';

const GOOGLESHEET = async (ctx: Context, args: Deferred[]) => {
  const [_spreadsheetId, _worksheetId] = getArgsOrNA(args, 2);

  if (!_spreadsheetId || isNil(_worksheetId)) return [[]];

  const spreadsheetId = await _spreadsheetId(ctx);
  const worksheetId = await _worksheetId(ctx);

  const { calculatorId } = ctx.globals;

  const result = await fetchData({
    url: '/api/embed/get-googlesheet/',
    method: 'GET',
    params: {
      calculatorId,
      spreadsheetId,
      worksheetId,
    },
  });

  return result || [[]];
};

export default GOOGLESHEET;
