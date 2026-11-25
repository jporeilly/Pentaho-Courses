// Slowly changing dimensions, followed through one extract: Euro+
// Shopping Channel (customer 141) moves from Madrid to Barcelona, a
// type 2 change that adds a version, and each of its May orders finds
// the version valid on its own date; beside it, for contrast, La
// Rochelle Gifts' credit limit is overwritten in place, a type 1
// change. It sits in section 4, "Slowly Changing Dimensions", of
// 03-overview-of-dimensional-modeling/guide.md, after the two tables.
//
// Every fact comes from the course's lessons:
//   - 03-overview-of-dimensional-modeling, section 4: on 15 May 2005
//     Euro+ Shopping Channel (customer_number 141) moves from Madrid to
//     Barcelona. Type 2: customer_key 11, version 1, Madrid, date_from
//     1900-01-01, date_to closed at 2005-05-15; customer_key 123,
//     version 2, Barcelona, from 2005-05-15 to 2200-01-01. Orders placed
//     before 15 May keep pointing at the Madrid row, orders from 15 May
//     on at the Barcelona row. Type 1: La Rochelle Gifts,
//     customer_key 4, customer_number 119, credit_limit becomes
//     125000.00; the old value is gone. The columns of each table are
//     the ones that section's two tables show.
//   - 05-load-dimensions-with-slowly-changing-history: the old credit
//     limit, 118200.00 in the 30 April 2005 extract (the table of the
//     four changed rows), and the checkpoint after the 15 May extract
//     (key 4 keeps version 1; key 11 closed; key 123 added).
//   - 06-overview-of-loading-facts, section 2, and the end of part 5 of
//     lesson 05: an order of 13 May 2005 gets key 11 (Madrid), an order
//     of 31 May key 123 (Barcelona).
//   - 09-schedule-the-load-on-the-pentaho-server, part 6: those orders
//     are 10417 (13 May) and 10424 (31 May), and in mart_fact_sales they
//     carry customer_key 11 and 123.
//
// Run from this folder:   node scd-euro-plus-moves.svg.mjs
// It writes scd-euro-plus-moves.svg here and
// ../images/scd-euro-plus-moves.png at twice the size.
import { Diagram, ROLE, esc, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas: two panels stacked, type 2 on top (the story this page
// follows), type 1 underneath, then a legend.
const W = 1180; // wide enough for a 208px gap between the table and the orders
const d = new Diagram(W, 640);
const BW = 248, BH = 72; // the order boxes

// ── Panel A: type 2, a new version ─────────────────────────────────────
// Left: mart_dim_customer's two rows for customer 141. Right: the two May
// orders, each with an arrow to the version it finds.
const A = 16;
const hA = 56 + 176 + 16; // title strip with a sub line, the order boxes' column, padding
d.panel({ x: 16, y: A, w: W - 32, h: hA, role: 'support', iconName: 'history', title: 'Type 2, add a version: Euro+ Shopping Channel (141) moves on 15 May 2005', sub: 'city is a type 2 attribute: the Madrid row is closed and a Barcelona row with a new key starts the same day' });

// The table: lesson 03's type 2 columns, in its order. Amber: the
// version that was closed; green: the version that was added (the same
// row colours as the other courses' SCD diagrams).
const TX = 32, TW = 660;
const t2 = d.tableBox({
  x: TX, y: A + 72, w: TW, role: 'store', iconName: 'database', title: 'mart_dim_customer', sub: 'customer 141, after the 15 May extract',
  cols: ['customer_key', 'version', 'customer_number', 'city', 'date_from', 'date_to'],
  rows: [
    { tone: 'check', cells: ['11', '1', '141', 'Madrid', '1900-01-01', '2005-05-15'] },
    { tone: 'write', cells: ['123', '2', '141', 'Barcelona', '2005-05-15', '2200-01-01'] },
  ],
});
// The vertical middle of each table row, for the arrows: the kit draws
// a header row 56px under the box top, then 24px rows.
const rowMid = (i) => t2.y + 56 + 24 + i * 24 + 12;

// The two orders, stacked in a column at the right. Blue: rows read from
// the source.
const OX = W - 32 - BW;
const o1 = d.box({ x: OX, y: A + 64, w: BW, h: BH, role: 'source', iconName: 'receipt', title: 'Order 10417', lines: ['13 May 2005, before', 'the move'] });
const o2 = d.box({ x: OX, y: A + 64 + BH + 24, w: BW, h: BH, role: 'source', iconName: 'receipt', title: 'Order 10424', lines: ['31 May 2005, after', 'the move'] });
// Each order's arrow ends on the right edge of the row it finds, with
// the key and city it gets in a pill at the arrow's middle. The 208px
// gap holds the widest pill (about 131px), and the two arrows' middles
// are about 60px apart, so the pills clear each other too.
d.arrow({ x1: o1.x, y1: o1.cy, x2: t2.r + 3, y2: rowMid(0), label: 'key 11, Madrid' });
d.arrow({ x1: o2.x, y1: o2.cy, x2: t2.r + 3, y2: rowMid(1), label: 'key 123, Barcelona' });

// ── Panel B: type 1, an overwrite ──────────────────────────────────────
// The same row of mart_dim_customer before and after the 15 May extract,
// side by side, with one arrow between them: the key does not change.
const B = A + hA + 20;
const hB = 56 + tableBoxHeight(1) + 30;
d.panel({ x: 16, y: B, w: W - 32, h: hB, role: 'support', iconName: 'square-pen', title: 'Type 1, overwrite: La Rochelle Gifts (119) gets a new credit limit in the same extract', sub: 'credit_limit is a type 1 attribute: the old value is gone, for every period, and no new key is made' });
const cols1 = ['customer_key', 'customer_number', 'customer_name', 'credit_limit'];
const T1W = 488; // four columns of 114px each fit customer_number
// Before: blue, the row as the 30 April extract left it.
const b1 = d.tableBox({ x: 32, y: B + 64, w: T1W, role: 'store', iconName: 'database', title: 'mart_dim_customer', sub: 'after the 30 April extract', cols: cols1, rows: [{ tone: 'source', cells: ['4', '119', 'La Rochelle Gifts', '118200.00'] }] });
// After: amber, the same row with its value replaced in place.
const a1 = d.tableBox({ x: W - 32 - T1W, y: B + 64, w: T1W, role: 'store', iconName: 'database', title: 'mart_dim_customer', sub: 'after the 15 May extract', cols: cols1, rows: [{ tone: 'check', cells: ['4', '119', 'La Rochelle Gifts', '125000.00'] }] });
// The overwrite, from one table's row to the other's. The pill sits in
// the gap between the two tables.
d.arrow({ x1: b1.r, y1: b1.cy, x2: a1.x - 3, y2: a1.cy, straight: true, label: ['UPDATE', 'in place'] });

// ── Legend ─────────────────────────────────────────────────────────────
// One swatch per row colour, left to right along the bottom; each
// entry's x is laid out from the previous text's length (about 6.1px a
// character at 12px).
const L = B + hB + 16;
const legend = [
  ['check', 'a version closed, or a value overwritten'],
  ['write', 'a new version, with a new key'],
  ['source', 'the row before the change'],
];
let lx = 32;
legend.forEach(([tone, text]) => {
  const t = ROLE[tone];
  d.raw(`<rect x="${lx}" y="${L + 2}" width="22" height="16" rx="4" fill="${t.fill}" stroke="${t.stroke}" stroke-width="0.8"/>`);
  d.raw(`<text x="${lx + 30}" y="${L + 15}" font-size="12" fill="#334155">${esc(text)}</text>`);
  lx += 30 + text.length * 6.1 + 28;
});
// Size the canvas to what was drawn: the legend row plus a margin.
d.h = L + 36;

d.write(import.meta.url);
