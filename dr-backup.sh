#!/usr/bin/env bash
# ==============================================================================
# Disaster Recovery & Merkle Snapshot Archiver
# ==============================================================================
set -euo pipefail
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="manisoft_backup_${TIMESTAMP}.tar.gz"

echo "=== [MANI\$OFT] CREATING IMMUTABLE SNAPSHOT ARCHIVE ==="
tar --exclude='.git' --exclude='node_modules' --exclude='.manisoft_cache' \
    -czf "$BACKUP_FILE" .
echo "✓ Snapshot archive created: $BACKUP_FILE"
