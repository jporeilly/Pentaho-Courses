// Daily Sales Pipeline (capstone): the data model the job produces. The
// four input files, the MySQL tables they load, the Type 2 dimension
// dim_region, the fact table and where each of its columns comes from,
// and the two output files. The job's orchestration is drawn separately,
// in capstone-daily-sales-pipeline.svg.mjs; this one shows the tables.
//
// Every fact drawn, and where it comes from. "guide" is
// 37-mod99-daily-sales-pipeline/guide.md; "ref" is the reference solution
// instructor/developer-di-practitioner/37-capstone-reference/ (the
// lesson's own files/solution/*.ktr and *.kjb are the learner's blank
// starting files, with no steps or entries, so the solution facts come
// from the reference solution).
//   The inputs (guide lines 64-72; files/*.csv, files/customers.json):
//     - sales_20260101.csv: 40 rows; 3 miss a key (two customer_id, one
//       product_id: orders 10011, 10036 and 10016). The 3 are rejected,
//       37 staged (guide line 256). ref stage_orders.ktr writes the
//       rejects to out/rejected_${SALES_DATE}.csv (its note, line 463).
//     - customers.json: 20 customers under $.customers[*] (guide 67, 272).
//     - products.csv: 13 products (guide 68, 287).
//     - regions.csv: 5 regions, columns code, name, manager_email
//       (guide 69; files/regions.csv).
//   The staging tables (guide lines 227-228; ref daily_sales_pipeline.kjb,
//   Create tables SQL entry, lines 493-502; the Table output <table> of
//   each ref stage_*.ktr): stg_orders, stg_customers, stg_products.
//   dim_region (ref daily_sales_pipeline.kjb lines 503-506; ref
//   maintain_dim_region.ktr, step "dim_region (SCD type 2)"):
//     INT region_sk (AUTO_INCREMENT PRIMARY KEY, the technical key),
//     INT version, DATETIME valid_from, DATETIME valid_to,
//     VARCHAR(10) code (the natural key, the step's <key>),
//     VARCHAR(100) name and VARCHAR(200) manager_email (both Insert
//     fields: a change makes a new version, type 2). After the first run
//     it holds 6 rows: the five regions plus the "unknown" row, region_sk
//     1 (guide line 303; ref README.md, "What a correct run produces").
//   fact_sales (ref daily_sales_pipeline.kjb lines 507-512, and the
//   "Fact columns" Select values of ref build_fact.ktr, in that order):
//     order_id BIGINT, order_date DATE, customer_id VARCHAR(10),
//     customer_name VARCHAR(100), product_id VARCHAR(10), product_name
//     VARCHAR(100), category VARCHAR(50), region_sk INT, region_code
//     VARCHAR(10), region_name VARCHAR(100), qty INT, unit_price
//     DECIMAL(10,2), discount_pct DECIMAL(5,2), cost DECIMAL(10,2),
//     revenue DECIMAL(12,2), gross_margin DECIMAL(12,2).
//   Where each fact column comes from (ref build_fact.ktr):
//     - stg_orders (Read orders): order_id, order_date, customer_id,
//       product_id, qty, unit_price, discount_pct.
//     - stg_customers (Lookup customer, Stream lookup on customer_id = id):
//       name as customer_name, region_code.
//     - stg_products (Join products, Merge join INNER on product_id = id):
//       product_name, category, cost.
//     - dim_region (Region key, Dimension lookup/update with Update the
//       dimension? cleared, region_code = code at order_date): region_sk,
//       name as region_name.
//     - Formula (Revenue and margin): revenue = INT(qty * unit_price *
//       (1 - discount_pct / 100) * 100 + 0.5) / 100, gross_margin =
//       revenue - (qty * cost) (guide lines 126-127 and 329).
//   The outputs:
//     - out/fact_sales.csv, 37 rows (guide lines 142, 323, 399), written
//       by build_fact.ktr with the same columns as the table.
//     - sales_summary_20260101.xlsx (guide 143, 336-338): ref
//       write_summary.ktr reads fact_sales.csv back, groups by
//       region_name (SUM revenue, SUM gross_margin, COUNT order_id as
//       orders) and writes sheet "By region". Totals from the guide's
//       Verification table (lines 402-409): 5 regions, revenue 10113.31,
//       gross margin 4475.61, 37 orders.
//
// Run from this folder:   node capstone-data-model.svg.mjs
// It writes capstone-data-model.svg here and
// ../images/capstone-data-model.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: three columns, read left to right. Column 1 holds the
// input files, column 2 the tables they load (and the Formula step under
// them), column 3 the fact table with the two output files under it.
const d = new Diagram(1000, 0); // the height is set at the end, from the lowest box
const X1 = 16, W1 = 220; // input files
const X2 = 292, W2 = 284; // staging tables, dim_region, Formula (56px gap for the arrows)
const X3 = 644, W3 = 340; // fact_sales and the outputs (68px gap for the arrows)
const BH = 64; // every plain box's height
const ROW = [16, 100, 184, 268]; // the four input rows' tops: BH plus a 20px gap

