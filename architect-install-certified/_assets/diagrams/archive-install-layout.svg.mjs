// The archive installation on one Ubuntu host: the staging folder, the
// unpacked server, the Java it runs on, the PostgreSQL it stores its
// repository in, and the browser that opens the User Console. It is the
// header figure of 06-installation-archive-pentaho-server/guide.md, where
// it replaces pentaho_pro_suite.png (a Carte figure that did not belong
// to an installation page).
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 05 (Prepare Environment): the baseline is Ubuntu 24.04 LTS;
//     /etc/environment sets PENTAHO_BASE=/opt/pentaho,
//     PENTAHO_SERVER=/opt/pentaho/server/pentaho-server and
//     TOMCAT_HOME=/opt/pentaho/server/pentaho-server/tomcat, and
//     PENTAHO_JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64;
//     start-pentaho.sh (through set-pentaho-env.sh) takes
//     PENTAHO_JAVA_HOME before any other Java; PostgreSQL 17 listens on
//     port 5432.
//   - Lesson 06, "1. Unpack the Server": /opt/pentaho/{server,software};
//     software is the staging area (installers, ZIPs, drivers) with the
//     sub-folders db-drivers, docker, ee-client, ee-plugins, ops-mart,
//     sdk, server and shims; the server ZIP is copied into
//     software/server and unzipped into $PENTAHO_BASE/server; the
//     archive holds pentaho-server (Tomcat 10 with the web app deployed
//     in tomcat/webapps/pentaho, the start and stop scripts, and
//     pentaho-solutions, whose system folder holds the configuration and
//     the plugins) with jdbc-distribution and license-installer beside
//     it; /opt/pentaho is owned by pentaho:pentaho.
//   - Lesson 06, "2. Repository Databases" and "4. Tomcat > context.xml":
//     the repository databases jackrabbit, quartz and hibernate; the
//     JNDI resources in tomcat/webapps/pentaho/META-INF/context.xml use
//     URLs that start jdbc:postgresql://localhost:5432/.
//   - Lesson 06, "5. Start Server": Tomcat listens on http-nio-8080; the
//     Pentaho User Console opens at http://localhost:8080/pentaho.
//
// Icons: globe the browser, folder-archive the staging folder, package
// the server ZIP, plug a JDBC driver, puzzle a plugin, server Tomcat,
// folder-cog pentaho-solutions, square-terminal a script, coffee Java,
// database PostgreSQL. This folder's README has the table.
//
// Run from this folder:   node archive-install-layout.svg.mjs
// It writes archive-install-layout.svg here and
// ../images/archive-install-layout.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, the reading column, so the figure shows at its own
// size. The height is set to the host panel's foot plus a margin.
const W = 800;
const d = new Diagram(W, 552);

/** A one-line note in a role's text color, left-aligned at x. */
function note(x, y, text, role) {
  d.raw(`<text x="${x}" y="${y}" font-size="12" fill="${ROLE[role].text}">${esc(text)}</text>`);
}

// ── Above the host: the browser ───────────────────────────────────────
// Amber (the browser). It sits straight above the Tomcat box, so its
// arrow runs straight down into it.
const TX = 552, TW = 208; // the Tomcat box's x and width, shared below
const browser = d.box({ x: TX, y: 16, w: TW, h: 64, role: 'browser', iconName: 'globe', title: 'User Console', lines: ['localhost:8080/pentaho'] });

// ── The host: one Ubuntu machine holds everything ─────────────────────
// Slate (a supporting group). Its sub-title names the owner of
// /opt/pentaho and where the path variables are set.
d.panel({ x: 16, y: 120, w: W - 32, h: 416, role: 'support', iconName: 'monitor', title: 'Ubuntu 24.04 LTS host', sub: '/opt/pentaho owned by pentaho:pentaho; paths set in /etc/environment' });

