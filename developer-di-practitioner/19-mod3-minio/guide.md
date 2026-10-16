# MinIO

> **Warning:**
>
> #### Workshop - MinIO
>
> Six transformations that read from and write to **MinIO**, an S3-compatible object store, through a PDI **VFS connection**.\
> They get harder as you go: CSV lookups first, then XML and JSON parsing, reconciliation, log analysis, scoring and multi-format ingestion.
>
> **What you’ll do**
>
> * Connect PDI to MinIO with a VFS connection
> * Read and write objects with `pvfs://MinIO/...` paths
> * Enrich and join streams with lookups and merge joins
> * Parse XML, JSON and log lines, and shape the results for a curated layer
>
> **Prerequisites:** MinIO running and seeded (see [Before You Start](../00-before-you-start/guide.md)); [Review Storage](../topic-mod3-storage-review/guide.md); joins and aggregations at the level of the earlier workshops
>
> **Estimated time:** 4 to 6 hours in all; each workshop takes 20 to 60 minutes

| Workshop                 | Key skills                                  |
| ------------------------ | ------------------------------------------- |
| Sales Dashboard          | VFS input, stream lookups, calculations     |
| Inventory Reconciliation | XML parsing, full outer join, variance      |
| Customer 360             | JSON lines, aggregation, merge joins        |
| Log Parsing              | regular expressions, rolling averages       |
| Fraud Detection          | lookups and joins, rule-based scoring       |
| Data Lake Ingestion      | three formats, one schema                   |

> **Danger:** Every path in these workshops starts `pvfs://MinIO/`, which means "the VFS connection named **MinIO**". Create it once, before the first workshop.

1. Check that MinIO is running and seeded: open the MinIO console at **http://127.0.0.1:9099** and sign in as `minioadmin` / `minioadmin`. The **raw-data** bucket holds `csv/`, `json/`, `xml/` and `finance/` folders, and the **logs** bucket holds `app/`, `web/` and `error/`.

   ```powershell
   # Or check the S3 API from PowerShell
   Invoke-WebRequest http://127.0.0.1:9000/minio/health/live -UseBasicParsing | Select-Object StatusCode
   ```

2. Start Spoon.

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

3. Create the VFS connection. In Spoon's **View** tab, right-click **VFS Connections** and select **New**. In the **New VFS Connection** dialog enter:

| Setting                 | Value                   |
| ----------------------- | ----------------------- |
| **Connection Name:**    | `MinIO`                 |
| **Connection Type:**    | Amazon S3/Minio/HCP     |
| **S3 Connection Type:** | Minio/HCP               |
| **Access Key:**         | `minioadmin`            |
| **Secret Key:**         | `minioadmin`            |
| **Endpoint:**           | `http://127.0.0.1:9000` |
| **PathStyle Access:**   | selected                |

4. Select **Test**, then **OK**. The connection is saved for every transformation on this machine, so you create it once.

> **Note:** VFS connection names are case-sensitive: `pvfs://minio/...` doesn't find a connection named `MinIO`.

> **Under the hood:**
>
> #### `pvfs://` is a name, not an address
>
> PDI reads `pvfs://MinIO/raw-data/csv/sales.csv` as "bucket `raw-data`,
> object `csv/sales.csv`, through the connection called MinIO". The
> endpoint and keys live in the connection, not in the transformation.
> Point the same connection at Amazon S3 and every transformation in
> this series runs there unchanged. **PathStyle Access** is what MinIO
> needs: it addresses buckets as `host/bucket` rather than
> `bucket.host`.
>
> **Why it matters:** credentials stay out of `.ktr` files, and moving
> between environments is one connection, not every path.

Save each transformation in the lab folder, `C:\Workshop-DI-Practitioner\03-data-sources\03-storage\19-mod3-minio`.

::::: tabs

### Sales Dashboard

> **Warning:**
>
> #### Sales Dashboard
>
> Build one fact file for a sales dashboard from three CSV files in MinIO: sales, products and customers. Each sale gets its product and customer details, a few calculated fields and two audit fields, and the result goes back to MinIO.
>
> **Skills:** reading from a bucket, **Stream lookup**, **Calculator**, **Formula**, writing to a bucket

> **Note:** **Workshop files**
>
> These files are already in MinIO:
>
> * `pvfs://MinIO/raw-data/csv/sales.csv` (15 sales)
> * `pvfs://MinIO/raw-data/csv/products.csv` (18 products)
> * `pvfs://MinIO/raw-data/csv/customers.csv` (12 customers)
>
> Output: `pvfs://MinIO/staging/dashboard/sales_fact_<date>_<time>.csv`

<figure><img src="../_assets/images/sales-dashboard.png" alt="The Sales Dashboard transformation: Sales, Products and Customers inputs, two lookups, Calculator, Formula, Add constants, Get system info, Select values and Write to staging"><figcaption><p>What you build</p></figcaption></figure>

Create a new transformation (**File > New > Transformation**) and save it as `sales_dashboard_etl.ktr`.

::: tabs

### 1. Read the sources

> **Note:**
>
> #### Text file input
>
> **Text file input** reads delimited or fixed-width files from disk or, through a VFS connection, from object storage. Here three of them read CSV files from the `raw-data` bucket.

1. From the **Input** folder, drag three **Text file input** steps onto the canvas. Name them `Sales`, `Products` and `Customers`.
2. In each, on the **File** tab, enter the file in **File or directory** and select **Add**. Or select **Browse** and pick it from the MinIO connection:

| Step        | File                                      |
| ----------- | ----------------------------------------- |
| `Sales`     | `pvfs://MinIO/raw-data/csv/sales.csv`     |
| `Products`  | `pvfs://MinIO/raw-data/csv/products.csv`  |
| `Customers` | `pvfs://MinIO/raw-data/csv/customers.csv` |

