# Course diagrams

This course's diagrams are hand-laid SVG in the house style every
course shares (owner, 2026-11-12: "boxes the same size"; "prettier
with icons"; every course's diagrams follow the same style). They follow
the Sales Mart from the order system to the cube, name the course's own
tables, steps, keys and row counts, and draw only what the lessons
state.

* Every diagram is `<name>.svg.mjs`, built from the shared kit in
  [`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
  with a colored title strip, same-size boxes with a Lucide icon in a
  white disc, table entities (`entity`), row tables inside a box
  (`tableBox`), and arrows with their labels in white pills. Run it from
  this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes load-job.svg and ../images/load-job.png.
  node load-job.svg.mjs
  ```

* The PNG is twice the SVG's size, so a figure's `width` is the SVG's
  width, capped at 800 (the reading column). The script prints it.
* The load job is drawn twice, as lesson 09 builds it and as lesson 10
  finishes it. [`load-job-layout.mjs`](load-job-layout.mjs) lays out
  both, and `load-job.svg.mjs` and `load-job-refresh.svg.mjs` each say
  only whether the HTTP entry is there. It is a helper, not a diagram,
  so it has no `.svg` of its own.
* Three diagrams share one shape (a row, the step that looks it up, what
  it finds, what it does): `customer-four-outcomes`, `product-overwrite`
  and `safe-to-run-twice`. [`outcomes-layout.mjs`](outcomes-layout.mjs)
  lays them out; it is a helper too.
* Edit the `.svg.mjs`, run it, and commit the script, the `.svg` and the
  `.png` together.
* Each script's header comment lists the facts it draws and the lesson
  each comes from. Check a change against the lesson first.

Color by role: blue a source you read (the order system's tables, an
extract file, an order), violet an engine or a step that transforms
(a transformation entry, the cube on the Pentaho Server), teal a join
or a model (the fact table, a lookup that adds a key, the Mondrian
schema), green a store or a write (a dimension, a summary table,
Insert / Update), amber the browser or a check (Analyzer, the HTTP
entry, the rep the capstone checks), red a failure (Abort job), slate a
supporting service (the job, its Start entry), stone the dimensions'
own unknown member, white a result (Success). In a `tableBox`, a row's
color says what happened to it: blue the row before a change, amber a
version that was closed or a value overwritten, green a version that
was added.

One icon per thing:

| Icon | Thing |
| --- | --- |
| `table-2` | A fact table (`mart_fact_sales`, `rep_fact_order_lines`) |
| `calendar` | The date dimension (`mart_dim_date`, `rep_dim_date`) |
| `users` | The customer dimension, or the `CUSTOMERS` table |
| `package` | The product dimension, or the `PRODUCTS` table |
| `history` | A type 2 dimension or the step that keeps one (Dimension lookup/update, `rep_dim_sales_rep`) |
| `database` | A database table in a row view, or a write to one (Load, `iu-fact_sales`) |
| `receipt` | An order (`ORDERS`, orders 10417 and 10424) |
| `rows-3` | Order lines (`ORDERDETAILS`) |
| `file-text` | A text or CSV file (the extracts, `csvi-order_lines`) |
| `merge` | A lookup that adds a key (Database lookup), or the fact transform |
| `calculator` | Calculator (`calc-sales_amount`) |
| `sigma` | Group by into a summary table (`agg_` tables) |
| `circle-help` | Key 0, the unknown member |
| `square-pen` | A type 1 overwrite |
| `file-cog` | The Mondrian schema (`sales_mart.xml`) |
| `boxes` | A cube (Sales Mart, `sales_rep_mart.xml`) |
| `chart-column` | Analyzer, and the panel of summaries and the cube |
| `list-ordered` | A job (`jb_load_sales_mart`, `load_sales_rep_mart.kjb`) |
| `play` | A job's Start |
| `shuffle` | A transformation, or a job entry that runs one |
| `globe` | The HTTP entry (`refresh-mondrian-cache`) |
| `circle-x` | Abort job |
| `circle-check` | A job's Success |
| `calendar-clock` | A schedule on the Pentaho Server |
| `building-2` | A sales office (the capstone's rep who moves office) |
| `workflow` | Spoon |
| `terminal` | DBeaver |
| `monitor`, `server`, `container` | Your machine, the Pentaho Server, the MySQL lab kit |
| `list-plus` | Add sequence |
| `arrow-right-left` | Value mapper |
| `list-x` | Select values |
| `scan-search` | Insert / Update looking a row up |
| `map-pin` | A type 2 change of city |
| `plus`, `equal`, `skip-forward` | A row inserted, unchanged, left alone |
| `shield-check` | A primary key as the safety net |
| `refresh-cw` | The cube's cache refreshed |

| Diagram | Page |
| --- | --- |
| `sales-mart-star` | From Source Data to a Star Schema: the Sales Mart star, `mart_fact_sales` and its three dimensions, a key on every join |
| `order-system-to-cube` | From Source Data to a Star Schema: the route from the order system's tables to Analyzer, dimensions before facts |
| `scd-euro-plus-moves` | Overview of Dimensional Modeling: Euro+ Shopping Channel's two versions and the May orders that find them, beside La Rochelle Gifts' type 1 overwrite |
| `fact-load-one-line` | Load the Fact Table: the first order line through the three lookups, key 0, the Calculator and Insert / Update |
| `load-job` | Schedule the Load on the Pentaho Server: `jb_load_sales_mart` as that lesson builds it |
| `load-job-refresh` | Refresh the Cube After a Load: the same job with `refresh-mondrian-cache` before Success |
| `capstone-sales-rep-mart` | Capstone: the `rep_` star, its aggregate, and the nightly job that refreshes the cube |
| `lab-setup` | Before You Start: Spoon, the User Console and DBeaver, the Pentaho Server, and the mart in MySQL |
| `date-one-day` | Build a Date Dimension: 6 January 2003 through the seven steps |
| `customer-four-outcomes` | Load Dimensions: the 15 May extract, 123 rows, four outcomes |
| `product-overwrite` | Load Dimensions: the type 1 product load |
| `safe-to-run-twice` | Overview of Loading Facts: Insert / Update and the primary key |
| `summary-two-flows` | Summary Tables: the same order lines summed two ways |
| `cube-cache-june` | Refresh the Cube: the table, the cache and the report at four moments |
