-- mart_fact_sales: the fact table of the Sales Mart, one row per order line.
-- Run in DBeaver (or Adminer) against the MySQL sampledata database,
-- connected as pentaho_admin. Re-running it drops and recreates the table.
--
-- The three *_key columns hold the dimensions' surrogate keys. 0 is the
-- "unknown" member, so a fact row always points at a dimension row.
-- (order_number, order_line_number) is the natural key of an order line:
-- the load updates a line it has already loaded instead of adding it twice.

DROP TABLE IF EXISTS mart_fact_sales;

CREATE TABLE mart_fact_sales (
  order_number       INT           NOT NULL,
  order_line_number  SMALLINT      NOT NULL,
  date_key           INT           NOT NULL,
  customer_key       INT           NOT NULL,
  product_key        INT           NOT NULL,
  status             VARCHAR(15)   DEFAULT NULL,
  quantity_ordered   INT           NOT NULL,
  price_each         DECIMAL(10,2) NOT NULL,
  sales_amount       DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (order_number, order_line_number),
  KEY idx_fact_sales_date (date_key),
  KEY idx_fact_sales_customer (customer_key),
  KEY idx_fact_sales_product (product_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- After the load, check it:
-- SELECT COUNT(*), COUNT(DISTINCT order_number), SUM(quantity_ordered), SUM(sales_amount) FROM mart_fact_sales;
-- SELECT COUNT(*) FROM mart_fact_sales WHERE date_key = 0 OR customer_key = 0 OR product_key = 0;
