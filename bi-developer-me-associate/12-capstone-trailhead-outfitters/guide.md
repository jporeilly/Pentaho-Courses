# Capstone: Trailhead Outfitters

> **Capstone Project — bring it all together.**

Trailhead Outfitters sells outdoor gear from twelve stores in four US
regions. Its sales live in a MySQL database, `trailhead`, which sits
beside Steel Wheels in the lab's **sampledata MySQL** container. The
regional managers want to build their own reports in Interactive
Reports, each seeing only their own region, and finance wants customer
contact details kept to administrators.

You build the metadata domain that makes this possible, from an empty
domain to a published, secured data source. Every stage uses a
workshop from this course, named beside its heading in case you want
to look back.

> **Objectives:**
>
> - Model a second database, on MySQL, from an empty domain to a published data source.
> - Join a fact table to a dimension on two columns with a complex join.
> - Add calculated columns, including one that MySQL needs written its own way.
> - Format with concepts, organise with categories, and secure the model, its columns and its rows.
> - Prove it: three users, three different answers from the same report.
>
> **Prerequisites:** Workshops 03 to 11; Pentaho Metadata Editor and Pentaho Server installed; the sampledata MySQL container (the MySQL lab kit in `C:\MySQL`).
>
> **Estimated time:** 2 hours.

---

## The data

| Table | Rows | What it holds |
| --- | --- | --- |
| `sales` | 4,286 | One row per order line, 2024 and 2025: `order_no`, `line_no`, `sale_date`, `region_code`, `store_no`, `customer_id`, `product_id`, `quantity`, `unit_price`, `discount_pct` |
| `stores` | 12 | `region_code` + `store_no` (the key), `region_name`, `store_name`, `city`, `state`, `store_type`, `opened_date`, `square_feet` |
| `customers` | 540 | `customer_id`, `first_name`, `last_name`, `email`, `phone`, `city`, `state`, `home_region_code`, `loyalty_tier`, `joined_date` |
| `products` | 56 | `product_id`, `sku`, `product_name`, `category`, `brand`, `unit_cost`, `list_price` |
| `calendar` | 731 | One row per day of 2024 and 2025: `date_key`, `year_no`, `quarter_no`, `quarter_name`, `month_no`, `month_name`, `month_desc`, `day_name`, `is_weekend`, `season` |

> **Note:** Store numbers restart in each region: West Coast store 1
> (Seattle) and East Coast store 1 (Boston) are different shops. A sale
> therefore names its store with **two** columns, `region_code` and
> `store_no`. Keep that in mind at stage 4.

## 1. Get ready

1. Check that the `trailhead` database is there. In PowerShell:

```powershell
C:\MySQL\load-trailhead.ps1
```

   It prints `trailhead database present (4286 sales lines).`, or loads
   the database first and then says so. If it says it cannot query
   MySQL, start the container and try again:

```powershell
C:\MySQL\run-podman-mysql.ps1
```

2. Put the MySQL JDBC driver into the Metadata Editor **and** the
   Pentaho Server. Neither ships one. This copies the driver from Pentaho
   Data Integration when it has one, and otherwise downloads it from
   Maven Central, where Oracle publishes it:

```powershell
$jar = Get-ChildItem "C:\Pentaho\design-tools\data-integration\lib\mysql-connector-j-*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $jar) {
    $out = Join-Path $env:TEMP "mysql-connector-j-8.4.0.jar"
    Invoke-WebRequest "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.4.0/mysql-connector-j-8.4.0.jar" -OutFile $out -UseBasicParsing
    $jar = Get-Item $out
}
Copy-Item $jar.FullName "C:\Pentaho\design-tools\metadata-editor\libext\JDBC\"
Copy-Item $jar.FullName "C:\Pentaho\server\pentaho-server\tomcat\lib\"
```

3. Restart the Metadata Editor, and restart the Pentaho Server (stop it,
   then start it), so both load the driver.

> **Under the hood:**
>
> #### Two programs, two drivers
>
> The Metadata Editor connects to MySQL itself, to import tables and to
> run the Query Editor. The published domain does not travel with a
> connection, only with the connection's details, so the Pentaho Server
> opens its own connection for every report built on it. Each program
> loads drivers from its own folder, and only when it starts.

## 2. Domain, connection and tables *(OrdersME)*

1. **File > New > Domain File**.
2. Right-click **Connections** and create this connection:

