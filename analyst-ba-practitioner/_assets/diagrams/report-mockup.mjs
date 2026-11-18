// Helpers for this course's "what you'll build" diagrams: a mock-up of a
// finished report or analysis as the learner sees it in the User Console
// (report-sales-territory, report-orders-na-emea, report-ships-trains,
// analyzer-sales-analysis, analyzer-emea-quantity).
// They sit on top of the shared kit in scripts/diagram-kit.mjs and use
// only its colors (ROLE) and its raw() layer. This file draws nothing by
// itself and is not a diagram, so it does not end in d.write().
//
// A mock-up is drawn inside a kit panel, top to bottom: the page header
// text, the report title, a row of chips for the filters and prompts in
// force, then a grid of rows (group headers, column headings, data rows,
// subtotals and totals), then a legend. The grid is a plain table, not a
// screenshot: every value in it comes from the lesson, its solution file
// or its screenshots, as each diagram's header comment lists.
import { ROLE, esc, icon } from '../../../../scripts/diagram-kit.mjs';

// What each kind of grid row looks like, colored by role, the same in
// every mock-up so a reader learns it once:
//   head    column headings, and an Analyzer level's name    slate (support)
//   member  an Analyzer member heading (2003, QTR1, EMEA)     slate, light
//   group1  an outer group header ("Territory: NA")          teal (the model's grouping)
//   group2  an inner group header ("Country: Canada")        teal band
//   row     a data row                                        white (result)
//   alt     a data row, alternate shading                     white on slate panel
//   sub     a subtotal the report engine computes             violet (engine)
//   total   a grand total                                     violet, bold
//   gap     rows or groups left out of the mock-up            stone (not shown)
const S = ROLE.support, T = ROLE.join, V = ROLE.engine, W = ROLE.result, O = ROLE.off;
const KIND = {
  head: { fill: S.stroke, stroke: '#64748b', text: '#ffffff', weight: 600 },
  member: { fill: S.fill, stroke: '#cbd5e1', text: S.text, weight: 600 },
  group1: { fill: '#ffffff', stroke: '#ffffff', text: T.text, weight: 700, size: 13.5 },
  group2: { fill: T.fill, stroke: T.fill, text: T.text, weight: 600 },
  row: { fill: W.fill, stroke: '#e2e8f0', text: W.text, weight: 400 },
  alt: { fill: S.panel, stroke: '#e2e8f0', text: W.text, weight: 400 },
  sub: { fill: V.fill, stroke: V.fill, text: V.text, weight: 600 },
  total: { fill: V.fill, stroke: V.fill, text: V.text, weight: 700, outline: V.stroke },
  gap: { fill: O.panel, stroke: O.stroke, text: O.text, weight: 400, italic: true },
};

/** The default height of one grid row. */
export const ROW_H = 26;

// About how wide a string is at 12px in the kit's font stack (Segoe UI or
// Helvetica): about 6px a character, 6.6px when bold, a little over the measured widths. Used only to warn, while
// laying out, when a cell's text will not fit its column.
const textWidth = (s, bold, size = 12) => String(s).length * (bold ? 6.6 : 6.0) * (size / 12);

/**
 * The page header as the report prints it: `left` (the text the lesson
 * types into the header, "Steel Wheels, Inc.") in small slate type, and a
 * rule under it across the page. `right` is optional; the print date the
 * header also shows is left out, since it is the day the report runs.
 * Returns the y under the rule.
 */
export function pageHeader(d, { x, y, w, left, right }) {
  d.raw(`<text x="${x}" y="${y + 12}" font-size="12" fill="#334155">${esc(left)}</text>`);
  if (right) d.raw(`<text x="${x + w}" y="${y + 12}" text-anchor="end" font-size="12" fill="#64748b">${esc(right)}</text>`);
  d.raw(`<line x1="${x}" y1="${y + 20}" x2="${x + w}" y2="${y + 20}" stroke="#334155" stroke-width="1.2"/>`);
  return y + 20;
}

