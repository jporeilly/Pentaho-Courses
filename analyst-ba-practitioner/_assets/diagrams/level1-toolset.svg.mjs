// The Level 1 toolset on the Steel Wheels data, and how the capstone
// draws on it: the sample data already on the server, the User Console
// that opens every tool, the two report tools and the workshops built in
// each, Dashboard Designer placing their reports on panels, and the
// capstone's three files, one from each tool. It sits in
// 00-before-you-start/guide.md, "How this course is organized", with a
// "Read the diagram" paragraph after it, and replaces the Mermaid chart
// on the Academy's Level 1 page, which drew the same facts.
//
// Every fact comes from the course's own lessons:
//   - The Steel Wheels sample data is already on the server, bundled
//     with it, and every lab reads it through the server's own data
//     sources (00-before-you-start, "Ports and logins" and "I'm installing
//     on my own machine"). Interactive Reports reads the Orders data
//     source, a business model in the steel-wheels metadata domain
//     (06, "Orders is a metadata model, not a database"); Dashboard
//     Designer's Inventory dashboard queries the Inventory data source
//     (14); Analyzer reads the SteelWheelsSales cube (10, 11).
//   - The User Console is the web-based hub for viewing reports,
//     managing content and scheduling, and every workshop saves into its
//     Public > Training folder (04).
//   - Interactive Reports workshops: Sales Territory (06), Orders — NA
//     and EMEA (07), Ships and Trains (08). Analyzer workshops: Sales
//     Analysis (10), EMEA Quantity (11). Dashboard Designer workshops:
//     Vendor Sales (13), Inventory (14), Product Performance (15).
//   - Dashboard Designer places reports on panels: Vendor Sales places
//     the Vendor Sales Report, an Interactive Report (13); Product
//     Performance places the Product Sales by Year analysis, an Analyzer
//     report (15); and "In addition to displaying content generated from
//     ... Interactive Reporting, and Analyzer" (12).
//   - The capstone (16): an Interactive Report with prompts and totals
//     (APAC-Orders-by-Country), an Analyzer report with a calculated
//     measure (APAC-Product-Line-Sales), and a dashboard that links them
//     (APAC-Sales-Pack), for the APAC regional director; its checks
//     decide the course accreditation.
//
// Colors and icons as in this folder's README: blue the data source
// (database), slate the User Console as the supporting hub (monitor, new
// here and added to the README), amber the web-based tools (file-text
// Interactive Reports, chart-column Analyzer, layout-dashboard Dashboard
// Designer), white the capstone, the result (trophy, new here).
//
// Run from this folder:   node level1-toolset.svg.mjs
// It writes level1-toolset.svg here and ../images/level1-toolset.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: 800 wide. Two full-width bars on top, then the two
// report tools at left and right (BW x BH), Dashboard Designer a row
// below and narrower (DW), centered between them so the arrows into it
// have room, and the capstone across the bottom. 48px between rows for
// the arrows and their pills.
const W = 800, BW = 260, BH = 96, DW = 240;
const L = 16, R = W - 16 - BW, C = (W - DW) / 2; // left, right, center x
const Y = { data: 16, puc: 128, tools: 240, dd: 384, cap: 528 };
const d = new Diagram(W, Y.cap + 96 + 16);

// ── Row 1: the Steel Wheels sample data (blue, a source) ──────────────
const sw = d.bar({ x: L, y: Y.data, w: W - 32, h: 64, role: 'source', iconName: 'database', title: 'Steel Wheels sample data, already on the Pentaho Server', line: 'a metadata domain (the Orders and Inventory data sources) and a cube (SteelWheelsSales)' });

// ── Row 2: the User Console, the hub every tool opens from (slate) ────
const puc = d.bar({ x: L, y: Y.puc, w: W - 32, h: 64, role: 'support', iconName: 'monitor', title: 'Pentaho User Console', line: 'open, organize and schedule reports; every workshop saves into Public > Training' });

// ── Row 3: the two report tools (amber, web-based) ────────────────────
const ir = d.box({ x: L, y: Y.tools, w: BW, h: BH, role: 'browser', iconName: 'file-text', title: 'Interactive Reports', lines: ['ad-hoc reports on the Orders', 'model: Sales Territory, Orders', 'NA and EMEA, Ships and Trains'] });
const an = d.box({ x: R, y: Y.tools, w: BW, h: BH, role: 'browser', iconName: 'chart-column', title: 'Analyzer', lines: ['slice and pivot the', 'SteelWheelsSales cube: Sales', 'Analysis, EMEA Quantity'] });

// ── Row 4: Dashboard Designer, centered under them (amber) ────────────
const dd = d.box({ x: C, y: Y.dd, w: DW, h: BH, role: 'browser', iconName: 'layout-dashboard', title: 'Dashboard Designer', lines: ['panels on one page:', 'Vendor Sales, Inventory,', 'Product Performance'] });

// ── Row 5: the capstone, across the bottom (white, the result) ────────
// Its three files, one from each tool, by the names its checks read.
const cap = d.box({ x: L, y: Y.cap, w: W - 32, h: 96, role: 'result', iconName: 'trophy', title: 'Capstone: the APAC Sales Pack, for the APAC regional director', lines: ['APAC-Orders-by-Country, an Interactive Report with prompts and totals;', 'APAC-Product-Line-Sales, an Analyzer report with a calculated measure;', 'APAC-Sales-Pack, a dashboard that links them'] });

// ── Arrows down the page ──────────────────────────────────────────────
// The data is read through the User Console's tools.
d.arrow({ x1: W / 2, y1: sw.b, x2: W / 2, y2: puc.y - 3, straight: true });
// The console opens each tool. The middle arrow runs between the two
// report tools to Dashboard Designer.
d.arrow({ x1: ir.cx, y1: puc.b, x2: ir.cx, y2: ir.y - 3, straight: true });
d.arrow({ x1: an.cx, y1: puc.b, x2: an.cx, y2: an.y - 3, straight: true });
d.arrow({ x1: W / 2, y1: puc.b, x2: W / 2, y2: dd.y - 3, straight: true });

// Each report tool's reports are placed on a dashboard panel: an arrow
// that leaves the tool's bottom straight down, then turns into
// Dashboard Designer's side. The kit's elbow turns the other way, so the
// path is drawn here with the kit's arrowhead marker; its label sits in
// a pill on the downward leg.
const down = (x1, y1, x2, y2) => d.raw(`<path d="M${x1} ${y1}C${x1} ${y2} ${x1} ${y2} ${x2} ${y2}" fill="none" stroke="#64748b" stroke-width="1.7" marker-end="url(#arrow)"/>`);
const IX = ir.r - 60, AX = an.x + 60; // where each leaves its tool
down(IX, ir.b, dd.x - 3, dd.cy);
down(AX, an.b, dd.r + 3, dd.cy);
d.pill(IX, ir.b + 26, 'placed on a panel');
d.pill(AX, an.b + 26, 'placed on a panel');

// The capstone builds one of each: straight arrows from each tool's
// outer side, clear of the pills, and a short one under Dashboard
// Designer.
d.arrow({ x1: ir.x + 70, y1: ir.b, x2: ir.x + 70, y2: cap.y - 3, straight: true });
d.arrow({ x1: an.r - 70, y1: an.b, x2: an.r - 70, y2: cap.y - 3, straight: true });
d.arrow({ x1: W / 2, y1: dd.b, x2: W / 2, y2: cap.y - 3, straight: true });

d.write(import.meta.url);
