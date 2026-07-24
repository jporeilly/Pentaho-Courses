# XML Join

> **Warning:**
>
> #### Workshop - XML Join
> 
> A single flat stream can't express parent/child data like orders, their lines, and the comments on each line. XML Join lets you assemble those levels into one nested XML document.
> 
> In this workshop, you build the Pentaho sample **"XML Join - Create a multilayer XML file"**: six related Excel sheets become XML fragments that are nested into a single multi-layer `XMLOrders.xml`.
> 
> **What you'll do**
> 
> * Read six related sheets from one workbook with Microsoft Excel input
> * Add placeholder fields that mark where child XML will nest
> * Build an XML fragment for each level with Add XML
> * Generate dynamic XPaths with Modified Java Script Value
> * Nest the fragments into one document with five XML Join steps
> * Write the assembled multi-layer XML with Text file output
> 
> **Prerequisites:** Understanding of basic transformation concepts (steps, hops, preview). Basic XML and XPath. Pentaho Data Integration installed and configured.
> 
> **Estimated time:** 30 minutes

> **Note:**
>
> #### XML Join in Pentaho Data Integration
> 
> XML Join adds an XML stream into another XML stream as a new level, based on an XPath that points at the target location. It takes exactly two inputs: a **target** stream (the document you are building up) and a **source** stream (the fragment to insert). Only the target stream may contain more than one row.
> 
> By chaining several XML Join steps, each one inserting the next level at a deeper XPath, you assemble a deeply nested document — here: order list → order → header comments → lines → line comments → sub-lines.

<figure><img src="../_assets/images/xml-join.png" alt=""><figcaption><p>XML Join - multilayer output</p></figcaption></figure>

> **Note:** This workshop reproduces the shipped PDI sample. Download the transformation and workbook from **Lab Files** below — keep `tr_xml_join.ktr` and `xml_orders_source.xls` in the **same folder** so the relative paths resolve — and open it in Spoon to follow the wiring as you work.

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

:::: tabs

### 1. Excel Input

> **Note:**
>
> #### Microsoft Excel input
> 
> The source workbook `xml_orders_source.xls` holds six sheets — one per level of the order hierarchy. Read each sheet with its own **Microsoft Excel input** step.

1. Start Pentaho Data Integration (Spoon).

> **Note:** 

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

2. Expand **Input** in the Design palette.
3. Drag six **Microsoft Excel input** steps onto the canvas.
4. In each step, on the **Files** tab, set the file to:

```
${Internal.Transformation.Filename.Directory}/xml_orders_source.xls
```

5. On the **Sheets** tab, point each step at one sheet, and on **Fields** select **Get fields from header row**. Name each step after its sheet:

* `OrderList`
* `OrderHeaders`
* `OrderHeaderComments`
* `OrderLines`
* `OrderLineComments`
* `OrderSubLines`

> **Note:** `OrderList` is the root level. `OrderHeaders` are the orders, each with `OrderHeaderComments` and `OrderLines`; each line has `OrderLineComments` and `OrderSubLines`.

### 2. Add Constants

> **Note:**
>
> #### Add constants
> 
> Before a stream can receive a child level, its XML needs an empty element to nest into. Use **Add constants** to add an empty placeholder field whose name matches the child element you'll join in.

1. Drag three **Add constants** steps onto the canvas.
2. Create a hop into each from the parent stream, then add the placeholder field(s) — leave the **Value** blank:

| Add constants step | Reads from | Placeholder field(s) |
| --- | --- | --- |
| Placeholder | `OrderList` | `OrderHeaders` |
| Placeholder 2 | `OrderHeaders` | `OrderLines`, `OrderHeaderComments` |
| Placeholder 3x | `OrderLines` | `OrderSubLines`, `OrderLineComments` |

> **Note:** Each empty field becomes an empty `<OrderHeaders/>`, `<OrderLines/>`, etc. in the next step — the exact spot a later XML Join targets with its XPath.

### 3. Add XML

> **Note:**
>
> #### Add XML
> 
> **Add XML** encodes the fields of each row into a single XML field. Set the **Root XML element** to the repeating element name for that level, and choose which fields become elements/attributes.

1. Drag six **Add XML** steps onto the canvas, one per stream.
2. Create a hop from each input/placeholder stream and configure the output field and repeat element:

