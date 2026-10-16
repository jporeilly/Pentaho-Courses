# Excel Writer

> **Warning:**
>
> #### Workshop - Excel Writer
> 
> Excel reports often need templates, charts, and fixed layouts.
> 
> Here you fill in a pre-formatted Sales and Expenses report: three sections written into one workbook, in an order you control so the writers never collide.
> 
> **What you'll do**
> 
> * Use a template workbook and write to fixed cell positions
> * Write a report header with **Generate rows**
> * Read sales and expense rows from text files
> * Block parallel flows before writing to the same file
> * Write multiple sections with **Microsoft Excel writer**
> 
> **Prerequisites:** [Text File Input](../06-mod3-text-file-input/guide.md), and Microsoft Excel or another spreadsheet application that opens `.xlsx` files, to look at the template and the finished report.
> 
> **Estimated time:** 45 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/770dd4bae75049eeab247bec2bf6fbcc?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Advanced Excel File Creation with Microsoft Excel Writer Step 📊" data-description="In this video, I demonstrate the advanced features of the Microsoft Excel Writer Step, focusing on how to create a formatted Excel file using a template, comments, hyperlinks, and formulas. We will be generating a fictional report that includes a logo, a hyperlink to documentation, and arbitrary numbers to illustrate how to insert formulas, specifically a running total. I guide you through the transformation process, including configuring the necessary steps and fields. I encourage you to follow along and replicate this process in your own projects. By the end, you'll see how the final Excel file matches our template design and includes all the required elements." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The finished transformation: three branches - year, sales and expenses - each writing to the same workbook](../_assets/images/excel.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

::::: tabs

### 1. Excel Template

> **Note:**
>
> #### Excel template
> 
> Every branch of the transformation writes into a copy of `template.xlsx`. The template has two worksheets:
> 
> * **Sales Chart** - a 3D stacked chart
> * **SourceData** - the cells the chart reads. The transformation writes only these.

1. Open `template.xlsx` from the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\10-mod3-excel-writer`, in your spreadsheet application, and look at both sheets:

<figure><img src="../_assets/images/blank-template.png" alt="The Sales Chart sheet of the template, with an empty chart"><figcaption><p>Sales Chart: the chart, still empty</p></figcaption></figure>

<figure><img src="../_assets/images/blank-sourcedata.png" alt="The SourceData sheet: labels, formulas and empty data cells"><figcaption><p>SourceData: labels and formulas, no numbers yet</p></figcaption></figure>

> **Success:** Checkpoint: on **SourceData**, the data cells are empty, so for each product line and expense the **6-MONTH TOTAL** column shows `0.00€` and the **MEAN** column shows `#DIV/0!`.

2. Close `template.xlsx` without saving it.

> **Note:** **SourceData** already has the row and column labels, the totals and the formulas. You write only the numbers: the year into `B1`, sales into `B5:G8`, expenses into `B13:G18`.

### 2. Write Year

> **Note:**
>
> #### Write year
> 
> The first branch writes the report year into `SourceData`, creating the output file from the template.

<figure><img src="../_assets/images/excel-year.png" alt="The year branch: Generate Rows hopped to Microsoft Excel Writer" width="375"><figcaption><p>The year branch</p></figcaption></figure>

:::: tabs

### 1. Generate Rows - Year

> **Note:**
>
> #### Generate rows - year
> 
> **Generate rows** outputs a fixed number of rows. Here it outputs one row holding the report year.

