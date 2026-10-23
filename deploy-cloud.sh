#!/usr/bin/env bash
# ==============================================================================
# Autonomous 1-Click Cloud Publisher for 24/7 Disconnected Swarm Execution
# ==============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================================"
echo " [MANI\$OFT] 24/7 INDEPENDENT CLOUD RUNNER DEPLOYMENT"
echo "======================================================================"
echo " Repository: https://github.com/manisoft-git/Manisoft_Panel"
echo " Target:     Always-On Cloud Execution (Immune to phone shutdown)"
echo "======================================================================"

TARGET="${1:-koyeb}"

case "$TARGET" in
    koyeb)
        echo "[*] Koyeb 24/7 Autonomous Cloud Runner configured (deploy-koyeb.sh)."
        echo "    🔗 Koyeb Dashboard: https://app.koyeb.com"
        "$SCRIPT_DIR/deploy-koyeb.sh" "${2:-status}"
        ;;
    render)
        echo "[*] Render Blueprint configured (render.yaml)."
        echo "    🔗 1-Click Deploy Link: https://dashboard.render.com/select-repo?type=web"
        echo "    Connect your repository: manisoft-git/Manisoft_Panel"
        echo "[✓] Render will automatically deploy and assign a 24/7 permanent HTTPS URL."
        ;;
    railway)
        echo "[*] Railway configured (railway.json)."
        echo "    🔗 1-Click Deploy Link: https://railway.app/new"
        echo "    Select: Deploy from GitHub repo -> manisoft-git/Manisoft_Panel"
        ;;
    fly)
        echo "[*] Fly.io configured (fly.toml)."
        if command -v flyctl >/dev/null 2>&1; then
            flyctl deploy
        else
            echo "    Install Fly CLI or deploy via GitHub Actions."
        fi
        ;;
    docker|container)
        echo "[*] Building local Docker production container..."
        if command -v docker >/dev/null 2>&1; then
            docker build -t manisoft-singularity:v100.0 .
            docker run -d --restart=always --name manisoft-core -p 3000:3000 manisoft-singularity:v100.0
            echo "[✓] Container online and set to restart=always."
        else
            echo "[!] Docker engine not available locally."
        fi
        ;;
    *)
        echo "Usage: ./deploy-cloud.sh [koyeb|render|railway|fly|docker]"
        ;;
esac
