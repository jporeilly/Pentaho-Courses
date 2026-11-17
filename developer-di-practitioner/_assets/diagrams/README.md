# Course diagrams

This course's diagrams are hand-laid SVG (owner, 2026-11-12: "boxes the
same size"; "prettier with icons"; every course's diagrams follow the
same style). Mermaid sized every box to its own text, so it could not
keep a diagram's boxes equal; the `.mmd` sources were redrawn on
2026-11-12 and removed. The clearest few (Carte cluster, the merge
diagrams) stayed Mermaid for a day, until the owner asked for every one
in this style ("make them all pretty, carte cluster included").

* Every diagram is `<name>.svg.mjs`, built from the shared kit in
  [`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
  with a colored title strip, same-size boxes with a Lucide icon in a
  white disc, row tables inside a box (`tableBox`), entity tables for an
  ER diagram (`entity`), and curved arrows with their labels in white
  pills. Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  node xml-join-orders.svg.mjs
  ```

* The PNG is twice the SVG's size, so a figure's `width` is the SVG's
  width, capped at 800 (the reading column). The script prints it.
* Edit the `.svg.mjs`, run it, and commit the script, the `.svg` and the
  `.png` together.

Color by role: blue a source you read, violet a step that transforms,
teal a join or a merge, green a write, amber a check or a lookup, red a
reject, stone what a join leaves out. One icon per thing across every
course's diagrams: `sheet` Excel input, `file-input` CSV file input,
`database-search` Table input, `database` a database or Table output,
`grid-3x3` Data grid, `shuffle` a transformation, `combine` XML Join,
`file-code` XML, `flag` a Merge rows (diff) flag, `pencil`/`plus`/
`trash-2` UPDATE/INSERT/DELETE, `book-open` a lookup table. Also: `workflow` Spoon, `network` a Carte
master, `cpu` a Carte slave, `play`/`circle-check` a job's Start and
Success, `mail` a Mail entry, `octagon-x` Abort job, `file-text` a text
file, `file-json` a JSON file, `split` Filter rows, `merge` a lookup or
join that enriches rows, `calculator` Formula, `history` Dimension
lookup/update, `file-output` Text file output, `file-spreadsheet` a
Microsoft Excel writer workbook, `dollar-sign` a `${NAME}` reference, and
`table-2` a fact table.

Review Merge's `merge-append` and `merge-sorted` draw their rows inside
the boxes, colored by the input each row came from (blue the first,
amber the second), so the output shows the order the step produced.

`pentaho-ecosystem.svg.mjs` (Components) is the original hand-laid
diagram the style comes from; it carries its own copy of the parts and
renders by hand (any headless browser screenshot of the SVG at device
scale factor 2 to `../images/pentaho-ecosystem.png`).

| Diagram | Page |
| --- | --- |
| `pentaho-architecture` | Components: client tools and the Pentaho Server |
| `steps-and-hops`, `copy-rows`, `distribute-rows`, `parallelism`, `job-orchestration`, `job-entry-palette`, `step-palette`, `data-types` | Key Concepts: Transformation = Steps + Hops; Copy and Distribute; the step folders; Parallelism; Data Types; Jobs; the job entries |
| `error-hop-split` | Error Handling: valid rows on, failed rows down the error hop |
| `kinds-of-file-data`, `types-of-big-data` | Module 3 overview |
| `flat-file-formats` | Review Flat Files: the four kinds of flat file (structured, semi-structured, unstructured, metadata) and the formats the lesson names for each |
| `cruid-operations` | Review CRUID |
| `join-types`, `xml-join-orders`, `join-rows-cartesian`, `database-join-per-row` | Review Joins |
| `lookup-tables` | Review Lookups |
| `merge-append`, `merge-sorted` | Review Merge |
| `merge-diff-sync` | Merge Streams: Diff |
| `carte-cluster`, `run-configuration-targets`, `cluster-schema-static-dynamic`, `partitioning-by-key` | Review Scalability |
| `job-entries-hops` | Review Jobs: entries, hops and their evaluation modes |
| `job-order-of-execution` | Order of Execution |
| `metadata-injection-onboarding` | Onboarding to a Table |
| `sql-bind-parameters` | Parameters: SQL |
| `dimension-lookup-update` | Slowly Changing Dimensions: what Dimension lookup/update decides for each row, in update and lookup mode |
| `variables-and-parameters` | Review Parameters: where a `${NAME}` value comes from, and `${}` against `?` |
| `carte-lab-setup` | Run Configurations: the lab's three Carte servers, and where Master and Clustered send the transformation |
| `capstone-daily-sales-pipeline` | Daily Sales Pipeline: the capstone's job, and what its transformations do with the data |
| `capstone-data-model` | Daily Sales Pipeline: the input files, the staging tables, `dim_region` (Type 2) and `fact_sales` with each column's source, and the two output files |