| Field | Value |
| --- | --- |
| Connection name | mysql:trailhead |
| Connection Type | MySQL |
| Access | Native (JDBC) |
| Host name | 127.0.0.1 |
| Database Name | trailhead |
| Port Number | 3306 |
| User Name | pentaho_admin |
| Password | password |

3. Click **Test**, then **OK**. Import Tables opens: select the five
   `trailhead` tables (`calendar`, `customers`, `products`, `sales`,
   `stores`) and click **OK**.

> **Under the hood:**
>
> #### What the import decided for you
>
> A physical table gets an ID built from its name: `PT_SALES`. A
> physical column's ID is the column name exactly as MySQL reports it,
> so here they are lower-case (`quantity`, `sale_date`). Steel Wheels'
> were upper-case because HSQLDB reports them that way. You use these
> IDs in formulas at stage 3.
>
> The import also sets each column's data type from the driver's. A
> MySQL `DATE` arrives as **Date**, so `sale_date` needs no change.
> SampleData stores its order dates as `TIMESTAMP`, which the importer
> has no case for and records as **String**: that is why the
> OrderStarCustomer workshop had to set Order Date's data type by hand.

## 3. Calculated columns *(OrderStarCustomer)*

Add three columns in the physical layer, before you build the business
model, so they come along when you drag the tables in. For each one:
right-click the physical table, **Edit**, **Add New Column**, type the
ID, then set the properties.

| Table | ID | Formula | Is the formula exact? | Default Aggregation | Data Type |
| --- | --- | --- | --- | --- | --- |
| `PT_SALES` | `PC_NET_SALES` | `[quantity]*[unit_price]*(1-[discount_pct])` | ticked | Sum | Numeric |
| `PT_SALES` | `PC_ORDERS` | `order_no` | **not** ticked | Distinct Count | Numeric |
| `PT_CUSTOMERS` | `PC_CUSTOMER_NAME` | `CONCAT(last_name, ', ', first_name)` | ticked | None | String |

The Metadata Editor names each one from its ID: **Net Sales**,
**Orders**, **Customer Name**.

> **Under the hood:**
>
> #### Three formulas, three different routes into the SQL
>
> **Net Sales** is a Metadata Formula: the engine parses it, swaps each
> `[column]` for the table's alias and column, and wraps it in the
> aggregation: `SUM(BT_SALES_SALES.quantity * BT_SALES_SALES.unit_price * (1 - BT_SALES_SALES.discount_pct))`.
>
> **Orders** is not exact, so the text is a column name, and
> Distinct Count turns it into `COUNT(DISTINCT BT_SALES_SALES.order_no)`: one per
> order, however many lines it has. 4,286 lines make 2,410 orders.
>
> **Customer Name** is the one MySQL needs its own way. The
> OrderStarCustomer formula, `[last_name] + ", " + [first_name]`, is
> generated as written, and MySQL's `+` adds numbers: every name
> becomes `0`, and a Net Sales by Customer Name report collapses into
> one row of $690,124.85. `CONCAT(...)` is not a Metadata Formula the
> engine can parse, so it passes the text into the SQL unchanged, the
> rule the complex-join warning describes. Because it goes in without a
> table alias, use it only with column names that no other table in
> the query shares: `last_name` and `first_name` are only in
> `customers`, but `city` would be ambiguous.

## 4. Business model and relationships *(OrdersME)*

1. Right-click **Business Models**, **New Business Model**: Name
   **Trailhead Sales**, Connection **mysql:trailhead**.
2. Drag the five physical tables into **Business Tables**. Their IDs
   are `BT_SALES_SALES`, `BT_STORES_STORES`, `BT_CUSTOMERS_CUSTOMERS`,
   `BT_PRODUCTS_PRODUCTS` and `BT_CALENDAR_CALENDAR`.
3. Create the relationships, every one **N:1** from Sales:

| From Table / Field | To Table / Field |
| --- | --- |
| BT_SALES_SALES / BC_SALES_PRODUCT_ID | BT_PRODUCTS_PRODUCTS / BC_PRODUCTS_PRODUCT_ID |
| BT_SALES_SALES / BC_SALES_CUSTOMER_ID | BT_CUSTOMERS_CUSTOMERS / BC_CUSTOMERS_CUSTOMER_ID |
| BT_SALES_SALES / BC_SALES_SALE_DATE | BT_CALENDAR_CALENDAR / BC_CALENDAR_DATE_KEY |
| BT_SALES_SALES / BC_SALES_REGION_CODE | BT_STORES_STORES / BC_STORES_REGION_CODE |

