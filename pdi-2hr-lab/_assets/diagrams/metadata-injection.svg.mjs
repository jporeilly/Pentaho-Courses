// Metadata injection in Lab 5: the driver job loops over control.csv,
// the injector fills in the template's reader for each row and runs it,
// and three differently shaped feeds end up in one standard file. It
// sits under "The shape of the solution" note in
// 05-metadata-injection/guide.md.
//
// Every fact comes from 05-metadata-injection/guide.md and its files:
//   - control.csv: one row per feed, a filename (full path) and a
//     separator: stores_north.csv ",", stores_south.txt "|",
//     partners_eu.csv ";". Adding a feed (stores_scotland.csv in "Run
//     and extend") means adding one line to control.csv.
//   - The feeds differ in headers and delimiters: stores_north.csv
//     store, sale_date, amount (comma); stores_south.txt location,
//     trading_date, takings (pipe); partners_eu.csv outlet, dt,
//     revenue_eur (semicolon). They share the column order.
//   - mi_driver.kjb: START, Read control file (read_control.ktr: Text
//     file input of control.csv, then Copy rows to result), Inject per
//     feed (mi_inject.ktr, Execute every input row selected), Success.
//   - mi_inject.ktr: File config (Get rows from result: filename,
//     separator) into Inject and run template (ETL metadata injection
//     on mi_template.ktr), mapping two properties of Read feed:
//     FILENAME from filename and SEPARATOR from separator. "Leave
//     everything else alone."
//   - mi_template.ktr: Read feed (Text file input, no file; fields
//     col_store, col_date, col_amount typed by hand), Standardize
//     (Select values renaming them to store, sale_date, amount), Append
//     to all_feeds (Text file output to out\all_feeds.csv, Append, no
//     header). The run gives 18 rows from three feeds.
// The audit said the injector fills in a "header map"; it does not. It
// injects the file and the separator only; the header names are mapped
// by the template's own Standardize step, by position, the same for
// every feed.
//
// Run from this folder:   node metadata-injection.svg.mjs
// It writes metadata-injection.svg here and
// ../images/metadata-injection.png at twice the size.
import { Diagram, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// One grid for all three panels: four columns of same-size boxes, 36px
// gaps for the arrows, as in this course's other diagrams.
const BW = 248, BH = 72;
const COL = [32, 316, 600, 884];
const PITCH = 92; // a box plus a 20px gap

// Vertical layout, worked out first so the canvas fits it exactly.
// Panel 1 (the job): its row of entries, then control.csv under them.
const P1 = 16, J = P1 + 56;
const ctlRows = 4; // three feeds plus the one a learner adds
const CT = J + BH + 28; // control table's top: under the job row
const P1H = CT + tableBoxHeight(ctlRows) + 18 - P1;
// Panel 2 (the injector): one row, after a 48px gap for the arrow pill.
const P2 = P1 + P1H + 48, I = P2 + 56;
const P2H = 56 + BH + 18;
// Panel 3 (the template): three rows, one per feed.
const P3 = P2 + P2H + 48, T = [P3 + 56, P3 + 56 + PITCH, P3 + 56 + 2 * PITCH];
const P3H = 56 + 2 * PITCH + BH + 18;
const d = new Diagram(1164, P3 + P3H + 16);

// A box in column `c` with its top at `y`.
const cell = (c, y, o) => d.box({ x: COL[c], y, w: BW, h: BH, ...o });

// ── Panel 1: the driver job ──────────────────────────────────────────
// The job's four entries in a line, as on its canvas. A transformation
// entry uses the transformation icon, `shuffle`, as in the DI course.
d.panel({ x: 16, y: P1, w: 1132, h: P1H, role: 'support', iconName: 'list-ordered', title: 'mi_driver.kjb: the driver job' });
const start = cell(0, J, { role: 'tool', iconName: 'play', title: 'START', lines: ['the job begins'] });
const readCtl = cell(1, J, { role: 'engine', iconName: 'shuffle', title: 'Read control file', lines: ['read_control.ktr: Copy', 'rows to result'] });
const inject = cell(2, J, { role: 'engine', iconName: 'repeat', title: 'Inject per feed', lines: ['mi_inject.ktr, Execute', 'every input row'] });
const done = cell(3, J, { role: 'write', iconName: 'circle-check', title: 'Success', lines: ['every feed appended'] });
[[start, readCtl], [readCtl, inject], [inject, done]].forEach(([a, b]) => d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy }));

