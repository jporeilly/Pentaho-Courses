// Content linking in the Product Performance dashboard: the Analyzer
// panel publishes Product, the Territory Sales Mix pie takes it as
// {PRODUCT} and publishes Territory, and the Order Status bar chart takes
// both. Underneath, the report reads the cube while each chart re-runs a
// metadata query on Orders: the parameters are the only contract between
// the panels. It sits in
// 15-dashboard-designer-product-performance/guide.md, tab "7. Take Both
// Parameters", after the "COUNT_DISTINCT became a GROUP BY" under-the-
// hood box, with a "Read the diagram" paragraph after it.
//
// Every fact comes from lesson 15 (15-dashboard-designer-product-
// performance):
//   - Workshop intro and "1. Template & Reports": the 1 and 2 layout
//     template, a tall Untitled 1 beside Untitled 2 and Untitled 3, page
//     title Product Performance Dashboard.
//   - "2. Product Sales Report" and "3. Link the Product": the Product
//     Sales by Year analysis (an Analyzer report) in a panel titled
//     Product Sales Analysis; content linking enabled for Product. Under
//     the hood: that declares an output parameter, which the panel emits
//     whenever a viewer clicks a member.
//   - "4. Territory Pie Chart" and "5. Take the Product": a pie chart on
//     the Orders data source, Territory and SUM of Total, condition
//     Product Name exactly matches {PRODUCT}, default 18th century
//     schooner; its PRODUCT Source is Product Sales Analysis - Product;
//     content linking enabled for Territory, so the pie publishes in
//     turn. Under the hood: each click re-runs the panel's metadata query
//     with the new value in the WHERE clause; the chart never touches the
//     cube and the report never touches the SQL; the parameter is the
//     only contract between panels.
//   - "6. Order Status Chart" and "7. Take Both Parameters": a bar chart
//     on Orders, Status by Product Name, Order Number COUNT_DISTINCT,
//     conditions {PRODUCT} (default 18th century schooner) and
//     {TERRITORY} (default NA); PRODUCT from Product Sales Analysis -
//     Product, TERRITORY from Territory Sales Mix for {PRODUCT} -
//     Territory. Under the hood: a click on the report re-runs the pie
//     and then the bar; a click on the pie re-runs only the bar.
//   - Lesson 09: an Analyzer report's data source is a Mondrian schema
//     (the cube, cog icon as in the other courses' diagrams).
//
// Colors: slate the dashboard (a container), amber its three panels (in
// the browser), violet Mondrian (an engine), teal the Orders metadata
// model, white the takeaway. Solid arrows carry a published parameter;
// dashed arrows are the queries each panel runs on its own data.
//
// Run from this folder:   node content-linking.svg.mjs
// It writes content-linking.svg here and ../images/content-linking.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: 800 wide. The dashboard panel holds the three panels
// laid out like the 1 and 2 template: the report on the left, the two
// charts stacked on the right, with 196px between for the arrows and
// their pills. Every box is the same size.
const W = 800, BW = 260, BH = 88;
const LX = 32, RX = W - 52 - BW; // left and right box columns (20px spare on the right for the pie's query path)
const TOPY = 76, BOTY = TOPY + BH + 56; // the two chart rows
const d = new Diagram(W, 560);

// ── The dashboard (slate panel) ───────────────────────────────────────
// Its subtitle carries the cascade order the lesson spells out.
const DTOP = 16, DFOOT = BOTY + BH + 16;
d.panel({ x: 16, y: DTOP, w: W - 32, h: DFOOT - DTOP, role: 'support', iconName: 'layout-dashboard', title: 'Product Performance Dashboard', sub: 'a click on the report re-runs the pie, then the bar; a click on the pie, only the bar' });

// The three panels (amber: content in the browser). The report sits
// level with the middle of the two charts.
const rep = d.box({ x: LX, y: (TOPY + BOTY + BH) / 2 - BH / 2, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Product Sales Analysis', lines: ['Product Sales by Year,', 'an Analyzer report;', 'publishes Product'] });
const pie = d.box({ x: RX, y: TOPY, w: BW, h: BH, role: 'browser', iconName: 'chart-pie', title: 'Territory Sales Mix', lines: ['Product Name = {PRODUCT},', 'default 18th century schooner;', 'publishes Territory'] });
const bar = d.box({ x: RX, y: BOTY, w: BW, h: BH, role: 'browser', iconName: 'chart-bar-big', title: 'Order Status', lines: ['distinct orders by status', 'for {PRODUCT} & {TERRITORY}', '(default Territory: NA)'] });

// The published parameters: Product from the report to both charts
// (curves across the gap), Territory from the pie down to the bar.
d.arrow({ x1: rep.r, y1: rep.cy - 12, x2: pie.x - 3, y2: pie.cy, label: 'Product' });
d.arrow({ x1: rep.r, y1: rep.cy + 12, x2: bar.x - 3, y2: bar.cy, label: 'Product' });
d.arrow({ x1: pie.cx, y1: pie.b, x2: bar.cx, y2: bar.y - 3, straight: true, label: 'Territory' });

// ── Underneath: what each panel queries ───────────────────────────────
// Mondrian (violet) under the report, the Orders metadata model (teal)
// under the charts. Neither side sees the other's data.
const QY = DFOOT + 48;
const mon = d.box({ x: LX, y: QY, w: BW, h: 72, role: 'engine', iconName: 'cog', title: 'Mondrian', lines: ['the cube the report reads'] });
const ord = d.box({ x: RX, y: QY, w: BW, h: 72, role: 'model', iconName: 'shapes', title: 'Orders metadata model', lines: ['each chart re-runs its query', 'with the value in WHERE'] });

// Dashed query arrows: straight down from the report and from the bar;
// the pie's goes out its right edge, down the margin beside the bar and
// into the model's right edge (drawn by hand: it turns twice).
d.arrow({ x1: rep.cx, y1: rep.b, x2: mon.cx, y2: mon.y - 3, straight: true, dashed: true });
d.arrow({ x1: bar.cx, y1: bar.b, x2: ord.cx, y2: ord.y - 3, straight: true, dashed: true });
const mx = pie.r + 18;
d.edges.push(`<path d="M${pie.r} ${pie.cy}H${mx}V${ord.cy}H${ord.r + 3}" fill="none" stroke="#64748b" stroke-width="1.7" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`);

// ── The takeaway: a white bar ─────────────────────────────────────────
const ty = QY + 72 + 24;
const take = d.bar({ x: 16, y: ty, w: W - 32, h: 62, role: 'result', iconName: 'link', title: 'The parameter is the only contract between panels', line: 'the chart never touches the cube, and the report never touches the SQL' });

// Size the canvas to the takeaway's foot.
d.h = take.b + 16;

d.write(import.meta.url);
