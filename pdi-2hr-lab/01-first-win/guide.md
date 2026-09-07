# Your First Win

> **Warning:**
>
> #### Workshop — Your First Win
>
> Before any theory, see the product do something. You'll open a
> finished pipeline, run it, and watch it separate good data from bad
> — in under ten minutes, without writing a line of code.
>
> **What you'll do**
>
> * Open a prepared transformation in PDI.
> * Preview live data at any point in the flow.
> * See two bad rows get caught automatically.
>
> **Prerequisites:** [Before You Arrive](../00-before-you-arrive/guide.md) completed.
>
> **Estimated Time:** 10 minutes

> **Note:** **The scenario for the next two hours.** You're the data
> engineer at a small retailer. Every morning, yesterday's sales must
> be validated, joined with customer and product master data, and
> loaded into the warehouse — with history tracked — by 9am. Today
> you build that pipeline. This lab shows you the finished first
> stage so you know where you're going.

## Open the pipeline

Click the button below — PDI opens with the transformation loaded.
(If PDI is already running, the file path is copied to your
clipboard: switch to PDI, press `Ctrl+O`, `Ctrl+V`, `Enter`.)

<button data-launch="spoon" data-path="files/win_preview.ktr">Open in Pentaho Data Integration</button>

You should see three connected steps on the canvas: a file reader, a
filter, and two end points — one for valid rows, one for rejects.

<figure>

