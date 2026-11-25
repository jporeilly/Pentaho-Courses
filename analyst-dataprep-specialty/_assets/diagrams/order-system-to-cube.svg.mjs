// From the order system to the cube: the route the course follows, from
// the normalized Steel Wheels order tables, through PDI's extract,
// transform and load, to the summary tables, the Mondrian schema and
// Analyzer, with "dimensions before facts" marked and the job that runs
// it all underneath. It sits at the end of section 3, "The Route:
// Extract, Transform, Load", of 02-from-source-data-to-a-star-schema/
// guide.md, as a new figure (that section had no sketch).
//
// Every fact comes from 02-from-source-data-to-a-star-schema/guide.md:
//   - Section 1: the four order-system tables and their row counts:
//     CUSTOMERS 122, ORDERS 326, ORDERDETAILS 2,996, PRODUCTS 110,
//     linked by keys (ORDERS to CUSTOMERS by CUSTOMERNUMBER,
//     ORDERDETAILS to ORDERS by ORDERNUMBER and to PRODUCTS by
//     PRODUCTCODE); the shape is normalized, right for entering orders.
//   - Section 3, the stage table, one box per stage:
//       Extract: CSV file input reads the order system's extracts.
//       Transform, dimensions: Generate Rows and Calculator for dates;
//         Dimension lookup/update for customers and products.
//       Transform, facts: swap each natural key for the surrogate key
//         (Database lookup, Dimension lookup/update in lookup mode) and
//         compute the measures (Calculator).
//       Load: Table output, Insert / Update, without duplicating a line
//         on a re-run.
//       Summarize: Group by into the aggregate (agg_) tables.
//       Automate: a job on the Pentaho Server runs it all in order, on
//         a schedule, with an HTTP entry that refreshes the cube.
//     and "Dimensions load before facts, every time".
//   - Section 4: a Mondrian schema (the course ships sales_mart.xml)
//     maps the star's tables to a cube with dimensions, levels and
//     measures; Mondrian reads the agg_ tables instead of mart_fact_sales when
//     a query allows; Analyzer, dashboards and reports query the cube.
//     The cube's name, Sales Mart, and its Time, Markets and Product
//     dimensions are from section 4 and 10-refresh-the-cube-after-a-load.
//
// Run from this folder:   node order-system-to-cube.svg.mjs
// It writes order-system-to-cube.svg here and
// ../images/order-system-to-cube.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: four columns of same-size boxes (BW x BH), as in the
// other courses' pipeline diagrams. 36px between columns leaves room for
// an arrow; a pill that needs more room sits under the gap instead.
const d = new Diagram(1164, 712);
const BW = 248, BH = 72;
const COL = [32, 316, 600, 884]; // left edge of each column

// A box in column `c`, with its top at `y`.
const cell = (c, y, o) => d.box({ x: COL[c], y, w: BW, h: BH, ...o });

// ── Panel 1: the order system ──────────────────────────────────────────
// The four source tables, in the order their keys link them, so each
// link is a short line between neighbours. Blue: sources you read.
const P1 = 16;
d.panel({ x: 16, y: P1, w: 1132, h: 146, role: 'support', iconName: 'database', title: 'The order system: normalized, each fact stated once', sub: 'Right for entering orders; for analysis every question is a join, and an overwrite forgets history' });
const R1 = P1 + 60;
const cus = cell(0, R1, { role: 'source', iconName: 'users', title: 'CUSTOMERS', lines: ['one row per customer:', '122 rows'] });
const ord = cell(1, R1, { role: 'source', iconName: 'receipt', title: 'ORDERS', lines: ['one row per order:', '326 rows'] });
const det = cell(2, R1, { role: 'source', iconName: 'rows-3', title: 'ORDERDETAILS', lines: ['one row per order line:', '2,996 rows'] });
const pro = cell(3, R1, { role: 'source', iconName: 'package', title: 'PRODUCTS', lines: ['one row per product:', '110 rows'] });
// The key links: plain lines, no arrowhead, since a key link is not a
// flow. ORDERS points at CUSTOMERS; ORDERDETAILS at ORDERS and PRODUCTS.
d.arrow({ x1: ord.x, y1: ord.cy, x2: cus.r, y2: cus.cy, straight: true, head: false });
d.arrow({ x1: det.x, y1: det.cy, x2: ord.r, y2: ord.cy, straight: true, head: false });
d.arrow({ x1: det.r, y1: det.cy, x2: pro.x, y2: pro.cy, straight: true, head: false });

