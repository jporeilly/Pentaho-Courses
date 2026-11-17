// Error handling: valid rows flow on, failed rows take the error hop.
// Run: node error-hop-split.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1046, 264);
const BW = 270, BH = 96;

const ok = d.box({ x: 760, y: 16, w: BW, h: BH, role: 'write', iconName: 'circle-dashed', title: 'Dummy (do nothing)', lines: ['97 valid rows'] });
const er = d.box({ x: 760, y: 152, w: BW, h: BH, role: 'reject', iconName: 'circle-x', title: 'Errors', lines: ['3 rejected rows, each with', 'errorCount, errorDescriptions,', 'errorFields, errorCodes'] });
const mid = (ok.cy + er.cy) / 2;
const f = d.box({ x: 16, y: mid - BH / 2, w: BW, h: BH, role: 'source', iconName: 'file-text', title: 'customers-100-with-errors.txt', lines: ['header line + 100 customers'] });
const c = d.box({ x: 330, y: mid - BH / 2, w: BW, h: BH, role: 'source', iconName: 'file-input', title: 'CSV file input', lines: ['converts each field to its type'] });

d.arrow({ x1: f.r, y1: f.cy, x2: c.x - 3, y2: c.cy });
d.arrow({ x1: c.r, y1: c.cy - 14, x2: ok.x - 3, y2: ok.cy, label: ['rows that', 'convert'] });
d.arrow({ x1: c.r, y1: c.cy + 14, x2: er.x - 3, y2: er.cy, dashed: true, label: ['error hop:', 'rows that fail'] });

d.write(import.meta.url);
