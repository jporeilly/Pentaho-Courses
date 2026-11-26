# RabbitMQ

> **Warning:**
>
> #### Workshop - RabbitMQ (room sensors)
>
> A house has a sensor in each room measuring **temperature**, **pressure** and **humidity**, and the TV room's sensor publishes its readings to a RabbitMQ queue. RabbitMQ is an open-source message broker that routes messages to queues; AMQP is one of the protocols it speaks. You consume the queue in Pentaho Data Integration with the **AMQP consumer** step and a child transformation that appends each reading to a file.
>
> **What you'll do**
>
> * Start RabbitMQ with Podman and sign in to its management UI
> * Publish simulated room-sensor readings to the `tv_room` queue with a Python script
> * Build a child transformation that parses each JSON reading and appends it to a file
> * Build a parent transformation whose **AMQP consumer** step runs the child for each batch
> * Watch the queue empty as Pentaho Data Integration takes the messages
>
> **Prerequisites:**
>
> * The brokers and Python from [Before You Start](../00-before-you-start/guide.md)
> * The parent/child pattern, from the Streaming Data [Overview](../01-overview/guide.md)
> * Exchanges and queues, from the AMQP [Overview](../05-amqp/guide.md)
>
> **Estimated time:** 30 minutes

This workshop's pipeline: `sensor_tv_room.py` publishes to the `tv_room` queue, the parent's **AMQP consumer** takes the messages in batches, and each batch runs the child once, which appends the readings to `tv_room_sensor.txt`:

<div align="center">
<figure>
<img src="../_assets/images/rabbitmq-tv-room-pipeline.png" alt="sensor_tv_room.py publishes one JSON reading a second, temperature, pressure and humidity, to RabbitMQ on localhost:5672, the durable queue tv_room through the default exchange. In tr_rabbit_consumer, AMQP consumer takes a batch every 1000 ms or 1000 messages and acknowledges each message when received. Each batch runs tr_process_sensor_data: Get records from stream, Get System Info, JSON Input and Text file output, which appends semicolon-separated lines with no header to tv_room_sensor.txt" width="800">
<figcaption>The pipeline: tr_rabbit_consumer hands each batch to tr_process_sensor_data</figcaption>
</figure>
</div>

:::: tabs

### 1. Start RabbitMQ

> **Note:**
>
> #### Start RabbitMQ
>
> RabbitMQ runs as a container under **Podman**. The course's Streaming kit, `C:\Streaming\run-podman-streaming.ps1`, starts it from one pinned image, RabbitMQ 4.4.1 with its management plugin, alongside the other brokers.

1. Start the brokers. If you started them for an earlier lab, they are running already, and the script says so. In PowerShell, run:

```powershell
C:\Streaming\run-podman-streaming.ps1
```

> **Success:** Checkpoint: the script ends with `The brokers are up.` and lists RabbitMQ with AMQP on `amqp://localhost:5672` and its management UI on `http://localhost:15672`.

2. Open `http://localhost:15672` in a browser and sign in:

| | |
| --- | --- |
| Username | `guest` |
| Password | `guest` |

<div align="center">
<figure>
<img src="../_assets/images/sd06-rabbitmq-sign-in.png" alt="The RabbitMQ management sign-in page, with Username guest and the password filled in" width="800">
<figcaption>The management UI's sign-in page</figcaption>
</figure>
</div>

<div align="center">
<figure>
<img src="../_assets/images/sd06-rabbitmq-overview.png" alt="The RabbitMQ management UI Overview: RabbitMQ 4.4.1 on Erlang 29.1.3, cluster rabbit@pcm-rabbitmq, signed in as guest; tabs Overview, Connections, Channels, Exchanges, Queues and Streams, Admin" width="800">
<figcaption>The Overview page, RabbitMQ 4.4.1</figcaption>
</figure>
</div>

> **Success:** Checkpoint: the **Overview** page opens, signed in as `guest`, and the header shows **RabbitMQ 4.4.1**.

### 2. Publish Sensor Data

> **Note:**
>
> #### Publish room-sensor readings
>
> `sensor_tv_room.py` plays the TV room's sensor. Once a second it publishes a JSON reading to the `tv_room` queue, through the default exchange. It uses [pika](https://pypi.org/project/pika/), a Python AMQP client library.

