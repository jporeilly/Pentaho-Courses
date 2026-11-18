# Course diagrams

This course's diagrams are hand-laid SVG, in the style of the DI course's
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
`pencil-ruler` Schema Workbench, `chart-column` Analyzer, `cog` Mondrian,
`server` the Pentaho Server, `database` a database, `archive` the
repository, `monitor` your machine.
The later diagrams add: `key-round` a Mondrian role, `table-2` a fact
table, `globe` MARKETS or a region, `users` CUSTOMERS, `briefcase` a department, `car` PRODUCTS,
`calendar` TIME, `tag` ORDER STATUS, `sigma` a measure, `eye` and
`eye-off` what a role can and can't see.

Each script's header comment lists the facts it draws and the lesson
each comes from; keep it in step when a lesson's figures change.

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `lab-setup` | Before You Start: Schema Workbench, the Pentaho Server and the sample data |
| `mondrian3-schema` | Overview of Schemas: the Mondrian 3 schema's elements nested as the XML nests them, with SteelWheels' names and the lesson that uses each (replaces the mind map `schema_mondrian_3_schema.png`) |
| `data-pipeline` | Key Concepts, Data Pipeline: sources, PDI, data marts, Mondrian, the analysis tools |
| `cube-operations` | Key Concepts, Multidimensional: slice, dice, drill down, roll up and pivot on the SteelWheels cube's Sales, with SampleData's figures (replaces the stock `concepts_data_cube_operations.png`) |
| `normalized-v-star` | Key Concepts, Normalized v Star: Sales by Product Line and Territory on SampleData's order system (5 joins) and on the SteelWheels star (2 joins) (replaces the stock `concepts_normalized_v_star_schema.png`) |
| `steelwheels-star` | Key Concepts, Normalized v Star: the SteelWheels star schema with the columns its cube uses |
| `mondrian-request` | Key Concepts, ROLAP Mondrian: from a click in Analyzer to SQL and back, in four steps |
| `steelwheels-schema` | SteelWheels Schema: the cube's tables, keys and the Mondrian elements built on them |
| `basic-model-workflow` | Basic Model: the nine parts of defining a schema, one per tab; `-1` to `-9` light that tab's part (BA's workflow strip, `scripts/workflow-strip.mjs`; replaces `classic_workflow_to_define_a_schema.png`) |
| `two-connections` | Basic Model, tab 2: Schema Workbench's connection and the server's, joined by the name typed at publish |
| `role-mapping` | Mondrian Security: User Console user, platform role, lookup map, Mondrian role, what each sees |
| `localization-pieces` | FR Localization: tokens, bundles, localePropFile and the catalog's processor parameters, and where each lives |
| `aggregate-pick` | Aggregate Tables: which table a Territory, Country and State Province query reads, and why |
| `dimension-kinds` | Extended Model: private, degenerate and shared dimensions, and how each reaches ORDERFACT (the SME course's diagram of the same name, on Miniature Models) |
| `mdx-anatomy` | Overview of MDX Query: COLUMNS, ROWS, FROM and the WHERE slicer mapped onto the result grid, and the slicer in the SQL |
| `grant-nesting` | Overview of Data Security: SchemaGrant to MemberGrant nested on the Regional Manager Role, topLevel and bottomLevel on the Analyst Role, the two grant rules (replaces the Adventure Works `security.png` and `security_top_and_bottom.png`) |
| `rollup-policies` | Mondrian Security, Rollup Policies: the NJ, NY and PA grant under full, partial and hidden, with the leaked 2,625,083.61 |
| `capstone-budget` | Capstone, Budget v Actual: the target design, with the settings the hints leave to the learner left out |
