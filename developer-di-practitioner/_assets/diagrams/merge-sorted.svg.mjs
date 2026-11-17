// Review Merge: Sorted merge, the same rows interleaved in id order.
// The rows are colored by the input they came from: blue the first,
// amber the second. Run: node merge-sorted.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(832, 340);
const TW = 200;
const A = (id, v) => ({ cells: [id, v], tone: 'tool' });
const B = (id, v) => ({ cells: [id, v], tone: 'check' });
const COLS = ['id', 'value'];

const h = d.tableBox({ x: 16, y: 16, w: TW, role: 'tool', iconName: 'rows-3', title: 'First input', sub: 'sorted on id', cols: COLS, rows: [A('1', 'A'), A('4', 'D')] });
const t = d.tableBox({ x: 16, y: h.b + 24, w: TW, role: 'check', iconName: 'rows-3', title: 'Second input', sub: 'sorted on id', cols: COLS, rows: [B('2', 'B'), B('3', 'C')] });
const mid = (h.y + t.b) / 2;
const s = d.box({ x: 296, y: mid - 48, w: 240, h: 96, role: 'join', iconName: 'arrow-down-0-1', title: 'Sorted merge', lines: ['compares the next id', 'of each input and', 'outputs the lower one'] });
const o = d.tableBox({ x: 616, y: mid - tableBoxHeight(4) / 2, w: TW, role: 'result', iconName: 'list-checks', title: 'Output', sub: 'still sorted', cols: COLS, rows: [A('1', 'A'), B('2', 'B'), B('3', 'C'), A('4', 'D')] });

d.arrow({ x1: h.r, y1: h.cy, x2: s.x - 3, y2: s.cy - 14 });
d.arrow({ x1: t.r, y1: t.cy, x2: s.x - 3, y2: s.cy + 14 });
d.arrow({ x1: s.r, y1: s.cy, x2: o.x - 3, y2: s.cy });

d.write(import.meta.url);
