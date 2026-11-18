// How the capstone's APAC Sales Pack fits together (16): what feeds what
// on the dashboard, what the weekly schedule writes, and who may open the
// folder. It is the "What you will build" picture at the top of
// 16-capstone-apac-sales-pack/guide.md (it replaced the capstone-apac-report
// mock-up, 2026-11-18), with a "Read the diagram" paragraph after it.
//
// Every fact comes from the lesson's Required behavior (guide, stages 1-5)
// and the reference pack built and checked on the server 2026-11-18:
//   - Folder Public > Training > APAC, shared with the Power User role (Read)
//     and no longer inheriting; Administrators keep full access.
//   - APAC-Orders-by-Country: prompts COUNTRY and PRODUCTLINE.
//   - APAC-Product-Line-Sales: Top 5 product lines by Sales, % of Sales,
//     publishes the product line clicked (Content Linking on Line).
//   - APAC-Sales-Pack: the Country prompt feeds the report's COUNTRY and the
//     chart's {COUNTRY}; the analysis's click feeds PRODUCTLINE.
//   - The chart: Query Editor on Orders, Product Line and Total, condition
//     Country exactly matches {COUNTRY}.
//   - The weekly schedule runs the report every Monday into the folder,
//     named APAC-Weekly-Orders; the console writes a scheduled Interactive
//     Report as HTML (walked 2026-11-18).
//
// Colors: amber the prompt (in the browser), violet the report and the
// schedule (engines), teal the analysis and the chart's query (models),
// green the folder and the weekly copy (stores). Icons: mouse-pointer-click the
// prompt, file-text the report, chart-pie the chart, table the analysis,
// calendar-clock the schedule, folder-lock the shared folder.
//
// Run from this folder:   node capstone-apac-pack.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const W = 800, BW = 204, BH = 78;
const d = new Diagram(W, 470);

// The dashboard panel holds the prompt, the analysis, the report and the chart.
d.panel({ x: 16, y: 16, w: 538, h: 330, role: 'browser', iconName: 'layout-dashboard', title: 'APAC-Sales-Pack', sub: 'the dashboard the director opens' });
const prompt = d.box({ x: 32, y: 72, w: BW, h: BH, role: 'browser', iconName: 'mouse-pointer-click', title: 'Country prompt', lines: ['Australia, New Zealand,', 'Singapore'] });
const analysis = d.box({ x: 32, y: 248, w: BW, h: BH, role: 'model', iconName: 'table', title: 'Product Line Sales', lines: ['Top 5 lines, % of Sales;', 'click a line'] });
const chart = d.box({ x: 334, y: 72, w: BW, h: BH, role: 'model', iconName: 'chart-pie', title: 'Product lines in…', lines: ['Orders: Country', 'matches {COUNTRY}'] });
const report = d.box({ x: 334, y: 248, w: BW, h: BH, role: 'engine', iconName: 'file-text', title: 'APAC Orders', lines: ['prompts COUNTRY and', 'PRODUCTLINE'] });

d.arrow({ x1: prompt.r, y1: prompt.cy, x2: chart.x - 2, y2: chart.cy, label: '{COUNTRY}' });
d.arrow({ x1: prompt.cx + 40, y1: prompt.b, x2: report.x - 2, y2: report.cy - 18, label: 'COUNTRY', lx: 236, ly: 200 });
d.arrow({ x1: analysis.r, y1: analysis.cy + 20, x2: report.x - 2, y2: report.cy + 20, label: 'PRODUCTLINE' });

// Outside the dashboard: the schedule and what it writes.
const sched = d.box({ x: 580, y: 248, w: BW, h: BH, role: 'engine', iconName: 'calendar-clock', title: 'Weekly schedule', lines: ['every Monday'] });
const pdf = d.box({ x: 580, y: 72, w: BW, h: BH, role: 'store', iconName: 'file-down', title: 'Weekly copy', lines: ['APAC-Weekly-Orders.html,', 'in the APAC folder'] });
d.arrow({ x1: report.r, y1: report.cy, x2: sched.x - 2, y2: sched.cy, label: 'runs' });
d.arrow({ x1: sched.cx, y1: sched.y, x2: pdf.cx, y2: pdf.b + 2, vertical: true, label: 'writes' });

d.bar({ x: 16, y: 370, w: W - 32, h: 64, role: 'store', iconName: 'folder-lock', title: 'Public > Training > APAC', line: 'every file of the pack; shared with the Power User role (Read), no longer inheriting; Administrators keep full access' });

d.write(import.meta.url);
