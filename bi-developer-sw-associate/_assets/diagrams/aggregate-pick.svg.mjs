// Aggregate Tables: which table each query reads. Mondrian takes the
// smallest aggregate that holds every level and measure the query needs,
// else the fact table. Proven on the rig 2026-11-12 (SQL from
// Miniature_Sales_AGG_2 for Territory, AGG_1 for Country); row counts
// from agg_tables.sql's last query.
// Run: node aggregate-pick.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 400);
const BW = 260, BH = 84;
const ROWS = [82, 186, 290];

d.panel({ x: 16, y: 16, w: 292, h: 376, role: 'tool', iconName: 'pencil-ruler', title: 'MDX Query', sub: 'Sales on columns, on rows:' });
d.panel({ x: 692, y: 16, w: 292, h: 376, role: 'store', iconName: 'database', title: 'SampleData', sub: 'the table the SQL reads' });

const Q = [
  ['Territory', ['[MARKETS.Markets]', '.[Territory].Members']],
  ['Country', ['[MARKETS.Markets]', '.[Country].Members']],
  ['State Province', ['below both aggregates\'', 'grain']],
];
const T = [
  ['Miniature_Sales_AGG_2', ['55 rows: Territory x Year', 'x Quarter x Status']],
  ['Miniature_Sales_AGG_1', ['129 rows: Line x', 'Territory x Country']],
  ['ORDERFACT', ['2,996 rows, joined to', 'its dimension tables']],
];
const WHY = [
  ['in both aggregates:', 'AGG_2 is the smaller'],
  ['only AGG_1', 'has Country'],
  ['in neither:', 'back to the fact table'],
];
ROWS.forEach((y, i) => {
  const q = d.box({ x: 32, y, w: BW, h: BH, role: 'tool', iconName: 'table', title: Q[i][0], lines: Q[i][1] });
  const t = d.box({ x: 708, y, w: BW, h: BH, role: i === 2 ? 'support' : 'store', iconName: i === 2 ? 'table-2' : 'layers', title: T[i][0], lines: T[i][1] });
  d.arrow({ x1: q.r, y1: q.cy, x2: t.x - 3, y2: t.cy, straight: true, label: WHY[i] });
});

d.write(import.meta.url);
