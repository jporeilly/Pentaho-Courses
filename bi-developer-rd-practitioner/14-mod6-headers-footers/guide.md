# Formatting Report Headers & Footers

> **Warning:**
>
> #### Workshop - Formatting Report Headers & Footers
>
> Add and style the report header and footer bands.
>
> **What you'll do**
>
> * Add report header and footer bands.
> * Insert images, dates, and page numbers.
> * Style the bands so every page frames cleanly.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Formatting Report Headers & Footers**
>
> Add and style the report header and footer bands.

## Add an Image

1. Open the Demo – totals.prpt
2. Click the image icon, and then drag it to the Report Header band as shown below.

![Add an Image](../_assets/images/mod6-01.png)

You will resize and position the image later.

3. To edit the image contents, on the canvas, double-click the image icon.

![Add an Image](../_assets/images/mod6-02.png)

From the Edit Content dialog, you will specify the image you want to add. Notice you have the option to link to the image or to embed the image in the report. In this demonstration, you will embed the image in the report.

4. To select the Steel Wheels logo, in the Edit Content dialog:
5. Click the … button (browse).
6. Navigate to:
C:\Pentaho-Training\BA-2000\images\sw_logo.jpg.

7. Click Open.
8. Select Embed in Report.
9. Click OK.
10. To resize and position the Steel Wheels logo, in the Report Header band:
11. Click in the center of the Steel Wheels logo to select the image.
12. Drag the top left handle to the top left corner of the Report Header band.
13. Drag the bottom right handle toward the center of the Report Header band and drop it at approximately 1.0” on the vertical ruler and 3.5” on the horizontal ruler.

![Add an Image](../_assets/images/mod6-03.png)

14. Click the Label icon, and then drag it to the upper right corner of the Report Header band.
15. To edit the label element:
16. Double-click in the center of the label element to select it.
17. Click the … button to open the editor.
18. Replace the Label text with Steel Wheels Product Report.
19. Click OK.
20. Drag the left handle to the left and drop it at approximately 4.0” on the horizontal ruler.
21. Click the message icon, and then drag it to the upper right corner of the Report Header band and drop it just below the Steel Wheels Product Report label.
22. To edit the message field:
23. Double-click in the center of the message field to select it.
24. Click the … button to open the editor.
25. Replace the Message text with As of $(report.date, date, MM-dd-yyyy).
26. Click OK.

![Add an Image](../_assets/images/mod6-04.png)

27. Highlight both Elements, and from the formatting toolbar, select right align
28. On the Elements Palette, click the horizontal-line icon, then drag it to the Report Header band and drop it below the Steel Wheels logo image.
29. To resize and position the horizontal-line, in the Report Header band:
30. Click the horizontal-line to select the line.
31. Drag the right handle to the far right of the Report Header band.
32. Drag the left handle to the far left of the Report Header band.
33. Drag the center handle up or down and drop the line at approximately 0.75” on the vertical ruler

![Add an Image](../_assets/images/mod6-05.png)

34. Preview and Save the report: Training Demo Report 6-1 – headers

![Add an Image](../_assets/images/mod6-06.png)

## Add Page Numbering

1. On the Data pane, right-click Functions, and then click Add Functions.
2. To select the Page function, from the Add Function dialog:
3. Double-click Common.
4. Click Page.
5. Click OK.

![Add Page Numbering](../_assets/images/mod6-07.png)

6. From the Data pane, select Page:PageFunction, then drag it to the Page Footer band and drop it in the top left corner.

![Add Page Numbering](../_assets/images/mod6-08.png)

7. Preview and Save the report: Demo – header.prpt

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 6-1 header.prpt">Open: Solution: headers & footers</button>