4. The Stores relationship needs both key columns. Tick
   **Complex Join?** and enter this in **Complex Join Metadata Formula**:

```
AND([BT_SALES_SALES.BC_SALES_REGION_CODE]=[BT_STORES_STORES.BC_STORES_REGION_CODE]; [BT_SALES_SALES.BC_SALES_STORE_NO]=[BT_STORES_STORES.BC_STORES_STORE_NO])
```

> **Under the hood:**
>
> #### What a one-column store join would report
>
> Join on `store_no` alone and every sale matches one store in each
> region that has that number. Net Sales by Region then reads West
> Coast $690,124.85, the whole company, because the West has a store
> 1, 2, 3 and 4 and so matches every sale; Rocky Mountains and East
> Coast $657,493.55 each; Central $528,750.90. Nothing errors: the SQL
> is valid, just wrong. With both columns each sale matches exactly one
> store, and the regions add up to the company total.

## 5. Names and aggregations *(OrderStarCustomer)*

Override these names (Business Table Properties, **General > Name**):

| Business column | Name |
| --- | --- |
| BC_SALES_ORDER_NO | Order Number |
| BC_SALES_SALE_DATE | Sale Date |
| BC_SALES_UNIT_PRICE | Unit Price |
| BC_SALES_DISCOUNT_PCT | Discount |
| BC_STORES_REGION_NAME | Region |
| BC_STORES_REGION_CODE | Region Code |
| BC_STORES_STORE_NAME | Store |
| BC_STORES_CITY / BC_STORES_STATE | Store City / Store State |
| BC_STORES_STORE_TYPE | Store Type |
| BC_CUSTOMERS_CITY / BC_CUSTOMERS_STATE | Customer City / Customer State |
| BC_CUSTOMERS_LOYALTY_TIER | Loyalty Tier |
| BC_PRODUCTS_PRODUCT_NAME | Product |
| BC_PRODUCTS_SKU | SKU |
| BC_PRODUCTS_UNIT_COST / BC_PRODUCTS_LIST_PRICE | Unit Cost / List Price |
| BC_CALENDAR_YEAR_NO | Year |
| BC_CALENDAR_QUARTER_NAME | Quarter |
| BC_CALENDAR_MONTH_NO | Month Number |
| BC_CALENDAR_MONTH_DESC | Month |
| BC_CALENDAR_IS_WEEKEND | Weekend |

Then set **Default Aggregation** on three Sales columns: Quantity
**Sum**, Unit Price **Average**, Discount **Average**. (Net Sales and
Orders already have theirs from the physical layer.)

## 6. Concepts *(Concept Editor)*

Create these concepts (**Tools > Concept Editor**), then set the parent
concepts:

| Concept | Parent | Mask for Number or Date | Text Alignment |
| --- | --- | --- | --- |
| Number | Base | `#,##0` | Right |
| USCurrency | Number | `$#,##0.00;($#,##0.00)` | (inherited) |
| Percent | Number | `0.0%` | (inherited) |
| Date | Base | `MM-dd-yyyy` | |

| Parent concept | Business columns |
| --- | --- |
| Number | Quantity, Orders |
| USCurrency | Unit Price, Net Sales, Unit Cost, List Price |
| Percent | Discount |
| Date | Sale Date |

> **Under the hood:**
>
> #### The Date mask works first time here
>
> A mask is a Java format pattern applied by the report, and it only
> takes on a value of the matching type. Sale Date arrived as a Date
> (stage 2), so `MM-dd-yyyy` formats it. In the Concept Editor workshop
> the same mask left Required Date untouched, because SampleData's
> TIMESTAMP had come in as a String. `0.0%` multiplies by 100, so a
> stored 0.25 shows as 25.0%.

## 7. Business view *(OrdersME, OrderStarCustomer)*

Create five categories and add the columns, in this order:

| ID | Name | Columns |
| --- | --- | --- |
| CT_SALES | Sales | Order Number, Sale Date, Quantity, Unit Price, Discount, Net Sales, Orders |
| CT_STORES | Stores | Region, Region Code, Store, Store City, Store State, Store Type |
| CT_PRODUCTS | Products | Category, Brand, Product, SKU, Unit Cost, List Price |
| CT_CUSTOMERS | Customers | Customer Name, Email, Phone, Customer City, Customer State, Loyalty Tier |
| CT_CALENDAR | Calendar | Year, Quarter, Month Number, Month, Season, Weekend |

