-- mart_dim_customer and mart_dim_product: the two dimensions Dimension lookup/update
-- maintains in this lab. Run in DBeaver (or Adminer) against the MySQL
-- sampledata database, connected as pentaho_admin. Re-running it drops and
-- recreates both tables, so the history starts again.
--
-- Each table has the columns a type 2 dimension needs: a technical
-- (surrogate) key, a version, and the dates each version is valid from and
-- to. The natural key (customer_number, product_code) is indexed, because
-- the step looks every row up by it.

DROP TABLE IF EXISTS mart_dim_customer;

CREATE TABLE mart_dim_customer (
  customer_key     INT           NOT NULL,
  version          INT           DEFAULT NULL,
  date_from        DATETIME      DEFAULT NULL,
  date_to          DATETIME      DEFAULT NULL,
  customer_number  INT           DEFAULT NULL,
  customer_name    VARCHAR(50)   DEFAULT NULL,
  contact_name     VARCHAR(60)   DEFAULT NULL,
  city             VARCHAR(50)   DEFAULT NULL,
  state            VARCHAR(50)   DEFAULT NULL,
  country          VARCHAR(50)   DEFAULT NULL,
  territory        VARCHAR(10)   DEFAULT NULL,
  credit_limit     DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (customer_key),
  KEY idx_dim_customer_lookup (customer_number, date_from, date_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS mart_dim_product;

CREATE TABLE mart_dim_product (
  product_key      INT           NOT NULL,
  version          INT           DEFAULT NULL,
  date_from        DATETIME      DEFAULT NULL,
  date_to          DATETIME      DEFAULT NULL,
  product_code     VARCHAR(15)   DEFAULT NULL,
  product_name     VARCHAR(70)   DEFAULT NULL,
  product_line     VARCHAR(50)   DEFAULT NULL,
  product_scale    VARCHAR(10)   DEFAULT NULL,
  product_vendor   VARCHAR(50)   DEFAULT NULL,
  buy_price        DECIMAL(10,2) DEFAULT NULL,
  msrp             DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (product_key),
  KEY idx_dim_product_lookup (product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- After each run, check them:
-- SELECT COUNT(*) FROM mart_dim_customer;
-- SELECT customer_key, version, date_from, date_to, customer_number, customer_name, city, credit_limit
--   FROM mart_dim_customer WHERE customer_number IN (119, 141, 282, 500) ORDER BY customer_key;
-- SELECT COUNT(*) FROM mart_dim_product;
