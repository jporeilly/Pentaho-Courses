// The workflow to define a schema: the nine parts of building the Classic
// Models schema in lesson 05 (Basic Model), in order. It replaces the old
// curved-arrow picture (classic_workflow_to_define_a_schema.png) above the
// lesson's tabs, and a copy with one part lit opens each of the nine tabs,
// as BA's Interactive Reports workflow does (owner, 2026-11-18: "make it
// similar to the one used in BA Analyst course for Interactive Reports").
//
// The nine parts are the lesson's nine tabs, with the same names:
//   1. JDBC Connection         Schema Workbench's connection to SampleData
//   2. Server Connection       the Pentaho Server's hsqldb_sampledata
//   3. Schema & Cube           a new schema and its cube
//   4. Fact Table              ORDERFACT under the cube
//   5. CUSTOMERS Dimension     dimension, hierarchy and levels
//   6. PRODUCTS Dimension      dimension, hierarchy and levels
//   7. Measures                the cube's measures
//   8. Publish                 publish the schema to the server
//   9. Test in Analyzer        open the cube in an Analyzer report
//
// Colors: blue, the tool you use; in a tab's copy the other parts are stone.
// Icons follow the course's diagrams README: plug a connection, server the
// Pentaho Server, box a cube, table-2 a fact table, users CUSTOMERS, car
// PRODUCTS, sigma a measure, upload publishing, chart-column Analyzer.
//
// Run from this folder:   node basic-model-workflow.svg.mjs
// It writes basic-model-workflow.svg and -1 to -9 here, with the PNGs in
// ../images. Nine cards wrap after five, so the strip stays readable at the
// reading column's 800px. The drawing is scripts/workflow-strip.mjs.
import { writeWorkflow } from '../../../../scripts/workflow-strip.mjs';

const STEPS = [
  { icon: 'plug', title: ['JDBC', 'connection'] },
  { icon: 'server', title: ['Server', 'connection'] },
  { icon: 'box', title: ['Schema', 'and cube'] },
  { icon: 'table-2', title: ['Fact', 'table'] },
  { icon: 'users', title: ['CUSTOMERS', 'dimension'] },
  { icon: 'car', title: ['PRODUCTS', 'dimension'] },
  { icon: 'sigma', title: ['Measures'] },
  { icon: 'upload', title: ['Publish'] },
  { icon: 'chart-column', title: ['Test in', 'Analyzer'] },
];

writeWorkflow('basic-model-workflow', STEPS, import.meta.url, { perRow: 5 });
