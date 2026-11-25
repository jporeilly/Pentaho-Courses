// What the whole course builds, at a glance: not the steps but the end
// state. An Ubuntu server with the pentaho user and Java 21 runs the
// licensed Pentaho Server 11 on Tomcat 10, patched to 11.0.0.3-312,
// with its server plugins, its hardening and the User Console, and
// keeps its repository in three PostgreSQL 17 databases; a designer's
// Ubuntu desktop has the client tools, Spoon with its EE Kettle
// plugins, and works against that server. It is the figure in "2. What
// You'll Achieve" of 04-installation-archive-overview/guide.md, and the
// figure under "What you'll build" on the Sandbox Installation page.
// archive-installation-module shows the workshops that build it, and
// archive-install-flow the detailed stages of 05 and 06.
//
// Facts it encodes, and the lesson and lines each comes from (line
// numbers as of this diagram's commit):
//   The server host
//   - Ubuntu 24.04 LTS: 04 "4. Prerequisites" (41); 05 (37-38).
//   - The pentaho installation user: 05 "2. Create the Pentaho
//     Installation User" (94-124).
//   - Java 21, named by PENTAHO_JAVA_HOME: 05 "3. Install Java 21" and
//     "4. Set PENTAHO_JAVA_HOME" (128, 202, 216).
//   The Pentaho Server
//   - Pentaho Server 11 on Tomcat 10, licensed: 04 "2. What You'll
//     Achieve" (28, 32); 06 "6. License Manager" (632-685).
//   - Under /opt/pentaho/server/pentaho-server: 06 (47, 99); the
//     manifest's server-unpacked check.
//   - Patched to 11.0.0.3-312: 09 intro (7), checkpoint
//     pentaho-platform-core-11.0.0.3-312.jar (206).
//   - The User Console at http://localhost:8080/pentaho: 06 (512);
//     HTTPS on 8443: 08 "Change to HTTPS" (148-219).
//   - Server plugins: 07 (12-13): Analyzer, Interactive Reporting,
//     Dashboard Designer and Semantic Model Editor installed from the
//     Plugin Manager; Pipeline Designer, the Scheduler and the Carte
//     API plugin ship in the archive (302).
//   - Hardened and tuned, lesson 08's tasks: the Server header (44),
//     the shutdown port (91), HTTPS (148), the context path and HTTP
//     port (243, 319), the session timeout (372), the sample data
//     (533), the Home page widgets (592).
//   PostgreSQL 17
//   - PostgreSQL 17 on port 5432: 05 "5. Install PostgreSQL 17" (257,
//     396).
//   - jackrabbit (owner jcr_user), quartz (owner pentaho_user, the
//     qrtz6_ tables) and hibernate (owner hibuser, with the
//     pentaho_operations_mart and pentaho_dilogs schemas): 06 (254);
//     the server reaches them through the JNDI resources in Tomcat's
//     context.xml (256).
//   The designer's desktop
//   - A desktop session on Ubuntu 24.04 LTS, the full Java 21 runtime
//     (openjdk-21-jre), the tools under ~/Pentaho/design-tools: 10
//     (12, 19, 53-57).
//   - Spoon (Pentaho Data Integration), Metadata Editor, Schema
//     Workbench, Aggregation Designer and Report Designer: 10 (7).
//   - EE Kettle plugins, from the Plugin Manager in Spoon: 11 (7-13).
//   - Spoon saves transformations (.ktr) and jobs (.kjb) to the
//     Pentaho Server: 03 (60); Report Designer publishes .prpt reports
//     to it: 10 (310).
//
// Colors by role: slate the host, violet the server and its plugins,
// amber the User Console, blue the hardening (hand edits) and the
// designer's desktop and tools, green PostgreSQL and its databases.
// Icons: monitor the Ubuntu host, server the Pentaho Server,
// layout-dashboard the User Console, puzzle the plugins, shield-check
// the hardening, database PostgreSQL, folder-tree Jackrabbit,
// calendar-clock Quartz, history Hibernate, laptop the desktop,
// workflow Spoon, layers the other design tools. This folder's README
// has the table.
//
// Run from this folder:   node installation-what-you-build.svg.mjs
// It writes installation-what-you-build.svg here and
// ../images/installation-what-you-build.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// ── Layout ────────────────────────────────────────────────────────────
// Two full-width panels, the server host on top and the designer's
// desktop underneath, so the desktop's arrows go straight up into the
// server. In the host: the Pentaho Server panel on the left, its parts
// stacked in it, and the PostgreSQL panel on the right.
const W = 800;
const M = 16;
const STRIP = 44 + 14;                 // a panel strip with a sub-title, plus padding
const BH = 64, PITCH = BH + 10;        // the boxes in the two inner panels
const HOST_Y = M;
const IN_Y = HOST_Y + STRIP;           // the inner panels' top
const SRV_X = M + 12, SRV_W = 500;     // the Pentaho Server panel
const PG_X = SRV_X + SRV_W + 20, PG_W = W - M - 12 - (SRV_X + SRV_W + 20);
const IN_H = STRIP + 3 * PITCH - 10 + 12;
const HOST_H = STRIP + IN_H + 14;
const DESK_Y = HOST_Y + HOST_H + 44;   // room for the arrows up
const DBH = 84;                        // the desktop's boxes: room for three lines
const DESK_H = STRIP + DBH + 14;
const d = new Diagram(W, DESK_Y + DESK_H + M);

