# Report Functions Reference

> **Note:**
>
> #### Introduction
>
> Every function available from the Data pane's **Functions** section,
> by category. Add one with **Data pane → right-click Functions → Add
> Functions…**, then bind it to an element's `field` attribute. From
> the official Report Designer User Guide.

***

## Common Functions

Page numbering and a generic OpenFormula hook.

| Function | Purpose |
| --- | --- |
| Open Formula | Build your own custom OpenFormula function in the Formula Editor; runs according to its placement in the report. For a function that must run before all other report actions, use the Advanced category's Open Formula instead. |
| Page | Counts the number of pages rendered so far. |
| Total Page Count | The total number of pages in the rendered report. |
| Page of Pages | Prints the current page number against the total ("3 / 12"). |

## Report Functions

Functions that modify the layout of the rendered report.

| Function | Purpose |
| --- | --- |
| Is Export Type | Tests whether the given export type is selected for this report. |
| Row Banding | Alternates the background colour of each item band in a group. |
| Hide Repeating | Hides equal values in a group — only the first changed value prints. |
| Hide Page Header & Footer | Hides the page header/footer bands when the output type is not pageable. |
| Show Page Footer | Shows the page footer only on the last rendered page. |

## Summary Functions

Mathematical functions that count, add, and divide report data in groups.

| Function | Purpose |
| --- | --- |
| Sum | Sum of the selected numeric column (global total). |
| Count | Total items in a group; with no group, all items in the report. |
| Count by Page | Items in a group on one rendered page. |
| Group Count | Total items in the selected groups. |
| Minimum / Maximum | Lowest / highest value in a group. |
| Sum Quotient | Divides the sum totals of two columns; returns a number. |
| Sum Quotient Percent | Divides the sum totals of two columns; returns a percentage. |
| Calculation | Stores the result of a calculation — turns a group of Running functions into a single Summary total. |
| Count For Page / Sum For Page | Count / sum per page; reset to zero on each new page. |

## Running Functions

Running totals, as opposed to global or summary totals.

| Function | Purpose |
| --- | --- |
| Sum | Running total of the specified column. |
| Count | Counts the items in a group or report. |
| Group Count | Counts the number of groups. |
| Count Distinct | Counts distinct occurrences of a value in a column. |
| Average | Average value of a column. |
| Minimum / Maximum | Lowest / highest value in a column. |
| Percent of Total | Percentage value of a numeric column (total sum ÷ items counted). |

## Advanced Functions

Developer-centric actions.

| Function | Purpose |
| --- | --- |
| Message Format | Formats text per the Java Message Format specification. |
| Resource Message Format | Formats text from a resource bundle (Java Message Format). |
| Lookup | Maps a string from one column to another via (key, text) pairs, with a fallback value. |
| Indirect Lookup | Uses a field's value as the key into a field mapping and returns the mapped column's value. |
| Resource Bundle Lookup | Resource-bundle lookup keyed by a field's value — behaves like a resource field. |
| Open Formula | Custom OpenFormula function that runs before any other action in the report. |

## Chart Data Functions

Data collectors that create datasets for JFreeChart elements: **CategorySet**,
**Pivoting CategorySet**, **Pie DataSet**, **TimeSeries**, **XY-Series**, and
**XYZ-Series** collectors. Pick the collector to match the chart family —
see the Charts Reference page.

## Image Functions

One function per chart element (Area, Bar, Bar Line, Bubble, Line, Pie,
Multi-Pie, Radar, Ring, Scatter Plot, Waterfall, the XY family), plus
**BarCode**, **Survey Scale** (sliding-scale element), and **Sparkline**.

## Script Functions

Type code directly in a supported scripting language: **Bean-Scripting
Framework (BSF)**, **Bean-Scripting Host (BSH)**, **JavaScript**, or a
**Single Value Query**. The one Pentaho-specific object is `getValue`
(BSF), which retrieves the current row:

```java
Object getValue()
  {
   Object value = dataRow.get("RegionVariance");
      if (value instanceof Number == false)
      {
       return Boolean.FALSE;
      }
      Number number = (Number) value;
      if (number.doubleValue() < 0)
      {
      return Boolean.TRUE;
      }
      return Boolean.FALSE;
  }
```

## Deprecated Functions

Included only for backwards compatibility with reports from older
Report Designer versions. Never use these in new reports — every one
has a better implementation in another category.

## Learn more

- [Pentaho Report Designer documentation](https://docs.pentaho.com/pba-report-designer) - the official reference for everything in this section.
