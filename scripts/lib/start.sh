#!/usr/bin/env bash
# Shared by start-mac.sh and start-linux.sh: builds the Prelegal image and runs
# it in the background. Set PRELEGAL_PORT to serve on a port other than 8000.
set -euo pipefail

cd "$(dirname "$0")/../.."

IMAGE="prelegal"
CONTAINER="prelegal"
PORT="${PRELEGAL_PORT:-8000}"

docker build -t "$IMAGE" .
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" -p "$PORT:8000" "$IMAGE" >/dev/null

echo "Prelegal is running at http://localhost:$PORT"
