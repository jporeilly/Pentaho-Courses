// Review Joins: which rows each of the four join types keeps. Each row
// is a join: a small Venn of A and B with the kept parts filled, then
// the three kinds of row, teal where the join keeps them.
// Run: node join-types.svg.mjs
import { Diagram, ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 318);
const LW = 248, CW = 160, BH = 60, GAP = 12, PITCH = BH + 14;
const keep = ROLE.join, drop = ROLE.off;

const JOINS = [
  ['Inner join', 'rows that match in both', [false, true, false]],
  ['Left outer join', 'all of A', [true, true, false]],
  ['Right outer join', 'all of B', [false, true, true]],
  ['Full outer join', 'everything', [true, true, true]],
];
const CELLS = ['only in A', 'in A and B', 'only in B'];

// Two circles, A left and B right; the kept regions filled teal.
function venn(id, x, cy, [a, ab, b]) {
  const r = 15, ax = x + 22, bx = x + 40;
  const fill = (on) => (on ? keep.stroke : '#ffffff');
  return [
    `<defs><clipPath id="${id}a"><circle cx="${ax}" cy="${cy}" r="${r}"/></clipPath>`,
    `<mask id="${id}nb"><rect x="${x}" y="${cy - r}" width="70" height="${2 * r}" fill="#fff"/><circle cx="${bx}" cy="${cy}" r="${r}" fill="#000"/></mask>`,
    `<mask id="${id}na"><rect x="${x}" y="${cy - r}" width="70" height="${2 * r}" fill="#fff"/><circle cx="${ax}" cy="${cy}" r="${r}" fill="#000"/></mask></defs>`,
    `<circle cx="${ax}" cy="${cy}" r="${r}" fill="${fill(a)}" fill-opacity="0.55" mask="url(#${id}nb)"/>`,
    `<circle cx="${bx}" cy="${cy}" r="${r}" fill="${fill(b)}" fill-opacity="0.55" mask="url(#${id}na)"/>`,
    `<circle cx="${bx}" cy="${cy}" r="${r}" fill="${fill(ab)}" fill-opacity="0.55" clip-path="url(#${id}a)"/>`,
    `<circle cx="${ax}" cy="${cy}" r="${r}" fill="none" stroke="${keep.stroke}" stroke-width="1.5"/>`,
    `<circle cx="${bx}" cy="${cy}" r="${r}" fill="none" stroke="${keep.stroke}" stroke-width="1.5"/>`,
    `<text x="${ax - 6}" y="${cy + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="${keep.text}">A</text>`,
    `<text x="${bx + 6}" y="${cy + 4}" text-anchor="middle" font-size="10" font-weight="700" fill="${keep.text}">B</text>`,
  ].join('');
}

JOINS.forEach(([title, line, kept], i) => {
  const y = 16 + i * PITCH;
  // The join: a white box with the Venn where the icon disc would be.
  const b = d.box({ x: 16, y, w: LW, h: BH, role: 'result', title: '', lines: [] });
  d.raw(venn(`j${i}`, b.x + 8, b.cy, kept));
  d.raw(`<text x="${b.x + 84}" y="${b.cy - 3}" font-size="14" font-weight="700" fill="#0f172a">${esc(title)}</text>`);
  d.raw(`<text x="${b.x + 84}" y="${b.cy + 14}" font-size="12" fill="#0f172a">${esc(line)}</text>`);
  CELLS.forEach((c, j) => d.box({
    x: 16 + LW + 24 + j * (CW + GAP), y, w: CW, h: BH,
    role: kept[j] ? 'join' : 'off', title: c, center: true,
  }));
});

d.write(import.meta.url);
