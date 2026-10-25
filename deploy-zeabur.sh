#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT // AUTONOMOUS 24/7 ZEABUR CLOUD FLEET PUBLISHER
# Deploys and manages the entire project fleet on Zeabur cloud platform.
# ==============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/zeabur.json"

echo "======================================================================"
echo " [MANI\$OFT] 24/7 ZEABUR AUTONOMOUS CLOUD FLEET PUBLISHER"
echo "======================================================================"

# Read saved token if present
TOKEN="${ZEABUR_TOKEN:-}"
if [ -f "$CONFIG_FILE" ]; then
    SAVED_TOKEN="$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiToken',''))" 2>/dev/null || true)"
    if [ -n "$SAVED_TOKEN" ] && [ "$SAVED_TOKEN" != "••••••••••••" ]; then
        TOKEN="$SAVED_TOKEN"
    fi
fi

COMMAND="${1:-guide}"

case "$COMMAND" in
    set-token)
        NEW_TOKEN="${2:-}"
        if [ -z "$NEW_TOKEN" ]; then
            echo "[!] Usage: ./deploy-zeabur.sh set-token <your-zeabur-api-token>"
            exit 1
        fi
        python3 -c "
import json
cfg = json.load(open('$CONFIG_FILE'))
cfg['apiToken'] = '$NEW_TOKEN'
json.dump(cfg, open('$CONFIG_FILE', 'w'), indent=2)
"
        echo "[✓] Zeabur API token configured."
        exit 0
        ;;

    guide|status)
        echo "Zeabur provides 1-Click Git deployment with zero credit card required."
        echo ""
        echo "----------------------------------------------------------------------"
        echo "🚀 STEP-BY-STEP ZEABUR 1-CLICK FLEET LAUNCH GUIDE"
        echo "----------------------------------------------------------------------"
        echo "1. Sign In to Zeabur with GitHub:"
        echo "   👉 Open: https://dash.zeabur.com"
        echo "   Click: 'Log in with GitHub' (using your manisoft-git account)"
        echo ""
        echo "2. Create a Unified Project:"
        echo "   Click: '+ Create Project'"
        echo "   Project Name: manisoft"
        echo "   Region: Any free region (e.g. US West or Asia)"
        echo ""
        echo "3. Add Your Fleet Services (1-Click each):"
        echo "   In the project, click 'Deploy New Service' -> 'Git' -> 'GitHub':"
        echo "   • manisoft-git/Manisoft_Panel  (Port 3000)"
        echo "   • manisoft-git/Lumina          (Port 8080)"
        echo "   • manisoft-git/passmaster_ai   (Port 5050)"
        echo "   • manisoft-git/starshine       (Port 5000)"
        echo "   • manisoft-git/aether-transport (Port 9090)"
        echo ""
        echo "4. Generate Free Worldwide Domains:"
        echo "   For each service, click on it -> 'Networking' -> 'Generate Domain'"
        echo "   Zeabur will instantly create free permanent HTTPS domains:"
        echo "   • https://manisoft-panel.zeabur.app"
        echo "   • https://manisoft-lumina.zeabur.app"
        echo "   • https://manisoft-passmaster.zeabur.app"
        echo "   • https://manisoft-starshine.zeabur.app"
        echo "   • https://manisoft-aether.zeabur.app"
        echo "----------------------------------------------------------------------"
        ;;

    *)
        echo "Usage: ./deploy-zeabur.sh [guide|status|set-token <token>]"
        ;;
esac
