// The shared layout of the Documents to Text workshop diagrams (HTML
// Parser, Apache Tika): several small transformations, one blue panel per
// .ktr file, one lane per flow in it, read left to right: where the rows
// come from, the GenAI step that extracts the text, and the file the flow
// writes. It is a helper, not a diagram, so it has no .svg of its own:
// each workshop's `<name>.svg.mjs` lists its own facts, calls `ktrLanes()`
// and ends with `d.write(import.meta.url)`.
//
// Every box in a column is the same size, and every lane the same height,
// so the hops run level.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

export const W = 800;
const BH = 76, LANE = BH + 16, HEAD = 56, GAP = 16, X0 = 28, HOP = 24;

/**
 *   cols    the three column widths; with the two hops they fill 744
 *   groups  [{ file, sub, lanes: [[from, step, to], ...] }], each box
 *           { role, iconName, title, lines }
 */
export function ktrLanes({ cols, groups }) {
  const heights = groups.map((g) => HEAD + g.lanes.length * LANE - 16 + 12);
  const d = new Diagram(W, 16 + heights.reduce((a, h) => a + h + GAP, 0));
  const xs = [X0, X0 + cols[0] + HOP, X0 + cols[0] + cols[1] + 2 * HOP];
  let y = 16;
  groups.forEach((g, gi) => {
    d.panel({ x: 16, y, w: W - 32, h: heights[gi], role: 'tool', iconName: 'workflow', title: g.file, sub: g.sub });
    g.lanes.forEach((lane, li) => {
      const ly = y + HEAD + li * LANE;
      const b = lane.map((s, i) => d.box({ x: xs[i], y: ly, w: cols[i], h: BH, ...s }));
      d.arrow({ x1: b[0].r, y1: b[0].cy, x2: b[1].x - 3, y2: b[1].cy, straight: true });
      d.arrow({ x1: b[1].r, y1: b[1].cy, x2: b[2].x - 3, y2: b[2].cy, straight: true });
    });
    y += heights[gi] + GAP;
  });
  return d;
}
