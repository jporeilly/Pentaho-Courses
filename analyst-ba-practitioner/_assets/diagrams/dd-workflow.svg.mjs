// The Dashboard Designer workflow: the four parts of building the Training
// Demo Dashboard in 13-dashboard-designer-vendor-sales/guide.md. That
// lesson has ten tabs; each part covers some of them:
//   1. Template and layout      tabs 1-2   2 over 1, Ruby, title; resize the panels
//   2. Add the content          tabs 3-5   European Sales, Vendor Sales Report, Inventory List
//   3. Prompts and parameters   tabs 6-9   the prompt toolbar, Territory and Product
//                                          Line prompts, each the Source of a report parameter
//   4. Save the dashboard       tab 10     Public > Training
// The whole strip sits above the tabs; a copy with one part lit opens
// each tab (as ir-workflow does in lesson 06).
//
// Colors: blue, the tool you use (Dashboard Designer, in the User
// Console); in a tab's copy the other parts are stone. Icons:
// layout-template the template, panels-top-left the panels' content,
// mouse-pointer-click the prompts, save saving.
//
// Run from this folder:   node dd-workflow.svg.mjs
// It writes dd-workflow.svg and dd-workflow-1.svg to dd-workflow-4.svg,
// and the PNGs in ../images. The drawing is workflow-strip.mjs.
import { writeWorkflow } from './workflow-strip.mjs';

const STEPS = [
  { icon: 'layout-template', title: ['Template', 'and layout'] },
  { icon: 'panels-top-left', title: ['Add the', 'content'] },
  { icon: 'mouse-pointer-click', title: ['Prompts and', 'parameters'] },
  { icon: 'save', title: ['Save the', 'dashboard'] },
];

writeWorkflow('dd-workflow', STEPS, import.meta.url);
