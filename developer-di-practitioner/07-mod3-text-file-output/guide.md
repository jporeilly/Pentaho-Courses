# Text File Output

> **Warning:**
>
> #### Workshop - Text File Output
> 
> Reading files is only half the job. You also need to generate files for users and systems.
> 
> In this workshop you build a transformation that writes a customer survey for Steel Wheels. You assemble the survey from several streams, and pass the customer's name in when you run it.
> 
> **What you'll do**
> 
> * Read a customer name from a transformation argument
> * Build header and body sections with static rows and file-driven rows
> * Format text with **User Defined Java Expression**
> * Merge streams in a fixed order with **Append streams**
> * Write the result with **Text file output**
> 
> **Prerequisites:** [Text File Input](../06-mod3-text-file-input/guide.md).
> 
> **Estimated time:** 35 minutes

<figure>

![The finished transformation: a header branch and a question branch appended, then written by Text file output](../_assets/images/survey-text-file-output.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

:::: tabs

### 1. Get System Info

> **Note:**
>
> #### Get System Info
> 
> Use **Get System Info** to read a value passed in at run time. Here that value is the customer's name.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/de06920fdcd84bc2b1fe63454afc8df8?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Using the Get System Info Step in Pentaho Data Integration" data-description="In this demonstration, I showcased two scenarios using the Get System Info step in Pentaho Data Integration (PDI). First, I retrieved a single row of system data, including the current date and JVM memory statistics, which can be useful for monitoring system health. In the second scenario, I illustrated how to append the current date and time to each row of order data coming from a CSV file input step. I encourage you to practice using the Get System Info step in your own Pentaho environment and experiment with retrieving various information types. This will enhance your transformations and provide valuable insights for auditing and batch processing." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

1. Start Spoon, create a transformation and save it as `tr_write_output.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\07-mod3-text-file-output`, next to `questions.txt`.


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

2. Drag **Get System Info** onto the canvas and name it `name`.
3. Double-click the step and add one field: **Name** `text`, **Type** `command line argument 1`.

<figure><img src="../_assets/images/get-sys-info.png" alt="Get System Info with one field, text, of type command line argument 1" width="375"><figcaption><p>The customer name arrives as argument 1</p></figcaption></figure>

4. Select **OK**.

### 2. User Defined Java Expression

> **Note:**
>
> #### User Defined Java Expression
> 
> Use **User Defined Java Expression** to build the header line from a label and the customer's name.

1. Drag **User Defined Java Expression** onto the canvas.
2. Create a hop from **Get System Info**.
3. Double-click the step and add one row:

   | New field | Java expression | Value type | Replace value |
   | --- | --- | --- | --- |
   | `text` | `"Customer name: " + text` | String | `text` |

<figure><img src="../_assets/images/text-name.png" alt="User Defined Java Expression building Customer name: plus the text field"><figcaption><p>A Java expression builds the header line</p></figcaption></figure>

4. Select **OK**.

> **Note:** **Replace value** overwrites `text` with the formatted line, so the field is still called `text`.

<div class="pcm-embed-card" data-href="https://docs.oracle.com/javase/tutorial/java/nutsandbolts/opsummary.html" data-title="Summary of Operators (The Java&amp;trade; Tutorials >        
            Learning the Java Language > Language Basics)"></div>

### 3. Data Grid

> **Note:**
>
> #### Data Grid
> 
> Use **Data Grid** for the fixed header lines, so the top of the file lives inside the transformation.
> 
> Define the field on the **Meta** tab, then type the rows on the **Data** tab.

1. Drag **Data Grid** onto the canvas and name it `instructions`.
2. Double-click the step. On **Meta**, add one field, `text`, type **String**. On **Data**, enter three rows: a line of dashes, `Please answer the questions below:`, and an empty row (the blank line before the questions).

<div><figure><img src="../_assets/images/dg-instructions.png" alt="Data Grid Meta tab with one String field, text"><figcaption><p>Meta: one field</p></figcaption></figure> <figure><img src="../_assets/images/dg-data.png" alt="Data Grid Data tab with the three header rows"><figcaption><p>Data: the header rows</p></figcaption></figure></div>

3. Select **OK**.

### 4. Append streams (head)

> **Note:**
>
> #### Append streams
> 
> Use **Append streams** when order matters. It outputs every row from its **Head hop**, then every row from its **Tail hop**.
> 
> Both inputs must have the same field names and types.

