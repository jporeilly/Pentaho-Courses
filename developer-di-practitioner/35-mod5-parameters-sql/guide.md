# Parameters SQL

> **Warning:**
>
> #### Workshop - Parameters SQL
> 
> Queries often need values that arrive in the data, such as the product line and scale to list. This workshop passes them to a `SELECT` as `?` markers, which the database driver binds as values.
> 
> In this workshop, you build a transformation that drives a parameterized Table input query from a Data grid, using three different ways of supplying the parameter values.
> 
> **What you'll do**
> 
> * Pass parameters to a Table input query as a single row
> * Pass several rows of parameters in one run
> * Pass parameter values one parameter per row
> * Preview the results for each approach
> 
> **Prerequisites:** **[Parameters](../34-mod5-parameters/guide.md)** (named parameters and `${}` substitution) and the `MySQL:sampledata` connection from **[Connecting to Database](../12-mod3-connecting-to-database/guide.md)**.
> 
> **Estimated time:** 20 minutes

<figure>

![The finished transformation: three Data grids, each feeding its own Table input](../_assets/images/param-database.png)

<div align="center">
<figcaption><em>Three ways to feed the same query</em></figcaption>
</div>
</figure>

> **Note:** A **Table input** with a fixed `SELECT` needs nothing else. When the query needs values from the stream, the step reads them from the step named in **Insert data from step** and puts them in place of the `?` markers.

> **Note:** **Open the finished transformation**
> 
> This workshop walks through a finished transformation: open `tr_parameters_sql.ktr` from **Lab Files** below (or from its folder on disk). It holds three Data grids, each feeding its own **Table input**, one per way of supplying the values.

:::: tabs

### 1. Parameters (1 row)

> **Note:**
>
> #### Parameters (1 row)
> 
> One row carries both values. Its fields must be in the same order as the `?` markers in the `WHERE` clause: product line first, then scale.

1. Start Pentaho Data Integration (Spoon).


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

2. Open `tr_parameters_sql.ktr` and double-click the Data grid **Parameters (1 row)**: one row, `Classic Cars` and `1:10`.

<figure><img src="../_assets/images/dg-param-1-row.png" alt="Data grid - Parameters (1 row)" width="375"><figcaption><p>Data grid - Parameters (1 row)</p></figcaption></figure>

3. Double-click the Table input **Steel Wheels Products 1**: **Insert data from step** is **Parameters (1 row)**, and the query ends `WHERE PRODUCTLINE = ? AND PRODUCTSCALE = ?`.

<figure><img src="../_assets/images/ti-param.png" alt="Table input - parameters ? - single row" width="563"><figcaption><p>Table input - parameters ? - single row</p></figcaption></figure>

> **Warning:** **How the `?` markers are filled**
>
> * In the order of the incoming fields: the first field fills the first `?`, the second the second.
> * The incoming values are used up by the query; they don't continue in the stream.
> * A `?` can only stand where a value can. Table names, column names and keywords can't be `?` markers; use `${VARIABLE}` substitution for those, as in [Parameters](../34-mod5-parameters/guide.md).

<figure><img src="../_assets/images/param-results-1-row.png" alt="Preview: the Classic Cars products in 1:10 scale" width="563"><figcaption><p>One row of values, one query</p></figcaption></figure>

> **Success:** Checkpoint: preview **Steel Wheels Products 1**: 3 products, the Classic Cars in 1:10 scale (1952 Alpine Renault 1300, 1972 Alfa Romeo GTA and 1962 LanciaA Delta 16V).

> **Under the hood:**
>
> #### The `?` markers are JDBC bind parameters, so order is everything
>
> **Table input** prepared the query once with the two `?` left open,
> read the single row from *Parameters (1 row)* via **Insert data from
> step**, and bound its fields to the markers **in field order** —
> first field to first `?`, second to second. The database received
> values, not text spliced into SQL: the driver quotes and types them,
> so a product line called `O'Brien` can't break the query and can't
> inject anything.
>
> That is also the limit. A bind parameter can only stand where a
> *value* can — never a table name, column or keyword — which is what
> the warning above is telling you. Those come from `${VARIABLE}`
> substitution with **Replace variables in script?** selected, which
> really is text replacement, applied before the statement is
> prepared.
>
> **Why it matters:** values by `?`, identifiers by `${}`. Keep the
> rule and your queries stay both safe and portable.

### 2. Parameters (several rows)

