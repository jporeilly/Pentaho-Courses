# Aggregate Tables

> **Warning:**
>
> #### Workshop - Aggregate Tables
>
> * Build two physical aggregate tables from the ORDERFACT detail data
> * Enable aggregate use in Mondrian's properties
> * Declare the aggregates in the Miniature Models schema with `<AggName>` and prove Mondrian uses them
>
> **Prerequisites:** The Extend Model module completed, the Pentaho Server running (it hosts the sample data), and a SQL client that can reach HSQLDB — free **DBeaver Community** works: `winget install -e --id dbeaver.dbeaver`.
>
> **Estimated time:** 45 minutes

Mondrian answers most queries by rolling detail rows up at query time.
An **aggregate table** pre-computes one of those roll-ups — Mondrian
then reads the small table for high-level views and the detail table
only when someone drills beneath it. There is nothing special about
the data: it is an ordinary table the ETL keeps in step with the fact
table. Best practice is few, targeted aggregates — start from a slow
query, build the aggregate that answers it, measure again.

#### Lab Files

[miniaturemodels-agg.xml](./files/miniaturemodels-agg.xml) — the starting schema

[agg_tables.sql](./files/agg_tables.sql) — builds both aggregate tables

[miniaturemodels-agg-complete.xml](./files/solution/miniaturemodels-agg-complete.xml) — the finished schema, for reference

***

## 1. Build the physical tables

1. Connect your SQL client to the sample data (the server must be
   running — it hosts the HSQLDB):

   ```
   URL:      jdbc:hsqldb:hsql://localhost/sampledata
   Username: pentaho_user
   Password: password
   ```

2. Run the bundled [agg_tables.sql](./files/agg_tables.sql). It builds:

   | Table | Grain | Answers |
   | --- | --- | --- |
   | `Miniature_Sales_AGG_1` | Product Line × Territory × Country | "sales by line and market" views |
   | `Miniature_Sales_AGG_2` | Territory × Year × Quarter × Status | trend and status views |

   Each row also carries `ORDERFACT_fact_count` — Mondrian needs the
   number of detail rows each aggregate row summarises.

3. The final query in the script prints row counts — both aggregates
   should be a tiny fraction of `ORDERFACT`.

> **Note:** The column names follow Mondrian's collapsed-level
> convention (`CUSTOMER_W_TER_Territory`, `ORDERFACT_Sales`) and are
> created case-exact — the schema declarations in step 3 reference
> them verbatim.

## 2. Switch aggregates on

Mondrian ignores aggregate tables until told otherwise. Two properties
control it:

```
mondrian.rolap.aggregates.Use=true
mondrian.rolap.aggregates.Read=true
```

Set them in **both** places you run Mondrian:

1. **Schema Workbench** (for testing here): edit
   `C:\Pentaho\design-tools\schema-workbench\mondrian.properties`
   and restart the workbench.

2. **Pentaho Server** (for published schemas): edit
   `pentaho-server\pentaho-solutions\system\mondrian\mondrian.properties`
   and restart the server.

## 3. Declare the aggregates in the schema

1. Open your copy of
   [miniaturemodels-agg.xml](./files/miniaturemodels-agg.xml) in
   Schema Workbench (**File ▸ Open**).

2. Right-click the cube's **Table (ORDERFACT)** element and add an
   **Aggregate Name**. Name it `Miniature_Sales_AGG_1` and build it
   up:

   | Element | Column | Maps to |
   | --- | --- | --- |
   | AggFactCount | `ORDERFACT_fact_count` | — |
   | AggMeasure | `ORDERFACT_Sales` | `[Measures].[Sales]` |
   | AggMeasure | `ORDERFACT_Quantity` | `[Measures].[Quantity]` |
   | AggLevel | `PRODUCTS_Line` | `[PRODUCTS.Products].[Line]` |
   | AggLevel | `CUSTOMER_W_TER_Territory` | `[MARKETS.Markets].[Territory]` |
   | AggLevel | `CUSTOMER_W_TER_Country` | `[MARKETS.Markets].[Country]` |

   Every measure and every level **above** the aggregate's grain must
   be mapped; anything below it stays with the detail table.

3. **Exercise:** declare `Miniature_Sales_AGG_2` yourself from the
   step-1 table (Territory, Years, Quarters, Type + both measures +
   fact count). Check your work against the
   [solution](./files/solution/miniaturemodels-agg-complete.xml).

4. Save, then publish the schema to the server
   (`admin` / `password`).

## 4. Prove Mondrian uses them

1. In Schema Workbench, run an MDX query at the aggregate's grain:

   ```
   SELECT {[Measures].[Sales]} ON COLUMNS,
          [MARKETS.Markets].[Territory].Members ON ROWS
   FROM [Sales_FY2003_2005]
   ```

2. To see the SQL Mondrian generates, enable the `mondrian.sql`
   logger (workbench: `log4j.xml` next to `mondrian.properties`;
   server: its `log4j2.xml`) and re-run the query — the generated SQL
   now selects from `Miniature_Sales_AGG_1` instead of `ORDERFACT`.

<details>
<summary>Troubleshooting</summary>

**The SQL still hits ORDERFACT.** Aggregates are matched, not forced:
check both properties are true in the mondrian.properties that THIS
process reads, the schema was saved/republished after adding the
declarations, and every level at or above the query's grain is mapped
in the AggName block. Clear the schema cache after republishing
(Tools ▸ Refresh in the User Console).

**"Table not found" on publish or query.** The physical tables live in
the sample data's PUBLIC schema — re-run step 1's script and confirm
the sanity query lists both AGG tables.

**Column-name mismatch.** The agg columns are case-exact and quoted at
creation. If your client created them upper-cased, drop and re-run the
bundled script as-is.

</details>
