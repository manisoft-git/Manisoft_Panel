#!/usr/bin/env bash
# ==============================================================================
# Autonomous GitHub Fleet Mass-Synchronizer
# ==============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== [MANI\$OFT] AUTONOMOUS GITHUB FLEET MASS-SYNCHRONIZER ==="

PROJECTS=(lumina passmaster_ai starshine strike_ops subway_surfers)

for NAME in "${PROJECTS[@]}"; do
    PROJ_DIR="$PROJECTS_ROOT/$NAME"
    if [ -d "$PROJ_DIR" ]; then
        echo "  [*] Inspecting Git status for $NAME..."
        if [ ! -d "$PROJ_DIR/.git" ]; then
            (cd "$PROJ_DIR" && git init -b main 2>/dev/null || true)
        fi
        (cd "$PROJ_DIR" && {
            git config user.email "manifestsubeno@gmail.com" 2>/dev/null || true
            git config user.name "ManiSoft Operator" 2>/dev/null || true
            git add -A 2>/dev/null || true
            git commit -m "chore(fleet): sovereign fleet auto-sync" 2>/dev/null || true
        }) || true
        if command -v gh >/dev/null 2>&1; then
            echo "      -> Synchronizing to GitHub via authenticated CLI..."
            (cd "$PROJ_DIR" && gh repo create "$NAME" --private --source=. --push 2>/dev/null || true)
        else
            echo "      [✓] Local Git commit hardened. (Install gh or configure SSH to push to remote)"
        fi
    fi
done

echo "✓ GitHub Fleet Mass-Synchronization sequence completed."
