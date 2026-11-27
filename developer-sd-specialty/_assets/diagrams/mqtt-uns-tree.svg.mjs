// A Unified Namespace topic tree, and what two wildcard subscriptions take
// from it. It is the figure in 02-mqtt/guide.md, tab "Unified Namespace and
// Sparkplug".
//
// Facts it encodes:
//   - The HiveMQ workshop's topics: acme/plant1/line1/robot1/telemetry and
//     acme/plant1/line1/robot1/state (04-mqtt-hivemq parts 2 and 5).
//   - The levels follow ISA-95: enterprise, site, line, device, message.
//   - + matches one level, # every level below (02-mqtt, Topics and
//     wildcards): acme/plant1/line1/+/telemetry takes the three
//     telemetry topics on line1, acme/plant1/line1/robot1/# both of
//     robot1's topics. The exam's sd-m2-q7 uses the same tree.
//
// Colors (see README.md): slate the levels of the tree, blue the topics
// acme/plant1/line1/+/telemetry takes, white the other leaves, amber the
// panel round what acme/plant1/line1/robot1/# takes.
//
// Run from this folder:   node mqtt-uns-tree.svg.mjs
// It writes mqtt-uns-tree.svg here and ../images/mqtt-uns-tree.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(940, 660);
const W = 150, H = 40;
const X = [16, 206, 396, 586, 776]; // one column per level
const ROW = 52; // distance between leaf rows
const TOP = 124; // first leaf row, under the panel's header

// Level names over the columns.
['enterprise', 'site', 'line', 'device', 'message'].forEach((t, i) => d.pill(X[i] + W / 2, 30, t));

// robot1's subtree is what acme/plant1/line1/robot1/# takes.
d.panel({ x: X[3] - 10, y: TOP - 60, w: X[4] + W - X[3] + 20, h: 2 * ROW + 58, role: 'check', iconName: 'inbox', title: 'acme/plant1/line1/robot1/#' });

const leaf = (i, msg) => d.box({ x: X[4], y: TOP + i * ROW, w: W, h: H, role: msg === 'telemetry' ? 'tool' : 'result', title: msg, center: true });
const node = (col, y, title) => d.box({ x: X[col], y, w: W, h: H, role: 'support', title, center: true });
const link = (a, b) => {
  const mx = a.r + (b.x - a.r) / 2;
  d.arrow({ x1: a.r, y1: a.cy, x2: mx, y2: a.cy, straight: true, head: false });
  d.arrow({ x1: mx, y1: a.cy, x2: mx, y2: b.cy, straight: true, head: false });
  d.arrow({ x1: mx, y1: b.cy, x2: b.x - 1, y2: b.cy, straight: true, head: false });
};

const devices = ['robot1', 'robot2', 'press1'];
const leaves = [];
const devs = devices.map((name, k) => {
  const t = leaf(2 * k, 'telemetry');
  const s = leaf(2 * k + 1, 'state');
  leaves.push(t, s);
  const dev = node(3, (t.cy + s.cy) / 2 - H / 2, name);
  link(dev, t);
  link(dev, s);
  return dev;
});
const line1 = node(2, devs[1].y, 'line1');
devs.forEach((dv) => link(line1, dv));
const line2 = node(2, TOP + 6 * ROW + 10, 'line2');
const more = d.box({ x: X[3], y: line2.y, w: W, h: H, role: 'off', title: '…', center: true });
link(line2, more);
const plant1 = node(1, (line1.y + line2.y) / 2, 'plant1');
link(plant1, line1);
link(plant1, line2);
const acme = node(0, plant1.y, 'acme');
link(acme, plant1);

// The two subscriptions.
d.bar({ x: 16, y: 530, w: 908, h: 52, role: 'tool', iconName: 'inbox', title: 'acme/plant1/line1/+/telemetry', line: 'one level matched by +: the telemetry of every device on line1, and none of their state topics (blue)' });
d.bar({ x: 16, y: 592, w: 908, h: 52, role: 'check', iconName: 'inbox', title: 'acme/plant1/line1/robot1/#', line: 'every level below robot1: its telemetry and its state (the amber panel)' });

d.write(import.meta.url);
