-- The capstone's alert store, run against the MySQL kit's sampledata-mysql:
--   Get-Content create_factory.sql -Raw | podman exec -i sampledata-mysql mysql -uroot -ppassword
CREATE DATABASE IF NOT EXISTS factory;
CREATE USER IF NOT EXISTS 'line_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON factory.* TO 'line_user'@'%';
FLUSH PRIVILEGES;
USE factory;
CREATE TABLE IF NOT EXISTS line_alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    machine VARCHAR(40) NOT NULL,          -- the Kafka record's key
    reading_ts BIGINT NOT NULL,            -- epoch milliseconds, from the reading
    spindle_temp DECIMAL(5,1),
    vibration DECIMAL(5,2),
    rpm INT,
    kafka_topic VARCHAR(255) NOT NULL,
    kafka_partition INT NOT NULL,
    kafka_offset BIGINT NOT NULL,
    loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_machine (machine),
    UNIQUE KEY uq_kafka_record (kafka_topic, kafka_partition, kafka_offset)
);
