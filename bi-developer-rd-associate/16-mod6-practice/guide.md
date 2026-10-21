# Practice: Formatting

> **Warning:**
>
> #### Workshop - Practice: Formatting
>
> Give the exercise report the same header as the guided report: the logo, a title, the run date and a rule under them.
>
> **What you'll do**
>
> * Embed the Steel Wheels logo in the **Report Header** band
> * Add a right-aligned title and run date
> * Draw a horizontal line across the band
> * Check the result in preview
>
> **Prerequisites:** [Practice: Calculations](../12-mod5-practice/guide.md) and its report, `Exercise - totals.prpt`; [Formatting Report Headers & Footers](../14-mod6-headers-footers/guide.md)
>
> **Estimated time:** 10 minutes

:::: tabs

### 1. Logo

> **Note:**
>
> #### The logo
>
> Embed the logo, as in the guided workshop, so the report carries it wherever it goes.

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

2. Select **File > Open** (`Ctrl+O`) and open `Exercise - totals.prpt` from your workshop folder, `Documents\RD-Workshop`.
3. Select **File > Save As** and save it as `Exercise - formatting.prpt`.
4. From the palette, drag an **image** element onto the **Report Header** band, and double-click it.
5. In the **Edit Content** dialog, select the browse button, open `C:\Pentaho\server\pentaho-server\tomcat\webapps\sw-style\active\sw_logo.jpg`, select **Embed in Report**, and select **OK**.
6. Drag the image's top left handle to the top left corner of the band, and its bottom right handle to about 3.5 inches across and 1 inch down.

> **Success:** Checkpoint: the logo fills the top left of the **Report Header** band.

### 2. Title, date and line

> **Note:**
>
> #### Title and date
>
> The title and the date sit at the right of the band, right-aligned, from 4 inches to the right edge.

1. Drag a **label** onto the upper right corner of the **Report Header** band, set its **value** to `Steel Wheels Sales Report`, and drag its left handle to about 4 inches on the top ruler.
2. Drag a **message** element directly below the label, set its **value** to `As of $(report.date, date, MM-dd-yyyy)`, and drag its left handle to about 4 inches.
3. Select the label and the message, and on the formatting toolbar select **Align Right**.
4. Drag a **horizontal-line** onto the band, below the logo. Drag its ends to the left and right edges of the band, and its middle handle to about 0.75 inch on the left ruler.
5. Select **Preview**.

> **Success:** Checkpoint: the first page opens with the logo on the left, **Steel Wheels Sales Report** and **As of** with today's date on the right, and a line across the page, above `Territory: APAC`.

6. Select **Design**, and save the report (`Ctrl+S`).

> **Under the hood:**
>
> #### The Report Header prints once; the Page Header prints on every page
>
> You put the logo and the title in the **Report Header** band, so
> they print once, at the top of the first page. Moved to the **Page
> Header** band, the same elements would print at the top of every
> page, above the report header on page one. The engine decides which
> band prints where during pagination; the elements themselves don't
> change.
>
> **Why it matters:** choose the band by how often the content should
> appear: a cover title once, a running header on every page, a
> heading once per group.

::::

## Lab Files

_No bundled files for this lab._