<figure><img src="../_assets/images/select-sales-csv-from-vfs-connections.png" alt="Browsing the MinIO connection's raw-data bucket to pick csv/sales.csv"><figcaption><p>Browse the bucket through the connection</p></figcaption></figure>

3. On each **Content** tab, set **Separator** to `,`, keep **Header** selected and set **Format** to `mixed`.
4. On each **Fields** tab, select **Get Fields**, then check the types:

| Step        | Types to check                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `Sales`     | `customer_id`, `quantity` Integer; `sale_date` Date (`yyyy-MM-dd`); `sale_amount` BigNumber; the rest String       |
| `Products`  | `price` BigNumber; `stock_quantity` Integer; `last_updated` Date (`yyyy-MM-dd`); the rest String                  |
| `Customers` | `customer_id` Integer; `registration_date` Date (`yyyy-MM-dd`); the rest String                                   |

<figure><img src="../_assets/images/get-fields-sales.png" alt="Sales Fields tab after Get Fields: eight fields with their types"><figcaption><p>Sales fields</p></figcaption></figure>

<figure><img src="../_assets/images/get-fields-customers.png" alt="Products Fields tab after Get Fields: price as BigNumber, stock_quantity as Integer, last_updated as Date"><figcaption><p>Products fields</p></figcaption></figure>

5. Select **Preview rows** in each.

> **Success:** Checkpoint: 15 sales (`S001` to `S015`), 18 products (`P001` to `P018`) and 12 customers.

### 2. Look up products and customers

> **Note:**
>
> #### Stream lookup
>
> **Stream lookup** adds fields to each main row from a second stream, matched on key fields. The second stream comes from another step in the same transformation, not from a database.

1. From the **Lookup** folder, drag two **Stream lookup** steps onto the canvas. Name them `Product lookup` and `Customers lookup`.
2. Hop **Sales** and **Products** to **Product lookup**, then **Product lookup** and **Customers** to **Customers lookup**.
3. Double-click **Product lookup**. Set **Lookup step** to `Products`, add the key **Field** `product_id` = **LookupField** `product_id`, and under **Specify the fields to retrieve** add:

| Field          | New name           |
| -------------- | ------------------ |
| `product_name` |                    |
| `category`     | `product_category` |
| `price`        | `unit_price`       |

<figure><img src="../_assets/images/product-lookup.png" alt="Product lookup: lookup step Products, key product_id, retrieving product_name, category and price"><figcaption><p>Product lookup</p></figcaption></figure>

4. Double-click **Customers lookup**. Set **Lookup step** to `Customers`, key `customer_id` = `customer_id`, and retrieve `first_name`, `last_name`, `country` as `customer_country` and `status` as `customer_status`.

<figure><img src="../_assets/images/customers-lookup.png" alt="Customers lookup: lookup step Customers, key customer_id, retrieving names, country and status"><figcaption><p>Customers lookup</p></figcaption></figure>

5. Save, run, and preview **Customers lookup**.

<figure><img src="../_assets/images/lookups-preview-data.png" alt="Preview data: each sale with its product and customer fields"><figcaption><p>Sales with product and customer details</p></figcaption></figure>

> **Success:** Checkpoint: 15 rows, every one with a `product_name` and a `customer_country`.

> **Under the hood:**
>
> #### The lookup stream is read first, into memory
>
> **Stream lookup** reads the whole **Lookup step** stream before it
> passes a single main row: all 18 products go into an in-memory table
> keyed on `product_id`. Then each sale is answered from that table, with
> no sort and no database round trip. That is why the hop from
> **Products** shows a small information icon on the canvas: it feeds
> the lookup, not the main flow.
>
> **Why it matters:** this is the fastest way to enrich a stream from a
> small reference set. For a reference set too large for memory, sort
> both streams and use **Merge join**, as the later workshops do.

### 3. Calculate

> **Note:**
>
> #### Calculator and Formula
>
> **Calculator** runs predefined functions on fields; **Formula** evaluates spreadsheet-style expressions. Use whichever reads more clearly.

1. From the **Transform** folder, drag **Calculator** onto the canvas and hop **Customers lookup** to it. Add two rows:

| New field         | Calculation | Field A      | Field B       | Value type |
| ----------------- | ----------- | ------------ | ------------- | ---------- |
| `line_total`      | A * B       | `unit_price` | `quantity`    | BigNumber  |
| `discount_amount` | A - B       | `line_total` | `sale_amount` | BigNumber  |

> **Warning:** Put `unit_price` in **Field A**. Calculator works in Field A's type, so with the Integer `quantity` first, `unit_price` is cut to a whole number before the multiplication: 1299.99 × 1 comes out as 1299.

<figure><img src="../_assets/images/calculator-2.png" alt="Calculator with two calculations, line_total and a second field"><figcaption><p>Calculator</p></figcaption></figure>

> **Note:** The screenshot shows an earlier version: `quantity` as Field A, and the second field named `profit_margin`. Use the table above.

2. From the **Scripting** folder, drag **Formula** onto the canvas and hop **Calculator** to it. Add two fields, both String:

| New field            | Formula                                       |
| -------------------- | --------------------------------------------- |
| `customer_full_name` | `CONCATENATE([first_name];" ";[last_name])`   |
| `is_high_value`      | `IF([sale_amount]>500;"Yes";"No")`            |

<figure><img src="../_assets/images/formula-step-2.png" alt="Formula step with customer_full_name and is_high_value"><figcaption><p>Formula</p></figcaption></figure>

3. Save, run and preview **Formula**.

