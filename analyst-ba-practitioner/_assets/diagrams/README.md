# Course diagrams

The Business Analyst Practitioner course's diagrams are hand-laid SVG,
drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, and arrows with their labels in white pills. Icons
come from the app's own `lucide-react` package, so they match the icons
in the guide. They name the course's own tools, files, prompts and
parameters, and draw only what the lessons state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes models-and-tools.svg and ../images/models-and-tools.png.
  node models-and-tools.svg.mjs
  ```

* The three workflow strips share one drawing,
  [`scripts/workflow-strip.mjs`](../../../../scripts/workflow-strip.mjs)
  (moved there from this folder on 2026-11-18, when SW's Basic Model
  took the same strip); each `*-workflow.svg.mjs` names only its parts
  and calls `writeWorkflow`.

* `pentaho-architecture` is a port of the course's earlier hand-written
  script to the kit, with the same content. It now writes
  `../images/pentaho-architecture.png`, which the User Console lesson
  shows; the two older PNGs it replaced (`1793631012928.png` and
  `getting_started_pentaho_architecture.png`) are gone.
* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.
* Five diagrams are "what you'll build" mock-ups of a finished report or
  analysis, a clean table, not a screenshot: `report-sales-territory`,
  `report-orders-na-emea`, `report-ships-trains`,
  `analyzer-sales-analysis` and `analyzer-emea-quantity`. They share the helpers in `report-mockup.mjs`
  (page header, title, filter and prompt chips, the grid of rows, a
  legend), which draws nothing by itself. Every value in them comes
  from the lesson, its solution file or its screenshots; a few the
  lessons do not print (the NA Territory Subtotal in Sales Territory,
  the Trains rows in Ships and Trains) are computed from the Steel
  Wheels sample data in `lab-kits/MySQL/sampledata_data.sql` with the
  rule that reproduces every figure the lessons do print. Each header
  comment says which is which.

Color by role: blue a tool you use or a source you read (the design
tools, the Data Source Wizard, a data source), violet the Pentaho Server
or an engine (Mondrian, a report's engine, a report's own parameters),
teal a model (a metadata model, a Mondrian schema, a Metadata List
query on Orders), green a store (the repository), amber the browser
(the web-based User Console tools, the prompt toolbar, a dashboard's
panels), slate a supporting group (the design-tools panel, a server's
plugins, a dashboard as a container), and white a result (a plugin, the
takeaway). In the report mock-ups, slate is also a table's column
headings and an Analyzer level's name, teal a group header, violet a
subtotal or total the report engine (or Mondrian) computes, amber a
filter or prompt chip, stone the rows a mock-up leaves out, and green
only Analyzer's own Data Bar: Green. The kit's red (a reject) is not
used here. Keep one icon per thing across the diagrams:

| Icon | Stands for |
| --- | --- |
| `server` | the Pentaho Server, and a report's engine |
| `shuffle` | Data Integration |
| `box` | Schema Workbench |
| `layers` | Metadata Editor |
| `wand-sparkles` | the Data Source Wizard |
| `file-chart-column` | Report Designer, and its `.prpt` reports |
| `file-text` | Interactive Reports, and a report (Vendor Sales Report, the mock-ups' Interactive Reports) |
| `chart-column` | Analyzer, and an Analyzer report (Product Sales Analysis, the mock-ups' analyses) |
| `layout-dashboard` | Dashboard Designer, and a dashboard |
| `shapes` | a metadata model (`.xmi`, Orders), and a Metadata List query on it |
| `file-code` | a Mondrian schema (`.mondrian.xml`) |
| `cog` | Mondrian, and the cube it serves |
| `database` | a data source |
| `folder-tree` | the repository |
| `mouse-pointer-click` | a dashboard prompt and its buttons |
| `list-filter` | a report parameter (`region`, `Product Line`), and an Interactive Report's prompt (`COUNTRY`, `PRODUCTLINE`) |
| `chart-pie` | a Chart Designer pie chart (Territory Sales Mix) |
| `chart-bar-big` | a Chart Designer bar chart (Order Status) |
| `link` | the parameter contract between panels |
| `monitor` | the Pentaho User Console |
| `trophy` | the capstone, the APAC Sales Pack |
| `filter` | a fixed filter on a report or analysis (a chip in a mock-up) |
| `table` | an Analyzer report as one box (the capstone's Product Line Sales) |
| `calendar-clock` | a schedule |
| `file-down` | a file a schedule writes |
| `folder-lock` | a repository folder shared with one role |
| `columns-3`, `arrow-down-wide-narrow`, `sigma` | a workflow part: adding columns, grouping and sorting, totals |
| `calculator` | a workflow part: calculations |
| `layout-template`, `panels-top-left` | a workflow part: a dashboard's template, its panels' content |
| `save` | a workflow part: saving to the repository |

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `pentaho-architecture` | Overview of PUC (03): the client design tools, the Pentaho Server's plugins, the repository and the data sources, with the file each tool publishes |
| `models-and-tools` | Overview of PUC (03), "The tools you will use": which model feeds which tool, and the one-way path from an Interactive Report to Report Designer |
| `dashboard-prompts` | Vendor Sales (13), "8. Apply the Prompt": a Metadata List fills each prompt, and the prompt's dashboard parameter is the Source of the report's `region` or `Product Line` |
| `content-linking` | Product Performance (15), "7. Take Both Parameters": which panel publishes `Product` and `Territory`, which panel takes each, and what each queries |
| `level1-toolset` | Before You Start (00), "How this course is organized": the Steel Wheels data, the User Console, the three tools and their workshops, and the capstone's three files; it also replaces the Mermaid chart on the Academy's Level 1 page |
| `report-sales-territory` | Sales Territory (06), at the top: the finished report's first group (NA > Canada), its Country and Territory subtotals and the Grand Total |
| `report-orders-na-emea` | Orders — NA and EMEA (07), at the top: the three filters, the first EMEA > Classic Cars rows, the Line subtotal, both Territory Totals and the Grand Total |
| `report-ships-trains` | Ships and Trains (08), at the top: the Product Line filter, all of APAC (Ships and Trains with their subtotals), the Grand Total and the page footer |
| `analyzer-sales-analysis` | Sales Analysis (10), at the top: the EMEA and 2003 filters and the whole Revenue pivot, seven product lines by four quarters |
| `analyzer-emea-quantity` | EMEA Quantity (11), at the top, after the tree map: the table view, the first five countries with data bars and ranks, and the Grand Total |
| `ir-workflow` | Sales Territory (06), tab "2. Sales Territory Report": the Interactive Report workflow in six parts; `ir-workflow-1` to `-6` light one part each and open the six inner tabs |
| `az-workflow` | Sales Analysis (10), tab "2. Sales Analysis": the Analyzer workflow in four parts; `az-workflow-1` to `-4` open its four inner tabs, and EMEA Quantity's (11) eight tabs, two to a part |
| `dd-workflow` | Vendor Sales (13), above the tabs: the Dashboard Designer workflow in four parts; `dd-workflow-1` to `-4` open the ten tabs, each lighting the part it belongs to |
| `capstone-apac-pack` | APAC Sales Pack (16), at the top ("What you will build"): the dashboard's prompt feeding the report and the chart, the analysis's click feeding the report, the weekly schedule and its PDF, and the folder shared with Power User |
