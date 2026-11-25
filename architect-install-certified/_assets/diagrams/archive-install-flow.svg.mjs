// The archive installation, step by step: the sixteen stages of the
// Prepare Environment (05) and Install Pentaho Server (06) workshops in
// the order the lessons run them, each with the check the lesson gives
// for it, then the finished result and the four labs that follow. It is
// the figure above the tabs of
// 05-installation-archive-prepare-environment/guide.md, where the
// procedure starts. archive-install-layout (lesson 06's header figure)
// still shows where the pieces end up; this one shows the order you
// build them in.
//
// Facts it encodes, and the lesson and lines each comes from (line
// numbers as of this diagram's commit):
//   Lesson 05, 05-installation-archive-prepare-environment/guide.md
//   - 1, "1. Install unzip and Set the Pentaho Paths" (55-92):
//     sudo apt install -y unzip, checkpoint "UnZip 6.00" (62, 66);
//     PENTAHO_BASE, PENTAHO_SERVER and TOMCAT_HOME added to
//     /etc/environment (74-81).
//   - 2, "2. Create the Pentaho Installation User" (94-124):
//     sudo adduser pentaho, sudo usermod -aG sudo pentaho (105, 111);
//     checkpoint: groups lists pentaho and sudo (122); work as pentaho
//     from here on (124).
//   - 3, "3. Install Java 21" and "4. Set PENTAHO_JAVA_HOME" (128-255):
//     sudo apt install -y openjdk-21-jre-headless (176); checkpoint
//     openjdk version "21.0. (194);
//     PENTAHO_JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 in
//     /etc/environment (216).
//   - 4, "5. Install PostgreSQL 17" (257-396): the PGDG repository
//     (259, 277-286), sudo apt install -y postgresql-17 (300);
//     checkpoint: a LISTEN line for port 5432 (396).
//   - 5, "7. Create the pentaho Database Role" (443-489): ALTER USER
//     postgres WITH PASSWORD, CREATE USER pentaho, ALTER USER pentaho
//     WITH SUPERUSER, demo only (459-466); checkpoint ALTER ROLE,
//     CREATE ROLE, ALTER ROLE (469). ("6. Explore PostgreSQL as
//     postgres" only looks around, and "8. Optional: Allow Remote
//     Connections" is for reference: neither is drawn.)
//   - 6, "9. Configure pg_hba.conf" (513-619): the two local lines to
//     scram-sha-256, the first IPv4 host line to 0.0.0.0/0 md5 (530);
//     checkpoint: seven lines, the first three with the new methods
//     (591); sudo systemctl restart postgresql (606).
//   - 7, "10. Install pgAdmin 4" and "11. Validate the Environment"
//     (621-719): pgadmin4-desktop (638), register the server as Pentaho
//     (659), checkpoint Servers (1) > Pentaho (689); the validation
//     checks print OK for PENTAHO_JAVA_HOME (705, 719).
//   Lesson 06, 06-installation-archive-pentaho-server/guide.md
//   - 8, "1. Unpack the Server" (51-152): sudo mkdir -p
//     /opt/pentaho/{server,software} (62); the archive copied into
//     /opt/pentaho/software/server (92); unzip
//     pentaho-server-ee-11.0.0.0-237.zip in $PENTAHO_BASE/server
//     (98-99); checkpoint jdbc-distribution, license-installer and
//     pentaho-server (123); sudo chown -R pentaho:pentaho /opt/pentaho
//     (135).
//   - 9, "2. Repository Databases" (154-291): in
//     $PENTAHO_SERVER/data/postgresql (176), sudo -u pentaho psql -d
//     postgres (214), \i create_jcr_postgresql.sql and
//     create_quartz_postgresql.sql, \q (220-222), reconnect (228),
//     \i create_repository_postgresql.sql, pentaho_mart_postgresql.sql,
//     pentaho_logging_postgresql.sql (234-236); checkpoint: jackrabbit,
//     quartz and hibernate, 11 tables in quartz (274-278).
//   - 10, "3. Repository Configuration" (293-373): quartz.properties
//     with the PostgreSQLDelegate (307, 313); hibernate-settings.xml
//     naming postgresql.hibernate.cfg.xml (324, 330); jackrabbit's
//     repository.xml (353); checkpoint: every active section has the
//     postgresql value (365).
//   - 11, "4. Tomcat" (375-470): postgresql-42.5.6.jar in
//     $TOMCAT_HOME/lib (400, 403); context.xml in
//     $TOMCAT_HOME/webapps/pentaho/META-INF (450-451); checkpoint: nine
//     Resource elements, the seven PostgreSQL ones on
//     jdbc:postgresql://localhost:5432/ (467).
//   - 12, "5. Start Server" (481-508): ./start-pentaho.sh (485),
//     tail -f catalina.*.log (493), checkpoint "Server startup in"
//     (496); curl -I http://localhost:8080/pentaho/, checkpoint
//     HTTP/1.1 401 (505, 508).
//   - 13, same tab (510-523): the User Console at
//     http://localhost:8080/pentaho, admin / password (512, 521);
//     checkpoint: logged in as admin (523).
//   - 14, same tab (546-557): count qrtz6_locks in quartz and the
//     public tables in hibernate and jackrabbit; checkpoint 5, 17 and
//     19 (550-557).
//   - 15, same tab, optional (573-628):
//     /etc/systemd/system/pentaho-server.service (578), ./stop-pentaho.sh
//     then systemctl start and enable pentaho-server (614-617);
//     checkpoint: loaded, enabled and active (628).
//   - 16, "6. License Manager" (632-731): Administration > Licenses, +
//     (659-660), Activation Code or License Server (669);
//     PENTAHO_LICENSE_INFORMATION_PATH=/home/pentaho/.pentaho/.elmLicInfo.plt
//     in /etc/environment (705), then restart (717-723); checkpoint: the
//     Licenses table lists your products, each with a green check mark
//     (678).
//   - The result, lesson 04 "2. What You'll Achieve" (28-30) and
//     lesson 06's intro (7): a licensed Pentaho Server on Tomcat 10,
//     with its repository on PostgreSQL 17.
//   - Then, lesson 04 "5. The Plan" (53-60) and the SUMMARY: Server
//     Plugins (07, the Plugin Manager), Post Installation Tasks (08,
//     secure, addresses and ports, tune), Pentaho Upgrade & Patches (09,
//     service pack 11.0.0.3-312), Client Plugins (10, the client tools).
//
// Icons: square-terminal a command line, user the installation user,
// coffee Java, database PostgreSQL and its databases, user-cog a
// database role, file-text pg_hba.conf, clipboard-check the
// environment's checks, package the server ZIP, folder-cog
// pentaho-solutions, plug a JDBC driver, layout-dashboard the User
// Console, server the Pentaho Server, key-round a license, circle-check
// the result, list-todo the labs still to do. This folder's README has
// the table.
//
// Run from this folder:   node archive-install-flow.svg.mjs
// It writes archive-install-flow.svg here and
// ../images/archive-install-flow.png at twice the size.
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// ── Layout ────────────────────────────────────────────────────────────
// One column of stages, read top to bottom, in four panels; beside each
// stage, on the right, the white box with the check the lesson gives
// for it. Every stage box is the same size.
const W = 800;
const PX = 16, PW = W - 32;            // panels: full width less margins
const SX = 28, SW = 486, BH = 84;      // stage boxes: tall enough for three lines
const CX = SX + SW + 22, CW = PX + PW - 12 - CX; // check boxes
const PITCH = BH + 20;                 // stage to stage
const HEAD = 44 + 14;                  // panel strip with sub-title, plus padding
const PANEL_GAP = 26;                  // between two panels
const ARROW_X = SX + SW - 44;          // the flow's arrows run down here,
                                       // clear of the panel titles on the left

