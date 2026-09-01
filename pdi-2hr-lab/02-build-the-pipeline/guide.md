# Build the Pipeline Yourself

> **Warning:**
>
> #### Workshop — Build the Pipeline Yourself
>
> Now you build what you just ran: read the sales file, validate it,
> and write the rejects to a file for the source team — from an empty
> canvas.
>
> **What you'll do**
>
> * Read a CSV with **Text file input** (and let PDI detect the columns).
> * Route rows with missing keys to a reject stream with **Filter rows**.
> * Write the rejects to a CSV with **Text file output**.
>
> **Prerequisites:** [Your First Win](../01-first-win/guide.md).
>
> **Estimated Time:** 20 minutes

> **Note:** **Get the data file first.** Download
> `sales_20260101.csv` from **Lab Files** at the bottom of this page
> into `C:\Workshop\pdi-2hr\`.

## Create a new transformation

In PDI: **File > New > Transformation** (or `Ctrl+N`). You get an
empty canvas and, on the left, the **Design** palette — every
capability of the engine, organised by category.

## Read the file

1. In the Design palette, open **Input** and drag **Text file input**
   onto the canvas.
2. Double-click it. Name it `Read sales`.
3. On the **File** tab, click **Browse**, pick
   `C:\Workshop\pdi-2hr\sales_20260101.csv`, then click **Add** so it
   appears in the *Selected files* grid.
4. On the **Content** tab set **Separator** to `,` and make sure
   **Header** is ticked with 1 header line.
5. On the **Fields** tab click **Get Fields** — PDI reads the file
   and detects every column and type for you. Accept the defaults.

> **Note:** **Get Fields matters more than it looks.** You didn't
> declare a schema — the tool read the data and proposed one. In Lab
> 6 you'll point this same pipeline at *your own* file, and this
> button is why that works.

6. Click **Preview rows** at the bottom of the dialog — the same
   habit as Lab 1, available while you're still configuring.
7. Click **OK**.

## Validate the keys

1. From **Flow**, drag **Filter rows** onto the canvas.
2. Draw a hop: hover over `Read sales`, drag from the output
   connector to the filter (or hold `Shift` and drag between steps).
3. Double-click the filter. Name it `Keys present?`.
4. Build the condition: click the left field and pick
   `customer_id`, set the function to `IS NOT NULL`.
5. Click **Add condition** (the + icon), set the second clause to
   `product_id IS NOT NULL`, joined with **AND**.
6. Click **OK**.

## Send the rejects to a file

1. From **Output**, drag **Text file output** onto the canvas.
2. Hop from `Keys present?` to it — when asked, choose the
   **FALSE** (result is false) branch.
3. Double-click it. Name it `Rejects for source team`. Set the
   **Filename** to `C:\Workshop\pdi-2hr\out\rejects` (PDI adds
   `.txt`; switch **Extension** to `csv` if you prefer).
4. On its **Fields** tab, click **Get Fields**, then **OK**.
5. From **Flow**, drag a **Dummy (do nothing)** step on, and hop the
   **TRUE** branch of the filter to it. Name it `Valid rows`.

## Run it

1. Click **Run** (the ▶ in the canvas toolbar), then **Run** again in
   the dialog.
2. Watch the **Step Metrics** tab fill in: 40 rows read, 38 valid,
   2 written to the reject file.
3. Open `C:\Workshop\pdi-2hr\out\rejects.csv` — there are your two
   bad rows, ready to send back to the source system's owner.

* [ ] 40 rows read from the sales file.
* [ ] 2 rows in the reject output.
* [ ] Run finishes with no errors (all steps green-ticked).

## Troubleshooting

<details>

<summary>The hop dialog didn't ask TRUE or FALSE</summary>

Right-click the hop between the filter and the output step and
choose which result to send down it — or right-click the filter step
and set **Define error/result targets**. TRUE and FALSE hops are also
editable inside the Filter rows dialog (the two "Send ... rows to"
dropdowns at the top).

</details>

<details>

<summary>Get Fields typed a column wrong</summary>

Fix it in the grid — that's the point of the grid. Common case:
`order_date` should be `Date` with format `yyyy-MM-dd`.

</details>

---

> **Tip:** You've built and run a validating ingest in one lab. Note
> what you did *not* do: define schemas by hand, write parsing code,
> or deploy anything to test it. Next, the payoff step — joining
> three sources of three different shapes on one canvas.

## Lab Files

[sales_20260101.csv](./files/sales_20260101.csv)

### Solution

Stuck, or want to compare? The complete transformation — it expects
the data file at `C:\Workshop\pdi-2hr\` like the instructions above.

[solution_build_pipeline.ktr](./files/solution_build_pipeline.ktr) <button data-launch="spoon" data-path="files/solution_build_pipeline.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_build_pipeline.ktr">View graph</button>
