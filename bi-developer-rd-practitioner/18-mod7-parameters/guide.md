# Report Parameters

> **Warning:**
>
> #### Workshop - Report Parameters
>
> Add a parameter, wire it into the query, and prompt the user at run time.
>
> **What you'll do**
>
> * Add a parameter and wire it into the query.
> * Prompt the user for values at run time.
> * Preview the report with different parameter values.
>
> **Prerequisites:** Report Designer running, with the Pentaho sample data (HSQLDB) started
>
> **Estimated Time:** 15 minutes

---

> **Note:**
>
> #### **Report Parameters**
>
> Add a parameter, wire it into the query, and prompt the user at run time.

## Parameters

By adding a parameter to the report you enable the person viewing the report to select which data displays in the report.

* Open the Demo – formatting.prpt
* To create a query that produces a list of valid Product Lines, from the Data pane, double-click JDBC: SampleData.
![Parameters](../_assets/images/mod7-01.png)

![Parameters](../_assets/images/mod7-02.png)

To add a query, in the JDBC Data Source window, click the Add Query icon to the right of Available Queries.

* By default, the new query is named Query 2. For this demonstration, you will name the query prod_list. You will need to use the exact query name later.
* To write the query, in the Query pane, type:
SELECT DISTINCT PRODUCTLINE FROM PRODUCTS

* Preview and then click OK.
![Parameters](../_assets/images/mod7-03.png)

* From the Data pane, right-click Parameters, and then click Add Parameter.
![Parameters](../_assets/images/mod7-04.png)

* In the DataSources pane, click prod_list.
Complete or verify the following fields in the Add Parameter window, and then click OK.

![Parameters](../_assets/images/mod7-05.png)

Now you must add a WHERE clause to the original query to use the value from the prompt.

* To modify the original query, from the Data pane, double-click JDBC: SampleData.
* From the Available Queries, click Query 1.
* To add the WHERE clause, in the Query, above ORDER BY:
* Press Return.
* Type: WHERE productline IN (${product_var})
* Click OK.
![Parameters](../_assets/images/mod7-06.png)

* Preview and Save the report.
![Parameters](../_assets/images/mod7-07.png)

## Nested Prompts

* To create a query that produces a list of distinct Countries, from the Data pane, double-click JDBC: SampleData.
![Nested Prompts](../_assets/images/mod7-08.png)

* To add a query, in the JDBC Data Source window, click the Add Query icon to the right of Available Queries.
* To write the query, country_list, in the Query pane, type:
## SELECT DISTINCT country FROM customer_w_ter

* Preview and then click OK.
![SELECT DISTINCT country FROM customer_w_ter](../_assets/images/mod7-09.png)

* From the Data pane, right-click Parameters, and then click Add Parameter.
* In the DataSources pane, click country_list.
* Complete or verify the following fields in the Add Parameter window, and then click OK.
![SELECT DISTINCT country FROM customer_w_ter](../_assets/images/mod7-10.png)

* Now you must modify the WHERE clause to the original query to use the value from the prompt.
* To modify the original query, from the Data pane, double-click JDBC: SampleData.
* To modify the WHERE clause, in the Query, above ORDER BY:
* Press Return.
* Type: WHERE productline IN (${product_var})
* Click OK.
![SELECT DISTINCT country FROM customer_w_ter](../_assets/images/mod7-11.png)

* Preview and Save the Report: Demo - parameters prod & country.prpt
* If you have time Group by Country and add a Message to the report.
![SELECT DISTINCT country FROM customer_w_ter](../_assets/images/mod7-12.png)

You may need to resize the filter panel to view the options.

## Lab files

<button data-launch="prd" data-path="files/Training Demo Report 7 parameters.prpt">Open: Solution: parameters</button>

<button data-launch="prd" data-path="files/Training Demo Report 7 parameters prod & country.prpt">Open: Solution: cascading parameters</button>

