# Charts Reference

> **Note:**
>
> Reference material from the course manual (Appendix B).

## Appendix B – Charts

## Bar Charts

Bar charts are useful for discovering trends over time by displaying data in thin, solid columns. Related data sets can be assembled in groups (series) for side-by-side comparison. If you need to show time-oriented changes in data, or if you want to make comparisons between X and Y values that are not directly related in your data source, you must use an XY Bar chart instead.

<div align="center">
<figure>
<img src="../_assets/images/refb-01.png" alt="Annotated bar chart: three series (First, Second, Third) across Category 1 to Category 5, with labels marking the title, axis value labels, grid line, series, Y axis (range), X axis (domain), chart background, plot background and legend" width="512">
<figcaption>Parts of a bar chart: series, range and domain axes, backgrounds and legend</figcaption>
</figure>
</div>

**File:** `..\sample charts\Bar Chart.prpt`

value-columns = [SALES]: This is the value that will be shown on the y axis

series-by-field = [PRODUCTLINE]: This is the item under analysis

category-column = YEAR_ID: This is the category by which the items will be grouped

<div align="center">
<figure>
<img src="../_assets/images/refb-02.jpeg" alt="Product Line Sales Trend bar chart: sales for seven product lines side by side in 2003, 2004 and 2005, each bar labeled with its value" width="543">
<figcaption>Product lines are the series, grouped by YEAR_ID as the category</figcaption>
</figure>
</div>

Suppose we want this chart to show stacked bars. All we have to do is double-click on the object Chart in the report and configure the following on the left-hand side:

<div align="center">
<figure>
<img src="../_assets/images/refb-03.jpeg" alt="The same Product Line Sales Trend chart with stacked bars: one bar per year, each product line a colored segment of it" width="542">
<figcaption>With stacked set to True, each year becomes one stacked bar</figcaption>
</figure>
</div>

stacked = True

If we want the chart to show the bars horizontally, all we have to do is modify the following:

<div align="center">
<figure>
<img src="../_assets/images/refb-04.jpeg" alt="The Product Line Sales Trend chart with horizontal bars: the years down the left side and sales along the top" width="543">
<figcaption>With horizontal set to True, the bars run from left to right</figcaption>
</figure>
</div>

horizontal = True

## Line

Line charts are useful for discovering trends over time by displaying data in thin, usually horizontal lines. Related data sets can be assembled in groups (series) for side-by-side comparison. If you need to make comparisons between X and Y values that are not directly related in your data source, you must use an XY line chart instead.

<div align="center">
<figure>
<img src="../_assets/images/refb-05.png" alt="Annotated line chart: three series (First, Second, Third) across Category 1 to Category 5, with labels marking the title, axis value labels, grid line, series, both axes, both backgrounds and the legend" width="512">
<figcaption>Parts of a line chart: one line per series</figcaption>
</figure>
</div>

**File:** `..\sample charts\Line Chart.prpt`

value-columns = [SALES]: This is the value that will be shown on the y axis

series-by-field = [PRODUCTLINE]: This is the item under analysis

category-column = NewDate: This is the time period expressed in year and month

<div align="center">
<figure>
<img src="../_assets/images/refb-06.jpeg" alt="Product Line Sales Trend line chart: monthly sales from 2003-1 to 2005-5, one line with markers per product line" width="542">
<figcaption>Monthly sales on the category axis, one line per product line</figcaption>
</figure>
</div>

## Area

Area charts are useful for discovering trends over time, where the values you are comparing are typically hierarchical.

If one or more of the chart areas will dip below other areas, then the resulting chart may not be very useful, and you would be better served by a line or bar chart. Area charts are much like line charts, except the area between the lines and the X axis is filled in with either solid, non-overlapping; or transparent, overlapping colors. Related data sets can be assembled in groups (series) for side-by-side comparison. If you need to make comparisons between X and Y values that are not directly related in your data source, you must use an XY area chart instead.

