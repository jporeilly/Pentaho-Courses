// Type 2 history in dim_customer: the table's rows for customer C001
// (and a few neighbours) after the first load and after C001 moves from
// region NW to NE and the transformation runs again. It sits near the
// top of 04-track-history-scd/guide.md, under the lab's canvas note.
//
// Every fact comes from 04-track-history-scd/guide.md and its
// screenshots:
//   - The columns are the lab's own, in the order of its SELECT:
//     customer_tk, customer_id, customer_name, region_code, version,
//     date_from, date_to (the CREATE TABLE in step 2, the query in
//     step 3).
//   - First load: every customer at version 1 with open-ended validity,
//     21 rows: the 20 customers plus the technical "unknown" row,
//     customer_tk 0, that the step inserts itself. The DBeaver
//     screenshot shows customer_tk 1 C001 Aiden Marsh NW, 2 C002
//     Beatriz Olufemi NW, 3 C003 Carlos Reyes NE.
//   - The edit: in customers.json, C001 (Aiden Marsh) "region_code":
//     "NW" becomes "NE"; then the transformation runs again.
//   - Second run: 22 rows. C001 has two rows: version 1 (NW) with its
//     validity window closed (date_to set to the run time), and
//     version 2 (NE) open-ended, its date_from set to the same instant,
//     with its own customer_tk (21 in the screenshot, listed straight
//     after version 1 because the query orders by customer_id,
//     version). Every other customer is untouched.
// The lesson gives no literal dates, so the date cells say "open" for
// an open-ended window and "run 2" for the second run's time.
//
// Run from this folder:   node scd2-before-after.svg.mjs
// It writes scd2-before-after.svg here and
// ../images/scd2-before-after.png at twice the size.
import { Diagram, ROLE, esc, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas: two panels stacked, each holding one full-width table box, so
// the same row of the table sits in the same column before and after.
// Seven equal columns of about 130px each fit the longest header,
// customer_name.
const W = 984;
const TW = 920; // the table box's width; 32px from each panel edge
const X = 32;

// The table's columns, as the lab's SELECT lists them.
const cols = ['customer_tk', 'customer_id', 'customer_name', 'region_code', 'version', 'date_from', 'date_to'];

// Rows shared by both tables. Tone names the role a row is colored by:
// stone for the step's own "unknown" row, white for an untouched row.
// The lesson shows only the unknown row's key and its empty (null)
// customer columns, so its version and dates are left blank rather than
// guessed.
const unknown = { tone: 'off', cells: ['0', '(null)', '(null)', '(null)', '', '', ''] };
const others = [
  { tone: 'result', cells: ['2', 'C002', 'Beatriz Olufemi', 'NW', '1', 'open', 'open'] },
  { tone: 'result', cells: ['3', 'C003', 'Carlos Reyes', 'NE', '1', 'open', 'open'] },
  { tone: 'result', cells: ['4 to 20', 'C004 to C020', '17 more', '…', '1', 'open', 'open'] },
];

// Before: C001 at version 1, open-ended, blue (the row this story follows).
const before = [unknown, { tone: 'source', cells: ['1', 'C001', 'Aiden Marsh', 'NW', '1', 'open', 'open'] }, ...others];
// After: version 1 closed (amber: its window now ends) and version 2
// inserted (green: a new row), in the query's order, customer_id then
// version, so version 2 sits straight under version 1.
const after = [
  unknown,
  { tone: 'check', cells: ['1', 'C001', 'Aiden Marsh', 'NW', '1', 'open', 'run 2'] },
  { tone: 'write', cells: ['21', 'C001', 'Aiden Marsh', 'NE', '2', 'run 2', 'open'] },
  ...others,
];

// Vertical layout, top to bottom: panel A, a 64px gap for the arrow and
// its label, panel B, then the legend.
const HEAD = 56; // a panel's title strip with a sub line, plus padding
const hA = HEAD + tableBoxHeight(before.length) + 20;
const hB = HEAD + tableBoxHeight(after.length) + 20;
const A = 16, GAP = 64, B = A + hA + GAP, L = B + hB + 16; // L: legend row
const d = new Diagram(W, L + 36);

// ── Before: after the first load ──────────────────────────────────────
const pa = d.panel({ x: 16, y: A, w: W - 32, h: hA, role: 'support', iconName: 'database', title: 'After the first run: 21 rows', sub: 'Every customer at version 1 with an open-ended window, plus the "unknown" row (customer_tk 0)' });
const ta = d.tableBox({ x: X, y: A + HEAD, w: TW, role: 'store', iconName: 'database', title: 'dim_customer', sub: 'ORDER BY customer_id, version', cols, rows: before });

// ── The change, between the panels ───────────────────────────────────
// A straight arrow down the middle of the gap, its label in a pill.
d.arrow({ x1: W / 2, y1: pa.b + 4, x2: W / 2, y2: B - 4, straight: true, label: 'In customers.json, C001 moves from NW to NE; run the transformation again' });

// ── After: after the second run ───────────────────────────────────────
d.panel({ x: 16, y: B, w: W - 32, h: hB, role: 'support', iconName: 'history', title: 'After the second run: 22 rows', sub: "C001's version 1 is closed and version 2 is added; every other customer is untouched" });
d.tableBox({ x: X, y: B + HEAD, w: TW, role: 'store', iconName: 'database', title: 'dim_customer', sub: 'ORDER BY customer_id, version', cols, rows: after });

// ── Legend ────────────────────────────────────────────────────────────
// One swatch per row color, in the table's own row style, left to right
// along the bottom; each entry's x is laid out from the previous text's
// length (about 6.1px a character at 12px).
const legend = [
  ['source', 'C001 before the change'],
  ['check', 'the old version, closed'],
  ['write', 'the new version'],
  ['result', 'untouched'],
  ['off', 'the step\'s "unknown" row'],
];
let lx = X;
legend.forEach(([tone, text]) => {
  const t = ROLE[tone];
  d.raw(`<rect x="${lx}" y="${L + 2}" width="22" height="16" rx="4" fill="${t.fill}" stroke="${t.stroke}" stroke-width="0.8"/>`);
  d.raw(`<text x="${lx + 30}" y="${L + 15}" font-size="12" fill="#334155">${esc(text)}</text>`);
  lx += 30 + text.length * 6.1 + 28;
});

d.write(import.meta.url);