/** The report's title, 20px, centered on the page or at its left. Returns the y under it. */
export function reportTitle(d, { x, y, w, text, align = 'center' }) {
  const tx = align === 'center' ? x + w / 2 : x;
  const anchor = align === 'center' ? ' text-anchor="middle"' : '';
  d.raw(`<text x="${tx}" y="${y + 22}"${anchor} font-size="20" fill="#0f172a" letter-spacing="0.5">${esc(text)}</text>`);
  return y + 32;
}

/**
 * A row of chips for what restricts the report: a fixed filter (the
 * `filter` icon) or a prompt, a report parameter the viewer sets (the
 * `list-filter` icon, as in this folder's README). Amber, the browser:
 * both are set in the User Console. Each item is { kind, text }. Chips
 * wrap onto a second line if they would pass x + w. Returns the y under
 * the last line.
 */
export function chips(d, { x, y, w, items }) {
  const c = ROLE.check, H = 24;
  let cx = x, cy = y;
  items.forEach(({ kind, text }) => {
    const cw = 34 + textWidth(text, false) + 10;
    if (cx + cw > x + w && cx > x) { cx = x; cy += H + 6; }
    d.raw(`<rect x="${cx}" y="${cy}" width="${cw}" height="${H}" rx="12" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1"/>`);
    d.raw(icon(kind === 'prompt' ? 'list-filter' : 'filter', cx + 9, cy + 5, 14, c.stroke));
    d.raw(`<text x="${cx + 30}" y="${cy + 16}" font-size="12" fill="${c.text}">${esc(text)}</text>`);
    cx += cw + 8;
  });
  return cy + H;
}

/**
 * A grid of rows. `cols` gives each column's width and default
 * alignment ('left', 'center' or 'right'); the widths should add up to
 * the grid's width. Each row is { kind, cells, h }: `kind` a key of KIND,
 * `cells` one entry per column, each a string or
 *   { t, span, align, bold, bar, barMax, link, kind }
 * where `span` merges that many columns, `kind` styles that one cell as
 * another kind of row (an Analyzer row member in a data row), `bar` draws an Analyzer data
 * bar sized bar / barMax under the value, and `link` underlines the
 * value as a drill-through link. A `null` cell is covered by a merge
 * drawn with mergeDown() and draws nothing. A gap, group1 or group2 row
 * may give `text` instead of cells, spanning the whole grid. Returns
 * { y: the bottom, rowY: [each row's top] }.
 */
