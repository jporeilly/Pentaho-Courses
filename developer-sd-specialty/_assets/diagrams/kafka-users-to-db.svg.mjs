// The Kafka workshop's pipeline: produce_users.py feeds the pdi-users
// topic, the parent users-to-db-parent reads it with Kafka consumer and
// hands each batch to the child users-to-db-child, which parses,
// converts and loads the events into MySQL's user_events table. It is
// the figure near the top of 08-kafka-use-cases/guide.md, after "This
// workshop uses Pentaho Data Integration's parent/child pattern", and it
// replaces the ASCII drawing that stood there.
//
// Facts it encodes, and where each comes from (08-kafka-use-cases unless
// stated):
//   - produce_users.py sends one event a second to pdi-users on
//     127.0.0.1:9092 (part 1, step 3; files/produce_users.py).
//   - The topic has one partition, 0 (part 4, the checkpoint after the
//     queries).
//   - Parent users-to-db-parent.ktr: one step, Kafka consumer, Direct
//     connection to bootstrap servers 127.0.0.1:9092, topic pdi-users,
//     consumer group pdi-warehouse-users (part 2, step 7); Batch tab
//     500 ms or 100 records, whichever first (intro paragraph and part 2,
//     step 8); Offset management "Commit when batch completed" (step 8)
//     and auto.offset.reset earliest on the Options tab (step 10). The
//     solution file uses localhost:9092, which the lesson notes; the
//     diagram follows the lesson's 127.0.0.1.
//   - Child users-to-db-child.ktr, in hop order (part 3; the solution's
//     hops): Get records from stream with the six fields key, message,
//     topic, partition, offset, timestamp (step 4); JSON input from the
//     message field, $.userid, $.regionid, $.gender, $.registertime
//     (steps 8-10); Select values, Meta-data tab, renames to user_id,
//     region_id, register_time_epoch, kafka_topic, kafka_partition,
//     kafka_offset and sets types and lengths (step 13); Formula
//     register_time_seconds = [register_time_epoch] / 1000 (step 16);
//     Table output on connection warehouse_db to user_events (step 21).
//   - Table output maps register_time from register_time_seconds and
//     leaves event_id and ingestion_timestamp to MySQL (part 3, step 22
//     and the Danger note).
//   - user_events in kafka_warehouse on the workshop MySQL, localhost:3306
//     (part 3, step 17): its columns and types, the AUTO_INCREMENT
//     primary key event_id, and the unique key on kafka_topic,
//     kafka_partition, kafka_offset (files/01-create-kafka-warehouse.sql;
//     the "Under the hood" in part 4 names the unique key).
//
// Colors (see README.md): slate the publisher (a stand-in feed) and the
// two transformation panels, violet the Kafka topic and the steps that
// transform, blue the consumer step and Get records from stream, green
// Table output and the MySQL table.
//
// Run from this folder:   node kafka-users-to-db.svg.mjs
// It writes kafka-users-to-db.svg here and ../images/kafka-users-to-db.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, two columns of 340 with an 88px gap. The feed and
// the parent run down the left column, the child down the right; the
// MySQL table comes back to the left, beside Table output.
const d = new Diagram(800, 788);
const BW = 340, BH = 72;
const LX = 16, RX = 444; // left and right column x
const STEP = 100; // distance between the child's steps
const FIRST = 272; // top of the child's first step, level with the consumer

// Left column, top: the publisher and the topic it writes to.
const pub = d.box({ x: LX, y: 16, w: BW, h: BH, role: 'support', iconName: 'square-terminal', title: 'produce_users.py', lines: ['one user-registration event', 'a second, as JSON'] });
const topic = d.box({ x: LX, y: 124, w: BW, h: BH, role: 'server', iconName: 'layers', title: 'Kafka topic pdi-users', lines: ['127.0.0.1:9092, one partition: 0'] });
d.arrow({ x1: pub.cx, y1: pub.b, x2: topic.cx, y2: topic.y - 1, vertical: true });

