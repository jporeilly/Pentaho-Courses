// Overview of MDX Query, "MDX at a glance": the parts of a SELECT mapped
// onto the grid it returns. The COLUMNS set becomes the column headers, the
// ROWS set the row headers, FROM names the cube, and the WHERE slicer is on
// no axis at all: it is a hidden coordinate of every cell. A strip at the
// foot shows where a slicer ends up in the SQL. It sits after the syntax
// table in 10-mdx-query/guide.md.
//
// Every fact comes from the course's own lessons:
//   - 10-mdx-query, "MDX at a glance": the query itself, exactly as the
//     lesson prints it - { [Measures].[Sales], [Measures].[Quantity] } ON
//     COLUMNS, { [Years].&[2004], [Years].&[2005] } ON ROWS, FROM
//     [Sales_2003_2005], WHERE ( [MARKETS.Markets].[APAC] ); and the
//     syntax table: SELECT ... ON COLUMNS, ... ON ROWS places sets on
//     visible axes, FROM names the cube, WHERE is the slicer, & refers to
//     a member by its key.
//   - 11-mdx-query-mdx-query, tab 3 (A Cross-Tab Query): the same query
//     (with the short form [Markets].[APAC]) returns 2004 Sales 601,606
//     and Quantity 5,938, 2005 Sales 337,018 and Quantity 3,411. Its Under
//     the hood box: [MARKETS.Markets].[APAC] is the full form of
//     [Markets].[APAC].
//   - 11-mdx-query-mdx-query, tab 2 (A Basic Query), Under the hood "WHERE
//     sets the context of every cell": the slicer is not a filter on rows;
//     it fixes [Years].[2004] as part of every cell's coordinates, which is
//     why 2004 appears on no axis, and in the SQL Mondrian sends it becomes
//     a condition on the cell query, YEAR_ID = '2004'. That is the basic
//     query's slicer, not this one's, so the strip says so.
//
// Colors follow the kit's roles: blue the query you write (a tool you
// work in), white the result, amber the slicer (a check applied to every
// cell), green the SQL that reaches the database (a store).
//
// Run from this folder:   node mdx-anatomy.svg.mjs
// It writes mdx-anatomy.svg here and ../images/mdx-anatomy.png at twice
// the size.
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas: the query on the left, the grid on the right, the SQL strip
// along the foot.
const d = new Diagram(1100, 560);
const QW = 440, QH = 66;
const QY = [80, 160, 240, 320];

// ── The query ──────────────────────────────────────────────────────────
// One box per clause, in the order the query is written. The first three
// are blue (the visible parts of the query); the slicer is amber, the
// color the grid uses for its hidden coordinate.
d.panel({ x: 16, y: 16, w: 472, h: 400, role: 'tool', iconName: 'pencil-ruler', title: 'The query', sub: 'one clause per part of the result' });
const cols = d.box({ x: 32, y: QY[0], w: QW, h: QH, role: 'tool', iconName: 'columns-3', title: 'SELECT { ... } ON COLUMNS', lines: ['{ [Measures].[Sales], [Measures].[Quantity] }'] });
const rows = d.box({ x: 32, y: QY[1], w: QW, h: QH, role: 'tool', iconName: 'rows-3', title: '{ ... } ON ROWS', lines: ['{ [Years].&[2004], [Years].&[2005] }   (& = by key)'] });
const from = d.box({ x: 32, y: QY[2], w: QW, h: QH, role: 'tool', iconName: 'box', title: 'FROM [Sales_2003_2005]', lines: ['the cube the query reads'] });
const where = d.box({ x: 32, y: QY[3], w: QW, h: QH, role: 'check', iconName: 'crosshair', title: 'WHERE ( [MARKETS.Markets].[APAC] )', lines: ['the slicer: on no axis'] });

