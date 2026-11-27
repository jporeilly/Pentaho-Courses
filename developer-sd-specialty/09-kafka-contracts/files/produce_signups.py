"""Publish sign-up events to the pdi-signups topic, some of which break
the contract the consumer expects.

The contract, one JSON object per message:

    userid        User_1, User_2, ...           required
    regionid      Region_1 .. Region_9
    gender        FEMALE | MALE | OTHER         required, one of these
    registertime  epoch MILLISECONDS            a number

Every fourth event breaks it, in this order, over and over:

    1st  gender "F"                  (valid JSON, wrong value)
    2nd  no userid                   (valid JSON, missing field)
    3rd  registertime as text        (valid JSON, wrong type)
    4th  not JSON at all             (a line of key=value text)

So 40 events are 30 that keep the contract and 10 that break it.

    python produce_signups.py                # one event a second until Ctrl+C
    python produce_signups.py --count 40     # 40 events, one a second, then stop
    python produce_signups.py --count 40 --fast
    python produce_signups.py --count 20 --start 41   # User_41 .. User_60
"""

import json
import random
import sys
import time
from confluent_kafka import Producer

BOOTSTRAP = "127.0.0.1:9092"
TOPIC = "pdi-signups"

REGIONS = [f"Region_{i}" for i in range(1, 10)]
GENDERS = ["FEMALE", "MALE", "OTHER"]


def event(n: int) -> bytes:
    good = {
        "registertime": int(time.time() * 1000),
        "userid": f"User_{n}",
        "regionid": random.choice(REGIONS),
        "gender": random.choice(GENDERS),
    }
    if n % 4:
        return json.dumps(good).encode("utf-8")
    kind = (n // 4 - 1) % 4
    if kind == 0:
        good["gender"] = "F"
    elif kind == 1:
        del good["userid"]
    elif kind == 2:
        good["registertime"] = time.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return f"userid=User_{n};regionid={good['regionid']};gender={good['gender']}".encode("utf-8")
    return json.dumps(good).encode("utf-8")


def main() -> None:
    fast = "--fast" in sys.argv
    count = 0
    start = 1
    if "--start" in sys.argv:
        start = int(sys.argv[sys.argv.index("--start") + 1])
    if "--count" in sys.argv:
        count = int(sys.argv[sys.argv.index("--count") + 1])
    producer = Producer({"bootstrap.servers": BOOTSTRAP})
    print(f"Producing to {TOPIC} on {BOOTSTRAP}" + (f", {count} events" if count else " - Ctrl+C to stop"))
    sent = broken = 0
    n = start - 1
    try:
        while not count or sent < count:
            n += 1
            sent += 1
            if n % 4 == 0:
                broken += 1
            producer.produce(TOPIC, event(n))
            producer.poll(0)
            if sent % 10 == 0:
                print(f"  {sent} events sent (up to User_{n}), {broken} of them break the contract")
            if not fast:
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        producer.flush(10)
        print(f"done - {sent} events, User_{start} to User_{n}: {sent - broken} keep the contract, {broken} break it")


if __name__ == "__main__":
    main()
