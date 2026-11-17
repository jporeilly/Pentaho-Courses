// Review Scalability, Partitioning: the rule (remainder of the key)
// sends every row to exactly one partition, and rows with the same key
// to the same one, so each copy of Group by sees whole groups and the
// copies can run in parallel. Run: node partitioning-by-key.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const TONE = ['source', 'join', 'check']; // partition 0, 1, 2
const ROWS = [[3, 10], [4, 20], [5, 15], [3, 30], [4, 5], [6, 25]];
const part = (k) => k % 3;

const GAP = 16;
const heights = [0, 1, 2].map((p) => tableBoxHeight(ROWS.filter(([k]) => part(k) === p).length));
const total = heights.reduce((a, b) => a + b, 0) + 2 * GAP;
const top = 84;
const d = new Diagram(1000, top + total + 84);

d.panel({ x: 12, y: 12, w: 976, h: top + total + 60, role: 'engine', iconName: 'split', title: 'Partitioning: one copy of the step per partition', sub: 'every row lands in exactly one partition; rows with the same key always in the same one' });

const inH = tableBoxHeight(ROWS.length);
const mid = top + total / 2;
const input = d.tableBox({ x: 32, y: mid - inH / 2, w: 210, role: 'source', iconName: 'rows-3', title: 'Sales rows', sub: 'customer is the key', cols: ['customer', 'amount'], rows: ROWS.map(([k, a]) => ({ tone: TONE[part(k)], cells: [k, a] })) });

let y = top;
const copies = [0, 1, 2].map((p) => {
  const rows = ROWS.filter(([k]) => part(k) === p).map(([k, a]) => ({ tone: TONE[p], cells: [k, a] }));
  const b = d.tableBox({ x: 372, y, w: 236, role: 'engine', iconName: 'sigma', title: `Group by, copy ${p + 1}`, sub: `partition ${p}: customer mod 3 = ${p}`, cols: ['customer', 'amount'], rows });
  y += b.h + GAP;
  d.arrow({ x1: input.r, y1: input.cy + (p - 1) * 30, x2: b.x - 3, y2: b.cy, label: `mod 3 = ${p}` });
  return b;
});

const SUMS = [[3, 40, 0], [6, 25, 0], [4, 25, 1], [5, 15, 2]];
const oh = tableBoxHeight(SUMS.length);
const out = d.tableBox({ x: 736, y: mid - oh / 2, w: 232, role: 'write', iconName: 'sigma', title: 'Total per customer', sub: 'each group whole in one copy', cols: ['customer', 'total'], rows: SUMS.map(([k, s, p]) => ({ tone: TONE[p], cells: [k, s] })) });
copies.forEach((c, p) => d.arrow({ x1: c.r, y1: c.cy, x2: out.x - 3, y2: out.cy + (p - 1) * 30 }));

const fy = top + total + 30;
d.raw(`<text x="32" y="${fy}" font-size="12.5" fill="#334155">The copies run in parallel: on several CPU cores of one server (scaling up), or on the servers of a cluster (scaling out).</text>`);

d.write(import.meta.url);