// ── /opt/pentaho/software: the staging area ───────────────────────────
// Blue (a source you read from): three of its eight sub-folders as
// boxes, the other five as a note under them.
const SX = 32, SW = 208, SBW = SW - 24;
d.panel({ x: SX, y: 176, w: SW, h: 252, role: 'source', iconName: 'folder-archive', title: '/opt/pentaho/software', sub: 'staging area' });
const zip = d.box({ x: SX + 12, y: 232, w: SBW, h: 44, role: 'source', iconName: 'package', title: 'server', lines: ['the server ZIP'] });
d.box({ x: SX + 12, y: 284, w: SBW, h: 44, role: 'source', iconName: 'plug', title: 'db-drivers', lines: ['JDBC drivers'] });
d.box({ x: SX + 12, y: 336, w: SBW, h: 44, role: 'source', iconName: 'puzzle', title: 'ee-plugins', lines: ['EE server plugins'] });
note(SX + 14, 400, 'also ee-client, ops-mart,', 'source');
note(SX + 14, 415, 'docker, sdk and shims', 'source');

// ── /opt/pentaho/server/pentaho-server: the unpacked server ───────────
// Violet (the server). Its sub-title names the variable that points at
// it and the two folders that sit beside it. Inside: the solution
// folder and Tomcat side by side, the start script under them.
const PX = 300, PW = W - 32 - PX;
const srv = d.panel({ x: PX, y: 176, w: PW, h: 252, role: 'server', iconName: 'server', title: '/opt/pentaho/server/pentaho-server', sub: '$PENTAHO_SERVER; beside it jdbc-distribution, license-installer' });
const sol = d.box({ x: PX + 12, y: 232, w: TW, h: 80, role: 'server', iconName: 'folder-cog', title: 'pentaho-solutions', lines: ['system: settings', 'and plugins'] });
const tom = d.box({ x: TX, y: 232, w: TW, h: 80, role: 'server', iconName: 'server', title: 'Tomcat 10', lines: ['webapps/pentaho and', 'its context.xml'] });
const start = d.box({ x: PX + 12, y: 330, w: TW, h: 64, role: 'server', iconName: 'square-terminal', title: 'start-pentaho.sh', lines: ['and stop-pentaho.sh'] });

// ── Underneath: the Java the server runs on and its repository ────────
// Slate the Java runtime (a supporting service), green PostgreSQL (a
// store). PostgreSQL sits under Tomcat so the JNDI arrow is straight.
const java = d.box({ x: 32, y: 456, w: 376, h: 64, role: 'support', iconName: 'coffee', title: 'Java 21 (OpenJDK)', lines: ['/usr/lib/jvm/java-21-openjdk-amd64'] });
const pg = d.box({ x: 424, y: 456, w: W - 32 - 424, h: 64, role: 'store', iconName: 'database', title: 'PostgreSQL 17, port 5432', lines: ['jackrabbit, quartz, hibernate'] });

// ── Arrows ────────────────────────────────────────────────────────────
// The browser reaches Tomcat on port 8080: straight down near the
// boxes' right edge, clear of the server panel's sub-title text, with
// the pill in the gap above the host panel.
const BXL = TX + TW - 30;
d.arrow({ x1: BXL, y1: browser.b, x2: BXL, y2: tom.y - 3, straight: true, label: 'port 8080', ly: 100 });
// The server ZIP is unzipped into the server folder (straight across).
d.arrow({ x1: zip.r, y1: zip.cy, x2: srv.x - 3, y2: zip.cy, straight: true });
d.pill((zip.r + srv.x) / 2, zip.cy - 24, 'unzip');
// start-pentaho.sh picks the Java that PENTAHO_JAVA_HOME names:
// straight down into the Java box, the pill inside the server panel so
// the arrowhead stays visible. The label is padded with spaces because
// the kit sizes a pill for lower-case text and this one is capitals.
const JX = 392;
d.arrow({ x1: JX, y1: start.b, x2: JX, y2: java.y - 3, straight: true, label: ' PENTAHO_JAVA_HOME  ', ly: 412 });
// Tomcat's context.xml reaches PostgreSQL through its JNDI resources,
// straight down; the pill sits at the same height as the Java one.
d.arrow({ x1: tom.cx, y1: tom.b, x2: tom.cx, y2: pg.y - 3, straight: true, label: 'context.xml JNDI', ly: 412 });

d.write(import.meta.url);