![win_preview open in Spoon: Read yesterday's sales flows into the Keys present? filter, which splits into Valid rows and Rejected rows](../_assets/images/1788268810024.png)

<div align="center">
<figcaption><em>win_preview.ktr</em></figcaption>
</div>
</figure>

## Preview the valid rows

1. **Right-click** the step named **Valid rows**.
2. Choose **Preview**, then **Quick Launch**.

<figure>

![Transformation debug dialog opened from right-click Preview on Valid rows, with Quick Launch highlighted](../_assets/images/1788269301694.png)

<div align="center">
<figcaption><em>Preview → Quick Launch</em></figcaption>
</div>
</figure>

A grid appears with 37 of yesterday's orders — typed columns, parsed
dates, clean rows. This is the habit that changes how you build pipelines:
**you can look at the data at any step, at any time**, before
anything is written anywhere.

<div align="center">
<figure>

![Examine preview data: the 37 valid rows with typed columns order_id, order_date, customer_id, product_id, qty, unit_price and discount_pct](../_assets/images/1788269454987.png)

<figcaption><em>Preview rows</em></figcaption>
</figure>
</div>

> **Under the hood:**
>
> #### Preview is the real engine, not a simulation
>
> Three words first, because you will see them everywhere. The picture
> on the canvas is a **transformation**: PDI's name for a pipeline that
> reads rows, changes them and writes them somewhere. Each box is a
> **step**, one thing the data passes through: read a file, keep or
> drop rows, write a file. The arrows are **hops**, and a hop carries
> rows from one step to the next.
>
> When you clicked Preview, PDI did not show you a cached sample or a
> guess made at design time. It started the transformation for real,
> ran every step over the real file, and stopped once it had enough
> rows to show you, writing nothing anywhere.
>
> It can do that because there is nothing to compile or deploy first.
> Each step is a small independent worker, and rows pass between the
> workers in little batches, so the whole thing starts in under a
> second, can be watched at any step, and stops just as fast.
>
> **Why it matters:** there is no build-then-deploy-then-check loop.
> You look at real data at any point in the flow while you are still
> designing, which is why work in PDI tends to converge in minutes
> rather than in rounds of "add a log line, redeploy, look again".

## Preview the rejects

1. Close the preview.
2. **Right-click**: **Rejected rows** → **Preview** → **Quick Launch**.

<div align="center">
<figure>

![Examine preview data: the three rejected rows, each with a null customer_id or product_id](../_assets/images/1788366469571.png)

<figcaption><em>Rejected rows</em></figcaption>
</figure>
</div>

Three rows. Two are missing their `customer_id`, one its
`product_id` — they were planted in the file, and the filter caught
all three. In a hand-coded pipeline this is a try/except and a log
line you write yourself; here it's a visible branch in the flow you
can inspect.

> **Under the hood:**
>
> #### Two hops mean two real streams
>
> The filter step did not tag rows as good or bad and pass one list
> along. It has two outgoing hops (the arrows leaving it), and each
> one is a genuinely separate stream of rows, with its own small
> buffer and its own worker downstream. Valid rows go one way, rejects
> the other, and both branches run at the same time.
>
> That is what Preview on Rejected rows just showed you: the reject
> branch is real data you can look at on its own, not a line in a
> log file.
>
> **Why it matters:** "what do we do with bad data?" stops being
> error-handling code buried inside a program and becomes a visible
> path on the canvas, one anybody can point at in a review and one you
> can preview independently, as you just did.

## Look inside a step

Double-click **Read yesterday's sales**. This is the entire
configuration for parsing the file — delimiter, header, and on the
**Fields** tab, every column with its type and format. No code was
generated; this *is* the pipeline.

<div align="center">
<figure>

![Text file input dialog, File tab, with sales_20260101.csv listed under Selected files](../_assets/images/1788269769520.png)

<figcaption><em>Add - sales data</em></figcaption>
</figure>
</div>

Close the dialog with **Cancel** (so nothing changes).

Double-click **Keys present?*.
The Filter Rows step allows you to filter rows based on conditions and comparisons. 
In this example we're filtering for rows where the ids / keys are not null.

<div align="center">
<figure>

![Filter rows dialog: customer_id IS NOT NULL AND product_id IS NOT NULL, true rows to Valid rows, false rows to Rejected rows](../_assets/images/1788269628158.png)

<figcaption><em>Filter rows</em></figcaption>
</figure>
</div>

Close the dialog with **Cancel** (so nothing changes).

> **Under the hood:**
>
> #### The dialog is the source code
>
> Nothing was generated from what you just looked at. The file you
> opened, `win_preview.ktr`, is PDI's transformation file; the
> extension is short for "Kettle transformation", after the engine's
> original name. Inside it is plain text in XML: a list of the steps,
> each step's settings, and the hops between them. The dialog you
> opened reads that text and writes it back, and the engine runs the
> same text. There is no build step, and no generated program that can
> drift away from what you see on the canvas.
>
> Two consequences worth knowing. Because it is plain text, a
> transformation can live in version control alongside your code, and
> two people's changes to it can be compared and merged. And because
> the same file is what a server runs later, the thing you tested is
> literally the thing that ships.

## See the flow as a diagram

The same file, rendered by this guide's built-in viewer — click any
step to see its configuration:

<button data-graph="files/win_preview.ktr">View graph</button>

<figure>

![The guide's Graph tab rendering win_preview as a flowchart of four steps and three hops, with Summary and Walkthrough buttons](../_assets/images/1788270238088.png)

<div align="center">
<figcaption><em>Graph</em></figcaption>
</div>
</figure>

Try out the other AI options:
- **Summary:** summarized in a few sentences.
- **Walkthrough:** Steep-by-step walkthrough of the transformation.
- **Explain this Step:** Click on a Step to view its properties and 'Explanation'. 


## Troubleshooting

<details>

<summary>Preview shows no rows / a file-not-found error</summary>

The transformation looks for `sales_20260101.csv` in the same folder
as the `.ktr` — this works when you opened it via the button above.
If you copied the `.ktr` elsewhere, copy the CSV (from **Lab Files**
below) next to it.

</details>

---

> **Tip:** Ten minutes in, you've run a pipeline, previewed data
> mid-flow, and caught bad rows. Next: build this exact
> transformation yourself, from an empty canvas — it takes about
> fifteen minutes.

## Lab Files

[sales_20260101.csv](./files/sales_20260101.csv)

[win_preview.ktr](./files/win_preview.ktr) <button data-launch="spoon" data-path="files/win_preview.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/win_preview.ktr">View graph</button>
