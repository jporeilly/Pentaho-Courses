# Formula

> **Warning:**
>
> #### Workshop - Formula
> 
> The **Formula** step creates or replaces fields with spreadsheet-style expressions: arithmetic, text, dates and conditions.\
> In this workshop you generate a test row and build two formulas, a sum and a conditional.
> 
> **What you'll do**
> 
> * Generate a test row with **Generate rows**
> * Write a simple calculation in **Formula**, referring to fields as `[field]`
> * Add a condition with `IF`, and see why it needs all three arguments
> 
> **Prerequisites:** [Review Scripting](../topic-mod4-scripting-review/guide.md)
> 
> **Estimated time:** 20 minutes

<figure>

![The finished transformation: Generate Rows into Formula [a]+[b], and Generate Rows 2 into IF Formula b-a](../_assets/images/formula.png)

<div align="center">
<figcaption><em>What you build: two small flows</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_formula.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\04-scripting\27-mod4-formula`.

:::: tabs

### 1. Generate rows

> **Note:**
>
> #### Generate rows
> 
> **Generate rows** outputs a set number of rows, each with the same fixed values. It is mostly for tests, or for one row that starts a flow, such as a row of parameters for a query.

1. Start Spoon.

::: tabs

### Windows (PowerShell)

> 
> ```powershell
> Set-Location C:\Pentaho\design-tools\data-integration
> .\spoon.bat
> ```
> 
>

### macOS / Linux

> 
> ```bash
> cd ~/Pentaho/design-tools/data-integration
> ./spoon.sh
> ```
> 
>

:::

<button data-launch="spoon" data-path="">Start PDI</button>

2. From the **Input** folder, drag **Generate rows** onto the canvas and name it `Generate Rows`.
3. Double-click it. Set **Limit** to `1` and add two fields, `a` (Integer, **Value** `1`) and `b` (Integer, **Value** `2`).

<figure><img src="../_assets/images/gr-formula1.png" alt="Generate rows with limit 1 and the fields a = 1 and b = 2"><figcaption><p>One row: a = 1, b = 2</p></figcaption></figure>

### 2. Formula

> **Note:**
>
> #### Formula
> 
> Each row of the **Formula** step's grid creates a **New field** from a **Formula**. Fields of the row are written in square brackets, `[a]`, and functions take their arguments separated by semicolons: `IF(condition; then; else)`.

**Workflow 1: a sum**

1. From the **Scripting** folder, drag **Formula** onto the canvas, name it `Formula [a]+[b]`, and hop **Generate Rows** to it.
2. Add **New field** `result`, **Formula** `[a]+[b]`, **Value type** Number.

<figure><img src="../_assets/images/formula-1.png" alt="Formula step: result = [a]+[b], Number"><figcaption><p>result = [a]+[b]</p></figcaption></figure>

3. Save, run and preview **Formula [a]+[b]**.

> **Success:** Checkpoint: one row, `a` 1, `b` 2, `result` 3.0.

**Workflow 2: a condition**

1. Add a second **Generate rows**, `Generate Rows 2`, with `a` and `b` as before and a third field, `booking_type` (String, **Value** `R`).
2. Add a second **Formula**, `IF Formula b-a`, hopped from **Generate Rows 2**: **New field** `result`, **Formula** `IF([booking_type]="R";[b]-[a])`, **Value type** Number.

<figure><img src="../_assets/images/formula-2.png" alt="Formula step: result = IF([booking_type]=&quot;R&quot;;[b]-[a]), Number"><figcaption><p>A conditional formula</p></figcaption></figure>

3. Save, run and preview **IF Formula b-a**.

> **Success:** Checkpoint: `result` is 1.0, `b` minus `a`, because `booking_type` is `R`.

> **Warning:** **Give IF all three arguments.** This formula has no *else*. Set `booking_type` to `X` and run it: `IF` returns FALSE, a Boolean, and the step stops with "Please specify a Boolean type for field [result]". Write the value for other rows as the third argument, for example `IF([booking_type]="R";[b]-[a];0)`.

> **Under the hood:**
>
> #### Same formula engine as Pentaho Reporting, parsed once per run
>
> The **Formula** step doesn't interpret your text row by row. On the
> first row it hands each expression to LibFormula, the OpenFormula
> engine that also powers Pentaho Report Designer, which parses it into
> an expression tree once. Per row the engine binds `[a]`, `[b]` and
> `[booking_type]` to the current row's values by name, walks the tree,
> and writes the result into the output field with the type you set.
>
> Because the parse happens once, on the first row, a typo in a formula
> fails the step on row 1, not on row 40,000. And because it is
> OpenFormula, the functions (`IF`, `AND`, `OR`, `CONCATENATE`,
> `TODAY` and many more) are the spreadsheet vocabulary your analysts
> already know. Not every spreadsheet function is there: PDI 11's
> Formula has no `ROUND`, for example; `INT([x]*100+0.5)/100` rounds to
> the cent instead.
>
> **Why it matters:** most business logic (conditional pricing, derived
> flags, string assembly) fits in a Formula step, without a script.

<div class="pcm-embed-card" data-href="http://docs.oasis-open.org/office/v1.2/OpenDocument-v1.2-part2.html" data-title="OpenDocument formula specification (OASIS)"></div>

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result. Its hop into **IF Formula b-a** is disabled, so a run shows Workflow 1; enable the hop to run Workflow 2.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\04-scripting\27-mod4-formula\solution`.

[tr_formula.ktr](./files/tr_formula.ktr) <button data-launch="spoon" data-path="files/tr_formula.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_formula.ktr">View graph</button>
