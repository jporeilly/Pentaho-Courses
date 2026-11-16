// The retailer scenario's target design: what the learner builds over
// Labs 1 to 5, with a lab badge on every stage, so a new user can see on
// the first page where each lab fits. It sits under the scenario note
// in 01-first-win/guide.md ("You're the data engineer at a small
// retailer...").
//
// Every fact comes from the lessons:
//   Panel 1, the daily sales transformation (Labs 1 to 3):
//     - 01-first-win: win_preview.ktr reads yesterday's sales, the Keys
//       present? filter splits them into Valid rows and Rejected rows;
//       37 valid, 3 rejected (two missing customer_id, one product_id).
//     - 02-build-the-pipeline: the learner builds the same thing in
//       check_keys.ktr: Read sales (Text file input) of
//       sales_20260101.csv, 40 rows; Keys present? (Filter rows,
//       customer_id IS NOT NULL AND product_id IS NOT NULL); the 3
//       rejects go to Text file output "Rejects for source team",
//       C:\Workshop\pdi-2hr\out\rejects(.txt); the valid rows to a Dummy
//       step, Valid rows.
//     - 03-enrich-and-join: enrich_sales.ktr. Read customers (JSON input,
//       customers.json, 20 customers) and Read products (products.csv)
//       feed two Stream lookups, + customer and + products; Compute
//       margin (Calculator: gross, net, cost_total, margin); Read regions
//       (regions.csv) joins on with a LEFT OUTER Merge join, + region,
//       after two Sort rows steps; the result is Enriched rows, 37 rows
//       carrying region_name and manager_email.
//   Panel 2, the customer dimension (Lab 4):
//     - 04-track-history-scd: load_dim_customer.ktr reads this lab's own
//       copy of customers.json into Dimension lookup/update (Load
//       dim_customer), which keeps dim_customer in MySQL (the warehouse
//       connection, database sampledata) as a Type 2 dimension: a
//       change of region closes the old version and inserts a new one.
//       It reads customers.json, not the enriched sales: the lab loads
//       the dimension on its own.
//   Panel 3, many feeds, one template (Lab 5):
//     - 05-metadata-injection: control.csv holds one row per feed (its
//       path and separator); mi_driver.kjb runs the injector,
//       mi_inject.ktr, once per row; the injector fills in the
//       template's reader (filename and separator) and runs
//       mi_template.ktr, which appends every feed to all_feeds.csv, 18
//       rows from three feeds (comma, pipe and semicolon).
//
// The audit described the target as one line ending in dim_customer;
// the lessons build three separate pieces, so this diagram draws three
// panels, and each panel is one thing the learner opens in Spoon.
//
// Run from this folder:   node retailer-pipeline-target.svg.mjs
// It writes retailer-pipeline-target.svg here and
// ../images/retailer-pipeline-target.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas, and one grid shared by all three panels: four columns of
// same-size boxes (BW x BH), so a reader's eye can run down a column.
// The 36px gaps between columns leave room for the arrows.
const d = new Diagram(1164, 894);
const BW = 248, BH = 72;
const COL = [32, 316, 600, 884]; // left edge of each column
const PITCH = 98; // a box plus a 26px gap between rows (room for a badge)

// A box in column `c`, with its top at `y`.
const cell = (c, y, o) => d.box({ x: COL[c], y, w: BW, h: BH, ...o });

// A lab badge: a small pill in the box's own stroke color, sitting on
// the top edge at the right: 15px above it and 5px inside, so it stays
// clear of the box's title (whose letters start about 8px inside the
// edge) and of the arrows (which meet the boxes at their sides or at
// the middle of the top and bottom edges).
// `text` is "Lab 3" or "Labs 1-2". Its width follows the text length.
const badge = (b, role, text) => {
  const c = ROLE[role];
  const w = text.length * 7 + 18; // about 7px a character at 11.5px bold
  const x = b.r - 14 - w, y = b.y - 15;
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="${c.stroke}" stroke="#ffffff" stroke-width="1.5"/>`);
  d.raw(`<text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">${esc(text)}</text>`);
};

