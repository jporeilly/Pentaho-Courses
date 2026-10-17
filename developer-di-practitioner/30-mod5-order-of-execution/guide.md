# Order of Execution

> **Warning:**
>
> #### Workshop - Order of Execution
> 
> When a job entry has two hops leaving it, which branch runs first, and does the second wait for the first? This workshop builds one job, runs it, reads the order from the log, then switches the same job to run its branches in parallel.
> 
> **What you'll do**
> 
> * Build a job with two branches from **Start**
> * Read the execution order from the log
> * Run the branches in parallel with **Run Next Entries in Parallel**
> * See what parallel does, and doesn't, guarantee
> 
> **Prerequisites:** [Hello World (Job)](../29-mod5-hello-world-job/guide.md); this lab reuses its `tr_hello_world.ktr`, also in **Lab Files**.
> 
> **Estimated time:** 25 minutes

:::: tabs

### 1. Build the Job

> **Note:**
>
> #### Build the Job
>
> Two branches leave **Start**: one runs **Transformation A**, then **Transformation C**, then **Success**; the other runs **Transformation B** alone. All three entries run the same Hello World transformation.

1. Start Spoon with the **Start PDI** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

<button data-launch="spoon" data-path="">Start PDI</button>

2. Copy `tr_hello_world.ktr` from the lab's `solution` folder, `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\30-mod5-order-of-execution\solution`, into the lab folder, `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\30-mod5-order-of-execution`.
3. Select **File > New > Job** (`Ctrl+Alt+N`).
4. Select **File > Save as** and save it as `kjb_hello_world_backward.kjb` in `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\30-mod5-order-of-execution`.
5. On the **Design** tab, open the **General** folder and drag **Start** onto the canvas.
6. From the **General** folder, drag **Transformation** onto the canvas.
7. Double-click the new **Transformation** entry.
8. Set **Entry Name** to `Transformation A`.
9. Set **Transformation** to `${Internal.Entry.Current.Directory}/tr_hello_world.ktr`, and select **OK**. The label under the entry now reads **Transformation A**.
10. Repeat steps 6 to 9 twice more, with the same **Transformation** setting: set **Entry Name** to `Transformation B` the first time and `Transformation C` the second. Check that each label on the canvas shows its new name.
11. From the **General** folder, drag **Success** onto the canvas.
12. Create the hops in this order. The order matters: tab 2 shows why.
    * Create a hop from **Start** to **Transformation A**: hold `Shift` and drag from one entry to the other. It is an unconditional hop: it shows a lock.
    * Create a hop from **Start** to **Transformation B**. It is unconditional too.
    * Create a hop from **Transformation A** to **Transformation C**. Spoon makes it a **Result is TRUE** hop: green, with a check mark.
    * Create a hop from **Transformation C** to **Success**, also a **Result is TRUE** hop.
13. Save the job (`Ctrl+S`).

<figure><img src="../_assets/images/job-backward-chaining.png" alt="START branches to Transformation A, then C and Success, and to Transformation B"><figcaption><p>Two branches from Start</p></figcaption></figure>

> **Success:** Checkpoint: your canvas matches the figure. The two hops from **Start** show a lock; the hops from **Transformation A** and **Transformation C** are green. (The solution and the figure name the first entry `START`; Spoon names a new one `Start`. The name makes no difference.)

### 2. Run It and Read the Order

> **Note:**
>
> #### Run It and Read the Order
>
> Run the job, then read in the log which entry started when.

1. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
2. In **Execution Results**, open the **Logging** tab. Find the `Starting entry` lines.

> **Success:** Checkpoint: the entries start in this order:
>
> ```text
> Starting entry [Transformation A]
> Starting entry [Transformation C]
> Starting entry [Success]
> Starting entry [Transformation B]
> ```
>
> **Transformation B** is the second hop out of **Start**, yet it starts last, after the whole A, C, Success branch has finished.

