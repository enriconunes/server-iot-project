from abc import ABC, abstractmethod


class SensorPort(ABC):
    """Port interface for distance sensors (Hexagonal Architecture)."""

    @abstractmethod
    def read_distance(self) -> float:
        """Read distance in centimeters (2.0 - 400.0)."""
        ...

    @abstractmethod
    def cleanup(self) -> None:
        """Release hardware resources."""
        ...
