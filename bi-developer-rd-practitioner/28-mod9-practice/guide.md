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

1. To login to the server, from the Menu, select File > Publish.
2. In the Login dialog:
3. Verify the Server URL is http://localhost:8080/pentaho.
4. Verify the User is admin.
5. If necessary, in the Password field, type password.
6. Click OK.
7. To publish the report:
8. In the File Name field, type Training Exercise 8-3  Report.
9. In the Title field, type Training Exercise 8-3  Report.
10. In the Location field, navigate to Public > Training.
11. Click OK.
## Sub Report

To add a sub-report showing Volume for each year grouped by Product Line:

**Open the** `..\reports\Inventory List HyperLink Report`

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
