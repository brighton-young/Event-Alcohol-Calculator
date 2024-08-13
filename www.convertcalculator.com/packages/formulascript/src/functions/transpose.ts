import { Value } from 'formulascript/interpreter';

import { wrapFunction } from '../utils';

type Table = Value[][];

export const TRANSPOSE = (table: Table): Table => {
  const firstRow = table[0];

  if (!firstRow) {
    throw new Error('#VALUE! TRANSPOSE cannot transpose empty table');
  }

  const out: Table = new Array(firstRow.length);

  for (let i = 0; i < firstRow.length; i++) {
    out[i] = new Array(table.length);

    for (let j = 0; j < table.length; j++) {
      out[i][j] = table[j][i];
    }
  }

  return out;
};

export default wrapFunction(TRANSPOSE, {
  name: 'TRANSPOSE',
  nargs: 1,
  types: ['array'],
});
