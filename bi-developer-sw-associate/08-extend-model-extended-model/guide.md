# Extended Model

> **Warning:**
>
> #### Workshop - Extended Model
>
> A production schema needs more than one cube with two dimensions. In this workshop you extend the Miniature Models schema with a geographic MARKETS dimension that Analyzer can draw on a map, member properties, a shared TIME dimension, a degenerate ORDER STATUS dimension and a Quantity measure.
>
> **What you'll do**
>
> * Add a four-level MARKETS dimension with geographic annotations for map visualizations
> * Replace levels with member properties in the CUSTOMERS and PRODUCTS dimensions
> * Build a shared TIME dimension with time level types and AnalyzerDateFormat annotations, and use it in the cube
> * Create the degenerate ORDER STATUS dimension from a fact table column
> * Add a Quantity measure, publish the schema, and test it in Analyzer
>
> **Prerequisites:** Complete [Standard Model](../06-schemas-standard-model/guide.md); the Pentaho Server running
>
> **Estimated time:** 40 minutes

<figure>

<figcaption class="pcm-video-caption">Walkthrough: coming soon</figcaption>

</figure>

<div align="center">
<figure>
<img src="../_assets/images/extended_extended_schema_miniature_models.png" alt="Schema Workbench with the extended Miniature Models schema: the Sales_FY2003_2005 cube with MARKETS, CUSTOMERS, PRODUCTS, ORDER STATUS and a shared TIME dimension" width="800">
<figcaption>What you build: the extended Miniature Models schema</figcaption>
</figure>
</div>

Three of the dimensions you build reach the fact table in three different ways:

<div align="center">
<figure>
<img src="../_assets/images/dimension-kinds.png" alt="Three ways a dimension reaches ORDERFACT in the Sales_FY2003_2005 cube. MARKETS, CUSTOMERS and PRODUCTS are private, defined inside the cube, each joined from its own table through its foreignKey, CUSTOMERNUMBER or PRODUCTCODE. ORDER STATUS is degenerate: its Type level reads the STATUS column of ORDERFACT, with no table and no join. TIME is shared, defined once under Schema on DIM_TIME, and joined through the cube's DimensionUsage on TIME_ID" width="800">
<figcaption>Private, degenerate and shared dimensions</figcaption>
</figure>
</div>

