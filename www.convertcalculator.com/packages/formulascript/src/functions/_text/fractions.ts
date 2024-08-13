// greatest common denominator
const gcd = (a, b) => {
  return !b ? a : gcd(b, a % b);
};

const splitFormat = (format) => {
  const [start, denominator] = format.split('/');
  const [, numerator] = start.split(/\s/);
  return { numerator, denominator };
};

// denominator is 10^(number of decimals)
// 0.35 -> 10^2 = 100
// mulitply decimal part by denominator
// 0.35 -> 0.35 * 100 = 35
// find greatest common denominator
// 35 & 100 -> 5
// return fraction (35 / 5) / (100 / 5)
const formatFraction = (number, format) => {
  const [integer, decimalValue = ''] = String(number).split('.');

  const parts = splitFormat(format);
  // const decimalString = decimalValue.slice(parts.numerator.length)
  const decimal = Number(`.${decimalValue.slice(0, parts.numerator.length)}`);
  // if only consists of digits
  if (/\d+/.test(parts.denominator)) {
    const denominator = Number(parts.denominator);
    const numerator = Math.round(decimal * denominator);
    return `${integer} ${numerator}/${denominator}`;
  }
  // does not account for specification of fraction length
  // e.g. ???/??? should calculate fraction in 100s (123 / 456)
  const denominator = 10 ** decimalValue.length;
  const numerator = decimal * denominator;
  const common = gcd(denominator, numerator);
  return `${integer} ${numerator / common}/${denominator / common}`;
};

export default formatFraction;
