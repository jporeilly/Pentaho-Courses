// Review Joins: the XML Join workshop's flow. Six Excel sheets become XML
// fragments, and five chained XML Join steps nest them into one document:
// each join takes the document so far as its target and one fragment as
// its source. Run: node xml-join-orders.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1150, 888);
const BH = 88, PITCH = 128, COL = [16, 266, 546, 856];
const W = [210, 240, 230, 278];
const y = (r) => 16 + r * PITCH;

const SHEETS = ['OrderList', 'OrderHeaders', 'OrderHeaderComments', 'OrderLines', 'OrderLineComments', 'OrderSubLines'];
const PREP = [
  ['square-plus', 'Add constants', ['Placeholder', 'empty OrderHeaders']],
  ['square-plus', 'Add constants', ['Placeholder 2', 'empty OrderLines,', 'OrderHeaderComments']],
  null,
  ['square-plus', 'Add constants', ['Placeholder 3x', 'empty OrderSubLines,', 'OrderLineComments']],
  ['code', 'Modified JavaScript value', ['Create XPath', 'xPathStatement']],
  ['code', 'Modified JavaScript value', ['Create XPath 2', 'xPathStatement']],
];
const JOINS = [
  ['XML Join Step', 'headers into //OrderHeaders'],
  ['XML Join Step 2', 'header comments, per orderNumber'],
  ['XML Join Step 3', 'lines, per orderNumber'],
  ['XML Join Step 4', 'line comments, per xPathStatement'],
  ['XML Join Step 5', 'sub-lines, per xPathStatement'],
];

const xml = SHEETS.map((s, r) => {
  const inp = d.box({ x: COL[0], y: y(r), w: W[0], h: BH, role: 'source', iconName: 'sheet', title: 'Excel input', lines: [s] });
  const add = d.box({ x: COL[2], y: y(r), w: W[2], h: BH, role: 'engine', iconName: 'file-code', title: 'Add XML', lines: [`xml${s}`] });
  if (PREP[r]) {
    const [iconName, title, lines] = PREP[r];
    const p = d.box({ x: COL[1], y: y(r), w: W[1], h: BH, role: 'engine', iconName, title, lines });
    d.arrow({ x1: inp.r, y1: inp.cy, x2: p.x - 3, y2: p.cy });
    d.arrow({ x1: p.r, y1: p.cy, x2: add.x - 3, y2: add.cy });
  } else {
    d.arrow({ x1: inp.r, y1: inp.cy, x2: add.x - 3, y2: add.cy });
  }
  return add;
});

// J1 sits on row 1, J2 on row 2 ... each fed the document from above.
let prev = xml[0];
JOINS.forEach(([title, line], k) => {
  const j = d.box({ x: COL[3], y: y(k + 1), w: W[3], h: BH, role: 'join', iconName: 'combine', title, lines: [line] });
  if (k === 0) d.arrow({ x1: prev.r, y1: prev.cy, x2: j.cx, y2: j.y - 3, elbow: true, label: 'target', lx: j.cx, ly: prev.cy + 22 });
  else d.arrow({ x1: prev.cx, y1: prev.b, x2: j.cx, y2: j.y - 3, vertical: true, label: 'target' });
  d.arrow({ x1: xml[k + 1].r, y1: xml[k + 1].cy, x2: j.x - 3, y2: j.cy, label: 'source' });
  prev = j;
});
const out = d.box({ x: COL[3], y: y(6), w: W[3], h: BH, role: 'write', iconName: 'file-output', title: 'Text file output', lines: ['XMLOrders.xml'] });
d.arrow({ x1: prev.cx, y1: prev.b, x2: out.cx, y2: out.y - 3, vertical: true });

d.write(import.meta.url);
