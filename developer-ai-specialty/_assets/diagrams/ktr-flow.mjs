// The shared layout of the workshop diagrams that draw one transformation
// (Sentiment Analysis, Data Quality, Data Enrichment, Build the Knowledge
// Base, Answer Questions, Text Summarization). It is a helper, not a
// diagram, so it has no .svg of its own: each workshop's `<name>.svg.mjs`
// lists its own facts, calls `ktrFlow()` with its steps and what each one
// touches, and ends with `d.write(import.meta.url)`.
//
// Layout: the transformation's steps, top to bottom, in one blue panel
// named after the .ktr file, each hop a straight arrow down. Beside a
// step, on the right, the one thing it touches: the file it reads or
// writes, the model it calls, the field it adds. Every step box is the
// same size, and so is every box on the right, each level with its step,
// so the arrows between them run level.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

export const W = 800;
export const PX = 16, PW = 316, BX = PX + 12, BW = PW - 24, BH = 64, PITCH = 84, TOP = 72;
export const RX = 372, RW = W - 16 - RX;
export const stepY = (i, top = TOP) => top + i * PITCH;

/**
 * Draw a transformation and what its steps touch.
 *   file    the .ktr name, shown under the panel title
 *   steps   [{ role, iconName, title, lines }] top to bottom
 *   side    [{ at, role, iconName, title, lines, link }] boxes on the right,
 *           level with step `at`. `link`: 'in' (the box feeds the step),
 *           'out' (the step writes the box), 'call' (a request and its
 *           reply), 'sets' (dashed: what the step adds or builds).
 *   extra   height to add below the panel, for a diagram's own parts
 * Returns the diagram, the step boxes and the side boxes.
 */
export function ktrFlow({ file, steps, side = [], extra = 0, top = TOP, title = 'Pentaho Data Integration' }) {
  const last = stepY(steps.length - 1, top) + BH;
  const d = new Diagram(W, last + 16 + extra);
  d.panel({ x: PX, y: 16, w: PW, h: last, role: 'tool', iconName: 'workflow', title, sub: file });
  const box = steps.map((s, i) => d.box({ x: BX, y: stepY(i, top), w: BW, h: BH, role: s.role, iconName: s.iconName, title: s.title, lines: s.lines }));
  box.reduce((a, b) => {
    d.arrow({ x1: a.cx, y1: a.b, x2: b.cx, y2: b.y - 3, straight: true });
    return b;
  });
  const sideBox = side.map((s) => {
    const st = box[s.at];
    const b = d.box({ x: RX, y: st.y, w: RW, h: BH, role: s.role, iconName: s.iconName, title: s.title, lines: s.lines });
    if (s.link === 'in') d.arrow({ x1: b.x, y1: b.cy, x2: st.r + 3, y2: st.cy, straight: true });
    if (s.link === 'out') d.arrow({ x1: st.r, y1: st.cy, x2: b.x - 3, y2: b.cy, straight: true });
    if (s.link === 'sets') d.arrow({ x1: st.r, y1: st.cy, x2: b.x - 3, y2: b.cy, straight: true, dashed: true });
    if (s.link === 'call') {
      d.arrow({ x1: st.r, y1: st.cy - 9, x2: b.x - 3, y2: b.cy - 9, straight: true });
      d.arrow({ x1: b.x, y1: b.cy + 9, x2: st.r + 3, y2: st.cy + 9, straight: true, dashed: true });
    }
    return b;
  });
  return { d, box, side: sideBox, bottom: last + 16 };
}