1. Install the script's one dependency. In PowerShell, run:

```powershell
Set-Location C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq
pip install -r requirements.txt
```

2. Review the publisher, `sensor_tv_room.py`. These are the lines that matter:

```python
rabbitmq_host = 'localhost'
port = 5672
queue_name = 'tv_room'

def publish_sensor_data():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host, port=port))
    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)
    while True:
        message = json.dumps(generate_sensor_data())
        channel.basic_publish(exchange='', routing_key=queue_name, body=message)
        print(f"Sent sensor data: {message}", flush=True)
        time.sleep(1)
```

`exchange=''` is the default exchange: RabbitMQ binds every queue to it by the queue's own name, so the routing key `tv_room` delivers to the `tv_room` queue. The queue is declared **durable**: RabbitMQ 4 refuses a transient queue that is not exclusive to one connection, and the **AMQP consumer** step declares the queue durable too. Everyone who declares a queue must declare it the same way.

3. Start the publisher, and leave it running in its own PowerShell window:

```powershell
python sensor_tv_room.py
```

> **Success:** Checkpoint: one line a second, `Sent sensor data: {"temperature": ..., "pressure": ..., "humidity": ...}`, with a new value in each field.

4. In the management UI, select **Queues and Streams**, then select the `tv_room` queue.

<div align="center">
<figure>
<img src="../_assets/images/sd06-rabbitmq-tv-room.png" alt="The tv_room queue in the management UI: 35 messages ready, 0 unacked, a publish rate of 1.0 per second, 0 consumers; under Details, x-queue-type classic, durable true, state running" width="800">
<figcaption>The tv_room queue fills at one message a second</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Ready** grows by about one message a second, **Publish** is about `1.0/s`, **Consumers** is `0`, and **durable** is `true`.

5. To read one message, open **Get messages**, set **Ack Mode** to `Automatic ack`, and select **Get Message(s)**. The message is removed from the queue: getting a message this way is destructive.

> **Success:** Checkpoint: the **Payload** is one JSON reading with `temperature`, `pressure` and `humidity`; **Exchange** is `(AMQP default)` and **Routing Key** is `tv_room`.

### 3. Get Records and System Info

> **Note:**
>
> #### The child: one batch at a time
>
> The child transformation handles one batch of messages: **Get records from stream** hands it the batch as rows, **Get System Info** stamps them, **JSON Input** splits each reading into fields, and **Text file output** appends them to a file. Build the child first, so the parent has a file to point to.
>
> <div align="center">
> <figure>
> <img src="../_assets/images/sd06-what-you-build-child.png" alt="tr_process_sensor_data on the Spoon canvas: its blue note listing the four steps, and Get records from stream, Get System Info, JSON Input and Text file output in a row" width="614">
> <figcaption>What you build: tr_process_sensor_data</figcaption>
> </figure>
> </div>

1. Start Spoon with the **Start Pentaho Data Integration** button below, or from PowerShell:

```powershell
Set-Location C:\Pentaho\design-tools\data-integration
.\spoon.bat
```

<button data-launch="spoon" data-path="">Start Pentaho Data Integration</button>

2. Select **File > New > Transformation** (`Ctrl+N`).
3. Select **File > Save as** and save it as `tr_process_sensor_data.ktr` in `C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq`.
4. On the **Design** tab, open the **Streaming** folder and drag **Get records from stream** onto the canvas.
5. Double-click **Get records from stream**. Fill the **Fields** grid with one row, the message text:

| Fieldname | Type |
| --- | --- |
| `message` | String |

<div align="center">
<figure>
<img src="../_assets/images/sd06-get-records.png" alt="Get records from stream: one field, message, of type String" width="404">
<figcaption>Get records from stream: one field, message</figcaption>
</figure>
</div>

6. Select **OK**.
7. On the **Design** tab, open the **Input** folder and drag **Get system info** onto the canvas, to the right of **Get records from stream**.
8. Create a hop from **Get records from stream** to **Get system info**: hold `Shift` and drag from one step to the other.
9. Double-click **Get system info**. Set **Step name** to `Get System Info`.
10. Fill the **Fields** grid with one row: set **Name** to `current_time`, select the **Type** cell and select `system date (fixed)` in the **Select info type** list.

