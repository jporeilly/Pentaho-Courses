// Charts & Sub Reports (21), "A sub-report is a whole report inside the
// bundle, run when its band prints" and "Inline or banded": how many
// times a sub-report runs, by the band that holds it, and where a
// banded and an inline sub-report print. It sits after the "Inline or
// banded" list in 21-mod8-charts-sub-reports/guide.md, with a "Read the
// diagram" paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 21, "3. A sub-report": a sub-report is a report inside a
//     report, with its own bands and its own query; placed in the
//     Report Header, it runs once. Under the hood: the engine executes
//     it each time the containing band is processed: once for a Report
//     Header, once per group in a Group Header, once per row in the
//     Details band; a sub-report in a group header makes a master-detail
//     report.
//   - Lesson 21, "Inline or banded": a banded sub-report prints at the
//     left edge of its parent, like another band; an inline sub-report
//     prints where its element sits in the parent band, at its x and y,
//     so it can sit beside other elements, as the workshop's sits beside
//     the radar chart. Step 3 places the sub-report element at 4.5
//     inches on the top ruler; step 2's chart is about 4.25 inches wide.
//   - Lesson 18 (18-mod7-parameters), "1. A list of product lines":
//     seven product lines, Classic Cars to Vintage Cars, so a sub-report
//     in a product line Group Header runs seven times; lesson 07 names
//     Motorcycles as the second.
//   - Lesson 23 (23-mod8-multiple-sub-reports): two inline sub-reports
//     in one Report Header, each with its own query, each run once.
//
// Colors: the bands as in report-bands (strips.mjs): blue the Report
// Header, teal a Group Header, white Details; violet each run of the
// sub-report, since the engine runs it. Icons: `file-chart-column` the
// report (this folder's README), `layers` a group and `rows-3` a row (as
// in report-bands), `files` a sub-report, `radar` the radar chart.
//
// Run from this folder:   node subreport-runs.svg.mjs
// It writes subreport-runs.svg here and ../images/subreport-runs.png at
// twice the size.
import { Diagram, ROLE, esc, icon } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 604);

// ── Top: one row per band; the band on the left, its sub-report's runs
// on the right, one violet chip per run ───────────────────────────────
d.panel({ x: 16, y: 16, w: 768, h: 324, role: 'server', iconName: 'files', title: 'How often a sub-report runs', sub: 'once each time the band that holds it prints' });
const BX = 32, BW = 220, BH = 72, ROW_Y = [76, 164, 252];
const CX0 = 288, CW = 104, CGAP = (768 - CX0 - 4 * CW) / 3;
const ROWS = [
  // [band role, icon, band name, band lines, runs: [title, line] each]
  ['tool', 'file-chart-column', 'Report Header', ['prints once, so the', 'sub-report runs once'],
    [['1 run', 'its own query']]],
  ['join', 'layers', 'Group Header', ['prints once per group:', 'master-detail'],
    [['run 1', 'Classic Cars'], ['run 2', 'Motorcycles'], ['…', 'one per line'], ['run 7', 'Vintage Cars']]],
  ['result', 'rows-3', 'Details', ['prints once per row:', 'one run per row'],
    [['run 1', 'row 1'], ['run 2', 'row 2'], ['run 3', 'row 3'], ['…', 'every row']]],
];
ROWS.forEach(([role, iconName, title, lines, runs], i) => {
  const y = ROW_Y[i];
  const band = d.box({ x: BX, y, w: BW, h: BH, role, iconName, title, lines });
  // The runs: a chip per run, the left-out ones ("…") in stone.
  runs.forEach(([t, l], j) => {
    d.box({ x: CX0 + j * (CW + CGAP), y: y + 8, w: CW, h: BH - 16, role: t === '…' ? 'off' : 'server', title: t, lines: [l], center: true });
  });
  // The band runs its sub-report: one arrow into the first chip.
  d.arrow({ x1: band.r, y1: band.cy, x2: CX0 - 3, y2: band.cy, straight: true });
});

// ── Bottom: where a banded and an inline sub-report print ─────────────
const PY = 364, PW = 376, PH = 224;

// A sketch of a parent band: a blue outline titled Report Header, at
// (x, y), 344 wide and 120 high. Returns its geometry.
function parentBand(x, y) {
  const c = ROLE.tool;
  d.raw(`<rect x="${x}" y="${y}" width="344" height="120" rx="6" fill="#ffffff" stroke="${c.stroke}" stroke-width="1.4"/>`);
  d.raw(`<text x="${x + 8}" y="${y + 16}" font-size="11.5" font-weight="700" fill="${c.text}">Parent band: Report Header</text>`);
  return { x, y, r: x + 344, b: y + 120 };
}
// A sub-report's rectangle in violet, with its name and a files icon.
function subRect(x, y, w, h, label) {
  const c = ROLE.server;
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.4"/>`);
  d.raw(icon('files', x + 8, y + h / 2 - 9, 18, c.stroke));
  d.raw(`<text x="${x + 32}" y="${y + h / 2 + 4}" font-size="12" font-weight="700" fill="${c.text}">${esc(label)}</text>`);
}
// The caption line under each sketch.
function caption(x, y, lines) {
  lines.forEach((l, i) => d.raw(`<text x="${x}" y="${y + i * 16}" font-size="12" fill="#0f172a">${esc(l)}</text>`));
}

// Banded: the sub-report fills the band from the parent's left edge.
d.panel({ x: 16, y: PY, w: PW, h: PH, role: 'result', iconName: 'rows-2', title: 'Banded', sub: 'like another band' });
const pb = parentBand(32, PY + 56);
subRect(pb.x, pb.y + 30, 344, 78, 'banded sub-report');
caption(32, PY + 214, ['prints at the left edge of its parent']);

// Inline: the chart on the left, the sub-report at its element's x.
d.panel({ x: 408, y: PY, w: PW, h: PH, role: 'result', iconName: 'columns-2', title: 'Inline', sub: "at its element's x and y" });
const pi = parentBand(424, PY + 56);
// The radar chart, about 4.25 inches wide, at the band's left.
d.raw(`<rect x="${pi.x + 10}" y="${pi.y + 30}" width="150" height="80" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>`);
d.raw(icon('radar', pi.x + 22, pi.y + 58, 24, '#475569'));
d.raw(`<text x="${pi.x + 54}" y="${pi.y + 75}" font-size="12" font-weight="700" fill="#0f172a">radar chart</text>`);
// The sub-report element, from 4.5 inches to the band's right edge.
subRect(pi.x + 172, pi.y + 30, 162, 80, 'inline sub-report');
// A dimension line from the band's left edge to the element's x.
d.raw(`<line x1="${pi.x}" y1="${pi.b + 12}" x2="${pi.x + 172}" y2="${pi.b + 12}" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrow)"/>`);
d.raw(`<line x1="${pi.x + 172}" y1="${pi.y + 110}" x2="${pi.x + 172}" y2="${pi.b + 18}" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>`);
d.raw(`<text x="${pi.x + 182}" y="${pi.b + 16}" font-size="11.5" fill="#334155">x = 4.5 in on the ruler</text>`);
caption(424, PY + 214, ['prints where its element sits, beside the chart']);

d.write(import.meta.url);
