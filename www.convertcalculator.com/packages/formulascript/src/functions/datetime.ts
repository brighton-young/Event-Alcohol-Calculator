/* eslint-disable no-plusplus */
import { Context, Deferred } from 'formulascript/interpreter';

import { getArgsOrNA } from '../utils';

export type CCDate = Date | number | string;

const parseDate = (date: CCDate): Date => {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    const n = Date.parse(date);
    if (Number.isNaN(n)) {
      throw new Error(`#VALUE! Invalid date: '${date}'`);
    }
    return new Date(n);
  }
  if (date > 1000000000000) {
    return new Date(date);
  }
  return dateFromSerial(date);
};

const dateFromSerial = (serial: number): Date => {
  const n = Number(serial);
  if (Number.isNaN(n)) {
    throw new Error(`#VALUE! Argument must be a number, not: '${n}'.`);
  }

  return new Date(Date.UTC(0, 0, serial > 59 ? serial - 1 : serial));
};

const serialFromDate = (date: Date): number => {
  const offset =
    // the 25569.0 is the number of days between 1900 and 1970
    25569.0 +
    (date.getTime() - date.getTimezoneOffset() * 60 * 1000) /
      (1000 * 60 * 60 * 24);

  return offset;
};

const TODAY = async () => {
  return new Date();
};

const DATE = async (ctx: Context, args: Deferred[]) => {
  const [year, month, day] = getArgsOrNA(args, 3);
  return new Date(
    Number(await year(ctx)),
    Number(await month(ctx)) - 1,
    Number(await day(ctx)),
  );
};

const TIMEVALUE = async (ctx: Context, args: Deferred[]) => {
  const [text] = getArgsOrNA(args, 1);
  const spec = /(\d?\d):(\d\d)\s?(AM|PM)?/gm;
  const match = spec.exec((await text(ctx)) as string);
  if (match === null) {
    throw new Error(`#VALUE! Invalid date format '${text}'.`);
  }
  const [, hourText, minuteText, part] = match;
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  const fullHours = hours <= 12 && part === 'PM' ? hours + 12 : hours;
  return +((fullHours + minutes / 60) / 24).toFixed(4);
};

const MONTH = async (ctx: Context, args: Deferred[]) => {
  const [n] = getArgsOrNA(args, 1);
  const date = parseDate((await n(ctx)) as CCDate);
  // months go 0-11
  return date.getMonth() + 1;
};

const WEEKDAY = async (ctx: Context, args: Deferred[]) => {
  const [serial, _type] = getArgsOrNA(args, 1);
  const date = parseDate((await serial(ctx)) as CCDate);
  const day = date.getDay();
  // default 0 (Sunday) through 6 (Saturday)
  const type = _type ? await _type(ctx) : 1;
  switch (type) {
    case 1:
      // Numbers 1 (Sunday) through 7 (Saturday)
      return day + 1;
    case 2:
      // Numbers 1 (Monday) through 7 (Sunday)
      return ((day + 6) % 7) + 1;
    case 3:
      // Numbers 0 (Monday) through 6 (Sunday)
      return (day + 6) % 7;
    case 11:
      // Numbers 1 (Monday) through 7 (Sunday)
      // duplicate of 2, also in Excel docs
      return ((day + 6) % 7) + 1;
    case 12:
      // Numbers 1 (Tuesday) through 7 (Monday)
      return ((day + 5) % 7) + 1;
    case 13:
      // Numbers 1 (Wednesday) through 7 (Tuesday)
      return ((day + 4) % 7) + 1;
    case 14:
      // Numbers 1 (Thursday) through 7 (Wednesday)
      return ((day + 3) % 7) + 1;
    case 15:
      // Numbers 1 (Friday) through 7 (Thursday)
      return ((day + 2) % 7) + 1;
    case 16:
      // Numbers 1 (Saturday) through 7 (Friday)
      return ((day + 1) % 7) + 1;
    case 17:
      // Numbers 1 (Sunday) through 7 (Saturday)
      // duplicate of 2, also in Excel docs
      return day + 1;
    default:
      return day + 1;
  }
};

