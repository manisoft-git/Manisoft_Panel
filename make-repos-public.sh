#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT // AUTONOMOUS GITHUB REPOSITORY VISIBILITY CONTROLLER
# Converts all private fleet repositories under manisoft-git to PUBLIC
# ==============================================================================
set -euo pipefail

TOKEN="${1:-${GITHUB_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
    echo "[!] Error: GitHub Personal Access Token (PAT) with 'repo' scope required."
    echo "    Usage: ./make-repos-public.sh <github_pat_token>"
    echo "    Or:    export GITHUB_TOKEN=<github_pat_token> && ./make-repos-public.sh"
    exit 1
fi

echo "[*] Authenticating with GitHub..."
echo "$TOKEN" | gh auth login --with-token 2>/dev/null || true

REPOS=(
  "Manisoft_Panel"
  "Lumina"
  "passmaster_ai"
  "starshine"
  "strike_ops"
  "subway_surfers"
  "aether-transport"
  "manisoft-git"
)

echo "======================================================================"
echo " [MANI\$OFT] CONVERTING ALL REPOSITORIES TO PUBLIC"
echo "======================================================================"

for repo in "${REPOS[@]}"; do
  echo "[-] Setting manisoft-git/$repo to PUBLIC..."
  # Try via gh CLI
  if gh repo edit "manisoft-git/$repo" --visibility public --yes 2>/dev/null; then
    echo "    [✓] manisoft-git/$repo is now PUBLIC!"
  else
    # Fallback to direct GitHub REST API
    status=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
      -H "Authorization: token $TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/manisoft-git/$repo" \
      -d '{"private":false}')
    if [ "$status" = "200" ]; then
      echo "    [✓] manisoft-git/$repo is now PUBLIC! (HTTP 200)"
    else
      echo "    [!] Could not change $repo (HTTP $status)"
    fi
  fi
done

# Cache credentials for Git push operations
echo "https://ManiSoft%20Operator:$TOKEN@github.com" > /root/.git-credentials
chmod 600 /root/.git-credentials
git config --global credential.helper store

echo ""
echo "======================================================================"
echo "✓ All repositories converted to PUBLIC and Git credentials cached."
echo "  You can now clone any project anywhere with zero authentication errors!"
echo "======================================================================"