> **Success:** Checkpoint: `line_total` equals `sale_amount` on all 15 rows, to the cent. Every sale in this data is at list price, so `discount_amount` is 0; a positive value would mean the customer paid less than list. 5 sales are `is_high_value` `Yes`.

### 4. Add audit fields

1. From the **Transform** folder, drag **Add constants** onto the canvas and hop **Formula** to it. Add **Name** `data_source`, **Type** String, **Value** `minio_workshop`.
2. From the **Input** folder, drag **Get system info** onto the canvas and hop **Add constants** to it. Add **Name** `etl_timestamp`, **Type** `system date (variable)`.

> **Note:** `data_source` and `etl_timestamp` say where each row came from and when it was loaded, the two questions asked first when a number in a dashboard looks wrong.

### 5. Select and write

1. From the **Transform** folder, drag **Select values** onto the canvas and hop **Get system info** to it. On **Select & Alter**, list these fields in this order, renaming `status` to `sale_status`:

   `sale_id`, `sale_date`, `customer_id`, `customer_full_name`, `customer_country`, `customer_status`, `product_id`, `product_name`, `product_category`, `quantity`, `unit_price`, `sale_amount`, `line_total`, `discount_amount`, `is_high_value`, `payment_method`, `status`, `etl_timestamp`, `data_source`

2. From the **Output** folder, drag **Text file output** onto the canvas, name it `Write to staging` and hop **Select values** to it. Set:
   * **File** tab: **Filename** `pvfs://MinIO/staging/dashboard/sales_fact`, **Extension** `csv`, **Include date in filename?** and **Include time in filename?** selected
   * **Content** tab: **Separator** `,`, **Header** selected
   * **Fields** tab: select **Get Fields**, then **Minimal width**

> **Warning:** Select **Minimal width**. Without it, Text file output pads every String to its declared length, and `USA` is written as `USA` followed by spaces.

3. Save and run the transformation. In the MinIO console, open **staging** > `dashboard/`.

<figure><img src="../_assets/images/minio-dashboard-data.png" alt="MinIO console: the staging bucket's dashboard folder with the sales_fact CSV file"><figcaption><p>The output in MinIO</p></figcaption></figure>

> **Success:** Checkpoint: `sales_fact_<date>_<time>.csv` holds a header and 15 rows, with no padded values. Each run adds a new file, because the date and time are in the name.

:::

***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[sales_dashboard_etl.ktr](./files/sales_dashboard_etl.ktr) <button data-launch="spoon" data-path="files/sales_dashboard_etl.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/sales_dashboard_etl.ktr">View graph</button>

### Inventory Reconciliation

> **Warning:**
>
> #### Inventory Reconciliation
>
> Reconcile a warehouse system's XML inventory feed with the ERP product catalog, a CSV file. A full outer join keeps items missing from either side; each row is classified, and the results go to three work queues by priority.
>
> **Scenario:** a warehouse management system (WMS) exports its stock as XML each night, and the ERP holds the product master. Where they disagree, someone has to investigate or count:
>
> * **Missing in the warehouse:** the ERP lists a product the warehouse doesn't hold
> * **Missing in the catalog:** the warehouse holds an item the ERP doesn't know
> * **Quantity variance:** both know the product, but the quantities differ
>
> **Skills:** **Get data from XML**, **Merge join** (full outer), **Calculator**, **Modified JavaScript value**, **Switch / case**

***

> **Note:** **Workshop files**
>
> These files are already in MinIO:
>
> * `pvfs://MinIO/raw-data/xml/inventory.xml`
> * `pvfs://MinIO/raw-data/csv/products.csv`
>
> Outputs: `pvfs://MinIO/staging/reconciliation/` (`urgent_actions`, `review_queue` and `low_priority` CSV files)

<figure><img src="../_assets/images/inventory-reconciliation.png" alt="Inventory reconciliation"><figcaption><p>Inventory reconciliation</p></figcaption></figure>

> **Note:** Create a new transformation.
>
> Use any of these options:
>
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

***

Follow the steps to create the transformation:

:::: tabs

### 1. Data Source streams

::: tabs

### 1. Read Warehouse

> **Note:**
>
> #### Get data from XML
>
> **Get data from XML** reads an XML file and returns one row per node that matches the **Loop XPath**. Each field is an XPath relative to that node.

1. From the **Input** folder, drag **Get data from XML** onto the canvas and name it `Read Warehouse XML`.
2. On the **File** tab, add `pvfs://MinIO/raw-data/xml/inventory.xml` (in **File or directory**, then **Add**).
3. On the **Content** tab, set **Loop XPath** to `/inventory/items/item`, **Encoding** to `UTF-8`, and select **Ignore comments?**.

<figure><img src="../_assets/images/configure-xpath.png" alt="Get data from XML Content tab with the loop XPath /inventory/items/item"><figcaption><p>One row per item element</p></figcaption></figure>

> **Note:** `/inventory/items/item` starts at the root element, `inventory`, goes into `items`, and returns one row for each `item` inside it.

4. On the **Fields** tab, select **Get Fields**, then rename the fields and set their types. The `warehouse_` prefix keeps them apart from the ERP fields after the join:

| Name                     | XPath          | Type    |
| ------------------------ | -------------- | ------- |
| `sku`                    | `sku`          | String  |
| `warehouse_item_name`    | `name`         | String  |
| `category`               | `category`     | String  |
| `warehouse_quantity`     | `quantity`     | Integer |
| `warehouse_location`     | `location`     | String  |
| `last_physical_count`    | `last_checked` | Date    |

<figure><img src="../_assets/images/remap-field-names-x26-preview-data.png" alt="Fields tab with the renamed warehouse fields, and the preview of the items"><figcaption><p>Renamed fields and the preview</p></figcaption></figure>

5. Select **Preview rows**.

