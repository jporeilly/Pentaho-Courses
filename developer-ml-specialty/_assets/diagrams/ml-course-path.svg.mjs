// The whole machine learning use case, end to end: the AutoML lab blends
// four files and engineers features in Pentaho Data Integration, writes
// the training set H2O.csv and runs H2O AutoML, which ranks the models;
// its results point to a GBM, which the Credit Card lab trains in R,
// saves as a model file and uses to score every transaction. It is the
// figure in 01-overview/guide.md, under the Machine Learning note.
//
// Facts it encodes, and where each comes from:
//   - 01-overview: two approaches; first H2O AutoML trains and ranks
//     several models; second a Gradient Boosting Machine trained in R
//     scores new transactions with a fraud probability.
//   - 03-automl, part 1 "Data wrangling": four files of 100,000 rows each
//     (customer.csv, customer_billing.csv, transaction_details.csv,
//     transaction_fraud_report.csv), joined into one row per transaction
//     by three Stream lookup steps; the lab saves autoML.ktr.
//   - 03-automl, part 2 "Feature engineering": a Formula step adds the
//     billing and shipping zip code match flag; a Select values step
//     (sv-change_to_numbers) turns the Y/N flags into 1 and 0.
//   - 03-automl, part 3 "The training set": tfo-H2O writes the nine
//     fields to data/H2O.csv, semicolon-separated, no header line.
//   - 03-automl, part 4: the Python Executor step "auto machine learning"
//     gets the same rows through a Copy hop, runs H2O AutoML in the
//     h2o-env virtual environment and returns one row describing the best
//     model.
//   - 03-automl, part 5: in a Colab notebook you upload H2O.csv and run
//     H2O AutoML with five algorithms (GBM, XGBoost, GLM, DRF,
//     DeepLearning); the leaderboard ranks the models by AUC
//     (sort_metric='AUC').
//   - 04-credit-card intro: "The H2O results in AutoML point to a
//     Gradient Boosting Machine (GBM)"; one transformation trains a GBM in
//     R with the gbm package and saves it, a second loads it and scores
//     every transaction, and the job jb_fraud_main_job.kjb runs the two in
//     order (train_model, then predict_fraud).
//   - 04-credit-card part 2: tr_train_model_fraud.ktr, gbm() with 500
//     trees, save() writes train_model_output/gbm_fraud.rdata.
//   - 04-credit-card part 3 and 4: tr_predict_fraud.ktr loads the model,
//     scores each transaction (fraud_probability), and Predict Fraud
//     writes output/credit_card_fraud_<HHmmss>.csv with 11 columns.
//
// Colors: blue the source files, teal the joins and the models (the
// lookups, the leaderboard, the GBM training), violet the engines that
// transform or score (feature engineering, Python Executor, prediction),
// green what is written (H2O.csv, the model file), amber Colab in the
// browser, white the scored result, slate the job.
// Icons: files the four source files, merge Stream lookup, calculator
// Formula (feature engineering), file-output Text file output, code a
// script executor step, globe the Colab notebook in the browser,
// brain-circuit training a model, save the saved model file, file-text
// the scored CSV, list-ordered a job.
//
// Run from this folder:   node ml-course-path.svg.mjs
// It writes ml-course-path.svg here and ../images/ml-course-path.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, two lab panels stacked. Three columns of boxes, each
// 224 wide with 32 between them; every box is 80 tall, room for a title
// and two lines.
const d = new Diagram(800, 608);
const COL = [32, 288, 544];
const BW = 224, BH = 80;

// The AutoML lab's panel: blending, the training set and AutoML.
d.panel({ x: 16, y: 16, w: 768, h: 268, role: 'tool', iconName: 'workflow', title: 'AutoML lab: autoML.ktr and a Colab notebook', sub: 'blend and engineer in Pentaho Data Integration, then let H2O AutoML rank the models' });

// Row 1, left to right: the four files, the joins, the derived fields.
const R1 = 72;
const files = d.box({ x: COL[0], y: R1, w: BW, h: BH, role: 'source', iconName: 'files', title: 'Four source files', lines: ['customer, billing, details,', 'fraud report: 100,000 rows'] });
const look = d.box({ x: COL[1], y: R1, w: BW, h: BH, role: 'join', iconName: 'merge', title: '3 Stream lookups', lines: ['data wrangling: one row', 'per transaction'] });
const feat = d.box({ x: COL[2], y: R1, w: BW, h: BH, role: 'engine', iconName: 'calculator', title: 'Feature engineering', lines: ['Formula: zip code match;', 'Select values: flags to 1/0'] });
d.arrow({ x1: files.r, y1: files.cy, x2: look.x - 3, y2: look.cy });
d.arrow({ x1: look.r, y1: look.cy, x2: feat.x - 3, y2: feat.cy });