| Name | Type |
| --- | --- |
| `current_time` | `system date (fixed)` |

<div align="center">
<figure>
<img src="../_assets/images/sd06-system-info.png" alt="Get System Info: one field, current_time, of type system date (fixed)" width="440">
<figcaption>Get System Info: one time for the whole batch</figcaption>
</figure>
</div>

11. Select **OK**, and save the transformation (`Ctrl+S`).

### 4. JSON Input and Text File Output

> **Note:**
>
> #### Parse each reading, and append it
>
> **JSON Input** reads the field `message` of the incoming rows. **Text file output** adds each batch to the end of the file: every batch is a new run of the child.

1. From the **Input** folder, drag **JSON input** onto the canvas, and create a hop from **Get System Info** to **JSON input**.
2. Double-click **JSON input**. Set **Step name** to `JSON Input`.
3. On the **File** tab, select **Source is from a previous step** and set **Select field** to `message`.

<div align="center">
<figure>
<img src="../_assets/images/sd06-json-file.png" alt="JSON Input, File tab: Source is from a previous step selected, Select field message" width="800">
<figcaption>JSON Input, File tab: the source is the field message</figcaption>
</figure>
</div>

4. Open the **Content** tab and check that **Ignore missing path**, **Default path leaf to null** and **Do not raise an error if no files** are selected.
5. Open the **Fields** tab and fill the grid:

| Name | Path | Type |
| --- | --- | --- |
| `temperature` | `$.temperature` | String |
| `humidity` | `$.humidity` | String |
| `pressure` | `$.pressure` | String |

<div align="center">
<figure>
<img src="../_assets/images/sd06-json-fields.png" alt="JSON Input, Fields tab: temperature, humidity and pressure, each with its $. path and type String" width="800">
<figcaption>JSON Input, Fields tab: three readings</figcaption>
</figure>
</div>

6. Select **OK**.
7. From the **Output** folder, drag **Text file output** onto the canvas, and create a hop from **JSON Input** to **Text file output**.
8. Double-click **Text file output**. On the **File** tab, set:

| Setting | Value |
| --- | --- |
| **Filename** | `${Internal.Transformation.Filename.Directory}/tv_room_sensor` |
| **Create Parent folder** | selected |
| **Do not create file at start** | cleared |
| **Extension** | `txt` |

<div align="center">
<figure>
<img src="../_assets/images/sd06-tfo-file.png" alt="Text file output, File tab: Filename ${Internal.Transformation.Filename.Directory}/tv_room_sensor, Create Parent folder selected, Do not create file at start cleared, Extension txt" width="800">
<figcaption>Text file output, File tab: tv_room_sensor.txt beside the transformation</figcaption>
</figure>
</div>

9. Open the **Content** tab and set:

| Setting | Value |
| --- | --- |
| **Append** | selected |
| **Separator** | `;` |
| **Enclosure** | `"` |
| **Header** | cleared |
| **Format** | `CR+LF terminated (Windows, DOS)` |

<div align="center">
<figure>
<img src="../_assets/images/sd06-tfo-content.png" alt="Text file output, Content tab: Append selected, Separator semicolon, Enclosure double quote, Header cleared, Format CR+LF terminated (Windows, DOS)" width="800">
<figcaption>Text file output, Content tab: Append, ; and no header</figcaption>
</figure>
</div>

10. Open the **Fields** tab and select **Get Fields**. Right-click the `message` row and select **Delete selected lines**, so the grid lists four fields:

| Name | Type |
| --- | --- |
| `current_time` | Date |
| `temperature` | String |
| `humidity` | String |
| `pressure` | String |

<div align="center">
<figure>
<img src="../_assets/images/sd06-tfo-fields.png" alt="Text file output, Fields tab: current_time Date, temperature, humidity and pressure String" width="800">
<figcaption>Text file output, Fields tab: four fields, message removed</figcaption>
</figure>
</div>

11. Select **OK**, and save the transformation (`Ctrl+S`).

> **Success:** Checkpoint: four steps in a row: **Get records from stream**, **Get System Info**, **JSON Input** and **Text file output**.

### 5. AMQP Consumer

