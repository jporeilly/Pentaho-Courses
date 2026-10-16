# Parameters

> **Warning:**
>
> #### Workshop - Parameters
> 
> A transformation that reads "the canceled orders" is a one-off. Give it a **named parameter** and the same file reads whichever order status you ask for: from Spoon, from the command line, or from a job.
> 
> **What you'll do**
> 
> * Define a named parameter, `STATUS`, with a default value
> * Use it in a **Table input** query as `${STATUS}`
> * Run with the default, then with another value
> * Pass the value from the command line with Pan
> 
> **Prerequisites:** [Review Parameters](../topic-mod5-parameters-and-variables-review/guide.md); [Reading from a Database](../13-mod3-reading-from-a-database/guide.md) and the `MySQL:sampledata` connection from [Connecting to Database](../12-mod3-connecting-to-database/guide.md)
> 
> **Estimated time:** 20 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/6b3348c091764d08806280206bd53434?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Defining Parameters in Transformations for Effective Data Management 📊" data-description="In this video, I demonstrate how to define parameters within a transformation using Spoon, highlighting their role as local variables compared to global variables. I walk you through viewing the current parameters and variables in memory, and I create two parameters: one for the delimiter character and another for the output file's extension. It's crucial to provide default values and descriptions for these parameters to avoid potential issues. I also explain how a parameter can override a variable if they share the same name. Please pay attention to these concepts, as they will be applied in the next demonstration video." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

:::: tabs

### 1. Define the Parameter

> **Note:**
>
> #### Named Parameters
> 
> A named parameter belongs to the transformation: it has a name, a default value and a description, and whoever runs the transformation can give it a different value for that run.

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
3. Select **File > Save as** and save it as `tr_parameters_variables_orders.ktr` in `C:\Workshop-DI-Practitioner\05-enterprise-solution\03-parameters\34-mod5-parameters`.

> **Tip:** The solution follows the query with a **Calculator**, **Number range**, **Sort rows** and **Select values**, the pattern from [Reading from a Database](../13-mod3-reading-from-a-database/guide.md). To work with that pipeline, open your `tr_reading_database.ktr` from that workshop instead, save it under this name, and in tab 2 change its **Table input** rather than adding a new one. This workshop's checkpoints read only the **Table input**.

4. Double-click an empty part of the canvas, or select **Edit > Settings...**. The **Transformation properties** dialog opens.
5. Open the **Parameters** tab.
6. Fill the grid with one row:

| Parameter | Default Value | Description            |
| --------- | ------------- | ---------------------- |
| `STATUS`  | `Cancelled`   | `Order status to read` |

7. Select **OK**.
8. Save the transformation (`Ctrl+S`).

<figure><img src="../_assets/images/param.png" alt="Transformation properties, Parameters tab"><figcaption><p>The Parameters tab (shown with the Deleting Records parameter; yours holds STATUS)</p></figcaption></figure>

> **Under the hood:**
>
> #### A parameter is a variable the transformation declares
>
> At run time PDI turns every named parameter into an ordinary
> variable, scoped to this transformation: the value the run was given,
> or the default if it was given none. Everything that reads variables
> (`${...}` in a step setting, **Get Variables**) sees it the same way.
>
> The declaration is what makes it a contract. Spoon's Run dialog lists
> it, `pan -listparam` prints it, and a job entry that calls this
> transformation can pass it a value by name. A variable read from
> `kettle.properties` has none of that: nothing tells the person running
> the file it exists.
>
> **Why it matters:** the default keeps the transformation runnable as
> it stands, and the declaration tells every caller what it can change.

### 2. Use It in the Query

> **Note:**
>
> #### Use It in the Query
>
> **Table input** reads the orders whose status is the parameter's value.

1. On the **Design** tab, open the **Input** folder and drag **Table input** onto the canvas. Keep its step name, `Table input`.
2. Double-click **Table input**.
3. Set **Connection** to `MySQL:sampledata`.
4. Enter the query in **SQL**:

```sql
SELECT
  ORDERNUMBER
, ORDERDATE
, REQUIREDDATE
, SHIPPEDDATE
, STATUS
, COMMENTS
, CUSTOMERNUMBER
FROM ORDERS
WHERE STATUS = '${STATUS}'
```

