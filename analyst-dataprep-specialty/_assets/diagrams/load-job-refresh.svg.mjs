// The Sales Mart's load job as lesson 10 finishes it: jb_load_sales_mart
// with the HTTP entry refresh-mondrian-cache between tr_agg_sales and
// Success, and its own failure hop to Abort job, so every run ends with
// the Mondrian cache flushed. It sits in part 7, "Flush the Cache from
// the Job", of 10-refresh-the-cube-after-a-load/guide.md, as a new
// figure; lesson 09's figure (load-job) shows the job before this step.
//
// The facts, and the lessons they come from, are listed in the header of
// load-job-layout.mjs, which draws both forms of the job: here also
// lesson 10, part 7 (the hop from tr_agg_sales to Success deleted; the
// HTTP entry named refresh-mondrian-cache calling
// /pentaho/api/system/refresh/mondrianSchemaCache; hops from it to
// Success and, on False, to Abort job).
//
// Run from this folder:   node load-job-refresh.svg.mjs
// It writes load-job-refresh.svg here and ../images/load-job-refresh.png
// at twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';
import { drawLoadJob, loadJobSize } from './load-job-layout.mjs';

// Lesson 10's form: the HTTP entry is there, with its badge.
const d = new Diagram(...loadJobSize(true));
drawLoadJob(d, { refresh: true });

d.write(import.meta.url);
