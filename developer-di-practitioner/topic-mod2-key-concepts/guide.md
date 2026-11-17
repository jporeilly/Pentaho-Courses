# Key Concepts

<div class="pcm-intro">

Now that Pentaho Data Integration is configured, build something with it. You'll create a 'Hello World' transformation — the simplest pipeline possible — and pick up the vocabulary the rest of the course leans on: steps, hops, rows, and the run/preview cycle.

</div>

> **Note:**
>
> #### Concepts & Terminology
> 
> The Data Integration perspective allows you to create two basic workflow types:
> 
> **Transformations**
> 
> A transformation describes a data flow: reading from a source, transforming the data, and loading it into a target.
> 
> **Jobs**
> 
> A job coordinates the work around those data flows: which transformations run, in what order, and what has to be true first - for example "Is my source file available?" or "Does the table exist?"

### Transformations & Jobs

::: tabs

### 1. Transformation

> **Note:**
>
> #### **Transformation**
> 
> Transformations are the workhorses of ETL. They are made of two things:
> 
> **Steps**
> 
> Each step does one job, from reading a text file to maintaining a slowly changing dimension. All the steps in a transformation run at the same time.
> 
> **Hops**
> 
> A hop carries rows from one step to the next. Each hop is a row buffer between one step's output and the next step's input. In the transformation below, every arrow is a hop: **10 rows** feeds **seq**, which **Join Rows** joins with **Input data**; from there rows go on to **Group**, and through **rnd** and **Sort rows** to **Memory Group**.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pdia-data-integration/transforming-data-with-pdi" data-title="Transforming data with Pentaho Data Integration | Pentaho Documentation"></div>
<div align="center">
<figure>
<img src="../_assets/images/steps-and-hops.png" alt="Transformation = Steps + Hops: eight steps joined by hops. 10 rows (Generate rows) feeds seq (Add sequence), which Join Rows joins with Input data (Data grid); Join Rows copies its rows to Group (Group by) and to rnd (Random value), then Sort rows and Memory Group (Memory group by). A key: a step does one job; a hop carries rows from one step to the next, a buffer of rows between them" width="800">
<figcaption>Transformation = Steps + Hops</figcaption>
</figure>
</div>

***

> **Note:**
>
> #### **Steps**
> 
> Key characteristics of steps:
> 
> * A step's name must be unique within its transformation.
> * Almost every step reads rows and writes rows. **Generate Rows** is an exception: it only writes.
> * A step can have several outgoing hops. It either **copies** each row to every one of them, or **distributes** the rows among them in turn (round robin).
> * Each step runs in its own thread. For performance tuning you can run several copies of a step, each in its own thread.
> * All steps run in parallel, so you can't set an order of execution inside a transformation. Use a job for that.

As well as steps and hops, a transformation can hold **notes**, which document it on the canvas.

<div align="center">
<figure>
<img src="../_assets/images/copy-rows.png" alt="Copy rows: Generate Rows writes rows 1 to 4, and each of its two hops carries every row, so both Dummy (do nothing) steps receive all 4 rows" width="720">
<figcaption>Copy: every row goes down every hop</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/distribute-rows.png" alt="Distribute rows: Generate Rows writes rows 1 to 4 and deals them out in turn, so the first Dummy (do nothing) step receives rows 1 and 3 and the second receives rows 2 and 4" width="720">
<figcaption>Distribute: the rows are dealt out in turn</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/step-palette.png" alt="The step folders in Spoon's Design tab, with examples from each: Input, Output, Streaming, Job, Mapping, Transform, Flow, Utility, Lookup, Joins, Scripting, Agile, Data Warehouse, Bulk loading, Big Data, Cryptography and Pentaho Server. The Design tab lists many more steps; its search box finds one by name" width="800">
<figcaption>The step folders, with examples from each</figcaption>
</figure>
</div>

### 2. Parallelism

> **Note:**
>
> #### **Parallelism**
> 
> When a transformation starts, all its steps start at the same time. Each hop is a buffer that holds 10,000 rows by default.
> 
> As soon as the first step has read some rows, it writes them into its outgoing hop. The next step reads them from there while the first step is still reading, and writes its own output into the next hop, and so on down the line. Rows stream through; no step waits for the one before it to finish. You set the buffer size on the **Miscellaneous** tab of **Transformation properties**.

