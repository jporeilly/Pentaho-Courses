// Pentaho Data Integration as client and server: Spoon on the desktop
// sends transformations and jobs to the Pentaho Server, whose Data
// Integration side keeps them in a system database; Pan, Kitchen and
// Carte run work without the server. It is the figure in the "Data
// Integration" tab of 03-installation-getting-started-components/guide.md,
// and redraws the earlier Mermaid figure 1794309012312.png in the kit's
// style, with the same content.
//
// Facts it encodes, and where each comes from:
//   - Lesson 03, "Data Integration" tab: Spoon is the graphical client;
//     its parts are the Designer, the Scheduler (which connects to the
//     Quartz scheduler on the server), the Repository Browser and DB
//     Explorer. The earlier figure also put an "Engine" in Spoon's box;
//     no lesson lists one in Spoon, so it is left out. The server's five
//     parts (engine, repository, Quartz scheduler, security, monitoring)
//     are carried over unchanged from the earlier figure.
//   - Lesson 03, "Pentaho Server" tab: the server's parts include the
//     Data Integration Server (orchestration and scheduling of ETL),
//     Security and the Repository; "Data Integration" tab: the
//     repository is an Apache Jackrabbit content repository on a
//     supported database (here, the system database).
//   - Lesson 03, "Carte Server" and "APIs" tabs: Carte runs
//     transformations and jobs remotely; Kitchen runs jobs (.kjb) and
//     Pan runs transformations (.ktr) from the command line.
//
// Icons: workflow Spoon, square-terminal Pan, Kitchen and Carte (run
// from the command line), server the Pentaho Server, database the
// system database. This folder's README has the table.
//
// Run from this folder:   node pdi-client-server.svg.mjs
// It writes pdi-client-server.svg here and
// ../images/pdi-client-server.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, the reading column.
const W = 800;
const d = new Diagram(W, 384);

// ── Top: Pentaho Data Integration, the client side ────────────────────
// Slate panel (a group); Spoon a blue box (a tool you use), the
// standalone runners a blue box beside it.
d.panel({ x: 16, y: 16, w: W - 32, h: 132, role: 'support', iconName: 'shuffle', title: 'Pentaho Data Integration' });
const spoon = d.box({ x: 32, y: 56, w: 360, h: 76, role: 'tool', iconName: 'workflow', title: 'Client tool: Spoon', lines: ['Designer, Scheduler,', 'Repository Browser, DB Explorer'] });
d.box({ x: 408, y: 56, w: W - 48 - 408 + 16, h: 76, role: 'tool', iconName: 'square-terminal', title: 'Standalone: Pan, Kitchen, Carte', lines: ['run work without the server'] });

// ── Bottom left: the Pentaho Server's Data Integration topology ───────
// Violet panel (the server) holding its five parts as white,
// title-only boxes: three on the first row, two on the second.
const SX = 16, SW = 520;
const srv = d.panel({ x: SX, y: 196, w: SW, h: 172, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'Data Integration topology' });
const IW = (SW - 24 - 24) / 3; // three boxes per row, 12px gaps
const part = (col, row, title) => d.box({ x: SX + 12 + col * (IW + 12), y: 252 + row * 58, w: IW, h: 46, role: 'result', title, center: true });
part(0, 0, 'Engine');
part(1, 0, 'Repository');
part(2, 0, 'Quartz scheduler');
part(0, 1, 'Security');
part(1, 1, 'Monitoring');

// ── Bottom right: the system database ─────────────────────────────────
// Green (a store), level with the server panel's middle.
const db = d.box({ x: 584, y: srv.cy - 32, w: W - 16 - 584, h: 64, role: 'store', iconName: 'database', title: 'System database' });

// ── Arrows ────────────────────────────────────────────────────────────
// Spoon to the server: the files it sends, in a pill on the line.
d.arrow({ x1: spoon.cx, y1: spoon.b, x2: spoon.cx, y2: srv.y - 3, straight: true, label: '.ktr, .kjb', ly: 172 });
// The server to its system database.
d.arrow({ x1: srv.r, y1: db.cy, x2: db.x - 3, y2: db.cy, straight: true });

d.write(import.meta.url);