<div align="center">
<figure>
<img src="../_assets/images/refb-07.png" alt="Annotated area chart: three filled series (First, Second, Third) layered across Category 1 to Category 5, with labels marking the title, axis value labels, grid line, series, both axes, both backgrounds and the legend" width="512">
<figcaption>Parts of an area chart: the area under each line is filled</figcaption>
</figure>
</div>

**File:** `..\sample chart\Area Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-08.jpeg" alt="Stacked, semi-transparent area chart of seven product lines across 2003, 2004 and 2005" width="521">
<figcaption>Product line areas stacked year by year</figcaption>
</figure>
</div>

If you do not want the areas to stack, there is a way to make the areas not cover each other:

* Make them somewhat transparent by modifying the value of plot-fg-alpha
* In series-color, choose a collection of colors that are very different from each other
* In plot-bg-color, choose a dark color, for example, dark gray
If we want our report to show the value of each angle on the edge of each area, we configure the following:

```bash
show-item-labels = Show Labels
```

<div align="center">
<figure>
<img src="../_assets/images/refb-09.jpeg" alt="Close-up of the area chart for 2003 and 2004, with each sales value printed at an angle along the edge of its area" width="590">
<figcaption>With item labels shown, each value sits on the edge of its area</figcaption>
</figure>
</div>

## Pie

Pie charts are useful for comparing multiple data points. A single pie slice can be "exploded" out from the rest of the chart to bring attention to the value it represents. If you need to compare related data sets in groups, you must use a pie grid chart instead.

<div align="center">
<figure>
<img src="../_assets/images/refb-10.png" alt="Annotated pie chart: three slices (Part 1, Part 2, Part 3) with section labels, and labels marking the title, slice, section label, chart background, plot background and legend" width="512">
<figcaption>Parts of a pie chart: slices, section labels and legend</figcaption>
</figure>
</div>

**File:** `..\sample charts\Pie.prpt`

value-columns = Sales

series-by-field = [Product]

As you can see, each portion of the pie is labeled with its Sales value and the percentage that this represents of the total pie. This is due to the following configuration:

label-format = {1} ({2})

Note: {0}, {1}, {2}, and {3} are variables that return different values according to the type of chart; in this case:

## {0} returns the name of the item

## {1} returns the value of the item

{2} returns the percentage of the total that the item represents

{3} returns the sum of the values of all items

If we remove the legend box present in the lower part of the chart (show-legend = False), we could configure label-format as follows:

label-format = Product: {0}

## Sales: {1}

<div align="center">
<figure>
<img src="../_assets/images/refb-11.png" alt="Close-up of a pie section label that reads Product: Computer Games, Sales: 253,453, Percentage: 29%" width="267">
<figcaption>A custom label-format puts the product, sales and percentage on separate lines</figcaption>
</figure>
</div>

## Multi-Pie

Pie grid charts are useful for comparing multiple data points in a group. The group (series) items will display as multiple pie charts in one chart area.

<div align="center">
<figure>
<img src="../_assets/images/refb-12.png" alt="Annotated multi-pie chart: five small pies, Category 1 to Category 5, each split into First, Second and Third, with labels marking the title, series, value, section label, backgrounds and legend" width="512">
<figcaption>Parts of a multi-pie chart: one pie per category</figcaption>
</figure>
</div>

**File:** `..\sample charts\Multi Pie Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-13.jpeg" alt="Two pies side by side, 2003 and 2004, each slice labeled with its percentage of that year's sales" width="535">
<figcaption>One pie per year, so the product mix can be compared across years</figcaption>
</figure>
</div>

## Bar Line Combination

Bar Line charts are useful for spotting trends and comparing items against one another as well as showing comparisons between metrics. For instance, you might have bars that represent the number of employees per department, and a line that indicates productivity; or bars that represent software product sales, and a line that represents the number of evaluation downloads. You cannot have more than one line per bar line chart, so if you need to compare more than one set of metrics, you will have to create multiple charts to show them.

