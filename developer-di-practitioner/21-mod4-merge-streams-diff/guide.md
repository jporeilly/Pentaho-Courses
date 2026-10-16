# Merge Rows (diff)

> **Warning:**
>
> #### Workshop - Merge Rows (diff)
> 
> **Merge rows (diff)** compares a reference stream (the data you have) with a compare stream (the new data) and flags every row: identical, changed, new or deleted.\
> First you compare two files to see the flags; then you compare a file with a table and let **Synchronize after merge** apply the changes.
> 
> **What you'll do**
> 
> * Sort two streams on their key and compare them with **Merge rows (diff)**
> * Read the four flags
> * Apply the inserts, updates and deletes to a table with **Synchronize after merge**
> * Run it again, and see that nothing changes
> 
> **Prerequisites:** [Review Merge](../topic-mod4-merge-review/guide.md); `STG_ORDERS_MERGED` loaded in [Writing to a Database](../14-mod3-writing-to-a-database/guide.md), Workflow 2 (7 products)
> 
> **Estimated time:** 20 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/cd56088673de462998803583425d0488?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Data Change Capture and Synchronization Process Demonstration" data-description="In this video, I walk you through a data change capture scenario where we manage product data in a database alongside changes from a text file. We utilize the merge rows diff step to identify new, deleted, and changed products, followed by the synchronize after merge step to update our records accordingly. I demonstrate how to configure these steps, including setting up the flag field for operations like inserts, updates, and deletes. Please ensure that your data is sorted by the specified keys before running the transformation. By the end of this process, our product data will be fully synchronized and up to date in the database." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The database version: STG_ORDERS_MERGED and the sorted orders updates feed Merge Rows (diff), which feeds Synchronize after merge](../_assets/images/merge-rows-diff.png)

<div align="center">
<figcaption><em>What you build in Workflow 2</em></figcaption>
</div>
</figure>

> **Note:** **The flags**
> 
> | Flag        | Meaning                                                    | The output row comes from |
> | ----------- | ---------------------------------------------------------- | ------------------------- |
> | `identical` | The key is in both streams and the compared values match   | the compare stream        |
> | `changed`   | The key is in both streams, but a compared value differs   | the compare stream        |
> | `new`       | The key is only in the compare stream                      | the compare stream        |
> | `deleted`   | The key is only in the reference stream                    | the reference stream      |

::::: tabs

### Workflow 1 - Two files

> **Note:**
>
> #### Compare two files
> 
> `orders.txt` is yesterday's product list and `orders_update.txt` today's. Compare them without a database first, to see each flag.

Create a new transformation and save it as `tr_merge_streams_diff.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\01-merge\21-mod4-merge-streams-diff`.

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

2. Add two **Text file input** steps, `orders` for `${Internal.Entry.Current.Directory}/orders.txt` and `orders updates` for `${Internal.Entry.Current.Directory}/orders_update.txt`. In both: **Separator** `;`, **Header** selected, then **Get Fields** (six String fields).
3. After each, add a **Sort rows** on `PRODUCTCODE`, ascending: `Sort orders` and `Sort updates`.
4. From the **Joins** folder, add **Merge rows (diff)**, name it `merge and find diff.`, and hop both **Sort rows** steps to it. Set:
   * **Reference rows origin**: `Sort orders`
   * **Compare rows origin**: `Sort updates`
   * **Flag fieldname**: `FLAG`
   * **Keys to match**: `PRODUCTCODE`
   * **Values to compare**: all six fields (**Get value fields**)
5. Save, run, and preview **merge and find diff.**

> **Success:** Checkpoint: 9 rows, one per product code in either file:
>
> | Flag        | Rows | Products                                                       |
> | ----------- | ---- | -------------------------------------------------------------- |
> | `identical` | 5    | `S10_1678`, `S10_2016`, `S10_4962`, `S12_1099`, `S12_1666`     |
> | `changed`   | 1    | `S10_4698`: the name's year is now 2004, not 2003              |
> | `new`       | 2    | `S10_1949` and `S12_1108`, only in `orders_update.txt`         |
> | `deleted`   | 1    | `S10_4757`, only in `orders.txt`                               |

