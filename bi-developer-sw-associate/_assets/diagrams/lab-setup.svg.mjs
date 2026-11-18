// Before You Start: how Schema Workbench, the Pentaho Server and the
// sample data fit together. Run: node lab-setup.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
const BW = 236, BH = 78;

d.panel({ x: 16, y: 16, w: 268, h: 330, role: 'tool', iconName: 'monitor', title: 'On your machine', sub: 'the tools you work in' });
d.panel({ x: 396, y: 16, w: 588, h: 330, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });

const sw = d.box({ x: 32, y: 92, w: BW, h: BH, role: 'tool', iconName: 'pencil-ruler', title: 'Schema Workbench', lines: ['you design the schema,', 'a Mondrian .xml file'] });
const an = d.box({ x: 32, y: 244, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['in the User Console,', 'in your browser'] });
const mo = d.box({ x: 420, y: 244, w: BW, h: BH, role: 'server', iconName: 'cog', title: 'Mondrian', lines: ['runs the published schemas,', 'turns MDX into SQL'] });
const sd = d.box({ x: 732, y: 92, w: BW, h: BH, role: 'store', iconName: 'database', title: 'SampleData', lines: ['HSQLDB, port 9001', 'the Steel Wheels data'] });
const pg = d.bar({ x: 16, y: 376, w: 968, h: 70, role: 'support', iconName: 'archive', title: 'Repository database: PostgreSQL, port 5432', line: "the server's users, files and published schemas. It starts first: without it the server never finishes starting" });

d.arrow({ x1: sw.r, y1: sw.cy, x2: sd.x - 3, y2: sd.cy, label: ['reads tables and columns', 'JDBC, port 9001'] });
d.arrow({ x1: sw.r, y1: sw.cy + 22, x2: mo.x - 3, y2: mo.cy - 16, label: ['Publish'], lx: 352, ly: 214 });
d.arrow({ x1: an.r, y1: an.cy + 12, x2: mo.x - 3, y2: mo.cy + 12, label: ['each click is', 'an MDX query'], lx: 340, ly: 296 });
d.arrow({ x1: mo.r, y1: mo.cy, x2: sd.cx, y2: sd.b + 3, elbow: true, label: ['SQL, through the data', 'source hsqldb_sampledata'], lx: 850, ly: 230 });
d.arrow({ x1: mo.cx, y1: mo.b, x2: mo.cx, y2: pg.y - 3, vertical: true, dashed: true });

d.write(import.meta.url);