// The panels, top to bottom: how many stages each holds.
const groups = [
  { title: 'Prepare the machine', sub: 'the user, the paths and Java 21', role: 'support', icon: 'monitor', lesson: 'LESSON 05', n: 3 },
  { title: 'PostgreSQL 17', sub: 'the database server for the Pentaho Repository', role: 'store', icon: 'database', lesson: 'LESSON 05', n: 4 },
  { title: 'Unpack and connect the server', sub: 'the archive, the repository databases and their connections', role: 'server', icon: 'server', lesson: 'LESSON 06', n: 4 },
  { title: 'Start, log in and license', sub: 'the first start, its checks and the license', role: 'check', icon: 'layout-dashboard', lesson: 'LESSON 06', n: 5 },
];

// The y of every stage, and of every panel, worked out in order.
let yy = 16;
const stageY = [];
for (const g of groups) {
  g.y = yy;
  for (let i = 0; i < g.n; i++) stageY.push(yy + HEAD + i * PITCH);
  g.h = HEAD + g.n * PITCH - 20 + 14;
  yy += g.h + PANEL_GAP;
}
const RESULT_Y = yy;                   // the result bar
const THEN_Y = RESULT_Y + 64 + PANEL_GAP; // the "then" panel
const THEN_H = 44 + 14 + 64 + 14;
const d = new Diagram(W, THEN_Y + THEN_H + 16);

