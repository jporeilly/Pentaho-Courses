# Database Join

> **Warning:**
>
> #### Workshop - Database Join
> 
> **Database join** runs a query for each row in the stream, with values from that row as its parameters, and adds the query's results to the row. It doesn't join two tables in the database; it joins a stream to a query result.\
> In this workshop, three search rows find products in the `PRODUCTS` table below a maximum buy price.
> 
> **What you'll do**
> 
> * Provide search rows with **Data grid**
> * Query the database once per row with **Database join**
> * See an outer join keep a row with no match, and one row return several
> 
> **Prerequisites:** [Review Joins](../topic-mod4-joins-review/guide.md); the `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> 
> **Estimated time:** 20 minutes

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

---

<div align="center">
<figure>
<img src="../_assets/images/database-join-2.png" alt="The finished transformation: the Data grid &quot;some conditions&quot; hopped to Database join" width="628">
<figcaption>What you build</figcaption>
</figure>
</div>

:::: tabs

### 1. Data grid

> **Note:**
>
> #### Data grid
> 
> **Data grid** holds rows typed into the step itself: handy for tests, reference values and demonstrations. Here each row is one search.

1. Start Spoon with the **Start Pentaho Data Integration** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

<button data-launch="spoon" data-path="">Start Pentaho Data Integration</button>

2. Select **File > New > Transformation** (`Ctrl+N`).
3. Select **File > Save as** and save it as `tr_database_join.ktr` in `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\22-mod4-database-join`.
4. On the **Design** tab, open the **Input** folder and drag **Data grid** onto the canvas.
5. Double-click **Data grid**. Set **Step name** to `some conditions`.
6. On the **Meta** tab, fill the grid with two fields:

| Name        | Type      |
| ----------- | --------- |
| `prod`      | `String`  |
| `max_price` | `Integer` |

7. Open the **Data** tab and enter three rows:

| prod           | max_price |
| -------------- | --------- |
| `Aston Martin` | `90`      |
| `Ford Falcon`  | `70`      |
| `Corvette`     | `70`      |

<div align="center">
<figure>
<img src="../_assets/images/dg-database-join.png" alt="Data grid Meta tab with prod String and max_price Integer" width="746">
<figcaption>Meta tab</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/dg-database-join-data.png" alt="Data grid Data tab with the three search rows" width="746">
<figcaption>Data tab</figcaption>
</figure>
</div>

8. Select **Preview**, enter `100` rows, and select **OK**.

> **Success:** Checkpoint: **Examine preview data** shows 3 rows: `Aston Martin` with `90`, `Ford Falcon` with `70` and `Corvette` with `70`.

9. Select **Close**, then **OK**.

### 2. Database join

> **Note:**
>
> #### Database join
> 
> The query's parameters are question marks (`?`) in the SQL. For each row, **Database join** replaces them, in order, with the fields listed in **The parameters to use**.

1. On the **Design** tab, open the **Lookup** folder and drag **Database join** onto the canvas.
2. Create a hop from **some conditions** to **Database join**: hold `Shift` and drag from one step to the other.
3. Double-click **Database join**. Set **Connection** to `MySQL:sampledata`.
4. Enter this query in **SQL**:

   ```sql
   SELECT PRODUCTNAME
        , PRODUCTSCALE
        , BUYPRICE
   FROM   PRODUCTS
   WHERE  PRODUCTNAME LIKE concat('%',?,'%')
   AND    BUYPRICE < ?
   ```

5. Keep **Number of rows to return** at `0` (all of them), and select **Outer join?**.
6. Fill **The parameters to use** with two rows, in this order: the first `?` gets `prod`, the second `max_price`.

| Parameter fieldname | Parameter Type |
| ------------------- | -------------- |
| `prod`              | `String`       |
| `max_price`         | `Integer`      |

7. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/database-join-step.png" alt="Database join with the SELECT on PRODUCTS, Outer join selected and the parameters prod and max_price" width="800">
<figcaption>Two markers, two parameters, in order</figcaption>
</figure>
</div>

> **Note:** **What each row runs**
> 
> For the first row, the query becomes `... WHERE PRODUCTNAME LIKE concat('%','Aston Martin','%') AND BUYPRICE < 90`. The other two rows run the same query with their own values. **LIKE** with `%` on both sides matches the name anywhere in `PRODUCTNAME`.
> 
> **Outer join?** keeps an input row whose query finds nothing, with nulls for the returned fields: the stream-side rows are always kept, as in a left outer join from the stream to the query result.

### 3. Run

> **Note:**
>
> #### Run the transformation
> 
> Run it and look at what each search row returned. A database lookup returns at most one row per input row; Database join returns every row the query finds. If you expect one match per row, [Database Lookups](../26-mod4-database-lookups/guide.md) is the simpler step.

1. Save the transformation (`Ctrl+S`).
2. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.

> **Under the hood:**
>
> #### One prepared statement, executed once per row
>
> **Database join** compiled your `SELECT ... WHERE PRODUCTNAME LIKE ...
> AND BUYPRICE < ?` once, at start-up, as a JDBC prepared statement.
> For each incoming row it then bound that row's `prod` and `max_price`
> to the two markers, in grid order, and executed it. Every result row
> the database returned was added to a copy of the input row; with
> **Outer join?** selected, no results still produced one row with
> nulls, which is why Ford Falcon came through at all. Three input rows
> meant three round trips, and Corvette's three matches became three
> output rows from one input. That fan-out is the feature; the round
> trip per row is the price.
>
> **Why it matters:** with a handful of driving rows this is the
> simplest way to enrich from a query. With a million, it is a million
> queries: at that scale, read both sides with **Table input** and use
> **Merge join**, or put the join in the SQL.

3. In **Execution Results**, open the **Step Metrics** tab.

> **Success:** Checkpoint: **some conditions** shows 3 in **Written**, and **Database join** shows 3 in **Read** and 5 in **Written**: three queries, five rows out.

4. Select **Database join** on the canvas and open the **Preview data** tab.

<div align="center">
<figure>
<img src="../_assets/images/results-1.png" alt="Preview data: Aston Martin with one product, Ford Falcon with nulls, and Corvette products" width="800">
<figcaption>One search row can return several rows</figcaption>
</figure>
</div>

> **Success:** Checkpoint: 5 rows from 3 searches: Aston Martin finds one product, Ford Falcon none (an outer join keeps it, with nulls), and Corvette three. The 1957 Corvette Convertible's buy price, 69.93, is just under 70.
>
> | prod           | max_price | PRODUCTNAME                          | PRODUCTSCALE | BUYPRICE |
> | -------------- | --------- | ------------------------------------ | ------------ | -------- |
> | `Aston Martin` | 90        | 1965 Aston Martin DB5                | 1:18         | 65.96    |
> | `Ford Falcon`  | 70        | `<null>`                             | `<null>`     | `<null>` |
> | `Corvette`     | 70        | 1957 Corvette Convertible            | 1:18         | 69.93    |
> | `Corvette`     | 70        | 1958 Chevy Corvette Limited Edition  | 1:24         | 15.91    |
> | `Corvette`     | 70        | 2002 Chevy Corvette                  | 1:24         | 62.11    |

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\22-mod4-database-join\solution`.

[tr_database_join.ktr](./files/tr_database_join.ktr) <button data-launch="spoon" data-path="files/tr_database_join.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_database_join.ktr">View graph</button>
