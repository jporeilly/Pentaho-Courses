# Sales Analysis

> **Warning:**
>
> #### Workshop - Sales Analysis
> 
> Pentaho Analyzer is the OLAP tool for building dynamic, drag-and-drop analyses that business users explore on demand, drilling from summary to detail without returning to IT.
> 
> In this workshop, you build interactive pivot table analyses on the Steel Wheels sample data, revealing sales patterns across territories, product lines, and time periods, then extend them with calculations, formatting, visualizations, and export.
> 
> **What you'll do**
> 
> * Understand the three fundamental field types in Analyzer (measures, dimensions, and properties) and how they work together
> * Build a pivot table analysis by dragging dimensions to rows and columns and measures to the data area
> * Apply multiple filters to restrict analysis to specific territories, time periods, and top performers
> * Implement sorting and hierarchical drilling to navigate from years to quarters to months to details
> * Add subtotals at multiple levels and grand totals for comprehensive summarization
> * Create conditional formatting using color scales, data bars, and trend arrows to highlight patterns
> * Build user-defined measures including percentage calculations and custom formulas (Sales plus Tax)
> * Enable drill-through links that allow users to view supporting transaction details from summary cells
> * Customize column headers, numeric formats, and presentation elements for professional output
> * Switch seamlessly between table and chart views (column charts, pie charts, heat grids)
> * Export analyses to multiple formats (PDF, Excel, CSV) for distribution and further analysis
> * Explore administrative options including XML configuration, MDX query logging, and cache management
> 
> **Prerequisites:** Pentaho Business Analytics Server with Steel Wheels sample data and configured OLAP schema\
> **Estimated time:** 30 minutes

<figure><img src="../_assets/images/az_sales_analyzer_reports.png" alt=""><figcaption><p>Analyzer Reports</p></figcaption></figure>

***

:::: tabs

### Leading Product Lines

> **Note:**
>
> #### Leading Product Lines
> 
> The analysis shows the Sales, Quantity, and Unit Sales for each year by Territory and Line, and includes subtotal lines for each Territory, as well as a grand total line. The Quantity column includes data bars to quickly visualize and compare values.&#x20;
> 
> The background colour for the Unit Sales column is formatted using a colour scale range. The report values include hyperlinks allowing you to drill down to the supporting data for each value.

1. To open the Leading Product Lines Report, in the Folders pane, expand Public > Steel Wheels, and then in the Files pane, double-click Leading Product Lines (pivot table).

<figure><img src="../_assets/images/az_sales_leading_product_lines.png" alt=""><figcaption><p>Leading Product Lines</p></figcaption></figure>

> **Note:** The Interactive Toolbar includes toggle buttons to add more fields to the report, rearrange fields on the report, and show the filters in use. There are also buttons to undo or redo changes.
> 
> The More actions and options button provides export options, additional report and chart options, and reset options.

3. To view the available fields, on the interactive toolbar, click the Add more fields onto the report button.

<div align="center"><figure><img src="../_assets/images/az_sales_available_fields.png" alt="" width="340"><figcaption><p>Available fields</p></figcaption></figure></div>

> **Note:** The Available Fields pane shows the data source and the fields available. The fields are listed by category, but you can use the View drop-down list to view the fields by type, alphabetically, or schema.

4. To view the Layout panel, on the interactive toolbar, click the Rearrange fields on the report button.

<figure><img src="../_assets/images/az_sales_layout.png" alt="" width="340"><figcaption><p>Layout</p></figcaption></figure>

> **Note:** The Layout panel shows the rows, columns, and measures used in the report. At the bottom is the Report Options button.

5. To keep only the 2003 data, on the canvas, right-click the 2003 column header, and then click Keep Only 2003.

<figure><img src="../_assets/images/az_sales_filter_2003.png" alt="" width="475"><figcaption><p>Filter - 2003</p></figcaption></figure>

6. To drill down to show the Quarters, on the canvas, double-click the 2003 column header.

