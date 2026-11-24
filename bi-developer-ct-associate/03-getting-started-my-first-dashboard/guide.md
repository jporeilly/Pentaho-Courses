# My First Dashboard

> **Warning:**
>
> #### Workshop - My First Dashboard
>
> Build your first dashboard in the Community Dashboard Editor (CDE): a Two x One layout with a styled header and footer, and three charts on the Steel Wheels OLAP cube made with the OLAP Chart Wizard. Along the way you meet CDE's three perspectives - Layout, Components and Data Sources.
>
> **What you'll do**
>
> * Create a CDE dashboard from the Two x One template and save it to the repository
> * Style the header and footer rows with HTML and a background color
> * Add a pie, a line and a bar chart with the OLAP Chart Wizard
> * Set the charts' titles, heights and legends, and adjust the layout to fit them
> * Check the SampleData connection that the charts' cube reads from
>
> **Prerequisites:** The Pentaho Server with CDE enabled, as in [Getting Started](../01-getting-started/guide.md); the SteelWheels sample schema and SampleData, which ship with the server; [First Steps](../02-getting-started-first-steps/guide.md)
>
> **Estimated time:** 30 minutes

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_my_first_dashboard.png" alt="Finished My First Dashboard with a Product Line Sales line chart, a Sales by Years bar chart for 2003 to 2005, and a Total Sales pie chart by territory" width="800">
<figcaption>My First dashboard</figcaption>
</figure>
</div>

***

:::: tabs

### 1. CDE - Layout

> **Note:**
>
> #### Create a New Dashboard
>
> Create the dashboard from a template, save it, and preview it. Don't worry about every feature and option yet: the next workshops cover each perspective.

1. Make sure the Pentaho Server is running. On a lab VM it already is; on your own machine start it as in [Before You Start](../00-before-you-start/guide.md):

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

It takes a few minutes; the console is ready when http://localhost:8080/pentaho opens the login page.

2. Open the Pentaho User Console (PUC) with the button below and sign in as `admin`.

<button data-launch="puc">Open Pentaho User Console</button>

3. Select **Browse Files**. Under **Folders**, select **Public**.
4. Under **Folder Actions**, select **New Folder...**, enter `CTools-Dashboard` and select **OK**. The later workshops keep their files in this folder too.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_new_folder.png" alt="Browse Files with Public selected and the New Folder dialog open, its Name box holding CTools-Dashboard" width="800">
<figcaption>A new folder under Public</figcaption>
</figure>
</div>

5. Select **CTools-Dashboard** and create the folder `My-First-Dashboard` inside it the same way.
6. On the **Home** page, select **Create New > CDE Dashboard**. **File > New > CDE Dashboard** does the same. The first time after the server starts, the editor can take a minute or two to open while the server prepares it; later it opens at once.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_new_cde_dashboard.png" alt="Pentaho User Console Home page with the Create New button clicked, opening a menu where the pointer rests on the highlighted CDE Dashboard option" width="574">
<figcaption>New CDE Dashboard</figcaption>
</figure>
</div>

7. In the **Layout Structure** toolbar, select the **Apply Template** icon.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_apply_a_template.png" alt="New CDE dashboard showing the empty Layout Structure panel, with the pointer on the second toolbar icon and its Apply Template tooltip" width="800">
<figcaption>Apply a Template</figcaption>
</figure>
</div>

8. In **Apply Template**, select **Two x One Template** and select **Ok**. When CDE asks whether you are sure you want to load the template, select **Ok**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_apply_a_template_two_x_one.png" alt="CDE Apply Template dialog showing six layout thumbnails, with the Two x One Template selected, two stacked panels on the left beside one tall panel on the right" width="800">
<figcaption>Apply a Template - Two x One</figcaption>
</figure>
</div>

