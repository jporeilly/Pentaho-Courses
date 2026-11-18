// Mondrian Security, tab 5 (Rollup Policies): the same grant under the three
// rollup policies, side by side, with the totals the lesson measured. It sits
// after the "What each policy did with the same grant" Under the hood box in
// 14-data-security-mondrian-security/guide.md, tab 5.
//
// Every fact comes from that lesson (14-data-security-mondrian-security):
//   - Tab 4, "MemberGrant (Regional Manager)": the grant is three
//     MemberGrants with access="all" on [CUSTOMERS.Customers].[NA].[USA].[NJ],
//     .[NY] and .[PA], inside a HierarchyGrant with access="custom". Its
//     Under the hood box gives the three states' Sales: NJ 83,228.19,
//     NY 646,343.76 and PA 273,327.27 (sum 1,002,899.22).
//   - Tab 5, the policy table: full is the default when a HierarchyGrant has
//     no rollupPolicy and shows the complete total including hidden members;
//     partial shows the total of the visible members only; hidden hides a
//     total completely if any of its children is hidden.
//   - Tab 5, Under the hood "What each policy did with the same grant": the
//     grant with no topLevel, so the ancestors stay visible; full (or no
//     policy): All Customers 10,645,949.18, NA 3,852,061.39, USA
//     3,627,982.83; partial: All Customers, NA and USA each 1,002,899.22;
//     hidden: all three empty. USA minus the three visible states is
//     2,625,083.61 (3,627,982.83 - 1,002,899.22), which is the leak.
//   - The hierarchy's levels and all member (All Customers, Territory NA,
//     Country USA, State) come from the lab's solution schema,
//     files/solution/miniaturemodels-security.xml.
//
// Colors follow the kit's roles: amber (check) the members the role can
// see, red (reject) totals that give away hidden data, white (result) a
// total that is safe to show, stone (off) a total Mondrian leaves empty.
//
// Run from this folder:   node rollup-policies.svg.mjs
// It writes rollup-policies.svg here and ../images/rollup-policies.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: three equal columns of PW, 18px apart, under a full-width bar
// that states the grant all three columns share.
const d = new Diagram(1100, 632);
const PW = 344, GAP = 18;
const COL = [16, 16 + PW + GAP, 16 + 2 * (PW + GAP)];
// Ancestor boxes (All Customers, NA, USA) span the column less a 16px
// inset each side; the three state boxes share that width.
const AW = PW - 32, AH = 60;
const SW = 92, SH = 56;
const ROW = { all: 162, na: 238, usa: 314, state: 408, note: 500 };

// ── The grant all three columns share ──────────────────────────────────
// Slate: a supporting fact, not one of the policies. It names the three
// MemberGrants and why the ancestors stay on screen (no topLevel).
d.bar({
  x: 16, y: 16, w: 1068, h: 64, role: 'support', iconName: 'key-round',
  title: 'One grant, three policies: MemberGrant access="all" on NJ, NY and PA',
  line: 'HierarchyGrant on [CUSTOMERS.Customers], access="custom", no topLevel: All Customers, NA and USA stay visible',
});

// ── The three columns ──────────────────────────────────────────────────
// Each entry: the panel title and subtitle (the lesson's policy table in
// a few words), the role and value line of each ancestor, and the note
// at the foot of the column.
const POLICIES = [
  {
    title: 'rollupPolicy="full"', sub: 'the default: totals include hidden members',
    tone: 'reject', values: ['10,645,949.18', '3,852,061.39', '3,627,982.83'],
    note: { role: 'reject', icon: 'triangle-alert', title: 'The leak: 2,625,083.61', lines: ['USA 3,627,982.83 minus the', 'three visible states'] },
  },
  {
    title: 'rollupPolicy="partial"', sub: 'totals of the visible members only',
    tone: 'result', values: ['1,002,899.22', '1,002,899.22', '1,002,899.22'],
    note: { role: 'result', icon: 'shield-check', title: 'Each total = NJ + NY + PA', lines: ['nothing hidden can be', 'worked out'] },
  },
  {
    title: 'rollupPolicy="hidden"', sub: 'no total over a hidden child',
    tone: 'off', values: ['(empty)', '(empty)', '(empty)'],
    note: { role: 'result', icon: 'shield-off', title: 'No totals at all', lines: ['the most restrictive:', 'only the states show'] },
  },
];

// The ancestors, top to bottom, with an icon each: users for the all
// member (the Customers hierarchy), globe for the territory, flag for
// the country.
const ANCESTORS = [
  ['users', 'All Customers', ROW.all],
  ['globe', 'NA', ROW.na],
  ['flag', 'USA', ROW.usa],
];
// The granted states and their Sales (tab 4's Under the hood): the same
// in every column, since every policy shows the granted members.
const STATES = [['NJ', '83,228.19'], ['NY', '646,343.76'], ['PA', '273,327.27']];

POLICIES.forEach((p, c) => {
  const x = COL[c];
  // The column's panel: slate, so the colored boxes inside carry the
  // meaning. Its title is the attribute exactly as it goes in the XML.
  d.panel({ x, y: 100, w: PW, h: 488, role: 'support', iconName: 'layers', title: p.title, sub: p.sub });

  // The three ancestors, each showing the Sales this policy gives it.
  const anc = ANCESTORS.map(([ic, name, y], i) =>
    d.box({ x: x + 16, y, w: AW, h: AH, role: p.tone, iconName: ic, title: name, lines: [`Sales ${p.values[i]}`] }));
  // Parent to child: plain lines, no heads (a hierarchy, not a flow).
  for (let i = 0; i < 2; i++) d.arrow({ x1: anc[i].cx, y1: anc[i].b, x2: anc[i + 1].cx, y2: anc[i + 1].y, straight: true, head: false });

  // The three granted states, side by side under USA, centered text.
  const sx0 = x + 16, sgap = (AW - 3 * SW) / 2;
  STATES.forEach(([st, v], i) => {
    const s = d.box({ x: sx0 + i * (SW + sgap), y: ROW.state, w: SW, h: SH, role: 'check', title: st, lines: [v], center: true });
    // USA's foot to each state's top: a fan of plain lines.
    d.arrow({ x1: anc[2].cx, y1: anc[2].b, x2: s.cx, y2: s.y, vertical: true, head: false });
  });

  // The column's note: what a user with this policy can and can't learn.
  d.box({ x: x + 16, y: ROW.note, w: AW, h: 72, role: p.note.role, iconName: p.note.icon, title: p.note.title, lines: p.note.lines });
});

// A key for the state boxes, under the columns: amber means granted and
// visible, the same in all three.
d.raw(`<text x="550" y="614" text-anchor="middle" font-size="12" fill="#475569">Amber: the granted states, visible under every policy. The policy only decides what their ancestors show.</text>`);

d.write(import.meta.url);
