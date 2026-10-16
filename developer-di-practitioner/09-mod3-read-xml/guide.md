# Read XML

> **Warning:**
>
> #### Workshop - Read XML
> 
> Read XML from a file and from a URL with **Get data from XML**.
> 
> **What you’ll do**
> 
> * Read XML from a local file
> * Read XML from a URL passed in a field
> * Use XPath to select the rows and fields
> * Use **Get Fields** to infer the XML structure
> * Debug a data type mismatch with the log
> 
> **Prerequisites:** [Read JSON](../08-mod3-read-json/guide.md), and basic XML (elements, attributes and hierarchy).
> 
> **Estimated time:** 35 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/85ad9973848041b9b8447ed45cffc09c?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Getting Started with the Get Data from XML Step in PDI" data-description="In this demonstration, I walk you through the process of using the &amp;#34;get data from XML&amp;#34; step to read an existing XML file containing breakfast and dinner menus. I show how to configure the step in Spoon, including selecting the file, defining the loop X-Path for the breakfast menu, and specifying the elements to read as fields. We also verify the configuration by previewing the data, ensuring everything is set up correctly. Please make sure to follow along and replicate these steps in your own environment. This will enhance your ability to work with XML data effectively." data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

<figure>

![The finished transformation: a file branch and a URL branch, each ending in a Dummy step](../_assets/images/xml.png)

<div align="center">
<figcaption><em>What you build: two ways in</em></figcaption>
</div>
</figure>

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

::::: tabs

### 1. XML - File

> **Note:**
>
> #### **XML - File**
> 
> In this branch you read an XML **file** and use XPath to pick out the rows and fields.

<figure><img src="../_assets/images/get-xml-file.png" alt="The file branch: Get data from XML hopped to Dummy (do nothing)" width="375"><figcaption><p>The file branch</p></figcaption></figure>

<figure><img src="../_assets/images/orders.png" alt="orders.xml: a document element holding order elements" width="375"><figcaption><p>orders.xml</p></figcaption></figure>

:::: tabs

### 1. Get data from XML

> **Note:**
>
> #### **Get data from XML**
> 
> **Get data from XML** reads any XML document. A **Loop XPath** picks the nodes that become rows, and each field's XPath picks a value from its node.

1. Start Spoon, create a transformation and save it as `tr_read_xml.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\09-mod3-read-xml`, next to `orders.xml`.


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

2. Drag **Get data from XML** onto the canvas.
3. Double-click the step. On the **File** tab, in **File or directory**, enter `${Internal.Entry.Current.Directory}/orders.xml` and select **Add**.

<figure><img src="../_assets/images/xml-file.png" alt="Get data from XML File tab with orders.xml selected"><figcaption><p>The file</p></figcaption></figure>

4. On the **Content** tab, set **Loop XPath** to `/document/order`. One row per `order` element.

<figure><img src="../_assets/images/xpath-files.png" alt="Content tab with Loop XPath /document/order"><figcaption><p>The loop XPath picks the rows</p></figcaption></figure>

5. On the **Fields** tab, select **Get Fields**: `productline`, `customer`, `status` and `date` as String, `value` as Number.

<figure><img src="../_assets/images/xml-file-fields.png" alt="Fields tab with the five order fields and their XPaths"><figcaption><p>Five fields</p></figcaption></figure>

6. Select **OK**.

### 2. Dummy

> **Note:**
>
> #### **Dummy**
> 
> **Dummy (do nothing)** does nothing with the rows. Here it is the step you preview.

1. Drag **Dummy (do nothing)** onto the canvas.
2. Create a hop to it from **Get data from XML**.

### 3. Run

> **Note:**
>
> #### **Run the transformation**
> 
> **Get data from XML** can take its XML from a file, from a URL, or from XML already held in a field. This branch reads a file.

> **Warning:** When you build the second branch (XML - URI) in the same transformation, disable this branch's hop before you run that one: right-click the hop and select **Disable**.

1. Select **Run** in the toolbar, then **Run** in **Run Options**.
2. Select **Dummy (do nothing)** and open the **Preview data** tab: 7 orders, starting with `Classic Cars`, `Christine Loomis`.

<figure><img src="../_assets/images/preview-xml-filepng.png" alt="Preview data: seven orders read from orders.xml"><figcaption><p>Seven orders from the file</p></figcaption></figure>

> **Under the hood:**
>
> #### Loop XPath picks the rows; field XPaths are relative to each one
>
> The step parsed `orders.xml` into a DOM tree, then evaluated your
> **Loop XPath** to select a node set — one node per output row. Each
> field's XPath is then evaluated *from that node*, not from the
> document root, which is why the paths on the Fields tab are short
> and why **Get Fields** could infer them just by looking at one
> element's children.
>
> A DOM means the whole file is in memory before the first row is
> emitted. For files too big for that, the step's **Prune path to
> handle large files** option switches to streaming: the document is
> processed in chunks delimited by the prune path, and only one chunk
> is ever held.
>
> **Why it matters:** the loop path is the one setting to get right —
> zero rows almost always means it selected nothing — and a single
> checkbox is the difference between a 50 MB feed and a 5 GB one.

::::

### 2. XML - URI

> **Note:** In this branch the XML comes from a **URL**, passed to the step in a field, and XPath picks out the rows and fields as before.

<figure><img src="../_assets/images/xml-url.png" alt="The URL branch: Generate rows passing the URL to Get data from XML, then Dummy" width="375"><figcaption><p>The URL branch</p></figcaption></figure>

