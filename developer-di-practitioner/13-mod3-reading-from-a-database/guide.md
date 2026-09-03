# Read DB table

> **Warning:**
>
> #### Workshop - Read DB table
> 
> Build a transformation that reads `ORDERS` rows from a database.\
> Filter to shipped orders, calculate lead time, and label late shipments.
> 
> **What you’ll do**
> 
> * Read rows with **Table Input**
> * Generate SQL with **Get SQL select statement**
> * Add a calculated field with **Calculator**
> * Bucket values with **Number range**
> * Sort and format output for review
> 
> **Prerequisites**
> 
> * Pentaho Data Integration installed and configured
> * A working database connection. See **Database Connections**.
> * Basic `SELECT` and `WHERE`
> 
> **Estimated time:** 20 minutes

![Read from a database](../_assets/images/read-database.png)

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

:::: tabs

### 1. Table input

> **Note:**
>
> #### Table Input
> 
> Read rows from a database using a connection and SQL.\
> In this workshop, filter to orders with `STATUS = 'Shipped'`.

1. Start Spoon.

> **Note:** 

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

2. Drag **Table Input** onto the canvas.
3. Open the step properties.
4. Configure the step to match your environment:
   * Select your database **Connection**
   * Use **Get SQL select statement** to generate a base query
   * Add a `WHERE` clause for shipped orders

> **Note:** Example filter:
> 
> ```sql
> WHERE STATUS = 'Shipped'
> ```

<figure><img src="../_assets/images/read-db.png" alt=""><figcaption><p>Table input</p></figcaption></figure>

5. Select **Preview**. Confirm you get shipped orders.
6. Select **OK**.

> **Success:** Checkpoint: Preview shows only rows with `STATUS = 'Shipped'`.

> **Under the hood:**
>
> #### The SQL went to MySQL untouched; the rows came back as a stream
>
> **Table input** does not parse or rewrite your query. It sent the
> text exactly as written through the JDBC driver, so anything MySQL
> accepts — functions, joins, window clauses — works here. The result
> set then flows back row by row through a cursor: the step never asks
> the driver for the whole result, so a `SELECT` over a
> hundred-million-row table starts emitting immediately and uses the
> same memory as this one.
>
> The columns in Preview got their types from the driver's result
> metadata — `ORDERNUMBER` arrived as an Integer and `ORDERDATE` as a
> Date because the database said so. That is the row metadata every
> following step builds on.
>
> **Why it matters:** push filters, joins and aggregations into the
> SQL and the database does that work with its indexes, while the
> transformation only sees the rows that matter. It is the single
> biggest performance lever in PDI, and it costs nothing to use.

### 2. Calculator

> **Note:**
>
> #### Calculator
> 
> Add a derived field using built-in functions.\
> Use Calculator for speed and simple expressions.

1. Add a hop from **Table Input** to **Calculator**.
2. Drag **Calculator** onto the canvas.
3. Open the step properties.
4. Configure the calculation shown in the screenshot.

<figure><img src="../_assets/images/calc.png" alt=""><figcaption><p>Calculate diff days</p></figcaption></figure>

5. Select **OK**.

> **Note:** This creates `order_time`.\
> It represents the day difference between required and shipped dates.

### 3. Number range

> **Note:**
>
> #### Number range
> 
> Map numeric values into named buckets.\
> This makes reports easier to scan.

1. Add a hop from **Calculator** to **Number range**.
2. Drag **Number range** onto the canvas.
3. Open the step properties.
4. Configure the ranges as shown.

<figure><img src="../_assets/images/number-range.png" alt=""><figcaption><p>Number range</p></figcaption></figure>

> **Note:** This writes an output label (for example, `order_status`) based on `order_time`.\
> Use the same labels and thresholds as the screenshot.

5. Select **OK**.

### 4. Sort rows

> **Note:**
>
> #### Sort rows
> 
> Sort output to match how you want to read it.\
> This is also a common prerequisite for merge-style steps.

1. Add a hop from **Number range** to **Sort rows**.
2. Drag **Sort rows** onto the canvas.
3. Open the step properties.
4. Configure the sort keys as shown.

<figure><img src="../_assets/images/sort.png" alt=""><figcaption><p>Sort rows</p></figcaption></figure>

5. Select **OK**.

> **Note:** If you hit memory errors, lower the sort size.\
> PDI spills to temp files when needed.

> **Under the hood:**
>
> #### Sort is the first step that must see every row before it emits one
>
> Everything upstream — read, calculate, bucket — streams: a row in, a
> row out, all steps busy at once. **Sort rows** can't. The smallest
> value might be the last row to arrive, so the step buffers until it
> has read the entire input, sorts, and only then starts writing.
> Watch Step Metrics during a large run and the steps after the sort
> sit at zero until the reader finishes.
>
> It stays memory-safe because of **Sort size (rows in memory)**. Once
> that many rows are buffered they are sorted and spilled to a temp
> file in the **Sort directory**; at the end the step merges the sorted
> files back into one ordered stream. Lowering the sort size trades
> disk for RAM; **Compress TMP Files?** trades CPU for disk.
>
> **Why it matters:** a sort marks the point where pipeline
> parallelism stops. Sort as late and as narrow as you can — or let the
> database do it with `ORDER BY`, which costs the transformation
> nothing.

### 5. Select values

> **Note:**
>
> #### Select values
> 
> Keep only fields you need.\
> Fix types, lengths, and formats for downstream steps.

1. Add a hop from **Sort rows** to **Select values**.
2. Drag **Select values** onto the canvas.
3. Open the step properties.
4. On the **Meta-data** tab, set the date fields:

| Fieldname      | Type | Format       |
| -------------- | ---- | ------------ |
| `REQUIREDDATE` | Date | `yyyy-MM-dd` |
| `SHIPPEDDATE`  | Date | `yyyy-MM-dd` |

5. Select **OK**.

> **Note:** This formats `REQUIREDDATE` and `SHIPPEDDATE` so they render
> as plain dates (no time component) in the final stream.

### 6. RUN

> **Note:**
>
> #### Run and validate
> 
> Run the transformation and inspect the final stream.

1. In Spoon, select **Run**.
2. In **Execution Results**, open **Preview data** for **Select values**.

<figure><img src="../_assets/images/status-of-shipped-orders.png" alt=""><figcaption><p>Status of 'shipped' orders</p></figcaption></figure>

> **Success:** Checkpoint: You see shipped orders plus your derived fields (`order_time`, and the range label).

::::

<details>

<summary>Troubleshooting</summary>

**Preview shows zero rows**\
Confirm the `WHERE STATUS = 'Shipped'` filter matches your source values.

**SQL errors**\
Select **Get SQL select statement** again. Then re-apply your `WHERE` clause.

**Date or number conversion issues**\
Fix types in **Select values**. Re-run the preview.

**Out of memory during sort**\
Lower the sort size in **Sort rows**, or increase JVM memory.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[tr_reading_database_warehouse.ktr](./files/tr_reading_database_warehouse.ktr) <button data-launch="spoon" data-path="files/tr_reading_database_warehouse.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_reading_database_warehouse.ktr">View graph</button>
