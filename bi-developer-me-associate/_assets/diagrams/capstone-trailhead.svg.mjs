// Capstone: Trailhead Outfitters (12), "Suggested shape": the target
// design of the Trailhead domain. A bar for the business model and its
// business view, the Sales fact table joined N:1 to its four dimensions
// (Stores on two columns), the three calculated columns, and a strip
// showing what each test user gets. It replaces the domain half of the
// page's old text tree; the file tree of capstone\ stays as text under
// it, and a "Read the diagram" paragraph follows.
//
// Every fact comes from lesson 12 (12-capstone-trailhead-outfitters):
//   - Requirement 2 and "Inputs": the connection mysql:trailhead and the
//     five tables sales, stores, customers, products and calendar, with
//     their column names (sales: order_no, sale_date, region_code,
//     store_no, customer_id, product_id, quantity, unit_price,
//     discount_pct; stores: region_code + store_no is the key; customers:
//     customer_id, first_name, last_name, email, phone; products:
//     product_id, product_name, category, brand; calendar: date_key,
//     year_no, quarter_name, month_desc).
//   - The note under "Inputs": store numbers restart in each region, so
//     a sale names its store with two columns, region_code and store_no.
//   - Requirement 3: PC_NET_SALES (quantity x unit price, less the
//     discount; summed by default) and PC_ORDERS (distinct orders, not
//     lines) on sales; PC_CUSTOMER_NAME on customers (last name, a comma
//     and a space, the first name, such as "Barnes, Taylor", as MySQL
//     returns it). No formula is shown: writing them is the exercise.
//   - Requirement 4 and stage 4: business model Trailhead Sales, four N:1
//     relationships from Sales: Products on the product, Customers on the
//     customer, Calendar on the sale date, Stores on both store key
//     columns, which is a complex join (Complex Join? selected).
//   - Requirement 7 and the categories table: the business view's five
//     categories, Sales, Stores, Products, Customers and Calendar.
//   - Requirement 8, stage 8 and "Verification checks": the model is
//     readable by Power User and Business Analyst; Email and Phone by
//     admin only; rows: Power User WEST, Business Analyst EAST, admin
//     every region through its own Data Constraint entry (no free pass).
//     The test users: admin, suzy (Power User), pat (Business Analyst),
//     tiffany (Report Author), who sees no Trailhead Sales data source.
//
// Colors: teal the business model and its fact table; blue the dimension
// tables (sources the fact reads); amber what each user gets in
// Interactive Reports; red tiffany, who gets nothing. Icons as in this
// folder's README: `briefcase` a business model, `table-2` a table, plus
// `package` products, `users` customers, `calendar` the calendar,
// `store` stores, `user-round` a user and `user-x` a user with no access.
//
// Run from this folder:   node capstone-trailhead.svg.mjs
// It writes capstone-trailhead.svg here and
// ../images/capstone-trailhead.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. The dimension tables are 244 wide, so the longest
// column name (PC_CUSTOMER_NAME) fits; the fact table is 220 wide in the
// middle, leaving 30px gaps for the join arrows: 16..260, 290..510,
// 540..784.
const W = 800, EW = 220, DW = 244;
const XL = 16, XM = 290, XR = 540;
const d = new Diagram(W, 766);

// ── Top: the business model and its business view ─────────────────────
// A full-width bar: the model's name, its connection and the five
// categories report users see.
d.bar({ x: 16, y: 16, w: W - 32, h: 62, role: 'model', iconName: 'briefcase', title: 'Trailhead Sales, on the connection mysql:trailhead', line: 'Business View: Sales, Stores, Products, Customers, Calendar' });