> **Success:** Checkpoint: 17 warehouse items.

### 2. Read Product Catalog

> **Note:**
>
> #### Text file input
>
> The ERP side: the product master, one row per product.

1. Drag **Text file input** onto the canvas and name it `Read Product Catalog`.
2. **File** tab: add `pvfs://MinIO/raw-data/csv/products.csv`.
3. **Content** tab: separator `,`, enclosure `"`, header row on.
4. **Fields** tab: **Get Fields**. Check the types: `product_id`, `product_name`, `category`, `supplier` String; `price` BigNumber; `stock_quantity` Integer; `last_updated` Date (`yyyy-MM-dd`).
5. Preview: 18 products, `P001` to `P018`.

:::

### 2. Join

> **Note:**
>
> #### Full outer join on the product id
>
> Rename both sides to one key, sort, then join so that items missing from *either* system still come through.

1. **Select values** `Map Warehouse` after `Read Warehouse XML`: on **Select & Alter** keep `sku` renamed to `product_id`, `warehouse_item_name` renamed to `warehouse_product_name`, and `category`, `warehouse_quantity`, `warehouse_location`, `last_physical_count`.
2. **Select values** `Map Product Catalog` after `Read Product Catalog`: rename `product_name` to `erp_product_name` and `stock_quantity` to `erp_quantity`, and keep `product_id`, `category`, `price`, `supplier`, `last_updated`.
3. **Sort rows** after each: `Sort Warehouse` and `Sort ERP`, both on `product_id`, ascending.
4. **Merge join** `Full Outer Join`: **First step** `Sort Warehouse`, **Second step** `Sort ERP`, **Join type** `FULL OUTER`, key `product_id` on both sides. Preview: 19 rows: 17 warehouse items plus 2 products only the ERP knows.
5. **Calculator**: `quantity_variance` = `warehouse_quantity` - `erp_quantity` (**A - B**), and `abs_variance` = **ABS(A)** of `quantity_variance`, both Integer.
6. **Modified JavaScript value**: classify each row. Copy the script from the solution's step of the same name; it sets:

| Output field          | Rule                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `discrepancy_type`    | `MISSING_IN_WAREHOUSE` (no warehouse quantity), `MISSING_IN_CATALOG` (no ERP quantity), `MATCH` (within ±2), `OVERSTOCK` or `UNDERSTOCK` |
| `severity_level`      | HIGH for missing in warehouse, or a variance over 20%; MEDIUM otherwise; NONE for a match |
| `priority_rank`       | 1 for HIGH, 2 for MEDIUM, 3 for the rest                                                |
| `recommended_action`, `financial_impact`, `excess_carrying_cost`, `lost_sales_risk` | the work-queue text and cost estimates |

### 3. Output

> **Note:**
>
> #### Route by priority
>
> One work queue per priority, plus a summary by discrepancy type.

1. **Switch / case** `Priority` on `priority_rank` (type Number): `1` to `High Priority`, `2` to `Medium Priority`, `3` to `Low Priority`; default `Medium Priority`.
2. Three **Text file output** steps, extension `csv`:
   * `High Priority`: `pvfs://MinIO/staging/reconciliation/urgent_actions` (select **Include date in filename?** and **Include time in filename?**)
   * `Medium Priority`: `pvfs://MinIO/staging/reconciliation/review_queue` (date and time too)
   * `Low Priority`: `pvfs://MinIO/staging/reconciliation/low_priority`
3. For the summary, a **Sort rows** on `discrepancy_type` from the JavaScript step, then **Group by** `discrepancy_type` with the sums of `financial_impact`, `excess_carrying_cost` and `lost_sales_risk` and a distinct count of `product_id`.
4. Run. In MinIO, `staging/reconciliation/` holds three files:

| File               | Rows | What is in it                                             |
| ------------------ | ---- | --------------------------------------------------------- |
| `urgent_actions_*` | 6    | 3 understock, 2 missing in the warehouse, 1 overstock      |
| `review_queue_*`   | 9    | 4 overstock, 4 understock, 1 missing in the catalog        |
| `low_priority`     | 4    | the matches                                                |

The Group by previews 5 rows, one per discrepancy type.

::::

***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[inventory_reconciliation.ktr](./files/inventory_reconciliation.ktr) <button data-launch="spoon" data-path="files/inventory_reconciliation.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/inventory_reconciliation.ktr">View graph</button>

### Customer 360

> **Warning:**
>
> #### Customer 360
>
> Create unified customer profiles combining demographic data, purchase history, and behavioral events.
>
> **Skills:** Multiple joins, JSONL parsing, aggregations, calculated metrics

<figure><img src="../_assets/images/customer-360.png" alt="Customer 360"><figcaption><p>Customer 360</p></figcaption></figure>

> **Note:** **Workshop files**
>
> These files are already in MinIO:
>
> * `pvfs://MinIO/raw-data/csv/customers.csv` (12 customers)
> * `pvfs://MinIO/raw-data/csv/sales.csv` (15 sales)
> * `pvfs://MinIO/raw-data/json/user_events.json` (46 events, one JSON object per line)
>
> Output: `pvfs://MinIO/curated/customer/customer_360`

> **Note:** Create a new transformation.
>
> Use any of these options:
>
> * Select **File** > **New** > **Transformation**
> * Use `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

:::: tabs

### 1. Customers

1. Save the transformation as `customer_360.ktr` in your workshop folder.
2. **Text file input** `Read Customers`: `pvfs://MinIO/raw-data/csv/customers.csv`, separator `,`, header row, **Get Fields** (`customer_id` Integer, `registration_date` Date `yyyy-MM-dd`, the rest String).
3. **Sort rows** `Sort rows` on `customer_id`.

