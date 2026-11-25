// Before You Start, "How the pieces fit": what runs where, and who talks
// to whom. Facts: 01 (the four tools, two engines, two drivers), 09 (the
// job uploaded to the repository and scheduled; the driver in tomcat\lib),
// 10 (the sales_mart connection; Mondrian answers Analyzer). Ports: MySQL
// 3306, Pentaho Server 8080. Run: node lab-setup.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(980, 400);
const BW = 236, BH = 78;
d.panel({ x: 16, y: 16, w: 268, h: 368, role: 'tool', iconName: 'monitor', title: 'On your machine', sub: 'the tools you work in' });
d.panel({ x: 372, y: 16, w: 268, h: 368, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'http://localhost:8080/pentaho' });
d.panel({ x: 696, y: 16, w: 268, h: 368, role: 'store', iconName: 'container', title: 'MySQL, port 3306', sub: 'the lab kit\'s container' });
const sp = d.box({ x: 32, y: 78, w: BW, h: BH, role: 'tool', iconName: 'workflow', title: 'Spoon', lines: ['you build the', 'transformations and the job'] });
const an = d.box({ x: 32, y: 182, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'User Console', lines: ['you schedule the job, and', 'read the cube in Analyzer'] });
const db = d.box({ x: 32, y: 286, w: BW, h: BH, role: 'tool', iconName: 'terminal', title: 'DBeaver', lines: ['you create the tables and', 'check every load with SQL'] });
const jb = d.box({ x: 388, y: 78, w: BW, h: BH, role: 'server', iconName: 'calendar-clock', title: 'Scheduler and repository', lines: ['keeps the job and runs it', 'in its own PDI engine'] });
const mo = d.box({ x: 388, y: 182, w: BW, h: BH, role: 'server', iconName: 'boxes', title: 'Mondrian', lines: ['the Sales Mart cube;', 'answers Analyzer'] });
const st = d.box({ x: 712, y: 78, w: BW, h: BH, role: 'store', iconName: 'table-2', title: 'The mart', lines: ['mart_ and agg_ tables,', 'in sampledata'] });
d.arrow({ x1: sp.r, y1: sp.cy, x2: jb.x - 3, y2: jb.cy, straight: true, label: ['the job,', 'uploaded'] });
d.arrow({ x1: an.r, y1: an.cy, x2: mo.x - 3, y2: mo.cy, straight: true, label: ['queries'] });
d.arrow({ x1: jb.r, y1: jb.cy, x2: st.x - 3, y2: st.cy, straight: true, label: ['loads'] });
d.arrow({ x1: mo.r, y1: mo.cy, x2: st.cx - 50, y2: st.b + 3, elbow: true, label: ['SQL'], lx: 716, ly: mo.cy });
d.arrow({ x1: db.r, y1: db.cy, x2: st.cx + 50, y2: st.b + 3, elbow: true, label: ['SQL'], lx: 506, ly: db.cy });
d.write(import.meta.url);
