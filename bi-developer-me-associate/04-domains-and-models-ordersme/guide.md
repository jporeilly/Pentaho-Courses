# OrdersME

> **Warning:**
>
> #### Workshop - OrdersME
>
> Build a metadata domain from an empty editor: OrdersME, a star-schema model of Steel Wheels orders. You connect to the sample data, import the tables, model them, group the columns for report users, publish the domain, and report on it in Interactive Reports.
>
> **What you'll do**
>
> * Create a domain and a database connection
> * Import physical tables from the sample data
> * Build a business model whose three relationships join a fact table to its dimensions
> * Group business columns into three categories
> * Publish the domain to the Pentaho Server and test it with an Interactive Report
>
> **Prerequisites:**
>
> * The [SteelWheels](../03-domains-and-models-steelwheels/guide.md) workshop
> * The Pentaho Server, running (see [Before You Start](../00-before-you-start/guide.md))
>
> **Estimated time:** 90 minutes

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_ordersme_domain.png" alt="The finished OrdersME domain: a connection with ORDERFACT, PRODUCTS, ORDERS and DIM TIME, and the OrdersME business model with four business tables, three relationships and the Orders, Products and Measures categories; the graphical view draws ORDERFACT joined to DIM TIME, PRODUCTS and ORDERS" width="800">
<figcaption>What you build: the OrdersME domain</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_creating_a_pentaho_metadata_domain.png" alt="A curved arrow through the six stages of building a domain: connect to a data source, import physical tables and columns, define the business model, define relationships, build business views, publish to Pentaho Server" width="345">
<figcaption>The stages of building a domain, one part each below</figcaption>
</figure>
</div>

:::: tabs

### 1. Connection

> **Note:**
>
> #### Define a Domain and a Connection
>
> A connection describes one database. It is the parent of every physical table and physical column you import from that database, so you create it first. Pentaho metadata reaches relational databases through JDBC.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/b5057eb6659e4a0691745914aa9e5403?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=b4432731-d471-426d-92ec-874768a7a1be?hide_owner=true" data-title="Creating a Metadata Domain with SteelWheels Database" data-description="In this video, I demonstrate how to create a metadata domain by connecting to the SteelWheels sample database. I walk you through the initial steps, including launching the Metadata Editor and creating a new domain file. You'll see how to add a database connection by right-clicking and selecting the appropriate options. I specifically name the connection &amp;#34;SampleData&amp;#34; to keep things organized. I encourage you to follow along and practice these steps to familiarize yourself with the process." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

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

2. Make sure the Pentaho Server is running: you publish to it in part 6, and the HSQLDB sample data runs with it. On a lab VM it is already running. On your own machine, start it:

::: tabs

### Windows (PowerShell)

```powershell
Set-Location C:\Pentaho\server\pentaho-server
.\start-pentaho.bat
```

### macOS / Linux

```bash
cd ~/Pentaho/server/pentaho-server
./start-pentaho.sh
```

:::

3. Select **File > New > Domain File**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_new_domain_ordersme.png" alt="The File menu open at New, with the submenu listing Domain File, Connection, Physical Table, Business Table, Business Model, Relationship and Category" width="438">
<figcaption>File > New > Domain File</figcaption>
</figure>
</div>

4. Right-click **Connections** and select **New Connection**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_new_database_connection.png" alt="The Connections node's context menu with New Connection and Clear complete DB Cache" width="425">
<figcaption>New Connection, on the Connections node</figcaption>
</figure>
</div>

5. In the **Database Connection** dialog, enter the settings for the sample data you use. The HSQLDB copy runs with the Pentaho Server and is what the solution uses; the MySQL copy is in the lab's sampledata MySQL container.

::: tabs

### HSQLDB (Pentaho Server)

| Setting | Value |
| --- | --- |
| **Connection name** | `hsqldb:sampledata` |
| **Connection type** | Hypersonic |
| **Access** | Native (JDBC) |
| **Host Name** | `localhost` |
| **Database Name** | `sampledata` |
| **Port Number** | `9001` |
| **Username** | `pentaho_admin` |
| **Password** | `password` |

