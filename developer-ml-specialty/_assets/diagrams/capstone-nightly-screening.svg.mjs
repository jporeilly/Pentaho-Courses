// The ML capstone, Nightly Fraud Screening, as a suggested shape: one job
// that retrains the fraud model and, only if it passes its quality gate,
// screens the night's new orders into a review queue. It is the figure
// under "Suggested shape" in 08-capstone-nightly-fraud-screening/guide.md.
//
// Facts it encodes, and where each comes from (the capstone page):
//   - Inputs: data\history.csv (labelled orders) and data\new_orders.csv
//     (tonight's orders, no label); both raw: Y/N flags, two zip codes.
//   - Both transformations engineer the same features: the billing and
//     shipping zip match, and the Y/N flags as 1 and 0.
//   - train_fraud_model.ktr trains an H2O GBM, holds rows back to measure
//     it, saves it in out\model, and aborts when the validation AUC is
//     below 0.85.
//   - screen_orders.ktr loads the model, scores every order, writes
//     out\screened_orders.csv, and out\fraud_review_queue.csv with the
//     orders at 0.15 or more, highest first.
//   - jb_nightly_screening.kjb runs training, then screening only on
//     success; Kitchen runs it every night.
//
// Colors: blue the inputs, violet the engines (features, Python),
// teal the model and the gate, green what is written, white the review
// queue, slate the job. Icons: file-spreadsheet the CSV inputs,
// calculator the features, brain-circuit training, shield-check the gate,
// save the model, code scoring, file-output and file-text the outputs,
// list-ordered the job, clock the nightly run.
//
// Run from this folder:   node capstone-nightly-screening.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 608);
const COL = [32, 288, 544];
const BW = 224, BH = 80;

// Training panel.
d.panel({ x: 16, y: 16, w: 768, h: 268, role: 'tool', iconName: 'workflow', title: 'train_fraud_model.ktr', sub: 'learn from the labelled history; never let a weak model through' });
const R1 = 72, R2 = 188;
const hist = d.box({ x: COL[0], y: R1, w: BW, h: BH, role: 'source', iconName: 'file-spreadsheet', title: 'history.csv', lines: ['labelled orders,', 'Y/N flags, two zips'] });
const f1 = d.box({ x: COL[1], y: R1, w: BW, h: BH, role: 'join', iconName: 'layers', title: 'features.ktr', lines: ['through a Mapping step:', 'zip match; Y/N to 1/0'] });
const tr = d.box({ x: COL[2], y: R1, w: BW, h: BH, role: 'model', iconName: 'brain-circuit', title: 'Train an H2O GBM', lines: ['Python Executor; some', 'rows held back to measure'] });
d.arrow({ x1: hist.r, y1: hist.cy, x2: f1.x - 3, y2: f1.cy });
d.arrow({ x1: f1.r, y1: f1.cy, x2: tr.x - 3, y2: tr.cy });
const gate = d.box({ x: COL[2], y: R2, w: BW, h: BH, role: 'join', iconName: 'shield-check', title: 'Quality gate', lines: ['validation AUC below 0.85:', 'abort, screen nothing'] });
const model = d.box({ x: COL[1], y: R2, w: BW, h: BH, role: 'store', iconName: 'save', title: 'out\\model', lines: ['the saved H2O model,', 'tonight\'s version'] });
d.arrow({ x1: tr.cx, y1: tr.b, x2: gate.cx, y2: gate.y - 3, straight: true });
d.arrow({ x1: tr.x + 24, y1: tr.b, x2: model.r - 40, y2: model.y - 3, vertical: true });
d.box({ x: COL[0], y: R2, w: BW, h: BH, role: 'support', iconName: 'clock', title: 'Every night', lines: ['Kitchen runs the job;', 'your README says how'] });

// Scoring panel.
const PB = 324;
d.panel({ x: 16, y: PB, w: 768, h: 268, role: 'support', iconName: 'list-ordered', title: 'jb_nightly_screening.kjb: then screen_orders.ktr', sub: 'runs only when training succeeded and passed the gate' });
const R3 = PB + 56, R4 = R3 + BH + 36;
const neu = d.box({ x: COL[0], y: R3, w: BW, h: BH, role: 'source', iconName: 'file-spreadsheet', title: 'new_orders.csv', lines: ["tonight's orders,", 'no label'] });
const f2 = d.box({ x: COL[1], y: R3, w: BW, h: BH, role: 'join', iconName: 'layers', title: 'The same features.ktr', lines: ['the same Mapping step:', 'exactly as in training'] });
const sc = d.box({ x: COL[2], y: R3, w: BW, h: BH, role: 'engine', iconName: 'code', title: 'Score every order', lines: ['Python Executor loads', 'the model: p1 per order'] });
d.arrow({ x1: neu.r, y1: neu.cy, x2: f2.x - 3, y2: f2.cy });
d.arrow({ x1: f2.r, y1: f2.cy, x2: sc.x - 3, y2: sc.cy });
d.arrow({ x1: model.cx, y1: model.b, x2: model.cx, y2: PB - 3, straight: true, label: 'loads' });
const all = d.box({ x: COL[1], y: R4, w: BW, h: BH, role: 'store', iconName: 'file-output', title: 'screened_orders.csv', lines: ['every order and', 'its fraud probability'] });
const q = d.box({ x: COL[2], y: R4, w: BW, h: BH, role: 'result', iconName: 'file-text', title: 'fraud_review_queue.csv', lines: ['0.15 or more,', 'highest first'] });
d.arrow({ x1: sc.cx, y1: sc.b, x2: q.cx, y2: q.y - 3, straight: true, label: 'flagged' });
d.arrow({ x1: sc.x + 24, y1: sc.b, x2: all.r - 40, y2: all.y - 3, vertical: true });

d.write(import.meta.url);
