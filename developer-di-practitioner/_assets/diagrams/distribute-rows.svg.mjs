// Key Concepts: a step with two outgoing hops in Distribute mode deals
// its rows out in turn (round robin). Its pair is copy-rows.svg.mjs.
// Run: node distribute-rows.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(720, 400);
const rows = (ids, tone) => ids.map((n) => ({ tone: tone(n), cells: [`row ${n}`] }));
// Odd rows go to the first step, even rows to the second, colored so the
// reader can follow each row.
const turn = (n) => (n % 2 ? 'source' : 'check');

d.panel({ x: 12, y: 12, w: 696, h: 376, role: 'engine', iconName: 'split', title: 'Distribute rows', sub: 'rows are dealt out in turn (round robin): 50% to each step' });

const th = tableBoxHeight(4), t2 = tableBoxHeight(2);
const a = d.tableBox({ x: 470, y: 70, w: 210, role: 'write', iconName: 'circle-dashed', title: 'Dummy (do nothing)', sub: 'first step: rows 1 and 3', cols: ['rows'], rows: rows([1, 3], turn) });
const b = d.tableBox({ x: 470, y: 70 + t2 + 30, w: 210, role: 'write', iconName: 'circle-dashed', title: 'Dummy (do nothing)', sub: 'second step: rows 2 and 4', cols: ['rows'], rows: rows([2, 4], turn) });
const mid = (70 + 70 + t2 + 30 + t2) / 2;
const g = d.tableBox({ x: 40, y: mid - th / 2, w: 200, role: 'source', iconName: 'rows-3', title: 'Generate Rows', sub: 'writes 4 rows', cols: ['rows'], rows: rows([1, 2, 3, 4], turn) });

d.arrow({ x1: g.r, y1: g.cy - 16, x2: a.x - 3, y2: a.cy, label: ['rows 1, 3'] });
d.arrow({ x1: g.r, y1: g.cy + 16, x2: b.x - 3, y2: b.cy, label: ['rows 2, 4'] });

d.write(import.meta.url);
