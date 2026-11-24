// Totals (11), "TotalGroupSumFunction knows the group's total before the
// group starts": the reporting engine's two passes over the query's
// rows, the output processors that render the result, and, underneath,
// why a Sum total can print in a Group Header while ItemSumFunction is
// right only in a footer. It sits after that Under the hood panel in
// 11-mod5-totals/guide.md, with a "Read the diagram" paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 03 (03-mod2-navigating-report-designer), "Preview ran the
//     report through the engine, twice": Report Designer hands the
//     report to the Pentaho Reporting engine, the same code the server
//     runs; it executes the query, then processes the rows in two
//     passes. The pagination pass lays everything out to find where
//     pages break and what the group and report totals will be; the
//     print pass prints the pages, so the footer can say "page 1 of 12"
//     on page one.
//   - Lesson 11, the Under the hood panel above the figure: the Sum
//     function, TotalGroupSumFunction, adds up QUANTITYINSTOCK in the
//     pagination pass, resetting at each Product Line group, and
//     remembers each group's total; in the print pass it reports the
//     complete group total from the group's first row onward, so it
//     works in a Group Header as well as a footer. The running family,
//     such as ItemSumFunction, is correct only once the last row of the
//     group has passed, so it belongs in footers alone.
//   - Lesson 11, "2. Group totals": Classic Cars' total is 5,844,033.
//   - Lesson 07 (07-mod4-adding-elements-groups), "pagebreak-after is a
//     layout instruction": the engine produces one laid-out result and
//     each output processor (PDF, Excel, HTML, CSV) renders it the way
//     that format can; the preview is a pageable output like PDF.
//
// Colors: green the database the rows come from; violet the engine and
// its two passes; white the output processors and the comparison;
// amber a cell where the value is right (a check that passes), red where
// it is not complete yet, white a running value. Icons: `database` a
// database and `cog` the reporting engine (this folder's README),
// `ruler` the layout pass, `printer` the print pass, `file-output` an
// output, `sigma` a total.
//
// Run from this folder:   node two-pass-engine.svg.mjs
// It writes two-pass-engine.svg here and ../images/two-pass-engine.png
// at twice the size.
import { Diagram, ROLE, esc, icon } from '../../../../scripts/diagram-kit.mjs';
import { strip } from './strips.mjs';

const d = new Diagram(800, 586);

// ── Top: the query's rows feed the engine's two passes ────────────────
// The engine panel spans the right of the canvas; the query box sits
// outside it on the left, level with the two passes.
const BY = 76, BH = 110;
d.panel({ x: 202, y: 16, w: 582, h: BH + 76, role: 'server', iconName: 'cog', title: 'Pentaho Reporting engine', sub: 'the same code in Preview and on the server' });
const q = d.box({ x: 16, y: BY, w: 154, h: BH, role: 'store', iconName: 'database', title: 'Query rows', lines: ['every row the', "report's query", 'returns'] });
const p1 = d.box({ x: 218, y: BY, w: 260, h: BH, role: 'server', iconName: 'ruler', title: '1. Pagination pass', lines: ['lays out every row: where', 'pages break, how many pages,', "each group's Sum total"] });
const p2 = d.box({ x: 508, y: BY, w: 260, h: BH, role: 'server', iconName: 'printer', title: '2. Print pass', lines: ['prints the pages: page 1 of', '12 on page 1, a group total', 'in its Group Header'] });
// Rows into the first pass; what the first pass learned into the second.
d.arrow({ x1: q.r, y1: q.cy, x2: p1.x - 3, y2: p1.cy });
d.arrow({ x1: p1.r, y1: p1.cy, x2: p2.x - 3, y2: p2.cy });

// ── Middle: the output processors, each rendering the laid-out pages ──
const OY = 228;
const out = d.panel({ x: 202, y: OY, w: 582, h: 104, role: 'result', iconName: 'file-output', title: 'Output processors', sub: 'each renders the one laid-out result its own way' });
const OUTS = ['Preview', 'PDF', 'Excel', 'HTML', 'CSV'];
const OW = 98, OGAP = (582 - 32 - OUTS.length * OW) / (OUTS.length - 1);
OUTS.forEach((t, i) => d.box({ x: 218 + i * (OW + OGAP), y: OY + 56, w: OW, h: 36, role: 'result', title: t, center: true }));
// The print pass hands its pages down to the processors.
d.arrow({ x1: p2.cx, y1: p2.b, x2: p2.cx, y2: out.y - 3, vertical: true });

// ── Bottom: one group in the print pass, and the two kinds of sum ─────
const GY = 356;
d.panel({ x: 16, y: GY, w: 768, h: 214, role: 'result', iconName: 'sigma', title: 'In the print pass: the Classic Cars group, two kinds of sum' });
// Column headers over the two sum columns.
const C0 = 32, C0W = 232, C1 = 284, C2 = 536, CW = 232;
const hy = GY + 62;
d.raw(`<text x="${C1 + CW / 2}" y="${hy}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0f172a">Sum (TotalGroupSumFunction)</text>`);
d.raw(`<text x="${C2 + CW / 2}" y="${hy}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0f172a">ItemSumFunction (running)</text>`);

// One value cell: a rounded rect in a role's colors, a check or a cross
// icon on the left when `mark` is given, and the text after it.
function cell(x, y, role, mark, text) {
  const c = ROLE[role];
  d.raw(`<rect x="${x}" y="${y}" width="${CW}" height="32" rx="6" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.2"/>`);
  if (mark) d.raw(icon(mark, x + 10, y + 7, 18, c.stroke));
  d.raw(`<text x="${x + (mark ? 36 : 12)}" y="${y + 20.5}" font-size="12" fill="${c.text}">${esc(text)}</text>`);
}

// The three rows: the band as a strip on the left, then each function's
// value when that band prints.
const ROWS = [
  [{ kind: 'group', name: 'Group Header', value: 'before its rows' }, ['check', 'circle-check', '5,844,033, already complete'], ['reject', 'circle-x', 'not complete yet']],
  [{ kind: 'row', name: 'Details', value: 'every row' }, ['check', 'circle-check', '5,844,033 on every row'], ['result', null, 'the total so far']],
  [{ kind: 'group', name: 'Group Footer', value: 'after the last row' }, ['check', 'circle-check', '5,844,033'], ['check', 'circle-check', '5,844,033']],
];
ROWS.forEach(([band, a, b], i) => {
  const y = GY + 78 + i * 42;
  strip(d, { ...band, x: C0, y, w: C0W, h: 32 });
  cell(C1, y, ...a);
  cell(C2, y, ...b);
});

d.write(import.meta.url);