// A small colored tag at the right end of an entity's field row, for
// what the kit's PK/FK badge cannot say (a fact column's source, a
// dimension field's role). Right-aligned to the entity's right edge.
const tag = (ent, i, text, role) => {
  const c = ROLE[role];
  const w = text.length * 6 + 14;
  const x = ent.r - 10 - w;
  const y = ent.rowY(i);
  d.raw(`<rect x="${x}" y="${y - 8}" width="${w}" height="16" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="0.8"/>`);
  d.raw(`<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${c.text}">${esc(text)}</text>`);
};

// ── Column 1: the four input files (blue, sources you read) ──────────
const sales = d.box({ x: X1, y: ROW[0], w: W1, h: BH, role: 'source', iconName: 'file-text', title: 'sales_20260101.csv', lines: ['40 rows, 3 missing a key'] });
const cust = d.box({ x: X1, y: ROW[1], w: W1, h: BH, role: 'source', iconName: 'file-json', title: 'customers.json', lines: ['20 customers'] });
const prod = d.box({ x: X1, y: ROW[2], w: W1, h: BH, role: 'source', iconName: 'file-text', title: 'products.csv', lines: ['13 products'] });
const reg = d.box({ x: X1, y: ROW[3], w: W1, h: BH, role: 'source', iconName: 'file-text', title: 'regions.csv', lines: ['5 regions'] });

// ── Column 2: the tables they load (green, stores) ───────────────────
// The three staging tables are plain boxes: their columns are the input
// files' own. Each says how build_fact.ktr joins it onto the orders.
const stgO = d.box({ x: X2, y: ROW[0], w: W2, h: BH, role: 'store', iconName: 'database', title: 'stg_orders', lines: ['37 orders; the 3 rejects go', 'to rejected_20260101.csv'] });
const stgC = d.box({ x: X2, y: ROW[1], w: W2, h: BH, role: 'store', iconName: 'database', title: 'stg_customers', lines: ['20 rows; Stream lookup', 'on customer_id = id'] });
const stgP = d.box({ x: X2, y: ROW[2], w: W2, h: BH, role: 'store', iconName: 'database', title: 'stg_products', lines: ['13 rows; Merge join', 'on product_id = id'] });

// dim_region, the Type 2 dimension, drawn as a table with its real
// columns, level with regions.csv. Tags mark the natural key and the two
// versioned (type 2) fields; the kit's PK badge marks the technical key.
// Types are drawn without their lengths (VARCHAR, DECIMAL), as
// sales-mart-star does: the kit's name column starts 104px in, and
// VARCHAR(200) or DECIMAL(12,2) would run into it. The header lists them.
const dim = d.entity({
  x: X2, y: ROW[3], w: W2, role: 'store', iconName: 'history', title: 'dim_region  (SCD Type 2)',
  fields: [
    ['INT', 'region_sk', 'PK'],
    ['INT', 'version', ''],
    ['DATETIME', 'valid_from', ''],
    ['DATETIME', 'valid_to', ''],
    ['VARCHAR', 'code', ''],
    ['VARCHAR', 'name', ''],
    ['VARCHAR', 'manager_email', ''],
  ],
});
tag(dim, 4, 'natural key', 'support');
tag(dim, 5, 'type 2', 'check');
tag(dim, 6, 'type 2', 'check');
// Under it, a note (not on any arrow): its rows after the first run and
// how the fact build looks it up.
const notY = dim.b + 46;
d.pill(dim.cx, notY, ['6 rows after run 1: the 5 regions', 'and the unknown row, region_sk 1;', 'looked up on region_code = code', 'for the version valid at order_date']);

