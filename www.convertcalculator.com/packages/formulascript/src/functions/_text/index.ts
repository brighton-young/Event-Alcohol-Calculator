import formatDate from './dates';
import formatFraction from './fractions';
import formatNumber from './numbers';
import formatScientific from './scientific';

type Formatter = (value: number, format: string) => string;

const formatPercentage = (number: number, format: string): string => {
  return formatNumber(number * 100, format);
};

const formats: [RegExp, Formatter][] = [
  [/%/, formatPercentage],
  [/[dDmMyY]+/, formatDate],
  [/[0#\d\s]*([?\d]+)\/([?\d]+)/, formatFraction],
  [/0.00E\+00/, formatScientific],
];

const matchFormatter = (format: string): Formatter => {
  const formatter = formats.find((rule) => {
    return format.match(rule[0]);
  });
  return formatter ? formatter[1] : formatNumber;
};

const textWrapper = (value: number, format: string): string => {
  if (value == null || format == null) {
    return '';
  }

  const formatter = matchFormatter(format);
  return formatter(Number(value), format);
};

export default textWrapper;
export const testing = { matchFormatter };
