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

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

---

<div align="center">
<figure>
<img src="../_assets/images/merge-join.png" alt="The overview transformation: the Data grids &quot;A B C D&quot; and &quot;Red Blue Yellow&quot; into Merge Join, then a Dummy step" width="643">
<figcaption>What you build first</figcaption>
</figure>
</div>

:::: tabs

### 1. A B C D

> **Note:**
>
> #### Data grid
> 
> **Data grid** holds rows typed into the step itself. Its **Meta** tab defines the fields and their types; its **Data** tab holds the values, typed as text and converted to those types.

1. Start Spoon with the **Start Pentaho Data Integration** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

<button data-launch="spoon" data-path="">Start Pentaho Data Integration</button>

2. Select **File > New > Transformation** (`Ctrl+N`).
3. Select **File > Save as** and save it as `tr_merge_join_overview.ktr` in `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\24-mod4-merge-join`.

4. On the **Design** tab, open the **Input** folder and drag **Data grid** onto the canvas.
5. Double-click **Data grid**. Set **Step name** to `A B C D`.
6. On the **Meta** tab, fill the grid with two fields:

| Name    | Type      |
| ------- | --------- |
| `id`    | `Integer` |
| `value` | `String`  |

<div align="center">
<figure>
<img src="../_assets/images/merge-join-abcd-meta.png" alt="Data grid Meta tab: step name A B C D, two fields, id of type Integer and value of type String" width="800">
<figcaption>Meta tab: id (Integer) and value (String)</figcaption>
</figure>
</div>

7. Open the **Data** tab and enter four rows:

| id  | value |
| --- | ----- |
| `1` | `A`   |
| `2` | `B`   |
| `3` | `C`   |
| `4` | `D`   |

8. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/abcd-dg.png" alt="The A B C D Data grid: ids 1 to 4 with the values A to D" width="626">
<figcaption>A B C D</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-overview-s1.png" alt="tr_merge_join_overview.ktr on the Spoon canvas after this tab: A B C D" width="140">
<figcaption>The canvas after A B C D</figcaption>
</figure>
</div>


### 2. Red Blue Yellow

> **Note:**
>
> #### Red Blue Yellow
>
> Add and set up **Data grid**.

1. Drag a second **Data grid** onto the canvas. Double-click it and set **Step name** to `Red Blue Yellow`.
2. On the **Meta** tab, fill the grid with two fields:

| Name      | Type      |
| --------- | --------- |
| `id`      | `Integer` |
| `value_2` | `String`  |

3. Open the **Data** tab and enter three rows:

| id  | value_2  |
| --- | -------- |
| `1` | `Red`    |
| `3` | `Blue`   |
| `5` | `Yellow` |

4. Select **OK**.

Both grids are already in `id` order, as **Merge join** needs.

<div align="center">
<figure>
<img src="../_assets/images/red-dg.png" alt="The Red Blue Yellow Data grid: ids 1, 3 and 5 with Red, Blue and Yellow" width="626">
<figcaption>Red Blue Yellow</figcaption>
</figure>
</div>

### 3. Merge join

> **Note:**
>
> #### Merge join
> 
> **Merge join** takes a *first* and a *second* step, the key fields of each, and a join type.

1. On the **Design** tab, open the **Joins** folder and drag **Merge join** onto the canvas.
2. Create a hop from **A B C D** to **Merge join**: hold `Shift` and drag from one step to the other.
3. Create a hop from **Red Blue Yellow** to **Merge join**.
4. Double-click **Merge join** and set:
   * **Step name**: `Merge Join`
   * **First Step**: `A B C D`
   * **Second Step**: `Red Blue Yellow`
   * **Join Type**: `INNER`
5. Enter `id` in the **Key field** column of **Keys for 1st step**, and `id` in the **Key field** column of **Keys for 2nd step**.
6. Select **OK**. If a **Notice** about sorted input appears, select **Close**.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-2.png" alt="Merge join: first step A B C D, second step Red Blue Yellow, keys id and id" width="546">
<figcaption>Keys from each side</figcaption>
</figure>
</div>

7. On the **Design** tab, open the **Flow** folder and drag **Dummy (do nothing)** onto the canvas.
8. Create a hop from **Merge Join** to **Dummy (do nothing)**. It gives you a step to look at the joined rows.

> **Warning:** Both inputs must be sorted on the key, and when a key repeats on both sides, every pair is joined, so the rows multiply.

### 4. Compare the join types

