# 🚀 Manisoft Panel — 24/7 Cloud Deployment Guide

This guide deploys your Manisoft Panel + Mani AI to a **free Google Cloud VM** so it runs 24/7 — even when your phone is off.

---

## ⚡ Step 1 — Open Google Cloud Shell

1. Go to **https://console.cloud.google.com**
2. Click the **`>_`** (Activate Cloud Shell) button in the top-right toolbar
3. A terminal opens at the bottom of the page

---

## ⚡ Step 2 — Clone and Run the Deploy Script

Paste this into Cloud Shell:

```bash
git clone https://github.com/manisoft-git/Manisoft_Panel ~/manisoft-panel && \
cd ~/manisoft-panel && \
bash cloudshell-deploy.sh
```

The script will:
- ✅ Enable the Compute Engine API on project `manisoft-508215`
- ✅ Create an **e2-micro VM** (always-free eligible, us-central1)
- ✅ Open firewall for port 3000
- ✅ Install Node.js + clone the panel on the VM
- ✅ Set up a systemd service that auto-restarts on reboot
- ✅ Print the VM's external IP when done

> **Takes ~3–5 minutes total** (VM provisioning + first boot setup)

---

## ⚡ Step 3 — Set Your Gemini API Key on the VM

After the deploy script finishes, SSH into the VM from Cloud Shell:

```bash
gcloud compute ssh manisoft-panel --zone=us-central1-a --project=manisoft-508215
```

Then inside the VM:

```bash
echo 'GEMINI_API_KEY=your_actual_key_here' >> /opt/manisoft-panel/.env
systemctl restart manisoft-panel
```

---

## ⚡ Step 4 — Connect Your Panel to the Cloud VM

Add this environment variable to your **Render / Railway / Fly.io** deployment (or local `.env`):

```
CLOUD_AGY_URL=http://<VM_EXTERNAL_IP>:3000
```

Replace `<VM_EXTERNAL_IP>` with the IP printed by the deploy script.

Now Mani AI routes through the cloud VM when available — full AGY features 24/7! 🎉

---

## 📋 Useful Cloud Shell Commands

```bash
# Check VM status
gcloud compute instances describe manisoft-panel --zone=us-central1-a --project=manisoft-508215

# SSH into VM
gcloud compute ssh manisoft-panel --zone=us-central1-a --project=manisoft-508215

# View panel logs
gcloud compute ssh manisoft-panel --zone=us-central1-a --project=manisoft-508215 \
  --command='sudo journalctl -u manisoft-panel -n 50 --no-pager'

# Delete VM (to redeploy fresh)
gcloud compute instances delete manisoft-panel --zone=us-central1-a --project=manisoft-508215 --quiet
```

---

## 💰 Cost

| Resource | Cost |
|----------|------|
| e2-micro VM (us-central1/us-east1/us-west1) | **Free** (always-free tier: 720 hrs/mo) |
| 20GB standard disk | **Free** (30GB included in free tier) |
| Egress traffic (first 1GB/mo) | **Free** |
| **Total** | **$0/month** |

> The free tier applies as long as you use `e2-micro` in `us-central1`, `us-east1`, or `us-west1`.
