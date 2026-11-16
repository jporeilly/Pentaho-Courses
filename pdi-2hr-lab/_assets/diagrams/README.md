# Course diagrams

This course's diagrams are hand-laid SVG in the house style every
course shares (owner, 2026-11-12: "boxes the same size"; "prettier
with icons"; every course's diagrams follow the same style). It is
often a new user's first Pentaho course, so the diagrams keep to a few
boxes each, name the lab's own steps and files, and draw only what the
lessons state.

* Every diagram is `<name>.svg.mjs`, built from the shared kit in
  [`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
  with a colored title strip, same-size boxes with a Lucide icon in a
  white disc, row tables inside a box (`tableBox`), and curved arrows
  with their labels in white pills. Run it from this folder, and it
  writes `<name>.svg` and renders `../images/<name>.png` at twice its
  size through headless Chrome or Edge:

  ```bash
  node metadata-injection.svg.mjs
  ```

* The PNG is twice the SVG's size, so a figure's `width` is the SVG's
  width, capped at 800 (the reading column). The script prints it.
* Edit the `.svg.mjs`, run it, and commit the script, the `.svg` and the
  `.png` together.
* Each script's header comment lists the facts it draws and the lesson
  each comes from. Check a change against the lesson first.

Color by role: blue a source you read, violet a step that transforms,
teal a join, a lookup that enriches rows or a template that is filled
in, green a write, amber a check or a lookup table, red a reject, white
a result, stone the step's own "unknown" row. In a `tableBox`, a row's
color says what happened to it: blue the row before a change, amber a
version that was closed, green a row that was added, white a row left
untouched.

`first-win-preview` badges the lesson step that uses each point
(`Step 2: Preview`), and `build-the-pipeline` numbers its boxes in a dark
disc on the top-left corner, in the order the lesson builds them.

`retailer-pipeline-target` puts a lab badge (`Lab 3`, `Labs 1-2`) on
the top edge of every box, in the box's own color, so the first lab
shows where each later lab fits.

One icon per thing, and the same icon as the DI Practitioner course
uses for the same concept
([its README](../../../developer-di-practitioner/_assets/diagrams/README.md)):

| Icon | Thing |
| --- | --- |
| `file-text` | A text or CSV file (`sales_20260101.csv`, `products.csv`, `regions.csv`, `control.csv`, the store feeds) |
| `file-json` | A JSON file (`customers.json`) |
| `file-input` | A file input step with nothing set (the template's Read feed) |
| `split` | Filter rows (Keys present?) |
| `circle-x` | Rejected rows |
| `merge` | A lookup or join that enriches rows (Stream lookup, Merge join) |
| `book-open` | A lookup table (the Stream lookup's index in memory) |
| `arrow-down-a-z` | Sort rows |
| `calculator` | Calculator (Compute margin) |
| `history` | Dimension lookup/update |
| `database` | A database table (`dim_customer`) |
| `file-output` | Text file output (`all_feeds.csv`) |
| `list-filter` | Select values (Standardize) |
| `rows-3` | A stream of rows from an earlier step (Valid rows) |
| `circle-check` | A result, or a job's Success |
| `shuffle` | A transformation, or a job entry that runs one |
| `list-ordered` | A job |
| `play` | A job's START |
| `repeat` | A job entry that runs once per row (Execute every input row) |
| `inbox` | Get rows from result |
| `syringe` | ETL metadata injection |
| `file-cog` | A template transformation, filled in by injection |
| `eye` | A Preview of a step's rows (Preview: Valid rows) |
| `table` | The Step Metrics grid of a run |

| Diagram | Page |
| --- | --- |
| `retailer-pipeline-target` | Your First Win: the scenario's target design, with the lab that builds each piece |
| `first-win-preview` | Your First Win: `win_preview.ktr` close up, its four steps and three hops, and what Preview shows on Valid rows (37) and Rejected rows (3) |
| `build-the-pipeline` | Build the Pipeline Yourself: `check_keys.ktr` numbered in the order the lab builds it, and the run's Step Metrics (40 read, 37 valid, 3 rejects) |
| `lookup-vs-merge-join` | Enrich and Join: Stream lookup against Merge join, and where the lab uses each |
| `scd2-before-after` | Track History with One Step: `dim_customer` before and after C001 moves from NW to NE |
| `metadata-injection` | One Pipeline, Many Files: the driver job, the injector and the template |
