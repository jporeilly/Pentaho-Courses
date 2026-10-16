# Writing to a Database

> **Warning:**
>
> #### Workshop - Writing to a Database
> 
> Load a CSV file into a table that doesn't exist yet: **Table output** writes the `CREATE TABLE` for you, from the stream's own fields.\
> Then load a second file the same way. A later workshop uses that table.
> 
> **What you’ll do**
> 
> * Read a delimited file with **CSV file input**
> * Map stream fields to table columns in **Table output**
> * Generate and run the `CREATE TABLE` with the **SQL** button
> * Insert rows, with the commit size, truncate and batch settings
> 
> **Prerequisites**
> 
> * The `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> * Basic understanding of tables and SQL data types
> 
> **Estimated time:** 35 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/ebcc69cd2a9347f8bec1620259952df7?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Loading Sales Data into a Database Table 📊" data-description="In this video, I walk you through the process of loading sales data from a delimited text file into a new database table using Spoon. We connect to our repository, create a transformation, and configure the CSV file input step to read the sales data. After setting up the table output step and executing the transformation, we successfully inserted 2,823 records into the new table. I also demonstrate how to verify the data loaded correctly by checking the row count in the table. Please ensure to follow along with the steps to replicate this process effectively." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The finished transformation: CSV Input hopped to stg_sales_data, and orders hopped to stg_orders_merged](../_assets/images/create-db.png)

<div align="center">
<figcaption><em>What you build: two independent loads in one transformation</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_write_database.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\14-mod3-writing-to-a-database`, next to `sales_data.csv` and `orders.txt`.

::::: tabs

### Workflow 1 - Sales Data

> **Note:**
>
> #### Load the sales data
> 
> Load `sales_data.csv`, 2,823 order lines, into a new table, `STG_SALES_DATA`.

<figure><img src="../_assets/images/load-sales-data.png" alt="CSV Input hopped to the stg_sales_data Table output step" width="277"><figcaption><p>Workflow 1</p></figcaption></figure>

:::: tabs

### 1. CSV file input

> **Note:** **CSV file input**
> 
> **CSV file input** reads a delimited file fast, with fewer options than **Text file input**.

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

2. From the **Input** folder in the **Design** tab, drag **CSV file input** onto the canvas.
3. Double-click the step and set:
   * **Step name**: `csvi-sales_data`
   * **Filename**: `${Internal.Entry.Current.Directory}/sales_data.csv`
   * **Delimiter**: `,` (comma)
   * **Lazy conversion?**: clear
   * **Header row present?**: select
4. Select **Get Fields**, then **OK** in **Sample size**. PDI reads that many lines and fills in the fields, with a type and length for each. Close the **Scan results**.

> **Danger:** **Get Fields** guesses each string's length from the sample, and the table you generate inherits the guess. In `sales_data.csv` three guesses are too short. Set **Length** for `CUSTOMERNAME` to 40, `ADDRESSLINE1` to 50 and `STATE` to 20, or longer (the longest values are 34, 42 and 13 characters). Otherwise the table is created too narrow and the load stops with "Data too long for column".

<figure><img src="../_assets/images/csv-sales.png" alt="CSV file input with sales_data.csv, comma delimiter, header row and 24 fields"><figcaption><p>sales_data.csv, 24 fields</p></figcaption></figure>

5. Select **OK**.

> **Note:** The screenshot shows the step name `CSV Input` and longer lengths than the minimums above; both work. The fields' **Currency** column shows the symbol for your computer's locale.

### 2. Table output

> **Note:** **Table output**
> 
> **Table output** inserts each row into a database table with an SQL `INSERT`.

1. From the **Output** folder, drag **Table output** onto the canvas.
2. Hop **csvi-sales_data** to **Table output**.
3. Double-click the step and set:
   * **Step name**: `stg_sales_data`
   * **Connection**: `MySQL:sampledata`
   * **Target table**: `STG_SALES_DATA`
   * **Commit size**: `1000`
   * **Truncate table**: select, so a second run replaces the rows instead of adding them again
   * **Specify database fields**: select

<figure><img src="../_assets/images/table-output.png" alt="Table output with target table STG_SALES_DATA and commit size 1000"><figcaption><p>Main options</p></figcaption></figure>

4. On the **Database fields** tab, select **Get fields**. Each stream field is mapped to a table column of the same name.

