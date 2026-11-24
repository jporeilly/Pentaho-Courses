// Sales Dashboard Charts (CGG): one component definition, two render
// paths. On the dashboard, lineChart's Post Fetch finds no cgg object and
// CCC draws the chart in the browser; on Export Chart, CGG's draw service
// runs the script CDE wrote at save in Rhino on the server, where the cgg
// object exists, CCC draws the SVG there and Batik turns it into a PNG.
// It sits in 14-community-graphics-generator-carrier-dashboard/guide.md,
// under "Dashboard vs. Export Visualization", before the typeof cgg
// listing.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 14, "Dashboard vs. Export Visualization": the Post Fetch
//     function runs in both places; when typeof cgg == 'undefined' the
//     code is running in the dashboard, otherwise in the export.
//   - Lesson 14, "Handling Parameters in Exports": a CGG export script
//     can't read CDE parameters or call dashboard.getParameterValue; a
//     value reaches the export as a query parameter, from the
//     component's Parameters property or Pre Execution; Post Fetch reads
//     it with dashboard.getParameterValue in the dashboard and
//     params.get in CGG.
//   - Lesson 14, tab 1: the workshop's Post Fetch on lineChart sets
//     width, title, legend and axis properties only when typeof cgg !=
//     'undefined'; Export Chart in the Export Options popup shows the CGG
//     rendering, and Export in the popup downloads the PNG; the popup
//     works in the dashboard itself, not in Preview.
//   - Lesson 14, "The export runs your chart again, on the server":
//     Export Chart calls CGG's draw service with the script CDE wrote when
//     you saved, lineChart.js beside the dashboard; it loads
//     cdf-env.js, rebuilds lineChart from the same definition, postFetch
//     included, with its data source, and ends with
//     cgg.render(render_lineChart); CGG runs it in Rhino, a JavaScript
//     engine inside the server, and converts the SVG CCC draws into PNG
//     with Batik; the popup sends each of the chart's parameters with its
//     current value as param<name>; one component definition serves the
//     screen and the export.
//   - Lesson 13: the draw service URL is
//     /pentaho/plugin/cgg/api/services/draw?script=<path to the script>.
//     Lesson 11, Charts: CCC is built on Protovis and draws in the
//     browser.
//
// Run from this folder:   node cgg-export.svg.mjs
// It writes cgg-export.svg here and ../images/cgg-export.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The canvas: 800 wide, the reading column.
const d = new Diagram(800, 640);
// Every step box on both paths shares one size.
const BW = 328, BH = 90;

// Top: the one definition both paths use (teal, the model).
const def = d.box({ x: 236, y: 16, w: 328, h: 90, role: 'model', iconName: 'chart-line', title: 'lineChart: one definition', lines: ['chart properties and Post Fetch,', 'saved by CDE with the dashboard'] });

// The two paths: the browser (amber) and CGG on the server (violet).
d.panel({ x: 16, y: 150, w: 360, h: 384, role: 'browser', iconName: 'globe', title: 'In the browser', sub: 'the dashboard' });
d.panel({ x: 424, y: 150, w: 360, h: 384, role: 'server', iconName: 'server', title: 'CGG, on the server', sub: 'plugin/cgg/api/services/draw' });

// Browser path: Post Fetch takes the dashboard branch, CCC draws, and the
// Export Options popup is where an export starts and ends.
const pf = d.box({ x: 32, y: 214, w: BW, h: BH, role: 'browser', iconName: 'braces', title: 'Post Fetch on the dashboard', lines: ["typeof cgg == 'undefined':", 'the dashboard block runs;', 'values: dashboard.getParameterValue'] });
const cc = d.box({ x: 32, y: 324, w: BW, h: BH, role: 'tool', iconName: 'chart-pie', title: 'CCC draws the chart', lines: ['SVG in the browser, with', "the dashboard's formatting"] });
const pop = d.box({ x: 32, y: 434, w: BW, h: BH, role: 'browser', iconName: 'app-window', title: 'Export Options popup', lines: ['Export Chart asks CGG;', 'Export downloads the PNG'] });

// Server path: the draw service, the script in Rhino, then Batik.
const dr = d.box({ x: 440, y: 214, w: BW, h: BH, role: 'server', iconName: 'file-code', title: 'Draw service', lines: ['script lineChart.js; each', 'parameter arrives as param<name>'] });
const rh = d.box({ x: 440, y: 324, w: BW, h: BH, role: 'server', iconName: 'cog', title: 'Rhino runs the script', lines: ['cdf-env.js, lineChart, Post Fetch:', 'cgg exists, the export block runs;', "values: params.get"] });
const bt = d.box({ x: 440, y: 434, w: BW, h: BH, role: 'server', iconName: 'file-image', title: 'Batik: SVG to PNG', lines: ['CCC draws the SVG in Rhino;', 'Batik converts it to PNG'] });

// The definition feeds both paths. The browser arrow enters the panel's
// title strip right of its text; the server arrow leaves sideways and
// drops in at the strip's right end.
d.arrow({ x1: 340, y1: def.b, x2: 340, y2: 147, vertical: true, label: 'dashboard', ly: 128 });
d.arrow({ x1: def.r, y1: def.cy, x2: 740, y2: 147, elbow: true, label: 'Save wrote the script', lx: 680, ly: 61 });

// Down the browser path.
d.arrow({ x1: pf.cx, y1: pf.b, x2: cc.cx, y2: cc.y - 3, vertical: true });
d.arrow({ x1: cc.cx, y1: cc.b, x2: pop.cx, y2: pop.y - 3, vertical: true });

// The export request crosses to the server through the gutter.
d.arrow({ x1: pop.r, y1: pop.cy - 22, x2: dr.x - 3, y2: dr.cy, label: 'Export Chart', lx: 400, ly: 360 });

// Down the server path, and the PNG back to the popup.
d.arrow({ x1: dr.cx, y1: dr.b, x2: rh.cx, y2: rh.y - 3, vertical: true });
d.arrow({ x1: rh.cx, y1: rh.b, x2: bt.cx, y2: bt.y - 3, vertical: true });
d.arrow({ x1: bt.x, y1: bt.cy + 22, x2: pop.r + 3, y2: pop.cy + 22, straight: true, label: 'PNG' });

// Underneath: what differs between the two (slate, a supporting note).
d.bar({ x: 16, y: 554, w: 768, h: 70, role: 'support', iconName: 'git-compare', title: 'One definition, two renderings', line: 'only the typeof cgg switch in Post Fetch differs; the export shows the values the chart had when you clicked' });

d.write(import.meta.url);