The same data can also be reached by name, as the SteelWheels domain does: set **Access** to **JNDI** and **JNDI Name** to `SampleData`. The Metadata Editor and the Pentaho Server each resolve `SampleData` to their own copy of the sample data.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_jndi_connection.png" alt="The Database Connection dialog for a JNDI connection: Connection name SampleData, Connection type Hypersonic, Access JNDI and JNDI Name SampleData" width="800">
<figcaption>The JNDI alternative</figcaption>
</figure>
</div>

### MySQL (sampledata container)

| Setting | Value |
| --- | --- |
| **Connection name** | `mysql:sampledata` |
| **Connection type** | MySQL |
| **Access** | Native (JDBC) |
| **Host Name** | `localhost` |
| **Database Name** | `sampledata` |
| **Port Number** | `3306` |
| **Username** | `pentaho_admin` |
| **Password** | `password` |

Neither the Metadata Editor nor the Pentaho Server ships a MySQL driver. Copy the MySQL Connector/J jar (`mysql-connector-j-*.jar`) into `C:\Pentaho\design-tools\metadata-editor\libext\JDBC` and `C:\Pentaho\server\pentaho-server\tomcat\lib`, then restart both: each loads drivers only when it starts. Remove any older copy of the same driver first. The [Capstone](../12-capstone-trailhead-outfitters/guide.md)'s first stage has a PowerShell snippet that does both copies.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_database_connection.png" alt="The Database Connection dialog for mysql:sampledata, with the Connection tested successfully message: Connection to mysql:sampledata was successful, Hostname localhost, Port 3306, Database name sampledata" width="800">
<figcaption>A MySQL connection, tested</figcaption>
</figure>
</div>

:::

6. Select **Test**.

> **Success:** Checkpoint: a message says the connection to your connection name was successful, followed by its host name, port and database name.

7. Select **OK** to close the message, then select **OK** to close **Database Connection**. The **Import Tables** dialog opens: leave it open for part 2.

### 2. Import Tables

> **Note:**
>
> #### Import Tables
>
> Importing a physical table brings all its columns with it. OrdersME is a star schema: a central fact table of order lines, `ORDERFACT`, surrounded by dimension tables that describe each line: its product, its order and its date.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/8d79403521b24e9493d61f3269b2ce46?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=3ccd5701-5ff6-4f5a-9bf1-414a6fa30296?hide_owner=true" data-title="Creating the Physical Layer in Data Modeling 📊" data-description="In this video, I demonstrate how to import tables to create the physical layer for our project. I specifically import the Order Fact, Products, and Orders tables, highlighting the process of selecting multiple tables using the Control key. It's important to note that we are importing metadata, not the actual tables, and I show the columns in the Products table, which are currently labeled in all upper case. I also explain the concept of base columns and their significance in our data model. There is no specific action requested from viewers in this segment, but I encourage you to follow along as we move forward to creating the abstract business layer in the next demonstration." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. If **Import Tables** isn't open, right-click your connection under **Connections** and select **Import Tables**.
2. Hold `Ctrl` and select these five tables:

| Table | Rows | What it holds |
| --- | --- | --- |
| `ORDERFACT` | 2,996 | The fact table: one row per order line, with its order, product, customer and time keys |
| `PRODUCTS` | 110 | The product catalog: product line, vendor, code, name, scale, description, quantity in stock, buy price and MSRP |
| `ORDERS` | 326 | One row per customer order: order, required and shipped dates, status and comments |
| `ORDERDETAILS` | 2,996 | The order lines again. The OrdersME model doesn't use it: `ORDERFACT` already carries the lines |
| `DIM_TIME` | 265 | The time dimension: one row per order date, rolled up to month, quarter and year |

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_import_tables.png" alt="The Import Tables dialog listing the sampledata tables, with ORDERFACT, PRODUCTS, ORDERS, ORDERDETAILS and DIM_TIME selected" width="800">
<figcaption>Five tables selected</figcaption>
</figure>
</div>

