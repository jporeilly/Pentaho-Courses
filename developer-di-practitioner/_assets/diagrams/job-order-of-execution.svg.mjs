// Jobs: the order a job runs its entries in, by default (one thread,
// depth-first) and with Run Next Entries in Parallel on Start.
// Run: node job-order-of-execution.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1104, 476);
const BW = 230, BH = 64, COL = [32, 302, 572, 842];

const flow = (y, title, dashed, [s, a, c, w, b]) => {
  d.panel({ x: 16, y, w: 1072, h: 214, role: 'support', iconName: dashed ? 'git-fork' : 'list-ordered', title });
  const r1 = y + 56, r2 = r1 + BH + 14;
  const st = d.box({ x: COL[0], y: r1, w: BW, h: BH, role: 'tool', iconName: 'play', title: 'Start', lines: [s] });
  const ta = d.box({ x: COL[1], y: r1, w: BW, h: BH, role: 'engine', iconName: 'shuffle', title: 'Transformation A', lines: [a] });
  const tc = d.box({ x: COL[2], y: r1, w: BW, h: BH, role: 'engine', iconName: 'shuffle', title: 'Transformation C', lines: [c] });
  const ok = d.box({ x: COL[3], y: r1, w: BW, h: BH, role: 'write', iconName: 'circle-check', title: 'Success', lines: [w] });
  const tb = d.box({ x: COL[1], y: r2, w: BW, h: BH, role: 'engine', iconName: 'shuffle', title: 'Transformation B', lines: [b] });
  d.arrow({ x1: st.r, y1: st.cy, x2: ta.x - 3, y2: ta.cy, dashed });
  d.arrow({ x1: st.r, y1: st.cy + 12, x2: tb.x - 3, y2: tb.cy, dashed });
  d.arrow({ x1: ta.r, y1: ta.cy, x2: tc.x - 3, y2: tc.cy });
  d.arrow({ x1: tc.r, y1: tc.cy, x2: ok.x - 3, y2: ok.cy });
};

flow(16, 'Default: one thread, depth-first', false, ['one at a time', '1st: the first hop', '2nd', '3rd', '4th: after the whole branch']);
flow(246, 'Run Next Entries in Parallel on Start: two threads', true, ['parallel', 'thread 1', 'waits for A', 'waits for C', 'thread 2, same time as A']);

d.write(import.meta.url);
