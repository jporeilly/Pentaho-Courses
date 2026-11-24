// Sales Dashboard, Interactions: how a parameter change reaches the
// components and their queries. A selector or a pie-slice click changes a
// parameter; every component that lists the parameter in Listeners runs
// again; its Parameters entry sends the value to CDA as param<name>.
// Three components show the three cases: both set (it works), Listeners
// only (it updates with old data) and Parameters only (it never
// updates). It sits in 12-community-dashboard-editor-carrier-dashboard/
// guide.md, at the end of "Interactions - clickAction", after the
// "fireChange updates listeners; parameters carry values" box.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 12, "Interactions - Parameters & Listeners": a parameter
//     holds the selected value, and a component that lists it in its
//     Listeners property is updated whenever it changes; a component can
//     listen to several parameters and several components to one.
//     Lesson 11, component property reference: Listeners are the
//     parameters that trigger a component's reaction; Parameters pass
//     values to Query components and others.
//   - Lesson 12, "Interactions - Selectors": a selector (here a Filter
//     Component such as sourceSelector, Parameter sourceCallParameter)
//     stores the user's choice in a parameter, and every component that
//     listens to it updates. (The lesson does not say a selector calls
//     fireChange, so the selector box says "stores the choice in its
//     Parameter" rather than naming fireChange.)
//   - Lesson 12, "Interactions - clickAction": the pie chart's Click
//     Action calls dashboard.fireChange('${p:productLineParameter}', c),
//     fireChange(param, value) with the parameter's name and new value;
//     lineChart lists productLineParameter in Listeners and in Parameters.
//   - Lesson 12, "fireChange updates listeners; parameters carry
//     values": fireChange sets the parameter, raises a cdf
//     productLineParameter:fireChange event, then updates every enabled
//     component whose Listeners include productLineParameter; the Parameters
//     entry passes the new value to the query as paramproductLineParameter
//     on the CDA request; a component that updates but shows the old
//     data is missing its Parameters entry, one that never updates is
//     missing its listener.
//   - Lesson 05, doQuery and "A dashboard's data arrives through
//     doQuery": every component fetches its data with doQuery, one
//     param<name>=<value> pair for each entry in its Parameters property.
//
// Run from this folder:   node parameters-listeners.svg.mjs
// It writes parameters-listeners.svg here and
// ../images/parameters-listeners.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The canvas: 800 wide, the reading column.
const d = new Diagram(800, 556);
// Three component boxes in a row, one size.
const CW = 232, CH = 96;

// Everything but CDA happens in the dashboard, in the browser (amber).
d.panel({ x: 16, y: 16, w: 768, h: 412, role: 'browser', iconName: 'globe', title: 'The dashboard, in the browser', sub: 'Sales Dashboard: one parameter change' });

// The two ways a user changes a parameter (amber, the browser).
const sel = d.box({ x: 32, y: 80, w: 236, h: 84, role: 'browser', iconName: 'list-filter', title: 'Selector', lines: ['stores the choice', 'in its Parameter'] });
const pie = d.box({ x: 32, y: 180, w: 236, h: 84, role: 'browser', iconName: 'mouse-pointer-click', title: 'Pie slice click', lines: ['Click Action calls', 'dashboard.fireChange'] });

// The parameter itself (teal, the join between components).
const par = d.box({ x: 290, y: 92, w: 258, h: 160, role: 'join', iconName: 'variable', title: 'The parameter changes', lines: ['set to the new value;', 'event cdf <name>:fireChange;', 'then each enabled component', 'listening to it updates'] });

// Both inputs feed the parameter.
d.arrow({ x1: sel.r, y1: sel.cy, x2: par.x - 3, y2: par.cy - 24 });
d.arrow({ x1: pie.r, y1: pie.cy, x2: par.x - 3, y2: par.cy + 24 });

// Right of the parameter: the rule the three cases below illustrate
// (slate, a supporting note).
d.box({ x: 560, y: 92, w: 208, h: 160, role: 'support', iconName: 'ear', title: 'Needs both', lines: ['Listeners: run again', 'when it changes', 'Parameters: send', 'its value to the query'] });

// The three cases, using lineChart and productLineParameter from the
// workshop. The first works (blue, a component you set up); the other
// two are the two failures the lesson names (red).
const ok = d.box({ x: 32, y: 316, w: CW, h: CH, role: 'tool', iconName: 'chart-line', title: 'Listeners + Parameters', lines: ['lineChart: runs again', 'and sends the new value:', 'redraws with new data'] });
const old = d.box({ x: 284, y: 316, w: CW, h: CH, role: 'reject', iconName: 'chart-line', title: 'Listeners only', lines: ['runs again, value not sent:', 'updates with old data', '= missing Parameters'] });
const never = d.box({ x: 536, y: 316, w: CW, h: CH, role: 'reject', iconName: 'chart-line', title: 'Parameters only', lines: ['never told of the change:', 'never updates', '= missing Listener'] });

// The parameter reaches the two components that listen to it.
d.arrow({ x1: par.cx - 40, y1: par.b, x2: ok.cx, y2: ok.y - 3, vertical: true });
d.arrow({ x1: par.cx, y1: par.b, x2: old.cx, y2: old.y - 3, vertical: true });
// The third does not listen: a dashed line with no head, ending short.
d.arrow({ x1: par.cx + 40, y1: par.b, x2: never.cx, y2: never.y - 3, vertical: true, dashed: true, head: false });

// CDA, on the server (violet): where each component's query runs.
const cda = d.bar({ x: 16, y: 466, w: 768, h: 74, role: 'server', iconName: 'database-zap', title: 'CDA doQuery runs the component\'s query', line: 'each entry in its Parameters arrives as param<name>=<value>, e.g. paramproductLineParameter' });

// Only the two components that ran send a request; only one carries the value.
d.arrow({ x1: ok.cx, y1: ok.b, x2: ok.cx, y2: cda.y - 3, vertical: true, label: 'paramproductLineParameter' });
d.arrow({ x1: old.cx, y1: old.b, x2: old.cx, y2: cda.y - 3, vertical: true, label: 'no new value' });

d.write(import.meta.url);
