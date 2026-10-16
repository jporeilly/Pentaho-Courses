# Table Update

> **Warning:**
>
> #### Workshop - Table Update
>
> Update existing rows in `EMPLOYEES` from a file, matching on the employee number. Two employees change: a first name and two job titles.
>
> **What you'll do**
>
> * Read the changes with **Text file input**
> * Update the matching rows with **Update**
> * Map stream fields to table columns whose names differ
> * Check the changes with SQL
>
> **Prerequisites:**
>
> * The `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> * DBeaver (or Adminer on a lab VM), connected to `sampledata` as `pentaho_admin`
>
> **Estimated time:** 25 minutes

<figure>

![The finished transformation: Text File Input hopped to Update employees](../_assets/images/update-1.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

:::: tabs

### 1. Text file input

> **Note:**
>
> #### Text file input
>
> Read the changes from `employees_update.txt`: a header line and two employees.

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
3. Select **File > Save as** and save it as `tr_employee_update.ktr` in `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\15-mod3-table-update`, the folder that holds `employees_update.txt`.
4. On the **Design** tab, open the **Input** folder and drag **Text file input** onto the canvas.
5. Double-click **Text file input**.
6. Set **Step name** to `Text File Input`.
7. On the **File** tab, enter `${Internal.Entry.Current.Directory}/employees_update.txt` in **File or directory** and select **Add**. The path moves to **Selected files**.

<figure><img src="../_assets/images/tfo-update.png" alt="Text file input File tab with employees_update.txt in the selected files"><figcaption><p>The file</p></figcaption></figure>

8. On the **Content** tab, set **Separator** to `,` and **Format** to `mixed`. Leave **Header** selected, with **Number of header lines** `1`.

<figure><img src="../_assets/images/tfi-content-update.png" alt="Content tab with a comma separator, one header line and the mixed format"><figcaption><p>Comma separator, one header line</p></figcaption></figure>

9. On the **Fields** tab, select **Get Fields**. Spoon asks for the number of lines to sample: select **OK**, then close **Scan results**.
10. Compare the **Fields** grid with this table. Keep the lengths that **Get Fields** detected.

| Name              | Type    | Format |
| ----------------- | ------- | ------ |
| `EMPLOYEE_NUMBER` | Integer | `#`    |
| `LASTNAME`        | String  |        |
| `FIRSTNAME`       | String  |        |
| `EXT`             | String  |        |
| `EMAIL`           | String  |        |
| `OFFICE`          | Integer | `#`    |
| `REPORTS`         | Integer | `#`    |
| `TITLE`           | String  |        |

Four names differ from the table's columns: `EXT` is `EXTENSION`, `OFFICE` is `OFFICECODE`, `REPORTS` is `REPORTSTO` and `TITLE` is `JOBTITLE`. You map them in the next tab.

<figure><img src="../_assets/images/tfi-fields-update.png" alt="Fields tab with the eight fields from EMPLOYEE_NUMBER to TITLE"><figcaption><p>Eight fields</p></figcaption></figure>

11. Select **Preview rows**, enter `100` rows, and select **OK**. The rows show in **Examine preview data**.

> **Success:** Checkpoint: **Examine preview data** shows 2 rows, employees `1002` and `1102`. `REPORTS` is `<null>` for `1002`: the file leaves it empty, because the CEO reports to no one.

12. Select **Close**, then select **OK** to close **Text File Input**.

### 2. Update

> **Note:**
>
> #### Update
>
> **Update** changes existing rows only. For each incoming row it looks up the key, `EMPLOYEENUMBER`, the column that identifies an employee; a row whose key isn't in the table fails the step, unless **Ignore lookup failure?** is selected. To insert the missing rows as well, use **Insert / update**, in [Table Insert - Update](../16-mod3-table-insert-update/guide.md).

1. On the **Design** tab, open the **Output** folder and drag **Update** onto the canvas.
2. Create a hop from **Text File Input** to **Update**: hold `Shift` and drag from one step to the other.
3. Double-click **Update**.
4. Set **Step name** to `Update employees`.
5. Set **Connection** to `MySQL:sampledata`, **Target table** to `EMPLOYEES` and **Commit size** to `100`.
6. Fill **The key(s) to look up the value(s)** grid with one row:

| Table field      | Comparator | Stream field1     |
| ---------------- | ---------- | ----------------- |
| `EMPLOYEENUMBER` | `=`        | `EMPLOYEE_NUMBER` |

7. Under **Update fields**, select **Get update fields**. Spoon adds one row per stream field, with the table field named the same.
8. Right-click the `EMPLOYEE_NUMBER` row of **Update fields** and select **Delete selected lines**. The step matches on the key; it doesn't update it.
9. Correct the four **Table field** names that differ, so the grid matches this table:

| Table field  | Stream field |
| ------------ | ------------ |
| `LASTNAME`   | `LASTNAME`   |
| `FIRSTNAME`  | `FIRSTNAME`  |
| **`EXTENSION`**  | `EXT`        |
| `EMAIL`      | `EMAIL`      |
| **`OFFICECODE`** | `OFFICE`     |
| **`REPORTSTO`**  | `REPORTS`    |
| **`JOBTITLE`**   | `TITLE`      |

