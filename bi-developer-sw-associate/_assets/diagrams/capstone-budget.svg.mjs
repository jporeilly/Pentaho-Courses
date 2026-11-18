// Capstone, Budget v Actual: the target design, as the lesson's "Required
// behavior" states it - one schema, one cube on QUADRANT_ACTUALS, two
// dimensions read from the fact table itself, three measures, a calculated
// member, a named set, and a role outside the cube. It replaces the schema
// half of the "Suggested shape" text block in
// 18-capstone-budget-v-actual/guide.md (the file tree stays as text).
//
// Every fact comes from that lesson (18-capstone-budget-v-actual):
//   - Inputs: QUADRANT_ACTUALS, 148 rows, one per region, department and
//     position, columns REGION, DEPARTMENT, POSITIONTITLE, ACTUAL, BUDGET,
//     VARIANCE; 4 regions, 7 departments, 37 position titles; VARIANCE is
//     BUDGET minus ACTUAL on every row.
//   - Requirement 1: schema Quadrant Budget, saved as quadrant-budget.xml,
//     one cube Budget_v_Actual, fact table QUADRANT_ACTUALS.
//   - Requirement 2: REGION, hierarchy Region (all member All Regions),
//     one level Region on REGION; DEPARTMENT, hierarchy Department (all
//     member All Departments), levels Department on DEPARTMENT and below it
//     Position on POSITIONTITLE; neither has a table of its own.
//   - Requirement 3: Actual, Budget and Variance, each the sum of its
//     column, whole-dollar currency, a negative variance in brackets.
//   - Requirement 4: Variance % on the measures, Variance divided by
//     Budget, a percentage with one decimal place.
//   - Requirement 5: Over Budget Departments, the departments whose
//     Variance is below zero, worked out from the data each time it is
//     used, never a typed list.
//   - Requirement 6: role Central Region Manager, sees only the
//     Budget_v_Actual cube and in it only the Central region; All Regions
//     shows Central's figures. Published on hsqldb_sampledata.
//   - Hints: a dimension on the fact table has no table and no foreignKey,
//     like ORDER STATUS in Extended Model.
//
// What the diagram deliberately leaves out, because the lesson's hints
// leave it to the learner: the MDX of Variance % and of the named set
// (Filter(...) syntax), the format strings, uniqueMembers on Position,
// which grant level gets access="none", and which rollupPolicy keeps the
// hidden regions out of All Regions. The role box states the behavior the
// requirement asks for ("All Regions shows Central's figures"), not the
// attribute that produces it.
//
// Colors follow the kit's roles: slate the schema around everything, teal
// the cube and its model parts (the fact table, the role), green the
// dimensions (as in the SME course's dimension-kinds diagram), violet the
// measures (as in steelwheels-schema), amber the named set (a check run on
// the data each time).
//
// Run from this folder:   node capstone-budget.svg.mjs
// It writes capstone-budget.svg here and ../images/capstone-budget.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and sizes: dimension boxes DW wide on the left, measure boxes MW
// wide on the right, the fact table in the middle.
const d = new Diagram(1100, 616);
const DW = 282, MW = 300, BH = 72;

// ── The schema ─────────────────────────────────────────────────────────
// Slate: it frames the cube and the role, which sits outside the cube.
d.panel({ x: 16, y: 16, w: 1068, h: 584, role: 'support', iconName: 'file-code', title: 'Quadrant Budget: the schema', sub: 'saved as capstone\\solution\\quadrant-budget.xml, published on hsqldb_sampledata' });

// ── The cube ───────────────────────────────────────────────────────────
// Teal: a model. Everything but the role lives inside it.
d.panel({ x: 32, y: 76, w: 1036, h: 392, role: 'model', iconName: 'box', title: 'Budget_v_Actual: the cube', sub: 'fact table QUADRANT_ACTUALS, 148 rows: one per region, department and position' });

// The fact table, its six columns labeled by the job each does: three to
// slice by (read by the two dimensions), three to measure.
const fact = d.entity({
  x: 398, y: 150, w: 300, role: 'model', iconName: 'table-2', title: 'QUADRANT_ACTUALS',
  fields: [
    ['to slice by', 'REGION', ''],
    ['to slice by', 'DEPARTMENT', ''],
    ['to slice by', 'POSITIONTITLE', ''],
    ['to measure', 'ACTUAL', ''],
    ['to measure', 'BUDGET', ''],
    ['to measure', 'VARIANCE', ''],
  ],
});