The template's layout has five main rows: **Header**, **Spacer**, **Body**, **Small_Space** and **Footer**. **Body** is split into two columns. The first column holds three rows: one with the column **Panel_1**, then **Spacer_2**, then one with the column **Panel_2**. The second column is **Panel_3**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_cde_layout_two_x_one.png" alt="CDE Layout Structure after applying the Two x One template, with the Body row expanded to show Panel_1 and Panel_2 stacked in one column and Panel_3 in another" width="800">
<figcaption>CDE Layout - Two x One</figcaption>
</figure>
</div>

9. On the CDE toolbar, select **Save as...**. In **Save as**, set these values and select **Ok**:

| Setting | Value |
| --- | --- |
| **Choose Format** | **Dashboard** |
| **Choose Folder** | public > CTools-Dashboard > My-First-Dashboard |
| **File Name** | `my-first-dashboard` |
| **Title** | `My First Dashboard` |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_save_as.png" alt="CDE Save as dialog with the Dashboard format, the My-First-Dashboard folder inside public, CTools-Dashboard selected, file name my-first-dashboard and title My First Dashboard" width="532">
<figcaption>Save as ..</figcaption>
</figure>
</div>

10. Select **Preview your Dashboard**, the icon at the top right of the editor.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_dashboard_template_preview.png" alt="Preview of the unedited Two x One template, with a blue Dashboard generated with CDE header, three empty gray panels and a footer showing a broken image icon" width="800">
<figcaption>Dashboard template - preview</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the template as it ships: a blue header reading **Dashboard generated with CDE**, three empty gray panels, and a footer with a broken image icon, because the template's footer points at an image your server doesn't have.

11. Close the preview.

> **Under the hood:**
>
> #### A CDE dashboard is three files
>
> Save as wrote the dashboard into the repository as files: a .wcdf with
> its title and settings, and a .cdfde holding everything the editor
> shows (layout, components and data sources) as JSON. Once the
> dashboard has data sources, every save also generates a .cda from the
> Data Sources panel; with none, CDE deletes it.
>
> Preview saves throwaway _tmp copies of the files and renders those, so
> previewing never overwrites what you saved; the editor deletes them
> afterwards.
>
> **Why it matters:** the files are what you move between servers, back
> up and compare. Preview never touches them, so you can try a change
> and look at it before you decide to keep it.

### 2. Header & Footer rows

> **Note:**
>
> #### Header & Footer rows
>
> Replace the template's header text and footer image with your own HTML, and color the footer.

#### Header Row

1. In **Layout Structure**, expand the **Header** row and the column under it, and select the **Html** element.
2. In **Properties**, select the **...** button in the **HTML** value. In **Edit**, replace the HTML with the following, which adds padding to align the text, and select **Ok**:

```html
<h2 style="color:#FFFFFF; padding: 15px 0">My First Dashboard</h2>
```

3. Select **Save**, then **Preview your Dashboard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_preview_dashboard.png" alt="Dashboard preview with the blue header now reading My First Dashboard above three empty gray panels and a footer that still shows a broken image icon" width="800">
<figcaption>Preview dashboard</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the header reads **My First Dashboard**; the footer still shows the broken image.

4. Close the preview.

***

#### Footer

The footer shows a logo from a folder beside the dashboard. Download the lab's logo, [logo_pentaho.png](./files/logo_pentaho.png), from **Lab Files** at the end of this page; it is also on disk in this workshop's folder.

5. In the PUC, open **Browse Files** and select **My-First-Dashboard**. Under **Folder Actions**, select **New Folder...**, enter `resources` and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_new_folder_resources.png" alt="Browse Files with Public, CTools-Dashboard, My-First-Dashboard selected, showing My First Dashboard, my-first-dashboard.cda and my-first-dashboard.cdfde, and the New Folder dialog holding resources" width="800">
<figcaption>The resources folder, beside the dashboard's files</figcaption>
</figure>
</div>

