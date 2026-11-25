// The capstone's target: the rep_ star for sales by sales rep, with the
// sales rep dimension keeping a version per office move and an aggregate
// table rebuilt on every load, and underneath it the route from the
// nightly schedule through the job and its HTTP cache refresh to the
// cube. It replaces the star sketch under "Suggested shape" in
// 11-capstone-a-mart-for-the-sales-cube/guide.md; the folder tree
// beside it stays as text.
//
// Every fact comes from 11-capstone-a-mart-for-the-sales-cube/guide.md.
// The capstone leaves column names to the learner, so the diagram names
// tables and keys only, never columns:
//   - "Required behavior", 1 to 4: rep_dim_date, one row per day from
//     1 January 2003 to 31 December 2005, with a yyyymmdd integer key;
//     rep_dim_sales_rep from the two employee extracts, with the office's
//     city, country and territory joined in from offices.csv, office and
//     job title type 2, name type 1; rep_dim_customer and
//     rep_dim_product with a surrogate key and an unknown member;
//     rep_fact_order_lines, one row per order line, with the keys of all
//     four dimensions, the sales rep key being the version of the
//     customer's rep valid on the order date; at least one aggregate
//     table named the way Mondrian expects (the suggested shape's
//     agg_<grain>_rep_fact_order_lines), rebuilt on every load, at year
//     and office as the obvious first choice.
//   - "Required behavior", 5 and 6: load_sales_rep_mart.kjb, stored with
//     its transformations in /public/sales-rep-mart, scheduled on the
//     Pentaho Server every night; its last transformation writes
//     load_audit.csv; its last step before success is an HTTP entry that
//     refreshes the Mondrian schema cache; sales_rep_mart.xml, a Mondrian
//     schema with a cube on the fact table, time, sales rep (territory,
//     office, rep) and product line dimensions, Sales and Quantity, and
//     an AggName for the aggregate table.
//   - "Verification checks": the row counts (rep_dim_date 1,096;
//     rep_dim_customer 123 and rep_dim_product 111 with the unknown
//     member; rep_dim_sales_rep 25; rep_fact_order_lines 2,996; an
//     aggregate at year and office 21) and the rep who moved, Gerard
//     Hernandez, from Paris to London on 15 May 2005.
//
// Run from this folder:   node capstone-sales-rep-mart.svg.mjs
// It writes capstone-sales-rep-mart.svg here and
// ../images/capstone-sales-rep-mart.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: three columns for the star (left, centre, right), with
// 150px gaps between them for an arrow and its key pill; three rows (the
// date dimension, the middle row, the sales rep dimension), with 64px
// gaps for a two-line pill.
const BW = 260, BH = 72, HG = 150, VG = 64;
const XL = 32, XC = XL + BW + HG, XR = XC + BW + HG;
const W = XR + BW + 32;
const d = new Diagram(W, 760);
const P1 = 16, R0 = P1 + 56, R1 = R0 + BH + VG, R2 = R1 + BH + VG;

// ── Panel 1: the rep_ star ─────────────────────────────────────────────
const p1 = d.panel({ x: 16, y: P1, w: W - 32, h: R2 + BH + 20 - P1, role: 'support', iconName: 'table-2', title: 'The rep_ star in sampledata, at the order line grain', sub: 'Every dimension has a surrogate key and an unknown member; the fact table holds all four keys' });

// The fact table in the centre (teal, where the joins meet) and the four
// dimensions around it (green, stores in the mart).
const fact = d.box({ x: XC, y: R1, w: BW, h: BH, role: 'model', iconName: 'table-2', title: 'rep_fact_order_lines', lines: ['one row per order line:', '2,996, safe to load twice'] });
const date = d.box({ x: XC, y: R0, w: BW, h: BH, role: 'store', iconName: 'calendar', title: 'rep_dim_date', lines: ['one row per day, 2003 to', '2005: 1,096 rows'] });
const cust = d.box({ x: XL, y: R1, w: BW, h: BH, role: 'store', iconName: 'users', title: 'rep_dim_customer', lines: ['type 1: 123 rows, with', 'the unknown member'] });
const prod = d.box({ x: XR, y: R1, w: BW, h: BH, role: 'store', iconName: 'package', title: 'rep_dim_product', lines: ['type 1: 111 rows, with', 'the unknown member'] });
const rep = d.box({ x: XC, y: R2, w: BW, h: BH, role: 'store', iconName: 'history', title: 'rep_dim_sales_rep', lines: ['type 2: a version per', 'office move, 25 rows'] });

