"""Read every Avro file the lake lab landed in MinIO, without Pentaho Data
Integration: an open format, readable by any engine.

    python query_lake.py              # every signups_*.avro in streaming-lake

For each file it prints the batch time, the rows in it and its size; then
the totals, the schema the files carry, and how many of the landed messages
are JSON that keeps the sign-up contract. The lake keeps them all: it lands
what arrived, and leaves judging it to whoever reads it.
"""

import io
import json

from fastavro import reader
from minio import Minio

ENDPOINT = "127.0.0.1:9000"
BUCKET = "streaming-lake"
PREFIX = "signups_"
GENDERS = {"FEMALE", "MALE", "OTHER"}


def keeps_contract(message: str) -> bool:
    try:
        e = json.loads(message)
    except (TypeError, ValueError):
        return False
    return (isinstance(e, dict) and bool(e.get("userid")) and e.get("gender") in GENDERS
            and isinstance(e.get("registertime"), int))


def main() -> None:
    client = Minio(ENDPOINT, access_key="minioadmin", secret_key="minioadmin", secure=False)
    objects = sorted(client.list_objects(BUCKET, prefix=PREFIX), key=lambda o: o.object_name)
    if not objects:
        print(f"No {PREFIX}*.avro files in {BUCKET} yet: run lake-parent first.")
        return
    total = good = 0
    schema = None
    offsets = []
    print(f"{'file':40} {'landed_at':24} {'rows':>5} {'bytes':>7}")
    for o in objects:
        data = client.get_object(BUCKET, o.object_name).read()
        r = reader(io.BytesIO(data))
        schema = schema or r.writer_schema
        rows = list(r)
        total += len(rows)
        good += sum(keeps_contract(x["message"]) for x in rows)
        offsets += [x["kafka_offset"] for x in rows]
        landed = rows[0]["landed_at"].strftime("%Y-%m-%d %H:%M:%S") if rows else "-"
        print(f"{o.object_name:40} {landed:24} {len(rows):>5} {o.size:>7}")
    print(f"\n{len(objects)} files, {total} rows, offsets {min(offsets)} to {max(offsets)}, "
          f"{len(set(offsets))} distinct")
    print(f"{good} keep the sign-up contract, {total - good} do not: the lake lands them all")
    print("\nThe schema every file carries:")
    print(f"  record {schema['name']}: " + ", ".join(f"{f['name']} ({type_name(f['type'])})" for f in schema["fields"]))


def type_name(t) -> str:
    """An Avro type as a reader would say it: 'string or null', 'timestamp-millis'."""
    if isinstance(t, list):
        return " or ".join(type_name(x) for x in t if x != "null") + (" or null" if "null" in t else "")
    if isinstance(t, dict):
        return t.get("logicalType", t.get("type", "?"))
    return t


if __name__ == "__main__":
    main()
