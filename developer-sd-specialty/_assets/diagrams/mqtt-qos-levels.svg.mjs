// MQTT's three Quality of Service levels as three small sequence
// diagrams side by side, each with a Sender lane (the publisher) and a
// Receiver lane (the broker). It is the figure in 02-mqtt/guide.md, in
// the "Quality of Service (QoS)" tab, after the three bullets.
//
// Facts it encodes, and where each comes from (02-mqtt, the QoS tab,
// unless stated):
//   - QoS is the delivery guarantee agreed between sender and receiver.
//   - QoS 0, at most once: fire-and-forget, sent once, may be lost;
//     lowest overhead.
//   - QoS 1, at least once: confirmed with PUBACK and re-sent if needed,
//     so it always arrives but may be duplicated.
//   - QoS 2, exactly once: a four-step handshake, PUBLISH, PUBREC, PUBREL,
//     PUBCOMP, guarantees a single delivery at the most overhead. The
//     packet names are in the bullet, added with this diagram.
//   - 03-mqtt-emqx part 1's note repeats the trade-off: 0 lowest latency
//     and can lose messages, 1 can deliver duplicates, 2 the highest
//     overhead.
//   The sender is drawn as the publisher and the receiver as the broker,
//   as in the labs, where sensor.py and the MQTT producer publish to the
//   broker (04-mqtt-hivemq part 2, 03-mqtt-emqx part 1).
//
// Colors (see README.md): slate the sender (a publisher), violet the
// receiver (the broker), white the result under each level. Replies are
// dashed.
//
// Run from this folder:   node mqtt-qos-levels.svg.mjs
// It writes mqtt-qos-levels.svg here and ../images/mqtt-qos-levels.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

// Canvas: 800 wide, three groups of 248 with 12px gaps. Each group has a
// heading band on top, two lanes of 118 under it, and a result box under
// the lanes.
const d = new Diagram(800, 448);
const GX = [16, 276, 536]; // group x
const GW = 248, LW = 118; // group width, lane width
const TOP = 60, H = 284; // lanes' top and height
const Y = (i) => 128 + i * 46; // height of the i-th message or note

// A group: its heading band, its two lanes, and its result box. Returns
// the two lanes, for msg() and note().
function group(x, heading, result) {
  // The heading band, on the panel layer.
  d.under.push(`<rect x="${x}" y="16" width="${GW}" height="32" rx="8" fill="#ffffff" stroke="#475569" stroke-width="1.4"/>`);
  d.under.push(`<text x="${x + GW / 2}" y="37" text-anchor="middle" font-size="13.5" font-weight="700" fill="#334155">${heading}</text>`);
  const [s, r] = lanes(d, {
    top: TOP, height: H, cols: [
      { x, w: LW, role: 'support', iconName: 'send', title: 'Sender', sub: 'publisher' },
      { x: x + GW - LW, w: LW, role: 'server', iconName: 'radio-tower', title: 'Receiver', sub: 'broker' },
    ],
  });
  // What the level guarantees, under its two lanes.
  d.box({ x, y: TOP + H + 16, w: GW, h: 72, role: 'result', title: result[0], lines: result.slice(1), center: true });
  return [s, r];
}

// QoS 0: one PUBLISH, no reply.
{
  const [s, r] = group(GX[0], 'QoS 0: at most once', ['Fire-and-forget', 'lowest overhead;', 'a message may be lost']);
  msg(d, s, r, Y(0), 'PUBLISH');
  note(d, s, Y(1), ['no reply:', 'sent once']);
}

// QoS 1: PUBLISH, and while no PUBACK has come back the sender sends it
// again, so the broker can receive the same message twice; then PUBACK.
{
  const [s, r] = group(GX[1], 'QoS 1: at least once', ['Always arrives', 'confirmed by PUBACK;', 'may be duplicated']);
  msg(d, s, r, Y(0), '1  PUBLISH');
  note(d, s, Y(1), ['no PUBACK yet:', 're-send']);
  msg(d, s, r, Y(2), '2  PUBLISH');
  note(d, r, Y(3), ['a duplicate']);
  msg(d, r, s, Y(4), '3  PUBACK', { dashed: true });
}

// QoS 2: the four-step handshake.
{
  const [s, r] = group(GX[2], 'QoS 2: exactly once', ['Delivered once', 'four-step handshake;', 'the most overhead']);
  msg(d, s, r, Y(0), '1  PUBLISH');
  msg(d, r, s, Y(1), '2  PUBREC', { dashed: true });
  msg(d, s, r, Y(2), '3  PUBREL');
  msg(d, r, s, Y(3), '4  PUBCOMP', { dashed: true });
}

d.write(import.meta.url);
