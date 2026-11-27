// The HiveMQ workshop's pipeline: sensor.py publishes the robot's readings
// to HiveMQ, the parent tr_robot_consumer reads them with MQTT Consumer and
// hands each batch to the child tr_process_robot_data, which stamps, parses
// and appends them to robot_sensor.txt. The figure near the top of
// 04-mqtt-hivemq/guide.md, before the tabs.
//
// Facts it encodes, and where each comes from (04-mqtt-hivemq unless
// stated):
//   - sensor.py publishes one JSON reading a second, a temperature and an
//     x/y/z position, to acme/plant1/line1/robot1/telemetry on localhost:1883
//     (files/sensor.py; part 2).
//   - HiveMQ listens on 1883 (lab-kits/Streaming/run-podman-streaming.ps1).
//   - Parent tr_robot_consumer.ktr: one step, MQTT Consumer, connection
//     localhost:1883, topic acme/plant1/line1/robot1/telemetry, QoS 0; Batch tab 5000 ms
//     or 50 messages, whichever first (part 5; files/solution).
//   - Child tr_process_robot_data.ktr, in hop order (parts 3 and 4):
//     Get records from stream (message, String); Get system info
//     current_time, system date (fixed); JSON input from message,
//     $.temperature and $.position, both String; Text file output,
//     ${Internal.Transformation.Filename.Directory}/robot_sensor.txt, ;
//     separated, no header, Append.
//
// Colors (see README.md): slate the publisher and the transformation
// panels, violet the broker and the steps that transform, blue the
// consumer step and Get records from stream, green the output.
//
// Run from this folder:   node hivemq-robot-pipeline.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 680);
const BW = 340, BH = 72;
const LX = 16, RX = 444;
const STEP = 100;
const FIRST = 272;

const pub = d.box({ x: LX, y: 16, w: BW, h: BH, role: 'support', iconName: 'square-terminal', title: 'sensor.py', lines: ['one reading a second, as JSON:', 'temperature, position {x, y, z}'] });
const broker = d.box({ x: LX, y: 124, w: BW, h: BH, role: 'server', iconName: 'radio-tower', title: 'HiveMQ, localhost:1883', lines: ['topic acme/plant1/line1/robot1/telemetry'] });
d.arrow({ x1: pub.cx, y1: pub.b, x2: broker.cx, y2: broker.y - 1, vertical: true });

d.panel({ x: LX - 8, y: FIRST - 52, w: BW + 16, h: 52 + BH + 16, role: 'support', iconName: 'workflow', title: 'tr_robot_consumer', sub: 'the parent transformation' });
const consumer = d.box({ x: LX, y: FIRST, w: BW, h: BH, role: 'tool', iconName: 'inbox', title: 'MQTT Consumer', lines: ['QoS 0; a batch every', '5000 ms or 50 messages'] });
const AX = LX + BW - 48;
d.arrow({ x1: AX, y1: broker.b, x2: AX, y2: consumer.y - 1, straight: true });

d.panel({ x: RX - 8, y: FIRST - 52, w: BW + 16, h: 52 + 3 * STEP + BH + 16, role: 'support', iconName: 'workflow', title: 'tr_process_robot_data', sub: 'the child transformation: runs once per batch' });
const steps = [
  { role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['the batch: one field,', 'message (String)'] },
  { role: 'engine', iconName: 'clock', title: 'Get system info', lines: ['current_time, system date (fixed):', 'one time for the whole batch'] },
  { role: 'engine', iconName: 'file-json', title: 'JSON input', lines: ['from message: $.temperature,', '$.position (both String)'] },
  { role: 'write', iconName: 'file-text', title: 'Text file output', lines: ['appends ; separated lines,', 'no header'] },
].map((s, i) => d.box({ x: RX, y: FIRST + i * STEP, w: BW, h: BH, ...s }));
for (let i = 0; i < steps.length - 1; i++) {
  d.arrow({ x1: steps[i].cx, y1: steps[i].b, x2: steps[i + 1].cx, y2: steps[i + 1].y - 1, vertical: true });
}
d.arrow({ x1: consumer.r, y1: consumer.cy, x2: steps[0].x - 1, y2: steps[0].cy, straight: true, label: ['each', 'batch'] });

const out = steps[steps.length - 1];
const file = d.box({ x: LX, y: out.y, w: BW, h: BH, role: 'store', iconName: 'file-text', title: 'robot_sensor.txt', lines: ['current_time;temperature;position', 'beside the transformation'] });
d.arrow({ x1: out.x, y1: out.cy, x2: file.r + 1, y2: out.cy, straight: true, label: 'append' });

d.write(import.meta.url);
