// Extended Model: the three ways a dimension reaches the fact table in the
// extended Miniature Models schema. ORDERFACT sits in the middle of the
// Sales_FY2003_2005 cube. On the left, the dimensions defined inside the
// cube (private to it), each joined from its own table through its own
// foreignKey. On the right, the degenerate ORDER STATUS, read from the fact
// table itself with no join. Below, outside the cube but in the schema,
// the shared TIME, joined through the cube's DimensionUsage. It sits at
// the top of 08-extend-model-extended-model/guide.md, after the "What you
// build" screenshot, and is the SW course's version of the SME course's
// dimension-kinds diagram (courses/analyst-sme-specialty), with the same
// layout, colors and icons.
//
// Every fact comes from the course's own lessons and lab files:
//   - 07-extend-model, "Key techniques": a shared dimension is declared at
//     the schema level rather than inside a cube, names its own table, and
//     each cube references it with a DimensionUsage that supplies the
//     cube-specific foreign key (<DimensionUsage name="TIME" source="TIME"
//     foreignKey="TIME_ID"/>); a star dimension has one table, a snowflake
//     two or more, and a degenerate dimension none: all its columns live in
//     the fact table.
//   - 03-schemas, the Cube attribute table: "private dimensions", the term
//     for a dimension defined inside one cube.
//   - 08-extend-model-extended-model:
//       tab 1, MARKETS: foreignKey CUSTOMERNUMBER, table CUSTOMER_W_TER,
//       hierarchy Markets, levels Territory, Country, State Province, City.
//       tab 3, CUSTOMERS: keeps only the Customer Name level, with four
//       member properties, on CUSTOMER_W_TER.
//       tab 4, PRODUCTS: Line and Name on the PRODUCTS table.
//       tab 5, TIME: added under Schema, type TimeDimension, no foreignKey,
//       table DIM_TIME, primaryKey TIME_ID, levels Years, Quarters,
//       Months; the cube's Dimension Usage has foreignKey TIME_ID and
//       source TIME; its Under the hood box: the join is
//       ORDERFACT.TIME_ID = DIM_TIME.TIME_ID.
//       tab 6, ORDER STATUS: no foreignKey, no table, hierarchy Status,
//       level Type on column STATUS.
//       tab 7: Sales sums TOTALPRICE (from Standard Model) and the new
//       Quantity sums QUANTITYORDERED.
//   - The lab's solution, 08-.../files/solution/miniaturemodels-extended.xml:
//     the same, with PRODUCTS' foreignKey PRODUCTCODE and CUSTOMERS'
//     foreignKey CUSTOMERNUMBER.
//
// Colors and icons follow the SME course's dimension-kinds diagram: green
// a dimension, teal the cube, its fact table and the degenerate dimension
// (a part of the fact table), slate the schema; globe MARKETS, users
// CUSTOMERS, car PRODUCTS, calendar TIME, tag ORDER STATUS, table-2 the
// fact table.
//
// Run from this folder:   node dimension-kinds.svg.mjs
// It writes dimension-kinds.svg here and ../images/dimension-kinds.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and sizes: every dimension box is BW x BH; the fact table is a
// kit entity FW wide, so CUSTOMERNUMBER clears its FK badge.
const d = new Diagram(1164, 640);
const BW = 256, BH = 72;
const FW = 300;

// ── The schema ─────────────────────────────────────────────────────────
// Slate: it frames everything. The shared dimension sits in it, outside
// the cube.
d.panel({ x: 16, y: 16, w: 1132, h: 608, role: 'support', iconName: 'file-code', title: 'Miniature Models: the schema', sub: 'A shared dimension is defined here, once, outside every cube' });

// ── The cube ───────────────────────────────────────────────────────────
// Teal: a model. It holds the fact table, the private dimensions and the
// degenerate one.
d.panel({ x: 32, y: 76, w: 1100, h: 380, role: 'model', iconName: 'box', title: 'Sales_FY2003_2005: the cube', sub: 'Private and degenerate dimensions are defined inside it' });

