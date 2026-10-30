// Generates pentaho-ecosystem.svg: the Pentaho ecosystem in four equal columns.
// Hand-laid rather than Mermaid so every box is the same size and the column
// titles sit on one line. Icons are Lucide (ISC licence), drawn as strokes.
// Run: node pentaho-ecosystem.svg.mjs   (then render, see README.md)
import fs from 'node:fs';

const W = 944, H = 528;
const BOX_W = 186, BOX_H = 62;
const PANEL_W = 200, PANEL_TOP = 12, PANEL_BOTTOM = 440;
const COLS = [12, 252, 492, 732];
const ROW = (r) => 74 + r * 74; // top of a box in row r (0-4)

const ROLE = {
  src: { fill: '#dbeafe', stroke: '#1d4ed8', text: '#1e3a8a', panel: '#eff6ff', head: '#1d4ed8' },
  eng: { fill: '#ede9fe', stroke: '#6d28d9', text: '#3b0764', panel: '#f5f3ff', head: '#6d28d9' },
  mod: { fill: '#ccfbf1', stroke: '#0f766e', text: '#134e4a', panel: '#f0fdfa', head: '#0f766e' },
  vis: { fill: '#dcfce7', stroke: '#15803d', text: '#14532d', panel: '#f0fdf4', head: '#15803d' },
  srv: { fill: '#f1f5f9', stroke: '#475569', text: '#0f172a' },
};

const ICON = {
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-7.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  cube: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  report: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-6"/><path d="M16 18v-4"/>',
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const icon = (name, x, y, size, color) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</g>`;

const COLUMNS = [
  { role: 'src', title: 'Data sources', sub: 'where the data lives' },
  { role: 'eng', title: 'Data engineering', sub: 'IT: Pentaho Data Integration' },
  { role: 'mod', title: 'Modelling', sub: 'data modellers' },
  { role: 'vis', title: 'Visualization', sub: 'business users' },
];

// [id, column, row, role, icon, title, subtitle lines]
const BOXES = [
  ['F', 0, 0, 'src', 'file', 'Flat files', ['CSV, TXT, JSON, XML']],
  ['R', 0, 1, 'src', 'database', 'Relational databases', ['Oracle, PostgreSQL, MySQL']],
  ['L', 0, 2, 'src', 'waves', 'Data lake / lakehouse', ['Redshift, BigQuery']],
  ['O', 0, 3, 'src', 'cloud', 'Object stores', ['S3, GCS']],
  ['A', 0, 4, 'src', 'plug', 'APIs', []],
  ['ST', 1, 1, 'eng', 'layers', 'Staging layer', ['raw data, landed as is']],
  ['TR', 1, 3, 'eng', 'shuffle', 'Transformation layer', ['cleaned, joined, enriched']],
  ['CU', 2, 1, 'mod', 'cube', 'Pentaho OLAP cube', ['dimensional modelling']],
  ['DM', 2, 3, 'mod', 'warehouse', 'Enterprise data mart', ['data lake, lakehouse']],
  ['AN', 3, 1, 'vis', 'chart', 'Pentaho Analyzer', ['self-service analysis']],
  ['PRD', 3, 2, 'vis', 'report', 'Pentaho Report Designer', ['traditional and', 'interactive reports']],
  ['CT', 3, 3, 'vis', 'dashboard', 'Pentaho CTools', ['custom reports and', 'dashboards']],
];

const pos = {};
for (const [id, c, r] of BOXES) {
  const x = COLS[c] + (PANEL_W - BOX_W) / 2, y = ROW(r);
  pos[id] = { x, y, cx: x + BOX_W / 2, cy: y + BOX_H / 2, r: x + BOX_W, b: y + BOX_H };
}

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Helvetica, Arial, sans-serif">`);
out.push(`<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#64748b"/></marker>`);
out.push(`<filter id="shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#0f172a" flood-opacity="0.10"/></filter></defs>`);
out.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