1. Start Spoon with the **Start PDI** button below, or from a terminal:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./spoon.sh
```

:::

<button data-launch="spoon" data-path="">Start PDI</button>

2. Select **File > New > Transformation** (`Ctrl+N`).
3. Select **File > Save as** and save it as `tr_write_excel.ktr` in `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\10-mod3-excel-writer`, next to `template.xlsx`.
4. On the **Design** tab, open the **Input** folder and drag **Generate rows** onto the canvas.
5. Double-click **Generate rows**. Set **Step name** to `Generate Year`.
6. Set **Limit** to `1`.
7. Fill the **Fields** grid with one field:

   | Name | Type | Format | Value |
   | --- | --- | --- | --- |
   | `year` | Date | `yyyy` | `2023` |

<figure><img src="../_assets/images/gr-year.png" alt="Generate Rows with one Date field, year, formatted yyyy, value 2023"><figcaption><p>One row: the year</p></figcaption></figure>

8. Select **OK**.

> **Note:** `year` is a Date, read from `2023` with the format `yyyy`. Cell `B1` in the template is formatted `yyyy` too, so Excel shows the year rather than a full date.

9. Select **Generate Year** on the canvas, press `F10` (**Action > Preview**), and select **Quick Launch**. The rows show in **Examine preview data**.

> **Success:** Checkpoint: 1 row, with `year` `2023`.

10. Select **Close**.

### 2. Excel Writer - Year

> **Note:**
>
> #### Excel Writer - year
> 
> **Microsoft Excel writer** writes incoming rows into a workbook. Use the `xlsx` format when you work with templates and charts.

1. On the **Design** tab, open the **Output** folder and drag **Microsoft Excel writer** onto the canvas.
2. Create a hop from **Generate Year** to **Microsoft Excel writer**: hold `Shift` and drag from one step to the other.
3. Double-click **Microsoft Excel writer**. Set **Step name** to `Write Year`.
4. On the **File & Sheet** tab, enter these settings:

   | Setting | Value |
   | --- | --- |
   | **Filename** | `${Internal.Entry.Current.Directory}/Sales_and_Expenses_2023` |
   | **Extension** | **xlsx [Excel 2007 and above]** (the step adds `.xlsx`; don't type it in the file name too, or you get `.xlsx.xlsx`) |
   | **If output file exists** | **replace with new output file** (the default): a fresh copy every run |
   | **Wait for first row before creating file** | cleared (the default) |
   | **Add filenames to result** | cleared |
   | **Sheet name** | `SourceData` |
   | **Make this the active sheet** | cleared |
   | **If sheet exists in output file** | **write to existing sheet** |
   | **Use template when creating new files** | selected |
   | **Template file** | `${Internal.Entry.Current.Directory}/template.xlsx` |

<figure><img src="../_assets/images/excel-writer-year.png" alt="Excel writer File and Sheet tab: output file, SourceData sheet and the template"><figcaption><p>A new file from the template, every run</p></figcaption></figure>

5. Open the **Content** tab and enter these settings:

   | Setting | Value |
   | --- | --- |
   | **Start writing at cell** | `B1` |
   | **When writing rows** | **overwrite existing cells** (the default) |
   | **Write Header** | cleared |
   | **Force formula recalculation** | selected |
   | **Leave styles of existing cells unchanged** | selected |

   **Force formula recalculation** makes the step evaluate every formula in the workbook before it saves the file, so the totals hold values computed from your numbers instead of the template's cached `0` and `#DIV/0!`. **Leave styles of existing cells unchanged** keeps the template's cell formats, such as `yyyy` on `B1` and the euro format on the data cells.

<figure><img src="../_assets/images/excel-writer-content.png" alt="Excel writer Content tab: start writing at cell B1, overwrite existing cells, Force formula recalculation and Leave styles of existing cells unchanged selected, and the year field in the Fields grid"><figcaption><p>The year goes in B1</p></figcaption></figure>

6. Under **Fields**, select **Get Fields**. The grid lists one field, `year`, a Date.
7. Select **OK**.

