# Carrier Dashboard Charts

> **Warning:**
>
> #### Workshop - Carrier Dashboard CGG Charts
>
> Exported charts often need different formatting from the dashboard: a title, a wider layout, the legend in another place. In this workshop you add a Post Fetch function to the Carrier Dashboard's `lineChart` so that it renders one way on screen and exports through the Community Graphics Generator (CGG) with its own formatting.
>
> **What you'll do**
>
> * Tell dashboard rendering apart from CGG export with a `typeof cgg` check
> * Write a Post Fetch function that changes the chart definition only for the export
> * Pass dashboard parameters to an export with the `params.get()` convention
> * Set export-only chart properties: width, title and padding, legend alignment and position, and axis label mode
> * Export the chart as PNG and compare it with the dashboard
>
> **Prerequisites:** [Carrier Dashboard](../12-community-dashboard-editor-carrier-dashboard/guide.md) completed, including `lineChart` and its Export Popup; JavaScript and CCC chart properties; a running Pentaho Server with CTools and CGG
>
> **Estimated time:** 20 minutes

<div align="center">
<figure>
<img src="../_assets/images/cgg_carrier_export_chart.png" alt="Export Options popup over a dashboard, set to width 928 and height 220, previewing a line chart of daily Number of Calls against Number of Users" width="800">
<figcaption>Export lineChart</figcaption>
</figure>
</div>

***

## Dashboard vs. Export Visualization <!-- no-step -->

A chart can look different in the dashboard and in its export. The Post Fetch function runs in both places, so a conditional block in it can tell them apart: when the `cgg` object is undefined, the code is running in the dashboard; otherwise it is running in the export.

```javascript
if ( typeof cgg == 'undefined' ){
  
// ... This block only runs in the dashboard ... 

 } else {
  
// ... This block only runs in CGG (export) ... 

}

// ... This block runs everywhere ... 
```

## Handling Parameters in Exports <!-- no-step -->

A CGG export script can't read CDE parameters or call CDF functions such as `Dashboards.getParameterValue`. To render with a parameter's value in the export, pass it as a query parameter: add it to the component's **Parameters** property, or add it in the **Pre Execution** function.

For example, to append a date parameter's value to the chart title, set **Arg** `_date` and **Value** `dateParam` in the component's **Parameters** property, or do the same in **Pre Execution**:

```javascript
var objParams = Dashboards.propertiesArrayToObject( this.parameters );

objParams['_date'] = 'dateParam';

this.parameters = Dashboards.objectToPropertiesArray( objParams ); 
```

The underscore in `_date` marks a parameter that the query itself doesn't use; it is a naming convention, not a requirement. Then change the title in Post Fetch, using the parameter's value:

```javascript
var titleDate = ( typeof cgg == 'undefined' ) ?
Dashboards.getParameterValue('dateParam') : params.get('_date');

this.chartDefinition.title = "Chart rendered on " + titleDate; 
```

The date in the export is the value the parameter had when the component last executed, not any later change to `dateParam`.

:::: tabs

### 1. lineChart

> **Note:**
>
> #### lineChart
>
> Add a Post Fetch function to `lineChart` that changes the chart definition only when CGG exports it: the width, a title, the legend's alignment and position, the padding and the axis labels.

1. Make sure the Pentaho Server is running. On a lab VM it already is; on your own machine start it as in [Before You Start](../00-before-you-start/guide.md):

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

It takes a few minutes; the console is ready when http://localhost:8080/pentaho opens the login page.

2. Open the Pentaho User Console (PUC) with the button below and sign in as `admin`.

<button data-launch="puc">Open Pentaho User Console</button>

3. In **Browse Files**, open the Carrier Dashboard you finished in [Carrier Dashboard](../12-community-dashboard-editor-carrier-dashboard/guide.md) for editing: select it, and under **File Actions** select **Edit**. The workshop's version is **Layout** in **Public > CTools-Dashboard > Carrier-Dashboard-Expand**.
4. Select **Components Panel**. In the components grid, expand **Charts** and select **lineChart**.
5. Select **Advanced Properties**.
6. Select the **...** button in the **Post Fetch** value. In **Javascript Wizard**, enter this function and select **Ok**:

```javascript
function f(data){

    // This block only runs in CGG (export)
    if ( typeof cgg != 'undefined' ){
        
        // Change or set some chart properties to look differently from what we see on the dashboard       
        this.chartDefinition.width = 700;
        this.chartDefinition.title = "Number of Calls vs Number of Users";
        this.chartDefinition.titlePaddings = "10";
        
        this.chartDefinition.legendAlign = "center";
        this.chartDefinition.legendPosition = "bottom";
        this.chartDefinition.legendPaddings = "15 5";
        this.chartDefinition.legendItemPadding = "10";
        
        this.chartDefinition.baseAxisOverlappedLabelsMode = "leave";
        
    }
  
}
```

7. Select **Save**.
8. In **Browse Files**, double-click the dashboard to open it. The Export Popup works in the dashboard itself, not in Preview.
9. Select **Export** above the Number of Calls vs Number of Users chart, and select **Export PNG**.

<div align="center">
<figure>
<img src="../_assets/images/cgg_carrier_export_chart.png" alt="Export Options popup over a dashboard, set to width 928 and height 220, previewing a line chart of daily Number of Calls against Number of Users" width="800">
<figcaption>Export Chart</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Export Options** shows the CGG rendering of the chart, which differs from the dashboard: a title at the top, the legend at the bottom and centered, and the base axis labels all shown.

10. Select **Export** in **Export Options** to download the PNG, and close the dashboard's tab.

> **Under the hood:**
>
> #### The export runs your chart again, on the server
>
> Export PNG calls CGG's draw service with the script CDE wrote when you
> saved: Layout_lineChart.js beside the dashboard. It loads cdf-env.js,
> rebuilds lineChart from the same definition, postFetch included,
> together with its data source, and ends with
> cgg.render(render_lineChart). CGG runs it in Rhino, a JavaScript
> engine inside the server, and converts the SVG that CCC draws into PNG
> with Batik.
>
> That is why typeof cgg works as a switch: the variable exists only in
> that server-side run. Parameters reach it with the request: the popup
> sends each of the chart's parameters with its current value as
> param<name>, and params.get reads them back, which is why the export
> shows the values the chart had when you clicked.
>
> **Why it matters:** one component definition serves the screen and
> the export, so the two never drift apart; only the switch in Post
> Fetch differs.

::::

<button data-launch="puc">Open Pentaho User Console</button>

## Lab Files

_No bundled files for this lab._
