from sensor.domain.ports import SensorPort
from sensor.adapters.simulated import SimulatedSensorAdapter
from sensor.adapters.hcsr04 import RealHCSR04Adapter


def create_sensor(mode: str, trigger_pin: int = 4, echo_pin: int = 17) -> SensorPort:
    """Factory: creates the appropriate sensor adapter based on mode."""
    if mode == "real":
        return RealHCSR04Adapter(trigger_pin=trigger_pin, echo_pin=echo_pin)
    return SimulatedSensorAdapter()
