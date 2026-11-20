// Concept Editor (09), "1. Define Concepts": the concept tree the workshop
// builds and how one business column's properties are resolved. It sits
// after the "Concepts inherit down a chain" panel in
// 09-concepts-concept-editor/guide.md, with a "Read the diagram"
// paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 08 (08-concepts), "The Base Concept" and "Default Concept":
//     Base is the parent of every physical column and holds the baseline
//     properties, for example the font and the text alignment. It cannot
//     be deleted from the concept list.
//   - Lesson 09, steps 5 to 18 and the checkpoint table: Number (parent
//     Base) adds Text Alignment Right and Mask for Number or Date #,##0;
//     USCurrency (parent Number) overrides only the mask, with
//     $#,##0.00;($#,##0.00); ID (parent Number) overrides the mask with #;
//     Hidden (parent ID) adds Hidden For the User?, selected; Date
//     (parent Base, not Number) adds the mask MM-dd-yyyy. The Date
//     screenshot shows the inherited Text Alignment Left, which is Base's.
//   - Lesson 09, "Concepts inherit down a chain": the engine walks the
//     chain, each concept starting from its parent's properties and
//     adding its own. A column whose parent concept is Hidden gets the #
//     mask from ID, the alignment from Number, the font from Base and
//     Hidden For the User? from Hidden. A column's own overrides win over
//     anything a concept supplies, and a concept's properties win over
//     what the column inherits from its physical column.
//   - Lesson 09, "2. Apply Concepts" and "4. Interactive Report":
//     Employee Number (Customers) is set to Hidden, so it carries the
//     flag. Interactive Reports on 11.0.0.3 still lists it: the server's
//     loadModel never passes the flag on (docs/ME-screenshot-shotlist.md),
//     so the bar says "flagged", not "not listed".
//
// Colors: teal the concepts (part of the model); blue the override you
// set on the business column in the editor; slate the physical column,
// the fallback underneath; white the result. Icons: `tag` a concept,
// `pencil` an override, `columns-3` a column, `eye-off` a column flagged hidden.
//
// Run from this folder:   node concept-chain.svg.mjs
// It writes concept-chain.svg here and ../images/concept-chain.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas: 800 wide, the reading column. Two panels stacked: the concept
// tree on top, the resolution order for one column underneath.
const W = 800;
const d = new Diagram(W, 576);

// ── Top panel: the concept tree, read left to right ───────────────────
// Four columns of title-only boxes (no icon, so the masks fit): Base,
// then its children, then theirs. 4 x 160 + 3 x 32 = 736, the panel's
// inner width.
const TW = 160, TH = 64;
const TC = [32, 224, 416, 608]; // left edge of each tree level
const TR = (i) => 76 + i * 80; // top of tree row i (fractions allowed)
d.panel({ x: 16, y: 16, w: W - 32, h: 300, role: 'model', iconName: 'tags', title: 'The concept tree', sub: 'each concept starts from its parent and adds its own settings' });

// A concept box: level `c`, row `r`, its name and what it adds.
const concept = (c, r, title, lines) => d.box({ x: TC[c], y: TR(r), w: TW, h: TH, role: 'model', title, lines });

// Level 0: Base, centered between its two children.
const base = concept(0, 1.25, 'Base', ['font and Text', 'Alignment Left']);
// Level 1: Number on the upper branch, Date on its own below.
const num = concept(1, 0.5, 'Number', ['adds Text Alignment', 'Right, mask #,##0']);
const date = concept(1, 2, 'Date', ['adds the mask', 'MM-dd-yyyy']);
// Level 2: Number's two children.
const usd = concept(2, 0, 'USCurrency', ['overrides the mask:', '$#,##0.00;($#,##0.00)']);
const id = concept(2, 1, 'ID', ['overrides the mask:', '#']);
// Level 3: Hidden, under ID.
const hid = concept(3, 1, 'Hidden', ['adds Hidden For the', 'User?, selected']);

// Parent to child: the properties flow down the tree. Each arrow leaves
// the parent's right edge and arrives at the child's left edge (the -3
// keeps the arrowhead off the box's border).
for (const [p, c] of [[base, num], [base, date], [num, usd], [num, id], [id, hid]]) {
  d.arrow({ x1: p.r, y1: p.cy, x2: c.x - 3, y2: c.cy });
}

// ── Bottom panel: where one column's property comes from ──────────────
// Three same-size boxes, checked left to right: the first one that sets
// the property wins. 3 x 224 + 2 x 32 = 736.
const BW = 224, BH = 72, BY = 392;
const BX = [32, 288, 544];
d.panel({ x: 16, y: 332, w: W - 32, h: 228, role: 'support', iconName: 'columns-3', title: 'Where a business column gets a property', sub: 'checked left to right: the first that sets it wins' });

const own = d.box({ x: BX[0], y: BY, w: BW, h: BH, role: 'tool', iconName: 'pencil', title: '1. Its own override', lines: ['set on the business', 'column: wins over all'] });
const chain = d.box({ x: BX[1], y: BY, w: BW, h: BH, role: 'model', iconName: 'tag', title: '2. Its parent concept', lines: ['and up the chain:', 'Hidden, ID, Number, Base'] });
const phys = d.box({ x: BX[2], y: BY, w: BW, h: BH, role: 'support', iconName: 'columns-3', title: '3. Its physical column', lines: ['what the business', 'column inherits'] });

// Not set here: go on to the next source. No pills: the 32px gaps are
// too narrow, and the panel's subtitle says what the arrows mean.
d.arrow({ x1: own.r, y1: own.cy, x2: chain.x - 3, y2: chain.cy, straight: true });
d.arrow({ x1: chain.r, y1: chain.cy, x2: phys.x - 3, y2: phys.cy, straight: true });

// The worked example from lesson 09: Employee Number on Hidden, which
// sets no override of its own, so every property comes from the chain.
d.bar({ x: 32, y: 484, w: W - 64, h: 60, role: 'result', iconName: 'eye-off', title: 'Employee Number, parent concept Hidden: flagged Hidden For the User?', line: 'Hidden For the User? from Hidden, the # mask from ID, Text Alignment Right from Number, the font from Base' });

d.write(import.meta.url);
