// Basic Model, tab 2: Schema Workbench's connection and the server's are
// separate, joined only by the data source name typed when publishing.
// Run: node two-connections.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
const BW = 260, BH = 84;

d.panel({ x: 16, y: 16, w: 296, h: 330, role: 'tool', iconName: 'pencil-ruler', title: 'Schema Workbench', sub: 'while you design' });
const sch = d.box({ x: 34, y: 82, w: BW, h: BH, role: 'model', iconName: 'file-code', title: 'Your schema', lines: ['ClassicModels.xml:', 'tables and columns,', 'no connection in it'] });
const swc = d.box({ x: 34, y: 236, w: BW, h: BH, role: 'tool', iconName: 'plug', title: 'hsqldb_sampledata', lines: ['Options > Connection:', 'lists tables, runs MDX'] });

d.panel({ x: 412, y: 16, w: 572, h: 330, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'after you publish' });
const cat = d.box({ x: 430, y: 82, w: BW, h: BH, role: 'model', iconName: 'box', title: 'Classic Models', lines: ['the published catalog:', 'DataSource =', 'hsqldb_sampledata'] });
const an = d.box({ x: 708, y: 82, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['queries the catalog'] });
const svc = d.box({ x: 430, y: 236, w: BW, h: BH, role: 'server', iconName: 'plug', title: 'hsqldb_sampledata', lines: ['Manage Data Sources:', 'the server\'s own', 'connection'] });

const hs = d.bar({ x: 16, y: 380, w: 968, h: 70, role: 'store', iconName: 'database', title: 'SampleData (HSQLDB), port 9001', line: 'both connections reach the same database, separately' });

d.arrow({ x1: sch.r, y1: sch.cy, x2: cat.x - 3, y2: cat.cy, straight: true });
d.pill((sch.r + cat.x) / 2, sch.cy - 34, ['Publish: you type', 'hsqldb_sampledata']);
d.arrow({ x1: an.x, y1: an.cy, x2: cat.r + 3, y2: cat.cy, straight: true });
d.arrow({ x1: cat.cx, y1: cat.b, x2: svc.cx, y2: svc.y - 3, vertical: true });
d.pill(cat.cx + 110, (cat.b + svc.y) / 2, ['found by that name']);
d.arrow({ x1: swc.cx, y1: swc.b, x2: swc.cx, y2: hs.y - 3, vertical: true });
d.arrow({ x1: svc.cx, y1: svc.b, x2: svc.cx, y2: hs.y - 3, vertical: true });

d.write(import.meta.url);