> **Warning:** The quotes are yours. `${STATUS}` is replaced as plain text, so `'${STATUS}'` becomes `'Cancelled'`. Leave the quotes out and MySQL receives `WHERE STATUS = Cancelled`, a column name, and the query fails.

5. Select **Replace variables in script?**.
6. Select **OK**.
7. Select **Table input** on the canvas, press `F10` (**Action > Preview**), and select **Quick Launch**. The preview runs with the parameter's default value.

> **Success:** Checkpoint: **Examine preview data** shows 6 rows, the canceled orders: every `STATUS` is `Cancelled`.

8. Select **Close**.

> **Under the hood:**
>
> #### `${}` is text substitution, done before the query is prepared
>
> With **Replace variables in script?** selected, Table input rewrites the
> SQL text first, swapping each `${NAME}` for its value, and only then
> hands the finished statement to the driver. The database never sees
> a parameter; it sees `WHERE STATUS = 'Cancelled'`.
>
> That is what lets a variable stand anywhere in the SQL, even a table
> or column name, and also why it is not the tool for values that come
> from data: a value containing a quote changes the statement. The
> next workshop, **[Parameters SQL](../35-mod5-parameters-sql/guide.md)**,
> uses `?` markers, which the driver binds as values.
>
> **Why it matters:** named parameters are for configuration you
> control (a status, a date, a schema name); `?` markers are for values
> that arrive in the data.

### 3. Run with Another Value

> **Note:**
>
> #### Run with Another Value
>
> The **Run Options** dialog lists the transformation's parameters, so each run can give `STATUS` its own value.

1. Save the transformation (`Ctrl+S`).
2. Press `F8` (**Action > Run Options...**). The **Run Options** dialog opens.
3. Open the **Parameters** tab. `STATUS` is listed with **Default value** `Cancelled`.
4. Set its **Value** to `On Hold`, and select **Run**.
5. In **Execution Results**, open the **Step Metrics** tab.

> **Success:** Checkpoint: **Table input** shows 4 in **Input**: the four orders on hold.

Leave the **Value** empty and the run uses the default again (6 rows). The other statuses in Steel Wheels are `Shipped` (303), `In Process` (6), `Resolved` (4) and `Disputed` (3).

### 4. Run It from the Command Line

> **Note:**
>
> #### Run It from the Command Line
>
> Pan, the command-line runner for transformations, takes the value with `-param`. On Windows the launcher batch files split arguments at `=`, so the parameter must reach them in quotes; in PowerShell, `--%` passes the rest of the line through untouched.

1. In PowerShell, run the solution with `STATUS` set to `Resolved`. On macOS or Linux, the command assumes you copied the workshop folder to your home folder as `~/Workshop-DI-Practitioner`.

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\pan.bat --% "-file=C:\Workshop-DI-Practitioner\05-enterprise-solution\03-parameters\34-mod5-parameters\solution\tr_parameters_variables_orders.ktr" "-param:STATUS=Resolved" -level=Basic
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/data-integration
./pan.sh -file=$HOME/Workshop-DI-Practitioner/05-enterprise-solution/03-parameters/34-mod5-parameters/solution/tr_parameters_variables_orders.ktr "-param:STATUS=Resolved" -level=Basic
```

:::

> **Success:** Checkpoint: the log ends with `Table input.0 - Finished processing (I=4, O=0, R=0, W=4, U=0, E=0)`: the four resolved orders.

`-listparam` in place of `-param:...` prints the parameters a transformation declares, with their defaults, without running it.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and press `Ctrl+O`, `Ctrl+V`, `Enter`.

### Solution <!-- no-step -->

The finished transformation for this lab. It reads the orders for `${STATUS}` (default `Cancelled`: 6 orders), then works out `diff_days` as in Reading from a Database and labels each order Late, On Time or Early.

Also on disk at `C:\Workshop-DI-Practitioner\05-enterprise-solution\03-parameters\34-mod5-parameters\solution`.

[tr_parameters_variables_orders.ktr](./files/tr_parameters_variables_orders.ktr) <button data-launch="spoon" data-path="files/tr_parameters_variables_orders.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_parameters_variables_orders.ktr">View graph</button>