> **Under the hood:**
>
> #### The template's chart survives because the writer edits cells, not files
>
> **Microsoft Excel writer** opened `template.xlsx` with Apache POI,
> the Java library that understands the `.xlsx` object model. It
> copied the workbook — sheets, styles, and the chart on *Sales
> Chart* — into the output file, located the cell you named, and wrote
> the year into it. Everything it didn't touch is preserved.
>
> The chart itself contains no data. It holds *references* to ranges
> on *SourceData*, so when Excel opens the finished file and
> recalculates, the chart draws whatever the transformation put in
> those ranges. That is why the template can be designed entirely in
> Excel by someone who never opens Spoon.
>
> **Why it matters:** the presentation layer — formatting, formulas,
> charts, logos — lives in the template, owned by the report's
> consumer. The transformation only ever supplies numbers, so a
> restyle never touches the pipeline.

::::

### 3. Write Sales

> **Note:**
>
> #### Write sales
> 
> Write the sales rows into the same workbook. A blocking step makes sure the year write has finished first.

<figure><img src="../_assets/images/write-sales.png" alt="The sales branch: Text file input, Block this step until steps finish, Microsoft Excel Writer" width="375"><figcaption><p>The sales branch</p></figcaption></figure>

::: tabs

### 1. Text File Input - Read Sales

> **Note:**
>
> #### Text file input - read sales
> 
> Read the sales figures: one row per product line, one column per month.

1. On the **Design** tab, open the **Input** folder and drag **Text file input** onto the canvas.
2. Double-click **Text file input**. Set **Step name** to `Read Sales`.
3. On the **File** tab, enter `${Internal.Entry.Current.Directory}/sales.txt` in **File or directory** and select **Add**.

<figure><img src="../_assets/images/tfi-sales.png" alt="Text file input File tab with sales.txt in the selected files"><figcaption><p>The sales file</p></figcaption></figure>

4. Open the **Content** tab. Set **Separator** to `,`, and keep **Header** selected with **Number of header lines** `1`, and **No empty rows** selected.
5. Set **Format** to `mixed` and **Encoding** to `UTF-8`.

<figure><img src="../_assets/images/tfi-content.png" alt="Content tab: comma separator, header and no empty rows selected, format mixed, encoding UTF-8"><figcaption><p>Comma-separated, with a header</p></figcaption></figure>

6. Open the **Fields** tab and select **Get Fields**. In the **Sample data** dialog, keep `100` in **Number of lines to sample** and select **OK**. Close the **Scan results** window if it opens.
7. Check the grid against this table. The names come from the file's header line:

   | Name | Type | Format | Length | Precision | Trim type |
   | --- | --- | --- | --- | --- | --- |
   | `productline` | String | | `12` | | none |
   | `m_january` | Number | `#.#` | `8` | `2` | none |
   | `m_february` | Number | `#.#` | `8` | `2` | none |
   | `m_march` | Number | `#.#` | `8` | `2` | none |
   | `m_april` | Number | `#.#` | `8` | `2` | none |
   | `m_may` | Number | `#.#` | `8` | `2` | none |
   | `m_june` | Number | `#.#` | `8` | `2` | **both** |

8. In the `m_june` row, set **Trim type** to `both` if it shows `none`. The last line of `sales.txt` ends with a space after `667.49`, and no line break; trimming removes the space before PDI converts the text to a Number.
9. Select **Preview rows**, enter `100` rows, and select **OK**. The rows show in **Examine preview data**.

> **Success:** Checkpoint: 4 rows, `Classic Cars`, `Motorcycles`, `Trains` and `Planes`, each with six monthly figures.

10. Select **Close**, then select **OK** to close **Read Sales**.

### 2. Block until Step Finish - Wait Year

> **Note:**
>
> #### Block until steps finish - wait year
> 
> This step holds its rows back until the steps you list have finished. Use it to stop two writers working on one file at once.

1. On the **Design** tab, open the **Flow** folder and drag **Block this step until steps finish** onto the canvas.
2. Create a hop from **Read Sales** to **Block this step until steps finish**.
3. Double-click **Block this step until steps finish**. Set **Step name** to `Wait For Year`.
4. In the **Watch the following steps** grid, set **Step name** to `Write Year` and **Copy Nr** to `0`. If you used **Get steps** instead, delete every row except `Write Year`.

