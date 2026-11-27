"""Line 1 of the plant floor: three machines publishing telemetry over MQTT.

Each machine is its own MQTT client. Once a second it publishes one JSON
reading to factory/line1/<machine>/telemetry on HiveMQ (localhost:1883):

    {"ts": 1795700000000, "spindle_temp": 71.4, "vibration": 3.2, "rpm": 1480}

ts is epoch milliseconds. Now and then a machine runs hot (spindle_temp
above 85) or shakes (vibration above 7.0). Each machine also keeps a
retained status, online or offline, on factory/line1/<machine>/status, with
a Last Will that reports offline if it drops without a clean disconnect.

    python line_sensors.py            # all three machines
    python line_sensors.py lathe-02   # one machine only

Needs the Paho MQTT client (pip install -r requirements.txt). Stop it with
Ctrl+C.
"""
import json
import random
import sys
import time

from paho.mqtt import client as mqtt_client

BROKER = 'localhost'
PORT = 1883
MACHINES = {
    # machine: (normal spindle_temp, normal vibration, rpm)
    'press-01': (68.0, 2.5, 900),
    'lathe-02': (74.0, 3.5, 1480),
    'mill-03': (71.0, 4.0, 2200),
}


def connect(machine):
    status = f'factory/line1/{machine}/status'

    def on_connect(client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            client.publish(status, 'online', qos=1, retain=True)
            print(f'{machine}: connected', flush=True)
        else:
            print(f'{machine}: failed to connect: {reason_code}', flush=True)

    client = mqtt_client.Client(callback_api_version=mqtt_client.CallbackAPIVersion.VERSION2,
                                client_id=f'line1-{machine}')
    client.will_set(status, 'offline', qos=1, retain=True)
    client.on_connect = on_connect
    client.connect(BROKER, PORT)
    client.loop_start()
    return client


def reading(machine):
    temp, vib, rpm = MACHINES[machine]
    r = {'ts': int(time.time() * 1000),
         'spindle_temp': round(random.gauss(temp, 3.0), 1),
         'vibration': round(abs(random.gauss(vib, 0.8)), 2),
         'rpm': int(random.gauss(rpm, 15))}
    roll = random.random()
    if roll < 0.06:                       # running hot
        r['spindle_temp'] = round(random.uniform(86.0, 98.0), 1)
    elif roll < 0.10:                     # shaking
        r['vibration'] = round(random.uniform(7.2, 11.0), 2)
    return r


def main():
    names = [m for m in sys.argv[1:] if m in MACHINES] or list(MACHINES)
    clients = {m: connect(m) for m in names}
    sent = 0
    try:
        while True:
            for m, c in clients.items():
                c.publish(f'factory/line1/{m}/telemetry', json.dumps(reading(m)))
                sent += 1
            if sent % (25 * len(clients)) == 0:
                print(f'{sent} readings sent', flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        # A clean disconnect discards the will, so say offline ourselves.
        for m, c in clients.items():
            c.publish(f'factory/line1/{m}/status', 'offline', qos=1, retain=True).wait_for_publish(2)
            c.loop_stop()
            c.disconnect()
        print(f'done - {sent} readings', flush=True)


if __name__ == '__main__':
    main()
