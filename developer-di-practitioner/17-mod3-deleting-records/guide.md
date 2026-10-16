# Deleting Records

> **Warning:**
>
> #### Workshop - Deleting Records
> 
> Delete rows from `STG_SALES_DATA` using criteria that arrive in the stream: a list of product lines and a minimum quantity.\
> Use the **Delete** step when the transformation produces the delete criteria. For a fixed delete, an **Execute SQL script** is simpler.
> 
> **What you’ll do**
> 
> * Take a baseline of the table before you delete
> * Build a stream of delete criteria: product line and quantity
> * Pass a threshold in with a transformation parameter and **Get variables**
> * Delete the matching rows with **Delete**, and check the result with SQL
> 
> **Prerequisites**
> 
> * `STG_SALES_DATA`, loaded in [Writing to a Database](../14-mod3-writing-to-a-database/guide.md) (2,823 rows)
> * The `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> 
> **Estimated time:** 30 minutes

> **Danger:** A delete can't be undone. Here the table is a staging copy: to get it back, run the Writing to a Database transformation again, which truncates and reloads all 2,823 rows. On a real table, back it up or take a snapshot first.

<figure>

![The finished transformation: productlines list, getting min_quantityordered and delete min quantity ordered in a line](../_assets/images/delete-1.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_delete.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\17-mod3-deleting-records`, next to `productline.txt`.

:::: tabs

### 1. Inspect the data

> **Note:**
>
> #### Inspect the data
> 
> Look at `STG_SALES_DATA` before you delete anything.\
> The counts are your baseline for checking the delete.

1. In your database tool, count the rows, and the rows with a quantity over 50:

   ```sql
   SELECT COUNT(*) FROM STG_SALES_DATA;

   SELECT COUNT(*) FROM STG_SALES_DATA
   WHERE QUANTITYORDERED > 50;
   ```

<figure><img src="../_assets/images/stg-sales-data-data.png" alt="STG_SALES_DATA rows in DBeaver"><figcaption><p>STG_SALES_DATA</p></figcaption></figure>

> **Success:** Checkpoint: 2,823 rows, of which 54 have `QUANTITYORDERED` over 50.

2. List the rows that will survive:

   ```sql
   SELECT * FROM STG_SALES_DATA
   WHERE QUANTITYORDERED > 50;
   ```

<figure><img src="../_assets/images/stg-sales-data-sql.png" alt="The STG_SALES_DATA rows with QUANTITYORDERED over 50"><figcaption><p>The rows that survive</p></figcaption></figure>

> **Note:** The delete removes every row with `QUANTITYORDERED` of 50 or less, in each product line listed in `productline.txt`. The file lists all seven, so only these 54 rows remain.

### 2. CSV file input

> **Note:**
>
> #### CSV file input
> 
> Read `productline.txt`: a header and one `PRODUCTLINE` value per line, seven in all.

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

2. From the **Input** folder, drag **CSV file input** onto the canvas.
3. Double-click the step and set:
   * **Step name**: `productlines list`
   * **Filename**: `${Internal.Entry.Current.Directory}/productline.txt`
   * **Header row present?**: select
4. Select **Get Fields**, then **OK** in **Sample size**, and close the **Scan results**. One field: `PRODUCTLINE`, a String.

<figure><img src="../_assets/images/prod-list.png" alt="CSV file input reading productline.txt with one PRODUCTLINE field"><figcaption><p>One field: PRODUCTLINE</p></figcaption></figure>

5. Select **OK**.

### 3. Parameters

> **Note:**
>
> #### Transformation parameters
> 
> Hold the quantity threshold in a parameter, so a run can change it without editing the transformation.

1. Double-click an empty part of the canvas. **Transformation properties** opens.
2. On the **Parameters** tab, add a row: **Parameter** `MIN_QUANTITYORDERED`, **Default Value** `50`.

<figure><img src="../_assets/images/param.png" alt="Transformation properties Parameters tab with MIN_QUANTITYORDERED defaulting to 50" width="563"><figcaption><p>The threshold parameter</p></figcaption></figure>

3. Select **OK**.

### 4. Get variables

> **Note:**
>
> #### Get variables
> 
> **Get variables** adds a variable's value to every row as a field, so the Delete step can compare against it.

1. From the **Job** folder, drag **Get variables** onto the canvas.
2. Hop **productlines list** to **Get variables**.
3. Double-click the step. Set **Step name** to `getting min_quantityordered` and add one field:

| Name                  | Variable                 | Type   |
| --------------------- | ------------------------ | ------ |
| `MIN_QUANTITYORDERED` | `${MIN_QUANTITYORDERED}` | Number |

<figure><img src="../_assets/images/get-variables-1.png" alt="Get variables with field MIN_QUANTITYORDERED from the variable ${MIN_QUANTITYORDERED}, type Number" width="563"><figcaption><p>The parameter, as a field</p></figcaption></figure>

