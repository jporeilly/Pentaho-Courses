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
The later diagrams add: `files` a page or a sub-report, `layers` a
group, `rows-3` a Details row, `list` a key, `ruler` the pagination
pass, `printer` the print pass, `file-output` an output, `sigma` a
total, `calendar-clock` a schedule, `file-text` a page or a PDF, `send`
the mail sender, `inbox` and `mail` Mailpit and an email, `code` a
query, `list-filter` a prompt, `radar` the radar chart,
`arrow-down-wide-narrow` sorted rows and `shuffle` unsorted ones.

The diagrams that draw a printed report share
[`strips.mjs`](strips.mjs): one band as it prints, as a thin strip,
colored by when it prints: slate a page band, blue a report band, teal
a group band (the Details Header included), white a Details row, stone
pages or groups left out, red a group that should not be there. It sits
on the shared kit and draws nothing by itself.

Each script's header comment lists the facts it draws and the lesson
each comes from; keep it in step when a lesson's figures change.

The PNG is twice the SVG's size, so a figure's `width` is the SVG's
width, capped at 800 (the reading column). Edit the `.svg.mjs`, run it,
and commit the script, the `.svg` and the `.png` together.

| Diagram | Page |
| --- | --- |
| `lab-setup` | Before You Start: Report Designer, the Pentaho Server and the sample data |
| `report-bands` | Navigating Report Designer (03), "4. Report bands": when each band prints, on the first page and the last |
| `group-by-sorted-rows` | Adding Data Elements and Report Groups (07), "4. Group by product line": the same rows sorted and unsorted, and the groups each prints |
| `two-pass-engine` | Totals (11), "1. Two Sum functions": the pagination and print passes, the output processors, and where Sum and ItemSumFunction are right |
| `parameter-flow` | Report Parameters (18), "4. A second prompt": each prompt's own query, the `${ }` references and their `?` bind markers, and a cascading prompt (dashed) |
| `subreport-runs` | Charts & Sub Reports (21), "3. A sub-report": how often a sub-report runs in each band, and where banded and inline sub-reports print |
| `report-burst` | Report Bursting (39), "4. Run and Check": one report, three schedules with their `TERRITORY` and `_SCH_EMAIL_TO`, the mail sender and Mailpit |
