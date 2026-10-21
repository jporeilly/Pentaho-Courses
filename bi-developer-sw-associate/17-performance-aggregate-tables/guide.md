# Aggregate Tables

> **Warning:**
>
> #### Workshop - Aggregate Tables
>
> Mondrian answers most queries by rolling detail rows up at query time. An aggregate table holds one of those roll-ups ready-made, so a high-level query reads a small table instead of the whole fact table. In this workshop you build two aggregates for the Miniature Models cube and prove that Mondrian uses them.
>
> **What you'll do**
>
> * Build two physical aggregate tables from the `ORDERFACT` detail data
> * Switch aggregate use on in Mondrian's properties
> * Declare the aggregates in the Miniature Models schema with Aggregate Name elements
> * Prove from the generated SQL that Mondrian reads them
>
> **Prerequisites:** Complete [Extended Model](../08-extend-model-extended-model/guide.md); the Pentaho Server running, which hosts the sample data; a SQL client that can reach HSQLDB. The free **DBeaver Community** works: `winget install -e --id dbeaver.dbeaver`.
>
> **Estimated time:** 45 minutes

There is nothing special about an aggregate table's data: it is an ordinary table that the ETL keeps in step with the fact table. Mondrian reads the small table for high-level views and the detail table only when someone drills beneath it. Best practice is few, targeted aggregates: start from a slow query, build the aggregate that answers it, and measure again.

:::: tabs

### 1. Build the Physical Tables

> **Note:**
>
> #### Build the Aggregate Tables
>
> The bundled script builds both tables from `ORDERFACT`. Their column names follow Mondrian's collapsed-level convention, such as `CUSTOMER_W_TER_Territory` and `ORDERFACT_Sales`, and the script creates them case-exact: the schema declarations in part 3 reference them verbatim. Each row also carries `ORDERFACT_fact_count`, the number of detail rows it summarizes, which Mondrian needs.

1. Make sure the Pentaho Server is running: it hosts the SampleData database on port `9001`. On a lab VM it starts with the machine. On your own machine, start it and wait until **http://localhost:8080/pentaho** shows the sign-in page:

::: tabs

### Windows (PowerShell)

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/server/pentaho-server
./start-pentaho.sh
```

:::

2. Connect your SQL client to the sample data as `pentaho_admin`: `pentaho_user` can only read the sample tables, and the script creates new ones.

   ```text
   URL:      jdbc:hsqldb:hsql://localhost/sampledata
   Username: pentaho_admin
   Password: password
   ```

3. In DBeaver, open `agg_tables.sql` from **Lab Files** below and run the whole script. It builds:

   | Table | Grain | Answers |
   | --- | --- | --- |
   | `Miniature_Sales_AGG_1` | Product Line × Territory × Country | "sales by line and market" views |
   | `Miniature_Sales_AGG_2` | Territory × Year × Quarter × Status | trend and status views |

> **Success:** Checkpoint: the script's last query returns three rows: `ORDERFACT` 2,996, `AGG_1` 129 and `AGG_2` 55. Both aggregates are a small fraction of the fact table.

### 2. Switch Aggregates On

> **Note:**
>
> #### Switch Aggregates On
>
> Mondrian ignores aggregate tables until two properties are true. Set them in both places Mondrian runs: Schema Workbench, to test here, and the Pentaho Server, for published schemas.

```properties
mondrian.rolap.aggregates.Use=true
mondrian.rolap.aggregates.Read=true
```

1. Add the two lines to Schema Workbench's `mondrian.properties`, in your `.schemaWorkbench` folder: `%USERPROFILE%\.schemaWorkbench\mondrian.properties` on Windows, `~/.schemaWorkbench/mondrian.properties` on macOS and Linux. The start script copies the file there from the install folder the first time it runs, and puts that folder first on the classpath. If the file isn't there yet, edit `C:\Pentaho\design-tools\schema-workbench\mondrian.properties` instead.
2. Add the two lines to the server's `C:\Pentaho\server\pentaho-server\pentaho-solutions\system\mondrian\mondrian.properties` (`~/Pentaho/server/pentaho-server/pentaho-solutions/system/mondrian/mondrian.properties` on macOS and Linux).
3. Restart Schema Workbench and the Pentaho Server.

> **Success:** Checkpoint: Schema Workbench starts again, and **http://localhost:8080/pentaho** shows the sign-in page.

### 3. Declare the Aggregates in the Schema

> **Note:**
>
> #### Declare the Aggregates
>
> An **Aggregate Name** under the cube's fact table tells Mondrian which table to read and maps its columns to the cube's measures and levels. Every measure and every level the aggregate holds must be mapped; anything below its grain stays with the detail table.

1. Select **File > Open** and open `miniaturemodels-agg.xml`, which you downloaded from **Lab Files** below.
2. Right-click the cube's **Table: ORDERFACT** and select **Add Aggregate Name**. Set **name** to `Miniature_Sales_AGG_1` and press `Tab`.
3. Right-click the new aggregate name and add its children, one per row, with these attributes:

| Add | column | name |
| --- | --- | --- |
| **Add Aggregate Fact Count** | `ORDERFACT_fact_count` | |
| **Add Aggregate Measure** | `ORDERFACT_Sales` | `[Measures].[Sales]` |
| **Add Aggregate Measure** | `ORDERFACT_Quantity` | `[Measures].[Quantity]` |
| **Add Aggregate Level** | `PRODUCTS_Line` | `[PRODUCTS.Products].[Line]` |
| **Add Aggregate Level** | `CUSTOMER_W_TER_Territory` | `[MARKETS.Markets].[Territory]` |
| **Add Aggregate Level** | `CUSTOMER_W_TER_Country` | `[MARKETS.Markets].[Country]` |

4. Declare `Miniature_Sales_AGG_2` the same way: right-click **Table: ORDERFACT**, select **Add Aggregate Name**, set **name** to `Miniature_Sales_AGG_2`, and add these children. Try it from the table in part 1 before you look:

| Add | column | name |
| --- | --- | --- |
| **Add Aggregate Fact Count** | `ORDERFACT_fact_count` | |
| **Add Aggregate Measure** | `ORDERFACT_Sales` | `[Measures].[Sales]` |
| **Add Aggregate Measure** | `ORDERFACT_Quantity` | `[Measures].[Quantity]` |
| **Add Aggregate Level** | `CUSTOMER_W_TER_Territory` | `[MARKETS.Markets].[Territory]` |
| **Add Aggregate Level** | `DIM_TIME_Years` | `[TIME.Time].[Years]` |
| **Add Aggregate Level** | `DIM_TIME_Quarters` | `[TIME.Time].[Quarters]` |
| **Add Aggregate Level** | `ORDERFACT_Type` | `[ORDER STATUS.Status].[Type]` |

5. Select **File > Save**, then **File > Publish**, with the **Publish Schema** values from [Basic Model](../05-schemas-basic-model/guide.md). If Schema Workbench asks whether to overwrite the Miniature Models schema, select **Yes**.

> **Success:** Checkpoint: a **Publish** message reads `Publish Successful`, and **Table: ORDERFACT** holds the two aggregate names, as in the solution file.

6. Select **OK**.

> **Under the hood:**
>
> #### Mondrian checks every AggName when the schema loads
>
> With aggregates.Read on, Mondrian inspects each declared aggregate as
> it loads the schema. It counts the table's rows (`select count(*)`:
> 129 for AGG_1, 55 for AGG_2) and validates the mapping. AggFactCount
> is mandatory, and a collapsed AggLevel needs its parent levels mapped
> too: drop Territory from AGG_1 while keeping Country and Mondrian
> reports that Country's "parent level is not part of that aggregation
> and this level is marked as collapsed", and the whole schema fails to
> load.
>
> **Why it matters:** an aggregate that answered some queries wrongly
> would be worse than none, so Mondrian refuses to guess.

### 4. Prove Mondrian Uses Them

> **Note:**
>
> #### Read the Generated SQL
>
> Mondrian logs the SQL it sends under the `mondrian.sql` logger. Switch it on, run queries at the aggregates' grain, and read which table each statement selects from.

1. Add this line inside the `<Loggers>` element of Schema Workbench's `log4j2.xml`, in the same `.schemaWorkbench` folder as `mondrian.properties`. The SQL goes to `workbench.log` in that folder.

```xml
<Logger name="mondrian.sql" level="DEBUG"/>
```

2. Select **File > New > MDX Query**. If the window title doesn't read **MDX Query - connected to miniaturemodels-agg.xml**, select the schema in the **Schema** list and select **Connect**. Enter this query, at the aggregates' grain, and select **Execute**:

```mdx
SELECT {[Measures].[Sales]} ON COLUMNS,
       [MARKETS.Markets].[Territory].Members ON ROWS
