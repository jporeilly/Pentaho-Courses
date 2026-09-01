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
   `Read customers` (same file, same three fields — or copy/paste
   the step between transformations with `Ctrl+C`/`Ctrl+V`).
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

Every customer: version 1, open-ended validity.

## Now change history

1. Open `C:\Workshop\pdi-2hr\customers.json` in a text editor.
2. Find **C001 (Aiden Marsh)** and change `"region_code": "NW"` to
   `"region_code": "SE"`. Save.
3. Run the transformation again.
4. Re-run the SQL above.

C001 now has **two rows**: version 1 (NW) with its validity window
closed, and version 2 (SE) open-ended. Every other customer is
untouched. Report yesterday's sales and C001 is in the North West;
report today's and they're in the South East — both correct.

* [ ] First run: 20 rows in `dim_customer`.
* [ ] After the edit and second run: 21 rows, C001 at version 2.

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

[customers.json](./files/customers.json) — same file as Lab 3; download here if you jumped straight to this lab.

### Solution

The complete transformation, with the `warehouse` connection
already defined (localhost MySQL, `pentaho_admin`). On first use,
open the dimension step and click **SQL** to create the table.

[solution_load_dim_customer.ktr](./files/solution_load_dim_customer.ktr) <button data-launch="spoon" data-path="files/solution_load_dim_customer.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_load_dim_customer.ktr">View graph</button>
