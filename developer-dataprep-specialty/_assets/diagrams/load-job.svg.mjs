// The Sales Mart's load job as lesson 09 builds it: jb_load_sales_mart,
// Start, the four transformations in star order (dimensions, facts,
// summaries), Success, and a failure hop from every transformation to
// Abort job. It replaces the ASCII sketch under "What you build" in
// 09-schedule-the-load-on-the-pentaho-server/guide.md, and it is what
// that lesson's part 3 checkpoint asks the canvas to match. Lesson 10's
// HTTP entry is left out here on purpose: the learner adds it in lesson
// 10, whose own figure (load-job-refresh) shows it.
//
// The facts, and the lessons they come from, are listed in the header of
// load-job-layout.mjs, which draws both forms of the job: here, lesson
// 09 parts 3, 5 and 7 (the entries, the hops, the parameters, the
// schedule) and lessons 05, 07 and 08 (which file or table each
// transformation reads or rebuilds).
//
// Run from this folder:   node load-job.svg.mjs
// It writes load-job.svg here and ../images/load-job.png at twice the
// size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { drawLoadJob, loadJobSize } from './load-job-layout.mjs';

// Lesson 09's form: no HTTP entry.
const d = new Diagram(...loadJobSize(false));
drawLoadJob(d, { refresh: false });

d.write(import.meta.url);
