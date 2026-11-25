// The Sales Mart star schema: mart_fact_sales in the middle, at the grain of
// one order line, and the three dimensions it joins to, each by its own
// surrogate key, with the key named on every join. It replaces the ASCII
// sketch in section 2, "The Star", of
// 02-from-source-data-to-a-star-schema/guide.md.
//
// Every fact comes from the course's own lessons and lab files:
//   - The four tables and what each holds: 02-from-source-data-to-a-star-
//     schema, section 2 ("The Sales Mart the course builds" and its table:
//     mart_fact_sales holds quantity_ordered, price_each, sales_amount, the
//     order number and status, and the three keys; mart_dim_date one row per
//     day; mart_dim_customer one row per customer version; mart_dim_product one
//     row per product).
//   - The grain, one order line, and the row count, 2,996 order lines in
//     the Steel Wheels data: 02, section 2, and 03-overview-of-
//     dimensional-modeling, section 1 ("Grain First").
//   - mart_dim_date: 1,096 rows, one per day from 1 January 2003 to
//     31 December 2005, keyed on the yyyymmdd smart key date_key:
//     03, sections 2 and 3.
//   - The columns and their types are the lab's own CREATE TABLE scripts:
//     04-build-a-date-dimension/files/dim_date.sql,
//     05-load-dimensions-with-slowly-changing-history/files/
//     dim_customer_product.sql and 07-load-the-fact-table/files/
//     fact_sales.sql. mart_fact_sales's primary key is the order line,
//     (order_number, order_line_number); each dimension's is its
//     surrogate key. Only the columns the lessons talk about are drawn;
//     mart_dim_date's quarter_name, month_name, day_of_month and day_of_week,
//     mart_dim_customer's contact_name, state and credit_limit, and
//     mart_dim_product's product_scale and msrp are left out for room.
//   - The joins: each dimension joins to the fact by one key, date_key,
//     customer_key and product_key (02, section 2: "Each dimension joins
//     to the fact by one key").
//
// Run from this folder:   node sales-mart-star.svg.mjs
// It writes sales-mart-star.svg here and ../images/sales-mart-star.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: three tables side by side in the middle row (customer, fact,
// product), with mart_dim_date centred above the fact table. Each table is
// 290px wide; the 109px gaps between them leave room for an arrow and
// the pill naming its key (about 94px for "customer_key").
const d = new Diagram(1120, 580);
const TW = 290; // every table's width
const XL = 16, XC = 415, XR = 814; // left edges of the three columns
const TOP = 16; // mart_dim_date's top
const MID = 266; // the middle row's top: mart_dim_date (176px tall) plus a 74px gap

// ── mart_dim_date, above the fact table ─────────────────────────────────────
// Six of its nine columns: the smart key and the calendar levels the
// cube's Time dimension reads (year_id, quarter_id, month_id).
const date = d.entity({
  x: XC, y: TOP, w: TW, role: 'store', iconName: 'calendar', title: 'mart_dim_date',
  fields: [
    ['INT', 'date_key', 'PK'],
    ['DATE', 'the_date', ''],
    ['SMALLINT', 'year_id', ''],
    ['TINYINT', 'quarter_id', ''],
    ['TINYINT', 'month_id', ''],
    ['CHAR(3)', 'month_name', ''],
  ],
});

// ── mart_fact_sales, in the middle ──────────────────────────────────────────
// All nine columns: the order line's own key (the degenerate dimension,
// order_number and order_line_number, which together are the primary
// key), the three surrogate keys, the status and the three measures.
// Teal: the table where the joins meet.
const fact = d.entity({
  x: XC, y: MID, w: TW, role: 'model', iconName: 'table-2', title: 'mart_fact_sales  (the fact table)',
  fields: [
    ['INT', 'order_number', 'PK'],
    ['SMALLINT', 'order_line_number', 'PK'],
    ['INT', 'date_key', 'FK'],
    ['INT', 'customer_key', 'FK'],
    ['INT', 'product_key', 'FK'],
    ['VARCHAR', 'status', ''],
    ['INT', 'quantity_ordered', ''],
    ['DECIMAL', 'price_each', ''],
    ['DECIMAL', 'sales_amount', ''],
  ],
});

// ── mart_dim_customer, on the left ──────────────────────────────────────────
// Nine columns: the surrogate key, the version columns that keep its
// type 2 history, the natural key, the name and the three place columns
// the Markets dimension reads.
const cust = d.entity({
  x: XL, y: MID, w: TW, role: 'store', iconName: 'users', title: 'mart_dim_customer',
  fields: [
    ['INT', 'customer_key', 'PK'],
    ['INT', 'version', ''],
    ['DATETIME', 'date_from', ''],
    ['DATETIME', 'date_to', ''],
    ['INT', 'customer_number', ''],
    ['VARCHAR', 'customer_name', ''],
    ['VARCHAR', 'city', ''],
    ['VARCHAR', 'country', ''],
    ['VARCHAR', 'territory', ''],
  ],
});

// ── mart_dim_product, on the right ──────────────────────────────────────────
// Nine columns, the same shape as mart_dim_customer: the surrogate key, the
// version columns (every field is type 1, but the step still keeps
// them), the natural key and the attributes the Product dimension reads.
const prod = d.entity({
  x: XR, y: MID, w: TW, role: 'store', iconName: 'package', title: 'mart_dim_product',
  fields: [
    ['INT', 'product_key', 'PK'],
    ['INT', 'version', ''],
    ['DATETIME', 'date_from', ''],
    ['DATETIME', 'date_to', ''],
    ['VARCHAR', 'product_code', ''],
    ['VARCHAR', 'product_name', ''],
    ['VARCHAR', 'product_line', ''],
    ['VARCHAR', 'product_vendor', ''],
    ['DECIMAL', 'buy_price', ''],
  ],
});

// ── The joins: one key per dimension ───────────────────────────────────
// Each arrow leaves the fact table's foreign key and ends on the
// dimension's primary key, with the key's name in a pill on the arrow.
// customer_key leaves the fact's left edge for mart_dim_customer's key row.
d.arrow({ x1: fact.x, y1: fact.rowY(3), x2: cust.r + 3, y2: cust.rowY(0), label: 'customer_key' });
// product_key leaves the fact's right edge for mart_dim_product's key row.
d.arrow({ x1: fact.r, y1: fact.rowY(4), x2: prod.x - 3, y2: prod.rowY(0), label: 'product_key' });
// date_key goes straight up from the fact's title strip into mart_dim_date's
// bottom edge: mart_dim_date sits directly above, so a vertical arrow is the
// one that crosses nothing.
d.arrow({ x1: fact.cx, y1: fact.y, x2: date.cx, y2: date.b + 3, straight: true, label: 'date_key' });

// ── What one row of each table stands for ──────────────────────────────
// A pill beside or under each table, saying its grain (and its row count
// where the lessons give one). mart_dim_date's sits to its left and right,
// in the empty top corners.
d.pill(XL + TW / 2, TOP + 88, ['mart_dim_date: one row per day,', '1 Jan 2003 to 31 Dec 2005:', '1,096 rows, keyed yyyymmdd']);
d.pill(XR + TW / 2, TOP + 88, ['Each dimension joins to the fact', 'by one surrogate key, generated', 'by the load (mart_dim_date: a smart key)']);
d.pill(cust.cx, cust.b + 24, 'one row per customer version');
d.pill(fact.cx, fact.b + 30, ['grain: one row per order line', '(2,996 in the Steel Wheels data)']);
d.pill(prod.cx, prod.b + 24, 'one row per product');

d.write(import.meta.url);
