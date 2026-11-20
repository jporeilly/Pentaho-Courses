// OrderStarCustomer (07), "3. Relationships": which SQL join the engine
// writes for each relationship type, and what an inner join loses. The
// top panel maps the types to joins; the bottom panel is a made-up
// three-row example, with no real data in it, of a fact row whose key
// has no match in the dimension. It sits after the "The join comes from
// the relationship type" panel in 07-properties-orderstarcustomer/
// guide.md, with a "Read the diagram" paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 07, "The join comes from the relationship type": N:1, 1:N,
//     1:1 and N:N all become inner joins, written as WHERE conditions; a
//     type with a 0 side becomes an outer join: 0:N or 0:1 left outer,
//     N:0 or 1:0 right outer. An inner join drops any ORDERFACT row whose
//     customer, product or time key has no match (on SampleData all
//     2,996 match, so nothing is lost). Choose a 0 side when every fact
//     row must count.
//   - Lesson 03 (03-domains-and-models-steelwheels), "A relationship
//     type is a declaration, not a check": the same mapping, plus 0:0 a
//     full outer join.
//   - Lesson 07, "3. Relationships": a relationship links a column in one
//     table to a column in another, usually a foreign key to a primary
//     key; every relationship in this star runs from the fact table to a
//     dimension, N:1.
//
// Colors: blue the relationship type you set in Relationship Properties
// (a tool setting); teal the join (a join); in the example, blue the
// input rows, amber the fact row with no match, teal a joined row, red
// the row the inner join drops. Icons: `link` a relationship, `merge` a
// join, `table-2` a table as in this folder's README.
//
// Run from this folder:   node relationship-joins.svg.mjs
// It writes relationship-joins.svg here and
// ../images/relationship-joins.png at twice the size.
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide; the height follows the two panels below.
const W = 800;

// ── Top panel: relationship type to join ───────────────────────────────
// Four rows, a type box on the left and its join on the right, 56 tall
// with 12px between rows.
const TOP = 16, RH = 56, RG = 12;
const ty = (i) => TOP + 60 + i * (RH + RG); // top of row i
const TOP_H = 60 + 4 * (RH + RG) + 4;
const TYPES = [
  // [relationship types, the join, its detail line, join role]
  ['N:1, 1:N, 1:1, N:N', 'no 0 side', 'Inner join', 'a WHERE condition; unmatched rows are dropped'],
  ['0:N, 0:1', 'a 0 side', 'Left outer join', 'keeps the unmatched rows of one side'],
  ['N:0, 1:0', 'a 0 side', 'Right outer join', 'keeps the unmatched rows of the other side'],
  ['0:0', 'both sides 0', 'Full outer join', 'keeps the unmatched rows of both sides'],
];

// The SVG height: the top panel, a 16px gap, the bottom panel.
const EX_Y = TOP + TOP_H + 16; // top of the bottom panel
const FACT_H = tableBoxHeight(3), DIM_H = tableBoxHeight(2);
// The results column (two three-row tables) is the taller one.
const EX_H = 60 + Math.max(FACT_H + 16 + DIM_H, 2 * FACT_H + 16) + 16;
const d = new Diagram(W, EX_Y + EX_H + 16);

d.panel({ x: 16, y: TOP, w: W - 32, h: TOP_H, role: 'join', iconName: 'link', title: 'Relationship type, and the join the engine writes', sub: 'set in Relationship Properties; only a 0 side changes the join' });
TYPES.forEach(([types, sub, join, line], i) => {
  // Left: the type(s), blue, as set in the dialog.
  const a = d.box({ x: 32, y: ty(i), w: 240, h: RH, role: 'tool', iconName: 'link', title: types, lines: [sub] });
  // Right: the join, teal, with what it does to rows that have no match.
  const b = d.box({ x: 344, y: ty(i), w: 424, h: RH, role: 'join', iconName: 'merge', title: join, lines: [line] });
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
});

// ── Bottom panel: what an inner join loses ─────────────────────────────
// Left: a fact table with three rows, one of whose keys (C) is missing
// from the two-row dimension underneath. Middle: the join on the key.
// Right: the two results, the inner join's on top, the outer join's
// below.
d.panel({ x: 16, y: EX_Y, w: W - 32, h: EX_H, role: 'support', iconName: 'table-2', title: 'An example: a fact row whose key has no match', sub: 'three made-up rows, joined to the dimension on the key' });
const R0 = EX_Y + 60; // top of the first row of tables

// The inputs: fact rows 1 and 2 match (blue); row 3's key C has no
// match (amber).
const fact = d.tableBox({ x: 32, y: R0, w: 200, role: 'source', iconName: 'table-2', title: 'Fact table', cols: ['fact row', 'key'],
  rows: [{ tone: 'source', cells: ['1', 'A'] }, { tone: 'source', cells: ['2', 'B'] }, { tone: 'check', cells: ['3', 'C'] }] });
const dim = d.tableBox({ x: 32, y: R0 + FACT_H + 16, w: 200, role: 'source', iconName: 'table-2', title: 'Dimension', cols: ['key'],
  rows: [{ tone: 'source', cells: ['A'] }, { tone: 'source', cells: ['B'] }] });

// The join, centered between the two result tables, so both arrows into it
// and both arrows out of it stay apart.
const midY = R0 + FACT_H + 8;
const join = d.box({ x: 296, y: midY - 40, w: 192, h: 80, role: 'join', iconName: 'merge', title: 'Join on the key', lines: ['A and B match;', 'C has no match'] });
d.arrow({ x1: fact.r, y1: fact.cy, x2: join.x - 3, y2: join.cy - 14 });
d.arrow({ x1: dim.r, y1: dim.cy, x2: join.x - 3, y2: join.cy + 14 });

// The results: inner join on top (row 3 dropped, red), outer join
// underneath (row 3 kept, amber, with no dimension row to join).
const inner = d.tableBox({ x: 552, y: R0, w: 216, role: 'join', iconName: 'merge', title: 'Inner join', sub: 'no 0 side', cols: ['fact row', 'joined to'],
  rows: [{ tone: 'join', cells: ['1', 'A'] }, { tone: 'join', cells: ['2', 'B'] }, { tone: 'reject', cells: ['3', 'dropped'] }] });
const outer = d.tableBox({ x: 552, y: inner.b + 16, w: 216, role: 'join', iconName: 'merge', title: 'Outer join', sub: 'a 0 side', cols: ['fact row', 'joined to'],
  rows: [{ tone: 'join', cells: ['1', 'A'] }, { tone: 'join', cells: ['2', 'B'] }, { tone: 'check', cells: ['3', 'no match'] }] });
d.arrow({ x1: join.r, y1: join.cy - 14, x2: inner.x - 3, y2: inner.cy });
d.arrow({ x1: join.r, y1: join.cy + 14, x2: outer.x - 3, y2: outer.cy });

d.write(import.meta.url);