<figure><img src="../_assets/images/az_sales_drill_down_quarters.png" alt="" width="450"><figcaption><p>Drill down - Quarters</p></figcaption></figure>

7. To view the analysis as a chart, on the interactive toolbar click the Choose chart type button, and then click Column.

<figure><img src="../_assets/images/az_sales_chart_options.png" alt="" width="242"><figcaption><p>Chart options</p></figcaption></figure>

8. To view the report in table format, on the interactive toolbar, click the Switch to table format button.

<figure><img src="../_assets/images/az_sales_switch_to_table_format.png" alt="" width="163"><figcaption><p>Switch to Table format</p></figcaption></figure>

***

> **Note:**
>
> #### Chart Types

1. To open the Country Performance heat grid, on the main toolbar, click the Open button.

<figure><img src="../_assets/images/az_sales.png" alt="" width="563"><figcaption></figcaption></figure>

2. Navigate to the Public folder, click the Up One Level button twice, and then double-click the Public folder.
3. Double-click the Steel Wheels folder, then click Country Performance (heat grid), and then click Open.

<figure><img src="../_assets/images/az_sales_report_list.png" alt=""><figcaption><p>Report List</p></figcaption></figure>

4. View the Country Performance heat grid.

<figure><img src="../_assets/images/az_sales_heat_grid_country_performance.png" alt=""><figcaption><p>Heat Grid - Country Performance</p></figcaption></figure>

> **Note:** The Country Performance heat grid shows Sales by Year and Quarter for each country. The colour coded squares provide a visual representation of the data.
> 
> The data for Belgium indicates sales have been consistently low, and sales for France have been fair. We can quickly see that France had a good fourth quarter in 2004, and Spain has had several good quarters.

5. To view the underlying details for a specific square, hover the cursor over the red square for Belgium, 2003, QTR2.

<figure><img src="../_assets/images/az_sales_belgium_2003_qtr2.png" alt="" width="563"><figcaption><p>Belgium - 2003 - QTR2</p></figcaption></figure>

6. Click the Spain label.

<figure><img src="../_assets/images/az_sales_spain_data.png" alt=""><figcaption><p>Spain data</p></figcaption></figure>

> **Note:** The data for Spain is in colour, but the rest of the chart data is dimmed. The buttons to Keep Only, Exclude, and Clear Selections at the top of the heat grid enable you to include / exclude the data selected.

7. Drill into the data for Spain at the top of the heat grid, click the Keep Only button.
8. To view the Available Fields and Layout panels, on the interactive toolbar, click the Add more fields onto the report and Rearrange fields on the report buttons.

<figure><img src="../_assets/images/az_sales_fields_and_layout.png" alt="" width="332"><figcaption><p>Fields &#x26; Layout</p></figcaption></figure>

9. To see the sales data for specific product lines in Spain, from the Available Fields pane, select Line and drag it to the X Axis area in the Layout panel.

<figure><img src="../_assets/images/az_sales_add_line.png" alt="" width="407"><figcaption><p>Add Line</p></figcaption></figure>

> **Note:** Sales for classic cars were best in Q1 of 2005, but they began to improve in the Q4 of 2004.

<figure><img src="../_assets/images/az_sales_6.png" alt=""><figcaption></figcaption></figure>

10. Drill down to the months, double-click the green square for Classic Cars, 2004, QTR4. December was the best month of the quarter.

<figure><img src="../_assets/images/az_sales_drill_down_into_classic_cars_2004_qtr4.png" alt=""><figcaption><p>Drill down into Classic Cars, 2004, QTR4</p></figcaption></figure>

11. Drill down to the Vendor, double-click the green square for December.

<figure><img src="../_assets/images/az_sales_drill_down_into_december_for_vendor.png" alt=""><figcaption><p>Drill down into December for Vendor</p></figcaption></figure>

> **Note:** Classic Metal Creations was the highest performing vendor. You could continue drilling down, however, selecting Table will make sense for exporting the sales data.

12. On the report title bar, click the View As Table button.

<figure><img src="../_assets/images/az_sales_table.png" alt="" width="490"><figcaption><p>Table</p></figcaption></figure>

