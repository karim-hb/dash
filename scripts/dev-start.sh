#!/bin/bash

echo "Cleaning up Next.js processes and lock files..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
rm -f .next/dev/lock 2>/dev/null || true
sleep 1

# Try ports 3015-3025
for PORT in {3015..3025}; do
  if ! lsof -ti:$PORT >/dev/null 2>&1; then
    echo "Using port $PORT"
    export PORT=$PORT
    exec next dev -p $PORT
  fi
done

echo "No free port found in 3015-3025"
exit 1
