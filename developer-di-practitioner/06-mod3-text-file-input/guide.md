# Text File Input

> **Warning:**
>
> #### Workshop - Text File Input
> 
> Real-world data rarely arrives ready for loading. Text files often need parsing and cleansing before they can be analyzed.
> 
> In this workshop, you build a transformation that turns messy, multi-line Steel Wheels order records into clean, structured rows suitable for a database.
> 
> **What you'll do**
> 
> * Read unstructured text with **Text file input**
> * Turn multi-line records into single rows with **Flattener**
> * Extract values into capture groups with **RegEx Evaluation**
> * Remove labels and symbols with **Replace in string**
> * Set data types and formats with **Select values**
> 
> **Prerequisites:** [Hello World](../03-mod2-hello-world/guide.md) - steps, hops and preview.
> 
> **Estimated time:** 30 minutes

> **Note:** **Create a new transformation**
> 
> Use any of these options to open a new transformation tab:
> 
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

<figure>

![The finished transformation: Text file input, Flattener, RegEx Evaluation, Replace in string, Select values](../_assets/images/txt-file-input.png)

<div align="center">
<figcaption><em>What you build</em></figcaption>
</div>
</figure>

Look at the input file first; it decides the parsing approach.

<figure>

![orders.txt: each order spread over four labeled lines, separated by blank lines](../_assets/images/orders-txt.png)

<div align="center">
<figcaption><em>orders.txt</em></figcaption>
</div>
</figure>

> **Note:** What to notice:
> 
> * Each order spans four lines, and a blank line separates one order from the next.
> * Line 3 holds two values: the order status and the order date.
> * The order value carries a label and a currency symbol (`Order Value: $21.99`).
> * Every value is prefixed with a label (`Productline:`, `Customer:`).

> **Note:** **Approach**
> 
> You will:
> 
> 1. Flatten each four-line record into a single row.
> 2. Split line 3 into a status and a date (capture groups).
> 3. Remove the labels and the currency symbol.
> 4. Set the data types and formats (number and date).

<div class="pcm-embed-card" data-href="https://www.loom.com/share/0646ed96c4734d16b6721c902f9c7e0e?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="String Operations for Data Cleaning and Transformation" data-description="In this video, I demonstrate how to use the string operation step to modify string values effectively. We focus on cleaning up the product code field by removing trailing spaces and retaining only numeric characters, while also addressing the country field by trimming spaces and converting all characters to uppercase. I guide you through configuring the string operation step, including naming conventions and the specific operations required for each field. Please ensure you follow along and replicate these steps in your own work to achieve similar results. Thank you for watching!" data-thumb="../_assets/embeds/2d94cd73b9b2.png"></div>

:::: tabs

### 1. Text File Input

> **Note:**
>
> #### Text File Input
> 
> Use **Text file input** to read the raw lines from `orders.txt`. Treat each line as a single string field for now.

