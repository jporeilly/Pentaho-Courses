// Daily Sales Pipeline (capstone): the target design, the job on top and
// what its transformations do with the data underneath. It replaces the
// text diagram under "8. Job orchestration" in the capstone lesson.
//
// Every fact comes from 37-mod99-daily-sales-pipeline/guide.md:
//   The job, daily_sales_pipeline.kjb (requirement 8 and the build outline):
//     Start, then Set Variables if you use it (optional), stage_orders.ktr,
//     stage_customers.ktr, stage_products.ktr, maintain_dim_region.ktr,
//     build_fact.ktr, write_summary.ktr, Success. Every entry's failure
//     hop goes to one Mail entry (notify ops), and that to Abort job.
//   The data (Inputs, requirements 2-7, Build Outline and Hints):
//     - sales_20260101.csv: 40 orders, 3 of them missing customer_id or
//       product_id. stage_orders.ktr's Filter rows keeps the rows with
//       both keys and sends the 3 others to Write to log and an audit
//       (rejects) file.
//     - customers.json (20 customers, JSON input) and products.csv
//       (13 products) are staged and joined onto each order in
//       build_fact.ktr: Stream lookup for the customers, Merge join for
//       the products, and the region's surrogate key from dim_region.
//     - Formula computes revenue and gross_margin.
//     - regions.csv (5 regions) goes through Dimension lookup/update in
//       maintain_dim_region.ktr into dim_region, a Type 2 dimension that
//       holds 6 rows after the first run: the five regions plus the
//       "unknown" row the step adds.
//     - build_fact.ktr writes fact_sales.csv (37 rows) to ${OUTPUT_PATH};
//       write_summary.ktr reads it back and writes the .xlsx workbook,
//       one row per region.
//
// Run from this folder:   node capstone-daily-sales-pipeline.svg.mjs
// It writes capstone-daily-sales-pipeline.svg here and
// ../images/capstone-daily-sales-pipeline.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, and one grid shared by both panels: four columns of same-size
// boxes (BW x BH), so a job entry and the data step it runs line up.
const d = new Diagram(1164, 800);
const BW = 248, BH = 64;
const COL = [32, 316, 600, 884]; // left edge of each column; 36px gaps for the arrows

// ── The job ──────────────────────────────────────────────────────────
// Three rows: the first four entries, the last four entries, and the
// failure path. The run snakes from the end of row 1 back to the start
// of row 2 along the gap between them.
const job = d.panel({ x: 16, y: 16, w: 1132, h: 352, role: 'support', iconName: 'list-ordered', title: 'daily_sales_pipeline.kjb: the job' });
const R1 = 72, R2 = 184, R3 = 288; // the three rows' top edges

// A job entry in column `c` of row `y`; every transformation entry uses
// the transformation icon, `shuffle`, as the other job diagrams do.
const entry = (c, y, o) => d.box({ x: COL[c], y, w: BW, h: BH, ...o });
const row1 = [
  entry(0, R1, { role: 'tool', iconName: 'play', title: 'Start', lines: ['then Set Variables,', 'if you use it'] }),
  entry(1, R1, { role: 'engine', iconName: 'shuffle', title: 'stage_orders.ktr', lines: ['read and validate sales'] }),
  entry(2, R1, { role: 'engine', iconName: 'shuffle', title: 'stage_customers.ktr', lines: ['stage the customers'] }),
  entry(3, R1, { role: 'engine', iconName: 'shuffle', title: 'stage_products.ktr', lines: ['stage the products'] }),
];
const row2 = [
  entry(0, R2, { role: 'engine', iconName: 'shuffle', title: 'maintain_dim_region.ktr', lines: ['SCD type 2 on regions'] }),
  entry(1, R2, { role: 'engine', iconName: 'shuffle', title: 'build_fact.ktr', lines: ['joins + Formula'] }),
  entry(2, R2, { role: 'engine', iconName: 'shuffle', title: 'write_summary.ktr', lines: ['Excel by region'] }),
  entry(3, R2, { role: 'write', iconName: 'circle-check', title: 'Success', lines: ['every entry succeeded'] }),
];

// The success hops within each row: straight across, box to box.
[row1, row2].forEach((row) => row.slice(1).forEach((b, i) => {
  d.arrow({ x1: row[i].r, y1: row[i].cy, x2: b.x - 3, y2: b.cy });
}));