## 8. Security *(Row-Level Security)*

1. Point the editor at the server's security service
   (**Tools > Security**, `http://localhost:8080/pentaho/api/userrolelist`,
   `admin` / `password`), as in the Row-Level Security workshop.
2. **Model:** edit the Trailhead Sales business model and set
   **Metadata Security** to the roles **Power User** and **Business
   Analyst**.
3. **Categories:** edit each category and stop its Metadata Security
   override, so all five inherit the model's.
4. **Columns:** override Metadata Security on **Email** and **Phone**
   (Customers) with the user **admin** only.
5. **Rows:** on the business model, set **Data Constraints** to **Role
   Based** with three entries:

| Role or user | Constraint |
| --- | --- |
| Power User (role) | `[BT_STORES_STORES.BC_STORES_REGION_CODE] = "WEST"` |
| Business Analyst (role) | `[BT_STORES_STORES.BC_STORES_REGION_CODE] = "EAST"` |
| admin (user) | `TRUE()` |

> **Under the hood:**
>
> #### Who sees what, and how
>
> Metadata Security decides what is **listed**: a model, category or
> column the signed-in user may not read never appears in Interactive
> Reports. The administrator passes every such check, and a user in
> neither role (tiffany, a Report Author) does not see the Trailhead
> Sales data source at all.
>
> Data Constraints decide which **rows** come back, and here the
> administrator gets no free pass: admin's `TRUE()` entry is what lets
> admin see every region. Suzy holds Power User, so her queries get
> `BT_STORES_STORES.region_code = 'WEST'` in the WHERE clause. The condition names the Stores
> table, so the engine adds Stores to every query she runs, even one
> that selects only Products and Sales columns: her Net Sales by
> Category totals are West Coast totals too.

## 9. Test, save and publish *(Query Builder, OrdersME)*

1. Open the **Query Editor** and run **Region**, **Net Sales** and
   **Orders**. You should get four rows that match admin's figures in
   stage 10.
2. **File > Save** as **Trailhead**.
3. **File > Publish To Server**: Web Publish URL
   `http://localhost:8080/pentaho/plugin/data-access/api/metadata/import`,
   `admin` / `password`, Domain Name **Trailhead**.
4. In the User Console, as admin: **Tools > Refresh > Reporting
   Metadata**.

## 10. Prove it in Interactive Reports

Create an Interactive Report on the **Trailhead Sales** data source with
**Region**, **Net Sales** and **Orders**, then sign in as each user in
turn.

| Region | Net Sales | Orders |
| --- | --- | --- |
| Central | $118,949.50 | 399 |
| East Coast | $164,742.65 | 562 |
| Rocky Mountains | $191,688.10 | 654 |
| West Coast | $214,744.60 | 795 |
| **Company** | **$690,124.85** | **2,410** |

| Signed in as | What you should see |
| --- | --- |
| admin | All four regions, as above. Email and Phone are listed under Customers. |
| suzy (Power User) | West Coast only: $214,744.60, 795 orders. No Email or Phone. |
| pat (Business Analyst) | East Coast only: $164,742.65, 562 orders. No Email or Phone. |
| tiffany (Report Author) | No Trailhead Sales data source. |

For a second check, as admin: Net Sales by **Year** is $327,121.25 for
2024 (1,137 orders) and $363,003.60 for 2025 (1,273 orders).

## Deliverables

* [ ] A domain saved as `Trailhead` with the five tables, three calculated columns and the two-column complex join.
* [ ] Names, aggregations, concepts and categories as specified; Sale Date shows as MM-dd-yyyy and Net Sales as currency.
* [ ] The domain published to the Pentaho Server.
* [ ] The region figures above, reproduced as admin, and as suzy and pat for their own regions.
* [ ] Email and Phone visible to admin only; tiffany sees no Trailhead Sales data source.

---

> **Tip:** Done? Take the **Associate Exam** from the sidebar to
> validate what you've learned across the whole course.

## Lab Files

The reference solution. Build your own first, then compare:

- [Trailhead.xmi](../_assets/files/Trailhead.xmi) - the finished domain (File > Import from XMI File)
