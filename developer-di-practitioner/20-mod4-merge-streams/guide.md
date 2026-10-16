# Merge Streams

> **Warning:**
>
> #### Workshop - Merge Streams
> 
> Two streams can only become one when they share a layout: the same fields, in the same order, with the same types.\
> In this workshop you bring a products stream and a descriptions stream to one layout, then merge them.
> 
> **What you'll do**
> 
> * Read two text files with **Text file input**
> * Add the missing field to one stream with **Add constants**
> * Put both streams in the same field order with **Select values**
> * Merge them into one step and check the result
> 
> **Prerequisites:** [Review Merge](../topic-mod4-merge-review/guide.md), and the steps from the earlier workshops: Text file input, Add constants, Select values.
> 
> **Estimated time:** 25 minutes

<figure>

![The finished transformation: orders and description inputs, Add description, two Select values steps, and a Dummy step they both feed](../_assets/images/merge-streams-2.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

<figure><img src="../_assets/images/merge-streams-3.png" alt="Pentaho Data Integration title card: Merge Streams"><figcaption><p>Merge Streams</p></figcaption></figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_merge_streams.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\01-merge\20-mod4-merge-streams`, next to `orders.txt` and `description.txt`.

:::: tabs

### 1. Text file input

> **Note:**
>
> #### Text file input
> 
> Read the two files, each into its own stream. Look at them first: `orders.txt` has five product fields, and `description.txt` has the same five plus `PRODUCTDESCRIPTION`, with only the code and the description filled in.

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

2. Open both files in a text editor and compare their header lines:

   ```text
   orders.txt:       PRODUCTCODE;PRODUCTNAME;PRODUCTLINE;PRODUCTSCALE;PRODUCTVENDOR
   description.txt:  PRODUCTCODE;PRODUCTNAME;PRODUCTLINE;PRODUCTSCALE;PRODUCTVENDOR;PRODUCTDESCRIPTION
   ```

3. From the **Input** folder, drag two **Text file input** steps onto the canvas. Name them `orders` and `description`.
4. In each, on the **File** tab, add `${Internal.Entry.Current.Directory}/orders.txt` or `${Internal.Entry.Current.Directory}/description.txt`. On the **Content** tab, set **Separator** to `;` and keep **Header** selected.
5. On each **Fields** tab, select **Get Fields**. Every field is a String.

> **Success:** Checkpoint: each step previews 9 rows. `orders` has 5 fields; `description` has 6.

### 2. Add constants

> **Note:**
>
> #### Add constants
> 
> **Add constants** adds the same value to every row. Here it gives the `orders` stream the field it lacks.

1. From the **Transform** folder, drag **Add constants** onto the canvas, name it `Add description`, and hop **orders** to it.
2. Add one field: **Name** `PRODUCTDESCRIPTION`, **Type** String, **Value** left empty, so every row gets a null description.

> **Success:** Checkpoint: **Add description** previews the 9 orders with a sixth, empty field, `PRODUCTDESCRIPTION`.

### 3. Select values

> **Note:**
>
> #### Select values
> 
> **Select values** chooses, orders, renames and retypes fields. It has three tabs:
> 
> * **Select & Alter**: the fields to keep, in output order, with new names or lengths
> * **Remove**: fields to drop
> * **Meta-data**: new types, lengths and formats

1. From the **Transform** folder, drag two **Select values** steps onto the canvas. Name them `Select Orders` and `Select Description`.
2. Hop **Add description** to **Select Orders**, and **description** to **Select Description**.
3. In each, on **Select & Alter**, list the same six fields in the same order:

   `PRODUCTCODE`, `PRODUCTNAME`, `PRODUCTLINE`, `PRODUCTSCALE`, `PRODUCTVENDOR`, `PRODUCTDESCRIPTION`

<figure><img src="../_assets/images/merge-streams-select.png" alt="Select Orders: the six product fields in order on the Select and Alter tab"><figcaption><p>The same six fields, in the same order, in both</p></figcaption></figure>

4. From the **Flow** folder, drag **Dummy (do nothing)** onto the canvas, and hop both **Select values** steps to it.

### 4. Run

> **Note:**
>
> #### Run the transformation
> 
> Run it, then check the merged stream.

1. Save the transformation, select **Run** in the toolbar, then **Run** in **Run Options**.
2. Select **Dummy (do nothing)**, then the **Preview data** tab in **Execution Results**.

<figure><img src="../_assets/images/merge-streams-preview.png" alt="Preview data: the merged rows from both streams in one set of columns"><figcaption><p>One stream, one layout</p></figcaption></figure>

> **Success:** Checkpoint: 18 rows. The 9 rows from `orders` have their names, lines, scales and vendors, and an empty description; the 9 from `description` have only the code and the description. **Dummy (do nothing)** shows 18 in **Read** in **Step Metrics**.

> **Note:** The merge stacks rows, it doesn't combine them: each product appears twice, once from each file. To combine both halves into one row per product, you join the streams on `PRODUCTCODE`, as the [Joins](../topic-mod4-joins-review/guide.md) workshops show.

> **Under the hood:**
>
> #### Two hops into one step is a union, matched by position
>
> The **Dummy** at the end doesn't merge anything clever. Given two
> input hops, it takes rows from each as they arrive and passes them
> on, so the output is the *union* of both streams in arrival order.
> The engine identifies a field by its **position** in the row, not its
> name: field 3 from one stream and field 3 from the other land in the
> same column whatever they are called. That is why the two **Select
> values** steps had to agree on order and type, not just on names.
>
> Normally nothing checks this. Rows of a different shape flow on, and
> the first symptom is a wrong value or an error far downstream. Select
> **Enable safe mode** in **Run Options** and PDI compares every row
> with the first one it saw, stopping with an error such as "you're
> mixing rows with different layout" at the step where the streams
> meet.
>
> **Why it matters:** run merges in safe mode while you build them. It
> costs a little speed and turns a silent data bug into an error that
> names the step.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[description.txt](./files/description.txt)

[orders.txt](./files/orders.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\01-merge\20-mod4-merge-streams\solution`.

[tr_merge_streams.ktr](./files/tr_merge_streams.ktr) <button data-launch="spoon" data-path="files/tr_merge_streams.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_streams.ktr">View graph</button>
