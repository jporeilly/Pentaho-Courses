# Data Sources Reference

> **Note:**
>
> Reference material from the course manual (Appendix A).

## Appendix A – Data Sources

## Creating Queries with a Metadata Data Source

You must have a report file open in order to proceed, and your data source must be accessible before you can connect to it in Report Designer.

Follow this procedure to add a Metadata data source in Report Designer.

* Select the **Data** tab in the upper right pane.
By default, Report Designer starts in the Structure tab, which shares a pane with Data.

* Select the yellow cylinder icon in the upper left part of the **Data** pane, or right-click **Data Sets**.
A drop-down menu with a list of supported data source types will appear.

* Select **Metadata** from the drop-down menu.
The Metadata Data Source Editor window will appear.

<div align="center">
<figure>
<img src="../_assets/images/refa-01.png" alt="Metadata Data Source Editor, Data Source tab: an empty XMI File field with a Browse button, the Domain Id / BI-Server Solution Name field, an empty Available Queries list, Query Name, and an empty Static Query editor" width="345">
<figcaption>The empty Metadata Data Source Editor: the XMI file comes first, then the domain and the queries</figcaption>
</figure>
</div>

* Select **Browse**, navigate to your XMI metadata definition file, then select **Open**.
* Select the round green **+** icon to add a query, then type in a name for the new query in the **Query Name** field.
* Type in the name of the solution directory this metadata file pertains to into the Domain Id field.
If this XMI file was created with Pentaho Metadata Editor, then the domain ID has to be the root directory for this solution -- the directory one level above pentaho-solutions, typically.

If you created this XMI with Pentaho Data Integration, then the domain ID must be set to the full solution path to the XMI, which would be something like this:

/example-solution/resources/metadata/mymeta.xmi.

If the domain ID is not properly defined, you will be able to preview the report, but you will not be able to publish it to the Pentaho Server.

* Select the pencil icon on the right above the **Query** field to start Metadata Query Editor, or type in your query directly into the **Query** field.
* Select **OK** when your query is complete.
## Reference:  Connect to Metadata Datasource

## Connect to Metadata Datasource

Follow this procedure to access the Metadata data source in Report Designer.

* Select the database icon on the **Data** tab, and select **Metadata**.

<div align="center">
<figure>
<img src="../_assets/images/refa-02.png" alt="The Data tab with the data source menu open and Metadata highlighted" width="226">
<figcaption>The data source menu with Metadata highlighted</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/refa-03.png" alt="Metadata Data Source Editor with five numbered markers: 1 the XMI File set to the samples metadata.xmi under report-designer, 2 Domain Id samples, 3 the add-query icon, 4 the query Product Catalog in Available Queries and Query Name, 5 the pencil icon above the Query box" width="407">
<figcaption>A configured Metadata data source: the five settings in the order you make them</figcaption>
</figure>
</div>

Configure the Metadata Source Editor with the following details:

* Browse to find the "metadata.xmi" file for the solution you are working with.  The metadata information is always in a metadata.xmi file, which is stored in each solution folder (assuming that metadata has been prepared for the folder).

<div align="center">
<figure>
<img src="../_assets/images/refa-04.gif" alt="A small red warning icon" width="16">
<figcaption>Warning: the Domain Id value is critical</figcaption>
</figure>
</div>

Domain Id value is critical

The "Domain Id / BI-Server Solution Name" is always the name of the folder that your report will be stored in when it is delivered.  That's also the folder that contains the metadata.xmi file.  If you are delivering your report on a server, you must use the name of the folder on the server.  So that you can test your report on a locally hosted Pentaho User Console you should use the same folder name locally.

Each metadata data source can hold multiple queries.  The metadata is shared between all queries. You can use meaningful names for the queries in the metadata source.

* To create a new query, select the green **+** in the upper right corner next to the **Available Queries** box. A new query named "Query1" gets added to the list of available queries.
* Change this to: Product Catalog.
* Select this query name, then select the pencil (edit) icon.
## Creating Queries with Metadata Query Editor

You must be in the Metadata Data Source Editor window to follow this process. You should also have established and tested a metadata data source connection.

Follow this process to design a metadata query:

The Metadata Query Editor window will appear. If the pencil icon is grayed out, your data source is misconfigured.