13. On the report toolbar, click More actions and options > Export > To PDF, and then in the Export to PDF window, click Export.

<figure><img src="../_assets/images/az_sales_export_as_pdf.png" alt=""><figcaption><p>Export as PDF</p></figcaption></figure>

> **Note:** Selecting PDF opens in a new browser window. You can save or print the PDF using the PDF toolbar.

14. Close the PDF browser window.
15. On the report toolbar click More actions and options > Reset.

### Sales Analysis

> **Note:**
>
> #### Sales Analysis
> 
> The report will display Sales Revenue grouped by Territory and Product Line over time.

<figure><img src="../_assets/images/az_sales_final_table_emea_revenue_by_product_line_yr2003.png" alt=""><figcaption><p>Final Table - EMEA: Revenue by Product Line Yr2003</p></figcaption></figure>

::: tabs

### Data Source

> **Note:** 

1. From the User Console Home Perspective, click Create New > Analysis Report.
2. In the Select Data Source window, click Steel Wheels: SteelWheelsSales, and then click OK.

<figure><img src="../_assets/images/az_sales_steelwheels_steelwheelssales.png" alt="" width="563"><figcaption><p>SteelWheels: SteelWheelsSales</p></figcaption></figure>

***

> **Note:** **Data Types**
> 
> When you first open Analyzer, the available fields associated with the data source you select are displayed in the Available Fields panel.
> 
> The Available Fields panel consists of a list of measures and dimensions.
> 
> &#x20; • Measures: consist of the numeric data that can be calculated, and are depicted with the ruler icon.
> 
> &#x20; • Dimensions: are different aspects of the calculated data, and are depicted with the stacked squares icon. If a dimension has a number in parenthesis next to it, this indicates it has associated properties.
> 
> &#x20; • Properties: are single data items related to a database object. The database schema associates one or more properties with each database entity.  For example, the dimension ‘Product’ can have the properties: colour, shape, size, weight, etc..

<figure><img src="../_assets/images/az_sales_3.png" alt=""><figcaption></figcaption></figure>

1. From the Available Fields panel, select Country and drag it to the Rows drop zone on the Layout panel.

<figure><img src="../_assets/images/az_sales_add_country_field.png" alt="" width="435"><figcaption><p>Add Country field</p></figcaption></figure>

2. To remove Country, from the canvas:

   ·        Click the Country header.

   ·        Drag it to the lower right corner of the canvas.

   ·        Drop it in the trashcan.

<figure><img src="../_assets/images/az_sales_5.png" alt="" width="125"><figcaption></figcaption></figure>

3. Add Sales to the report by dragging it to the Measures drop zone on the Layout panel.
4. From the Available Fields panel, double-click Territory.
5. Select Years and drag it to the Columns drop zone on the Layout panel.
6. Select Quarters and drag it to the Columns drop zone on the Layout panel. Drop Quarters *below* Years.

<figure><img src="../_assets/images/az_sales_2.png" alt="" width="269"><figcaption></figcaption></figure>

7. Select Line and drag it to the Rows drop zone on the Layout panel. Drop Line *above* Territory.

<figure><img src="../_assets/images/az_sales_7.png" alt="" width="265"><figcaption></figcaption></figure>

> **Note:** When you add columns and rows Analyzer dynamically aggregates the Measure to the required level.

8. To rearrange the fields, on the Layout panel, click Territory and drag it *above* Line.

<figure><img src="../_assets/images/az_sales_report_territory_sales_analysis.png" alt=""><figcaption><p>Report - Territory Sales Analysis</p></figcaption></figure>

### Filter & Conditional Formatting

> **Note:** Filters are used to restrict or limit the data that is presented in an analysis. When you create a filter for a text field you can select from a list of values or match a specific value by typing the value in the text box and specifying a constraint (Contains or Does not Contain).&#x20;
> 
> When you filter on time periods you can choose a commonly used time period, select from a list, or select a range.

1. On the Interactive Toolbar, click the Filter button.