> **Note:**
>
> #### Run once per join type
> 
> Change **Join Type** between runs and look at **Dummy (do nothing)** each time. Missing values show as `<null>`.

1. Save the transformation (`Ctrl+S`).
2. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
3. Select **Dummy (do nothing)** on the canvas and open the **Preview data** tab.

<div align="center">
<figure>
<img src="../_assets/images/inner-join.png" alt="INNER join: ids 1 and 3, with their values from both grids" width="700">
<figcaption>INNER</figcaption>
</figure>
</div>

> **Success:** Checkpoint: 2 rows, ids `1` and `3`, the ids in both grids. The output has both sides' fields, `id`, `value`, `id_1` and `value_2`: Pentaho Data Integration adds `_1` to a second-step field whose name is already taken.

4. Double-click **Merge Join**, set **Join Type** to `LEFT OUTER`, and select **OK**. Then run again and open the **Preview data** tab of **Dummy (do nothing)**.
5. Repeat action 4 with `RIGHT OUTER`, then with `FULL OUTER`.

<div align="center">
<figure>
<img src="../_assets/images/left-outer-join.png" alt="LEFT OUTER join: all four rows of A B C D, with nulls where the second grid has no id" width="700">
<figcaption>LEFT OUTER</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/right-outer-join.png" alt="RIGHT OUTER join: the three rows of Red Blue Yellow, with nulls for id 5" width="700">
<figcaption>RIGHT OUTER</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/full-outer-join.png" alt="FULL OUTER join: five rows, ids 1 to 5, with nulls where either side has no match" width="700">
<figcaption>FULL OUTER</figcaption>
</figure>
</div>

> **Success:** Checkpoint: each join type keeps these rows:
>
> | Join Type     | Rows | Which ids                                                      |
> | ------------- | ---- | -------------------------------------------------------------- |
> | `INNER`       | 2    | 1 and 3, in both grids                                         |
> | `LEFT OUTER`  | 4    | 1 to 4, all of the first grid; 2 and 4 with null `value_2`     |
> | `RIGHT OUTER` | 3    | 1, 3 and 5, all of the second grid; 5 with null `id`, `value`  |
> | `FULL OUTER`  | 5    | 1 to 5, everything from both                                   |

6. Save the transformation (`Ctrl+S`). The solution keeps **Join Type** `FULL OUTER`, as yours now does.

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

### 5. Join two files

> **Note:**
>
> #### A real join
> 
> `orders.txt` has each product's name, line, scale and vendor; `description.txt` has its code and description. Join them into one row per product.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders.png" alt="tr_merge_join_orders.ktr on the Spoon canvas: every step of the solution and the hops between them" width="626">
<figcaption>What you build in this part</figcaption>
</figure>
</div>

1. Select **File > New > Transformation** (`Ctrl+N`).
2. Select **File > Save as** and save it as `tr_merge_join_orders.ktr` in `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\24-mod4-merge-join`.

### 6. orders

> **Note:**
>
> #### orders
>
> Add and set up **Text file input**.

1. On the **Design** tab, open the **Input** folder and drag **Text file input** onto the canvas.
2. Double-click **Text file input**. Set **Step name** to `orders`.
3. On the **File** tab, enter `${Internal.Entry.Current.Directory}/orders.txt` in **File or directory**, then select **Add**.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-orders-file.png" alt="Text file input File tab: step name orders, selected file ${Internal.Entry.Current.Directory}/orders.txt" width="800">
<figcaption>File tab: orders.txt in the selected files</figcaption>
</figure>
</div>

4. On the **Content** tab, set **Separator** to `;`, keep **Header** selected, and set **Format** to `mixed`.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-orders-content.png" alt="Text file input Content tab: filetype CSV, separator semicolon, header with 1 header line, format mixed" width="800">
<figcaption>Content tab: separator ;, header line, format mixed</figcaption>
</figure>
</div>

5. On the **Fields** tab, select **Get Fields**, select **OK** at the number of sample lines, and close the **Scan results**. The grid lists five String fields, `PRODUCTCODE` to `PRODUCTVENDOR`.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-orders-fields.png" alt="Text file input Fields tab for orders: five String fields PRODUCTCODE, PRODUCTNAME, PRODUCTLINE, PRODUCTSCALE and PRODUCTVENDOR" width="800">
<figcaption>Fields tab: five String fields</figcaption>
</figure>
</div>

6. Select **Preview rows**, enter `100` rows, and select **OK**.

