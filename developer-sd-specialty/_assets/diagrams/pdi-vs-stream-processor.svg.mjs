// Where Pentaho Data Integration fits beside a stream processor: two lanes,
// PDI's micro-batches on top, a stateful stream processor (Flink, Kafka
// Streams) below. It is the figure in 01-overview/guide.md, section
// "Where Pentaho Data Integration fits".
//
// Facts it encodes:
//   - PDI's consumer steps close a batch at Duration (ms) or Number of
//     records, and run the child once per batch (01-overview, "The
//     Pentaho Data Integration streaming pattern"); each run starts fresh,
//     so anything kept between batches lives in a table or a file.
//   - A stream processor handles each event as it arrives and keeps keyed
//     state between events (windows, joins over time), checkpointed so a
//     restart resumes it.
//
// Colors (see README.md): slate the event sources, blue Pentaho Data
// Integration, violet the stream processor, amber state, green outputs.
//
// Run from this folder:   node pdi-vs-stream-processor.svg.mjs
// It writes pdi-vs-stream-processor.svg here and
// ../images/pdi-vs-stream-processor.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1040, 548);
const BW = 226, BH = 80;
const X = [26, 280, 534, 788];

// Lane 1: Pentaho Data Integration.
d.panel({ x: 10, y: 16, w: 1020, h: 196, role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration: micro-batches', sub: 'land, check, enrich and load, into almost any target' });
const a = [
  d.box({ x: X[0], y: 100, w: BW, h: BH, role: 'support', iconName: 'radio-tower', title: 'Events', lines: ['MQTT, AMQP, JMS,', 'Kafka, Kinesis'] }),
  d.box({ x: X[1], y: 100, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'Consumer step', lines: ['a batch every N ms', 'or N records'] }),
  d.box({ x: X[2], y: 100, w: BW, h: BH, role: 'tool', iconName: 'workflow', title: 'Child, once per batch', lines: ['parse, check, look up, enrich;', 'starts fresh every batch'] }),
  d.box({ x: X[3], y: 100, w: BW, h: BH, role: 'store', iconName: 'database', title: 'Many targets', lines: ['databases, files, object', 'stores, topics, APIs'] }),
];
for (let i = 0; i < 3; i++) d.arrow({ x1: a[i].r, y1: a[i].cy, x2: a[i + 1].x - 1, y2: a[i + 1].cy, straight: true });

// Lane 2: a stream processor.
d.panel({ x: 10, y: 236, w: 1020, h: 216, role: 'engine', iconName: 'cpu', title: 'A stream processor (Flink, Kafka Streams): per event', sub: 'compute over time: windows, joins and running totals' });
const b = [
  d.box({ x: X[0], y: 320, w: BW, h: BH, role: 'support', iconName: 'radio-tower', title: 'Events', lines: ['usually from Kafka'] }),
  d.box({ x: X[1], y: 320, w: BW, h: BH, role: 'engine', iconName: 'zap', title: 'Each event, at once', lines: ['no batch to wait for'] }),
  d.box({ x: X[2], y: 320, w: BW, h: BH, role: 'check', iconName: 'archive', title: 'Keyed state', lines: ['windows and joins over time,', 'kept and checkpointed'] }),
  d.box({ x: X[3], y: 320, w: BW, h: BH, role: 'store', iconName: 'layers', title: 'Output streams', lines: ['alerts, aggregates,', 'enriched topics'] }),
];
for (let i = 0; i < 3; i++) d.arrow({ x1: b[i].r, y1: b[i].cy, x2: b[i + 1].x - 1, y2: b[i + 1].cy, straight: true });

d.bar({ x: 10, y: 472, w: 1020, h: 60, role: 'result', iconName: 'handshake', title: 'Often both: the stream processor computes over time, and Pentaho Data Integration lands its output', line: 'in the warehouse, the lake and the systems of record, with the same steps as every batch job' });

d.write(import.meta.url);
