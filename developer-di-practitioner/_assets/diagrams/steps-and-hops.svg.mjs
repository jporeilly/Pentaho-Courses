// Key Concepts: a transformation is steps joined by hops.
// The transformation is the one the old canvas picture showed (steps.png).
// Run: node steps-and-hops.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(972, 480);
const W = 178, H = 70;
const col = [32, 278, 524, 770];
const row = [76, 222, 368];

d.panel({ x: 12, y: 12, w: 948, h: 456, role: 'engine', iconName: 'shuffle', title: 'Transformation = Steps + Hops', sub: 'every box is a step, every arrow a hop' });

const gen = d.box({ x: col[0], y: row[0], w: W, h: H, role: 'source', iconName: 'rows-3', title: '10 rows', lines: ['Generate rows'] });
const seq = d.box({ x: col[1], y: row[0], w: W, h: H, role: 'engine', iconName: 'hash', title: 'seq', lines: ['Add sequence'] });
const join = d.box({ x: col[2], y: row[0], w: W, h: H, role: 'join', iconName: 'link', title: 'Join Rows', lines: ['Join rows'] });
const grp = d.box({ x: col[3], y: row[0], w: W, h: H, role: 'engine', iconName: 'sigma', title: 'Group', lines: ['Group by'] });
const inp = d.box({ x: col[1], y: row[1], w: W, h: H, role: 'source', iconName: 'grid-3x3', title: 'Input data', lines: ['Data grid'] });
const rnd = d.box({ x: col[2], y: row[1], w: W, h: H, role: 'engine', iconName: 'dices', title: 'rnd', lines: ['Random value'] });
const srt = d.box({ x: col[3], y: row[1], w: W, h: H, role: 'engine', iconName: 'arrow-down-wide-narrow', title: 'Sort rows', lines: ['Sort rows'] });
const mem = d.box({ x: col[3], y: row[2], w: W, h: H, role: 'engine', iconName: 'sigma', title: 'Memory Group', lines: ['Memory group by'] });

// Hops: rows travel along each one.
d.arrow({ x1: gen.r, y1: gen.cy, x2: seq.x - 3, y2: seq.cy, label: 'rows' });
d.arrow({ x1: seq.r, y1: seq.cy - 12, x2: join.x - 3, y2: join.cy - 12, label: 'rows' });
d.arrow({ x1: inp.r, y1: inp.cy, x2: join.x - 3, y2: join.cy + 14, label: 'rows', lx: (inp.r + join.x) / 2, ly: (inp.cy + join.cy) / 2 + 6 });
d.arrow({ x1: join.r, y1: join.cy, x2: grp.x - 3, y2: grp.cy, label: 'copy' });
d.arrow({ x1: join.cx, y1: join.b, x2: rnd.cx, y2: rnd.y - 3, straight: true, label: 'copy' });
d.arrow({ x1: rnd.r, y1: rnd.cy, x2: srt.x - 3, y2: srt.cy, label: 'rows' });
d.arrow({ x1: srt.cx, y1: srt.b, x2: mem.cx, y2: mem.y - 3, straight: true, label: 'rows' });

// The key: what a step is, what a hop is.
const kx = col[0], ky = row[2] - 6, kw = col[2] + W - col[0], kh = 82;
d.raw(`<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>`);
d.raw(`<rect x="${kx + 16}" y="${ky + 14}" width="44" height="26" rx="6" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.5"/>`);
d.raw(`<text x="${kx + 72}" y="${ky + 25}" font-size="13" font-weight="700" fill="#0f172a">Step</text>`);
d.raw(`<text x="${kx + 72}" y="${ky + 41}" font-size="12" fill="#334155">does one job: reads, changes or writes rows</text>`);
d.raw(`<line x1="${kx + 16}" y1="${ky + 62}" x2="${kx + 58}" y2="${ky + 62}" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);
d.raw(`<text x="${kx + 72}" y="${ky + 58}" font-size="13" font-weight="700" fill="#0f172a">Hop</text>`);
d.raw(`<text x="${kx + 72}" y="${ky + 74}" font-size="12" fill="#334155">carries rows from one step to the next: a buffer of rows between them</text>`);
d.raw(`<text x="${kx + 360}" y="${ky + 25}" font-size="12" fill="#334155">All the steps run at the same time;</text>`);
d.raw(`<text x="${kx + 360}" y="${ky + 41}" font-size="12" fill="#334155">"copy" sends every row down both hops.</text>`);

d.write(import.meta.url);
