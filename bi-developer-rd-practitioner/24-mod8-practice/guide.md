# Practice: Charts & Sub Reports

> **Warning:**
>
> #### Workshop - Practice: Charts & Sub Reports
>
> Four exercises covering charts, sub-reports, multiple sub-reports, and drillable charts.
>
> **What you'll do**
>
> * Add a chart to a report on your own.
> * Embed one, then several, sub-reports.
> * Make a chart drillable.
>
> **Prerequisites:** Complete this section's guided demonstrations first
>
> **Estimated Time:** 30 minutes

---

> **Note:**
>
> #### **Practice: Charts & Sub Reports**
>
> Four exercises covering charts, sub-reports, multiple sub-reports, and drillable charts.

## Chart

To add a multi-pie chart showing sales by year and product line:

1. To open the Sub Report Activity chart report:
2. From the Menu bar select File > Open.
3. Navigate to \pentahotraining\BA2000\reports.
4. Click Sub Report Activity.prpt.
5. Click Open.
6. To review the query, from the Data pane, expand Data Sets, and then double-click Query 1.
7. After reviewing the query, click OK.
8. To change the page orientation to landscape and adjust the page margins:
9. From the Menu, select File > Page Setup.
10. Click the Landscape checkbox.
11. Change each margin to 18.
12. Click OK.
13. In the Resize Report Elements dialog, ensure Do not change the layout is selected, and then click OK.
14. On the canvas, click the divider line at the bottom of the Report Header band and drag it down to approximately 7.0” below the Page Header.
15. Drag a Chart element to the Report Header band, and resize the element to fill the entire Report Header band.
16. In the Report Header band, double-click the Chart element.
17. To change the chart to a multi pie chart.
18. To select Product Line for the category-column, from the Value drop-down list, select PRODUCTLINE.
19. To select Sales for the value-columns:
20. For value-columns, click in the Value field.
21. Click the … icon.
22. In the Edit Array window, from the Available Items, click SALES.
23. Click in the arrow to move SALES to the Selected Items list.
24. Click OK.
25. To select YEAR_ID for the series-by field:
26. For series-by-field, click in the Value field.
27. Click the … icon.
28. In the Edit Array window, from the Available Items, click YEAR_ID.
29. Click in the arrow to move YEAR_ID to the Selected Items.
30. Click OK.
31. In the chart-title field, type Product Line Mix.
32. To create the chart, in the Edit Chart window, click OK.
33. Preview and Save the report: Training Exercise Report 8-1 charts.

![Chart](../_assets/images/mod8-29.png)

## Sub Report

To add a sub-report showing Volume for each year grouped by Product Line:

Open the report: Training Exercise Report 8-1 charts.

To add a Sub-report:

Drag a Sub-report element to the right side of the Report Footer band.

In the Insert Sub report dialog, click Inline.

In the Select Data Source Window, select Query 1, and click OK.

To reposition and resize the Sub-report element:

From the open reports tabs, click the Sub Report Activity tab.

Resize the Report Footer to be 3.0” below the Details band.

Reposition and resize the Sub report element to fill the entire Report Footer band.

To return to the Sub report, from the open reports tabs, click the <Untitled Subreport> tab.

To create the Sub-report, drag YEAR_ID and VOLUME to the Details band.

To create column headings, turn on the Details Header band and add Label elements and a Horizontal Line element to the Details Header band.

To group the sub-report by Product Line, use your knowledge to add a group for PRODUCTLINE, and add a message element to the Group Header band to identify the Product Line.

To change the YEAR_ID to a string field, on the Report Details band, click YEAR_ID, and then from the menu, select Format > Morph > text-field.

To return to the Sub Report Activity report, from the open reports tabs, click the Sub Report Activity tab.

Preview and save the Report: Training Exercise 8-1 sub report

![Sub Report](../_assets/images/mod8-30.png)

![Sub Report](../_assets/images/mod8-31.png)

## Multiple Sub Reports

To add additional sub-reports to the existing report:

1. Open the Training Guided Demo 8-2 – multiple sub reports.
2. To resize the Report Header band, on the Canvas, click the divider line at the bottom of the Report Header band and drag it down to approximately 4” on the vertical ruler.
3. To add a sub-report summarizing the territory data:
4. From the Elements Palette, drag a Sub-report element to the bottom left side of the Report Header band.
5. In the Insert Subreport dialog, click Inline.
6. In the Select Data Source window, select By Country, and click OK.
7. Click the Training Demo 8-2 – multiple sub reports tab, and then reposition and resize the Sub-report element below the Total Sales for North America chart Sub-report, as illustrated below.
8. To return to the Sub-report, from the open reports tabs, click the <Untitled Subreport> tab.
9. To create the report:
10. From the Data tab, expand Data Sets > JDBC SampleData > By Territory, and drag Territory to the top left corner of the Details band.
11. From the Data tab, drag Total to the Details band and drop it to the right of Territory.
12. From the Elements palette, drag two label elements to the Report Header band and create labels for the Territory and Total columns.
13. Preview the report.
14. Optionally, reposition and format the report elements.
15. To return to the main report, from the open reports tabs, close the Untitled Subreport tab.
16. Repeat the above steps to add a sub-report for the country data.
17. Preview and Save the report: Training Exercise 8-2
## Sub Report

To add a sub-report showing Volume for each year grouped by Product Line:

1. To open the report that has already been started for you:
2. From the Menu bar select File > Open.
3. Navigate to \pentahotraining\BA2000\reports.
4. Click Chart Drillable.prpt.
5. Click Open.
Notice that the report already has a query defined, and the Report Header section has been enlarged.

## Chart

1. Drag a Chart element to the Report Header band.
2. Resize the Chart element to fill the Report Header band.
3. Double-click the Chart element.
4. On the Primary Data Source tab, for category-column, click in the Value field, and then from the drop-down list, select PRODUCTLINE.
5. To select the value column:
6. For value-columns, click in the Value field.
7. Click the … icon.
8. In the Edit Array window, from the Available Items, click QUANTITY.
9. Click in the arrow to move QUANTITY to the Selected Items list.
10. Click OK
11. To select the series-by-field column:
12. For series-by-field, click in the Value field.
13. Click the … icon.
14. In the Edit Array window, from the Available Items, click CITY.
15. Click in the arrow to move CITY to the Selected Items list.
16. Click OK
17. In the Edit Chart window, click OK.
18. Preview and Save the report.
## 3D Chart

To enhance the chart by making it 3D and changing the x-axis label rotation:

1. In the Report Header band, double-click the Chart element.
2. From the properties list, for General > 3D, click in the Value column, and then from the drop-down list, select True.
3. For X-Axis > x-axis-label-rotation, double-click in the Value column, and then type 45.
4. In the Edit Chart window, click OK.
5. Preview and Save the report: Training Exercise Demo 8-3
## Parameter

1. To create a parameter for the state:
2. Complete the following fields in the Add Parameter window, and then click OK.
3. To modify the original query, from the Data tab, double-click JDBC: SampleData (Hypersonic)
4. To select Query 1, from the Available Queries, click Query 1.
5. To modify the WHERE clause for CUSTOMER_W_TER.STATE:
6. Change the value from ‘NY’ to ${State} - remember to remove single quotes
7. Click OK.
8. Preview the chart and test the parameterization by entering the following values for the state parameter: NY, CA, and NJ.
9. Preview and Save the report.
## Drill Link

1. Double-click the Chart element.
2. To open the formula editor, for Values > url-formula, click in the Value column, and then click the … icon.
3. In the Formula pane, type the following formula on one line:
`=”javascript:alert('" & ["chart::series-key"] & "')"`

Click OK.

1. To create the chart, in the Edit Chart window, click OK.
2. From the Menu bar select File > Preview > HTML.
3. In the state parameter, type NJ, and then click OK.
4. To drill down to show the cities, on the chart, click each data bar.
5. To close the pop-up window.
6. Close the browser preview tab.
7. Close and Save the report: Training Exercise 8-3.

![=”javascript:alert('" & ["chart::series-key"] & "')"](../_assets/images/mod8-32.png)