// The joins, each from the fact table to its dimension, the key in a
// pill. Straight arrows: every dimension is in line with the fact.
d.arrow({ x1: fact.cx, y1: fact.y, x2: date.cx, y2: date.b + 3, straight: true, label: 'date key (yyyymmdd)' });
d.arrow({ x1: fact.x, y1: fact.cy, x2: cust.r + 3, y2: cust.cy, straight: true, label: 'customer key' });
d.arrow({ x1: fact.r, y1: fact.cy, x2: prod.x - 3, y2: prod.cy, straight: true, label: 'product key' });
d.arrow({ x1: fact.cx, y1: fact.b, x2: rep.cx, y2: rep.y - 3, straight: true, label: ['sales rep key: the version', 'valid on the order date'] });

// The rep who moved, beside his dimension: amber, a check the
// verification table makes (19 lines from 15 May must go to London).
d.box({ x: XL, y: R2, w: BW, h: BH, role: 'check', iconName: 'building-2', title: 'Gerard Hernandez', lines: ['Paris, then London from', '15 May 2005: two versions'] });
d.arrow({ x1: XL + BW, y1: R2 + BH / 2, x2: rep.x - 3, y2: rep.cy, straight: true, dashed: true });

// The aggregate, at the bottom right: green (a write), rebuilt from the
// fact table on every load. Its full name, agg_<grain>_rep_fact_order_lines,
// is too long for a box title, so the box names the pattern's prefix.
// The arrow leaves the fact's right edge low down, under the product
// key arrow, and curves into the aggregate's left edge.
const agg = d.box({ x: XR, y: R2, w: BW, h: BH, role: 'write', iconName: 'sigma', title: 'An agg_ table', lines: ['year and office: 21 rows,', 'rebuilt on every load'] });
d.arrow({ x1: fact.r, y1: fact.b - 12, x2: agg.x - 3, y2: agg.cy, label: 'Group by' });

// ── Panel 2: load, schedule, refresh, cube ─────────────────────────────
// Four boxes left to right: the nightly schedule (violet, the server),
// the job it runs (slate, a supporting service), the HTTP entry that
// ends the job (amber, as in lesson 10's job diagram), and the cube the
// director queries (teal, a model).
const P2 = p1.b + 20;
d.panel({ x: 16, y: P2, w: W - 32, h: 56 + BH + 54, role: 'support', iconName: 'calendar-clock', title: 'Loaded every night, and the cube told', sub: 'The job and its transformations live in the Pentaho Repository, in /public/sales-rep-mart' });
// The four boxes share the width: 36px gaps, as in the other diagrams.
const BW2 = (W - 64 - 3 * 36) / 4;
const at = (i) => 32 + i * (BW2 + 36);
const R3 = P2 + 64;
const sch = d.box({ x: at(0), y: R3, w: BW2, h: BH, role: 'server', iconName: 'calendar-clock', title: 'Nightly schedule', lines: ['on the Pentaho Server'] });
const job = d.box({ x: at(1), y: R3, w: BW2, h: BH, role: 'support', iconName: 'list-ordered', title: 'load_sales_rep_mart.kjb', lines: ['dimensions, fact, aggregate,', 'then load_audit.csv'] });
const http = d.box({ x: at(2), y: R3, w: BW2, h: BH, role: 'browser', iconName: 'globe', title: 'HTTP entry', lines: ['refreshes the Mondrian', 'schema cache'] });
const cube = d.box({ x: at(3), y: R3, w: BW2, h: BH, role: 'model', iconName: 'boxes', title: 'sales_rep_mart.xml', lines: ['the cube, with an AggName', 'for the aggregate table'] });
d.arrow({ x1: sch.r, y1: sch.cy, x2: job.x - 3, y2: job.cy });
d.arrow({ x1: job.r, y1: job.cy, x2: http.x - 3, y2: http.cy });
d.arrow({ x1: http.r, y1: http.cy, x2: cube.x - 3, y2: cube.cy });
// What each hop means, under the gap it labels.
d.pill((sch.r + job.x) / 2, sch.b + 24, 'runs, with the input file parameters');
d.pill((http.r + cube.x) / 2, http.b + 24, 'its last step before success');

// Size the canvas to the second panel's foot.
d.h = P2 + 56 + BH + 54 + 16;

d.write(import.meta.url);
