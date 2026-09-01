# Bring Your Own Data

> **Warning:**
>
> #### Workshop — Bring Your Own Data
>
> Everything so far ran on our sample retailer. This lab runs on
> **your** data: any CSV, tab-delimited, or JSON file you have to
> hand. The claim under test: *how quickly does PDI make sense of a
> file it has never seen?*
>
> **What you'll do**
>
> * Point a fresh pipeline at one of your own files.
> * Let **Get Fields** discover the structure.
> * Profile it: row counts, groupings, and a data-quality filter — in minutes.
>
> **Prerequisites:** [Build the Pipeline Yourself](../02-build-the-pipeline/guide.md). A data file of your own — an export from a spreadsheet, a system extract, a log. No customer PII if you're on a shared lab VM, please.
>
> **Estimated Time:** 15 minutes

> **Note:** **Getting your file onto a lab VM.** Use your cloud file
> share: open OneDrive, SharePoint, Google Drive, or Dropbox in the
> VM's browser (or paste a share link a colleague sends you) and
> download the file to `C:\Workshop\pdi-2hr\`. Nothing leaves the
> VM — the file is read locally and the VM is wiped after the
> session.
>
> No file with you? Grab any public dataset — or export a sheet from
> Excel with **File > Save as > CSV** and use that. The lab works
> with anything tabular.
>
> PDI can also read straight from cloud storage (S3, HTTP, and
> other VFS locations) in the same Input steps — worth knowing when
> you test this against your real systems after the session.

## Read your file

1. New transformation: `my_data.ktr`.
2. **Text file input** (or **JSON input** if that's what you have) —
   browse to your file.
3. On **Content**, set the separator to match (comma, tab `\t`,
   semicolon...). Tick **Header** if there is one.
4. **Fields > Get Fields**. Look at what came back: names, types,
   lengths — inferred from your data.
5. **Preview rows.** There's your file, as a typed stream.

Fix anything Get Fields guessed wrong — a date format here, a
numeric column read as string there. This grid *is* the schema
conversation you'd otherwise have in code.

## Profile it

Pick whichever of these fits your file — each is one step from the
palette:

* **Group by** (from *Statistics*) — group on a category column,
  aggregate count / sum / min / max of a numeric one. Instant
  breakdown.
* **Sort rows** then **Unique rows** — how many distinct values does
  that key column really have? Duplicates fall out of the second
  step's error hop.
* **Filter rows** — how many rows are missing the field your report
  depends on? Route them to a **Text file output** and you've built
  a data-quality report for your own system in one lab.

Preview after each step. That's the loop: *add a step, look at the
data, decide*.

## Reflect

* [ ] My file was readable in under five minutes.
* [ ] I found at least one thing I didn't know about my own data.

The second checkbox is the honest test of a data tool — most files
hide something (a stray delimiter, a duplicated key, a date in two
formats). What matters is how fast the tool let you *see* it.

## Troubleshooting

<details>

<summary>My file is Excel (.xlsx), not CSV</summary>

Use **Microsoft Excel input** from the Input category instead —
same pattern: pick the file, pick the sheet, Get Fields, preview.

</details>

<details>

<summary>Get Fields mangled the encoding (accented characters look wrong)</summary>

On the **Content** tab set **Encoding** to `UTF-8` (or your file's
actual encoding) and Get Fields again.

</details>

---

> **Tip:** If this lab worked on your file, it works on your
> systems: databases, APIs, queues, and cloud storage are the same
> pattern with a different Input step. The last page shows what
> running this for real looks like — and how to take it there.
