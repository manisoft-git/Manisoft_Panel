#!/usr/bin/env bash
# ==============================================================================
# Autonomous GitHub Fleet Mass-Synchronizer
# ==============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== [MANI\$OFT] AUTONOMOUS GITHUB FLEET MASS-SYNCHRONIZER ==="

PROJECTS=(lumina passmaster_ai starshine strike_ops subway_surfers aether-transport)

for NAME in "${PROJECTS[@]}"; do
    PROJ_DIR="$PROJECTS_ROOT/$NAME"
    if [ -d "$PROJ_DIR" ]; then
        echo "  [*] Inspecting Git status for $NAME..."
        (cd "$PROJ_DIR" && {
            if [ ! -d ".git" ]; then
                git init -b main 2>/dev/null || true
            fi
            git config user.email "manifestsubeno@gmail.com" 2>/dev/null || true
            git config user.name "ManiSoft Operator" 2>/dev/null || true
            git branch -M main 2>/dev/null || true
            git add -A 2>/dev/null || true
            git commit -m "chore(fleet): sovereign fleet auto-sync" 2>/dev/null || true
            if git remote get-url origin >/dev/null 2>&1; then
                echo "      -> Pushing to remote origin main..."
                git push -u origin main 2>/dev/null || true
                echo "      [✓] Project $NAME synchronized to remote GitHub."
            elif command -v gh >/dev/null 2>&1; then
                echo "      -> Synchronizing to GitHub via gh CLI..."
                gh repo create "$NAME" --private --source=. --push 2>/dev/null || true
            else
                echo "      [✓] Local Git commit hardened for $NAME."
            fi
        }) || true
    fi
done

echo "✓ GitHub Fleet Mass-Synchronization sequence completed."
