// Lab 1 close-up: the finished win_preview transformation the learner
// opens and runs in Your First Win, with what each preview shows. The
// retailer-pipeline-target diagram above it is the whole workshop; this
// one is Lab 1 only. It sits at the top of step 2, "Preview the valid
// rows", in 01-first-win/guide.md, where the lesson walks through the
// run.
//
// Every fact comes from 01-first-win/guide.md and its lab files:
//   The transformation (01-first-win/files/win_preview.ktr):
//     - Four steps and three hops: Read yesterday's sales -> Keys
//       present?; Keys present? -> Valid rows (send_true_to); Keys
//       present? -> Rejected rows (send_false_to). Step 5 of the lesson
//       ("four steps and three hops" in the Graph screenshot's alt text).
//     - Read yesterday's sales: Text file input of
//       ${Internal.Entry.Current.Directory}/sales_20260101.csv, the file
//       next to the .ktr (the lesson's Troubleshooting: "looks for
//       sales_20260101.csv in the same folder as the .ktr"); separator
//       comma, header, 7 fields (order_id, order_date, customer_id,
//       product_id, qty, unit_price, discount_pct); the ktr's note.
//     - Keys present?: Filter rows, customer_id IS NOT NULL AND
//       product_id IS NOT NULL (the ktr's condition; step 4 of the
//       lesson: "filtering for rows where the ids / keys are not null").
//     - Valid rows and Rejected rows: Dummy (do nothing) steps; nothing
//       is written (the ktr's note; the lesson's Preview "writing
//       nothing anywhere").
//   The counts:
//     - 40 orders in sales_20260101.csv (40 data rows after the header).
//     - Step 2: Preview on Valid rows shows 37 of yesterday's orders.
//     - Step 3: Preview on Rejected rows shows three rows: two missing
//       customer_id, one product_id. From the CSV: 10011 (no
//       customer_id, P010), 10016 (C003, no product_id), 10036 (no
//       customer_id, P002). The first two valid rows are 10001 C001 P001
//       and 10002 C002 P004.
//   The preview and debug points the lesson uses:
//     - Steps 2 and 3: right-click Valid rows (then Rejected rows),
//       select Preview, then Quick Launch in the Transformation debug
//       dialog. (The ktr's note gives the same with F10.)
//     - Step 4: double-click Read yesterday's sales (delimiter, header,
//       the Fields tab) and Keys present? (the condition), then Cancel.
//
// Colors and icons follow this folder's README: blue a source you read
// (file-text, as for Read regions in lookup-vs-merge-join), amber the
// check (split, Filter rows), white a result (rows-3, a stream of rows:
// Valid rows), red the rejects (circle-x). `eye` is a Preview, new here
// and added to the README.
//
// Run from this folder:   node first-win-preview.svg.mjs
// It writes first-win-preview.svg here and
// ../images/first-win-preview.png at twice the size.
import { Diagram, ROLE, esc, tableBoxHeight } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: three step columns of same-size boxes (BW x BH) and a
// fourth, wider column for the two preview grids. The gap between the
// filter and the end steps is wider (64px, against 32px and 20px
// elsewhere) so the true and false pills fit between the boxes.
const W = 1164;
const BW = 240, BH = 96; // tall enough for three lines under a badge
const COL = [32, 304, 608]; // left edges of the three step columns
const TX = 868, TW = 264; // the preview column: x and width (to 1132)

// Vertical layout: the panel's two-line title strip, then two preview
// grids stacked with a 28px gap (room for the lower grid's badge). The
// end steps sit level with their grids; the reader and the filter sit
// halfway between.
const P = 16; // panel top
const T1 = P + 78; // top of the first grid (strip 44 + room for a badge)
const TH = tableBoxHeight(3);
const T2 = T1 + TH + 28;
const H = T2 + TH + 20 - P; // panel height
const d = new Diagram(W, P + H + 16);
const mid1 = T1 + TH / 2, mid2 = T2 + TH / 2, midAll = (mid1 + mid2) / 2;

// A step box in column `c`, centered on `cy`.
const step = (c, cy, o) => d.box({ x: COL[c], y: cy - BH / 2, w: BW, h: BH, ...o });

