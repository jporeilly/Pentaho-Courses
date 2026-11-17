// Key Concepts: every step runs at once, and each hop is a row buffer
// between them. The steps are the ones the old canvas picture showed
// (parallelism.png): Products, Sort rows, Group by.
// Run: node parallelism.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1072, 300);
const SW = 176, BW = 124, H = 76, gap = 60, y = 92;
let x = 36;
const next = (w) => { const at = x; x += w + gap; return at; };

d.panel({ x: 12, y: 12, w: 1048, h: 276, role: 'engine', iconName: 'activity', title: 'Parallelism: every step runs at the same time', sub: 'rows stream from step to step through the hops' });

const p = d.box({ x: next(SW), y, w: SW, h: H, role: 'source', iconName: 'table-2', title: 'Products', lines: ['writes its rows'] });
const h1 = d.box({ x: next(BW), y, w: BW, h: H, role: 'support', title: 'Hop', lines: ['row buffer,', 'up to 10,000 rows'] });
const s = d.box({ x: next(SW), y, w: SW, h: H, role: 'engine', iconName: 'arrow-down-wide-narrow', title: 'Sort rows', lines: ['reads and writes'] });
const h2 = d.box({ x: next(BW), y, w: BW, h: H, role: 'support', title: 'Hop', lines: ['row buffer,', 'up to 10,000 rows'] });
const g = d.box({ x: next(SW), y, w: SW, h: H, role: 'engine', iconName: 'sigma', title: 'Group by', lines: ['reads its rows'] });

d.arrow({ x1: p.r, y1: p.cy, x2: h1.x - 3, y2: h1.cy, label: 'write' });
d.arrow({ x1: h1.r, y1: h1.cy, x2: s.x - 3, y2: s.cy, label: 'read' });
d.arrow({ x1: s.r, y1: s.cy, x2: h2.x - 3, y2: h2.cy, label: 'write' });
d.arrow({ x1: h2.r, y1: h2.cy, x2: g.x - 3, y2: g.cy, label: 'read' });

// What happens over time, under the pipeline.
const ty = y + H + 34;
d.raw(`<rect x="36" y="${ty}" width="1000" height="56" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>`);
d.raw(`<text x="56" y="${ty + 23}" font-size="13" font-weight="700" fill="#0f172a">All three steps start together.</text>`);
d.raw(`<text x="56" y="${ty + 42}" font-size="12" fill="#334155">As soon as Products has written some rows into its hop, Sort rows reads them while Products is still writing, and so on down the line: no step waits for the one before it to finish.</text>`);

d.write(import.meta.url);