Note: Bar Line charts require two data sources -- one for the bars, one for the line. These are set through the Primary Datasource and Secondary Datasource tabs at the top of the right half of the Bar Line properties window. In order to properly show a relationship between the two data points, you should use the same data source for both the bars and the line.

<div align="center">
<figure>
<img src="../_assets/images/refb-14.png" alt="Annotated bar line chart: three bar series on the left Value axis and three line series on the right Value2 axis, across Category 1 to Category 5, with labeled chart parts" width="512">
<figcaption>Parts of a bar line chart: bars on the left axis, lines on the right</figcaption>
</figure>
</div>

**File:** `..\sample charts\Bar Line Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-15.jpeg" alt="Bar line chart for 2003 to 2005: sales bars per product line against the left Sales axis, and volume lines per product line against the right Volume axis" width="502">
<figcaption>Sales as bars from the primary data source, volume as lines from the secondary one</figcaption>
</figure>
</div>

If we double-click on the object Chart, we will see to the right that the Secondary DataSource tab is now available. This implies that this type of chart has two data sources:

Primary DataSource: This is used in a bar chart and is configured as follows:

category-column = YEAR_ID

value-columns = [SALES]

series-by-field = [PRODUCTLINE]

Secondary DataSource: This is used in a line chart and is configured as follows:

category-column = YEAR_ID

value-columns = [VOLUME]

series-by-field = [PRODUCTLINE]

The scale to the left (vertical axis in this case) can be configured by editing the characteristics of Y-Axis, while the scale to the right can be configured by editing the characteristics of Y2-Axis.

## Ring

Note: This chart type is only available in Report Designer; it cannot be created through the BI Platform's ChartComponent.

Ring charts, like pie charts, are useful for comparing multiple data points. Pie charts are generally easier to read, so you should probably have a specific reason to choose a ring over a pie chart. A single ring slice can be "exploded" out from the rest of the chart to bring attention to the value it represents. If you need to compare related data sets in groups, you must use a pie grid chart instead.

<div align="center">
<figure>
<img src="../_assets/images/refb-16.png" alt="Annotated ring chart: three sections (Part 1, Part 2, Part 3) around a hollow center, with labels marking the title, series, value, section label, backgrounds and legend" width="512">
<figcaption>Parts of a ring chart: a pie with a hollow center</figcaption>
</figure>
</div>

**File:** `..\sample charts\Pie.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-17.jpeg" alt="Ring chart of five toy categories, each section labeled with its sales and percentage, for example Stuffed Toys 33% and Computer Games 29%" width="407">
<figcaption>The same data as a pie chart, drawn as a ring</figcaption>
</figure>
</div>

If we pay attention, we will see that the only difference to a pie chart is that a ring chart has one more field, section-depth.

## Bubble

Bubble charts are useful for spotting relationships between metrics and comparing specific data points. In  terms of functionality and purpose, a bubble chart is similar to a bar line chart, but offers more specific visual cues for certain data sets. Each bubble represents a plotted XY point at its center, and the Z axis controls the diameter of the bubble.

For example, a sales chart might have the top 5 bestselling product names for the X axis, number of units sold as the Y axis, and total sales revenue for each product for the Z axis.

<div align="center">
<figure>
<img src="../_assets/images/refb-18.png" alt="Annotated bubble chart: two series of bubbles (First, Second) plotted on numeric X and Y axes, bubble size marking the Z axis, with labeled chart parts" width="512">
<figcaption>Parts of a bubble chart: the size of each bubble is the Z axis</figcaption>
</figure>
</div>

