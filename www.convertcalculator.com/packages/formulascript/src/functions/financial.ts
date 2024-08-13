/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-shadow */
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

const fv = (
  rate: number,
  periods: number,
  payment: number,
  value = 0,
  type = 0,
) => {
  if (rate === 0) {
    return -value - payment * periods;
  }
  const term = (1 + rate) ** periods;
  return (payment * (type ? 1 + rate : 1) * (1 - term)) / rate - value * term;
};

const FV = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number, number]
  const [rate, periods, payment, value, type] = getArgsOrNA(args, 3);
  return fv(
    (await rate(ctx)) as number,
    (await periods(ctx)) as number,
    (await payment(ctx)) as number,
    value ? ((await value(ctx)) as number) : 0,
    type ? ((await type(ctx)) as number) : 0,
  );
};

const pmt = (
  rate: number,
  periods: number,
  present: number,
  future = 0,
  type = 0,
) => {
  if (rate === 0) {
    if (periods === 0) {
      throw new Error(
        '#VALUE! number of periods in PMT cannot be zero if rate is zero.',
      );
    }
    return -present - future / periods;
  }
  const term = (1 + rate) ** periods;
  const value = future * rate + present * rate * term;
  const rv = (value * (type ? 1 / (1 + rate) : 1)) / (1 - term);
  if (Number.isFinite(rv)) {
    return rv;
  }
  throw new Error('#VALUE! Invalid arguments to PMT.');
};

const PMT = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number?, number?]
  const [rate, periods, present, future, type] = getArgsOrNA(args, 3);

  return pmt(
    Number(await rate(ctx)),
    Number(await periods(ctx)),
    Number(await present(ctx)),
    future ? Number(await future(ctx)) : 0,
    type ? Number(await type(ctx)) : 0,
  );
};

const ipmt = (
  rate: number,
  period: number,
  periods: number,
  present: number,
  future = 0,
  type = 0,
) => {
  const payment = pmt(rate, periods, present, future, type);
  if (period === 1) {
    return rate * (type ? 0 : -present);
  }
  return (
    rate *
    (type
      ? fv(rate, period - 2, payment, present, type) - payment
      : fv(rate, period - 1, payment, present, type))
  );
};

const IPMT = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number, number, number]
  const [rate, period, periods, present, future, type] = getArgsOrNA(args, 4);

  return ipmt(
    Number(await rate(ctx)),
    Number(await period(ctx)),
    Number(await periods(ctx)),
    Number(await present(ctx)),
    future ? Number(await future(ctx)) : 0,
    type ? Number(await type(ctx)) : 0,
  );
};

const cumimpt = (
  rate: number,
  periods: number,
  value: number,
  start: number,
  end: number,
  type: number,
) => {
  if (start > end) {
    throw new Error('#NUM Start cannot be bigger than end.');
  }

  let acc = 0;
  for (let i = start; i <= end; i++) {
    acc += ipmt(rate, i, periods, value, 0, type);
  }
  return acc;
};

const CUMIPMT = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number, number, number]
  const [rate, periods, value, start, end, type] = getArgsOrNA(args, 6);

  return cumimpt(
    Number(await rate(ctx)),
    Number(await periods(ctx)),
    Number(await value(ctx)),
    Number(await start(ctx)),
    Number(await end(ctx)),
    Number(await type(ctx)),
  );
};

const npv = (rate: number, values: number[]) => {
  let acc = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    acc += values[i];
    if (rate === -1) {
      if (acc === 0) {
        continue;
      } else {
        throw new Error('#DIV/0 Cannot divide by zero.');
      }
    }
    acc /= 1 + rate;
  }
  return acc;
};

const NPV = async (ctx: Context, args: Deferred[]) => {
  // [number, number, ...number[]]
  const [rate, ..._values] = getArgsOrNA(args, 2);

  const values: number[] = [];
  for (let i = 0; i < _values.length; i++) {
    values.push(Number(await _values[i](ctx)));
  }

  return npv(Number(await rate(ctx)), values);
};

