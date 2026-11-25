// The Archive Installation module at a glance: the Overview reading
// (lesson 04) as the way in, then its five workshops in the order the
// course runs them, 05 to 09, each with its time, what it does and the
// checkpoint it ends on, and the result of the module with a pointer to
// the next one. It is the figure in "5. The Plan" of
// 04-installation-archive-overview/guide.md, and the first figure in
// step 3, "Archive Installation", of the Sandbox Installation page.
// archive-install-flow (lesson 05) draws the sixteen detailed stages of
// workshops 05 and 06; this one draws the whole module, one box a
// workshop.
//
// Facts it encodes, and the lesson and lines each comes from (line
// numbers as of this diagram's commit):
//   - Order and names: SUMMARY.md, "Archive Installation" (13-20):
//     Overview, Prepare Environment, Install Pentaho Server, Server
//     Plugins, Post Installation Tasks, Pentaho Upgrade & Patches; the
//     next module is "Install Client Tools" (22-25): Client Plugins,
//     Enterprise Plugins.
//   - Kinds and times, each lesson's manifest.json: 04 "kind": "page"
//     (a reading); 05 estimatedMinutes 40, 06 60, 07 45, 08 40, 09 45.
//     Each workshop's "Estimated time" line says the same (05 line 24,
//     06 23, 07 22, 08 18, 09 24).
//   - 04 Overview, 04-installation-archive-overview/guide.md: tabs "1.
//     Why an Archive Installation" (17), "2. What You'll Achieve" (26),
//     "4. Prerequisites" (39), "5. The Plan" (50).
//   - 05 Prepare Environment, 05-.../guide.md: the pentaho user and
//     the Pentaho paths (55, 94); Java 21 and PENTAHO_JAVA_HOME (128,
//     202); PostgreSQL 17 and the pentaho database role (257, 443);
//     pg_hba.conf (513); pgAdmin 4 (621); checkpoint of "11. Validate
//     the Environment" (719): openjdk 21, OK for PENTAHO_JAVA_HOME,
//     PostgreSQL 17., active.
//   - 06 Install Pentaho Server, 06-.../guide.md: unpack
//     pentaho-server-ee-11.0.0.0-237.zip under /opt/pentaho (51, 99);
//     the jackrabbit, quartz and hibernate repository databases (154,
//     220-236); the JDBC driver and context.xml (375, 385, 439); start,
//     log in (473, 510-523); the License Manager (632), checkpoint: the
//     Licenses table, each product with a green check mark (685).
//   - 07 Server Plugins, 07-.../guide.md: the Plugin Manager in the
//     modern User Console (40); install Analyzer, Interactive Reporting
//     and Dashboard Designer (12, 101, 161, 228) and Semantic Model
//     Editor (13, 367); check Pipeline Designer, the Scheduler and the
//     Carte API plugin, shipped in the archive (13, 302, 306, 443,
//     505); every install ends with a restart (87); checkpoint: the
//     plugin shows its version under Installed Version (159, 226, 292).
//   - 08 Post Installation Tasks, 08-.../guide.md, every task optional
//     (7): "1. Secure the Server" (40): the Server header (44), the
//     shutdown port (91), HTTPS on 8443 (148, 150), autocomplete on the
//     login page (225); "2. Change Addresses and Ports" (239): context
//     path (243), HTTP port (319); "3. Tune the Server" (368): session
//     timeout (372), Karaf's startup wait (404), CSV upload limits
//     (437); "4. Prepare for Users" (476): error pages (480), sample
//     data (533), Home page widgets (592). Its check: the login page at
//     http://localhost:8080/pentaho/Login, put back before the exam
//     (36).
//   - 09 Pentaho Upgrade & Patches, 09-.../guide.md: "1. Before You
//     Patch" (53): record what is installed, back up (10); "2. Apply
//     the Service Pack" (138): the Pentaho Service Pack Installer,
//     silent, on /opt/pentaho/server (142-144, 162-163), checkpoint
//     pentaho-platform-core-11.0.0.3-312.jar (206); "3. Put Back What
//     It Removed" (233): Semantic Model Editor and your JDBC driver
//     (245, 274, 284); "4. Patch the Client Tools" (288): the client
//     tools to the same service pack (15).
//   - The result: 04 "2. What You'll Achieve" (28-32): the Pentaho
//     Server on Tomcat 10, the Pentaho Repository on PostgreSQL 17,
//     licensed; hardened (08) and patched to 11.0.0.3-312 (09).
//
// Colors by role: blue the reading (a source you read) and lesson 08's
// hand edits, slate the machine (05), violet the server and the service
// pack installer (06, 09), amber the Plugin Manager in the User Console
// (07), white each checkpoint and the result.
// Icons: book-open the reading, monitor the Ubuntu host, server the
// Pentaho Server, puzzle a plugin, shield-check hardening, package an
// installer, circle-check the finished installation, laptop the client
// tools. This folder's README has the table.
//
// Run from this folder:   node archive-installation-module.svg.mjs
// It writes archive-installation-module.svg here and
// ../images/archive-installation-module.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// ── Layout ────────────────────────────────────────────────────────────
// The reading as a bar across the top, then the five workshops and the
// result as six same-size cards in two rows of three, read like text:
// 05 > 06 > 07 on the first row, then back to the left for 08 > 09 >
// result. Each card is a panel: its title strip names the workshop and
// its number and time, the body lists what it does, and a white box at
// its foot is the checkpoint it ends on.
const W = 800;
const M = 16;                          // outer margin
const GAP = 24;                        // between two cards: room for an arrow
const CW = (W - 2 * M - 2 * GAP) / 3;  // card width, 240
const STRIP = 44;                      // panel strip with a sub-title
const LINE = 16, NLINES = 5;           // body lines
const CHECK_H = 50;                    // the checkpoint box
const CH = STRIP + 14 + NLINES * LINE + 8 + CHECK_H + 12; // card height
const TOP_H = 56;                      // the reading's bar
const ROW1 = M + TOP_H + 30;
const ROW_GAP = 44;                    // room for the arrow back to the left
const ROW2 = ROW1 + CH + ROW_GAP;
const d = new Diagram(W, ROW2 + CH + M);
const colX = (i) => M + i * (CW + GAP);

