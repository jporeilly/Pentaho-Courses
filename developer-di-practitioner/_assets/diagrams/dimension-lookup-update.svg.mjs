// Slowly Changing Dimensions: what Dimension lookup/update decides for
// each incoming row, in update mode and in lookup mode.
//
// Every fact comes from 18-mod3-slowly-changing-dimensions/guide.md:
//   - The step finds a row by its natural key (id) and the stream date
//     (LAST_UPDATE, from Get System Info): the version of the key valid
//     at that date, in DIM_SCD.
//   - Update the dimension? selected (update mode), "What the step
//     decides for each row":
//       key not found: insert a new row, version 1, with a new technical
//         key (TK) from Use table maximum + 1;
//       nothing differs: do nothing (the row carries that version's TK);
//       an Update field differs: overwrite it on the current version
//         (type 1);
//       a Punch through field differs: overwrite the punch-through fields
//         on every version of the key;
//       an Insert field differs: close the current version (date_to = the
//         stream date) and insert version + 1 with a new TK (type 2).
//   - Update the dimension? cleared (lookup mode, run 1): the step only
//     reads. A key it finds returns its TK; London, not in the table,
//     came back with TK 0, the key the step keeps for "unknown", and the
//     step wrote nothing.
//
// Run from this folder:   node dimension-lookup-update.svg.mjs
// It writes dimension-lookup-update.svg here and
// ../images/dimension-lookup-update.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: three columns of same-size boxes, read left to right
// as the decision goes: the lookup, what it found, what the step does.
// The 96px gaps leave room for the "found" / "not found" labels.
const d = new Diagram(1096, 812);
const BW = 280, BH = 72, PITCH = 86; // PITCH: a box plus a 14px gap
const COL = [32, 408, 784];

// The lookup both modes start with: amber, a check against the table.
const lookup = (y) => d.box({ x: COL[0], y, w: BW, h: BH, role: 'check', iconName: 'scan-search', title: 'Look up id in DIM_SCD', lines: ['the version valid at the', 'stream date, LAST_UPDATE'] });

// ── Update mode ──────────────────────────────────────────────────────
// Five rows. Column 2 holds the four outcomes of a found key, rows 1-4;
// column 1 holds "insert version 1" in row 0 and the comparison in the
// middle of rows 1-4; the lookup sits between those two.
const A = 16;
d.panel({ x: 16, y: A, w: 1064, h: 56 + 4 * PITCH + BH + 16, role: 'support', title: 'Update the dimension? selected: update mode' });
const row = (i) => A + 56 + i * PITCH; // top of row i
const ins1 = d.box({ x: COL[1], y: row(0), w: BW, h: BH, role: 'write', iconName: 'plus', title: 'Insert version 1', lines: ['with a new technical key (TK):', 'table maximum + 1'] });
const cmp = d.box({ x: COL[1], y: (row(1) + row(4)) / 2, w: BW, h: BH, role: 'check', iconName: 'scale', title: 'Compare each field', lines: ['on the Fields tab with', 'that version'] });
const lu = lookup((ins1.cy + cmp.cy) / 2 - BH / 2);
// The four outcomes, top to bottom from the mildest to type 2. Updates
// and inserts are writes (green); "nothing differs" writes nothing, so
// it is the white of a plain result.
const out = [
  { role: 'result', iconName: 'equal', title: 'Nothing differs', lines: ['do nothing: the row', "carries that version's TK"] },
  { role: 'write', iconName: 'pencil', title: 'Update (type 1)', lines: ['an Update field differs:', 'overwrite the current version'] },
  { role: 'write', iconName: 'replace-all', title: 'Punch through', lines: ['a Punch through field differs:', 'overwrite every version'] },
  { role: 'write', iconName: 'history', title: 'Insert (type 2)', lines: ['an Insert field differs: close', 'it, insert version + 1, new TK'] },
].map((o, i) => d.box({ x: COL[2], y: row(i + 1), w: BW, h: BH, ...o }));

// The lookup's two answers, each labeled in the gap.
d.arrow({ x1: lu.r, y1: lu.cy - 10, x2: ins1.x - 3, y2: ins1.cy, label: 'not found' });
d.arrow({ x1: lu.r, y1: lu.cy + 10, x2: cmp.x - 3, y2: cmp.cy, label: 'found' });
// The comparison fans out to the four outcomes; each arrow leaves the
// comparison's right edge at its own height so the four do not bunch.
out.forEach((o, i) => d.arrow({ x1: cmp.r, y1: cmp.cy - 21 + i * 14, x2: o.x - 3, y2: o.cy }));

// ── Lookup mode ──────────────────────────────────────────────────────
// Two rows: the same lookup between its two answers. Nothing here is a
// write, so the answers are a white result and a stone "not involved".
// The answers sit 60px apart (not the 14px of panel A), so the two short
// arrows from the lookup rise and fall enough to show past their labels.
const GAP_B = 60;
const B = A + 56 + 4 * PITCH + BH + 16 + 16; // under panel A, with a 16px gap
d.panel({ x: 16, y: B, w: 1064, h: 56 + BH + GAP_B + BH + 16, role: 'support', title: 'Update the dimension? cleared: lookup mode' });
const found = d.box({ x: COL[1], y: B + 56, w: BW, h: BH, role: 'result', iconName: 'hash', title: 'Return its TK', lines: ['of the version valid at', 'the stream date'] });
const none = d.box({ x: COL[1], y: B + 56 + BH + GAP_B, w: BW, h: BH, role: 'off', iconName: 'circle-slash', title: 'Return TK 0', lines: ['the key for "unknown";', 'the step writes nothing'] });
const lu2 = lookup((found.cy + none.cy) / 2 - BH / 2);
d.arrow({ x1: lu2.r, y1: lu2.cy - 10, x2: found.x - 3, y2: found.cy, label: 'found' });
d.arrow({ x1: lu2.r, y1: lu2.cy + 10, x2: none.x - 3, y2: none.cy, label: 'not found' });

d.write(import.meta.url);