/** A small lesson badge on the right of a panel's title strip. */
function badge(g, text) {
  const bw = text.length * 7.2 + 18, bx = PX + PW - 14 - bw;
  d.raw(`<rect x="${bx}" y="${g.y + 12}" width="${bw}" height="20" rx="10" fill="#ffffff" opacity="0.95"/>`);
  d.raw(`<text x="${bx + bw / 2}" y="${g.y + 26}" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.5" fill="${ROLE[g.role].head}">${esc(text)}</text>`);
}

for (const g of groups) {
  d.panel({ x: PX, y: g.y, w: PW, h: g.h, role: g.role, iconName: g.icon, title: g.title, sub: g.sub });
  badge(g, g.lesson);
}

// ── The stages, in the lessons' order ─────────────────────────────────
// [role, icon, title, detail lines, check title, check lines]. Roles:
// blue a command you run, slate the machine's own setup, green
// PostgreSQL and the repository, violet the server, teal its
// connections, amber the browser.
const stages = [
  // Lesson 05
  ['tool', 'square-terminal', '1. Install unzip, set the Pentaho paths', ['sudo apt install -y unzip; PENTAHO_BASE, PENTAHO_SERVER', 'and TOMCAT_HOME in /etc/environment'], 'UnZip 6.00', ['unzip -v, first line']],
  ['support', 'user', '2. Create the pentaho user', ['sudo adduser pentaho; usermod -aG sudo pentaho;', 'work as pentaho from here on'], 'groups: pentaho, sudo', ['sudo -v returns with no error']],
  ['support', 'coffee', '3. Install Java 21, set PENTAHO_JAVA_HOME', ['sudo apt install -y openjdk-21-jre-headless;', 'PENTAHO_JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64'], 'openjdk version "21.0.', ['echo $PENTAHO_JAVA_HOME', 'prints the same path']],
  ['store', 'database', '4. Install PostgreSQL 17', ['the PostgreSQL (PGDG) repository, then', 'sudo apt install -y postgresql-17'], 'LISTEN on port 5432', ['SELECT version(): PostgreSQL 17.']],
  ['store', 'user-cog', '5. Create the pentaho database role', ['ALTER USER postgres WITH PASSWORD; CREATE USER', 'pentaho, then WITH SUPERUSER (demo only)'], 'ALTER, CREATE, ALTER ROLE', ['one line per command']],
  ['store', 'file-text', '6. Configure pg_hba.conf', ['local lines: scram-sha-256; first host line:', '0.0.0.0/0 md5; sudo systemctl restart postgresql'], 'Seven lines', ['the first three with', 'the new methods']],
  ['tool', 'clipboard-check', '7. Install pgAdmin 4, validate', ['pgadmin4-desktop, register the server as Pentaho;', 'then the Java and PostgreSQL checks'], 'Servers (1) > Pentaho', ['the checks print OK for', 'PENTAHO_JAVA_HOME']],
  // Lesson 06
  ['source', 'package', '8. Unpack the server', ['/opt/pentaho/{server,software}; unzip', 'pentaho-server-ee-11.0.0.0-237.zip into', '$PENTAHO_BASE/server; chown -R pentaho:pentaho'], 'Three folders', ['jdbc-distribution, license-', 'installer, pentaho-server']],
  ['store', 'database', '9. Create the repository databases', ['in $PENTAHO_SERVER/data/postgresql, psql as pentaho:', '\\i create_jcr, create_quartz; \\q; then create_repository,', 'pentaho_mart, pentaho_logging (_postgresql.sql)'], 'Three databases', ['jackrabbit, quartz, hibernate;', '11 tables in quartz']],
  ['server', 'folder-cog', '10. Check the repository configuration', ['quartz.properties: PostgreSQLDelegate;', 'hibernate-settings.xml: postgresql.hibernate.cfg.xml;', 'jackrabbit/repository.xml'], 'postgresql everywhere', ['in every active section', 'of repository.xml']],
  ['join', 'plug', '11. Check Tomcat\'s driver and context.xml', ['$TOMCAT_HOME/lib: postgresql-42.5.6.jar;', 'webapps/pentaho/META-INF/context.xml'], 'Nine Resource elements', ['seven on jdbc:postgresql://', 'localhost:5432/']],
  ['server', 'square-terminal', '12. Start the server', ['cd $PENTAHO_SERVER; ./start-pentaho.sh;', 'tail -f the catalina.*.log'], 'Server startup in [...] ms', ['curl -I: HTTP/1.1 401']],
  ['browser', 'layout-dashboard', '13. Log in to the User Console', ['http://localhost:8080/pentaho', 'as admin, password password'], 'Logged in as admin', ['no license yet: Missing', 'or expired license.']],
  ['store', 'database', '14. Count what the first start created', ['psql: qrtz6_locks in quartz, the public', 'tables in hibernate and jackrabbit'], '5, 17 and 19', ['lock rows, hibernate tables,', 'jackrabbit tables']],
  ['server', 'server', '15. Optional: run it as a service', ['/etc/systemd/system/pentaho-server.service;', './stop-pentaho.sh, then systemctl start, enable'], 'Loaded, enabled, active', ['systemctl status', 'pentaho-server']],
  ['browser', 'key-round', '16. Apply the license, set its path', ['Administration > Licenses > +: activation code or', 'license server; PENTAHO_LICENSE_INFORMATION_PATH;', 'restart the server'], 'Green check marks', ['for each product in', 'the Licenses table']],
];

