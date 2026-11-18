// Key Concepts: what happens between a click in Analyzer and the database -
// MDX to Mondrian, the schema mapping cubes to tables, SQL to the data mart,
// and the cells back. Replaces a borrowed picture that still said "Pentaho
// Business Analytics Server". Run: node mondrian-request.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(780, 560);
const BW = 228, BH = 78;
const X = [32, 276, 520];

d.panel({ x: 16, y: 16, w: 748, h: 136, role: 'browser', iconName: 'monitor', title: 'In the browser', sub: 'the Pentaho User Console' });
const an = d.box({ x: X[0], y: 66, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['drag fields, filter,', 'drill down'] });
const rp = d.box({ x: X[1], y: 66, w: BW, h: BH, role: 'browser', iconName: 'file-text', title: 'Reports', lines: ['with an OLAP', 'data source'] });
const db = d.box({ x: X[2], y: 66, w: BW, h: BH, role: 'browser', iconName: 'layout-dashboard', title: 'Dashboards', lines: ['CTools, with', 'MDX queries'] });

const sch = d.box({ x: X[0], y: 252, w: BW, h: BH, role: 'model', iconName: 'file-code', title: 'Your schema', lines: ['the .xml you publish:', 'cubes mapped to tables'] });
const mon = d.box({ x: 330, y: 252, w: BW, h: BH, role: 'engine', iconName: 'cog', title: 'Mondrian', lines: ['on the Pentaho Server;', 'answers MDX, caches cells'] });

const mart = d.bar({ x: 16, y: 430, w: 748, h: 70, role: 'store', iconName: 'database', title: 'The data mart: a star schema in a relational database', line: 'in this course SampleData (HSQLDB): ORDERFACT and its dimension tables' });

// 1 - each tool sends MDX
d.arrow({ x1: an.cx, y1: an.b, x2: mon.cx - 50, y2: mon.y - 3, vertical: true });
d.arrow({ x1: rp.cx, y1: rp.b, x2: mon.cx, y2: mon.y - 3, vertical: true });
d.arrow({ x1: db.cx, y1: db.b, x2: mon.cx + 50, y2: mon.y - 3, vertical: true });
d.pill(668, 290, ['1  each click is', 'an MDX query']);
// 2 - the schema maps cubes to tables
d.arrow({ x1: sch.r, y1: sch.cy, x2: mon.x - 3, y2: mon.cy, straight: true });
d.pill((sch.r + mon.x) / 2, sch.cy - 30, ['2  maps']);
// 3 - SQL down, 4 - rows back up
d.arrow({ x1: mon.cx - 40, y1: mon.b, x2: mon.cx - 40, y2: mart.y - 3, vertical: true });
d.pill(mon.cx - 40, 380, ['3  SQL']);
d.arrow({ x1: mon.cx + 40, y1: mart.y, x2: mon.cx + 40, y2: mon.b + 3, vertical: true, dashed: true });
d.pill(mon.cx + 170, 380, ['4  rows back, summed', 'into cells for the tool']);
d.raw(`<text x="16" y="540" font-size="12" fill="#64748b">ROLAP: the cube is not stored anywhere. Mondrian computes each cell from the relational tables, as the tool asks for it.</text>`);

d.write(import.meta.url);
