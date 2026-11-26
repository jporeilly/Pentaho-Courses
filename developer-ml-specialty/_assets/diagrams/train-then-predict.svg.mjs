// The Credit Card lab's job and the two transformations it runs, side by
// side: both join the same files and build the same eight features, but
// only training reads the fraud report and keeps its label; training
// saves the GBM model to a file, and prediction loads that file and
// scores every transaction. Red hops lead to Abort job. It is the figure
// in 04-credit-card/guide.md, after the cc_main_job screenshot, before
// the tabs.
//
// Facts it encodes, and where each comes from (all 04-credit-card, and
// checked against files/jb_fraud_main_job.kjb, tr_train_model_fraud.ktr
// and tr_predict_fraud.ktr):
//   - Intro and part 1 checkpoint: jb_fraud_main_job.kjb holds START,
//     train_model, predict_fraud and Success in a row, and a red hop from
//     train_model and from predict_fraud to Abort job.
//   - Part 4 "Under the hood": START to train_model is unconditional; the
//     two green hops are followed only when the entry before them ends
//     without errors; the two red hops only on failure, to Abort job;
//     predict_fraud starts after the model file is written.
//   - Part 2 note: train_model runs tr_train_model_fraud.ktr; the step
//     table: csvi-customer_data, csvi-customer_billing, csv fi: customer
//     transaction and csvi-fraud_details_report read customer.csv,
//     customer_billing.csv, transaction_details.csv and
//     transaction_fraud_report.csv; slkp-customer,
//     slkp-transaction_details and slkp-fraud_report (which adds
//     reported_as_fraud_historic); frmla-billing=shipping;
//     sv-convert_booleans_to_numbers keeps the eight features and
//     reported_as_fraud_historic.
//   - Part 2 steps 2 to 7: py-train_gbm, a Python Executor step, All rows
//     as the pandas data frame train; the script trains an H2O GBM (at most
//     500 trees) on 80% of the rows, measures it on the other 20%, and
//     h2o.save_model writes train_model_output/gbm_fraud; Variables to
//     fields returns one row, which wlog-model writes to the log.
//   - Part 3 note and step table: predict_fraud runs tr_predict_fraud.ktr,
//     which joins the customer, billing and transaction files the same
//     way, without the fraud report: csvi-customer, csvi-customer_billing,
//     csvi-customer_transaction; slkp-customer, slkp-transaction_details;
//     frmla-billing=shipping; sv-fields, sv-predict_fields and
//     sv-convert_booleans_to_numbers keep customer_id, transaction_id and
//     the eight features.
//   - Part 3 steps 2 to 8: py-predict_fraud, All rows as the data frame
//     test; h2o.load_model reads train_model_output/gbm_fraud; predict()
//     gives fraud_probability, and the script adds fraud_pct and
//     predicted_fraud; Frame to fields returns the data frame scored;
//     Predict Fraud (Text file output) writes
//     output/credit_card_fraud_<HHmmss>.csv (part 4, step 5) with 13
//     columns (part 4 checkpoint).
//
// Colors: slate the job's panel, blue its START (a tool you start) and
// the CSV inputs (sources), teal the joins and the training step (a
// model), violet the feature steps and the scoring step (engines), green
// the model file and the scored file's write, red Abort job and the
// failure hops; the success hops are drawn green, as Spoon draws them.
// Icons: play START, shuffle a transformation entry, circle-check
// Success, octagon-x Abort job, file-input CSV file input, merge Stream
// lookup, calculator Formula and Select values, brain-circuit training,
// code a Python Executor step, save the model folder, file-output Text
// file output.
//
// Run from this folder:   node train-then-predict.svg.mjs
// It writes train-then-predict.svg here and ../images/train-then-predict.png
// at twice the size.
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 924);

