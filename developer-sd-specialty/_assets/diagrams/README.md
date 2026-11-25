# Course diagrams

The Developer - SD Specialty course's diagrams are hand-laid
SVG, drawn with the shared kit every course uses,
[`scripts/diagram-kit.mjs`](../../../../scripts/diagram-kit.mjs): panels
with a colored title strip, same-size boxes with a Lucide icon in a white
disc, full-width bars, a row table (`tableBox`), an entity table
(`entity`), and arrows with their labels in white pills. Icons come from
the app's own `lucide-react` package, so they match the icons in the
guide. The diagrams name the course's own brokers, ports, topics,
queues, transformations, steps, batch settings and tables, and draw only
what the lessons and their lab files state.

* Each diagram is `<name>.svg.mjs`, ending in `d.write(import.meta.url)`.
  Run it from this folder, and it writes `<name>.svg` and renders
  `../images/<name>.png` at twice its size through headless Chrome or
  Edge:

  ```bash
  # Rebuild one diagram: writes kafka-users-to-db.svg and ../images/kafka-users-to-db.png.
  node kafka-users-to-db.svg.mjs
  ```

* The QoS levels and the Last Will are sequence diagrams.
  [`sequence.mjs`](sequence.mjs) draws them with the kit's own parts: one
  panel per actor as a tall lane with a dashed lifeline, one kit arrow
  per numbered message, and a pill on a lifeline for a step an actor
  takes alone. It is a copy of the High Availability Specialty course's
  helper, kept here so the course stands on its own. It is a helper, not
  a diagram, so it has no `.svg` of its own.
* Each script's header comment lists the facts it draws, and the lessons
  they come from. Change a fact in a lesson, and change the diagram too.
* Every figure in the guide is 800 wide. `sd-lab-setup` is drawn 1080
  wide, so its four columns of text fit, and shown at 800. Edit the
  `.svg.mjs`, run it, and commit the script, the `.svg` and the `.png`
  together.

Color by role: blue a tool you use (Pentaho Data Integration, a
consumer step, Get records from stream), violet a server or an engine
(the brokers, and the child steps that transform: JSON input, Select
values, Formula), green a store or a write (Table output, the output
files, MySQL's `user_events`), amber the browser or a check (the admin
UIs, the batch threshold, offset management, the MQTT clients you watch a
topic with), slate a supporting service (the publishers, which stand in
for real devices, and the transformation panels), and white a result
(what each QoS level guarantees). Red marks a failure: the band where
`sensor.py` dies without a DISCONNECT. Keep one icon per thing across the
diagrams:

| Icon | Stands for |
| --- | --- |
| `square-terminal` | a Python publisher: `sensor.py`, `sensor_tv_room.py`, `produce_users.py` |
| `send` | a sender, the publisher side of a QoS exchange |
| `workflow` | a transformation: a parent, a child, `tr_mqtt_producer.ktr` |
| `radio-tower` | an MQTT broker: HiveMQ, EMQX, or any broker |
| `rabbit` | RabbitMQ |
| `layers` | Kafka, the topic `pdi-users` |
| `container` | the broker containers, `setup-services.ps1 -Streaming` |
| `inbox` | a consumer step: MQTT consumer, AMQP consumer, Kafka consumer |
| `timer` | the batch threshold: Duration (ms) or Number of records |
| `sliders-horizontal` | the labs' Batch tab settings |
| `bookmark` | Kafka offset management |
| `rows-3` | Get records from stream |
| `file-json` | JSON input |
| `list-filter` | Select values |
| `calculator` | Formula, or the transform steps together |
| `database` | Table output, MySQL, `user_events` |
| `file-text` | an output text file |
| `hard-drive` | the outputs |
| `globe` | the browser, the admin UIs |
| `eye` | an MQTT client watching a topic, such as MQTT Explorer |
| `info` | a note at the foot of a diagram |

| Diagram | Page |
| --- | --- |
| `sd-lab-setup` | Before You Start (00), "Set up your environment", before the setup tabs: each workshop's publisher, broker container and port, consuming transformation and output, and the three admin UIs |
| `parent-child-streaming` | Streaming Data Overview (01), "The Pentaho Data Integration streaming pattern": the broker, the parent's consumer step, the first-threshold-wins batch, the child from Get records from stream to the load, and each lab's Batch tab |
| `mqtt-qos-levels` | MQTT Overview (02), "Quality of Service (QoS)" tab: QoS 0 PUBLISH only; QoS 1 PUBLISH, a re-send that can duplicate, PUBACK; QoS 2 PUBLISH, PUBREC, PUBREL, PUBCOMP |
| `mqtt-lwt-retained` | HiveMQ (03), part 5 "Last Will and Testament": the will on CONNECT, the retained `online`, the window closed without DISCONNECT, the will `offline`, and a later subscriber getting the retained `offline` |
| `kafka-users-to-db` | Use Cases (08), the introduction: `produce_users.py` to `pdi-users`, `users-to-db-parent`'s Kafka consumer (500 ms or 100 records), `users-to-db-child`'s five steps, and the `user_events` table |
