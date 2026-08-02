# Daily Sales Pipeline

> **Capstone Project — bring it all together.**

You're a freshly-onboarded data engineer at a regional retailer. The
analytics team needs **yesterday's sales** ready by 9am every morning,
joined with customer and product master data, with historical
attribute changes tracked, validated, and loaded into a dimensional
model the BI tools can query.

This capstone asks you to build that pipeline. It exercises every
module of the course — from variables and steps through to jobs,
scheduling, and scaling.

> **Objectives:**
>
> - Build a parameterised PDI **job** that ingests three data sources, validates them, enriches with master data, and loads a fact + dimension table.
> - Demonstrate **production-readiness**: error handling, logging, parameters, scheduled execution.
> - Produce a complete artefact you can show in interviews ("I built this for my Practitioner cert").
>
> **Estimated time:** 90-120 minutes for a clean, well-named solution. Re-shape and revisit as you'd like.

---

## Inputs

Download the four files from **Lab Files** at the bottom of this
page, and put them in a `data/` folder under the workshop root you
will point `${WORKSHOP_HOME}` at (for example
`C:/Workshop/capstone/data/`). Every path in this capstone is written
as `${WORKSHOP_HOME}/data/...`, so once the variable is set the
transformations resolve without further edits.

Each file represents a realistic feed you'd see in a small retail
environment.

| File | What | How to read it |
| --- | --- | --- |
| `sales_20260101.csv` | Yesterday's orders (40 rows, 2 with intentionally bad keys for the validation step) | **Text File Input** — header row, comma delimiter |
| `customers.json` | Customer master (20 rows under `$.customers[*]`) | **JSON Input** — JSONPath `$.customers[*]` |
| `products.csv` | Product catalogue (13 SKUs across 3 categories) | **Text File Input** — header row, comma delimiter |
| `regions.csv` | Region reference (5 regions) | **Text File Input** — header row, comma delimiter |

Two of the sales rows have intentionally missing keys (one missing
`customer_id`, one missing `product_id`) — they're there to give your
validation step something real to catch.

---

## Required behaviour

Build a job (`.kjb`) that runs the following stages, end to end.
Each numbered stage maps to a module in the course — the capstone is
explicit about which skills it's exercising so you can double-check
yourself.

### 1. Parameterise the run *(Module 1)*

Create a `kettle.properties` (or transformation parameters) for:

- `${WORKSHOP_HOME}` — root path containing the `data/` folder
- `${SALES_DATE}` — the date suffix on the CSV (`20260101`)
- `${OUTPUT_PATH}` — where to write the fact + summary outputs

Nothing in the transformations should be hard-coded.

### 2. Read the three sources *(Module 3)*

Three transformations, each reading one source:

- `stage_orders.ktr` — Text File Input → `sales_${SALES_DATE}.csv`
- `stage_customers.ktr` — JSON Input → `customers.json` with JSONPath `$.customers[*]`
- `stage_products.ktr` — Text File Input → `products.csv`

### 3. Validate *(Module 2)*

Add a Filter Rows step that routes any sale missing `customer_id` OR
`product_id` to an **error stream**. Log the count of rejected rows
with **Write to Log** at level `Basic`. Pass the valid rows
downstream.

### 4. Enrich *(Module 4)*

- **Stream Lookup** — bring in customer name + region_code from the staged customers
- **Merge Join** (sort both sides on `product_id` first) — bring in product name + cost
- **Stream Lookup** — bring in region name from `regions.csv`

### 5. Calculate *(Module 4)*

Use a **Formula** step to compute:

```
revenue       = qty * unit_price * (1 - discount_pct / 100)
gross_margin  = revenue - (qty * cost)
```

### 6. SCD Type 2 on regions *(Module 3)*

If you have a database connection available, use **Dimension
Lookup/Update** against a `dim_region` table so a region's
`manager_email` change is tracked with valid-from / valid-to dates.

If no DB is wired up, write the dimension to `${OUTPUT_PATH}/dim_region.csv`
with the SCD columns (`valid_from`, `valid_to`, `is_current`)
maintained manually using a Combination Lookup-style pattern.

### 7. Write outputs *(Module 3)*

