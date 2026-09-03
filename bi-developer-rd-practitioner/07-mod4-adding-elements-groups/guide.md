# Adding Data Elements and Report Groups

> **Warning:**
>
> #### Workshop - Adding Data Elements and Report Groups
>
> Place data fields on the canvas, then group the report and add group headers.
>
> **What you'll do**
>
> * Place data fields onto the report canvas.
> * Group the report and add group headers.
> * Preview the grouped layout.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 20 minutes

---

> **Note:**
>
> #### **Adding Data Elements and Report Groups**
>
> Place data fields on the canvas, then group the report and add group headers.

## Adding Data Elements

In this demonstration you will add the Product Code, Product Name, Quantity in Stock, and Buy Price data elements to the Details band.

1. Open the Demo - jdbc sql query.prpt
2. To add Product Code to the Details band, from the Data pane, drag PRODUCTCODE to the Details band and drop it in the top left corner.

![Adding Data Elements](../_assets/images/mod4-02.png)

Do not worry about the exact placement of the PRODUCTCODE field. You will align the data elements in the next demonstration.

3. To add PRODCUTNAME to the Details band, from the Data pane, drag PRODUCTNAME to the Details band and drop it to the right of PRODUCTCODE.
4. Turn on the Field Selector Palette: On the toolbar, click the Toggles the Field-Selector Palette button.

![Adding Data Elements](../_assets/images/mod4-03.png)

5. To add QUANTITYINSTOCK to the Details band, from the Field Selector Palette, drag QUANTITYINSTOCK to the Details band and drop it to the right of PRODUCTNAME.

![Adding Data Elements](../_assets/images/mod4-04.png)

6. Add BUYPRICE to the right of QUANTITYINSTOCK.
7. Close the Field Selector Palette

## Aligning Data Elements
1. Select: View >
* Grids (Show, Snap)
* Guides (Show Guides)
* Element Alignment Hints
ensure they’re checked.

![Aligning Data Elements](../_assets/images/mod4-05.png)

2. Zoom the report canvas to 175%:
In the top left corner of the report canvas, drag the zoom percentage number toward the bottom right corner until the percentage displays 175%.

![Aligning Data Elements](../_assets/images/mod4-06.png)

3. To add a vertical guide, in the top ruler, at 1.25 inches or 3cm.

![Aligning Data Elements](../_assets/images/mod4-07.png)

4. To align PRODUCTNAME with the vertical guide, on the report canvas, select PRODUCTNAME and drag it to the top of the Details band. Drop PRODUCTNAME on the vertical guide.

![Aligning Data Elements](../_assets/images/mod4-08.png)

5. Resize PRODUCTCODE field and align the PRODUCTNAME so that the fields are clear.
6. Resize PRODUCTNAME element, to 3.75 inches or 9.5 cm on the report canvas.
7. Adjust the QUANTITYINSTOCK and BUYPRICE along a vertical guide of 5.25 inches or 13.5 cm
8. To select, or lasso, all the elements in the Details band:
9. On the toolbar, click the Select Objects button.

![Aligning Data Elements](../_assets/images/mod4-09.png)

10. On the report canvas, select PRODUCTCODE.
11. Drag the pointer to the right until all the elements in the Details band are selected.

![Aligning Data Elements](../_assets/images/mod4-10.png)

12. Right mouse click and select: Alignment > Top
13. Preview the report.

![Aligning Data Elements](../_assets/images/mod4-11.png)

> **Under the hood:**
>
> #### A band is a canvas of absolutely positioned elements
>
> Each field you dropped became an element with an x, y, width and
> height in points (1/72 of an inch), saved in the bundle's
> `layout.xml`. The Details band is printed once per row: the engine
> stamps the band at the current vertical position, fills every element
> from that row, advances by the band's height and repeats. Elements
> don't flow around each other, which is why alignment is your job —
> and why the guides, grid and snap exist. They are design-time aids;
> nothing about them is saved into the output.
>
> **Why it matters:** pixel-exact layout is what makes PDF and print
> output predictable. Set the band height and element positions once
> and every row, on every page, lands in the same place.

14. If you’re layout is different, check the order of your sorts in the data source.
## Add Label Elements

1. To enable the Details Header band:
2. In the Structure pane, click Details Header.
3. In the Attributes pane, click in the Value column for common > hide-on-canvas.
4. Select False.

![Add Label Elements](../_assets/images/mod4-12.png)

The Details Header band now appears on the canvas. By default, the Details Header band is one inch. The column labels require less space, so you can resize the band on the canvas.

5. Resize the Details Header band, on the canvas, click the divider line at the bottom of the Details Header band and drag it up to approximately 0.5” below the Report Header.

![Add Label Elements](../_assets/images/mod4-13.png)

6. To assist with adding label elements for the column headers, on the horizontal ruler, click to add guides to align with QUANTITYINSTOCK, and BUYPRICE.
7. To add a label element for the PRODUCTCODE header, on the Elements Palette, click the label icon, and then drag it to the Details Header band and drop it directly above PRODUCTCODE.