<figure><img src="../_assets/images/table-output-fields.png" alt="Database fields tab mapping each table field to the stream field of the same name"><figcaption><p>Table field = stream field</p></figcaption></figure>

> **Warning:** Check the mapping: each **Table field** on the left should match its **Stream field** on the right.

5. Select **SQL**. The table doesn't exist yet, so the **Simple SQL editor** opens with a `CREATE TABLE STG_SALES_DATA` statement built from the stream's fields.

<figure><img src="../_assets/images/sales-sql.png" alt="Simple SQL editor with the generated CREATE TABLE STG_SALES_DATA statement" width="375"><figcaption><p>The generated CREATE TABLE</p></figcaption></figure>

6. Select **Execute**, then **OK** in the results and **Close**.
7. Select **OK**.

> **Success:** Checkpoint: `STG_SALES_DATA` exists in the database, with no rows yet.

> **Under the hood:**
>
> #### The `CREATE TABLE` came from the row metadata, translated for MySQL
>
> Selecting **SQL** didn't open a template. **Table output** took the
> stream's row metadata (every field's name, type, length and
> precision as it stands after CSV file input) and asked the
> connection's database dialect to spell each one. A String of length
> 40 became `VARCHAR(40)`, a Date became `DATETIME`, and Integers and
> Numbers became `BIGINT`, `DOUBLE` or `DECIMAL` depending on their
> length and precision: the screenshot's length-20 fields became
> `DECIMAL(20)`. Point the same step at PostgreSQL and the same click
> writes `TIMESTAMP` and `DOUBLE PRECISION` instead.
>
> That is why the **Danger** note above matters. **Get Fields** sampled
> the start of the file to guess lengths, and the DDL inherits the
> guess. A longer value in row 50,000 is rejected by the database, not
> by PDI.
>
> **Why it matters:** the stream's shape and the table's shape came
> from one definition, so they can't disagree today. Set lengths
> generously at the input step and they won't disagree next month
> either.

### 3. Run

> **Note:** **Run and validate**
> 
> Run the load, then check the table with a database tool such as Adminer or DBeaver.\
> In production, DDL is usually managed with migration scripts rather than from a step.

1. Save the transformation, select **Run** in the toolbar, then **Run** in **Run Options**.
2. Check **Step Metrics**: **stg_sales_data** shows 2823 in **Output**.
3. In your database tool, run:

   ```sql
   SELECT COUNT(*) FROM STG_SALES_DATA;
   ```

<figure><img src="../_assets/images/sales-data.png" alt="STG_SALES_DATA rows in DBeaver"><figcaption><p>STG_SALES_DATA</p></figcaption></figure>

> **Success:** Checkpoint: `STG_SALES_DATA` holds 2,823 rows. Run the transformation again and it still holds 2,823, because **Truncate table** empties it first.

> **Under the hood:**
>
> #### Rows are inserted inside transactions, and in batches when you ask
>
> **Table output** prepared a single `INSERT INTO STG_SALES_DATA (...)
> VALUES (?, ?, ...)` at start-up and bound each incoming row to it.
> Every **Commit size** rows (1,000 here) the step commits the
> transaction. With **Use batch update for inserts** selected, as in
> Workflow 2, rows are also queued in the driver and shipped to MySQL
> in groups. Fewer round trips and fewer commits are most of why this
> beats a script that inserts row by row.
>
> The trade-off is granularity. If row 1,472 is rejected, the whole
> batch it sat in fails, and the step can't tell you which row without
> error handling switching batching off. A commit size of 1 gives
> perfect attribution and terrible speed.
>
> **Why it matters:** commit size is the dial between throughput and
> restartability. Large for bulk loads into staging; small, or fully
> transactional, when a half-loaded table would be worse than no load
> at all.

::::

### Workflow 2 - Orders

> **Note:**
>
> #### Load the products for Merge Rows (diff)
> 
> Load `orders.txt` into a new table, `STG_ORDERS_MERGED`. Despite its name, the file holds seven products. [Merge Rows (diff)](../21-mod4-merge-streams-diff/guide.md) in Module 4 compares this table with a changed copy.

<figure><img src="../_assets/images/load-orders-data.png" alt="orders Text file input hopped to the stg_orders_merged Table output step" width="288"><figcaption><p>Workflow 2</p></figcaption></figure>

::: tabs