<figure><img src="../_assets/images/ir_sales_territory_filter.png" alt=""><figcaption><p>Filter option</p></figcaption></figure>

2. In the Available Fields panel, select Territory and drag it to the Filter panel.

<figure><img src="../_assets/images/az_sales_filter_panel.png" alt=""><figcaption><p>Filter Panel</p></figcaption></figure>

3. To display only EMEA, in the Filter on Territory dialog box:

   &#x20; • Select: Select from a list.

   &#x20; • From the list of values, click EMEA.

   &#x20; • Click the right arrow to move EMEA to the Currently Included list.

   &#x20; • Click OK.

<figure><img src="../_assets/images/az_sales_filter_emea.png" alt=""><figcaption><p>Filter - EMEA</p></figcaption></figure>

> **Note:** The Parameter Name field enables you to define the filter as a prompt.&#x20;

4. In the Available Fields panel, right-click Years, and then select Filter.

<figure><img src="../_assets/images/az_sales_filter_years.png" alt="" width="258"><figcaption><p>Filter - Years</p></figcaption></figure>

5. To display only 2003, in the Filter on Years dialog box:

   &#x20; • Select: Select from a list.

   &#x20; • From the list of values, click 2003.

   &#x20; • Click the right arrow to move 2003 to the Currently Included list.

   &#x20; • Click OK.

<figure><img src="../_assets/images/az_sales_filter_2003_2.png" alt=""><figcaption><p>Filter - 2003</p></figcaption></figure>

6. In the analysis canvas, right-click Quarters, and then select Filter.

<figure><img src="../_assets/images/az_sales_filter_quarters.png" alt="" width="335"><figcaption><p>Filter - Quarters</p></figcaption></figure>

7. To display only the second quarter, in the Filter on Quarters dialog box, select: Select from a list.

<figure><img src="../_assets/images/az_sales_filter_qtr_2.png" alt=""><figcaption><p>Filter - QTR 2</p></figcaption></figure>

8. From the list of values, click QTR2, then click the right arrow to move QTR2 to the Currently Included list, and then click OK.

<figure><img src="../_assets/images/az_sales_filters.png" alt="" width="563"><figcaption><p>Filters</p></figcaption></figure>

9. On the analysis canvas, click Sales and drag it *up* to the Filter panel.
10. To display the Top 5 Product Lines with Sales Greater Than 10,000 in the Filter on Sales dialog box:

    &#x20; • In the text box for Sales Greater Than, type: 10000.

    &#x20; • Click the Top 10, etc. check box..

    &#x20; • In the numeric value box, type 5.

    &#x20; • Click OK.

<figure><img src="../_assets/images/az_sales_numeric_filter_top_5_lines_by_sales.png" alt=""><figcaption><p>Numeric Filter - Top 5 Lines by Sales</p></figcaption></figure>

<figure><img src="../_assets/images/az_sales_emea_top_5_product_lines_by_sales_2003_qtr2.png" alt="" width="375"><figcaption><p>EMEA: Top 5 Product Lines by Sales 2003 QTR2</p></figcaption></figure>

11. On the analysis canvas, right-click the QTR2 header for 2003, and then select Show All Quarters.
12. Remove the Sales is greater than 10000 filter.

<figure><img src="../_assets/images/az_sales_emea_top_5_product_line_by_sales_for_2003.png" alt=""><figcaption><p>EMEA: Top 5 Product Line by Sales for 2003</p></figcaption></figure>

***

> **Note:** **Applying Conditional Formatting**
> 
> Conditional formatting means that cells within the analysis will be physically affected by the data they contain. The most common form of conditional formatting is stoplight reporting, where cell backgrounds are coloured red, green, or yellow depending on user-defined thresholds.
> 
> Analyzer provides the following methods for conditionally formatting numeric data:
> 
> &#x20; • Color Scale
> 
> &#x20; • Data Bar
> 
> &#x20; • Trend Arrow

1. Right-click one of the Sales headers, and then select Conditional Formatting > Color Scale: Green-Yellow-Red.

