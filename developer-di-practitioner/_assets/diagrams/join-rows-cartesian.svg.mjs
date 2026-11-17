// Review Joins, Join rows: every row of one input meets every row of the
// other (a cartesian product), with an optional condition that keeps
// only the pairs passing it. Names from the Join Rows workshop, cut to
// 3 x 2 so every output row fits. Run: node join-rows-cartesian.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 500);
const FIRST = [['Oliver', 'source'], ['Jack', 'join'], ['Harry', 'store']];
const MIDDLE = ['James', 'John'];

d.panel({ x: 12, y: 12, w: 976, h: 476, role: 'join', iconName: 'combine', title: 'Join rows (cartesian product)', sub: 'every row of one input meets every row of the other' });

const y0 = 76;
const first = d.tableBox({ x: 32, y: y0, w: 210, role: 'source', iconName: 'grid-3x3', title: 'first name', sub: 'Data grid: 3 rows', cols: ['first_name'], rows: FIRST.map(([n, tone]) => ({ tone, cells: [n] })) });
const middle = d.tableBox({ x: 32, y: y0 + tableBoxHeight(3) + 30, w: 210, role: 'check', iconName: 'grid-3x3', title: 'middle name', sub: 'Data grid: 2 rows', cols: ['middle_name'], rows: MIDDLE.map((n) => ({ tone: 'check', cells: [n] })) });

const cy = (first.y + middle.y + middle.h) / 2;
const join = d.box({ x: 380, y: cy - 60, w: 240, h: 120, role: 'engine', iconName: 'combine', title: 'Join rows', lines: ['pairs each row of one input', 'with every row of the other;', 'a condition, if set, keeps', 'only the pairs that pass'] });

const outRows = FIRST.flatMap(([f, tone]) => MIDDLE.map((m) => ({ tone, cells: [f, m] })));
const oh = tableBoxHeight(outRows.length);
const out = d.tableBox({ x: 690, y: cy - oh / 2, w: 278, role: 'write', iconName: 'rows-3', title: 'Every pair', sub: '3 × 2 = 6 rows', cols: ['first_name', 'middle_name'], rows: outRows });

d.arrow({ x1: first.r, y1: first.cy, x2: join.x - 3, y2: join.cy - 22, label: '3 rows' });
d.arrow({ x1: middle.r, y1: middle.cy, x2: join.x - 3, y2: join.cy + 22, label: ['2 rows,', 'held in memory'] });
d.arrow({ x1: join.r, y1: join.cy, x2: out.x - 3, y2: out.cy, label: '6 rows' });

const fy = middle.y + middle.h + 32;
d.raw(`<text x="32" y="${fy}" font-size="12.5" fill="#334155">In the workshop, 10 first names × 10 middle names give 100 rows. The output is the product of the input sizes,</text>`);
d.raw(`<text x="32" y="${fy + 18}" font-size="12.5" fill="#334155">so keep the side held in memory small and filter early.</text>`);

d.write(import.meta.url);