// ── Panel 1: the daily sales transformation (Labs 1 to 3) ─────────────
// Four rows. Row 0 holds only the rejects, above the filter, so the
// reject arrow can go straight up. Row 1 is the main line: the sales
// file, the filter, the two lookups and the margin. Rows 2 and 3 hold
// the reference files in column 1 (under the filter, where no row runs)
// and the merge join and the result in column 3, read downward.
d.panel({ x: 16, y: 16, w: 1132, h: 440, role: 'support', iconName: 'shuffle', title: 'The daily sales transformation: Labs 1 to 3' });
const R = [72, 72 + PITCH, 72 + 2 * PITCH, 72 + 3 * PITCH]; // row tops

const rej = cell(1, R[0], { role: 'reject', iconName: 'circle-x', title: 'Rejects for source team', lines: ['3 rows, written to', 'out\\rejects.txt'] });
const sales = cell(0, R[1], { role: 'source', iconName: 'file-text', title: 'sales_20260101.csv', lines: ["yesterday's sales:", '40 orders'] });
const filt = cell(1, R[1], { role: 'check', iconName: 'split', title: 'Keys present?', lines: ['Filter rows: customer_id', 'and product_id are set'] });
const lkp = cell(2, R[1], { role: 'join', iconName: 'merge', title: '+ customer, + products', lines: ['two Stream lookups add', 'the name, region, product'] });
const calc = cell(3, R[1], { role: 'engine', iconName: 'calculator', title: 'Compute margin', lines: ['Calculator: gross, net,', 'cost_total, margin'] });
const cust = cell(1, R[2], { role: 'source', iconName: 'file-json', title: 'customers.json', lines: ['20 customers'] });
const regs = cell(2, R[2], { role: 'source', iconName: 'file-text', title: 'regions.csv', lines: ['region name, manager'] });
const join = cell(3, R[2], { role: 'join', iconName: 'merge', title: '+ region', lines: ['Merge join, LEFT OUTER,', 'both sides sorted by code'] });
const prod = cell(1, R[3], { role: 'source', iconName: 'file-text', title: 'products.csv', lines: ['the product catalog'] });
const enr = cell(3, R[3], { role: 'result', iconName: 'circle-check', title: 'Enriched rows', lines: ['37 sales with customer,', 'product, margin, region'] });

// The main line, left to right. The filter's valid rows leave from the
// upper part of its right edge and arrive high on the lookups' left
// edge, leaving room below for the two reference files' arrows.
d.arrow({ x1: sales.r, y1: sales.cy, x2: filt.x - 3, y2: filt.cy });
d.arrow({ x1: filt.r, y1: filt.cy - 14, x2: lkp.x - 3, y2: lkp.cy - 18 });
d.arrow({ x1: lkp.r, y1: lkp.cy, x2: calc.x - 3, y2: calc.cy });
// The rejects: straight up from the filter's top edge, dashed (the
// filter's false branch, as in the DI course's diagrams).
d.arrow({ x1: filt.cx, y1: filt.y, x2: rej.cx, y2: rej.b + 3, straight: true, dashed: true });
// The two lookup sources curve up from column 1 into the lookups' left
// edge, each at its own height so the three arrowheads stay apart.
d.arrow({ x1: cust.r, y1: cust.cy, x2: lkp.x - 3, y2: lkp.cy + 2 });
d.arrow({ x1: prod.r, y1: prod.cy, x2: lkp.x - 3, y2: lkp.cy + 20 });
// The margin runs down column 3 into the join, the regions come in from
// the left, and the join's output runs down into Enriched rows.
d.arrow({ x1: calc.cx, y1: calc.b, x2: join.cx, y2: join.y - 3, straight: true });
d.arrow({ x1: regs.r, y1: regs.cy, x2: join.x - 3, y2: join.cy });
d.arrow({ x1: join.cx, y1: join.b, x2: enr.cx, y2: enr.y - 3, straight: true });

