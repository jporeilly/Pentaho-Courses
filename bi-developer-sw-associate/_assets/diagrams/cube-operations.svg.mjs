// Key Concepts, Multidimensional tab: the five things you do to a cube -
// slice, dice, drill down, roll up and pivot - each shown on the SteelWheels
// cube as the grid Analyzer would give back. Replaces the stock picture
// concepts_data_cube_operations.png.
//
// Every figure is the cube's Sales measure (SUM of ORDERFACT.TOTALPRICE,
// formatString "#,###", so whole numbers as Analyzer shows them), checked
// with SQL on SampleData (2026-11-18):
//   - by CUSTOMER_W_TER.TERRITORY and ORDERFACT.YEAR_ID: the starting grid;
//     the grand total 10,645,949.18 is the one the Mondrian Security lesson
//     (14) measured for All Customers, NA 3,852,061.39 and USA 3,627,982.83.
//   - NA's countries: USA 3,627,983, Canada 224,079 (the drill down).
//   - 2004 by QTR_ID: 877,419 + 847,714 + 1,145,308 + 2,117,299 = 4,987,740,
//     the same as the four territories' 2004 column (the roll up).
//   - Classic Cars (PRODUCTS.PRODUCTLINE), 2004 and 2005, EMEA and NA (the
//     dice).
//
// Run from this folder:   node cube-operations.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const n = (v) => v.toLocaleString('en-US');
const d = new Diagram(1100, 784);
const PW = 344, GAP = 18, PH = 356;
const COL = [16, 16 + PW + GAP, 16 + 2 * (PW + GAP)];
const ROW = [16, 16 + PH + GAP];

// The starting grid: Sales by Territory (rows) and Year (columns).
const GRID = {
  APAC: [343082, 601606, 337018],
  EMEA: [1681987, 2396408, 929829],
  Japan: [292558, 168479, 42921],
  NA: [1359757, 1821247, 671057],
};
const TERR = Object.keys(GRID);

const PANELS = [
  {
    role: 'support', icon: 'chart-column', title: 'The starting view', sub: 'Sales by Territory and Year',
    step: { icon: 'mouse-pointer-click', title: 'Territory on Rows', lines: ['Years on Columns, Sales as the measure'] },
    cols: ['Territory', '2003', '2004', '2005'],
    rows: TERR.map((t) => ({ tone: 'result', cells: [t, ...GRID[t].map(n)] })),
  },
  {
    role: 'model', icon: 'slice', title: 'Slice', sub: 'pin one dimension to a single member',
    step: { icon: 'filter', title: 'Filter: Years = 2004', lines: ['one year only: a slice through the cube'] },
    cols: ['Territory', '2004'],
    rows: TERR.map((t) => ({ tone: 'check', cells: [t, n(GRID[t][1])] })),
  },
  {
    role: 'model', icon: 'box', title: 'Dice', sub: 'keep a few members on several dimensions',
    step: { icon: 'filter', title: '2004, 2005 · EMEA, NA', lines: ['and Line = Classic Cars: a smaller cube'] },
    cols: ['Territory', '2004', '2005'],
    rows: [
      { tone: 'check', cells: ['EMEA', n(1015790), n(384538)] },
      { tone: 'check', cells: ['NA', n(581043), n(237791)] },
    ],
  },
  {
    role: 'model', icon: 'zoom-in', title: 'Drill down', sub: 'one level more detail',
    step: { icon: 'mouse-pointer-click', title: 'Drill down on NA', lines: ['Territory to Country, all years'] },
    cols: ['Member', 'Sales'],
    rows: [
      { tone: 'result', cells: ['NA', n(3852061)] },
      { tone: 'check', cells: ['   USA', n(3627983)] },
      { tone: 'check', cells: ['   Canada', n(224079)] },
    ],
  },
  {
    role: 'model', icon: 'zoom-out', title: 'Roll up', sub: 'one level less detail',
    step: { icon: 'mouse-pointer-click', title: 'Quarters up to the year', lines: ['Mondrian sums the four quarters'] },
    cols: ['Member', 'Sales'],
    rows: [
      { tone: 'result', cells: ['2004 QTR1', n(877419)] },
      { tone: 'result', cells: ['2004 QTR2', n(847714)] },
      { tone: 'result', cells: ['2004 QTR3', n(1145308)] },
      { tone: 'result', cells: ['2004 QTR4', n(2117299)] },
      { tone: 'check', cells: ['2004', n(4987740)] },
    ],
  },
  {
    role: 'model', icon: 'arrow-left-right', title: 'Pivot', sub: 'swap rows and columns',
    step: { icon: 'mouse-pointer-click', title: 'Years on Rows', lines: ['Territory on Columns: same cells'] },
    cols: ['Year', 'APAC', 'EMEA', 'Japan', 'NA'],
    rows: [0, 1, 2].map((i) => ({ tone: 'check', cells: [String(2003 + i), ...TERR.map((t) => n(GRID[t][i]))] })),
  },
];

PANELS.forEach((p, i) => {
  const x = COL[i % 3], y = ROW[Math.floor(i / 3)];
  d.panel({ x, y, w: PW, h: PH, role: p.role, iconName: p.icon, title: p.title, sub: p.sub });
  d.box({ x: x + 16, y: y + 60, w: PW - 32, h: 56, role: 'browser', iconName: p.step.icon, title: p.step.title, lines: p.step.lines });
  d.tableBox({ x: x + 16, y: y + 128, w: PW - 32, role: 'result', iconName: 'table-2', title: 'What Analyzer shows', sub: 'Sales', cols: p.cols, rows: p.rows });
});

d.raw(`<text x="550" y="770" text-anchor="middle" font-size="12" fill="#475569">Every figure is the SteelWheels cube's Sales on SampleData. Amber rows: the cells the operation changed or kept.</text>`);

d.write(import.meta.url);
