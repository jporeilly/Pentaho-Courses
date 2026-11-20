// Domains and Models: the three layers of a metadata domain. Physical
// tables map to business tables, and business tables feed the business
// view's categories. Run: node domain-layers.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(972, 364);
const PW = 260, BW = 228, BH = 56, GAP = 80;
const X = [16, 16 + PW + GAP, 16 + 2 * (PW + GAP)];
const rowY = (i) => 72 + i * 68;

d.panel({ x: X[0], y: 16, w: PW, h: 332, role: 'source', iconName: 'database', title: 'Physical Layer', sub: 'connections, tables, columns' });
d.panel({ x: X[1], y: 16, w: PW, h: 332, role: 'model', iconName: 'briefcase', title: 'Abstract Business Layer', sub: 'business models and tables' });
d.panel({ x: X[2], y: 16, w: PW, h: 332, role: 'check', iconName: 'folder-tree', title: 'Business View', sub: 'categories users see' });

const cats = ['Category1', 'Category2', 'Customers East', 'Customers West']
  .map((t, i) => d.box({ x: X[2] + 16, y: rowY(i), w: BW, h: BH, role: 'check', iconName: 'folder', title: t }));
const pairY = (a, b) => (cats[a].cy + cats[b].cy) / 2 - BH / 2;

[['Table1', 'Business Table1', 0, 1], ['CUST_TBL', 'Customers', 2, 3]].forEach(([phys, biz, a, b]) => {
  const p = d.box({ x: X[0] + 16, y: pairY(a, b), w: BW, h: BH, role: 'source', iconName: 'table-2', title: phys });
  const t = d.box({ x: X[1] + 16, y: pairY(a, b), w: BW, h: BH, role: 'model', iconName: 'briefcase', title: biz });
  d.arrow({ x1: p.r, y1: p.cy, x2: t.x - 3, y2: t.cy });
  d.arrow({ x1: t.r, y1: t.cy, x2: cats[a].x - 3, y2: cats[a].cy });
  d.arrow({ x1: t.r, y1: t.cy, x2: cats[b].x - 3, y2: cats[b].cy });
});

d.write(import.meta.url);
