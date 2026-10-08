# Totals

> **Warning:**
>
> #### Workshop - Totals
>
> Add running and aggregate totals at group and report level.
>
> **What you'll do**
>
> * Add functions for group and report totals.
> * Place running totals in group footers.
> * Preview and sanity-check the numbers.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 10 minutes

---

> **Note:**
>
> #### **Totals**
>
> Add running and aggregate totals at group and report level.

## Functions

Report functions are commonly used to calculate group and report level aggregations, such as totals and averages, but they can also be used to format report content or generate row level calculations. Functions can use values available in the dataset or use a value returned from another function. Functions are often parameterized by outputs of other functions. Functions are added from the Data pane.

1. Open the Demo - conditional formatting.prpt
2. On the Data pane, right-click Functions, and click Add Functions.

![Functions](../_assets/images/mod5-09.png)

![Functions](../_assets/images/mod5-10.png)

3. To select the Sum function, from the Add Function dialog:
4. Double-click Summary.
5. Click Sum.
6. Click OK.

![Functions](../_assets/images/mod5-11.png)

7. To customize the function, on the Data pane, click Sum: TotalGroupSumFunction( )

![Functions](../_assets/images/mod5-12.png)

8. Change the Function Name: TotalGroup
9. To apply the sum function to Quantity in Stock, in the bottom pane, for Field Name, click in the Value column, and then from the drop-down list, select QUANTITYINSTOCK.
10. To reset the sum function for each group, in the bottom pane, for Reset on Group Name, click in the Value column, and then from the drop-down list, select Product Line Group.

![Functions](../_assets/images/mod5-13.png)

> **Under the hood:**
>
> #### TotalGroupSumFunction knows the group's total before the group starts
>
> The engine runs the report in two passes, and `TotalGroupSumFunction`
> is declared to depend on the first one. During the pagination pass it
> adds up `QUANTITYINSTOCK` for every row, resetting each time the
> Product Line group changes, and remembers the result for each group.
> In the print pass it can therefore report the *complete* group total
> from the group's first row onward — which is why a Total function
> works in a Group Header just as well as a footer.
>
> The other family, `ItemSumFunction`, is a running sum: correct only
> at the moment the last row of the group has passed, so it belongs in
> footers alone. Reset on Group Name is what scopes either kind; leave
> it blank and the function accumulates across the whole report.
>
> **Why it matters:** totals in headers, percentages of a group total
> on every detail row, "3 of 12" counters — all possible because the
> engine reads the data twice so you don't have to write a second
> query.

11. To add another function to sum the Quantity in Stock for the entire report, on the Data pane, right-click Functions, and then click Add Functions.
12. Repeat the workflow, renaming the function: GrandTotal

![Functions](../_assets/images/mod5-14.png)

13. Select Sum:TotalGroup, and drag it to the Group Footer band, directly below QUANTITYINSTOCK.
14. Drag a message element to the canvas, and drop it in the Group Footer band directly below PRODUCTNAME.
15. Edit the message element:
16. Resize the element.
17. Double-click in the centre of the message element to select it.
18. Click the … button to open the editor.
19. Replace the Message text with Total for $(PRODUCTLINE).
20. Click OK.

![Functions](../_assets/images/mod5-15.png)

> **Under the hood:**
>
> #### Dragging a function onto a band creates a field bound to its name
>
> The number-field that appeared in the Group Footer has its `field`
> attribute set to `TotalGroup`. From the layout's point of view a
> function is simply another column of the data row — one the engine
> computes rather than the database — so it is placed, formatted and
> aligned exactly like `QUANTITYINSTOCK`. The message field beside it
> resolves `$(PRODUCTLINE)` from the same row, and because a Group
> Footer prints after the group's last row but *before* the value
> changes, it shows the group that just ended.
>
> **Why it matters:** functions, query columns and parameters all
> live in one namespace. A formula can reference `[TotalGroup]` as
> easily as `[QUANTITYINSTOCK]`, which is how you get a "% of group"
> column with one more expression.

21. To format the elements in the Group Footer band, on the canvas:
22. Click the Total for $(PRODUCTLINE) message element.
23. Hold the Shift key and click the TotalGroup element.
24. From the font size drop-down list, select 12.
25. Cclick the Bold button.
26. The font colour drop-down list, select blue.

![Functions](../_assets/images/mod5-16.png)

27. Select Sum:GrandTotal, and drag it to the Report Footer band, directly below TotalGroup function.
28. From the Elements Palette, drag a Label element to the canvas, and drop it in the Report Footer band directly below Total for $(PRODUCTLINE).
29. To edit the label element:
30. Resize the element.
31. Double-click in the centre of the label element to select it.
32. Click the … button to open the editor.
33. Replace the Label text with Grand Total.
34. Click OK.

![Functions](../_assets/images/mod5-17.png)

35. Apply previous formatting options:
36. Font  Size 12, Bold, Blue
37. Preview and Save the report: Demo – totals.prpt

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 5-1 totals.prpt">Open: Solution: totals</button>

