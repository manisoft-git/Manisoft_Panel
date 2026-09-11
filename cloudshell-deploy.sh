#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT — Cloud Shell One-Click Deployer
# Run this inside Google Cloud Shell (https://console.cloud.google.com)
# gcloud is pre-installed and authenticated there — no local setup needed.
# ==============================================================================
set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────────────
PROJECT_ID="manisoft-508215"
REGION="us-central1"
ZONE="${REGION}-a"
INSTANCE_NAME="manisoft-panel"
MACHINE_TYPE="e2-micro"          # Always-Free tier (720 hrs/mo in us-*)
DISK_SIZE="20GB"
IMAGE_FAMILY="debian-12"
IMAGE_PROJECT="debian-cloud"
FIREWALL_RULE="allow-manisoft-panel"
PORT="3000"
REPO_URL="https://github.com/manisoft-git/Manisoft_Panel"

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        MANI\$OFT — 24/7 Google Cloud VM Deployer             ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Project:  $PROJECT_ID                              ║"
echo "║  Zone:     $ZONE                                    ║"
echo "║  Machine:  $MACHINE_TYPE  (Always-Free eligible)      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Set project ──────────────────────────────────────────────────────────────
echo "[1/5] Setting project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID" --quiet

# ─── Enable APIs ──────────────────────────────────────────────────────────────
echo "[2/5] Enabling Compute Engine API..."
gcloud services enable compute.googleapis.com --project="$PROJECT_ID" --quiet

# ─── Firewall ─────────────────────────────────────────────────────────────────
echo "[3/5] Setting up firewall rule for port $PORT..."
if ! gcloud compute firewall-rules describe "$FIREWALL_RULE" --project="$PROJECT_ID" &>/dev/null 2>&1; then
  gcloud compute firewall-rules create "$FIREWALL_RULE" \
    --project="$PROJECT_ID" \
    --allow="tcp:${PORT}" \
    --target-tags="manisoft-panel" \
    --description="Manisoft Panel web traffic on port ${PORT}"
  echo "[✓] Firewall rule created."
else
  echo "[✓] Firewall rule already exists."
fi

# ─── Check existing VM ────────────────────────────────────────────────────────
if gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null 2>&1; then
  echo ""
  echo "[!] VM '$INSTANCE_NAME' already exists!"
  EXISTING_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" \
    --project="$PROJECT_ID" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
  echo "    URL:    http://${EXISTING_IP}:${PORT}"
  echo "    To SSH: gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
  echo "    To delete and redeploy: gcloud compute instances delete $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --quiet"
  exit 0
fi

# ─── Startup Script ───────────────────────────────────────────────────────────
STARTUP_SCRIPT=$(cat <<'STARTUP'
#!/usr/bin/env bash
set -euo pipefail
LOG="/var/log/manisoft-setup.log"
exec > >(tee -a "$LOG") 2>&1

echo "=== [MANI$OFT SETUP] $(date) ==="

# System packages
apt-get update -qq
apt-get install -y --no-install-recommends curl git ca-certificates gnupg jq unzip

# Node.js 20 LTS
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "[✓] Node $(node --version)"

# Clone Manisoft Panel
PANEL_DIR="/opt/manisoft-panel"
if [ -d "$PANEL_DIR/.git" ]; then
  cd "$PANEL_DIR" && git pull --rebase origin main || true
else
  git clone https://github.com/manisoft-git/Manisoft_Panel "$PANEL_DIR"
fi
cd "$PANEL_DIR"
npm install --omit=dev --silent 2>/dev/null || npm install --production --silent || true
echo "[✓] Manisoft Panel ready"

# Install Antigravity CLI (best effort — fallback to direct Gemini API)
if ! command -v agy &>/dev/null; then
  curl -fsSL https://antigravity.dev/install.sh | bash 2>/dev/null || true
fi
command -v agy &>/dev/null && echo "[✓] AGY CLI: $(agy --version 2>/dev/null || echo installed)" \
  || echo "[!] AGY not available — using Gemini API fallback"

# Write .env if not present
ENV_FILE="$PANEL_DIR/.env"
[ -f "$ENV_FILE" ] || cat > "$ENV_FILE" <<EOF
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=
GOOGLE_API_KEY=
AUTHORIZED_EMAIL=manifestsubeno@gmail.com
PROJECTS_DIR=/opt/manisoft-panel
EOF
echo "[✓] .env config ready"

# Systemd service
cat > /etc/systemd/system/manisoft-panel.service <<EOF
[Unit]
Description=Manisoft Panel (24/7 Cloud Node)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PANEL_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$(which node) $PANEL_DIR/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=manisoft-panel

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable manisoft-panel
systemctl restart manisoft-panel
echo "[✓] manisoft-panel systemd service running"

EXTERNAL_IP=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" \
  -H "Metadata-Flavor: Google" 2>/dev/null || echo "unknown")

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  [✓] MANI\$OFT Panel is LIVE!                               ║"
echo "║  URL: http://${EXTERNAL_IP}:3000                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "NEXT: Set your Gemini API key:"
echo "  echo 'GEMINI_API_KEY=your_key_here' >> /opt/manisoft-panel/.env"
echo "  systemctl restart manisoft-panel"
STARTUP
)

# ─── Create VM ────────────────────────────────────────────────────────────────
echo "[4/5] Creating e2-micro VM (always-free eligible)..."
gcloud compute instances create "$INSTANCE_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --image-family="$IMAGE_FAMILY" \
  --image-project="$IMAGE_PROJECT" \
  --boot-disk-size="$DISK_SIZE" \
  --boot-disk-type="pd-standard" \
  --tags="manisoft-panel" \
  --metadata="startup-script=${STARTUP_SCRIPT}" \
  --scopes="cloud-platform"

echo "[5/5] Waiting for VM to boot and get IP..."
sleep 15

EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" \
  --project="$PROJECT_ID" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        🚀  MANI\$OFT CLOUD VM DEPLOYED!                      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  External IP:  $EXTERNAL_IP                                  ║"
echo "║  Panel URL:    http://${EXTERNAL_IP}:${PORT}                 ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  IMPORTANT — set your Gemini API key:                       ║"
echo "║  1. SSH in:  gcloud compute ssh $INSTANCE_NAME --zone=$ZONE ║"
echo "║  2. Run:     echo 'GEMINI_API_KEY=YOUR_KEY' >>              ║"
echo "║              /opt/manisoft-panel/.env                        ║"
echo "║              systemctl restart manisoft-panel                ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Add to Manisoft Panel env vars:                            ║"
echo "║  CLOUD_AGY_URL=http://${EXTERNAL_IP}:${PORT}                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "[*] Setup runs in background (~3 mins). Check logs with:"
echo "    gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID \\"
echo "      --command='sudo journalctl -u manisoft-panel -n 50 --no-pager'"
