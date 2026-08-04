-- Kafka use-case database, run against the workshop MySQL:
--   podman exec -i pcm-mysql mysql -uroot -ppassword < 01-create-kafka-warehouse.sql
CREATE DATABASE IF NOT EXISTS kafka_warehouse;
CREATE USER IF NOT EXISTS 'kafka_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON kafka_warehouse.* TO 'kafka_user'@'%';
FLUSH PRIVILEGES;
USE kafka_warehouse;
CREATE TABLE IF NOT EXISTS user_events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    region_id VARCHAR(100),
    gender VARCHAR(20),
    register_time TIMESTAMP NULL,
    kafka_topic VARCHAR(255),
    kafka_partition INT,
    kafka_offset BIGINT,
    ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_register_time (register_time),
    INDEX idx_ingestion_timestamp (ingestion_timestamp),
    UNIQUE KEY uq_kafka_offset (kafka_topic, kafka_partition, kafka_offset)
);
