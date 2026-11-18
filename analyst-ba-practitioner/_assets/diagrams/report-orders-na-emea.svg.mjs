// What you'll build in Orders — NA and EMEA (07): a mock-up of the
// finished Orders Shipped from Jan 1st 2005 report as it runs in the
// User Console: its three filters, its first group (Territory EMEA >
// Product Line Classic Cars) with the first order lines and the Line
// subtotal, then each Territory Total and the Grand Total. It sits at the
// top of 07-interactive-reports-orders-na-and-emea/guide.md, after the
// workshop's intro and before the screenshot of the finished report,
// with a "Read the diagram" paragraph after it.
//
// Where every value comes from (guide = 07-.../guide.md; solution =
// 07-.../files/Shipped Orders Activity - Jan 1st 2005.prpti, a zip):
//   - Header "Steel Wheels, Inc." and the centered title "Orders Shipped
//     from Jan 1st 2005": guide lines 174-176; solution layout.xml line
//     22 and styles.xml. The header's print date is left out.
//   - Filters, joined by AND: Territory includes EMEA, NA; Status
//     includes Shipped; Order Date on or after 2005-01-01: guide lines
//     104-108 and image ir_orders_filters.png; the solution's MQL
//     constraint, AND(IN(Territory;"EMEA";"NA"); IN(Status;"Shipped");
//     Order Date >= DATEVALUE("2005-01-01")).
//   - Groups Territory then Product Line, both ascending, rows sorted by
//     Order Date ascending (guide line 93; the solution's MQL orders), so
//     EMEA and Classic Cars come first: solution layout.xml lines 66 and
//     95, image ir_orders_orders_shipped.png.
//   - Columns Product Name, Order Date, Order Number, Status, Quantity
//     Ordered, Order Total (Total renamed, guide line 188), widths 25%,
//     16.667%, 12%, 16.667%, 16.666%, 13% (solution
//     wizard-specification.xml; guide line 185), headers centered (guide
//     line 186), Order Total $#,### (guide line 187).
//   - The first four rows (1961 Chevrolet Impala, 1968 Ford Mustang,
//     1969 Dodge Super Bee, 1976 Ford Gran Torino; order 10363 of
//     01-06-2005, Shipped, 43, 33, 46, 24, $5,160, $2,805, $2,760,
//     $4,152): image ir_orders_orders_shipped.png (and
//     ir_orders_filters.png, with cents before the format). The order of
//     lines within one order date is the database's, so only these four
//     are drawn.
//   - Line subtotal (EMEA > Classic Cars) $324,125, the EMEA Territory
//     Total $730,609, the NA Territory Total $460,810, the Grand Total
//     $1,191,419.00: guide line 157; image ir_orders_totals.png. Labels
//     "Line subtotal:", "Territory Total:", "Grand Total:": guide lines
//     153-155; solution layout.xml lines 333, 419, 504. The group
//     totals take Order Total's $#,### format, the grand total
//     $#,##0.00 (solution layout.xml summary format strings).
//   - Each territory has all seven product lines (Classic Cars to
//     Vintage Cars): the lesson's 316 filtered rows (guide line 136)
//     cross-checked against the Steel Wheels sample data in
//     lab-kits/MySQL/sampledata_data.sql, which also gives the four
//     totals above to the dollar.
//
// Colors and icons as in report-mockup.mjs and this folder's README:
// amber the User Console panel (file-text, an Interactive Report) and
// its filter chips, slate the column headings, teal the group headers,
// violet the totals the report engine computes, stone the rows left out.
//
// Run from this folder:   node report-orders-na-emea.svg.mjs
// It writes report-orders-na-emea.svg here and
// ../images/report-orders-na-emea.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { pageHeader, reportTitle, chips, grid, legend, ROW_H } from './report-mockup.mjs';

// Canvas: 800 wide; the panel is inset 16px, the page inside it 32px.
const W = 800, X = 32, PW = 736;

