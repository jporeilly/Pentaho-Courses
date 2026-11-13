// Before You Start: how Report Designer, the Pentaho Server and the sample
// data fit together. A report (.prpt) carries its own data source and
// query: Preview runs it in Report Designer's engine; once published, the
// server's reporting plugin runs the same file for the User Console.
// Run: node lab-setup.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
const BW = 236, BH = 78;

d.panel({ x: 16, y: 16, w: 268, h: 330, role: 'tool', iconName: 'monitor', title: 'On your machine', sub: 'the tools you work in' });
d.panel({ x: 396, y: 16, w: 588, h: 330, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });

const rd = d.box({ x: 32, y: 92, w: BW, h: BH, role: 'tool', iconName: 'file-chart-column', title: 'Report Designer', lines: ['you design the report,', 'a .prpt file; Preview runs it'] });
const uc = d.box({ x: 32, y: 244, w: BW, h: BH, role: 'browser', iconName: 'app-window', title: 'User Console', lines: ['opens published reports,', 'in your browser'] });
const rp = d.box({ x: 420, y: 244, w: BW, h: BH, role: 'server', iconName: 'cog', title: 'Reporting engine', lines: ['runs the published .prpt:', 'its own query, its own layout'] });
const sd = d.box({ x: 732, y: 92, w: BW, h: BH, role: 'store', iconName: 'database', title: 'SampleData', lines: ['HSQLDB, port 9001', 'the Steel Wheels data'] });
const pg = d.bar({ x: 16, y: 376, w: 968, h: 70, role: 'support', iconName: 'archive', title: 'Repository database: PostgreSQL, port 5432', line: "the server's users and files, including the reports you publish. It starts first: without it the server never finishes starting" });

d.arrow({ x1: rd.r, y1: rd.cy, x2: sd.x - 3, y2: sd.cy, label: ['SampleData (Hypersonic)', 'runs the query, JDBC 9001'] });
d.arrow({ x1: rd.r, y1: rd.cy + 22, x2: rp.x - 3, y2: rp.cy - 16, label: ['Publish'], lx: 352, ly: 214 });
d.arrow({ x1: uc.r, y1: uc.cy + 12, x2: rp.x - 3, y2: rp.cy + 12, label: ['open a report,', 'pick prompts'], lx: 340, ly: 296 });
d.arrow({ x1: rp.r, y1: rp.cy, x2: sd.cx, y2: sd.b + 3, elbow: true, label: ["the report's own", 'query, again'], lx: 850, ly: 230 });
d.arrow({ x1: rp.cx, y1: rp.b, x2: rp.cx, y2: pg.y - 3, vertical: true, dashed: true });

d.write(import.meta.url);
