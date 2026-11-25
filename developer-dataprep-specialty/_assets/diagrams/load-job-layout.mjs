// The drawing shared by the two pictures of jb_load_sales_mart, the
// Sales Mart's load job: the form lesson 09 builds (load-job.svg.mjs)
// and the form lesson 10 finishes, with the refresh-mondrian-cache HTTP
// entry before Success (load-job-refresh.svg.mjs). Both draw the same
// entries in the same places, so one function lays them out and each
// script says only whether the HTTP entry is there. This file draws
// nothing by itself and is not a diagram, so it does not end in
// d.write().
//
// The facts it draws, and the lessons they come from:
//   - 09-schedule-the-load-on-the-pentaho-server, part 3: the job
//     jb_load_sales_mart in /public/sales-mart, with three parameters,
//     CUSTOMER_FILE, PRODUCT_FILE and ORDER_FILE, passed down to every
//     Transformation entry; Start, then tr_dim_customer, tr_dim_product,
//     tr_fact_sales and tr_agg_sales in a line, then Success; a hop from
//     each of the four transformation entries to Abort job, set to
//     Follow When Result is False (red); a lock hop from Start and green
//     hops along the line. Why the order: dimensions before the facts,
//     so every customer in May's orders already has a version;
//     summaries last, so they describe the fact table as loaded; a
//     failure stops the job before the next stage, so the summaries are
//     never rebuilt from a half-loaded fact table.
//   - 09, parts 5 and 6: scheduled on the Pentaho Server daily at 02:00,
//     and run at once with Execute Now.
//   - Which file each transformation reads: CUSTOMER_FILE in
//     tr_dim_customer and PRODUCT_FILE in tr_dim_product (lesson 05),
//     ORDER_FILE in tr_fact_sales (lesson 07); tr_agg_sales rebuilds the
//     two agg_ tables with Group by and Truncate table (lesson 08).
//   - 10-refresh-the-cube-after-a-load, part 7: the hop from
//     tr_agg_sales to Success is deleted, and an HTTP entry,
//     refresh-mondrian-cache, goes between them, calling
//     /pentaho/api/system/refresh/mondrianSchemaCache as admin with
//     ${PENTAHO_PASSWORD}; its own False hop goes to Abort job.
import { ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

/**
 * Draw the job on Diagram `d`. With `refresh` true, the HTTP entry sits
 * between tr_agg_sales and Success and is marked as lesson 10's
 * addition. The canvas must be `loadJobSize(refresh)` big.
 */
export function drawLoadJob(d, { refresh }) {
  // Grid: column A holds the stage brackets, column B the job's main
  // line, top to bottom, and column C Abort job and the parameters.
  // Rows are a box (BH) plus a 30px gap, enough for an arrowhead.
  const BW = 264, BH = 64, GAP = 30, PITCH = BH + GAP;
  const XB = 220, XC = XB + BW + 200;
  const TOP = 76;

  // The entries of the main line, in hop order. Each is [role, icon,
  // title, detail line, stage]; `stage` groups rows under a bracket.
  const entries = [
    ['support', 'play', 'Start', 'its hop: a lock, unconditional', null],
    ['engine', 'shuffle', 'tr_dim_customer', 'reads ${CUSTOMER_FILE}', 'dims'],
    ['engine', 'shuffle', 'tr_dim_product', 'reads ${PRODUCT_FILE}', 'dims'],
    ['engine', 'shuffle', 'tr_fact_sales', 'reads ${ORDER_FILE}', 'facts'],
    ['engine', 'shuffle', 'tr_agg_sales', 'rebuilds the two agg_ tables', 'aggs'],
  ];
  if (refresh) entries.push(['browser', 'globe', 'refresh-mondrian-cache', 'HTTP: flush the cube\'s cache', 'cube']);
  entries.push(['result', 'circle-check', 'Success', 'the load is complete', null]);

  // ── The panel ──────────────────────────────────────────────────────
  const h = TOP + entries.length * PITCH - GAP + 24;
  d.panel({ x: 16, y: 16, w: d.w - 32, h: h - 16, role: 'support', iconName: 'list-ordered', title: 'jb_load_sales_mart, in /public/sales-mart', sub: refresh ? 'Lesson 10 adds the HTTP entry: every run now ends with a fresh cube' : 'Scheduled on the Pentaho Server: daily at 02:00' });

  // ── Column B: the main line ────────────────────────────────────────
  const boxes = entries.map(([role, iconName, title, line], i) =>
    d.box({ x: XB, y: TOP + i * PITCH, w: BW, h: BH, role, iconName, title, lines: [line] }));
  // The hops, straight down: the lock hop from Start, then the green
  // "on success" hops (Spoon's colors are not drawn; the kit's arrows
  // are all slate, and the dashed ones below are the failure hops).
  boxes.slice(1).forEach((b, i) => d.arrow({ x1: boxes[i].cx, y1: boxes[i].b, x2: b.cx, y2: b.y - 3, straight: true }));

  // In lesson 10's form, a badge on the HTTP entry's top edge marks it
  // as the addition, in the box's own stroke color (as the lab badges
  // in pdi-2hr-lab's pipeline diagram).
  if (refresh) {
    const b = boxes[entries.length - 2];
    const c = ROLE.browser, text = 'Added in lesson 10';
    const w = text.length * 7 + 18;
    const x = b.r - 14 - w, y = b.y - 13;
    d.raw(`<rect x="${x}" y="${y}" width="${w}" height="20" rx="10" fill="${c.stroke}" stroke="#ffffff" stroke-width="1.5"/>`);
    d.raw(`<text x="${x + w / 2}" y="${y + 14}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">${esc(text)}</text>`);
  }

  // ── Column C: Abort job ────────────────────────────────────────────
  // Red, level with the middle of the entries that can fail (every
  // transformation, and the HTTP entry in lesson 10's form).
  const failing = boxes.filter((_, i) => entries[i][4]);
  const midY = (failing[0].cy + failing[failing.length - 1].cy) / 2;
  const abort = d.box({ x: XC, y: midY - BH / 2, w: BW, h: BH, role: 'reject', iconName: 'circle-x', title: 'Abort job', lines: ['stops before the next stage'] });
  // One dashed hop from each entry that can fail, fanning into Abort
  // job's left edge, each arriving at its own height so the heads stay
  // apart. Dashed: the False branch, as in the other courses' diagrams.
  failing.forEach((b, i) => {
    const spread = failing.length > 1 ? (i / (failing.length - 1) - 0.5) * 40 : 0;
    d.arrow({ x1: b.r, y1: b.cy, x2: abort.x - 3, y2: abort.cy + spread, dashed: true });
  });
  // The rule for those hops, in a pill under Abort job: they are the
  // hops Spoon draws red.
  d.pill(abort.cx, abort.b + 30, ['dashed: the red hops in Spoon,', 'Follow When Result is False']);

  // The job's parameters, passed down to every transformation entry,
  // in a pill at the top of column C, clear of the fan of hops. One
  // name per line: the kit sizes a pill for lower-case text, and the
  // capitals of a longer line would run past its ends.
  d.pill(abort.cx, TOP + 40, ['Parameters, passed down:', 'CUSTOMER_FILE', 'PRODUCT_FILE', 'ORDER_FILE']);

  // ── Column A: the stages ───────────────────────────────────────────
  // A bracket to the left of each stage's entries, with its name: the
  // order of the stages is the design (lesson 09, part 3).
  const names = { dims: '1. Dimensions', facts: '2. Facts', aggs: '3. Summaries', cube: '4. Tell the cube' };
  Object.entries(names).forEach(([key, name]) => {
    const rows = boxes.filter((_, i) => entries[i][4] === key);
    if (!rows.length) return;
    const y1 = rows[0].y + 4, y2 = rows[rows.length - 1].b - 4, bx = XB - 18;
    // The bracket: a vertical line with short ticks toward the boxes.
    d.raw(`<path d="M${bx + 8} ${y1}H${bx}V${y2}H${bx + 8}" fill="none" stroke="#94a3b8" stroke-width="1.5"/>`);
    d.raw(`<text x="${bx - 10}" y="${(y1 + y2) / 2 + 4}" text-anchor="end" font-size="13" font-weight="700" fill="#334155">${esc(name)}</text>`);
  });
  return h;
}

/** The canvas size each form needs: width, and height from the rows. */
export const loadJobSize = (refresh) => [16 + 220 + 264 + 200 + 264 + 32, 76 + (refresh ? 7 : 6) * 94 - 30 + 24 + 16];
