// OrdersME: the six stages of building a metadata domain, in order, one
// tab each on the page. Read left to right, then right to left (the
// numbers say the order). Run: node domain-build-stages.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 220);
const BW = 232, BH = 72, COL = [16, 284, 552], ROW = [16, 132];

const STAGES = [
  ['source', 'cable', '1. Connect', ['to a data source']],
  ['source', 'import', '2. Import', ['physical tables and columns']],
  ['model', 'briefcase', '3. Define', ['the business model']],
  ['model', 'link', '4. Define', ['relationships']],
  ['check', 'folder-tree', '5. Build', ['business views']],
  ['server', 'upload', '6. Publish', ['to the Pentaho Server']],
];
// Row 1 runs left to right; row 2 comes back right to left.
const SLOT = [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [0, 1]];

const b = STAGES.map(([role, iconName, title, lines], i) => {
  const [c, r] = SLOT[i];
  return d.box({ x: COL[c], y: ROW[r], w: BW, h: BH, role, iconName, title, lines });
});
d.arrow({ x1: b[0].r, y1: b[0].cy, x2: b[1].x - 3, y2: b[1].cy });
d.arrow({ x1: b[1].r, y1: b[1].cy, x2: b[2].x - 3, y2: b[2].cy });
d.arrow({ x1: b[2].cx, y1: b[2].b, x2: b[3].cx, y2: b[3].y - 3, vertical: true });
d.arrow({ x1: b[3].x, y1: b[3].cy, x2: b[4].r + 3, y2: b[4].cy });
d.arrow({ x1: b[4].x, y1: b[4].cy, x2: b[5].r + 3, y2: b[5].cy });

d.write(import.meta.url);
