-- Aggregate tables for the Miniature Models cube (Sales_FY2003_2005).
-- Run against the sample data the course models:
--   jdbc:hsqldb:hsql://localhost/sampledata   pentaho_user / password
-- (the Pentaho Server must be running - it hosts the HSQLDB)
--
-- Column names are quoted to preserve the exact mixed case the
-- schema's <AggName> declarations reference.

-- ---------------------------------------------------------------
-- AGG 1: Product Line x Territory x Country
-- ---------------------------------------------------------------
DROP TABLE "Miniature_Sales_AGG_1" IF EXISTS;

CREATE TABLE "Miniature_Sales_AGG_1" (
    "PRODUCTS_Line"            VARCHAR(50),
    "CUSTOMER_W_TER_Territory" VARCHAR(50),
    "CUSTOMER_W_TER_Country"   VARCHAR(50),
    "ORDERFACT_Sales"          NUMERIC(18,2),
    "ORDERFACT_Quantity"       NUMERIC(18,0),
    "ORDERFACT_fact_count"     INTEGER
);

INSERT INTO "Miniature_Sales_AGG_1"
SELECT p.PRODUCTLINE,
       c.TERRITORY,
       c.COUNTRY,
       SUM(f.TOTALPRICE),
       SUM(f.QUANTITYORDERED),
       COUNT(*)
FROM   PUBLIC.ORDERFACT f
       JOIN PUBLIC.PRODUCTS       p ON f.PRODUCTCODE    = p.PRODUCTCODE
       JOIN PUBLIC.CUSTOMER_W_TER c ON f.CUSTOMERNUMBER = c.CUSTOMERNUMBER
GROUP BY p.PRODUCTLINE, c.TERRITORY, c.COUNTRY;

-- ---------------------------------------------------------------
-- AGG 2: Territory x Year x Quarter x Order Status
-- ---------------------------------------------------------------
DROP TABLE "Miniature_Sales_AGG_2" IF EXISTS;

CREATE TABLE "Miniature_Sales_AGG_2" (
    "CUSTOMER_W_TER_Territory" VARCHAR(50),
    "DIM_TIME_Years"           INTEGER,
    "DIM_TIME_Quarters"        VARCHAR(20),
    "ORDERFACT_Type"           VARCHAR(30),
    "ORDERFACT_Sales"          NUMERIC(18,2),
    "ORDERFACT_Quantity"       NUMERIC(18,0),
    "ORDERFACT_fact_count"     INTEGER
);

INSERT INTO "Miniature_Sales_AGG_2"
SELECT c.TERRITORY,
       t.YEAR_ID,
       t.QTR_NAME,
       f.STATUS,
       SUM(f.TOTALPRICE),
       SUM(f.QUANTITYORDERED),
       COUNT(*)
FROM   PUBLIC.ORDERFACT f
       JOIN PUBLIC.CUSTOMER_W_TER c ON f.CUSTOMERNUMBER = c.CUSTOMERNUMBER
       JOIN PUBLIC.DIM_TIME       t ON f.TIME_ID        = t.TIME_ID
GROUP BY c.TERRITORY, t.YEAR_ID, t.QTR_NAME, f.STATUS;

-- Sanity: row counts should be far smaller than ORDERFACT's.
SELECT 'ORDERFACT' AS t, COUNT(*) AS rows_n FROM PUBLIC.ORDERFACT
UNION ALL SELECT 'AGG_1', COUNT(*) FROM "Miniature_Sales_AGG_1"
UNION ALL SELECT 'AGG_2', COUNT(*) FROM "Miniature_Sales_AGG_2";
