// Review CRUID: the five operations, their SQL and their steps.
// Run: node cruid-operations.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(862, 412);
const BW = 250, BH = 84;

const writers = [
  { role: 'write', iconName: 'plus', title: 'Create', lines: ['SQL INSERT', 'step: Table output'] },
  { role: 'engine', iconName: 'pencil', title: 'Update', lines: ['SQL UPDATE', 'step: Update'] },
  { role: 'join', iconName: 'copy-plus', title: 'Insert-update', lines: ['UPDATE when the key exists,', "INSERT when it doesn't", 'step: Insert / update'] },
  { role: 'reject', iconName: 'trash-2', title: 'Delete', lines: ['SQL DELETE', 'step: Delete'] },
].map((b, i) => d.box({ x: 16, y: 16 + i * 98, w: BW, h: BH, ...b }));

const mid = (writers[0].cy + writers[3].cy) / 2;
const tb = d.box({ x: 346, y: mid - BH / 2, w: 170, h: BH, role: 'off', iconName: 'table', title: 'Table' });
const rd = d.box({ x: 596, y: mid - BH / 2, w: BW, h: BH, role: 'source', iconName: 'database-search', title: 'Read', lines: ['SQL SELECT', 'step: Table input'] });

writers.forEach((w, i) => d.arrow({ x1: w.r, y1: w.cy, x2: tb.x - 3, y2: tb.cy - 24 + i * 16 }));
d.arrow({ x1: tb.r, y1: tb.cy, x2: rd.x - 3, y2: rd.cy, label: 'read' });

d.write(import.meta.url);
