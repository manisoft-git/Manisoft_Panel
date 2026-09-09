#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT // SOVEREIGN 24/7 ONLINE DAEMON & WATCHDOG SUPERVISOR
# Enables online access and autonomous AI control even when terminal is closed.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVER_PID_FILE="$SCRIPT_DIR/.manisoft_server.pid"
TUNNEL_PID_FILE="$SCRIPT_DIR/.manisoft_tunnel.pid"
WATCHDOG_PID_FILE="$SCRIPT_DIR/.manisoft_watchdog.pid"
PUBLIC_URL_FILE="$SCRIPT_DIR/PUBLIC_ONLINE_URL.txt"

SERVER_LOG="/tmp/manisoft_server.log"
TUNNEL_LOG="/tmp/manisoft_tunnel.log"
WATCHDOG_LOG="/tmp/manisoft_watchdog.log"

PORT=3000

# ------------------------------------------------------------------------------
# Helper: Acquire Android Wake Lock if available
# ------------------------------------------------------------------------------
acquire_wake_lock() {
    if [ -x "/data/data/com.termux/files/usr/bin/termux-wake-lock" ]; then
        /data/data/com.termux/files/usr/bin/termux-wake-lock 2>/dev/null &
    elif command -v termux-wake-lock >/dev/null 2>&1; then
        termux-wake-lock 2>/dev/null &
    fi
}

