// A Carte cluster: one master and four slave servers between the source
// data and the target database. It is the figure in the "3. Carte
// Server" tab of 03-installation-getting-started-components/guide.md,
// and redraws the earlier Mermaid figure carte_cluster.png in the kit's
// style, with the same content. The layout and colors follow the
// Developer DI Practitioner course's own carte-cluster diagram
// (courses/developer-di-practitioner/_assets/diagrams/carte-cluster.svg.mjs),
// narrowed from 892 to 800 wide so it shows at its own size.
//
// Facts it encodes, and where each comes from:
//   - Lesson 03, "Carte Server": Carte runs and monitors transformations
//     and jobs remotely, supports clustering for load balancing and
//     reports progress as it runs; it can be deployed as a master with
//     slave servers in a cluster.
//   - Carried over unchanged from the earlier figure: the master splits
//     the transformation, sends each slave its part and tracks progress;
//     the slaves are worker nodes working in parallel; the source data
//     is flat files, applications and databases; the slaves load the
//     target database.
//
// Icons: network the master, cpu a slave, file-stack the source data,
// database the target database (the same icons as the Developer course's
// diagram). This folder's README has the table.
//
// Run from this folder:   node carte-cluster.svg.mjs
// It writes carte-cluster.svg here and ../images/carte-cluster.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. Three columns: source, slaves, target; the master
// sits above the slaves.
const d = new Diagram(800, 492);
const BW = 210, BH = 96; // source and target boxes
const SW = 168, SH = 52; // one slave box

// The master: amber (it checks on the work), as in the Developer
// course's diagram, centered over the slaves.
const ma = d.box({ x: 275, y: 16, w: 250, h: BH, role: 'check', iconName: 'network', title: 'Master', lines: ['splits the transformation,', 'sends each slave its part,', 'tracks progress'] });

// The slaves: a violet panel (engines) holding four violet boxes.
const pn = d.panel({ x: 300, y: 160, w: 200, h: 316, role: 'engine', iconName: 'cpu', title: 'Slaves', sub: 'worker nodes, in parallel' });
const sl = [0, 1, 2, 3].map((i) => d.box({ x: 316, y: 216 + i * 64, w: SW, h: SH, role: 'engine', iconName: 'cpu', title: `Slave ${i + 1}` }));

// Source (blue, read from) and target (green, written to), level with
// the middle of the four slaves.
const mid = (sl[0].cy + sl[3].cy) / 2;
const src = d.box({ x: 16, y: mid - BH / 2, w: BW, h: BH, role: 'source', iconName: 'file-stack', title: 'Source data', lines: ['flat files, applications,', 'databases'] });
const tg = d.box({ x: 574, y: mid - BH / 2, w: BW, h: BH, role: 'store', iconName: 'database', title: 'Target database' });

// The master hands the slaves their parts (dashed: control, not rows);
// every slave reads from the source and loads the target.
d.arrow({ x1: ma.cx, y1: ma.b, x2: pn.cx, y2: pn.y - 3, vertical: true, dashed: true, label: 'its part' });
sl.forEach((s) => {
  d.arrow({ x1: src.r, y1: src.cy, x2: s.x - 3, y2: s.cy });
  d.arrow({ x1: s.r, y1: s.cy, x2: tg.x - 3, y2: tg.cy });
});

d.write(import.meta.url);
