# Output Parameterization Reference

> **Note:**
>
> #### Introduction
>
> One report, many outputs: parameterization lets the reader constrain
> the data (simple) or even change its structure (advanced) at run
> time. This page collects the four official patterns — deeper
> hands-on practice is in the Report Parameters module.

***

## The Add Parameter dialog

Every pattern starts at **Data pane → right-click Parameters → Add
Parameter…**:

| Field | Purpose |
| --- | --- |
| Name / Label | Internal name; friendly name shown to readers. |
| Value Type / Data Format | Data type of the value column; its display formatting. |
| Default Value / Default Value Formula | Static pre-selected value, or a formula that computes it. |
| Post-Processing Formula | Updates the selected value per your conditions. |
| Mandatory | Required before any data displays. |
| Hidden | Hide when the value already arrives in a session variable. |
| Display Type | How readers choose (drop-down, date picker, …). |
| Query / Value / Display Value Formula | Source query for choices; the substituted value; conditional display value. |

## Simple SQL parameterization

Constrain query values with a `WHERE` clause referencing the parameter
(`${NAME}`). Values only — it cannot change columns or structure.

```sql
SELECT
    PRODUCTLINE, PRODUCTVENDOR, PRODUCTCODE, PRODUCTNAME,
    PRODUCTSCALE, PRODUCTDESCRIPTION, QUANTITYINSTOCK, BUYPRICE, MSRP
FROM
    PRODUCTS
WHERE PRODUCTLINE = ${ENTER_PRODUCTLINE}
ORDER BY
    PRODUCTLINE ASC, PRODUCTVENDOR ASC, PRODUCTCODE ASC
```

## Advanced SQL parameterization

The "nuclear option" — parameterize the **structure** itself with a
JDBC (Custom) data source and a query formula on the Master Report
(Structure pane → Master Report → Attributes → Query → **+**):

```text
="SELECT DISTINCT " & [paramexample] & " AS COL1 FROM PRODUCTS"
```

> **Warning:** The spaces after `DISTINCT` and before `AS` are
> required — do not omit them. Name the report field after the `AS`
> alias (here `COL1`).

## Metadata parameterization

With a Metadata data source, add the columns to the query's
**Conditions** area and put a parameter token in each row's Value
field. Tokens are written in `{braces}` with no spaces, plus a valid
Default.

## OLAP (MDX) parameterization

With a Pentaho Analysis (Mondrian) source, use MDX `Parameter()`
functions in the query — each parameter needs its own query or data
table:

```sql
with
  set [TopSelection] as
  'TopCount(FILTER([Customers].[All Customers].Children,[Measures].[Sales]>0),
 Parameter("TopCount", NUMERIC, 10, "Number of Customers to show"), [Measures].[Sales])'
  Member [Customers].[All Customers].[Total] as 'Sum([TopSelection])'
select NON EMPTY {[Measures].[Sales],[Measures].[Quantity] } ON COLUMNS,
  { [TopSelection], [Customers].[All Customers].[Other Customers]} ON ROWS
from [SteelWheelsSales]
where
(
strToMember(Parameter("sLine", STRING, "[Product].[All Products].[Classic Cars]")),
strToMember(Parameter("sMarket", STRING, "[Markets].[All Markets].[Japan]")),
strToMember(Parameter("sYear", STRING, "[Time].[All Years].[2003]"))
)
```

## Permanently overriding Auto-Submit

Server-side (published reports only): force `autoSubmit` for all
reports via the reporting plugin's configuration —
`/pentaho/server/biserver-ee/pentaho-solutions/system/reporting/plugin.xml`,
add `autoSubmit=false` (or `true`) to the RUN operation's command URL,
restarting the BI Server around the edit:

```xml
<operation>
    <id>RUN</id>
    <command>content/reporting/reportviewer/report.html?autoSubmit=false&amp;solution={solution}&amp;path={path}&amp;name={name}</command>
</operation>
```

## Learn more

- [Pentaho Report Designer documentation](https://docs.pentaho.com/pba-report-designer)