> **Under the hood:**
>
> #### It's a merge walk, so both sides must be sorted on the key
>
> **Merge rows (diff)** holds one row from the reference stream and
> one from the compare stream and walks both forward in step, like
> merging two sorted lists. Keys equal: compare the value fields, flag
> `identical` or `changed`, advance both. Reference key smaller: that
> key is gone from the new data, flag `deleted`, advance the reference.
> Compare key smaller: flag `new`, advance the compare side. It never
> holds more than the current pair, which is why it copes with any
> volume, and why it assumes order.
>
> Hand it unsorted input and it doesn't fail. It walks past matches it
> can no longer see and flags the same key `deleted` on one side and
> `new` on the other. The dialog warns about exactly this when you
> close it.
>
> **Why it matters:** a **Sort rows** on each input (or `ORDER BY` in
> the source query) is part of this step, not optional polish. Without
> it, a sync turns unchanged rows into a delete plus an insert.

### Workflow 2 - Synchronize a table

> **Note:**
>
> #### Compare a table with a file, then apply the changes
> 
> The reference is now the `STG_ORDERS_MERGED` table, and **Synchronize after merge** turns each flag into an `INSERT`, `UPDATE` or `DELETE` on it.

Create a new transformation and save it as `tr_merge_streams_database_diff.ktr`.

:::: tabs

### 1. Merge rows (diff)

1. Add a **Table input** `STG_ORDERS_MERGED` on the `MySQL:sampledata` connection, sorted by the key:

   ```sql
   SELECT PRODUCTCODE, PRODUCTNAME, PRODUCTLINE, PRODUCTSCALE, PRODUCTVENDOR, PRODUCTDESCRIPTION
   FROM STG_ORDERS_MERGED
   ORDER BY PRODUCTCODE
   ```

2. Add the **Text file input** `orders updates` for `orders_update.txt` and the **Sort rows** `Sort updates` after it, as in Workflow 1.
3. Add **Merge rows (diff)** `Merge Rows (diff)`, with **Reference rows origin** `STG_ORDERS_MERGED`, **Compare rows origin** `Sort updates`, **Flag fieldname** `FLAG`, key `PRODUCTCODE`, and these **Values to compare**: `PRODUCTCODE`, `PRODUCTNAME`, `PRODUCTLINE`, `PRODUCTSCALE`, `PRODUCTVENDOR`.

<figure><img src="../_assets/images/merge-diff-step.png" alt="Merge rows (diff): reference STG_ORDERS_MERGED, compare Sort updates, flag FLAG, key PRODUCTCODE and five value fields" width="563"><figcaption><p>Reference: the table; compare: the file</p></figcaption></figure>

### 2. Synchronize after merge

> **Note:**
>
> #### Synchronize after merge
> 
> **Synchronize after merge** reads the flag on each row and runs the matching statement against the table. Rows flagged `identical` are skipped.

1. From the **Output** folder, add **Synchronize after merge** and hop **Merge Rows (diff)** to it.
2. On the **General** tab set **Connection** `MySQL:sampledata`, **Target table** `STG_ORDERS_MERGED` and **Commit size** `100`.
3. In **The key(s) to look up the value(s)**: **Table field** `PRODUCTCODE`, **Comparator** `=`, **Stream field1** `PRODUCTCODE`.
4. Under **Update fields**, select **Get update fields**, and set **Update** to `N` for `PRODUCTCODE`. As with **Insert / update**, the key stays in the list so that inserts include it, but an update never changes it.

<figure><img src="../_assets/images/sync-after-merge.png" alt="Synchronize after merge General tab: target table STG_ORDERS_MERGED, key PRODUCTCODE, six update fields with PRODUCTCODE set to N" width="563"><figcaption><p>General tab</p></figcaption></figure>