// Left column: the parent transformation, one Kafka consumer step. Its
// title strip sits in the gap under the topic box.
d.panel({ x: LX - 8, y: FIRST - 52, w: BW + 16, h: 52 + STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'users-to-db-parent', sub: 'the parent transformation' });
const consumer = d.box({ x: LX, y: FIRST, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'Kafka consumer', lines: ['group pdi-warehouse-users;', 'a batch every 500 ms or 100 records'] });
// The consumer's offset settings (Batch and Options tabs), in the same
// panel because they belong to the same step: the group's place in the
// topic is committed only once the child has finished a batch.
d.box({ x: LX, y: FIRST + STEP, w: BW, h: BH, role: 'check', iconName: 'bookmark', title: 'Offset management', lines: ['Commit when batch completed;', 'auto.offset.reset = earliest'] });
// The topic's records go down into the consumer. The arrow runs down the
// boxes' right side, clear of the panel's title text.
const AX = LX + BW - 48;
d.arrow({ x1: AX, y1: topic.b, x2: AX, y2: consumer.y - 1, straight: true });

// Right column: the child transformation, five steps in hop order. Its
// first step sits level with the consumer, so the hand-over is straight.
d.panel({ x: RX - 8, y: FIRST - 52, w: BW + 16, h: 52 + 4 * STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'users-to-db-child', sub: 'the child transformation: runs once per batch' });
const steps = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['key, message, topic,', 'partition, offset, timestamp'] },
  { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['from message: $.userid, $.regionid,', '$.gender, $.registertime (epoch ms)'] },
  { role: 'engine', iconName: 'list-filter', title: 'Select values', lines: ['renames to user_id, kafka_offset, …;', 'sets each type and length'] },
  { role: 'engine', iconName: 'calculator', title: 'Formula', lines: ['register_time_seconds =', '[register_time_epoch] / 1000'] },
  { role: 'write', iconName: 'database', title: 'Table output', lines: ['connection warehouse_db,', 'target table user_events'] },
].map((s, i) => d.box({ x: RX, y: FIRST + i * STEP, w: BW, h: BH, ...s }));
for (let i = 0; i < steps.length - 1; i++) {
  d.arrow({ x1: steps[i].cx, y1: steps[i].b, x2: steps[i + 1].cx, y2: steps[i + 1].y - 1, vertical: true });
}

// The hand-over from parent to child: one batch, one run of the child.
d.arrow({ x1: consumer.r, y1: consumer.cy, x2: steps[0].x - 1, y2: steps[0].cy, straight: true, label: ['each', 'batch'] });

// Left column, bottom: the target table, with its columns from
// 01-create-kafka-warehouse.sql. `PK` the AUTO_INCREMENT key; `UQ` the
// three columns of the unique key that stops a record landing twice.
// Types are in lower case, which MySQL accepts, so the longest,
// varchar(255), fits the kit's type column.
const table = d.entity({
  x: LX, y: 534, w: BW, role: 'store', iconName: 'database', title: 'user_events (MySQL :3306)',
  fields: [
    ['bigint', 'event_id', 'PK'],
    ['varchar(100)', 'user_id'],
    ['varchar(100)', 'region_id'],
    ['varchar(20)', 'gender'],
    ['timestamp', 'register_time'],
    ['varchar(255)', 'kafka_topic', 'UQ'],
    ['int', 'kafka_partition', 'UQ'],
    ['bigint', 'kafka_offset', 'UQ'],
    ['timestamp', 'ingestion_timestamp'],
  ],
});

// Table output inserts into the table, from its left side into the
// table's right side, level with Table output.
const out = steps[steps.length - 1];
d.arrow({ x1: out.x, y1: out.cy, x2: table.r + 1, y2: out.cy, straight: true, label: 'insert' });

d.write(import.meta.url);
