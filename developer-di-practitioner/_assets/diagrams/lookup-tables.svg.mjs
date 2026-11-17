// Review Lookups: reference (lookup) tables around a sales schema, as an
// entity-relationship diagram. Each line runs from the table holding the
// foreign key (crow's foot with a ring: zero or many) to the table it
// references (two bars: exactly one), labelled with the key.
// Run: node lookup-tables.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(662, 526);
const W = 250, L = 16, R = 396;

const status = d.entity({ x: L, y: 16, w: W, role: 'check', iconName: 'book-open', title: 'Order_Status', fields: [['char(2)', 'status_id', 'PK'], ['nvarchar(50)', 'status_description']] });
const countries = d.entity({ x: R, y: 16, w: W, role: 'check', iconName: 'book-open', title: 'Countries', fields: [['char(3)', 'country_id', 'PK'], ['nvarchar(50)', 'description']] });
const customers = d.entity({ x: R, y: 164, w: W, role: 'source', iconName: 'users', title: 'Customers', fields: [
  ['int', 'customer_id', 'PK'], ['varchar(100)', 'name'], ['varchar(50)', 'address'], ['char(5)', 'ZIP'],
  ['nvarchar(50)', 'city'], ['char(2)', 'state_id', 'FK'], ['char(3)', 'country_id', 'FK'],
] });
const orders = d.entity({ x: L, y: 186, w: W, role: 'source', iconName: 'receipt', title: 'Orders', fields: [
  ['int', 'order_id', 'PK'], ['datetime', 'order_date'], ['int', 'customer_id', 'FK'],
  ['char(2)', 'status_id', 'FK'], ['tinyint', 'priority_id', 'FK'],
] });
const priorities = d.entity({ x: L, y: 422, w: W, role: 'check', iconName: 'book-open', title: 'Order_Priorities', fields: [['tinyint', 'priority_id', 'PK'], ['nvarchar(50)', 'priority_description']] });
const states = d.entity({ x: R, y: 422, w: W, role: 'check', iconName: 'book-open', title: 'States', fields: [['char(2)', 'state_id', 'PK'], ['nvarchar(50)', 'description']] });

// From the many end (x1,y1) to the one end (x2,y2), on a straight line.
function relation(x1, y1, x2, y2, key) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, px = -uy, py = ux;
  const at = (t, s = 0) => `${x1 + ux * t + px * s} ${y1 + uy * t + py * s}`;
  const bt = (t, s = 0) => `${x2 - ux * t + px * s} ${y2 - uy * t + py * s}`;
  const k = 'stroke="#64748b" stroke-width="1.7" fill="none"';
  d.raw([
    `<path d="M${at(0)}L${bt(0)}" ${k}/>`,
    `<path d="M${at(0, -8)}L${at(14)}L${at(0, 8)}M${at(0)}L${at(14)}" ${k}/>`, // crow's foot
    `<circle cx="${x1 + ux * 20}" cy="${y1 + uy * 20}" r="4" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>`, // zero
    `<path d="M${bt(8, -7)}L${bt(8, 7)}M${bt(13, -7)}L${bt(13, 7)}" ${k}/>`, // exactly one
  ].join(''));
  d.pill((x1 + x2) / 2, (y1 + y2) / 2, key);
}

relation(orders.cx, orders.y, status.cx, status.b, 'status_id');
relation(orders.cx, orders.b, priorities.cx, priorities.y, 'priority_id');
relation(orders.r, orders.cy, customers.x, orders.cy, 'customer_id');
relation(customers.cx, customers.y, countries.cx, countries.b, 'country_id');
relation(customers.cx, customers.b, states.cx, states.y, 'state_id');

d.write(import.meta.url);
