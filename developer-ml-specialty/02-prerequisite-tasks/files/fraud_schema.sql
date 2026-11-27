-- The fraud database the Machine Learning course writes its scores to.
-- Run it once, as root, in the lab's MySQL (sampledata-mysql), from Prerequisite Tasks:
--   Get-Content fraud_schema.sql -Raw | podman exec -i sampledata-mysql mysql -uroot -ppassword
-- It is safe to run again: nothing that exists is dropped.

CREATE DATABASE IF NOT EXISTS fraud;

CREATE USER IF NOT EXISTS 'fraud_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON fraud.* TO 'fraud_user'@'%';
FLUSH PRIVILEGES;

USE fraud;

-- Credit Card: one row per scored transaction, written by tr_predict_fraud
-- with Insert / Update, so a second run updates the same rows.
CREATE TABLE IF NOT EXISTS transaction_scores (
  transaction_id    INT           NOT NULL PRIMARY KEY,
  customer_id       INT           NOT NULL,
  fraud_probability DECIMAL(6,4)  NOT NULL,
  predicted_fraud   TINYINT       NOT NULL,
  top_reason        VARCHAR(40)   NULL,
  scored_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Monitoring and Tuning: the outcomes the fraud team confirms later.
CREATE TABLE IF NOT EXISTS confirmed_outcomes (
  transaction_id    INT           NOT NULL PRIMARY KEY,
  confirmed_fraud   TINYINT       NOT NULL,
  loaded_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Monitoring and Tuning: one row per monitoring run.
CREATE TABLE IF NOT EXISTS model_metrics (
  run_id            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  run_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  threshold         DECIMAL(4,2)  NOT NULL,
  scored            INT           NOT NULL,
  true_positives    INT           NOT NULL,
  false_positives   INT           NOT NULL,
  false_negatives   INT           NOT NULL,
  precision_rate    DECIMAL(6,4)  NOT NULL,
  recall_rate       DECIMAL(6,4)  NOT NULL,
  retrain_needed    TINYINT       NOT NULL
);

-- Scoring as a Service: tonight's new orders, scored by the H2O service.
CREATE TABLE IF NOT EXISTS order_scores (
  transaction_id    INT           NOT NULL PRIMARY KEY,
  customer_id       INT           NOT NULL,
  order_dollar_amount DECIMAL(8,1) NOT NULL,
  fraud_probability DECIMAL(6,4)  NOT NULL,
  flagged           TINYINT       NOT NULL,
  top_reason        VARCHAR(40)   NULL,
  scored_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Real-time Scoring: orders scored as they arrive from Kafka.
CREATE TABLE IF NOT EXISTS live_scores (
  transaction_id    INT           NOT NULL PRIMARY KEY,
  customer_id       INT           NOT NULL,
  order_dollar_amount DECIMAL(8,1) NOT NULL,
  fraud_probability DECIMAL(6,4)  NOT NULL,
  flagged           TINYINT       NOT NULL,
  top_reason        VARCHAR(40)   NULL,
  kafka_partition   INT           NULL,
  kafka_offset      BIGINT        NULL,
  scored_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
