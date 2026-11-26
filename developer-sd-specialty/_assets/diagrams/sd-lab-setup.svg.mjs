// The course's lab map: for each of the four workshops, what publishes,
// which broker container it publishes to and on which port, which
// Pentaho Data Integration transformation consumes it, and where the
// data lands; plus the brokers' admin UIs. It is the figure in
// 00-before-you-start/guide.md, section "Set up your environment", before
// the "Do you need to set anything up?" tabs, so lab-VM and own-machine
// readers both see it.
//
// Facts it encodes, and where each comes from:
//   - One command, C:\Streaming\run-podman-streaming.ps1 (the Streaming lab
//     kit), starts HiveMQ, EMQX, RabbitMQ and Kafka as containers; the Kafka
//     lab's MySQL is the MySQL kit's sampledata-mysql (00-before-you-start;
//     03-mqtt-hivemq part 1).
//   - Ports: HiveMQ tcp://localhost:1883, EMQX tcp://localhost:1884,
//     RabbitMQ amqp://localhost:5672, Kafka 127.0.0.1:9092, MySQL
//     kit localhost:3306 (00-before-you-start tab 5, "Ports and
//     logins").
//   - Container names pcm-hivemq (03-mqtt-hivemq part 1), pcm-emqx
//     (04-mqtt-emqx troubleshooting), pcm-rabbitmq (06-amqp-rabbitmq
//     part 1), sampledata-mysql (08-kafka-use-cases part 1). The lessons name no
//     Kafka container, so its box names none.
//   - Admin UIs: HiveMQ Control Center http://localhost:9090, EMQX
//     Dashboard http://localhost:18083, RabbitMQ management
//     http://localhost:15672 (00-before-you-start tab 5; their logins
//     stay in that table). The table lists no UI for Kafka.
//   - Publishers: sensor.py to industrial/robot/sensor on HiveMQ
//     (03-mqtt-hivemq part 2); tr_mqtt_producer.ktr's MQTT producer to
//     SensorData on EMQX (04-mqtt-emqx part 1: this lab publishes from
//     Pentaho Data Integration, not from Python); sensor_tv_room.py to the
//     tv_room queue (06-amqp-rabbitmq part 2); produce_users.py to
//     pdi-users (08-kafka-use-cases part 1).
//   - Consumers and their outputs: tr_robot_consumer.ktr (MQTT consumer)
//     writes robot_sensor.txt (03-mqtt-hivemq parts 3-4);
//     tr_mqtt_consumer.ktr (MQTT consumer) writes minor_alert.txt and
//     major_alert.txt (04-mqtt-emqx parts 2-4); tr_rabbit_consumer.ktr
//     (AMQP consumer) writes tv_room_sensor.txt (06-amqp-rabbitmq parts
//     3-5); users-to-db-parent.ktr (Kafka consumer) loads user_events in
//     kafka_warehouse on MySQL (08-kafka-use-cases parts 2-4).
//
// Colors (see README.md): slate the publishers (stand-in feeds), violet
// the brokers, blue Pentaho Data Integration, green the outputs, amber
// the browser and the admin UIs.
//
// The diagram is 1080 wide so four columns of text fit; the figure in
// the guide is 800 wide, like every other diagram.
//
// Run from this folder:   node sd-lab-setup.svg.mjs
// It writes sd-lab-setup.svg here and ../images/sd-lab-setup.png at
// twice the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// Canvas and grid: four columns of 224-wide boxes, 44 apart, each in a
// panel 10px wider on either side; four rows, one per workshop, 96 apart.
const d = new Diagram(1080, 568);
const BW = 224, BH = 80;
const COL = [26, 294, 562, 830]; // box x of each column
const ROW = [76, 172, 268, 364]; // box y of each row (HiveMQ, EMQX, RabbitMQ, Kafka)

