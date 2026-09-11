#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT — Google Cloud VM Deployer
# Provisions a free-tier e2-micro VM on GCP and runs Manisoft Panel + AGY 24/7
# Usage: ./deploy-gcp-vm.sh [--project PROJECT_ID] [--region REGION]
# ==============================================================================
set -euo pipefail

# ─── Config ───────────────────────────────────────────────────────────────────
PROJECT_ID="${GCLOUD_PROJECT:-manisoft-508215}"
REGION="${GCLOUD_REGION:-us-central1}"
ZONE="${REGION}-a"
INSTANCE_NAME="manisoft-panel"
MACHINE_TYPE="e2-micro"          # Always-free tier (720 hrs/mo)
DISK_SIZE="20GB"
IMAGE_FAMILY="debian-12"
IMAGE_PROJECT="debian-cloud"
FIREWALL_RULE="allow-manisoft-panel"
PORT="3000"
REPO_URL="https://github.com/manisoft-git/Manisoft_Panel"
BRANCH="main"

# ─── Parse Args ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT_ID="$2"; shift 2 ;;
    --region)  REGION="$2"; ZONE="${2}-a"; shift 2 ;;
    --delete)
      echo "[*] Deleting VM instance: $INSTANCE_NAME..."
      gcloud compute instances delete "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" --quiet
      echo "[✓] VM deleted."
      exit 0 ;;
    --status)
      echo "[*] Checking VM status..."
      gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" \
        --format="table(name,status,networkInterfaces[0].accessConfigs[0].natIP,machineType)"
      exit 0 ;;
    --ssh)
      gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID"
      exit 0 ;;
    --logs)
      gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" \
        --command="sudo journalctl -u manisoft-panel -n 100 --no-pager"
      exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "======================================================================"
echo "  MANI\$OFT — 24/7 Google Cloud VM Deployer"
echo "======================================================================"
echo "  Project:  $PROJECT_ID"
echo "  Zone:     $ZONE"
echo "  Machine:  $MACHINE_TYPE (Always-Free eligible)"
echo "  Repo:     $REPO_URL"
echo "======================================================================"

# ─── Pre-flight ───────────────────────────────────────────────────────────────
if ! command -v gcloud &>/dev/null; then
  echo "[!] gcloud CLI not found. Install it:"
  echo "    https://cloud.google.com/sdk/docs/install"
  exit 1
fi

echo "[1/6] Setting active project..."
gcloud config set project "$PROJECT_ID" --quiet

echo "[2/6] Enabling required APIs..."
gcloud services enable compute.googleapis.com --project="$PROJECT_ID" --quiet

# ─── Firewall Rule ────────────────────────────────────────────────────────────
echo "[3/6] Ensuring firewall rule exists..."
if ! gcloud compute firewall-rules describe "$FIREWALL_RULE" --project="$PROJECT_ID" &>/dev/null 2>&1; then
  gcloud compute firewall-rules create "$FIREWALL_RULE" \
    --project="$PROJECT_ID" \
    --allow="tcp:${PORT}" \
    --target-tags="manisoft-panel" \
    --description="Allow Manisoft Panel web traffic on port ${PORT}"
  echo "[✓] Firewall rule created."
else
  echo "[✓] Firewall rule already exists."
fi

