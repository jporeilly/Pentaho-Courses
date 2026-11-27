"""Watch the robot's status topic: prints every message on
acme/plant1/line1/robot1/state, starting with the retained one the broker holds.

    python status.py          # HiveMQ on 1883

Stop it with Ctrl+C.
"""
import sys
import time

from paho.mqtt import client as mqtt_client

broker = 'localhost'
port = int(sys.argv[1]) if len(sys.argv) > 1 else 1883
status_topic = "acme/plant1/line1/robot1/state"


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"Subscribed to {status_topic} - Ctrl+C to stop", flush=True)
        client.subscribe(status_topic, qos=1)
    else:
        print(f"Failed to connect: {reason_code}", flush=True)


def on_message(client, userdata, msg):
    kind = "retained" if msg.retain else "live"
    print(f"{time.strftime('%H:%M:%S')}  {msg.payload.decode()}  ({kind})", flush=True)


client = mqtt_client.Client(callback_api_version=mqtt_client.CallbackAPIVersion.VERSION2,
                            client_id="robot-status-watcher")
client.on_connect = on_connect
client.on_message = on_message
client.connect(broker, port)
try:
    client.loop_forever()
except KeyboardInterrupt:
    client.disconnect()
