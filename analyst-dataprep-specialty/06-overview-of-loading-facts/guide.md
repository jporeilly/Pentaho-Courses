# Overview of Loading Facts

<div class="pcm-intro">

A fact load reads the order lines of the source and writes them into the fact table with the dimensions' surrogate keys in place of the source's own keys. It is the busiest transformation in a mart, and the one whose mistakes are hardest to see: a wrong key still adds up, to the wrong customer. This module loads `mart_fact_sales`, then the summary tables that let a cube answer high-level questions without reading every order line.

</div>

**What You'll Learn**

* **What a fact load does** - swap each natural key for a surrogate key, compute the measures, write the row.
* **Three lookups, three techniques** - the date, the customer version and the product, each found the way that suits its dimension.
* **Unknown members** - what key `0` is for, and why a fact row should never be dropped for a missing dimension row.
* **Loading without duplicates** - making a load safe to run twice.
* **Summary tables** - fact rows pre-summed at a coarser grain, named so Mondrian can use them.

:::: tabs

### 1. What a Fact Load Does

> **Note:**
>
> #### **What a Fact Load Does**
>
> An order line arrives with the order system's keys: an order date, a customer number, a product code. The fact table wants the mart's keys. Between the two sit one lookup per dimension and one calculation per derived measure.

One order line, before and after:

| Source field | Value | Becomes | Value |
| ------------ | ----- | ------- | ----- |
| `order_date` | 2003-01-06 | `date_key` | `20030106` |
| `customer_number` | `363` | `customer_key` | `86` |
| `product_code` | `S24_3969` | `product_key` | `80` |
| `quantity_ordered`, `price_each` | 49, 34.47 | `sales_amount` | 1689.03 |
| `order_number`, `order_line_number`, `status` | 10100, 1, Shipped | The same | Kept as the degenerate dimension |

The order is fixed: dimensions first, then facts. A customer who first appears in today's orders must be in `mart_dim_customer` before the fact load looks for them, which is why the scheduled job in this course loads the dimensions before the fact table on every run.

### 2. Three Lookups, Three Techniques

> **Note:**
>
> #### **Three Lookups, Three Techniques**
>
> Each dimension asks a different question, so each lookup uses a different step. Choosing well is the difference between a load that reads each dimension once and one that queries the database for every row.

| Key | The question | Step | Why this step |
| --- | ------------ | ---- | ------------- |
| `date_key` | Which row of `mart_dim_date` has this date? | **Database lookup**, with **Enable cache?** and **Load all data from table** selected | 1,096 small rows read once into memory; every order line is then answered without a query |
| `customer_key` | Which version of this customer was valid on the order date? | **Dimension lookup/update**, with **Update the dimension?** cleared | It knows the version columns: it matches `customer_number` *and* the order date between `date_from` and `date_to` |
| `product_key` | Which row of `mart_dim_product` has this code? | **Database lookup**, cached | `mart_dim_product` is type 1, with one row per product, so a plain key match is enough |

The customer lookup is the one that matters most. A plain **Database lookup** on `customer_number` would find two rows for Euro+ Shopping Channel after its move, and would give every one of its orders, 2003 included, whichever row came first. **Dimension lookup/update** uses the order date as the **Stream Datefield**, so an order of 13 May 2005 gets the Madrid version and an order of 31 May the Barcelona one.

The date key could also be computed, as [Build a Date Dimension](../04-build-a-date-dimension/guide.md) computed it. Looking it up instead proves on every row that the date is in the dimension: a date outside 2003 to 2005 returns the default, `0`, instead of a key that matches no row.

### 3. Unknown Members

> **Note:**
>
> #### **Unknown Members**
>
> When a lookup finds nothing, the fact row still loads, with key `0`, the dimension's unknown member. Dropping the row instead would make the mart's totals quietly disagree with the source's.

| Lookup finds nothing because | What happens with key `0` | What to do |
| ---------------------------- | ------------------------- | ---------- |
| The order date is outside `mart_dim_date` | The row loads under an unknown date | Extend `mart_dim_date`; a count of `date_key = 0` rows is the alarm |
| The customer is not in `mart_dim_customer` yet (an *early-arriving fact*) | The sales count under the unknown customer | Load dimensions before facts; reload the late rows once the customer arrives |
| A product code is mistyped in the source | The sales count under the unknown product | Fix the source; the total is still right |

**Dimension lookup/update** creates row `0` in its dimension by itself. For `mart_dim_date`, the **Database lookup** returns `0` as its default, and a check after each load counts the rows that carry it. In the Steel Wheels data that count is zero, and the workshops check that it stays zero.

### 4. Loading Without Duplicates

> **Note:**
>
> #### **Loading Without Duplicates**
>
> A load that fails halfway will be run again, and a scheduled load may be run twice by mistake. Either way, an order line must end up in the fact table once.

| Technique | How | Suits |
| --------- | --- | ----- |
| **Insert / Update** keyed on the order line | Looks each line up by `order_number` and `order_line_number`; inserts it if new, updates it if not | Moderate volumes, and sources that send corrections to lines already loaded. The Sales Mart's choice |
| **Table output** after deleting the load's window | An **SQL** job entry deletes, say, the month being loaded, then **Table output** inserts it again | Large volumes, where a lookup per row costs too much |
| **Table output** with **Truncate table** | Rebuilds the whole fact table from the full source each run | Small marts, and summary tables |

The fact table's primary key, `(order_number, order_line_number)`, is the safety net under all three: a duplicate fails the load instead of doubling a sale.

### 5. Summary Tables

> **Note:**
>
> #### **Summary Tables**
>
> A summary table holds the fact table pre-summed at a coarser grain: sales by month and product line, instead of by order line. Mondrian calls it an <dfn>aggregate table</dfn>, and reads it in place of the fact table whenever a query asks only for levels the summary holds.

The Sales Mart has two:

| Table | Grain | Rows after the first load | Answers |
| ----- | ----- | ------------------------: | ------- |
| `agg_ym_line_mart_fact_sales` | Year, quarter, month and product line | 175 | Trend charts by product line |
| `agg_y_terr_mart_fact_sales` | Year and territory | 12 | The year-by-territory views most dashboards open with |

Three conventions make a summary table usable as an aggregate:

* **Its name** follows Mondrian's pattern, `agg_<something>_<fact table>`.
* **A `fact_count` column** holds the number of fact rows each summary row stands for.
* **Its columns** are named like the columns they summarize: `sales_amount` and `quantity_ordered` for the measures, `year_id` or `product_line` for the levels.

A summary table must be rebuilt every time the fact table changes. Mondrian cannot tell a stale summary from a fresh one, so the load job always rebuilds them after the fact load, before anyone queries the cube.

<div class="pcm-embed-card" data-href="https://docs.pentaho.com/install/10.2-install/multidimensional-data-modeling-in-pentaho/about-multidimensional-expression-language/mondrian-schema-element-reference/aggfactcount" data-title="AggFactCount"></div>

::::

---

> **Tip:** Next, the fact load itself: 2,867 order lines, three lookups and a re-runnable write: [Load the Fact Table](../07-load-the-fact-table/guide.md).
