"""Simulated robot sensor: publishes one reading a second over MQTT.

Each message is JSON, a temperature and an x/y/z position, sent to the
topic acme/plant1/line1/robot1/telemetry on localhost. Needs the Paho MQTT client
(pip install -r requirements.txt) and Python 3.11 or later.

    python sensor.py          # HiveMQ on 1883
    python sensor.py 1884     # EMQX, on its own port

Stop it with Ctrl+C.
"""
import json
import random
import sys
import time

from paho.mqtt import client as mqtt_client

broker = 'localhost'
port = int(sys.argv[1]) if len(sys.argv) > 1 else 1883
topic = "acme/plant1/line1/robot1/telemetry"
client_id = f'python-mqtt-{random.randint(0, 1000)}'


def connect_mqtt():
    def on_connect(client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect: {reason_code}")

    client = mqtt_client.Client(callback_api_version=mqtt_client.CallbackAPIVersion.VERSION2,
                                client_id=client_id)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client


def publish(client):
    while True:
        temperature = random.uniform(20.0, 100.0)
        position = {'x': random.uniform(-10.0, 10.0),
                    'y': random.uniform(-10.0, 10.0),
                    'z': random.uniform(-10.0, 10.0)}
        message = json.dumps({'temperature': temperature, 'position': position})
        result = client.publish(topic, message)
        if result.rc == mqtt_client.MQTT_ERR_SUCCESS:
            print(f"Sent `{message}` to topic `{topic}`")
        else:
            print(f"Failed to send message to topic {topic}")
        time.sleep(1)


def run():
    client = connect_mqtt()
    client.loop_start()
    try:
        publish(client)
    except KeyboardInterrupt:
        client.loop_stop()
        client.disconnect()


if __name__ == '__main__':
    run()
