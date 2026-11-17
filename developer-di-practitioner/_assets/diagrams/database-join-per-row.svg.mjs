// Review Joins, Database join: one query per incoming row, the row's
// values filling the ? markers, and every row the query returns added to
// the stream. Values from the Database Join workshop (3 searches, 5 rows
// out). Run: node database-join-per-row.svg.mjs
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 568);
const SEARCH = [['Aston Martin', '90', 'source'], ['Ford Falcon', '70', 'off'], ['Corvette', '70', 'check']];

d.panel({ x: 12, y: 12, w: 976, h: 544, role: 'engine', iconName: 'database-search', title: 'Database join', sub: "one query per incoming row: the row's values fill the ? markers" });

const grid = d.tableBox({ x: 32, y: 80, w: 220, role: 'source', iconName: 'grid-3x3', title: 'some conditions', sub: 'Data grid: 3 search rows', cols: ['prod', 'max_price'], rows: SEARCH.map(([p, m, tone]) => ({ tone, cells: [p, m] })) });
const join = d.box({ x: 330, y: grid.cy - 50, w: 220, h: 100, role: 'engine', iconName: 'database-search', title: 'Database join', lines: ['one prepared statement,', 'run once for each row', 'Outer join? selected'] });
const db = d.box({ x: 720, y: grid.cy - 50, w: 248, h: 100, role: 'store', iconName: 'database', title: 'PRODUCTS', lines: ['WHERE PRODUCTNAME', "  LIKE concat('%',?,'%')", 'AND BUYPRICE < ?'] });

d.arrow({ x1: grid.r, y1: grid.cy, x2: join.x - 3, y2: join.cy, label: '3 rows' });
d.arrow({ x1: join.r, y1: join.cy - 26, x2: db.x - 3, y2: db.cy - 26, label: '? ← prod, max_price' , straight: true });
d.arrow({ x1: db.x, y1: db.cy + 26, x2: join.r + 3, y2: join.cy + 26, label: 'matching rows', straight: true, dashed: true });

const OUT = [
  ['Aston Martin, 90', '1965 Aston Martin DB5', 'source'],
  ['Ford Falcon, 70', '<null>', 'off'],
  ['Corvette, 70', '1957 Corvette Convertible', 'check'],
  ['Corvette, 70', '1958 Chevy Corvette Limited Edition', 'check'],
  ['Corvette, 70', '2002 Chevy Corvette', 'check'],
];
const oy = join.y + join.h + 76;
const out = d.tableBox({ x: 32, y: oy, w: 536, role: 'write', iconName: 'rows-3', title: 'Each search row with what it found', sub: '3 rows in, 5 rows out', cols: ['search row', 'PRODUCTNAME'], rows: OUT.map(([s, p, tone]) => ({ tone, cells: [s, p] })) });
d.arrow({ x1: join.cx, y1: join.y + join.h, x2: join.cx, y2: out.y - 3, label: '5 rows', vertical: true });

const note = d.box({ x: 610, y: out.y + (out.h - 96) / 2, w: 358, h: 96, role: 'result', title: 'One row in, any number out', lines: ['Aston Martin: one match, one row', 'Ford Falcon: no match, kept', 'with nulls (Outer join?)', 'Corvette: three matches, three rows'] });

const fy = out.y + tableBoxHeight(OUT.length) + 30;
d.raw(`<text x="32" y="${fy}" font-size="12.5" fill="#334155">Each row is a round trip to the database: right for a few driving rows. For large volumes, put the join in the SQL or use Merge join.</text>`);

d.write(import.meta.url);