// ── Panel 2: PDI, extract, transform and load ──────────────────────────
// One row, left to right, in the order the stage table lists them.
// Extract is blue (it reads), the two transforms violet (they reshape),
// Load green (it writes the star).
const P2 = 214; // 52px below panel 1, room for the extracts pill
d.panel({ x: 16, y: P2, w: 1132, h: 176, role: 'support', iconName: 'shuffle', title: 'PDI: extract, transform, load' });
const R2 = P2 + 56;
const ext = cell(0, R2, { role: 'source', iconName: 'file-text', title: 'Extract', lines: ['CSV file input reads the', "order system's extracts"] });
const dim = cell(1, R2, { role: 'engine', iconName: 'history', title: 'Transform: dimensions', lines: ['dates generated; customers,', 'products by Dimension l/u'] });
const fac = cell(2, R2, { role: 'engine', iconName: 'merge', title: 'Transform: facts', lines: ['natural keys become', 'surrogate keys; measures'] });
const lod = cell(3, R2, { role: 'write', iconName: 'database', title: 'Load', lines: ['Table output, Insert / Update:', 'no line twice on a re-run'] });
// The extracts come down from the order system as a whole (the foot of
// its panel) into Extract's top. The curve starts at x 376 and ends at
// 260, so it crosses panel 2's title strip to the right of the title's
// text (which ends near x 294) instead of through it; its pill sits in
// the gap between the two panels.
d.arrow({ x1: 376, y1: P1 + 146, x2: ext.r - 20, y2: ext.y - 3, vertical: true, label: 'extracts', lx: 376, ly: P1 + 146 + 26 });
// The main line.
d.arrow({ x1: ext.r, y1: ext.cy, x2: dim.x - 3, y2: dim.cy });
d.arrow({ x1: dim.r, y1: dim.cy, x2: fac.x - 3, y2: fac.cy });
d.arrow({ x1: fac.r, y1: fac.cy, x2: lod.x - 3, y2: lod.cy });
// The rule this page marks: a pill under the gap between the two
// transforms, where it names the arrow just above it.
d.pill((dim.r + fac.x) / 2, dim.b + 22, 'Dimensions before facts, every time');

// ── Panel 3: summaries and the cube ────────────────────────────────────
// Read right to left, continuing from Load above it: Summarize (green, it
// writes agg_ tables), the Mondrian schema (teal, a model that maps the
// star), the cube on the Pentaho Server (violet, the engine) and
// Analyzer (amber, the browser).
const P3 = 422;
d.panel({ x: 16, y: P3, w: 1132, h: 176, role: 'support', iconName: 'chart-column', title: 'Summaries, and the cube the analyst queries' });
const R3 = P3 + 56;
const sum = cell(3, R3, { role: 'write', iconName: 'sigma', title: 'Summarize', lines: ['Group by into the agg_', 'tables, a coarser grain'] });
const sch = cell(2, R3, { role: 'model', iconName: 'file-cog', title: 'Mondrian schema', lines: ['sales_mart.xml maps the', 'star and agg_ tables'] });
const cub = cell(1, R3, { role: 'server', iconName: 'boxes', title: 'Sales Mart cube', lines: ['Time, Markets, Product;', 'Sales and Quantity'] });
const ana = cell(0, R3, { role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['and dashboards and', 'reports query the cube'] });
// Load runs straight down into Summarize, then the line runs left.
d.arrow({ x1: lod.cx, y1: lod.b, x2: sum.cx, y2: sum.y - 3, straight: true });
d.arrow({ x1: sum.x, y1: sum.cy, x2: sch.r + 3, y2: sch.cy });
d.arrow({ x1: sch.x, y1: sch.cy, x2: cub.r + 3, y2: cub.cy });
d.arrow({ x1: cub.x, y1: cub.cy, x2: ana.r + 3, y2: ana.cy });
// What Mondrian does with the summaries, under the gap it concerns.
d.pill((sch.r + sum.x) / 2, sum.b + 22, 'Mondrian reads an agg_ table instead of mart_fact_sales when a query allows');

// ── The job that runs it all ───────────────────────────────────────────
// A full-width slate bar: a supporting service under everything above.
d.bar({ x: 16, y: 614, w: 1132, h: 82, role: 'support', iconName: 'calendar-clock', title: 'Automate: one job on the Pentaho Server', line: 'Runs every stage in order on a schedule; an HTTP entry at the end tells the cube the data has changed' });

d.write(import.meta.url);