### 2. Sales per customer

1. **Text file input** `Read Sales`: `pvfs://MinIO/raw-data/csv/sales.csv`, separator `,`, header row, **Get Fields** (`customer_id` Integer, `sale_date` Date, `sale_amount` BigNumber).

<figure><img src="../_assets/images/select-sales-csv-from-vfs-connections.png" alt="Select - sales.csv from VFS connections"><figcaption><p>Select - sales.csv from VFS connections</p></figcaption></figure>

2. **Sort rows** `Sort Customers` on `customer_id`.
3. **Memory group by** on `customer_id`: `total_orders` = Number of values (`sale_id`), `total_spent` = Sum (`sale_amount`), `first_purchase` = Minimum (`sale_date`), `last_purchase` = Maximum (`sale_date`), `avg_order_value` = Average (`sale_amount`). 15 sales become 12 rows.
4. **Sort rows** `Final Customer Sort` on `customer_id`.

> **Note:** Memory group by holds every group in memory, so unlike Group by it doesn't need the sort before it; `Final Customer Sort` is the one that matters, for the Merge join.

### 3. User events

1. **Text file input** `Read User Events`: `pvfs://MinIO/raw-data/json/user_events.json`, no header, one String field `json_line`, and a separator that never occurs in the data (the solution uses `|||DELIM|||`), so each line arrives whole.
2. **JSON input** `JSON input`: on **File**, select **Source is from a previous step** and pick `json_line`. Fields: `event_id` `$.event_id`, `user_id` `$.user_id` (Integer), `event_type` `$.event_type`, `product_id` `$.product_id`, `timestamp` `$.timestamp`.
3. **Modified JavaScript value** `MJV - Define Events`: one 0/1 flag per event type (`is_page_view`, `is_add_to_cart`, `is_purchase`, `is_checkout`, `is_search`, `is_product_view`), e.g. `var is_page_view = (event_type == "page_view") ? 1 : 0;`
4. **Sort rows** `Sort Events` on `user_id`, then **Group by** `Group by User` on `user_id`: `total_events` = distinct count of `event_id`, and the Sum of each flag (`page_views`, `cart_additions`, `purchases`, `checkouts`, `searches`, `product_views`). 46 events become 12 rows.
5. **Sort rows** `Final User Sort` on `user_id`.

### 4. Join

1. **Merge join** `Sales & Events`: `Final Customer Sort` and `Final User Sort`, **INNER**, keys `customer_id` and `user_id`.
2. **Merge join** `Customers + Sales + Events`: `Sales & Events` and `Sort rows` (the customers), **LEFT OUTER**, key `customer_id` on both.
3. **Get system info** `todays_date` (system date (variable)), then **Calculator**: `days_since_last_purchase` = DATE_DIFF(`todays_date`, `last_purchase`) and `days_as_customer` = DATE_DIFF(`last_purchase`, `first_purchase`).
4. **Formula** `Engagement`: `engagement_score` = `[total_events]*0.3 + [cart_additions]*0.5 + [total_orders]*0.2`.
5. **Modified JavaScript value** `MJV - Customer Segment`: `customer_segment` = High Value (spent 1,000 or more), Medium Value (500 or more), Low Value (any spend) or Prospect.

### 5. Output

1. **Select values**: keep the customer details, the order metrics, the event counts, `engagement_score` and `customer_segment`.
2. **Text file output** `Output - Customer 360`: `pvfs://MinIO/curated/customer/customer_360`, extension `csv`, header row, date and time in the filename.
3. Run. The file holds one row per customer: 12 rows, 2 High Value, 3 Medium Value and 7 Low Value.

::::

***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[customer_360.ktr](./files/customer_360.ktr) <button data-launch="spoon" data-path="files/customer_360.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/customer_360.ktr">View graph</button>

### Log Parsing

> **Warning:**
>
> #### Log Parsing and Anomaly Detection
>
> **Objective:** Parse application logs, extract metrics, and detect anomalies.
>
> **Skills:** Regex, timestamp parsing, time-series analysis, conditional logic

<figure><img src="../_assets/images/log-analysis.png" alt="Log Analysis"><figcaption><p>Log Analysis</p></figcaption></figure>

> **Note:** **Workshop files**
>
> Input: `pvfs://MinIO/logs/app/application.log` (123 lines over four hours). Output: `pvfs://MinIO/logs/alerts/critical_alerts.csv`.

Build `log_analysis_anomaly.ktr`, step by step:

1. **Text file input** `Read App Log`: the log file, no header, one String field `log_line`, and a separator that never occurs (the solution uses `||||`) so each line arrives whole.
2. **Regex evaluation**: field `log_line`, regular expression `^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+(\w+)\s+\[([^\]]+)\]\s+(.*)$`, select **Create fields for capture groups**, capture fields `timestamp_str`, `log_level`, `component`, `message` (String).
3. **Select values**: on **Meta-data**, change `timestamp_str` to `timestamp`, type Timestamp, format `yyyy-MM-dd HH:mm:ss`.
4. **Calculator**: `log_hour` = **Hour of Day of Date A** (`timestamp`).
5. **Filter rows** `Filter Errors`: `log_level` CONTAINS `ERROR` OR `log_level` = `WARN`. True to the next step; false to a **Dummy** `All others`. 58 of the 123 lines pass.
6. **Sort rows** on `log_hour`, then **Group by** `Group by Hour` on `log_hour`: `error_count` = Number of rows, `error_messages` = concatenated `message` values. 4 rows, one per hour.
7. **Modified JavaScript value** `MJV - Rolling Avg`: `rolling_avg_errors`, the average of this hour and the two before it (copy the script from the solution: it keeps the previous two counts in variables between rows).
8. **Formula** `Anomaly Detection`: `is_anomaly` = `IF([error_count] > ([rolling_avg_errors] * 1.2); "YES"; "NO")` and `anomaly_severity` = `IF([error_count] > ([rolling_avg_errors] * 1.5); "CRITICAL"; IF([error_count] > ([rolling_avg_errors] * 1.2); "WARNING"; "NORMAL"))`.
9. **Switch / case** on `anomaly_severity`: `CRITICAL` to a **Text file output** `Output - Critical` (`pvfs://MinIO/logs/alerts/critical_alerts`, extension `csv`), `WARNING` and `NORMAL` to two Dummy steps.
10. Run. Of the four hours, 1 is critical, 1 a warning and 2 normal; the critical one is written to `logs/alerts/`.