- **Table Output** to a `fact_sales` table  *(or Text File Output to `${OUTPUT_PATH}/fact_sales.csv` if no DB)*
- **Excel Writer** to `${OUTPUT_PATH}/sales_summary_${SALES_DATE}.xlsx` — by region: revenue, gross margin, order count

### 8. Job orchestration *(Module 5)*

Wrap the transformations in a job:

```
Start
  → Set Variables (read kettle.properties values into job vars)
  → stage_orders.ktr
  → stage_customers.ktr      (in parallel with orders if you want)
  → stage_products.ktr
  → build_fact.ktr
  → maintain_dim_region.ktr
  → write_summary.ktr
Success / Abort job
```

Use a **Mail** step on the failure hop so the on-call engineer gets
notified when something breaks (you can leave the SMTP server stubbed
out — the structure matters).

### 9. Logging *(Module 2)*

Log key counts at the start and end of each major step:

- Rows read from each source
- Rows valid / rejected after validation
- Rows in fact_sales after the joins
- Rows written to dim_region (versioned vs unchanged)

### 10. Run Configuration *(Module 5)*

Define a **Carte** Run Configuration for the job and document — in a
`README.md` next to your `.kjb` — how to invoke it from Kitchen with
parameters:

```
kitchen.sh -file=daily_sales_pipeline.kjb -param:SALES_DATE=20260101
```

---

## Suggested architecture

```
solution/
├── daily_sales_pipeline.kjb      ← the orchestrator
├── stage_orders.ktr              ← ingest + validate sales
├── stage_customers.ktr           ← ingest customers
├── stage_products.ktr            ← ingest products
├── build_fact.ktr                ← joins + Formula → fact_sales
├── maintain_dim_region.ktr       ← SCD Type 2
├── write_summary.ktr             ← Excel by region
├── kettle.properties
└── README.md                     ← invocation + assumptions
```

---

## Hints for the tricky bits

- **JSONPath**: `$.customers[*]` iterates the array; field paths are then `$.id`, `$.name`, `$.region_code` — relative to each iterated object.
- **Sorting before Merge Join**: both inputs MUST be sorted on the join key. Add a Sort Rows step on each side, or `ORDER BY` in the source query.
- **Error handling**: right-click the Filter Rows step → "Define error handling…". The "error" hop becomes red; route bad rows to a Write to Log + Text File Output to keep an audit trail.
- **Stream Lookup vs Database Lookup**: Stream Lookup is in-memory and fastest for small dimensions (regions, customers). Database Lookup hits the DB per row but works for big dimensions that don't fit in memory.
- **SCD Type 2**: Dimension Lookup/Update manages the technical key + valid-from / valid-to dates automatically. Configure the surrogate key, version field, and date fields once; the step does the bookkeeping.
- **Excel Writer**: use the **Append** option set to "Yes" if you're running daily and want to keep the file rolling; "No" creates a fresh file each run.

---

## Lab Files

Click a file to download. Put all four in `${WORKSHOP_HOME}/data/`
before you start — nothing else in the capstone is supplied, the
pipeline itself is yours to build.

[sales_20260101.csv](./files/sales_20260101.csv)

[customers.json](./files/customers.json)

[products.csv](./files/products.csv)

[regions.csv](./files/regions.csv)

---

## Verification checks

After running your job, click **Run checks** below to confirm each
output landed where expected. The checks assume the worked example
paths (`WORKSHOP_HOME=C:/Workshop/capstone`, outputs under
`${WORKSHOP_HOME}/out`) — if yours differ, edit the `checks` block in
this lab's `manifest.json` to match.

---

## Deliverables

Save your work in a `solution/` folder under your workshop root —
`${WORKSHOP_HOME}/solution/`, e.g. `C:/Workshop/capstone/solution/`.

> **Warning:** Don't save it inside the course folder itself. Course
> content is refreshed from the repository on every launch, so
> anything you leave there will be overwritten.

Your `solution/` folder should contain:

1. `daily_sales_pipeline.kjb` — the orchestrator
2. `stage_*.ktr`, `build_fact.ktr`, `maintain_dim_region.ktr`, `write_summary.ktr`
3. `kettle.properties` showing your variable values (with secrets replaced by placeholders)
4. `README.md` describing how to invoke + any assumptions

This becomes a portfolio piece — keep it tidy, name things clearly, and document your decisions.

---

## Optional — Solution walkthrough (spoilers)