<div align="center">
<figure>
<img src="../_assets/images/refa-05.png" alt="Metadata Query Editor: Business Domains samples, Business Models Inventory, five Products columns in Selected Columns, and Product Line, Product Vendor and Product Code in Order By, all ascending" width="800">
<figcaption>The query editor with the selected columns and the sort order filled in</figcaption>
</figure>
</div>

* Select ‘samples’ from the **Business Domains** drop-down box in the upper left.
* Select ‘Inventory’ from the **Business Models** drop-down box.
* From Products Table, select the following fields:
* Product Line
* Product Vendor
* Product Code
* Product Name
* Product Scale
then select the arrow next to the **Selected Columns** box.

You can select multiple columns by holding down `Ctrl` while you select them.

* Repeat the above process for the column you want to order your results by, moving a column into the **Order By** box.
* Product Line
* Product Vendor
* Product Code
* Select **OK** to finalize the query.
You will return to the data source configuration window. Your newly formed query should appear in the Query field.

This field is editable, so you can modify the query before continuing.

* Select **OK** to close the **Metadata Data Source Editor**.
You now have a data source and at least one query that will return a data set that you can use for reporting.

<div align="center">
<figure>
<img src="../_assets/images/refa-06.png" alt="The Data tab tree: Data Sets, Metadata, and the Product Catalog query with five fields (Product Line, Product Vendor, Product Code, Product Name, Product Scale), followed by Functions, the Environment env:: fields and Parameters" width="400">
<figcaption>The new query's fields appear under Data Sets on the Data tab</figcaption>
</figure>
</div>

## Creating Queries with OLAP Data Source

Pentaho Report Designer is typically used with raw data sources, or with databases that have a metadata layer through a tool like Pentaho Metadata Editor. However, you can also use an MDX query to retrieve a data set from a multidimensional database. The sections below explain how to set up a Pentaho Analysis data source and add an MDX query in Pentaho Report Designer.

You must have a report file open in order to proceed, and your data source must be accessible before you can connect to it in Report Designer. You may need to obtain database connection information from your system administrator, such as the URL, port number, JDBC connection string, database type, and user credentials.

## Reference:  Connect to an OLAP Datasource

## Connect to SampleData (Hypersonic) Database

Follow this procedure to add a Pentaho Analysis (Mondrian) data source.

* Select the **Data** tab in the upper right pane. By default, Report Designer starts in the Structure tab, which shares a pane with Data.
* Select the yellow cylinder icon in the upper left part of the **Data** pane, or right-click **Data Sets**. A drop-down menu with a list of supported data source types will appear.
* Select **OLAP** from the drop-down menu, then select the following: **Pentaho Analysis (Denormalized)**.
* The Mondrian Datasource Editor window will appear.
* If you want to provide parameters that contain different Mondrian connection authentication credentials, select **Edit Security** in the upper left corner of the window, then type in the fields or variables that contain the user credentials you want to store as a parameter with this connection. The role, username, and password will be available as a security parameter when you are creating your report.
* Select **Browse** and navigate to your Mondrian schema XML file:
C:\Pentaho-Training\BA-2000\datasources\mondrian\ steelwheelssales.mondrian.xml

* Select **Open**.
* To configure a connection:
* Above the **Connections** pane on the left, select the round green **+** icon to add a new data source.
* Select your database brand from the Connection Type list
* Select the access type in the Access list at the bottom
* Type in your database connection details into the fields in the Settings section on the right.
The Access list will change according to the connection type you select; the settings section will change depending on which item in the access list you choose.

Select **Test** to ensure that the connection settings are correct. If they are not, the ensuing error message should give you some clues as to which settings need to be changed. If the test dialog says that the connection to the database is OK, select **OK** to complete the data source configuration.

* If you installed the Pentaho sample data, several SampleData entries will appear in the list. You must have HSQLDB to view the sample data.
* Select **SampleData (Hypersonic)**
* In the subsequent **Database Connection** dialog, type in a concise but reasonably descriptive name for this connection in the Connection Name field:
## Quantity of Products by Country

Now that your data source is configured, you must enter an MDX query before you can finish adding the data source. You can also create a dynamic query through scripts.

<div align="center">
<figure>
<img src="../_assets/images/refa-07.png" alt="Pentaho Analysis Data Source (Denormalized) dialog: schema file steelwheels.mondrian.xml, logical schema SteelWheels, the SampleData (Hypersonic) connection selected, and the query Quantity of Products by Country with its MDX in the Static Query box" width="491">
<figcaption>The OLAP data source with its schema file, connection and MDX query in place</figcaption>
</figure>
</div>

