// 12200000 + 0.00E+00 = "1.22E+07"
// format is always "0.00E+00"
const formatScientific = (value: number) => {
  const [mantissa, exponent] = value.toExponential().split('+');

  return `${mantissa.toUpperCase()}+${exponent.padStart(2, '0')}`;
};

export default formatScientific;
