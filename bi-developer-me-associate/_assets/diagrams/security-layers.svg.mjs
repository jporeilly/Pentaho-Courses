// Overview of Security & Data Access: the three layers, where each is set
// in Metadata Editor and how the server enforces it. Proven 2026-11-12 on
// the Row-Level Security solution: Metadata Security is checked before a
// model, category or column is listed (the administrator passes every
// check); the role-based Data Constraint on the model becomes the WHERE
// clause (suzy: EMEA, admin: TRUE(), a role with no entry: FALSE()).
// Run: node security-layers.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 400);
const BW = 300, BH = 84;
const ROWS = [82, 186, 290];

d.panel({ x: 16, y: 16, w: 332, h: 376, role: 'tool', iconName: 'table-properties', title: 'Set in Metadata Editor', sub: 'saved in the domain, published with it' });
d.panel({ x: 392, y: 16, w: 332, h: 376, role: 'server', iconName: 'server', title: 'Enforced on the server', sub: 'for the signed-in user and roles' });
d.panel({ x: 768, y: 16, w: 316, h: 376, role: 'browser', iconName: 'table', title: 'What suzy gets', sub: 'Power User, in Interactive Reports' });

const SET = [
  ['Model access', 'box', ['Metadata Security on the', 'business model: Power User']],
  ['Column access', 'columns-3', ['Metadata Security on one', 'column: Credit Limit, admin only']],
  ['Row filter', 'filter', ['Data Constraint on the model,', 'one formula per role or user']],
];
const HOW = [
  ['Before listing', 'shield', ['no matching entry: the model', 'is not offered; admin passes']],
  ['Before listing', 'shield', ['the column is left out', 'of the field list']],
  ['In the SQL', 'database', ["the role's formula becomes the", 'WHERE clause; no admin bypass']],
];
const GET = [
  ['OrderStarCustomer', 'eye', ['listed as a data source']],
  ['No Credit Limit', 'eye-off', ['the field is not there']],
  ['EMEA only', 'list-filter', ['one territory; a role with', 'no entry gets no rows']],
];
ROWS.forEach((y, i) => {
  const a = d.box({ x: 32, y, w: BW, h: BH, role: 'tool', iconName: SET[i][1], title: SET[i][0], lines: SET[i][2] });
  const b = d.box({ x: 408, y, w: BW, h: BH, role: 'server', iconName: HOW[i][1], title: HOW[i][0], lines: HOW[i][2] });
  const c = d.box({ x: 776, y, w: BW, h: BH, role: 'browser', iconName: GET[i][1], title: GET[i][0], lines: GET[i][2] });
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
  d.arrow({ x1: b.r, y1: b.cy, x2: c.x - 3, y2: c.cy, straight: true });
});

d.write(import.meta.url);