const getDaysDiff = (date1: Date, date2: Date): number => {
  return Math.floor(
    (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const DATEDIF = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date, CC_Date, string]
  const [_firstDate, _secondDate, _timeframe] = getArgsOrNA(args, 2);

  const firstDate = parseDate((await _firstDate(ctx)) as CCDate);
  const secondDate = parseDate((await _secondDate(ctx)) as CCDate);

  const timeframe = _timeframe ? String(await _timeframe(ctx)) : 'D';
  switch (timeframe.toUpperCase()) {
    case 'D': {
      const daysDiff = getDaysDiff(firstDate, secondDate);
      return daysDiff;
    }
    case 'M': {
      const notComplete = secondDate.getDate() < firstDate.getDate();
      const monthsDiff = secondDate.getMonth() - firstDate.getMonth();
      const yearsDiff =
        12 * (secondDate.getFullYear() - firstDate.getFullYear());

      const monthsTotalDiff = monthsDiff + yearsDiff;
      const monthsCompleteTotalDiff = monthsTotalDiff - (notComplete ? 1 : 0);
      return monthsCompleteTotalDiff;
    }
    case 'Y': {
      const notComplete =
        secondDate.getMonth() === firstDate.getMonth() &&
        secondDate.getDate() < firstDate.getDate();
      const yearsDiff = secondDate.getFullYear() - firstDate.getFullYear();
      const yearsCompleteDiff = yearsDiff - (notComplete ? 1 : 0);
      return yearsCompleteDiff;
    }
    case 'MD': {
      const daysDiff = secondDate.getDate() - firstDate.getDate();
      return daysDiff;
    }
    case 'YM': {
      const monthsDiff = secondDate.getMonth() - firstDate.getMonth();
      return monthsDiff;
    }
    case 'YD': {
      // ignore years, 1900 -> does not matter as long as same
      firstDate.setFullYear(1900);
      secondDate.setFullYear(1900);
      const daysDiff = getDaysDiff(firstDate, secondDate);
      return daysDiff;
    }
    default:
      return 0;
  }
};

const DAYS = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date, CC_Date]
  const [start, end] = getArgsOrNA(args, 2);
  return DATEDIF(ctx, [
    start,
    end,
    async () => {
      return 'D';
    },
  ]);
};

const DAY = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date]
  const [_date] = getArgsOrNA(args, 1);
  const date = parseDate((await _date(ctx)) as CCDate);
  return date.getDate();
};

const YEAR = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date]
  const [_date] = getArgsOrNA(args, 1);
  const date = parseDate((await _date(ctx)) as CCDate);
  return parseDate(date).getFullYear();
};

const HOUR = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date]
  const [_date] = getArgsOrNA(args, 1);
  const date = parseDate((await _date(ctx)) as CCDate);
  return parseDate(date).getHours();
};

const MINUTE = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date]
  const [_date] = getArgsOrNA(args, 1);
  const date = parseDate((await _date(ctx)) as CCDate);
  return parseDate(date).getMinutes();
};

const EDATE = async (ctx: Context, args: Deferred[]) => {
  // [CC_Date, number]
  const [_date, _months] = getArgsOrNA(args, 2);
  const date = parseDate((await _date(ctx)) as CCDate);
  const months = Number(await _months(ctx));
  if (Number.isNaN(months)) {
    throw new Error('#VALUE! Second argument to EDATE must be a number');
  }

  date.setMonth(date.getMonth() + months);
  return serialFromDate(date);
};

const NOW = async () => {
  return serialFromDate(new Date());
};

const SECOND = async (ctx: Context, args: Deferred[]) => {
  const [_serial] = args;

  const serial = await _serial(ctx);

  // try to parse "<hh>:<mm>:<ss> A|PM format"
  if (typeof serial === 'string' && serial.includes(':')) {
    const [, , seconds] = serial.split(':');
    if (seconds === undefined) return 0;
    return +seconds.slice(0, 2);
  }

  const partial = Number(serial);

  if (partial < 0 || partial > 1) {
    throw new Error('#VALUE! number argument to SECOND must be between 0-1');
  }

  const seconds = (partial * 24 * 60 * 60) % 60;
  return Number(seconds.toFixed());
};

const DATEVALUE = async (ctx: Context, args: Deferred[]) => {
  const [_dateString] = getArgsOrNA(args, 1);

  const dateString = (await _dateString(ctx)) as CCDate;

  const date = parseDate(dateString);
  return serialFromDate(date);
};

export const testing = {
  serialFromDate,
};

export const functions = {
  TODAY,
  DATE,
  TIMEVALUE,
  MONTH,
  WEEKDAY,
  DATEDIF,
  DAYS,
  DAY,
  YEAR,
  HOUR,
  MINUTE,
  EDATE,
  NOW,
  SECOND,
  DATEVALUE,
};
