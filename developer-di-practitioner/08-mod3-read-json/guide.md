# Read JSON

> **Warning:**
>
> #### Workshop - Read JSON
> 
> Parse a JSON file into rows with **JSON Input**.
> 
> **What you’ll do**
> 
> * Read a JSON file from disk
> * Extract fields with JSONPath
> * Use **Select fields** to pick the JSON keys
> * Preview the rows and check their types
> 
> **Prerequisites:** [Text File Input](../06-mod3-text-file-input/guide.md), and basic JSON (objects and arrays).
> 
> **Estimated time:** 25 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/992afd2bbf75465ab70ae76d895ea4f3?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Using the JSON Input Step to Retrieve Data from Files 📂" data-description="In this video, I demonstrate how to use the JSON input step to read data from a JSON file located in the Sample's folder of Spoon. We focus on retrieving specific elements for books, including the title, category, and author, while noting that some books may also have an ISBN number. I guide you through configuring the step, including selecting the file and manually entering the required fields. After completing the setup, we preview the data to ensure everything is correct. Please take a moment to review the configuration and familiarize yourself with the process." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The finished transformation: JSON input hopped to Dummy](../_assets/images/json.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

1. Open `jsonfile.js` (JSON, despite the `.js` extension) in a text editor. It holds seven orders in one array; these are the first three:

```json
{ "document": {
    "order": [ 
      { "productline": "Classic Cars",
        "customer": "Christine Loomis",
        "status": "Delivered",
        "date": "January 2004",
        "value": 21.99
      },
      { "productline": "Classic Cars",
        "customer": "Mary L. Peachin",
        "status": "Delivered",
        "date": "November 2008",
        "value": 24.99
      },
      { "productline": "Trains",
        "customer": "Bob Italia",
        "status": "Delivered",
        "date": "July 1994",
        "value": 14.99
      }
    ]
  }
}
```

> **Note:** `status` can be `Delivered` or `Returned`.

:::: tabs

### 1. JSON Input

> **Note:**
>
> #### JSON Input
> 
> **JSON Input** reads JSON and outputs rows. Each field has its own JSONPath; the step evaluates every path against the document and lines the results up into rows.

1. Start Spoon, create a transformation and save it as `tr_json.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\08-mod3-read-json`, next to `jsonfile.js`.


::: tabs

### Windows (PowerShell)

> 
> ```powershell
> Set-Location C:\Pentaho\design-tools\data-integration
> .\spoon.bat
> ```
> 
>

### macOS / Linux

> 
> ```bash
> cd ~/Pentaho/design-tools/data-integration
> ./spoon.sh
> ```
> 
>

:::

<button data-launch="spoon" data-path="">Start PDI</button>

2. Drag **JSON Input** onto the canvas.
3. Double-click the step.
4. On the **File** tab, in **File or directory**, enter the path below and select **Add**:

   ```text
   ${Internal.Entry.Current.Directory}/jsonfile.js
   ```

5. Open the **Fields** tab. (JSON Input has no loop path: each field's own **Path** selects one value per order.)
6. Select **Select fields**, then the five order keys.
7. Verify these fields, their paths and types:

* `productline` (String), path `$..productline`
* `customer` (String), path `$..customer`
* `status` (String), path `$..status`
* `date` (String), path `$..date`
* `value` (Number), path `$..value`

<figure><img src="../_assets/images/json-file.png" alt="JSON Input File tab with jsonfile.js selected"><figcaption><p>The file</p></figcaption></figure>

<figure><img src="../_assets/images/json-fields.png" alt="JSON Input Fields tab with five fields and their JSONPath expressions"><figcaption><p>Five fields, one JSONPath each</p></figcaption></figure>

> **Tip:** To try a JSONPath expression before you use it, paste the file into a tester such as [jsonpath.com](https://jsonpath.com/).

> **Under the hood:**
>
> #### Whole document in memory, then one JSONPath per column
>
> **JSON Input** doesn't stream. It reads `jsonfile.js` completely,
> parses it into an in-memory tree, and then evaluates each field's
> path against that tree — one query per field. In this file each path
> matches seven values, one per order, and the step zips the seven
> lists together positionally into seven rows.
>
> That positional zip is why the step cares about shape. With
> **Default path leaf to null** off, an order with no `customer` key
> makes the step stop with "the data structure is not the same inside
> the resource" rather than hand you rows whose values have slid out
> of line. The solution has it on, so a missing key becomes a null
> instead.
>
> **Why it matters:** memory is bounded by the *file* size, not the
> row count, so very large JSON is better split, or read one record per
> field. And a structure error is the engine refusing to hand you a row
> whose values have slid one column to the left.

### 2. Dummy

> **Note:**
>
> #### Dummy
> 
> **Dummy** does nothing with the rows. Here it is the step you preview.

1. Expand **Flow** in the Design palette.
2. Drag **Dummy** onto the canvas.
3. Create a hop from **JSON Input** to **Dummy**.

### 3. Run

> **Note:**
>
> #### Run the transformation
> 
> Run it and preview the rows.

1. Select **Run** in the toolbar, then **Run** in **Run Options**.
2. Select **Dummy**, then the **Preview data** tab in **Execution Results**.

<figure><img src="../_assets/images/json-1.png" alt="Preview data: one row per order with product line, customer, status, date and value"><figcaption><p>One row per order</p></figcaption></figure>

> **Success:** 7 rows, one per order. The first is `Classic Cars`, `Christine Loomis`, `Delivered`, `January 2004`, `21.99`, with `value` a Number.

::::

### Troubleshooting <!-- no-step -->

<details>

<summary>No rows returned</summary>

The field paths match nothing in the file. JSON Input has no loop path: each field's **Path** does the selecting. Check one, such as `$..productline`, against the file in a JSONPath tester.

If the JSON structure changes, update every field's path.

</details>

<details>

<summary>Fields are null</summary>

Check that each path matches its JSON key exactly, including case. A path that matches every order looks like `$..productline` or `$.document.order[*].productline`.

</details>

<details>

<summary>Wrong data types</summary>

Use **Select fields** as a starting point, then set each type yourself. Here `value` is **Number** and the rest are **String**.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[jsonfile.js](./files/jsonfile.js)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\08-mod3-read-json\solution`.

[tr_json.ktr](./files/tr_json.ktr) <button data-launch="spoon" data-path="files/tr_json.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_json.ktr">View graph</button>
