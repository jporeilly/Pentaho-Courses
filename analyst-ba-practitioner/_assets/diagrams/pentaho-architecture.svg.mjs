// Generates pentaho-architecture.svg: how Pentaho's design tools, server and
// data fit together. Hand-laid so every box lines up and every arrow says what
// travels along it. Icons are Lucide (ISC licence), drawn as strokes.
// Run: node pentaho-architecture.svg.mjs   (then render, see README.md)
import fs from 'node:fs';

const W = 1010, H = 524;

const ROLE = {
  eng: { fill: '#ede9fe', stroke: '#6d28d9', text: '#3b0764', panel: '#f5f3ff', head: '#6d28d9' },
  mod: { fill: '#ccfbf1', stroke: '#0f766e', text: '#134e4a', panel: '#f0fdfa', head: '#0f766e' },
  vis: { fill: '#dcfce7', stroke: '#15803d', text: '#14532d', panel: '#f0fdf4', head: '#15803d' },
  src: { fill: '#dbeafe', stroke: '#1d4ed8', text: '#1e3a8a', panel: '#eff6ff', head: '#1d4ed8' },
  srv: { fill: '#f1f5f9', stroke: '#475569', text: '#0f172a', panel: '#f8fafc', head: '#475569' },
};

const ICON = {
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-7.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  cube: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  report: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-6"/><path d="M16 18v-4"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const icon = (name, x, y, size, color) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</g>`;

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Helvetica, Arial, sans-serif">`);
out.push(`<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#475569"/></marker>`);
out.push(`<filter id="shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#0f172a" flood-opacity="0.10"/></filter></defs>`);
out.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

// A panel with a coloured title strip.
const panel = (x, y, w, h, role, title, sub) => {
  const c = ROLE[role];
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c.panel}" stroke="${c.fill}" stroke-width="1.5"/>`);
  out.push(`<path d="M${x} ${y + 10}a10 10 0 0 1 10-10h${w - 20}a10 10 0 0 1 10 10v${sub ? 36 : 26}h-${w}z" fill="${c.head}"/>`);
  out.push(`<text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#ffffff">${esc(title)}</text>`);
  if (sub) out.push(`<text x="${x + w / 2}" y="${y + 35}" text-anchor="middle" font-size="11" fill="#ffffff" opacity="0.92">${esc(sub)}</text>`);
};

