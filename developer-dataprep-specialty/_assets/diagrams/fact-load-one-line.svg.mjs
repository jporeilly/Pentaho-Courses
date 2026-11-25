// One order line through the fact load: the first row of the extract
// runs down tr_fact_sales.ktr's six steps, each lookup swapping a
// natural key for a surrogate key from its dimension, key 0 standing in
// when a lookup finds nothing, then the Calculator and Insert / Update.
// It replaces the ASCII sketch under "What you build" in
// 07-load-the-fact-table/guide.md; the idea is from
// 06-overview-of-loading-facts.
//
// Every fact comes from the course's lessons:
//   - 07-load-the-fact-table: the step names and their order,
//     csvi-order_lines (CSV file input, ${ORDER_FILE}), dbl-dim_date
//     (Database lookup, cached, Load all data from table, the_date =
//     order_date, returns date_key, default 0), dlu-customer_key
//     (Dimension lookup/update with Update the dimension? cleared,
//     customer_number, Stream Datefield order_date between date_from and
//     date_to), dbl-dim_product (Database lookup, cached, product_code,
//     returns product_key, default 0), calc-sales_amount (Calculator,
//     price_each A * B quantity_ordered), iu-fact_sales (Insert / Update
//     on mart_fact_sales keyed on order_number and order_line_number, commit
//     size 500). The first row, from the part 2 and part 5 checkpoints:
//     order 10100, line 1, 2003/01/06, Shipped, customer 363, product
//     S24_3969, 49 at 34.47; date_key 20030106, customer_key 86,
//     product_key 80. The part 6 checkpoints: 2,867 lines, no row with
//     an unknown key, and still 2,867 after a second run. The
//     lookup-mode note: a customer with no version returns key 0, the
//     unknown member, and the row carries on.
//   - 06-overview-of-loading-facts, section 1: the same line's
//     sales_amount, 1689.03 (49 x 34.47); section 3: key 0 is each
//     dimension's unknown member, so a fact row is never dropped; the
//     date and product lookups return 0 as their default.
//   - Row counts of the dimensions: mart_dim_date 1,096 (03, section 3),
//     mart_dim_customer 125 after both extracts and mart_dim_product 111
//     (05-load-dimensions-with-slowly-changing-history checkpoints).
//
// Run from this folder:   node fact-load-one-line.svg.mjs
// It writes fact-load-one-line.svg here and
// ../images/fact-load-one-line.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid. Column A holds the six steps, top to bottom; column B
// the tables they read or write, each beside its step; column C the
// unknown member, beside the middle lookup. The 260px gap between A and
// B leaves room for a two-line pill naming each lookup's match (the
// widest is about 232px); the 64px gaps between steps leave room for a pill on each vertical hop,
// saying what the row carries from there on.
const BW = 248, BH = 72;
const XA = 32, XB = XA + BW + 260, XC = XB + BW + 120;
const GAP = 64; // between steps: a two-line pill (40px) plus room for the arrow
const TOP = 72, PITCH = BH + GAP;
const d = new Diagram(XC + BW + 32, TOP + 6 * PITCH - GAP + 24);

// A step in column A, in row `i` (0 to 5).
const step = (i, o) => d.box({ x: XA, y: TOP + i * PITCH, w: BW, h: BH, ...o });
// A table in column B, beside row `i`.
const table = (i, o) => d.box({ x: XB, y: TOP + i * PITCH, w: BW, h: BH, ...o });

// ── The panel ──────────────────────────────────────────────────────────
d.panel({ x: 16, y: 16, w: d.w - 32, h: d.h - 32, role: 'support', iconName: 'shuffle', title: 'tr_fact_sales.ktr: the first order line, step by step' });

