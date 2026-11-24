// Navigating Report Designer (03), "4. Report bands": when each band
// prints, drawn as two pages of a printed product report, the first and
// the last, with a key on the right. It sits after the band table in
// 03-mod2-navigating-report-designer/guide.md, with a "Read the diagram"
// paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 03, "4. Report bands" (the band table): Page Header at the
//     top of every page, and on the first page above the Report Header;
//     Report Header once, at the start; Group Header at the start of each
//     group; Details Header above the details of each group (the column
//     labels); Details once for every row; Report Footer once, at the
//     end; Page Footer at the bottom of every page, with the page number
//     and the number of pages.
//   - Lesson 03, "5. Structure and Data": each group has a Group Header
//     and a Group Footer; the details are part of the innermost group.
//   - Lesson 03, "Preview ran the report through the engine, twice":
//     the footer can say "page 1 of 12" on page one. The last page is
//     therefore drawn as page 12 of 12.
//   - Lesson 18, "1. A list of product lines": seven product lines, from
//     Classic Cars to Vintage Cars; lesson 07 ("A message field is a
//     template") names Motorcycles as the line after Classic Cars.
//   - Lesson 11, "2. Group totals": the Group Footer holds the group's
//     total; "3. Grand total": the Report Footer holds the grand total.
//
// Colors (strips.mjs, the same in every band diagram): slate the page
// bands, blue the report bands, teal the group bands (Details Header
// included, since it prints once per group), white a Details row, stone
// the groups and pages left out. Icons in the key: `files` a page,
// `file-chart-column` the report (Report Designer's icon in this
// folder's README), `layers` a group, `rows-3` a row.
//
// Run from this folder:   node report-bands.svg.mjs
// It writes report-bands.svg here and ../images/report-bands.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { stack, strip, STRIP_H } from './strips.mjs';

// Canvas: 800 wide. Two pages, 232 wide each, then a 268-wide key.
const PAGE_W = 232, PAGE_H = 402, TOP = 16;
const P1X = 16, P2X = 264, KEY_X = 516, KEY_W = 268;
const d = new Diagram(800, TOP + PAGE_H + 16);

// ── The two pages: a white panel each, titled with its page number ────
d.panel({ x: P1X, y: TOP, w: PAGE_W, h: PAGE_H, role: 'result', iconName: 'file-text', title: 'Page 1' });
d.panel({ x: P2X, y: TOP, w: PAGE_W, h: PAGE_H, role: 'result', iconName: 'file-text', title: 'Page 12, the last' });

// Strips start under the panel's title strip, 12px in from each side.
const SX = 12, SY = TOP + 46, SW = PAGE_W - 2 * SX;
// The Page Footer sits at the foot of each page, whatever fills it.
const FOOT_Y = TOP + PAGE_H - 12 - STRIP_H;

// ── Page 1: the Page Header first, then the Report Header, then the
// first group (Classic Cars) whole and the start of the second ────────
stack(d, {
  x: P1X + SX, y: SY, w: SW, items: [
    { kind: 'page', name: 'Page Header', value: 'every page' },
    { kind: 'report', name: 'Report Header', value: 'once, at the start' },
    { kind: 'group', name: 'Group Header', value: 'Classic Cars' },
    { kind: 'group', name: 'Details Header', value: 'column labels' },
    { kind: 'row', name: 'Details', value: 'a Classic Cars row' },
    { kind: 'row', name: 'Details', value: 'a Classic Cars row' },
    { kind: 'row', name: 'Details', value: 'a Classic Cars row' },
    { kind: 'group', name: 'Group Footer', value: 'its total' },
    { kind: 'group', name: 'Group Header', value: 'Motorcycles' },
    { kind: 'group', name: 'Details Header', value: 'column labels' },
    { kind: 'row', name: 'Details', value: 'a Motorcycles row' },
    { kind: 'row', name: 'Details', value: 'a Motorcycles row' },
  ],
});
strip(d, { x: P1X + SX, y: FOOT_Y, w: SW, kind: 'page', name: 'Page Footer', value: 'page 1 of 12' });

// ── The last page: the Page Header again, the last group (Vintage
// Cars), then the Report Footer, once; the pages between are left out ─
stack(d, {
  x: P2X + SX, y: SY, w: SW, items: [
    { kind: 'page', name: 'Page Header', value: 'every page' },
    { kind: 'gap', name: '…', value: 'pages 2 to 11 left out', dashed: true },
    { kind: 'group', name: 'Group Header', value: 'Vintage Cars' },
    { kind: 'group', name: 'Details Header', value: 'column labels' },
    { kind: 'row', name: 'Details', value: 'a Vintage Cars row' },
    { kind: 'row', name: 'Details', value: 'a Vintage Cars row' },
    { kind: 'group', name: 'Group Footer', value: 'its total' },
    { kind: 'report', name: 'Report Footer', value: 'once, at the end' },
  ],
});
strip(d, { x: P2X + SX, y: FOOT_Y, w: SW, kind: 'page', name: 'Page Footer', value: 'page 12 of 12' });

// ── The key: one box per kind of band, in its strip color ─────────────
d.panel({ x: KEY_X, y: TOP, w: KEY_W, h: PAGE_H, role: 'result', iconName: 'list', title: 'When each band prints' });
const KB_X = KEY_X + 12, KB_W = KEY_W - 24, KB_H = 80, KB_GAP = 10;
const KEY = [
  ['support', 'files', 'Once per page', ['Page Header at the top; on', 'page 1, above the Report', 'Header. Page Footer, bottom']],
  ['tool', 'file-chart-column', 'Once per report', ['Report Header at the start,', 'Report Footer at the end']],
  ['join', 'layers', 'Once per group', ['Group Header, Details Header', 'and Group Footer, for each', 'product line']],
  ['result', 'rows-3', 'Once per row', ['Details, for every row', 'the query returns']],
];
KEY.forEach(([role, iconName, title, lines], i) =>
  d.box({ x: KB_X, y: SY + i * (KB_H + KB_GAP), w: KB_W, h: KB_H, role, iconName, title, lines }));

d.write(import.meta.url);
