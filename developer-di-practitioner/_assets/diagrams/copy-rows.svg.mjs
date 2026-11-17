// Key Concepts: a step with two outgoing hops in Copy mode sends every
// row down both. Its pair is distribute-rows.svg.mjs (same layout).
// Run: node copy-rows.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(720, 500);
const rows = (ids) => ids.map((n) => ({ tone: 'source', cells: [`row ${n}`] }));

d.panel({ x: 12, y: 12, w: 696, h: 476, role: 'engine', iconName: 'copy', title: 'Copy rows', sub: 'every row goes down every hop: 100% to each step' });

const th = tableBoxHeight(4);
const a = d.tableBox({ x: 470, y: 70, w: 210, role: 'write', iconName: 'circle-dashed', title: 'Dummy (do nothing)', sub: 'first step: all 4 rows', cols: ['rows'], rows: rows([1, 2, 3, 4]) });
const b = d.tableBox({ x: 470, y: 70 + th + 22, w: 210, role: 'write', iconName: 'circle-dashed', title: 'Dummy (do nothing)', sub: 'second step: all 4 rows', cols: ['rows'], rows: rows([1, 2, 3, 4]) });
const mid = (a.cy + b.cy) / 2;
const g = d.tableBox({ x: 40, y: mid - th / 2, w: 200, role: 'source', iconName: 'rows-3', title: 'Generate Rows', sub: 'writes 4 rows', cols: ['rows'], rows: rows([1, 2, 3, 4]) });

d.arrow({ x1: g.r, y1: g.cy - 16, x2: a.x - 3, y2: a.cy, label: ['copy:', 'rows 1, 2, 3, 4'] });
d.arrow({ x1: g.r, y1: g.cy + 16, x2: b.x - 3, y2: b.cy, label: ['copy:', 'rows 1, 2, 3, 4'] });

d.write(import.meta.url);
