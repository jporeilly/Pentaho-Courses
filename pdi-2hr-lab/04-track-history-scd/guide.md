# Track History with One Step

> **Warning:**
>
> #### Workshop — Track History with One Step
>
> When a customer moves region, yesterday's reports must still show
> the old region and today's the new one. That's a Type 2 Slowly
> Changing Dimension — normally a page of carefully-ordered MERGE
> SQL. In PDI it's one step: **Dimension lookup/update**.
>
> **What you'll do**
>
> * Create a customer dimension table in MySQL — from inside PDI.
> * Load it with **Dimension lookup/update** (Type 2 SCD).
> * Change a customer's region, reload, and see history preserved.
>
> **Prerequisites:** [Enrich and Join](../03-enrich-and-join/guide.md); the workshop MySQL running (green in [Before You Arrive](../00-before-you-arrive/guide.md)).
>
> **Estimated Time:** 20 minutes

## Connect to the database

1. New transformation: `load_dim_customer.ktr`.
2. Drag a **JSON input** on, configured exactly like Lab 3's
   `Read customers` (same three fields — copy/paste the step between
   transformations with `Ctrl+C`/`Ctrl+V` if you like), but pointed
   at **this lab's own copy** of the file:
   `C:\Workshop\pdi-2hr\03-make-it-yours\04-track-history\customers.json`
   — you'll be editing it shortly, and Lab 3's copy stays pristine.
3. In the **View** tab (left panel), right-click **Database
   connections > New**:

* **Connection name:** `warehouse`
* **Connection type:** MySQL
* **Host name:** `localhost` · **Port:** `3306`
* **Database name:** `sampledata`
* **Username:** `pentaho_admin` · **Password:** `password`

4. Click **Test** — you should see *Connection ... is OK*.

> **Note:** If the test complains about a missing driver or public
> key retrieval, see Troubleshooting below — it's a one-time fix.

## Configure the dimension step

1. From **Data Warehouse**, drag **Dimension lookup/update** onto
   the canvas and hop `Read customers` into it.
2. Double-click it:

* Tick **Update the dimension?** (top checkbox) — we're loading, not
  just looking up.
* **Connection:** `warehouse` · **Target table:** `dim_customer`
* **Technical key field:** `customer_tk` · **Version field:** `version`
* **Date range start field:** `date_from` · **Table daterange end:** `date_to`
* On the **Keys** tab: dimension field `customer_id` matches stream
  field `customer_id`.
* On the **Fields** tab, add `customer_name` and `region_code`, both
  with update type **Insert** (that's what makes changes create a new
  version instead of overwriting).

3. Click **SQL** at the bottom. PDI writes the `CREATE TABLE` (keys,
   version, date range, indexes) for you — click **Execute**, then
   close.

> **Note:** Read that generated DDL before you close it. That is the
> entire Type 2 apparatus — surrogate key, version counter, validity
> window — designed and created for you.

## First load

1. Run the transformation. 20 rows in, 20 dimension rows written.
2. Verify from any MySQL client:

```sql
SELECT customer_tk, customer_id, customer_name, region_code,
       version, date_from, date_to
FROM   sampledata.dim_customer
ORDER  BY customer_id, version;
```

Every customer: version 1, open-ended validity — **21 rows in
total**: your 20 customers plus a technical "unknown" row
(`customer_tk` 0) the step inserts automatically, so later fact
loads can point failed lookups somewhere instead of dropping rows.

## Now change history

1. Open
   `C:\Workshop\pdi-2hr\03-make-it-yours\04-track-history\customers.json`
   in a text editor.
2. Find **C001 (Aiden Marsh)** and change `"region_code": "NW"` to
   `"region_code": "SE"`. Save.
3. Run the transformation again.
4. Re-run the SQL above.

C001 now has **two rows**: version 1 (NW) with its validity window
closed, and version 2 (SE) open-ended. Every other customer is
untouched. Report yesterday's sales and C001 is in the North West;
report today's and they're in the South East — both correct.

> **Under the hood:**
>
> #### What that one step actually did
>
> For every incoming row, **Dimension lookup/update** ran the whole
> Type 2 algorithm:
>
> 1. Looked up the current open version by natural key (`customer_id`),
>    from a cache it built rather than a query per row.
> 2. Compared the tracked fields to decide **unchanged / changed /
>    new** — 19 rows took the first branch and cost nothing.
> 3. For the changed one: issued an `UPDATE` closing version 1's
>    `date_to` at the run timestamp, then an `INSERT` for version 2
>    with a fresh surrogate key, `version` incremented, and
>    `date_from` set to the same instant — so the windows abut
>    exactly, with no gap and no overlap.
> 4. Allocated that surrogate key itself, keeping the technical key
>    independent of the source system's identifier.
>
> The equivalent hand-written SQL is a page of `MERGE` with a
> correlated sub-query, and its bugs are the expensive kind: an
> overlapping window that double-counts revenue, or a gap that makes
> yesterday's report irreproducible.
>
> **Why it matters:** history is a *configuration* here, not an
> implementation. Ticking "Insert" on a field is the difference
> between overwriting the past and keeping it — and that decision is
> visible in a dialog anybody can audit, rather than buried in SQL
> only its author understands.

* [ ] First run: 21 rows in `dim_customer` (20 customers + the
      technical "unknown" row).
* [ ] After the edit and second run: 22 rows, C001 at version 2 with
      version 1's validity window closed.

## Troubleshooting

<details>

<summary>Connection test fails: driver not found</summary>

Download the MySQL Connector/J jar and drop it into
`data-integration\lib\`, then restart PDI. Developer Edition doesn't
bundle every vendor's driver for licensing reasons — one jar, once.

</details>

<details>

<summary>Connection test fails: Public Key Retrieval is not allowed</summary>

In the connection dialog, open **Options** and add parameter
`allowPublicKeyRetrieval` = `true`.

</details>

---

> **Tip:** This is the lab people remember. Ask yourself what the
> equivalent MERGE-plus-history SQL looks like in your current stack,
> who wrote it, and whether anyone dares touch it. Next: one pipeline
> that handles *many* file shapes.

## Lab Files

[customers.json](./files/customers.json) — download into this lab's workshop folder: `C:\Workshop\pdi-2hr\03-make-it-yours\04-track-history\`.

### Solution

The complete transformation, with the `warehouse` connection
already defined (localhost MySQL, `pentaho_admin`). On first use,
open the dimension step and click **SQL** to create the table.

[solution_load_dim_customer.ktr](./files/solution_load_dim_customer.ktr) <button data-launch="spoon" data-path="files/solution_load_dim_customer.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_load_dim_customer.ktr">View graph</button>
