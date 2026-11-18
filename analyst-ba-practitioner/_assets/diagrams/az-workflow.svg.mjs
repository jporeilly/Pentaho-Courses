// The Analyzer workflow: the four parts of building the Sales Analysis in
// 10-analyzer-reports-sales-analysis/guide.md, tab "2. Sales Analysis",
// one per inner tab and with the same names:
//   1. Data Source                     SteelWheelsSales; Territory, Line, Years, Quarters, Sales
//   2. Filter & Conditional Formatting EMEA, 2003, QTR2, a Top 5; a color scale
//   3. Calculations & Drill-Through    subtotals, grand totals, % of Sales, a calculated measure, drill-through
//   4. Formatting                      display names, number format; save; switch to a chart and back
// The whole strip sits at the top of that tab; a copy with one part lit
// opens each inner tab (as ir-workflow does in lesson 06). Lesson 11
// (EMEA Quantity) uses the same strips over its eight tabs, two per part.
//
// Colors: blue, the tool you use (Analyzer, in the User Console); in a
// tab's copy the other parts are stone. Icons: database the data source,
// filter the filters, calculator the calculations, save formatting and
// saving.
//
// Run from this folder:   node az-workflow.svg.mjs
// It writes az-workflow.svg and az-workflow-1.svg to az-workflow-4.svg,
// and the PNGs in ../images. The drawing is workflow-strip.mjs.
import { writeWorkflow } from './workflow-strip.mjs';

const STEPS = [
  { icon: 'database', title: ['Data source', 'and fields'] },
  { icon: 'filter', title: ['Filters and', 'formatting'] },
  { icon: 'calculator', title: ['Calculations,', 'drill-through'] },
  { icon: 'save', title: ['Format', 'and save'] },
];

writeWorkflow('az-workflow', STEPS, import.meta.url);
