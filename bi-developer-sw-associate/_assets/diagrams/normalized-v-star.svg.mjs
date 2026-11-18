// Key Concepts, Normalized v Star tab: the same question - Sales by Product
// Line and Territory - answered from SampleData's normalized order system and
// from its SteelWheels star. Both halves are real tables in SampleData, with
// types from its own CREATE TABLE. Replaces the stock picture
// concepts_normalized_v_star_schema.png.
//
// Facts, checked with SQL on SampleData (2026-11-18):
//   - Normalized: ORDERDETAILS holds QUANTITYORDERED and PRICEEACH per line;
//     ORDERS carries the CUSTOMERNUMBER; CUSTOMERS has no territory, only a
//     SALESREPEMPLOYEENUMBER; EMPLOYEES carries OFFICECODE; OFFICES carries
//     TERRITORY. So territory takes ORDERS -> CUSTOMERS -> EMPLOYEES ->
//     OFFICES, and product line one more join to PRODUCTS: 5 joins, 6 tables.
//   - Every one of the 100 customers with a sales rep has the same TERRITORY
//     in CUSTOMER_W_TER as their rep's office; no order belongs to one of the
//     22 customers without a rep. CUSTOMER_W_TER is CUSTOMERS with that
//     territory copied onto the row.
//   - Star: ORDERFACT (one row per order line, 2,996 rows, the same count as
//     ORDERDETAILS) stores TOTALPRICE and the keys; 2 joins, 3 tables.
//
// Run from this folder:   node normalized-v-star.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1160, 704);
const EW = 310;

d.bar({
  x: 16, y: 16, w: 1128, h: 56, role: 'support', iconName: 'circle-help',
  title: 'One question, two designs: Sales by Product Line and Territory',
  line: 'Both halves are tables in SampleData: the order system, and the SteelWheels data mart built from it',
});

// ── Normalized: the order system ──────────────────────────────────────
const L = d.panel({ x: 16, y: 88, w: 736, h: 600, role: 'source', iconName: 'database', title: 'Normalized: the order system (OLTP)', sub: 'each fact stored once, so a question walks the joins' });
const C1 = 36, C2 = 426; // an 80px gutter for joins 1 and 4
const det = d.entity({ x: C1, y: 152, w: EW, role: 'source', iconName: 'list', title: 'ORDERDETAILS', fields: [
  ['INTEGER', 'ORDERNUMBER', 'FK'], ['VARCHAR', 'PRODUCTCODE', 'FK'], ['INTEGER', 'QUANTITYORDERED', ''], ['NUMERIC', 'PRICEEACH', ''],
] });
const ord = d.entity({ x: C1, y: 324, w: EW, role: 'source', iconName: 'receipt', title: 'ORDERS', fields: [
  ['INTEGER', 'ORDERNUMBER', 'PK'], ['TIMESTAMP', 'ORDERDATE', ''], ['INTEGER', 'CUSTOMERNUMBER', 'FK'],
] });
const cus = d.entity({ x: C1, y: 474, w: EW, role: 'source', iconName: 'users', title: 'CUSTOMERS', fields: [
  ['INTEGER', 'CUSTOMERNUMBER', 'PK'], ['VARCHAR', 'COUNTRY', ''], ['INTEGER', 'SALESREPEMPLOYEENUMBER', 'FK'],
] });
const lprod = d.entity({ x: C2, y: 152, w: EW, role: 'source', iconName: 'car', title: 'PRODUCTS', fields: [
  ['VARCHAR', 'PRODUCTCODE', 'PK'], ['VARCHAR', 'PRODUCTLINE', ''],
] });
const off = d.entity({ x: C2, y: 324, w: EW, role: 'source', iconName: 'building-2', title: 'OFFICES', fields: [
  ['VARCHAR', 'OFFICECODE', 'PK'], ['VARCHAR', 'TERRITORY', ''],
] });
const emp = d.entity({ x: C2, y: 474, w: EW, role: 'source', iconName: 'id-card', title: 'EMPLOYEES', fields: [
  ['INTEGER', 'EMPLOYEENUMBER', 'PK'], ['VARCHAR', 'OFFICECODE', 'FK'],
] });

// The five joins, numbered in the order the query walks them.
d.arrow({ x1: det.r, y1: det.rowY(1), x2: lprod.x - 3, y2: lprod.rowY(0), label: '1' });
d.arrow({ x1: det.cx, y1: det.b, x2: ord.cx, y2: ord.y - 3, vertical: true, label: '2' });
d.arrow({ x1: ord.cx, y1: ord.b, x2: cus.cx, y2: cus.y - 3, vertical: true, label: '3' });
d.arrow({ x1: cus.r, y1: cus.rowY(2), x2: emp.x - 3, y2: emp.rowY(0), label: '4' });
d.arrow({ x1: emp.cx, y1: emp.y, x2: off.cx, y2: off.b + 3, vertical: true, label: '5' });

d.box({ x: 36, y: 604, w: 700, h: 64, role: 'check', iconName: 'route', title: '5 joins across 6 tables',
  lines: ["Territory: found through the customer's sales rep and their office;", 'Sales: QUANTITYORDERED x PRICEEACH, worked out for every line'] });

// ── Star: the SteelWheels data mart ───────────────────────────────────
d.panel({ x: 768, y: 88, w: 376, h: 600, role: 'model', iconName: 'star', title: 'Star: the SteelWheels data mart', sub: 'shaped for the question, one join per dimension' });
const SX = 784;
const fact = d.entity({ x: SX, y: 152, w: EW, role: 'model', iconName: 'table-2', title: 'ORDERFACT', fields: [
  ['INTEGER', 'CUSTOMERNUMBER', 'FK'], ['VARCHAR', 'PRODUCTCODE', 'FK'], ['VARCHAR', 'TIME_ID', 'FK'], ['DOUBLE', 'TOTALPRICE', ''],
] });
const sprod = d.entity({ x: SX, y: 324, w: EW, role: 'source', iconName: 'car', title: 'PRODUCTS', fields: [
  ['VARCHAR', 'PRODUCTCODE', 'PK'], ['VARCHAR', 'PRODUCTLINE', ''],
] });
const scus = d.entity({ x: SX, y: 452, w: EW, role: 'source', iconName: 'users', title: 'CUSTOMER_W_TER', fields: [
  ['INTEGER', 'CUSTOMERNUMBER', 'PK'], ['VARCHAR', 'COUNTRY', ''], ['VARCHAR', 'TERRITORY', ''],
] });

// The two joins leave the fact table's right edge and loop back in to the
// dimension's key, numbered like the left side's.
const loop = (y1, y2, bulge, label) => {
  const r = fact.r;
  d.raw(`<path d="M${r} ${y1}C${r + bulge} ${y1} ${r + bulge} ${y2} ${r + 3} ${y2}" fill="none" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);
  d.pill(r + bulge * 0.75, y2 - 48, label);
};
loop(fact.rowY(1), sprod.rowY(0), 26, '1');
loop(fact.rowY(0), scus.rowY(0), 52, '2');

d.box({ x: 784, y: 604, w: 344, h: 64, role: 'result', iconName: 'zap', title: '2 joins across 3 tables',
  lines: ['Territory copied onto the customer row;', 'Sales stored as TOTALPRICE'] });

d.write(import.meta.url);
