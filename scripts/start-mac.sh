#!/usr/bin/env bash
# Starts Prelegal on http://localhost:8000 (override with PRELEGAL_PORT=9000).
# Stop it with scripts/stop-mac.sh.
exec "$(dirname "$0")/lib/start.sh" "$@"