// ── The server host ───────────────────────────────────────────────────
d.panel({ x: M, y: HOST_Y, w: W - 2 * M, h: HOST_H, role: 'support', iconName: 'monitor', title: 'The server: Ubuntu 24.04 LTS', sub: 'the pentaho installation user · Java 21, named by PENTAHO_JAVA_HOME' });

// The Pentaho Server, and what it holds.
const srv = d.panel({ x: SRV_X, y: IN_Y, w: SRV_W, h: IN_H, role: 'server', iconName: 'server', title: 'Pentaho Server 11 on Tomcat 10', sub: 'licensed · patched to 11.0.0.3-312 · /opt/pentaho/server' });
const bx = SRV_X + 12, bw = SRV_W - 24;
const parts = [
  ['browser', 'layout-dashboard', 'User Console', ['http://localhost:8080/pentaho, and HTTPS on 8443']],
  ['server', 'puzzle', 'Server plugins', ['Analyzer, Interactive Reporting, Dashboard Designer,', 'Semantic Model Editor; Pipeline Designer, Scheduler, Carte']],
  ['tool', 'shield-check', 'Hardened and tuned', ['Server header, shutdown port, HTTPS, context path and port,', 'session timeout; sample data and Home widgets removed']],
];
parts.forEach(([role, iconName, title, lines], i) => d.box({ x: bx, y: IN_Y + STRIP + i * PITCH, w: bw, h: BH, role, iconName, title, lines }));

// PostgreSQL 17 and the three repository databases.
const pg = d.panel({ x: PG_X, y: IN_Y, w: PG_W, h: IN_H, role: 'store', iconName: 'database', title: 'PostgreSQL 17', sub: 'port 5432 · the repository' });
const dbs = [
  ['folder-tree', 'jackrabbit', ['content repository']],
  ['calendar-clock', 'quartz', ['the scheduler']],
  ['history', 'hibernate', ['+ Operations Mart', 'and logging schemas']],
];
dbs.forEach(([iconName, title, lines], i) => d.box({ x: PG_X + 12, y: IN_Y + STRIP + i * PITCH, w: PG_W - 24, h: BH, role: 'store', iconName, title, lines }));

// The server reaches its databases (through context.xml's JNDI
// resources): one arrow across the gap from strip to strip, so it
// reads as the server's link, not the User Console's.
d.arrow({ x1: srv.r, y1: IN_Y + 22, x2: pg.x - 3, y2: IN_Y + 22, straight: true });

// ── The designer's desktop ────────────────────────────────────────────
d.panel({ x: M, y: DESK_Y, w: W - 2 * M, h: DESK_H, role: 'tool', iconName: 'laptop', title: 'The designer\'s desktop: Ubuntu 24.04 LTS', sub: 'the full Java 21 runtime · the client tools in ~/Pentaho/design-tools' });
const TW = (W - 2 * M - 24 - 12) / 2;
const spoon = d.box({ x: M + 12, y: DESK_Y + STRIP, w: TW, h: DBH, role: 'tool', iconName: 'workflow', title: 'Spoon', lines: ['Pentaho Data Integration, with EE Kettle', 'plugins from its Plugin Manager; saves', '.ktr and .kjb files to the server'] });
const tools = d.box({ x: M + 12 + TW + 12, y: DESK_Y + STRIP, w: TW, h: DBH, role: 'tool', iconName: 'layers', title: 'Four more design tools', lines: ['Report Designer, which publishes .prpt reports', 'to the server; Metadata Editor, Schema', 'Workbench and Aggregation Designer'] });

// Up from the desktop panel's top edge, above each tool, into the
// Pentaho Server panel: Spoon at its own middle, the other tools at a
// point that is above the box and under the server panel (the
// PostgreSQL panel is to the right of it). They start at the panel's
// edge so they don't cross its title strip.
d.arrow({ x1: spoon.cx, y1: DESK_Y, x2: spoon.cx, y2: srv.b + 3, straight: true });
const upX = srv.r - 40;
d.arrow({ x1: upX, y1: DESK_Y, x2: upX, y2: srv.b + 3, straight: true });

d.write(import.meta.url);