4. Select **OK**.

> **Under the hood:**
>
> #### A parameter is a variable with a default; Get variables copies it into the row
>
> When the transformation starts, every parameter you defined is
> registered in its variable space (the same space `kettle.properties`
> and `${Internal.Entry.Current.Directory}` live in), using the default
> unless the **Run Options** dialog or a parent job supplied a value.
> Steps, though, only ever see *rows*. **Get variables** is the bridge:
> it reads `${MIN_QUANTITYORDERED}` from that space, converts it to the
> type you set, and appends it as a field to each row passing through.
>
> From the Delete step's point of view the threshold is now just
> another column, no different from one read from the file.
>
> **Why it matters:** anything that varies from run to run (a date, a
> threshold, a region) belongs in a parameter with a default, brought
> into the stream where it is needed. The `.ktr` never changes; the
> value does.

### 5. Delete

> **Note:**
>
> #### Delete
> 
> **Delete** runs one `DELETE` for each row it receives, built from the row's values.\
> It is an end step: no rows leave it.

> **Danger:** The comparators decide what is deleted. Check each key row before you run.

1. From the **Output** folder, drag **Delete** onto the canvas.
2. Hop **getting min_quantityordered** to **Delete**.
3. Double-click the step and set:
   * **Step name**: `delete min quantity ordered`
   * **Connection**: `MySQL:sampledata`
   * **Target table**: `STG_SALES_DATA`
   * **Commit size**: `100`
4. In **The key(s) to look up the value(s)**, enter two rows:

| Table field       | Comparator | Stream field1         |
| ----------------- | ---------- | --------------------- |
| `QUANTITYORDERED` | `<=`       | `MIN_QUANTITYORDERED` |
| `PRODUCTLINE`     | `=`        | `PRODUCTLINE`         |

<figure><img src="../_assets/images/delete-options.png" alt="Delete step with target table STG_SALES_DATA and the two key rows" width="563"><figcaption><p>Delete where QUANTITYORDERED &lt;= 50 and the product line matches</p></figcaption></figure>

> **Note:** The screenshot also has **Target schema** set to `sampledata`. The connection already points at that database, so you can leave it empty.

5. Select **OK**.

### 6. Run and validate

> **Note:**
>
> #### Run and validate
> 
> Run the transformation, then repeat the baseline counts.

1. Save the transformation, select **Run** in the toolbar. **Run Options** lists the parameter `MIN_QUANTITYORDERED` with its default, `50`. Select **Run**.
2. In **Step Metrics**, **delete min quantity ordered** shows 7 in **Updated**: one `DELETE` per product line.
3. In your database tool, repeat the counts from the first tab.

<figure><img src="../_assets/images/delete-data.png" alt="STG_SALES_DATA after the delete in DBeaver"><figcaption><p>STG_SALES_DATA after the delete</p></figcaption></figure>

> **Success:** Checkpoint: `STG_SALES_DATA` holds 54 rows, every one with `QUANTITYORDERED` over 50.

> **Under the hood:**
>
> #### One DELETE per incoming row, comparators and all
>
> The step prepared a single statement from the grid, `DELETE FROM
> STG_SALES_DATA WHERE QUANTITYORDERED <= ? AND PRODUCTLINE = ?`, and
> executed it once for every row that arrived, binding that row's
> `MIN_QUANTITYORDERED` and `PRODUCTLINE` into the markers. Seven
> product lines in the file meant seven statements, each free to remove
> hundreds of rows, committed together every **Commit size** rows.
>
> No rows leave the step, and its **Updated** count in Step Metrics
> counts *statements executed*, one per driving row, not rows removed.
> Only the database knows that number, which is why you repeated the
> baseline counts.
>
> **Why it matters:** a small driving stream can delete a large amount
> of data; that is both the point and the risk. Before a real delete,
> disable the hop into **Delete** and preview the driving rows: each
> one is a `WHERE` clause you are about to execute.

> **Tip:** Run it again with a different threshold: in **Run Options**, set **Value** for `MIN_QUANTITYORDERED` to `70`. Reload `STG_SALES_DATA` first (run the Writing to a Database transformation), or nothing is left to delete.

::::

<details>

<summary>Troubleshooting</summary>

**Nothing was deleted**\
The criteria matched no rows. Check the comparators, and that `MIN_QUANTITYORDERED` is a Number in **Get variables**. If the table was already cut down by an earlier run, reload it first.

**Too many rows deleted**\
A comparator is too broad (`>=` instead of `<=`, say), or a key row compares the wrong fields.

**Type conversion errors in Delete**\
`MIN_QUANTITYORDERED` arrived as a String. Set its **Type** to Number in **Get variables**.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[productline.txt](./files/productline.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\17-mod3-deleting-records\solution`.

[tr_delete.ktr](./files/tr_delete.ktr) <button data-launch="spoon" data-path="files/tr_delete.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_delete.ktr">View graph</button>