// The grid's columns: the solution's percentages of the 736px page,
// rounded so they add up to 736. Cell alignment as the finished report
// prints it: text left, dates and numbers right.
const cols = [
  { w: 184, align: 'left' }, // Product Name, 25%
  { w: 123, align: 'right' }, // Order Date, 16.667%
  { w: 88, align: 'left' }, // Order Number, 12%
  { w: 123, align: 'left' }, // Status, 16.667%
  { w: 122, align: 'right' }, // Quantity Ordered, 16.666%
  { w: 96, align: 'right' }, // Order Total, 13%
];

// The headers, all centered (guide line 186).
const head = ['Product Name', 'Order Date', 'Order Number', 'Status', 'Quantity Ordered', 'Order Total'].map((t) => ({ t, align: 'center' }));

// The first four order lines of EMEA > Classic Cars.
const lines = [
  ['1961 Chevrolet Impala', '01-06-2005', '10363', 'Shipped', '43', '$5,160'],
  ['1968 Ford Mustang', '01-06-2005', '10363', 'Shipped', '33', '$2,805'],
  ['1969 Dodge Super Bee', '01-06-2005', '10363', 'Shipped', '46', '$2,760'],
  ['1976 Ford Gran Torino', '01-06-2005', '10363', 'Shipped', '24', '$4,152'],
];

// A total row: its label right-aligned in the Quantity Ordered cell, to
// the left of the value, as the lesson's double-click labels sit.
const total = (kind, label, value) => ({ kind, cells: ['', '', '', '', { t: label, align: 'right' }, value] });
const rows = [
  { kind: 'group1', text: 'Territory: EMEA' },
  { kind: 'group2', text: 'Product Line: Classic Cars' },
  { kind: 'head', cells: head },
  ...lines.map((cells, i) => ({ kind: i % 2 ? 'alt' : 'row', cells })),
  { kind: 'gap', text: 'The rest of EMEA’s Classic Cars order lines, in Order Date order' },
  total('sub', 'Line subtotal:', '$324,125'),
  { kind: 'gap', text: 'Product Lines Motorcycles to Vintage Cars, each with its Line subtotal' },
  total('sub', 'Territory Total:', '$730,609'),
  { kind: 'gap', text: 'Territory: NA, its seven product lines and their Line subtotals' },
  total('sub', 'Territory Total:', '$460,810'),
  { kind: 'total', cells: ['', '', '', { t: 'Grand Total:', span: 2, align: 'right' }, '$1,191,419.00'] },
];

// Vertical layout: panel title strip (with a sub line), page header,
// title, the filter chips, the grid, then the legend under the panel.
const PANEL_Y = 16, TOP = PANEL_Y + 64;
const titleY = TOP + 20 + 14;
const chipY = titleY + 32 + 14;
const gridTop = chipY + 24 + 14;
const panelH = gridTop + rows.length * ROW_H + 18 - PANEL_Y;
const LEG = PANEL_Y + panelH + 16;
const d = new Diagram(W, LEG + 30);

// ── The panel: the report open in the User Console (amber) ────────────
d.panel({ x: 16, y: PANEL_Y, w: W - 32, h: panelH, role: 'browser', iconName: 'file-text', title: 'Shipped Orders Activity - Jan 1st 2005 (Interactive Report)', sub: 'Grouped by Territory and Product Line; rows sorted by Order Date; Row Limit: Maximum' });

// ── The page: header, title, then the three filters in force ──────────
pageHeader(d, { x: X, y: TOP, w: PW, left: 'Steel Wheels, Inc.' });
reportTitle(d, { x: X, y: titleY, w: PW, text: 'Orders Shipped from Jan 1st 2005' });
chips(d, { x: X, y: chipY, w: PW, items: [
  { kind: 'filter', text: 'Territory includes EMEA, NA' },
  { kind: 'filter', text: 'Status includes Shipped' },
  { kind: 'filter', text: 'Order Date on or after 2005-01-01' },
] });

// ── The grid ──────────────────────────────────────────────────────────
grid(d, { x: X, y: gridTop, cols, rows });

// ── Legend ────────────────────────────────────────────────────────────
legend(d, { x: X, y: LEG, items: [
  ['chip', 'filters, joined by AND'],
  ['head', 'column headings'],
  ['group2', 'group headers'],
  ['sub', 'totals (report engine)'],
  ['gap', 'rows left out here'],
] });

d.write(import.meta.url);
