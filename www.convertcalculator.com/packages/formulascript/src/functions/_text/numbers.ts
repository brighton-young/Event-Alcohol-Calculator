const DELIMITERS = { '.': ',', ',': '.' };

type Delimiters = { thousand: string; decimal: string };

const rules = {
  '#': (digits: string[]) => {
    const digit = digits.shift();
    return digit || '';
  },
  0: (digits: string[]) => {
    const digit = digits.shift();
    return digit || '0';
  },
  '?': (digits: string[]) => {
    const digit = digits.shift();
    return digit || ' ';
  },
};

// const clean = (format: string) => format.replaceAll(/,|\./g, '');
const clean = (format: string) => {
  return format.replace(/,|\./g, '');
};

const getDecimalDelimiter = (format: string): string | null => {
  if (format.includes('.') && !format.includes(',')) return '.';
  if (format.includes('.') && format.includes(',')) {
    const lastIndex = Math.max(format.indexOf(','), format.indexOf('.'));
    if (lastIndex > 0) {
      return format[lastIndex];
    }
  }
  return null;
};

const getThousandDelimiter = (format: string): string | null => {
  if (format.includes(',') && !format.includes('.')) return ',';
  if (format.includes('.') && format.includes(',')) {
    const lastIndex = Math.max(format.indexOf(','), format.indexOf('.'));
    if (lastIndex > 0) {
      return DELIMITERS[format[lastIndex]];
    }
  }
  return null;
};

const getDelimiters = (format: string): Delimiters => {
  const decimalDelimiter = getDecimalDelimiter(format);
  const thousandDelimiter = getThousandDelimiter(format);

  return {
    decimal: decimalDelimiter,
    thousand: thousandDelimiter,
  };
};

const getCodes = (format: string, delimiters: Delimiters) => {
  const [intFormat, decFormat = ''] = format.split(delimiters.decimal);
  return {
    integer: [...Array.from(clean(intFormat))],
    decimal: [...Array.from(clean(decFormat))],
  };
};

const getDigits = (
  number: string,
  delimiters: Delimiters,
): { integer: string[]; decimal: string[] } => {
  // combine thousand separator with its digit
  const numbers = splitNumber(number);
  const integerDigits = [...Array.from(numbers.integer)]
    .reverse()
    .map((digit, i) => {
      if (i % 3 === 0 && i !== 0 && delimiters.thousand) {
        return `${digit}${delimiters.thousand}`;
      }
      return digit;
    })
    .reverse();
  // const decimalDigits = [...decimal].map((digit, i) => {
  //   return (i === 0) ? `${delimiters.decimal}${digit}` : digit
  // })
  return { integer: integerDigits, decimal: [...Array.from(numbers.decimal)] };
};

const splitNumber = (number: string): { integer: string; decimal: string } => {
  const parts = number.split('.');
  const [integer = '', decimal = ''] = parts;
  return { integer, decimal };
};

// ensures integer part of format always includes enough codes to use up all digits
// e.g. 123456 #,### -> ######
const expand = (codes: string[], length: number): string[] => {
  const clength = codes.filter((code) => {
    return '#?0'.includes(code);
  }).length;
  if (clength >= length || clength === 0) {
    return codes;
  }
  const padding = '#'.repeat(length - clength);
  const index = codes.findIndex((code) => {
    return '#?0'.includes(code);
  });
  return codes
    .slice(0, index)
    .concat([...Array.from(padding)])
    .concat(codes.slice(index));
};

const mask = (digits: string[], codes: string[]): string[] => {
  return codes.map((code) => {
    const formatter = rules[code];
    return formatter ? formatter(digits) : code;
  });
};

const getDecimalPlaces = (n: number) => {
  const [, decimals = ''] = String(n).split('.');
  return decimals.length;
};

const formatNumber = (value: number, format: string): string => {
  const delimiters = getDelimiters(format);
  const codes = getCodes(format, delimiters);
  const significants = Math.min(
    codes.decimal.filter((c) => {
      return '#?0'.includes(c);
    }).length,
    getDecimalPlaces(value),
  );
  const numberString = value.toFixed(significants);
  const digits = getDigits(numberString, delimiters);
  codes.integer = expand(codes.integer, digits.integer.length);
  const integer = mask(digits.integer, codes.integer).join('');
  const decimal = mask(digits.decimal, codes.decimal).join('');

  if (!delimiters.decimal || !decimal) {
    return integer;
  }

  return `${integer}${delimiters.decimal}${decimal}`;
};

export default formatNumber;