6. Select **resources** and create the folder `img` inside it the same way.
7. Select **img**. Under **Folder Actions**, select **Upload...**. Select **Browse...**, choose `logo_pentaho.png`, and select **OK**. Browse Files hides uploaded images, so the folder still looks empty: **View > Show Hidden Files** shows the logo.
8. Return to the editor tab. In **Layout Structure**, expand the **Footer** row and its column **Footer_Image**, and select the **Html** element under it.
9. In **Properties**, select the **...** button in the **HTML** value, replace the HTML with the following, and select **Ok**:

```html
<a style="position:relative;top:5px; right:15px; float:right; color:#FFFFFF;" border="0" title="Pentaho Professional Services" href="https://pentaho.com/pentaho-professional-services/">
<img src="./resources/img/logo_pentaho.png" alt="Pentaho logo"/>    Pentaho Professional Services</a>
```

10. Select the **Footer_Image** column. In **Properties**, select the **BackgroundColor** check box, enter `#3c4484` in its value, and select the color wheel button in the corner of the color picker to apply the color.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard.png" alt="CDE Layout perspective with the Footer_Image column selected under the Footer row, its Properties showing Height 50, Corners Round and BackgroundColor #3c4484" width="800">
<figcaption>Footer_Image column with its background color set to #3c4484</figcaption>
</figure>
</div>

> **Warning:** The color applies only when you select the color wheel button: a value typed without it is not kept.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_color_picker.png" alt="Color picker open beside the BackgroundColor property, set to #3c4484 (red 60, green 68, blue 132), with the color wheel button in its corner outlined in red" width="665">
<figcaption>Color picker</figcaption>
</figure>
</div>

11. Select **Save**, then **Preview your Dashboard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_dashboard_layout_header_and_footer.png" alt="Dashboard preview showing the blue My First Dashboard header, three empty gray panels and a dark blue footer with the white P on black logo and the Pentaho Professional Services link" width="800">
<figcaption>Dashboard Layout - Header & Footer</figcaption>
</figure>
</div>

> **Success:** Checkpoint: a dark blue footer with your logo and the link **Pentaho Professional Services** at the right.

12. Close the preview.

### 3. Charts

> **Note:**
>
> #### Charts
>
> The charts read the SteelWheels OLAP cube. Schema Workbench is the Pentaho design tool that defines a multidimensional (MDX) schema:
>
> * A cube is built on the fact table of a star schema.
> * Dimensions map to the database tables.
> * Levels map to columns of those tables. Their order defines the paths you can take to slice and dice the data.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_steelwheelssales_olap_schema.png" alt="Schema Workbench showing the SteelWheels schema with the SteelWheelsSales cube selected, its ORDERFACT table and Markets, Customers and Products dimensions, connected to sampledata on MariaDB" width="800">
<figcaption>SteelWheelsSales OLAP Schema</figcaption>
</figure>
</div>

The OLAP Chart Wizard builds its queries on a schema published to the server, here SteelWheels, which reads the SampleData database. In Schema Workbench you can test MDX queries against a cube before you use them in a dashboard:

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_mdx_query.png" alt="Schema Workbench MDX Query window running a query for 2004 Sales by product line on SteelWheelsSales, returning seven rows from Classic Cars 1,838,275 to Vintage Cars 997,560" width="800">
<figcaption>MDX Query</figcaption>
</figure>
</div>

***

#### Add a Chart

1. Select **Datasources Panel**, the perspective icon at the top right. In the list on the left, expand **Wizards** and select **OLAP Chart Wizard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_connection_perspective.png" alt="CDE Data Sources perspective for My First Dashboard with the Wizards group expanded and the pointer on OLAP Chart Wizard, between OLAP Selector Wizard and Saiku OLAP Wizard" width="800">
<figcaption>Data Sources perspective - Wizards</figcaption>
</figure>
</div>