1. Start Spoon, create a transformation and save it as `tr_read_text.ktr` in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\06-mod3-text-file-input`, next to `orders.txt`. Saving first gives `${Internal.Entry.Current.Directory}` a value.


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

2. In the **Design** tab, expand the `Input` category.
3. Drag **Text file input** onto the canvas.

> **Tip:** You can also search for `Text file input`.

4. Double-click the step. In **File or directory**, enter the path below, then select **Add**:

   ```text
   ${Internal.Entry.Current.Directory}/orders.txt
   ```

<figure><img src="../_assets/images/tfi-read-data.png" alt="The File tab with orders.txt in the Selected files list"><figcaption><p>The file path, using an internal variable</p></figcaption></figure>

> **Note:** `${Internal.Entry.Current.Directory}` is the folder of the saved transformation, so the path keeps working wherever the lab folder is.

5. Select the **Content** tab and set:

   | Setting | Value |
   | --- | --- |
   | **Filetype** | `CSV` |
   | **Separator** | empty - delete the default `;`, so each whole line becomes one field |
   | **Header** | cleared - `orders.txt` has no header line |
   | **No empty rows** | selected - drops the blank lines between orders |
   | **Format** | `mixed` |

<figure><img src="../_assets/images/tfi.png" alt="The Content tab of Text file input" width="563"><figcaption><p>The Content tab</p></figcaption></figure>

6. Select the **Fields** tab, then **Get Fields**.

<figure><img src="../_assets/images/tfi-fields.png" alt="The Fields tab with a single String field, Field1" width="563"><figcaption><p>One field per line</p></figcaption></figure>

> **Note:** The step returns one field named `Field1`. It has type **String**.

7. Optional: rename the step to **Read orders**.
8. Select **OK**.

### 2. Row flattener

> **Note:**
>
> #### Row Flattener
> 
> Use **Flattener** to turn each group of four lines into a single output row.

1. Drag **Flattener** onto the canvas.
2. Create a hop from **Read orders**.
3. Double-click the step. Set **The field to flatten** to `Field1`, and enter the four target fields, in this order: `productline`, `customers`, `status`, `order_value`.

<figure><img src="../_assets/images/flattner.png" alt="The Flattener dialog: Field1 flattened into productline, customers, status and order_value" width="375"><figcaption><p>Four lines become four fields</p></figcaption></figure>

4. Optional: rename the step to **Flatten rows**.
5. Select **OK**.

> **Note:** Each target field maps to one repeating line — target field 1 to line 1, and so on.

> **Under the hood:**
>
> #### Flattener counts lines; it doesn't understand records
>
> The step collects the flatten field from consecutive rows until it
> has as many as you listed target fields, emits them side by side as
> one row, then starts counting again. There is no key and no marker —
> it never looks at the *content* of a line to decide where a record
> ends. Line 1 goes to target 1, line 2 to target 2, purely by
> position.
>
> That makes it fast and simple, and it makes the file's regularity a
> hard requirement: one stray blank line and every record after it is
> shifted by one field. That is why **No empty rows** stays selected in
> **Text file input**: the blank lines between orders never reach the
> Flattener.
>
> **Why it matters:** preview three records here, not one. If the
> third looks right, the counting is right. If it has drifted, the fix
> belongs upstream in **Text file input** (filters, blank-line
> handling), not in the Flattener.

### 3. RegEx Evaluation

> **Note:**
>
> #### RegEx Evaluation
> 
> Use **RegEx Evaluation** to match a field against a regular expression and capture substrings into new fields.
> 
> Here you split `status` into two capture groups, `order_status` and `order_date`, with the pattern `(Delivered|Returned):(.+)`.

1. Drag **RegEx Evaluation** onto the canvas.
2. Create a hop from **Flatten rows**.
3. Double-click the step and set:

   | Setting | Value |
   | --- | --- |
   | **Field to evaluate** | `status` |
   | **Result field name** | `result` |
   | **Create fields for capture groups** | selected |
   | **Regular expression** | `(Delivered\|Returned):(.+)` |

   Then add two fields, both type **String** with **Trim** set to **both**: `order_status` and `order_date`.

<figure><img src="../_assets/images/regex.png" alt="The RegEx Evaluation dialog with the expression and the two capture fields"><figcaption><p>Two capture groups, two fields</p></figcaption></figure>

> **Warning:** Set **Trim** to **both** on both fields. The date follows the colon with a space, and an untrimmed ` January 2004` won't parse as a date later.

4. Optional: rename the step to **Parse status and date**.
5. Select **OK**.

> **Note:** **How the expression works**
> 
> * It has two capture groups, each in parentheses, separated by a colon.
> * `(Delivered|Returned)` matches either status.
> * `(.+)` matches the rest of the line - the date.
> * Select **Test RegEx** to check the groups against a sample value.

> **Under the hood:**
>
> #### The pattern must match the whole field, not part of it
>
> At start-up the step compiles your expression once into a Java
> `Pattern`. For every row it then asks whether the *entire* field
> matches — not whether the pattern occurs somewhere inside it. That
> is why `(.+)` is there: without it, `Delivered:` would satisfy the
> first group and then fail on the trailing date text, the result
> field would be `false`, and both capture fields would be empty.
>
> Each parenthesised group becomes exactly one output field, in
> order, and the step refuses to start if the group count and the
> field count disagree. You get a clear "capture groups does not
> match" error at initialization instead of silently wrong columns.
>
> **Why it matters:** a regex that works in a tester but yields empty
> fields here is almost always anchoring, not syntax. Wrap the part
> you don't care about in `.*`, re-test in the dialog, then run.

To learn or test regular expressions, regex101 is a good start:

<div class="pcm-embed-card" data-href="https://regex101.com/" data-title="regex101: build, test, and debug regex" data-description="Regular expression tester with syntax highlighting, explanation, cheat sheet for PHP/PCRE, Python, GO, JavaScript, Java, C#/.NET, Rust." data-thumb="../_assets/embeds/c264d50371b0.png"></div>

### 4. Replace in String

> **Note:**
>
> #### Replace in string
> 
> Use **Replace in string** for search-and-replace, with optional regex and group references (`$n`).
> 
> Here you replace three labels with nothing.

1. Drag **Replace in string** onto the canvas.
2. Create a hop from **Parse status and date**.
3. Double-click the step and add three rows, with **use RegEx** set to `N` and **Replace with** left empty:

   | In stream field | Search |
   | --- | --- |
   | `order_value` | `Order Value: $` |
   | `productline` | `Productline: ` |
   | `customers` | `Customer: ` |

<figure><img src="../_assets/images/replace.png" alt="The Replace in string dialog with three search strings"><figcaption><p>Three labels removed</p></figcaption></figure>

4. Optional: rename the step to **Clean order value**.
5. Select **OK**.

> **Warning:** Type each label exactly, including the trailing space. If you turn on **use RegEx**, use `Order Value:\s*\$` instead: the dollar sign must go too, or **Select values** can't read the number.

### 5. Select Values

> **Note:**
>
> #### Select values
> 
> **Select values** selects, removes and renames fields, and changes their type, length and precision. It has three tabs:
> 
> * **Select & Alter** - which fields to keep, in what order, and under what names
> * **Remove** - fields to drop
> * **Meta-data** - a field's type, format, length and precision

1. Drag **Select values** onto the canvas.
2. Create a hop from **Clean order value**.
3. Double-click the step. On the **Remove** tab, add `result` and `status` - the regex's true/false flag and the raw line you split.
4. On the **Meta-data** tab, add:

| Field name     | Type   | Format     |
| -------------- | ------ | ---------- |
| `order_value`  | Number | `#.00`     |
| `order_date`   | Date   | `MMM yyyy` |

