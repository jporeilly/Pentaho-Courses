# Daily Sales Pipeline - reference solution

A worked answer to the capstone, laid out by the course installer at
`C:\Workshop-DI-Practitioner\capstone\reference\`. Try the capstone yourself
first: your own work belongs in `capstone\solution\`, which is what the
accreditation checks look at. Nothing here is checked, and nothing here
is ever written to by the pipeline.

## What is here

| File | Role |
| --- | --- |
| `daily_sales_pipeline.kjb` | The orchestrator: parameters, file checks, Create tables (an SQL entry), the staging sub-job, dimension, fact, summary; failure hops to Mail then Abort |
| `stage_all.kjb` | The three stagings, started together (START runs the next entries in parallel); a failure in any one aborts the sub-job |
| `stage_orders.ktr` | Text File Input of `sales_${SALES_DATE}.csv`, validation (missing keys, qty, price, discount) with the rejects written to `out\rejected_${SALES_DATE}.csv` and counted in the log, then Table Output `stg_orders` |
| `stage_customers.ktr` | JSON Input of `customers.json` (`$.customers[*].<field>`), then Table Output `stg_customers` |
| `stage_products.ktr` | Text File Input of `products.csv`, then Table Output `stg_products` |
| `maintain_dim_region.ktr` | `regions.csv` into `dim_region` with Dimension Lookup/Update (Type 2 on `name` and `manager_email`; key `region_sk`, dates `valid_from` / `valid_to`) |
| `build_fact.ktr` | `stg_orders` + Stream Lookup (customers) + Merge Join (products, both sides sorted) + Formula (`revenue` rounded half-up to the cent, `gross_margin`) + the region key from `dim_region`, to `out\fact_sales.csv` and table `fact_sales` |
| `write_summary.ktr` | `fact_sales.csv` grouped by region into `out\sales_summary_${SALES_DATE}.xlsx` |
| `kettle.properties` | The three parameters with the workshop's values |

## Parameters

| Name | Default | Meaning |
| --- | --- | --- |
| `WORKSHOP_HOME` | `C:/Workshop-DI-Practitioner/capstone` | Holds `data\` (the four source files) |
| `SALES_DATE` | `20260101` | The suffix of the day's sales file |
| `OUTPUT_PATH` | `${WORKSHOP_HOME}/out` | Where the fact, the summary and the rejects are written |

The staging tables, `dim_region` and `fact_sales` live in the workshop's
MySQL: the connection is named `capstone` and is defined inside each
file (database `sampledata` on `localhost:3306`, `pentaho_admin` /
`password`, the same server the course's database labs use). The job's
Create tables entry drops and recreates the three staging tables on
every run, and creates `dim_region` and `fact_sales` when they are
missing. `DIAGRAMS.md` beside this file draws
every transformation and the job, step by step.

## Run it

From Spoon: open the job and run it with the parameter defaults. From a
prompt, with PDI's `data-integration` folder on the path:

```
Kitchen.bat -file=daily_sales_pipeline.kjb -level=Basic "-param:SALES_DATE=20260101"
```

## What a correct run produces (the shipped data)

40 sales rows read; 3 rejected for a missing customer or product key; 37
rows in `fact_sales.csv` and the `fact_sales` table; 6 rows in
`dim_region` after the first run: the five regions, plus the
"unknown" row (`region_sk` 1) that Dimension Lookup/Update adds.

| Region | Revenue | Gross margin | Orders |
| --- | ---: | ---: | ---: |
| Midwest | 1619.31 | 613.81 | 7 |
| North East | 1742.19 | 769.79 | 6 |
| North West | 3426.14 | 1529.94 | 11 |
| South East | 2655.46 | 1235.46 | 7 |
| South West | 670.21 | 326.61 | 6 |
| Total | 10113.31 | 4475.61 | 37 |

To see the Type 2 dimension at work, change one `manager_email` in
`data\regions.csv` and run the job again: that region gets a second
version row in `dim_region`, with `valid_from` set to the run date and
the earlier row closed.
