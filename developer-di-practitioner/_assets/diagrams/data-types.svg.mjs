// Key Concepts, Data Types: each Pentaho Data Integration type and the
// Java type behind it, grouped into families. The table under the figure
// on the page keeps the descriptions and examples.
// Run: node data-types.svg.mjs
import { Diagram, esc } from '../../../../scripts/diagram-kit.mjs';

const FAMILIES = [
  // title, role, icon, [PDI type, Java type, note]
  ['Numbers', 'engine', 'hash', [['Integer', 'Long', 'signed 64-bit whole number'], ['Number', 'Double', '64-bit floating point'], ['BigNumber', 'BigDecimal', 'unlimited precision']]],
  ['Text', 'source', 'type', [['String', 'String', 'any length, UTF-8']]],
  ['Date and time', 'check', 'calendar-clock', [['Date', 'Date', 'to the millisecond'], ['Timestamp', 'Timestamp', 'to the nanosecond']]],
  ['Other values', 'support', 'boxes', [['Boolean', 'Boolean', 'true or false'], ['Binary', 'Byte[]', 'any bytes: an image, a zip'], ['Internet Address', 'InetAddress', 'an IP address'], ['Hierarchical', 'BinaryTree', 'a tree of related items (EE)']]],
];

const PW = 470, GAP = 16, X0 = 16, Y0 = 16, HEAD = 36, RH = 46, PAD = 12;
const height = (n) => HEAD + 10 + n * RH + PAD;
// Two columns: Numbers above Text on the left, the rest on the right.
const layout = [[0, 1], [2, 3]];
const colY = [Y0, Y0];
const boxes = [];
layout.forEach((ids, c) => ids.forEach((i) => {
  const [title, role, iconName, rows] = FAMILIES[i];
  const x = X0 + c * (PW + GAP), y = colY[c];
  boxes.push({ x, y, title, role, iconName, rows });
  colY[c] += height(rows.length) + GAP;
}));

const d = new Diagram(X0 * 2 + 2 * PW + GAP, Math.max(...colY));
const TW = 124, JW = 112; // PDI-type pill and Java-type pill widths
for (const b of boxes) {
  d.panel({ x: b.x, y: b.y, w: PW, h: height(b.rows.length), role: b.role, iconName: b.iconName, title: b.title });
  b.rows.forEach(([pdi, java, note], i) => {
    const ry = b.y + HEAD + 10 + i * RH;
    const px = b.x + 14, jx = px + TW + 28;
    d.raw(`<rect x="${px}" y="${ry + 4}" width="${TW}" height="30" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>`);
    d.raw(`<text x="${px + TW / 2}" y="${ry + 24}" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">${esc(pdi)}</text>`);
    d.raw(`<line x1="${px + TW + 4}" y1="${ry + 19}" x2="${jx - 6}" y2="${ry + 19}" stroke="#64748b" stroke-width="1.6" marker-end="url(#arrow)"/>`);
    d.raw(`<rect x="${jx}" y="${ry + 4}" width="${JW}" height="30" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>`);
    d.raw(`<text x="${jx + JW / 2}" y="${ry + 24}" text-anchor="middle" font-size="12.5" font-family="Consolas, monospace" fill="#334155">${esc(java)}</text>`);
    d.raw(`<text x="${jx + JW + 12}" y="${ry + 24}" font-size="11.5" fill="#475569">${esc(note)}</text>`);
  });
}

// Key, in the space under Text.
const kx = X0 + 14, ky = colY[0] + 4;
d.raw(`<rect x="${kx}" y="${ky}" width="${TW}" height="30" rx="8" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>`);
d.raw(`<text x="${kx + TW / 2}" y="${ky + 20}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0f172a">PDI type</text>`);
d.raw(`<line x1="${kx + TW + 4}" y1="${ky + 15}" x2="${kx + TW + 22}" y2="${ky + 15}" stroke="#64748b" stroke-width="1.6" marker-end="url(#arrow)"/>`);
d.raw(`<rect x="${kx + TW + 28}" y="${ky}" width="${JW}" height="30" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>`);
d.raw(`<text x="${kx + TW + 28 + JW / 2}" y="${ky + 20}" text-anchor="middle" font-size="12" font-family="Consolas, monospace" fill="#334155">Java type</text>`);
d.raw(`<text x="${kx}" y="${ky + 52}" font-size="12" fill="#334155">A field, parameter or variable behaves as its Java type.</text>`);

d.write(import.meta.url);
