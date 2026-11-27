// The Monitoring and Tuning lab: the job that loads the confirmed
// outcomes, measures the model and retrains it only when recall has
// fallen too far, and the three transformations under it. It is the
// figure in 05-monitoring-and-tuning/guide.md, before the tabs.
//
// Facts it encodes, all from 05-monitoring-and-tuning (guide and
// files/jb_monitor_and_retrain.kjb, tr_load_outcomes.ktr,
// tr_monitor_model.ktr, tr_threshold_sweep.ktr):
//   - Set Up checkpoint: START, load_outcomes, monitor_model,
//     retrain_needed?, retrain_and_rescore and Success; model_healthy
//     under retrain_needed?; Abort job on every failure.
//   - Part 5: retrain_needed? is a Simple evaluation of ${RETRAIN_NEEDED}
//     = 1; yes runs retrain_and_rescore, a Job entry for
//     ${CREDIT_CARD_JOB}, which retrains and rescores transaction_scores;
//     no follows the red hop to model_healthy, a Write to log, and the
//     job still ends at Success.
//   - Part 2: tr_load_outcomes reads confirmed_outcomes.csv (10,000 rows)
//     and Insert / Updates confirmed_outcomes.
//   - Part 4: tr_monitor_model counts in SQL at ${THRESHOLD}, works out
//     precision and recall and retrain_needed, writes one row to
//     model_metrics and sets RETRAIN_NEEDED for the parent job.
//   - Part 3: tr_threshold_sweep joins the scores and outcomes, pairs
//     them with nine thresholds (Join rows), counts with Group by, prices
//     each with COST_MISSED_FRAUD and COST_REVIEW, and writes
//     output/threshold_report.csv. It is run by hand, not by the job.
//
// Colors: slate the job's panel, blue START and the inputs, violet the
// transformation entries and the calculating steps, amber the check,
// teal the joins, green the writes and Success, red Abort job and the
// failure hops. Icons: play START, shuffle a transformation entry,
// split the evaluation, refresh-cw the retrain, heart-pulse the healthy
// log line, circle-check Success, octagon-x Abort job, file-input a CSV
// input, database a table read or write, merge a join, sigma Group by,
// calculator Formula, variable Set variables, file-output a file.
//
// Run from this folder:   node monitor-and-retrain.svg.mjs
// It writes monitor-and-retrain.svg here and ../images/monitor-and-retrain.png
// at twice the size.
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 844);

