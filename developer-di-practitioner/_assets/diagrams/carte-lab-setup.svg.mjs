// Run Configurations: the lab's three Carte servers on this machine, and
// where the two run configurations send tr_hello_world.ktr. It
// complements carte-cluster (Review Scalability), which shows a cluster
// in general; this one shows the lab's own names and ports.
//
// Every fact comes from 36-mod5-run-configurations/guide.md:
//   - Three Carte servers on localhost, each started in its own terminal
//     with Carte.bat: Master on port 12000, Slave A on 12100, Slave B on
//     12200. Spoon registers each as a slave server; Master has
//     "Is the master" selected.
//   - Run configuration "Master" (Location Master): Spoon posts the whole
//     transformation over HTTP to the Carte on port 12000
//     (/kettle/registerTrans), which runs it; gr_hello-world writes 10
//     rows and Dummy (do nothing) reads 10. The slaves take no part.
//   - Run configuration "Clustered" (Location Clustered) with cluster
//     schema "Pentaho" (port 40000; Master, Slave A, Slave B): Spoon, not
//     the master, splits the transformation. gr_hello-world is clustered
//     (Cx2) and runs on Slave A and Slave B; Dummy (do nothing) is not
//     clustered and runs on the master. Spoon posts each generated
//     transformation to its own Carte over HTTP; the rows move between
//     the nodes over TCP sockets on ports counted up from 40000. Each
//     slave outputs 10 rows, so the master's Dummy reads 20.
//
// Run from this folder:   node carte-lab-setup.svg.mjs
// It writes carte-lab-setup.svg here and ../images/carte-lab-setup.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: three columns of same-size boxes, Spoon on the left,
// the two slaves in the middle, the master on the right. The 170px gaps
// leave room for the arrow labels between the columns.
const d = new Diagram(1154, 592);
const BW = 250, BH = 72;
const COL = [32, 452, 872]; // Spoon, the slaves, the master

/**
 * One run configuration: a panel with Spoon, Slave A above Slave B, and
 * the master. Spoon and the master sit at the panel's middle height, in
 * line with the 48px gap between the two slaves, so the Spoon-to-master
 * arrow runs straight through that gap. `o` holds the panel's title and
 * each box's role and detail lines. Returns the four boxes.
 */
function scene(y, o) {
  d.panel({ x: 16, y, w: 1122, h: 272, role: 'support', title: o.title, sub: o.sub });
  const top = y + 64; // first row, under the panel's two-line title strip
  const sa = d.box({ x: COL[1], y: top, w: BW, h: BH, role: o.slaveRole, iconName: 'cpu', title: 'Slave A  :12100', lines: ['Carte.bat localhost 12100', o.slaveLine] });
  const sb = d.box({ x: COL[1], y: top + BH + 48, w: BW, h: BH, role: o.slaveRole, iconName: 'cpu', title: 'Slave B  :12200', lines: ['Carte.bat localhost 12200', o.slaveLine] });
  const mid = (sa.cy + sb.cy) / 2; // the middle of the gap between the slaves
  const sp = d.box({ x: COL[0], y: mid - BH / 2, w: BW, h: BH, role: 'tool', iconName: 'workflow', title: 'Spoon', lines: o.spoonLines });
  const ma = d.box({ x: COL[2], y: mid - BH / 2, w: BW, h: BH, role: 'check', iconName: 'network', title: 'Master  :12000', lines: ['Carte.bat localhost 12000', o.masterLine] });
  return { sp, sa, sb, ma };
}

// ── Run configuration Master ─────────────────────────────────────────
// The slaves are drawn in stone ("not involved"): they are running, but
// this run configuration sends them nothing.
const m = scene(16, {
  title: 'Run configuration Master: one Carte server runs it all',
  sub: 'Location Master; the slaves keep running but take no part',
  spoonLines: ['run configuration Master', 'tr_hello_world.ktr'],
  slaveRole: 'off', slaveLine: 'not used',
  masterLine: 'runs it all: 10 rows',
});
// The one hop: the whole transformation, straight through the gap.
d.arrow({ x1: m.sp.r, y1: m.sp.cy, x2: m.ma.x - 3, y2: m.ma.cy, straight: true, label: 'the whole transformation, over HTTP' });

// ── Run configuration Clustered ──────────────────────────────────────
// Spoon splits the transformation and posts one generated piece to each
// node (solid arrows); the slaves then send their rows to the master's
// Dummy step over sockets (dashed arrows).
const c = scene(304, {
  title: 'Run configuration Clustered: cluster schema Pentaho',
  sub: 'Spoon splits the transformation and posts each piece to its node',
  spoonLines: ['run configuration Clustered,', 'gr_hello-world set to Cx2'],
  slaveRole: 'engine', slaveLine: 'gr_hello-world: 10 rows',
  masterLine: 'Dummy (do nothing): 20 rows',
});
// Spoon to each node: the generated transformations, over HTTP. The two
// slave arrows leave Spoon a little above and below its middle, so they
// do not start on top of the straight arrow to the master.
d.arrow({ x1: c.sp.r, y1: c.sp.cy - 14, x2: c.sa.x - 3, y2: c.sa.cy });
d.arrow({ x1: c.sp.r, y1: c.sp.cy + 14, x2: c.sb.x - 3, y2: c.sb.cy });
d.arrow({ x1: c.sp.r, y1: c.sp.cy, x2: c.ma.x - 3, y2: c.ma.cy, straight: true, label: 'a generated .ktr each, over HTTP' });
// Each slave's rows to the master, arriving above and below the middle
// arrow. A pill on each curve would hide most of it in this 170px gap,
// so one shared label sits in the gap above Slave A's arrow, clear of
// both curves: it names what the two dashed arrows carry.
d.arrow({ x1: c.sa.r, y1: c.sa.cy, x2: c.ma.x - 3, y2: c.ma.cy - 18, dashed: true });
d.arrow({ x1: c.sb.r, y1: c.sb.cy, x2: c.ma.x - 3, y2: c.ma.cy + 18, dashed: true });
d.pill((c.sa.r + c.ma.x) / 2, c.sa.y + 6, ['rows over sockets,', 'ports from 40000']);

d.write(import.meta.url);
