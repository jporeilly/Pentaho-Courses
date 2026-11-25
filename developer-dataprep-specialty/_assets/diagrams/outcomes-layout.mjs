// The layout three diagrams share: one source, one step that looks each
// row up, the cases it finds, and what it does in each. A helper, not a
// diagram: customer-four-outcomes, product-overwrite and
// safe-to-run-twice each give only their own facts.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const BH = 76, PITCH = 92, TOP = 66;

/** `rows` is a list of [found box, action box]; `net` an optional bar. */
export function outcomes(url, { icon, title, source, step, rows, net }) {
  const n = rows.length;
  const d = new Diagram(1056, TOP + n * PITCH - 16 + (net ? 102 : 32));
  d.panel({ x: 16, y: 16, w: d.w - 32, h: d.h - 32, role: 'support', iconName: icon, title });
  const mid = TOP + ((n - 1) * PITCH) / 2;
  const s = d.box({ x: 36, y: mid, w: 204, h: BH, role: 'source', ...source });
  const l = d.box({ x: 280, y: mid, w: 220, h: BH, role: 'join', ...step });
  d.arrow({ x1: s.r, y1: s.cy, x2: l.x - 3, y2: l.cy, straight: true });
  rows.forEach(([found, act], i) => {
    const y = TOP + i * PITCH;
    const f = d.box({ x: 552, y, w: 226, h: BH, role: 'check', ...found });
    const a = d.box({ x: 818, y, w: 206, h: BH, ...act });
    d.arrow({ x1: l.r, y1: l.cy + (i - (n - 1) / 2) * 15, x2: f.x - 3, y2: f.cy });
    d.arrow({ x1: f.r, y1: f.cy, x2: a.x - 3, y2: a.cy, straight: true });
  });
  if (net) d.bar({ x: 36, y: TOP + n * PITCH, w: d.w - 72, h: 58, ...net });
  d.write(url);
}
