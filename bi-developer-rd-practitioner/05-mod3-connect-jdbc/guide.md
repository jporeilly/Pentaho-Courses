# Connect to a JDBC Data Source

> **Warning:**
>
> #### Workshop - Connect to a JDBC Data Source
>
> Create a JDBC connection to the sample database and build the query your first report will use.
>
> **What you'll do**
>
> * Create a JDBC connection to the sample database.
> * Build and test the query that will drive your report.
> * Preview the rows the data source returns.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Connect to a JDBC Data Source**
>
> Create a JDBC connection to the sample database and build the query your first report will use.

## Connect to SampleData (Hypersonic) Database

Follow this procedure to access the SampleData JDBC data source in Report Designer.

* From the menu, select Data > Add Datasource > JDBC.
![Connect to SampleData (Hypersonic) Database](../_assets/images/mod3-04.png)

Or click on the Database icon.

![Connect to SampleData (Hypersonic) Database](../_assets/images/mod3-05.png)

* Select the SampleData
![Connect to SampleData (Hypersonic) Database](../_assets/images/mod3-06.png)

## SQL Query Designer

You must be in the JDBC Data Source window to follow this process. You should also have configured and tested a JDBC data source connection.

SQL Query Designer does not work with Hadoop Hive data sources.

Follow this process to design an SQL query for your data source with SQL Query Designer:

* Select your data source in the Connections pane on the left,
* Click the round green + icon above the Available Queries pane on the right (this is the + button in the upper right corner of the window).
![SQL Query Designer](../_assets/images/mod3-07.png)

* Type descriptive name for this query in the Query Name field: Products
* Click the pencil icon above the upper right corner of the Query field.
In this part of the guided demonstration you will create a query to return fields from the Products, Order Fact, and Customer with Territory tables, sorted by Product Line, Territory, and Customer Name.

* Ensure the PUBLIC Schema is selected, and double-click on the PRODUCTS table.
![SQL Query Designer](../_assets/images/mod3-08.png)

* In the lower left pane, click to select PRODUCTS table you want to select data from, then double-click it to move it to the query workspace.
The table you selected will appear in the workspace as a sub-window containing all of the Table’s Fields.

* Check all of the rows you want to include in the query.
By default, all Fields are selected. If you only want to select a few rows (or a single row), click the table name at the top of the sub-window, then click deselect all in the popup menu, then check only the rows you want to include in your query.

* Repeat the previous step and add the ORDERFACT table.
![SQL Query Designer](../_assets/images/mod3-09.png)

* To view the join details, on the join path, double-click the red square.
![SQL Query Designer](../_assets/images/mod3-10.png)

You can create an SQL JOIN between tables by selecting a reference key in one table, then dragging it to the appropriate row in another table.

* Add the Customer with Territory table to the query, from the list of tables, double-click CUSTOMER_W_TER.
![SQL Query Designer](../_assets/images/mod3-11.png)

* To join the Customer with Territory table to the Order Fact table:
* In the CUSTOMER_W_TER table, click CUSTOMERNUMBER and hold the left mouse button.
* Drag CUSTOMERNUMBER onto CUSTOMERNUMBER in the ORDERFACT table and release the mouse button.
![SQL Query Designer](../_assets/images/mod3-12.png)

* By default, all the fields from the selected tables are included in the SELECT statement:
* To deselect the Product Description field, in the PRODUCTS view, click the checkbox for PRODUCTDESCRIPTION.
![SQL Query Designer](../_assets/images/mod3-13.png)

* To deselect all fields in the Order Fact table, in the right pane, click the “ORDERFACT” header, and then click deselect all.
![SQL Query Designer](../_assets/images/mod3-14.png)

* From the ORDERFACT table select only:
* ORDERNUMBER
* QUANTITYORDERED
* PRICEEACH
* ORDERDATE
![SQL Query Designer](../_assets/images/mod3-15.png)

* From the CUSTOMER_W_TER table select only:
* CUSTOMERNAME
* TERRITORY
Notice in the top left pane that the SELECT statement reflects the changes made in the previous steps.

Once the fields are selected, you can specify the sort order.

* To sort the results by Product Line, in the top left pane, right-click “PRODUCTS.PRODUCTLINE” and then from the context menu select add to order-by.
![SQL Query Designer](../_assets/images/mod3-16.png)

* To change the sort from ASC to DESC:
* Double-click on the ORDER BY: “PUBLIC”.”PRODUCTS”.”PRODUCTSLINE” ASC
![SQL Query Designer](../_assets/images/mod3-17.png)

* Sort the results by Territory and Customer Name.
![SQL Query Designer](../_assets/images/mod3-18.png)

* Close the SQL Query Designer.
* Click the Preview button in the JDBC Data Source panel to view the results.
* Rename the Query: Customer Sales by Territory
* To save the report, on the toolbar, click the Save button, and then save the report to the desktop or a local folder as Demo - jdbc sql query.prpt
![SQL Query Designer](../_assets/images/mod3-19.png)

Further examples of connecting to various datasources can be found in Appendix A

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 3 jdbc sql query.prpt">Open: Solution: JDBC SQL query</button>

<button data-launch="prd" data-path="files/Training Demo Report 3 sql query.prpt">Open: Solution: SQL query</button>

<button data-launch="prd" data-path="files/Training Demo Report 3-1 metadata sql query.prpt">Open: Solution: metadata query</button>

