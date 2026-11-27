// The Streams to the Lake workshop's pipeline: the topic, the lake writer's
// own consumer group, the child that lands each batch as an Avro file in
// MinIO, and the two readers. It is the figure near the top of
// 10-kafka-lake/guide.md, before the tabs.
//
// Facts it encodes (10-kafka-lake and its solution files):
//   - lake-parent: Kafka consumer, topic pdi-signups, group pdi-lake-writer
//     (the warehouse loader's pdi-signup-loader is untouched), a batch every
//     10000 ms or 1000 records in the solution; the starter keeps 500 ms /
//     100 (tabs 4-5).
//   - lake-child: Get records from stream, Get system info (landed_at),
//     Select values (kafka_* names), Avro output "Land in the lake" to
//     pvfs://MinIO/streaming-lake/signups_<yyyyMMdd_HHmmss_SSS>.avro,
//     Deflate, schema embedded (tab 3).
//   - MinIO: pcm-minio, S3 API 127.0.0.1:9000, bucket streaming-lake,
//     reached through the VFS connection MinIO (tabs 1-2).
//   - Readers: Avro input reads one file in Pentaho Data Integration
//     (tab 6); query_lake.py reads every file with fastavro (tab 7).
//
// Colors (see README.md): slate the publisher and panels, violet Kafka,
// blue Pentaho Data Integration, green the lake, amber the readers.
//
// Run from this folder:   node kafka-lake-pipeline.svg.mjs
// It writes kafka-lake-pipeline.svg here and
// ../images/kafka-lake-pipeline.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1064, 756);
const BW = 300, BH = 72;
const C1 = 16, C2 = 356, C3 = 728;
const STEP = 100;
const FIRST = 272;

const pub = d.box({ x: C1, y: 16, w: BW, h: BH, role: 'support', iconName: 'square-terminal', title: 'produce_signups.py', lines: ['sign-up events, some of them', 'breaking the contract'] });
const topic = d.box({ x: C1, y: 124, w: BW, h: BH, role: 'server', iconName: 'layers', title: 'Kafka topic pdi-signups', lines: ['127.0.0.1:9092: every event', 'since the Contracts lab'] });
d.arrow({ x1: pub.cx, y1: pub.b, x2: topic.cx, y2: topic.y - 1, vertical: true });

d.panel({ x: C1 - 8, y: FIRST - 52, w: BW + 16, h: 52 + STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'lake-parent', sub: 'the parent transformation' });
const consumer = d.box({ x: C1, y: FIRST, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'Kafka consumer', lines: ['its own group: pdi-lake-writer;', 'the warehouse loader is untouched'] });
d.box({ x: C1, y: FIRST + STEP, w: BW, h: BH, role: 'check', iconName: 'timer', title: 'Batch size = file size', lines: ['500 ms: a file per event;', '10000 ms: about ten per file'] });
const AX = C1 + BW - 48;
d.arrow({ x1: AX, y1: topic.b, x2: AX, y2: consumer.y - 1, straight: true });

d.panel({ x: C2 - 8, y: FIRST - 52, w: BW + 16, h: 52 + 3 * STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'lake-child', sub: 'runs once per batch: one file per run' });
const steps = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['key, message, topic,', 'partition, offset, timestamp'] },
  { role: 'engine', iconName: 'clock', title: 'Get system info', lines: ['landed_at: one time', 'for the whole batch'] },
  { role: 'engine', iconName: 'list-filter', title: 'Select values', lines: ['kafka_topic, kafka_partition,', 'kafka_offset, kafka_timestamp, …'] },
  { role: 'write', iconName: 'file-archive', title: 'Land in the lake', lines: ['Avro output: Deflate,', 'schema inside the file'] },
].map((s, i) => d.box({ x: C2, y: FIRST + i * STEP, w: BW, h: BH, ...s }));
for (let i = 0; i < steps.length - 1; i++) d.arrow({ x1: steps[i].cx, y1: steps[i].b, x2: steps[i + 1].cx, y2: steps[i + 1].y - 1, vertical: true });
d.arrow({ x1: consumer.r, y1: consumer.cy, x2: steps[0].x - 1, y2: steps[0].cy, straight: true, label: ['each', 'batch'] });

const lake = d.box({ x: C3, y: FIRST + 3 * STEP, w: BW, h: BH, role: 'store', iconName: 'cylinder', title: 'MinIO bucket streaming-lake', lines: ['signups_<time>.avro, one per batch;', 'pvfs://MinIO = 127.0.0.1:9000'] });
d.arrow({ x1: steps[3].r, y1: steps[3].cy, x2: lake.x - 1, y2: lake.cy, straight: true, label: 'write' });

const r1 = d.box({ x: C3, y: FIRST + STEP, w: BW, h: BH, role: 'check', iconName: 'workflow', title: 'Avro input (PDI)', lines: ['reads one file, by name;', 'the schema comes from the file'] });
const r2 = d.box({ x: C3, y: FIRST, w: BW, h: BH, role: 'check', iconName: 'square-terminal', title: 'query_lake.py (no PDI)', lines: ['reads every file in the bucket:', 'an open format, any engine'] });
d.arrow({ x1: lake.cx, y1: lake.y, x2: r1.cx, y2: r1.b + 1, vertical: true, label: 'read' });
// query_lake.py's read runs round the right, past Avro input.
const EX = C3 + BW + 20;
d.arrow({ x1: lake.r, y1: lake.cy, x2: EX, y2: lake.cy, straight: true, head: false });
d.arrow({ x1: EX, y1: lake.cy, x2: EX, y2: r2.cy, straight: true, head: false });
d.arrow({ x1: EX, y1: r2.cy, x2: r2.r + 1, y2: r2.cy, straight: true });

d.bar({ x: 16, y: 688, w: 1012, h: 52, role: 'result', iconName: 'library', title: 'A table format, such as Apache Iceberg, adds a catalog of these files over them', line: 'so engines read a table, with schema changes and snapshots, instead of a list of files' });

d.write(import.meta.url);
