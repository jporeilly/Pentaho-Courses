// Last Will and Testament with a retained status topic, as the HiveMQ
// workshop's part 5 runs it: sensor.py connects with a will, publishes a
// retained `online`, a subscriber sees it, the window is closed without
// a DISCONNECT, the broker publishes the will `offline`, and a client
// that subscribes later still gets `offline`. A sequence diagram with
// four lanes. It is the figure in 03-mqtt-hivemq/guide.md, part 5
// "Last Will and Testament", after the "Under the hood".
//
// Facts it encodes, and where each comes from (03-mqtt-hivemq part 5
// unless stated):
//   - The status topic industrial/robot/status; will_set(status_topic,
//     "offline", qos=1, retain=True) is set before client.connect(), so
//     the will travels with the connection (step 2's connect_mqtt, and
//     "When sensor.py connected, it handed HiveMQ a will").
//   - On connect, on_connect publishes "online" with qos=1, retain=True
//     (step 2).
//   - status.py, the lab's watcher, connects to localhost:1883,
//     subscribes to industrial/robot/status and shows `online` straight
//     away: the broker hands the retained value to every new subscriber
//     (steps 4 and its checkpoint).
//   - Closing the PowerShell window ends the process without an MQTT
//     DISCONNECT, so the broker publishes the will on the client's
//     behalf; the topic changes to `offline` (step 5, its checkpoint,
//     and "Under the hood").
//   - The will is retained, so it tells any subscriber, even one that
//     connects later, whether the device is alive (the part's intro);
//     the broker keeps one retained message per topic as its last-known
//     value (02-mqtt, "Retained messages").
//   - A client that calls disconnect() tells the broker to discard its
//     will, so a clean shutdown sends nothing; a network failure is
//     noticed after 1.5 times the keep-alive (paho's default 60 s)
//     ("Under the hood"; 02-mqtt, "Keep alive").
//   The "later subscriber" lane is the intro's "even one that connects
//   later"; the workshop's steps use one client.
//
// Colors (see README.md): slate sensor.py (a publisher), violet HiveMQ
// (the broker), amber the two subscribers (clients you check the topic
// with), red the band where the sensor dies; the slate bar at the foot
// is the clean-shutdown case. Replies from the broker are dashed.
//
// Run from this folder:   node mqtt-lwt-retained.svg.mjs
// It writes mqtt-lwt-retained.svg here and
// ../images/mqtt-lwt-retained.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

// Canvas: 800 wide, four lanes of 182 with 12px gaps, as in the High
// Availability course's sticky-session sequence; a bar at the foot.
const d = new Diagram(800, 852);
const TOP = 16, H = 740;

const [sen, brk, sub, late] = lanes(d, {
  top: TOP, height: H, cols: [
    { x: 16, w: 182, role: 'support', iconName: 'square-terminal', title: 'sensor.py', sub: 'the robot sensor' },
    { x: 210, w: 182, role: 'server', iconName: 'radio-tower', title: 'HiveMQ', sub: 'localhost:1883' },
    { x: 404, w: 182, role: 'check', iconName: 'eye', title: 'Subscriber', sub: 'status.py' },
    { x: 598, w: 182, role: 'check', iconName: 'eye', title: 'Later subscriber', sub: 'status.py, started again' },
  ],
});

// A heading band across all four lanes for each phase, on the panel
// layer so arrows and pills draw over it.
function band(y, title, color) {
  d.under.push(`<rect x="24" y="${y}" width="752" height="28" rx="8" fill="#ffffff" stroke="${color}" stroke-width="1.4"/>`);
  d.under.push(`<text x="400" y="${y + 19}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${title}</text>`);
}

// Phase 1: the sensor connects with its will and announces itself.
band(76, 'sensor.py starts: topic industrial/robot/status', '#475569');
msg(d, sen, brk, 136, ['1  CONNECT, with a will:', 'offline, QoS 1, retained']);
note(d, brk, 190, ['keeps the will', 'for this client']);
msg(d, sen, brk, 244, ['2  PUBLISH online', 'QoS 1, retained']);
note(d, brk, 298, ['retained value:', 'online']);
msg(d, sub, brk, 352, '3  SUBSCRIBE');
msg(d, brk, sub, 398, '4  online', { dashed: true });

// Phase 2: the window is closed, so no DISCONNECT reaches the broker,
// and the broker publishes the will for the client.
band(438, 'Window closed: no DISCONNECT, so the broker publishes the will', '#b91c1c');
note(d, sen, 492, ['process ends', 'without disconnect()']);
note(d, brk, 546, ['publishes the will;', 'retained value: offline']);
msg(d, brk, sub, 600, '5  offline', { dashed: true });

// Phase 3: a client that subscribes only now still learns the status,
// because the will was retained. Its arrows cross the subscriber's lane,
// so their pills sit between the subscriber's and its own lifelines.
msg(d, late, brk, 654, '6  SUBSCRIBE', { lx: 592 });
msg(d, brk, late, 700, '7  offline (retained)', { dashed: true, lx: 592 });

// The other way to stop: a clean disconnect() discards the will.
d.bar({ x: 16, y: 772, w: 768, h: 64, role: 'support', iconName: 'info', title: 'A clean disconnect() discards the will: nothing is published', line: 'A dropped network is noticed after 1.5 × the keep-alive (paho’s default: 60 s), then the will goes out.' });

d.write(import.meta.url);