<figure><img src="../_assets/images/block-year.png" alt="The Block this step until steps finish dialog watching Write Year"><figcaption><p>Wait for Write Year</p></figcaption></figure>

5. Select **OK**. The sales rows now wait here until **Write Year** has finished.

> **Under the hood:**
>
> #### Blocking works through back-pressure, not by pausing threads
>
> **Block this step until steps finish** doesn't suspend anything.
> When the transformation starts, its thread doesn't take any
> rows from its input; instead it polls the status of the step you
> listed — the year writer — until that step reports finished. Only
> then does it start reading, and every row it reads passes straight
> through unchanged.
>
> Meanwhile **Read Sales** keeps running. It fills the row set between
> the two steps (10,000 rows by default), then blocks on the full
> buffer — the same back-pressure that governs every hop. Nothing is
> copied or buffered specially; the pipeline stalls at that point
> until the gate opens.
>
> **Why it matters:** the year cell is guaranteed to be written before
> the sales writer opens the same workbook, without a job, a second
> transformation or a sleep. Whenever two writers must not overlap —
> same file, same table after a truncate — this one step is the
> ordering primitive.

### 3. Excel Writer - Write Sales

> **Note:**
>
> #### Excel Writer - write sales
> 
> Write the sales rows into the workbook the year writer created.

1. On the **Design** tab, open the **Output** folder and drag **Microsoft Excel writer** onto the canvas.
2. Create a hop from **Wait For Year** to **Microsoft Excel writer**.
3. Double-click **Microsoft Excel writer**. Set **Step name** to `Write Sales`.
4. On the **File & Sheet** tab, enter these settings:

   | Setting | Value |
   | --- | --- |
   | **Filename** | `${Internal.Entry.Current.Directory}/Sales_and_Expenses_2023` (the same file) |
   | **Extension** | **xlsx [Excel 2007 and above]** |
   | **If output file exists** | **Use existing file for writing** |
   | **Wait for first row before creating file** | selected |
   | **Add filenames to result** | selected (the default) |
   | **Sheet name** | `SourceData` |
   | **Make this the active sheet** | cleared |
   | **If sheet exists in output file** | **write to existing sheet** |
   | **Use template when creating new files** | cleared (the default) |

   **Wait for first row before creating file** makes the step open the workbook only when its first row arrives, and **Wait For Year** holds that row back until **Write Year** has created the file.

<figure><img src="../_assets/images/excel-writer-sales.png" alt="Excel writer File and Sheet tab reusing the existing output file, with Wait for first row before creating file selected"><figcaption><p>Reuse the file the year writer made</p></figcaption></figure>

> **Note:** The screenshots of **Write Sales** and **Write Expenses** show `${Internal.Transformation.Filename.Directory}` in **Filename**. When you run a saved transformation from Spoon, it names the same folder, but use `${Internal.Entry.Current.Directory}`, as the table shows, in all three writers.

5. Open the **Content** tab and enter these settings:

   | Setting | Value |
   | --- | --- |
   | **Start writing at cell** | `B5` |
   | **When writing rows** | **overwrite existing cells** (the default) |
   | **Write Header** | cleared |
   | **Force formula recalculation** | selected |
   | **Leave styles of existing cells unchanged** | selected |

<figure><img src="../_assets/images/excel-writer-content-1.png" alt="Excel writer Content tab starting at cell B5, with the six monthly fields in the Fields grid"><figcaption><p>Sales start at B5</p></figcaption></figure>

6. Under **Fields**, select **Get Fields**. The grid lists `productline` and the six months, each with a **Format** such as `000000.00`.
7. Delete the `productline` row: select it, right-click, and select **Delete selected lines**. The template already has the product line names in column A, so you write only the six months, into `B5:G8`.
8. Select **OK**.