// The two dimensions, on the left. Both are degenerate: no table and no
// foreignKey, so the arrows from the fact table are dashed, with no key.
const reg = d.box({ x: 48, y: 132, w: DW, h: 88, role: 'store', iconName: 'globe', title: 'REGION', lines: ['hierarchy Region,', 'all member All Regions,', 'one level: Region on REGION'] });
const dep = d.box({ x: 48, y: 236, w: DW, h: 104, role: 'store', iconName: 'briefcase', title: 'DEPARTMENT', lines: ['hierarchy Department,', 'all member All Departments,', 'level Department on DEPARTMENT,', 'then Position on POSITIONTITLE'] });
d.arrow({ x1: fact.x, y1: fact.rowY(0), x2: reg.r + 3, y2: reg.cy, dashed: true });
d.arrow({ x1: fact.x, y1: fact.rowY(1), x2: dep.r + 3, y2: dep.cy - 10, dashed: true });
d.arrow({ x1: fact.x, y1: fact.rowY(2), x2: dep.r + 3, y2: dep.cy + 10, dashed: true });
// What makes them degenerate, under the two boxes.
d.pill(reg.cx, 384, ['Both on the fact table:', 'no table, no foreignKey, no join']);

// The table's shape, under it: the counts and how VARIANCE is signed.
d.pill(fact.cx, 372, ['4 regions, 7 departments, 37 position titles;', 'VARIANCE = BUDGET minus ACTUAL on every row']);

// ── Measures, the calculated member and the named set ──────────────────
// Right-hand column, top to bottom in the order the cube must hold them:
// measures, then the calculated member, then the named set.
const MX = 752;
const meas = d.box({ x: MX, y: 140, w: MW, h: BH, role: 'engine', iconName: 'sigma', title: 'Actual, Budget, Variance', lines: ['each the sum of its column;', 'whole dollars, negatives in brackets'] });
const pct = d.box({ x: MX, y: 240, w: MW, h: BH, role: 'engine', iconName: 'percent', title: 'Variance %  (calculated)', lines: ['Variance divided by Budget,', 'a percentage, one decimal place'] });
const set = d.box({ x: MX, y: 340, w: MW, h: BH, role: 'check', iconName: 'list-filter', title: 'Over Budget Departments', lines: ['named set: departments with', 'Variance below zero, each time'] });
// The three measure columns feed the measures box.
[3, 4, 5].forEach((r) => d.arrow({ x1: fact.r, y1: fact.rowY(r), x2: meas.x - 3, y2: meas.cy + (r - 4) * 18 }));
// Variance % is built from two of the measures: a short arrow down the
// column. The named set reads the Variance measure too, which its own
// box says; a second arrow would have to cross Variance % to reach it.
d.arrow({ x1: meas.cx, y1: meas.b, x2: pct.cx, y2: pct.y - 3, straight: true });
// The order rule from the hints, at the foot of the column.
d.pill(meas.cx, 440, ['in the cube, in this order: measures,', 'calculated members, named sets']);

// ── The role ───────────────────────────────────────────────────────────
// Outside the cube, in the schema: a Role is a child of Schema. Teal with
// the key icon, as in the role-mapping diagram. It states the behavior the
// requirement asks for, not the grants that produce it.
const role = d.box({ x: 48, y: 496, w: 480, h: 84, role: 'model', iconName: 'key-round', title: 'Central Region Manager  (role)', lines: ['sees only the Budget_v_Actual cube,', 'and in it only the Central region;', "All Regions shows Central's figures"] });
d.arrow({ x1: role.r, y1: role.cy, x2: 640, y2: 468 + 3, elbow: true, dashed: true, label: 'restricts', lx: 578, ly: role.cy });
// What the role's users see of the named set, from the lesson's checks.
d.pill(880, 538, ['the same named set, worked out', 'for Central only, is shorter']);

d.write(import.meta.url);
