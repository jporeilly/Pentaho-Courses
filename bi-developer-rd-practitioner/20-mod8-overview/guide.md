# Overview of Charts & Sub Reports

> **Note:**
>
> Charts summarise, sub-reports compose, and drill-downs connect them. This section introduces all three.

A chart can be the most important graphical element in your report; it shows the report data visually so that readers can more easily see how the numbers compare. It's easy to add a simple chart in Report Designer, but it will take some time to tweak it to your exact specifications.

There are two types of charts in Report Designer: Traditional JFreeChart elements, and sparkline charts.

## Choosing the right Report

There are 17 JFreeChart chart types built into Report Designer, with some of them changing significantly based on which data collector you choose.

If you want to show the strength of a trend for a single value over time, the best chart types are:

* Line
* Area
* XY StepArea
* XY Step
* XY Line
If you are directly comparing two or more related values, the best chart types to choose are:

* Pie
* Ring
* Bar
* Line
* Area
* Radar
If you want to show how one set of values directly affects another, the best chart types are:

* Bar line combination
* Waterfall
If you are comparing a large number of data points, the best chart types are:

* XY Difference
* XY Dot (Scatter plot)
* Bubble
* Pie Grid (Multi-Pie)
If you need to show a trend among a small number of related numerical data points, a sparkline chart may be

appropriate. However, sparkline charts require comma-separated values for input, so if your data is not in that format, you must create a function to pull it from your data source and put commas between each data point.

For more information on JFreeChart, please refer to:

## Wikipedia: http://en.wikipedia.org/wiki/JFreeChart

## Official site: http://www.jfree.org/jfreechart/

## Learn more

- [Pentaho Report Designer documentation](https://docs.pentaho.com/pba-report-designer) - the official reference for everything in this section.
