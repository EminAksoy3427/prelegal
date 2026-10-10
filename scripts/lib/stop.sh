#!/usr/bin/env bash
# Shared by stop-mac.sh and stop-linux.sh: stops and removes the Prelegal
# container. Its temporary database goes with it.
set -euo pipefail

CONTAINER="prelegal"

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  docker rm -f "$CONTAINER" >/dev/null
  echo "Prelegal stopped."
else
  echo "Prelegal is not running."
fi
