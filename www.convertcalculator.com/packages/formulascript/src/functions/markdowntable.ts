import type { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

export const MARKDOWNTABLE = (rows: Value[][], _columns?: string[]): string => {
  const longestRow = rows.reduce((acc, row) => {
    return Math.max(acc, row.length);
  }, 0);

  const columns = _columns ?? new Array(longestRow).fill('');

  if (columns.length < longestRow) {
    throw new Error(
      `MARKDOWNTABLE expected '${longestRow}' columns, got '${columns.length}'`,
    );
  }

  const header = `| ${columns
    .map((col) => {
      if (typeof col === 'string') {
        return col;
      }
      if (typeof col === 'number') {
        return String(col);
      }
      throw new Error(
        'MARKDOWNTABLE expects all columns to be strings or numbers',
      );
    })
    .join(' | ')} |\n`;

  const divider = `| ${columns
    .map(() => {
      return ':---';
    })
    .join(' | ')} |\n`;

  const body = rows
    .map((row, idx) => {
      if (row.length !== columns?.length) {
        throw new Error(
          `#VALUE! expected ${columns?.length} columns, got ${
            row.length
          } at row ${idx + 1}`,
        );
      }
      return `| ${row.join(' | ')} |`;
    })
    .join('\n');

  return `${header}${divider}${body}`;
};

export default wrapFunction(MARKDOWNTABLE, {
  name: 'MARKDOWNTABLE',
  nargs: 1,
  types: ['array', 'array'],
});
