# Regional Sales Report

> **Capstone Project — bring it all together.**

You're the new BI developer at a regional retailer. Sales management
needs a **quarterly sales report by territory and product line** they
can run themselves from the Pentaho User Console: filtered to the
year and product line they care about, clear to read, with a summary
chart they can select for detail.

This capstone asks you to build and publish that report. It exercises
every module of the course, from the JDBC connection through layout,
calculations, formatting, parameters, charts, sub-reports, and
publishing.

> **Objectives:**
>
> - Build a parameterized, grouped, formatted report over the Steel Wheels sample data.
> - Add a summary chart and a supporting sub-report, with a drill-down link.
> - Publish it to the Pentaho Server and run it end to end from the Pentaho User Console.
> - Produce a portfolio-worthy artifact ("I built this for my Associate accreditation").
>
> **Estimated time:** 90-120 minutes for a clean, well-named solution.

---

## Inputs

No files to import: the report runs over the **Steel Wheels sample
data** (the same `SampleData` HSQLDB source used throughout the
course, so the Pentaho Server must be running). If you get stuck, the
[Course Files](../33-ref-course-files/guide.md) page holds the
reference solutions from every module to compare against, but build
your own first.

## Required behavior

Each stage maps to a module of the course, so you can check yourself
as you go.

### 1. Connect and query *(Data Sources & Queries)*

Create a JDBC data source against SampleData and write a query
returning order data with **territory, product line, product, order
date, quantity, and sale amount**: enough columns to group and
summarize in the stages below.

### 2. Lay out and group *(Report Elements & Groups)*

Place the data fields in the Details band and group the report by
**territory**, then **product line**, with clear group headers.

### 3. Calculate *(Calculations)*

- Add **group totals** for sale amount in each group footer and a
  report grand total.
- Use **conditional formatting** to highlight any product line whose
  group total falls below a threshold you choose.

### 4. Format *(Formatting the Report)*

- Report header with a title, an image, and the run date.
- Page footer with page numbers.
- Consistent fonts, alignment, and spacing throughout: the report
  should look like something management actually reads.

### 5. Parameterize *(Report Parameters)*

Add **Year** and **Product Line** parameters that drive the query, so
one report serves every quarter-end review.

### 6. Chart and drill *(Charts & Sub Reports)*

- Add a **bar chart** in the report header summarizing sales by
  territory.
- Add a **sub-report** listing the top products for the selected
  product line.
- Stretch: make the chart **drillable** into the detail.

### 7. Publish *(Publishing Reports)*

Publish the finished report to the **Pentaho Server**, then run it
from the **Pentaho User Console** with different parameter values. Add
a **hyperlink** from the summary section to a detail view.

## Lab Files

_No bundled files for this lab._ The reports of every module are on the [Course Files](../33-ref-course-files/guide.md) page.

## Deliverables

* [ ] A `.prpt` named `regional-sales-report.prpt`, cleanly structured and saved.
* [ ] Group and grand totals correct for at least two parameter combinations (spot-check against a manual query).
* [ ] Conditional formatting visibly reacting to the data.
* [ ] The report published to the Pentaho Server and run successfully from the User Console.
* [ ] Evidence of the run: an exported PDF from the User Console for one parameter combination.

---

> **Tip:** Done? Take the **Associate Exam** from the sidebar to
> validate what you've learned across the whole course.
