// The Contracts, Rejects and Replay workshop's pipeline: the publisher and
// its topic, the parent's Kafka consumer, the child's main path to
// user_events and its two error paths to the rejects topic. It is the
// figure near the top of 09-kafka-contracts/guide.md, before the tabs.
//
// Facts it encodes (09-kafka-contracts and its solution files):
//   - produce_signups.py publishes to pdi-signups on 127.0.0.1:9092; every
//     fourth event breaks the contract (tab 1).
//   - signups-parent: Kafka consumer, group pdi-signup-loader, a batch
//     every 500 ms or 100 records, Commit when batch completed (tab 1).
//   - signups-child main path: Get records from stream, JSON input, Check
//     the contract (Data validator: userid present, gender one of FEMALE,
//     MALE, OTHER), Select values, Formula, Table output to user_events
//     (tabs 3-4).
//   - Error paths: JSON input -> Name the fault (Formula) -> Bad JSON;
//     Check the contract -> Broken contract; both keep message and
//     reject_reason and meet in Publish reject, a Kafka producer to
//     pdi-signups-rejects, key reject_reason (tabs 3-5).
//
// Colors (see README.md): slate the publisher and the parent and child
// panels, violet Kafka and the parsing steps, blue PDI's stream steps,
// amber the checks, red the reject path, green the outputs.
//
// The diagram is 1044 wide so three columns fit; the figure in the guide
// is 800 wide, like every other diagram.
//
// Run from this folder:   node kafka-contracts-pipeline.svg.mjs
// It writes kafka-contracts-pipeline.svg here and
// ../images/kafka-contracts-pipeline.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1044, 920);
const BW = 300, BH = 72;
const C1 = 16, C2 = 356, C3 = 696; // column x
const STEP = 100; // distance between the child's rows
const FIRST = 272; // top of the child's first row, level with the consumer

// Column 1: the publisher, its topic and the parent.
const pub = d.box({ x: C1, y: 16, w: BW, h: BH, role: 'support', iconName: 'square-terminal', title: 'produce_signups.py', lines: ['sign-up events as JSON;', 'every fourth breaks the contract'] });
const topic = d.box({ x: C1, y: 124, w: BW, h: BH, role: 'server', iconName: 'layers', title: 'Kafka topic pdi-signups', lines: ['127.0.0.1:9092, one partition: 0'] });
d.arrow({ x1: pub.cx, y1: pub.b, x2: topic.cx, y2: topic.y - 1, vertical: true });

d.panel({ x: C1 - 8, y: FIRST - 52, w: BW + 16, h: 52 + STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'signups-parent', sub: 'the parent transformation' });
const consumer = d.box({ x: C1, y: FIRST, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'Kafka consumer', lines: ['group pdi-signup-loader;', 'a batch every 500 ms or 100 records'] });
d.box({ x: C1, y: FIRST + STEP, w: BW, h: BH, role: 'check', iconName: 'bookmark', title: 'Offset management', lines: ['Commit when batch completed;', 'auto.offset.reset = earliest'] });
const AX = C1 + BW - 48;
d.arrow({ x1: AX, y1: topic.b, x2: AX, y2: consumer.y - 1, straight: true });

// Columns 2 and 3: the child, main path down the middle, rejects on the right.
d.panel({ x: C2 - 8, y: FIRST - 52, w: 2 * BW + 40 + 48, h: 52 + 4 * STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'signups-child', sub: 'the child transformation: runs once per batch' });
const main = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['key, message, topic,', 'partition, offset, timestamp'] },
  { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['from message; error handling on:', 'what it cannot convert drops out'] },
  { role: 'check', iconName: 'shield-check', title: 'Check the contract', lines: ['Data validator: userid present;', 'gender FEMALE, MALE or OTHER'] },
  { role: 'engine', iconName: 'list-filter', title: 'Select values, Formula', lines: ['renames and types;', 'register_time in seconds'] },
  { role: 'write', iconName: 'database', title: 'Table output', lines: ['warehouse_db, user_events;', 'Ignore insert errors'] },
].map((s, i) => d.box({ x: C2, y: FIRST + i * STEP, w: BW, h: BH, ...s }));
for (let i = 0; i < main.length - 1; i++) {
  d.arrow({ x1: main[i].cx, y1: main[i].b, x2: main[i + 1].cx, y2: main[i + 1].y - 1, vertical: true });
}
d.arrow({ x1: consumer.r, y1: consumer.cy, x2: main[0].x - 1, y2: main[0].cy, straight: true, label: ['each', 'batch'] });

const fault = d.box({ x: C3, y: FIRST + STEP, w: BW, h: BH, role: 'reject', iconName: 'file-x', title: 'Name the fault, Bad JSON', lines: ['reason: registertime is not', 'a number; keep message, reason'] });
const broken = d.box({ x: C3, y: FIRST + 2 * STEP, w: BW, h: BH, role: 'reject', iconName: 'shield-x', title: 'Broken contract', lines: ['reason: the rules it broke;', 'keep message, reason'] });
const publish = d.box({ x: C3, y: FIRST + 3 * STEP, w: BW, h: BH, role: 'reject', iconName: 'send', title: 'Publish reject', lines: ['Kafka producer: key reject_reason,', 'message unchanged'] });
d.arrow({ x1: main[1].r, y1: main[1].cy, x2: fault.x - 1, y2: fault.cy, straight: true, dashed: true, label: 'error' });
d.arrow({ x1: main[2].r, y1: main[2].cy, x2: broken.x - 1, y2: broken.cy, straight: true, dashed: true, label: 'error' });
d.arrow({ x1: broken.cx, y1: broken.b, x2: publish.cx, y2: publish.y - 1, vertical: true });
// Bad JSON's hop runs down a lane right of the boxes, past Broken contract.
const EX = C3 + BW + 16;
d.arrow({ x1: fault.r, y1: fault.cy, x2: EX, y2: fault.cy, straight: true, head: false });
d.arrow({ x1: EX, y1: fault.cy, x2: EX, y2: publish.cy, straight: true, head: false });
d.arrow({ x1: EX, y1: publish.cy, x2: publish.r + 1, y2: publish.cy, straight: true });

// Outputs, under the panels.
const OUT = FIRST + 5 * STEP + 40;
const table = d.box({ x: C2, y: OUT, w: BW, h: BH, role: 'store', iconName: 'database', title: 'MySQL user_events', lines: ['the events that keep the contract,', 'once each (unique topic, partition, offset)'] });
const rejects = d.box({ x: C3, y: OUT, w: BW, h: BH, role: 'reject', iconName: 'layers', title: 'Kafka topic pdi-signups-rejects', lines: ['each rejected message as sent,', 'its reason as the key'] });
d.arrow({ x1: main[4].cx, y1: main[4].b, x2: table.cx, y2: table.y - 1, vertical: true, label: 'insert' });
d.arrow({ x1: publish.cx, y1: publish.b, x2: rejects.cx, y2: rejects.y - 1, vertical: true, label: 'publish' });

// The replay, under the parent: the log is the source.
d.box({ x: C1, y: OUT, w: BW, h: BH, role: 'check', iconName: 'rotate-ccw', title: 'Replay', lines: ['-Group pdi-signup-loader -Rewind:', 'the next run reads the log again'] });

d.write(import.meta.url);
