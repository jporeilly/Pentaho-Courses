# Overview of Extend Model

<div class="pcm-intro">

A basic cube with simple dimensions gets you started — but **production-grade** OLAP schemas need more. This module takes a working schema and adds the capabilities real business intelligence demands: shared dimensions, time intelligence, geographic mapping, member properties, degenerate dimensions, and calculated members.

</div>

> **Note:**
>
> #### Why extend?
>
> Real-world reporting asks complex questions: year-over-year trends, geographic drill-downs, customer segmentation, "top-N" rankings. Each is answered by a specific dimensional feature. Building them into the **semantic layer** — once, centrally — means every Analyzer report inherits consistent, validated logic instead of each report developer re-implementing it.

## What's in this module

| Lab | What you'll add |
| --- | --- |
| **Extended Model** | A four-level **MARKETS** dimension, **geographic annotations** for maps, **member properties** on Customers and Products, a **shared TIME** dimension with `AnalyzerDateFormat` annotations, a **degenerate** Order Status dimension, and a Quantity measure. |
| **Calculations** | **Calculated members** — a simple `UnitPrice` (Sales ÷ Quantity) and an advanced `Top 10 Customers` using `Aggregate` + `TopCount`. |

## Key techniques

:::: tabs

### Shared dimensions

> **Note:**
>
> #### Shared dimensions
>
> Some dimensions (such as **Time**) are used across multiple cubes. A **shared dimension** is declared at the **schema** level rather than inside a cube. Because it doesn't belong to a cube, you declare an explicit table, then reference it from each cube with a `DimensionUsage` that supplies the cube-specific foreign key.

```xml
<DimensionUsage name="TIME" source="TIME" foreignKey="TIME_ID"/>
```

### Annotations

> **Note:**
>
> #### Geo & date annotations
>
> **Geo annotations** (`Data.Role`, `Geo.Role`, `Geo.RequiredParents`) tell Analyzer how to overlay results on an OpenStreetMap geo map. **`AnalyzerDateFormat`** annotations on time levels enable intelligent relative-date filters (e.g. `[yyyy]`, `[yyyy].['QTR'q]`).

### Degenerate dimensions

> **Note:**
>
> #### Degenerate dimensions
>
> Whereas a star dimension has one table and a snowflake has two or more, a **degenerate dimension has none** — all its columns live in the **fact** table. Order Status is a classic example: only a few values, so a separate dimension table would add a join for no benefit.

### Calculated members

> **Note:**
>
> #### Calculated members
>
> A **calculated member** is derived from other measures using an MDX **formula** — defined once in the schema rather than recreated in each report. Examples: `UnitPrice = [Measures].[Sales] / [Measures].[Quantity]`, or a ranked aggregate like the top 10 customers by sales.

::::

Start with **Extended Model**, then add **Calculations**.
