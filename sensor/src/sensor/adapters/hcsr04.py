from sensor.domain.ports import SensorPort

try:
    from gpiozero import DistanceSensor
except ImportError:
    DistanceSensor = None


class RealHCSR04Adapter(SensorPort):
    """Reads distance from a real HC-SR04 sensor via Raspberry Pi GPIO."""

    def __init__(self, trigger_pin: int = 4, echo_pin: int = 17) -> None:
        if DistanceSensor is None:
            raise RuntimeError(
                "gpiozero is not installed. "
                "Install with: pip install -e '.[hardware]'"
            )
        self._sensor = DistanceSensor(
            echo=echo_pin,
            trigger=trigger_pin,
            max_distance=4,  # 4 meters
        )

    def read_distance(self) -> float:
        return round(self._sensor.distance * 100, 2)  # meters -> cm

    def cleanup(self) -> None:
        self._sensor.close()
