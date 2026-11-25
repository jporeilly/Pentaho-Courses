// 04: one day, 6 January 2003, through tr_dim_date.ktr. Facts: the step
// names, settings and checkpoints of 04-build-a-date-dimension, and the
// row for 20030106 in 03, section 3. Run: node date-one-day.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const BW = 256, BH = 66, PITCH = 112, TOP = 66;
const d = new Diagram(944, TOP + 7 * PITCH - 46 + 28);
d.panel({ x: 16, y: 16, w: d.w - 32, h: d.h - 32, role: 'support', iconName: 'calendar', title: 'tr_dim_date.ktr: one day, 6 January 2003, step by step' });
const X = 36;
const S = [
  ['source', 'rows-3', 'gr-days', ['Generate Rows: 1,096 rows,', 'all the same']],
  ['engine', 'list-plus', 'seq-day_offset', ['Add sequence: numbers', 'the rows from 0']],
  ['engine', 'calculator', 'calc-date_parts', ['Calculator: the date,', 'its parts and its key']],
  ['engine', 'arrow-right-left', 'vm-quarter_name', ['Value mapper: 1 to 4', 'become QTR1 to QTR4']],
  ['engine', 'arrow-right-left', 'vm-month_name', ['Value mapper: 1 to 12', 'become Jan to Dec']],
  ['engine', 'list-x', 'sv-drop_helpers', ['Select values: removes the', 'two working fields']],
  ['write', 'database', 'to-dim_date', ['Table output: truncates,', 'then inserts']],
].map(([role, iconName, title, lines], i) => d.box({ x: X, y: TOP + i * PITCH, w: BW, h: BH, role, iconName, title, lines }));
const P = ['start_date 2003-01-01', '+ day_offset 5', '+ the_date, its parts, date_key', '+ quarter_name QTR1', '+ month_name Jan', '- start_date, day_offset'];
P.forEach((label, i) => d.arrow({ x1: S[i].cx, y1: S[i].b, x2: S[i].cx, y2: S[i + 1].y - 3, straight: true, label }));
// What calc-date_parts makes of the row, and the row as written.
const w = 480, x = 432;
const calc = d.tableBox({ x, y: TOP + PITCH - 8, w, role: 'engine', iconName: 'calculator', title: 'What calc-date_parts adds', sub: 'the working fields c10000 and the rest never leave the step', cols: ['field', 'how', 'value'], rows: [
  ['the_date', 'start_date + 5 days', '2003-01-06'],
  ['year_id, quarter_id', 'parts of the date', '2003, 1'],
  ['month_id, day_of_month', 'parts of the date', '1, 6'],
  ['day_of_week', 'Sunday is 1', '2, a Monday'],
  ['date_key', '2003 x 10000 + 1 x 100 + 6', '20030106'],
].map((cells) => ({ tone: 'source', cells })) });
d.arrow({ x1: S[2].r, y1: S[2].cy, x2: x - 3, y2: S[2].cy, straight: true });
const tb = d.tableBox({ x, y: S[6].b - 152 - 10, w, role: 'store', iconName: 'calendar', title: 'mart_dim_date', sub: '1,096 rows, from 20030101 to 20051231', cols: ['date_key', 'the_date', 'quarter', 'month'], rows: [
  { tone: 'result', cells: ['20030101', '2003-01-01', 'QTR1', 'Jan'] },
  { tone: 'write', cells: ['20030106', '2003-01-06', 'QTR1', 'Jan'] },
  { tone: 'result', cells: ['20051231', '2005-12-31', 'QTR4', 'Dec'] },
] });
d.arrow({ x1: S[6].r, y1: S[6].cy, x2: x - 3, y2: S[6].cy, straight: true, label: 'insert' });
d.write(import.meta.url);
