# Course diagrams

The Pentaho BI Developer: CTools course's diagrams are hand-laid SVG,
drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, and arrows with their labels in white pills. Icons
come from the app's own `lucide-react` package, so they match the icons
in the guide. They name the course's own files, properties, functions,
components and connections, and draw only what the lessons state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes lab-setup.svg and ../images/lab-setup.png.
  node lab-setup.svg.mjs
  ```

* `lab-setup` follows the lab-setup diagrams of the sibling BI Developer
  courses (Schema Workbench, Metadata Editor, Report Designer): the same
  1000-wide canvas, panels and box size. This course has no desktop
  design tool and its lessons name no repository database, so both
  left-hand boxes are the browser and the bar underneath is the start
  script.
* The dashboard lifecycle is a sequence diagram. [`sequence.mjs`](sequence.mjs)
  draws it with the kit's own parts: one panel per actor as a tall lane
  with a dashed lifeline, one kit arrow per numbered message, and a pill
  on a lifeline for a step an actor takes alone. It is a copy of the
  Integrating Authentication Mechanisms course's helper, kept here so the
  course stands on its own. It is a helper, not a diagram, so it has no
  `.svg` of its own.
* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.

Color by role: blue a tool you use or a source you read (CDE and its
Layout perspective, CCC, an external application, a data source in the
Data Sources perspective), violet the Pentaho Server and its engines
(CDA, CGG, the CDE renderer, Rhino, Batik), teal a join or a model (a
component that links layout and data, a parameter, the reshaping of
rows, one chart definition), green a store (the repository and its
files, the sample data and the other data sources), amber the browser
and what happens in it (the User Console, a dashboard, a selector or a
click, the cache check), red a failure (a wrong name, a component that
updates with old data or never updates), slate a supporting service or
note (a server connection, a request's parameters, the start script),
and white a result (the CDF dashboard, the rows CDA returns). Keep one
icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `globe` | the browser |
| `monitor` | your machine |
| `server` | the Pentaho Server |
| `app-window` | the User Console, an external application, the Export Options popup |
| `layout-template` | CDE: the editor, its Layout perspective, its renderer |
| `component` | CDF, its components, the CTools plugins as a whole |
| `layout-dashboard` | a dashboard, as the user sees it |
| `chart-pie` | CCC, and a chart component |
| `chart-line` | `lineChart`, the Carrier Dashboard's line chart |
| `database-zap` | CDA, and a CDA data source (a query) |
| `file-image` | CGG, and an image it renders |
| `database` | a database: `sampledata`, the data sources |
| `plug` | a named server connection in Manage Data Sources (`SampleData`) |
| `files` | the repository, where Save writes |
| `file-cog` | the `.wcdf` |
| `file-json` | the `.cdfde` |
| `file-code` | the `.cda`, and the `Layout_lineChart.js` script CGG runs |
| `triangle-alert` | what a wrong name breaks |
| `list-filter` | a selector, and a request's parameters |
| `mouse-pointer-click` | a click on a chart |
| `variable` | a dashboard parameter |
| `ear` | Listeners |
| `key-round` | CDA's cache key |
| `table` | rows returned to the caller |
| `columns-3` | Column, CalculatedColumn and Output |
| `cog` | an engine that runs something (a DataAccess, Rhino) |
| `braces` | a JavaScript function: Post Fetch |
| `play` | the start script |
| `git-compare` | one definition rendered two ways |

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `lab-setup` | Before You Start: the browser, the Pentaho Server with the CTools plugins, and the `sampledata` database through the `SampleData` connection |
| `ctools-stack` | Getting Started: CDE, CDF and CCC in the browser; the repository, CDA and CGG on the server; the data sources underneath |
| `cde-wiring` | My First Dashboard, tab 3: Panel_3, Total_SalesChart, Total_SalesQuery and the server connection, joined by name, and the `.wcdf`, `.cdfde` and `.cda` that Save writes (linked from UI Overview, Components) |
| `cda-request` | Creating a CDA: one `doQuery` request through the cache check, the DataAccess, the reshaping and back |
| `dashboard-lifecycle` | Overview of Community Dashboard Editor: Browser, CDE renderer and CDA, from the page request to the interaction loop |
| `parameters-listeners` | Carrier Dashboard, Interactions: a selector or a click changes a parameter; Listeners and Parameters decide what updates and with which value |
| `cgg-export` | Carrier Dashboard Charts: one `lineChart` definition drawn by CCC on the dashboard and by CGG (Rhino, Batik) for Export PNG |
