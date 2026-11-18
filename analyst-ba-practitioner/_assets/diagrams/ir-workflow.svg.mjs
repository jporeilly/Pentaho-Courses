// The Interactive Report workflow: the six parts of building the Sales
// Territory Report, in order. It replaces the old curved-arrow picture
// (ir_sales_territory_workflow_interactive_report.png) in
// 06-interactive-reports-sales-territory/guide.md, tab "2. Sales Territory
// Report", and a copy with one part lit up opens each of that tab's six
// inner tabs, so the learner can see where they are (owner, 2026-11-18:
// "indicate where in the workflow the step is").
//
// The six parts are the six inner tabs of lesson 06's "2. Sales Territory
// Report", with the same names:
//   1. Data Source & Templates   select the Orders data source and a template
//   2. Adding Data               add the data columns to the report canvas
//   3. Grouping & Sorting        group by Territory and Country, sort
//   4. Filters & Prompts         filter the report, turn a filter into a prompt
//   5. Totals                    subtotals, a grand total, the Tax field
//   6. Format & Save             format the report and save it to the repository
//
// Colors: blue, the tool you use (Interactive Reports, in the User
// Console); in a step's copy the other parts are stone (not this tab).
// Icons: database the data source, columns-3 the columns, arrow-down-
// wide-narrow sorting, filter the filters, sigma the totals, save saving.
//
// Run from this folder:   node ir-workflow.svg.mjs
// It writes ir-workflow.svg and ir-workflow-1.svg to ir-workflow-6.svg
// here, and the matching PNGs in ../images at twice the size. The drawing
// is workflow-strip.mjs, shared with az-workflow and dd-workflow.
import { writeWorkflow } from './workflow-strip.mjs';

const STEPS = [
  { icon: 'database', title: ['Data source', 'and template'] },
  { icon: 'columns-3', title: ['Add the', 'data columns'] },
  { icon: 'arrow-down-wide-narrow', title: ['Group', 'and sort'] },
  { icon: 'filter', title: ['Filters', 'and prompts'] },
  { icon: 'sigma', title: ['Totals'] },
  { icon: 'save', title: ['Format', 'and save'] },
];

writeWorkflow('ir-workflow', STEPS, import.meta.url);