// Column panels with a title strip; every title on the same baseline.
COLUMNS.forEach((col, i) => {
  const c = ROLE[col.role], x = COLS[i];
  out.push(`<rect x="${x}" y="${PANEL_TOP}" width="${PANEL_W}" height="${PANEL_BOTTOM - PANEL_TOP}" rx="10" fill="${c.panel}" stroke="${c.fill}" stroke-width="1.5"/>`);
  out.push(`<path d="M${x} ${PANEL_TOP + 10}a10 10 0 0 1 10-10h${PANEL_W - 20}a10 10 0 0 1 10 10v38h-${PANEL_W}z" fill="${c.head}"/>`);
  out.push(`<text x="${x + PANEL_W / 2}" y="${PANEL_TOP + 22}" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">${esc(col.title)}</text>`);
  out.push(`<text x="${x + PANEL_W / 2}" y="${PANEL_TOP + 39}" text-anchor="middle" font-size="11" fill="#ffffff" opacity="0.9">${esc(col.sub)}</text>`);
});

// Edges: right edge of one box to the left edge of the next, as smooth S-curves.
const edge = (a, b, opts = {}) => {
  const p = pos[a], q = pos[b];
  const x1 = p.r, y1 = opts.y1 ?? p.cy, x2 = q.x - 2, y2 = opts.y2 ?? q.cy;
  const mx = (x1 + x2) / 2;
  out.push(`<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.6" marker-end="url(#arrow)"/>`);
};
const down = (a, b) => {
  const p = pos[a], q = pos[b];
  out.push(`<path d="M${p.cx} ${p.b}V${q.y - 2}" fill="none" stroke="#64748b" stroke-width="1.6" marker-end="url(#arrow)"/>`);
};
for (const s of ['F', 'R', 'L', 'O', 'A']) edge(s, 'ST');
down('ST', 'TR');
edge('TR', 'CU');
edge('TR', 'DM');
edge('CU', 'AN');
edge('CU', 'PRD', { y1: pos.CU.cy + 10, y2: pos.PRD.cy - 10 });
edge('CU', 'CT', { y1: pos.CU.cy + 20, y2: pos.CT.cy - 12 });
edge('DM', 'PRD', { y1: pos.DM.cy - 20, y2: pos.PRD.cy + 10 });
edge('DM', 'CT');

// Boxes: icon on the left, bold title, one or two lines of detail.
for (const [id, , , role, ic, title, lines] of BOXES) {
  const p = pos[id], c = ROLE[role];
  out.push(`<rect x="${p.x}" y="${p.y}" width="${BOX_W}" height="${BOX_H}" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.4" filter="url(#shadow)"/>`);
  out.push(`<circle cx="${p.x + 22}" cy="${p.cy}" r="14" fill="#ffffff" stroke="${c.stroke}" stroke-width="1"/>`);
  out.push(icon(ic, p.x + 13, p.cy - 9, 18, c.stroke));
  const textTop = lines.length === 0 ? p.cy + 4 : p.cy - (lines.length === 1 ? 4 : 11);
  out.push(`<text x="${p.x + 44}" y="${textTop}" font-size="12.5" font-weight="700" fill="${c.text}">${esc(title)}</text>`);
  lines.forEach((l, i) => out.push(`<text x="${p.x + 44}" y="${textTop + 15 + i * 13}" font-size="11" fill="${c.text}">${esc(l)}</text>`));
}

// The server underneath everything: one wide bar.
const s = ROLE.srv, sy = 456, sx = COLS[0], sw = COLS[3] + PANEL_W - COLS[0];
out.push(`<rect x="${sx}" y="${sy}" width="${sw}" height="58" rx="10" fill="${s.fill}" stroke="${s.stroke}" stroke-width="1.4" filter="url(#shadow)"/>`);
out.push(`<circle cx="${sx + 30}" cy="${sy + 29}" r="16" fill="#ffffff" stroke="${s.stroke}" stroke-width="1"/>`);
out.push(icon('server', sx + 19, sy + 18, 22, s.stroke));
out.push(`<text x="${sx + 58}" y="${sy + 25}" font-size="13.5" font-weight="700" fill="${s.text}">Pentaho DI and BA Server: underneath every layer</text>`);
out.push(`<text x="${sx + 58}" y="${sy + 43}" font-size="11.5" fill="#334155">scheduling, logging, security, and the repository for ETL, reports and models</text>`);

out.push('</svg>');
fs.writeFileSync(new URL('./pentaho-ecosystem.svg', import.meta.url), out.join('\n'));
console.log('wrote pentaho-ecosystem.svg');