<figure><img src="../_assets/images/az_sales_apply_conditional_formatting.png" alt="" width="563"><figcaption><p>Apply Conditional Formatting</p></figcaption></figure>

<figure><img src="../_assets/images/az_sales_conditional_formatting.png" alt=""><figcaption><p>Conditional Formatting</p></figcaption></figure>

2. Remove the conditional formatting, right-click one of the Sales headers, and then deselect Conditional Formatting >  Green-Yellow-Red.

### Calculations & Drill-Through

> **Note:** Grand totals and subtotals summarize detail row or column values. You can choose to summarize the data in the following ways:
> 
> &#x20; • Aggregate
> 
> &#x20; • Sum
> 
> &#x20; • Average
> 
> &#x20; • Max
> 
> &#x20; • Min

1. Remove all Filters.
2. In the analysis details, right-click one of the Sales headers, then select Subtotals (Sums, Averages, etc.).

<figure><img src="../_assets/images/az_sales_subtotals.png" alt="" width="398"><figcaption><p>Subtotals</p></figcaption></figure>

2. Select Average, and then click OK.

<figure><img src="../_assets/images/az_sales_calculations.png" alt="" width="375"><figcaption><p>Calculations</p></figcaption></figure>

3. In the analysis details, right-click the Territory header, and then select Show Subtotals.

<figure><img src="../_assets/images/az_sales_show_subtotals.png" alt="" width="253"><figcaption><p>Show Subtotals</p></figcaption></figure>

> **Note:** Subtotals do not appear in the analysis, until the dimension selected.

<figure><img src="../_assets/images/az_sales_subtotals_and_averages.png" alt=""><figcaption><p>Subtotals &#x26; Averages</p></figcaption></figure>

4. To show grand totals for columns and rows, from the Layout panel: Click Report Options.
5. In the Report Options window, select Show Grand Totals for Rows and Show Grand Totals for Columns.

<figure><img src="../_assets/images/az_sales_grand_totals_rows_and_columns.png" alt="" width="375"><figcaption><p>Grand Totals - Rows &#x26; Columns</p></figcaption></figure>

4. Click OK.

<figure><img src="../_assets/images/az_sales_grand_totals_for_rows_and_columns.png" alt=""><figcaption><p>Grand Totals for Rows &#x26; Columns</p></figcaption></figure>

***

#### User Defined Measure

> **Note:** Analyzer allows you to create three types of measures directly within an analysis:
> 
> &#x20; • Percent of, rank, running sum, or percent of running sum
> 
> &#x20; • Calculated Measures
> 
> &#x20; • Trend Measures
> 
> So we're going to display the percent of sales for each product line, and add a simple calculated measure to show the sales plus 6% tax.

1. Remove all Totals, Subtotals & Averages for rows & columns.
2. Apply 2 filters:

&#x20;      • Territory: EMEA&#x20;

&#x20;      • Year 2003

3. Right-click one of the Sales headers, then select User Defined Measure > % of, Rank, Running Sum….

<figure><img src="../_assets/images/az_sales_user_defined_measure.png" alt="" width="563"><figcaption><p>User Defined Measure</p></figcaption></figure>

4. Select: % of Sales.

<figure><img src="../_assets/images/az_sales_of_sales_3.png" alt="" width="375"><figcaption><p>% of Sales</p></figcaption></figure>

5. Click Next.
6. Click the drop-down arrow for Decimal Places, select 0.

<figure><img src="../_assets/images/az_sales_of_sales_2.png" alt="" width="375"><figcaption><p>% of Sales</p></figcaption></figure>

7. Click: Done.

<figure><img src="../_assets/images/az_sales_of_sales.png" alt=""><figcaption><p>% of Sales</p></figcaption></figure>

***

#### Calculated Measure

1. In the analysis details right-click one of the Sales headers, then select User Defined Measure > Create Calculated Measure.

<figure><img src="../_assets/images/az_sales_calculated_measure.png" alt="" width="563"><figcaption><p>Calculated Measure</p></figcaption></figure>