> **Success:** Checkpoint: 9 rows, `S10_1678` to `S12_1666`, in `PRODUCTCODE` order.

7. Select **Close**, then **OK**.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders-s2.png" alt="tr_merge_join_orders.ktr on the Spoon canvas after this tab: orders" width="140">
<figcaption>The canvas after orders</figcaption>
</figure>
</div>


### 7. description

> **Note:**
>
> #### description
>
> Add and set up **Text file input**.

1. Drag a second **Text file input** onto the canvas. Double-click it and set **Step name** to `description`.
2. On the **File** tab, enter `${Internal.Entry.Current.Directory}/description.txt` in **File or directory**, then select **Add**.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-description-file.png" alt="Text file input File tab: step name description, selected file ${Internal.Entry.Current.Directory}/description.txt" width="800">
<figcaption>File tab: description.txt in the selected files</figcaption>
</figure>
</div>

3. On the **Content** tab, set **Separator** to `;`, keep **Header** selected, and set **Format** to `mixed`.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-description-content.png" alt="Text file input Content tab for description: filetype CSV, separator semicolon, header with 1 header line, format mixed" width="800">
<figcaption>Content tab: the same settings as orders</figcaption>
</figure>
</div>

4. On the **Fields** tab, select **Get Fields**, select **OK** at the number of sample lines, and close the **Scan results**. The grid lists two String fields, `PRODUCTCODE` and `PRODUCTDESCRIPTION`.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-description-fields.png" alt="Text file input Fields tab for description: two String fields, PRODUCTCODE and PRODUCTDESCRIPTION" width="800">
<figcaption>Fields tab: PRODUCTCODE and PRODUCTDESCRIPTION</figcaption>
</figure>
</div>

5. Select **Preview rows**, enter `100` rows, and select **OK**.

> **Success:** Checkpoint: 9 rows with the same product codes, in the same order, each with its description. Both files are already sorted on `PRODUCTCODE`; for unsorted files you would add a **Sort rows** on each side before the join.

6. Select **Close**, then **OK**.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders-s3.png" alt="tr_merge_join_orders.ktr on the Spoon canvas after this tab: description and orders" width="140">
<figcaption>The canvas after description</figcaption>
</figure>
</div>


### 8. Merge Join

> **Note:**
>
> #### Merge Join
>
> Add and set up **Merge join**.

1. On the **Design** tab, open the **Joins** folder and drag **Merge join** onto the canvas.
2. Create a hop from **orders** to **Merge join**, and another from **description** to **Merge join**.
3. Double-click **Merge join** and set:
    * **Step name**: `Merge Join`
    * **First Step**: `orders`
    * **Second Step**: `description`
    * **Join Type**: `INNER`
4. Enter `PRODUCTCODE` in the **Key field** column of **Keys for 1st step**, and `PRODUCTCODE` in the **Key field** column of **Keys for 2nd step**.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-orders-merge-join.png" alt="Merge join: step name Merge Join, first step orders, second step description, join type INNER, key PRODUCTCODE on both sides" width="546">
<figcaption>Merge Join: PRODUCTCODE on both sides, INNER</figcaption>
</figure>
</div>

5. Select **OK**. If a **Notice** about sorted input appears, select **Close**.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders-s4.png" alt="tr_merge_join_orders.ktr on the Spoon canvas after this tab: Merge Join, description and orders, with the 2 hops between them" width="316">
<figcaption>The canvas after Merge Join</figcaption>
</figure>
</div>


### 9. tidy up

> **Note:**
>
> #### tidy up
>
> Add and set up **Select values**.

1. On the **Design** tab, open the **Transform** folder and drag **Select values** onto the canvas.
2. Create a hop from **Merge Join** to **Select values**.
3. Double-click **Select values**. Set **Step name** to `tidy up`.
4. On the **Select & Alter** tab, select **Get fields to select**. The join brings both files' fields: the grid lists `PRODUCTCODE`, `PRODUCTNAME`, `PRODUCTLINE`, `PRODUCTSCALE`, `PRODUCTVENDOR`, `PRODUCTCODE_1` and `PRODUCTDESCRIPTION`.
5. Right-click the `PRODUCTCODE_1` row and select **Delete selected lines**. These six remain:

| #   | Fieldname            |
| --- | -------------------- |
| 1   | `PRODUCTCODE`        |
| 2   | `PRODUCTNAME`        |
| 3   | `PRODUCTLINE`        |
| 4   | `PRODUCTSCALE`       |
| 5   | `PRODUCTVENDOR`      |
| 6   | `PRODUCTDESCRIPTION` |

<div align="center">
<figure>
<img src="../_assets/images/merge-join-tidy-up.png" alt="Select values Select and Alter tab: step name tidy up, six fields PRODUCTCODE, PRODUCTNAME, PRODUCTLINE, PRODUCTSCALE, PRODUCTVENDOR and PRODUCTDESCRIPTION" width="698">
<figcaption>tidy up: six fields, PRODUCTCODE_1 deleted</figcaption>
</figure>
</div>

6. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders-s5.png" alt="tr_merge_join_orders.ktr on the Spoon canvas after this tab: Merge Join, description, orders and tidy up, with the 3 hops between them" width="444">
<figcaption>The canvas after tidy up</figcaption>
</figure>
</div>


### 10. Text file output

> **Note:**
>
> #### Text file output
>
> Add and set up **Text file output**.

1. On the **Design** tab, open the **Output** folder and drag **Text file output** onto the canvas.
2. Create a hop from **tidy up** to **Text file output**.
3. Double-click **Text file output**. On the **File** tab, set **Filename** to `${Internal.Entry.Current.Directory}/merged_orders`, and keep **Extension** at `txt`.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-output-file.png" alt="Text file output File tab: filename ${Internal.Entry.Current.Directory}/merged_orders, extension txt" width="800">
<figcaption>File tab: merged_orders, extension txt</figcaption>
</figure>
</div>

4. On the **Content** tab, keep **Separator** at `;` and **Header** selected.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-output-content.png" alt="Text file output Content tab: separator semicolon, header selected, format CR+LF terminated (Windows, DOS)" width="800">
<figcaption>Content tab: separator ;, header selected</figcaption>
</figure>
</div>

5. On the **Fields** tab, select **Get Fields**, then **Minimal width**.

<div align="center">
<figure>
<img src="../_assets/images/merge-join-output-fields.png" alt="Text file output Fields tab: six String fields PRODUCTCODE to PRODUCTDESCRIPTION with no format or length after Minimal width" width="800">
<figcaption>Fields tab: six fields, minimal width</figcaption>
</figure>
</div>

6. Select **OK**.
7. Save the transformation (`Ctrl+S`).
8. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
9. In **Execution Results**, open the **Step Metrics** tab.

> **Success:** Checkpoint: **Merge Join** shows 18 in **Read** and 9 in **Written**, and **Text file output** shows 9 in **Read** and 10 in **Output**: the header line and 9 products.

10. Open `merged_orders.txt` in the lab folder in a text editor.

> **Success:** Checkpoint: `merged_orders.txt` holds a header and 9 products, each with its name, line, scale, vendor and description, and no padded values. It matches `solution\merged_orders.txt`, the reference copy in the lab's `solution` folder.

<div align="center">
<figure>
<img src="../_assets/images/canvas-24-tr-merge-join-orders-s6.png" alt="tr_merge_join_orders.ktr on the Spoon canvas after this tab: Merge Join, Text file output, description, orders and tidy up, with the 4 hops between them" width="588">
<figcaption>The canvas after Text file output</figcaption>
</figure>
</div>


::::

## Troubleshooting <!-- no-step -->

<details>

<summary>Rows are missing from the result</summary>

An input isn't sorted on the key. Add a **Sort rows** on the key before **Merge join**, on each side that needs it.

</details>

<details>

<summary>More rows than expected</summary>

A key repeats on both sides, and every pair is joined. Check the key is unique on at least one side.

</details>

<details>

<summary>Values in the output file are followed by spaces</summary>

Text file output pads to the field lengths. Select **Minimal width** on its **Fields** tab.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

[description.txt](./files/description.txt)

[merged_orders.txt](./files/merged_orders.txt)

[orders.txt](./files/orders.txt)

### Solution <!-- no-step -->

The finished transformations for this lab. Open them alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\24-mod4-merge-join\solution`.

[tr_merge_join_orders.ktr](./files/tr_merge_join_orders.ktr) <button data-launch="spoon" data-path="files/tr_merge_join_orders.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_join_orders.ktr">View graph</button>

[tr_merge_join_overview.ktr](./files/tr_merge_join_overview.ktr) <button data-launch="spoon" data-path="files/tr_merge_join_overview.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_merge_join_overview.ktr">View graph</button>