**File:** `..\sample charts\Bubble Chart by Line.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-19.jpeg" alt="Trucks and Buses bubble chart: eleven vehicle models plotted by two values, each bubble a different size and color, with a legend of model names" width="583">
<figcaption>One bubble per product, sized by the quantity ordered</figcaption>
</figure>
</div>

This type of chart presents data in three dimensions. The x and y axes represent the two different scales on which each point will be placed, and the z axis is represented by making each point larger. In this case, the points represent the Products, the y axis is the Cost, the x axis is the Sales, and the z axis (or dot size) represents the quantity ordered of this product.

## Scatter Plot

Note: This chart type is called XY Dot in the BI Platform's ChartComponent.

XY dot (scatter plot) charts are useful for showing trends for many individual exact data points over time. The plotted points show data trends in groupings; where the dots are most concentrated, the trend is most prevalent. If there are very few data points, an XY line or bar chart may be a more appropriate chart type than XY dot.

<div align="center">
<figure>
<img src="../_assets/images/refb-20.png" alt="Annotated scatter chart: Cost plotted against Sales for 2003, 2004 and 2005, with labels marking the title, axis value labels, grid line, both axes, backgrounds and legend" width="509">
<figcaption>Parts of a scatter plot: each point is one X and Y value pair</figcaption>
</figure>
</div>

**File:** `..\sample charts\Scatter XY Collector.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-21.jpeg" alt="Scatter chart of Sales against Volume, one square marker per product, colored by year: 2003, 2004 and 2005" width="543">
<figcaption>Sales against volume, with each year in its own color</figcaption>
</figure>
</div>

The example report analyzes the dispersion of products by year taking into account the values Sales and Volume.

## XY Bar

XY bar charts are useful for showing data trends over time, where values tend to change after reasonably long intervals.

An XY step chart is essentially a horizontal bar chart where the bars are segmented vertically whenever there is a change in value.

<div align="center">
<figure>
<img src="../_assets/images/refb-22.png" alt="Annotated XY bar chart: monthly bars from January 2003 to mid-2005 on a time axis, with labels marking the title, axis value labels, grid line, both axes and backgrounds, and the note Legend (not shown)" width="512">
<figcaption>Parts of an XY bar chart: the domain axis is time</figcaption>
</figure>
</div>

**File:** `..\sample charts\XY Bar Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-23.jpeg" alt="XY bar chart of sales across 2003: thin colored bars placed on a time axis" width="530">
<figcaption>Each bar sits at its date on the time axis</figcaption>
</figure>
</div>

## XY Line

XY line charts are useful for showing how multiple data trends relate to one another over time. It is essentially multiple line charts interposed over one another, and using data sets that are closely related and similar enough to share the same Y axis scale.

<div align="center">
<figure>
<img src="../_assets/images/refb-24.png" alt="Annotated XY line chart: two series (First, Second) plotted on numeric X and Y axes, with labels marking the title, axis value labels, grid line, axis titles, backgrounds and legend" width="512">
<figcaption>Parts of an XY line chart: both axes are numeric</figcaption>
</figure>
</div>

**File:** `..\sample charts\XY Line Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-25.jpeg" alt="XY line chart of sales across 2003: several colored lines over a time axis" width="540">
<figcaption>Several related sales series over one time axis</figcaption>
</figure>
</div>

## XY Area

XY area charts are useful for comparing multiple related data sets over time, especially in zero-sum situations  where you want to show how much of a part each data set has of the total.

<div align="center">
<figure>
<img src="../_assets/images/refb-26.png" alt="Annotated XY area chart: two semi-transparent filled series (First, Second) on numeric X and Y axes, with labeled chart parts" width="512">
<figcaption>Parts of an XY area chart: overlapping areas stay visible through each other</figcaption>
</figure>
</div>

