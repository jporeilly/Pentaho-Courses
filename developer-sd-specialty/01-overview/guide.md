# Overview

<div class="pcm-intro">

Streaming data never ends: sensors, applications and logs keep producing events, and a pipeline has to process each one as it arrives. This course shows how Pentaho Data Integration consumes those streams over three protocols, MQTT, AMQP and Kafka, with one pattern that works the same way for all of them.

</div>

**What You'll Learn**

* **Batch vs. streaming** - what changes when the data has no end.
* **The parent/child streaming pattern** - how a consumer step batches messages and runs a child transformation for each batch.
* **The three protocols** - where MQTT, AMQP and Kafka fit, and which broker each workshop uses.

<div align="center">
<figure>
<img src="../_assets/images/streaming-data.png" alt="Streaming data sources (app activity, server logs, IoT sensors, online advertising, clickstream) flow through a CDC streaming tool into a stream processing tool, then to a streaming SQL engine or a relational store, and on to BI tools, real-time applications, data science and machine learning" width="800">
<figcaption>From streaming sources to the tools that use the data</figcaption>
</figure>
</div>

> **Note:**
>
> #### Streaming Data
>
> Streaming data is a continuous flow of information generated in real time by sources such as IoT devices, social media feeds, financial transactions or sensor networks. Unlike batch processing, where data is collected and analyzed in fixed chunks, streaming data arrives as an unbounded sequence of events that must be processed as it comes.
>
> Processing data in real time makes storage and analysis harder, but it lets an organization see changes and respond to them as they happen.
>
> Pentaho Data Integration handles streaming data with its streaming steps. You build a streaming pipeline on the same canvas as a batch one: consume data from a streaming source, transform it as it arrives, and load it into a target system.
>
> Pentaho Data Integration has consumer steps for MQTT, AMQP, JMS and Kafka, among other sources, so it connects to the streaming infrastructure you already run. Batch and streaming transformations are built the same way, so a team moving from batch to real-time integration keeps the skills it has.

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

* A **parent transformation** holds the streaming **consumer** step (for example **MQTT consumer**, **Kafka consumer**, **AMQP consumer**). The consumer subscribes to the stream and collects incoming messages into **batches**.
* A **batch** is flushed to the child transformation whenever the first of two thresholds is reached:
  * **Duration (ms)** — a time window, or
  * **Number of records** — a message count.
* A **child transformation** processes each batch. It **must** start with the **Get records from stream** step, which surfaces the batched messages as rows. From there you parse, transform, and load the records like any other Pentaho Data Integration stream.

<div align="center">
<figure>
<img src="../_assets/images/parent-child-streaming.png" alt="A broker, HiveMQ, EMQX, RabbitMQ or Kafka, feeds the consumer step in the parent transformation, which closes a batch at Duration (ms) or Number of records, whichever comes first. Each batch runs the child: Get records from stream, JSON input, Select values and Formula, then Table output. A table lists the labs’ batch settings: MQTT 5000 ms or 50, AMQP 1000 or 1000, Kafka 500 or 100" width="800">
<figcaption>One pattern for every protocol: the parent batches, the child runs once per batch</figcaption>
</figure>
</div>

Read the diagram from the broker down the left: the consumer step in the parent subscribes and collects messages, and the amber box is the rule that closes a batch. Each batch crosses to the right and starts one run of the child, which begins with **Get records from stream** and then parses, transforms and loads the rows. The table under the parent lists the batch settings the workshops use; the MQTT and AMQP workshops load with **Text file output** rather than **Table output**.

This pattern means the same skills — **JSON input**, **Select values**, **Formula**, **Table output** — apply to every protocol. Only the consumer step at the front changes.

> **Note:**
>
> #### Get Records from Stream
>
> This step produces rows and so must be the **first** step in the child transformation — it cannot sit mid-stream. To combine streamed rows with other data, read that data in the child and join it to the stream (for example with **Stream lookup**).

## Protocols covered in this specialty

::: tabs

### MQTT

**Message Queuing Telemetry Transport** — a lightweight publish/subscribe protocol built for the Internet of Things (IoT). Minimal overhead suits constrained devices and sensor networks. You will consume industrial robot-sensor telemetry from a **HiveMQ** broker and truck telemetry from an **EMQX** broker.

### AMQP

**Advanced Message Queuing Protocol** — a standardized broker protocol for reliable, decoupled messaging. You will consume room-sensor data from a **RabbitMQ** broker and append it to `tv_room_sensor.txt`.

### Kafka

**Apache Kafka** — a distributed event-streaming platform for high-volume, fault-tolerant publish/subscribe pipelines. You will consume a user-activity stream from Kafka in real time (running in KRaft mode) and land it in a MySQL warehouse.

:::

> **Tip:** Next, the first protocol: MQTT. Start with the MQTT [Overview](../02-mqtt/guide.md).
