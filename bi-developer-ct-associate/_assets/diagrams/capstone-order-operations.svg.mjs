// Capstone: Order Operations. The target design, as the capstone's
// "Suggested shape" describes it: two parameters hold the dashboard's
// state; the year selector writes yearParameter, a click on a status bar
// fires statusParameter; statusChart listens to the year, ordersTable and
// lineSalesChart to both; exportOrders exports ordersTable and
// exportChart exports statusChart through CGG; three queries are
// sql over sqlJndi on SampleData and lineSalesQuery is MDX on SteelWheels.
//
// Facts it encodes, and where each comes from:
//   - Requirements 3 to 5 of 16-capstone-order-operations/guide.md: the
//     four queries, their parameters, the six components and what each
//     listens to.
//   - Lesson 12, "Interactions - clickAction": a chart's Click Action
//     calls dashboard.fireChange; components listening to the parameter
//     update.
//   - Lesson 12, "Export - Button & Popup": the Export Button exports
//     the data of the component it names; the Export Popup's chart export
//     goes to CGG.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(800, 724);
const W = 232, H = 84;
const X = [24, 284, 544];

d.panel({ x: 16, y: 16, w: 768, h: 476, role: 'browser', iconName: 'globe', title: 'The dashboard, in the browser', sub: 'Order Operations: each component names its query and the parameters it listens to' });

// Row 1: the selector and the dashboard's state, the two parameters.
const sel = d.box({ x: X[0], y: 84, w: W, h: H, role: 'browser', iconName: 'list-filter', title: 'yearSelector', lines: ['Filter component'] });
const yp = d.box({ x: X[1], y: 84, w: W, h: H, role: 'join', iconName: 'variable', title: 'yearParameter', lines: ['Custom: ["2005"]'] });
const sp = d.box({ x: X[2], y: 84, w: W, h: H, role: 'join', iconName: 'variable', title: 'statusParameter', lines: ['Simple: On Hold'] });
d.arrow({ x1: sel.r, y1: sel.cy, x2: yp.x - 3, y2: yp.cy, straight: true, label: 'sets' });

// Row 2: the components that show data.
const ch = d.box({ x: X[0], y: 244, w: W, h: H, role: 'tool', iconName: 'chart-column', title: 'statusChart', lines: ['statusQuery', 'listens: year'] });
d.box({ x: X[1], y: 244, w: W, h: H, role: 'tool', iconName: 'table', title: 'ordersTable', lines: ['ordersQuery', 'listens: year, status'] });
d.box({ x: X[2], y: 244, w: W, h: H, role: 'tool', iconName: 'chart-pie', title: 'lineSalesChart', lines: ['lineSalesQuery', 'listens: year, status'] });
const tbx = X[1] + W / 2;

// The click: the chart fires the status.
d.arrow({ x1: ch.r - 20, y1: ch.y, x2: sp.x + 20, y2: sp.b + 3, straight: true, dashed: true, label: 'click: fireChange', lx: 400, ly: 212 });

// Row 3: the exports, each under the component it reads.
const exc = d.box({ x: X[0], y: 388, w: W, h: H, role: 'tool', iconName: 'image-down', title: 'exportChart', lines: ['Export Popup:', 'the chart, drawn by CGG'] });
const exo = d.box({ x: X[1], y: 388, w: W, h: H, role: 'tool', iconName: 'download', title: 'exportOrders', lines: ['Export Button:', 'the list as CSV'] });
d.box({ x: X[2], y: 388, w: W, h: H, role: 'support', iconName: 'ear', title: 'Listeners', lines: ['run a component again', 'when a parameter changes'] });
d.arrow({ x1: exc.cx, y1: exc.y, x2: ch.cx, y2: ch.b + 3, vertical: true, label: 'exports' });
d.arrow({ x1: exo.cx, y1: exo.y, x2: tbx, y2: 244 + H + 3, vertical: true, label: 'exports' });

// On the server: the four queries in order-operations.cda.
d.panel({ x: 16, y: 532, w: 768, h: 176, role: 'server', iconName: 'server', title: 'Pentaho Server: order-operations.cda', sub: 'three SQL queries on SampleData, one MDX query on the SteelWheels cube' });
const QW = 176;
d.box({ x: 24, y: 608, w: QW, h: 80, role: 'source', iconName: 'database', title: 'yearQuery', lines: ['SQL'] });
d.box({ x: 212, y: 608, w: QW, h: 80, role: 'source', iconName: 'database', title: 'statusQuery', lines: ['SQL'] });
d.box({ x: 400, y: 608, w: QW, h: 80, role: 'source', iconName: 'database', title: 'ordersQuery', lines: ['SQL'] });
d.box({ x: 588, y: 608, w: QW, h: 80, role: 'source', iconName: 'box', title: 'lineSalesQuery', lines: ['MDX'] });

d.arrow({ x1: 400, y1: 492, x2: 400, y2: 529, vertical: true, label: 'doQuery' });

d.write(import.meta.url);
