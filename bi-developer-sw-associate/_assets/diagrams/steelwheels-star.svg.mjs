// Key Concepts: the SteelWheels star schema - the ORDERFACT fact table and
// the three dimension tables the SteelWheels schema joins it to, with the
// columns the cube actually uses (types from SampleData's own CREATE TABLE).
// Run: node steelwheels-star.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 560);
const W = 286;

const fact = d.entity({
  x: 357, y: 150, w: W, role: 'model', iconName: 'table-2', title: 'ORDERFACT  (fact table)',
  fields: [
    ['INTEGER', 'CUSTOMERNUMBER', 'FK'],
    ['VARCHAR', 'PRODUCTCODE', 'FK'],
    ['VARCHAR', 'TIME_ID', 'FK'],
    ['VARCHAR', 'STATUS', ''],
    ['INTEGER', 'QUANTITYORDERED', ''],
    ['DOUBLE', 'TOTALPRICE', ''],
  ],
});
const cust = d.entity({
  x: 16, y: 16, w: W, role: 'source', iconName: 'users', title: 'CUSTOMER_W_TER',
  fields: [
    ['INTEGER', 'CUSTOMERNUMBER', 'PK'],
    ['VARCHAR', 'CUSTOMERNAME', ''],
    ['VARCHAR', 'TERRITORY', ''],
    ['VARCHAR', 'COUNTRY', ''],
    ['VARCHAR', 'STATE', ''],
    ['VARCHAR', 'CITY', ''],
  ],
});
const prod = d.entity({
  x: 698, y: 16, w: W, role: 'source', iconName: 'package', title: 'PRODUCTS',
  fields: [
    ['VARCHAR', 'PRODUCTCODE', 'PK'],
    ['VARCHAR', 'PRODUCTLINE', ''],
    ['VARCHAR', 'PRODUCTVENDOR', ''],
  ],
});
const time = d.entity({
  x: 698, y: 330, w: W, role: 'source', iconName: 'calendar', title: 'DIM_TIME',
  fields: [
    ['VARCHAR', 'TIME_ID', 'PK'],
    ['INTEGER', 'YEAR_ID', ''],
    ['VARCHAR', 'QTR_NAME', ''],
    ['CHAR', 'MONTH_NAME', ''],
  ],
});

// Joins: each foreign key in ORDERFACT to its dimension table's key.
d.arrow({ x1: fact.x, y1: fact.rowY(0), x2: cust.r + 3, y2: cust.rowY(0) });
d.arrow({ x1: fact.r, y1: fact.rowY(1), x2: prod.x - 3, y2: prod.rowY(0) });
d.arrow({ x1: fact.r, y1: fact.rowY(2), x2: time.x - 3, y2: time.rowY(0) });
// Which cube dimension reads each table, under the table.
d.pill(cust.cx, cust.b + 26, ['read by the MARKETS and', 'CUSTOMERS dimensions']);
d.pill(prod.cx, prod.b + 20, ['read by the PRODUCT dimension']);
d.pill(time.cx, time.b + 20, ['read by the TIME dimension']);

// What the fact table holds besides keys.
d.pill(500, 420, ['STATUS: the ORDERSTATUS dimension,', 'read from the fact table itself']);
d.pill(500, 478, ['QUANTITYORDERED and TOTALPRICE:', 'the Quantity and Sales measures, summed']);
d.raw(`<text x="16" y="548" font-size="12" fill="#64748b">Facts are what you measure; dimensions are what you measure them by.</text>`);

d.write(import.meta.url);