2. In **OLAP Wizard**, set **Catalog** to `SteelWheels` and **Cube** to `SteelWheelsSales`.
3. Set **Name** to `Total_Sales`, **Html Object** to `Panel_3` and **Chart Type** to `Pie Chart`. Then, under **Dimensions**, expand **Markets** and drag **Territory** to **Rows**; under **Measures**, drag **Sales** to **Columns**. The **Preview Area** draws the chart.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_pie_chart_total_sales.png" alt="OLAP Wizard set to the SteelWheels catalog and SteelWheelsSales cube, named Total_Sales, Pie Chart type, Territory on rows and Sales on columns, with Panel_3 chosen as Html Object" width="800">
<figcaption>Pie Chart - Total Sales</figcaption>
</figure>
</div>

4. Select **Ok**.
5. Select **Save**, then **Preview your Dashboard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_panel_3_total_sales.png" alt="Dashboard preview with the Total_Sales pie chart of sales by territory, APAC, EMEA, Japan and NA, now in the right-hand panel while the two left panels stay empty" width="800">
<figcaption>Panel_3 - Total sales</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the **Total_Sales** pie chart in the right-hand panel, one slice per territory: `APAC`, `EMEA`, `Japan` and `NA`. The two left panels are still empty.

6. Close the preview. The chart needs a few adjustments, which come after the other two charts.
7. Open **OLAP Chart Wizard** again and build the second chart with these values, then select **Ok**:

| Setting | Value |
| --- | --- |
| **Catalog** | `SteelWheels` |
| **Cube** | `SteelWheelsSales` |
| **Name** | `Line_Sales` |
| **Html Object** | `Panel_1` |
| **Chart Type** | `Line Chart` |
| **Rows** | **Line**, from the **Products** dimension |
| **Columns** | **Sales**, from **Measures** |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_line_chart_line_sales.png" alt="OLAP Wizard set up as a Line Chart with product Line on rows and Sales on columns, previewing sales by product line, with Panel_1 chosen as Html Object" width="800">
<figcaption>Line Chart - Line sales</figcaption>
</figure>
</div>

8. Select **Save**.
9. Open **OLAP Chart Wizard** again and build the third chart, then select **Ok**:

| Setting | Value |
| --- | --- |
| **Catalog** | `SteelWheels` |
| **Cube** | `SteelWheelsSales` |
| **Name** | `Years_Sales` |
| **Html Object** | `Panel_2` |
| **Chart Type** | `Bar Chart` |
| **Rows** | **Years**, from the **Time** dimension |
| **Columns** | **Sales**, from **Measures** |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_bar_chart_years_sales.png" alt="OLAP Wizard with the SteelWheels catalog and SteelWheelsSales cube, Name Years_Sales, Html Object Panel_2, Chart Type Bar Chart, Years on Rows and Sales on Columns, previewing bars for 2003, 2004 and 2005" width="800">
<figcaption>Bar Chart - Years_Sales</figcaption>
</figure>
</div>


10. Select **Save**, then **Preview your Dashboard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_my_first_dashboard_2.png" alt="Dashboard preview with all three charts in place: Line_Sales and Years_Sales bar charts in the left panels and the Total_Sales pie chart on the right" width="800">
<figcaption>My First Dashboard</figcaption>
</figure>
</div>

> **Success:** Checkpoint: three charts: **Line_Sales** over the seven product lines at the top left, **Years_Sales** with one bar each for `2003`, `2004` and `2005` at the bottom left, and **Total_Sales** on the right. The left-hand charts don't fit their panels yet.

11. Close the preview.

***

#### Chart Component

Each chart is a component, configured with a set of properties.

12. Select **Components Panel**, the perspective icon at the top right, and expand **Charts** in the **Components** list.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_chart_components.png" alt="CDE Components perspective listing three CCC charts in the Charts group, with Total_SalesChart selected and its properties showing datasource Total_SalesQuery, Panel_3, height 300 and width 400" width="800">
<figcaption>Chart Components</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the wizard added three chart components, each named after its chart with `Chart` appended: **Total_SalesChart** (CCC Pie Chart), **Line_SalesChart** (CCC Line Chart) and **Years_SalesChart** (CCC Bar Chart).