1. Drag **Append streams** onto the canvas.
2. Create hops to it from **User Defined Java Expression** and from **Data Grid**.
3. Double-click the step. Set **Head hop** to the User Defined Java Expression step (the customer line) and **Tail hop** to `instructions`.

<figure><img src="../_assets/images/append-2.png" alt="Append streams with the customer-name step as head and the Data Grid as tail" width="375"><figcaption><p>The customer line comes first</p></figcaption></figure>

4. Select **OK**.

> **Note:** Every stream in this workshop has a single `text` field, so they can all be appended. If order doesn't matter, hop several steps into one step instead: it merges them in whatever order rows arrive.

> **Under the hood:**
>
> #### Most steps read their inputs round-robin; Append is the exception
>
> When two hops enter an ordinary step, the engine gives it two row
> sets and the step takes rows from whichever has one ready,
> alternating between them. Both upstream steps are running at once,
> so the interleaving depends on timing — run it twice and the order
> can differ.
>
> **Append streams** deliberately breaks that rule. It reads its head
> hop's row set until that stream is exhausted and only then starts on
> the tail hop. It cannot pass a single tail row early, which is why
> it needs to know which hop is which, and why the header lines
> reliably come out on top.
>
> **Why it matters:** if output order matters — a report header, a
> file trailer, a sequence a downstream system checks — a plain merge
> is a bug waiting for a busy server. Append is the guarantee.

### 5. Text file input (questions)

> **Note:**
>
> #### Text file input
> 
> Use **Text file input** to read the question list. Each question becomes one row.

1. Drag **Text file input** onto the canvas and name it `survey questions`.
2. Double-click the step. In **File or directory**, add `${Internal.Entry.Current.Directory}/questions.txt`.

<figure><img src="../_assets/images/survey-2.png" alt="Text file input File tab with questions.txt selected"><figcaption><p>The question list</p></figcaption></figure>

3. On the **Content** tab, set **Separator** to a tab (select **Insert TAB**), clear **Header**, and select **Rownum in output?** with **Rownum fieldname** `question_num`. The row number becomes the question number.

<figure><img src="../_assets/images/survey-content.png" alt="Text file input Content tab: tab separator, no header, row numbers on"><figcaption><p>Row numbers become question numbers</p></figcaption></figure>

4. On **Fields**, select **Get Fields**, then rename the field to `text`.

<figure><img src="../_assets/images/survey-fields.png" alt="Text file input Fields tab with one String field, text"><figcaption><p>One field, text</p></figcaption></figure>

5. Select **OK**.

> **Note:** Each row now holds a question in `text` and its number in `question_num`.

### 6. User Defined Java Expression (number questions)

> **Note:**
>
> #### User Defined Java Expression
> 
> Use a second **User Defined Java Expression** to prefix each question line with its question number.

1. Drag **User Defined Java Expression** onto the canvas and name it `question seq`.
2. Create a hop from `survey questions`.
3. Double-click the step and add one row:

   | New field | Java expression | Value type | Replace value |
   | --- | --- | --- | --- |
   | `text` | `question_num + ". " + text` | String | `text` |

<figure><img src="../_assets/images/udje-question.png" alt="User Defined Java Expression joining question_num, a full stop and the question text"><figcaption><p>Number each question</p></figcaption></figure>

4. Select **OK**.

> **Note:** This overwrites `text` with a numbered question, such as `2. Which ETL tool do you currently use?`.

### 7. Select values

> **Note:**
>
> #### Select values
> 
> Use **Select values** to drop `question_num`, so this stream has the same single `text` field as the header stream.

1. Drag **Select values** onto the canvas and name it `select questions`.
2. Create a hop from `question seq`.
3. Double-click the step. On the **Remove** tab, add `question_num`.

<figure><img src="../_assets/images/sv-1-1.png" alt="Select values Remove tab with question_num listed" width="375"><figcaption><p>Remove question_num</p></figcaption></figure>

4. Select **OK**.

### 8. Append streams (body)

> **Note:**
>
> #### Append streams
> 
> Put the header lines first and the numbered questions after them.

1. Drag a second **Append streams** onto the canvas and name it `Append body`.
2. Create hops to it from the first **Append streams** and from `select questions`.
3. Double-click the step. Set **Head hop** to the first **Append streams** and **Tail hop** to `select questions`.

