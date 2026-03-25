import random

from sensor.domain.ports import SensorPort


class SimulatedSensorAdapter(SensorPort):
    """Generates random distance readings within HC-SR04 range."""

    def __init__(self, min_cm: float = 2.0, max_cm: float = 400.0) -> None:
        self.min_cm = min_cm
        self.max_cm = max_cm

    def read_distance(self) -> float:
        return round(random.uniform(self.min_cm, self.max_cm), 2)

    def cleanup(self) -> None:
        pass
