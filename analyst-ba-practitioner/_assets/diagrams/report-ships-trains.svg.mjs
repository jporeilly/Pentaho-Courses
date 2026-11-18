// What you'll build in Ships and Trains (08): a mock-up of the finished
// Customer Report: Ships and Trains Ordered as it runs in the User
// Console: the Product Line filter, the whole of its first territory
// (APAC: Ships, then Trains, each with its Line Subtotal, then the
// Territory subtotal), the Grand Total, and the page footer. It sits at
// the top of 08-interactive-reports-ships-and-trains/guide.md, after the
// workshop's intro and before the screenshot of the finished report,
// with a "Read the diagram" paragraph after it.
//
// Where every value comes from (guide = 08-.../guide.md; solution =
// 08-.../files/Ships and Trains Ordered.prpti, a zip):
//   - Page header "Steel Wheels, Inc." and page footer "Prepared for the
//     Sales Manager": guide lines 126-127 and 155; solution styles.xml.
//     The header's print date is left out.
//   - Title "Customer Report: Ships and Trains Ordered", at the left as
//     the template prints it: guide line 125; solution layout.xml line
//     22; image ir_ships_trains_report_ships_and_trains.png.
//   - Filter Product Line includes Ships, Trains: guide line 75; the
//     solution's MQL constraint IN(Product Line;"Ships";"Trains").
//   - Groups Territory then Product Line, ascending, rows sorted by Order
//     Date ascending: guide line 85; the solution's MQL orders; solution
//     layout.xml lines 65 and 94.
//   - Columns Customer Name 40% left, Order Date 20% centered, Status
//     25% centered, Quantity Ordered 15% right: guide lines 140-143;
//     solution wizard-specification.xml.
//   - APAC > Ships, five rows (Extreme Desk Decorations, Ltd 03-30-2004
//     Shipped 77; GiftsForHim.com 06-16-2004 Cancelled 33; Kelly's Gift
//     Shop 12-16-2004 Shipped 262; Souveniers And Things Co. 12-17-2004
//     Shipped 24; Australian Collectables, Ltd 05-09-2005 Disputed 32)
//     and its Line Subtotal 428: image
//     ir_ships_trains_report_ships_and_trains.png; guide line 121.
//   - APAC > Trains, three rows (Australian Gift Network, Co 09-25-2003
//     Shipped 33; GiftsForHim.com 06-16-2004 Cancelled 77; Kelly's Gift
//     Shop 12-16-2004 Shipped 29) and its Line Subtotal 139: not shown
//     in the lesson; computed with the solution's query (Quantity
//     Ordered summed per customer, order date and status) from the Steel
//     Wheels sample data in lab-kits/MySQL/sampledata_data.sql, which
//     reproduces the five Ships rows above exactly, and 139 = 567 - 428.
//   - Territory subtotal (APAC) 567 and Grand Total 11,317: guide line
//     121. Labels "Line Subtotal:", "Territory subtotal:", "Grand
//     Total:": guide line 119; solution layout.xml lines 273, 341, 419.
//     Totals formatted #,###.## as the column (solution layout.xml).
//
// Colors and icons as in report-mockup.mjs and this folder's README:
// amber the User Console panel (file-text, an Interactive Report) and
// its filter chip, slate the column headings and the page furniture,
// teal the group headers, violet the totals the report engine computes,
// stone the rows left out.
//
// Run from this folder:   node report-ships-trains.svg.mjs
// It writes report-ships-trains.svg here and
// ../images/report-ships-trains.png at twice the size.
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';
import { pageHeader, reportTitle, chips, grid, legend, ROW_H } from './report-mockup.mjs';

// Canvas: 800 wide; the panel is inset 16px, the page inside it 32px.
const W = 800, X = 32, PW = 736;

// The grid's columns: the guide's percentages of the 736px page, with
// 14px moved from Customer Name to Quantity Ordered for its heading.
const cols = [
  { w: 280, align: 'left' }, // Customer Name, 40% (less 14px, so the Quantity Ordered heading fits)
  { w: 147, align: 'center' }, // Order Date, 20%
  { w: 184, align: 'center' }, // Status, 25%
  { w: 125, align: 'right' }, // Quantity Ordered, 15% (plus 14px)
];
const head = { kind: 'head', cells: ['Customer Name', 'Order Date', 'Status', 'Quantity Ordered'] };

