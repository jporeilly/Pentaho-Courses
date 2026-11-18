// Key Concepts: the data pipeline an OLAP cube sits at the end of - sources,
// Pentaho Data Integration, the star-schema data marts, Mondrian, and the
// tools people analyze with. Run: node data-pipeline.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 360);
const BW = 186, BH = 78, GAP = 34, PANEL_TOP = 16, PANEL_H = 328;
const col = (i) => 16 + i * (BW + GAP + 0);

const COLS = [
  { role: 'source', title: 'Sources', sub: 'where the data starts' },
  { role: 'engine', title: 'Data integration', sub: 'IT, with PDI' },
  { role: 'store', title: 'Data marts', sub: 'the warehouse' },
  { role: 'engine', title: 'OLAP engine', sub: 'on the Pentaho Server' },
  { role: 'browser', title: 'Analysis', sub: 'business users' },
];
COLS.forEach((c, i) => d.panel({ x: col(i) - 6, y: PANEL_TOP, w: BW + 12, h: PANEL_H, role: c.role, title: c.title, sub: c.sub }));

const src1 = d.box({ x: col(0), y: 90, w: BW, h: BH, role: 'source', iconName: 'building-2', title: 'Operational', lines: ['ERP, CRM, orders'] });
const src2 = d.box({ x: col(0), y: 210, w: BW, h: BH, role: 'source', iconName: 'files', title: 'Files and APIs', lines: ['CSV, JSON, XML'] });
const pdi = d.box({ x: col(1), y: 150, w: BW, h: BH, role: 'engine', iconName: 'workflow', title: 'Data Integration', lines: ['extract, clean,', 'conform, load'] });
const mart = d.box({ x: col(2), y: 150, w: BW, h: BH, role: 'store', iconName: 'star', title: 'Star schemas', lines: ['fact and dimension', 'tables, one per subject'] });
const mon = d.box({ x: col(3), y: 150, w: BW, h: BH, role: 'engine', iconName: 'cog', title: 'Mondrian', lines: ['your schema maps', 'cubes onto the marts'] });
const an = d.box({ x: col(4), y: 70, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['slice and dice'] });
const rp = d.box({ x: col(4), y: 160, w: BW, h: BH, role: 'browser', iconName: 'file-text', title: 'Reports', lines: ['Report Designer'] });
const db = d.box({ x: col(4), y: 250, w: BW, h: BH, role: 'browser', iconName: 'layout-dashboard', title: 'Dashboards', lines: ['CTools'] });

d.arrow({ x1: src1.r, y1: src1.cy, x2: pdi.x - 3, y2: pdi.cy - 12 });
d.arrow({ x1: src2.r, y1: src2.cy, x2: pdi.x - 3, y2: pdi.cy + 12 });
d.arrow({ x1: pdi.r, y1: pdi.cy, x2: mart.x - 3, y2: mart.cy });
d.arrow({ x1: mart.r, y1: mart.cy, x2: mon.x - 3, y2: mon.cy });
d.arrow({ x1: mon.r, y1: mon.cy - 14, x2: an.x - 3, y2: an.cy });
d.arrow({ x1: mon.r, y1: mon.cy, x2: rp.x - 3, y2: rp.cy });
d.arrow({ x1: mon.r, y1: mon.cy + 14, x2: db.x - 3, y2: db.cy });

d.write(import.meta.url);