> **Under the hood:**
>
> #### A rolling average needs memory between rows
>
> Every other step here treats each row on its own. A rolling average
> cannot: it needs the last two hours' counts. The JavaScript step keeps
> them in script variables that survive from one row to the next, which
> is why the rows must arrive in hour order, and why the Sort rows comes
> first.
>
> **Why it matters:** "compared with recent history" is the core of
> most anomaly checks, and the order of the rows is part of the logic.

***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[log_analysis_anomaly.ktr](./files/log_analysis_anomaly.ktr) <button data-launch="spoon" data-path="files/log_analysis_anomaly.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/log_analysis_anomaly.ktr">View graph</button>

### Fraud

> **Warning:**
>
> #### Transactions & Fraud Detection
>
> **Objective:** Process credit card transactions, enrich with account and merchant data, calculate transaction metrics, and detect suspicious patterns using rule-based fraud detection.
>
> **Skills:** Financial data processing, multi-table joins, running totals, rule-based fraud detection, transaction velocity analysis
>
> **Business Context:** A payment processor needs to analyze transaction data in real-time to detect potentially fraudulent activity before authorizing transactions. The system must flag high-risk transactions based on amount thresholds, unusual merchant activity, account balance checks, and transaction velocity patterns.

> **Note:** **Workshop files**
>
> Inputs (already in MinIO, and also under **Workshop files** below): `pvfs://MinIO/raw-data/finance/transactions.csv` (63 transactions), `accounts.csv` (13 accounts), `merchants.csv` (18 merchants).

Build `fraud_detection.ktr`, step by step:

1. Three **Text file input** steps, `Read Transactions`, `Read Accounts` and `Read Merchants`, one per finance file: separator `,`, header row, **Get Fields**. Make `amount`, `balance` and `credit_limit` BigNumber, and `transaction_date` (`yyyy-MM-dd HH:mm:ss`) and `open_date` (`yyyy-MM-dd`) Date.
2. **Stream lookup** `Lookup Accounts` after `Read Transactions`: **Lookup step** `Read Accounts`, key `account_id` = `account_id`, returning `customer_name`, `account_type`, `balance`, `credit_limit`, `open_date` and `risk_rating`.
3. **Sort rows** `Sort by Merchants` (after the lookup) and `Sort Merchants` (after `Read Merchants`), both on `merchant_id`.
4. **Merge join** `Join Merchants`: the sorted transactions first, merchants second, **LEFT OUTER**, key `merchant_id`. Every transaction keeps its row even if the merchant is unknown.
5. **Formula** `Metrics + Flags`: the metrics and six 0/1 flags:

| Field | Formula |
| --- | --- |
| `days_since_account_open` | `ABS(DAYS([transaction_date]; [open_date]))` |
| `balance_after_transaction` | `[balance] - [amount]` |
| `credit_utilization` | `IF([credit_limit] > 0; ([amount] / [credit_limit]) * 100; 0)` |
| `high_amount_flag` | `IF([amount] > 1000; 1; 0)` |
| `overlimit_flag` | `IF(AND([account_type]="CREDIT"; [balance_after_transaction] < 0); 1; 0)` |
| `high_risk_merchant_flag` | `IF([risk_level]="HIGH"; 1; 0)` |
| `velocity_flag` | `IF([status]="DECLINED"; 1; 0)` |
| `new_account_flag` | `IF([days_since_account_open] < 30; 1; 0)` |
| `high_utilization_flag` | `IF([credit_utilization] > 80; 1; 0)` |

6. **Formula** `Calculate Fraud Score`: `fraud_risk_score` = `([high_amount_flag] * 20) + ([overlimit_flag] * 30) + ([high_risk_merchant_flag] * 25) + ([velocity_flag] * 15) + ([new_account_flag] * 5) + ([high_utilization_flag] * 15)` (Integer).
7. **Formula** `risk_category`: `IF([fraud_risk_score] >= 80; "CRITICAL"; IF([fraud_risk_score] >= 50; "HIGH"; IF([fraud_risk_score] >= 20; "MEDIUM"; "APPROVE")))`.
8. Preview `risk_category`: of the 63 transactions, 45 APPROVE, 6 MEDIUM, 5 HIGH and 7 CRITICAL.

> **Under the hood:**
>
> #### Stream lookup for the small side, merge join for the sorted one
>
> The accounts are small, so **Stream lookup** reads all 13 into memory
> once and answers each transaction from there, with no sorting. The
> merchants go through **Merge join**, which needs both inputs sorted
> but never holds a whole side in memory. Two ways of enriching a
> stream, chosen by size.
>
> **Why it matters:** the score is plain arithmetic over flags, so every
> rating can be explained: a CRITICAL is a sum of named reasons.

***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[fraud_detection.ktr](./files/fraud_detection.ktr) <button data-launch="spoon" data-path="files/fraud_detection.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/fraud_detection.ktr">View graph</button>

[data/accounts.csv](./files/data/accounts.csv)

[data/merchants.csv](./files/data/merchants.csv)