<details>
<summary>Click to see a step-by-step walkthrough of one valid solution. Try the capstone yourself first.</summary>

### `stage_orders.ktr`

Steps in order:

1. **Text File Input**: `${WORKSHOP_HOME}/data/sales_${SALES_DATE}.csv`. Comma delimiter. Header row. 7 fields with types — `qty` Integer, `unit_price` Number(10,2), `discount_pct` Number(5,2), the rest String.
2. **Filter Rows**: condition `customer_id IS NOT NULL AND product_id IS NOT NULL`. Right-click → Define error handling → route the false branch to:
3. **Text File Output**: `${OUTPUT_PATH}/rejected_${SALES_DATE}.csv` (audit trail).
4. **Write to Log** (basic level): `Rejected rows for ${SALES_DATE}: <count>`.
5. The good rows continue to **Sort rows** on `product_id`, then a **Copy rows to result** so the parent job's later transformations can pick them up via "Get rows from result".

### `stage_customers.ktr`

1. **JSON Input**: `${WORKSHOP_HOME}/data/customers.json`. JSONPath `$.customers[*]`. Fields `id`, `name`, `email`, `region_code`, `joined_date` — all String except `joined_date` (Date with format `yyyy-MM-dd`).
2. **Copy rows to result** — staged for the fact build.

### `stage_products.ktr`

1. **Text File Input**: `${WORKSHOP_HOME}/data/products.csv`. Header, 4 fields, `cost` as Number(10,2).
2. **Sort rows** on `id` — required for the upcoming Merge Join.
3. **Copy rows to result**.

### `build_fact.ktr`

1. **Get rows from result** — pulls the validated, sorted-by-product orders.
2. **Stream Lookup** — keyed on `customer_id`, returns `name` and `region_code` from the customers stream. (You'll need a second "Get rows from result" + cache; or run customer staging in a sub-transformation, or load to a cache table.)
3. **Merge Join** — INNER on `product_id`. Left input = orders, right = sorted products. Returns `name`, `cost`.
4. **Formula** —
   - `revenue = [qty] * [unit_price] * (1 - [discount_pct] / 100)`
   - `gross_margin = [revenue] - ([qty] * [cost])`
   - Both as Number(12,2).
5. **Stream Lookup** on `region_code` against `regions.csv` (read once at start) → returns `region_name`.
6. **Table Output** to `fact_sales`. Or **Text File Output** to `${OUTPUT_PATH}/fact_sales.csv` if you don't have a DB.
7. **Write to Log**: row count.

### `maintain_dim_region.ktr`

1. **Text File Input**: `${WORKSHOP_HOME}/data/regions.csv`.
2. **Dimension Lookup/Update** against `dim_region` —
   - Technical key: `region_sk` (auto-increment).
   - Lookup field: `code`.
   - Versioned fields: `name`, `manager_email`.
   - Date range: `valid_from`, `valid_to`. SCD type 2 (insert new version on change).

### `write_summary.ktr`

1. **Table Input** (or Text File Input from `fact_sales.csv`): `SELECT region_name, SUM(revenue), SUM(gross_margin), COUNT(*) FROM fact_sales GROUP BY region_name`.
2. **Excel Writer** → `${OUTPUT_PATH}/sales_summary_${SALES_DATE}.xlsx`. One sheet, headers, append=No (fresh file every run).

### `daily_sales_pipeline.kjb`

```
Start
 ↓
Set Variables (load kettle.properties values into job-scope variables)
 ↓
[stage_orders.ktr] [stage_customers.ktr] [stage_products.ktr]   ← three in parallel
 ↓ (all-success hop)
build_fact.ktr
 ↓
maintain_dim_region.ktr
 ↓
write_summary.ktr
 ↓
Success
```

On any **fail** hop: Mail step → notify ops, then Abort job.

### `kettle.properties` example

```properties
WORKSHOP_HOME=C:/Workshop/capstone
SALES_DATE=20260101
OUTPUT_PATH=C:/Workshop/capstone/out
```

### Carte invocation

```
kitchen.sh \
  -file=daily_sales_pipeline.kjb \
  -level=Basic \
  -param:SALES_DATE=20260101 \
  -param:WORKSHOP_HOME=/var/workshop/capstone \
  -param:OUTPUT_PATH=/var/workshop/capstone/out
```

</details>