const hopMarkers = new Set();
const hop = (pathD, color) => {
  const id = `hop-${color.slice(1)}`;
  if (!hopMarkers.has(id)) {
    hopMarkers.add(id);
    d.under.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker></defs>`);
  }
  d.edges.push(`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" marker-end="url(#${id})"/>`);
};
const line = (pathD, color) => d.edges.push(`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>`);
const GREY = '#64748b', GREEN = '#15803d', RED = '#b91c1c';
const tag = (x, y, t, color = GREEN) => d.raw(`<text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="600" fill="${color}">${esc(t)}</text>`);

// --- The job --------------------------------------------------------
d.panel({ x: 16, y: 16, w: 768, h: 344, role: 'support', iconName: 'list-ordered', title: 'jb_monitor_and_retrain.kjb', sub: 'retrain only when recall falls below MIN_RECALL; any failure ends at Abort job' });
const JH = 56;
const R1 = 84, R2 = 196, R3 = 288;
const st = d.box({ x: 32, y: R1, w: 112, h: JH, role: 'tool', iconName: 'play', title: 'START' });
const lo = d.box({ x: 168, y: R1, w: 176, h: JH, role: 'engine', iconName: 'shuffle', title: 'load_outcomes' });
const mm = d.box({ x: 368, y: R1, w: 176, h: JH, role: 'engine', iconName: 'shuffle', title: 'monitor_model' });
const rn = d.box({ x: 568, y: R1, w: 200, h: JH, role: 'check', iconName: 'split', title: 'retrain_needed?' });
const ab = d.box({ x: 32, y: R2, w: 160, h: JH, role: 'reject', iconName: 'octagon-x', title: 'Abort job' });
const mh = d.box({ x: 368, y: R2, w: 176, h: JH, role: 'engine', iconName: 'heart-pulse', title: 'model_healthy' });
const rr = d.box({ x: 552, y: R2, w: 216, h: JH, role: 'engine', iconName: 'refresh-cw', title: 'retrain_and_rescore' });
const ok = d.box({ x: 568, y: R3, w: 200, h: JH, role: 'write', iconName: 'circle-check', title: 'Success' });

hop(`M${st.r} ${st.cy}L${lo.x - 3} ${lo.cy}`, GREY);
hop(`M${lo.r} ${lo.cy}L${mm.x - 3} ${mm.cy}`, GREEN);
hop(`M${mm.r} ${mm.cy}L${rn.x - 3} ${rn.cy}`, GREEN);
tag((lo.r + mm.x) / 2, lo.y - 6, 'success');
tag((mm.r + rn.x) / 2, mm.y - 6, 'success');
// yes: straight down to the retrain; then to Success.
const yx = rn.cx + 24;
hop(`M${yx} ${rn.b}L${yx} ${rr.y - 3}`, GREEN);
tag(yx + 22, (rn.b + rr.y) / 2 + 4, '= 1');
hop(`M${rr.cx} ${rr.b}L${rr.cx} ${ok.y - 3}`, GREEN);
// no: red, through the gap between the rows, into model_healthy's top;
// then model_healthy always goes on to Success.
const nx = rn.x + 32, gy = (rn.b + mh.y) / 2 - 4;
hop(`M${nx} ${rn.b}L${nx} ${gy - 8}Q${nx} ${gy} ${nx - 8} ${gy}L${mh.cx + 8} ${gy}Q${mh.cx} ${gy} ${mh.cx} ${gy + 8}L${mh.cx} ${mh.y - 3}`, RED);
tag((nx + mh.cx) / 2, gy - 6, 'no', RED);
hop(`M${mh.cx} ${mh.b}L${mh.cx} ${ok.cy - 12}Q${mh.cx} ${ok.cy} ${mh.cx + 12} ${ok.cy}L${ok.x - 3} ${ok.cy}`, GREY);
// failures: a red bus under the first row, into Abort job's top.
const by = gy + 8;
line(`M${lo.x + 32} ${lo.b}L${lo.x + 32} ${by - 8}Q${lo.x + 32} ${by} ${lo.x + 24} ${by}L${ab.cx + 8} ${by}`, RED);
line(`M${mm.x + 32} ${mm.b}L${mm.x + 32} ${by - 8}Q${mm.x + 32} ${by} ${mm.x + 24} ${by}L${lo.x + 32} ${by}`, RED);
hop(`M${ab.cx + 8} ${by}Q${ab.cx} ${by} ${ab.cx} ${by + 8}L${ab.cx} ${ab.y - 3}`, RED);

// --- The three transformations ----------------------------------------
const PY = 376, PW = 248, BW = 232, BH = 80, G = 20;
const row = (i) => PY + 56 + i * (BH + G);
const P = [16, 276, 536];
d.panel({ x: P[0], y: PY, w: PW, h: row(2) - PY - G + 16, role: 'engine', iconName: 'shuffle', title: 'load_outcomes', sub: 'tr_load_outcomes.ktr' });
d.panel({ x: P[1], y: PY, w: PW, h: row(4) - PY - G + 16, role: 'engine', iconName: 'shuffle', title: 'monitor_model', sub: 'tr_monitor_model.ktr' });
d.panel({ x: P[2], y: PY, w: PW, h: row(4) - PY - G + 16, role: 'support', iconName: 'shuffle', title: 'tr_threshold_sweep.ktr', sub: 'run by hand, to choose the threshold' });
const b = (p, i, role, iconName, title, lines) => d.box({ x: P[p] + 8, y: row(i), w: BW, h: BH, role, iconName, title, lines });

const l1 = b(0, 0, 'source', 'file-input', 'confirmed_outcomes.csv', ['10,000 outcomes the fraud', 'team confirmed: 1 or 0']);
const l2 = b(0, 1, 'write', 'database', 'iu-confirmed_outcomes', ['Insert / Update into', 'confirmed_outcomes']);

const m1 = b(1, 0, 'join', 'database', 'Scores + outcomes', ['one SQL query: the counts', 'at ${THRESHOLD}']);
const m2 = b(1, 1, 'engine', 'calculator', 'Precision and recall', ['retrain_needed = 1 when', 'recall < MIN_RECALL']);
const m3 = b(1, 2, 'write', 'database', 'tbl-model_metrics', ['one row per run:', 'the history of the model']);
const m4 = b(1, 3, 'engine', 'variable', 'setv-retrain_needed', ['RETRAIN_NEEDED, for the', 'job that ran it']);

const s1 = b(2, 0, 'join', 'merge', 'Every threshold', ['scores + outcomes, joined', 'to nine thresholds']);
const s2 = b(2, 1, 'engine', 'sigma', 'Group by threshold', ['caught, needless and', 'missed, for each one']);
const s3 = b(2, 2, 'engine', 'calculator', 'The cost of each', ['missed x 200 + flagged x 25,', 'from the two parameters']);
const s4 = b(2, 3, 'write', 'file-output', 'threshold_report.csv', ['nine rows: precision,', 'recall, cost']);

for (const [a, c] of [[l1, l2], [m1, m2], [m2, m3], [m3, m4], [s1, s2], [s2, s3], [s3, s4]]) {
  d.arrow({ x1: a.cx, y1: a.b, x2: c.cx, y2: c.y - 3, straight: true });
}

d.write(import.meta.url);
