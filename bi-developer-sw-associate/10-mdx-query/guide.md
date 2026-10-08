# Overview of MDX Query

<div class="pcm-intro">

Pentaho Analyzer gives business users a drag-and-drop interface — but schema developers often need to query cubes **directly** with **MDX** (Multidimensional Expressions), the SQL-equivalent language for OLAP. MDX lets you test your schema designs, validate calculated members, troubleshoot performance, and write analytical queries that go beyond the standard reporting interfaces.

</div>

> **Note:**
>
> #### Why learn MDX?
>
> Rather than waiting for users to discover issues in production reports, you can proactively **validate** your schema designs, **test** calculated members, and **verify** query behaviour using direct MDX queries. This transforms you from a passive schema builder into an active analyst who can interrogate cubes and understand exactly how your model responds to different query patterns.

## MDX at a glance

> **Note:**
>
> #### Axes vs. slicers
>
> An MDX query selects **measures and members onto axes** (`COLUMNS`, `ROWS`) `FROM` a cube, and optionally restricts the result with a `WHERE` clause — the **slicer**. The slicer sets the dimensional context without placing a dimension on a visible axis.

```mdx
SELECT
  { [Measures].[Sales], [Measures].[Quantity] } ON COLUMNS,
  { [Years].&[2004], [Years].&[2005] }          ON ROWS
FROM [SteelWheelsSales]
WHERE ( [Markets.markets].[APAC] )
```

| Syntax | Meaning |
| --- | --- |
| `SELECT … ON COLUMNS, … ON ROWS` | Places sets of members/measures on visible axes. |
| `FROM [Cube]` | The cube being queried. |
| `WHERE ( … )` | The **slicer** — restricts the dimensional context. |
| `[Dimension].[Member]` | Bracket notation to reference a member by name. |
| `[Level].&[key]` | Ampersand (`&`) references a member by its **key**. |
| `.Members` / `.AllMembers` | Returns all members of a level/dimension. |

## What's in this module

| Lab | What you'll do |
| --- | --- |
| **MDX Query** | Launch MDX Query mode, write `SELECT`/`FROM`/`WHERE` queries against the SteelWheelsSales cube, use `AllMembers`, and build cross-tabular queries filtered by territory/market. |
| **Named Sets** | Define reusable collections of members (e.g. "Top 3 Territories") with the `WITH SET` clause, then embed them permanently in the schema. |

Start with **MDX Query**, then move on to **Named Sets**.