| Add XML step | Output field | Root (repeat) element |
| --- | --- | --- |
| xmlOrderList | `xmlOrderLists` | `OrderList` |
| xmlOrderHeaders | `xmlOrderHeaders` | `OrderHeader` |
| xmlOrderHeaderComments | `xmlOrderHeaderComments` | `OrderHeaderComment` |
| xmlOrderLines | `xmlOrderLines` | `OrderLine` |
| xmlOrderLineComments | `xmlOrderLineComments` | `OrderLineComments` |
| xmlOrderSubLines | `xmlOrderSubLines` | `OrderSubLine` |

> **Note:** Expose the key fields as **attributes** — for example `orderNumber` on `OrderHeader` and `orderLineNumber` on `OrderLine` — because the XML Join XPaths match on them.

### 4. Create XPath

> **Note:**
>
> #### Modified Java Script Value
> 
> The deepest levels (line comments and sub-lines) can't be targeted with a single static XPath, because the insert point depends on both the order number and the line number of the current row. Use **Modified Java Script Value** to build that XPath per row.

1. Drag two **Modified Java Script Value** steps onto the canvas: **Create XPath** (from `OrderLineComments`) and **Create XPath 2** (from `OrderSubLines`).
2. In each, build an `xPathStatement` field from the row's keys, for example:

```javascript
var xPathStatement;
xPathStatement = "//OrderHeader[@orderNumber='" + orderNumber.getInteger()
  + "']/OrderLines/OrderLine[@orderLineNumber='" + orderLineNumber.getInteger()
  + "']/OrderLineComments";
```

3. Add `xPathStatement` to the step's output fields.

> **Note:** This is the per-row XPath the complex XML Joins in the next step use as their **join compare field**.

### 5. XML Join

> **Note:**
>
> #### XML Join
> 
> Chain five **XML Join** steps. Each takes the document built so far as the **target** and inserts the next fragment as the **source** at a given XPath. Where the insert point varies per row, enable **Complex join** and point it at the `xPathStatement` field.

1. Drag five **XML Join** steps onto the canvas and wire them in series. Configure each:

| XML Join | Target (field) | Source (field) | Target XPath | Complex / join field |
| --- | --- | --- | --- | --- |
| XML Join Step | xmlOrderList (`xmlOrderLists`) | xmlOrderHeaders | `//OrderHeaders` | No |
| XML Join Step 2 | XML Join Step (`xmloutput1`) | xmlOrderHeaderComments | `//OrderHeader[@orderNumber='?']/OrderHeaderComments` | Yes · `orderNumber` |
| XML Join Step 3 | XML Join Step 2 (`xmloutput2`) | xmlOrderLines | `//OrderHeader[@orderNumber='?']/OrderLines` | Yes · `orderNumber` |
| XML Join Step 4 | XML Join Step 3 (`xmloutput3`) | xmlOrderLineComments | _(from)_ `xPathStatement` | Yes · `xPathStatement` |
| XML Join Step 5 | XML Join Step 4 (`xmloutput4`) | xmlOrderSubLines | _(from)_ `xPathStatement` | Yes · `xPathStatement` |

> **Warning:** Connect the **target** and **source** hops in the right order — the target is the growing document, the source is the fragment being inserted. Reversing them produces an empty or malformed result.

> **Note:** The `?` in a target XPath is the placeholder the complex join replaces with the join-compare value for the current row.

### 6. Text File Output

> **Note:**
>
> #### Text file output
> 
> The final XML Join emits one field holding the complete document. Write it to disk with **Text file output**.

1. Drag **Text file output** onto the canvas.
2. Create a hop from **XML Join Step 5**.
3. Set the filename and extension:

```
${Internal.Transformation.Filename.Directory}/XMLOrders
```

with **Extension** `xml`.

4. On **Fields**, output only the final XML field (`xmlOutput`).

### 7. RUN

> **Note:**
>
> #### Run the transformation
> 
> Run the transformation locally, then open the generated file.

1. Select **Run** in the canvas toolbar.
2. Open `XMLOrders.xml` from your transformation folder.

> **Success:** You should see one `<OrderList>` document with nested `<OrderHeader>` elements, each containing its comments, lines, line comments, and sub-lines.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

Keep `tr_xml_join.ktr` and `xml_orders_source.xls` in the **same folder** so the workbook path resolves when you run it.

[xml_orders_source.xls](./files/xml_orders_source.xls)

[tr_xml_join.ktr](./files/tr_xml_join.ktr) <button data-launch="spoon" data-path="files/tr_xml_join.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_xml_join.ktr">View graph</button>
