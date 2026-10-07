# Join Rows

> **Warning:**
>
> #### Workshop - Join Rows
> 
> Every pairing of two lists is a **cartesian product**, and **Join rows (cartesian product)** builds it, optionally filtered by a condition. In this workshop you generate baby names: every first name with every middle name, then the family surname on each, a few initials ruled out, and five names picked at random.
> 
> **What you'll do**
> 
> * Build a cartesian product of two Data grids
> * Compute new fields with a **User defined Java expression**
> * Join a parameter's value onto every row, with a filter condition
> * Pick a reproducible random sample with **Reservoir sampling**
> 
> **Prerequisites:** Understanding of basic transformation concepts (steps, hops, preview), and named parameters from **[Parameters](../34-mod5-parameters/guide.md)** (this lab uses two).
> 
> **Estimated time:** 20 minutes

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

:::: tabs

### 1. Parameters

> **Note:**
>
> #### Two named parameters
> 
> `surname` is the family name every baby gets; `SEED` fixes the random sample, so everyone who runs the lab picks the same five names.

1. Double-click an empty part of the canvas (or press `Ctrl+T`) to open **Transformation properties**, then the **Parameters** tab.
2. Add two rows:

| Parameter | Default Value | Description    |
| --------- | ------------- | -------------- |
| `surname` | `Smith`       | Family surname |
| `SEED`    | `23`          | Random seed    |

3. Select **OK**, and save the transformation.

### 2. Two lists

1. Drag a **Data grid** onto the canvas and name it `first name`.
2. On its **Meta** tab add one field, `first_name`, type **String**. On the **Data** tab enter ten values: `Oliver`, `Jack`, `Harry`, `George`, `Jacob`, `Charlie`, `Noah`, `William`, `Thomas`, `Oscar`.
3. Add a second **Data grid**, `middle name`, with one String field, `middle_name`, and ten values: `James`, `John`, `William`, `Thomas`, `Alexander`, `Robert`, `Michael`, `David`, `Andrew`, `Peter`.

### 3. Every combination

1. Drag **Join rows (cartesian product)** onto the canvas and name it `all possible first and middle name combinations`.
2. Create a hop from each Data grid to it.
3. Leave **The condition** empty.
4. Preview the step: 100 rows, every first name with every middle name.

> **Under the hood:**
>
> #### Every row of one stream meets every row of the other
>
> Join rows reads every input except one into memory first (up to
> **Max. cache size (in rows)**, then into temporary files in **Temp
> directory**). Then it streams the remaining input, the **Main step to
> read from**, and for each of its rows emits one combined row per
> cached row. Ten first names times ten middle names is 100 rows.
>
> With a condition, it emits only the combinations that pass it, which
> is how the next part drops some pairs without a separate Filter rows.
>
> **Why it matters:** the output is the product of the input sizes.
> Ten by ten is harmless; a thousand by a million is a billion rows, so
> keep the cached side small and filter early.

### 4. Initials

1. Drag **User defined Java expression** onto the canvas, name it `name_initials`, and hop the Join rows step into it.
2. Add two fields:

| New field           | Java expression                                           | Value type |
| ------------------- | --------------------------------------------------------- | ---------- |
| `first_middle_name` | `first_name+" "+middle_name`                              | String     |
| `initials`          | `first_name.substring(0,1)+middle_name.substring(0,1)`    | String     |

### 5. Add the surname

1. Drag **Get variables** onto the canvas and name it `get ${surname}`. Add one field: **Name** `surname`, **Variable** `${surname}`, type **String**. It outputs one row.
2. Drag a second **Join rows (cartesian product)** onto the canvas and name it `join surname`. Create hops into it from `name_initials` and from `get ${surname}`.
3. Set **Main step to read from** to `name_initials`.
4. Set **The condition** to: `initials` **IN LIST** `AA;DD;PP;TT;OO;RR;WW`, and click the condition's **NOT** toggle so it reads "NOT ... IN LIST".
5. Preview the step: 98 rows. The condition dropped Thomas Thomas (`TT`) and William William (`WW`), the only two pairs whose initials are in the list.

### 6. Build the name

1. Drag **Select values** onto the canvas and hop `join surname` into it. Keep four fields: `first_name`, `middle_name`, `surname`, `initials`.
2. Drag a second **User defined Java expression** onto the canvas, name it `name +surname`, and hop Select values into it. Add:

| New field       | Java expression                                                                    | Value type |
| --------------- | ---------------------------------------------------------------------------------- | ---------- |
| `baby_initials` | `first_name.substring(0,1)+middle_name.substring(0,1)+surname.substring(0,1)`      | String     |
| `baby_name`     | `first_name+" "+middle_name+" "+surname`                                           | String     |

### 7. Pick five

1. Drag **Reservoir sampling** onto the canvas, name it `Select a name`, and hop `name +surname` into it.
2. Set **Sample size (rows)** to `5` and **Random seed** to `${SEED}`.
3. Preview `Select a name`. With the defaults (`Smith`, seed `23`) you get:

* Noah Andrew Smith
* Oliver John Smith
* Thomas Alexander Smith
* Jack Robert Smith
* Oscar Thomas Smith

> **Under the hood:**
>
> #### A fair sample in one pass, without knowing the row count
>
> Reservoir sampling keeps a "reservoir" of the first five rows, then
> for each later row decides at random whether it replaces one of
> them, with odds that shrink as more rows arrive. When the stream
> ends, every row has had the same chance of being in the five, and
> the step never needed to know there would be 98.
>
> The random choices come from a generator started with **Random
> seed**. The same seed over the same rows in the same order gives the
> same sample, which is why your five match the list above. Set
> `SEED` to `7` on the Run dialog's **Parameters** tab and you get a
> different five, starting with Charlie Robert Smith.
>
> **Why it matters:** you can sample a stream of any size in fixed
> memory, and a fixed seed makes the sample repeatable for tests.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

### Solution <!-- no-step -->

The finished transformation for this lab. Preview `Select a name` to see the five names above.

Also on disk at `C:\Workshop-DI-Practitioner\04-enriching-the-dataset\02-joins\23-mod4-join-rows\solution`.

[tr_join_rows_names.ktr](./files/tr_join_rows_names.ktr) <button data-launch="spoon" data-path="files/tr_join_rows_names.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_join_rows_names.ktr">View graph</button>
