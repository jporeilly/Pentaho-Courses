# One Pipeline, Many Files

> **Warning:**
>
> #### Workshop — One Pipeline, Many Files
>
> Your regions all send daily sales — but the north sends
> comma-separated CSV, the south pipe-delimited text, and the EU
> partner semicolons. The usual answer is one pipeline per feed,
> maintained forever. PDI's answer is **metadata injection**: one
> *template* pipeline whose configuration is filled in at runtime
> from a control file.
>
> **What you'll do**
>
> * Build a template transformation with a deliberately unconfigured reader.
> * Build an injection transformation that fills the template in at runtime.
> * Drive it from a small job — one run per control-file row.
> * Ingest three differently-shaped files through one pipeline — then add a fourth by editing a CSV, not a pipeline.
>
> **Prerequisites:** [Build the Pipeline Yourself](../02-build-the-pipeline/guide.md).
>
> **Estimated Time:** 20 minutes

> **Note:** **Get the files first.** Download the three feed files
> and `control.csv` from **Lab Files** below into
> this module's workshop folder:
> `C:\Workshop\pdi-2hr\04-see-it-scale\05-one-pipeline-many-files\`. Open
> `control.csv` — one row per feed: the file's full path and its
> separator. That file *is* the configuration; the pipelines you
> build next never change again.

> **Note:** **The shape of the solution.** One injection run
> configures the template once — so to process many differently-
> configured feeds, a small **job** runs the injection once per
> control row. Three pieces: the *template* (the reusable pipeline),
> the *injector* (fills the template in and runs it), and the
> *driver job* (loops the injector over control.csv). This is also
> your first look at a job — the orchestration layer Lab 7 talks
> about.

:::: tabs

### 1. The template

1. New transformation, saved as
   `C:\Workshop\pdi-2hr\04-see-it-scale\05-one-pipeline-many-files\mi_template.ktr`.
2. Drag on a **Text file input**. Name it `Read feed`. On
   **Fields**, add three **String** fields by hand: `col_store`,
   `col_date`, `col_amount` (the feeds all share this column
   *order*, whatever the columns are called). On **Content**, make
   sure **Header** is ticked. Configure **no file** — that's
   injected at runtime.
3. Drag on a **Select values** step, hopped from `Read feed`. Name
   it `Standardise`. On **Select & Alter**, rename
   `col_store → store`, `col_date → sale_date`,
   `col_amount → amount`.
4. Drag on a **Text file output**, hopped from `Standardise`.
   Filename `C:\Workshop\pdi-2hr\out\all_feeds`, extension `csv`.
   On **Content**: tick **Append**, untick **Header**. On
   **Fields**: add `store`, `sale_date`, `amount`.
5. Save. This transformation can't run on its own — that's the
   point.

### 2. The injector

1. New transformation, saved as `mi_inject.ktr` in the same folder.
2. Drag on **Get rows from result** (from *Job*). Name it
   `File config`. Add its two fields: `filename` and `separator`,
   both String. When the driver job executes this transformation
   once per control row, *this step is where that row arrives*.
3. From **Flow**, drag on **ETL metadata injection**, hopped from
   `File config`. Double-click it and browse to `mi_template.ktr` —
   the dialog shows every injectable property of every template
   step, as a tree.
4. Wire two injections on the `Read feed` step: **FILENAME** ←
   `File config` / `filename` (it's under the file *list*, so it
   accepts one entry per row), and **SEPARATOR** ← `File config` /
   `separator`. Leave everything else alone.
5. Save.

### 3. The driver job

1. **File > New > Job**, saved as `mi_driver.kjb` in the same
   folder.
2. Drag on **START**, then two **Transformation** entries, then
   **Success**; hop them into a line.
3. First transformation entry → `read_control.ktr`: build that as a
   30-second transformation — **Text file input** reading
   `control.csv` (fields `filename`, `separator`) hopped to **Copy
   rows to result** (from *Job*).
4. Second transformation entry → `mi_inject.ktr`. On its
   **Advanced** tab tick **Execute for every input row** — each
   control row becomes one execution, delivered to the injector's
   `Get rows from result` step.

### 4. Run and extend

1. Delete `C:\Workshop\pdi-2hr\out\all_feeds.csv` if it exists (we
   append).
2. Run the **job**. Watch the log: the injector executes three
   times, once per control row.
3. Open `all_feeds.csv`: **18 rows** — north, south, and EU feeds,
   three shapes, one standard output.

Now the punchline:

4. Copy `stores_north.csv` to `stores_scotland.csv`, change the
   store names, and **add one line to `control.csv`** with its path
   and separator.
5. Run the job again. Four feeds. You did not open a pipeline.

> **Under the hood:**
>
> #### The template was rewritten in memory, once per feed
>
> **ETL metadata injection** loaded `mi_template.ktr` as a
> definition rather than as something to run, set the properties you
> mapped — the filename, the separator — on the template's steps,
> and executed that filled-in copy. The file on disk never changed;
> each run got its own configured instance.
>
> That works because a step's configuration is *data* in the `.ktr`
> XML, addressable by name. Anything the dialog can set, injection
> can set: not just filenames and separators but whole field lists,
> so one template can absorb feeds whose column layouts differ, not
> merely their delimiters.
>
> The driver job supplies the loop. **Execute for every input row**
> runs the injector once per control row, and *Get rows from result*
> is where that row lands — which is why adding a feed is adding
> data, not code.
>
> **Why it matters:** this is the difference between a tool and a
> platform. Your pipeline count stops tracking your feed count —
> 4 feeds or 400, it stays one template — and the control file is
> something an operations team can own without ever opening Spoon.

* [ ] `all_feeds.csv` contains rows from all three (then four) feeds.
* [ ] The new feed required editing only `control.csv`.

::::

## Troubleshooting

<details>

<summary>The injection dialog shows no injectable properties</summary>

You've browsed to the wrong file, or saved the template after the
dialog opened — reopen the ETL metadata injection dialog so it
re-reads the template.

</details>

<details>

<summary>The job runs but all_feeds.csv has rows from only one feed</summary>

The second transformation entry isn't iterating — check **Execute
for every input row** is ticked on its Advanced tab, and that
`read_control.ktr` ends in **Copy rows to result**.

</details>

<details>

<summary>The EU feed's rows look wrong / arrive as one column</summary>

Its control row must carry `;` as the separator — check the
`separator` column parsed correctly (the comma row needs quoting:
`","`).

</details>

---

> **Tip:** Metadata injection is the difference between "an ETL tool"
> and "an ETL platform": pipelines as *data*, driven by a control
> table your operations team can edit. Teams use this exact pattern
> to onboard hundreds of feeds with one template. Next lab: your
> data goes through it.

## Lab Files

[control.csv](./files/control.csv)

[stores_north.csv](./files/stores_north.csv)

[stores_south.txt](./files/stores_south.txt)

[partners_eu.csv](./files/partners_eu.csv)

### Solution

Complete, working versions of all four pieces — download them into
`C:\Workshop\pdi-2hr\04-see-it-scale\05-one-pipeline-many-files\`
together (they reference each other by
folder) and run the job. Compare with your own build.

[solution_mi_driver.kjb](./files/solution_mi_driver.kjb) <button data-launch="spoon" data-path="files/solution_mi_driver.kjb">Open in Pentaho Data Integration</button> <button data-graph="files/solution_mi_driver.kjb">View graph</button>

[solution_mi_inject.ktr](./files/solution_mi_inject.ktr) <button data-launch="spoon" data-path="files/solution_mi_inject.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_mi_inject.ktr">View graph</button>

[solution_mi_template.ktr](./files/solution_mi_template.ktr) <button data-launch="spoon" data-path="files/solution_mi_template.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_mi_template.ktr">View graph</button>

[solution_read_control.ktr](./files/solution_read_control.ktr) <button data-launch="spoon" data-path="files/solution_read_control.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_read_control.ktr">View graph</button>
