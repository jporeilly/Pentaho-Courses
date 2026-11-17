// Review Parameters: where the value of a ${NAME} in a step comes from,
// as three layers, narrowest on top, and a side note on ${} text
// substitution against ? binding.
//
// Every fact comes from these lessons:
//   topic-mod5-parameters-and-variables-review/guide.md
//     - A named parameter belongs to one transformation or job, is
//       declared there with a default value, and whoever runs it (Spoon,
//       Pan, Kitchen or a job entry) can pass a different value.
//     - A variable is set outside the file: in kettle.properties, by a Set
//       variables step in an earlier transformation of a job, or by the
//       environment. kettle.properties is for values every run on a
//       machine shares; Set variables for values the rest of the job uses.
//     - At run time a parameter becomes a variable too, so steps read both
//       as ${NAME}; when a parameter and a variable share a name, the
//       parameter wins.
//     - ${} replaces the text, including in a SQL query, before the step
//       runs: for configuration you control. A ? marker is bound by the
//       database driver as a value, so a value can't change the
//       statement: for values that come from the data.
//   02-mod1-kettle-variables/guide.md
//     - kettle.properties lives in the .kettle folder; Spoon and the
//       engine read it when they start (Pan and Kitchen on each run).
//   34-mod5-parameters/guide.md
//     - the STATUS parameter, its default Cancelled, and Pan's -param.
//
// Run from this folder:   node variables-and-parameters.svg.mjs
// It writes variables-and-parameters.svg here and
// ../images/variables-and-parameters.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas. The three layers are wide boxes on the left, one under the
// other, all the same size; the step that reads them is one box on the
// right, level with the middle layer.
const d = new Diagram(1000, 512);
const LW = 560, BH = 72, PITCH = 88; // a layer box, and a 16px gap
const LX = 32, RX = 688, RW = 280;

// ── The three layers ─────────────────────────────────────────────────
d.panel({ x: 16, y: 16, w: 968, h: 320, role: 'support', iconName: 'layers', title: 'Where the value of ${NAME} comes from: the narrowest scope on top' });
const layer = (i, o) => d.box({ x: LX, y: 72 + i * PITCH, w: LW, h: BH, ...o });
const L = [
  // Narrowest: one file. Blue: a value you pass in when you run it.
  layer(0, { role: 'source', iconName: 'sliders-horizontal', title: 'Named parameter: one .ktr or .kjb',
    lines: ['its default, or a value passed by Spoon, Pan, Kitchen or a job entry', 'wins when a parameter and a variable share a name'] }),
  // The rest of one job. Violet: a step sets it while the job runs.
  layer(1, { role: 'engine', iconName: 'variable', title: 'Set variables: the rest of the job',
    lines: ['a step in an earlier transformation of the job sets it', 'for the transformations and jobs that run after it'] }),
  // Widest: the machine. Slate: configuration under everything else.
  layer(2, { role: 'support', iconName: 'file-cog', title: 'kettle.properties and the environment: the machine',
    lines: ['every transformation and job run on this machine', 'kettle.properties is read when Spoon, Pan or Kitchen starts'] }),
];

// The step that reads them, level with the middle layer.
const step = d.box({ x: RX, y: L[1].y, w: RW, h: BH, role: 'result', iconName: 'dollar-sign', title: '${NAME} in a step setting', lines: ['replaced by its value, as', 'text, when the step runs'] });

// One arrow per layer into the step, each arriving at its own height on
// the step's left edge so the three arrowheads stay apart.
L.forEach((b, i) => d.arrow({ x1: b.r, y1: b.cy, x2: step.x - 3, y2: step.cy - 16 + i * 16 }));

// ── Side note: ${} or ? ──────────────────────────────────────────────
// Two boxes side by side, the same size: substitution on the left (the
// same dollar-sign icon as the step above), binding on the right.
d.panel({ x: 16, y: 352, w: 968, h: 144, role: 'support', iconName: 'info', title: 'Side note: ${} text substitution or a ? marker' });
d.box({ x: 32, y: 408, w: 460, h: BH, role: 'engine', iconName: 'dollar-sign', title: "'${STATUS}': text substitution",
  lines: ['replaced in the SQL text before the driver sees it;', 'for configuration you control'] });
d.box({ x: 508, y: 408, w: 460, h: BH, role: 'join', iconName: 'link', title: '?: a value the driver binds',
  lines: ["bound as a value, so it can't change the statement;", 'for values that come from the data'] });

d.write(import.meta.url);
