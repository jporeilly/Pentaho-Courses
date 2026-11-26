// The AutoML workshop as one picture: autoML.ktr blends the four files,
// engineers the features, and Copy-hops every row both to the training set
// H2O.csv and to the auto machine learning Python Executor step; the
// notebook then reads H2O.csv and runs the same search a cell at a time.
// It is the figure at the top of 03-automl/guide.md and under AutoML in the
// Academy outline.
//
// Facts it encodes, and where each comes from (03-automl/guide.md, the
// files, and the measured runs):
//   - Data Wrangling: csvi-customer (Text file input, Limit 10000: 9,999
//     customers), three CSV file inputs (billing, transaction details, fraud
//     report), three Stream lookups, one row per transaction.
//   - Feature Engineering: frmla-billing_shipping_zip_equal; sv-change_to_
//     numbers keeps nine fields and turns the four flags into 1 and 0.
//   - Training Set: tfo-H2O writes data/H2O.csv, semicolons, no header,
//     9,999 lines. The hop to the Python step is a Copy hop.
//   - AutoML in PDI: auto machine learning, h2o-env's python.exe, All rows
//     as dataset; up to five models, ranked by AUC; one row back (best_
//     algorithm gbm, best_auc 0.9951); the best model saved in automl_output.
//   - The notebook (credit_card_fraud.ipynb, JupyterLab; Colab optional):
//     reads data/H2O.csv, 7,510 training and 2,489 test rows; AutoML trains
//     three GBMs, a DRF and a GLM; the best scores test AUC 0.9951; the
//     confusion matrix and feature importance follow; GBM goes on to the
//     Credit Card workshop.
//
// Colors: blue the inputs, teal the joins and the model search, violet the
// engines, green what is written, amber the notebook, white the outcome.
//
// Run from this folder:   node automl-pipeline.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 608);
const COL = [32, 288, 544];
const BW = 224, BH = 80;

// autoML.ktr
d.panel({ x: 16, y: 16, w: 768, h: 268, role: 'tool', iconName: 'workflow', title: 'autoML.ktr', sub: 'blend, engineer, then every row to the training set and to AutoML' });
const R1 = 72, R2 = 188;
const inputs = d.box({ x: COL[0], y: R1, w: BW, h: BH, role: 'source', iconName: 'files', title: 'Four file inputs', lines: ['9,999 customers; billing,', 'orders, fraud report'] });
const look = d.box({ x: COL[1], y: R1, w: BW, h: BH, role: 'join', iconName: 'merge', title: '3 Stream lookups', lines: ['one row per transaction,', 'all four files joined'] });
const feat = d.box({ x: COL[2], y: R1, w: BW, h: BH, role: 'engine', iconName: 'calculator', title: 'Feature engineering', lines: ['zip match flag; nine fields,', 'the flags as 1 and 0'] });
d.arrow({ x1: inputs.r, y1: inputs.cy, x2: look.x - 3, y2: look.cy });
d.arrow({ x1: look.r, y1: look.cy, x2: feat.x - 3, y2: feat.cy });

const tfo = d.box({ x: COL[0], y: R2, w: BW, h: BH, role: 'write', iconName: 'file-output', title: 'tfo-H2O', lines: ['data/H2O.csv: 9,999 lines,', 'semicolons, no header'] });
const best = d.box({ x: COL[1], y: R2, w: BW, h: BH, role: 'store', iconName: 'save', title: 'One row back', lines: ['gbm, best_auc 0.9951;', 'the model in automl_output'] });
const pyx = d.box({ x: COL[2], y: R2, w: BW, h: BH, role: 'model', iconName: 'code', title: 'auto machine learning', lines: ['Python Executor: H2O', 'AutoML, 5 models by AUC'] });
d.arrow({ x1: pyx.cx, y1: feat.b, x2: pyx.cx, y2: pyx.y - 3, straight: true, label: 'Copy' });
d.arrow({ x1: feat.x + 24, y1: feat.b, x2: tfo.r - 40, y2: tfo.y - 3, vertical: true });
d.arrow({ x1: pyx.x, y1: pyx.cy, x2: best.r + 3, y2: best.cy });

// The notebook
const PB = 324;
d.panel({ x: 16, y: PB, w: 768, h: 268, role: 'browser', iconName: 'notebook-pen', title: 'credit_card_fraud.ipynb in JupyterLab', sub: 'the same search, one cell at a time; Colab is the optional cloud route' });
const R3 = PB + 56, R4 = R3 + BH + 36;
const load = d.box({ x: COL[0], y: R3, w: BW, h: BH, role: 'source', iconName: 'file-spreadsheet', title: 'Load and split', lines: ['reads H2O.csv: 7,510 to', 'train, 2,489 to test'] });
const aml = d.box({ x: COL[1], y: R3, w: BW, h: BH, role: 'model', iconName: 'list-ordered', title: 'AutoML leaderboard', lines: ['3 GBMs, a DRF, a GLM,', '5-fold CV, ranked by AUC'] });
const judge = d.box({ x: COL[2], y: R3, w: BW, h: BH, role: 'engine', iconName: 'gauge', title: 'Judge the best', lines: ['test AUC 0.9951; confusion', 'matrix; feature importance'] });
d.arrow({ x1: tfo.cx, y1: tfo.b, x2: load.cx, y2: PB - 3, straight: true, label: 'H2O.csv' });
d.arrow({ x1: load.r, y1: load.cy, x2: aml.x - 3, y2: aml.cy });
d.arrow({ x1: aml.r, y1: aml.cy, x2: judge.x - 3, y2: judge.cy });
d.box({ x: COL[0], y: R4, w: BW * 2 + 32, h: BH, role: 'support', iconName: 'triangle-alert', title: 'On Windows, no XGBoost', lines: ["H2O's XGBoost does not run on Windows, so the search", 'leaves it out; in Colab you can add it'] });
const gbm = d.box({ x: COL[2], y: R4, w: BW, h: BH, role: 'result', iconName: 'trophy', title: 'GBM chosen', lines: ['the Credit Card workshop', 'trains and deploys it'] });
d.arrow({ x1: judge.cx, y1: judge.b, x2: gbm.cx, y2: gbm.y - 3, straight: true });

d.write(import.meta.url);
