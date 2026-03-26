#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "=== IoT Project - Stopping ==="

docker compose down -v

echo "=== All stopped ==="
