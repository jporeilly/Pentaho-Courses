// What you'll build in Sales Territory (06): a mock-up of the finished
// Sales Territory Report as it runs in the User Console, its first group
// (Territory NA > Country Canada) in full with its Country Subtotal, the
// NA Territory Subtotal, and the Grand Total. It sits at the top of
// 06-interactive-reports-sales-territory/guide.md, after the workshop's
// intro and before the screenshot of the finished report, with a "Read
// the diagram" paragraph after it.
//
// Where every value comes from (guide = 06-.../guide.md; solution =
// 06-.../files/Sales Territory Report - Demo.prpti, a zip):
//   - Header "Steel Wheels, Inc.": guide line 772; solution styles.xml.
//     The header's print date is left out (it is the day it runs).
//   - Title "Sales Territory Report", centered: guide lines 754-756;
//     solution layout.xml line 22.
//   - Groups "Territory: NA" then "Country: Canada": solution
//     layout.xml lines 65 and 94 ("Territory: $(...)", "Country:
//     $(...)"); Territory sorted Descending (guide line 379; the
//     solution's MQL orders Territory DESC, Country ASC), so NA comes
//     first, then Canada (guide line 415 checkpoint).
//   - Columns Customer Name, City, Order Number, Order Date, Revenue,
//     Tax: solution wizard-specification.xml detail fields (Total shown
//     as "Revenue", guide line 794). City centered, header bold (guide
//     lines 781-782; the Order Number header copies it, line 791);
//     Order Date MM-dd-yyyy, Revenue $#,###, Tax $#,###.00
//     right-aligned (solution wizard-specification.xml; guide lines
//     792-793).
//   - The seven Canada rows (customer, city, order number, date, Total):
//     image ir_sales_territory_descending_sort_on_territory.png, which
//     lists all seven before the Customer Name sort. Sorted Customer
//     Name Descending (guide line 406; solution MQL), so Royal Canadian
//     Collectables first, then Québec Home Shopping Network, then
//     Canadian Gift Exchange Network; Royal Canadian's 10283 above 10235
//     as in image ir_sales_territory_sales_territory_report.png. The
//     query sorts on nothing after Customer Name, so the other two
//     customers' orders keep the order of the first image.
//   - Revenue: the Total values in that image, formatted $#,###. Tax:
//     Total x 0.15 (guide line 700, the Tax formula), formatted
//     $#,###.00; 43,361 x 0.15 = $6,504.15 and 31,304 x 0.15 = $4,695.60
//     match the finished-report image.
//   - Country Subtotal $224,085: guide line 682 ($224,085.00 before the
//     $#,### format; the seven values add up to it). Label text: guide
//     lines 671 and 680; solution layout.xml lines 311, 397, 493. The
//     subtotal cells take the column's $#,### format (solution
//     layout.xml group-footer-summary format strings); the grand total
//     cell keeps $#,##0.00 (layout.xml line 504).
//   - NA Territory Subtotal $3,852,214: not printed in the lesson;
//     computed from the Steel Wheels sample data in
//     lab-kits/MySQL/sampledata_data.sql (ORDERDETAILS: quantity x the
//     unit price rounded half down to whole dollars, the Orders model's
//     Total), the rule that reproduces every IR figure the course
//     prints: Canada $224,085, Grand Total $10,644,855, the capstone's
//     $630,525, $535,481 and $115,426, lesson 07's $460,810 and
//     $730,609.
//   - Grand Total $10,644,855.00: guide line 682.
//   - Tax has no subtotal: a calculated field cannot be aggregated
//     (guide, Calculated Fields: "Aggregation not supported").
//
// Colors and icons as in report-mockup.mjs and this folder's README:
// amber the User Console panel the report runs in (file-text, an
// Interactive Report), slate the column headings, teal the group
// headers, violet the totals the report engine computes, stone the rows
// left out.
//
// Run from this folder:   node report-sales-territory.svg.mjs
// It writes report-sales-territory.svg here and
// ../images/report-sales-territory.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { pageHeader, reportTitle, grid, legend, ROW_H } from './report-mockup.mjs';

// Canvas: 800 wide; the panel is inset 16px, the page inside it 32px.
const W = 800, X = 32, PW = 736;