3. Run the job again (`F9`, then **Run**). The order is the same on every run.

> **Under the hood:**
>
> #### A job walks one branch to its end before it takes the next
>
> A job runs on a single thread and follows its hops depth-first. From
> Start it takes the first hop to Transformation A, runs it, follows
> A's hop to C, runs that, then Success. Only when that branch has no
> further hops does it come back to Start and take the next hop, to
> Transformation B.
>
> "First" means the order the hops are stored in the job, which is
> broadly the order you drew them. It is not left-to-right or
> top-to-bottom on the canvas, so two jobs that look the same can run
> in different orders.
>
> **Why it matters:** never rely on drawing order for anything that
> must happen in sequence. If B needs A's output, put B *after* A on
> the same branch.

### 3. Run the Branches in Parallel

> **Note:**
>
> #### Run the Branches in Parallel
>
> The same job, with one setting changed on **Start**: the entries after it no longer wait for each other's branch.

1. Select **File > Save as** and save the job as `kjb_hello_world_parallel.kjb` in `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\30-mod5-order-of-execution`.
2. Right-click **Start** and select **Run Next Entries in Parallel**.
3. Read the **Warning!** dialog and select **I understand**. The hops from **Start** turn dashed, with a parallel marker.

<figure><img src="../_assets/images/job-parallel-transformations.png" alt="The same job with dashed parallel hops from Start"><figcaption><p>Run Next Entries in Parallel on Start</p></figcaption></figure>

4. Save the job (`Ctrl+S`).
5. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog.
6. In **Execution Results**, open the **Logging** tab and find the `Starting entry` lines.

> **Success:** Checkpoint: **Transformation A** and **Transformation B** now start at about the same time, on separate threads, so their two `Starting entry` lines can come in either order. Two things hold on every run: `Starting entry [Transformation C]` comes after `Starting entry [Transformation A]`, and `Starting entry [Success]` comes after `Starting entry [Transformation C]`.

7. Run the job a few more times (`F9`, then **Run**) and compare the order of the A and B lines.

> **Under the hood:**
>
> #### Parallel applies to everything after the entry, not only the next hop
>
> With the option on, the job starts each branch from Start on its own
> thread, so A and B run at the same time. The setting carries on down
> each branch: everything after Start is now launched in parallel, not
> only the next entries, which is what the hop's tooltip warns about.
> Within a branch, an entry still waits for the one before it: C waits
> for A, and Success for C.
> To go back to running one entry at a time after a parallel split,
> put the parallel part in a sub-job.
>
> The warning is serious: PDI does no concurrency checking between
> parallel branches. Two branches writing the same file or table can
> interfere.
>
> **Why it matters:** parallel branches save time when the work is
> independent, such as loading three unrelated staging tables. When
> one branch needs another's result, keep them serial.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and press `Ctrl+O`, `Ctrl+V`, `Enter`.

### Solution <!-- no-step -->

The two finished jobs and the transformation they run. Run each and compare the order of the `Starting entry` lines in the log.

Also on disk at `C:\Workshop-DI-Practitioner\05-enterprise-solution\01-jobs\30-mod5-order-of-execution\solution`.

[kjb_hello_world_backward.kjb](./files/kjb_hello_world_backward.kjb) <button data-launch="spoon" data-path="files/kjb_hello_world_backward.kjb">Open in Pentaho Data Integration</button> <button data-graph="files/kjb_hello_world_backward.kjb">View graph</button>

[kjb_hello_world_parallel.kjb](./files/kjb_hello_world_parallel.kjb) <button data-launch="spoon" data-path="files/kjb_hello_world_parallel.kjb">Open in Pentaho Data Integration</button> <button data-graph="files/kjb_hello_world_parallel.kjb">View graph</button>

[tr_hello_world.ktr](./files/tr_hello_world.ktr) <button data-launch="spoon" data-path="files/tr_hello_world.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_hello_world.ktr">View graph</button>
