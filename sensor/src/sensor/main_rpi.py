import os
import signal
import sys
import time

from sensor.app import create_sensor
from sensor.adapters.mqtt_publisher import MqttPublisher
from sensor.adapters.http_publisher import HttpPublisher

try:
    from gpiozero import Button
except ImportError:
    Button = None


def main() -> None:
    mode = os.getenv("SENSOR_MODE", "simulated")
    broker = os.getenv("MQTT_BROKER", "localhost")
    mqtt_port = int(os.getenv("MQTT_PORT", "1883"))
    interval = float(os.getenv("PUBLISH_INTERVAL", "0.1"))
    angle = float(os.getenv("SENSOR_ANGLE", "0"))
    trigger_pin = int(os.getenv("TRIG_PIN", "4"))
    echo_pin = int(os.getenv("ECHO_PIN", "17"))
    button_pin = int(os.getenv("BUTTON_PIN", "27"))
    max_distance_cm = float(os.getenv("MAX_DISTANCE_CM", "20"))
    tolerance_cm = float(os.getenv("TOLERANCE_CM", "0.5"))

    api_base = os.getenv("API_BASE", "https://server-iot-project.vercel.app/api")
    api_key = os.getenv("API_KEY", "")

    print("=" * 55)
    print("  Sensor HC-SR04 — Unified IoT Project")
    print(f"  Mode           : {mode}")
    print(f"  MQTT broker    : {broker}:{mqtt_port}")
    print(f"  API base       : {api_base}")
    print(f"  Max distance   : {max_distance_cm} cm")
    print(f"  Tolerance      : {tolerance_cm} cm")
    print(f"  Interval       : {interval}s ({int(1/interval)} Hz)")
    print(f"  GPIO TRIG/ECHO : {trigger_pin}/{echo_pin}")
    print(f"  GPIO Button    : {button_pin}")
    print("  Ctrl+C to exit")
    print("=" * 55)

    sensor = create_sensor(mode, trigger_pin=trigger_pin, echo_pin=echo_pin)
    mqtt_pub = MqttPublisher(broker_host=broker, broker_port=mqtt_port)
    http_pub = HttpPublisher(api_base=api_base, api_key=api_key)

    # Setup physical button for bell toggle
    button = None
    if Button is not None and mode == "real":
        try:
            button = Button(button_pin, pull_up=True, bounce_time=0.3)

            def toggle_bell():
                status, body = http_pub.toggle_bell()
                if status == 200:
                    state = "ON" if body.get("active") else "OFF"
                    print(f"\n[BUTTON] Bell -> {state}")
                else:
                    print(f"\n[BUTTON] ERROR {status}")

            button.when_pressed = toggle_bell
        except Exception as e:
            print(f"[WARN] Button setup failed: {e}")

    running = True

    def shutdown(sig, frame):
        nonlocal running
        running = False

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    source = "hcsr04" if mode == "real" else "simulated"
    last_sent_distance = None

    try:
        while running:
            distance = sensor.read_distance()

            # Filter: ignore readings beyond max distance
            if distance > max_distance_cm:
                print(f"[READ] {distance:.2f} cm -> skip (> {max_distance_cm} cm)")
                time.sleep(interval)
                continue

            # Filter: ignore readings within tolerance
            if last_sent_distance is not None:
                diff = abs(distance - last_sent_distance)
                if diff <= tolerance_cm:
                    print(f"[READ] {distance:.2f} cm -> skip (tolerance)")
                    time.sleep(interval)
                    continue

            # Publish to MQTT (real-time) — mqtt-worker handles persistence
            mqtt_pub.publish(distance=distance, angle=angle, source=source)
            print(f"[SEND] {distance:.2f} cm -> MQTT")

            last_sent_distance = distance
            time.sleep(interval)
    finally:
        print("\n[INFO] Shutting down...")
        sensor.cleanup()
        mqtt_pub.disconnect()
        if button:
            button.close()
        print("[INFO] GPIO clean. Exiting.")


if __name__ == "__main__":
    main()