// The hop from stage_products.ktr (end of row 1) to maintain_dim_region.ktr
// (start of row 2). The kit's arrows are single curves, so this one is a
// hand-drawn path: down from the bottom of the last box, left along the
// middle of the gap between the rows with rounded corners, and down into
// the top of the first box. It goes in the kit's edge layer, under the
// boxes, with the kit's own arrowhead marker.
const gapY = (row1[3].b + row2[0].y) / 2;
const a = row1[3], b = row2[0];
d.edges.push(`<path d="M${a.cx} ${a.b}V${gapY - 8}Q${a.cx} ${gapY} ${a.cx - 8} ${gapY}H${b.cx + 8}Q${b.cx} ${gapY} ${b.cx} ${gapY + 8}V${b.y - 3}" fill="none" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);

// The failure path: a red row. "Any entry fails" stands for the failure
// hop that every entry above has; drawing seven hops would cross the
// boxes, so one box carries them, and the dashed arrows mark failure.
const fail = entry(0, R3, { role: 'reject', iconName: 'triangle-alert', title: 'Any entry fails', lines: ['its failure hop'] });
const mail = entry(1, R3, { role: 'reject', iconName: 'mail', title: 'Mail', lines: ['notify ops'] });
const abort = entry(2, R3, { role: 'reject', iconName: 'octagon-x', title: 'Abort job', lines: ['the run fails'] });
d.arrow({ x1: fail.r, y1: fail.cy, x2: mail.x - 3, y2: mail.cy, dashed: true });
d.arrow({ x1: mail.r, y1: mail.cy, x2: abort.x - 3, y2: abort.cy, dashed: true });

// ── The data ─────────────────────────────────────────────────────────
// Four rows of the same grid, one per input file in column 0. The sales
// row runs across the top (validate, rejects); the customers and
// products join the orders in column 2; the regions row runs along the
// bottom into dim_region, which feeds the region key up into the join;
// column 3 runs down: Formula, the fact file, the workbook.
d.panel({ x: 16, y: 384, w: 1132, h: 400, role: 'support', iconName: 'shuffle', title: 'What the transformations do with the data' });
const ROW = [440, 528, 616, 704]; // row tops: BH plus a 24px gap
const cell = (c, r, o) => d.box({ x: COL[c], y: ROW[r], w: BW, h: BH, ...o });

// Column 0: the four input files from Lab Files.
const sales = cell(0, 0, { role: 'source', iconName: 'file-text', title: 'sales_20260101.csv', lines: ['40 orders, 3 missing a key'] });
const cust = cell(0, 1, { role: 'source', iconName: 'file-json', title: 'customers.json', lines: ['20 customers'] });
const prod = cell(0, 2, { role: 'source', iconName: 'file-text', title: 'products.csv', lines: ['13 products'] });
const reg = cell(0, 3, { role: 'source', iconName: 'file-text', title: 'regions.csv', lines: ['5 regions'] });

// Column 1: validation on the sales row, the dimension step on the
// regions row. Rows 1 and 2 stay empty so the customer and product
// arrows cross to the join without meeting a box.
const filt = cell(1, 0, { role: 'check', iconName: 'split', title: 'Filter rows', lines: ['stage_orders.ktr: keep', 'the rows with both keys'] });
const dlu = cell(1, 3, { role: 'check', iconName: 'history', title: 'Dimension lookup/update', lines: ['maintain_dim_region.ktr'] });

// Column 2: the rejects, the join, and the dimension table. Row 2 stays
// empty for the arrow from dim_region up into the join.
const rej = cell(2, 0, { role: 'reject', iconName: 'circle-x', title: '3 rejected rows', lines: ['Write to log + audit file'] });
const enr = cell(2, 1, { role: 'join', iconName: 'merge', title: 'Enrich: build_fact.ktr', lines: ['Stream lookup, Merge join,', 'region key from dim_region'] });
const dim = cell(2, 3, { role: 'store', iconName: 'database', title: 'dim_region', lines: ['5 regions + the unknown row'] });

// Column 3: the calculation and the two outputs, top to bottom.
const frm = cell(3, 1, { role: 'engine', iconName: 'calculator', title: 'Formula', lines: ['revenue, gross_margin'] });
const fact = cell(3, 2, { role: 'write', iconName: 'file-output', title: 'fact_sales.csv', lines: ['37 rows, in ${OUTPUT_PATH}'] });
const xlsx = cell(3, 3, { role: 'write', iconName: 'file-spreadsheet', title: 'Summary workbook', lines: ['write_summary.ktr: .xlsx,', 'one row per region'] });

// Sales: into the filter; valid rows on to the join (from the lower half
// of the filter's right edge), rejects straight across (dashed: the
// filter's false branch).
d.arrow({ x1: sales.r, y1: sales.cy, x2: filt.x - 3, y2: filt.cy });
d.arrow({ x1: filt.r, y1: filt.cy - 10, x2: rej.x - 3, y2: rej.cy - 10, dashed: true });
d.arrow({ x1: filt.r, y1: filt.cy + 14, x2: enr.x - 3, y2: enr.cy - 16 });
// Customers and products into the join, each at its own height on the
// join's left edge so the three arrowheads stay apart.
d.arrow({ x1: cust.r, y1: cust.cy, x2: enr.x - 3, y2: enr.cy });
d.arrow({ x1: prod.r, y1: prod.cy, x2: enr.x - 3, y2: enr.cy + 16 });
// Regions: through the dimension step into dim_region, and dim_region's
// surrogate key up into the join (vertical, through the empty row 2).
d.arrow({ x1: reg.r, y1: reg.cy, x2: dlu.x - 3, y2: dlu.cy });
d.arrow({ x1: dlu.r, y1: dlu.cy, x2: dim.x - 3, y2: dim.cy });
d.arrow({ x1: dim.cx, y1: dim.y, x2: enr.cx, y2: enr.b + 3, straight: true });
// The join into the Formula, then down column 3 to the two outputs.
d.arrow({ x1: enr.r, y1: enr.cy, x2: frm.x - 3, y2: frm.cy });
d.arrow({ x1: frm.cx, y1: frm.b, x2: fact.cx, y2: fact.y - 3, straight: true });
d.arrow({ x1: fact.cx, y1: fact.b, x2: xlsx.cx, y2: xlsx.y - 3, straight: true });

d.write(import.meta.url);