<figure><img src="../_assets/images/append-q.png" alt="Append body with the header stream as head and the questions as tail" width="375"><figcaption><p>Header first, then the questions</p></figcaption></figure>

4. Select **OK**.

> **Note:** You now have one stream. It contains one field named `text`.

### 9. Text file output

> **Note:**
>
> #### Text file output
> 
> Use **Text file output** to write the survey file to disk.

> **Warning:** Don't run several copies of this step against the same file. If you need parallel output, use **Include stepnr in filename**.

1. Drag **Text file output** onto the canvas.
2. Create a hop from `Append body`.
3. Double-click the step. On the **File** tab, set **Filename** to `${Internal.Entry.Current.Directory}/survey` and **Extension** to `txt`, and select **Do not create file at start**.
4. On the **Content** tab, clear **Header**, so the file doesn't start with the word `text`.

<figure><img src="../_assets/images/tfo-content-1.png" alt="Text file output File tab with the survey file name" width="563"><figcaption><p>Write survey.txt beside the transformation</p></figcaption></figure>

5. On **Fields**, select **Get Fields**. One field, `text`.

<figure><img src="../_assets/images/tfo-survey.png" alt="Text file output Fields tab with the text field" width="563"><figcaption><p>One field, text</p></figcaption></figure>

6. Select **OK**.

> **Under the hood:**
>
> #### The file opens when the first row arrives, then rows stream in
>
> By default **Text file output** creates and opens its file when the
> step initializes - when the transformation starts, before any row
> exists. With **Do not create file at start** selected, as here, it
> waits for the first row instead. Either way, rows are then written
> through a buffered stream as they arrive and the file is closed when
> the upstream steps finish. Nothing is collected in memory first.
>
> Two consequences you will meet in real work: without that option, a
> run that fails early still leaves a zero-byte file behind; and two
> step copies pointed at the same filename fight over one handle -
> hence the warning above.
>
> **Why it matters:** an output file appearing is not proof the run
> succeeded; the row count in Step Metrics is. And because the writer
> streams, a ten-million-row extract costs no more memory than this
> survey does.

### 10. Run

> **Note:**
>
> #### Run the transformation
> 
> Run the transformation and pass a customer name as an argument.

1. Select **Run** in the toolbar.
2. In **Run Options**, select **Arguments (legacy)** and enter a customer name in the first row, for example `James`.

<figure><img src="../_assets/images/tfo-run.png" alt="The Arguments dialog with a customer name in argument 1"><figcaption><p>The customer name, as argument 1</p></figcaption></figure>

3. Select **Run**.
4. Open the **Preview data** tab.

<figure><img src="../_assets/images/tfo-preview.png" alt="Preview of the survey lines"><figcaption><p>The survey, line by line</p></figcaption></figure>

5. Open `survey.txt` in the lab folder. With `James` as the argument it reads:

```text
Customer name: James
----------------------------------------------------
Please answer the questions below:

1. How many people does your organization employ?
2. Which ETL tool do you currently use?
3. What would you do if you had a magic wand?
```

> **Under the hood:**
>
> #### Where the argument came from
>
> **Get System Info** has no input hop, so it produced exactly one
> row, and the field you configured as *command line argument 1* was
> filled from the run dialog's **Arguments (legacy)** box. The engine
> treats that box as a stand-in for what a scheduler would pass on the
> command line — `pan.sh -file=tr_write_output.ktr "Acme Ltd"` — so
> the transformation is already runnable unattended, unchanged.
>
> Arguments are positional and, as the label says, legacy; modern
> transformations use named **parameters** (right-click the canvas,
> **Parameters** tab), which you will meet in Module 5. The principle
> is the same either way: values that vary per run come in from
> outside, get materialised as a field, and the steps never know the
> difference.
>
> **Why it matters:** the `.ktr` you just ran by hand is the one the
> scheduler runs tonight. There is no "productionised" version to
> maintain — only the input changes.

> **Note:** This workshop reinforces the rule for merging streams:
> 
> * Keep the same field layout (names and order).
> * Keep matching data types.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[questions.txt](./files/questions.txt)

The expected output, for comparison:

[survey.txt](./files/survey.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\07-mod3-text-file-output\solution`.

[tr_write_output.ktr](./files/tr_write_output.ktr) <button data-launch="spoon" data-path="files/tr_write_output.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_write_output.ktr">View graph</button>