Here’s the MDX Query:

## SELECT

NON EMPTY {[Product].[Line].Members} ON COLUMNS,

## NON EMPTY CrossJoin(

{[Markets].[Country].Members},

## {[Measures].[Quantity]}) ON ROWS

## FROM [SteelWheelsSales]

## Creating Queries with XML Data Source

An XML data source uses an XML file to provide the dataset. The XML structure is not flat like a table, there are not rows and columns, it is more similar to a tree, where we can have several levels of data. For this reason it is necessary to use an XPath query to identify which nodes of the XML document must be considered as records.

## Reference:  Connect to an XML Datasource

## Connect to XML Datasource

Imagine in the report, we want to list all the orders, showing for each person the order status, the order date and value. Each record can be identified with the XML node labeled "orders". The selection of these specific xml tags is done with an XPath query:

## /document/order

XPath is a query language that selects data in an XML file. In this case the expression will select all the nodes of type "order" attributes of "document". The result from the data source perspective will be a set of records.

<div align="center">
<figure>
<img src="../_assets/images/refa-08.png" alt="The orders XML file in a text editor: a document element holding order elements, each with productline, customer, status, date and value" width="364">
<figcaption>Each order element becomes one record when the XPath selects /document/order</figcaption>
</figure>
</div>

The XPath query can be defined inside the report, Report Designer will execute the XPath query to select the nodes / attributes. The advantage of keeping the XPath query inside the report is that we can use parameters to make the query dynamic.

You must have a report file open to proceed, and your data source must be accessible before you can connect to it in Report Designer. For database connections, you may need to first obtain necessary information from your system administrator, such as the URL, port number, JDBC connection string, database type, and user credentials.

Follow this procedure to add a data source in Report Designer.

Select the **Data** tab in the upper left pane. By default, Report Designer starts in the Structure tab, which shares a pane with Data.

Select the yellow cylinder icon in the upper left part of the **Data** pane, or right-click **Data Sets**. A drop-down menu with a list of supported data source types will appear.

Select **XML** from the drop-down menu. The XML Datasource Editor window will appear.

* Select **Browse** and navigate to your XML file:
**File:** `C:\Pentaho-Training\BA-2000\datasources\xml\orders.xml`

Select the round green **+** icon above the **Available Queries** field.

Enter: ‘orders’ into the **Query Name** field.

<div align="center">
<figure>
<img src="../_assets/images/refa-09.png" alt="XML Data Source Editor: XML File set to the orders.xml file, one query named Orders selected in Available Queries, Query Name Orders, and the query document/order" width="297">
<figcaption>The XML data source with the Orders query and its XPath</figcaption>
</figure>
</div>

Enter the XQuery: document /order into the **Query** field, then select **Preview** to ensure that it is valid.

Select **OK** when your query is in order.

## Reference:  Writing a SQL Query

## Connecting to a Data Source

The first step in creating a new report is connecting to a data source.

* From the **Welcome** screen, select **New Report**. If it is not visible, select **Help > Welcome**.
* Select **Data > Add Datasource > JDBC**.
* In the **JDBC Data Source** window, from the **Connections** list, select **SampleData**.
## Write SQL Query

Territory, Country, Customer Name, Product Line, Order Number, and Total Price:

* To add a query, in the **JDBC Data Source** window, select the Add Query icon to the right of **Available Queries**.
* To open the SQL Query Designer window, select the pencil icon to the right of **Query**.
* To add the Customer with Territory table to the query, from the list of tables, double-click CUSTOMER_W_TER.
* To add the Order Fact table to the query, from the list of tables, double-click ORDERFACT.
To join the CUSTOMER_W_TER with ORDERFACT table to the Order Fact table:

* Join on CUSTOMERNUMBER
From the CUSTOMER_W_TER table, select only:

* CUSTOMERNAME
COUNTRY

TERRITORY

From the ORDERFACT table, select only:

ORDERNUMBER

PRODUCTCODE

* TOTALPRICE
Sort (order-by) the results by:

CUSTOMER_W_TER.TERRITORY

CUSTOMER_W_TER.COUNTRY