Read the diagram from the fact table outward. On the left, MARKETS, CUSTOMERS and PRODUCTS are private dimensions: each is a `<Dimension>` inside the cube with its own table, joined through its own **foreignKey** (the column name in each arrow's label). On the right, ORDER STATUS is degenerate: its level reads the fact table's STATUS column, so the arrow is dashed and no join is made. Below the cube, TIME is shared: it is defined once at schema level, and the cube reaches it through a dimension usage that supplies `TIME_ID`, the foreign key of its own fact table. Tabs 1, 3 and 4 build the private dimensions, tab 5 the shared one and tab 6 the degenerate one.

:::: tabs

### 1. MARKETS

> **Note:**
>
> #### MARKETS Dimension
>
> The MARKETS dimension lets users drill into the data by geography: Territory, Country, State Province and City, all read from the `CUSTOMER_W_TER` table.

1. Start Schema Workbench with the **Start Pentaho Schema Workbench** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\schema-workbench
.\workbench.bat
```

<button data-launch="schema-workbench">Start Pentaho Schema Workbench</button>

2. Make sure the Pentaho Server is running: it hosts the SampleData database on port `9001`. On a lab VM it starts with the machine. On your own machine, start it as [Before You Start](../00-before-you-start/guide.md) describes (its repository database first), and wait until **http://localhost:8080/pentaho** shows the sign-in page:

```powershell
C:\Pentaho\server\pentaho-server\start-pentaho.bat
```

3. Select **File > Open** and open `MiniatureModels.xml`, your schema from [Standard Model](../06-schemas-standard-model/guide.md), in `C:\Workshop-SW-Associate\03-schemas\06-schemas-standard-model`. If you didn't build it, open that lab's solution, `solution\miniaturemodels-original.xml`, instead.
4. Select **File > Save As** and save it as `MiniatureModels-extended.xml` in `C:\Workshop-SW-Associate\04-extend-model\08-extend-model-extended-model`, so your Standard Model schema stays as it was.
5. Right-click **Sales_FY2003_2005** and select **Add Dimension**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_dimension_markets_menu.png" alt="Schema Workbench context menu on the Sales_FY2003_2005 cube of MiniatureModels-extended.xml, with Add Dimension highlighted" width="800">
<figcaption>Add the MARKETS dimension</figcaption>
</figure>
</div>

6. Set the dimension's attributes:

| Attribute  | Value          |
| ---------- | -------------- |
| **name** | `MARKETS` |
| **foreignKey** | `CUSTOMERNUMBER` |
| **type** | StandardDimension |

<div align="center">
<figure>
<img src="../_assets/images/extended_dimension_markets_attributes.png" alt="The new MARKETS dimension selected: name MARKETS, foreignKey CUSTOMERNUMBER, type StandardDimension; the message reads that Hierarchy New Hierarchy 0 is invalid" width="800">
<figcaption>The dimension's attributes</figcaption>
</figure>
</div>

7. Expand **MARKETS**, right-click **New Hierarchy 0** and select **Add Table**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_table_markets_menu.png" alt="Schema Workbench context menu on the MARKETS dimension's New Hierarchy 0, with Add Table highlighted" width="800">
<figcaption>Add the dimension's table</figcaption>
</figure>
</div>

8. Set the table's attributes:

| Attribute | Value |
| --------- | ----- |
| **schema** | `PUBLIC` |
| **name** | `CUSTOMER_W_TER` |

<div align="center">
<figure>
<img src="../_assets/images/extended_table_markets.png" alt="The table of New Hierarchy 0 under MARKETS selected: schema PUBLIC, name CUSTOMER_W_TER" width="800">
<figcaption>The dimension's table</figcaption>
</figure>
</div>

9. Select **New Hierarchy 0** and set its attributes:

| Attribute     | Value          |
| ------------- | -------------- |
| **name** | `Markets` |
| **hasAll** | selected |
| **allMemberName** | `All Markets` |
| **primaryKey** | `CUSTOMERNUMBER` |

<div align="center">
<figure>
<img src="../_assets/images/extended_hierarchy_markets.png" alt="The Markets hierarchy selected: hasAll selected, allMemberName All Markets, primaryKey CUSTOMERNUMBER, visible selected" width="800">
<figcaption>The Markets hierarchy</figcaption>
</figure>
</div>

10. For each row of this table, in order, right-click **Markets**, select **Add Level**, and set the level's attributes. Each level is **type** String, **levelType** Regular and **hideMemberIf** Never.

| name | column | uniqueMembers |
| ---- | ------ | ------------- |
| `Territory` | `TERRITORY` | selected |
| `Country` | `COUNTRY` | cleared |
| `State Province` | `STATE` | cleared |
| `City` | `CITY` | cleared |

<div align="center">
<figure>
<img src="../_assets/images/extended_dimension_markets.png" alt="Schema Workbench with the finished MARKETS dimension selected: name MARKETS, foreignKey CUSTOMERNUMBER, type StandardDimension; the tree shows its Markets hierarchy with the Territory, Country, State Province and City levels and the CUSTOMER_W_TER table" width="710">
<figcaption>The finished MARKETS dimension</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/extended_add_dimension_markets.png" alt="Schema Workbench tree for the MARKETS dimension, with the Markets hierarchy's Territory, Country, State Province and City levels over the CUSTOMER_W_TER table" width="253">
<figcaption>The MARKETS dimension</figcaption>
</figure>
</div>

11. Select **File > Save**.

> **Success:** Checkpoint: **MARKETS** shows no red cross, and **Markets** holds **Territory**, **Country**, **State Province**, **City** and **Table: CUSTOMER_W_TER**.

### 2. Annotations

> **Note:**
>
> #### Geographic Annotations
>
> Annotations mark Country, State Province and City as geography, so Analyzer can place them on a Geo Map, which draws its map tiles from OpenStreetMap. Each level takes an **Annotations** node, and one **Annotation** under it per name.

1. Right-click **Country** and select **Add Annotations**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_annotations_menu.png" alt="Schema Workbench context menu on the Country level of the Markets hierarchy, with Add Annotations highlighted" width="800">
<figcaption>Add Annotations</figcaption>
</figure>
</div>

2. Right-click the new **Annotations** node and select **Add Annotation**. Set **name** to `Data.Role` and **cdata** to `Geography`.

<div align="center">
<figure>
<img src="../_assets/images/extended_annotation_data_role.png" alt="The Data.Role annotation under the Country level&#39;s Annotations node selected: name Data.Role, cdata Geography" width="800">
<figcaption>The Data.Role annotation</figcaption>
</figure>
</div>

3. Right-click **Annotations** again, select **Add Annotation**, and set **name** to `Geo.Role` and **cdata** to `country`.

<div align="center">
<figure>
<img src="../_assets/images/extended_annotation_geo_role.png" alt="Schema Workbench with the Geo.Role annotation under the Country level's Annotations node selected: name Geo.Role, cdata country; Data.Role sits above it" width="710">
<figcaption>The Country level's Geo.Role annotation</figcaption>
</figure>
</div>
4. Add an **Annotations** node to **State Province** and **City** the same way, with these annotations:

| Level | name | cdata |
| ----- | ---- | ----- |
| **State Province** | `Data.Role` | `Geography` |
| **State Province** | `Geo.Role` | `state` |
| **State Province** | `Geo.RequiredParents` | `country` |
| **City** | `Data.Role` | `Geography` |
| **City** | `Geo.Role` | `city` |
| **City** | `Geo.RequiredParents` | `country,state` |

<div align="center">
<figure>
<img src="../_assets/images/extended_markets_annotations.png" alt="Schema Workbench MARKETS tree with Annotations under Country holding Data.Role and Geo.Role, and under State Province and City adding Geo.RequiredParents" width="268">
<figcaption>MARKETS - Annotations</figcaption>
</figure>
</div>

5. Select **File > Save**.

> **Under the hood:**
>
> #### Mondrian carries annotations; Analyzer acts on them
>
> Mondrian doesn't interpret Data.Role, Geo.Role or Geo.RequiredParents.
> It stores them on the level and hands them to any client that asks,
> and they never appear in the SQL it writes. Analyzer reads them:
> Data.Role marks a geography level, Geo.Role says which kind, and
> Geo.RequiredParents names the levels to send along with it.
>
> RequiredParents earns its place in this data: Glendale is a city in
> both California and Connecticut, so "Glendale" alone locates nothing,
> while USA, CA, Glendale does.
>
> **Why it matters:** annotations add behavior to a client without
> changing a single query.

### 3. CUSTOMERS

> **Note:**
>
> #### CUSTOMERS Dimension
>
> Territory and Country now live in MARKETS, so the CUSTOMERS dimension keeps only the Customer Name level, and gains member properties: details that describe each customer without adding levels to drill through.

1. Under **CUSTOMERS > Customers**, right-click **Territory** and select **Delete**.
2. Right-click **Country** and select **Delete**.
3. Right-click **Customer Name** and select **Add Property**. Type each **column** name: the property grid doesn't offer a list for it.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_property_menu.png" alt="Schema Workbench context menu on the Customer Name level, the only level left in the Customers hierarchy, with Add Property highlighted" width="800">
<figcaption>Add Property</figcaption>
</figure>
</div>

4. Set the property's attributes:

| Attribute | Value          |
| --------- | -------------- |
| **name** | `Customer Number` |
| **column** | `CUSTOMERNUMBER` |
| **type** | String |

<div align="center">
<figure>
<img src="../_assets/images/extended_property_customer_number.png" alt="Schema Workbench with the Customer Number property under the Customer Name level selected: column CUSTOMERNUMBER, type String; Contact First Name, Contact Last Name and Phone follow it" width="710">
<figcaption>The Customer Number property</figcaption>
</figure>
</div>

5. Add three more properties to **Customer Name** the same way, each **type** String:

| name | column |
| ---- | ------ |
| `Contact First Name` | `CONTACTFIRSTNAME` |
| `Contact Last Name` | `CONTACTLASTNAME` |
| `Phone` | `PHONE` |

<div align="center">
<figure>
<img src="../_assets/images/extended_properties_customers.png" alt="Schema Workbench CUSTOMERS tree where the Customer Name level holds the Customer Number, Contact First Name, Contact Last Name and Phone properties" width="257">
<figcaption>Properties - Customers</figcaption>
</figure>
</div>

6. Select **File > Save**.

> **Success:** Checkpoint: **Customers** holds only **Customer Name** and **Table: CUSTOMER_W_TER**, and **Customer Name** holds the four properties.

### 4. PRODUCTS

> **Note:**
>
> #### PRODUCTS Dimension
>
> Every property in this tab goes on the **Name** level: a property must have exactly one value per member, and descriptions, codes and vendors belong to products, not to product lines.

1. Under **PRODUCTS > Products**, right-click **Vendor** and select **Delete**.
2. Right-click **Name**, select **Add Property**, and set the property's attributes:

| Attribute | Value              |
| --------- | ------------------ |
| **name** | `Description` |
| **column** | `PRODUCTDESCRIPTION` |
| **type** | String |

<div align="center">
<figure>
<img src="../_assets/images/extended_property_description.png" alt="Schema Workbench with the Description property under the Name level selected: column PRODUCTDESCRIPTION, type String" width="710">
<figcaption>The Description property</figcaption>
</figure>
</div>

3. Add two more properties to **Name** the same way, each **type** String:

| name | column |
| ---- | ------ |
| `Code` | `PRODUCTCODE` |
| `Vendor` | `PRODUCTVENDOR` |

<div align="center">
<figure>
<img src="../_assets/images/extended.png" alt="Schema Workbench tree for the PRODUCTS dimension, with a Description property on the Line level and the Code and Vendor properties on the Name level" width="227">
<figcaption>PRODUCTS properties (the screenshot shows Description on Line; add it to Name)</figcaption>
</figure>
</div>

> **Under the hood:**
>
> #### A property comes back with its level's members
>
> Properties add no levels. Their columns are added to the query that
> reads the level's members: Customer Name's members come back in one
> statement with CUSTOMERNUMBER, CONTACTFIRSTNAME, CONTACTLASTNAME and
> PHONE beside them, grouped by all of them.
>
> That grouping is why a property needs exactly one value per member.
> Put PRODUCTDESCRIPTION on the Line level and every description becomes
> a member of its own: the 7 product lines turn into 94 rows of "Classic
> Cars", "Motorcycles" and so on, each carrying its whole line's total.
>
> **Why it matters:** on the Name level each product has one
> description, so the 7 lines stay 7.

4. Select **File > Save**.

> **Success:** Checkpoint: **Products** holds **Line**, **Name** and **Table: PRODUCTS**, and **Name** holds **Description**, **Code** and **Vendor**.

### 5. TIME

> **Note:**
>
> #### TIME, a Shared Dimension
>
> Some dimensions, such as Time, are used by several cubes. A shared dimension is defined once, at schema level. Because it belongs to no cube, it names its own table; each cube that uses it adds a **Dimension Usage** with the foreign key of its own fact table. When the hierarchy's relation is a join, the usage must also say which table in the join holds that key, usually the first.

This example shares a CUSTOMERS dimension between two cubes, joined through `ORDERFACT.CUSTOMERNUMBER` in one and `WAREHOUSEFACT.WAREHOUSE_CUSTOMERNUMBER` in the other:

```xml
<Dimension name="CUSTOMERS">
<Hierarchy hasAll="true" primaryKey="CUSTOMERNUMBER">
<Table name="CUSTOMER_W_TER"/>
<Level name="TERRITORY" column="TERRITORY" uniqueMembers="true"/>
</Hierarchy>
</Dimension>

<Cube name="Classic Models">
<Table name="ORDERFACT"/>
...
<DimensionUsage name="CUSTOMERS" source="CUSTOMERS" foreignKey="CUSTOMERNUMBER"/>
</Cube>

<Cube name="Warehouse">
<Table name="WAREHOUSEFACT"/>
...
<DimensionUsage name="CUSTOMERS" source="CUSTOMERS" foreignKey="WAREHOUSE_CUSTOMERNUMBER"/>
</Cube>
```

1. Right-click **Schema** and select **Add Dimension**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_dimension_time_menu.png" alt="Schema Workbench context menu on Schema, with Add Dimension highlighted" width="800">
<figcaption>A dimension at schema level</figcaption>
</figure>
</div>

2. Set the dimension's attributes. A shared dimension has no **foreignKey**: each cube supplies its own.

| Attribute | Value         |
| --------- | ------------- |
| **name** | `TIME` |
| **type** | TimeDimension |

<div align="center">
<figure>
<img src="../_assets/images/extended_dimension_time_attributes.png" alt="The new shared TIME dimension selected under Schema: name TIME, no foreignKey, type TimeDimension; the message reads that Hierarchy New Hierarchy 0 is invalid" width="800">
<figcaption>The shared dimension's attributes</figcaption>
</figure>
</div>

3. Expand **TIME**, right-click **New Hierarchy 0** and select **Add Table**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_table_time_menu.png" alt="Schema Workbench context menu on the TIME dimension's New Hierarchy 0, with Add Table highlighted" width="800">
<figcaption>Add the dimension's table</figcaption>
</figure>
</div>

4. Set the table's attributes:

| Attribute | Value |
| --------- | ----- |
| **schema** | `PUBLIC` |
| **name** | `DIM_TIME` |

<div align="center">
<figure>
<img src="../_assets/images/extended_table_dim_time.png" alt="The table of New Hierarchy 0 under TIME selected: schema PUBLIC, name DIM_TIME" width="800">
<figcaption>The dimension's table</figcaption>
</figure>
</div>

5. Select **New Hierarchy 0** and set its attributes:

| Attribute     | Value     |
| ------------- | --------- |
| **name** | `Time` |
| **hasAll** | selected |
| **allMemberName** | `All Years` |
| **primaryKey** | `TIME_ID` |

<div align="center">
<figure>
<img src="../_assets/images/extended_hierarchy_time.png" alt="The Time hierarchy selected: hasAll selected, allMemberName All Years, primaryKey TIME_ID, visible selected" width="800">
<figcaption>The Time hierarchy</figcaption>
</figure>
</div>

6. For each row of this table, in order, right-click **Time**, select **Add Level**, and set the level's attributes. Each level is **type** String and **hideMemberIf** Never.

| name | column | ordinalColumn | uniqueMembers | levelType |
| ---- | ------ | ------------- | ------------- | --------- |
| `Years` | `YEAR_ID` | | selected | TimeYears |
| `Quarters` | `QTR_NAME` | `QTR_ID` | cleared | TimeQuarters |
| `Months` | `MONTH_NAME` | `MONTH_ID` | cleared | TimeMonths |

<div align="center">
<figure>
<img src="../_assets/images/extended_level_quarters.png" alt="The Quarters level of the Time hierarchy selected, between Years and Months: column QTR_NAME, ordinalColumn QTR_ID, type String, uniqueMembers cleared, levelType TimeQuarters, hideMemberIf Never" width="800">
<figcaption>The Quarters level, ordered by QTR_ID</figcaption>
</figure>
</div>

7. Add an **Annotations** node to each level and, under it, one **Annotation** with **name** `AnalyzerDateFormat` and this **cdata**:

| Level | cdata |
| ----- | ----- |
| **Years** | `[yyyy]` |
| **Quarters** | `[yyyy].['QTR'q]` |
| **Months** | `[yyyy].['QTR'q].[MMM]` |

<div align="center">
<figure>
<img src="../_assets/images/extended_shared_dimension_time.png" alt="Schema Workbench with the shared TIME dimension under Schema selected: name TIME, no foreignKey, type TimeDimension; the tree shows its Time hierarchy with the Years, Quarters and Months levels and the DIM_TIME table" width="710">
<figcaption>The finished shared TIME dimension</figcaption>
</figure>
</div>

8. Right-click **Sales_FY2003_2005** and select **Add Dimension Usage**. Its icon differs from a dimension's: it points at a shared dimension.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_dimension_usage_menu.png" alt="Schema Workbench context menu on the Sales_FY2003_2005 cube, with Add Dimension Usage highlighted; the shared TIME dimension sits below the cube" width="800">
<figcaption>Add Dimension Usage</figcaption>
</figure>
</div>

9. Set the usage's attributes:

| Attribute  | Value   |
| ---------- | ------- |
| **name** | `TIME` |
| **foreignKey** | `TIME_ID` |
| **source** | `TIME` |

<div align="center">
<figure>
<img src="../_assets/images/extended_time_shared_dimension.png" alt="Schema Workbench with the TIME dimension usage selected in the Sales_FY2003_2005 cube, showing foreignKey TIME_ID and source TIME" width="800">
<figcaption>TIME - the cube's dimension usage</figcaption>
</figure>
</div>

10. Select **File > Save**.

> **Success:** Checkpoint: **TIME** sits at schema level with **Years**, **Quarters**, **Months** and **Table: DIM_TIME**, and the cube holds a **TIME** dimension usage with **foreignKey** `TIME_ID` and **source** `TIME`.

11. Select **View > View XML**, check the `<DimensionUsage source="TIME" ...>` element inside the cube, and select **View > View XML** again to hide it.

> **Under the hood:**
>
> #### One TIME definition, joined through each cube's foreign key
>
> The shared dimension names its table (DIM_TIME) and primary key
> (TIME_ID) once, at schema level. The DimensionUsage supplies the other
> half: the fact table's foreign key, TIME_ID on ORDERFACT. Sales by
> Years then joins `ORDERFACT.TIME_ID = DIM_TIME.TIME_ID` and groups by
> YEAR_ID: 3,677,384 for 2003, 4,987,740 for 2004 and 1,980,825 for
> 2005.
>
> A second cube over another fact table reuses the same definition with
> its own foreign key, so every cube agrees on what a year and a quarter
> are.
>
> **Why it matters:** a fix to TIME is a fix everywhere.

### 6. Degenerate

> **Note:**
>
> #### ORDER STATUS, a Degenerate Dimension
>
> A star dimension has one dimension table and a snowflake dimension two or more; a degenerate dimension has none. All the columns that describe it live in the fact table. Order status suits it: a handful of values, nothing more to describe them, and a dimension table would only add a join.

1. Right-click **Sales_FY2003_2005** and select **Add Dimension**.

<div align="center">
<figure>
<img src="../_assets/images/extended_add_dimension_order_status_menu.png" alt="Schema Workbench context menu on the Sales_FY2003_2005 cube, with Add Dimension highlighted" width="800">
<figcaption>Add the ORDER STATUS dimension</figcaption>
</figure>
</div>

2. Set the dimension's attributes. It has no **foreignKey**: its column is in the fact table itself.

| Attribute  | Value       |
| ---------- | ----------- |
| **name** | `ORDER STATUS` |
| **type** | StandardDimension |

<div align="center">
<figure>
<img src="../_assets/images/extended_dimension_order_status_attributes.png" alt="The ORDER STATUS dimension selected: name ORDER STATUS, no foreignKey, type StandardDimension, visible selected" width="800">
<figcaption>The dimension's attributes</figcaption>
</figure>
</div>

3. Expand **ORDER STATUS**, select **New Hierarchy 0**, and set its attributes. It gets no table.

| Attribute     | Value            |
| ------------- | ---------------- |
| **name** | `Status` |
| **hasAll** | selected |
| **allMemberName** | `All Status` |

<div align="center">
<figure>
<img src="../_assets/images/extended_hierarchy_status.png" alt="The Status hierarchy of ORDER STATUS selected: hasAll selected, allMemberName All Status, no primaryKey and no table" width="800">
<figcaption>The Status hierarchy</figcaption>
</figure>
</div>

4. With **Status** selected, select **Add Level** on the toolbar. The right-click menu keeps **Add Level** unavailable for a hierarchy without a table.

<div align="center">
<figure>
<img src="../_assets/images/extended_order_status_degenerate_dimension.png" alt="Schema Workbench toolbar with the Add Level button outlined in red, between the Add Measure and Add Property buttons" width="449">
<figcaption>Add Level on the toolbar</figcaption>
</figure>
</div>

5. Set the level's attributes:

| Attribute     | Value    |
| ------------- | -------- |
| **name** | `Type` |
| **column** | `STATUS` |
| **type** | String |
| **uniqueMembers** | selected |
| **levelType** | Regular |
| **hideMemberIf** | Never |

<div align="center">
<figure>
<img src="../_assets/images/extended_dimension_order_status.png" alt="Schema Workbench with the finished ORDER STATUS dimension selected: name ORDER STATUS, no foreignKey, type StandardDimension; the tree shows its Status hierarchy with one level, Type, and no table" width="710">
<figcaption>The finished ORDER STATUS dimension</figcaption>
</figure>
</div>

6. Select **File > Save**.

> **Success:** Checkpoint: **ORDER STATUS** shows no red cross, and its **Status** hierarchy holds the **Type** level and no **Table** node.

### 7. Measures

> **Note:**
>
> #### Add the Quantity Measure
>
> Quantity sums the units ordered, which the distinct-count Quantity Ordered measure from Standard Model doesn't. Workshop 09 divides Sales by it in a calculated member.

1. Right-click **Quantity Ordered** and select **Delete**.
2. Right-click **Sales_FY2003_2005**, select **Add Measure**, and set the measure's attributes:

| Attribute    | Value           |
| ------------ | --------------- |
| **name** | `Quantity` |
| **aggregator** | sum |
| **column** | `QUANTITYORDERED` |
| **formatString** | `#,###` |
| **datatype** | Numeric |

<div align="center">
<figure>
<img src="../_assets/images/extended_measure_quantity.png" alt="Schema Workbench with the Quantity measure selected: aggregator sum, column QUANTITYORDERED, formatString #,###, datatype Numeric, visible selected" width="710">
<figcaption>The Quantity measure</figcaption>
</figure>
</div>

3. Select **File > Save**.

> **Success:** Checkpoint: no red cross anywhere in the schema. The cube holds **Table: ORDERFACT**, **MARKETS**, **CUSTOMERS**, **PRODUCTS**, **ORDER STATUS**, **TIME**, **Sales** and **Quantity**.

### 8. Publish & Test

> **Note:**
>
> #### Publish the Schema and Test It
>
> Save before every change you publish: a saved file per version keeps the schema's history and helps you trace a problem to the change that caused it.

1. Select **File > Publish**.
2. In the **Publish Schema** dialog, make sure the fields hold the values from [Basic Model](../05-schemas-basic-model/guide.md): **Server URL** `http://localhost:8080/pentaho/`, **User** `admin`, **Password** `password` and **Pentaho or JNDI Data Source** `hsqldb_sampledata`.

<div align="center">
<figure>
<img src="../_assets/images/sw_publish_schema.png" alt="Schema Workbench Publish Schema dialog: server URL http://localhost:8080/pentaho/, user admin, a masked password, data source hsqldb_sampledata, with Register XMLA Data Source and Remember these Settings selected" width="351">
<figcaption>The Publish Schema dialog, filled in</figcaption>
</figure>
</div>
3. Select **Publish**. If Schema Workbench asks whether to overwrite the Miniature Models schema you published in Standard Model, select **Yes**.

> **Success:** Checkpoint: a **Publish** message reads `Publish Successful`.

4. Select **OK**.

<button data-launch="puc">Open Pentaho User Console</button>

5. In the User Console, signed in as `admin`, select **Tools > Refresh > Mondrian Schema Cache**.
6. On the **Home** perspective, select **Create New > Analysis Report**.
7. In the **Select Data Source** dialog, select **Miniature Models: Sales_FY2003_2005** and select **OK**.
8. Drag **Sales** to the **Measures** drop zone.
9. Drag **Territory**, then **Line**, to the **Rows** drop zone.
10. Drag **Years** to the **Columns** drop zone.

<div align="center">
<figure>
<img src="../_assets/images/extended_analyzer_report.png" alt="Analyzer table on the Sales_FY2003_2005 cube showing Sales by Territory and product Line in rows, with one column per year" width="654">
<figcaption>Sales by Territory, Line and Year</figcaption>
</figure>
</div>

> **Success:** Checkpoint: 28 rows and 3 columns, one per year. The first row is APAC, Classic Cars: £115,010.77 in 2003, £199,371.69 in 2004 and £97,573.84 in 2005.

11. Optionally, if the machine is connected to the internet, try a Geo Map: change the report to a Geo Map chart, with **Territory** in **Geography** and **Sales** in **Color By**.

<div align="center">
<figure>
<img src="../_assets/images/extended_geo_map_geo_annotations.png" alt="Analyzer world Geo Map with one marker per territory colored by Sales, and a tooltip showing EMEA sales for 2003, 2004 and 2005" width="800">
<figcaption>Geo Map by Territory</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/extended_geo_map.png" alt="Analyzer Geo Map of Europe colored by Sales, drilled to countries, with a tooltip over Belgium showing 2005 sales by product line" width="800">
<figcaption>Drilled to Country</figcaption>
</figure>
</div>

12. Close the report without saving it.

::::

## Lab Files

Click a file to download. Every file is also on disk in this workshop's folder, `C:\Workshop-SW-Associate\04-extend-model\08-extend-model-extended-model`: open a schema in Schema Workbench with **File > Open**.

_No starting files: this workshop extends your schema from [Standard Model](../06-schemas-standard-model/guide.md)._

### Solution <!-- no-step -->

The extended schema. Open it in Schema Workbench (**File > Open**) alongside your own to compare, or publish it to see the expected result. It also holds the Unit Price calculated member that workshop 09 adds.

Also on disk at `C:\Workshop-SW-Associate\04-extend-model\08-extend-model-extended-model\solution`.

[miniaturemodels-extended.xml](./files/solution/miniaturemodels-extended.xml)
