# Overview

<div align="center">
<figure>
<img src="../_assets/images/streaming-data.png" alt="Streaming data sources (app activity, server logs, IoT sensors, online advertising, clickstream) flow through a CDC streaming tool into a stream processing tool, then to a streaming SQL engine or a relational store, and on to BI tools, real-time applications, data science and machine learning" width="800">
<figcaption>From streaming sources to the tools that use the data</figcaption>
</figure>
</div>

> **Note:** **Streaming Data**
>
> Streaming data represents a continuous flow of information generated in real-time from various sources like IoT devices, social media feeds, financial transactions, or sensor networks. Unlike traditional batch processing where data is collected and analyzed in fixed chunks, streaming data arrives as an unbounded sequence of events that must be processed on the fly.
>
> This real-time nature presents unique challenges in data processing, storage, and analysis, but also enables organizations to gain immediate insights and respond to changing conditions as they happen.
>
> Pentaho Data Integration handles streaming data with its streaming steps. You build a streaming pipeline on the same canvas as a batch one: consume data from a streaming source, transform it as it arrives, and load it into a target system.
>
> Pentaho Data Integration has consumer steps for MQTT, AMQP, JMS and Kafka, among other sources, so it connects to the streaming infrastructure you already run. Batch and streaming transformations are built the same way, so a team moving from batch to real-time integration keeps the skills it has.

***

## Batch vs. streaming

The fundamental shift from batch to streaming is the move from a **bounded** dataset to an **unbounded** one.

| | Batch | Streaming |
| --- | --- | --- |
| **Data shape** | Finite — a file, a table, a query result | Infinite — an open-ended sequence of events |
| **When it runs** | On a schedule or on demand | Continuously, as events arrive |
| **Latency** | Minutes to hours | Sub-second to seconds |
| **Completion** | The job ends when the data is exhausted | The transformation stays running, waiting for the next event |
| **Typical use** | Nightly warehouse loads, reports | Sensor telemetry, fraud alerts, live dashboards |

## The Pentaho Data Integration streaming pattern

Every streaming source in Pentaho Data Integration — MQTT, Kafka, AMQP, JMS, Kinesis — follows the same **parent/child transformation** pattern:

* A **parent transformation** holds the streaming **consumer** step (for example *MQTT Consumer*, *Kafka Consumer*, *AMQP Consumer*). The consumer subscribes to the stream and collects incoming messages into **batches**.
* A **batch** is flushed to the child transformation whenever the first of two thresholds is reached:
  * **Duration (ms)** — a time window, or
  * **Number of records** — a message count.
* A **child transformation** processes each batch. It **must** start with the **Get records from stream** step, which surfaces the batched messages as rows. From there you parse, transform, and load the records like any other Pentaho Data Integration stream.

This pattern means the same skills — JSON Input, Select values, Formula, Table output — apply to every protocol. Only the consumer step at the front changes.

> **Note:** **Get records from stream**
>
> This step produces rows and so must be the **first** step in the child transformation — it cannot sit mid-stream. To add streamed data to an existing stream, join it in with a join step.

## Protocols covered in this specialty

::: tabs

### MQTT

**Message Queuing Telemetry Transport** — a lightweight publish/subscribe protocol built for the Internet of Things (IoT). Minimal overhead makes it ideal for constrained devices and sensor networks. You will consume industrial robot-sensor telemetry from a **HiveMQ** broker and truck telemetry from an **EMQX** broker.

### AMQP

**Advanced Message Queuing Protocol** — a standardized broker protocol for reliable, decoupled messaging. You will consume room-sensor data from a **RabbitMQ** broker and append it to output files.

### Kafka

**Apache Kafka** — a distributed event-streaming platform for high-volume, fault-tolerant publish/subscribe pipelines. You will consume a real-time user-activity stream from Kafka (running in KRaft mode) and land it in a MySQL warehouse.

:::

> **Note:** Each topic in this course is a self-contained workshop. Work through them in order, or jump to the protocol that matches your environment.