> **Note:**
>
> #### Consume the queue with AMQP consumer
>
> The **AMQP consumer** step receives messages through an AMQP 0-9-1 broker. It reads from an existing queue or creates one, collects the messages into batches, and runs the child for each batch.
>
> <div align="center">
> <figure>
> <img src="../_assets/images/sd06-what-you-build-parent.png" alt="tr_rabbit_consumer on the Spoon canvas: its blue note and one step, AMQP consumer" width="535">
> <figcaption>What you build: tr_rabbit_consumer</figcaption>
> </figure>
> </div>

1. Select **File > New > Transformation** (`Ctrl+N`).
2. Select **File > Save as** and save it as `tr_rabbit_consumer.ktr` in `C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq`, next to the child.
3. On the **Design** tab, open the **Streaming** folder and drag **AMQP consumer** onto the canvas.
4. Double-click **AMQP consumer**. Keep its step name, `AMQP consumer`.
5. Set **Transformation** to `${Internal.Entry.Current.Directory}/tr_process_sensor_data.ktr`.
6. On the **Setup** tab, set:

| Setting | Value |
| --- | --- |
| **Connection** | `amqp://localhost:5672` |
| **Queue name** | `tv_room` |
| **Exchange name** | empty |
| **Exchange type** | `DIRECT` |
| **Routing Keys** | empty |

<div align="center">
<figure>
<img src="../_assets/images/sd06-amqp-setup.png" alt="AMQP consumer, Setup tab: Transformation ${Internal.Entry.Current.Directory}/tr_process_sensor_data.ktr, Connection amqp://localhost:5672, Queue name tv_room, Exchange name empty, Exchange type DIRECT, no routing keys" width="640">
<figcaption>AMQP consumer, Setup tab: the tv_room queue</figcaption>
</figure>
</div>

With **Exchange name** empty the step uses the default exchange, which already routes `tv_room` to the queue of that name, so no routing key is needed.

| Option | What it is |
| --- | --- |
| **Connection** | The URI of the AMQP broker the step connects to, `amqp://host:port`. |
| **Queue name** | The queue to read from. A new queue is created on the first run, durable, not auto-delete and not exclusive by default. If a queue of that name exists with different settings, the transformation stops. |
| **Exchange name** | A new or existing exchange to bind the queue to. Leave it empty to use the default exchange, of type DIRECT. |
| **Routing Keys** | For a DIRECT or TOPIC exchange, one or more routing keys. |

7. Open the **Batch** tab and set:

| Setting | Value |
| --- | --- |
| **Duration (ms)** | `1000` |
| **Number of records** | `1000` |
| **Maximum concurrent batches** | `1` |
| **Message prefetch limit** | `100000` |

8. Under **Ack management**, select **Ack when message received**.

<div align="center">
<figure>
<img src="../_assets/images/sd06-amqp-batch.png" alt="AMQP consumer, Batch tab: Duration 1000 ms, Number of records 1000, Maximum concurrent batches 1, Message prefetch limit 100000, Ack management Ack when message received" width="640">
<figcaption>AMQP consumer, Batch tab: a batch every second, acknowledged on receipt</figcaption>
</figure>
</div>

9. Select **OK**, and save the transformation (`Ctrl+S`).

### 6. Run

> **Note:**
>
> #### Run the consumer
>
> With the publisher still sending, start the parent. The messages waiting in the queue arrive first, then one reading a second.

1. Press `F9` (**Action > Run**), and select **Run** in the **Run Options** dialog. The transformation keeps running: a streaming consumer has no last row.
2. In the management UI, refresh the `tv_room` queue.

<div align="center">
<figure>
<img src="../_assets/images/sd06-rabbitmq-tv-room-consumed.png" alt="The tv_room queue after the consumer started: 0 ready, 0 unacked, publish 1.0 per second, and the queued-messages chart falling to 0" width="800">
<figcaption>The queue empties as Pentaho Data Integration takes the messages</figcaption>
</figure>
</div>

> **Success:** Checkpoint: **Consumers** is `1`, and **Ready** drops to `0`: Pentaho Data Integration took the waiting messages.

3. Open `C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq\tv_room_sensor.txt` in a text editor. Its first lines look like these, from a run of this workshop:

```text
2026/11/26 12:29:10.803;88.88606429962643;52.01549099065527;1075.3921287384564
2026/11/26 12:29:10.803;88.23510730393156;66.10323066817003;1006.1286673015551
2026/11/26 12:29:10.803;66.03200329897902;74.96685342438295;1024.6138715048326
2026/11/26 12:29:10.803;46.2032474134065;79.26115640255313;984.2683252012104
2026/11/26 12:29:10.803;95.31362411124265;72.48781661950925;1169.7804366560601
```

> **Success:** Checkpoint: lines of `;`-separated values: the time, then the temperature, humidity and pressure. The readings that waited in the queue arrive in the first batch and share one time; after that, a batch closes every second, with about one reading each.

4. Stop the transformation: select **Stop** in the canvas toolbar. Then press `Ctrl+C` in the publisher's window.

> **Under the hood:**
>
> #### The broker let go of each message as soon as Pentaho Data Integration had it
>
> With **Ack when message received**, the AMQP consumer acknowledges each
> message as it is delivered, and RabbitMQ removes it from the queue at
> once: that is why **Ready** fell to `0` while the child was still
> writing. If a batch failed in the child, its messages would already be
> gone. **Ack when batch completed** holds the acknowledgments until the
> child has finished the batch; messages that are still unacknowledged when
> the consumer's connection closes go back to the queue.
>
> A durable queue survives a broker restart, but its messages survive only
> if they are published as persistent. `sensor_tv_room.py` publishes them
> transient, which is why the queue's **Persistent** count stays `0`.
>
> **Why it matters:** pick per feed. Room readings every second can afford
> to lose a batch; orders or payments cannot, and are worth the extra
> unacknowledged messages that **Ack when batch completed** keeps on the
> broker, and persistent messages on a durable queue.

::::

## Troubleshooting <!-- no-step -->

<details>
<summary>sensor_tv_room.py stops with "transient_nonexcl_queues is deprecated"</summary>

The script you run is an older copy that declares `tv_room` without `durable=True`. RabbitMQ 4 closes the connection for a transient queue that is not exclusive. Take the current `sensor_tv_room.py` from the **Lab Files** below.

</details>

<details>
<summary>sensor_tv_room.py stops with "PRECONDITION_FAILED - inequivalent arg 'durable'"</summary>

The `tv_room` queue exists with other settings than the script declares. In the management UI, open the queue, and under **Delete** select **Delete Queue**. Run the script again: it creates the queue durable.

</details>

<details>
<summary>tv_room_sensor.txt stays empty</summary>

The publisher must be running while the parent runs, each in its own window. In the management UI, the `tv_room` queue shows **Consumers** `1` while Pentaho Data Integration is reading it; if it shows `0`, look again at **Connection** and **Queue name** in **AMQP consumer**. If the parent's log shows `Field [temperature] couldn't be found`, the **Fields** tab of **JSON Input** is empty.

</details>

## Lab Files

Click a file to download. For `.ktr` and `.kjb` files, **Open in Pentaho Data Integration** launches Pentaho Data Integration with the file loaded. If Pentaho Data Integration is already running, the path is copied to your clipboard — switch to Pentaho Data Integration and press `Ctrl+O`, `Ctrl+V`, `Enter`.

These files are also on disk in `C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq`. The publisher and its dependency list:

[sensor_tv_room.py](./files/sensor_tv_room.py)

[requirements.txt](./files/requirements.txt)

### Solution <!-- no-step -->

The parent and child transformations for this lab. Open them alongside your own to compare.

Also on disk at `C:\Workshop-SD-Specialty\04-amqp\06-amqp-rabbitmq\solution`.

[tr_rabbit_consumer.ktr](./files/solution/tr_rabbit_consumer.ktr) <button data-launch="spoon" data-path="files/solution/tr_rabbit_consumer.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution/tr_rabbit_consumer.ktr">View graph</button>

[tr_process_sensor_data.ktr](./files/solution/tr_process_sensor_data.ktr) <button data-launch="spoon" data-path="files/solution/tr_process_sensor_data.ktr">Open in Pentaho Data Integration</button> <button data-graph="files/solution/tr_process_sensor_data.ktr">View graph</button>

---

> **Tip:** Next, the third protocol: partitions, offsets and consumer groups with Apache Kafka. Start with the Kafka [Overview](../07-kafka/guide.md).
