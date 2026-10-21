# Practice: Publishing

> **Warning:**
>
> #### Workshop - Practice: Publishing
>
> Two exercises on your own: publish the drillable chart report from the last practice, then add a product code hyperlink to another report and publish that too.
>
> **What you'll do**
>
> * Publish a report to `/public/Training`
> * Add a hyperlink to the detail report on the server
> * Publish the linked report
> * Test the link in the User Console
>
> **Prerequisites:** [Practice: Charts & Sub Reports](../24-mod8-practice/guide.md) and its report, `Exercise - drillable chart.prpt`; [Publishing Reports](../26-mod9-publishing/guide.md) and [Hyperlinks](../27-mod9-hyperlinks/guide.md), with `Inventory List - drill-to` published
>
> **Estimated time:** 15 minutes

:::: tabs

### 1. Publish a report

> **Note:**
>
> #### Publish the chart
>
> Publish the drillable chart report to the `Training` folder, and run it in the User Console.

1. Start Report Designer with the **Start Pentaho Report Designer** button below, or from a terminal:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\report-designer
.\report-designer.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/report-designer
./report-designer.sh
```

:::

<button data-launch="prd" data-path="">Start Pentaho Report Designer</button>

2. Select **File > Open** (`Ctrl+O`) and open `Exercise - drillable chart.prpt` from your workshop folder, `Documents\RD-Workshop`.
3. Select **File > Publish** (`Ctrl+Shift+P`). In the **Login** dialog, check that **URL** is `http://localhost:8080/pentaho` and that you sign in as the administrator from [Before You Start](../01-mod1-getting-started/guide.md), and select **OK**.
4. In the **Publish To Server** dialog, set **File Name** to `Training Exercise 8-3 Report.prpt` and **Title** to `Training Exercise 8-3 Report`, open `/public/Training` under **Location**, and select **OK**.
5. In the **Launch the published report?** dialog, select **No**.
6. In the User Console, open **Browse Files > Public > Training** and double-click **Training Exercise 8-3 Report**.

> **Success:** Checkpoint: the report opens in the User Console with its **State:** prompt set to `NY`, and the 3-D chart of quantities by product line for `NYC` and `White Plains`.

### 2. A hyperlink to publish

> **Note:**
>
> #### Product code links
>
> `Inventory List HyperLink Report.prpt`, in the **Lab Files** of [Hyperlinks](../27-mod9-hyperlinks/guide.md), is the Steel Wheels product report without links. Download it into your workshop folder first.

1. Select **File > Open** (`Ctrl+O`) and open `Inventory List HyperLink Report.prpt` from your workshop folder.
2. In the **Details** band, right-click `PRODUCTCODE` and select **Hyperlink**.
3. In the **Hyperlink** dialog, set **Location** to `Pentaho Repository (Legacy)`, select **Browse**, open `/public/Training`, select **Inventory List - drill-to**, and select **OK**.
4. On the **Report Parameters** tab, set the **Value** of `ProdCodeParameter` to `=[PRODUCTCODE]`, and select **OK**.
5. Save the report (`Ctrl+S`).
6. Select **File > Publish** (`Ctrl+Shift+P`), and publish the report to `/public/Training` as `Inventory List HyperLink Report.prpt`. In the **Launch the published report?** dialog, select **No**.
7. In the User Console, open **Browse Files > Public > Training**, double-click **Inventory List HyperLink Report**, and select a product code.

> **Success:** Checkpoint: the **Inventory List - drill-to** report opens for the product code you selected, showing that product only.

8. Close the detail report's tab.

> **Under the hood:**
>
> #### On the server, the link stays inside the User Console
>
> The `DRILLDOWN` formula builds the viewer URL of the target report
> from its repository path, on the server the report runs on. In the
> User Console your browser is already signed in to that server, so
> the detail report opens with your session. In Report Designer's HTML
> preview the same link reaches the server from outside, where the
> browser may ask you to sign in first.
>
> **Why it matters:** published reports and their drill targets work
> as one application. Publish both to the same server, and the reader
> moves between them with one sign-in.

::::

## Lab Files

_No bundled files for this lab._ The reports are in the **Lab Files** of [Hyperlinks](../27-mod9-hyperlinks/guide.md).
