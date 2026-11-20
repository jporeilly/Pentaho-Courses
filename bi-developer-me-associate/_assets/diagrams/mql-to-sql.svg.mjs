// Query Builder (05), "2. Build and Run a Query": what the metadata
// engine does with a query. Four rows, one per part of the SQL: the
// columns a query names (left), what the engine reads from the business
// model for them (middle) and what that becomes in the SQL (right). It
// sits after the "Price Sold arrives summed" panel in
// 05-domains-and-models-query-builder/guide.md, with a "Read the
// diagram" paragraph after it.
//
// Every fact comes from the course's own lessons; all four rows are on
// the OrderStarCustomer model this workshop queries:
//   - Lesson 03 (03-domains-and-models-steelwheels), "A category holds
//     references": an Interactive Report sends MQL naming each column's
//     category and id, and the engine works out the tables and joins.
//   - Lesson 05: the Query Builder runs a query against a business model
//     the way a report would. Product Name (Products) and Order Number
//     (Orders) come back with NONE; Price Sold and Total have a default
//     aggregation of Sum, so the engine writes SUM around each and
//     groups by the other two columns.
//   - Lesson 07 (07-properties-orderstarcustomer), "3. Relationships":
//     ORDERFACT to PRODUCTS on PRODUCTCODE, N:1, Join type Inner; "The
//     join comes from the relationship type": N:1 becomes an inner join,
//     written as a WHERE condition. Lesson 04 (04-domains-and-models-
//     ordersme) gives the condition PRODUCTS.PRODUCTCODE =
//     ORDERFACT.PRODUCTCODE.
//   - Lesson 07, "5. Aggregation & Data Type": Default Aggregation Sum
//     on Price Sold; Average, Minimum and Maximum are only offered (the
//     Optional Aggregations), and when a report picks one the engine
//     writes AVG, MIN or MAX instead.
//   - Lesson 07, "6. Calculated Columns": Total is PC_TOTAL, formula
//     [QUANTITYORDERED]*[PRICEEACH] with Is the Formula Exact? selected,
//     generated as SUM(ORDERFACT.QUANTITYORDERED * ORDERFACT.PRICEEACH).
//   - Lesson 11 (11-security-and-data-access-row-level-security), "What
//     the engine did with each role": the engine takes the Data
//     Constraint entry for the user's role; Power User's becomes WHERE
//     TERRITORY = 'EMEA', and a role with no entry gets WHERE FALSE.
//     Lesson 11 signs in as suzy, a Power User.
//
// Colors: blue what you pick in the tool (amber for the signed-in user,
// who is not picked: the browser side); violet the metadata engine
// reading the model; white the SQL that results. Icons: `columns-3` a
// column, `user-round` a user, `link` a relationship, `sigma` an
// aggregation, `square-function` a formula, `filter` a row filter,
// `code` the SQL panel (its boxes have no icon, for room); `table`
// Interactive Reports and `cog` the metadata engine as in this folder's
// README.
//
// Run from this folder:   node mql-to-sql.svg.mjs
// It writes mql-to-sql.svg here and ../images/mql-to-sql.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. Three panels with 24px gaps, each holding one column
// of boxes 16px inside it on each side. The middle panel is the widest,
// for the engine's longer property names; the SQL boxes have no icon, so
// the upper-case table and column names fit.
const W = 800, BH = 84;
const PW = [232, 248, 240]; // width of each panel
const PX = [16, 272, 544]; // left edge of each panel
const ROWS = [76, 176, 276, 376]; // top of each box row
const d = new Diagram(W, ROWS[3] + BH + 32);

// ── The three panels ──────────────────────────────────────────────────
const PH = ROWS[3] + BH + 16 - 16;
d.panel({ x: PX[0], y: 16, w: PW[0], h: PH, role: 'tool', iconName: 'table', title: 'What the query names', sub: 'the Query Builder or a report' });
d.panel({ x: PX[1], y: 16, w: PW[1], h: PH, role: 'server', iconName: 'cog', title: 'What the engine reads', sub: 'from the business model' });
d.panel({ x: PX[2], y: 16, w: PW[2], h: PH, role: 'result', iconName: 'code', title: 'What the SQL gets', sub: 'sent to the database' });

// ── The rows: [left, middle, right], each [role, icon, title, lines] ──
const ROW_DATA = [
  // 1. Columns from two categories: the relationship between their
  //    tables becomes a join.
  [
    ['tool', 'columns-3', 'Two categories', ['Product Name and', 'Order Number']],
    ['server', 'link', 'Relationship', ['N:1, Join type Inner,', 'on PRODUCTCODE']],
    ['result', 'code', 'An inner join', ['a WHERE condition:', 'PRODUCTS.PRODUCTCODE =', 'ORDERFACT.PRODUCTCODE']],
  ],
  // 2. A column with a default aggregation: SUM, unless the report
  //    picks one of the optional aggregations.
  [
    ['tool', 'columns-3', 'Price Sold', ['no aggregation', 'picked in the query']],
    ['server', 'sigma', 'Aggregation', ['Default Aggregation Sum;', 'Average if it is picked']],
    ['result', 'code', 'SUM( )', ['or AVG; GROUP BY the', 'columns not aggregated']],
  ],
  // 3. A calculated column: its formula, parsed because Is the Formula
  //    Exact? is selected, becomes an expression.
  [
    ['tool', 'columns-3', 'Total', ['a calculated column,', 'PC_TOTAL']],
    ['server', 'square-function', 'Formula', ['[QUANTITYORDERED]*', '[PRICEEACH]; Is the', 'Formula Exact? selected']],
    ['result', 'code', 'An expression', ['SUM(ORDERFACT.', 'QUANTITYORDERED *', 'ORDERFACT.PRICEEACH)']],
  ],
  // 4. Nobody picks this one: the signed-in user's role selects the
  //    model's Data Constraint entry, which becomes the WHERE filter.
  [
    ['browser', 'user-round', 'Who is signed in', ['suzy, role Power User;', 'no column needed']],
    ['server', 'filter', 'Data Constraint', ["the role's entry:", 'Territory EMEA']],
    ['result', 'code', 'A WHERE filter', ["TERRITORY = 'EMEA';", 'a role with no entry:', 'WHERE FALSE']],
  ],
];

// Draw each row: three boxes, and a straight arrow from each box's right
// edge to the next box's left edge (3px short, so the head shows).
ROWS.forEach((y, r) => {
  const boxes = ROW_DATA[r].map(([role, iconName, title, lines], c) =>
    // The SQL column (c = 2) is drawn without its icon.
    d.box({ x: PX[c] + 16, y, w: PW[c] - 32, h: BH, role, iconName: c === 2 ? undefined : iconName, title, lines }));
  for (let c = 0; c < 2; c++) {
    d.arrow({ x1: boxes[c].r, y1: boxes[c].cy, x2: boxes[c + 1].x - 3, y2: boxes[c + 1].cy, straight: true });
  }
});

d.write(import.meta.url);