// control.csv under the first two entries, two columns wide, its rows
// drawn in the box. The three feeds are blue (rows the job reads); the
// fourth, the feed a learner adds in "Run and extend", is green.
const ctl = d.tableBox({
  x: COL[0], y: CT, w: COL[1] + BW - COL[0], role: 'source', iconName: 'file-text',
  title: 'control.csv', sub: 'one row per feed: a new feed is a new row',
  cols: ['filename (the full path)', 'separator'],
  rows: [
    { tone: 'source', cells: ['…/stores_north.csv', ', (comma)'] },
    { tone: 'source', cells: ['…/stores_south.txt', '| (pipe)'] },
    { tone: 'source', cells: ['…/partners_eu.csv', '; (semicolon)'] },
    { tone: 'write', cells: ['+ …/stores_scotland.csv', 'its separator'] },
  ],
});
// The control file goes up into the entry that reads it.
d.arrow({ x1: readCtl.cx, y1: ctl.y, x2: readCtl.cx, y2: readCtl.b + 3, straight: true });

// ── Panel 2: the injector ────────────────────────────────────────────
// Columns 2 and 3, so the arrow from the job's Inject per feed (column
// 2) comes straight down into File config, where each row arrives,
// passing the empty column 2 beside control.csv.
d.panel({ x: 16, y: P2, w: 1132, h: P2H, role: 'support', iconName: 'file-cog', title: 'mi_inject.ktr: the injector, once per control row' });
const cfg = cell(2, I, { role: 'source', iconName: 'inbox', title: 'File config', lines: ['Get rows from result:', 'filename, separator'] });
const mdi = cell(3, I, { role: 'join', iconName: 'syringe', title: 'Inject and run template', lines: ['ETL metadata injection:', 'FILENAME, SEPARATOR'] });
d.arrow({ x1: cfg.r, y1: cfg.cy, x2: mdi.x - 3, y2: mdi.cy });
// Job to injector: straight down from Inject per feed into File
// config's top; the pill sits in the gap between the panels.
d.arrow({ x1: inject.cx, y1: inject.b, x2: cfg.cx, y2: cfg.y - 3, straight: true, dashed: true, label: 'one control row per run', ly: P2 - 24 });

// ── Panel 3: the template ────────────────────────────────────────────
// The three feeds stacked in column 0; the template's three steps along
// the middle row.
d.panel({ x: 16, y: P3, w: 1132, h: P3H, role: 'support', iconName: 'file-cog', title: 'mi_template.ktr: the template, filled in and run' });
const feeds = [
  ['stores_north.csv', ['store, sale_date, amount', 'comma separated']],
  ['stores_south.txt', ['location, trading_date,', 'takings: pipe separated']],
  ['partners_eu.csv', ['outlet, dt, revenue_eur', 'semicolon separated']],
].map(([title, lines], i) => cell(0, T[i], { role: 'source', iconName: 'file-text', title, lines }));
const rd = cell(1, T[1], { role: 'source', iconName: 'file-input', title: 'Read feed', lines: ['Text file input: no file,', 'no separator; 3 fields'] });
const std = cell(2, T[1], { role: 'engine', iconName: 'list-filter', title: 'Standardize', lines: ['Select values renames to', 'store, sale_date, amount'] });
const out = cell(3, T[1], { role: 'write', iconName: 'file-output', title: 'Append to all_feeds', lines: ['all_feeds.csv: 18 rows,', 'one standard shape'] });
// Each feed into the reader, one per run, dashed: only one feed is read
// in any one run. Each arrives at its own height on the reader's edge.
feeds.forEach((f, i) => d.arrow({ x1: f.r, y1: f.cy, x2: rd.x - 3, y2: rd.cy - 18 + i * 18, dashed: true }));
d.arrow({ x1: rd.r, y1: rd.cy, x2: std.x - 3, y2: std.cy });
d.arrow({ x1: std.r, y1: std.cy, x2: out.x - 3, y2: out.cy });
// Injector to template: down from Inject and run template (column 3),
// curving left into Read feed's top (column 1) through the empty top
// row of columns 1 and 2, its pill in the gap between the panels. The
// curve is still near column 3 at that height (about 60px left of
// mdi.cx), so the pill is centered there, on the line.
d.arrow({ x1: mdi.cx, y1: mdi.b, x2: rd.cx, y2: rd.y - 3, vertical: true, dashed: true, label: "fills in Read feed's file and separator, then runs it", lx: mdi.cx - 60, ly: P3 - 24 });

d.write(import.meta.url);
