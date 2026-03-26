import json
from datetime import datetime, timezone

import paho.mqtt.client as mqtt


class MqttPublisher:
    """Publishes sensor readings to an MQTT broker."""

    def __init__(
        self,
        broker_host: str = "localhost",
        broker_port: int = 1883,
        topic: str = "radar/distance",
    ) -> None:
        self.topic = topic
        self._client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self._client.connect(broker_host, broker_port, keepalive=60)
        self._client.loop_start()

    def publish(self, distance: float, angle: float, source: str = "simulated") -> None:
        payload = json.dumps({
            "distance": distance,
            "angle": angle,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": source,
        })
        self._client.publish(self.topic, payload, qos=1)

    def disconnect(self) -> None:
        self._client.loop_stop()
        self._client.disconnect()
