// Getting Started: the five CTools and how they connect. The browser
// holds the CDE editor, the CDF dashboard it produces and the CCC charts
// that dashboard draws; the Pentaho Server holds the repository files,
// CDA and CGG, with the data sources underneath. It sits in
// 01-getting-started/guide.md, under the page's introduction and before
// the "Components" tabs that describe each tool in turn.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 01, intro and note: CTools are a stack of open-source tools
//     installed on top of the Pentaho Server. CDA unifies access to the
//     data sources, CDF and CDE build the dashboards (framework and
//     graphical editor), CCC renders the charts, CGG exports those charts
//     as server-side images.
//   - Lesson 00, "I'm installing on my own machine" note: the CTools are
//     plugins that live inside the Pentaho Server, and every dashboard in
//     the course is built in the browser.
//   - Lesson 01, CDE tab: CDE is a graphical dashboard editor that gives
//     access to the dashboard components in CDF, on a layout grid.
//     Lesson 11: its three perspectives are Layout, Components and Data
//     Sources.
//   - Lesson 03, "A CDE dashboard is three files": Save writes a .wcdf
//     (title and settings), a .cdfde (layout, components and data
//     sources, as JSON) and, once there are data sources, a .cda to the
//     repository.
//   - Lesson 01, CDF tab, and lesson 07: CDF manages the components'
//     lifecycles and the interactions between them, with JavaScript, CSS
//     and HTML. Lesson 10: CDE builds on CDF.
//   - Lesson 01, CCC tab, and lesson 11, Charts: CCC is a charting
//     library built on Protovis, which draws SVG in the browser with no
//     plugins; the CCC chart components are added in CDE.
//   - Lesson 05, "A dashboard's data arrives through doQuery": every CDF
//     and CDE component fetches its data with CDA's doQuery endpoint.
//   - Lesson 05, "How CDA serves data": CDA queries SQL over JDBC or
//     JNDI, MDX over Mondrian or olap4j, MQL over Pentaho metadata,
//     Kettle transformations, scripting, XPath and compound queries.
//   - Lesson 01, CGG tab, and lesson 13: CGG draws, within the server,
//     the same chart the dashboard shows in the browser, and exports it
//     as an image (PNG, JPG or SVG) for reports, email and PDF; it reads
//     its data through CDA. Lesson 14: CGG rebuilds the chart from the
//     same component definition and runs CCC on the server.
//
// Run from this folder:   node ctools-stack.svg.mjs
// It writes ctools-stack.svg here and ../images/ctools-stack.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The canvas: 800 wide, the reading column, so the figure is 1:1.
const d = new Diagram(800, 536);
// One box size for every tool, so the five CTools read as equals.
const BW = 232, BH = 84;

// The two places the stack lives: the browser (amber, the browser's
// role) and the Pentaho Server (violet, the server's role).
d.panel({ x: 16, y: 16, w: 768, h: 172, role: 'browser', iconName: 'globe', title: 'In the browser', sub: 'the User Console, http://localhost:8080/pentaho' });
d.panel({ x: 16, y: 236, w: 768, h: 172, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'the CTools plugins live here' });

// Top row, in the browser: the editor you work in (blue, a tool), the
// dashboard it produces (white, the result) and the chart library the
// dashboard draws with (blue, a tool).
const cde = d.box({ x: 32, y: 88, w: BW, h: BH, role: 'tool', iconName: 'layout-template', title: 'CDE', lines: ['the graphical editor: Layout,', 'Components, Data Sources'] });
const cdf = d.box({ x: 284, y: 88, w: BW, h: BH, role: 'result', iconName: 'component', title: 'CDF dashboard', lines: ['built by CDE: components,', 'parameters, lifecycle'] });
const ccc = d.box({ x: 536, y: 88, w: BW, h: BH, role: 'tool', iconName: 'chart-pie', title: 'CCC', lines: ["the dashboard's charts,", 'SVG drawn by Protovis'] });

// Middle row, on the server: the files Save writes (green, a store), the
// data layer (violet, an engine) and the image renderer (violet).
const repo = d.box({ x: 32, y: 308, w: BW, h: BH, role: 'store', iconName: 'files', title: 'Repository', lines: ['.wcdf, .cdfde and .cda,', 'what Save writes'] });
const cda = d.box({ x: 284, y: 308, w: BW, h: BH, role: 'server', iconName: 'database-zap', title: 'CDA', lines: ['one data layer over every', 'source; caches results'] });
const cgg = d.box({ x: 536, y: 308, w: BW, h: BH, role: 'server', iconName: 'file-image', title: 'CGG', lines: ['the same chart, drawn on', 'the server: PNG, JPG, SVG'] });

// Underneath: the data sources CDA reads (green, a store).
const ds = d.bar({ x: 16, y: 442, w: 768, h: 74, role: 'store', iconName: 'database', title: 'Data sources', line: 'SQL over JDBC or JNDI, MDX over Mondrian or olap4j, Pentaho metadata, Kettle, scripting, XPath' });

// CDE saves the dashboard as files in the repository: straight down,
// at the boxes' right-hand side so it clears the server panel's title.
d.arrow({ x1: cde.r - 40, y1: cde.b, x2: repo.r - 40, y2: repo.y - 3, vertical: true, label: 'Save', ly: 212 });

// The editor's components are CDF components: CDE writes a CDF dashboard.
d.arrow({ x1: cde.r, y1: cde.cy, x2: cdf.x - 3, y2: cdf.cy, straight: true });

// The dashboard's chart components draw with CCC.
d.arrow({ x1: cdf.r, y1: cdf.cy, x2: ccc.x - 3, y2: ccc.cy, straight: true });

// Every component fetches its data from CDA with doQuery: straight down.
d.arrow({ x1: cdf.cx, y1: cdf.b, x2: cda.cx, y2: cda.y - 3, vertical: true, label: 'doQuery', ly: 212 });

// CGG runs the same CCC chart on the server: dashed, the same definition
// rather than a call.
d.arrow({ x1: ccc.cx, y1: ccc.b, x2: cgg.cx, y2: cgg.y - 3, vertical: true, dashed: true, label: 'same chart', ly: 212 });

// CGG reads its data through CDA too.
d.arrow({ x1: cgg.x, y1: cgg.cy, x2: cda.r + 3, y2: cda.cy, straight: true });

// CDA queries the sources.
d.arrow({ x1: cda.cx, y1: cda.b, x2: ds.cx, y2: ds.y - 3, vertical: true });

d.write(import.meta.url);
