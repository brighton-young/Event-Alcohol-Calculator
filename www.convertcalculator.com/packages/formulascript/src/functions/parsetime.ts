import { wrapFunction } from '../utils';

export const PARSETIME = (
  time: number,
  use24HourClock: boolean = false,
): string => {
  if (time < 0 || time > 1) {
    throw new Error(
      `#VALUE! PARSETIME expects its first argument to be between 0 and 1, not: '${time}'`,
    );
  }

  let hours = Math.floor(time * 24);
  const minutes = Math.floor((time * 24 - hours) * 60);

  let ampm = '';

  if (!use24HourClock) {
    ampm = hours < 12 ? ' AM' : ' PM';
    hours = hours !== 12 ? hours % 12 : hours;
  }

  const hoursString = hours.toString().padStart(2, '0');
  const minutesString = minutes.toString().padStart(2, '0');

  return `${hoursString}:${minutesString}${ampm}`;
};

export default wrapFunction(PARSETIME, {
  name: 'PARSETIME',
  nargs: 1,
  types: ['number', 'boolean'],
});
