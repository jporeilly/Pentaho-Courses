# Course diagrams

The Report Designer course's diagrams are hand-laid SVG, in the style of the DI course's
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
`file-chart-column` Report Designer, `app-window` the User Console, `cog` the reporting engine,
`table-2` a physical table, `briefcase` a business model or table, `folder` a category, `folder-tree` a business view,
`server` the Pentaho Server, `database` a database, `archive` the
repository, `monitor` your machine.

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `lab-setup` | Before You Start: Report Designer, the Pentaho Server and the sample data |