:::

### 4. Write Expenses

> **Note:**
>
> #### Write expenses
> 
> Write the expense rows into the same workbook, after the sales write has finished. The branch is built like the sales one.

<figure><img src="../_assets/images/write-expenses.png" alt="The expenses branch: Text file input, Block this step until steps finish, Microsoft Excel Writer" width="375"><figcaption><p>The expenses branch</p></figcaption></figure>

::: tabs

### 1.  Text File Input - Read Expenses

> **Note:**
>
> #### Text file input - read expenses
> 
> Read the expense figures: one row per expense type, one column per month.

1. On the **Design** tab, open the **Input** folder and drag **Text file input** onto the canvas.
2. Double-click **Text file input**. Set **Step name** to `Read Expenses`.
3. On the **File** tab, enter `${Internal.Entry.Current.Directory}/expenses.txt` in **File or directory** and select **Add**.

<figure><img src="../_assets/images/tfi-expenses.png" alt="Text file input File tab with expenses.txt in the selected files"><figcaption><p>The expenses file</p></figcaption></figure>

4. Open the **Content** tab. Set **Separator** to `,`, and keep **Header** selected with **Number of header lines** `1`, and **No empty rows** selected.
5. Set **Format** to `mixed` and **Encoding** to `UTF-8`.

<figure><img src="../_assets/images/tfi-content-expenses.png" alt="Content tab for expenses.txt: comma separator, one header line, no empty rows, format mixed, encoding UTF-8"><figcaption><p>Same layout as sales</p></figcaption></figure>

6. Open the **Fields** tab and select **Get Fields**. In the **Sample data** dialog, keep `100` in **Number of lines to sample** and select **OK**. Close the **Scan results** window if it opens.
7. Check the grid against this table. Every **Trim type** is `none`:

   | Name | Type | Format | Length | Precision |
   | --- | --- | --- | --- | --- |
   | `expense_type` | String | | `13` | |
   | `m_january` | Number | `#.#` | `8` | `2` |
   | `m_february` | Number | `#.#` | `8` | `2` |
   | `m_march` | Number | `#.#` | `8` | `2` |
   | `m_april` | Number | `#.#` | `7` | `2` |
   | `m_may` | Number | `#.#` | `7` | `2` |
   | `m_june` | Number | `#.#` | `8` | `2` |

<figure><img src="../_assets/images/tfi-field-expenses.png" alt="Fields tab: expense_type and six monthly Number fields"><figcaption><p>Seven fields</p></figcaption></figure>

8. Select **Preview rows**, enter `100` rows, and select **OK**. The rows show in **Examine preview data**.

> **Success:** Checkpoint: 6 rows, from `Advertising` to `Overhead`.

9. Select **Close**, then select **OK** to close **Read Expenses**.

### 2. Block until Step finish - Sales

> **Note:**
>
> #### Block until steps finish - wait sales
> 
> Hold the expense rows until the sales write has finished.

1. On the **Design** tab, open the **Flow** folder and drag **Block this step until steps finish** onto the canvas.
2. Create a hop from **Read Expenses** to **Block this step until steps finish**.
3. Double-click **Block this step until steps finish**. Set **Step name** to `Wait For Sales`.
4. In the **Watch the following steps** grid, set **Step name** to `Write Sales` and **Copy Nr** to `0`.

<figure><img src="../_assets/images/block-expenses.png" alt="The Block dialog watching Write Sales"><figcaption><p>Wait for Write Sales</p></figcaption></figure>

5. Select **OK**.

### 3. Excel Writer - Expenses

> **Note:**
>
> #### Excel Writer - Expenses
> 
> Write the expenses to `SourceData`, starting at `B13`.

