# Merge Join

> **Warning:**
>
> #### Workshop - Merge Join
> 
> **Merge join** joins two streams that are both sorted on the join key, the way a database joins two tables. It supports the four classic join types: INNER, LEFT OUTER, RIGHT OUTER and FULL OUTER.\
> First you compare the four types on two tiny grids; then you join two product files and write the result.
> 
> **What you'll do**
> 
> * Create test data with two **Data grid** steps
> * Join them with **Merge join** and compare the four join types
> * Join two files on `PRODUCTCODE` and write the result with **Text file output**
> 
> **Prerequisites:** [Review Joins](../topic-mod4-joins-review/guide.md)
> 
> **Estimated time:** 20 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/cdbbff783c7549e09cf9fddef5ccefde" data-title="Optimizing Data Integration with Merge Join in Sales Analysis" data-description="In this video, I walk you through the process of loading our fact sales table at Steel Wheels, highlighting the importance of merging data from our fact inventory table to track item fulfillment schedules. We utilize a merge join step to correlate inventory counts with sales data, ensuring both datasets are sorted by item ID and date ID for accuracy. I demonstrate the configuration of the merge join, emphasizing that we are using an inner join for this scenario. Additionally, I explain how we calculate remaining inventory and add a primary key before inserting the data into our new fact sales table. Please ensure you have your incoming data sorted on the specified keys as we move forward with this process." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The overview transformation: the Data grids "A B C D" and "Red Blue Yellow" into Merge Join, then a Dummy step](../_assets/images/merge-join.png)