3. Select **OK**.
4. Under **Connections**, expand your connection, then **ORDERFACT**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_pt_tables.png" alt="The connection expanded to ORDERFACT, PRODUCTS, ORDERS, ORDERDETAILS and DIM TIME, with ORDERFACT's 16 columns from ORDERNUMBER to YEAR ID, each with the parent concept Base" width="800">
<figcaption>The physical layer after the import</figcaption>
</figure>
</div>

> **Success:** Checkpoint: five physical tables, **ORDERFACT**, **PRODUCTS**, **ORDERS**, **ORDERDETAILS** and **DIM TIME**. **ORDERFACT** holds 16 columns, from **ORDERNUMBER** to **YEAR ID**, and each has the parent concept **Base**, which the business columns you build on them inherit until they override it.

This workshop keeps every column. To remove one you don't want, double-click its table (or right-click it and select **Edit**), select the column in the **Subject** pane of **Physical Table Properties**, select the red delete icon to the right of **Subject**, and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_delete_columns.png" alt="Physical Table Properties for ORDERFACT with COMMENTS selected in the Subject pane; the add and delete icons sit to the right of the Subject label" width="800">
<figcaption>Removing a column: select it, then the red delete icon</figcaption>
</figure>
</div>

### 3. Business Model

> **Note:**
>
> #### Business Model and Business Tables
>
> The business model maps the physical tables into the logical model report users work with. It uses one connection, and it starts with three empty nodes: **Business Tables**, **Relationships** and **Business View**.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/ac0b3d9fe136405ba8dbc5aab3874e33?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=2f51b6d5-f11d-49a1-a5e5-427e29f2580d?hide_owner=true" data-title="Building the Abstract Business Layer for Data Models 📊" data-description="In this video, I walk you through the process of building the abstract business layer after establishing the physical layer. I demonstrate how to create a new business model, including setting its properties such as name and description. I specifically name this model &amp;#34;Orders Me for Metadata Editor&amp;#34; to differentiate it from an existing model. I also note that I skipped setting a database connection, which we will address shortly. There are no specific action requests from viewers in this segment, but I encourage you to follow along as we add tables and define relationships in the next steps." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. Right-click **Business Models** and select **New Business Model**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_new_business_model.png" alt="The Business Models node's context menu with New Business Model" width="800">
<figcaption>New Business Model</figcaption>
</figure>
</div>

2. In the **Business Model Properties** dialog, keep the **ID** the editor proposes, `BV_MODEL_1`. It must be unique among the domain's models.
3. Under **Settings**, click in the **String** cell of the `en_US` row under **Name** and enter `OrdersME`.
4. Click in the **String** cell of the `en_US` row under **Description** and enter `test sampledata orders domain`.
5. Set **Connection** to your connection, `hsqldb:sampledata` or `mysql:sampledata`.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_ordersme_business_model.png" alt="Business Model Properties with ID BV_MODEL_1, the Connection list open on mysql:sampledata, the Name OrdersME and a description" width="800">
<figcaption>Name, description and connection</figcaption>
</figure>
</div>

6. Select **OK**.
7. Save the domain (`Ctrl+S`). In the **Save Domain** dialog, enter `OrdersME` and select **OK**.

> **Success:** Checkpoint: **Business Models** shows **OrdersME** followed by its connection, with three empty nodes: **Business Tables**, **Relationships** and **Business View**. The **Graphical View** shows the model's name and description.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/4fa2959893424879b8720be246d37235?hideEmbedTopBar=true&amp;hide_owner=true&amp;hide_share=true&amp;hide_title=true" data-title="Building an Abstract Business Layer: Adding Tables and Defining Relationships" data-description="In this video, I demonstrate how to add tables from the physical layer to the abstract business layer of our model, specifically focusing on the orders ME model. I show you how to drag and drop the order fact table, products, and orders tables into the business tables folder, and I rearrange the icons in the graphical view for clarity. We will define the relationships between these tables in the next demonstration, so please pay attention to the steps I've outlined here. No changes to the table properties are necessary at this stage; just ensure you follow along as we build our model." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

