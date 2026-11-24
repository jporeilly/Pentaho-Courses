// Before You Start: how the browser, the Pentaho Server with its CTools
// plugins and the sample data fit together. Laid out like the lab-setup
// diagrams of the sibling BI Developer courses (Schema Workbench,
// Metadata Editor, Report Designer): the machine's side on the left, the
// server on the right, the sample data top right. This course has no
// desktop design tool, so both boxes on the left are the browser, and
// the lessons name no repository database, so the bar underneath is the
// start script instead of PostgreSQL. It sits in
// 00-before-you-start/guide.md, under "Set up your environment".
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 00, "I'm installing on my own machine" note: the course
//     needs no containers, no MySQL and no desktop design tool; the
//     CTools (CDE, CDF, CDA and the CCC charts) are plugins inside the
//     Pentaho Server, and every dashboard is built in the browser.
//   - Lesson 00, tab 1: start-pentaho.bat starts the server, which
//     brings up the User Console, the sample data and the CTools plugins
//     together; stop-pentaho.bat shuts it down; the server answers at
//     http://localhost:8080/pentaho.
//   - Lesson 00, tab 2: sign in as admin / password; Create New offers
//     CDE Dashboard when the CTools are present.
//   - Lesson 00, tab 3: the HSQLDB sampledata database
//     (jdbc:hsqldb:hsql://localhost/sampledata) holds the Steel Wheels
//     sample data, starts with the server, and the CDA data sources reach
//     it through the server's own connections.
//   - Lesson 03, tab 5: the server reaches the database through the
//     named connection SampleData (Hypersonic, Native JDBC, port 9001)
//     in Manage Data Sources; a JNDI data source stores only that name.
//   - Lesson 01: CGG is the fifth CTool, also a server plugin.
//   - Lesson 05: every dashboard component fetches its data from CDA
//     with doQuery.
//
// Run from this folder:   node lab-setup.svg.mjs
// It writes lab-setup.svg here and ../images/lab-setup.png at twice the
// size. Like the siblings it is 1000 wide; the figure shows it at 800.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The siblings' canvas and box size, so the four lab-setup pictures match.
const d = new Diagram(1000, 470);
const BW = 236, BH = 78;

// The two places: your machine (blue) and the Pentaho Server (violet).
d.panel({ x: 16, y: 16, w: 268, h: 330, role: 'tool', iconName: 'monitor', title: 'On your machine', sub: 'only a browser' });
d.panel({ x: 396, y: 16, w: 588, h: 330, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });

// Left: the User Console and the dashboards, both in the browser (amber).
const uc = d.box({ x: 32, y: 92, w: BW, h: BH, role: 'browser', iconName: 'app-window', title: 'User Console', lines: ['sign in as admin,', 'then Create New'] });
const db = d.box({ x: 32, y: 244, w: BW, h: BH, role: 'browser', iconName: 'layout-dashboard', title: 'CTools dashboards', lines: ['built and viewed', 'in your browser'] });

// Right: the CTools plugins (violet, the engine), the named connection
// (slate, a supporting service) and the sample data (green, a store).
const ct = d.box({ x: 420, y: 244, w: BW, h: BH, role: 'server', iconName: 'component', title: 'CTools plugins', lines: ['CDE, CDF, CDA, CCC, CGG,', 'inside the server'] });
const cn = d.box({ x: 732, y: 244, w: BW, h: BH, role: 'support', iconName: 'plug', title: 'SampleData', lines: ['a named connection in', 'Manage Data Sources'] });
const sd = d.box({ x: 732, y: 92, w: BW, h: BH, role: 'store', iconName: 'database', title: 'sampledata', lines: ['HSQLDB, port 9001', 'the Steel Wheels data'] });

// Underneath: the start script that brings it all up (slate).
d.bar({ x: 16, y: 376, w: 968, h: 70, role: 'support', iconName: 'play', title: 'start-pentaho.bat starts it all', line: 'the User Console, the sample data and the CTools plugins come up together; stop-pentaho.bat stops them' });

// The User Console opens the CDE editor on the server.
d.arrow({ x1: uc.r, y1: uc.cy + 22, x2: ct.x - 3, y2: ct.cy - 16, label: ['CDE Dashboard', 'opens the editor'], lx: 352, ly: 214 });
// Each dashboard component asks CDA for its data.
d.arrow({ x1: db.r, y1: db.cy + 12, x2: ct.x - 3, y2: ct.cy + 12, label: ['each component', 'calls doQuery'], lx: 340, ly: 296 });
// CDA's queries name the server's connection.
d.arrow({ x1: ct.r, y1: ct.cy, x2: cn.x - 3, y2: cn.cy, straight: true, label: ['by name'], ly: 252 });
// The connection opens the database.
d.arrow({ x1: cn.cx, y1: cn.y, x2: sd.cx, y2: sd.b + 3, vertical: true, label: ['JDBC, port 9001'] });

d.write(import.meta.url);
