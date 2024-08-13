// how should localization be handled?
const locale = 'en-US';

const rules = {
  d: (date) => {
    return date.toLocaleDateString(locale, { day: 'numeric' });
  },
  dd: (date) => {
    return date.toLocaleDateString(locale, { day: '2-digit' });
  },
  ddd: (date) => {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  },
  dddd: (date) => {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  },

  m: (date) => {
    return date.toLocaleDateString(locale, { month: 'numeric' });
  },
  mm: (date) => {
    return date.toLocaleDateString(locale, { month: '2-digit' });
  },
  mmm: (date) => {
    return date.toLocaleDateString(locale, { month: 'short' });
  },
  mmmm: (date) => {
    return date.toLocaleDateString(locale, { month: 'long' });
  },
  mmmmm: (date) => {
    return date.toLocaleDateString(locale, { month: 'narrow' });
  },

  yy: (date) => {
    return date.toLocaleDateString(locale, { year: '2-digit' });
  },
  yyyy: (date) => {
    return date.toLocaleDateString(locale, { year: 'numeric' });
  },
};

const parseDate = (maybeDate) => {
  if (maybeDate instanceof Date) {
    return maybeDate;
  }
  const n = Number(maybeDate);
  // then it's a date string
  if (Number.isNaN(n)) {
    return new Date(Date.parse(maybeDate));
  }
  if (n > 1000000000000) {
    return new Date(n);
  }
  const epoch = new Date(Date.UTC(1899, 11, 30, 0, 0, 0));
  epoch.setDate(epoch.getDate() + n);
  return epoch;
};

const formatDate = (number, format) => {
  const date = parseDate(number);
  const codes = format.split(/([^dDmMyY])/g);
  const chars = codes.map((code) => {
    const formatter = rules[code.toLowerCase()];
    return formatter ? formatter(date) : code;
  });
  return chars.join('');
};

export default formatDate;