8. Right-click **Business Tables** and select **New Business Table**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_2.png" alt="The Business Tables node's context menu with New Business Table" width="800">
<figcaption>New Business Table</figcaption>
</figure>
</div>

9. In the **Make Selection** dialog, select `PT_ORDERFACT` and select **OK**. If the **Business Table Properties** dialog opens, select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_add_tables.png" alt="The Make Selection dialog asking for the physical table to associate with the business table, listing PT_ORDERFACT, PT_PRODUCTS, PT_ORDERS and PT_DIM_TIME" width="400">
<figcaption>Each business table points at one physical table</figcaption>
</figure>
</div>

10. Repeat steps 8 and 9 for `PT_PRODUCTS`, `PT_ORDERS` and `PT_DIM_TIME`. Leave `PT_ORDERDETAILS` out. You can also drag a physical table from **Connections** onto **Business Tables**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_business_tables_ordersme.png" alt="The OrdersME model with four business tables, DIM TIME, ORDERS, PRODUCTS and ORDERFACT, drawn on the graphical view without relationships" width="800">
<figcaption>Four business tables, not yet related</figcaption>
</figure>
</div>

> **Success:** Checkpoint: four business tables, **DIM TIME**, **ORDERS**, **PRODUCTS** and **ORDERFACT**, drawn on the **Graphical View** with no lines between them yet. Their IDs are `BT_DIM_TIME_DIM_TIME`, `BT_ORDERS_ORDERS`, `BT_PRODUCTS_PRODUCTS` and `BT_ORDERFACT_ORDERFACT`.

11. Save the domain (`Ctrl+S`).

### 4. Relationships

> **Note:**
>
> #### Relationships
>
> Relationships tell the query generator how to join the business tables. For each one you need the two business tables, the column in each that links them, and the kind of relationship. You create the first in the tree and the next two on the **Graphical View**, which fills in the two tables you selected.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/a4f250cd10f24e2fb9bd4eaa742781e0?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=d2e5c9f9-854f-4027-936c-0717b20d234b?hide_owner=true" data-title="Building Relationships in the Abstract Business Layer" data-description="In this video, I demonstrate how to define relationships between tables in the abstract business layer, specifically joining the orders table to the order fact table using the order number column. I explain the importance of being deliberate when defining these relationships, as they significantly impact the queries created based on this model. I also highlight the one-to-many relationship type we are using and the default inner join. Finally, I encourage viewers to consult with their data warehouse team if they are uncertain about how to join tables. Please follow along as we will repeat similar steps to join the order fact table to the products table in the next demonstration." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. Under **OrdersME**, right-click **Relationships** and select **New Relationship**.
2. In the **Relationship Properties** dialog, set:

| Setting | Value |
| --- | --- |
| **From Table / Field** | `BT_DIM_TIME_DIM_TIME`, `BC_DIM_TIME_TIME_ID` |
| **To Table / Field** | `BT_ORDERFACT_ORDERFACT`, `BC_ORDERFACT_TIME_ID` |
| **Relationship** | 1:N |
| **Join type** | Inner |

When the two columns share a name, **Guess Matching Fields** fills in both fields for you.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_relationship_properties.png" alt="Relationship Properties from BT_DIM_TIME_DIM_TIME and BC_DIM_TIME_TIME_ID to BT_ORDERFACT_ORDERFACT and BC_ORDERFACT_TIME_ID, Relationship 1:N, Join type Inner" width="717">
<figcaption>DIM TIME to ORDERFACT, one to many</figcaption>
</figure>
</div>

3. Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_dim_time_relationship.png" alt="The graphical view with a line from DIM TIME to ORDERFACT, the many end at ORDERFACT" width="521">
<figcaption>The first relationship</figcaption>
</figure>
</div>

> **Success:** Checkpoint: a line joins **DIM TIME** to **ORDERFACT** on the **Graphical View**, with the many end at **ORDERFACT**, and **Relationships** lists the new relationship.