const boxes = stages.map(([role, iconName, title, lines, ct, cl], i) => {
  const y = stageY[i];
  const b = d.box({ x: SX, y, w: SW, h: BH, role, iconName, title, lines });
  // The check: a white result box beside the stage, joined by a short
  // dashed line with no head (it is what you see, not a next step).
  const c = d.box({ x: CX, y, w: CW, h: BH, role: 'result', title: ct, lines: cl });
  d.arrow({ x1: b.r, y1: b.cy, x2: c.x, y2: c.cy, straight: true, dashed: true, head: false });
  return b;
});

// The flow: straight arrows down the stage column, from each stage to
// the next, across the panel strips where the stages change panel.
for (let i = 0; i + 1 < boxes.length; i++) {
  d.arrow({ x1: ARROW_X, y1: boxes[i].b, x2: ARROW_X, y2: boxes[i + 1].y - 3, straight: true });
}

// ── The result ────────────────────────────────────────────────────────
// White (a result), full width under the last panel.
const result = d.bar({ x: PX, y: RESULT_Y, w: PW, h: 64, role: 'result', iconName: 'circle-check', title: 'Done: a licensed Pentaho Server on Tomcat 10, its repository on PostgreSQL 17', line: 'jackrabbit, quartz and hibernate filled by the first start; the User Console on port 8080' });
d.arrow({ x1: ARROW_X, y1: boxes[boxes.length - 1].b, x2: ARROW_X, y2: result.y - 3, straight: true });

// ── Then: the labs that follow ────────────────────────────────────────
// Slate (supporting), four same-size boxes side by side, with no icon
// so the lesson number and name fit on one line.
d.panel({ x: PX, y: THEN_Y, w: PW, h: THEN_H, role: 'support', iconName: 'list-todo', title: 'Then', sub: 'the labs that build on it, lessons 07 to 10' });
const TW = (PW - 24 - 3 * 12) / 4;
const then = [
  ['07 Server plugins', ['from the Plugin Manager']],
  ['08 Post installation', ['secure, ports, tune']],
  ['09 Service pack', ['11.0.0.3-312']],
  ['10 Client tools', ['the design tools']],
];
then.forEach(([title, lines], i) => {
  d.box({ x: PX + 12 + i * (TW + 12), y: THEN_Y + 44 + 14, w: TW, h: 64, role: 'support', title, lines });
});
d.arrow({ x1: ARROW_X, y1: result.b, x2: ARROW_X, y2: THEN_Y - 3, straight: true });

d.write(import.meta.url);
