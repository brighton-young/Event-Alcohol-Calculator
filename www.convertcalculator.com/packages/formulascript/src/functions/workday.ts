import { wrapFunction } from '../utils';

import { PARSEDATE } from './parsedate';

const advanceDate = (date: Date): Date => {
  const time = date.getTime();
  return new Date(time + 86400000);
};

const isWeekend = (date: Date): boolean => {
  return date.getDay() === 0 || date.getDay() === 6;
};

export const WORKDAY = (
  startDate: number,
  days: number,
  holidays: Array<number> = [],
): number => {
  const holidaysAsDates: Array<number> = holidays.map((holiday) => {
    return PARSEDATE(holiday).getTime();
  });

  let date = PARSEDATE(startDate);

  let dayDelta = 0;

  for (let i = 0; i < days; i++) {
    date = advanceDate(date);
    dayDelta += 1;

    while (isWeekend(date) || holidaysAsDates.includes(date.getTime())) {
      date = advanceDate(date);
      dayDelta += 1;
    }
  }

  return startDate + dayDelta;
};

export default wrapFunction(WORKDAY, {
  name: 'WORKDAY',
  nargs: 2,
  types: ['number', 'number', 'array'],
});
