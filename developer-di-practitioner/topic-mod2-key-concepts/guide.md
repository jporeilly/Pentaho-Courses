# Key Concepts

<div class="pcm-intro">

Now that PDI is configured, build something with it. You'll create a 'Hello World' transformation — the simplest pipeline possible — and pick up the vocabulary the rest of the course leans on: steps, hops, rows, and the run/preview cycle.

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
> A hop carries rows from one step to the next. Each hop is a row buffer between one step's output and the next step's input. In the transformation below, rows flow from **Text file input** to **Filter rows**, then **Sort rows**, and finally **Table output**.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/pdia-data-integration/transforming-data-with-pdi" data-title="Transforming data with PDI | Pentaho Documentation"></div>
<div data-full-width="true"><figure><img src="../_assets/images/steps.png" alt="Steps &#x26; Hops = Transformation" width="563"><figcaption><p>Steps &#x26; Hops = Transformation</p></figcaption></figure></div>

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

<div align="left"><figure><img src="../_assets/images/copy-rows.png" alt="Copy rows" width="563"><figcaption><p>Copy rows</p></figcaption></figure></div>

<div align="left"><figure><img src="../_assets/images/distribute-rows.png" alt="Distribute rows" width="563"><figcaption><p>Distribute rows</p></figcaption></figure></div>

<figure><img src="../_assets/images/transformations.jpeg" alt="Steps"><figcaption><p>Steps</p></figcaption></figure>

### 2. Parallelism

> **Note:**
>
> #### **Parallelism**
> 
> When a transformation starts, all its steps start at the same time. Each hop is a buffer that holds 10,000 rows by default.
> 
> As soon as the first step has read some rows, it writes them into its outgoing hop. The next step reads them from there while the first step is still reading, and writes its own output into the next hop, and so on down the line. Rows stream through; no step waits for the one before it to finish. You set the buffer size on the **Miscellaneous** tab of **Transformation properties**.

<figure><img src="../_assets/images/parallelism.png" alt="Parallelism" width="563"><figcaption><p>parallelism</p></figcaption></figure>

> **Note:**
>
> #### **Adjusting the Queue Size**
> 
> When you tune performance, especially on a machine with plenty of RAM, you may want a larger buffer. It is the **Nr of rows in rowset** setting in **Transformation properties**, and it applies to every hop in the transformation. A larger buffer can let the first steps finish sooner, freeing CPU time for the steps after them.

<div align="center"><figure><img src="../_assets/images/buffer-rows.png" alt="Changing buffer row set" width="563"><figcaption><p>Changing buffer row set</p></figcaption></figure></div>

### 3. Data Types

> **Note:**
>
> #### **Data Types**
> 
> Each PDI data type maps to a Java type, so the field, parameter or variable behaves the way that Java type does.

The following table describes these mappings:

<table><thead><tr><th width="176.66666666666666">PDI Data Type</th><th width="149">Java Data Type</th><th>Description</th><th>Example</th></tr></thead><tbody><tr><td>BigNumber</td><td>BigDecimal</td><td>An arbitrary unlimited precision number.</td><td>3.141592653589793238462643383279502884197169399375105820974944</td></tr><tr><td>Binary</td><td>Byte[]</td><td>An array of bytes that contain any type of binary data.</td><td>An image file or a compressed file can be stored as Binary data</td></tr><tr><td>Boolean</td><td>Boolean</td><td>A boolean value <code>true</code> or <code>false.</code></td><td>A boolean value true or false</td></tr><tr><td>Date</td><td>Date</td><td>A date-time value with millisecond precision.</td><td>2023-10-20T10:48:51.123</td></tr><tr><td><p><mark style="color:red;">Hierarchical -</mark></p><p><mark style="color:red;">EE Plugin 9.5+</mark></p></td><td>BinaryTree</td><td>Data items that are related to each other by hierarchical relationships</td><td>A family tree</td></tr><tr><td>Integer</td><td>Long</td><td>A signed long 64-bit integer.</td><td>42</td></tr><tr><td>Internet Address</td><td>InetAddress</td><td>An Internet Protocol (IP) address.</td><td>192.168.0.1</td></tr><tr><td>Number</td><td>Double</td><td>A double precision floating point value (64bits).</td><td>2.7182818284590452353602874713526624977572470936999</td></tr><tr><td>String</td><td>String</td><td>A variable unlimited length text encoded in UTF-8 (Unicode).</td><td>“Hello world!”</td></tr><tr><td>Timestamp</td><td>Timestamp</td><td>Allows the specification of fractional seconds to a precision of nanoseconds.</td><td>2023-10-20T10:48:51.123456789</td></tr></tbody></table>

### 4. Jobs

> **Note:**
>
> #### **Jobs**
> 
> A job runs transformations and other jobs in a defined order, with conditions between them, to carry out a business process.

> **Note:**
>
> #### **Job Entries**
> 
> Each job entry is one task in the job: run a transformation, run a shell script, execute SQL, copy or check files, and more. Each entry has its own options and parameters.
> 
> Job entries run one after another, following the hops. (An entry can also be set to start the entries after it in parallel.)

<figure><img src="../_assets/images/job-entries.jpeg" alt="Job Entries"><figcaption><p>Job Entries</p></figcaption></figure>

:::