13. Select **Total_SalesChart**. In **Properties**, its **Datasource** is `Total_SalesQuery` and its **HtmlObject** is `Panel_3`.

> **Under the hood:**
>
> #### The wizard writes a query and a chart, joined by name
>
> For each chart the OLAP Chart Wizard created two things: an "mdx over
> mondrianJndi" data source named after the chart with Query appended
> (Total_SalesQuery), holding the JNDI connection, the SteelWheels
> catalog and an MDX query built from your dimension and measure; and a
> CCC chart component whose Datasource property names that query.
>
> The Html Object is the other half of the wiring. CDE renders every
> layout row and column as a div whose id is the element's Name, and a
> component draws into the element whose id matches its Html Object.
> That is why Years_Sales goes into Panel_2: a name with no matching
> layout element leaves the chart nowhere to draw.
>
> **Why it matters:** a chart that draws nothing is almost always a
> broken name: a Datasource that names no query, or an HtmlObject that
> names no layout element. Those are the first two properties to check.

<div align="center">
<figure>
<img src="../_assets/images/cde-wiring.png" alt="CDE's three perspectives joined by name: the Total_SalesChart component's HtmlObject is Panel_3, the Name of a layout column drawn as a div, and its Datasource is Total_SalesQuery, an mdx over mondrianJndi data source whose Jndi names the SampleData connection on the Pentaho Server; a wrong name means no chart, no data or no database; Save writes the .wcdf, the .cdfde with all three perspectives and the .cda to the repository" width="800">
<figcaption>One chart's wiring: three names that must match, and the three files Save writes</figcaption>
</figure>
</div>

Read the diagram from the component in the middle. Total_SalesChart names the other two: its HtmlObject is the Name of the Panel_3 column above it, and its Datasource is the Name of the Total_SalesQuery data source below it. The query in turn names a server connection by its Jndi, and the server opens the database behind that name. A wrong name at any of the three arrows breaks the dashboard in the way the red box lists. Save writes all of it to the repository: the .wcdf with the title and settings, the .cdfde with all three perspectives, and the .cda that CDE generates from the Data Sources panel.

14. Set these properties, selecting each component in turn:

| Component | Property | Value |
| --- | --- | --- |
| **Total_SalesChart** | **Title** | `Total Sales` |
| **Total_SalesChart** | **Height** | `400` |
| **Line_SalesChart** | **Title** | `Product Line Sales` |
| **Line_SalesChart** | **Legend** | `False` |
| **Years_SalesChart** | **Title** | `Yearly Sales` |
| **Years_SalesChart** | **Legend** | `False` |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_line_chart_properties.png" alt="CDE Components perspective with Line_SalesChart selected in the Charts group, its Properties showing Title Product Line Sales, Datasource Line_SalesQuery, HtmlObject Panel_1 and Legend False" width="800">
<figcaption>Line_SalesChart with its title set and its legend off</figcaption>
</figure>
</div>


15. Select **Save**, then **Preview your Dashboard**.

> **Success:** Checkpoint: each chart shows its new title, and the line and bar charts have no legend.

16. Close the preview.

### 4. Final Layout

> **Note:**
>
> #### Final Layout
>
> The template's panels are sized for its own sample content. Make them tall enough for your charts.

1. Select **Layout Panel**, the perspective icon at the top right.
2. In **Layout Structure**, select each element and set its property:

| Element | Property | Value |
| --- | --- | --- |
| **Body** row | **Height** | `720` |
| The row in Body's first column that holds **Panel_1** | **Height** | `360` |
| **Panel_1** column | **Height** | `355` |
| The row in Body's first column that holds **Panel_2** | **Height** | `360` |
| **Panel_2** column | **Height** | `355` |
| **Panel_3** column | **Height** | `725` |
| **Panel_3** column | **Text Align** | **Center** |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_final_layout_row.png" alt="CDE Layout Structure with Body expanded and the unnamed Row that holds Panel_1 selected, its Properties showing Height 360" width="800">
<figcaption>The unnamed row above Panel_1, set to 360</figcaption>
</figure>
</div>

