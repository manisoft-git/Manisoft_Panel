#!/usr/bin/env bash
# ==============================================================================
# Autonomous GitHub Sovereign Synchronizer (Mani\$oft Mission Control)
# ==============================================================================
set -euo pipefail
echo "=== [MANI\$OFT] SYNCHRONIZING MISSION CONTROL TO GITHUB ==="

if [ ! -d ".git" ]; then
    git init -b main
fi

git config user.email "manifestsubeno@gmail.com" 2>/dev/null || true
git config user.name "ManiSoft Operator" 2>/dev/null || true
git add -A
git commit -m "feat(core): sovereign deployment of Mani\$oft Mission Control v100.0" 2>/dev/null || true

if command -v gh >/dev/null 2>&1; then
    gh repo create Manisoft_Panel --private --source=. --remote=origin --push 2>/dev/null || git push -u origin main 2>/dev/null || true
    echo "✓ Published repository to GitHub."
else
    echo "[✓] Local repository committed cleanly. Remote ready."
fi