4. On the **Graphical View**, select **ORDERFACT** and **PRODUCTS**: drag a rectangle around both, or hold `Ctrl+Shift` and select each.
5. Right-click one of the selected tables and select **Add Relationship**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_add_relationship.png" alt="ORDERFACT and PRODUCTS selected on the graphical view, with a context menu offering Add Relationship and Align / Distribute" width="569">
<figcaption>Add Relationship, on two selected tables</figcaption>
</figure>
</div>

6. In **Relationship Properties**, set:

| Setting | Value |
| --- | --- |
| **From Table / Field** | `BT_ORDERFACT_ORDERFACT`, `BC_ORDERFACT_PRODUCTCODE` |
| **To Table / Field** | `BT_PRODUCTS_PRODUCTS`, `BC_PRODUCTS_PRODUCTCODE` |
| **Relationship** | N:1 |
| **Join type** | Inner |

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_relation_properties.png" alt="Relationship Properties from BT_ORDERFACT_ORDERFACT and BC_ORDERFACT_PRODUCTCODE to BT_PRODUCTS_PRODUCTS and BC_PRODUCTS_PRODUCTCODE, Relationship N:1, Join type Inner" width="752">
<figcaption>ORDERFACT to PRODUCTS, many to one</figcaption>
</figure>
</div>

7. Select **OK**. N:1 from **ORDERFACT** is the same join as 1:N from **PRODUCTS**; the solution stores it the second way.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_relationship_orderfact_n_product_1.png" alt="The graphical view with PRODUCTS joined to ORDERFACT and DIM TIME joined to ORDERFACT; ORDERS is not joined yet" width="569">
<figcaption>Two relationships</figcaption>
</figure>
</div>

8. Create the third relationship the same way, between **ORDERS** and **ORDERFACT**:

| Setting | Value |
| --- | --- |
| **From Table / Field** | `BT_ORDERS_ORDERS`, `BC_ORDERS_ORDERNUMBER` |
| **To Table / Field** | `BT_ORDERFACT_ORDERFACT`, `BC_ORDERFACT_ORDERNUMBER` |
| **Relationship** | 1:N |
| **Join type** | Inner |

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme.png" alt="The graphical view with ORDERFACT in the middle, joined to DIM TIME above it, PRODUCTS on its left and ORDERS on its right" width="569">
<figcaption>The star: every dimension one relationship from the fact table</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Relationships** lists three relationships, and every one joins **ORDERFACT** to a dimension: **DIM TIME** on the time ID, **PRODUCTS** on the product code and **ORDERS** on the order number.

9. Save the domain (`Ctrl+S`).

> **Under the hood:**
>
> #### From relationships to SQL
>
> When a report uses columns from PRODUCTS, ORDERS and ORDERFACT, the
> engine includes those three tables and the relationships that connect
> them, and writes each inner join as a condition in the WHERE clause:
> PRODUCTS.PRODUCTCODE = ORDERFACT.PRODUCTCODE AND ORDERS.ORDERNUMBER =
> ORDERFACT.ORDERNUMBER. DIM_TIME stays out of the SQL until a query
> asks for one of its columns.
>
> The fact table in the middle is what makes this simple: every
> dimension is one relationship away from it, so any combination of
> dimensions has a direct path.
>
> **Why it matters:** report users pick columns, never joins. The joins
> they get are the ones you declared here, so a missing or wrong
> relationship is a modeling fix, made once.

#### Complex joins

None of this model's joins needs one, but a relationship can join on more than one column. Select **Complex Join?** in **Relationship Properties** and enter a Metadata Formula in **Complex Join Metadata Formula**. Complex joins appear in the `WHERE` clause of the SQL statement, so a join that needs the `FROM` clause is not supported.

A Metadata Formula names each column by its business table ID and business column ID inside one pair of brackets, and `AND(...; ...)` joins the conditions. ORDERS and ORDERFACT share both ORDERNUMBER and CUSTOMERNUMBER, so a two-column join between them would read:

```text
AND([BT_ORDERS_ORDERS.BC_ORDERS_ORDERNUMBER]=[BT_ORDERFACT_ORDERFACT.BC_ORDERFACT_ORDERNUMBER]; [BT_ORDERS_ORDERS.BC_ORDERS_CUSTOMERNUMBER]=[BT_ORDERFACT_ORDERFACT.BC_ORDERFACT_CUSTOMERNUMBER])
```

Don't write SQL with physical table names (`ORDERS.ORDERNUMBER=ORDERFACT.ORDERNUMBER`). The Metadata Editor pastes a SQL expression into the query unchanged, the generated SQL calls each table by its business table ID, and the database answers *object not found*.

#### Relationship reference

| Relationship | Description |
| --- | --- |
| 1:N | One to many, the most common relationship: one row in the first table relates to none, one or many rows in the second. One customer, many orders. |
| N:1 | Many to one: 1:N seen from the other table. |
| 1:1 | One to one: each row on either side relates to one row, or none, on the other. Most come from business rules; without one, the two tables can usually be combined into one. |
| 0:N | Zero to many, optional: a person may have no phone, one or many, and a phone belongs to at most one person. |
| N:0 | Zero to many, seen from the other table. |
| 0:1 | Zero to one: a person may be a programmer, but a programmer must be a person. The mandatory side is the dominant one. |
| 1:0 | Zero to one, seen from the other table. |
| N:N | Many to many: each row on either side relates to any number of rows on the other. A relational database needs a third, linking table to hold it. |
| 0:0 | Zero to zero, optional on both sides: a person may have a parking space, and a space may have no person. |

### 5. Business View

> **Note:**
>
> #### Categories
>
> The business view is the part of the model report users see: one business view per model, made of categories that hold business columns. A category carries only a name, a description and **Metadata Security**, and has no tie to a business table: one category can hold columns from several tables, and one column can sit in several categories. Categories are one level deep. The **Graphical View** shows only business tables, so you build the view in the tree and in the **Manage Categories** dialog.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/1a17c64882d04dd8a3aae0a4e5d9a4b4?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=826e3356-bc75-40c3-9feb-6e8396645a0f?hide_owner=true" data-title="Building a Business View with Abstract Layers 📊" data-description="In this video, I demonstrate how to build a business view by adding columns from the abstract business layer into the Orders category. I start by selecting columns from the order fact table, including quantity ordered, price sold, total price, order date, and total, and then move them to the right. I also add product-related columns from the products table and a comments column from the orders table. While I focus on a single category for this example, I mention that additional categories can be created if needed. Please take note of the steps I outlined, as I will be applying metadata concepts to format these columns in the next demonstrations." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. Under **OrdersME**, right-click **Business View** and select **New Category**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_new_category.png" alt="The Business View node's context menu with New Category, Manage Categories, Set Parent Concept and Clear Parent Concept" width="800">
<figcaption>New Category, on the Business View node</figcaption>
</figure>
</div>

2. In the **Business Category Properties** dialog, set **ID** to `CT_ORDERS`.
3. Click in the **String** cell of the `en_US` row under **Name** and enter `Orders`. Under **Description**, enter `steel wheels orders` the same way.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_ct_orders_properties.png" alt="Business Category Properties with ID CT_ORDERS, the Name Orders, an empty Description and an empty Metadata Security list" width="800">
<figcaption>The Orders category</figcaption>
</figure>
</div>

4. Select **OK**.
5. Right-click **Business View** and select **Manage Categories**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_manage_categories.png" alt="Manage Categories with the ORDERS business table expanded under Available Business Tables and the empty Orders category under Business View Categories" width="662">
<figcaption>Manage Categories, before you add columns</figcaption>
</figure>
</div>

