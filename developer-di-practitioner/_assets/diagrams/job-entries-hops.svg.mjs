// Review Jobs: a job's parts. Entries (each one task) joined by hops,
// and the hop's evaluation mode decides whether the next entry runs:
// unconditional (lock), on success (green), on failure (red). Redraws
// the old annotated Spoon screenshot topic-jobs-review-entries-hops.jpg.
// Run: node job-entries-hops.svg.mjs
import { Diagram, icon } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1000, 470);
const HOP = {
  always: { color: '#475569', icon: 'lock', label: 'unconditional' },
  ok: { color: '#15803d', icon: 'check', label: 'on success' },
  fail: { color: '#dc2626', icon: 'x', label: 'on failure' },
};

d.panel({ x: 12, y: 12, w: 976, h: 446, role: 'support', iconName: 'workflow', title: 'A job: entries joined by hops', sub: 'each entry does one task; the hop after it decides whether the next entry runs' });

const W = 174, H = 76, y = 96;
const GAP = (936 - 4 * W) / 3, X = [0, 1, 2, 3].map((i) => 32 + i * (W + GAP));
const start = d.box({ x: X[0], y, w: W, h: H, role: 'support', iconName: 'play', title: 'START', lines: ['the job begins'] });
const wait = d.box({ x: X[1], y, w: W, h: H, role: 'source', iconName: 'file-clock', title: 'Wait for file', lines: ['until it arrives'] });
const tr = d.box({ x: X[2], y, w: W, h: H, role: 'engine', iconName: 'shuffle', title: 'Transformation', lines: ['runs a .ktr'] });
const ok = d.box({ x: X[3], y, w: W, h: H, role: 'write', iconName: 'circle-check', title: 'Success', lines: ['the job ends'] });
const mail = d.box({ x: X[3], y: y + H + 74, w: W, h: H, role: 'reject', iconName: 'mail', title: 'Mail', lines: ['tells someone'] });

// A hop: a colored line with its mode's badge on it, and its name under.
function badge(cx, cy, h) {
  d.raw(`<circle cx="${cx}" cy="${cy}" r="12" fill="#ffffff" stroke="${h.color}" stroke-width="1.8"/>`);
  d.raw(icon(h.icon, cx - 8, cy - 8, 16, h.color));
}
function hop(path, bx, by, h, lx, ly) {
  d.raw(`<path d="${path}" fill="none" stroke="${h.color}" stroke-width="2.2"${h === HOP.fail ? ' stroke-dasharray="6 4"' : ''} marker-end="url(#hop-${h.icon})"/>`);
  badge(bx, by, h);
  d.raw(`<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11.5" fill="${h.color}" font-weight="600">${h.label}</text>`);
}
d.raw(`<defs>${Object.values(HOP).map((h) => `<marker id="hop-${h.icon}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${h.color}"/></marker>`).join('')}</defs>`);

const mid = (a, b) => (a.r + b.x) / 2;
hop(`M${start.r} ${start.cy}L${wait.x - 3} ${wait.cy}`, mid(start, wait), start.cy, HOP.always, mid(start, wait), start.cy - 22);
hop(`M${wait.r} ${wait.cy}L${tr.x - 3} ${tr.cy}`, mid(wait, tr), wait.cy, HOP.ok, mid(wait, tr), wait.cy - 22);
hop(`M${tr.r} ${tr.cy}L${ok.x - 3} ${ok.cy}`, mid(tr, ok), tr.cy, HOP.ok, mid(tr, ok), tr.cy - 22);
const fx = tr.cx + 40;
hop(`M${fx} ${tr.b}L${fx} ${mail.cy}L${mail.x - 3} ${mail.cy}`, fx, (tr.b + mail.cy) / 2, HOP.fail, fx - 50, (tr.b + mail.cy) / 2 + 4);

// Callouts naming the two parts, as the old screenshot did.
const callout = (x, y, tx, ty, text) => {
  d.raw(`<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#f59e0b" stroke-width="1.6"/>`);
  d.raw(`<circle cx="${x}" cy="${y}" r="3.5" fill="#f59e0b"/>`);
  d.raw(`<text x="${tx}" y="${ty + 16}" text-anchor="middle" font-size="13" font-weight="700" fill="#b45309">${text}</text>`);
};
callout(start.cx, start.b, start.cx, start.b + 70, 'Entry');
callout(mid(wait, tr), wait.cy + 14, mid(wait, tr), start.b + 70, 'Hop');

// Key: the three evaluation modes.
const ky = 352;
d.raw(`<text x="32" y="${ky}" font-size="13" font-weight="700" fill="#334155">A hop's Evaluation mode (right-click the hop to change it)</text>`);
[
  [HOP.always, 'Unconditional: always followed'],
  [HOP.ok, 'On success: followed when the entry before it succeeds'],
  [HOP.fail, 'On failure: followed when the entry before it fails'],
].forEach(([h, text], i) => {
  const cy = ky + 30 + i * 28;
  badge(46, cy, h);
  d.raw(`<text x="68" y="${cy + 4}" font-size="12.5" fill="#334155">${text}</text>`);
});

d.write(import.meta.url);
