# Enrich and Join

> **Warning:**
>
> #### Workshop — Enrich and Join
>
> Real pipelines mix formats: your sales arrive as CSV, the customer
> master is JSON from an API export, the product catalogue is another
> CSV. You'll join all three on one canvas and compute a margin —
> with no staging tables and no format wrangling.
>
> **What you'll do**
>
> * Read JSON with **JSON input** and a JSONPath expression.
> * Join streams with **Stream lookup**.
> * Compute revenue and margin with **Calculator**.
>
> **Prerequisites:** [Build the Pipeline Yourself](../02-build-the-pipeline/guide.md) — you'll extend that transformation.
>
> **Estimated Time:** 20 minutes

> **Note:** **Get the files first.** Download `customers.json`,
> `products.csv`, and `regions.csv` from **Lab Files** below into
> `C:\Workshop\pdi-2hr\`.

## Read the customer master (JSON)

1. Open your Lab 2 transformation and save it as
   `enrich_sales.ktr` (**File > Save as**).
2. From **Input**, drag **JSON input** onto an empty part of the
   canvas.
3. Double-click it. Name it `Read customers`. On the **File** tab,
   browse to `C:\Workshop\pdi-2hr\customers.json` and **Add** it.
4. On the **Fields** tab, add rows — one per field. **Path** uses
   JSONPath, relative to the array of customer objects:

| Name | Path | Type |
| --- | --- | --- |
| customer_id | $.customers[*].id | String |
| customer_name | $.customers[*].name | String |
| region_code | $.customers[*].region_code | String |

5. Click **Preview rows** — 20 customers. The nested JSON is now
   just another stream of rows, identical in kind to the CSV stream.

## Read the product catalogue

1. Drag another **Text file input** on. Name it `Read products`.
2. Point it at `C:\Workshop\pdi-2hr\products.csv`, separator `,`,
   header ticked; **Get Fields**; OK.

## Join both onto the sales stream

**Stream lookup** enriches a main stream with fields fetched from a
second stream — a hash join, in-memory, no database required.

1. From **Lookup**, drag **Stream lookup** on. Name it
   `+ customer`.
2. Hop from `Valid rows` (your Lab 2 TRUE branch) into it, and a
   second hop from `Read customers` into it.
3. Double-click it: set **Lookup step** to `Read customers`; in
   *keys to look up*, match `customer_id` = `customer_id`; in
   *fields to retrieve*, add `customer_name` and `region_code`.
4. Repeat the pattern: another **Stream lookup** named `+ product`,
   fed by `+ customer` and `Read products`, matching `product_id` =
   `id`, retrieving `name` (rename to `product_name`), `category`,
   and `cost`.

## Compute revenue and margin

1. From **Transform**, drag **Calculator** on, hopped from
   `+ product`.
2. Add three calculations:

| New field | Calculation | Field A | Field B | Field C | Type |
| --- | --- | --- | --- | --- | --- |
| gross | A * B | qty | unit_price | | Number |
| net | A - ( A * B / 100 ) — use *A - A*B/100* if listed, else two rows | gross | discount_pct | | Number |
| margin | A - ( B * C ) | net | cost | qty | Number |

> **Note:** Calculator's function list is long; if an exact formula
> isn't there, chain two Calculator rows (each row can use the
> previous row's result) — or use the **Formula** step, which accepts
> spreadsheet-style expressions like `[net]-[cost]*[qty]`.

3. Preview the Calculator step: every sale now carries the customer,
   region, product, category — and a margin figure that never existed
   in any source file.

* [ ] Preview shows 38 enriched rows.
* [ ] `margin` is populated and plausible (mostly positive).

## Troubleshooting

<details>

<summary>Stream lookup returns nulls for every row</summary>

The key fields must match in type and value. `customer_id` in sales
and `id` in the JSON are both strings like `C001` — if you renamed
fields differently in Lab 2, adjust the key mapping in the lookup
dialog.

</details>

<details>

<summary>JSON input preview is empty</summary>

Check the Path column: it must start `$.customers[*]` — the array is
under the top-level `customers` key, not at the root.

</details>

---

> **Tip:** Three formats, one canvas, zero staging. The equivalent in
> SQL alone means loading all three into a database first; in code it
> means three parsers and a join you maintain forever. Next: load the
> warehouse — with history.

## Lab Files

[customers.json](./files/customers.json)

[products.csv](./files/products.csv)

[regions.csv](./files/regions.csv)

### Solution

The complete transformation — all three sources joined, margin
computed. Expects the data files at `C:\Workshop\pdi-2hr\`.

[solution_enrich_sales.ktr](./files/solution_enrich_sales.ktr) <button data-launch="spoon" data-path="files/solution_enrich_sales.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution_enrich_sales.ktr">View graph</button>