6. Under **Available Business Tables**, expand **ORDERS**. Hold `Ctrl` and select **ORDERNUMBER**, **ORDERDATE**, **REQUIREDDATE**, **STATUS** and **COMMENTS**.
7. Under **Business View Categories**, select **Orders**, then select **Add** (the single arrow between the panes). A column and a category must both be selected before **Add** does anything.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_add_columns.png" alt="Manage Categories with five ORDERS columns selected and the Add arrow's tooltip showing; the Orders category now holds ORDERNUMBER, ORDERDATE, REQUIREDDATE, STATUS and COMMENTS" width="663">
<figcaption>Five columns added to Orders</figcaption>
</figure>
</div>

8. Select **Add New Category** (the green plus icon above **Business View Categories**). Create the category `CT_PRODUCTS` with the name `Products` and the description `steel wheels products`, and select **OK**.
9. Create `CT_MEASURES` the same way, with the name `Measures` and the description `steel wheels metrics`.
10. Add the rest of the columns, so the three categories match this table:

| Category | From business table | Columns |
| --- | --- | --- |
| Orders | ORDERS | ORDERNUMBER, ORDERDATE, REQUIREDDATE, STATUS, COMMENTS |
| Products | PRODUCTS | PRODUCTNAME, PRODUCTLINE, PRODUCTVENDOR, PRODUCTDESCRIPTION |
| Measures | PRODUCTS | QUANTITYINSTOCK |
| Measures | ORDERFACT | QUANTITYORDERED, PRICEEACH, TOTALPRICE |

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_populate_categories.png" alt="Manage Categories with three populated categories: Orders with five columns, Products with PRODUCTNAME, PRODUCTLINE, PRODUCTVENDOR and PRODUCTDESCRIPTION, and Measures with QUANTITYINSTOCK, QUANTITYORDERED, PRICEEACH and TOTALPRICE" width="662">
<figcaption>The finished business view</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Orders** holds 5 columns, **Products** 4 and **Measures** 4. **Measures** mixes two business tables: **QUANTITYINSTOCK** from **PRODUCTS** and the other three from **ORDERFACT**.

11. Select **Close**, then save the domain (`Ctrl+S`).

You can also add a column without the dialog: expand a business table in the tree and drag one of its columns onto a category.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_orders_table_and_columns.png" alt="The tree with the ORDERS business table expanded to its seven columns, each with the parent concept Base, above the Business View node and its Orders category" width="800">
<figcaption>A business table's columns, ready to drag onto a category</figcaption>
</figure>
</div>

### 6. Publish

> **Note:**
>
> #### Publish the Domain
>
> Publishing uploads the domain to the Pentaho Server, where the reporting tools offer its business model as a data source. The server must be running.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/e727cdebd0d745bbae38cdcde0327e30?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=57f9ea8d-bec6-49a3-a3f5-13f3b90ff54e?hide_owner=true" data-title="Publishing a Domain File to the Pentaho Server" data-description="In this video, I walk you through the process of publishing a meta-data domain file to the Pentaho server, which is essential for using it as a data source in various tools like Interactive Reports and Report Designer. After creating the domain file, I demonstrate how to save it within the Metadata Editor and publish it by navigating to the File menu and selecting &amp;#34;Publish to Server.&amp;#34; I also highlight the importance of using the correct web publish URL and server credentials, which in this example are admin and password. While I chose not to rename the domain file during publication, I advise you to ensure that the stored domain name matches the published name if you decide to change it. Please follow these steps to successfully make your domain file available for use in Pentaho tools." data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. Save the domain (`Ctrl+S`).
2. Select **File > Publish To Server**.
3. In the **Publish To Server** dialog, set:

| Setting | Value |
| --- | --- |
| **Web Publish URL** | `http://localhost:8080/pentaho/plugin/data-access/api/metadata/import` |
| **Server Userid** | `admin` |
| **Server Password** | `password` |
| **Domain Name** | `OrdersME` |

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_publish_to_pentaho_server.png" alt="The File menu with Publish To Server selected, and the Publish To Server dialog with the Web Publish URL, Server Userid admin, a masked Server Password and the Domain Name OrdersME" width="800">
<figcaption>Publish To Server</figcaption>
</figure>
</div>

