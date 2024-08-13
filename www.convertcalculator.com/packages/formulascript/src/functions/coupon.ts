import type { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

interface CouponData {
  amountOff: number;
  percentageOff: number;
  type: string;
}

const COUPON = async (ctx: Context, args: Deferred[]) => {
  const [_value, _data] = getArgsOrNA(args, 1);

  const value = await _value(ctx);
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    throw new Error(`#VALUE! Argument must be number, not: '${typeof value}'`);
  }

  if (_data === undefined) return numberValue;

  // data actually is not a deferred, but a JS object
  const data = (await _data(ctx)) as unknown as CouponData;

  if (!data || !data.type) return numberValue;

  const { amountOff = 0, percentageOff = 0, type } = data;

  switch (type) {
    case 'percentage':
      return (numberValue * (100 - percentageOff)) / 100;
    case 'amount':
      return numberValue - amountOff;
    default:
      return numberValue;
  }
};

export default COUPON;
