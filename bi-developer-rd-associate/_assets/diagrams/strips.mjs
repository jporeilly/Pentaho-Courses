// Band-strip helpers for this course's diagrams of a printed report
// (report-bands, group-by-sorted-rows, subreport-runs). They sit on top
// of the shared kit in scripts/diagram-kit.mjs and use only its colors
// (ROLE) and its raw() layer: a "strip" is one band as it prints on a
// page, drawn as a thin rounded bar with the band's name on the left and
// what it prints on the right. This file draws nothing by itself and is
// not a diagram, so it does not end in d.write().
import { ROLE, esc } from '../../../../scripts/diagram-kit.mjs';

// The color of each kind of band, the same in every diagram that draws
// strips, so a reader learns it once:
//   page   (Page Header, Page Footer)            slate: page furniture
//   report (Report Header, Report Footer)        blue
//   group  (Group Header, Details Header, Group Footer)  teal
//   row    (Details)                             white: one data row
//   gap    (pages or groups left out)            stone: not drawn
//   bad    (a wrong second group)                red
export const BAND = {
  page: 'support',
  report: 'tool',
  group: 'join',
  row: 'result',
  gap: 'off',
  bad: 'reject',
};

/** The height of one strip, and the gap left under it by `stack`. */
export const STRIP_H = 22;
export const STRIP_GAP = 4;

/**
 * One band as printed: a rounded bar at (x, y), `w` wide, colored by
 * `kind` (a key of BAND), with `name` in bold on the left and `value`
 * right-aligned. `dashed` draws its outline dashed, for a strip that
 * stands for several left out. Returns the strip's geometry.
 */
export function strip(d, { x, y, w, h = STRIP_H, kind, name, value = '', dashed = false }) {
  const c = ROLE[BAND[kind]];
  // The bar: the role's fill and stroke, a little rounder than a box.
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.2"${dashed ? ' stroke-dasharray="4 3"' : ''}/>`);
  // The band's name on the left, bold, and what it prints on the right.
  const ty = y + h / 2 + 4;
  d.raw(`<text x="${x + 8}" y="${ty}" font-size="11.5" font-weight="700" fill="${c.text}">${esc(name)}</text>`);
  if (value) d.raw(`<text x="${x + w - 8}" y="${ty}" text-anchor="end" font-size="11.5" fill="${c.text}">${esc(value)}</text>`);
  return { x, y, w, h, cy: y + h / 2, r: x + w, b: y + h };
}

/**
 * A column of strips, top to bottom from y, each STRIP_GAP under the one
 * before. `items` holds strip() options without x, y and w. Returns the
 * strips' geometry in order, so a caller can point at one.
 */
export function stack(d, { x, y, w, items }) {
  return items.map((it, i) => strip(d, { ...it, x, y: y + i * (STRIP_H + STRIP_GAP), w }));
}