# ------------------------------------------------------------------------------
# Helper: Check if process is alive
# ------------------------------------------------------------------------------
is_pid_alive() {
    local pid="$1"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# ------------------------------------------------------------------------------
# Start Server Daemon
# ------------------------------------------------------------------------------
start_server() {
    if [ -f "$SERVER_PID_FILE" ]; then
        local old_pid
        old_pid="$(cat "$SERVER_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$old_pid"; then
            echo "[✓] Mission Control server already running (PID: $old_pid)."
            return 0
        fi
    fi

    # Release port if occupied
    if command -v fuser >/dev/null 2>&1; then
        fuser -k ${PORT}/tcp 2>/dev/null || true
    fi

    echo "[*] Launching Mani\$oft Mission Control server daemon on port $PORT..."
    setsid node "$SCRIPT_DIR/server.js" >> "$SERVER_LOG" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$SERVER_PID_FILE"
    sleep 1

    if is_pid_alive "$new_pid"; then
        echo "[✓] Server daemon active (PID: $new_pid). Log: $SERVER_LOG"
    else
        echo "[-] Failed to start server daemon. Check $SERVER_LOG"
        return 1
    fi
}

# ------------------------------------------------------------------------------
# Start Cloudflare Tunnel
# ------------------------------------------------------------------------------
start_tunnel() {
    if [ -f "$TUNNEL_PID_FILE" ]; then
        local old_pid
        old_pid="$(cat "$TUNNEL_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$old_pid"; then
            echo "[✓] Cloudflare tunnel already running (PID: $old_pid)."
            return 0
        fi
    fi

    local cf_bin=""
    if [ -x "/usr/local/bin/cloudflared" ]; then
        cf_bin="/usr/local/bin/cloudflared"
    elif command -v cloudflared >/dev/null 2>&1; then
        cf_bin="$(command -v cloudflared)"
    else
        echo "[!] cloudflared binary not found. Running in local LAN mode."
        return 0
    fi

    echo "[*] Launching Cloudflare Tunnel for port $PORT..."
    : > "$TUNNEL_LOG"
    setsid "$cf_bin" tunnel --protocol http2 --url "http://127.0.0.1:$PORT" --no-autoupdate >> "$TUNNEL_LOG" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$TUNNEL_PID_FILE"

    echo "[*] Establishing secure worldwide HTTPS edge routing..."
    local attempts=0
    local found_url=""
    while [ $attempts -lt 25 ]; do
        sleep 1
        found_url=$(grep -o 'https://[-a-zA-Z0-9\.]*\.trycloudflare\.com' "$TUNNEL_LOG" | tail -n 1 || true)
        if [ -n "$found_url" ]; then
            break
        fi
        attempts=$((attempts + 1))
    done

    if [ -n "$found_url" ]; then
        echo "$found_url" > "$PUBLIC_URL_FILE"
        echo "[✓] Cloudflare Tunnel established (PID: $new_pid):"
        echo "    🔗 $found_url"
    else
        echo "[!] Tunnel is launching in background. Inspect log: $TUNNEL_LOG"
    fi
}

# ------------------------------------------------------------------------------
# Start Self-Healing Watchdog Loop
# ------------------------------------------------------------------------------
start_watchdog() {
    if [ -f "$WATCHDOG_PID_FILE" ]; then
        local old_pid
        old_pid="$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$old_pid"; then
            echo "[✓] Watchdog supervisor already active (PID: $old_pid)."
            return 0
        fi
    fi

    echo "[*] Initializing self-healing 24/7 background watchdog..."
    cat << 'W_EOF' > "$SCRIPT_DIR/.watchdog_loop.sh"
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PID_FILE="$SCRIPT_DIR/.manisoft_server.pid"
TUNNEL_PID_FILE="$SCRIPT_DIR/.manisoft_tunnel.pid"
SERVER_LOG="/tmp/manisoft_server.log"
TUNNEL_LOG="/tmp/manisoft_tunnel.log"
PORT=3000

while true; do
    sleep 12
    # Check Server
    server_alive=0
    if [ -f "$SERVER_PID_FILE" ]; then
        spid=$(cat "$SERVER_PID_FILE" 2>/dev/null || true)
        if [ -n "$spid" ] && kill -0 "$spid" 2>/dev/null; then
            server_alive=1
        fi
    fi
    if [ $server_alive -eq 0 ]; then
        echo "[$(date -u +%FT%TZ)] [WATCHDOG] Server down. Restarting..." >> /tmp/manisoft_watchdog.log
        setsid node "$SCRIPT_DIR/server.js" >> "$SERVER_LOG" 2>&1 &
        echo $! > "$SERVER_PID_FILE"
    fi

    # Check Tunnel
    cf_bin="/usr/local/bin/cloudflared"
    if [ -x "$cf_bin" ]; then
        tunnel_alive=0
        if [ -f "$TUNNEL_PID_FILE" ]; then
            tpid=$(cat "$TUNNEL_PID_FILE" 2>/dev/null || true)
            if [ -n "$tpid" ] && kill -0 "$tpid" 2>/dev/null; then
                tunnel_alive=1
            fi
        fi
        if [ $tunnel_alive -eq 0 ]; then
            echo "[$(date -u +%FT%TZ)] [WATCHDOG] Tunnel down. Restarting..." >> /tmp/manisoft_watchdog.log
            setsid "$cf_bin" tunnel --protocol http2 --url "http://127.0.0.1:$PORT" --no-autoupdate >> "$TUNNEL_LOG" 2>&1 &
            echo $! > "$TUNNEL_PID_FILE"
        fi
    fi
done
W_EOF
    chmod +x "$SCRIPT_DIR/.watchdog_loop.sh"

    setsid bash "$SCRIPT_DIR/.watchdog_loop.sh" >> "$WATCHDOG_LOG" 2>&1 &
    local wpid=$!
    echo "$wpid" > "$WATCHDOG_PID_FILE"
    echo "[✓] Watchdog supervisor active (PID: $wpid)."
}

# ------------------------------------------------------------------------------
# Install Auto-Boot Script for Termux:Boot
# ------------------------------------------------------------------------------
install_autoboot() {
    local boot_dir="/data/data/com.termux/files/home/.termux/boot"
    if [ -d "/data/data/com.termux/files/home" ]; then
        mkdir -p "$boot_dir" 2>/dev/null || true
        cat << 'B_EOF' > "$boot_dir/start-manisoft.sh"
#!/data/data/com.termux/files/usr/bin/bash
# Auto-start Mani$oft Mission Control & Cloudflare Tunnel on device reboot
termux-wake-lock
proot-distro login debian -- bash -c "cd /data/data/com.termux/files/home/MANISOFT/projects/Manisoft_Panel && ./sovereign-daemon.sh start"
B_EOF
        chmod +x "$boot_dir/start-manisoft.sh" 2>/dev/null || true
        echo "[✓] Auto-boot hook installed at $boot_dir/start-manisoft.sh"
    fi
}

# ------------------------------------------------------------------------------
# Print Online QR Code and Link
# ------------------------------------------------------------------------------
print_online_url() {
    local url=""
    if [ -f "$PUBLIC_URL_FILE" ]; then
        url="$(cat "$PUBLIC_URL_FILE" 2>/dev/null | tr -d '\n\r' || true)"
    fi
    if [ -z "$url" ] && [ -f "$TUNNEL_LOG" ]; then
        url=$(grep -o 'https://[-a-zA-Z0-9\.]*\.trycloudflare\.com' "$TUNNEL_LOG" | tail -n 1 || true)
    fi

    echo ""
    echo "======================================================================"
    echo " [MANI\$OFT] SOVEREIGN ONLINE MISSION CONTROL IS ACTIVE"
    echo "======================================================================"
    echo " Operator Email: manifestsubeno@gmail.com [GOOGLE PRO // VERIFIED]"
    echo " Clearance Level: LEVEL 1 (Sovereign Persistent)"
    echo " Status: 24/7 BACKGROUND PERSISTENCE ENGAGED"
    if [ -n "$url" ]; then
        echo " Worldwide HTTPS URL: $url"
        echo ""
        python3 -c "
url = '$url'
print('\033[1;36m' + '─'*60 + '\033[0m')
print('\033[1;32m  ACCESS LINK:  \033[4;37m' + url + '\033[0m')
print('\033[1;36m' + '─'*60 + '\033[0m')
print('  Mobile Scan QR: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + url)
" 2>/dev/null || true
    else
        echo " Local LAN URL: http://localhost:$PORT"
    fi
    echo ""
    echo " [!] You can now safely CLOSE this terminal window or turn off your screen."
    echo "     Mani\$oft and MANI AI will continue running online in the background."
    echo "======================================================================"
}

# ------------------------------------------------------------------------------
# Stop All
# ------------------------------------------------------------------------------
stop_all() {
    echo "[*] Terminating background watchdog supervisor..."
    if [ -f "$WATCHDOG_PID_FILE" ]; then
        local wpid
        wpid="$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$wpid"; then kill "$wpid" 2>/dev/null || true; fi
        rm -f "$WATCHDOG_PID_FILE"
    fi
    pkill -f ".watchdog_loop.sh" 2>/dev/null || true

    echo "[*] Terminating Cloudflare Tunnel..."
    if [ -f "$TUNNEL_PID_FILE" ]; then
        local tpid
        tpid="$(cat "$TUNNEL_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$tpid"; then kill "$tpid" 2>/dev/null || true; fi
        rm -f "$TUNNEL_PID_FILE"
    fi
    pkill -f "cloudflared tunnel --url" 2>/dev/null || true

    echo "[*] Terminating Server Daemon..."
    if [ -f "$SERVER_PID_FILE" ]; then
        local spid
        spid="$(cat "$SERVER_PID_FILE" 2>/dev/null || true)"
        if is_pid_alive "$spid"; then kill "$spid" 2>/dev/null || true; fi
        rm -f "$SERVER_PID_FILE"
    fi
    pkill -f "node.*server\.js" 2>/dev/null || true
    if command -v fuser >/dev/null 2>&1; then
        fuser -k ${PORT}/tcp 2>/dev/null || true
    elif [ -x "/data/data/com.termux/files/usr/bin/fuser" ]; then
        /data/data/com.termux/files/usr/bin/fuser -k ${PORT}/tcp 2>/dev/null || true
    fi
    sleep 1

    echo "[✓] All sovereign background processes stopped."
}

# ------------------------------------------------------------------------------
# Status
# ------------------------------------------------------------------------------
status() {
    echo "======================================================================"
    echo " [MANI\$OFT] SOVEREIGN ONLINE DAEMON STATUS"
    echo "======================================================================"
    local spid=""
    local tpid=""
    local wpid=""

    if [ -f "$SERVER_PID_FILE" ]; then spid=$(cat "$SERVER_PID_FILE" 2>/dev/null || true); fi
    if [ -f "$TUNNEL_PID_FILE" ]; then tpid=$(cat "$TUNNEL_PID_FILE" 2>/dev/null || true); fi
    if [ -f "$WATCHDOG_PID_FILE" ]; then wpid=$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true); fi

    if is_pid_alive "$spid"; then
        echo "  [✓] Server Daemon:     ACTIVE (PID: $spid)"
    else
        echo "  [-] Server Daemon:     STOPPED"
    fi

    if is_pid_alive "$tpid"; then
        echo "  [✓] Cloudflare Tunnel: ACTIVE (PID: $tpid)"
    else
        echo "  [-] Cloudflare Tunnel: STOPPED"
    fi

    if is_pid_alive "$wpid"; then
        echo "  [✓] Watchdog Loop:     ACTIVE (PID: $wpid)"
    else
        echo "  [-] Watchdog Loop:     STOPPED"
    fi

    local url=""
    if [ -f "$PUBLIC_URL_FILE" ]; then url=$(cat "$PUBLIC_URL_FILE" 2>/dev/null || true); fi
    if [ -n "$url" ]; then
        echo "  [🌐] Online URL:        $url"
    fi
    echo "  [📧] Operator Account:  manifestsubeno@gmail.com (Google Pro)"
    echo "======================================================================"
}

# ------------------------------------------------------------------------------
# Command Dispatcher
# ------------------------------------------------------------------------------
ACTION="${1:-start}"

case "$ACTION" in
    start)
        acquire_wake_lock
        start_server
        start_tunnel
        start_watchdog
        install_autoboot
        print_online_url
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 1
        acquire_wake_lock
        start_server
        start_tunnel
        start_watchdog
        print_online_url
        ;;
    status)
        status
        ;;
    url)
        print_online_url
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|url}"
        exit 1
        ;;
esac
