# Hello World (Job)

> **Warning:**
>
> #### Workshop - Hello World (Job)
> 
> A **job** orchestrates work: it runs transformations and other entries in an order you set, and decides what happens next from each one's success or failure.\
> In this workshop you build the simplest useful job: it runs the Hello World transformation and ends in a success state.
> 
> **What you'll do**
> 
> * Start a job with the **START** entry
> * Run an existing transformation with a **Transformation** entry
> * End in a success state with **Success**
> * Run the job and read its **Job metrics**
> 
> **Prerequisites:** [Review Jobs](../topic-mod5-jobs-review/guide.md); the `tr_hello_world.ktr` transformation from [Hello World](../03-mod2-hello-world/guide.md), also in this lab's **Lab Files**
> 
> **Estimated time:** 20 minutes

<figure>

![The finished job: START, then Transformation A, then Success](../_assets/images/job.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

> **Note:** **Create a new job**
> 
> First copy `tr_hello_world.ktr` from the lab's `solution` folder into the lab folder, `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\29-mod5-hello-world-job` (or use your own from [Hello World](../03-mod2-hello-world/guide.md)). Then select **File > New > Job**, or press `Ctrl+Alt+N` (`Cmd+Alt+N` on macOS), and save the job as `kjb_hello_world.kjb` in the same folder.

:::: tabs

### 1. START

> **Note:**
>
> #### START
> 
> **START** is where a job begins. Every job has exactly one, and the hops leaving it are always unconditional. Its settings include a simple repeat schedule, but that only lasts while Spoon or Kitchen keeps running; schedule production jobs with the Pentaho Server instead.

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

2. Create the job as above. From the **General** folder of the **Design** tab, drag **START** onto the canvas.

### 2. Transformation

> **Note:**
>
> #### Transformation
> 
> The **Transformation** entry runs a transformation from a file, and its result (success or failure) becomes the entry's result.

1. From the **General** folder, drag **Transformation** onto the canvas and double-click it.
2. Set **Entry Name** to `Transformation A` and **Transformation** to:

   ```text
   ${Internal.Entry.Current.Directory}/tr_hello_world.ktr
   ```

   `${Internal.Entry.Current.Directory}` is the job's own folder, so the job finds the transformation wherever the two are copied together.

<figure><img src="../_assets/images/job-transformation-a.png" alt="Transformation entry: name Transformation A, transformation ${Internal.Entry.Current.Directory}/tr_hello_world.ktr, run configuration Pentaho local"><figcaption><p>The Transformation entry</p></figcaption></figure>

3. Keep **Run configuration** `Pentaho local` and select **OK**.

### 3. Success

> **Note:**
>
> #### Success
> 
> **Success** clears any error state and ends the job as successful.

1. From the **General** folder, drag **Success** onto the canvas.
2. Create the hops **START** to **Transformation A** to **Success** (hold `Shift` and drag, as in a transformation). The hop from **START** shows a lock: it is unconditional. The second hop is green: it is followed only when **Transformation A** succeeds.

### 4. Run

> **Note:**
>
> #### Run the job
> 
> Run it, then read what each entry did.

1. Save the job, select **Run** in the toolbar, then **Run** in **Run Options**.
2. In **Execution Results**, open the **Job metrics** tab.

<figure><img src="../_assets/images/job-step-metrics.png" alt="Job metrics: START, Transformation A and Success each finish with result Success"><figcaption><p>Job metrics: one entry after another</p></figcaption></figure>

> **Success:** Checkpoint: **START**, **Transformation A** and **Success** each end with **Result** `Success`, in that order. **Transformation A** was reached by "Followed unconditional link", and **Success** by "Followed link after success".

3. Open the **Metrics** tab: a timeline of the job, its entry, and the transformation's initialization and steps inside it.

<figure><img src="../_assets/images/job-metrics.png" alt="Metrics tab: a timeline bar for the job, the job entry, and the transformation's initialization and steps"><figcaption><p>Metrics: where the time went</p></figcaption></figure>

> **Under the hood:**
>
> #### A job runs one entry at a time; a transformation runs every step at once
>
> This is a different engine. Where a transformation starts every step
> on its own thread and streams rows between them, a job walks its
> entries **in sequence**: START, then the **Transformation** entry,
> then **Success**. Each entry returns a *result* (success or failure,
> plus lists of rows and files), and the hop colors are conditions on
> that result: green follows success, red follows failure, and a lock
> means unconditional.
>
> The Transformation entry did something more. It loaded
> `tr_hello_world.ktr`, started the full multithreaded transformation
> engine inside the job, waited for it to finish, and turned its outcome
> into the entry's result. **Success** then ended the job as successful.
>
> **Why it matters:** this split is PDI's design rule. Rows and data
> logic belong in transformations; order, conditions, retries and
> notifications belong in jobs. Keep them apart and each stays simple.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

### Solution <!-- no-step -->

The finished job and transformations for this lab. Open them alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\29-mod5-hello-world-job\solution`.

[kjb_hello_world.kjb](./files/kjb_hello_world.kjb) <button data-launch="spoon" data-path="files/kjb_hello_world.kjb">Open in Pentaho Data Integration</button> <button data-graph="files/kjb_hello_world.kjb">View graph</button>

[tr_hello_world.ktr](./files/tr_hello_world.ktr) <button data-launch="spoon" data-path="files/tr_hello_world.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_hello_world.ktr">View graph</button>
