// The capstone's target (10-capstone-a-plant-floor-alert-feed, Suggested
// shape): two pipelines joined by a keyed Kafka topic.
//
// Facts it encodes (the capstone guide and files):
//   - line_sensors.py: press-01, lathe-02, mill-03, one reading a second
//     each, to HiveMQ localhost:1883 on factory/line1/<machine>/telemetry.
//   - telemetry_to_kafka: MQTT consumer on factory/line1/+/telemetry, a
//     batch every 5000 ms or 50 messages, runs process_telemetry.
//   - process_telemetry: Get records from stream (message, topic); Split
//     fields on / (the third part is the machine); JSON input; Text file
//     output appending to out\telemetry.txt; Filter rows spindle_temp > 85
//     OR vibration > 7; Kafka producer to line1-alerts on 127.0.0.1:9092,
//     key machine.
//   - line1-alerts: three partitions; one key, one partition.
//   - alerts_to_mysql: Kafka consumer, group line1-alert-loader, runs
//     load_alerts: Get records from stream, JSON input, Select values,
//     Table output into factory.line_alerts (unique topic/partition/offset).
//
// Run from this folder:   node capstone-plant-floor.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 640);
const W = 240, H = 84;
const X = [16, 280, 544];

const pub = d.box({ x: X[0], y: 16, w: W, h: H, role: 'support', iconName: 'factory', title: 'line_sensors.py', lines: ['press-01, lathe-02, mill-03:', 'a reading a second each'] });
const hive = d.box({ x: X[1], y: 16, w: W, h: H, role: 'server', iconName: 'radio-tower', title: 'HiveMQ :1883', lines: ['factory/line1/<machine>/', 'telemetry'] });
const mq = d.box({ x: X[2], y: 16, w: W, h: H, role: 'tool', iconName: 'inbox', title: 'telemetry_to_kafka', lines: ['MQTT consumer on', 'factory/line1/+/telemetry'] });
d.arrow({ x1: pub.r, y1: pub.cy, x2: hive.x - 1, y2: hive.cy, straight: true });
d.arrow({ x1: hive.r, y1: hive.cy, x2: mq.x - 1, y2: mq.cy, straight: true });

d.panel({ x: 8, y: 132, w: 784, h: 168, role: 'support', iconName: 'workflow', title: 'process_telemetry', sub: 'runs once per batch' });
const R1 = 196;
const c0 = d.box({ x: X[2], y: R1, w: W, h: H, role: 'engine', iconName: 'split', title: 'Records, topic, JSON', lines: ['the machine is the', "topic's third part"] });
const c1 = d.box({ x: X[1], y: R1, w: W, h: H, role: 'write', iconName: 'file-text', title: 'Text file output', lines: ['appends every reading to', 'out\\telemetry.txt'] });
const c2 = d.box({ x: X[0], y: R1, w: W, h: H, role: 'check', iconName: 'filter', title: 'Filter rows', lines: ['spindle_temp > 85', 'OR vibration > 7'] });
d.arrow({ x1: mq.cx, y1: mq.b, x2: c0.cx, y2: c0.y - 1, vertical: true, label: 'each batch' });
d.arrow({ x1: c0.x, y1: c0.cy, x2: c1.r + 1, y2: c1.cy, straight: true });
d.arrow({ x1: c1.x, y1: c1.cy, x2: c2.r + 1, y2: c2.cy, straight: true });

const R2 = 332;
const prod = d.box({ x: X[0], y: R2, w: W, h: H, role: 'tool', iconName: 'send', title: 'Kafka producer', lines: ['key = machine'] });
const topic = d.box({ x: X[1], y: R2, w: W, h: H, role: 'server', iconName: 'layers', title: 'line1-alerts', lines: ['three partitions:', 'one machine, one partition'] });
const kc = d.box({ x: X[2], y: R2, w: W, h: H, role: 'tool', iconName: 'inbox', title: 'alerts_to_mysql', lines: ['Kafka consumer, group', 'line1-alert-loader'] });
d.arrow({ x1: c2.cx, y1: c2.b, x2: prod.cx, y2: prod.y - 1, vertical: true, label: 'alerts' });
d.arrow({ x1: prod.r, y1: prod.cy, x2: topic.x - 1, y2: topic.cy, straight: true });
d.arrow({ x1: topic.r, y1: topic.cy, x2: kc.x - 1, y2: kc.cy, straight: true });

d.panel({ x: 8, y: 448, w: 784, h: 176, role: 'support', iconName: 'workflow', title: 'load_alerts', sub: 'runs once per batch' });
const R3 = 512;
const l0 = d.box({ x: X[2], y: R3, w: W, h: H, role: 'engine', iconName: 'file-json', title: 'Records, JSON, names', lines: ['key becomes machine;', 'topic, partition, offset kept'] });
const l1 = d.box({ x: X[1], y: R3, w: W, h: H, role: 'write', iconName: 'database', title: 'Table output', lines: ['factory.line_alerts;', 'a refused copy is skipped'] });
const tbl = d.box({ x: X[0], y: R3, w: W, h: H, role: 'store', iconName: 'database', title: 'line_alerts', lines: ['unique on topic,', 'partition, offset'] });
d.arrow({ x1: kc.cx, y1: kc.b, x2: l0.cx, y2: l0.y - 1, vertical: true, label: 'each batch' });
d.arrow({ x1: l0.x, y1: l0.cy, x2: l1.r + 1, y2: l1.cy, straight: true });
d.arrow({ x1: l1.x, y1: l1.cy, x2: tbl.r + 1, y2: tbl.cy, straight: true });

d.write(import.meta.url);
