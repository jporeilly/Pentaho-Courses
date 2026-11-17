// Key Concepts, Jobs: a job runs its entries one after another and
// orchestrates the transformations; a failure takes the failure hop.
// Run: node job-orchestration.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1036, 404);
const EW = 156, TW = 204, H = 84, gap = 86, y = 96;
let x = 36;
const next = (w) => { const at = x; x += w + gap; return at; };

d.panel({ x: 12, y: 12, w: 1012, h: 380, role: 'support', iconName: 'workflow', title: 'Job: the entries run one after another', sub: 'the job orchestrates the transformations; inside each one, its steps run in parallel' });

const start = d.box({ x: next(EW), y, w: EW, h: H, role: 'support', iconName: 'play', title: 'Start', lines: ['entry 1:', 'begins the job'] });
const tA = d.box({ x: next(TW), y, w: TW, h: H, role: 'engine', iconName: 'shuffle', title: 'Transformation A', lines: ['entry 2: stage the data', 'its steps run in parallel'] });
const tB = d.box({ x: next(TW), y, w: TW, h: H, role: 'engine', iconName: 'shuffle', title: 'Transformation B', lines: ['entry 3: load the results', 'its steps run in parallel'] });
const ok = d.box({ x: next(EW), y, w: EW, h: H, role: 'write', iconName: 'circle-check', title: 'Success', lines: ['entry 4:', 'the job ends'] });

d.arrow({ x1: start.r, y1: start.cy, x2: tA.x - 3, y2: tA.cy, label: 'then' });
d.arrow({ x1: tA.r, y1: tA.cy, x2: tB.x - 3, y2: tB.cy, label: ['when A', 'succeeds'] });
d.arrow({ x1: tB.r, y1: tB.cy, x2: ok.x - 3, y2: ok.cy, label: ['when B', 'succeeds'] });

// Failure hops down to one shared failure path.
const fy = y + H + 80;
const fail = d.bar({ x: tA.x, y: fy, w: tB.r - tA.x, h: 64, role: 'reject', iconName: 'mail', title: 'On failure: Mail, then Abort job', line: 'a failed entry takes its failure hop; the entries after it never run' });
for (const b of [tA, tB]) {
  d.arrow({ x1: b.cx, y1: b.b, x2: b.cx, y2: fail.y - 3, straight: true, dashed: true, label: 'on failure' });
}

// The point of the picture, in one line.
d.raw(`<text x="36" y="${fy + 98}" font-size="12.5" fill="#334155">The hops set the order: Transformation B starts only after Transformation A has finished. Inside a transformation there is no order: all its steps start together.</text>`);

d.write(import.meta.url);
