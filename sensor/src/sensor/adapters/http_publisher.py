import json
import requests


class HttpPublisher:
    """Publishes sensor readings to the REST API via HTTP POST."""

    def __init__(
        self,
        api_base: str = "http://localhost:3000/api",
        api_key: str = "",
        timeout: int = 5,
    ) -> None:
        self.api_base = api_base
        self.api_key = api_key
        self.timeout = timeout

    def _headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
        }

    def post_reading(self, distance: float, angle: float = 0, unit: str = "cm") -> tuple:
        payload = {"distance": distance, "angle": angle, "unit": unit}
        try:
            resp = requests.post(
                f"{self.api_base}/sensor",
                headers=self._headers(),
                data=json.dumps(payload),
                timeout=self.timeout,
            )
            return resp.status_code, resp.json() if resp.content else {}
        except requests.exceptions.Timeout:
            return None, "Timeout"
        except requests.exceptions.ConnectionError as e:
            return None, f"Connection error: {e}"
        except Exception as e:
            return None, f"Unexpected error: {e}"