const pv = (
  rate: number,
  periods: number,
  payment: number,
  future = 0,
  type = 0,
) => {
  if (rate === -1) {
    if (periods === 0) {
      throw new Error('#NUM Number of periods cannot be 0, if rate is -1.');
    } else {
      throw new Error('#DIV/0! Cannot divide by zero.');
    }
  }
  if (rate === 0) {
    return -payment * periods - future;
  }
  return (
    (((1 - (1 + rate) ** periods) * payment * (1 + rate * type)) / rate -
      future) /
    (1 + rate) ** periods
  );
};

const PV = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number?, number?]
  const [rate, periods, payment, future, type] = getArgsOrNA(args, 3);

  return pv(
    Number(await rate(ctx)),
    Number(await periods(ctx)),
    Number(await payment(ctx)),
    future ? Number(await future(ctx)) : 0,
    type ? Number(await type(ctx)) : 0,
  );
};

const nper = (
  rate: number,
  payment: number,
  present: number,
  future = 0,
  type = 0,
) => {
  if (rate === 0) {
    if (payment === 0) {
      throw new Error('#DIV/0 Rate and payment cannot be zero.');
    }
    return (-present - future) / payment;
  }

  const normalizedPayment = type === 1 ? payment * (1 + rate) : payment;

  const rv =
    Math.log(
      (normalizedPayment - future * rate) /
        (present * rate + normalizedPayment),
    ) / Math.log(1 + rate);
  if (Number.isNaN(rv)) {
    throw new Error('#NUM Incorrect arguments for NPER.');
  }
  return rv;
};

const NPER = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number?, number?]
  const [rate, payment, present, future, type] = getArgsOrNA(args, 3);

  return nper(
    Number(await rate(ctx)),
    Number(await payment(ctx)),
    Number(await present(ctx)),
    future ? Number(await future(ctx)) : 0,
    type ? Number(await type(ctx)) : 0,
  );
};

const calculateRate = (
  periods: number,
  payment: number,
  present: number,
  future = 0,
  type = 0,
  guess = 0.1,
) => {
  if (guess <= -1) {
    throw new Error('#VALUE! Guess cannot be negative');
  }

  const epsMax = 1e-7;

  const iterMax = 50;

  let rate = guess;

  for (let i = 0; i < iterMax; i++) {
    if (rate <= -1) {
      throw new Error('#NUM Rate cannot be negative.');
    }
    let y: number;
    if (Math.abs(rate) < epsMax) {
      y =
        present * (1 + periods * rate) +
        payment * (1 + rate * type) * periods +
        future;
    } else {
      const f = (1 + rate) ** periods;
      y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    if (Math.abs(y) < epsMax) {
      return rate;
    }
    let dy: number;
    if (Math.abs(rate) < epsMax) {
      dy = present * periods + payment * type * periods;
    } else {
      const f = (1 + rate) ** periods;
      const df = periods * (1 + rate) ** (periods - 1);
      dy =
        present * df +
        payment * (1 / rate + type) * df +
        payment * (-1 / (rate * rate)) * (f - 1);
    }
    rate -= y / dy;
  }
  throw new Error('#NUM Rate does not converge.');
};

const RATE = async (ctx: Context, args: Deferred[]) => {
  // [number, number, number, number?, number?, number?]
  const [periods, payment, present, future, type, guess] = getArgsOrNA(args, 3);

  return calculateRate(
    Number(await periods(ctx)),
    Number(await payment(ctx)),
    Number(await present(ctx)),
    future ? Number(await future(ctx)) : 0,
    type ? Number(await type(ctx)) : 0,
    guess ? Number(await guess(ctx)) : 0.1,
  );
};

const effect = (rate: number, _periods: number) => {
  const periods = Math.trunc(_periods);
  return (1 + rate / periods) ** periods - 1;
};

const EFFECT = async (ctx: Context, args: Deferred[]) => {
  // [number, number]
  const [rate, periods] = getArgsOrNA(args, 2);
  return effect(Number(await rate(ctx)), Number(await periods(ctx)));
};

export const functions = {
  FV,
  PMT,
  IPMT,
  CUMIPMT,
  NPV,
  PV,
  NPER,
  RATE,
  EFFECT,
};