### 1. Text file input

> **Note:** **Text file input**
> 
> This time read the file with **Text file input**: `orders.txt` is separated by semicolons.

1. Drag **Text file input** onto the same canvas, below Workflow 1.
2. Double-click the step. Set **Step name** to `orders`.
3. On the **File** tab, in **File or directory**, enter `${Internal.Entry.Current.Directory}/orders.txt` and select **Add**.

<figure><img src="../_assets/images/add-path-to-orders-txt.png" alt="Text file input File tab with orders.txt added to the selected files"><figcaption><p>The file</p></figcaption></figure>

4. On the **Content** tab, set **Separator** to `;` and keep **Header** selected, with **Number of header lines** `1`.

<figure><img src="../_assets/images/set-content.png" alt="Content tab with filetype CSV, separator semicolon and one header line"><figcaption><p>Semicolon separator, one header line</p></figcaption></figure>

5. On the **Fields** tab, select **Get Fields**, then **OK** at the number of sample lines, and close the **Scan results**.

<figure><img src="../_assets/images/get-fields.png" alt="Fields tab with six String fields from PRODUCTCODE to PRODUCTDESCRIPTION"><figcaption><p>Six String fields</p></figcaption></figure>

6. Select **OK**.

### 2. Table output

> **Note:** **Table output**
> 
> The same step as Workflow 1, with batch updates on.

1. Drag **Table output** onto the canvas and hop **orders** to it.
2. Double-click the step and set:
   * **Step name**: `stg_orders_merged`
   * **Connection**: `MySQL:sampledata`
   * **Target table**: `STG_ORDERS_MERGED`
   * **Commit size**: `1000`
   * **Truncate table**: select
   * **Specify database fields**: select
   * **Use batch update for inserts**: select

<figure><img src="../_assets/images/stg-orders-merged.png" alt="Table output with target table STG_ORDERS_MERGED and batch update selected"><figcaption><p>Main options</p></figcaption></figure>

3. On the **Database fields** tab, select **Get fields**.

<figure><img src="../_assets/images/stg-orders-merged-fields.png" alt="Database fields tab mapping the six product fields"><figcaption><p>Six fields mapped</p></figcaption></figure>

4. Select **SQL**, then **Execute**, then **OK** and **Close**.

<figure><img src="../_assets/images/orders-sql.png" alt="Simple SQL editor with CREATE TABLE STG_ORDERS_MERGED: five VARCHAR columns and a TEXT column"><figcaption><p>A 390-character string becomes TEXT</p></figcaption></figure>

5. Select **OK**.

> **Success:** Checkpoint: `STG_ORDERS_MERGED` exists in the database.

### 3. Run

> **Note:** **Run and validate**
> 
> Run the transformation again: both loads run, side by side.

1. Save and run the transformation.
2. In your database tool, run `SELECT * FROM STG_ORDERS_MERGED;`.

<figure><img src="../_assets/images/stg-orders-merged-2.png" alt="The seven STG_ORDERS_MERGED rows in DBeaver"><figcaption><p>STG_ORDERS_MERGED</p></figcaption></figure>

> **Success:** Checkpoint: `STG_ORDERS_MERGED` holds 7 rows, `S10_1678` to `S12_1666`, and `STG_SALES_DATA` still holds 2,823.

:::

:::::

<details>

<summary>Troubleshooting</summary>

**"No SQL needs to be executed to make this step function properly"**\
The table already exists with the same columns. Nothing to do: run the transformation.

**The SQL editor shows an `ALTER TABLE`**\
The table exists but its columns differ from the stream. Execute it only if you mean to change the table; otherwise fix the field types or lengths in the input step.

**"Data too long for column"**\
A string is longer than its column. Increase the field's **Length** in the input step, drop the table and generate the SQL again.

**The SQL editor is empty**\
Select **Get fields** on the **Database fields** tab first.

**The table has twice the rows you expect**\
**Truncate table** was clear and the transformation ran twice. Select it, or empty the table with `TRUNCATE TABLE`, and run again.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[orders.txt](./files/orders.txt)

[sales_data.csv](./files/sales_data.csv)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\14-mod3-writing-to-a-database\solution`.

[tr_write_database.ktr](./files/tr_write_database.ktr) <button data-launch="spoon" data-path="files/tr_write_database.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_write_database.ktr">View graph</button>
