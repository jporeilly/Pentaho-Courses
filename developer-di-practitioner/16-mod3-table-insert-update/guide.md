# Table Insert - Update

> **Warning:**
>
> #### Workshop - Table Insert - Update
> 
> Apply a file of employees to the `EMPLOYEES` table. Two are already in the table and two are new.\
> One step handles both: it updates the rows it finds and inserts the rest. This is an **upsert**.
> 
> **What you’ll do**
> 
> * Read the employee feed with **Text file input**
> * Upsert into `EMPLOYEES` with **Insert / update**
> * Decide which columns an update may change
> * Check the inserted and updated rows with SQL
> 
> **Prerequisites**
> 
> * [Table Update](../15-mod3-table-update/guide.md): the same file layout and field mapping
> * The `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> 
> **Estimated time:** 25 minutes

<figure>

![The finished transformation: Text File Input hopped to Insert / Update Employees](../_assets/images/insert-update-2.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Select **File > New > Transformation**, or press `Ctrl+N` (`Cmd+N` on macOS). Save it as `tr_employee_insert_update.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\16-mod3-table-insert-update`, next to `employees_insert_update.txt`.

:::: tabs

### 1. Text file input

> **Note:**
>
> #### Text file input
> 
> Read the feed from `employees_insert_update.txt`: a header line and four employees. It has the same columns as the Table Update file.

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

2. From the **Input** folder, drag **Text file input** onto the canvas.
3. Double-click the step. On the **File** tab, in **File or directory**, enter the path below and select **Add**:

   ```text
   ${Internal.Entry.Current.Directory}/employees_insert_update.txt
   ```

<figure><img src="../_assets/images/insert-update-1.png" alt="Text file input File tab with employees_insert_update.txt in the selected files"><figcaption><p>The file</p></figcaption></figure>

4. On the **Content** tab, set **Separator** to `,` and keep **Header** selected, with **Number of header lines** `1`.

<figure><img src="../_assets/images/tfi-content-update.png" alt="Content tab with a comma separator and one header line" width="563"><figcaption><p>Comma separator, one header line</p></figcaption></figure>

5. On the **Fields** tab, select **Get Fields**, then **OK** at the number of sample lines, and close the **Scan results**.
6. Check the eight fields: `EMPLOYEE_NUMBER`, `LASTNAME`, `FIRSTNAME`, `EXT`, `EMAIL`, `OFFICE`, `REPORTS` and `TITLE`. `EMPLOYEE_NUMBER`, `OFFICE` and `REPORTS` are Integer; the rest are String.

<figure><img src="../_assets/images/insert-update-fields.png" alt="Fields tab with the eight fields from EMPLOYEE_NUMBER to TITLE"><figcaption><p>Eight fields</p></figcaption></figure>

7. Select **Preview rows**, then **OK**.
8. Close the preview and select **OK**.

> **Success:** Checkpoint: the preview shows 4 rows: employees `1188`, `1619`, `1810` and `1811`.

### 2. Insert / update

> **Note:**
>
> #### Insert / update
> 
> **Insert / update** looks each row up by its key. A row it finds is updated; a row it doesn't find is inserted.

1. From the **Output** folder, drag **Insert / update** onto the canvas.
2. Hop **Text file input** to **Insert / update**.
3. Double-click the step and set:
   * **Step name**: `Insert / Update Employees`
   * **Connection**: `MySQL:sampledata`
   * **Target table**: `EMPLOYEES`
   * **Commit size**: `100`
4. In **The key(s) to look up the value(s)**, enter one row:

| Table field      | Comparator | Stream field1     |
| ---------------- | ---------- | ----------------- |
| `EMPLOYEENUMBER` | `=`        | `EMPLOYEE_NUMBER` |

5. Under **Update fields**, select **Get update fields**, then make the list match the table below. Correct the four names that differ, and set **Update** to `N` for `EMPLOYEENUMBER`:

| Table field      | Stream field      | Update |
| ---------------- | ----------------- | ------ |
| `LASTNAME`       | `LASTNAME`        | `Y`    |
| `FIRSTNAME`      | `FIRSTNAME`       | `Y`    |
| `EXTENSION`      | `EXT`             | `Y`    |
| `EMAIL`          | `EMAIL`           | `Y`    |
| `EMPLOYEENUMBER` | `EMPLOYEE_NUMBER` | `N`    |
| `OFFICECODE`     | `OFFICE`          | `Y`    |
| `REPORTSTO`      | `REPORTS`         | `Y`    |
| `JOBTITLE`       | `TITLE`           | `Y`    |

<figure><img src="../_assets/images/insert-update.png" alt="Insert / update with the EMPLOYEENUMBER key and eight update fields, EMPLOYEENUMBER set to Update N" width="563"><figcaption><p>Key and update fields</p></figcaption></figure>

> **Warning:** Keep `EMPLOYEENUMBER` in **Update fields**. This step builds its `INSERT` from that list, so without it the new employees have no employee number and MySQL rejects them: "Field 'EMPLOYEENUMBER' doesn't have a default value". **Update** `N` means the column is written on insert and never changed on update.

6. Select **OK**.

### 3. Run and validate

> **Note:**
>
> #### Run and validate
> 
> Run the transformation, then check the results in the database.

1. Save the transformation, select **Run** in the toolbar, then **Run** in **Run Options**.
2. In **Execution Results**, open **Step Metrics**.

<figure><img src="../_assets/images/results-update-insert.png" alt="Step Metrics: Insert / Update Employees read 4 rows, output 2 and updated 2"><figcaption><p>2 inserted, 2 updated</p></figcaption></figure>

> **Success:** Checkpoint: **Insert / Update Employees** shows 2 in **Output** (the inserts, `1810` and `1811`) and 2 in **Updated** (`1188` and `1619`).

3. In your database tool, check the four employees and the row count:

   ```sql
   SELECT EMPLOYEENUMBER, FIRSTNAME, EXTENSION, JOBTITLE
   FROM EMPLOYEES
   WHERE EMPLOYEENUMBER IN (1188, 1619, 1810, 1811);

   SELECT COUNT(*) FROM EMPLOYEES;
   ```

<figure><img src="../_assets/images/insert-update-db.png" alt="The four employees in DBeaver after the upsert"><figcaption><p>Two updated, two new</p></figcaption></figure>

> **Success:** Checkpoint: `EMPLOYEES` holds 25 rows, 2 more than it shipped with.
>
> | `EMPLOYEENUMBER` | What happened                                                          |
> | ---------------- | ---------------------------------------------------------------------- |
> | `1188`           | Updated: `Julie` is now `Julianne`, extension `x2174`, `Sales Manager` |
> | `1619`           | Updated: extension `x103` is now `x6324`                               |
> | `1810`           | Inserted: Anna Lundberg, `Sales Rep`                                   |
> | `1811`           | Inserted: Chris Schulz, `Sales Rep`                                    |

4. Run the transformation again. **Output** and **Updated** are both 0: every row is found, and nothing differs.

> **Under the hood:**
>
> #### Insert / update isn't a MERGE statement
>
> MySQL has `INSERT ... ON DUPLICATE KEY UPDATE`; other databases have
> `MERGE`. This step uses neither, because it has to behave the same on
> all of them. Per row it runs a `SELECT` on the key, then one of three
> things: no match, an `INSERT`; a match with a differing value, an
> `UPDATE`; a match with identical values, nothing. Every decision is
> made in the engine, one row and one pair of round trips at a time.
>
> That is also why the key must be unique in the table. If two rows
> match, the lookup returns two, and the step cannot know which one you
> meant.
>
> **Why it matters:** for a daily feed of thousands of rows this is
> exactly right: simple, portable and safe to re-run. For millions,
> the per-row lookup dominates. Load to a staging table with **Table
> output** and let one SQL `MERGE` do the rest.

> **Tip:** To repeat this workshop from the start, run `employee_table_backup.sql` from the [Table Update](../15-mod3-table-update/guide.md) Lab Files. It puts `EMPLOYEES` back as it shipped, 23 rows.

::::

<details>

<summary>Troubleshooting</summary>

**"Field 'EMPLOYEENUMBER' doesn't have a default value"**\
`EMPLOYEENUMBER` is missing from **Update fields**. Add it back with **Update** `N`.

**Output is 0 on the first run**\
All four employees are already in the table: the workshop ran before. Run `employee_table_backup.sql` and run again.

**"Duplicate entry '1188' for key 'PRIMARY'"**\
The step tried to insert an employee who already exists, so the lookup didn't find them. Check the key row: **Table field** `EMPLOYEENUMBER`, **Comparator** `=`, **Stream field1** `EMPLOYEE_NUMBER`. **Table output** gives the same error, because it only inserts.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[employees_insert_update.txt](./files/employees_insert_update.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\16-mod3-table-insert-update\solution`.

[tr_employee_insert_update.ktr](./files/tr_employee_insert_update.ktr) <button data-launch="spoon" data-path="files/tr_employee_insert_update.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_employee_insert_update.ktr">View graph</button>