// ── The way in: the Overview reading ──────────────────────────────────
const top = d.bar({ x: M, y: M, w: W - 2 * M, h: TOP_H, role: 'source', iconName: 'book-open', title: 'Start here: 04 Overview, a reading', line: 'why an archive installation, what you\'ll achieve, the prerequisites and the plan' });

/**
 * One workshop (or the result) as a card: a panel with its title and
 * sub-title in the strip, body lines, and a white checkpoint box.
 */
function card({ col, y, role, iconName, title, sub, lines, check }) {
  const x = colX(col);
  const g = d.panel({ x, y, w: CW, h: CH, role, iconName, title, sub });
  const c = ROLE[role];
  // A line that starts with two spaces carries on the bullet above it,
  // so it is indented to the bullet's text (SVG drops leading spaces).
  lines.forEach((l, i) => {
    const cont = l.startsWith('  ');
    d.raw(`<text x="${x + 14 + (cont ? 8.5 : 0)}" y="${y + STRIP + 14 + 12 + i * LINE}" font-size="12" fill="${c.text}">${esc(l.trim())}</text>`);
  });
  const by = y + STRIP + 14 + NLINES * LINE + 8;
  d.box({ x: x + 10, y: by, w: CW - 20, h: CHECK_H, role: check.role ?? 'result', iconName: check.iconName, title: check.title, lines: check.lines });
  return g;
}

// ── The five workshops, and the result ───────────────────────────────
const cards = [
  card({ col: 0, y: ROW1, role: 'support', iconName: 'monitor', title: 'Prepare Environment', sub: 'Workshop 05 · ~40m',
    lines: ['• the pentaho user, the Pentaho paths', '• Java 21, PENTAHO_JAVA_HOME', '• PostgreSQL 17, the pentaho role', '• pg_hba.conf to passwords', '• pgAdmin 4, then validate'],
    check: { title: 'Java 21, PostgreSQL 17', lines: ['the validation checks pass'] } }),
  card({ col: 1, y: ROW1, role: 'server', iconName: 'server', title: 'Install Pentaho Server', sub: 'Workshop 06 · ~1h',
    lines: ['• unpack 11.0.0.0-237 in /opt/pentaho', '• the jackrabbit, quartz and', '  hibernate repository databases', '• check the driver and context.xml', '• start, log in, apply the license'],
    check: { title: 'Green check marks', lines: ['in the Licenses table'] } }),
  card({ col: 2, y: ROW1, role: 'browser', iconName: 'puzzle', title: 'Server Plugins', sub: 'Workshop 07 · ~45m',
    lines: ['• Plugin Manager: Analyzer,', '  Interactive Reporting, Dashboard', '  Designer, Semantic Model Editor', '• check Pipeline Designer, the', '  Scheduler, Carte; restart'],
    check: { title: 'Installed Version', lines: ['shown for each plugin'] } }),
  card({ col: 0, y: ROW2, role: 'tool', iconName: 'shield-check', title: 'Post Installation Tasks', sub: 'Workshop 08 · ~40m · optional',
    lines: ['• secure: Server header, shutdown', '  port, HTTPS on 8443, autocomplete', '• context path and HTTP port', '• session timeout, Karaf, CSV limits', '• error pages, sample data, widgets'],
    check: { title: '8080/pentaho/Login', lines: ['put back before the exam'] } }),
  card({ col: 1, y: ROW2, role: 'server', iconName: 'package', title: 'Pentaho Upgrade & Patches', sub: 'Workshop 09 · ~45m',
    lines: ['• record what is installed, back up', '• Pentaho Service Pack Installer,', '  silent, on /opt/pentaho/server', '• put back SME and your JDBC driver', '• client tools to the same pack'],
    check: { title: '11.0.0.3-312', lines: ['pentaho-platform-core JAR'] } }),
  card({ col: 2, y: ROW2, role: 'result', iconName: 'circle-check', title: 'The result', sub: 'the end of this module',
    lines: ['A licensed, hardened and patched', 'Pentaho Server on Tomcat 10,', 'its repository on PostgreSQL 17:', 'the jackrabbit, quartz and', 'hibernate databases'],
    check: { role: 'support', title: 'Next: Install Client Tools', lines: ['Client Plugins, Enterprise Plugins'] } }),
];

// ── The flow ──────────────────────────────────────────────────────────
// Down from the reading into 05; across the first row at the height of
// the cards' bodies; from 07's foot back to the left, above the second
// row, into 08's top; across the second row to the result.
d.arrow({ x1: cards[0].cx, y1: top.b, x2: cards[0].cx, y2: ROW1 - 3, straight: true });
const flowY = (g) => g.y + STRIP + 14 + (NLINES * LINE) / 2;
for (const [a, b] of [[0, 1], [1, 2], [3, 4], [4, 5]]) {
  d.arrow({ x1: cards[a].r, y1: flowY(cards[a]), x2: cards[b].x - 3, y2: flowY(cards[b]), straight: true });
}
const midY = ROW1 + CH + ROW_GAP / 2;
d.edges.push(`<path d="M${cards[2].cx} ${cards[2].b}V${midY - 8}q0 8 -8 8H${cards[3].cx + 8}q-8 0 -8 8V${ROW2 - 3}" fill="none" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);

d.write(import.meta.url);
