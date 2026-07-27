# Formatting the Report

> **Warning:**
>
> #### Workshop - Formatting the Report
>
> Apply fonts, colours, and spacing across the report body.
>
> **What you'll do**
>
> * Apply fonts, colours, and spacing across the report body.
> * Align and size elements consistently.
> * Preview the polished layout.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Formatting the Report**
>
> Apply fonts, colours, and spacing across the report body.

## Formatting & Style Pane

Add various formatting features to the report.

* Open the Demo – header.prpt
* Select the Steel Wheels Product Report label element, in the Report Header band, and in the right pane, click the Structure tab.
* To change the font size of the selected label element, on the Style pane:
* Double-click the Value for font > font-size.
* Change the value to 12.
* Press Enter.
![Formatting & Style Pane](../_assets/images/mod6-09.png)

* Change the value of Bold to: true
* On the Structure pane, select the report date message field, click message-field:
As of $(report.date, date, MM-dd-yyyy).

* In the Style pane, change the font color of the report date message field, click in the Value column for text > text-color, and then click the … button.
![Formatting & Style Pane](../_assets/images/mod6-10.png)

* To select bright blue, from the Swatches tab.
![Formatting & Style Pane](../_assets/images/mod6-11.png)

* Select the horizontal line, on the Report Header band.
* To change the line stroke, on the Style pane:
* Click in the Value column for object > stroke.
* Click the … button.
* Change the Width to 1.0.
* From the Dashes drop-down list, select the dot-dash stroke.
* Click OK.
![Formatting & Style Pane](../_assets/images/mod6-12.png)

* Preview and Save the report: Training Demo Report 6-2 formatting
![Formatting & Style Pane](../_assets/images/mod6-13.png)

## Background

* Expand Group > Group Body > Group: PRODUCTLINE > Details Body, and then click Details Header.
* To set the background color for the Details Header band to aqua:
* On the Style pane, click in the Value column for text > bg-color.
* Click the … button.
* In the Edit Properties dialog, from the Swatches tab, click an aqua swatch.
* Click OK.
![Background](../_assets/images/mod6-14.png)

* To add a border at the bottom of the Details Header band:
* On the Structure pane, click Details Header.
* On the Style pane, double-click in the Value column for border > bottom-size.
* Change the value to 1.0.
* Press Enter.
* Click in the Value column for border > bottom-style.
* Select Solid.
![Background](../_assets/images/mod6-15.png)

* To format the Buy Price as currency with two decimal places:
* On the Report Details band, click BUYPRICE to select the field.
* On the Attributes pane, click in the Value column for common > format.
* From the drop-down list, select □ #,###,00;( □ #,###.00).
* Press Enter.
![Background](../_assets/images/mod6-16.png)

Note: The □ symbol displays the system’s currency symbol.

![Background](../_assets/images/mod6-17.png)

To repeat the header column fields across the report:

* Highlight the Details Header band, in the Structure Pane.
* Under the Style tab, scroll down to the Page Behavior section.
* Select ‘False’ from the dropdown box.
![Background](../_assets/images/mod6-18.png)

* Preview and Save the report: Demo – formatting.prpt
