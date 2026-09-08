#!/usr/bin/env bash
# ==============================================================================
# Persistent Named Cloudflare Tunnel Controller
# ==============================================================================
set -euo pipefail
echo "=== [MANI\$OFT] BINDING AUTHENTICATED PERSISTENT CLOUDFLARE TUNNEL ==="
if command -v cloudflared >/dev/null 2>&1; then
    echo "[✓] cloudflared binary available at $(which cloudflared)"
    echo "[*] To link your custom domain, execute:"
    echo "    cloudflared tunnel login"
    echo "    cloudflared tunnel create manisoft-singularity"
    echo "    cloudflared tunnel run manisoft-singularity"
else
    echo "[!] Install or expose cloudflared in your environment."
fi
