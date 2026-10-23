#!/usr/bin/env bash
# ==============================================================================
# MANI$OFT // AUTONOMOUS 24/7 KOYEB FLEET CLOUD PUBLISHER
# Deploys and manages the entire project fleet on Koyeb serverless cloud.
# ==============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/koyeb.json"

echo "======================================================================"
echo " [MANI\$OFT] 24/7 KOYEB AUTONOMOUS CLOUD FLEET PUBLISHER"
echo "======================================================================"

# 1. Verify Koyeb CLI
if ! command -v koyeb >/dev/null 2>&1; then
    echo "[!] Koyeb CLI not detected. Installing..."
    curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | bash
    cp ~/.koyeb/bin/koyeb /usr/local/bin/koyeb 2>/dev/null || true
fi

KOYEB_BIN="$(command -v koyeb)"
echo "[✓] Koyeb CLI active: $("$KOYEB_BIN" version 2>/dev/null || echo 'installed')"

# 2. Check for token in koyeb.json or env
if [ -f "$CONFIG_FILE" ]; then
    SAVED_TOKEN="$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiToken',''))" 2>/dev/null || true)"
    if [ -n "$SAVED_TOKEN" ] && [ "$SAVED_TOKEN" != "••••••••••••" ]; then
        export KOYEB_TOKEN="$SAVED_TOKEN"
    fi
fi

# 3. Handle subcommands
COMMAND="${1:-status}"

case "$COMMAND" in
    set-token)
        TOKEN="${2:-}"
        if [ -z "$TOKEN" ]; then
            echo "[!] Usage: ./deploy-koyeb.sh set-token <your-koyeb-api-token>"
            exit 1
        fi
        mkdir -p /root
        echo "token: $TOKEN" > /root/.koyeb.yaml
        chmod 600 /root/.koyeb.yaml
        echo "[✓] Token saved to /root/.koyeb.yaml."
        export KOYEB_TOKEN="$TOKEN"
        "$KOYEB_BIN" whoami || true
        exit 0
        ;;

    status)
        echo "[*] Checking Koyeb authentication status..."
        if ! "$KOYEB_BIN" whoami 2>/dev/null; then
            echo "----------------------------------------------------------------------"
            echo "[!] Koyeb CLI is not authenticated yet."
            echo ""
            echo "To connect Koyeb for 24/7 autonomous deployment:"
            echo "  1. Open your browser: https://app.koyeb.com/user/settings/api"
            echo "  2. Generate a new API token"
            echo "  3. Configure it using either command:"
            echo "       ./deploy-koyeb.sh set-token <YOUR_TOKEN>"
            echo "       export KOYEB_TOKEN=<YOUR_TOKEN>"
            echo ""
            echo "Or deploy directly from the Koyeb Web Console:"
            echo "  👉 https://app.koyeb.com/services/deploy"
            echo "  Repository: https://github.com/manisoft-git/Manisoft_Panel"
            echo "----------------------------------------------------------------------"
            exit 0
        fi

        echo ""
        echo "[*] Registered Apps on Koyeb:"
        "$KOYEB_BIN" apps list || true
        echo ""
        echo "[*] Registered Services on Koyeb (app: manisoft):"
        "$KOYEB_BIN" services list --app manisoft 2>/dev/null || "$KOYEB_BIN" services list || true
        exit 0
        ;;

    all|fleet)
        echo "[*] Deploying entire sovereign fleet to Koyeb 24/7..."
        if ! "$KOYEB_BIN" whoami >/dev/null 2>&1; then
            echo "[!] Error: Koyeb CLI is not authenticated. Run: ./deploy-koyeb.sh set-token <token>"
            exit 1
        fi

        APP_NAME="manisoft"
        "$KOYEB_BIN" apps create "$APP_NAME" 2>/dev/null || true

        python3 -c "
import json, subprocess

config = json.load(open('$CONFIG_FILE'))
projects = config.get('projects', {})
app_name = config.get('appName', 'manisoft')
inst_type = config.get('instanceType', 'nano')
region = config.get('region', 'was')

for name, meta in projects.items():
    svc_name = f'manisoft-{name.lower().replace(\"_\", \"-\")}'
    repo = meta['repo']
    port = meta['port']
    branch = meta.get('branch', 'main')
    print(f'[*] Deploying {name} ({svc_name}) on port {port} from {repo}...')

    # Check if service already exists
    check_cmd = ['koyeb', 'services', 'describe', svc_name, '--app', app_name]
    res = subprocess.run(check_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f'    [↺] Service {svc_name} exists. Triggering redeploy...')
        subprocess.run(['koyeb', 'services', 'redeploy', svc_name, '--app', app_name])
    else:
        print(f'    [+] Creating new Koyeb service {svc_name}...')
        create_cmd = [
            'koyeb', 'services', 'create', svc_name,
            '--app', app_name,
            '--git', repo,
            '--git-branch', branch,
            '--instance-type', inst_type,
            '--regions', region,
            '--env', f'PORT={port}',
            '--ports', f'{port}:http',
            '--routes', f'/:{port}'
        ]
        subprocess.run(create_cmd)
print('✓ Fleet deployment commands dispatched to Koyeb.')
"
        echo ""
        echo "[*] Updated Fleet Status on Koyeb:"
        "$KOYEB_BIN" services list --app manisoft || true
        ;;

    *)
        PROJ_NAME="$COMMAND"
        echo "[*] Deploying single project: $PROJ_NAME to Koyeb..."
        if ! "$KOYEB_BIN" whoami >/dev/null 2>&1; then
            echo "[!] Error: Koyeb CLI is not authenticated. Run: ./deploy-koyeb.sh set-token <token>"
            exit 1
        fi

        APP_NAME="manisoft"
        "$KOYEB_BIN" apps create "$APP_NAME" 2>/dev/null || true

        python3 -c "
import json, subprocess, sys

config = json.load(open('$CONFIG_FILE'))
projects = config.get('projects', {})
app_name = config.get('appName', 'manisoft')
inst_type = config.get('instanceType', 'nano')
region = config.get('region', 'was')

matched_key = None
for k in projects:
    if k.lower() == '$PROJ_NAME'.lower() or k.lower().replace('_', '-') == '$PROJ_NAME'.lower():
        matched_key = k
        break

if not matched_key:
    print(f'[!] Project $PROJ_NAME not found in koyeb.json. Available: {list(projects.keys())}')
    sys.exit(1)

meta = projects[matched_key]
svc_name = f'manisoft-{matched_key.lower().replace(\"_\", \"-\")}'
repo = meta['repo']
port = meta['port']
branch = meta.get('branch', 'main')

print(f'[*] Deploying {matched_key} -> {svc_name} (Port {port})')
check_cmd = ['koyeb', 'services', 'describe', svc_name, '--app', app_name]
res = subprocess.run(check_cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f'    [↺] Triggering redeploy for {svc_name}...')
    subprocess.run(['koyeb', 'services', 'redeploy', svc_name, '--app', app_name])
else:
    print(f'    [+] Creating service {svc_name}...')
    create_cmd = [
        'koyeb', 'services', 'create', svc_name,
        '--app', app_name,
        '--git', repo,
        '--git-branch', branch,
        '--instance-type', inst_type,
        '--regions', region,
        '--env', f'PORT={port}',
        '--ports', f'{port}:http',
        '--routes', f'/:{port}'
    ]
    subprocess.run(create_cmd)
"
        ;;
esac