> **Note:** The left panel lists the measure fields available to use in the calculation. The Selection pane is where you write the MDX expression to calculate the new measure.

<figure><img src="../_assets/images/az_sales_calculated_measure_6_tax.png" alt=""><figcaption><p>Calculated Measure - 6% Tax</p></figcaption></figure>

2. In the Name text box, type Sales + 6% Tax.
3. To specify the numeric format:
4. Click the drop-down arrow for Format.

&#x20;      • Select Currency.

&#x20;      • Click the drop-down arrow for Decimal Places.

&#x20;      • Select 0.

5. To multiply Sales by 1.06, in the formula pane:

&#x20;      • Click to the right of sales.

&#x20;      • Type: \* 1.06.

&#x20;      • Click OK.

<figure><img src="../_assets/images/az_sales_sales_6_tax.png" alt=""><figcaption><p>Sales + 6% Tax</p></figcaption></figure>

***

#### Drill-Through

> **Note:** To create reports based on specific measure data, you can implement drill through links in Analyzer. This will turn all non-calculated measures into links which, when clicked, open a data table that enables you to quickly view more details for that data point.

1. Remove the following columns:

&#x20;       • Sales + Tax 6%

&#x20;       • % of Sales

2. Enable drill through links for Sales, from the Layout panel:

&#x20;       • Click Report Options.

&#x20;       • Select Show drill-through links on Measure cells.

&#x20;       • Click OK.

<figure><img src="../_assets/images/az_sales_drill_through_on_measures.png" alt="" width="375"><figcaption><p>Drill-through on measures</p></figcaption></figure>

3. Drill through to the supporting data, in the analysis details, click the value for EMEA, Classic Cars, 2003, QTR1 ($96,678).

<figure><img src="../_assets/images/az_sales_drill_through_classic_cars.png" alt=""><figcaption><p>Drill-through - Classic Cars</p></figcaption></figure>

### Formatting

> **Note:** You can resize columns, change the column or row header, and change data format.
> 
> To resize columns, click between the column headers and drag the resize icon to the left or right. You can reset all column sizes by clicking More > Reset Column Sizes from the Interactive Toolbar.
> 
> To change the column or row header for text and time period fields, right-click the column or row header and then select Edit
> 
> To format numeric data, right-click the column header and select Column Name and Format.

1. Right-click the column header for Line, then select Edit.

<figure><img src="../_assets/images/az_sales_4.png" alt="" width="272"><figcaption></figcaption></figure>

2. In the Name text box, type Product Line, and then click OK.

<figure><img src="../_assets/images/az_sales_edit_header_cells.png" alt="" width="375"><figcaption><p>Edit header cells</p></figcaption></figure>

3. To modify the Sales data as currency, in the analysis details, right-click one of the Sales headers, then select Column Name and Format.

<figure><img src="../_assets/images/az_sales_format_column.png" alt="" width="563"><figcaption><p>Format Column</p></figcaption></figure>

4. Change the name: Revenue

<figure><img src="../_assets/images/az_sales_8.png" alt=""><figcaption></figcaption></figure>

5. From the Format drop-down list, select Currency ($), and then click OK.

<figure><img src="../_assets/images/az_sales_final_table_emea_revenue_by_product_line_yr2003.png" alt=""><figcaption><p>Formatting</p></figcaption></figure>

***

#### Chart Options

> **Note:** At any point in time, an analysis can have only one format; however, it is easy to switch between formats.

1. To switch the analysis format, click the View As Table or View As Chart button in the analysis title bar.

<figure><img src="../_assets/images/az_sales_pie_charts_for_each_product_line.png" alt=""><figcaption><p>Pie Charts for each Product Line</p></figcaption></figure>

:::

### Actions & Options

> **Note:**
>
> #### Actions & Options&#x20;

<figure><img src="../_assets/images/az_sales_actions_and_options.png" alt="" width="323"><figcaption><p>Actions &#x26; Options</p></figcaption></figure>

::: tabs

