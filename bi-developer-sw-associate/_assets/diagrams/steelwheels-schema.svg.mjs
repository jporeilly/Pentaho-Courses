// SteelWheels workshop: the shape of the SteelWheels schema before the
// learner expands it in Schema Workbench - one cube, its fact table, five
// dimensions and two measures. Run: node steelwheels-schema.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 400);
const BW = 180, BH = 84;

// Row 0: the fact table, the cube, the measures.
const fact = d.box({ x: 16, y: 64, w: BW, h: BH, role: 'store', iconName: 'table-2', title: 'ORDERFACT', lines: ['the fact table:', 'one row per', 'order line'] });
const cube = d.box({ x: 330, y: 64, w: BW, h: BH, role: 'model', iconName: 'box', title: 'Sales_2003_2005', lines: ['the cube'] });
d.panel({ x: 556, y: 16, w: 428, h: 150, role: 'engine', iconName: 'sigma', title: 'Measures', sub: 'what you add up' });
const qty = d.box({ x: 572, y: 70, w: BW, h: BH, role: 'engine', iconName: 'sigma', title: 'Quantity', lines: ['sum of', 'QUANTITYORDERED'] });
const sales = d.box({ x: 788, y: 70, w: BW, h: BH, role: 'engine', iconName: 'sigma', title: 'Sales', lines: ['sum of', 'TOTALPRICE'] });

// Row 1: the five dimensions.
d.panel({ x: 16, y: 216, w: 968, h: 168, role: 'source', iconName: 'layers', title: 'Dimensions', sub: 'what you analyze by' });
const DIMS = [
  ['globe', 'MARKETS', ['Territory, Country,', 'State Province, City']],
  ['users', 'CUSTOMERS', ['Customer, with six', 'member properties']],
  ['car', 'PRODUCT', ['Line, Vendor']],
  ['calendar', 'TIME', ['Years, Quarters,', 'Months']],
  ['tag', 'ORDERSTATUS', ['Status: degenerate,', 'no table of its own']],
];
const dims = DIMS.map(([ic, t, lines], i) =>
  d.box({ x: 28 + i * (BW + 11), y: 280, w: BW, h: BH, role: 'source', iconName: ic, title: t, lines }));

d.arrow({ x1: cube.x, y1: cube.cy, x2: fact.r + 3, y2: fact.cy, straight: true });
d.pill((cube.x + fact.r) / 2, cube.cy, ['reads rows from']);
d.arrow({ x1: cube.r, y1: cube.cy, x2: qty.x - 3, y2: qty.cy, straight: true });
d.arrow({ x1: cube.cx, y1: cube.b, x2: cube.cx, y2: 216 - 3, vertical: true });
d.pill(cube.cx + 74, 190, ['five dimensions']);

d.write(import.meta.url);