// Formula, the step that computes the two measures (violet, a step that
// transforms), under the note.
const frm = d.box({ x: X2, y: notY + 56, w: W2, h: 96, role: 'engine', iconName: 'calculator', title: 'Formula', lines: ['revenue = qty * unit_price', '* (1 - discount_pct / 100),', 'rounded half-up to the cent;', 'gross_margin = revenue - qty * cost'] });

// ── Column 3: fact_sales (teal, the model) ───────────────────────────
// All 16 columns in the table's own order. Each row's tag names where
// the column comes from, colored by that source's role.
const factFields = [
  ['BIGINT', 'order_id', 'stg_orders'],
  ['DATE', 'order_date', 'stg_orders'],
  ['VARCHAR', 'customer_id', 'stg_orders'],
  ['VARCHAR', 'customer_name', 'stg_customers'],
  ['VARCHAR', 'product_id', 'stg_orders'],
  ['VARCHAR', 'product_name', 'stg_products'],
  ['VARCHAR', 'category', 'stg_products'],
  ['INT', 'region_sk', 'dim_region'],
  ['VARCHAR', 'region_code', 'stg_customers'],
  ['VARCHAR', 'region_name', 'dim_region'],
  ['INT', 'qty', 'stg_orders'],
  ['DECIMAL', 'unit_price', 'stg_orders'],
  ['DECIMAL', 'discount_pct', 'stg_orders'],
  ['DECIMAL', 'cost', 'stg_products'],
  ['DECIMAL', 'revenue', 'Formula'],
  ['DECIMAL', 'gross_margin', 'Formula'],
];
const fact = d.entity({ x: X3, y: ROW[0], w: W3, role: 'model', iconName: 'table-2', title: 'fact_sales  (37 rows)', fields: factFields.map(([t, n]) => [t, n, '']) });
factFields.forEach(([, , src], i) => tag(fact, i, src, src === 'Formula' ? 'engine' : 'store'));

// ── The arrows into the fact table ───────────────────────────────────
// Inputs straight across into what they load.
[[sales, stgO], [cust, stgC], [prod, stgP]].forEach(([a, b]) => d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy }));
d.arrow({ x1: reg.r, y1: reg.cy, x2: dim.x - 3, y2: reg.cy });
// Each source into the fact row of the first column it supplies, so the
// five arrows keep their top-to-bottom order and never cross: orders to
// order_id, customers to customer_name, products to product_name,
// dim_region (from its key row) to region_sk, Formula to revenue.
d.arrow({ x1: stgO.r, y1: stgO.cy, x2: fact.x - 3, y2: fact.rowY(0) });
d.arrow({ x1: stgC.r, y1: stgC.cy, x2: fact.x - 3, y2: fact.rowY(3) });
d.arrow({ x1: stgP.r, y1: stgP.cy, x2: fact.x - 3, y2: fact.rowY(5) });
d.arrow({ x1: dim.r, y1: dim.rowY(0), x2: fact.x - 3, y2: fact.rowY(7) });
d.arrow({ x1: frm.r, y1: frm.cy, x2: fact.x - 3, y2: fact.rowY(14) });

// ── The two outputs, under the fact table (green, writes) ────────────
// build_fact.ktr writes the same rows to out/fact_sales.csv;
// write_summary.ktr reads that file back into the workbook. The summary
// shows only the Verification table's totals, to keep it compact.
const csv = d.box({ x: X3, y: fact.b + 28, w: W3, h: BH, role: 'write', iconName: 'file-output', title: 'out/fact_sales.csv', lines: ['37 rows, the same 16 columns'] });
const xlsx = d.tableBox({
  x: X3, y: csv.b + 28, w: W3, role: 'write', iconName: 'file-spreadsheet',
  title: 'sales_summary_20260101.xlsx', sub: 'sheet By region: one row per region',
  cols: ['Regions', 'Revenue', 'Gross margin', 'Orders'],
  rows: [{ tone: 'result', cells: ['5', '10113.31', '4475.61', '37'] }],
});
d.arrow({ x1: fact.cx, y1: fact.b, x2: csv.cx, y2: csv.y - 3, straight: true });
d.arrow({ x1: csv.cx, y1: csv.b, x2: xlsx.cx, y2: xlsx.y - 3, straight: true });

// The canvas ends 16px under the lowest box, whichever column it is in.
d.h = Math.max(frm.b, xlsx.b) + 16;

d.write(import.meta.url);