### Export

> **Note:**
>
> #### Export Options
> 
> Analyzer provides several options for exporting your analysis. You can export the analysis as a PDF file which launches the analysis in a new window. From there you can save or print the PDF file. You can export the analysis to Excel, which opens the analysis in a new Excel window.
> 
> You can download the analysis data in CSV format. When you download data in the CSV format you get numbers with the full precision available. This way you avoid any rounding errors when you continue to work with your data in Excel. The export options are available from the Interactive Toolbar by clicking the More actions and options button.

<figure><img src="../_assets/images/az_sales_export_options.png" alt=""><figcaption><p>Export options</p></figcaption></figure>

### Report Options

> **Note:**
>
> #### Report Options
> 
> In your report, you can modify how blank measures display, define drill-through columns, and show or hide totals for columns and rows.

1. Click on the 'cog-wheel'.
2. Select: Report Options.

<figure><img src="../_assets/images/az_sales_report_options.png" alt=""><figcaption><p>Report Options</p></figcaption></figure>

> **Note:** You can control what to show when a cell contains a blank value in your Analyzer report. Analyzer reports are designed to break down number fields, such as 'Sales', by text fields such as 'Product Name'.&#x20;
> 
> If a product did not sell, it will appear either as zero dollars or as a blank or a dash ("-"). In some reporting situations, the absence of a value could mean the same as a zero, but in other cases, zero might have a different meaning.&#x20;
> 
> The report calculations in the background behave differently depending on whether a value is 'blank' or a 'zero'. For example, when the report calculates averages, zeroes are considered whereas blanks are not.

### Chart Options

> **Note:**
>
> #### Chart Options
> 
> As an administrator, you can add default chart options that are applied whenever a new chart is created. Adding default chart options does not apply the changes to existing charts.&#x20;
> 
> You can modify the options on charts without affecting the default option settings.&#x20;
> 
> You can also set an existing chart back to the default settings by clicking the Reset to default link on the Other tab of the Chart Options dialog box.

1. Click on the 'cog-wheel'.
2. Select: Chart Options.

<figure><img src="../_assets/images/az_sales_chart_options_2.png" alt=""><figcaption><p>Chart Options</p></figcaption></figure>

### Administration

> **Note:**
>
> #### Adminstration
> 
> If been assigned the Administrator role, then you'll have access to some options that will help troubleshoot and optimize your PAZ reports.

1. Click on the 'cog-wheel'.
2. Select: Chart Options.

<figure><img src="../_assets/images/az_sales_administration_options.png" alt=""><figcaption><p>Administration options</p></figcaption></figure>

***

> **Note:**
>
> #### XML
> 
> Administrators can configure the default value of non-standard properties of the current visualization, at the report-level. This is useful for properties that are hidden from the user interface using a global configuration.
> 
> To perform this configuration, set the corresponding JSON text in the field Visualization state JSON, in the Report Definition dialog (Administration » XML).
> 
> For example, the following JSON configuration would change the colors used by many of the standard visualizations, by changing the value of the palette property:
> 
> \[ { "palette": {"colors": \["red", "green", "blue"]} } ]

<figure><img src="../_assets/images/az_sales_9.png" alt=""><figcaption></figcaption></figure>

***

> **Note:**
>
> #### Log
> 
> Log option is useful for troubleshooting and optimizing your Analyzer reports. The first half of the log displays the xml of the report definition.
> 
> The second half display the MDX query and the times taken to execute the query.

<figure><img src="../_assets/images/az_sales_log.png" alt=""><figcaption><p>Log</p></figcaption></figure>

***

> **Note:**
>
> #### MDX
> 
> From here you're able to open the log file, Clear the Cache, Check the Time dimension and Execute MDX queries.

<figure><img src="../_assets/images/az_sales_mdx.png" alt=""><figcaption><p>MDX</p></figcaption></figure>

<figure><img src="../_assets/images/az_sales_mdx_output.png" alt=""><figcaption><p>MDX - output</p></figcaption></figure>

:::

::::