// The fact table: the three foreign keys and STATUS to slice by, and the
// two columns the Sales and Quantity measures sum.
const fact = d.entity({
  x: 480, y: 160, w: FW, role: 'model', iconName: 'table-2', title: 'ORDERFACT  (the fact table)',
  fields: [
    ['to slice by', 'CUSTOMERNUMBER', 'FK'],
    ['to slice by', 'PRODUCTCODE', 'FK'],
    ['to slice by', 'TIME_ID', 'FK'],
    ['to slice by', 'STATUS', ''],
    ['to measure', 'QUANTITYORDERED', ''],
    ['to measure', 'TOTALPRICE', ''],
  ],
});

// The three private dimensions, stacked on the left, each read from its
// own table. Line one says which table; line two the levels.
const mk = d.box({ x: 48, y: 136, w: BW, h: BH, role: 'store', iconName: 'globe', title: 'MARKETS', lines: ['private: CUSTOMER_W_TER,', '4 levels, Territory to City'] });
const cu = d.box({ x: 48, y: 228, w: BW, h: BH, role: 'store', iconName: 'users', title: 'CUSTOMERS', lines: ['private: CUSTOMER_W_TER,', 'Customer Name, 4 properties'] });
const pr = d.box({ x: 48, y: 320, w: BW, h: BH, role: 'store', iconName: 'car', title: 'PRODUCTS', lines: ['private: PRODUCTS,', 'Line > Name'] });

// The joins: from the fact table's key row to each dimension, with the
// dimension's foreignKey in a pill (padded with spaces, since the kit
// sizes a pill at 6.3px a character, a little narrow for capitals).
// MARKETS and CUSTOMERS both use CUSTOMERNUMBER, each with its own join.
d.arrow({ x1: fact.x, y1: fact.rowY(0), x2: mk.r + 3, y2: mk.cy, label: '   CUSTOMERNUMBER   ' });
d.arrow({ x1: fact.x, y1: fact.rowY(0), x2: cu.r + 3, y2: cu.cy, label: '   CUSTOMERNUMBER   ' });
d.arrow({ x1: fact.x, y1: fact.rowY(1), x2: pr.r + 3, y2: pr.cy, label: ' PRODUCTCODE ' });

// The degenerate dimension, right of the fact table, level with its
// STATUS row: a dashed arrow with no key, since no join is made.
const os = d.box({ x: 868, y: fact.rowY(3) - BH / 2, w: BW, h: BH, role: 'model', iconName: 'tag', title: 'ORDER STATUS', lines: ['degenerate: level Type on', 'ORDERFACT.STATUS itself'] });
d.arrow({ x1: fact.r, y1: fact.rowY(3), x2: os.x - 3, y2: os.cy, dashed: true, label: 'no join' });

// What sets each kind apart in the XML, in a note under each kind: a
// private dimension's foreignKey and table under PRODUCTS, and the
// degenerate one's lack of both under ORDER STATUS.
d.pill(mk.cx, 428, ['Private: a <Dimension foreignKey="...">', 'in the cube, with its own <Table>']);
d.pill(os.cx, 362, ['Degenerate: no foreignKey,', 'no <Table>, no join in the SQL']);

// ── The shared dimension ───────────────────────────────────────────────
// TIME sits in the schema's panel but outside the cube, under the fact
// table. The cube reaches it through its DimensionUsage on TIME_ID; the
// arrow leaves the fact table's foot and crosses the cube's lower edge.
const tm = d.box({ x: fact.cx - BW / 2, y: 518, w: BW, h: BH, role: 'store', iconName: 'calendar', title: 'TIME (shared)', lines: ['DIM_TIME, a TimeDimension:', 'Years > Quarters > Months'] });
d.arrow({ x1: fact.cx, y1: fact.b, x2: tm.cx, y2: tm.y - 3, straight: true, label: 'DimensionUsage on TIME_ID', ly: 487 });
// What the XML holds, beside it.
d.pill(tm.r + 196, tm.cy, ['Shared: a <Dimension> directly under', '<Schema>, no foreignKey; the cube holds', '<DimensionUsage source="TIME" foreignKey="TIME_ID">']);

d.write(import.meta.url);
