// What you'll build in Sales Analysis (10): a mock-up of the finished
// analysis, EMEA Revenue by Product Line Yr2003, as Analyzer shows it in
// the User Console: its two filters, then the pivot table with Territory
// and Product Line down the side and 2003's four quarters across the
// top, Revenue in whole dollars. It sits at the top of
// 10-analyzer-reports-sales-analysis/guide.md, after the workshop's
// intro and before its first screenshot, with a "Read the diagram"
// paragraph after it.
//
// Where every value comes from (guide = 10-.../guide.md; solution =
// 10-.../files/EMEA Revenue by Product Line Yr2003.xanalyzer):
//   - Name "EMEA Revenue by Product Line Yr2003", the SteelWheelsSales
//     cube: guide line 863; the solution's report element (catalog
//     SteelWheels, cube SteelWheelsSales). Analyzer has no title of its
//     own: the saved name is the title.
//   - Filters Territory includes EMEA and Years includes 2003: guide
//     lines 432, 452 and 665; the solution's two filters
//     ([Markets].[EMEA], [Time].[2003]).
//   - Rows Territory then Product Line (Line renamed, guide line 820);
//     columns Years then Quarters; the measure Sales renamed Revenue,
//     Currency, 0 decimal places, $ (guide lines 826-832): the
//     solution's rowAttributes, columnAttributes and measure
//     (displayLabel "Revenue", formatCategory "Currency ($)",
//     formatScale 0). No grand totals (showRowGrandTotal and
//     showColumnGrandTotal false; the totals are cleared at guide line
//     637). Drill-through links on measures (guide line 762;
//     showDrillLinks true), so the values are links.
//   - Every value, all seven product lines by QTR1-QTR4, a dash for no
//     sales (Motorcycles QTR1, Planes QTR3; emptyCellDisplay "-"):
//     image az_sales_final_table_emea_revenue_by_product_line_yr2003.png,
//     whose last row label is cut off ("Trucks and Bus..."; the full
//     name is in 16-capstone-apac-sales-pack/guide.md's figures table);
//     guide line 861 ($96,678 and $407,683 for Classic Cars, a dash for
//     Motorcycles QTR1). Cross-checked against the Steel Wheels sample
//     data in lab-kits/MySQL/sampledata_data.sql (ORDERFACT total price
//     summed by EMEA product line and 2003 quarter), which gives all 26
//     values to the dollar.
//
// Colors and icons as in report-mockup.mjs and this folder's README:
// amber the User Console panel (chart-column, an Analyzer report) and
// its filter chips, slate the level and measure headings, light slate
// the members, white the values.
//
// Run from this folder:   node analyzer-sales-analysis.svg.mjs
// It writes analyzer-sales-analysis.svg here and
// ../images/analyzer-sales-analysis.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { chips, grid, mergeDown, legend, ROW_H } from './report-mockup.mjs';

// Canvas: 800 wide; the panel is inset 16px, the table inside it 32px.
const W = 800, X = 32, PW = 736;

// The pivot's columns: two row-header columns, then one per quarter.
const cols = [
  { w: 96, align: 'left' }, // Territory
  { w: 160, align: 'left' }, // Product Line
  ...[0, 1, 2, 3].map(() => ({ w: 120, align: 'right' })), // QTR1-QTR4
];

// The values, Revenue by product line and quarter, as the finished
// table shows them; '-' where a line had no sales that quarter.
const values = [
  ['Classic Cars', '$96,678', '$108,588', '$78,324', '$407,683'],
  ['Motorcycles', '-', '$24,739', '$25,625', '$91,472'],
  ['Planes', '$39,205', '$29,589', '-', '$85,725'],
  ['Ships', '$27,050', '$36,543', '$20,564', '$88,270'],
  ['Trains', '$9,264', '$6,548', '$4,353', '$9,373'],
  ['Trucks and Buses', '$36,801', '$45,586', '$40,479', '$105,832'],
  ['Vintage Cars', '$77,577', '$52,262', '$7,113', '$126,742'],
];

// The rows, top to bottom. The column axis takes four header rows: the
// Years level, the Quarters level, the 2003 member, then the quarter
// members; the fifth names the row levels and the measure. The top-left
// corner is empty (null cells draw nothing). Each product line is a
// member heading, and each value a drill-through link.
const center = (t, span = 1) => ({ t, span, align: 'center' });
const rows = [
  { kind: 'head', cells: [null, null, { t: 'Years', span: 4, align: 'left' }] },
  { kind: 'head', cells: [null, null, { t: 'Quarters', span: 4, align: 'left' }] },
  { kind: 'member', cells: [null, null, center('2003', 4)] },
  { kind: 'member', cells: [null, null, center('QTR1'), center('QTR2'), center('QTR3'), center('QTR4')] },
  { kind: 'head', cells: ['Territory', 'Product Line', center('Revenue'), center('Revenue'), center('Revenue'), center('Revenue')] },
  ...values.map(([line, ...v]) => ({ kind: 'row', cells: [null, { t: line, kind: 'member' }, ...v.map((t) => (t === '-' ? t : { t, link: true }))] })),
];

// Vertical layout: panel title strip (with a sub line), the filter
// chips, the pivot table, then the legend under the panel.
const PANEL_Y = 16, TOP = PANEL_Y + 64;
const gridTop = TOP + 24 + 16;
const panelH = gridTop + rows.length * ROW_H + 18 - PANEL_Y;
const LEG = PANEL_Y + panelH + 16;
const d = new Diagram(W, LEG + 30);

// ── The panel: the analysis open in the User Console (amber) ──────────
d.panel({ x: 16, y: PANEL_Y, w: W - 32, h: panelH, role: 'browser', iconName: 'chart-column', title: 'EMEA Revenue by Product Line Yr2003 (Analyzer report)', sub: 'SteelWheelsSales cube; Sales renamed Revenue, currency with no decimals; drill-through links on' });

// ── The filters in force ──────────────────────────────────────────────
chips(d, { x: X, y: TOP, w: PW, items: [
  { kind: 'filter', text: 'Territory includes EMEA' },
  { kind: 'filter', text: 'Years includes 2003' },
] });

// ── The pivot table ───────────────────────────────────────────────────
const g = grid(d, { x: X, y: gridTop, cols, rows });
// EMEA, the one Territory member, once beside all seven product lines.
mergeDown(d, { x: X, y: g.rowY[5], w: cols[0].w, h: values.length * ROW_H, text: 'EMEA' });

// ── Legend ────────────────────────────────────────────────────────────
legend(d, { x: X, y: LEG, items: [
  ['chip', 'filters'],
  ['head', 'levels and the measure'],
  ['member', 'members'],
  ['row', 'Revenue (underlined: a drill-through link)'],
] });

d.write(import.meta.url);
