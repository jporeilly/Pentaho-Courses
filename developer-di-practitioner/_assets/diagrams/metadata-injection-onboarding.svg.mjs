// Metadata injection: the injector transformation holds the metadata and
// fills in the template's settings, then runs it.
// Run: node metadata-injection-onboarding.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1064, 642);
const BW = 300, BH = 70, COL = [32, 382, 732];

const inj = d.panel({ x: 16, y: 16, w: 1032, h: 394, role: 'support', iconName: 'file-cog', title: 'metadata_inject_step.ktr: the metadata' });
const grids = [
  ['dg-metadata_fields', 'one row per field of customers.txt'],
  ['dg-rename', 'id to key_id'],
  ['dg_remove_name', 'stateCode'],
].map((lines, i) => d.box({ x: COL[1], y: 72 + i * 84, w: BW, h: BH, role: 'source', iconName: 'grid-3x3', title: 'Data grid', lines }));
const e = d.box({ x: COL[1], y: 72 + 3 * 84, w: BW, h: BH, role: 'engine', iconName: 'pin', title: 'Set field value to a constant', lines: ['sfvc-path_filename', 'data/customers.txt'] });
const g = d.box({ x: COL[0], y: e.y, w: BW, h: BH, role: 'source', iconName: 'list-plus', title: 'Generate rows', lines: ['gr-filename'] });
const midY = (grids[0].cy + e.cy) / 2;
const m = d.box({ x: COL[2], y: midY - BH / 2, w: BW, h: BH, role: 'join', iconName: 'syringe', title: 'ETL metadata injection', lines: ['template: metadata_inject_template.ktr', 'run resulting transformation'] });

d.arrow({ x1: g.r, y1: g.cy, x2: e.x - 3, y2: e.cy });
[...grids, e].forEach((b, i) => d.arrow({ x1: b.r, y1: b.cy, x2: m.x - 3, y2: m.cy - 21 + i * 14 }));

const tp = d.panel({ x: 16, y: 470, w: 1032, h: 156, role: 'support', iconName: 'file-cog', title: "metadata_inject_template.ktr: the shape" });
const t = [
  { role: 'source', iconName: 'file-input', title: 'CSV file input', lines: ['csvi-mdi', 'no file, no fields'] },
  { role: 'engine', iconName: 'list-filter', title: 'Select values', lines: ['sv-mdi', 'empty'] },
  { role: 'write', iconName: 'database', title: 'Table output', lines: ['to-metadata_injection_customers', 'METADATA_INJECTION_CUSTOMERS'] },
].map((b, i) => d.box({ x: COL[i], y: 526, w: BW, h: 84, ...b }));
d.arrow({ x1: t[0].r, y1: t[0].cy, x2: t[1].x - 3, y2: t[1].cy });
d.arrow({ x1: t[1].r, y1: t[1].cy, x2: t[2].x - 3, y2: t[2].cy });

d.arrow({ x1: m.cx, y1: inj.b, x2: m.cx, y2: tp.y - 3, vertical: true, dashed: true, label: "fills in the template's settings, then runs it" });

d.write(import.meta.url);