5. On the **Advanced** tab set **Operation fieldname** `FLAG`, **Insert when value equal** `new`, **Update when value equal** `changed`, **Delete when value equal** `deleted`.

<figure><img src="../_assets/images/sync-after-merge-adv.png" alt="Synchronize after merge Advanced tab: operation field FLAG, insert on new, update on changed, delete on deleted" width="563"><figcaption><p>Advanced tab: one flag value per operation</p></figcaption></figure>

> **Note:** The screenshot also sets **Target schema** to `sampledata`; the connection already points at that database, so you can leave it empty.

### 3. Run

1. In your database tool, look at the table first: `SELECT * FROM STG_ORDERS_MERGED ORDER BY PRODUCTCODE;` shows 7 products.

<figure><img src="../_assets/images/stg-orders-orginal.png" alt="STG_ORDERS_MERGED before the sync: 7 products in DBeaver" width="563"><figcaption><p>Before</p></figcaption></figure>

2. Right-click the hop from **Merge Rows (diff)** to **Synchronize after merge** and disable it. Run, and preview **Merge Rows (diff)**: the same flags as Workflow 1.

<figure><img src="../_assets/images/preview-sync-after-merge.png" alt="Preview data of Merge Rows (diff) with the FLAG column"><figcaption><p>The flags, before anything is written</p></figcaption></figure>

3. Enable the hop again and run.
4. Query the table again.

<figure><img src="../_assets/images/sync-after-merge-results.png" alt="STG_ORDERS_MERGED after the sync in DBeaver" width="563"><figcaption><p>After</p></figcaption></figure>

> **Success:** Checkpoint: **Synchronize after merge** shows 2 in **Output** (the inserts) and 2 in **Updated** in **Step Metrics**. The table now holds 8 products: `S10_1949` and `S12_1108` added, `S10_4698` renamed to the 2004 model, `S10_4757` gone.

5. Run it once more. Every row is now `identical`, and nothing is written.

> **Under the hood:**
>
> #### Identical rows never touched the database
>
> **Synchronize after merge** read the flag on each row and mapped it
> straight to a statement: `new` to an `INSERT`, `changed` to an
> `UPDATE ... WHERE PRODUCTCODE = ?`, `deleted` to a `DELETE ... WHERE
> PRODUCTCODE = ?`. Rows flagged `identical` were skipped. Compare that
> with reloading the table: on a typical day most of a feed is
> unchanged, so most of the write traffic disappears.
>
> The step still runs one statement per changed row and commits every
> **Commit size** rows, so its cost scales with the *changes*, not with
> the feed.
>
> **Why it matters:** this pair, diff then synchronize, is change data
> capture with no triggers, no log mining and no vendor feature. Two
> inputs, and the engine works out what changed.

> **Tip:** To repeat Workflow 2 from the start, run the Writing to a Database transformation again: it truncates `STG_ORDERS_MERGED` and reloads the 7 products.

::::

:::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[orders_update.txt](./files/orders_update.txt)

[orders.txt](./files/orders.txt)

### Solution <!-- no-step -->

The finished transformations for this lab. Open them alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\01-merge\21-mod4-merge-streams-diff\solution`.

[tr_merge_streams_database_diff.ktr](./files/tr_merge_streams_database_diff.ktr) <button data-launch="spoon" data-path="files/tr_merge_streams_database_diff.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_streams_database_diff.ktr">View graph</button>

[tr_merge_streams_diff.ktr](./files/tr_merge_streams_diff.ktr) <button data-launch="spoon" data-path="files/tr_merge_streams_diff.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_streams_diff.ktr">View graph</button>

`tr_merge_streams_diff.ktr` compares `orders.txt` with `orders_update.txt` without a database: run it to see the four flags (identical, new, changed, deleted) before you synchronise a table.
