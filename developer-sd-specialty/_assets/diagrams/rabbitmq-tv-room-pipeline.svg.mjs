// The RabbitMQ workshop's pipeline: sensor_tv_room.py publishes the TV
// room's readings to the durable queue tv_room through the default
// exchange; the parent tr_rabbit_consumer reads the queue with AMQP consumer
// and hands each batch to the child tr_process_sensor_data, which stamps,
// parses and appends the readings to tv_room_sensor.txt. The figure near the
// top of 06-amqp-rabbitmq/guide.md, before the tabs.
//
// Facts it encodes (06-amqp-rabbitmq and its files):
//   - sensor_tv_room.py declares tv_room durable and publishes one JSON
//     reading a second (temperature, pressure, humidity) with routing key
//     tv_room to the default exchange (files/sensor_tv_room.py).
//   - RabbitMQ AMQP on 5672 (lab-kits/Streaming/run-podman-streaming.ps1).
//   - Parent: AMQP consumer, amqp://localhost:5672, queue tv_room, a batch
//     every 1000 ms or 1000 messages, Ack when message received (part 5).
//   - Child, in hop order (parts 3 and 4): Get records from stream
//     (message); Get System Info current_time; JSON Input temperature,
//     humidity, pressure; Text file output appending ; separated lines with
//     no header to tv_room_sensor.txt.
//
// Run from this folder:   node rabbitmq-tv-room-pipeline.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 680);
const BW = 340, BH = 72;
const LX = 16, RX = 444;
const STEP = 100;
const FIRST = 272;

const pub = d.box({ x: LX, y: 16, w: BW, h: BH, role: 'support', iconName: 'square-terminal', title: 'sensor_tv_room.py', lines: ['one reading a second, as JSON:', 'temperature, pressure, humidity'] });
const broker = d.box({ x: LX, y: 124, w: BW, h: BH, role: 'server', iconName: 'layers', title: 'RabbitMQ, localhost:5672', lines: ['durable queue tv_room,', 'via the default exchange'] });
d.arrow({ x1: pub.cx, y1: pub.b, x2: broker.cx, y2: broker.y - 1, vertical: true });

d.panel({ x: LX - 8, y: FIRST - 52, w: BW + 16, h: 52 + BH + 16, role: 'support', iconName: 'workflow', title: 'tr_rabbit_consumer', sub: 'the parent transformation' });
const consumer = d.box({ x: LX, y: FIRST, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'AMQP consumer', lines: ['a batch every 1000 ms or 1000 messages;', 'ack when message received'] });
const AX = LX + BW - 48;
d.arrow({ x1: AX, y1: broker.b, x2: AX, y2: consumer.y - 1, straight: true });

d.panel({ x: RX - 8, y: FIRST - 52, w: BW + 16, h: 52 + 3 * STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'tr_process_sensor_data', sub: 'the child transformation: runs once per batch' });
const steps = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['the batch: one field,', 'message (String)'] },
  { role: 'engine', iconName: 'clock', title: 'Get System Info', lines: ['current_time, system date (fixed):', 'one time for the whole batch'] },
  { role: 'engine', iconName: 'file-json', title: 'JSON Input', lines: ['from message: temperature,', 'humidity, pressure (String)'] },
  { role: 'write', iconName: 'file-text', title: 'Text file output', lines: ['appends ; separated lines,', 'no header'] },
].map((s, i) => d.box({ x: RX, y: FIRST + i * STEP, w: BW, h: BH, ...s }));
for (let i = 0; i < steps.length - 1; i++) {
  d.arrow({ x1: steps[i].cx, y1: steps[i].b, x2: steps[i + 1].cx, y2: steps[i + 1].y - 1, vertical: true });
}
d.arrow({ x1: consumer.r, y1: consumer.cy, x2: steps[0].x - 1, y2: steps[0].cy, straight: true, label: ['each', 'batch'] });

const out = steps[steps.length - 1];
const file = d.box({ x: LX, y: out.y, w: BW, h: BH, role: 'store', iconName: 'file-text', title: 'tv_room_sensor.txt', lines: ['current_time;temperature;', 'humidity;pressure'] });
d.arrow({ x1: out.x, y1: out.cy, x2: file.r + 1, y2: out.cy, straight: true, label: 'append' });

d.write(import.meta.url);
