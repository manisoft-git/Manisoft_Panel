#!/usr/bin/env bash
# ==============================================================================
# Tri-Tunnel Watchdog & Auto-Failover Monitor
# ==============================================================================
TARGET_URL="http://127.0.0.1:3000"
FAIL_COUNT=0

while true; do
    if curl -s -f -m 5 "$TARGET_URL/api/health" >/dev/null 2>&1; then
        FAIL_COUNT=0
    else
        FAIL_COUNT=$(( FAIL_COUNT + 1 ))
        echo "[!] Health check failed ($FAIL_COUNT/3)"
        if [ "$FAIL_COUNT" -ge 3 ]; then
            echo "[*] Primary probe failed 3x. Triggering secondary tunnel failover..."
            ./setup-tunnel.sh 3000 || true
            FAIL_COUNT=0
        fi
    fi
    sleep 60
done
