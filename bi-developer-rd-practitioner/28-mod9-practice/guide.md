# Practice: Publishing

> **Warning:**
>
> #### Workshop - Practice: Publishing
>
> Publish your report and add hyperlinks on your own.
>
> **What you'll do**
>
> * Publish your report to the BA repository on your own.
> * Add hyperlinks and verify them in the Pentaho User Console.
>
> **Prerequisites:** Complete this section's guided demonstrations first
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Practice: Publishing**
>
> Publish your report and add hyperlinks on your own.

## Publishing Report

* To login to the server, from the Menu, select File > Publish.
* In the Login dialog:
* Verify the Server URL is http://localhost:8080/pentaho.
* Verify the User is admin.
* If necessary, in the Password field, type password.
* Click OK.
* To publish the report:
* In the File Name field, type Training Exercise 8-3  Report.
* In the Title field, type Training Exercise 8-3  Report.
* In the Location field, navigate to Public > Training.
* Click OK.
## Sub Report

To add a sub-report showing Volume for each year grouped by Product Line:

## Open the ..\reports\Inventory List HyperLink Report

To create the hyperlink for the Product Code, in the Details band, right-click PRODUCTCODE, and the select Hyperlink.

To identify the Inventory List – Drill-to Report for the Path field:

Click the Browse button.

In the Server login dialog, click OK.

Navigate to /Public/Training.

Click Inventory List – Drill To Report.

Click OK.

For the ProdCodeParameter Value drop-down list, select =[PRODUCTCODE], and then click OK.

Publish the Inventory List Hyperlink Report to the Training folder.

When the Launch the published report? dialog displays, click No.

From the Menu bar select File > Preview > HTML, and then in the Parameters dialog, click OK to select EMEA.

After reviewing the results, close the report preview window.
