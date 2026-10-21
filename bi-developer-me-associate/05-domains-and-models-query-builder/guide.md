# Query Builder

> **Warning:**
>
> #### Workshop - Query Builder
>
> Test a domain before you publish it. The Metadata Editor's Query Builder runs a query against a business model, the way a report would, and shows the rows that come back, so you can check the relationships, aggregations and formulas without leaving the editor.
>
> **What you'll do**
>
> * Import the OrderStarCustomer domain
> * Open the Query Builder on its business model
> * Select business columns from two categories
> * Run the query and read the preview data
> * See how a default aggregation changes the result
>
> **Prerequisites:**
>
> * `OrderStarCustomer.xmi` from **Lab Files** below. You build this domain yourself in the [OrderStarCustomer](../07-properties-orderstarcustomer/guide.md) workshop.
> * The Pentaho Server running, for its HSQLDB sample data (see [Before You Start](../00-before-you-start/guide.md))
>
> **Estimated time:** 15 minutes

<div class="pcm-embed-card" data-href="https://www.loom.com/share/fb31dbf09b494e71bd03a3ca905b0e58?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=c17f1cdc-2507-463d-82ff-ff04702f3edd?hide_owner=true" data-title="Testing and Validating Data Models in Metadata Editor" data-description="In this video, I demonstrate how to use the Metadata Editor's query tool to test the order's ME model we built earlier. I walk you through selecting columns, setting a row limit of 100, and executing queries to validate our calculations and relationships within the data model. It's crucial to thoroughly test the model using various queries to ensure everything functions correctly. After reviewing the results, I conclude by saving and preparing to publish the metadata domain for use in interactive reports. Please make sure to apply these testing methods to your own models as well." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

:::: tabs

### 1. Open the Domain

> **Note:**
>
> #### Open the Domain
>
> The Query Builder works on the domain open in the editor. Import OrderStarCustomer, the star-schema domain this workshop queries.

1. Start the Metadata Editor with the **Open Metadata Editor** button below, or from a terminal:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\design-tools\metadata-editor
.\metadata-editor.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/design-tools/metadata-editor
./metadata-editor.sh
```

:::

<button data-launch="metadata-editor">Open Metadata Editor</button>

2. Download `OrderStarCustomer.xmi` from **Lab Files** below.
3. Select **File > Import from XMI File** (`Ctrl+I`) and open `OrderStarCustomer.xmi`.
4. In the **Save Model** dialog, enter `OrderStarCustomer` and select **OK**.

> **Success:** Checkpoint: the title bar reads **Pentaho Metadata Editor - OrderStarCustomer**, and **Business Models** shows the **OrderStarCustomer** model, whose **Business View** holds four categories: **Orders**, **Customers**, **Products** and **Time**.

### 2. Build and Run a Query

> **Note:**
>
> #### The Query Builder
>
> The Query Builder lists the business model's categories and columns, as a report user sees them. The columns you select go to the top pane, conditions to the middle one and sort orders to the bottom one.

1. Select the **Query Editor** button on the toolbar, ![The Query Editor toolbar button, a yellow pencil over a document](../_assets/images/dm_query_builder.png). The **Query Builder** dialog opens.

<div align="center">
<figure>
<img src="../_assets/images/dm_query_builder_query_builder.png" alt="The empty Query Builder: Business Domains and Business Models both set to OrderStarCustomer, Categories / Columns listing Orders, Customers, Products and Time, and three empty panes for the selected columns, the conditions and the sort order" width="800">
<figcaption>The Query Builder on the OrderStarCustomer model</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Business Domains** and **Business Models** both show `OrderStarCustomer`, and **Categories / Columns** lists **Orders**, **Customers**, **Products** and **Time**.

2. Under **Categories / Columns**, expand **Orders** and **Products**.
3. Hold `Ctrl` and select **Order Number**, **Price Sold** and **Total** under **Orders**, and **Product Name** under **Products**.
4. Select the top green arrow. The four columns move to the top pane.

<div align="center">
<figure>
<img src="../_assets/images/dm_query_builder_query_builder_orderstarcustomer_model.png" alt="The Query Builder with Order Number, Price Sold, Total and Product Name selected under Categories / Columns, and the top pane listing Product Name NONE, Order Number NONE, Price Sold SUM and Total SUM" width="800">
<figcaption>Four columns selected, two of them aggregated</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the top pane lists each column with its **Aggregation**:
>
> | Aggregation | Column |
> | --- | --- |
> | NONE | Product Name |
> | NONE | Order Number |
> | SUM | Price Sold |
> | SUM | Total |

5. Select **Execute Query**, the green triangle on the Query Builder's toolbar. The **Examine preview data** dialog opens.

<div align="center">
<figure>
<img src="../_assets/images/dm_query_builder_preview_data.png" alt="Examine preview data: The first 5000 rows from the generated query (2996 rows), with the columns PRODUCTNAME, ORDERNUMBER, BC_ORDERFACT_PRICEEACH and BC_ORDERFACT_TOTAL; the first four rows are order 10100's lines" width="800">
<figcaption>The rows the query returned</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the dialog reads **The first 5000 rows from the generated query (2996 rows)**: one row per order line. The columns are **PRODUCTNAME**, **ORDERNUMBER**, **BC_ORDERFACT_PRICEEACH** and **BC_ORDERFACT_TOTAL**. Order `10100` has four lines; one is `1917 Grand Touring Sedan`, with `100.0` and `3000.0`.

6. Select **Close**.

> **Under the hood:**
>
> #### Price Sold arrives summed
>
> Price Sold and Total have a default aggregation of Sum, so the engine
> writes SUM around each and groups by the other two columns, Product
> Name and Order Number. Each order line is its own group here, so the
> sum is just the line's price, and the query returns all 2,996 lines.
> Ask for Order Number and Price Sold alone and the lines of each order
> collapse into one row: order 10103's Price Sold becomes 1,417.54, the
> sum of its 16 unit prices, a number with no meaning.
>
> A default aggregation is a modeling decision. Sum suits amounts such
> as Total; a unit price wants Average (88.60 for that order) or none.
>
> **Why it matters:** a query that looks right with every detail column
> selected can go wrong when a report drops one. Test the model with the
> few columns a summary report would use, not only with all of them.

7. Select **OK** to close the Query Builder.

> **Note:** In Report Designer's Metadata Data Source Editor (not this Query Builder), you define a parameter by writing its name in curly brackets, `{Parameter Name}` for example. The name must match a parameter you created in the report. The **Default** value column is used only to preview data in the Metadata Data Source Editor.

::::

## Lab Files

Click a file to download it.

The domain this workshop queries, the finished domain of the [OrderStarCustomer](../07-properties-orderstarcustomer/guide.md) workshop:

[OrderStarCustomer.xmi](../_assets/files/OrderStarCustomer.xmi)
