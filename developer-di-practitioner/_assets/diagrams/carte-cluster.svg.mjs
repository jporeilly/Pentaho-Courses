// Review Scalability: a Carte cluster, a master and its slave servers.
// Run: node carte-cluster.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(892, 492);
const BW = 240, BH = 96, SW = 188, SH = 52;

const ma = d.box({ x: 321, y: 16, w: 250, h: BH, role: 'check', iconName: 'network', title: 'Master', lines: ['splits the transformation,', 'sends each slave its part,', 'tracks progress'] });
const pn = d.panel({ x: 336, y: 160, w: 220, h: 316, role: 'engine', iconName: 'cpu', title: 'Slaves', sub: 'worker nodes, in parallel' });
const sl = [0, 1, 2, 3].map((i) => d.box({ x: 352, y: 216 + i * 64, w: SW, h: SH, role: 'engine', iconName: 'cpu', title: `Slave ${i + 1}` }));
const mid = (sl[0].cy + sl[3].cy) / 2;
const src = d.box({ x: 16, y: mid - BH / 2, w: BW, h: BH, role: 'source', iconName: 'file-stack', title: 'Source data', lines: ['flat files, applications,', 'databases'] });
const tg = d.box({ x: 636, y: mid - BH / 2, w: BW, h: BH, role: 'store', iconName: 'database', title: 'Target database' });

d.arrow({ x1: ma.cx, y1: ma.b, x2: pn.cx, y2: pn.y - 3, vertical: true, dashed: true, label: 'its part' });
sl.forEach((s) => {
  d.arrow({ x1: src.r, y1: src.cy, x2: s.x - 3, y2: s.cy });
  d.arrow({ x1: s.r, y1: s.cy, x2: tg.x - 3, y2: tg.cy });
});

d.write(import.meta.url);