// Row 2 runs right to left: the Copy hop sends every row both to the
// Python Executor (under the feature step) and to tfo-H2O; the file
// H2O.csv then goes to Colab on the left.
const R2 = 188;
const colab = d.box({ x: COL[0], y: R2, w: BW, h: BH, role: 'browser', iconName: 'globe', title: 'Colab notebook', lines: ['upload H2O.csv; AutoML', 'ranks 5 algorithms by AUC'] });
const tfo = d.box({ x: COL[1], y: R2, w: BW, h: BH, role: 'store', iconName: 'file-output', title: 'tfo-H2O', lines: ['data/H2O.csv: nine fields,', 'semicolons, no header'] });
const pyx = d.box({ x: COL[2], y: R2, w: BW, h: BH, role: 'engine', iconName: 'code', title: 'Python Executor', lines: ['auto machine learning:', 'AutoML in h2o-env, 1 row'] });
// Straight down from the feature step to the Python Executor, labeled
// with the hop type (Copy: every row goes to both steps).
d.arrow({ x1: pyx.cx, y1: feat.b, x2: pyx.cx, y2: pyx.y - 3, straight: true, label: 'Copy' });
// The second copy of the rows, to tfo-H2O: an S-curve from the feature
// step's bottom-left down into tfo-H2O's top-right, through the gap
// between the rows, so it stays clear of the Python Executor box.
d.arrow({ x1: feat.x + 24, y1: feat.b, x2: tfo.r - 40, y2: tfo.y - 3, vertical: true });
// The file travels to Colab: tfo-H2O's left edge to Colab's right edge.
d.arrow({ x1: tfo.x, y1: tfo.cy, x2: colab.r + 3, y2: colab.cy });

// The Credit Card lab's panel: the job, training, the model file,
// prediction and the scored file.
const PB = 324;
d.panel({ x: 16, y: PB, w: 768, h: 268, role: 'support', iconName: 'list-ordered', title: 'Credit Card lab: jb_fraud_main_job.kjb', sub: 'train_model, then predict_fraud: a GBM in R with the gbm package' });

// Colab's leaderboard points to a GBM: the arrow leaves Colab and ends
// on the Credit Card panel's top edge (the lab as a whole takes up the
// choice), clear of the panel's title; its pill sits in the gap.
const R3 = PB + 56, R4 = R3 + BH + 36;
const train = d.box({ x: COL[0], y: R3, w: BW, h: BH, role: 'model', iconName: 'brain-circuit', title: 'Train in R', lines: ['tr_train_model_fraud.ktr:', 'gbm(), 500 trees'] });
d.arrow({ x1: colab.cx, y1: colab.b, x2: colab.cx, y2: PB - 3, straight: true, label: 'GBM chosen' });

// Train, save, then load and score, left to right.
const model = d.box({ x: COL[1], y: R3, w: BW, h: BH, role: 'store', iconName: 'save', title: 'gbm_fraud.rdata', lines: ['in train_model_output:', 'gbm_model, best_trees'] });
const pred = d.box({ x: COL[2], y: R3, w: BW, h: BH, role: 'engine', iconName: 'code', title: 'Predict in R', lines: ['tr_predict_fraud.ktr: a', 'fraud probability per row'] });
d.arrow({ x1: train.r, y1: train.cy, x2: model.x - 3, y2: model.cy });
d.arrow({ x1: model.r, y1: model.cy, x2: pred.x - 3, y2: pred.cy });

// The scored file, under the prediction step.
const out = d.box({ x: COL[2], y: R4, w: BW, h: BH, role: 'result', iconName: 'file-text', title: 'Scored CSV', lines: ['output/credit_card_fraud_', '<HHmmss>.csv, 11 columns'] });
d.arrow({ x1: pred.cx, y1: pred.b, x2: out.cx, y2: out.y - 3, straight: true, label: 'Predict Fraud' });

// Bottom left, what decides the order: the job's hops.
d.box({ x: COL[0], y: R4, w: BW * 2 + 32, h: BH, role: 'support', iconName: 'list-ordered', title: 'The job runs both, in order', lines: ['predict_fraud starts only after train_model succeeds,', 'so it always loads a finished model file'] });

d.write(import.meta.url);
