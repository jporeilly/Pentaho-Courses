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

![1788268810024.png](../_assets/images/1788268810024.png)
<p align="center"><em>win_preview.ktr</em></p>

## Preview the valid rows

1. **Right-click** the step named **Valid rows**.
2. Choose **Preview**, then **Quick Launch**.

![1788269301694.png](../_assets/images/1788269301694.png)
<p align="center"><em>Filter rows</em></p>

A grid appears with 37 of yesterday's orders — typed columns, parsed
dates, clean rows. This is the habit that changes how you build pipelines:
**you can look at the data at any step, at any time**, before
anything is written anywhere.

![1788269454987.png](../_assets/images/1788269454987.png)
<p align="center"><em>Preview rows</em></p>

> **Under the hood:**
>
> #### Preview is the real engine, not a simulation
>
> Clicking Preview didn't consult a cached sample or a design-time
> guess. PDI started the actual transformation, ran the real steps
> over the real file, and stopped once it had enough rows to show
> you — writing nothing anywhere.
>
> That is possible because a transformation isn't compiled and
> deployed. Every step is its own thread, and rows travel between
> them through in-memory buffers, so the engine can be started,
> tapped at any point, and stopped again in under a second.
>
> **Why it matters:** there is no build-deploy-check loop here. You
> inspect real data at any point in the flow while you design, which
> is why PDI development tends to converge in minutes rather than in
> rounds of "add a log line, redeploy, look again".

## Preview the rejects

1. Close the preview.
2. **Right-click**: **Rejected rows** → **Preview** → **Quick Launch**.

![1788366469571.png](../_assets/images/1788366469571.png)
<p align="center"><em>Rejected rows</em></p>

Three rows. Two are missing their `customer_id`, one its
`product_id` — they were planted in the file, and the filter caught
all three. In a hand-coded pipeline this is a try/except and a log
line you write yourself; here it's a visible branch in the flow you
can inspect.

> **Under the hood:**
>
> #### Two hops mean two real streams
>
> The filter didn't mark rows good or bad and pass one list along. It
> has two output hops, and each is a genuinely separate stream with
> its own buffer and its own downstream thread. Valid rows go one
> way, rejects the other, and both run at the same time.
>
> **Why it matters:** "what do we do with bad data?" stops being
> error-handling code buried inside a transform and becomes a visible
> path on the canvas — one anybody can point at in a review, and one
> you can preview independently, as you just did.

## Look inside a step

Double-click **Read yesterday's sales**. This is the entire
configuration for parsing the file — delimiter, header, and on the
**Fields** tab, every column with its type and format. No code was
generated; this *is* the pipeline.

![1788269769520.png](../_assets/images/1788269769520.png)
<p align="center"><em>Add - sales data </em></p>

Close the dialog with **Cancel** (so nothing changes).

Double-click **Keys present?*.
The Filter Rows step allows you to filter rows based on conditions and comparisons. 
In this example we're filtering for rows where the ids / keys are not null.

![1788269628158.png](../_assets/images/1788269628158.png)
<p align="center"><em>Filter rows</em></p>

Close the dialog with **Cancel** (so nothing changes).

> **Under the hood:**
>
> #### The dialog is the source code
>
> Nothing was generated from what you just looked at. A `.ktr` file
> is XML describing steps, their settings and the hops between them;
> the dialog reads and writes that XML directly, and the engine
> executes it. There is no build step and no generated artefact that
> can drift from the design.
>
> Two consequences worth knowing: a `.ktr` is plain text, so it
> **diffs and merges in git like code** — and because the same file
> is what the server runs, the thing you tested is literally the
> thing that ships.

## See the flow as a diagram

The same file, rendered by this guide's built-in viewer — click any
step to see its configuration:

<button data-graph="files/win_preview.ktr">View graph</button>

![1788270238088.png](../_assets/images/1788270238088.png)
<p align="center"><em>Graph</em></p>

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