// ── The grid ───────────────────────────────────────────────────────────
// White: the result. Drawn with raw SVG, as no kit part is a grid: a
// corner cell, two column headers, two row headers and four value cells.
// Each value cell also prints its full coordinates, APAC included, in
// amber, to show the slicer sits in every cell.
d.panel({ x: 600, y: 16, w: 484, h: 400, role: 'result', iconName: 'table', title: 'The result grid', sub: 'Sales and Quantity in APAC, by year' });
const GX = 616, CW0 = 116, CW = 168, GY = 140, HH = 40, RH = 76;
const colX = [GX + CW0, GX + CW0 + CW]; // left edges of the two value columns
const rowY = [GY + HH, GY + HH + RH]; // top edges of the two value rows
// Header cells: slate fill, bold text, one per measure and per year.
const cell = (x, y, w, h, fill, stroke) => d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
const text = (x, y, s, opts = '') => d.raw(`<text x="${x}" y="${y}" text-anchor="middle" ${opts}>${esc(s)}</text>`);
cell(GX, GY, CW0, HH, '#f1f5f9', '#94a3b8');
['Sales', 'Quantity'].forEach((m, i) => {
  cell(colX[i], GY, CW, HH, '#dbeafe', '#1d4ed8');
  text(colX[i] + CW / 2, GY + 25, m, 'font-size="14" font-weight="700" fill="#1e3a8a"');
});
['2004', '2005'].forEach((y, i) => {
  cell(GX, rowY[i], CW0, RH, '#dbeafe', '#1d4ed8');
  text(GX + CW0 / 2, rowY[i] + RH / 2 + 5, y, 'font-size="14" font-weight="700" fill="#1e3a8a"');
});
// The four values (lesson 11's checkpoint), each with its coordinates.
const VALUES = [['601,606', '5,938'], ['337,018', '3,411']];
VALUES.forEach((r, ri) => r.forEach((v, ci) => {
  const x = colX[ci], y = rowY[ri];
  cell(x, y, CW, RH, '#ffffff', '#94a3b8');
  text(x + CW / 2, y + 30, v, 'font-size="16" font-weight="700" fill="#0f172a"');
  // The cell's coordinates: measure, year, then the slicer's APAC in an
  // amber chip, the part no axis shows.
  d.raw(`<text x="${x + CW / 2 + 12}" y="${y + 56}" text-anchor="end" font-size="11.5" fill="#475569">${['Sales', 'Quantity'][ci]}, ${['2004', '2005'][ri]},</text>`);
  d.raw(`<rect x="${x + CW / 2 + 16}" y="${y + 43}" width="44" height="18" rx="9" fill="#fef3c7" stroke="#b45309" stroke-width="1"/>`);
  text(x + CW / 2 + 38, y + 56, 'APAC', 'font-size="11" font-weight="700" fill="#78350f"');
}));
const gridR = colX[1] + CW, gridB = rowY[1] + RH;

// ── Clause to grid ─────────────────────────────────────────────────────
// COLUMNS to the column headers, ROWS to the row headers: solid arrows,
// since both become visible headers.
d.arrow({ x1: cols.r, y1: cols.cy, x2: colX[0] + CW, y2: GY - 4, elbow: true, label: 'across the top', lx: 720, ly: cols.cy });
d.arrow({ x1: rows.r, y1: rows.cy, x2: GX - 4, y2: rowY[0] + RH / 2, label: 'down the side', lx: 544 });
// WHERE to the cells: dashed, since the slicer adds no header. It enters
// the grid from below, between the two value columns.
d.arrow({ x1: where.r, y1: where.cy, x2: colX[1], y2: gridB + 4, elbow: true, dashed: true });
d.pill(colX[1] + 80, 374, ['in every cell, on no axis']);

// ── The slicer in the SQL ──────────────────────────────────────────────
// Green: the SQL that reaches SampleData. Lesson 11's basic query is the
// one whose SQL the lesson shows, so the strip names it.
d.bar({
  x: 16, y: 440, w: 1068, h: 70, role: 'store', iconName: 'database',
  title: "In the SQL, a slicer becomes a condition on the cell query: YEAR_ID = '2004'",
  line: "the MDX Query workshop's basic query: SELECT Measures.allmembers ON COLUMNS FROM [Sales_2003_2005] WHERE ([Years].[2004])",
});
d.raw(`<text x="550" y="540" text-anchor="middle" font-size="12" fill="#475569">Read the WHERE clause first when a figure surprises you: it changes every number without adding a row or a column.</text>`);

d.write(import.meta.url);