1. On the **Design** tab, open the **Output** folder and drag **Microsoft Excel writer** onto the canvas.
2. Create a hop from **Wait For Sales** to **Microsoft Excel writer**.
3. Double-click **Microsoft Excel writer**. Set **Step name** to `Write Expenses`.
4. On the **File & Sheet** tab, enter these settings. They are the same as **Write Sales**, except **Add filenames to result**:

   | Setting | Value |
   | --- | --- |
   | **Filename** | `${Internal.Entry.Current.Directory}/Sales_and_Expenses_2023` (the same file) |
   | **Extension** | **xlsx [Excel 2007 and above]** |
   | **If output file exists** | **Use existing file for writing** |
   | **Wait for first row before creating file** | selected |
   | **Add filenames to result** | cleared |
   | **Sheet name** | `SourceData` |
   | **Make this the active sheet** | cleared |
   | **If sheet exists in output file** | **write to existing sheet** |
   | **Use template when creating new files** | cleared (the default) |

<figure><img src="../_assets/images/excel-writer-expenses.png" alt="Excel writer File and Sheet tab for the expenses writer"><figcaption><p>The same file and sheet</p></figcaption></figure>

5. Open the **Content** tab and enter these settings:

   | Setting | Value |
   | --- | --- |
   | **Start writing at cell** | `B13` |
   | **When writing rows** | **overwrite existing cells** (the default) |
   | **Write Header** | cleared |
   | **Force formula recalculation** | selected |
   | **Leave styles of existing cells unchanged** | selected |

6. Under **Fields**, select **Get Fields**, then delete the `expense_type` row: select it, right-click, and select **Delete selected lines**. The six months go into `B13:G18`.

<figure><img src="../_assets/images/excel-writer-expenses-fields.png" alt="Excel writer Content tab starting at B13 with the six monthly fields"><figcaption><p>Expenses start at B13</p></figcaption></figure>

7. Select **OK**.

:::

### 5. Run

> **Note:**
>
> #### Run the transformation
> 
> All three branches start together; the two blocking steps put the writes in order: year, then sales, then expenses.

1. Save the transformation (`Ctrl+S`).
2. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
3. In **Execution Results**, open the **Step Metrics** tab.

> **Success:** Checkpoint: **Write Year** shows 1 in **Output**, **Write Sales** 4 and **Write Expenses** 6: one row for the year, one for each product line in `sales.txt`, one for each expense type in `expenses.txt`.

4. Open `Sales_and_Expenses_2023.xlsx` from the lab folder in your spreadsheet application, and open the **SourceData** sheet.

<figure><img src="../_assets/images/excel-template.jpg" alt="The finished workbook with the chart drawn from the written figures"><figcaption><p>The finished report</p></figcaption></figure>

> **Success:** Checkpoint: `B1` shows `2023`, the sales fill `B5:G8` and the expenses `B13:G18`, and the totals are computed:
>
> | Cell | Holds | Value |
> | --- | --- | --- |
> | `B5` | Classic Cars, January | `23,455.22€` |
> | `H5` | Classic Cars, 6-month total | `132,463.11€` |
> | `B10` | Total Sales, January | `36,886.84€` |
> | `B19` | Total Expenses, January | `13,500.10€` |
> | `B21` | Profit, January | `23,386.74€` |
>
> The **Sales Chart** sheet draws the four product lines for the six months.

5. Close the workbook before you run the transformation again: while your spreadsheet application has the file open, PDI can't replace it.

:::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and press `Ctrl+O`, `Ctrl+V`, `Enter`.

[expenses.txt](./files/expenses.txt)

`Sales_and_Expenses_2017.xlsx` is a finished example of the report, for comparison:

[Sales_and_Expenses_2017.xlsx](./files/Sales_and_Expenses_2017.xlsx)

[sales.txt](./files/sales.txt)

[template.xlsx](./files/template.xlsx)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\10-mod3-excel-writer\solution`.

[tr_write_excel.ktr](./files/tr_write_excel.ktr) <button data-launch="spoon" data-path="files/tr_write_excel.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_write_excel.ktr">View graph</button>