// A badge naming the lesson step that uses this point: a pill in the
// box's own stroke color on its top edge at the right, as the lab
// badges in retailer-pipeline-target (about 7px a character).
const badge = (b, role, text) => {
  const c = ROLE[role];
  const w = text.length * 7 + 18;
  const x = b.r - 14 - w, y = b.y - 15;
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="${c.stroke}" stroke="#ffffff" stroke-width="1.5"/>`);
  d.raw(`<text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">${esc(text)}</text>`);
};

// ── The panel: win_preview.ktr as it opens on the canvas ─────────────
d.panel({ x: 16, y: P, w: W - 32, h: H, role: 'support', iconName: 'shuffle', title: 'win_preview.ktr: four steps, three hops, nothing written', sub: "Reads sales_20260101.csv from the .ktr's own folder. Right-click an end step, then Preview > Quick Launch, to see its rows" });

// ── The four steps, with their real names ────────────────────────────
const read = step(0, midAll, { role: 'source', iconName: 'file-text', title: "Read yesterday's sales", lines: ['Text file input: comma,', 'header, 7 fields', '40 orders'] });
const keys = step(1, midAll, { role: 'check', iconName: 'split', title: 'Keys present?', lines: ['Filter rows:', 'customer_id IS NOT NULL', 'AND product_id IS NOT NULL'] });
const ok = step(2, mid1, { role: 'result', iconName: 'rows-3', title: 'Valid rows', lines: ['Dummy (do nothing):', '37 rows end here'] });
const bad = step(2, mid2, { role: 'reject', iconName: 'circle-x', title: 'Rejected rows', lines: ['Dummy (do nothing):', '3 rows end here'] });

// ── The three hops ───────────────────────────────────────────────────
// The reader into the filter; then the filter's true branch up to
// Valid rows and its false branch, dashed (as in the course's other
// diagrams), down to Rejected rows.
d.arrow({ x1: read.r, y1: read.cy, x2: keys.x - 3, y2: keys.cy });
d.arrow({ x1: keys.r, y1: keys.cy - 14, x2: ok.x - 3, y2: ok.cy, label: 'true' });
d.arrow({ x1: keys.r, y1: keys.cy + 14, x2: bad.x - 3, y2: bad.cy, dashed: true, label: 'false' });

// ── What each preview shows ──────────────────────────────────────────
// Two grids, the rows Preview > Quick Launch shows on each end step.
// White rows are the valid orders; red rows are the rejects, with the
// missing key shown as (null).
const pv = d.tableBox({ x: TX, y: T1, w: TW, role: 'result', iconName: 'eye', title: 'Preview: Valid rows', sub: '37 rows, keys all set', cols: ['order_id', 'customer_id', 'product_id'], rows: [
  { tone: 'result', cells: ['10001', 'C001', 'P001'] },
  { tone: 'result', cells: ['10002', 'C002', 'P004'] },
  { tone: 'result', cells: ['…', '35 more', '…'] },
] });
const pr = d.tableBox({ x: TX, y: T2, w: TW, role: 'reject', iconName: 'eye', title: 'Preview: Rejected rows', sub: '3 rows, each missing a key', cols: ['order_id', 'customer_id', 'product_id'], rows: [
  { tone: 'reject', cells: ['10011', '(null)', 'P010'] },
  { tone: 'reject', cells: ['10016', 'C003', '(null)'] },
  { tone: 'reject', cells: ['10036', '(null)', 'P002'] },
] });
// Each end step to its preview: a straight arrow (a look at the rows,
// not a hop in the transformation).
d.arrow({ x1: ok.r, y1: ok.cy, x2: pv.x - 3, y2: ok.cy, straight: true });
d.arrow({ x1: bad.r, y1: bad.cy, x2: pr.x - 3, y2: bad.cy, straight: true });

// ── Badges: the lesson step that uses each point ─────────────────────
// Steps 2 and 3 preview the end steps; step 4 double-clicks the reader
// and the filter to look at their settings.
badge(pv, 'result', 'Step 2: Preview');
badge(pr, 'reject', 'Step 3: Preview');
badge(read, 'source', 'Step 4: double-click');
badge(keys, 'check', 'Step 4: double-click');

d.write(import.meta.url);
