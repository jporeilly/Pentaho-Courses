# Charts & Sub Reports

> **Warning:**
>
> #### Workshop - Charts & Sub Reports
>
> Add a chart to a report and embed a sub-report beside it.
>
> **What you'll do**
>
> * Add a chart that summarises the report data.
> * Embed a sub-report with its own query.
> * Preview the combined layout.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Charts & Sub Reports**
>
> Add a chart to a report and embed a sub-report beside it.

## Add Parameter

By adding a parameter to the report, you can select the required data view.

* To open the Sub Chart Demo Report:
* From the Menu bar select File > Open.
* Navigate to:
C\Pentaho-Training\BA-2000\reports\Sub Demo Report.prpt.

* Click Open.
At this point, the Sub Demo Report already contains a query to return three fields from the Product table.

* To review the query, from the Data pane, expand Data Sets, and then double-click Query 1.
![Add Parameter](../_assets/images/mod8-01.png)

* To change the page orientation to landscape:
* From the Menu, select File > Page Setup.
* Click the Landscape checkbox.
* Click OK.
* In the Resize Report Elements dialog, ensure Do not change the layout is selected, and then click OK.
![Add Parameter](../_assets/images/mod8-02.png)

The default chart type is a Bar Chart. You can select a different chart type and specify the chart properties in the Edit Chart window.

![Add Parameter](../_assets/images/mod8-03.png)

* To edit the chart, in the Report Header band, double-click the Chart element.
![Add Parameter](../_assets/images/mod8-04.png)

The properties available in the Edit Chart window are based on the type of chart selected.

* To change the chart to a radar chart, click the Radar Chart button.
![Add Parameter](../_assets/images/mod8-05.png)

To create a basic radar chart, you specify category and value columns, and then specify the series-by value and series-by field on the Primary Data Source pane.

Notice the list of properties in the left pane for customizing the chart.

* On the Primary Data Source pane, for category-column, click in the Value field, and then from the drop-down list, select PRODUCTVENDOR.
![Add Parameter](../_assets/images/mod8-06.png)

* To select MSRP for the value column:
* For value-columns, click in the Value field.
* Click the … icon.
* In the Edit Array window, from the Available Items, click MSRP.
* Click in the arrow to move MSRP to the Selected Items list.
* Click OK.
![Add Parameter](../_assets/images/mod8-07.png)

* To select Product Line for the series-by field:
* For series-by-field, click in the Value field.
* Click the … icon.
* In the Edit Array window, from the Available Items, click PRODUCTLINE.
* Click the arrow to move PRODUCTLINE to the Selected Items list.
* Click OK.
![Add Parameter](../_assets/images/mod8-08.png)

* To create the chart, in the Edit Chart window, click OK.
![Add Parameter](../_assets/images/mod8-09.png)

* Preview the report.
![Add Parameter](../_assets/images/mod8-10.png)

## Add Sub Report

* To add a Sub-report:
* From the Elements Palette, drag a Sub-report element to the right side of the Report Header band.
* In the Insert Subreport dialog, click Inline.
![Add Sub Report](../_assets/images/mod8-11.png)

* In the Select Data Source window, select Query 1, and click OK.
![Add Sub Report](../_assets/images/mod8-12.png)

* To reposition and resize the Sub-report element, from the open reports tabs, click the Sub Report Demo tab, and then reposition and resize the Sub-report element as shown below.
![Add Sub Report](../_assets/images/mod8-13.png)

* To return to the Sub-report, from the open reports tabs, click the <Untitled Subreport> tab.
* To create the Sub-report, from the Data pane, drag PRODUCTVENDOR, PRODUCTLINE, and MSRP to the Details band as shown below.
![Add Sub Report](../_assets/images/mod8-14.png)

* To create column headings, add Label elements and a Horizontal Line element to the Details Header band as shown. (You will need to enable the Band)
![Add Sub Report](../_assets/images/mod8-15.png)

* Adjust the height of the Bands.
* Preview and Save the report: Demo – charts.prpt
![Add Sub Report](../_assets/images/mod8-16.png)

## Inline v Banded

Every master-report and sub-report prints its sections on a position relative to its original location on paper. For a master-report, the location is always the upper left corner of the first page (x=0, y=0). Therefore, all sections of that report will be printed on the left edge of the paper (x=0).

When you add sub-reports to a report, that sub-report can be located on any x-position on the paper. For banded sub-reports, usually that position is the same left-edge as the parent-report's location.

Inline sub-reports can be placed more freely on reports. The sub-report's left edge corresponds with the sub-report element's x- and y- position within its parent report. They can be at a position that is different from their parent report's left-edge position. When you add a new inner sub-report to such this sub-report, the inner sub-report's effective position is the offset of this report in its parent sub-report and all their offsets within their respective parents.

The dark-grey area on the left-hand side of your sub-report is not usable for elements contained in your sub-report. If you want to place elements there, you will have to re-position your sub-report within its parent report.

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 8 charts.prpt">Open: Solution: charts</button>

<button data-launch="prd" data-path="files/chart report.prpt">Open: Sample: chart report</button>

<button data-launch="prd" data-path="files/Order Details - sub report.prpt">Open: Sample: sub-report</button>