4. Select **OK**. The server can take a few seconds to answer.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_publish_ordersme.png" alt="The Action Successful message over the Publish To Server dialog: File - OrdersME: Successfully saved to the server" width="800">
<figcaption>The domain is on the server</figcaption>
</figure>
</div>

> **Success:** Checkpoint: an **Action Successful** message reads `File - OrdersME: Successfully saved to the server`.

5. Select **OK**.

### 7. Test

> **Note:**
>
> #### Test with an Interactive Report
>
> Report on the published domain in Interactive Reports, as a report user would.

<div class="pcm-embed-card" data-href="https://www.loom.com/share/47071741b2d649d08081fd3c07016049?hideEmbedTopBar=true&amp;hide_share=true&amp;hide_title=true&amp;sid=4a71737b-378d-486c-ad2f-7b252600ceee?hide_owner=true" data-title="Testing Business Models with Interactive Reports 📊" data-description="In this video, I walk you through the process of testing our newly published metadata domain within the Orders ME data model. I demonstrate how to create an interactive report, ensuring that all calculated columns, formatting, and aggregations are functioning correctly. I specifically verify the total column's calculations using quantity ordered and price sold, and I check the relationships between the order fact table, products table, and orders table. Please make sure to replicate these steps and confirm that everything is working as expected in your reports. Thank you!" data-thumb="../_assets/embeds/125979ecbc12.png"></div>

1. Open the Pentaho User Console with the button below and log in as `admin` (password `password`).

<button data-launch="puc">Open Pentaho User Console</button>

2. On the **Home** perspective, select **Create New > Interactive Report**.
3. In the **Select Data Source** dialog, select **OrdersME** and select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_data_source_ordersme.png" alt="The Select Data Source dialog listing the server's data sources, with OrdersME selected between Orders and PDI_Operations_Mart" width="734">
<figcaption>Your business model, listed as a data source</figcaption>
</figure>
</div>

4. On the **Data** tab, drag **PRODUCTLINE** (under **Products**) to **Groups**, then drag **PRODUCTNAME** (**Products**), **ORDERNUMBER** (**Orders**) and **TOTALPRICE** (**Measures**) to **Columns**.

<div align="center">
<figure>
<img src="../_assets/images/dm_ordersme_test_interactive_report.png" alt="An Interactive Report on OrdersME: the Data tab lists the Orders, Products and Measures categories, PRODUCTLINE is in Groups, PRODUCTNAME, ORDERNUMBER and TOTALPRICE are in Columns, and the report starts with the Classic Cars group under a row-limit message" width="800">
<figcaption>The test report, grouped by product line</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the **Data** tab lists your three categories, **Orders**, **Products** and **Measures**, with your columns. The report groups the rows by **PRODUCTLINE**, starting with **Classic Cars**, under the message *The row limit has been reached, however you can keep working with this subset of data.* **Row Limit** is **No more than** `500`.

5. Close the **Interactive Report** tab. You don't need to save the report.

> **Under the hood:**
>
> #### What the test report sent
>
> None of the report's columns has an aggregation, so the engine writes
> SELECT DISTINCT over the three tables: 2,996 rows on SampleData, one
> per order line. Interactive Reports shows the first 500 while you
> design (design-query-limit in its settings.xml; query-limit, 10,000,
> applies when the report is viewed), which is the row-limit message in
> the screenshot. The PRODUCTLINE grouping is drawn by the report; it is
> not a GROUP BY.
>
> DISTINCT also means two identical rows would show once. That is
> harmless here, where order number and product make every row unique,
> but worth remembering when a report leaves out the column that tells
> rows apart.
>
> **Why it matters:** the row-limit message is a design-time limit, not
> lost data, and DISTINCT is the engine's choice, not yours: knowing both
> lets you tell a model fault from a report setting.

::::

## Lab Files

Click a file to download it.

### Solution <!-- no-step -->

The finished OrdersME domain. Its connection, `Sampledata`, is the HSQLDB connection of part 1 under another name. Load it with **File > Import from XMI File**.

[OrdersME.xmi](../_assets/files/OrdersME.xmi)
