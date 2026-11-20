// Overview of Properties (06): a property is a key and a value, and a
// business column stores only the keys you override; the rest it reads
// from its physical column. It sits after the "How Properties work?"
// note in 06-properties/guide.md, with a "Read the diagram" paragraph
// after it.
//
// Every value comes from the OrderStarCustomer solution domain,
// 07-properties-orderstarcustomer/files/solution/OrderStarCustomer.xmi:
//   - Physical table ORDERFACT: target_table ORDERFACT (a required
//     property; lesson 06 says the SQL generator fails without it).
//   - Physical column PRICEEACH: name PRICEEACH, formula PRICEEACH,
//     datatype Numeric, aggregation none, an empty aggregation list.
//   - Business column BC_ORDERFACT_PRICEEACH stores only name
//     "Price Sold", aggregation sum and the aggregation list (average,
//     minimum, maximum): the overrides lesson 07 parts 5 sets.
//   - The Available pane groups (General, Model Descriptors,
//     Calculation) are the ones lesson 07 names for these properties.
//
// Colors: blue the physical layer (the source, as in domain-layers),
// teal a value the business column stores itself, slate a value it
// inherits. Icons: `table-2` a physical table, `columns-3` a column,
// `pencil` an override, `key-round` a property.
//
// Run from this folder:   node property-map.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800;
const d = new Diagram(W, 544);
const PW = 368, BW = 336, BH = 56;
const LX = 16, RX = W - 16 - PW;
const rowY = (i) => 80 + i * 68;

d.panel({ x: LX, y: 16, w: PW, h: 420, role: 'source', iconName: 'columns-3', title: 'Physical column PRICEEACH', sub: 'every property set, each a key and a value' });
d.panel({ x: RX, y: 16, w: PW, h: 420, role: 'model', iconName: 'briefcase', title: 'Business column Price Sold', sub: 'stores only what you override' });

// key, physical value, business value (null = inherited)
const rows = [
  ['Name', 'PRICEEACH', 'Price Sold'],
  ['Formula', 'PRICEEACH', null],
  ['Data Type', 'Numeric', null],
  ['Default Aggregation', 'None', 'Sum'],
  ['Optional Aggregations', 'none listed', 'Average, Minimum, Maximum'],
];

rows.forEach(([key, pv, bv], i) => {
  const p = d.box({ x: LX + 16, y: rowY(i), w: BW, h: BH, role: 'source', iconName: 'key-round', title: key, lines: [pv] });
  const b = bv
    ? d.box({ x: RX + 16, y: rowY(i), w: BW, h: BH, role: 'model', iconName: 'pencil', title: key, lines: [`${bv}  (override)`] })
    : d.box({ x: RX + 16, y: rowY(i), w: BW, h: BH, role: 'support', iconName: 'key-round', title: key, lines: [`${pv}  (inherited)`] });
  if (!bv) d.arrow({ x1: p.r, y1: p.cy, x2: b.x - 3, y2: b.cy, straight: true });
});

// The required properties sit on the physical table, not the column.
d.bar({ x: 16, y: 456, w: W - 32, h: 72, role: 'source', iconName: 'table-2', title: 'Physical table ORDERFACT: required properties', line: 'Target Table ORDERFACT: the SQL generator needs it, so it cannot be deleted' });

d.write(import.meta.url);
