# Review Merge

<div class="pcm-intro">

When you have two streams that should become one. Merge Streams stacks rows; Merge Rows (diff) reconciles changes between two snapshots: the building block for change-data-capture patterns.

</div>

**What You'll Learn**

* How to stack two streams, with or without keeping a sort order
* Why streams must share a layout before they meet
* How **Merge rows (diff)** finds the differences between two versions of the same data

> **Note:** **Merging is not joining**
>
> A *merge* stacks rows: every row from each input comes out, and no row is matched with another. A *join* matches rows on a key and combines their fields into one row; that is the [Joins](../topic-mod4-joins-review/guide.md) topic. Either way, rows that meet in one step must have the same layout: the same fields, in the same order, with the same types.

**Append**

**Append streams** outputs every row of its first input (the *head*), then every row of its second (the *tail*). Several hops into any one step stack the rows too, but in arrival order rather than head first. In both pictures, a blue row comes from the first input and an amber row from the second.

<div align="center">
<figure>
<img src="../_assets/images/merge-append.png" alt="Append streams: the first input (head) holds ids 1 and 4, the second (tail) ids 2 and 3; the output is 1, 4, 2, 3, every head row and then every tail row" width="608">
<figcaption>Append streams: every head row, then every tail row</figcaption>
</figure>
</div>

**Sorted merge**

**Sorted merge** interleaves two inputs that are both already sorted on the same key, so the output stays sorted. It doesn't sort; it relies on its inputs being sorted.

<div align="center">
<figure>
<img src="../_assets/images/merge-sorted.png" alt="Sorted merge on id: the same two inputs, each sorted on id, come out as 1, 2, 3, 4, the rows of both inputs interleaved in id order" width="677">
<figcaption>Sorted merge: the same rows, interleaved in id order</figcaption>
</figure>
</div>

::: tabs

### Merge Streams

> **Note:** **Merge Streams**
>
> In the [Merge Streams](../20-mod4-merge-streams/guide.md) workshop you bring two streams with different fields to one layout, with **Add constants** and **Select values**, and merge them in a **Dummy** step.

<div align="center">
<figure>
<img src="../_assets/images/merge-streams-2.png" alt="The Merge Streams transformation: orders and description streams brought to one layout and merged in a Dummy step" width="630">
<figcaption>Merge Streams</figcaption>
</figure>
</div>

### Merge Rows (diff)

> **Note:** **Merge Rows (diff)**
>
> **Merge rows (diff)** compares a *reference* stream with a *compare* stream, matched on key fields that both streams are sorted on, and adds a flag to every row: `identical`, `changed`, `new` or `deleted`. **Synchronize after merge** then turns the flags into inserts, updates and deletes on a table. Together they find and apply what changed between two snapshots: change data capture without database triggers.
>
> In the [Merge Rows (diff)](../21-mod4-merge-streams-diff/guide.md) workshop you compare two files, then a file with a table.

<div align="center">
<figure>
<img src="../_assets/images/merge-rows-diff.png" alt="A table and a sorted file feeding Merge Rows (diff), which feeds Synchronize after merge" width="641">
<figcaption>Merge Rows (diff)</figcaption>
</figure>
</div>

:::