[data/transactions.csv](./files/data/transactions.csv)

### Data Lake Ingestion

> **Warning:**
>
> #### Data Lake Ingestion
>
> A data lake often receives the same entities from several sources in different formats. Here the products arrive three ways, as CSV, JSON and XML, and you bring them into one schema: same field names, same order, same types, with each row's source recorded.
>
> **Skills:** three input formats, schema mapping, **Select values** for layout, combining streams

> **Note:** **Workshop files**
>
> These files are already in MinIO:
>
> * `pvfs://MinIO/raw-data/csv/products.csv` (18 products)
> * `pvfs://MinIO/raw-data/json/api_response.json` (2 orders, one item each)
> * `pvfs://MinIO/raw-data/xml/inventory.xml` (17 items)

Create a new transformation (**File > New > Transformation**) and save it as `data_lake_ingestion.ktr`.

:::: tabs

### 1. Design the schema

> **Note:**
>
> #### Inspect first, then decide
>
> You can't normalize what you haven't inspected. Look at a real record from each source, map the fields, and write the decisions down before you build anything.

::: tabs

### CSV (products.csv)

Open `csv/products.csv` in the MinIO console (**raw-data** bucket, then **Preview** or **Download**):

```csv
product_id,product_name,category,price,stock_quantity,supplier,last_updated
P001,Laptop Pro 15,Electronics,1299.99,45,TechSupply Inc,2024-01-15
P002,Wireless Mouse,Electronics,29.99,230,TechSupply Inc,2024-01-16
```

* All five product fields are there, as `product_id`, `product_name`, `category`, `price` and `stock_quantity`, plus `supplier` and `last_updated`.
* 18 products, `P001` to `P018`.

### JSON (api_response.json)

Open `json/api_response.json`. Each order has an `items` array; one item:

```json
{
  "product_id": "P001",
  "name": "Laptop Pro 15",
  "quantity": 1,
  "unit_price": 1299.99
}
```

* The product name is `name`, and the price is `unit_price`.
* `quantity` is the quantity *ordered*, not stock.
* There is no `category`.
* The items sit at `$.data.orders[*].items[*]`: 2 orders, one item each.

### XML (inventory.xml)

Open `xml/inventory.xml`. Items sit under `/inventory/items/item`:

```xml
<item>
    <sku>P001</sku>
    <name>Laptop Pro 15</name>
    <category>Electronics</category>
    <quantity>45</quantity>
    <location>A-12-3</location>
    <last_checked>2024-01-20</last_checked>
</item>
```

* The product id is `sku`, and the name is `name`.
* `quantity` is the warehouse stock.
* There is no price.
* 17 items.

:::

**The field mapping**

| Target field     | Type      | CSV              | JSON                     | XML        |
| ---------------- | --------- | ---------------- | ------------------------ | ---------- |
| `product_id`     | String    | `product_id`     | `product_id`             | `sku`      |
| `product_name`   | String    | `product_name`   | `name`                   | `name`     |
| `category`       | String    | `category`       | none: `E-commerce`       | `category` |
| `price`          | Number    | `price`          | `unit_price`             | none: null |
| `quantity`       | Integer   | `stock_quantity` | `quantity` (ordered)     | `quantity` |
| `source_system`  | String    | `csv`            | `json`                   | `xml`      |
| `ingestion_time` | Date      | system date      | system date              | system date |

**The decisions**

* Names follow the CSV, the product master.
* A field a source lacks gets a stated default (`category` = `E-commerce` for JSON) or stays null (`price` for XML).
* `source_system` and `ingestion_time` record where each row came from and when.
* The same product can arrive from all three sources. `P001` comes from the CSV (price 1299.99, stock 45, Electronics), the JSON (price 1299.99, quantity 1, E-commerce) and the XML (no price, stock 45, Electronics). This workshop keeps all three rows; a later step could keep one per product, preferring the CSV, then the JSON, then the XML.

### 2. Ingest the sources

> **Note:**
>
> #### One branch per source, one layout at the end
>
> Each branch reads its source, adds the fields the source lacks, stamps the time, and ends in a **Select values** that lists the seven target fields in the same order. The branches only differ in where each field comes from.

**CSV branch**

1. **Text file input** `Read Products - CSV`: **File or directory** `pvfs://MinIO/raw-data/csv/products.csv`; on **Content**, **Separator** `,` and **Header** selected; on **Fields**, **Get Fields** (`price` BigNumber, `stock_quantity` Integer).
2. **Add constants** `Add Metadata`: `source_system`, String, `csv`.
3. **Get system info** `Ingestion Timestamp`: `ingestion_time`, `system date (variable)`.
4. **Select values** `Map to Schema - CSV`. On **Select & Alter**: `product_id`, `product_name`, `category`, `price`, `stock_quantity` renamed `quantity`, `source_system`, `ingestion_time`. On **Meta-data**: `price`, Type Number.

**JSON branch**

1. **JSON input** `Read Products - JSON`: on **File**, add `pvfs://MinIO/raw-data/json/api_response.json`; on **Fields**:

| Name         | Path                                   | Type    |
| ------------ | -------------------------------------- | ------- |
| `product_id` | `$.data.orders[*].items[*].product_id` | String  |
| `name`       | `$.data.orders[*].items[*].name`       | String  |
| `quantity`   | `$.data.orders[*].items[*].quantity`   | Integer |
| `unit_price` | `$.data.orders[*].items[*].unit_price` | Number  |

2. **Add constants** `Add Metadata 2`: `source_system`, String, `json`, and `category`, String, `E-commerce`.
3. **Get system info** `Ingestion Timestamp 2`: `ingestion_time`, `system date (variable)`.
4. **Select values** `Map to Schema - JSON`, on **Select & Alter**: `product_id`, `name` renamed `product_name`, `category`, `unit_price` renamed `price`, `quantity`, `source_system`, `ingestion_time`.