<figure><img src="../_assets/images/sv-2.png" alt="The Meta-data tab of Select values: order_value as Number and order_date as Date"><figcaption><p>Typed fields</p></figcaption></figure>

> **Note:** Optional: rename the step to **Set data types**.

> **Under the hood:**
>
> #### A format mask is a parser, not a display setting
>
> Until this step, `order_value` and `order_date` were strings —
> cleaned-up text, but text. On the **Meta-data** tab you told the
> engine what each string *means*, and the mask is the instruction for
> reading it: `#.00` says "decimal point, two places", so `21.99`
> becomes the number 21.99; `MMM yyyy` says "three-letter month, then
> year", so `Jan 2004` becomes a real date, the first of that month.
>
> From this step onward the row metadata declares those fields as
> Number and Date, and every later step — sort, calculator, table
> output — works with the typed value. A mask the data doesn't fit
> fails *here*, at the step that knows the rule, rather than producing
> garbage three steps downstream.
>
> **Why it matters:** a date that is really a date sorts
> chronologically, subtracts to give days, and lands in a `DATE`
> column without a cast. Getting types right at the boundary is what
> lets everything after it stay simple.

### 6. Run

> **Note:**
>
> #### Run the transformation
> 
> Run the transformation and check the result.

1. Select **Run** in the toolbar, then **Run** in **Run Options**.
2. Select the last step, then the **Preview data** tab in **Execution Results**.

<figure><img src="../_assets/images/results.png" alt="Preview data: seven orders with product line, customer, value, status and date"><figcaption><p>Seven clean orders</p></figcaption></figure>

> **Success:** **Read orders** reads 28 lines and **Flatten rows** turns them into 7 orders. The first is `Classic Cars`, `Christine Loomis`, `21.99`, `Delivered`, `Jan 2004` - no labels, no `$`, a real number and a real date.

::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

[orders.txt](./files/orders.txt)

### Solution <!-- no-step -->

The finished transformation for this lab. Open it alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\01-flat-files\06-mod3-text-file-input\solution`.

[tr_read_text.ktr](./files/tr_read_text.ktr) <button data-launch="spoon" data-path="files/tr_read_text.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/tr_read_text.ktr">View graph</button>
