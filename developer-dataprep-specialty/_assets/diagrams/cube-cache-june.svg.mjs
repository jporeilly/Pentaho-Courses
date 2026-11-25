// 10: why June is in the mart but not in the report, and what the refresh
// changes. Facts: parts 4 to 6 (May 484,036.37; 3,004 lines after the June
// load; the report unchanged; Jun 34,141.27 after the refresh) and the
// cache note in part 6 (no SQL reaches MySQL on the second look).
//
// Run from this folder:   node cube-cache-june.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const BW = 220, BH = 78, X = [32, 292, 552, 812], Y = [66, 172, 278];
const d = new Diagram(1064, 388);
const HEAD = [['browser', 'chart-column', '1. Open the report'], ['engine', 'list-ordered', '2. Load June'], ['reject', 'chart-column', '3. Open it again'], ['write', 'refresh-cw', '4. Refresh, open again']];
HEAD.forEach(([role, iconName, title], i) => d.panel({ x: X[i] - 14, y: 16, w: BW + 28, h: d.h - 32, role, iconName, title }));
const col = (i, report, cache, fact) => [
  d.box({ x: X[i], y: Y[0], w: BW, h: BH, iconName: 'chart-column', title: 'Report', ...report }),
  d.box({ x: X[i], y: Y[1], w: BW, h: BH, role: 'server', iconName: 'boxes', title: 'Mondrian cache', ...cache }),
  d.box({ x: X[i], y: Y[2], w: BW, h: BH, iconName: 'table-2', title: 'mart_fact_sales', ...fact }),
];
const c = [
  col(0, { role: 'browser', lines: ['2005 ends with May,', '484,036.37'] }, { lines: ['filled: January', 'to May'] }, { role: 'store', lines: ['2,996 lines,', 'to May'] }),
  col(1, { role: 'off', lines: ['closed'] }, { lines: ['not told: still', 'January to May'] }, { role: 'store', lines: ['3,004 lines,', 'to June'] }),
  col(2, { role: 'reject', lines: ['still ends', 'with May'] }, { lines: ['answers alone,', 'no SQL is sent'] }, { role: 'off', lines: ['has June,', 'not read'] }),
  col(3, { role: 'write', lines: ['ends with June,', '34,141.27'] }, { lines: ['emptied, then', 'filled again'] }, { role: 'store', lines: ['read again:', '3,004 lines'] }),
];
c.forEach(([r, m, f], i) => {
  if (i !== 1) d.arrow({ x1: m.cx, y1: m.y, x2: r.cx, y2: r.b + 3, straight: true });
  if (i === 0 || i === 3) d.arrow({ x1: f.cx, y1: f.y, x2: m.cx, y2: m.b + 3, straight: true });
});
d.write(import.meta.url);
