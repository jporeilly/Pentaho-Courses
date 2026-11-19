# First Workshop

<!--
  AUTHOR NOTES (delete before publishing).

  The TOOL-INTEGRATION workshop shape: the learner opens files from the
  guide in the real tool, inspects them in the built-in graph viewer,
  and the app verifies their work automatically. Copy this one for labs
  built around .ktr / .kjb files (drop them in this lab's files/).
-->

> **Warning:**
>
> #### Workshop - First Workshop
>
> One or two sentences on what this lab builds. This lab ships its own
> files in the `files/` folder next to the guide.
>
> **What you'll do**
>
> * Open a lab file in the real tool from the guide.
> * Inspect the same file in the built-in graph viewer.
> * Run it and let the app verify the output.
>
> **Prerequisites:** REPLACE — tool installed, sample data in place
>
> **Estimated Time:** 25 minutes

---

> **Note:**
>
> #### **Working with lab files**
>
> The `data-launch` button opens a lab file in the configured external
> tool (the launcher name must exist in course.json's `launchers`
> map); `data-graph` renders it as a flowchart in the bottom panel —
> no tool required.

:::: tabs

### 1. Open the transformation

<button data-launch="spoon" data-path="files/example.ktr">Open in Pentaho Data Integration</button>
<button data-graph="files/example.ktr">View graph</button>

In the graph viewer, click any step to inspect its properties, or use
**Summary** / **Walkthrough** to have the AI assistant explain the
whole <dfn>transformation</dfn>.

### 2. Make the change

REPLACE: the actual task — what the learner modifies, runs, or builds
in the tool.

### 3. Run and verify

Tell the learner how to run their work, then point them at the
**Verify your work** section below.

> **Under the hood:**
>
> #### REPLACE: what the engine just did, as a sentence
>
> Two to four sentences on what actually happened when the learner ran
> the transformation, and only what is true of Pentaho Data Integration 11.
>
> **Why it matters:** REPLACE - the effort saved or the class of bug
> avoided.

REPLACE: one sentence on what the learner has now built.

> **Tip:** Close with what was accomplished and a pointer to the next
> lab or section.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

[example.ktr](./files/example.ktr) <button data-launch="spoon" data-path="files/example.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/example.ktr">View graph</button>

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result. It reads its own copy of the data, so it runs as it stands.

[REPLACE_solution.ktr](./files/REPLACE_solution.ktr) <button data-launch="spoon" data-path="files/REPLACE_solution.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/REPLACE_solution.ktr">View graph</button>

## Verify your work

<!--
  Completion checks are declared in this lab's manifest.json (not in
  markdown) and render here as one-click checks. Example:

    "checks": [
      { "id": "out-csv", "kind": "file-exists",
        "label": "Output CSV created", "path": "C:\Workshop\out\sales.csv" },
      { "id": "rows", "kind": "row-count",
        "label": "At least 100 rows", "path": "C:\Workshop\out\sales.csv", "min": 100 }
    ]

  Kinds: file-exists, file-contains, row-count, dir-not-empty — see
  docs/MANIFEST-SCHEMA.md. Delete this section if the lab has no checks.
-->
