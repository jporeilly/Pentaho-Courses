// SQL bind parameters: three ways a Data grid fills a Table input's ?
// markers. Run: node sql-bind-parameters.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1022, 508);
const BW = 290, BH = 76, COL = [32, 366, 700];

[
  ['1. One row', ['one row,', 'two fields'], ['first field to the first ?', 'second field to the second ?'], ['one execution', 'one result set']],
  ['2. Several rows', ['three rows,', 'two fields each'], ['Execute for each row? selected', 'each row fills the ? markers in turn'], ['three executions', 'one result set after another']],
  ['3. One value per row', ['two rows,', 'one field each'], ['Execute for each row? cleared', 'the rows fill the ? markers in order'], ['one execution', 'one result set']],
].forEach(([title, grid, query, result], i) => {
  const y = 16 + i * 164;
  d.panel({ x: 16, y, w: 990, h: 148, role: 'support', title });
  const b = [
    { role: 'source', iconName: 'grid-3x3', title: 'Data grid', lines: grid },
    { role: 'engine', iconName: 'database-search', title: 'Table input', lines: query },
    { role: 'write', iconName: 'list-checks', title: 'Result', lines: result },
  ].map((o, j) => d.box({ x: COL[j], y: y + 56, w: BW, h: BH, ...o }));
  d.arrow({ x1: b[0].r, y1: b[0].cy, x2: b[1].x - 3, y2: b[1].cy });
  d.arrow({ x1: b[1].r, y1: b[1].cy, x2: b[2].x - 3, y2: b[2].cy });
});

d.write(import.meta.url);
