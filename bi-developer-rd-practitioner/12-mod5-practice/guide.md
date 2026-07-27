# Practice: Calculations

> **Warning:**
>
> #### Workshop - Practice: Calculations
>
> Two exercises: apply conditional formatting, then add totals — on your own this time.
>
> **What you'll do**
>
> * Apply conditional formatting on your own.
> * Add group and report totals.
> * Compare your output with the expected result.
>
> **Prerequisites:** Complete this section's guided demonstrations first
>
> **Estimated Time:** 20 minutes

---

> **Note:**
>
> #### **Practice: Calculations**
>
> Two exercises: apply conditional formatting, then add totals — on your own this time.

## Conditional Formatting

In this exercise you will use the Formula Editor to change the text color of the Total Price depending on the value of the field

## Open the Exercise – data elements.prpt

Select TOTALPRICE, in the Details band.

To access the Formula Editor for the text color, on the Style pane, click the round green + icon to the right of text > text-color.

From the Category drop-down list, select Logical.

Double-click on the IF statement and add the following Formula:

=IF([TOTALPRICE]<3000;"RED";IF([TOTALPRICE]>6000;"GREEN";"BLACK"))

Preview and Save the report: Exercise – conditional formatting.prpt

## Report & Group Totals

To create totals for country and territory, and a grand total for the report:

* Open the Exercise – conditional formatting.prpt
* In the Data pane, right-click Functions, and then click Add Functions.
* Add the following Sum function:  TotalGroupSumFunction0.
* Rename to: TotalforCountry
* Click in the Value column, and then from the drop-down list, select TOTALPRICE
* Reset on Group Name, click in the Value column, and then from the drop-down list, select COUNTRY.
* Add another Sum function: TotalforTerritory
* Click in the Value column, and then from the drop-down list, select TOTALPRICE
* Reset on Group Name, click in the Value column, and then from the drop-down list, select TERRITORY
* Add another Sum function: TotalforReport
* Click in the Value column, and then from the drop-down list, select TOTALPRICE
## Add Totals to Report

* From the Data pane, select Sum:TotalforCountry, and drag it to the Country Group Footer band (the first Group Footer band), directly below TOTALPRICE.
* Drag a message element to the canvas, and drop it in the Country Group Footer band directly below ORDERNUMBER.
* Replace the Message text with Total for $(COUNTRY).
* Format the Total for $(COUNTRY)
* Font Size 12, Bold
* From the Data pane, select Sum:TotalforTerritory, and drag it to the Territory Group Footer band, directly below Sum: TotalforCountry
* Drop a Message Element in the Territory Group Footer band, directly below Total for $(COUNTRY).
* Replace the Message text with Total for $(TERRITORY).
* Format: Total for $(TERRITORY)
* Font Size 12, Bold, Blue
* From the Data pane, select Sum:TotalforReport, and drag it to the Report Footer band, directly below Sum:TotalforTerritory.
* Drop a Label Element in the Report Footer band directly below Total for $(TERRITORY).
* Replace the Label text with Grand Total.
* Format Grand total:
* Font Size 12, Bold, Blue
* Preview and Save the report: Exercise – totals.prpt
![Add Totals to Report](../_assets/images/mod5-18.png)
