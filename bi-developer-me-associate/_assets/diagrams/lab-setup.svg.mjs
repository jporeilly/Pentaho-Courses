// Before You Start: how Metadata Editor, the Pentaho Server and the
// sample data fit together. The domain carries its own connection
// (hsqldb:sampledata, native JDBC), so the server reaches SampleData
// through it; the capstone models trailhead in the MySQL lab kit.
// Run: node lab-setup.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
const BW = 236, BH = 78;

d.panel({ x: 16, y: 16, w: 268, h: 330, role: 'tool', iconName: 'monitor', title: 'On your machine', sub: 'the tools you work in' });
d.panel({ x: 396, y: 16, w: 588, h: 330, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });

const me = d.box({ x: 32, y: 92, w: BW, h: BH, role: 'tool', iconName: 'table-properties', title: 'Metadata Editor', lines: ['you build the domain,', 'saved as an .xmi file'] });
const ir = d.box({ x: 32, y: 244, w: BW, h: BH, role: 'browser', iconName: 'table', title: 'Interactive Reports', lines: ['in the User Console,', 'in your browser'] });
const md = d.box({ x: 420, y: 244, w: BW, h: BH, role: 'server', iconName: 'cog', title: 'Metadata engine', lines: ['runs the published domains,', 'turns report queries into SQL'] });
const sd = d.box({ x: 732, y: 92, w: BW, h: BH, role: 'store', iconName: 'database', title: 'SampleData', lines: ['HSQLDB, port 9001', 'the Steel Wheels data'] });
const pg = d.bar({ x: 508, y: 376, w: 476, h: 70, role: 'support', iconName: 'archive', title: 'PostgreSQL, port 5432', line: "the server's repository; it starts first" });
const my = d.bar({ x: 16, y: 376, w: 476, h: 70, role: 'store', iconName: 'container', title: 'MySQL lab kit, port 3306', line: 'the trailhead database: the capstone only' });

d.arrow({ x1: me.r, y1: me.cy, x2: sd.x - 3, y2: sd.cy, label: ['reads tables and columns', 'hsqldb:sampledata, JDBC'] });
d.arrow({ x1: me.r, y1: me.cy + 22, x2: md.x - 3, y2: md.cy - 16, label: ['Publish'], lx: 352, ly: 214 });
d.arrow({ x1: ir.r, y1: ir.cy + 12, x2: md.x - 3, y2: md.cy + 12, label: ['each column you', 'drag is a query'], lx: 340, ly: 296 });
d.arrow({ x1: md.r, y1: md.cy, x2: sd.cx, y2: sd.b + 3, elbow: true, label: ['SQL, through the', "domain's own connection"], lx: 850, ly: 230 });
d.arrow({ x1: md.cx, y1: md.b, x2: md.cx, y2: pg.y - 3, vertical: true, dashed: true });

d.write(import.meta.url);
