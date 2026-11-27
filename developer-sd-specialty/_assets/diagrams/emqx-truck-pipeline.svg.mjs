// The EMQX workshop's pipeline: tr_mqtt_producer plays truck 111 and
// publishes each sensor reading to EMQX; tr_mqtt_consumer subscribes and
// runs the child tr_process_sensor_data for each batch, which counts the
// minor and major alerts, adds the truck's owner and appends them to two
// files. The figure near the top of 03-mqtt-emqx/guide.md, before the tabs.
//
// Facts it encodes (03-mqtt-emqx and its solution files in
// 03-mqtt-emqx/files/solution):
//   - Producer: gr-IoT_gateway one row every 5000 ms for vehicle 111; six
//     JavaScript sensors; cf-concat_message_field joins the seven fields with
//     ; and sv-message names the line message; MQTT producer to
//     localhost:1884, topic SensorData, QoS 0 (part 1).
//   - EMQX listens on 1884 beside HiveMQ on 1883
//     (lab-kits/Streaming/run-podman-streaming.ps1).
//   - Consumer: MQTT Consumer, localhost:1884, SensorData, QoS 0, a batch
//     every 5000 ms or 50 messages (part 2).
//   - Child, in hop order (part 3): Get records from stream; sf-split_
//     message_field on ; into seven fields; Get System Info current_time and
//     Get Sensor Type 1-7 to a name; then per branch Filter (flag = 1),
//     Memory group by with count_alerts, Stream lookup of owner and phone in
//     dg-vehicule_lookup, Text file output appending to minor_alert.txt and
//     major_alert.txt.
//
// Layout: the three parts across the top; the child below as a snake, its
// first row right to left under the consumer, its second left to right.
// Colors (see README.md): violet the broker and the steps that transform,
// blue the producer and consumer steps and Get records from stream, amber
// the filters, green the outputs, slate the child's panel.
//
// Run from this folder:   node emqx-truck-pipeline.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 436);
const W = 240, H = 84;
const X = [16, 280, 544];

const prod = d.box({ x: X[0], y: 16, w: W, h: H, role: 'tool', iconName: 'send', title: 'tr_mqtt_producer', lines: ['truck 111, six sensors;', 'MQTT producer, QoS 0'] });
const broker = d.box({ x: X[1], y: 16, w: W, h: H, role: 'server', iconName: 'radio-tower', title: 'EMQX :1884', lines: ['topic SensorData'] });
const cons = d.box({ x: X[2], y: 16, w: W, h: H, role: 'tool', iconName: 'inbox', title: 'tr_mqtt_consumer', lines: ['MQTT Consumer: a batch', 'every 5000 ms or 50'] });
d.arrow({ x1: prod.r, y1: prod.cy, x2: broker.x - 1, y2: broker.cy, straight: true });
d.arrow({ x1: broker.r, y1: broker.cy, x2: cons.x - 1, y2: cons.cy, straight: true });

d.panel({ x: 8, y: 132, w: 784, h: 296, role: 'support', iconName: 'workflow', title: 'tr_process_sensor_data', sub: 'the child transformation: runs once per batch' });
const R1 = 196, R2 = 328;
const c0 = d.box({ x: X[2], y: R1, w: W, h: H, role: 'tool', iconName: 'rows-3', title: 'Get records from stream', lines: ['message (String)'] });
const c1 = d.box({ x: X[1], y: R1, w: W, h: H, role: 'engine', iconName: 'split', title: 'sf-split_message_field', lines: ['splits on ; into', 'seven fields'] });
const c2 = d.box({ x: X[0], y: R1, w: W, h: H, role: 'engine', iconName: 'clock', title: 'System Info, Sensor Type', lines: ['current_time for the batch;', 'sensor_type 1-7 to a name'] });
const c3 = d.box({ x: X[0], y: R2, w: W, h: H, role: 'check', iconName: 'filter', title: 'Filter Minor / Major', lines: ['keep rows whose', 'alert flag is 1'] });
const c4 = d.box({ x: X[1], y: R2, w: W, h: H, role: 'engine', iconName: 'sigma', title: 'Group, add the owner', lines: ['count_alerts; owner and', 'phone for the vehicle'] });
const c5 = d.box({ x: X[2], y: R2, w: W, h: H, role: 'write', iconName: 'file-text', title: 'Alert Output steps', lines: ['append to minor_alert.txt', 'and major_alert.txt'] });

d.arrow({ x1: cons.cx, y1: cons.b, x2: c0.cx, y2: c0.y - 1, vertical: true, label: 'each batch' });
d.arrow({ x1: c0.x, y1: c0.cy, x2: c1.r + 1, y2: c1.cy, straight: true });
d.arrow({ x1: c1.x, y1: c1.cy, x2: c2.r + 1, y2: c2.cy, straight: true });
d.arrow({ x1: c2.cx, y1: c2.b, x2: c3.cx, y2: c3.y - 1, vertical: true });
d.arrow({ x1: c3.r, y1: c3.cy, x2: c4.x - 1, y2: c4.cy, straight: true });
d.arrow({ x1: c4.r, y1: c4.cy, x2: c5.x - 1, y2: c5.cy, straight: true });

d.write(import.meta.url);