// The grid's columns, adding up to the page width (736). Customer Name
// is widest, for "Royal Canadian Collectables, Ltd."; Revenue is wide
// enough for the Grand Total, $10,644,855.00. The money columns are
// right-aligned, as their number formats print.
const cols = [
  { w: 216, align: 'left' }, // Customer Name
  { w: 100, align: 'center' }, // City (centered, step 6.5)
  { w: 104, align: 'left' }, // Order Number
  { w: 100, align: 'right' }, // Order Date
  { w: 114, align: 'right' }, // Revenue
  { w: 102, align: 'right' }, // Tax
];

// The seven Canada rows: customer, city, order, date, Revenue, Tax.
const canada = [
  ['Royal Canadian Collectables, Ltd.', 'Tsawassen', '10283', '08-20-2004', '$43,361', '$6,504.15'],
  ['Royal Canadian Collectables, Ltd.', 'Tsawassen', '10235', '04-02-2004', '$31,304', '$4,695.60'],
  ['Québec Home Shopping Network', 'Montréal', '10171', '11-05-2003', '$15,964', '$2,394.60'],
  ['Québec Home Shopping Network', 'Montréal', '10261', '06-17-2004', '$24,550', '$3,682.50'],
  ['Québec Home Shopping Network', 'Montréal', '10411', '05-01-2005', '$33,710', '$5,056.50'],
  ['Canadian Gift Exchange Network', 'Vancouver', '10313', '10-22-2004', '$36,576', '$5,486.40'],
  ['Canadian Gift Exchange Network', 'Vancouver', '10206', '12-05-2003', '$38,620', '$5,793.00'],
];

// The rows top to bottom. A total's label sits in the cells to the left
// of its value (spanning Order Number and Order Date), as the lesson's
// double-click labels do.
const label = (t) => ({ t, span: 2, align: 'right' });
const rows = [
  { kind: 'group1', text: 'Territory: NA' },
  { kind: 'group2', text: 'Country: Canada' },
  { kind: 'head', cells: ['Customer Name', { t: 'City', bold: true }, { t: 'Order Number', bold: true, align: 'center' }, 'Order Date', 'Revenue', 'Tax'] },
  ...canada.map((cells, i) => ({ kind: i % 2 ? 'alt' : 'row', cells })),
  { kind: 'sub', cells: ['', '', label('Country Subtotal'), '$224,085', ''] },
  { kind: 'gap', text: 'Country: USA, with its customers and its Country Subtotal' },
  { kind: 'sub', cells: ['', '', label('Territory Subtotal'), '$3,852,214', ''] },
  { kind: 'gap', text: 'Territories Japan, EMEA and APAC (descending), each with its countries and subtotals' },
  { kind: 'total', cells: ['', '', label('Grand Total'), '$10,644,855.00', ''] },
];

// Vertical layout: panel title strip (with a sub line), page header,
// title, the grid, then the legend under the panel.
const PANEL_Y = 16, TOP = PANEL_Y + 64;
const gridTop = TOP + 20 + 14 + 32 + 10; // header, gap, title, gap
const gridH = rows.length * ROW_H;
const panelH = gridTop + gridH + 18 - PANEL_Y;
const LEG = PANEL_Y + panelH + 16;
const d = new Diagram(W, LEG + 30);

// ── The panel: the report open in the User Console (amber) ────────────
d.panel({ x: 16, y: PANEL_Y, w: W - 32, h: panelH, role: 'browser', iconName: 'file-text', title: 'Sales Territory Report - Demo (Interactive Report, landscape)', sub: 'Grouped by Territory (descending) and Country; rows sorted by Customer Name, descending; no filters' });

// ── The page: header text and rule, then the centered title ───────────
const hy = pageHeader(d, { x: X, y: TOP, w: PW, left: 'Steel Wheels, Inc.' });
reportTitle(d, { x: X, y: hy + 14, w: PW, text: 'Sales Territory Report' });

// ── The grid ──────────────────────────────────────────────────────────
grid(d, { x: X, y: gridTop, cols, rows });

// ── Legend ────────────────────────────────────────────────────────────
legend(d, { x: X, y: LEG, items: [
  ['head', 'column headings'],
  ['group2', 'group headers'],
  ['sub', 'subtotals and Grand Total (report engine)'],
  ['gap', 'rows left out here'],
] });

d.write(import.meta.url);
