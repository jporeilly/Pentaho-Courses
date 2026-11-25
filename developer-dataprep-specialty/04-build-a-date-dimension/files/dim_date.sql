-- mart_dim_date: the date dimension of the Sales Mart.
-- Run in DBeaver (or Adminer) against the MySQL sampledata database,
-- connected as pentaho_admin. Re-running it drops and recreates the table.
--
-- One row per calendar day. date_key is a "smart" key, the date as the
-- integer yyyymmdd (20030106 for 6 January 2003), so a fact load can
-- compute it, or look it up, from any order date.

DROP TABLE IF EXISTS mart_dim_date;

CREATE TABLE mart_dim_date (
  date_key      INT         NOT NULL,
  the_date      DATE        NOT NULL,
  year_id       SMALLINT    NOT NULL,
  quarter_id    TINYINT     NOT NULL,
  quarter_name  CHAR(4)     NOT NULL,
  month_id      TINYINT     NOT NULL,
  month_name    CHAR(3)     NOT NULL,
  day_of_month  TINYINT     NOT NULL,
  day_of_week   TINYINT     NOT NULL,
  PRIMARY KEY (date_key),
  UNIQUE KEY idx_dim_date_the_date (the_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- After the load, check it:
-- SELECT COUNT(*), MIN(date_key), MAX(date_key) FROM mart_dim_date;
-- SELECT year_id, COUNT(*) FROM mart_dim_date GROUP BY year_id ORDER BY year_id;
