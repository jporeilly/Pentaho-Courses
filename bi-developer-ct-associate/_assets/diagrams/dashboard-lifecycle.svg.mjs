// Overview of Community Dashboard Editor: the lifecycle of a CDE
// dashboard, as a sequence of Browser, the CDE renderer on the Pentaho
// Server and CDA. The page request, the page and the modules it loads,
// the components' start-up, their queries and rendering, then the
// interaction loop that repeats on every parameter change. It replaces
// the Mermaid export cde_dashboard_lifecycle.png at the foot of
// 10-community-dashboard-editor/guide.md.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 10: CDE builds on CDF; understanding CDF's dashboard and
//     component lifecycles stays crucial. Lesson 07: CDF manages the
//     components' lifecycles and the interactions between them.
//   - Lesson 03, "The wizard writes a query and a chart, joined by
//     name": CDE renders every layout row and column as a div whose id
//     is the element's Name, and a component draws into the element
//     whose id matches its HtmlObject.
//   - Lesson 11, Settings: a CDE dashboard has a RequireJS Support check
//     box (cleared by default; lesson 15 selects it). Lessons 08 and 09:
//     with require on, the page loads the CDF modules through RequireJS
//     and the dashboard's script creates the dashboard, adds its
//     components and calls init().
//   - Lesson 12, "Enable mainTable": when a dashboard loads, all its
//     components are created, and Execute at start decides whether each
//     one runs then. Lesson 11, component properties: Execute at Start
//     is True by default; Priority orders execution, 5 by default, the
//     lower the number the higher the priority; if preExecution returns
//     false the component is not updated; once the query executes, the
//     returned data is passed to postFetch, and the component is
//     rendered only after postFetch runs.
//   - Lesson 05, doQuery and "A dashboard's data arrives through
//     doQuery": every CDF and CDE component fetches its data with
//     doQuery: path, dataAccessId and one param<name>=<value> pair per
//     entry in its Parameters property; json is the default output.
//   - Lesson 12, Selectors, clickAction and "fireChange updates
//     listeners; parameters carry values": a selector stores the choice
//     in a parameter, a click action calls fireChange; every enabled
//     component whose Listeners include the parameter updates, and its
//     Parameters entry carries the new value to its query.
//
// Run from this folder:   node dashboard-lifecycle.svg.mjs
// It writes dashboard-lifecycle.svg here and
// ../images/dashboard-lifecycle.png at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { lanes, msg, note } from './sequence.mjs';

// The canvas: 800 wide, the reading column; the lanes fill its height.
const W = 800;
const d = new Diagram(W, 800);
const TOP = 16, H = 768;

// The three actors. The browser amber (its role); the CDE renderer and
// CDA both violet, as the server's two plugins in this story.
const [br, cde, cda] = lanes(d, {
  top: TOP, height: H, cols: [
    { x: 16, w: 240, role: 'browser', iconName: 'globe', title: 'Browser', sub: 'the dashboard runs here' },
    { x: 280, w: 240, role: 'server', iconName: 'layout-template', title: 'CDE renderer', sub: 'Pentaho Server' },
    { x: 544, w: 240, role: 'server', iconName: 'database-zap', title: 'CDA', sub: 'Pentaho Server, doQuery' },
  ],
});

// Steps 1 and 2: the page request, and the page CDE writes. Replies dashed.
msg(d, br, cde, 100, '1  open the dashboard');
note(d, cde, 150, ['each layout row and column', 'becomes a div, id = its Name']);
msg(d, cde, br, 206, ['2  the page: the layout divs', "and the dashboard's script"], { dashed: true });

// Steps 3 to 5: start-up, all in the browser, so pills on its lifeline.
note(d, br, 262, ['3  load the CDF modules', '(RequireJS, if Support is on)']);
note(d, br, 326, ['4  init(): every component', 'created; Execute at Start', 'ones run, by Priority']);
note(d, br, 392, '5  preExecution: false = skip');

// Steps 6 and 7: each running component's query. These cross the CDE
// lane, so their pills sit between the CDE and CDA lifelines.
msg(d, br, cda, 440, ['6  doQuery: path, dataAccessId,', 'param<name>=<value>'], { lx: 532 });
msg(d, cda, br, 494, '7  the rows, json', { dashed: true, lx: 532 });

// Step 8: the component draws.
note(d, br, 542, ['8  postFetch, then it renders', 'into its HtmlObject div']);

/**
 * The interaction loop: a dashed amber band across all three lanes,
 * drawn on the panel layer so the arrows and pills sit on top, with its
 * caption in its bottom-right corner.
 */
function band(y, h, caption) {
  d.under.push(`<rect x="${br.cx - 100}" y="${y}" width="${cda.cx - br.cx + 200}" height="${h}" rx="10" fill="#fffbeb" fill-opacity="0.85" stroke="#b45309" stroke-width="1.2" stroke-dasharray="6 4"/>`);
  d.under.push(`<text x="${cda.cx + 92}" y="${y + h - 10}" text-anchor="end" font-size="11.5" font-weight="600" fill="#b45309">${caption}</text>`);
}
band(584, 178, 'repeats on every parameter change');

// Steps 9 to 11: a change, the listeners' queries, the redraw.
note(d, br, 616, ['9  a selector or a click:', 'the parameter changes']);
msg(d, br, cda, 668, ['10  each listener runs again:', 'doQuery, the new value'], { lx: 532 });
msg(d, cda, br, 714, '11  rows; it renders again', { dashed: true, lx: 532 });

d.write(import.meta.url);