FROM [Sales_FY2003_2005]
```

> **Success:** Checkpoint: APAC £1,281,705.89, EMEA £5,008,224.32, Japan £503,957.58 and NA £3,852,061.39, plus an empty #null row for the customers with no territory. In `workbench.log`, the SQL for these cells selects from `Miniature_Sales_AGG_2` instead of `ORDERFACT`.

3. Replace `[MARKETS.Markets].[Territory].Members` with `[MARKETS.Markets].[Country].Members` and select **Execute** again.

> **Under the hood:**
>
> #### The smallest aggregate that fits wins, and the numbers don't change
>
> Mondrian keeps its aggregates ordered by size and, for each query,
> uses the first one that has every level and measure the query needs.
> Territory is in both tables, and AGG_2 is the smaller (55 rows to
> AGG_1's 129), so the Territory query reads AGG_2. Country and Line
> exist only in AGG_1, so the Country query reads `Miniature_Sales_AGG_1`;
> Quarters is only in AGG_2, and State Province in neither, so a State
> query goes back to ORDERFACT and its joins.
>
> Run the same queries with aggregates off and every figure is
> identical: an aggregate changes where the SQL reads, never the answer.
>
> **Why it matters:** the ETL must rebuild an aggregate whenever
> ORDERFACT changes; Mondrian can't tell a stale aggregate from a fresh
> one.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>The SQL still reads ORDERFACT</summary>

Aggregates are matched, not forced. Check that both properties are true in the `mondrian.properties` this process reads, that the schema was saved and republished after adding the declarations, and that every level at or above the query's grain is mapped in the Aggregate Name. After republishing, clear the server's schema cache: in the User Console, select **Tools > Refresh > Mondrian Schema Cache**.

</details>

<details>
<summary>"Table not found" on publish or query</summary>

The physical tables live in the sample data's `PUBLIC` schema. Run the script from part 1 again, and check that its last query lists both aggregate tables.

</details>

<details>
<summary>Column-name mismatch</summary>

The aggregate columns are case-exact and quoted when the script creates them. If your client created them in upper case, drop the tables and run the bundled script again as it is.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

The starting schema:

[miniaturemodels-agg.xml](./files/miniaturemodels-agg.xml)

The script that builds both aggregate tables:

[agg_tables.sql](./files/agg_tables.sql)

### Solution <!-- no-step -->

The finished schema, with both aggregates declared. Open it in Schema Workbench (**File > Open**) alongside your own to compare:

[miniaturemodels-agg-complete.xml](./files/solution/miniaturemodels-agg-complete.xml)
