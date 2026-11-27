// The Scoring as a Service lab: a long-running H2O server holds the fraud
// model; tr_publish_model loads it in, tr_score_orders scores through it.
// It is the figure in 06-scoring-as-a-service/guide.md, before the tabs.
//
// Facts it encodes, all from 06-scoring-as-a-service (guide and
// files/tr_publish_model.ktr, tr_score_orders.ktr) and
// lab-kits/ML/start-h2o-service.ps1:
//   - The service: C:\ML\start-h2o-service.ps1, port 54400, bound to
//     127.0.0.1, cloud name fraud-scoring; it holds models in memory.
//   - Part 2: tr_publish_model is Generate rows and py-publish_model,
//     which h2o.connect()s to SERVICE_URL and h2o.load_model()s
//     CREDIT_CARD_DIR/train_model_output/gbm_fraud, replacing gbm_fraud.
//   - Part 3: tr_score_orders reads new_orders.csv (2,000 orders), runs
//     Credit Card's tr_features.ktr through map-features, keeps the ids and
//     eight features (sv-features), py-score_orders gets gbm_fraud from the
//     service, predicts and explains, flags at THRESHOLD (0.15), and
//     iu-order_scores Insert / Updates fraud.order_scores.
//   - Part 4: tr_review_report writes output/fraud_review_<yyyyMMdd>.xlsx,
//     a Summary sheet and a Review Queue colored by risk.
//
// Colors: blue the inputs, violet the transformations' steps and the
// service (an engine), green the model folder and the table written,
// teal the shared feature file. Icons: folder the model folder, upload
// publishing, server the service, file-input the CSV, layers the
// Mapping, filter Select values, code the Python step, database the table.
//
// Run from this folder:   node scoring-service.svg.mjs
// It writes scoring-service.svg here and ../images/scoring-service.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 680);

// --- Left: the model, and publishing it --------------------------------
d.panel({ x: 16, y: 16, w: 248, h: 528, role: 'support', iconName: 'upload', title: 'Publish', sub: 'tr_publish_model.ktr' });
const mf = d.box({ x: 24, y: 200, w: 232, h: 80, role: 'store', iconName: 'folder', title: 'gbm_fraud', lines: ["Credit Card's", 'train_model_output folder'] });
const pub = d.box({ x: 24, y: 352, w: 232, h: 96, role: 'engine', iconName: 'code', title: 'py-publish_model', lines: ['h2o.connect(SERVICE_URL);', 'remove gbm_fraud if there;', 'h2o.load_model(folder)'] });
d.arrow({ x1: mf.cx, y1: mf.b, x2: pub.cx, y2: pub.y - 3, straight: true, label: 'its path' });

// --- Middle: the service ---------------------------------------------
const svc = d.box({ x: 296, y: 340, w: 208, h: 120, role: 'server', iconName: 'server', title: 'H2O scoring service', lines: ['127.0.0.1:54400, always on;', 'gbm_fraud in memory;', 'H2O Flow on the same port'] });
d.arrow({ x1: pub.r, y1: pub.cy, x2: svc.x - 3, y2: pub.cy, straight: true });
const st = d.box({ x: 296, y: 184, w: 208, h: 80, role: 'tool', iconName: 'play', title: 'start-h2o-service.ps1', lines: ['started once, in C:\\ML;', '-Status, -Stop'] });
d.arrow({ x1: st.cx, y1: st.b, x2: svc.cx, y2: svc.y - 3, straight: true });

// --- Right: scoring through it ----------------------------------------
d.panel({ x: 536, y: 16, w: 248, h: 528, role: 'engine', iconName: 'shuffle', title: 'Score', sub: 'tr_score_orders.ktr' });
const b = (i, role, iconName, title, lines) => d.box({ x: 544, y: 72 + i * 94, w: 232, h: 78, role, iconName, title, lines });
const s1 = b(0, 'source', 'file-input', 'csvi-new_orders', ['new_orders.csv:', "tonight's 2,000 orders"]);
const s2 = b(1, 'join', 'layers', 'map-features', ["Credit Card's own", 'tr_features.ktr']);
const s3 = b(2, 'engine', 'filter', 'sv-features', ['the two ids and', 'the eight features']);
const s4 = b(3, 'engine', 'code', 'py-score_orders', ['get gbm_fraud; predict,', 'explain, flag at 0.15']);
const s5 = b(4, 'write', 'database', 'iu-order_scores', ['Insert / Update into', 'fraud.order_scores']);
// Then the analysts' workbook, from the table (tr_review_report.ktr).
const rep = d.box({ x: 544, y: 576, w: 232, h: 88, role: 'result', iconName: 'sheet', title: 'The review workbook', lines: ['fraud_review_<date>.xlsx:', 'Summary, Review Queue'] });
d.arrow({ x1: s5.cx, y1: s5.b, x2: rep.cx, y2: rep.y - 3, straight: true, label: 'flagged' });
for (const [a, c] of [[s1, s2], [s2, s3], [s3, s4], [s4, s5]]) {
  d.arrow({ x1: a.cx, y1: a.b, x2: c.cx, y2: c.y - 3, straight: true });
}
// The scoring call: orders out to the service, scores back.
d.arrow({ x1: s4.x, y1: s4.cy - 14, x2: svc.r + 3, y2: s4.cy - 14, straight: true });
d.arrow({ x1: svc.r, y1: s4.cy + 14, x2: s4.x - 3, y2: s4.cy + 14, straight: true });
d.raw(`<text x="${(svc.r + s4.x) / 2}" y="${s4.cy - 22}" text-anchor="middle" font-size="11" font-weight="600" fill="#475569">orders</text>`);
d.raw(`<text x="${(svc.r + s4.x) / 2}" y="${s4.cy + 34}" text-anchor="middle" font-size="11" font-weight="600" fill="#475569">scores</text>`);

d.write(import.meta.url);