// A box with an icon, a bold title and an optional detail line.
const box = (x, y, w, h, role, ic, title, detail) => {
  const c = ROLE[role], cy = y + h / 2;
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.4" filter="url(#shadow)"/>`);
  out.push(`<circle cx="${x + 22}" cy="${cy}" r="14" fill="#ffffff" stroke="${c.stroke}" stroke-width="1"/>`);
  out.push(icon(ic, x + 13, cy - 9, 18, c.stroke));
  const ty = detail ? cy - 3 : cy + 4;
  out.push(`<text x="${x + 44}" y="${ty}" font-size="12.5" font-weight="700" fill="${c.text}">${esc(title)}</text>`);
  if (detail) out.push(`<text x="${x + 44}" y="${ty + 15}" font-size="11" fill="${c.text}">${esc(detail)}</text>`);
};

// A plain item inside a server panel.
const item = (x, y, w, h, role, text) => {
  const c = ROLE[role];
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#ffffff" stroke="${c.stroke}" stroke-width="1.2"/>`);
  out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="12" font-weight="600" fill="${c.text}">${esc(text)}</text>`);
};

const arrow = (d, dash) =>
  out.push(`<path d="${d}" fill="none" stroke="#475569" stroke-width="1.6"${dash ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#arrow)"/>`);
const label = (x, y, text, anchor = 'middle', size = 11) =>
  out.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="600" fill="#334155">${esc(text)}</text>`);

// ── Column 1: the design tools, on the developer's own PC ─────────────────────
const TX = 12, TW = 212;
panel(TX, 12, TW, 430, 'srv', 'Client design tools', 'installed on the designer’s PC');
const BW = TW - 24, BX = TX + 12;
label(TX + TW / 2, 84, 'FOR DATA INTEGRATION', 'middle', 10);
box(BX, 96, BW, 62, 'eng', 'shuffle', 'Data Integration', 'builds pipelines and jobs');
label(TX + TW / 2, 220, 'FOR ANALYTICS CONTENT', 'middle', 10);
box(BX, 232, BW, 56, 'mod', 'cube', 'Schema Workbench', 'cube schemas');
box(BX, 298, BW, 56, 'mod', 'layers', 'Metadata Editor', 'business models');
box(BX, 364, BW, 56, 'vis', 'report', 'Report Designer', 'reports saved as .prpt');

// ── Column 2: the Pentaho Server ──────────────────────────────────────────────
const SX = 334, SW = 396;
panel(SX, 12, SW, 430, 'srv', 'Pentaho Server', 'the web server your users connect to');
const IX = SX + 14, IW = SW - 28;
// Data Integration server
panel(IX, 66, IW, 142, 'eng', 'Data Integration Server', 'plugins');
const half = (IW - 36) / 2;
item(IX + 12, 128, half, 32, 'eng', 'Pipeline Designer');
item(IX + 24 + half, 128, half, 32, 'eng', 'Scheduler');
item(IX + 12, 168, half, 32, 'eng', 'Carte');
item(IX + 24 + half, 168, half, 32, 'eng', 'Semantic Model Editor');
// Analytics server
panel(IX, 224, IW, 206, 'vis', 'Analytics Server', 'plugins');
item(IX + 12, 286, half, 32, 'vis', 'Analyzer');
item(IX + 24 + half, 286, half, 32, 'vis', 'Interactive Reports');
item(IX + 12, 326, half, 32, 'vis', 'Dashboard Designer');
item(IX + 24 + half, 326, half, 32, 'vis', 'CTools');
out.push(`<text x="${IX + IW / 2}" y="${384}" text-anchor="middle" font-size="11" fill="#14532d">Report Designer reports (.prpt) are published here</text>`);
out.push(`<text x="${IX + IW / 2}" y="${400}" text-anchor="middle" font-size="11" fill="#14532d">and run from the User Console</text>`);

// ── Design tool → server arrows, each labelled with the file that travels ─────
const AX1 = TX + TW, AX2 = SX; // gap between the two panels
arrow(`M${AX1} 127H${AX2 - 2}`); label((AX1 + AX2) / 2, 119, '.ktr  .kjb');
arrow(`M${AX1} 260H${AX2 - 2}`); label((AX1 + AX2) / 2, 252, '.mondrian.xml');
arrow(`M${AX1} 326H${AX2 - 2}`); label((AX1 + AX2) / 2, 318, '.xmi');
arrow(`M${AX1} 392H${AX2 - 2}`); label((AX1 + AX2) / 2, 384, '.prpt');
// ── Column 3: what the server stands on ───────────────────────────────────────
const RX = 832, RW = 166;
const cylinder = (cx, top, w, h, role, title, lines) => {
  const c = ROLE[role], rx = w / 2, ry = 13;
  out.push(`<path d="M${cx - rx} ${top + ry}v${h - 2 * ry}a${rx} ${ry} 0 0 0 ${w} 0v-${h - 2 * ry}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5" filter="url(#shadow)"/>`);
  out.push(`<ellipse cx="${cx}" cy="${top + ry}" rx="${rx}" ry="${ry}" fill="${c.panel}" stroke="${c.stroke}" stroke-width="1.5"/>`);
  out.push(`<text x="${cx}" y="${top + ry + 30}" text-anchor="middle" font-size="13" font-weight="700" fill="${c.text}">${esc(title)}</text>`);
  lines.forEach((l, i) => out.push(`<text x="${cx}" y="${top + ry + 47 + i * 14}" text-anchor="middle" font-size="11" fill="${c.text}">${esc(l)}</text>`));
};
cylinder(RX + RW / 2, 66, RW, 128, 'srv', 'Repository', ['reports, schemas,', 'dashboards, schedules,', 'users and roles']);
cylinder(RX + RW / 2, 258, RW, 128, 'src', 'Data sources', ['databases, files,', 'cloud storage']);
// Server → repository and data sources
const SR = SX + SW;
arrow(`M${SR} 130H${RX - 2}`); label((SR + RX) / 2, 112, 'saves and', 'middle', 10.5); label((SR + RX) / 2, 124, 'loads content', 'middle', 10.5);
arrow(`M${SR} 322H${RX - 2}`); label((SR + RX) / 2, 296, 'runs pipelines', 'middle', 10.5); label((SR + RX) / 2, 308, 'and queries data', 'middle', 10.5);
// Design tools also connect to the data they design against.
arrow(`M${TX + TW / 2} 442V506H${RX + RW / 2}V${386 + 2}`, true);
label((TX + TW / 2 + RX + RW / 2) / 2, 498, 'the design tools also connect straight to the data while you build', 'middle', 11);

out.push('</svg>');
fs.writeFileSync(new URL('./pentaho-architecture.svg', import.meta.url), out.join('\n'));
console.log('wrote pentaho-architecture.svg');
