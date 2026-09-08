#!/usr/bin/env bash
# ==============================================================================
# Ephemeral Micro-Tunnel & Mobile QR Dispatcher
# ==============================================================================
PORT="${1:-3000}"
echo "=== [MANI\$OFT] PROVISIONING EPHEMERAL MICRO-TUNNEL (PORT $PORT) ==="
if command -v cloudflared >/dev/null 2>&1; then
    echo "[*] Launching Cloudflare quick tunnel for port $PORT..."
    cloudflared tunnel --url "http://127.0.0.1:$PORT" 2>&1 | tee /tmp/tunnel_$PORT.log &
    TUNNEL_PID=$!
    echo "[✓] Tunnel launched (PID: $TUNNEL_PID). Log: /tmp/tunnel_$PORT.log"
else
    echo "[!] cloudflared not found in PATH. Using local LAN address."
fi
