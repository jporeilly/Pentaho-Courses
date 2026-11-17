// Review Scalability, Cluster schema: a named set of slave servers, one
// the master. Static lists them all at design time; dynamic names only
// the master, slaves register when they start, and the master checks
// every 30 seconds which are available.
// Run: node cluster-schema-static-dynamic.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 430);
const PW = 476, PY = 12, PH = 406;
const note = (x, y, lines) => lines.forEach((l, i) => d.raw(`<text x="${x}" y="${y + i * 17}" font-size="12.5" fill="#334155">${l}</text>`));

// Static.
d.panel({ x: 12, y: PY, w: PW, h: PH, role: 'support', iconName: 'list', title: 'Static cluster schema', sub: 'the master and every slave are listed at design time' });
const sm = d.box({ x: 12 + PW / 2 - 100, y: 96, w: 200, h: 72, role: 'server', iconName: 'crown', title: 'Master', lines: ['listed in the schema'] });
const sa = d.box({ x: 40, y: 250, w: 196, h: 72, role: 'server', iconName: 'server', title: 'Slave A', lines: ['listed in the schema'] });
const sb = d.box({ x: 264, y: 250, w: 196, h: 72, role: 'server', iconName: 'server', title: 'Slave B', lines: ['listed in the schema'] });
for (const s of [sa, sb]) d.arrow({ x1: sm.cx, y1: sm.b, x2: s.cx, y2: s.y - 3, vertical: true });
d.pill(sm.cx, (sm.b + sa.y) / 2, 'sends each slave its part');
note(40, 358, ['A small, fixed set of machines: to add one,', 'edit the schema.']);

// Dynamic.
const DX = 12 + PW + 24;
d.panel({ x: DX, y: PY, w: PW, h: PH, role: 'join', iconName: 'refresh-cw', title: 'Dynamic cluster schema', sub: 'only the master is named; slaves register with it' });
const dm = d.box({ x: DX + PW / 2 - 100, y: 96, w: 200, h: 72, role: 'server', iconName: 'crown', title: 'Master', lines: ['the only server named'] });
const slaves = [
  ['Slave', 'registered', 'server'],
  ['Slave', 'registered', 'server'],
  ['New slave', 'just started', 'off'],
].map(([t, l, role], i) => d.box({ x: DX + 20 + i * 148, y: 250, w: 136, h: 72, role, title: t, lines: [l] }));
slaves.forEach((s, i) => d.arrow({ x1: s.cx, y1: s.y, x2: dm.cx + (i - 1) * 50, y2: dm.b + 3, straight: true, dashed: i === 2 }));
d.pill(dm.cx + 118, (dm.b + 250) / 2 - 6, 'registers on start-up');
note(DX + 28, 358, ['The master checks every 30 seconds which slaves are', 'available. Nodes come and go, as in a cloud.']);

d.write(import.meta.url);
