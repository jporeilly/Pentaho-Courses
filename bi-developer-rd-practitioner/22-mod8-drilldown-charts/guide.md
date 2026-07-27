# Drilldown Charts

> **Warning:**
>
> #### Workshop - Drilldown Charts
>
> Make a chart clickable so it drills into detail data.
>
> **What you'll do**
>
> * Make a chart clickable.
> * Drill from the chart into the detail data.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Drilldown Charts**
>
> Make a chart clickable so it drills into detail data.

## Driildown Charts

You can use OpenFormula to dynamically build drill linking within a chart and send the value that was clicked on by the user to the browser through a JavaScript alert() function. You can also link the chart values to other reports, creating a drill down chart.

* To view the Order Status Report:
* Open the User Console.
* To view the BI Developer Examples folder, on the menu, click View > Show Hidden Files
* From the Browse Files perspective, navigate to:
* Public > BI Developer Examples > Steel Wheels (Legacy) > Steel Wheels (4.8) > Reporting folder.
* From the Files pane, double-click Order Status.
* View and then close the Order Status report.
Notice the Order Status Report uses a parameter for the Status. Since we will be drilling to this report  from a chart, we will need to know the value for the Status parameter.

* Minimize the User Console and open Report Designer.
* To open the report that has already been started for you:
* From the Menu bar select File > Open.
* Navigate to \pentahotraining\BA2000\reports.
* Click Order Status Chart.
* Click Open.
Notice the report already has a query defined, and the Report Header section has been enlarged.

* Drag a Chart element to the Report Header band.
* Resize the Chart element to fill the Report Header band.
* In the Report Header band, double-click the Chart element.
* On the Primary Data Source tab, for category-column, click in the Value field, and then from the drop-down list, select STATUS.
* To select the value column:
* For value-columns, click in the Value field.
* Click the … icon.
* In the Edit Array window, from the Available Items, click SALES.
* Click in the arrow to move Sales to the Selected Items list.
* Click OK
* To open the formula editor, for Values > url-formula, click in the Value column, and then click the … icon.
![Driildown Charts](../_assets/images/mod8-17.png)

* To create link to the Order Status report:
* From the Category drop-down list, select User-Defined.
* From the Function list, double-click DRILLDOWN.
* Click Login and then click OK to login to the server.
![Driildown Charts](../_assets/images/mod8-18.png)

![Driildown Charts](../_assets/images/mod8-19.png)

* Click to select the Show Hidden Files checkbox.
* Click Browse and navigate to:
Public > BI Developer Examples > Steel Wheels (Legacy) >  Steel Wheels (4.8) > Reporting folder.

* Double-click Order Status.
![Driildown Charts](../_assets/images/mod8-20.png)

* Click OK.
Ensure that the Report Parameter tab is displayed.

* Associate the oStatus report parameter (prompt) with a value:
![Driildown Charts](../_assets/images/mod8-21.png)

Select =[“chart::category-key”] from the dropdown Value box.

* Be sure to select Pentaho Repository (Legacy)
* Click OK.
=DRILLDOWN("local-sugar"; NA(); {"oStatus"; ["chart::category-key"] | "::pentaho-path"; "/public/bi-developers/legacy-steel-wheels/steel-wheels-4.8/reports/Order Status.prpt"})

## Or if you use Pentaho  Repository

=DRILLDOWN("local-sugar"; NA(); {"::pentaho-path"; "/public/bi-developers/legacy-steel-wheels/steel-wheels-4.8/reports/Order Status.prpt" | "oStatus"; ["chart::category-key"]})

* Can also add the following value for tooltip-formula:  =["chart::category-key"]
* From the Menu bar select File > Preview > HTML.
* Save the report: Training Demo Report 8-1 drillable chart
* You will also require your credentials to log into Pentaho to view the report.

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 8-1 drilldown charts.prpt">Open: Solution: drilldown charts</button>

<button data-launch="prd" data-path="files/chart drillable.prpt">Open: Sample: drillable chart</button>

