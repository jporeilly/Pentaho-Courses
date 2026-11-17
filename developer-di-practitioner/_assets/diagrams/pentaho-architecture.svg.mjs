// Components: the Data Integration client tools and the Pentaho Server.
// Run: node pentaho-architecture.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(736, 316);
const BW = 280, BH = 96;

d.panel({ x: 16, y: 16, w: 312, h: 284, role: 'tool', iconName: 'monitor', title: 'Pentaho Data Integration' });
const sp = d.box({ x: 32, y: 72, w: BW, h: BH, role: 'tool', iconName: 'workflow', title: 'Spoon', lines: ['client tool: Designer, Engine,', 'Scheduler, Repository Browser,', 'DB Explorer'] });
d.box({ x: 32, y: 188, w: BW, h: BH, role: 'tool', iconName: 'terminal', title: 'Pan, Kitchen, Carte', lines: ['standalone: run work', 'without the server'] });
const sv = d.box({ x: 440, y: 72, w: BW, h: BH, role: 'server', iconName: 'server', title: 'Pentaho Server', lines: ['Data Integration topology:', 'engine, repository,', 'Quartz scheduler,', 'security, monitoring'] });
const db = d.box({ x: 440, y: 204, w: BW, h: BH, role: 'store', iconName: 'database', title: 'System database' });

d.arrow({ x1: sp.r, y1: sp.cy, x2: sv.x - 3, y2: sv.cy, label: '.ktr, .kjb' });
d.arrow({ x1: sv.cx, y1: sv.b, x2: db.cx, y2: db.y - 3, vertical: true });

d.write(import.meta.url);