// APAC's rows, by product line, in Order Date order.
const ships = [
  ['Extreme Desk Decorations, Ltd', '03-30-2004', 'Shipped', '77'],
  ['GiftsForHim.com', '06-16-2004', 'Cancelled', '33'],
  ["Kelly's Gift Shop", '12-16-2004', 'Shipped', '262'],
  ['Souveniers And Things Co.', '12-17-2004', 'Shipped', '24'],
  ['Australian Collectables, Ltd', '05-09-2005', 'Disputed', '32'],
];
const trains = [
  ['Australian Gift Network, Co', '09-25-2003', 'Shipped', '33'],
  ['GiftsForHim.com', '06-16-2004', 'Cancelled', '77'],
  ["Kelly's Gift Shop", '12-16-2004', 'Shipped', '29'],
];
const body = (list) => list.map((cells, i) => ({ kind: i % 2 ? 'alt' : 'row', cells }));

// A total row: its label right-aligned in the Status cell, to the left
// of the value.
const total = (kind, label, value) => ({ kind, cells: ['', '', { t: label, align: 'right' }, value] });
const rows = [
  { kind: 'group1', text: 'Territory: APAC' },
  { kind: 'group2', text: 'Product Line: Ships' },
  head,
  ...body(ships),
  total('sub', 'Line Subtotal:', '428'),
  { kind: 'group2', text: 'Product Line: Trains' },
  head,
  ...body(trains),
  total('sub', 'Line Subtotal:', '139'),
  total('sub', 'Territory subtotal:', '567'),
  { kind: 'gap', text: 'Territories EMEA, Japan and NA, each with Ships, Trains and their subtotals' },
  total('total', 'Grand Total:', '11,317'),
];

// Vertical layout: panel title strip (with a sub line), page header,
// title, the filter chip, the grid, the page footer, then the legend.
const PANEL_Y = 16, TOP = PANEL_Y + 64;
const titleY = TOP + 20 + 12;
const chipY = titleY + 32 + 12;
const gridTop = chipY + 24 + 14;
const gridB = gridTop + rows.length * ROW_H;
const footY = gridB + 16;
const panelH = footY + 26 - PANEL_Y;
const LEG = PANEL_Y + panelH + 16;
const d = new Diagram(W, LEG + 30);

// ── The panel: the report open in the User Console (amber) ────────────
d.panel({ x: 16, y: PANEL_Y, w: W - 32, h: panelH, role: 'browser', iconName: 'file-text', title: 'Ships and Trains Ordered (Interactive Report)', sub: 'Grouped by Territory and Product Line; rows sorted by Order Date; Quantity Ordered summed' });

// ── The page: header, title at the left, then the filter in force ─────
pageHeader(d, { x: X, y: TOP, w: PW, left: 'Steel Wheels, Inc.' });
reportTitle(d, { x: X, y: titleY, w: PW, text: 'Customer Report: Ships and Trains Ordered', align: 'left' });
chips(d, { x: X, y: chipY, w: PW, items: [{ kind: 'filter', text: 'Product Line includes Ships, Trains' }] });

// ── The grid ──────────────────────────────────────────────────────────
grid(d, { x: X, y: gridTop, cols, rows });

// ── The page footer: a rule, then the text the lesson types into it ───
d.raw(`<line x1="${X}" y1="${footY}" x2="${X + PW}" y2="${footY}" stroke="#334155" stroke-width="1.2"/>`);
d.raw(`<text x="${X}" y="${footY + 17}" font-size="12" fill="#334155">${esc('Prepared for the Sales Manager')}</text>`);

// ── Legend ────────────────────────────────────────────────────────────
legend(d, { x: X, y: LEG, items: [
  ['chip', 'filter'],
  ['head', 'column headings'],
  ['group2', 'group headers'],
  ['sub', 'subtotals and Grand Total (report engine)'],
  ['gap', 'rows left out here'],
] });

d.write(import.meta.url);