// ── Column A: the six steps, in hop order ──────────────────────────────
// Blue: the file read. Teal: the three lookups, which enrich the row.
// Violet: the Calculator. Green: the write.
const csv = step(0, { role: 'source', iconName: 'file-text', title: 'csvi-order_lines', lines: ['CSV file input:', '${ORDER_FILE}, 2,867 lines'] });
const ldt = step(1, { role: 'join', iconName: 'merge', title: 'dbl-dim_date', lines: ['Database lookup, cached:', 'order_date to date_key'] });
const lcu = step(2, { role: 'join', iconName: 'history', title: 'dlu-customer_key', lines: ['Dimension lookup/update,', 'lookup mode only'] });
const lpr = step(3, { role: 'join', iconName: 'merge', title: 'dbl-dim_product', lines: ['Database lookup, cached:', 'product_code to product_key'] });
const clc = step(4, { role: 'engine', iconName: 'calculator', title: 'calc-sales_amount', lines: ['Calculator: A * B,', 'price x quantity'] });
const ins = step(5, { role: 'write', iconName: 'database', title: 'iu-fact_sales', lines: ['Insert / Update, keyed on', 'the order line'] });

// The hops, straight down column A. Each pill says what the row holds
// after the step above it: first the whole line as read, then each new
// field it gains.
const hops = [
  [csv, ldt, ['order 10100, line 1, 2003-01-06,', 'customer 363, S24_3969, 49 x 34.47']],
  [ldt, lcu, '+ date_key 20030106'],
  [lcu, lpr, '+ customer_key 86'],
  [lpr, clc, '+ product_key 80'],
  [clc, ins, '+ sales_amount 1689.03'],
];
hops.forEach(([a, b, label]) => d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true, label }));

// ── Column B: the tables ───────────────────────────────────────────────
// Green: tables in the mart. The three dimensions sit beside their
// lookups; mart_fact_sales beside the write.
const tdt = table(1, { role: 'store', iconName: 'calendar', title: 'mart_dim_date', lines: ['1,096 rows, read once', 'into memory'] });
const tcu = table(2, { role: 'store', iconName: 'users', title: 'mart_dim_customer', lines: ['125 rows: customer 141', 'has two versions'] });
const tpr = table(3, { role: 'store', iconName: 'package', title: 'mart_dim_product', lines: ['111 rows, read once', 'into memory'] });
const tfa = table(5, { role: 'store', iconName: 'table-2', title: 'mart_fact_sales', lines: ['2,867 lines; run twice,', 'still 2,867'] });

// Each lookup's question, as an arrow from the step to its dimension,
// with the match condition in a pill in the gap.
d.arrow({ x1: ldt.r, y1: ldt.cy, x2: tdt.x - 3, y2: tdt.cy, straight: true, label: 'the_date = order_date' });
d.arrow({ x1: lcu.r, y1: lcu.cy, x2: tcu.x - 3, y2: tcu.cy, straight: true, label: ['customer_number, version valid', 'on order_date (date_from, date_to)'] });
d.arrow({ x1: lpr.r, y1: lpr.cy, x2: tpr.x - 3, y2: tpr.cy, straight: true, label: 'product_code = product_code' });
// The write: insert the line if it is new, update it if it is there.
d.arrow({ x1: ins.r, y1: ins.cy, x2: tfa.x - 3, y2: tfa.cy, straight: true, label: ['insert if new,', 'update if there'] });

// ── Column C: the unknown member ───────────────────────────────────────
// Stone: the dimensions' own "unknown" row. Dashed arrows from each
// dimension, since this path is taken only when a lookup finds nothing.
const unk = d.box({ x: XC, y: TOP + 2 * PITCH, w: BW, h: BH, role: 'off', iconName: 'circle-help', title: 'key 0: unknown member', lines: ['no match: the row still', 'loads; none in this data'] });
d.arrow({ x1: tdt.r, y1: tdt.cy, x2: unk.x - 3, y2: unk.cy - 18, dashed: true });
d.arrow({ x1: tcu.r, y1: tcu.cy, x2: unk.x - 3, y2: unk.cy, dashed: true, straight: true, label: 'no match' });
d.arrow({ x1: tpr.r, y1: tpr.cy, x2: unk.x - 3, y2: unk.cy + 18, dashed: true });

d.write(import.meta.url);
