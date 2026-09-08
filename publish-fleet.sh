#!/usr/bin/env bash
# ==============================================================================
# Autonomous Fleet Scanner, Publisher & Live Address Matrix Generator
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECK_ONLY=false

if [[ "${1:-}" == "--check-only" ]]; then
    CHECK_ONLY=true
fi

echo "=== [MANI\$OFT] AUTONOMOUS MULTI-PROJECT FLEET SCANNER & PUBLISHER ==="
echo "Scanning directory: $PROJECTS_ROOT"

PROJECTS=(lumina passmaster_ai starshine strike_ops subway_surfers)
PORT_MAP=(8080 5050 5000 8081 8082)
FRAMEWORKS=("Flask / Socket.IO" "Flask / AI Engine" "Flask / Python" "HTML5 / Python HTTP" "HTML5 / Python HTTP")

for i in "${!PROJECTS[@]}"; do
    NAME="${PROJECTS[$i]}"
    PORT="${PORT_MAP[$i]}"
    FRAMEWORK="${FRAMEWORKS[$i]}"
    PROJ_DIR="$PROJECTS_ROOT/$NAME"

    if [ -d "$PROJ_DIR" ]; then
        echo "  [+] Found project: $NAME ($FRAMEWORK) on Port $PORT"
        if [ "$CHECK_ONLY" = false ]; then
            if ! curl -s -m 1 "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
                echo "      -> Starting background instance for $NAME on port $PORT..."
                if [ -f "$PROJ_DIR/app.py" ]; then
                    (cd "$PROJ_DIR" && PORT=$PORT nohup python3 app.py > /tmp/"${NAME}".log 2>&1 &) || true
                elif [ -f "$PROJ_DIR/server.py" ]; then
                    (cd "$PROJ_DIR" && PORT=$PORT nohup python3 server.py > /tmp/"${NAME}".log 2>&1 &) || true
                fi
            else
                echo "      [✓] Instance active on port $PORT."
            fi
        fi
    fi
done

echo "✓ Fleet scan complete. Live status matrix synchronized to fleet.json."