// ── Middle: the star ───────────────────────────────────────────────────
// entity() rows are [left label, column name, key pill]. The left label
// is left empty for a database column and reads "calculated" for a
// column added in the physical layer (requirement 3).
const TOP = 98;
const sales = d.entity({
  x: XM, y: TOP, w: EW, role: 'model', iconName: 'table-2', title: 'sales  (fact)',
  fields: [
    ['', 'product_id', 'FK'], // row 0: to Products, on the left
    ['', 'sale_date', 'FK'], // row 1: to Calendar, on the right
    ['', 'customer_id', 'FK'], // row 2: to Customers, on the left
    ['', 'region_code', 'FK'], // rows 3 and 4: to Stores, on the right
    ['', 'store_no', 'FK'],
    ['', 'order_no', ''],
    ['', 'quantity', ''],
    ['', 'unit_price', ''],
    ['', 'discount_pct', ''],
    ['calculated', 'PC_NET_SALES', ''],
    ['calculated', 'PC_ORDERS', ''],
  ],
});
// Left: Products above Customers. Right: Calendar above Stores. The
// order of the FK rows above keeps every arrow from crossing another.
const prod = d.entity({
  x: XL, y: TOP, w: DW, role: 'source', iconName: 'package', title: 'products',
  fields: [['', 'product_id', 'PK'], ['', 'product_name', ''], ['', 'category', ''], ['', 'brand', '']],
});
const cust = d.entity({
  x: XL, y: TOP + 170, w: DW, role: 'source', iconName: 'users', title: 'customers',
  fields: [['', 'customer_id', 'PK'], ['', 'first_name', ''], ['', 'last_name', ''], ['', 'email', ''], ['', 'phone', ''], ['calculated', 'PC_CUSTOMER_NAME', '']],
});
const cal = d.entity({
  x: XR, y: TOP, w: DW, role: 'source', iconName: 'calendar', title: 'calendar',
  fields: [['', 'date_key', 'PK'], ['', 'year_no', ''], ['', 'quarter_name', ''], ['', 'month_desc', '']],
});
const stores = d.entity({
  x: XR, y: TOP + 170, w: DW, role: 'source', iconName: 'store', title: 'stores',
  fields: [['', 'region_code', 'PK'], ['', 'store_no', 'PK'], ['', 'region_name', ''], ['', 'store_name', '']],
});

// The four N:1 relationships, each from the fact's foreign key row to
// the dimension's key row. Stores gets two arrows: one complex join on
// both columns. Arrows end 3px short so the head clears the border.
d.arrow({ x1: sales.x, y1: sales.rowY(0), x2: prod.r + 3, y2: prod.rowY(0) });
d.arrow({ x1: sales.x, y1: sales.rowY(2), x2: cust.r + 3, y2: cust.rowY(0) });
d.arrow({ x1: sales.r, y1: sales.rowY(1), x2: cal.x - 3, y2: cal.rowY(0) });
d.arrow({ x1: sales.r, y1: sales.rowY(3), x2: stores.x - 3, y2: stores.rowY(0) });
d.arrow({ x1: sales.r, y1: sales.rowY(4), x2: stores.x - 3, y2: stores.rowY(1) });

// Labels under the tables: the relationship type of each join, and what
// each calculated column holds (requirement 3, in words, not formulas).
d.pill(prod.cx, prod.b + 15, ['N:1 on the product']);
d.pill(cal.cx, cal.b + 15, ['N:1 on the sale date']);
d.pill(stores.cx, stores.b + 23, ['N:1 on both store key', 'columns: a complex join']);
d.pill(cust.cx, cust.b + 34, ['N:1 on the customer;', 'Customer Name such as', 'Barnes, Taylor, for MySQL']);
d.pill(sales.cx, sales.b + 34, ['PC_NET_SALES: quantity × unit price,', 'less the discount, summed;', 'PC_ORDERS: distinct orders, not lines']);

// ── Bottom: who sees what ──────────────────────────────────────────────
// A 2 x 2 grid of users, as in the verification table. Amber: what the
// user gets in Interactive Reports. Red: tiffany, in neither role.
const PY = 524, UW = 360, UH = 72;
d.panel({ x: 16, y: PY, w: W - 32, h: 226, role: 'check', iconName: 'shield', title: 'Security on Trailhead Sales', sub: 'model: Power User and Business Analyst; rows: one Data Constraint per role or user' });
const UX = [32, 408], UY = [PY + 60, PY + 60 + UH + 14];
d.box({ x: UX[0], y: UY[0], w: UW, h: UH, role: 'check', iconName: 'user-round', title: 'admin', lines: ['every region, from its own entry;', 'Email and Phone listed'] });
d.box({ x: UX[1], y: UY[0], w: UW, h: UH, role: 'check', iconName: 'user-round', title: 'suzy, Power User', lines: ['WEST rows only', 'no Email or Phone'] });
d.box({ x: UX[0], y: UY[1], w: UW, h: UH, role: 'check', iconName: 'user-round', title: 'pat, Business Analyst', lines: ['EAST rows only', 'no Email or Phone'] });
d.box({ x: UX[1], y: UY[1], w: UW, h: UH, role: 'reject', iconName: 'user-x', title: 'tiffany, Report Author', lines: ['in neither role: no Trailhead', 'Sales data source at all'] });

d.write(import.meta.url);
