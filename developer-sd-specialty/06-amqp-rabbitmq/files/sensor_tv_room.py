"""Simulated TV room sensor: publishes one JSON reading a second to the
RabbitMQ queue tv_room, through the default exchange. Needs pika
(pip install -r requirements.txt). Stop it with Ctrl+C."""
import json
import random
import time

import pika

rabbitmq_host = 'localhost'
port = 5672
queue_name = 'tv_room'


def generate_sensor_data():
    return {
        'temperature': random.uniform(20.0, 100.0),
        'pressure': random.uniform(800.0, 1200.0),
        'humidity': random.uniform(30.0, 80.0)
    }


def publish_sensor_data():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host, port=port))
    channel = connection.channel()
    # Durable, as the AMQP consumer step creates it: RabbitMQ 4 refuses a
    # transient queue that is not exclusive, and a queue must be declared
    # with the same settings by everyone who declares it.
    channel.queue_declare(queue=queue_name, durable=True)
    try:
        while True:
            message = json.dumps(generate_sensor_data())
            channel.basic_publish(exchange='', routing_key=queue_name, body=message)
            print(f"Sent sensor data: {message}", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        connection.close()


if __name__ == '__main__':
    publish_sensor_data()