<figure><img src="../_assets/images/xml-url-plants.png" alt="plant_catalog.xml: a CATALOG element holding PLANT elements" width="375"><figcaption><p><a href="../_assets/files/plant_catalog.xml">plant_catalog.xml</a></p></figcaption></figure>

::: tabs

### 1. Generate rows - Pass URL

> **Warning:** Here you pass the URL to **Get data from XML** in a field. Copy it now:
>
> ```text
> https://raw.githubusercontent.com/jporeilly/Pentaho-Courses/main/developer-di-practitioner/_assets/files/plant_catalog.xml
> ```
>
> The screenshot shows the original w3schools address. That site now refuses PDI's HTTP client (HTTP 403), so use this copy of the same file.

> **Note:**
>
> #### Generate rows
> 
> **Generate Rows** outputs a set number of rows, each carrying the fixed values you give it. Here it produces one row holding the URL.

1. Drag **Generate Rows** onto the canvas and name it `Pass URL`.
2. Double-click the step. Set **Limit** to `1`, and add one field: **Name** `xmlUrl`, **Type** String, **Value** the URL you copied.

<figure><img src="../_assets/images/xml-url-plant.png" alt="Generate Rows with one String field, xmlUrl, holding the URL"><figcaption><p>The URL travels in a field</p></figcaption></figure>

### 2. Get data from XML - Read URL

> **Note:**
>
> #### Get data from XML
> 
> This step takes the URL from the `xmlUrl` field that **Pass URL** sends it.

1. Drag a second **Get data from XML** onto the canvas and name it `Read Url`.
2. Create a hop to it from **Pass URL**.
3. Double-click the step. On the **File** tab, select **XML source is defined in a field?**, set **get XML source from a field** to `xmlUrl`, and select **Read source as Url**.

<figure><img src="../_assets/images/xml-datastream-field.png" alt="File tab: XML source defined in a field, xmlUrl selected, read source as URL selected"><figcaption><p>Read the XML from the URL in xmlUrl</p></figcaption></figure>

4. On the **Content** tab, set **Loop XPath** to `/CATALOG/PLANT`.

<figure><img src="../_assets/images/xml-catalog-path.png" alt="Content tab with Loop XPath /CATALOG/PLANT"><figcaption><p>One row per plant</p></figcaption></figure>

5. On the **Fields** tab, select **Get Fields**: `COMMON`, `BOTANICAL`, `ZONE`, `LIGHT`, `PRICE` and `AVAILABILITY`. **Get Fields** guesses each type from a sample, and it guesses `ZONE` is an Integer.

<figure><img src="../_assets/images/configure-fields.png" alt="Fields tab with the six plant fields"><figcaption><p>Six fields, types guessed</p></figcaption></figure>

> **Under the hood:**
>
> #### A URL is just another file path
>
> Nothing in the step changed to fetch from the web. Every file access
> in PDI goes through Apache Commons VFS, a virtual file system layer
> that turns a string into a stream: `C:/data/x.xml`,
> `http://.../plant_catalog.xml`, `sftp://host/feed.xml`,
> `zip:file:///archive.zip!/x.xml` and, as the MinIO lab shows,
> `s3://` all pass through the same interface. Selecting **Read source
> as Url** tells the step to hand the field's text to VFS as a
> *location* rather than treat it as XML content.
>
> Because the URL arrived in a field, it can vary per row: a
> **Generate rows** with three URLs, or a table of endpoints, drives
> three fetches with no change to the step.
>
> **Why it matters:** anywhere PDI asks for a filename, a URL will do.
> There is no separate "web input" to learn, and a transformation
> written against local files moves to S3 or SFTP by editing a string.

Next: open the **Dummy** tab.

### 3. Dummy

> **Note:**
>
> #### Dummy
> 
> A second **Dummy (do nothing)** gives this branch its own step to preview.

1. Drag **Dummy (do nothing)** onto the canvas.
2. Create a hop to it from **Read Url**.

### 4. Run

> **Note:**
>
> #### **Run the transformation**
> 
> Disable the file branch's hop and make sure this branch's two hops are enabled (right-click a hop to switch it).
> 
> This run fails, on purpose. Before you open the log, guess why.

1. Select **Run** in the toolbar, then **Run** in **Run Options**. The run fails.

<figure><img src="../_assets/images/xml-fail.png" alt="The Read Url step marked with an error" width="375"><figcaption><p>The run fails in Read Url</p></figcaption></figure>

2. Open the **Logging** tab and find the first error:

```text
ZONE String : couldn't convert String to number : non-numeric character found at position 1 for value [Annual]
```

<figure><img src="../_assets/images/xml-logs.png" alt="The log showing the conversion error for ZONE"><figcaption><p>The log names the field and the value</p></figcaption></figure>

> **Warning:** **Get Fields** guessed `ZONE` from the first plants, whose zones are numbers. Further down, a plant's zone is `Annual`, which no Integer can hold. `ZONE` is really text.

3. In **Read Url**, on the **Fields** tab, change the type of `ZONE` to **String**, then run again.
4. Select the second **Dummy** and open **Preview data**: 36 plants.

<figure><img src="../_assets/images/xml-plants-preview.png" alt="Preview data: plants from the catalog with common name, botanical name, zone, light, price and availability"><figcaption><p>36 plants from the URL</p></figcaption></figure>

:::

:::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[orders.xml](./files/orders.xml)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result. The URL branch's hops ship disabled, so a run reads the file; enable them (and disable the file branch's hop) to read the URL. It needs internet access.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\09-mod3-read-xml\solution`.

[tr_read_xml.ktr](./files/tr_read_xml.ktr) <button data-launch="spoon" data-path="files/tr_read_xml.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_read_xml.ktr">View graph</button>
