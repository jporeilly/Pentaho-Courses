-- The two summary tables of the Sales Mart, named and shaped the way
-- Mondrian expects an aggregate table: agg_<name>_<fact table>, a
-- fact_count column, and the measure and level columns named like the
-- columns they summarize.
-- Run in DBeaver (or Adminer) against the MySQL sampledata database,
-- connected as pentaho_admin. Re-running it drops and recreates both tables.

-- Sales by month and product line: Time collapsed to Years, Quarters and
-- Months; Product collapsed to Line; Markets lost.
DROP TABLE IF EXISTS agg_ym_line_mart_fact_sales;

CREATE TABLE agg_ym_line_mart_fact_sales (
  year_id           SMALLINT      NOT NULL,
  quarter_id        TINYINT       NOT NULL,
  month_id          TINYINT       NOT NULL,
  product_line      VARCHAR(50)   NOT NULL,
  quantity_ordered  INT           NOT NULL,
  sales_amount      DECIMAL(14,2) NOT NULL,
  fact_count        INT           NOT NULL,
  PRIMARY KEY (year_id, month_id, product_line)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales by year and territory: Time collapsed to Years; Markets collapsed
-- to Territory; Product lost.
DROP TABLE IF EXISTS agg_y_terr_mart_fact_sales;

CREATE TABLE agg_y_terr_mart_fact_sales (
  year_id           SMALLINT      NOT NULL,
  territory         VARCHAR(10)   DEFAULT NULL,
  quantity_ordered  INT           NOT NULL,
  sales_amount      DECIMAL(14,2) NOT NULL,
  fact_count        INT           NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- After the load, check that the summaries add up to the fact table:
-- SELECT 'mart_fact_sales', COUNT(*), SUM(sales_amount) FROM mart_fact_sales
-- UNION ALL SELECT 'agg_ym_line', SUM(fact_count), SUM(sales_amount) FROM agg_ym_line_mart_fact_sales
-- UNION ALL SELECT 'agg_y_terr', SUM(fact_count), SUM(sales_amount) FROM agg_y_terr_mart_fact_sales;
