// The Real-time Scoring lab: orders published to the Kafka topic orders,
// read by tr_live_orders.ktr's Kafka consumer, and each batch scored by
// tr_score_live.ktr through the H2O scoring service. It is the figure in
// 07-real-time-scoring/guide.md, before the tabs.
//
// Facts it encodes, all from 07-real-time-scoring (guide and
// files/tr_live_orders.ktr, tr_score_live.ktr):
//   - Part 4: live_orders.jsonl (500 orders) is published to the topic
//     orders on 127.0.0.1:9092 (Streaming kit, -Topic orders).
//   - Part 2: the Kafka consumer reads orders as the group fraud-scoring,
//     batches of 100 records or 1000 ms, Commit when batch completed, and
//     runs tr_score_live.ktr for each batch.
//   - Part 3 step table: Get records from stream; json-order; fltr-parsed
//     (transaction_id IS NOT NULL; false to sv-rejected and
//     output/rejected_messages.csv); map-features (Credit Card's
//     tr_features.ktr); sv-features; py-score_live (the H2O scoring
//     service); iu-live_scores; fltr-flagged (flagged = 1) to
//     txt-fraud_alerts, output/fraud_alerts.csv.
//
// Colors: blue the inputs, teal the topic and the join of features,
// violet the steps and the service, amber the two checks, green the
// writes, red the rejected messages. Icons: file-json the orders,
// radio-tower the topic, download the consumer, inbox Get records from
// stream, braces JSON input, filter the checks, layers the Mapping,
// code the Python step, server the service, database the table,
// file-output the alerts, file-x the rejects.
//
// Run from this folder:   node real-time-scoring.svg.mjs
// It writes real-time-scoring.svg here and ../images/real-time-scoring.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 724);
const line = (pathD) => d.edges.push(`<path d="${pathD}" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#rt-arrow)"/>`);
d.under.push('<defs><marker id="rt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#64748b"/></marker></defs>');

// --- Left: the orders, the topic, the parent ---------------------------
const of = d.box({ x: 16, y: 72, w: 248, h: 80, role: 'source', iconName: 'file-json', title: 'live_orders.jsonl', lines: ['500 orders, one JSON', 'message per line'] });
const tp = d.box({ x: 16, y: 200, w: 248, h: 80, role: 'join', iconName: 'radio-tower', title: 'Kafka topic: orders', lines: ['127.0.0.1:9092,', 'one partition'] });
d.arrow({ x1: of.cx, y1: of.b, x2: tp.cx, y2: tp.y - 3, straight: true, label: 'console producer' });
d.panel({ x: 16, y: 320, w: 248, h: 200, role: 'support', iconName: 'shuffle', title: 'tr_live_orders.ktr', sub: 'the parent: never ends' });
const kc = d.box({ x: 24, y: 376, w: 232, h: 128, role: 'engine', iconName: 'download', title: 'Kafka consumer', lines: ['group fraud-scoring;', '100 records or 1 second;', 'commits when the child', 'has finished the batch'] });
d.arrow({ x1: tp.cx, y1: tp.b, x2: tp.cx, y2: 320 - 3, straight: true, label: 'reads' });

// --- Right: the child --------------------------------------------------
d.panel({ x: 288, y: 16, w: 496, h: 692, role: 'engine', iconName: 'shuffle', title: 'tr_score_live.ktr', sub: 'the child: runs once per batch' });
const H = 60, S = 80, Y0 = 72;
const m = (i, role, iconName, title, lines) => d.box({ x: 296, y: Y0 + i * S, w: 232, h: H, role, iconName, title, lines });
const s = (i, role, iconName, title, lines) => d.box({ x: 544, y: Y0 + i * S, w: 232, h: H, role, iconName, title, lines });
const c0 = m(0, 'source', 'inbox', 'Get records from stream', ['the batch']);
const c1 = m(1, 'engine', 'braces', 'json-order', ['11 fields from message']);
const c2 = m(2, 'check', 'filter', 'fltr-parsed', ['transaction_id IS NOT NULL']);
const c3 = m(3, 'join', 'layers', 'map-features', ["Credit Card's tr_features"]);
const c4 = m(4, 'engine', 'filter', 'sv-features', ['ids, features, offset']);
const c5 = m(5, 'engine', 'code', 'py-score_live', ['score in the service']);
const c6 = m(6, 'write', 'database', 'iu-live_scores', ['with partition, offset']);
const c7 = m(7, 'check', 'filter', 'fltr-flagged', ['flagged = 1']);
for (const [a, b] of [[c0, c1], [c1, c2], [c2, c3], [c3, c4], [c4, c5], [c5, c6], [c6, c7]]) {
  d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
}
const rj = s(2, 'reject', 'file-x', 'rejected_messages.csv', ['not an order: set aside']);
const sv = s(5, 'server', 'server', 'H2O scoring service', ['127.0.0.1:54400, gbm_fraud']);
const al = s(7, 'write', 'file-output', 'fraud_alerts.csv', ['appended, batch by batch']);
d.arrow({ x1: c2.r, y1: c2.cy, x2: rj.x - 3, y2: rj.cy, straight: true, label: 'false' });
d.arrow({ x1: c5.r, y1: c5.cy - 10, x2: sv.x - 3, y2: c5.cy - 10, straight: true });
d.arrow({ x1: sv.x, y1: c5.cy + 10, x2: c5.r + 3, y2: c5.cy + 10, straight: true });
d.arrow({ x1: c7.r, y1: c7.cy, x2: al.x - 3, y2: al.cy, straight: true, label: 'true' });

// Each batch: from the consumer into the child's first step.
const jx = 276;
line(`M${kc.r} ${kc.cy}L${jx - 6} ${kc.cy}Q${jx} ${kc.cy} ${jx} ${kc.cy - 6}L${jx} ${c0.cy + 6}Q${jx} ${c0.cy} ${jx + 6} ${c0.cy}L${c0.x - 3} ${c0.cy}`);

d.write(import.meta.url);
