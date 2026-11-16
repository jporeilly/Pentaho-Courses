// Lab 2 map: what the learner builds in Build the Pipeline Yourself,
// numbered in the order the lesson adds each step, and what the run
// shows. It sits near the top of 02-build-the-pipeline/guide.md, after
// the "Part 1: Onboard and filter sales data" screenshot and before the
// steps, as a map of what the learner is about to build.
//
// Every fact comes from 02-build-the-pipeline/guide.md and its lab files
// (files/check_keys.ktr, the solution, and files/sales_20260101.csv):
//   The transformation:
//     - Step 1: File > New > Transformation, saved as
//       C:\Workshop\pdi-2hr\02-see-it-work\02-build-the-pipeline\check_keys.ktr.
//     - The data file sales_20260101.csv is in that same folder (the
//       "Get the data file first" note); 40 orders after a header line
//       (the file; the Preview rows screenshot: "all 40 rows").
//   Box 1, Read sales (step 2): Text file input, Step name Read sales;
//     File tab: sales_20260101.csv added to Selected files; Content tab:
//     Separator comma, Header with 1 header line, Format mixed,
//     Encoding UTF-8; Fields tab, Get Fields: seven columns, order_id
//     Integer, order_date Date yyyy-MM-dd, customer_id String,
//     product_id String, qty Integer, unit_price Number, discount_pct
//     Integer (check_keys.ktr's fields; the Fields screenshot's alt
//     text: "seven detected columns, order_date typed as Date with
//     format yyyy-MM-dd").
//   Box 2, Keys present? (step 3): Filter rows, Step name Keys present?;
//     customer_id IS NOT NULL AND product_id IS NOT NULL; hop from Read
//     sales.
//   Box 3, Rejects for source team (step 4, items 1 to 5): Text file
//     output on the FALSE branch of Keys present?; Filename
//     C:\Workshop\pdi-2hr\out\rejects, Extension txt (added by Pentaho
//     Data Integration); Get Fields on its Fields tab. check_keys.ktr
//     adds separator ; and a header line, and creates the out folder.
//   Box 4, Valid rows (step 4, item 6): Dummy (do nothing) on the TRUE
//     branch, Step name Valid rows.
//   Box 5, the run (step 5): F9, Run; Execution Results > Step Metrics:
//     40 rows read, 37 valid, 3 written to the reject file (the Step
//     Metrics screenshot: "Read sales writes 40, Valid rows reads 37
//     and Rejects for source team 3, all Finished"). Then open
//     C:\Workshop\pdi-2hr\out\rejects.txt: the three bad rows, for the
//     source system's owner. The checklist: 40 rows read, 3 rows in the
//     reject output, no errors (every step a green check mark).
//
// Colors and icons follow this folder's README and the
// retailer-pipeline-target diagram: blue the file and the step that
// reads it (file-text), amber the check (split, Filter rows), red the
// rejects (file-output, Text file output), white a result (rows-3 Valid
// rows, circle-check the checklist), green a file written (file-text).
// `table` is the Step Metrics grid, new here and added to the README.
//
// Run from this folder:   node build-the-pipeline.svg.mjs
// It writes build-the-pipeline.svg here and
// ../images/build-the-pipeline.png at twice the size.
import { Diagram, ROLE, esc, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: four columns. Column 0 is wider (272px) to fit Read
// sales's field table and its sub line, and column 1 (248px) the
// filter's condition; the gap between the filter and
// the end steps is 64px so the true and false pills fit.
const W = 1164;
const BH = 96; // three lines under a title
const C0 = { x: 32, w: 272 }, C1 = { x: 344, w: 248 }, C2 = { x: 656, w: 232 }, C3 = { x: 920, w: 212 };
const at = (c, cy, o) => d.box({ x: c.x, y: cy - BH / 2, w: c.w, h: BH, ...o });

// The field list Get Fields fills in, as check_keys.ktr has it.
const fields = [
  ['order_id', 'Integer'], ['order_date', 'Date yyyy-MM-dd'], ['customer_id', 'String'],
  ['product_id', 'String'], ['qty', 'Integer'], ['unit_price', 'Number'], ['discount_pct', 'Integer'],
];

// Vertical layout. Panel A: its two-line title strip, the data file in
// column 0, then Read sales's table under it. Panel B, below: the run.
const PA = 16;
const FY = PA + 78; // the data file's top (room for a number badge)
const RY = FY + 72 + 36; // Read sales's top, under the file
const RH = tableBoxHeight(fields.length);
const HA = RY + RH + 20 - PA;
const PB = PA + HA + 16;
const MH = tableBoxHeight(3);
const HB = 78 + MH + 20;
const d = new Diagram(W, PB + HB + 16);

// A number badge: the order the lesson builds the box in, a dark disc
// on the box's top-left corner, clear of its icon disc and title.
const num = (b, n) => {
  d.raw(`<circle cx="${b.x + 2}" cy="${b.y + 2}" r="12" fill="#0f172a" stroke="#ffffff" stroke-width="1.5"/>`);
  d.raw(`<text x="${b.x + 2}" y="${b.y + 6.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">${n}</text>`);
};

// ── Panel A: check_keys.ktr, the transformation you build ─────────────
d.panel({ x: 16, y: PA, w: W - 32, h: HA, role: 'support', iconName: 'shuffle', title: 'check_keys.ktr: what you build, numbered in the order you build it', sub: 'Saved in C:\\Workshop\\pdi-2hr\\02-see-it-work\\02-build-the-pipeline\\, beside sales_20260101.csv' });

// The data file, then box 1: Read sales, with the fields Get Fields
// detects (blue rows: the columns as read).
const file = d.box({ x: C0.x, y: FY, w: C0.w, h: 72, role: 'source', iconName: 'file-text', title: 'sales_20260101.csv', lines: ['40 orders after a header line'] });
const read = d.tableBox({ x: C0.x, y: RY, w: C0.w, role: 'source', iconName: 'file-text', title: 'Read sales', sub: 'Text file input: comma, 1 header line', cols: ['field (Get Fields)', 'type'], rows: fields.map((f) => ({ tone: 'source', cells: f })) });
d.arrow({ x1: file.cx, y1: file.b, x2: read.cx, y2: read.y - 3, straight: true });

// Box 2: Keys present?, level with the middle of Read sales.
const keys = at(C1, read.cy, { role: 'check', iconName: 'split', title: 'Keys present?', lines: ['Filter rows:', 'customer_id IS NOT NULL', 'AND product_id IS NOT NULL'] });
d.arrow({ x1: read.r, y1: keys.cy, x2: keys.x - 3, y2: keys.cy });

// Boxes 3 and 4: the false branch (dashed) down to the rejects file
// step, built first; the true branch up to Valid rows, built last.
const okY = read.cy - 92, badY = read.cy + 92;
const ok = at(C2, okY, { role: 'result', iconName: 'rows-3', title: 'Valid rows', lines: ['Dummy (do nothing):', 'ends the 37 good rows'] });
const rej = at(C2, badY, { role: 'reject', iconName: 'file-output', title: 'Rejects for source team', lines: ['Text file output:', 'C:\\Workshop\\pdi-2hr\\out\\', 'rejects, extension txt'] });
d.arrow({ x1: keys.r, y1: keys.cy - 14, x2: ok.x - 3, y2: ok.cy, label: 'TRUE' });
d.arrow({ x1: keys.r, y1: keys.cy + 14, x2: rej.x - 3, y2: rej.cy, dashed: true, label: 'FALSE' });

// What the rejects step writes: the file you open after the run.
const out = at(C3, badY, { role: 'write', iconName: 'file-text', title: 'rejects.txt', lines: ['the 3 bad rows plus a', 'header line, separator ;'] });
d.arrow({ x1: rej.r, y1: rej.cy, x2: out.x - 3, y2: out.cy });

num(read, 1);
num(keys, 2);
num(rej, 3);
num(ok, 4);

// ── Panel B: box 5, the run ──────────────────────────────────────────
// The Step Metrics grid after F9 > Run, one row per step the lesson
// counts, colored as the boxes above; beside it, the lesson's checklist.
d.panel({ x: 16, y: PB, w: W - 32, h: HB, role: 'support', iconName: 'play', title: 'Run it: F9, then Run, then Execution Results > Step Metrics', sub: 'The engine runs every step at once; the grid fills in as the rows flow' });
const met = d.tableBox({ x: 32, y: PB + 78, w: 640, role: 'result', iconName: 'table', title: 'Step Metrics', sub: '40 read, 37 valid, 3 rejects', cols: ['Step name', 'Rows', 'Status'], rows: [
  { tone: 'source', cells: ['Read sales', '40 written', 'Finished'] },
  { tone: 'result', cells: ['Valid rows', '37 read', 'Finished'] },
  { tone: 'reject', cells: ['Rejects for source team', '3 to rejects.txt', 'Finished'] },
] });
num(met, 5);
const chk = d.box({ x: 712, y: met.cy - BH / 2, w: 420, h: BH, role: 'result', iconName: 'circle-check', title: 'Check the run', lines: ['40 rows read from the sales file', '3 rows in the reject output', 'no errors: every step shows a green check'] });
d.arrow({ x1: met.r, y1: met.cy, x2: chk.x - 3, y2: chk.cy, straight: true });

d.write(import.meta.url);
