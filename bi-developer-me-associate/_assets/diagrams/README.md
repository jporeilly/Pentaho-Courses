# Course diagrams

The Metadata Editor course's diagrams are hand-laid SVG, in the style of the DI course's
Pentaho ecosystem picture (owner, 2026-11-12: "boxes the same size";
"prettier with icons"). Mermaid sizes every box to its own text, so it
cannot keep a diagram's boxes equal.

* The parts come from the shared kit every course uses,
  [`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs)
  (moved there from this folder on 2026-11-12): panels with a colored
  title strip, same-size boxes with a Lucide icon in a white disc, a
  full-width bar for a supporting service, and curved arrows with their
  labels in white pills. Icons come from the app's own `lucide-react`
  package, so they match the icons in the guide.
* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  node lab-setup.svg.mjs
  ```

Color by role, as in the DI diagrams: blue a tool you work in, amber the
browser, violet the Pentaho Server and its engine, green a store, slate
a supporting service. Keep one icon per thing across diagrams:
`table-properties` Metadata Editor, `table` Interactive Reports, `cog` the metadata engine, `container` the MySQL lab kit,
`table-2` a physical table, `briefcase` a business model or table, `folder` a category, `folder-tree` a business view,
`server` the Pentaho Server, `database` a database, `archive` the
repository, `monitor` your machine, `tag` a concept (`tags` the concept
tree), `columns-3` a column, `link` a relationship, `merge` a join,
`sigma` an aggregation, `square-function` a formula, `filter` a row
filter, `code` SQL, `user-round` a user (`user-x` one with no access),
`eye-off` a hidden column. Teal is a model, a concept or a join; white
the SQL or the result a reader ends with; red a user who gets nothing.

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `lab-setup` | Before You Start: Metadata Editor, the Pentaho Server, the sample data and the MySQL lab kit |
| `domain-layers` | Domains and Models: the Physical Layer, the Abstract Business Layer and the Business View |
| `domain-build-stages` | OrdersME: the six stages of building a domain, one tab each |
| `security-layers` | Overview of Security & Data Access: model, column and row security, where each is set and how the server enforces it |
| `relationship-joins` | OrderStarCustomer (07), "3. Relationships": the join each relationship type becomes, and what an inner join drops, on a made-up three-row example |
| `mql-to-sql` | Query Builder (05), "2. Build and Run a Query": what the engine writes for a relationship, a default aggregation, a calculated column and a Data Constraint |
| `concept-chain` | Concept Editor (09), "1. Define Concepts": the five concepts below Base, what each adds, and the order in which a column takes a property |
| `capstone-trailhead` | Capstone (12), "Suggested shape": the Trailhead Sales star, its two-column Stores join and calculated columns, and what each test user sees |