> **Note:**
>
> #### Parameters (several rows)
> 
> Suppose that you not only want to list the Classic Cars in 1:10 scale, but also the Motorcycles in 1:10 and 1:12 scales. You don't have to run the transformation three times in order to do this. You can have a dataset with three rows, one for each set of parameters.

1. Double-click the Data grid **Parameters (several rows)**: three rows, `Classic Cars` `1:10`, `Motorcycles` `1:10` and `Motorcycles` `1:12`.

<figure><img src="../_assets/images/dg-param-several-rows.png" alt="Data grid Parameters (several rows) with three product line and scale pairs"><figcaption><p>Three sets of values</p></figcaption></figure>

2. Double-click the Table input **Steel Wheels Products 2**: the same query, with **Execute for each row?** selected.

<figure><img src="../_assets/images/ti-param-serveral-rows.png" alt="Table input Steel Wheels Products 2 with the ? query and Execute for each row selected"><figcaption><p>Table input - parameters ? - several rows</p></figcaption></figure>

> **Note:** The markers are filled as in tab 1: in field order, values only.

<figure><img src="../_assets/images/results-several-rows.png" alt="Preview: Classic Cars in 1:10 and Motorcycles in 1:10 and 1:12"><figcaption><p>One query per row, one result</p></figcaption></figure>

> **Success:** Checkpoint: preview **Steel Wheels Products 2**: 7 products, 3 Classic Cars in 1:10, 3 Motorcycles in 1:10 and 1 Motorcycle in 1:12, from three executions of the one query.

> **Under the hood:**
>
> #### Three rows in: one prepared statement, executed three times
>
> The difference between this tab and the last is a single checkbox on
> the Table input step: **Execute for each row?** With it on, the step
> keeps the prepared statement and re-binds it for every row the data
> grid sends — three rows, three executions, one result set after
> another flowing into the same output stream.
>
> With it off (as in the next tab, *1 by row*), the step instead reads
> *all* incoming rows before running anything, flattens their values
> into one list in arrival order, and fills the `?` markers from that
> list in a single execution. Same query, same markers, two very
> different contracts — which is why the third approach can't mix
> types across rows.
>
> **Why it matters:** a Table input driven by a stream is a loop in
> disguise. That is ideal for a few hundred parameter sets; for a
> million, the loop is a million queries, and a join in SQL beats it
> every time.

### 3. Parameters (1 by row)

> **Note:**
>
> #### Parameters (1 by row)
> 
> It's also possible to receive the parameter values in several rows. Instead of a row, you had one parameter by row.

1. Double-click the Data grid **Parameters (1 by row)**: one field, `variable`, and two rows, `Classic Cars` and `1:10`.

<figure><img src="../_assets/images/dg-1-by-row.png" alt="Data grid - Parameters (1 by row)"><figcaption><p>Data grid - Parameters (1 by row)</p></figcaption></figure>

2. Double-click the Table input **Steel Wheels Products 3**: the same query, with **Execute for each row?** clear.

<figure><img src="../_assets/images/param-row-by-row.png" alt="Table input - parameters ? - 1 by row"><figcaption><p>Table input - parameters ? - 1 by row</p></figcaption></figure>

> **Note:** The markers are filled as in tab 1: in field order, values only.

<figure><img src="../_assets/images/param-results-1-row.png" alt="Preview: the Classic Cars products in 1:10 scale, as in tab 1"><figcaption><p>The same result as one row</p></figcaption></figure>

> **Success:** Checkpoint: preview **Steel Wheels Products 3**: the same 3 products as tab 1.

> **Note:** This approach is less flexible than one row: every value shares one column, so values of different types (a String and a Date, say) can't be passed this way.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

### Solution <!-- no-step -->

The finished transformation for this lab. Run it to see all three approaches at once (on the MySQL `sampledata`):

* **Steel Wheels Products 1** (1 row): 3 products, the Classic Cars in 1:10.
* **Steel Wheels Products 2** (several rows): 7 products, Classic Cars 1:10 plus Motorcycles 1:10 and 1:12.
* **Steel Wheels Products 3** (1 by row): the same 3 products as the first.

Also on disk at `C:\Workshop-DI-Practitioner\05-enterprise-solution\03-parameters\35-mod5-parameters-sql\solution`.

[tr_parameters_sql.ktr](./files/tr_parameters_sql.ktr) <button data-launch="spoon" data-path="files/tr_parameters_sql.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_parameters_sql.ktr">View graph</button>