// One panel per column, all the same height, under the boxes.
const PANEL = [
  { role: 'support', iconName: 'square-terminal', title: 'Publishers', sub: 'each running in its own window' },
  { role: 'server', iconName: 'container', title: 'Brokers, in containers', sub: 'run-podman-streaming.ps1' },
  { role: 'tool', iconName: 'workflow', title: 'Pentaho Data Integration', sub: 'a parent with a consumer step' },
  { role: 'store', iconName: 'hard-drive', title: 'Outputs', sub: 'in each lab’s folder, or MySQL' },
];
PANEL.forEach((p, i) => d.panel({ x: COL[i] - 10, y: 16, w: BW + 20, h: 444, ...p }));

// Each row: [publisher, broker, consumer, output], left to right.
const rows = [
  [
    { role: 'support', iconName: 'square-terminal', title: 'sensor.py', lines: ['Python, a reading a second', 'industrial/robot/sensor'] },
    { role: 'server', iconName: 'radio-tower', title: 'HiveMQ', lines: ['pcm-hivemq (MQTT)', 'tcp://localhost:1883'] },
    { role: 'tool', iconName: 'inbox', title: 'MQTT consumer', lines: ['tr_robot_consumer.ktr', 'HiveMQ lab'] },
    { role: 'store', iconName: 'file-text', title: 'robot_sensor.txt', lines: ['appended for each batch'] },
  ],
  [
    { role: 'support', iconName: 'workflow', title: 'MQTT producer', lines: ['tr_mqtt_producer.ktr,', 'topic SensorData'] },
    { role: 'server', iconName: 'radio-tower', title: 'EMQX', lines: ['pcm-emqx (MQTT)', 'tcp://localhost:1884'] },
    { role: 'tool', iconName: 'inbox', title: 'MQTT consumer', lines: ['tr_mqtt_consumer.ktr', 'EMQX lab'] },
    { role: 'store', iconName: 'file-text', title: 'Alert files', lines: ['minor_alert.txt,', 'major_alert.txt'] },
  ],
  [
    { role: 'support', iconName: 'square-terminal', title: 'sensor_tv_room.py', lines: ['Python, a reading a second', 'queue tv_room'] },
    { role: 'server', iconName: 'rabbit', title: 'RabbitMQ', lines: ['pcm-rabbitmq (AMQP)', 'amqp://localhost:5672'] },
    { role: 'tool', iconName: 'inbox', title: 'AMQP consumer', lines: ['tr_rabbit_consumer.ktr', 'RabbitMQ lab'] },
    { role: 'store', iconName: 'file-text', title: 'tv_room_sensor.txt', lines: ['appended for each batch'] },
  ],
  [
    { role: 'support', iconName: 'square-terminal', title: 'produce_users.py', lines: ['Python, an event a second', 'topic pdi-users'] },
    { role: 'server', iconName: 'layers', title: 'Kafka', lines: ['KRaft mode', '127.0.0.1:9092'] },
    { role: 'tool', iconName: 'inbox', title: 'Kafka consumer', lines: ['users-to-db-parent.ktr', 'Kafka lab'] },
    { role: 'store', iconName: 'database', title: 'MySQL user_events', lines: ['sampledata-mysql :3306,', 'database kafka_warehouse'] },
  ],
];

// Draw each row's four boxes and the three arrows that join them.
rows.forEach((cells, r) => {
  const g = cells.map((c, i) => d.box({ x: COL[i], y: ROW[r], w: BW, h: BH, ...c }));
  for (let i = 0; i < 3; i++) {
    d.arrow({ x1: g[i].r, y1: g[i].cy, x2: g[i + 1].x - 1, y2: g[i + 1].cy, straight: true });
  }
});

// The admin UIs, under everything: three of the four brokers have one,
// and each opens in a browser. Their logins are in the lesson's "Ports
// and logins" table, not here, so the line fits the bar.
d.bar({ x: 16, y: 480, w: 1048, h: 68, role: 'browser', iconName: 'globe', title: 'In a browser: the brokers’ admin UIs (Kafka has none in this course)', line: 'HiveMQ Control Center http://localhost:9090  ·  EMQX Dashboard http://localhost:18083  ·  RabbitMQ management http://localhost:15672' });

d.write(import.meta.url);
