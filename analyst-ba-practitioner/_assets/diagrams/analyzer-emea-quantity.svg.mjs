// What you'll build in EMEA Quantity (11): a mock-up of the finished
// analysis, EMEA Quantity Sold by Territory Yr2004, in its table view:
// the two filters, then Quantity with its green data bar and Rank by
// Quantity for the first five EMEA countries, and the Grand Total row.
// It sits at the top of 11-analyzer-reports-emea-quantity/guide.md,
// after the tree map of the finished analysis and before the steps, with
// a "Read the diagram" paragraph after it.
//
// Where every value comes from (guide = 11-.../guide.md; solution =
// 11-.../files/EMEA Quantity Sold by Territory Yr2004.xanalyzer):
//   - Name "EMEA Quantity Sold by Territory Yr2004", the
//     SteelWheelsSales cube, saved as a Treemap: guide lines 167-176;
//     the solution's report element (cube SteelWheelsSales, chart type
//     pentaho/visual/models/Treemap).
//   - Filters Territory includes EMEA and Years includes 2004: guide
//     lines 76 and 86; image az_emea_quantity_filters_panel.png; the
//     solution's two filters ([Markets].[EMEA], [Time].[2004]).
//   - Rows Territory then Country, columns Years, measures Quantity and
//     Rank by Quantity: guide lines 55-58 and 125; the solution's
//     rowAttributes, columnAttributes and measures (Quantity with
//     formatShortcut DATA_BAR_GREEN, guide line 100; a RANK measure
//     labeled "Rank by Quantity").
//   - Grand Total row: guide line 152 (Grand Totals for Columns; the
//     solution's showColumnGrandTotal true), shown as the table's last
//     row with 23,630 and a dash under Rank.
//   - The values (Austria 491, rank 12; Belgium 799, 10; Denmark 1,120,
//     6; Finland 778, 11; France 5,632, 1; Spain 4,962, 2; Germany to UK
//     eight more; Grand Total 23,630): image
//     az_emea_quantity_layout_and_table.png; guide line 162 (France
//     5,632 rank 1, Spain 4,962 second, Grand Total 23,630).
//     Cross-checked against the Steel Wheels sample data in
//     lab-kits/MySQL/sampledata_data.sql (ORDERFACT quantity by EMEA
//     country for 2004), which gives all 13 countries to the unit.
//   - Each data bar's length is the country's share of the largest
//     value in the column, France's 5,632, as the image shows.
//
// Colors and icons as in report-mockup.mjs and this folder's README:
// amber the User Console panel (chart-column, an Analyzer report) and
// its filter chips, slate the level and measure headings, light slate
// the members, green the lesson's own Data Bar: Green, violet the Grand
// Total Mondrian computes, stone the rows left out.
//
// Run from this folder:   node analyzer-emea-quantity.svg.mjs
// It writes analyzer-emea-quantity.svg here and
// ../images/analyzer-emea-quantity.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { chips, grid, mergeDown, legend, ROW_H } from './report-mockup.mjs';

// Canvas: 800 wide; the panel is inset 16px, the table inside it 32px.
const W = 800, X = 32, PW = 736;

// The pivot's columns: Territory and Country down the side, then the
// two measures under 2004. Quantity is widest, for its data bar.
const cols = [
  { w: 110, align: 'left' }, // Territory
  { w: 170, align: 'left' }, // Country
  { w: 276, align: 'right' }, // Quantity
  { w: 180, align: 'right' }, // Rank by Quantity
];

// The first five countries, alphabetical as Analyzer lists them:
// country, Quantity, rank. MAX is France's 5,632, the longest bar.
const MAX = 5632;
const countries = [
  ['Austria', 491, '12'],
  ['Belgium', 799, '10'],
  ['Denmark', 1120, '6'],
  ['Finland', 778, '11'],
  ['France', 5632, '1'],
];
const fmt = (n) => n.toLocaleString('en-US');

// The rows: the Years level, the 2004 member, the headings, the five
// countries, a note for the eight left out, then the Grand Total. The
// Territory column under the headings is drawn once, merged, after the
// grid (null cells draw nothing).
const center = (t, span = 1) => ({ t, span, align: 'center' });
const rows = [
  { kind: 'head', cells: [null, null, { t: 'Years', span: 2, align: 'left' }] },
  { kind: 'member', cells: [null, null, center('2004', 2)] },
  { kind: 'head', cells: ['Territory', 'Country', center('Quantity'), center('Rank by Quantity')] },
  ...countries.map(([c, q, r]) => ({ kind: 'row', cells: [null, { t: c, kind: 'member' }, { t: fmt(q), bar: q, barMax: MAX }, r] })),
  { kind: 'row', cells: [null, { t: 'Germany to UK: eight more countries, Spain second at 4,962', span: 3, kind: 'gap', align: 'center' }] },
  { kind: 'total', cells: [{ t: 'Grand Total', span: 2 }, '23,630', '-'] },
];

// Vertical layout: panel title strip (with a sub line), the filter
// chips, the pivot table, then the legend under the panel.
const PANEL_Y = 16, TOP = PANEL_Y + 64;
const gridTop = TOP + 24 + 16;
const panelH = gridTop + rows.length * ROW_H + 18 - PANEL_Y;
const LEG = PANEL_Y + panelH + 16;
const d = new Diagram(W, LEG + 30);

// ── The panel: the analysis open in the User Console (amber) ──────────
d.panel({ x: 16, y: PANEL_Y, w: W - 32, h: panelH, role: 'browser', iconName: 'chart-column', title: 'EMEA Quantity Sold by Territory Yr2004 (Analyzer report)', sub: 'SteelWheelsSales cube; saved as a Treemap, shown here in its table view' });

// ── The filters in force ──────────────────────────────────────────────
chips(d, { x: X, y: TOP, w: PW, items: [
  { kind: 'filter', text: 'Territory includes EMEA' },
  { kind: 'filter', text: 'Years includes 2004' },
] });

// ── The pivot table ───────────────────────────────────────────────────
const g = grid(d, { x: X, y: gridTop, cols, rows });
// EMEA, the one Territory member, once beside its countries and the note.
mergeDown(d, { x: X, y: g.rowY[3], w: cols[0].w, h: (countries.length + 1) * ROW_H, text: 'EMEA' });

// ── Legend ────────────────────────────────────────────────────────────
legend(d, { x: X, y: LEG, items: [
  ['chip', 'filters'],
  ['head', 'levels and measures'],
  ['member', 'members'],
  ['bar', 'Data Bar: Green'],
  ['total', 'Grand Total (Mondrian)'],
  ['gap', 'rows left out'],
] });

d.write(import.meta.url);