**File:** `..\sample charts\XY Area Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-27.jpeg" alt="XY area chart of sales across 2003: overlapping translucent areas over a time axis" width="536">
<figcaption>Overlapping sales areas over time</figcaption>
</figure>
</div>

XY Extended Line (XY Step, XY StepArea, XY Difference)

There are three possible variations of the XY extended line chart: StepChart, StepAreaChart, and DifferenceChart.

Passing these values to the ext-chart-type parameter in Report Designer, or the chart-type variable in an action sequence will determine which chart you will create. All three types share the same properties.

XY extended line charts are useful for showing how multiple data points change over time while also showing how each compares against the others.

<div align="center">
<figure>
<img src="../_assets/images/refb-28.png" alt="Annotated step chart: Cost against Sales for 2003, 2004 and 2005 drawn as stepped lines, with labeled chart parts" width="508">
<figcaption>StepChart: values change in steps rather than slopes</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/refb-29.png" alt="Annotated step area chart: Cost against Sales for 2003, 2004 and 2005 drawn as filled steps, with labeled chart parts" width="800">
<figcaption>StepAreaChart: the same steps, filled down to the axis</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/refb-30.png" alt="Annotated XY difference chart: SALES and COST lines from January 2003 to mid-2005, with the gap between them shaded green" width="800">
<figcaption>DifferenceChart: the shading shows the gap between two series</figcaption>
</figure>
</div>

## Waterfall

Note: Waterfall charts are only available in Report Designer; you cannot create a waterfall chart with

ChartComponent.

A Waterfall chart is useful for showing the length of each specific portion of a trend.

<div align="center">
<figure>
<img src="../_assets/images/refb-31.png" alt="Annotated waterfall chart: horizontal Sales bars for 2003, 2004 and 2005; the 2004 bar starts where the 2003 bar ends, and the 2005 bar starts from zero" width="512">
<figcaption>The middle bar starts where the previous bar ends</figcaption>
</figure>
</div>

**File:** `..\sample charts\Waterfall Legacy.prpt`

This type of chart is generally used to show increases and decreases in the values under analysis. The first and last values of the chart are represented with a common bar. From the second bar onward, the bars are positioned relative to the right edge of the first bar. If the second value represents a positive value, the bar grows to the right and is green; however, if the value is negative, the bar decreases to the left and is red.

## Radar

Note: Radar charts are only available in Report Designer; you cannot create a radar chart with the BI Platform's ChartComponent.

A radar chart is useful for showing how two or more volume-related data points compare against one another, using a third related data point as a basis for comparison. For instance, you may want to show how sales dollar amounts compare among product lines across multiple territories.

<div align="center">
<figure>
<img src="../_assets/images/refb-32.png" alt="Annotated radar chart: three series (First, Second, Third) plotted on five category spokes, with labels marking the title, backgrounds and legend" width="512">
<figcaption>Parts of a radar chart: one spoke per category</figcaption>
</figure>
</div>

**File:** `..\sample charts\Radar Chart.prpt`

<div align="center">
<figure>
<img src="../_assets/images/refb-33.jpeg" alt="Radar chart with seven product-line spokes and sales for 2003, 2004 and 2005 drawn as overlapping shapes, Classic Cars reaching furthest" width="411">
<figcaption>Each year is one shape; the further out a point, the higher the sales</figcaption>
</figure>
</div>

## Choosing the right chart type

There are 17 JFreeChart chart types built in, and the right one
depends on what the data is saying (from the official User Guide):

| You want to show… | Best chart types |
| --- | --- |
| The strength of a trend for one value over time | Line, Area, XY StepArea, XY Step, XY Line |
| A direct comparison of two or more related values | Pie, Ring, Bar, Line, Area, Radar |
| How one set of values affects another | Bar Line Combination, Waterfall |
| A large number of data points | XY Difference, Scatter Plot, Bubble, Multi-Pie |
| A trend across a few numbers, inline | Sparkline (input must be comma-separated values — use a function to build the CSV string if needed) |

Match the **data collector** to the chart family: CategorySet /
PivotCategorySet for category charts (Bar, Line, Area, Waterfall,
Radar), PieSet for Pie and Ring, TimeSeries / XYSeries / XYZSeries for
the XY family, Scatter, and Bubble.