// A job hop in a given color, drawn on the edge layer with its own
// arrowhead so the color shows (the kit's arrows are all slate). `pts`
// is the path's "d" attribute.
const hopMarkers = new Set();
const hop = (pathD, color) => {
  const id = `hop-${color.slice(1)}`;
  if (!hopMarkers.has(id)) {
    hopMarkers.add(id);
    d.under.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker></defs>`);
  }
  d.edges.push(`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"${' '}marker-end="url(#${id})"/>`);
};
const GREY = '#64748b', GREEN = '#15803d', RED = '#b91c1c';

// --- The job --------------------------------------------------------
// Slate panel; four title-only entries in a row (160 wide, 32 apart) and
// Abort job centered under the two transformation entries.
d.panel({ x: 16, y: 16, w: 768, h: 232, role: 'support', iconName: 'list-ordered', title: 'jb_fraud_main_job.kjb', sub: 'train, then predict: the red hops end the run in Abort job' });
const JW = 160, JH = 56, JY = 84; // JY leaves room for the success tags
const JX = [32, 224, 416, 608];
const start = d.box({ x: JX[0], y: JY, w: JW, h: JH, role: 'tool', iconName: 'play', title: 'START' });
const tm = d.box({ x: JX[1], y: JY, w: JW, h: JH, role: 'engine', iconName: 'shuffle', title: 'train_model' });
const pf = d.box({ x: JX[2], y: JY, w: JW, h: JH, role: 'engine', iconName: 'shuffle', title: 'predict_fraud' });
const ok = d.box({ x: JX[3], y: JY, w: JW, h: JH, role: 'write', iconName: 'circle-check', title: 'Success' });
const ab = d.box({ x: 320, y: 176, w: JW, h: JH, role: 'reject', iconName: 'octagon-x', title: 'Abort job' });

// START to train_model: unconditional (grey); the next two: green, on
// success.
hop(`M${start.r} ${start.cy}L${tm.x - 3} ${tm.cy}`, GREY);
hop(`M${tm.r} ${tm.cy}L${pf.x - 3} ${pf.cy}`, GREEN);
hop(`M${pf.r} ${pf.cy}L${ok.x - 3} ${ok.cy}`, GREEN);
// The red hops: straight down from each transformation entry, then a
// rounded turn into Abort job's side, with a "failure" pill on each.
const lx = tm.x + 36, rx = pf.r - 36;
hop(`M${lx} ${tm.b}L${lx} ${ab.cy - 12}Q${lx} ${ab.cy} ${lx + 12} ${ab.cy}L${ab.x - 3} ${ab.cy}`, RED);
hop(`M${rx} ${pf.b}L${rx} ${ab.cy - 12}Q${rx} ${ab.cy} ${rx - 12} ${ab.cy}L${ab.r + 3} ${ab.cy}`, RED);
d.pill(lx, (tm.b + ab.cy) / 2 - 4, 'failure');
d.pill(rx, (pf.b + ab.cy) / 2 - 4, 'failure');
// The green hops' meaning, as small labels above them.
const tag = (x, y, t) => d.raw(`<text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="600" fill="${GREEN}">${esc(t)}</text>`);
tag((tm.r + pf.x) / 2, tm.y - 6, 'success');
tag((pf.r + ok.x) / 2, pf.y - 6, 'success');

// --- The two transformations ------------------------------------------
// Training on the left, prediction on the right; box rows line up, so
// the same kind of step sits at the same height on both sides.
const PY = 264, BW = 340, BH = 88, GAP = 28; // 88 tall: a title and three lines
const row = (i) => PY + 56 + i * (BH + GAP);
const LX = 16, RX = 412, PW = 372;
d.panel({ x: LX, y: PY, w: PW, h: row(4) - PY - GAP + 16, role: 'model', iconName: 'shuffle', title: 'train_model: tr_train_model_fraud.ktr', sub: 'reads the fraud report, keeps the label' });
d.panel({ x: RX, y: PY, w: PW, h: row(5) - PY - GAP + 16, role: 'engine', iconName: 'shuffle', title: 'predict_fraud: tr_predict_fraud.ktr', sub: 'no fraud report, no label' });

// Each side: inputs, lookups, features, Python step.
const bx = LX + 16, px = RX + 16;
const t1 = d.box({ x: bx, y: row(0), w: BW, h: BH, role: 'source', iconName: 'file-input', title: '4 CSV file inputs', lines: ['customer.csv, customer_billing.csv,', 'transaction_details.csv and', 'transaction_fraud_report.csv'] });
const p1 = d.box({ x: px, y: row(0), w: BW, h: BH, role: 'source', iconName: 'file-input', title: '3 CSV file inputs', lines: ['customer.csv, customer_billing.csv,', 'transaction_details.csv;', 'not the fraud report'] });
const t2 = d.box({ x: bx, y: row(1), w: BW, h: BH, role: 'join', iconName: 'merge', title: '3 Stream lookups', lines: ['slkp-customer, slkp-transaction_details,', 'slkp-fraud_report: adds', 'reported_as_fraud_historic'] });
const p2 = d.box({ x: px, y: row(1), w: BW, h: BH, role: 'join', iconName: 'merge', title: '2 Stream lookups', lines: ['slkp-customer,', 'slkp-transaction_details:', 'the same joins'] });
const t3 = d.box({ x: bx, y: row(2), w: BW, h: BH, role: 'engine', iconName: 'calculator', title: 'Eight features + the label', lines: ['frmla-billing=shipping,', 'sv-convert_booleans_to_numbers', '(flags become Numbers)'] });
const p3 = d.box({ x: px, y: row(2), w: BW, h: BH, role: 'engine', iconName: 'calculator', title: 'Two ids + eight features', lines: ['frmla-billing=shipping, sv-fields,', 'sv-predict_fields, sv-convert_', 'booleans_to_numbers'] });
const t4 = d.box({ x: bx, y: row(3), w: BW, h: BH, role: 'model', iconName: 'brain-circuit', title: 'py-train_gbm', lines: ['Python Executor, All rows as train;', 'H2O GBM on 80%, measured on 20%;', 'one row: validation_auc, trees ...'] });
const p4 = d.box({ x: px, y: row(3), w: BW, h: BH, role: 'engine', iconName: 'code', title: 'py-predict_fraud', lines: ['Python Executor, All rows as test;', 'load the model; predict():', 'fraud_probability, fraud_pct, ...'] });
const p5 = d.box({ x: px, y: row(4), w: BW, h: BH, role: 'write', iconName: 'file-output', title: 'Predict Fraud', lines: ['Text file output:', 'output/credit_card_fraud_<HHmmss>.csv,', '13 columns: the ids and the scores'] });

// Down each chain.
for (const [a, b] of [[t1, t2], [t2, t3], [t3, t4], [p1, p2], [p2, p3], [p3, p4], [p4, p5]]) {
  d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
}

// The model file, under the training panel: written by training, read
// by prediction (its arrow curves up into py-predict_fraud's left edge).
const mf = d.box({ x: bx, y: row(4) + 20, w: BW, h: BH, role: 'store', iconName: 'save', title: 'gbm_fraud', lines: ['in train_model_output, next to the', 'transformations: the H2O model', 'h2o.save_model writes'] });
d.arrow({ x1: t4.cx, y1: t4.b, x2: mf.cx, y2: mf.y - 3, straight: true, label: 'save_model' });
d.arrow({ x1: mf.r, y1: mf.cy, x2: p4.x - 3, y2: p4.cy + 16, label: 'load_model', lx: (mf.r + p4.x) / 2, ly: (mf.cy + p4.cy) / 2 + 8 });

d.write(import.meta.url);
