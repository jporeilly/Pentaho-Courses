// Overview of Data Security, "Security grants": how the grants nest, drawn
// on the course's own Miniature Models schema rather than a borrowed
// Adventure Works picture. Left: the Regional Manager Role, every level of
// grant inside the one above it, from SchemaGrant down to MemberGrant.
// Right: the Analyst Role's HierarchyGrant, which bounds the Customers
// hierarchy with topLevel and bottomLevel. Underneath: the two rules the
// lesson calls out. It replaces security.png (the grant levels) and
// security_top_and_bottom.png (the topLevel / bottomLevel ladder) in
// 13-data-security/guide.md.
//
// Every fact comes from the course's own lessons and lab files:
//   - 13-data-security, "Security grants": grants are filters and nest from
//     the schema down to individual members; the level table (SchemaGrant
//     the entire schema, CubeGrant individual cubes, DimensionGrant /
//     HierarchyGrant dimensions and hierarchies with topLevel and
//     bottomLevel, MemberGrant specific members); the warning that a role
//     granted something is implicitly granted its parent, so schema
//     access="none" plus a granted cube gives the role that schema too;
//     tab 3, topLevel hides upper levels and bottomLevel lower ones, both
//     need access="custom"; tab 4, order matters: granting a child then
//     denying the parent makes the child inaccessible, denying a parent
//     denies its children (you can then re-grant a few), granting a child
//     implicitly grants its parents.
//   - 14-data-security-mondrian-security, tab 4: the Regional Manager Role,
//     SchemaGrant access="none" > CubeGrant cube="Sales_FY2003_2005"
//     access="all" > HierarchyGrant [CUSTOMERS.Customers] access="custom"
//     topLevel="[CUSTOMERS.Customers].[State]" > three MemberGrants
//     access="all" on [NA].[USA].[NJ], [NY] and [PA]; and a second
//     HierarchyGrant [PRODUCTS.Products] access="all".
//   - 14, tab 3 and its Under the hood "custom without MemberGrants": the
//     Analyst Role's HierarchyGrant on [CUSTOMERS.Customers], access custom,
//     topLevel Country, bottomLevel City, no MemberGrant; Mondrian denies
//     anything above Country or below City, so no rows for Territory or
//     Customer Name.
//   - The Customers hierarchy's levels, Territory, Country, State, City,
//     Customer Name: the lab's solution, 14-.../files/solution/
//     miniaturemodels-security.xml.
//
// Colors follow the kit's roles: teal the Mondrian role (as in
// role-mapping), slate the grant containers, amber what the role can see
// (as in role-mapping's "What they see"), stone what it can't.
//
// Run from this folder:   node grant-nesting.svg.mjs
// It writes grant-nesting.svg here and ../images/grant-nesting.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 652);

// ── Left: one role, every level of grant nested ────────────────────────
// Four panels, each 16px inside the one above, so the nesting reads at a
// glance. Each title is the element with its attributes as the XML has
// them; each subtitle says what that level does in this role.
d.panel({ x: 16, y: 16, w: 660, h: 480, role: 'model', iconName: 'key-round', title: '<Role name="Regional Manager Role">', sub: 'in the Miniature Models schema (Mondrian Security, tab 4)' });
d.panel({ x: 32, y: 76, w: 628, h: 404, role: 'support', iconName: 'file-code', title: 'SchemaGrant access="none"', sub: 'the entire schema: every cube hidden ...' });
d.panel({ x: 48, y: 136, w: 596, h: 328, role: 'support', iconName: 'box', title: 'CubeGrant cube="Sales_FY2003_2005" access="all"', sub: '... except this one cube' });
d.panel({ x: 64, y: 196, w: 564, h: 164, role: 'support', iconName: 'list-tree', title: 'HierarchyGrant [CUSTOMERS.Customers] access="custom"', sub: 'topLevel [CUSTOMERS.Customers].[State]: only the members granted below' });

// The three MemberGrants, side by side inside the Customers grant: amber,
// the members this role sees.
const MW = 166, MG = (532 - 3 * MW) / 2;
['NJ', 'NY', 'PA'].forEach((st, i) => d.box({
  x: 80 + i * (MW + MG), y: 264, w: MW, h: 76, role: 'check', iconName: 'map-pin',
  title: st, lines: ['MemberGrant', 'access="all"'],
}));

// The second HierarchyGrant: Products, wide open, under the Customers one.
d.box({ x: 64, y: 376, w: 564, h: 72, role: 'check', iconName: 'car', title: 'HierarchyGrant [PRODUCTS.Products] access="all"', lines: ['every product, every level'] });

// ── Right: topLevel and bottomLevel ────────────────────────────────────
// The Analyst Role's Customers grant: the hierarchy's five levels, top to
// bottom, amber where visible and stone where the grant cuts them off.
d.panel({ x: 700, y: 16, w: 384, h: 480, role: 'support', iconName: 'layers', title: 'Analyst Role: topLevel, bottomLevel', sub: '[CUSTOMERS.Customers], custom, no MemberGrant' });
const LEVELS = [
  ['Territory', 'hidden: above topLevel', false],
  ['Country', 'topLevel: visible', true],
  ['State', 'visible', true],
  ['City', 'bottomLevel: visible', true],
  ['Customer Name', 'hidden: below bottomLevel', false],
];
const lv = LEVELS.map(([name, note, on], i) => d.box({
  x: 716, y: 80 + i * 82, w: 352, h: 64, role: on ? 'check' : 'off',
  iconName: on ? 'eye' : 'eye-off', title: name, lines: [note],
}));
// Each level above the next: plain lines, no heads (a hierarchy).
for (let i = 0; i < 4; i++) d.arrow({ x1: lv[i].cx, y1: lv[i].b, x2: lv[i + 1].cx, y2: lv[i + 1].y, straight: true, head: false });

// ── The two rules ──────────────────────────────────────────────────────
// Full-width bars under both halves: slate, supporting rules that apply
// at every level of the nesting.
d.bar({
  x: 16, y: 512, w: 1068, h: 56, role: 'support', iconName: 'arrow-up-from-line',
  title: 'Grant a child, get the parent implicitly',
  line: 'the CubeGrant opens Sales_FY2003_2005, so the role reaches the schema too, despite SchemaGrant access="none"',
});
d.bar({
  x: 16, y: 580, w: 1068, h: 56, role: 'support', iconName: 'list-ordered',
  title: 'Order matters among MemberGrants',
  line: 'deny a parent and its children go with it (then re-grant a few); grant a child, then deny its parent, and the child is lost',
});

d.write(import.meta.url);
