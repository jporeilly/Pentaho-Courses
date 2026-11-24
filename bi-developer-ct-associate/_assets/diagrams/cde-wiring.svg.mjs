// My First Dashboard: how CDE's three perspectives are wired together by
// name, and the files Save writes. One chain from the workshop is drawn
// end to end: the Panel_3 column in Layout, the Total_SalesChart
// component in Components, the Total_SalesQuery data source in Data
// Sources, and the server's SampleData connection. It sits in
// 03-getting-started-my-first-dashboard/guide.md, tab 3 (Charts), after
// the "The wizard writes a query and a chart, joined by name" box, and
// lesson 11 (UI Overview) links to it from its Components perspective.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 03, tab 1, "A CDE dashboard is three files": Save as wrote
//     a .wcdf with the dashboard's title and settings, and a .cdfde
//     holding everything the editor shows (layout, components and data
//     sources) as JSON; once the dashboard has data sources, every save
//     also generates a .cda from the Data Sources panel. Lesson 03, tab
//     1, step 9: the folder is public > CTools-Dashboard >
//     My-First-Dashboard. (The plan paired one file per perspective;
//     the lesson says the .cdfde holds all three perspectives and the
//     .cda is generated from Data Sources, so that is what is drawn.)
//   - Lesson 03, tab 1, step 8: in the Two x One template, Panel_3 is
//     the second column of the Body row.
//   - Lesson 03, tab 3, steps 3 and 14: the OLAP Chart Wizard's Html
//     Object is Panel_3; Total_SalesChart is a CCC Pie Chart whose
//     Datasource is Total_SalesQuery and whose HtmlObject is Panel_3.
//   - Lesson 03, "The wizard writes a query and a chart, joined by
//     name": Total_SalesQuery is an "mdx over mondrianJndi" data source
//     holding the JNDI connection, the SteelWheels catalog and an MDX
//     query; CDE renders every layout row and column as a div whose id
//     is the element's Name, and a component draws into the element
//     whose id matches its HtmlObject; a chart that draws nothing is
//     almost always a broken name, a Datasource that names no query or
//     an HtmlObject that names no layout element.
//   - Lesson 03, tab 5 and "The dashboard names a connection; the
//     server holds it": the server reaches the database through a named
//     connection, SampleData (JDBC, Hypersonic, port 9001), in Manage
//     Data Sources; a JNDI data source stores only the connection's name
//     in the .cda, and the server looks it up when a query runs; the
//     names must match for MDX queries to reach the database.
//   - Lesson 11, Components perspective: components link the layout
//     elements with the data sources; HtmlObject is the name of the
//     column element the component is placed on.
//
// Run from this folder:   node cde-wiring.svg.mjs
// It writes cde-wiring.svg here and ../images/cde-wiring.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The canvas: 800 wide, the reading column.
const d = new Diagram(800, 718);
// The three perspective boxes share one size; so do the three files.
const PW = 330, PH = 84, FW = 232, FH = 70;

// Left: the CDE editor (blue, the tool you work in), its three
// perspectives stacked so each join by name is a short vertical arrow.
d.panel({ x: 16, y: 16, w: 362, h: 496, role: 'tool', iconName: 'layout-template', title: 'CDE editor', sub: 'one element from each perspective' });

// Layout (blue): the column the chart draws into, by its Name.
const lay = d.box({ x: 32, y: 84, w: PW, h: PH, role: 'tool', iconName: 'layout-template', title: 'Layout: Panel_3', lines: ['a column of the Body row,', 'drawn as a div with id Panel_3'] });
// Components (teal, the join): the chart names the other two.
const comp = d.box({ x: 32, y: 248, w: PW, h: PH, role: 'join', iconName: 'chart-pie', title: 'Components: Total_SalesChart', lines: ['HtmlObject: Panel_3', 'Datasource: Total_SalesQuery'] });
// Data Sources (blue, a source): the query names the connection.
const dsq = d.box({ x: 32, y: 412, w: PW, h: PH, role: 'source', iconName: 'database-zap', title: 'Data Sources: Total_SalesQuery', lines: ['mdx over mondrianJndi, SteelWheels', "Jndi: a server connection's name"] });

// The component's two joins: HtmlObject up to the layout element,
// Datasource down to the query. Each arrow points at what it names.
d.arrow({ x1: comp.cx, y1: comp.y, x2: lay.cx, y2: lay.b + 3, vertical: true, label: ['HtmlObject =', "the column's Name"] });
d.arrow({ x1: comp.cx, y1: comp.b, x2: dsq.cx, y2: dsq.y - 3, vertical: true, label: ['Datasource =', "the query's Name"] });

// Right, top: what a wrong name does (red, a failure), one line per join.
d.box({ x: 520, y: 84, w: 264, h: 120, role: 'reject', iconName: 'triangle-alert', title: 'One wrong name', lines: ['wrong HtmlObject: no chart', 'wrong Datasource: no data', 'wrong Jndi: no database'] });

// Right, bottom: the Pentaho Server (violet) and the named connection it
// holds (slate, a supporting service), level with the query that names it.
d.panel({ x: 504, y: 324, w: 280, h: 188, role: 'server', iconName: 'server', title: 'Pentaho Server', sub: 'Manage Data Sources' });
const conn = d.box({ x: 520, y: 412, w: 248, h: PH, role: 'support', iconName: 'plug', title: 'SampleData', lines: ['JDBC, Hypersonic,', 'port 9001'] });

// The query's third join: its Jndi names the server's connection.
d.arrow({ x1: dsq.r, y1: dsq.cy, x2: conn.x - 3, y2: conn.cy, straight: true, label: ['Jndi =', 'its name'], lx: 441 });

// Bottom: the repository (green, a store) and the three files Save writes.
d.panel({ x: 16, y: 552, w: 768, h: 150, role: 'store', iconName: 'files', title: 'Repository: what Save writes', sub: 'public > CTools-Dashboard > My-First-Dashboard' });
d.box({ x: 32, y: 616, w: FW, h: FH, role: 'store', iconName: 'file-cog', title: '.wcdf', lines: ['title and settings'] });
d.box({ x: 284, y: 616, w: FW, h: FH, role: 'store', iconName: 'file-json', title: '.cdfde', lines: ['all three perspectives,', 'as JSON'] });
d.box({ x: 536, y: 616, w: FW, h: FH, role: 'store', iconName: 'file-code', title: '.cda', lines: ['built from Data Sources', 'at every save'] });

// Save: from the editor down into the repository.
d.arrow({ x1: 197, y1: 512, x2: 197, y2: 549, vertical: true, label: 'Save' });

d.write(import.meta.url);
