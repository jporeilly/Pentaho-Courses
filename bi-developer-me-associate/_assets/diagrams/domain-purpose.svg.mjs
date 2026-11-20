// Components (01): what a metadata domain does, followed for two
// columns from the database to the report user. It sits after the
// lesson's first note in 01-components/guide.md, with a "Read the
// diagram" paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 07 (07-properties-orderstarcustomer): physical table
//     CUSTOMER W TER (target CUSTOMER_W_TER) column CUSTOMERNAME is named
//     Customer Name and sits in the category Customers; ORDERFACT's
//     PRICEEACH is named Price Sold, Default Aggregation Sum, in Orders.
//   - Lesson 09 (09-concepts-concept-editor): Price Sold's parent
//     concept is USCurrency, mask $#,##0.00;($#,##0.00).
//   - Lesson 05: Price Sold arrives summed (the engine writes SUM).
//     The mask is not claimed for the report: lesson 09's report
//     picture shows dates unformatted.
//   - Lesson 01's own text: business-friendly names, a buffer against
//     database change, security, consistent formats, localization
//     (Name is a string per locale, en_US in this course).
//   - Lesson 11: suzy (Power User) sees EMEA customers only.
//
// Colors by role (README): green a store, teal the model, amber the
// browser, slate what the domain adds underneath.
//
// Run from this folder:   node domain-purpose.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 504);
const BW = 224, BH = 80; // three per row: 3 x 224 + 2 x 32 = 736
const X = [32, 288, 544];
const rowY = [84, 184];

d.panel({ x: 16, y: 16, w: W - 32, h: 268, role: 'model', iconName: 'table-properties', title: 'From a database column to a report column', sub: 'the domain sits between the database and every report' });

const rows = [
  [['CUSTOMER_W_TER', ['column CUSTOMERNAME,', 'in the database']], ['Customer Name', ['a business column in', 'the category Customers']], ['Customer Name', ['what the report user', 'picks from Customers']]],
  [['ORDERFACT', ['column PRICEEACH,', 'a plain number']], ['Price Sold', ['aggregation Sum,', 'concept USCurrency']], ['Price Sold', ['picked from Orders,', 'arrives summed']]],
];
rows.forEach(([db, biz, user], i) => {
  const a = d.box({ x: X[0], y: rowY[i], w: BW, h: BH, role: 'store', iconName: 'database', title: db[0], lines: db[1] });
  const b = d.box({ x: X[1], y: rowY[i], w: BW, h: BH, role: 'model', iconName: 'briefcase', title: biz[0], lines: biz[1] });
  const c = d.box({ x: X[2], y: rowY[i], w: BW, h: BH, role: 'browser', iconName: 'table', title: user[0], lines: user[1] });
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
  d.arrow({ x1: b.r, y1: b.cy, x2: c.x - 3, y2: c.cy, straight: true });
});

// What the domain adds on the way, one box each. 4 x 172 + 3 x 16 = 736.
d.panel({ x: 16, y: 300, w: W - 32, h: 188, role: 'support', iconName: 'layers', title: 'What the domain adds', sub: 'defined once, used by every report on the domain' });
const adds = [
  ['languages', 'Business names', ['a name per locale,', 'en_US here']],
  ['hash', 'Formats', ['masks, alignment:', 'from concepts']],
  ['shield', 'Security', ['suzy sees EMEA', 'customers only']],
  ['layers', 'A buffer', ['a database change', 'stays in one layer']],
];
adds.forEach(([ic, t, l], i) => d.box({ x: 32 + i * 188, y: 368, w: 172, h: 96, role: 'support', iconName: ic, title: t, lines: l }));

d.write(import.meta.url);
