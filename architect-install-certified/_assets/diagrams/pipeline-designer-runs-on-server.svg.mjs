// Where a Pipeline Designer run happens: the browser shows the page,
// but the transformation runs on the Carte service inside the Pentaho
// Server, with the server's Java, memory, JDBC drivers and Pentaho Data
// Integration plugins; the desktop's Spoon plays no part. It is the
// figure under "Pipeline Designer runs on the server's own Carte" in
// the "4. Carte" tab of 07-installation-archive-server-plugins/guide.md.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 07, "1. Open the Plugin Manager": the modern User Console's
//     left panel holds Pipeline Designer.
//   - Lesson 07, "1. Pipeline Designer": the 11.0 archive ships it in
//     pentaho-solutions/system/pentaho-webttle.
//   - Lesson 07, "4. Carte": the Carte API plugin ships in
//     pentaho-solutions/system/kettle/plugins/webttle-carte-api-plugin;
//     Pipeline Designer does not run a transformation in the browser,
//     it hands it to the Carte service inside the Pentaho Server at
//     /pentaho/kettle, which the Carte API plugin connects it to; the
//     Logging tab starts with a kettle/transStatus link and the PDI
//     Status page (/pentaho/kettle/status) lists the run; the service's
//     settings are in pentaho-solutions/system/kettle/slave-server-config.xml;
//     a run from the browser uses the server's Java, memory, JDBC
//     drivers and PDI plugins, not your desktop's; when a step works in
//     Spoon but fails in Pipeline Designer, check the server's drivers
//     and plugins first.
//   - Lesson 07, "4. Data Connections" (warning) and lesson 06: JDBC
//     drivers go in /opt/pentaho/server/pentaho-server/tomcat/lib.
//   - Lesson 05: the server runs on the Java that PENTAHO_JAVA_HOME
//     names, Java 21.
//
// Icons: globe the browser, layout-dashboard the User Console, workflow
// Pipeline Designer, plug the Carte API plugin, cpu the server's Carte,
// coffee Java, memory-stick memory, database a JDBC driver, puzzle a
// PDI plugin, laptop the desktop. This folder's README has the table.
//
// Run from this folder:   node pipeline-designer-runs-on-server.svg.mjs
// It writes pipeline-designer-runs-on-server.svg here and
// ../images/pipeline-designer-runs-on-server.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide. The browser on the left; the server panel on the
// right, with the chain of hand-offs in its left column and what the
// run uses in its right column; the desktop underneath.
const W = 800;
const d = new Diagram(W, 500);

// ── The browser ───────────────────────────────────────────────────────
// Amber (the browser). It shows pages only; nothing runs here.
const br = d.box({ x: 16, y: 72, w: 184, h: 76, role: 'browser', iconName: 'globe', title: 'Browser', lines: ['shows the pages;', 'runs nothing'] });

// ── The Pentaho Server ────────────────────────────────────────────────
// Violet panel (the server). The left column is the chain a run goes
// down, each box a violet part of the server.
const SX = 248, SW = W - 16 - SX;
d.panel({ x: SX, y: 16, w: SW, h: 382, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'localhost:8080/pentaho' });
const CX = SX + 12, CW = 248, CH = 64, STEP = 80;
const puc = d.box({ x: CX, y: 78, w: CW, h: CH, role: 'server', iconName: 'layout-dashboard', title: 'User Console', lines: ['Pipeline Designer in', 'the left panel'] });
const pd = d.box({ x: CX, y: 78 + STEP, w: CW, h: CH, role: 'server', iconName: 'workflow', title: 'Pipeline Designer', lines: ['system/pentaho-webttle;', 'hands the run over'] });
const api = d.box({ x: CX, y: 78 + 2 * STEP, w: CW, h: CH, role: 'server', iconName: 'plug', title: 'Carte API plugin', lines: ['webttle-carte-api-plugin'] });
const ca = d.box({ x: CX, y: 78 + 3 * STEP, w: CW, h: CH, role: 'engine', iconName: 'cpu', title: 'The server\'s Carte', lines: ['/pentaho/kettle: runs it;', 'slave-server-config.xml'] });

// What the run uses: a slate panel (supporting services) of four
// boxes, all the server's own.
const UX = CX + CW + 32, UW = SX + SW - 12 - UX;
const use = d.panel({ x: UX, y: 78, w: UW, h: 288, role: 'support', title: 'What the run uses', sub: 'the server\'s own' });
const UB = UW - 24;
d.box({ x: UX + 12, y: 134, w: UB, h: 50, role: 'support', iconName: 'coffee', title: 'Java 21', lines: ['PENTAHO_JAVA_HOME'] });
d.box({ x: UX + 12, y: 192, w: UB, h: 50, role: 'support', iconName: 'memory-stick', title: 'Memory' });
d.box({ x: UX + 12, y: 250, w: UB, h: 50, role: 'support', iconName: 'database', title: 'JDBC drivers', lines: ['tomcat/lib'] });
d.box({ x: UX + 12, y: 308, w: UB, h: 50, role: 'support', iconName: 'puzzle', title: 'PDI plugins', lines: ['system/kettle/plugins'] });

// ── The desktop: not involved ─────────────────────────────────────────
// Stone (not involved), full width under the server.
const desk = d.bar({ x: 16, y: 418, w: W - 32, h: 60, role: 'off', iconName: 'laptop', title: 'Your desktop\'s Spoon: not used', line: 'its Java, drivers and plugins play no part in a run from the browser' });
d.h = desk.b + 16;

// ── Arrows ────────────────────────────────────────────────────────────
// Browser to the User Console (the request), then down the chain.
d.arrow({ x1: br.r, y1: puc.cy, x2: puc.x - 3, y2: puc.cy, straight: true });
d.arrow({ x1: puc.cx, y1: puc.b, x2: pd.cx, y2: pd.y - 3, straight: true });
d.arrow({ x1: pd.cx, y1: pd.b, x2: api.cx, y2: api.y - 3, straight: true });
d.arrow({ x1: api.cx, y1: api.b, x2: ca.cx, y2: ca.y - 3, straight: true });
// Carte draws on the server's resources (into the side panel).
d.arrow({ x1: ca.r, y1: ca.cy, x2: use.x - 3, y2: ca.cy, straight: true });
// Status back to the browser: dashed, leaving Carte's left side and
// arriving up into the browser box, with the two status pages named.
d.arrow({ x1: ca.x, y1: ca.cy, x2: br.cx, y2: br.b + 3, elbow: true, dashed: true });
d.pill(br.cx, 262, ['transStatus,', 'PDI Status']);

d.write(import.meta.url);
