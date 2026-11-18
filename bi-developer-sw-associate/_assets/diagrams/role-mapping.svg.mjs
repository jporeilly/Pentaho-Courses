// Mondrian Security: how a User Console user ends up with Mondrian grants -
// platform role, the lookup map in pentahoObjects.spring.xml, the schema's
// role of that exact name, and what the role then sees. The October review's
// suggestion: "the mapping is the step learners most often get wrong".
// Run: node role-mapping.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 494);
const PW = 250, BW = 230, BH = 72;
const COLS = [16, 290, 564, 838];
const ROWS = [86, 176, 266, 356];

const HEAD = [
  ['tool', 'user', 'User Console users', 'Users & Roles'],
  ['server', 'shield', 'Platform roles', 'Manage Roles'],
  ['model', 'key-round', 'Mondrian roles', 'the <Role> in your schema'],
  ['check', 'eye', 'What they see', 'in Sales_FY2003_2005'],
];
HEAD.forEach(([role, ic, t, sub], i) => d.panel({ x: COLS[i], y: 16, w: PW, h: 432, role, iconName: ic, title: t, sub }));

const DATA = [
  ['exec_user', 'Executive', 'Executive Role', ['everything:', 'SchemaGrant all']],
  ['sales_mgr', 'Sales Manager', 'Sales Manager Role', ['this cube only:', 'schema none, cube all']],
  ['region_mgr', 'Regional Manager', 'Regional Manager Role', ['NJ, NY and PA:', 'three MemberGrants']],
  ['analyst', 'Analyst', 'Analyst Role', ['Country to City,', 'no customers']],
];
DATA.forEach(([u, pr, mr, see], r) => {
  const y = ROWS[r];
  const a = d.box({ x: COLS[0] + 10, y, w: BW, h: BH, role: 'tool', iconName: 'user', title: u, lines: [] });
  const b = d.box({ x: COLS[1] + 10, y, w: BW, h: BH, role: 'server', iconName: 'shield', title: pr, lines: [] });
  const c = d.box({ x: COLS[2] + 10, y, w: BW, h: BH, role: 'model', iconName: 'key-round', title: mr, lines: [] });
  const e = d.box({ x: COLS[3] + 10, y, w: BW, h: BH, role: 'check', iconName: r === 3 ? 'eye-off' : 'eye', title: see[0], lines: [see[1]] });
  d.arrow({ x1: a.r, y1: a.cy, x2: b.x - 3, y2: b.cy, straight: true });
  d.arrow({ x1: b.r, y1: b.cy, x2: c.x - 3, y2: c.cy, straight: true });
  d.arrow({ x1: c.r, y1: c.cy, x2: e.x - 3, y2: e.cy, straight: true });
});
// The lookup map is the hop learners get wrong: say what it matches on.
d.pill(COLS[2] - 12, 472, ['lookup map: key = platform role, value = Mondrian role, character for character']);

d.write(import.meta.url);
