// The one streaming pattern every protocol in this course follows: a
// parent transformation whose consumer step reads a broker and collects
// messages into batches, and a child transformation that runs once per
// batch, starting with Get records from stream. It is the figure in
// 01-overview/guide.md, section "The Pentaho Data Integration streaming
// pattern", after the bullet list.
//
// Facts it encodes, and where each comes from:
//   - Every streaming source follows the parent/child pattern; the
//     parent holds the consumer step (MQTT Consumer, Kafka Consumer, AMQP
//     Consumer), which subscribes to the stream and collects incoming
//     messages into batches (01-overview, "The Pentaho Data Integration
//     streaming pattern").
//   - A batch goes to the child when the first of two thresholds is
//     reached: Duration (ms), a time window, or Number of records, a
//     message count (01-overview; 04-mqtt-emqx part 2, "Pentaho Data
//     Integration runs the child when either threshold is met").
//   - The child must start with Get records from stream, which surfaces
//     the batched messages as rows; it cannot sit mid-stream (01-overview,
//     the bullet and the "Get records from stream" note).
//   - Then parse, transform and load like any other stream: JSON Input,
//     Select values, Formula, Table output; only the consumer step at the
//     front changes (01-overview). The MQTT and AMQP labs load with Text
//     file output instead (03-mqtt-hivemq part 3, 06-amqp-rabbitmq
//     part 3), hence "or Text file output".
//   - The brokers the labs read: HiveMQ and EMQX (MQTT topics), RabbitMQ
//     (an AMQP queue), Kafka (a topic) (01-overview, "Protocols covered
//     in this specialty").
//   - The labs' Batch tab settings: MQTT consumer 5000 ms / 50 records
//     (03-mqtt-hivemq part 4 step 7, 04-mqtt-emqx part 2 step 7); AMQP
//     consumer 1000 ms / 1000 records (06-amqp-rabbitmq part 4 step 7);
//     Kafka consumer 500 ms / 100 records (08-kafka-use-cases part 2
//     step 8).
//
// Colors (see README.md): violet the broker and the steps that
// transform, blue the consumer step and Get records from stream (where
// the data is read), amber the batch threshold (a check), green the load,
// slate the two transformation panels and the settings table.
//
// Run from this folder:   node parent-child-streaming.svg.mjs
// It writes parent-child-streaming.svg here and
// ../images/parent-child-streaming.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. Two columns of 340: the parent side on the left, the
// child on the right, with an 88px gap for the arrow that hands over a
// batch. Every box is 340 wide and 72 high; boxes in a column are 96
// apart.
const d = new Diagram(800, 664);
const BW = 340, BH = 72;
const LX = 16, RX = 444; // left and right column x
const CONSUMER_Y = 176; // the consumer box, under the parent's title strip
const BATCH_Y = CONSUMER_Y + 96; // the batch box, and the child's first step

// Row 0, left: the broker the consumer reads. One box stands for all of
// them, since the pattern does not change with the protocol.
const broker = d.box({ x: LX, y: 16, w: BW, h: BH, role: 'server', iconName: 'radio-tower', title: 'Broker', lines: ['HiveMQ or EMQX (MQTT), RabbitMQ', '(AMQP), or Kafka'] });

// Rows 1-2, left: the parent transformation, holding the consumer step
// and the batch rule it applies. The panel's title strip sits above the
// consumer box.
d.panel({ x: LX - 8, y: CONSUMER_Y - 52, w: BW + 16, h: BATCH_Y + BH + 16 - (CONSUMER_Y - 52), role: 'support', iconName: 'workflow', title: 'Parent transformation', sub: 'one consumer step: the only part that changes' });
const consumer = d.box({ x: LX, y: CONSUMER_Y, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'Consumer step', lines: ['MQTT consumer, AMQP consumer or', 'Kafka consumer: collects messages'] });
const batch = d.box({ x: LX, y: BATCH_Y, w: BW, h: BH, role: 'check', iconName: 'timer', title: 'Batch: the first threshold wins', lines: ['Duration (ms), a time window, or', 'Number of records, a message count'] });

// The broker's messages go down into the consumer, which fills the batch.
// The arrow runs down the boxes' right side, so it crosses the parent's
// title strip clear of its text; its pill sits in the gap above the panel.
const AX = LX + BW - 48;
d.arrow({ x1: AX, y1: broker.b, x2: AX, y2: consumer.y - 1, straight: true, label: 'subscribes', ly: (broker.b + consumer.y - 52) / 2 });
d.arrow({ x1: consumer.cx, y1: consumer.b, x2: batch.cx, y2: batch.y - 1, vertical: true });

// Right column: the child transformation, one run per batch. Its
// first box sits level with the batch box, so the hand-over arrow is
// straight.
d.panel({ x: RX - 8, y: BATCH_Y - 52, w: BW + 16, h: 52 + 3 * 96 + BH + 16, role: 'support', iconName: 'workflow', title: 'Child transformation', sub: 'runs once for each batch' });
const steps = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['must be the first step:', 'the batch arrives as rows'] },
  { role: 'engine', iconName: 'file-json', title: 'Parse: JSON input', lines: ['splits each message into fields'] },
  { role: 'engine', iconName: 'calculator', title: 'Transform', lines: ['Select values, Formula'] },
  { role: 'write', iconName: 'database', title: 'Load: Table output', lines: ['or Text file output, in the', 'MQTT and AMQP labs'] },
].map((s, i) => d.box({ x: RX, y: BATCH_Y + i * 96, w: BW, h: BH, ...s }));

// The steps run top to bottom, joined by hops.
for (let i = 0; i < steps.length - 1; i++) {
  d.arrow({ x1: steps[i].cx, y1: steps[i].b, x2: steps[i + 1].cx, y2: steps[i + 1].y - 1, vertical: true });
}

// The hand-over: each batch starts one run of the child.
d.arrow({ x1: batch.r, y1: batch.cy, x2: steps[0].x - 1, y2: steps[0].cy, straight: true, label: ['each', 'batch'] });

// Under the parent, left: the batch settings each lab uses, so the rule above
// has numbers next to it. A kit row table; every row is the parent's
// consumer step, so all rows share the blue tone.
d.tableBox({
  x: LX, y: BATCH_Y + BH + 48, w: BW, role: 'support', iconName: 'sliders-horizontal',
  title: 'The labs’ Batch tab', sub: 'whichever comes first sends the batch',
  cols: ['Consumer step', 'Duration (ms)', 'Records'],
  rows: [
    { tone: 'tool', cells: ['MQTT consumer', '5000', '50'] },
    { tone: 'tool', cells: ['AMQP consumer', '1000', '1000'] },
    { tone: 'tool', cells: ['Kafka consumer', '500', '100'] },
  ],
});

d.write(import.meta.url);