// Lab badges. Lab 1 runs the finished first stage (read and filter);
// Lab 2 builds it and adds the rejects file; Lab 3 adds the rest.
badge(sales, 'source', 'Labs 1-2');
badge(filt, 'check', 'Labs 1-2');
badge(rej, 'reject', 'Lab 2');
[lkp, join].forEach((b) => badge(b, 'join', 'Lab 3'));
badge(calc, 'engine', 'Lab 3');
[cust, prod, regs].forEach((b) => badge(b, 'source', 'Lab 3'));
badge(enr, 'result', 'Lab 3');

// ── Panel 2: the customer dimension (Lab 4) ───────────────────────────
// One row, three boxes: the file, the step, the table. Column 3 stays
// empty: the lab writes nothing else.
const P2 = 472;
d.panel({ x: 16, y: P2, w: 1132, h: 146, role: 'support', iconName: 'shuffle', title: 'The customer dimension, with history: Lab 4' });
const c4 = cell(0, P2 + 56, { role: 'source', iconName: 'file-json', title: 'customers.json', lines: ["Lab 4's own copy:", '20 customers'] });
const dlu = cell(1, P2 + 56, { role: 'check', iconName: 'history', title: 'Dimension lookup/update', lines: ['Type 2: a change adds', 'a new version'] });
const dim = cell(2, P2 + 56, { role: 'store', iconName: 'database', title: 'dim_customer', lines: ['in MySQL: one row per', 'customer version'] });
d.arrow({ x1: c4.r, y1: c4.cy, x2: dlu.x - 3, y2: dlu.cy });
d.arrow({ x1: dlu.r, y1: dlu.cy, x2: dim.x - 3, y2: dim.cy });
badge(c4, 'source', 'Lab 4');
badge(dlu, 'check', 'Lab 4');
badge(dim, 'store', 'Lab 4');

// ── Panel 3: many feeds, one template (Lab 5) ─────────────────────────
// Two rows. Row 1 runs left to right: the control file, the driver job
// with its injector, the filled-in template, the combined output. Row 2
// holds the three feeds under the template, which reads them.
const P3 = 634;
d.panel({ x: 16, y: P3, w: 1132, h: 244, role: 'support', iconName: 'syringe', title: 'Many feeds, one template, by metadata injection: Lab 5' });
const T1 = P3 + 56, T2 = T1 + PITCH;
const ctl = cell(0, T1, { role: 'source', iconName: 'file-text', title: 'control.csv', lines: ['one row per feed: a new', 'feed is a new row'] });
const drv = cell(1, T1, { role: 'engine', iconName: 'repeat', title: 'mi_driver.kjb', lines: ['runs the injector once', 'per control row'] });
// The template: `file-cog`, a transformation whose settings are filled
// in, as in the DI course's metadata injection diagram.
const tpl = cell(2, T1, { role: 'join', iconName: 'file-cog', title: 'mi_template.ktr', lines: ['the injector fills in its', 'filename and separator'] });
const all = cell(3, T1, { role: 'write', iconName: 'file-output', title: 'all_feeds.csv', lines: ['18 rows from 3 feeds,', 'one standard shape'] });
const feeds = cell(2, T2, { role: 'source', iconName: 'file-text', title: 'Three store feeds', lines: ['comma, pipe and', 'semicolon separated'] });
d.arrow({ x1: ctl.r, y1: ctl.cy, x2: drv.x - 3, y2: drv.cy });
d.arrow({ x1: drv.r, y1: drv.cy, x2: tpl.x - 3, y2: tpl.cy });
d.arrow({ x1: tpl.r, y1: tpl.cy, x2: all.x - 3, y2: all.cy });
// The feeds go up into the template, which reads one per run.
d.arrow({ x1: feeds.cx, y1: feeds.y, x2: tpl.cx, y2: tpl.b + 3, straight: true });
[ctl, feeds].forEach((b) => badge(b, 'source', 'Lab 5'));
badge(drv, 'engine', 'Lab 5');
badge(tpl, 'join', 'Lab 5');
badge(all, 'write', 'Lab 5');

d.write(import.meta.url);
