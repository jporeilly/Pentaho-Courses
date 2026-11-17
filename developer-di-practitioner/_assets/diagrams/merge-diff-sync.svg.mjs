// Merge rows (diff) and Synchronize after merge: each flag becomes one
// statement, or none. Run: node merge-diff-sync.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1058, 370);
const BW = 220, BH = 84, FW = 160, SH = 56;

const rowY = (i) => 72 + i * 70;
const flags = ['identical', 'changed', 'new', 'deleted'].map((t, i) => d.box({ x: 586, y: rowY(i), w: FW, h: SH, role: 'check', iconName: 'flag', title: t }));
d.panel({ x: 790, y: 16, w: 252, h: 338, role: 'write', iconName: 'database', title: 'Synchronize after merge' });
const stmts = [
  { iconName: 'skip-forward', title: 'skipped', lines: ['nothing written'] },
  { iconName: 'pencil', title: 'UPDATE ... WHERE', lines: ['PRODUCTCODE = ?'] },
  { iconName: 'plus', title: 'INSERT' },
  { iconName: 'trash-2', title: 'DELETE ... WHERE', lines: ['PRODUCTCODE = ?'] },
].map((b, i) => d.box({ x: 806, y: rowY(i), w: BW, h: SH, role: 'write', ...b }));

const mid = (flags[0].cy + flags[3].cy) / 2;
const r = d.box({ x: 16, y: mid - BH - 16, w: BW, h: BH, role: 'source', iconName: 'database', title: 'Reference', lines: ['STG_ORDERS_MERGED', 'ORDER BY PRODUCTCODE'] });
const n = d.box({ x: 16, y: mid + 16, w: BW, h: BH, role: 'source', iconName: 'file-text', title: 'Compare', lines: ['orders_update.txt', 'sorted on PRODUCTCODE'] });
const m = d.box({ x: 296, y: mid - BH / 2, w: 230, h: BH, role: 'join', iconName: 'git-compare', title: 'Merge rows (diff)', lines: ['adds FLAG to every row'] });

d.arrow({ x1: r.r, y1: r.cy, x2: m.x - 3, y2: m.cy - 14 });
d.arrow({ x1: n.r, y1: n.cy, x2: m.x - 3, y2: m.cy + 14 });
flags.forEach((f, i) => {
  d.arrow({ x1: m.r, y1: m.cy, x2: f.x - 3, y2: f.cy });
  d.arrow({ x1: f.r, y1: f.cy, x2: stmts[i].x - 3, y2: stmts[i].cy });
});

d.write(import.meta.url);
