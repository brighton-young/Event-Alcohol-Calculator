import { wrapFunction } from '../utils';

import { PARSEDATE } from './parsedate';

export const NETWORKDAYS = (
  serialDate1: number,
  serialDate2: number,
  holidays: Array<number> = [],
): number => {
  const holidaysAsDates: Array<number> = holidays.map((holiday) => {
    return PARSEDATE(holiday).getTime();
  });

  const date1 = PARSEDATE(serialDate1);
  const date2 = PARSEDATE(serialDate2);

  const start = Math.min(date1.getTime(), date2.getTime());
  const end = Math.max(date1.getTime(), date2.getTime());

  let days = 0;

  for (let i = start; i <= end; i += 86400000) {
    const date = new Date(i);

    if (
      date.getDay() !== 0 &&
      date.getDay() !== 6 &&
      !holidaysAsDates.includes(date.getTime())
    ) {
      days += 1;
    }
  }

  return days;
};

export default wrapFunction(NETWORKDAYS, {
  name: 'NETWORKDAYS',
  nargs: 2,
  types: ['number', 'number', 'array'],
});