export function grid(d, { x, y, cols, rows }) {
  const total = cols.reduce((s, c) => s + c.w, 0);
  const rowY = [];
  let ry = y;
  rows.forEach((r) => {
    const k = KIND[r.kind];
    const h = r.h ?? ROW_H;
    rowY.push(ry);
    const ty = ry + h / 2 + 4.5;
    const style = (bold) => `font-size="${k.size ?? 12}" font-weight="${bold ? 700 : k.weight}"${k.italic ? ' font-style="italic"' : ''} fill="${k.text}"`;
    if (r.text !== undefined) {
      // A full-width row: a group header, or a note for rows left out.
      d.raw(`<rect x="${x}" y="${ry}" width="${total}" height="${h}" fill="${k.fill}" stroke="${k.stroke}" stroke-width="0.8"${r.kind === 'gap' ? ' stroke-dasharray="4 3"' : ''}/>`);
      if (r.kind === 'group1') d.raw(`<line x1="${x}" y1="${ry + h - 1}" x2="${x + total}" y2="${ry + h - 1}" stroke="${T.stroke}" stroke-width="1"/>`);
      const center = r.kind === 'gap';
      d.raw(`<text x="${center ? x + total / 2 : x + 8}" y="${ty}"${center ? ' text-anchor="middle"' : ''} ${style(false)}>${esc(r.text)}</text>`);
      if (textWidth(r.text, k.weight >= 600, k.size) > total - 16) console.warn(`grid: "${r.text}" is wider than the grid`);
      ry += h;
      return;
    }
    let cx = x, ci = 0;
    r.cells.forEach((cell) => {
      const o = cell === null ? null : typeof cell === 'object' ? cell : { t: cell };
      const span = o?.span ?? 1;
      const w = cols.slice(ci, ci + span).reduce((s, c) => s + c.w, 0);
      if (o) {
        const kc = o.kind ? KIND[o.kind] : k;
        const cstyle = (bold) => `font-size="12" font-weight="${bold ? 700 : kc.weight}"${kc.italic ? ' font-style="italic"' : ''} fill="${kc.text}"`;
        d.raw(`<rect x="${cx}" y="${ry}" width="${w}" height="${h}" fill="${kc.fill}" stroke="${kc.stroke}" stroke-width="0.8"/>`);
        if (o.bar !== undefined) {
          // The lesson's "Data Bar: Green": a bar from the cell's left
          // edge, its length the value's share of the column's largest
          // value; the longest stops 72px short of the right edge, so it
          // never runs under the right-aligned value.
          const g = ROLE.write, bw = (w - 76) * (o.bar / o.barMax);
          d.raw(`<rect x="${cx + 4}" y="${ry + 4}" width="${bw}" height="${h - 8}" rx="2" fill="${g.fill}" stroke="${g.stroke}" stroke-width="0.8"/>`);
        }
        const align = o.align ?? cols[ci].align ?? 'left';
        const tx = align === 'left' ? cx + 8 : align === 'right' ? cx + w - 8 : cx + w / 2;
        const anchor = align === 'left' ? '' : align === 'right' ? ' text-anchor="end"' : ' text-anchor="middle"';
        const deco = o.link ? ' text-decoration="underline"' : '';
        if (o.t !== undefined && o.t !== '') d.raw(`<text x="${tx}" y="${ty}"${anchor}${deco} ${o.kind ? cstyle(o.bold) : style(o.bold)}>${esc(o.t)}</text>`);
        if (textWidth(o.t ?? '', o.bold || kc.weight >= 600) > w - 14) console.warn(`grid: "${o.t}" is wider than its ${Math.round(w)}px column`);
      }
      cx += w;
      ci += span;
    });
    // A grand total gets one outline round the whole row.
    if (k.outline) d.raw(`<rect x="${x}" y="${ry}" width="${total}" height="${h}" fill="none" stroke="${k.outline}" stroke-width="1.2"/>`);
    ry += h;
  });
  return { y: ry, rowY };
}

/**
 * One cell merged down several rows, as Analyzer shows a row member
 * (EMEA) once beside all of its children: drawn over the grid at (x, y),
 * w x h, in the `member` style, its text centered vertically.
 */
export function mergeDown(d, { x, y, w, h, text }) {
  const k = KIND.member;
  d.raw(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${k.fill}" stroke="${k.stroke}" stroke-width="0.8"/>`);
  d.raw(`<text x="${x + 8}" y="${y + h / 2 + 4.5}" font-size="12" font-weight="${k.weight}" fill="${k.text}">${esc(text)}</text>`);
}

/**
 * A legend along the bottom: one swatch per row kind used, with its
 * meaning. Each item is [kind, text], or ['chip', text] for the amber
 * filter and prompt chips, or ['bar', text] for a data bar. Returns the
 * x after the last entry, to check it fits.
 */
export function legend(d, { x, y, items }) {
  let lx = x;
  items.forEach(([kind, text]) => {
    let fill, stroke;
    if (kind === 'chip') ({ fill, stroke } = ROLE.check);
    else if (kind === 'bar') ({ fill, stroke } = ROLE.write);
    else ({ fill, stroke } = KIND[kind]);
    d.raw(`<rect x="${lx}" y="${y}" width="20" height="14" rx="${kind === 'chip' ? 7 : 3}" fill="${fill}" stroke="${stroke === '#ffffff' ? T.stroke : kind === 'row' ? '#94a3b8' : stroke}" stroke-width="0.8"${kind === 'gap' ? ' stroke-dasharray="3 2"' : ''}/>`);
    d.raw(`<text x="${lx + 27}" y="${y + 11.5}" font-size="11.5" fill="#334155">${esc(text)}</text>`);
    lx += 27 + String(text).length * 5.7 + 22; // 11.5px text, about 5.7px a character
  });
  return lx;
}