![Add Label Elements](../_assets/images/mod4-14.png)

8. Resize and position the label element, so that it mirrors the PRODUCTCODE data element.

![Add Label Elements](../_assets/images/mod4-15.png)

9. Click the cell … and rename Product Code.

![Add Label Elements](../_assets/images/mod4-16.png)

10. Repeat workflow for the other fields.
11. Preview and save the report.

![Add Label Elements](../_assets/images/mod4-17.png)

## Report Groups

Groups are added from the Structure pane. To create a new group, you assign the group a name and specify the field by which the data is to be grouped.

In this demonstration you will create a group for Product Line and add a message element identifying the Product Line to the Group Header band.

1. To add a group for Product Line, in the Structure pane, right-click Group, and then click Add Group.

![Report Groups](../_assets/images/mod4-18.png)

2. To create the group, in the Edit Group window:
3. In the Name field, type Product Line Group.
4. From the Available Fields, select PRODUCTLINE.
5. Click the right arrow to move PRODUCTLINE to the Selected Fields.
6. Click OK.

![Report Groups](../_assets/images/mod4-19.png)

Notice the Group Header and Group Footer appear on the report canvas, and PRODUCTLINE appears on the Structure pane.

> **Under the hood:**
>
> #### A group is a value change in sorted rows
>
> The engine doesn't gather rows by product line. It reads rows in
> the order the query returned them and compares `PRODUCTLINE` on each
> row with the one before; when the value changes it prints the Group
> Footer for the old value, then the Group Header for the new one, and
> carries on. The bundle records nothing more than
> `group-fields="PRODUCTLINE"`.
>
> That is exactly why the earlier step told you to check your sort
> order if the layout looked wrong: unsorted rows produce a "group"
> every time the value flips back, and the engine cannot tell the
> difference.
>
> **Why it matters:** grouping costs nothing at any volume — no
> buffering, no second query — provided the ORDER BY matches the group
> order. Nested groups work the same way, outermost sort key first.

7. To add a message element to identify the Product Line, on the Elements Palette, click the message icon, and then drag it to the top left corner of the Group Header band.

![Report Groups](../_assets/images/mod4-20.png)

8. To edit the message element:
9. Double-click in the center of the message element to select it.
10. Click the … button to open the editor.
11. Replace the Message text with Product Line: $(PRODUCTLINE).
12. Click OK.

![Report Groups](../_assets/images/mod4-21.png)

> **Under the hood:**
>
> #### A message field is a template, filled in each time its band prints
>
> `Product Line: $(PRODUCTLINE)` is a pattern. Whenever the Group
> Header band is laid out, the engine resolves each `$( )` reference
> against the current row and substitutes the value — so the header
> for Classic Cars says Classic Cars, and the next one says Motorcycles,
> from one element. The syntax also takes a type and a format:
> `$(ORDERDATE, date, dd MMM yyyy)` or `$(TOTAL, number, #,##0.00)`,
> and a message can mix several references with literal text.
>
> **Why it matters:** labels that carry data are one element, not a
> label plus a field plus alignment work — and they reformat with the
> pattern, so a date column never shows a raw timestamp by accident.

13. To resize and position the message element, in the Group Header band:
14. approximately 0.25” on the vertical ruler
15. 3.5” or 8 cm on the horizontal ruler.
16. Resize the Group Header band, to approximately 0.5” below the Report Header.

![Report Groups](../_assets/images/mod4-22.png)

17. Format the Product Line message field;
18. Bold and 14 points.
We will now configure our report so that each Product Line begins on a new page. We will go to the Structure tab, navigate to Master Report | Productline Group, and make the following modification:

## Style.pagebreak-after = true

![Style.pagebreak-after = true](../_assets/images/mod4-23.png)

![Style.pagebreak-after = true](../_assets/images/mod4-24.png)

The pagebreak-after will result in separate tabs for each section when exported to Excel.

> **Under the hood:**
>
> #### pagebreak-after is a layout instruction; each exporter interprets it
>
> Setting `pagebreak-after` on the group tells the pagination pass to
> end the page once that group's footer has printed. Pageable outputs —
> PDF, print, the preview — honour it literally. The Excel exporter has
> no pages, so it maps each page break to a new worksheet, which is
> where the separate tabs come from. HTML in single-page mode ignores
> page breaks altogether.
>
> This is the general rule for every output format: the engine
> produces one laid-out result, and each *output processor* — PDF,
> Excel, HTML, CSV — renders it the way that format can.
>
> **Why it matters:** design once for the page and you get sensible
> Excel and HTML for free; but preview in the format the user will
> actually receive before you promise how it looks.

1. Preview and Save the Report: Demo - data elements.prpt

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 4 data elements.prpt">Open: Solution: data elements & groups</button>

