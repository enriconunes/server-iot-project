#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Parse flags
SENSOR_MODE="real"
for arg in "$@"; do
  case "$arg" in
    --fake) SENSOR_MODE="simulated" ;;
  esac
done

echo "=== IoT Project - Starting ==="
echo "  Sensor mode: $SENSOR_MODE"
echo ""

# Build and start all services
SENSOR_MODE="$SENSOR_MODE" docker compose up -d --build

echo ""
echo "=== All services running ==="
echo ""
echo "  URLs:"
echo "    http://app.localhost          Dashboard (radar + tabela + stats)"
echo "    http://api.localhost          API REST (sensor, readings, bell, sse)"
echo "    http://simulator.localhost    Canvas Simulator (mouse = leitura)"
echo "    http://mqtt.localhost         MQTT WebSocket"
echo ""
echo "  Infra:"
echo "    localhost:1883                MQTT Broker (nativo)"
echo "    localhost:5432                PostgreSQL"
echo ""
echo "  Logs:  docker compose logs -f"
echo "  Stop:  ./stop.sh"
echo ""
