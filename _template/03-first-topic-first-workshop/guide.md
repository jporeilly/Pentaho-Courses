# First Workshop

<!--
  AUTHOR NOTES (delete before publishing).

  The STANDARD workshop shape used across the shipped courses:
  1. Warning callout = the workshop banner (what/why, "What you'll do"
     bullets, Prerequisites, Estimated Time).
  2. A Note callout introducing the task, with UI paths in **bold**.
  3. Headings follow the house standard: every action heading is
     `Step N: <action>` and every instruction inside is a numbered
     list item. Tab-part workshops label their tabs the same way;
     nested `::: tabs` handle OS variants.
  4. After each action that does something worth understanding, an
     "Under the hood" callout says what the engine did and why it
     matters (the teal panel; see Step 1).
  5. Prerequisites name an earlier workshop as a page link,
     [Its Title](../<its-folder>/guide.md), so the learner can open it.
  Keep the blocks you need, delete the rest — see "Second Workshop"
  for the minimal shape.
-->

> **Warning:**
>
> #### Workshop - First Workshop
>
> One or two sentences: what the learner builds in this lab and why it
> matters.
>
> **What you'll do**
>
> * First outcome-oriented bullet.
> * Second bullet.
> * Third bullet.
>
> One closing sentence describing the end state.
>
> **Prerequisites:** REPLACE — tools or data that must be ready; name an
> earlier workshop as a link, e.g. [Before You Start](../01-before-you-start/guide.md)
>
> **Estimated Time:** 25 minutes

<!-- The walkthrough video, when this lab has one, goes straight after the
     banner (Media > Video - with caption). Until it is recorded, the two
     placeholders below hold its place: the video's, and the interactive
     walkthrough's, which Media Studio's Export to course (Also the
     interactive player) replaces with the embedded player. Keep the ones
     this lab will have, delete the rest (COURSE-STANDARD 3.5). -->

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

<figure class="pcm-walkthrough">

<figcaption>Interactive walkthrough: coming soon</figcaption>

</figure>

---

> **Note:**
>
> #### First Workshop
>
> A one-line task summary. Word every action the phrasebook's way
> (docs/COURSE-STANDARD.md section 2.1): Select **OK**, press `F9`,
> **File > New > Transformation** as one bold span.

:::: tabs

### 1. First Part

> **Note:**
>
> #### First part
>
> Context the learner needs before acting.

1. Start Spoon with the **Start Pentaho Data Integration** button below, or from a terminal:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./spoon.sh
```

:::

<button data-launch="spoon" data-path="">Start Pentaho Data Integration</button>

2. Select **File > New > Transformation** (`Ctrl+N`).
3. Select **File > Save as** and save it as `REPLACE.ktr` in `C:\Workshop-REPLACE\NN-this-lab`.
4. On the **Design** tab, open the **Input** folder and drag **REPLACE step** onto the canvas.
5. Double-click **REPLACE step**. Set **Step name** to `REPLACE-name`, and select **OK**.
6. Select **REPLACE-name** on the canvas, press `F10` (**Action > Preview**), and select **Quick Launch**.

<div align="center">
<figure>
<img src="../_assets/images/example.png" alt="REPLACE: what the screenshot shows, for a reader who cannot see it" width="640">
<figcaption>REPLACE: one-line caption</figcaption>
</figure>
</div>

> **Success:** Checkpoint: REPLACE - exactly what the preview shows (row count, first row).

7. Select **Close**.

> **Under the hood:**
>
> #### REPLACE: what the engine just did
>
> After an action, two to four sentences on what actually happened and
> why it is powerful - the step that turns a click-list into
> understanding. Every pdi-2hr-lab workshop has these; read one first.
>
> **Why it matters:** REPLACE.

### 2. Second Part

> **Note:**
>
> #### Settings sweeps
>
> When the learner works through a list of settings, give each one as a
> numbered action: Select or Clear for a check box, Set for a value.

1. Select **Tools > Options**, and open the **General** tab.
2. Clear **REPLACE first setting**.
3. Select **REPLACE second setting**.
4. Set **REPLACE third setting** to `REPLACE`.
5. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/example.png" alt="REPLACE: what the dialog shows" width="375">
<figcaption>Center and width-constrain dialog screenshots</figcaption>
</figure>
</div>

<div class="pcm-embed-card" data-href="https://docs.pentaho.com" data-title="View external resource"></div>

::::

## Troubleshooting <!-- no-step -->

> **Note:** Collapsible blocks keep fixes handy without cluttering the
> happy path — the learner only opens the one they hit. Use
> <mark style="color:red;">highlighted text</mark> sparingly for
> must-not-miss warnings.

<details>

<summary>REPLACE: first common problem the learner might hit</summary>

The fix, with exact menu paths in **bold** and the command to run:

```bash
echo "the fix"
```

</details>

<details>

<summary>REPLACE: second common problem</summary>

The fix.

</details>

## Wrap Up <!-- no-step -->

> **Note:** Recap what the learner accomplished and point at the next
> lab. A <dfn>transformation</dfn>-style glossary term gets a hover
> definition from glossary.json.

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

[REPLACE-data.csv](./files/REPLACE-data.csv)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result. It reads its own copy of the data, so it runs as it stands.

[REPLACE_solution.ktr](./files/REPLACE_solution.ktr) <button data-launch="spoon" data-path="files/REPLACE_solution.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/REPLACE_solution.ktr">View graph</button>

