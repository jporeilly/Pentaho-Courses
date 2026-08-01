# Common Formulas Reference

> **Note:**
>
> #### Introduction
>
> The formula recipes authors reach for most, from the official User
> Guide: conditional formatting, calculated dates, date parameters,
> page numbering, and group summaries. Every element property in
> Report Designer can carry a formula — build them with the **Formula
> Editor** (Style/Attributes pane → green **+** → **…**).

***

## Using the Formula Editor

1. Click the element, select the property in the **Style** pane, and click the round green **+** icon, then the **…** button.
2. Pick a function category and double-click a function to open its option fields.
3. Follow OpenFormula syntax: values in quotes, column names in UPPERCASE inside `[square brackets]`.

The full function catalogue is on the **Report Functions Reference**
page; the OpenFormula spec (OASIS) documents the underlying functions.

## Conditional formatting

Highlight a cell by a value in the row — put the formula on the
element's `bg-color` style property:

```text
=IF([STATUS]="Cancelled";"#FF0000";"#00CC00")
```

Multiple conditions with OR:

```text
=IF(OR([STATUS]="Cancelled";[STATUS]="Disputed");"#FF0000";"#00CC00")
```

Colour values can be hex (`#FF0000`) or HTML names (`red`, `green`) —
always in quotes.

## Calculated dates

Put these on a text field's `value` attribute (Attributes pane):

```text
1st day of current month
=DATEVALUE(DATE(YEAR(NOW());MONTH(NOW());1))

Sunday of current week
=DATEVALUE(DATE(YEAR(NOW());MONTH(NOW());DAY(NOW())-WEEKDAY(Now();2)))

Saturday of current week
=DATEVALUE(DATE(YEAR(NOW());MONTH(NOW());DAY(NOW())-WEEKDAY(Now())+7))

Current day, date, and time
=NOW()

Current date
=TODAY()

Yesterday's date
=DATEVALUE(DATE(YEAR(NOW());MONTH(NOW());DAY(NOW()-1)))
```

## Date and time parameters

Give report users a date picker:

1. **Data pane → Master Report Parameter**, name the parameter.
2. **Value Type**: `Date`; **Display Type**: `Date Picker`.
3. Default Value Formula: `=NOW()`, or e.g. the start of the current week:

```text
=DATEVALUE(DATE(YEAR(NOW());MONTH(NOW());DAY(NOW())-WEEKDAY(Now())))
```

For time-of-day values use the `Time` Value Type and set the Timezone option.

## Page numbering

1. **Data pane → right-click Functions → Add Functions… → Common → Page of Pages**.
2. Drag a text-field element into the Page Header or Page Footer band.
3. In the element's `field` attribute, select the Page of Pages function.

Use **Page** or **Total Page Count** instead when you need the pieces separately.

## Summarizing data in groups

The pattern behind every grouped total:

1. Order the query by the grouping fields (same columns in `SELECT` and `ORDER BY`, same order).
2. **Structure pane → right-click Groups → Add Group**, and move the grouping fields into Selected Fields.
3. **Data pane → Add Function → Sum** (or any Summary function).
4. On the function, set **Reset on Group Name** to your group — the total restarts with each group.

```sql
SELECT
    `PRODUCTS`.`PRODUCTLINE`,
    `PRODUCTS`.`PRODUCTVENDOR`,
    `PRODUCTS`.`PRODUCTNAME`,
    `PRODUCTS`.`QUANTITYINSTOCK`,
    `PRODUCTS`.`BUYPRICE`
FROM
    `PRODUCTS`
ORDER BY
    `PRODUCTS`.`PRODUCTLINE` ASC,
    `PRODUCTS`.`PRODUCTVENDOR` ASC,
    `PRODUCTS`.`PRODUCTNAME` ASC
```

## Learn more

- [OASIS OpenFormula specification](https://www.oasis-open.org/committees/download.php/16826/openformula-spec-20060221.html) - the formula language Report Designer implements.
- [Pentaho Report Designer documentation](https://docs.pentaho.com/pba-report-designer)
