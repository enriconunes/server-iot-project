"""MQTT Worker: subscribes to radar/distance and persists readings via REST API."""

import json
import os
import signal
import sys

import paho.mqtt.client as mqtt

from sensor.adapters.http_publisher import HttpPublisher


def main() -> None:
    broker = os.getenv("MQTT_BROKER", "localhost")
    port = int(os.getenv("MQTT_PORT", "1883"))
    topic = os.getenv("MQTT_TOPIC", "radar/distance")
    api_base = os.getenv("API_BASE", "http://localhost:3000/api")
    api_key = os.getenv("API_KEY", "")

    print(f"[mqtt-worker] broker={broker}:{port} topic={topic}")
    print(f"[mqtt-worker] api={api_base}")

    http_pub = HttpPublisher(api_base=api_base, api_key=api_key)

    def on_connect(client, userdata, flags, reason_code, properties):
        print(f"[mqtt-worker] connected, subscribing to {topic}")
        client.subscribe(topic)

    def on_message(client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            distance = data.get("distance")
            if distance is None:
                return
            angle = data.get("angle", 0)
            status, body = http_pub.post_reading(distance, angle=angle)
            if status == 201:
                print(f"[mqtt-worker] persisted distance={distance:.2f} id={body.get('id', '?')}")
            else:
                print(f"[mqtt-worker] API error: {status} {body}")
        except Exception as e:
            print(f"[mqtt-worker] error: {e}")

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port, keepalive=60)

    running = True

    def shutdown(sig, frame):
        nonlocal running
        running = False
        client.disconnect()

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    print("[mqtt-worker] running... Ctrl+C to stop")
    client.loop_forever()


if __name__ == "__main__":
    main()