<div align="center">
<figcaption><em>What you build first</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_merge_join_overview.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\24-mod4-merge-join`.

:::: tabs

### 1. Data grids

> **Note:**
>
> #### Data grid
> 
> **Data grid** holds rows typed into the step itself. Its **Meta** tab defines the fields and their types; its **Data** tab holds the values, typed as text and converted to those types.

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

2. From the **Input** folder, drag two **Data grid** steps onto the canvas and fill them in. Both are already in `id` order, as **Merge join** needs:

| Step              | Meta                                | Data                                |
| ----------------- | ----------------------------------- | ----------------------------------- |
| `A B C D`         | `id` Integer, `value` String        | 1 A, 2 B, 3 C, 4 D                  |
| `Red Blue Yellow` | `id` Integer, `value_2` String      | 1 Red, 3 Blue, 5 Yellow             |

<div align="left"><figure><img src="../_assets/images/abcd-dg.png" alt="The A B C D Data grid: ids 1 to 4 with the values A to D"><figcaption><p>A B C D</p></figcaption></figure> <figure><img src="../_assets/images/red-dg.png" alt="The Red Blue Yellow Data grid: ids 1, 3 and 5 with Red, Blue and Yellow"><figcaption><p>Red Blue Yellow</p></figcaption></figure></div>

### 2. Merge join

> **Note:**
>
> #### Merge join
> 
> **Merge join** takes a *first* and a *second* step, the key fields of each, and a join type.

1. From the **Joins** folder, drag **Merge join** onto the canvas and hop both **Data grid** steps to it.
2. Double-click it and set **First Step** `A B C D`, **Second Step** `Red Blue Yellow`, **Join Type** `INNER`, and `id` in both **Keys for 1st step** and **Keys for 2nd step**.

<figure><img src="../_assets/images/merge-join-2.png" alt="Merge join: first step A B C D, second step Red Blue Yellow, keys id and id" width="375"><figcaption><p>Keys from each side</p></figcaption></figure>

3. From the **Flow** folder, add a **Dummy (do nothing)** after **Merge join**, so you have a step to preview.

> **Warning:** Both inputs must be sorted on the key, and when a key repeats on both sides, every pair is joined, so the rows multiply.

### 3. Compare the join types

> **Note:**
>
> #### Run once per join type
> 
> Change **Join Type** between runs and preview **Dummy (do nothing)** each time. Missing values show as `<null>`.

1. Save, run with **Join Type** `INNER`, and preview **Dummy (do nothing)**.
2. Repeat with `LEFT OUTER`, `RIGHT OUTER` and `FULL OUTER`.

<figure><img src="../_assets/images/inner-join.png" alt="INNER join: ids 1 and 3, with their values from both grids"><figcaption><p>INNER</p></figcaption></figure>

<figure><img src="../_assets/images/left-outer-join.png" alt="LEFT OUTER join: all four rows of A B C D, with nulls where the second grid has no id"><figcaption><p>LEFT OUTER</p></figcaption></figure>

<figure><img src="../_assets/images/right-outer-join.png" alt="RIGHT OUTER join: the three rows of Red Blue Yellow, with nulls for id 5"><figcaption><p>RIGHT OUTER</p></figcaption></figure>

<figure><img src="../_assets/images/full-outer-join.png" alt="FULL OUTER join: five rows, ids 1 to 5, with nulls where either side has no match"><figcaption><p>FULL OUTER</p></figcaption></figure>

> **Success:** Checkpoint: the output has both sides' fields, `id`, `value`, `id_1` and `value_2` (PDI adds `_1` to a second-step field whose name is already taken).
>
> | Join Type     | Rows | Which ids                                                      |
> | ------------- | ---- | -------------------------------------------------------------- |
> | `INNER`       | 2    | 1 and 3, in both grids                                         |
> | `LEFT OUTER`  | 4    | 1 to 4, all of the first grid; 2 and 4 with null `value_2`     |
> | `RIGHT OUTER` | 3    | 1, 3 and 5, all of the second grid; 5 with null `id`, `value`  |
> | `FULL OUTER`  | 5    | 1 to 5, everything from both                                   |

> **Under the hood:**
>
> #### Merge join never buffers a side, which is why both must be sorted
>
> The step keeps exactly one row from each input in hand and walks the
> two streams forward on the join key: equal, emit the combined row
> and advance; otherwise advance whichever side is behind, emitting a
> null-padded row on the way if the join type says so. `INNER` emits
> only matches, `LEFT OUTER` also emits unmatched first-step rows,
> `RIGHT OUTER` unmatched second-step rows, `FULL OUTER` both. Memory
> use is one row per side, whatever the volume.
>
> Two things follow. Both inputs must already be in key order: fed
> unsorted rows, it silently walks past matches. And when a key
> repeats on both sides, the step pairs every first-step row with
> every second-step row for that key: a small cartesian product per
> duplicate.
>
> **Why it matters:** this is the join to reach for when neither side
> fits in memory. Sort both inputs (or `ORDER BY` in the source) and it
> joins two very large files in constant memory.

### 4. Join two files

> **Note:**
>
> #### A real join
> 
> `orders.txt` has each product's name, line, scale and vendor; `description.txt` has its description. Join them into one row per product.

1. Create a second transformation and save it as `tr_merge_join_orders.ktr` in the same folder.
2. Add two **Text file input** steps, `orders` for `${Internal.Entry.Current.Directory}/orders.txt` and `description` for `${Internal.Entry.Current.Directory}/description.txt`: **Separator** `;`, **Header** selected, **Get Fields**. Both files are already sorted on `PRODUCTCODE`; for unsorted files you would add a **Sort rows** before the join.
3. Add **Merge join**: **First Step** `orders`, **Second Step** `description`, **Join Type** `INNER`, key `PRODUCTCODE` on both sides.
4. Add **Select values** `tidy up`. The join brings both files' fields, the second file's with `_1` added where a name repeats. On **Select & Alter**, keep `PRODUCTCODE`, `PRODUCTNAME`, `PRODUCTLINE`, `PRODUCTSCALE`, `PRODUCTVENDOR` and `PRODUCTDESCRIPTION`.
5. Add **Text file output**: **Filename** `${Internal.Entry.Current.Directory}/merged_orders`, **Extension** `txt`; on **Content**, **Separator** `;` and **Header** selected; on **Fields**, **Get Fields**, then **Minimal width**.
6. Save and run.

> **Success:** Checkpoint: `merged_orders.txt` holds a header and 9 products, each with its name, line, scale, vendor and description, and no padded values. Compare it with `merged_orders.txt` in **Lab Files**.

::::

<details>

<summary>Troubleshooting</summary>

**Rows are missing from the result**\
An input isn't sorted on the key. Add a **Sort rows** on the key before **Merge join**, on each side that needs it.

**More rows than expected**\
A key repeats on both sides, and every pair is joined. Check the key is unique on at least one side.

**Values in the output file are followed by spaces**\
Text file output pads to the field lengths. Select **Minimal width** on its **Fields** tab.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[description.txt](./files/description.txt)

[merged_orders.txt](./files/merged_orders.txt)

[orders.txt](./files/orders.txt)

### Solution <!-- no-step -->

The finished transformations for this lab. Open them alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\24-mod4-merge-join\solution`.

[tr_merge_join_orders.ktr](./files/tr_merge_join_orders.ktr) <button data-launch="spoon" data-path="files/tr_merge_join_orders.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_join_orders.ktr">View graph</button>

[tr_merge_join_overview.ktr](./files/tr_merge_join_overview.ktr) <button data-launch="spoon" data-path="files/tr_merge_join_overview.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_join_overview.ktr">View graph</button>
