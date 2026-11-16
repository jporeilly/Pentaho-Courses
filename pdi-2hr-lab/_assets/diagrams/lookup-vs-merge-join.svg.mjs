// Stream lookup against Merge join: the two ways Lab 3 brings reference
// data onto the sales, side by side on one grid, with where the lab
// uses each. It sits at "Lookup or join?" in
// 03-enrich-and-join/guide.md, above the comparison table.
//
// Every fact comes from 03-enrich-and-join/guide.md:
//   Stream lookup (step 3 and "A lookup index, built once, used 37
//   times"):
//     - It reads the lookup stream (Read customers, from customers.json,
//       20 customers) to the end and builds an index in memory keyed on
//       the matched fields; then each sales row is looked up in it.
//     - The main stream is Valid rows, the Lab 2 TRUE branch; input
//       order: any, no sorting needed; the whole lookup stream is held
//       in RAM.
//     - Rows out: never more than in; no match: the row continues with
//       the fields null.
//     - The lab uses it twice: + customer (customer_id = customer_id,
//       retrieving customer_name and region_code) and + products
//       (product_id = id, from Read products).
//   Merge join (step 5 and "Why the join demands sorted input"):
//     - Sort by regions sorts the sales (from Compute margin) on
//       region_code; Sort regions sorts Read regions (regions.csv) on
//       code; + region joins them, LEFT OUTER, keys region_code and
//       code; out come region_name and manager_email.
//     - It walks both sorted streams forward together, holding only the
//       current rows, so neither has to fit in memory.
//     - Join types INNER, LEFT / RIGHT / FULL OUTER; LEFT OUTER keeps a
//       sale with no matching region (INNER would drop it); it can
//       multiply rows when a key matches many.
//
// Run from this folder:   node lookup-vs-merge-join.svg.mjs
// It writes lookup-vs-merge-join.svg here and
// ../images/lookup-vs-merge-join.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas, and one grid for both panels: four columns of same-size boxes
// with 36px gaps, so the two techniques line up column by column:
// inputs, preparation, the step itself, the result.
const d = new Diagram(1164, 544); // two panels of panelH (248) with 16px margins and gap
const BW = 248, BH = 72;
const COL = [32, 316, 600, 884];
const PITCH = 92; // a box plus a 20px gap

// A box in column `c`, with its top at `y`.
const cell = (c, y, o) => d.box({ x: COL[c], y, w: BW, h: BH, ...o });

// Each panel has the same shape: two input rows (the reference on top,
// the sales underneath), the step in column 2 between the two rows, and
// the result in column 3 beside it. The panel's sub line says where the
// lab uses it.
const panelH = 56 + 10 + PITCH + BH + 18; // the extra 10 clears the two-line title strip

// ── Stream lookup ────────────────────────────────────────────────────
const A = 16, A1 = A + 66, A2 = A1 + PITCH; // panel top, then its two rows
d.panel({ x: 16, y: A, w: 1132, h: panelH, role: 'support', iconName: 'merge', title: 'Stream lookup: hold the small side in memory', sub: 'Lab 3 uses it for + customer and + products: small reference sets' });
const ref = cell(0, A1, { role: 'source', iconName: 'file-json', title: 'Read customers', lines: ['customers.json: read to', 'the end first, 20 rows'] });
// The index is the lookup stream held in memory: amber, a lookup table,
// with the DI course's lookup-table icon, `book-open`.
const idx = cell(1, A1, { role: 'check', iconName: 'book-open', title: 'Index in memory', lines: ['built once, keyed on', 'customer_id'] });
const main = cell(0, A2, { role: 'source', iconName: 'rows-3', title: 'Valid rows', lines: ['the 37 sales, in', 'any order: no sorting'] });
const lk = cell(2, (A1 + A2) / 2, { role: 'join', iconName: 'merge', title: '+ customer', lines: ['looks each sale up', 'in the index'] });
const lkOut = cell(3, (A1 + A2) / 2, { role: 'result', iconName: 'circle-check', title: '37 rows out', lines: ['never more than in; no', 'match: fields left null'] });
d.arrow({ x1: ref.r, y1: ref.cy, x2: idx.x - 3, y2: idx.cy });
d.arrow({ x1: idx.r, y1: idx.cy, x2: lk.x - 3, y2: lk.cy - 12 });
// The sales cross the empty column 1 of row 2 into the lookup.
d.arrow({ x1: main.r, y1: main.cy, x2: lk.x - 3, y2: lk.cy + 12 });
d.arrow({ x1: lk.r, y1: lk.cy, x2: lkOut.x - 3, y2: lkOut.cy });

// ── Merge join ───────────────────────────────────────────────────────
// The same shape, with a Sort rows step in column 1 on both rows: the
// price of the join. `arrow-down-a-z` is Sort rows.
const B = A + panelH + 16, B1 = B + 66, B2 = B1 + PITCH;
d.panel({ x: 16, y: B, w: 1132, h: panelH, role: 'support', iconName: 'merge', title: 'Merge join: walk two sorted streams together', sub: 'Lab 3 uses it for + region: an SQL-style join, where neither side has to fit in memory' });
const regs = cell(0, B1, { role: 'source', iconName: 'file-text', title: 'Read regions', lines: ['regions.csv'] });
const sortR = cell(1, B1, { role: 'engine', iconName: 'arrow-down-a-z', title: 'Sort regions', lines: ['Sort rows on code'] });
const sales = cell(0, B2, { role: 'source', iconName: 'calculator', title: 'Compute margin', lines: ['the 37 sales, with', 'region_code'] });
const sortS = cell(1, B2, { role: 'engine', iconName: 'arrow-down-a-z', title: 'Sort by regions', lines: ['Sort rows on region_code'] });
const mj = cell(2, (B1 + B2) / 2, { role: 'join', iconName: 'merge', title: '+ region', lines: ['LEFT OUTER here; also', 'INNER, RIGHT, FULL OUTER'] });
const mjOut = cell(3, (B1 + B2) / 2, { role: 'result', iconName: 'circle-check', title: '37 rows out', lines: ['LEFT OUTER keeps a sale', 'with no matching region'] });
d.arrow({ x1: regs.r, y1: regs.cy, x2: sortR.x - 3, y2: sortR.cy });
d.arrow({ x1: sales.r, y1: sales.cy, x2: sortS.x - 3, y2: sortS.cy });
d.arrow({ x1: sortR.r, y1: sortR.cy, x2: mj.x - 3, y2: mj.cy - 12 });
d.arrow({ x1: sortS.r, y1: sortS.cy, x2: mj.x - 3, y2: mj.cy + 12 });
d.arrow({ x1: mj.r, y1: mj.cy, x2: mjOut.x - 3, y2: mjOut.cy });

d.write(import.meta.url);
