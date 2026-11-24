// Adding Data Elements and Report Groups (07), "A group is a value
// change in sorted rows": the same four rows, sorted and unsorted, and
// the Group Header and Group Footer bands the engine prints around them.
// Sorted by PRODUCTLINE, each product line gets one header and one
// footer; unsorted, Classic Cars comes back after Motorcycles and starts
// a second "group". It sits after that Under the hood panel in
// 07-mod4-adding-elements-groups/guide.md, with a "Read the diagram"
// paragraph after it.
//
// Every fact comes from the course's own lessons:
//   - Lesson 07, "A group is a value change in sorted rows": the engine
//     reads rows in the order the query returned them and compares
//     PRODUCTLINE on each row with the one before; when the value
//     changes it prints the Group Footer for the old value, then the
//     Group Header for the new one. The bundle records only
//     group-fields="PRODUCTLINE". The query sorts by PRODUCTLINE first,
//     because unsorted rows produce a "group" every time the value flips
//     back.
//   - Lesson 07, "4. Group by product line": a group has a Group Header
//     and a Group Footer band for each section; the header prints
//     Product Line: $(PRODUCTLINE). The checkpoint after it: the first
//     heading is Product Line: Classic Cars. "A message field is a
//     template" names Motorcycles as the next line.
//   - Lesson 07, Troubleshooting, "The same product line has several
//     group headers": the rows aren't sorted by PRODUCTLINE; Query 1's
//     ORDER BY must start with PRODUCTLINE (lesson 05 writes it).
// The four rows are an illustration, not query output: three Classic
// Cars rows and one Motorcycles row, in two orders.
//
// Colors (strips.mjs): teal the group bands, white a Details row, red
// the second Classic Cars group that should not exist; the left panel is
// teal, the right red. Icons: `arrow-down-wide-narrow` a sort,
// `shuffle` unsorted rows, `layers` a group (as in report-bands).
//
// Run from this folder:   node group-by-sorted-rows.svg.mjs
// It writes group-by-sorted-rows.svg here and
// ../images/group-by-sorted-rows.png at twice the size.
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';
import { strip, STRIP_H, STRIP_GAP } from './strips.mjs';

const STEP = STRIP_H + STRIP_GAP;
const PANEL_W = 376, TOP = 16, PANEL_H = 62 + 18 + 10 * STEP + 10;
const d = new Diagram(800, TOP + PANEL_H + 16 + 62 + 16);

// One panel: the rows as the query returns them in a narrow column on
// the left, and the bands that print on the right. `bands` lists every
// strip in print order; a Details strip carries `row`, the index of the
// row it prints, and gets an arrow from that row's chip. `notes` puts a
// pill in the rows column on the line between strip at-1 and strip at,
// where PRODUCTLINE changes; `foot` is a line of text under the strips.
function side({ x, role, iconName, title, sub, rows, bands, notes = [], foot }) {
  d.panel({ x, y: TOP, w: PANEL_W, h: PANEL_H, role, iconName, title, sub });
  const RX = x + 16, RW = 124, BX = x + 168, BW = PANEL_W - 168 - 16;
  const y0 = TOP + 80;
  // Column headings.
  d.raw(`<text x="${RX}" y="${TOP + 70}" font-size="12" font-weight="700" fill="#334155">Rows, in query order</text>`);
  d.raw(`<text x="${BX}" y="${TOP + 70}" font-size="12" font-weight="700" fill="#334155">What prints</text>`);
  bands.forEach((b, i) => {
    const y = y0 + i * STEP;
    strip(d, { x: BX, y, w: BW, kind: b.kind, name: b.name, value: b.value });
    if (b.row === undefined) return;
    // The row's chip sits level with the Details strip it becomes:
    // its number in bold, then its PRODUCTLINE value.
    d.raw(`<rect x="${RX}" y="${y}" width="${RW}" height="${STRIP_H}" rx="5" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>`);
    d.raw(`<text x="${RX + 8}" y="${y + 15}" font-size="11.5" fill="#0f172a"><tspan font-weight="700">${b.row + 1}</tspan>  ${esc(rows[b.row])}</text>`);
    d.arrow({ x1: RX + RW, y1: y + STRIP_H / 2, x2: BX - 3, y2: y + STRIP_H / 2, straight: true });
  });
  // The change pills, between the footer that ends one group and the
  // header that starts the next.
  notes.forEach(({ at, label }) => d.pill(RX + RW / 2, y0 + at * STEP - STRIP_GAP / 2, label));
  // The panel's verdict, under its last strip.
  if (foot) d.raw(`<text x="${RX}" y="${y0 + bands.length * STEP + 22}" font-size="12.5" font-weight="700" fill="#134e4a">${esc(foot)}</text>`);
}

// Strip shorthands: a group header, a details row, a group footer.
const gh = (v, kind = 'group') => ({ kind, name: 'Group Header', value: v });
const dt = (v, row, kind = 'row') => ({ kind, name: 'Details', value: v, row });
const gf = (v, kind = 'group') => ({ kind, name: 'Group Footer', value: v });
const CC = 'Classic Cars', MO = 'Motorcycles';

// ── Left: sorted, one header and one footer per product line ──────────
side({
  x: 16, role: 'join', iconName: 'arrow-down-wide-narrow', title: 'Sorted rows', sub: 'ORDER BY PRODUCTLINE first',
  rows: [CC, CC, CC, MO],
  bands: [gh(CC), dt(CC, 0), dt(CC, 1), dt(CC, 2), gf(CC), gh(MO), dt(MO, 3), gf(MO)],
  notes: [{ at: 5, label: 'value changes' }],
  foot: 'One header and one footer per product line',
});

// ── Right: the same rows unsorted; Classic Cars flips back and the
// engine starts a second Classic Cars group, drawn red ────────────────
side({
  x: 408, role: 'reject', iconName: 'shuffle', title: 'Unsorted rows', sub: 'the same rows, PRODUCTLINE not sorted',
  rows: [CC, CC, MO, CC],
  bands: [gh(CC), dt(CC, 0), dt(CC, 1), gf(CC), gh(MO), dt(MO, 2), gf(MO), gh(CC, 'bad'), dt(CC, 3, 'bad'), gf(CC, 'bad')],
  notes: [{ at: 4, label: 'value changes' }, { at: 7, label: 'flips back' }],
});

// ── Underneath: all a group stores, and the rule the engine follows ──
d.bar({ x: 16, y: TOP + PANEL_H + 16, w: 768, h: 62, role: 'support', iconName: 'layers', title: 'The group stores only group-fields="PRODUCTLINE"', line: "each row is compared with the row before: a change prints the old value's footer, then the new one's header" });

d.write(import.meta.url);
