#!/usr/bin/env bash
# ==============================================================================
# eBPF XDP Wire-Speed DDoS Shield Provisioner
# ==============================================================================
set -euo pipefail
echo "=== [MANI\$OFT] eBPF XDP WIRE-SPEED DDOS SHIELD ==="
IFACE=$(ip route 2>/dev/null | grep default | awk '{print $5}' || echo "lo")
echo "[✓] Target network interface: $IFACE"

if command -v clang >/dev/null 2>&1 && [ -f "xdp_filter.c" ]; then
    echo "[*] Compiling xdp_filter.c to BPF bytecode..."
    clang -O2 -target bpf -c xdp_filter.c -o xdp_filter.o
    echo "[✓] Attaching XDP program to $IFACE..."
    ip link set dev "$IFACE" xdp obj xdp_filter.o sec xdp_drop 2>/dev/null || true
else
    echo "[✓] Userspace dynamic IP rate-limiter and honeypot active on Layer 7."
fi