<div align="center">
<figure>
<img src="../_assets/images/parallelism.png" alt="Parallelism: Products writes rows into a hop, a row buffer of up to 10,000 rows; Sort rows reads them from it and writes into the next hop, which Group by reads. All three steps start together, and no step waits for the one before it to finish" width="800">
<figcaption>Every step runs at once; each hop is a row buffer</figcaption>
</figure>
</div>

> **Note:**
>
> #### **Adjusting the Queue Size**
> 
> When you tune performance, especially on a machine with plenty of RAM, you may want a larger buffer. It is the **Nr of rows in rowset** setting in **Transformation properties**, and it applies to every hop in the transformation. A larger buffer can let the first steps finish sooner, freeing CPU time for the steps after them.

<div align="center">
<figure>
<img src="../_assets/images/buffer-rows.png" alt="Transformation properties, Miscellaneous tab: Nr of rows in rowset set to 10000" width="800">
<figcaption>Changing buffer row set</figcaption>
</figure>
</div>

### 3. Data Types

> **Note:**
>
> #### **Data Types**
> 
> Each Pentaho Data Integration data type maps to a Java type, so the field, parameter or variable behaves the way that Java type does.

<div align="center">
<figure>
<img src="../_assets/images/data-types.png" alt="The Pentaho Data Integration data types and the Java type each behaves as, in four families. Numbers: Integer to Long, Number to Double, BigNumber to BigDecimal. Text: String to String. Date and time: Date to Date, Timestamp to Timestamp. Other values: Boolean to Boolean, Binary to Byte[], Internet Address to InetAddress, Hierarchical to BinaryTree" width="800">
<figcaption>Each data type and the Java type it behaves as</figcaption>
</figure>
</div>

The following table describes these mappings:

| PDI Data Type | Java Data Type | Description | Example |
| --- | --- | --- | --- |
| BigNumber | BigDecimal | An arbitrary unlimited precision number. | 3.141592653589793238462643383279502884197169399375105820974944 |
| Binary | Byte[] | An array of bytes that contain any type of binary data. | An image file or a compressed file can be stored as Binary data |
| Boolean | Boolean | A boolean value `true` or `false`. | A boolean value true or false |
| Date | Date | A date-time value with millisecond precision. | 2023-10-20T10:48:51.123 |
| Hierarchical<br>EE Plugin 9.5+ | BinaryTree | Data items that are related to each other by hierarchical relationships | A family tree |
| Integer | Long | A signed long 64-bit integer. | 42 |
| Internet Address | InetAddress | An Internet Protocol (IP) address. | 192.168.0.1 |
| Number | Double | A double precision floating point value (64bits). | 2.7182818284590452353602874713526624977572470936999 |
| String | String | A variable unlimited length text encoded in UTF-8 (Unicode). | “Hello world!” |
| Timestamp | Timestamp | Allows the specification of fractional seconds to a precision of nanoseconds. | 2023-10-20T10:48:51.123456789 |

### 4. Jobs

> **Note:**
>
> #### **Jobs**
> 
> A job runs transformations and other jobs in a defined order, with conditions between them, to carry out a business process.
>
> **Job Entries**
> 
> Each job entry is one task in the job: run a transformation, run a shell script, execute SQL, copy or check files, and more. Each entry has its own options and parameters.
> 
> Job entries run one after another, following the hops. (An entry can also be set to start the entries after it in parallel.)

<div align="center">
<figure>
<img src="../_assets/images/job-orchestration.png" alt="A job runs its entries one after another: Start, then Transformation A, then Transformation B when A succeeds, then Success when B succeeds. Inside each transformation its steps run in parallel. If either transformation fails, its failure hop leads to Mail, then Abort job, and the entries after it never run" width="800">
<figcaption>A job orchestrates transformations, one entry after another</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/job-entry-palette.png" alt="The job entries Spoon offers, by folder: General (Start, Dummy, Job, Set variables, Success, Transformation), Mail, File management, Conditions, Scripting, Bulk loading, Big Data, XML, Utility, Repository, File transfer and File encryption, each listing its entries" width="800">
<figcaption>The job entries, folder by folder</figcaption>
</figure>
</div>

:::

