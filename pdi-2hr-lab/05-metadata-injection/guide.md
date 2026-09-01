# One Pipeline, Many Files

> **Warning:**
>
> #### Workshop — One Pipeline, Many Files
>
> Your regions all send daily sales — but the north sends
> comma-separated CSV, the south pipe-delimited text, and the EU
> partner semicolons with different column names. The usual answer is
> one pipeline per feed, maintained forever. PDI's answer is
> **metadata injection**: one *template* pipeline whose configuration
> is filled in at runtime from a control file.
>
> **What you'll do**
>
> * Build a template transformation with a deliberately unconfigured reader.
> * Build a driver transformation that reads a control file and injects the metadata.
> * Ingest three differently-shaped files through one pipeline — then add a fourth by editing a CSV, not a pipeline.
>
> **Prerequisites:** [Build the Pipeline Yourself](../02-build-the-pipeline/guide.md).
>
> **Estimated Time:** 20 minutes

> **Note:** **Get the files first.** Download all four files from
> **Lab Files** below into `C:\Workshop\pdi-2hr\feeds\` (create the
> folder). Open `control.csv` and look at it — one row per feed:
> filename, separator, and which source column maps to `store`,
> `date`, and `amount`.

:::: tabs

### 1. The template

1. New transformation, saved as
   `C:\Workshop\pdi-2hr\feeds\mi_template.ktr`.
2. Drag on a **Text file input**. Name it `Read feed`. Configure
   **nothing else** — no file, no separator, no fields. It's a shell.
3. Drag on a **Select values** step, hopped from `Read feed`. Name it
   `Standardise`. Leave it empty too — the driver will inject the
   rename mapping so every feed comes out as `store`, `sale_date`,
   `amount`.
4. Drag on a **Text file output**, hopped from `Standardise`.
   Filename `C:\Workshop\pdi-2hr\out\all_feeds`, extension `csv`,
   and on **Content** tick **Append**. On **Fields**, add the three
   standard names by hand: `store`, `sale_date`, `amount`.
5. Save. This transformation can't run on its own — that's the
   point.

### 2. The driver

1. New transformation, saved as `mi_driver.ktr` in the same folder.
2. **Text file input** named `Read control`, pointed at
   `C:\Workshop\pdi-2hr\feeds\control.csv`, separator `,`, header
   ticked, **Get Fields**.
3. From **Flow**, drag on **ETL metadata injection**, hopped from
   `Read control`.
4. Double-click it. Browse to `mi_template.ktr`. The dialog shows
   every injectable property of every step in the template, as a
   tree.
5. Wire the injections — set the *source field* for each:

| Template step | Property | Source field |
| --- | --- | --- |
| Read feed | FILENAME (file tab) | filename |
| Read feed | SEPARATOR | separator |
| Read feed | FIELD_NAME (fields) | field_store, field_date, field_amount |
| Standardise | FIELD_RENAME → store, sale_date, amount | field_store, field_date, field_amount |

> **Note:** The exact tree labels vary slightly by PDI version —
> the pattern is constant: pick a template property, point it at a
> column of the control stream. Set the filename to inject as
> `C:\Workshop\pdi-2hr\feeds\` + filename using a prior Calculator
> step if you want full paths, or keep the control file's paths
> absolute.

6. In the same dialog, set **Run resulting transformation** so each
   control row executes the filled-in template.

### 3. Run and extend

1. Delete `C:\Workshop\pdi-2hr\out\all_feeds.csv` if it exists (we
   append).
2. Run `mi_driver.ktr`.
3. Open `all_feeds.csv`: **18 rows** — north, south, and EU feeds,
   three shapes, one standard output.

Now the punchline:

4. Copy `stores_north.csv` to `stores_scotland.csv`, change the store
   names, and **add one line to `control.csv`** describing it.
5. Run the driver again. Four feeds. You did not open a pipeline.

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

<summary>Output has header rows repeated mid-file</summary>

In the template's Text file output, on the **Content** tab, untick
**Header** (or leave header on and accept one header per feed —
cosmetic either way for this lab).

</details>

---

> **Tip:** Metadata injection is the difference between "an ETL tool"
> and "an ETL platform": pipelines as *data*, driven by tables your
> operations team can edit. Teams use it to onboard hundreds of feeds
> with one template. Next lab: your data goes through it.

## Lab Files

[control.csv](./files/control.csv)

[stores_north.csv](./files/stores_north.csv)

[stores_south.txt](./files/stores_south.txt)

[partners_eu.csv](./files/partners_eu.csv)
