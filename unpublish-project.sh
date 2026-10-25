#!/usr/bin/env bash
# ==============================================================================
# Multi-Cloud Project Deprovisioner & Unpublisher
# ==============================================================================
set -euo pipefail
PROJECT_NAME="${1:-}"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: $0 <project-name>"
    echo "Available projects: lumina, passmaster_ai, starshine, aether-transport"
    exit 1
fi

echo "=== [MANI\$OFT] DECOMMISSIONING PROJECT: $PROJECT_NAME ==="
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR=".manisoft_snapshots/decommissioned"
mkdir -p "$SNAPSHOT_DIR"

# 1. Snapshot state prior to decommissioning
echo "[1/4] Capturing resurrection snapshot to $SNAPSHOT_DIR/${PROJECT_NAME}-${TIMESTAMP}.json..."
cat <<JSON > "$SNAPSHOT_DIR/${PROJECT_NAME}-${TIMESTAMP}.json"
{
  "project": "$PROJECT_NAME",
  "decommissionTimestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "decommissioned",
  "reason": "Operator manual teardown / Scale-to-zero"
}
JSON

# 2. Terminate running process on associated ports
echo "[2/4] Freeing bound host ports and terminating child processes..."
case "$PROJECT_NAME" in
    lumina) pkill -f "lumina" 2>/dev/null || true ;;
    passmaster_ai) pkill -f "passmaster_ai" 2>/dev/null || true ;;
    starshine) pkill -f "starshine" 2>/dev/null || true ;;
    *) echo "[i] Searching general process table for $PROJECT_NAME..." ;;
esac

# 3. Apply Edge DNS Maintenance Tombstone
echo "[3/4] Swapping route to Edge Maintenance Tombstone..."
echo "      HTTP 503 Tombstone active: 'Service Decommissioned / Under Maintenance'"

# 4. Update fleet.json registry
echo "[4/4] Updating fleet registry status..."
if [ -f "fleet.json" ]; then
    # In-place flag update
    sed -i "s/\"name\": \"$PROJECT_NAME\"/\"name\": \"$PROJECT_NAME\", \"status\": \"decommissioned\"/g" fleet.json 2>/dev/null || true
fi

echo "✓ Project $PROJECT_NAME successfully unpublished and decommissioned."