# ─── Startup Script (runs inside VM on first boot) ────────────────────────────
STARTUP_SCRIPT=$(cat <<'STARTUP'
#!/usr/bin/env bash
set -euo pipefail
LOG="/var/log/manisoft-setup.log"
exec > >(tee -a "$LOG") 2>&1

echo "=== [MANI$OFT VM SETUP] $(date) ==="

# ── 1. System packages ────────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y --no-install-recommends \
  curl git ca-certificates gnupg jq unzip build-essential

# ── 2. Node.js 20 LTS ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "[✓] Node $(node --version), NPM $(npm --version)"

# ── 3. Clone / update Manisoft Panel ──────────────────────────────────────────
PANEL_DIR="/opt/manisoft-panel"
if [ -d "$PANEL_DIR/.git" ]; then
  cd "$PANEL_DIR" && git pull --rebase origin main || true
else
  git clone https://github.com/manisoft-git/Manisoft_Panel "$PANEL_DIR"
fi
cd "$PANEL_DIR"
npm install --omit=dev --silent 2>/dev/null || npm install --production --silent || true
echo "[✓] Panel cloned/updated"

# ── 4. Install Antigravity (AGY) CLI ─────────────────────────────────────────
if ! command -v agy &>/dev/null; then
  echo "[*] Installing Antigravity CLI..."
  curl -fsSL https://antigravity.dev/install.sh | bash || \
  pip3 install antigravity-cli 2>/dev/null || \
  npm install -g @google/antigravity 2>/dev/null || true

  # Try pip fallback
  if ! command -v agy &>/dev/null && command -v pip3 &>/dev/null; then
    pip3 install --quiet agy 2>/dev/null || true
  fi
fi

if command -v agy &>/dev/null; then
  echo "[✓] AGY CLI available: $(agy --version 2>/dev/null || echo 'installed')"
  AGY_PATH=$(which agy)
else
  echo "[!] AGY CLI not found — Mani AI will use direct Gemini API fallback (still works)"
  AGY_PATH=""
fi

# ── 5. Write env config ───────────────────────────────────────────────────────
ENV_FILE="$PANEL_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOF
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=${GEMINI_API_KEY:-}
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}
AUTHORIZED_EMAIL=manifestsubeno@gmail.com
PROJECTS_DIR=/opt/manisoft-panel
EOF
  echo "[✓] .env written"
fi

# ── 6. Systemd service ────────────────────────────────────────────────────────
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
echo "[✓] manisoft-panel service running"

# ── 7. Done ───────────────────────────────────────────────────────────────────
EXTERNAL_IP=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" \
  -H "Metadata-Flavor: Google" 2>/dev/null || echo "unknown")
echo ""
echo "======================================================================"
echo "  [✓] MANI\$OFT Panel is LIVE at: http://${EXTERNAL_IP}:3000"
echo "======================================================================"
STARTUP
)

# ─── Create / Replace VM Instance ─────────────────────────────────────────────
echo "[4/6] Checking for existing VM..."
if gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null 2>&1; then
  echo "[!] VM '$INSTANCE_NAME' already exists."
  echo "    Run './deploy-gcp-vm.sh --status' to check it."
  echo "    Run './deploy-gcp-vm.sh --delete' to remove and redeploy."
  EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" \
    --project="$PROJECT_ID" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")
  echo ""
  echo "======================================================================"
  echo "  [✓] Panel URL: http://${EXTERNAL_IP}:${PORT}"
  echo "  [i] Add GEMINI_API_KEY: ./deploy-gcp-vm.sh --ssh"
  echo "======================================================================"
  exit 0
fi

echo "[5/6] Creating VM instance (e2-micro, always-free eligible)..."
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

echo "[✓] VM created. Waiting for startup (this takes ~2-3 mins on first boot)..."

# ─── Get IP ───────────────────────────────────────────────────────────────────
sleep 10
EXTERNAL_IP=$(gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" \
  --project="$PROJECT_ID" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "[6/6] Setup complete!"
echo ""
echo "======================================================================"
echo "  [✓] MANI\$OFT Panel VM launched!"
echo "======================================================================"
echo "  External IP:  $EXTERNAL_IP"
echo "  Panel URL:    http://${EXTERNAL_IP}:${PORT}"
echo "  SSH:          ./deploy-gcp-vm.sh --ssh"
echo "  Logs:         ./deploy-gcp-vm.sh --logs"
echo "  Status:       ./deploy-gcp-vm.sh --status"
echo ""
echo "  NEXT STEP → Set your GEMINI_API_KEY on the VM:"
echo "    ./deploy-gcp-vm.sh --ssh"
echo "    Then: echo 'GEMINI_API_KEY=your_key' >> /opt/manisoft-panel/.env"
echo "          systemctl restart manisoft-panel"
echo "======================================================================"