<figure><img src="../_assets/images/update-options.png" alt="Update step with target table EMPLOYEES, the EMPLOYEENUMBER key and the update fields" width="563"><figcaption><p>Key and update fields</p></figcaption></figure>

> **Note:** The screenshot still lists `EMPLOYEENUMBER` as the first update field, and shows the connection under an older name, `MySQL - sampledata`. The extra field does no harm, since it sets the key to its own value, but leave it out, and select `MySQL:sampledata`.

10. Select **OK**.

### 3. Run and validate

> **Note:**
>
> #### Run and validate
>
> Run the transformation, then check the changes in the database. To repeat this workshop or the next one from the start, run `employee_table_backup.sql` from **Lab Files** in DBeaver: it puts `EMPLOYEES` back as it shipped.

1. Save the transformation (`Ctrl+S`).
2. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
3. In **Execution Results**, open the **Step Metrics** tab.

<figure><img src="../_assets/images/update-step-metrics.png" alt="Step Metrics: Update employees read 2 rows and updated 2"><figcaption><p>2 rows updated</p></figcaption></figure>

> **Success:** Checkpoint: **Update employees** shows 2 in **Updated**. (The 1 under **Updated** for **Text File Input** is not a database update.)

4. In DBeaver, run:

   ```sql
   SELECT EMPLOYEENUMBER, FIRSTNAME, EMAIL, REPORTSTO, JOBTITLE
   FROM EMPLOYEES
   WHERE EMPLOYEENUMBER IN (1002, 1102);
   ```

<figure><img src="../_assets/images/update-db.png" alt="The two updated EMPLOYEES rows in DBeaver"><figcaption><p>The updated employees (an older run: REPORTSTO 1000)</p></figcaption></figure>

> **Success:** Checkpoint: these values changed. Every other column already matched the file, so it stayed as it was, and `REPORTSTO` is still `NULL` for `1002`. (The screenshot comes from an older copy of the file, which set it to `1000`.)
>
> | `EMPLOYEENUMBER` | Column      | Before                | After                               |
> | ---------------- | ----------- | --------------------- | ----------------------------------- |
> | `1002`           | `FIRSTNAME` | `Diane`               | **`Diana`**                         |
> | `1002`           | `JOBTITLE`  | `President`           | **`CEO`**                           |
> | `1102`           | `JOBTITLE`  | `Sale Manager (EMEA)` | **`Regional Sales Manager (EMEA)`** |

5. Run the transformation again: press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.

> **Under the hood:**
>
> #### Two statements per row: a lookup, then an UPDATE only if something changed
>
> For each incoming row the **Update** step first runs a `SELECT` on
> `EMPLOYEES` by `EMPLOYEENUMBER`, fetches the current values of the
> update fields, and compares them with the stream. Only where a value
> differs does it issue `UPDATE ... WHERE EMPLOYEENUMBER = ?`. The
> first run found two rows to change. This second run, with the same
> file, reads both rows, compares them and skips them.
>
> **Skip lookup** turns that comparison off: with it selected, the step
> fires the `UPDATE` for every row, halving the round trips at the cost
> of touching rows that didn't need it (and firing any last-modified
> triggers on them).
>
> **Why it matters:** **Updated** in Step Metrics counts rows that
> *changed*, so re-running this transformation is safe. Loads that can
> run twice with the same result (idempotent loads) are the ones you
> can schedule without fear.

6. In **Execution Results**, open the **Step Metrics** tab.

> **Success:** Checkpoint: **Update employees** shows 2 in **Read** and 0 in **Updated**: both rows were looked up and compared, and neither was written.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>Updated is 0 on the first run</summary>

The table already holds the file's values: the workshop ran before. Run `employee_table_backup.sql` in DBeaver, then run the transformation again.

</details>

<details>
<summary>"Entry to update with following key could not be found"</summary>

A key in the file isn't in the table. **Update** never inserts: select **Ignore lookup failure?** to skip such rows, or use **Insert / update**.

</details>

<details>
<summary>Data type errors on update</summary>

`EMPLOYEE_NUMBER` must be an Integer, like `EMPLOYEENUMBER`. Fix its type on the **Fields** tab of **Text File Input**.

</details>

<details>
<summary>Unknown column errors</summary>

A **Table field** in **Update fields** still has a stream name, such as `EXT` or `TITLE`. Correct it to the table's column name.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and press `Ctrl+O`, `Ctrl+V`, `Enter`.

`employee_table_backup.sql` puts `EMPLOYEES` back as it shipped (23 rows). Run it in your database tool (Adminer or DBeaver) to repeat this workshop or the next one.

[employee_table_backup.sql](./files/employee_table_backup.sql)

[employees_update.txt](./files/employees_update.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\02-databases\15-mod3-table-update\solution`.

[tr_employee_update.ktr](./files/tr_employee_update.ktr) <button data-launch="spoon" data-path="files/tr_employee_update.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_employee_update.ktr">View graph</button>