The rows that hold **Panel_1** and **Panel_2** have no name: select the **Row** directly above each panel's **Column**, as in the picture.

3. Select **Save**, then **Preview your Dashboard**.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_final_preview.png" alt="Finished My First Dashboard: the Product Line Sales line chart and Yearly Sales bar chart in the left panels, the Total Sales pie chart by territory on the right, and the dark blue footer with the logo" width="800">
<figcaption>My First Dashboard, finished</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the panels are taller and each chart sits inside its panel: **Product Line Sales** and **Yearly Sales** on the left without legends, **Total Sales** on the right.

4. Close the preview.

### 5. JDBC Connection

> **Note:**
>
> #### JDBC Connection
>
> The Steel Wheels sample data behind the SteelWheels cube lives in the `sampledata` HSQLDB database that starts with the Pentaho Server. The diagram shows its main tables: orders, order details, products and product lines, customers, employees, offices and payments.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_er_sampledata.png" alt="Entity relationship diagram of eight sample tables, productlines, products, orderdetails, employees, customers, orders, offices and payments, showing their columns, data types and key relationships" width="514">
<figcaption>ER - sampledata</figcaption>
</figure>
</div>

The server reaches the database through a named connection, **SampleData**. Open it and test it.

1. In the PUC, open **Home** and select **Manage Data Sources**.
2. Select **SampleData** (type **JDBC**), select the cog wheel, and select **Edit...** in its menu.

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_new_connection.png" alt="Manage Data Sources dialog with the cog wheel menu open and New Connection highlighted below Edit, Delete, Export, Import Analysis and Import Metadata" width="375">
<figcaption>The cog wheel menu</figcaption>
</figure>
</div>

3. Compare the **Database Connection** dialog with this table, then select **Test**:

| Setting | Value |
| --- | --- |
| **Connection Name** | `SampleData` |
| **Database Type** | **Hypersonic** |
| **Access** | **Native (JDBC)** |
| **Host Name** | `localhost` |
| **Database Name** | `sampledata` |
| **Port Number** | `9001` |

<div align="center">
<figure>
<img src="../_assets/images/gs_first_dashboard_database_connection_sampledata.png" alt="Database Connection dialog for SampleData using Hypersonic over Native JDBC, host localhost, database sampledata, port 9001, user pentaho_admin, with a Test Connection success message" width="800">
<figcaption>Database connection - SampleData</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Test Connection** reports that the connection to database `sampledata` succeeded.

4. Close the message, select **Cancel** to leave the connection unchanged, and close **Manage Data Sources**.

> **Under the hood:**
>
> #### The dashboard names a connection; the server holds it
>
> A JNDI data source such as "mdx over mondrianJndi" stores only the
> connection's name in the generated .cda, never a URL or a password.
> When a query runs, the server looks that name up among the connections
> in Manage Data Sources and opens the database itself, which is why a
> JDBC driver goes into the server's tomcat/lib and nowhere near the
> browser.
>
> The schema is published against a named connection too, so the two
> names must match for MDX queries to reach the database.
>
> **Why it matters:** a dashboard moves between servers unchanged; each
> server supplies its own database behind the same connection name, and
> no credentials ever reach the browser.

::::

## Lab Files

Click a file to download. Every file is also on disk in this workshop's folder, `C:\Workshop-CT-Associate\01-getting-started\03-getting-started-my-first-dashboard`.

The footer logo for tab 2:

[logo_pentaho.png](./files/logo_pentaho.png)

### Solution <!-- no-step -->

The finished dashboard. To compare it with your own, upload the zip in **Browse Files**: select **Public > CTools-Dashboard**, select **Upload...**, choose the zip and select **OK**. The server unpacks it into a folder **My-First-Dashboard-Solution**; open **My First Dashboard** there.

[my-first-dashboard-solution.zip](./files/my-first-dashboard-solution.zip)
