"""Publish simulated user-registration events to the pdi-users topic.

Replaces the original workshop's Kafka Connect datagen connector with
a laptop-friendly script. The event shape matches the datagen users
quickstart exactly - the consumer transformations parse these fields:

    userid        User_1, User_2, ...
    regionid      Region_1 .. Region_9
    gender        FEMALE | MALE | OTHER
    registertime  epoch MILLISECONDS (the child ktr divides by 1000)

Run it while the consumer transformation is running:

    python produce_users.py            # localhost:9092, 1 event/sec
    python produce_users.py --fast     # no delay between events
"""

import json
import random
import sys
import time
from confluent_kafka import Producer

BOOTSTRAP = "127.0.0.1:9092"
TOPIC = "pdi-users"

REGIONS = [f"Region_{i}" for i in range(1, 10)]
GENDERS = ["FEMALE", "MALE", "OTHER"]


def main() -> None:
    fast = "--fast" in sys.argv
    producer = Producer({"bootstrap.servers": BOOTSTRAP})
    print(f"Producing to {TOPIC} on {BOOTSTRAP} - Ctrl+C to stop")
    n = 0
    try:
        while True:
            n += 1
            event = {
                "registertime": int(time.time() * 1000),
                "userid": f"User_{n}",
                "regionid": random.choice(REGIONS),
                "gender": random.choice(GENDERS),
            }
            producer.produce(TOPIC, json.dumps(event).encode("utf-8"))
            producer.poll(0)
            if n % 25 == 0:
                print(f"  {n} events sent")
            if not fast:
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        producer.flush(10)
        print(f"done - {n} events")


if __name__ == "__main__":
    main()