* CUSTOMER_W_TER.CUSTOMERNAME
* Close the SQL Query Designer window
To view the query and available fields:

Select the **Data** tab.

Double-click Data Sets.

Expand JDBC: SampleData (hypersonic).

* Expand Query 1.
* To save the report, on the toolbar, select **Save**, and then save the report to the desktop or a local folder as Training Exercise Report 3-1.
## Transformations

A Pentaho Data Integration transformation to obtain driving directions from MapQuest has already been created.

In this demonstration we will not create a new transformation, but we will review the existing transformation.

For more information on using Data Integration, see course DI1000: Pentaho Data Integration.

* From the Windows task bar, select **Start > All Programs > Pentaho Enterprise Edition > Design Tools > Data Integration**.
* To close the **Repository Connection** dialog, select **Cancel**. Do not connect to a repository.
* To open the existing transformation:
* Select **File > Open**.
* Navigate to \pentahotraining\BA2000\transformations.
* Select `get_directions_from_mapquest_service.ktr`.
* Select **Open**.

<div align="center">
<figure>
<img src="../_assets/images/refa-10.png" alt="Pentaho Data Integration transformation canvas with four steps in a row: Add Variable Values for Service Parameters, Add Constant Values for Service Parameters, HTTP client, and Parse Result XML to Dataset Rows" width="579">
<figcaption>The four steps of the driving directions transformation</figcaption>
</figure>
</div>

To retrieve directions from this service, the following values are required:

* key: A unique key to authorize use of the routing service.
* from: The starting location of a route request.
* to: The ending location of a route request.
* outFormat: The format the directions must be returned as either JSON or XML.
The transformation consists of 4 steps:

* The first step parameterizes the From and To addresses.
* The second step uses constants for additional service inputs.
* The third step calls the service for directions.
* The fourth step breaks down the XML into tabular results.
## Transformation Properties

The route – from and to addresses – have been set as named parameters.

* Double-click on the canvas, and select the Parameters tab.

<div align="center">
<figure>
<img src="../_assets/images/refa-11.png" alt="Transformation properties dialog, Parameters tab: fromAddress and toAddress, each with a street address as its default value" width="404">
<figcaption>The start and end of the route are named parameters with default addresses</figcaption>
</figure>
</div>

## Get Variables

This step allows you to get the value of a variable. This step can return rows or add values to input rows.

Note: You must specify the complete variable specification in the format ${variable}

Or  %%variable%% (as described in Variables) .

That means you can also enter complete strings in the variable column, not only a variable.

<div align="center">
<figure>
<img src="../_assets/images/refa-12.png" alt="Get Variable step named Add Variable Values for Service Parameters: field to takes ${toAddress} and field from takes ${fromAddress}, both of type String" width="401">
<figcaption>Get Variable copies the two parameters into the to and from fields</figcaption>
</figure>
</div>

This step retrieves the values for the to and from  data stream fields.

## Add Constants

The Add constant values step is a simple and high performance way to add constant values to the stream.

<div align="center">
<figure>
<img src="../_assets/images/refa-13.png" alt="Add constant values step named Add Constant Values for Service Parameters: one field, outFormat, of type String with the value xml" width="732">
<figcaption>One constant: outFormat set to xml</figcaption>
</figure>
</div>

This step adds the outFormat field and sets the value to xml.

## HTTP Client

The HTTP client step performs a simple call to a base URL with options appended as shown below:

http://<URL>?param1=value1&param2=value2&..

The result is stored in a String field with the specified name.

<div align="center">
<figure>
<img src="../_assets/images/refa-14.png" alt="HTTP Client step, General tab: the URL field holds the MapQuest directions route address, Encoding is UTF-8, and Result field name is directions_result" width="664">
<figcaption>The service response lands in the directions_result field</figcaption>
</figure>
</div>

The step queries the URL, and returns the results in the stream field: directions_result

## Parse Result XML

This step provides the ability to read data from any type of XML file using XPath specifications.

Uses the directions_result field as an xml datasource.

<div align="center">
<figure>
<img src="../_assets/images/refa-15.png" alt="Get XML Data step named Parse Result XML to Dataset Rows, File tab: XML source is defined in a field is selected, and the source field is directions_result" width="470">
<figcaption>The XML comes from the directions_result field, not from a file</figcaption>
</figure>
</div>

Based on the XPath, populates the fields:

<div align="center">
<figure>
<img src="../_assets/images/refa-16.png" alt="Get XML Data step, Fields tab: distanceToTravel from distance, route from narrative, totalDistance from ../../distance and totalTime from ../../formattedTime" width="470">
<figcaption>Each output field and the XPath that fills it</figcaption>
</figure>
</div>

Exit Pentaho Data Integration.

## Configuring the Report

In this part of the demonstration we will open an existing report and add parameters for the ‘From’ address and ‘To’ address.

* Open the existing driving directions report:
* Select **File > Open**.
* Navigate to \pentahotraining\BA2000\reports.
* Select `Driving Directions.prpt`.
* Select **Open**.
Notice the report consists of several label elements and an image, but there is no data source defined.

* From the **Data** tab, right-click **Parameters**, and then select **Add Parameter...**.
Complete the following fields in the Add Parameter window, and then select **OK**.

* From the **Data** tab, right-click **Parameters**, and then select **Add Parameter...**.
Complete the following fields in the Add Parameter window, and then select **OK**.

## Pentaho Data Integration as a Datasource

* Select **Data > Add Datasource > Pentaho Data Integration**.

<div align="center">
<figure>
<img src="../_assets/images/refa-17.png" alt="The Data tab with the data source menu open and Pentaho Data Integration highlighted" width="228">
<figcaption>The data source menu with Pentaho Data Integration highlighted</figcaption>
</figure>
</div>

* In the Pentaho Data Integration Data Source window:
* Select the **Add a new query** button.
* Rename Query: Directions
* Browse to: get_directions_from_mapquest_service.ktr
* Select: Parse Result XML to Dataset Rows
* Select **Edit Parameter**.

<div align="center">
<figure>
<img src="../_assets/images/refa-18.png" alt="Pentaho Data Integration Data Source dialog with five numbered markers: 1 the add-query icon, 2 Name Directions, 3 File get_directions_from_mapquest_service.ktr with Browse, 4 the step Parse Result XML to Dataset Rows selected in the Steps list, 5 the Edit Parameter button" width="624">
<figcaption>The Pentaho Data Integration query: the transformation file and the step whose rows the report reads</figcaption>
</figure>
</div>

* To map the transformation parameters:
* Click in the Value field for the fromAddress, and then from the drop-down list, select FromParam.
* Click in the Value field for the toAddress, and then from the drop-down list, select ToParam.
* Select **OK**.

<div align="center">
<figure>
<img src="../_assets/images/refa-19.png" alt="Parameter mapping dialog, Parameter tab: fromAddress has the value FromParam and toAddress has the value ToParam" width="459">
<figcaption>Each transformation parameter takes its value from a report parameter</figcaption>
</figure>
</div>

## Create the Report

The data tab shows the fields available from the Pentaho Data Integration data source. Use the fields to build and publish the report.

* On the **Data** tab, expand **Data Sets > Pentaho Data Integration > Directions**.

<div align="center">
<figure>
<img src="../_assets/images/refa-20.png" alt="The Data tab tree: the Pentaho Data Integration data set with the Directions query and its eight String fields (to, from, outFormat, directions_result, distanceToTravel, route, totalDistance, totalTime), and the parameters FromParam and ToParam" width="299">
<figcaption>The transformation's output fields, ready to drag onto the canvas</figcaption>
</figure>
</div>

* Drag the from, to, route, distanceToTravel, totalDistance, and totalTime fields to the canvas as shown below. Use your knowledge to align the report elements and right-justify the distanceToTravel, totalDistance, and totalTime elements.

<div align="center">
<figure>
<img src="../_assets/images/refa-21.png" alt="Report canvas for Driving Directions: the title and a map image, from and to fields in the report header, route and distanceToTravel in the details band, and totalDistance and totalTime in the report footer, right-aligned" width="780">
<figcaption>The layout: one route row per direction, with the totals in the footer</figcaption>
</figure>
</div>

* Type the following parameter values, and then select **Update**:
* Resize the Elements to read information.
* Preview and Save the Report: Training Demo Report 10 – Pentaho Data Integration

<div align="center">
<figure>
<img src="../_assets/images/refa-22.png" alt="Preview of the Driving Directions report: the From and To addresses, then rows of turn-by-turn directions, each with its distance" width="771">
<figcaption>The preview: one row per direction returned by the service</figcaption>
</figure>
</div>