**XML branch**

1. **Get data from XML** `Read Products - XML`: file `pvfs://MinIO/raw-data/xml/inventory.xml`, **Loop XPath** `/inventory/items/item`; fields `sku`, `name` and `category` (String) and `quantity` (Integer), each with the XPath of its own name.
2. **Add constants** `Add Metadata 3`: `source_system`, String, `xml`, and `price`, Number, with no value (null).
3. **Get system info** `Ingestion Timestamp 3`: `ingestion_time`, `system date (variable)`.
4. **Select values** `Map to Schema - XML`, on **Select & Alter**: `sku` renamed `product_id`, `name` renamed `product_name`, `category`, `price`, `quantity`, `source_system`, `ingestion_time`.

> **Success:** Checkpoint: preview each **Map to Schema** step. The CSV gives 18 rows, the JSON 2 and the XML 17, each with the same seven columns in the same order.

### 3. Combine

> **Note:**
>
> #### Three hops into one step
>
> **Append streams** takes only two inputs, a head and a tail. To stack three, hop them all into one step: PDI passes on every row that arrives on any of its input hops, like a SQL `UNION ALL`.

1. From the **Flow** folder, drag **Dummy (do nothing)** onto the canvas and name it `Combine All Products`.
2. Hop each **Map to Schema** step to it.
3. Save, then run with **Enable safe mode** selected in **Run Options**, and preview **Combine All Products**.

```text
product_id  product_name    category     price    quantity  source_system
P001        Laptop Pro 15   Electronics  1299.99  45        csv
...
P001        Laptop Pro 15   E-commerce   1299.99  1         json   <- the same product again
...
P001        Laptop Pro 15   Electronics           45        xml    <- again, and no price
```

> **Success:** Checkpoint: 37 rows (18 CSV, 2 JSON, 17 XML), no errors in safe mode, and every value in its own column.

> **Under the hood:**
>
> #### A step expects every row to have the same layout
>
> A step reads each incoming row by position, using the layout of the
> first row it received. Rows with a different order or different
> types still flow, but their values are read as the wrong fields:
> without the final **Select values**, a JSON row's `quantity` sits
> where the CSV rows have `category`. Nothing fails; the data is just
> wrong.
>
> **Enable safe mode** makes PDI compare every row with the first and
> stop at the first difference, with a message such as "you're mixing
> rows with different layout. Field [category String] does not have
> the same name as field [quantity Integer]".
>
> **Why it matters:** whenever streams meet, give them one layout first,
> and use safe mode while you build.

### 4. Validate (extension)

> **Note:**
>
> #### Data Validation
>
> An extension beyond the solution, which stops at **Combine All Products**: check the unified rows before you publish them, and route the failures to an error file.

1. Add a **Data validator** step after **Combine All Products** and name it `Validate Product Data`.
2. Add validations: `product_id` and `product_name` must not be null or empty; `price` must be at least 0, with null allowed (the XML feed has no price).
3. Right-click the step, choose **Error Handling...**, and send the error rows to a **Text file output** `Write Error Records`: `pvfs://MinIO/curated/products/errors/validation_errors`, extension `csv`, **Include date in filename?** selected. Give the error descriptions field a name such as `validation_errors`.
4. Rows that pass carry on from the validator's normal hop; write them on to `pvfs://MinIO/curated/products/`.

> **Note:** **Data validator** routes failing rows through its error hop; there is no "validation result" field on the good rows to filter on.

::::
***

> **Note:** **Workshop files**
>
> Download the files for this workshop. For `.ktr` files, **Open in Pentaho Data Integration** launches PDI with the transformation loaded; if PDI is already running, the path is copied to your clipboard (Ctrl+O, Ctrl+V, Enter).

[data_lake_ingestion.ktr](./files/data_lake_ingestion.ktr) <button data-launch="spoon" data-path="files/data_lake_ingestion.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/data_lake_ingestion.ktr">View graph</button>

:::::

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches PDI with the file loaded. If PDI is already running, the path is copied to your clipboard — switch to PDI and use Ctrl+O, Ctrl+V, Enter.

The sample data for these workshops is in `data/` beside them.

### Solution <!-- no-step -->

One finished transformation per workshop in the series. Open them alongside your own to compare, or run to see the expected result.

Also on disk at `C:\Workshop-DI-Practitioner\03-data-sources\03-storage\19-mod3-minio\solution`.

[customer_360.ktr](./files/customer_360.ktr) <button data-launch="spoon" data-path="files/customer_360.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/customer_360.ktr">View graph</button>

[data_lake_ingestion.ktr](./files/data_lake_ingestion.ktr) <button data-launch="spoon" data-path="files/data_lake_ingestion.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/data_lake_ingestion.ktr">View graph</button>

[fraud_detection.ktr](./files/fraud_detection.ktr) <button data-launch="spoon" data-path="files/fraud_detection.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/fraud_detection.ktr">View graph</button>

[inventory_reconciliation.ktr](./files/inventory_reconciliation.ktr) <button data-launch="spoon" data-path="files/inventory_reconciliation.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/inventory_reconciliation.ktr">View graph</button>

[log_analysis_anomaly.ktr](./files/log_analysis_anomaly.ktr) <button data-launch="spoon" data-path="files/log_analysis_anomaly.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/log_analysis_anomaly.ktr">View graph</button>

[sales_dashboard_etl.ktr](./files/sales_dashboard_etl.ktr) <button data-launch="spoon" data-path="files/sales_dashboard_etl.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/sales_dashboard_etl.ktr">View graph</button>
