# Regional Sales Report

> **Capstone Project — bring it all together.**

You're the new BI developer at a regional retailer. Sales management
needs a **sales report by territory and product line** they can run
themselves from the Pentaho User Console: filtered to the year and
product line they care about, clear to read, with a summary chart. And
every territory manager wants their own copy each quarter without
asking for it.

This capstone asks you to build, publish and burst that report. It
exercises every module of the course, from the JDBC connection through
layout, calculations, formatting, parameters, charts, sub-reports,
publishing and bursting.

> **Objectives:**
>
> - Build a parameterized, grouped, formatted report over the Steel Wheels sample data.
> - Add a summary chart and a supporting sub-report.
> - Publish it to the Pentaho Server and run it from the Pentaho User Console.
> - Burst it by territory: a schedule per regional manager, each emailing that territory's PDF.
> - Produce something portfolio-worthy ("I built this for my Practitioner course accreditation").
>
> **Estimated time:** 2 to 3 hours for a clean, well-named solution.

---

> **Warning:**
>
> #### Required for your course accreditation: five checks on your own folders
>
> The course accreditation is issued only when all five of these checks
> pass. They read your workshop folder, so put your work in exactly
> these places **before you take the exam**:
>
> | # | What must be there | Where |
> | --- | --- | --- |
> | 1 | Your report, `regional-sales-report.prpt` | `C:\Workshop-RD-Practitioner\capstone\solution\` |
> | 2 | The APAC manager's emailed copy, saved from Mailpit as `APAC.pdf` | `C:\Workshop-RD-Practitioner\capstone\out\burst\` |
> | 3 | The EMEA manager's, saved as `EMEA.pdf` | the same folder |
> | 4 | The NA manager's, saved as `NA.pdf` | the same folder |
> | 5 | The published report run from the User Console and exported as `regional-sales-report.pdf` | `C:\Workshop-RD-Practitioner\capstone\out\` |
>
> Use these names exactly, capitals included: the checks look for them.
> Select **Run checks** under **Verification checks** to see where you
> stand.

## Inputs

No files to import: the report runs over the **Steel Wheels sample
data**, the same `SampleData` HSQLDB source used throughout the course,
so the Pentaho Server must be running. The burst runs on the server,
with its mail settings pointing at **Mailpit**, as in
[Report Bursting](../39-mod9-report-bursting/guide.md).

Each territory's sales manager is in the sample data's `EMPLOYEES`:
`wpatterson@classicmodelcars.com` for APAC and Japan (his title is
*Sales Manager (JAPAN, APAC)*), `athompson@classicmodelcars.com` for
EMEA and `bhoward@classicmodelcars.com` for NA.

The sample data's customers sit in four territories, `APAC`, `EMEA`,
`Japan` and `NA`, and 22 customers have no territory. Their 2,996 order
lines run from 2003 to 2005.

---

## Required behavior

Each stage maps to a module of the course, so you can look back at the
workshop that taught it.

### 1. Connect and query *(Data Sources & Queries)*

A JDBC data source on SampleData, with a query returning order lines
with **territory, product line, product, order date (or year), quantity
and sale amount**: enough columns to group and summarize in the stages
below.

### 2. Lay out and group *(Report Elements & Groups)*

The data fields in the Details band, grouped by **territory**, then
**product line**, with clear group headers.

### 3. Calculate *(Calculations)*

- A **sum of sale amount** in each group footer, and a report grand total.
- **Conditional formatting** that highlights any product line whose group total falls below a threshold you choose.

### 4. Format *(Formatting the Report)*

- A report header with a title, an image and the run date.
- A page footer with page numbers.
- Consistent fonts, alignment and spacing: the report should look like something management actually reads.

### 5. Parameterize *(Report Parameters)*

Three parameters that drive the query, named exactly: **`YEAR`**,
**`PRODUCTLINE`** and **`TERRITORY`**. Each prompt offers its values
from a query, so the same report serves every review and every
territory.

### 6. Chart and sub-report *(Charts & Sub Reports)*

- A **bar chart** in the report header summarizing sales.
- A **sub-report** listing the top products for the selection.

### 7. Publish *(Publishing Reports)*

Publish the report to the Pentaho Server, run it from the User Console
with different parameter values, and export one run to PDF as
`regional-sales-report.pdf` in `capstone\out\`.

### 8. Burst *(Report Bursting)*

Three User Console schedules of your published report, one per sales
manager, each running it as a PDF with that manager's territories in
`TERRITORY` (APAC and Japan together for the APAC manager) and emailing
it to them. Run them, and save each email's attachment from Mailpit
into `capstone\out\burst\` as `APAC.pdf`, `EMEA.pdf` and `NA.pdf`.

---

## Suggested shape

```text
C:\Workshop-RD-Practitioner\capstone\    (your machine)
├── solution\regional-sales-report.prpt  your report
├── out\regional-sales-report.pdf        one run, exported from the User Console
└── out\burst\APAC.pdf, EMEA.pdf, NA.pdf  each manager's emailed copy, saved from Mailpit
```

The installer makes `capstone\solution\` and `capstone\out\` for you,
empty. If `C:\Workshop-RD-Practitioner\` has no `capstone` folder,
create `capstone\solution\` and `capstone\out\` there yourself.

---

## Hints for the tricky bits

- **A prompt that lists its values** reads them from a query of its own, as `product_var` does in [Report Parameters](../18-mod7-parameters/guide.md). The main query uses the parameter as `${TERRITORY}`.
- **Totals in a group footer** are a function with its group set, as in [Totals](../11-mod5-totals/guide.md); the threshold highlight is a style expression, as in [Conditional Formatting](../10-mod5-conditional-formatting/guide.md).
- **The chart's data** can come from the main query or a query of its own; a chart in the report header summarizes the whole report.
- **The territory list** comes from a query: leave out the customers with no territory, or the prompt offers an empty choice.
- **Every prompt needs a value** when a schedule runs the report: a prompt you leave alone runs with its default, so give `YEAR` and `PRODUCTLINE` defaults that select every value.
- **The attachment's name** is the schedule's **Rename attachment** box plus `.pdf`: name it after the territory and Mailpit's download needs no renaming.
- **The export** from the User Console downloads a file named after the report. Save it under the name the check expects, in `capstone\out\`.

---

## Lab Files

_No bundled files for this lab._ The data is the Steel Wheels sample
on your server, your report and schedules are yours to build, and
the accreditation checks read `C:\Workshop-RD-Practitioner\capstone\`.

---

## Verification checks

> **Warning:** These five checks decide your course accreditation, and
> they look only in `C:\Workshop-RD-Practitioner\capstone\`: your report
> in `solution\`, the exported run in `out\`, and the managers' emailed
> copies in `out\burst\`. Save your work there before you take the exam.

The checks confirm that the files exist. Check the numbers yourself:
with every year and
every product line selected, a correct report's sale-amount totals are:

| Territory | Order lines | Sale amount |
| --- | ---: | ---: |
| APAC | 370 | 1,281,705.89 |
| EMEA | 1,415 | 5,008,224.32 |
| Japan | 137 | 503,957.58 |
| NA | 1,074 | 3,852,061.39 |
| **Total** | **2,996** | **10,645,949.18** |

Each emailed PDF holds its manager's territories only: `APAC.pdf`
totals 1,785,663.47 (APAC and Japan), `EMEA.pdf` 5,008,224.32 and
`NA.pdf` 3,852,061.39.

## Deliverables

1. `regional-sales-report.prpt`: grouped by territory and product line, with group and grand totals, conditional formatting, a formatted header and footer, the `YEAR`, `PRODUCTLINE` and `TERRITORY` prompts, a chart and a sub-report
2. The report published to the Pentaho Server, and `capstone\out\regional-sales-report.pdf` exported from one run
3. Three schedules emailing each sales manager their territories' PDF, and those PDFs saved in `capstone\out\burst\`

> **Warning:** Save into `capstone\solution\` and `capstone\out\`, not
> into the course folder. Course content is refreshed from the
> repository on every launch, so anything you leave there will be
> overwritten. Reinstalling or upgrading the course never touches those
> two folders.

---

## Build outline and hints <!-- no-step -->

One section per stage, in the order you build them. The hints name a
dialog or a technique; the settings are yours to work out.

:::: tabs

### 1. Query

**Must do:** stage 1.

> **Success:** Checkpoint: the query's preview returns 2,996 rows with no parameters in it yet.

<details>
<summary>Hints</summary>

- **Data > Add Datasource > JDBC**, the **SampleData (Hypersonic)** connection, and the query designer, as in [Connect to a JDBC Data Source](../05-mod3-connect-jdbc/guide.md).
- `ORDERFACT` holds the order lines; `CUSTOMER_W_TER` the territory, and `PRODUCTS` the product line.

</details>

### 2. Groups and totals

**Must do:** stages 2 and 3.

> **Success:** Checkpoint: the preview's group footers show the territory totals in the table under **Verification checks**.

<details>
<summary>Hints</summary>

- Groups nest in the **Structure** tab: territory outside, product line inside.
- See **Hints for the tricky bits** for totals and the highlight.

</details>

### 3. Header, footer and look

**Must do:** stage 4.

<details>
<summary>Hints</summary>

- The image and run date go in the **Report Header**, as in [Formatting Report Headers & Footers](../14-mod6-headers-footers/guide.md); page numbers are a function in the **Page Footer**.

</details>

### 4. Parameters

**Must do:** stage 5.

> **Success:** Checkpoint: the preview shows three prompts, and `TERRITORY` set to `NA` gives a report of NA only, totalling 3,852,061.39 with every year and product line selected.

<details>
<summary>Hints</summary>

- A multi-select prompt passes a list: write the condition with `IN (...)`.

</details>

### 5. Chart and sub-report

**Must do:** stage 6.

<details>
<summary>Hints</summary>

- [Charts & Sub Reports](../21-mod8-charts-sub-reports/guide.md) puts a chart and a sub-report side by side; a sub-report receives parameters from its master report.

</details>

### 6. Publish and export

**Must do:** stage 7, and check 5.

<details>
<summary>Hints</summary>

- **File > Publish**, as in [Publishing Reports](../26-mod9-publishing/guide.md).
- The report viewer in the User Console has an output type list; PDF downloads the run.

</details>

### 7. Burst

**Must do:** stage 8, and checks 2 to 4.

> **Success:** Checkpoint: three emails in Mailpit, one per manager, and their PDFs in `capstone\out\burst\`; `NA.pdf` totals 3,852,061.39 when its year and product line prompts are at their all-values defaults.

<details>
<summary>Hints</summary>

- The server's mail settings, the schedule dialog and **Execute Now** are as in [Report Bursting](../39-mod9-report-bursting/guide.md).
- In a schedule's parameters page, `Ctrl`+click selects more than one territory.
- In Mailpit, open an email and select its attachment to download it.

</details>

::::
