// Report Parameters (18): where a prompt's choices come from and where
// the chosen value goes. Each list parameter's own query fills its
// drop-down; the chosen values reach Query 1 as ${product_var} and
// ${country_var}, which the SQL data factory turns into ? bind markers
// before SampleData runs it. A dashed arrow shows the cascading prompt
// the lesson describes but does not build. It sits after the "Each
// prompt is a query, and a query can depend on another parameter" panel
// in 18-mod7-parameters/guide.md, with a "Read the diagram" paragraph
// after it.
//
// Every fact comes from lesson 18 (18-mod7-parameters):
//   - "1. A list of product lines": the query prod_list, select distinct
//     productline from products, returns 7 rows.
//   - "2. The parameter": product_var, label Select a Product Line:,
//     Display Type Drop Down, Query prod_list, default Classic Cars,
//     Validate Values selected. Under the hood: before the engine runs
//     the main query it runs prod_list, builds the prompt and, with
//     strict values, rejects a value that isn't in the list.
//   - "3. Filter the main query": Query 1 gets WHERE productline IN
//     (${product_var}). Under the hood: the SQL data factory replaces
//     each ${name} with a JDBC ? placeholder and binds the value through
//     a prepared statement, so the value needs no quotes.
//   - "4. A second prompt": country_list, select distinct country from
//     customer_w_ter, 27 rows; country_var, label Select a Country:,
//     Drop Down, default Australia, Validate Values selected; WHERE productline IN (${product_var})
//     AND country IN (${country_var}). With the defaults the report has
//     53 rows; with Ships and Finland, 9 rows.
//   - "Each prompt is a query, and a query can depend on another
//     parameter": here the two are independent; if country_list
//     mentioned ${product_var}, the framework would re-run it whenever
//     the product line changed: a cascading prompt. Drawn dashed,
//     because the workshop does not build it.
//
// Colors: blue the queries you write; amber the prompts, which the
// reader answers in Preview or the User Console; violet the main query
// and the SQL data factory that prepares it (its boxes have no icon, for
// room); green SampleData, where the prepared statement runs. Icons:
// `code` a query, `list-filter` a drop-down prompt, `cog` the engine and
// `database` a database (this folder's README).
//
// Run from this folder:   node parameter-flow.svg.mjs
// It writes parameter-flow.svg here and ../images/parameter-flow.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 458);

// Three panels with 24px between them; two rows of boxes, product line
// on top and country underneath, far enough apart for the dashed
// cascading arrow and its label to show between them.
const ROW_Y = [76, 246], BH = 96, PH = ROW_Y[1] + BH + 16 - 16;
d.panel({ x: 16, y: 16, w: 248, h: PH, role: 'source', iconName: 'code', title: "Each prompt's own query", sub: 'on the JDBC data source' });
d.panel({ x: 288, y: 16, w: 228, h: PH, role: 'browser', iconName: 'list-filter', title: 'The prompts', sub: 'in Preview or the User Console' });
d.panel({ x: 540, y: 16, w: 244, h: PH, role: 'server', iconName: 'cog', title: 'The main query', sub: 'Query 1, and the SQL data factory' });

// ── Column 1: the two list queries ────────────────────────────────────
const qp = d.box({ x: 28, y: ROW_Y[0], w: 224, h: BH, role: 'source', iconName: 'code', title: 'prod_list', lines: ['select distinct', 'productline from products', '7 rows: the choices'] });
const qc = d.box({ x: 28, y: ROW_Y[1], w: 224, h: BH, role: 'source', iconName: 'code', title: 'country_list', lines: ['select distinct country', 'from customer_w_ter', '27 rows: the choices'] });

// ── Column 2: the two parameters, as the reader sees them ─────────────
const pp = d.box({ x: 300, y: ROW_Y[0], w: 204, h: BH, role: 'browser', iconName: 'list-filter', title: 'product_var', lines: ['Drop Down, values', 'checked against the list,', 'default Classic Cars'] });
const pc = d.box({ x: 300, y: ROW_Y[1], w: 204, h: BH, role: 'browser', iconName: 'list-filter', title: 'country_var', lines: ['Drop Down, values', 'checked against the list,', 'default Australia'] });

// ── Column 3: Query 1 as written, then as the database receives it ────
const q1 = d.box({ x: 552, y: ROW_Y[0], w: 220, h: BH, role: 'server', title: 'Query 1, as written', lines: ['WHERE productline IN', '(${product_var}) AND', 'country IN (${country_var})'] });
const sq = d.box({ x: 552, y: ROW_Y[1], w: 220, h: BH, role: 'server', title: 'Prepared statement', lines: ['WHERE productline IN (?)', 'AND country IN (?)', 'each value bound, no quotes'] });

// ── Underneath: the database runs the prepared statement ──────────────
const db = d.bar({ x: 16, y: 382, w: 768, h: 60, role: 'store', iconName: 'database', title: 'SampleData runs the prepared statement', line: 'with the defaults, Classic Cars and Australia: 53 rows; with Ships and Finland: 9 rows' });

// ── Arrows ────────────────────────────────────────────────────────────
// Each query fills its own prompt.
d.arrow({ x1: qp.r, y1: qp.cy, x2: pp.x - 3, y2: pp.cy });
d.arrow({ x1: qc.r, y1: qc.cy, x2: pc.x - 3, y2: pc.cy });
// The chosen values go into Query 1's two ${ } references.
d.arrow({ x1: pp.r, y1: pp.cy, x2: q1.x - 3, y2: q1.cy - 14 });
d.arrow({ x1: pc.r, y1: pc.cy, x2: q1.x - 3, y2: q1.cy + 22 });
// The data factory swaps each ${name} for a ? and binds the value.
d.arrow({ x1: q1.cx, y1: q1.b, x2: sq.cx, y2: sq.y - 3, vertical: true, label: ['each ${name} becomes ?'] });
// The prepared statement goes to the database.
d.arrow({ x1: sq.cx, y1: sq.b, x2: sq.cx, y2: db.y - 3, vertical: true });
// Cascading, not built in the workshop: if country_list named
// ${product_var}, a new product line would re-run it. Dashed.
d.arrow({ x1: pp.x + 40, y1: pp.b, x2: qc.r - 40, y2: qc.y - 3, vertical: true, dashed: true, label: ['cascading: if country_list', 'named ${product_var}'], lx: 420, ly: 209 });

d.write(import.meta.url);
