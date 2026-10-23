// Live Fleet Address Matrix Deck Controller with Render 24/7 Cloud Hypervisor
import { sound } from './sound.js';

export async function renderFleetMatrix(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = '<div class="loading-spinner">SCANNING FLEET & RENDER 24/7 CLOUD MATRIX...</div>';

  try {
    const [fleetRes, renderRes] = await Promise.all([
      fetch('/api/fleet').then(r => r.json()).catch(() => ({ projects: [] })),
      fetch('/api/render/services').then(r => r.json()).catch(() => ({ services: [] }))
    ]);

    const projects = fleetRes.projects || [];
    const cloudServices = renderRes.services || [];

    // Map each project to its Render cloud service
    projects.forEach(p => {
      const matchName = `manisoft-${p.name.toLowerCase().replace(/_/g, '-')}`;
      p.cloudService = cloudServices.find(s => {
        if (!s) return false;
        if (s.name && s.name.toLowerCase() === matchName) return true;
        if (s.repo && s.repo.toLowerCase().includes(p.name.toLowerCase())) return true;
        return false;
      }) || null;
    });

    const panelUrl = "https://manisoft-panel.onrender.com";

    let html = `
      <!-- Master Panel 24/7 Cloud Host Banner -->
      <div class="cloud-banner-box" style="background:linear-gradient(90deg, rgba(16,185,129,0.12), rgba(14,165,233,0.12)); border:1px solid rgba(16,185,129,0.4); border-radius:8px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="dot-pulse green"></span>
            <strong style="color:#10b981; font-size:0.95rem; letter-spacing:0.5px;">MASTER PANEL 24/7 CLOUD RUNNER ACTIVE</strong>
            <span style="background:rgba(16,185,129,0.2); color:#10b981; font-size:0.7rem; padding:2px 6px; border-radius:4px; font-weight:700;">ALWAYS-ON</span>
          </div>
          <div style="margin-top:4px; font-size:0.85rem; color:#94a3b8;">
            Direct 24/7 Address: <a href="${panelUrl}" target="_blank" rel="noopener" style="color:#38bdf8; font-weight:700; font-family:monospace; text-decoration:underline;">${panelUrl}</a>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn-icon copy-url" data-url="${panelUrl}" title="Copy Link" style="background:#1e293b; border:1px solid #334155; color:#fff; padding:6px 12px; border-radius:6px; font-size:0.8rem; cursor:pointer; font-weight:600;">📋 Copy Panel Link</button>
          <a href="${panelUrl}" target="_blank" rel="noopener" style="background:#10b981; color:#000; font-weight:800; padding:6px 14px; border-radius:6px; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">OPEN 24/7 PANEL ↗</a>
        </div>
      </div>

      <div class="deck-header-row">
        <div>
          <h3 style="margin:0; font-size:1.1rem; color:#f8fafc;">LIVE FLEET ADDRESS MATRIX & 24/7 CLOUD HYPERVISOR</h3>
          <p style="font-size:0.78rem; color:#8892b0; margin:4px 0 0 0;">
            1-Click deploy any project to 24/7 worldwide HTTPS cloud hosting. Scale to zero anytime.
          </p>
        </div>
        <div class="deck-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
          <button id="btn-zeabur-deploy" class="btn-primary-sm" style="background:#8b5cf6; color:#fff; font-weight:700;">⚡ LAUNCH ZEABUR (1-CLICK)</button>
          <button id="btn-cloud-publish-all" class="btn-primary-sm" style="background:#10b981; color:#000; font-weight:700;">☁️ DEPLOY RENDER 24/7</button>
          <button id="btn-publish-all" class="btn-primary-sm">⚡ START LOCAL</button>
          <button id="btn-sync-all" class="btn-secondary-sm">🐙 SYNC GITHUB</button>
          <button id="btn-make-public" class="btn-secondary-sm" style="border-color:#38bdf8; color:#38bdf8;">🌐 MAKE REPOS PUBLIC</button>
          <button id="btn-fleet-refresh" class="btn-ghost-sm">↻ REFRESH</button>
        </div>
      </div>

      <div class="fleet-table-wrapper" style="overflow-x:auto; margin-top:12px;">
        <table class="noc-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="min-width:130px;">PROJECT</th>
              <th style="min-width:110px;">STACK</th>
              <th style="min-width:100px;">LOCAL HOST</th>
              <th style="min-width:280px;">24/7 CLOUD ADDRESS (RENDER)</th>
              <th style="min-width:110px;">CLOUD STATE</th>
              <th style="min-width:200px;">1-TAP CLOUD CONTROLS</th>
              <th style="min-width:120px;">LOCAL</th>
            </tr>
          </thead>
          <tbody>
    `;

    projects.forEach(p => {
      const isRunning = p.liveStatus === 'running';
      const localStatusBadge = isRunning 
        ? `<span class="pill pill-green"><span class="dot-pulse green"></span> ONLINE (${p.latencyMs || 4}ms)</span>`
        : (p.liveStatus === 'decommissioned' 
            ? `<span class="pill pill-red"><span class="dot-pulse red"></span> OFF</span>`
            : `<span class="pill pill-amber"><span class="dot-pulse amber"></span> STOPPED</span>`);

      const localUrl = p.publicUrl || `http://127.0.0.1:${p.port}`;
      const sovereignCloudUrl = `${window.location.origin}/p/${p.name}/`;
      const hasCloud = !!p.cloudService;
      const isSuspended = hasCloud && p.cloudService.suspended;
      const activeUrl = (hasCloud && !isSuspended && p.cloudService.url) ? p.cloudService.url : sovereignCloudUrl;

      const cloudStateBadge = `<span class="pill pill-green" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid #10b981;"><span class="dot-pulse green"></span> 24/7 ONLINE</span>`;

      const cloudUrlDisplay = `
          <div class="cloud-url-box" style="display:flex; align-items:center; justify-content:space-between; gap:6px; background:rgba(14,165,233,0.12); border:1px solid rgba(14,165,233,0.4); padding:6px 10px; border-radius:6px;">
            <a href="${activeUrl}" target="_blank" class="live-cloud-link" rel="noopener" style="color:#38bdf8; font-family:monospace; font-weight:700; font-size:0.85rem; text-decoration:none; word-break:break-all;">
              🔗 ${activeUrl}
            </a>
            <div style="display:flex; gap:4px; align-items:center; flex-shrink:0;">
              <button class="btn-icon copy-url" title="Copy Website Link" data-url="${activeUrl}" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; padding:3px 6px; border-radius:4px; font-size:0.75rem; cursor:pointer;">📋 Copy</button>
              <a href="${activeUrl}" target="_blank" rel="noopener" style="background:#0284c7; color:#fff; font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:2px;">VISIT ↗</a>
            </div>
          </div>
        `;

      let cloudActionBtns = '';
      if (!hasCloud) {
        cloudActionBtns = `<button class="btn-action cloud-deploy" data-name="${p.name}" style="background:#10b981; color:#000; font-weight:800; padding:6px 12px; border-radius:4px; border:none; cursor:pointer;">🚀 DEPLOY 24/7</button>`;
      } else if (isSuspended) {
        cloudActionBtns = `
          <button class="btn-action cloud-resume" data-name="${p.name}" data-id="${p.cloudService.id}" style="background:#3b82f6; color:#fff; font-weight:700; padding:4px 10px; border-radius:4px; border:none; cursor:pointer;">RESUME</button>
          <button class="btn-action cloud-redeploy" data-name="${p.name}" data-id="${p.cloudService.id}" style="background:#1e293b; color:#94a3b8; border:1px solid #334155; padding:4px 8px; border-radius:4px; cursor:pointer;">REBUILD</button>
        `;
      } else {
        cloudActionBtns = `
          <button class="btn-action cloud-unpublish danger" data-name="${p.name}" data-id="${p.cloudService.id}" style="background:rgba(244,63,94,0.12); border:1px solid #f43f5e; color:#f43f5e; font-weight:600; padding:4px 8px; border-radius:4px; cursor:pointer;">UNPUBLISH</button>
          <button class="btn-action cloud-redeploy" data-name="${p.name}" data-id="${p.cloudService.id}" style="background:#1e293b; color:#94a3b8; border:1px solid #334155; padding:4px 8px; border-radius:4px; cursor:pointer;">REBUILD</button>
        `;
      }

      html += `
        <tr data-project="${p.name}">
          <td class="proj-title"><strong style="color:#f1f5f9; font-size:0.9rem;">${p.name.toUpperCase()}</strong></td>
          <td><span class="badge badge-tech">${p.framework || 'Python / Web'}</span></td>
          <td>${localStatusBadge}</td>
          <td>${cloudUrlDisplay}</td>
          <td>${cloudStateBadge}</td>
          <td><div class="action-buttons" style="display:flex; gap:6px; flex-wrap:wrap;">${cloudActionBtns}</div></td>
          <td>
            <div class="action-buttons" style="display:flex; gap:6px;">
              <a href="${localUrl}" target="_blank" class="btn-action open" rel="noopener">LOCAL</a>
              <button class="btn-action restart" data-name="${p.name}">↻</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    containerEl.innerHTML = html;

    // Attach Action Listeners for Cloud Deploy
    containerEl.querySelectorAll('.btn-action.cloud-deploy').forEach(b => {
      b.addEventListener('click', async () => {
        sound.tap();
        const name = b.dataset.name;
        b.textContent = 'DEPLOYING...';
        b.disabled = true;
        try {
          const res = await fetch('/api/render/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: name })
          });
          const result = await res.json();
          if (result.success) {
            sound.success();
            const liveUrl = result.result.url || `https://manisoft-${name.toLowerCase().replace(/_/g, '-')}.onrender.com`;
            prompt(`[✓] Project ${name} is deploying to Render 24/7 Cloud!\n\nAccess Link (Copy below):`, liveUrl);
          } else {
            sound.error();
            alert('[-] Deployment error: ' + (result.error || 'Failed'));
          }
        } catch (e) {
          sound.error();
          alert('[-] Network error: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    });

    // Attach Action Listeners for Cloud Unpublish (Suspend)
    containerEl.querySelectorAll('.btn-action.cloud-unpublish').forEach(b => {
      b.addEventListener('click', async () => {
        sound.error();
        const name = b.dataset.name;
        const id = b.dataset.id;
        if (!confirm(`Unpublish ${name} from 24/7 cloud? The service will be suspended and scale to zero (no resources used).`)) return;
        b.textContent = 'UNPUBLISHING...';
        b.disabled = true;
        try {
          const res = await fetch('/api/render/unpublish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: name, serviceId: id })
          });
          const result = await res.json();
          if (result.success) {
            sound.success();
            alert(`[✓] Project ${name} unpublished from cloud (Scaled to 0).`);
          } else {
            sound.error();
            alert('[-] Error: ' + (result.error || 'Failed'));
          }
        } catch (e) {
          sound.error();
          alert('[-] Error: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    });

    // Attach Action Listeners for Cloud Resume
    containerEl.querySelectorAll('.btn-action.cloud-resume').forEach(b => {
      b.addEventListener('click', async () => {
        sound.tap();
        const name = b.dataset.name;
        const id = b.dataset.id;
        b.textContent = 'RESUMING...';
        b.disabled = true;
        try {
          const res = await fetch('/api/render/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: name, serviceId: id })
          });
          const result = await res.json();
          if (result.success) {
            sound.success();
            alert(`[✓] Project ${name} resumed 24/7 online.`);
          } else {
            sound.error();
            alert('[-] Error: ' + (result.error || 'Failed'));
          }
        } catch (e) {
          sound.error();
          alert('[-] Error: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    });

    // Attach Action Listeners for Cloud Redeploy
    containerEl.querySelectorAll('.btn-action.cloud-redeploy').forEach(b => {
      b.addEventListener('click', async () => {
        sound.tap();
        const name = b.dataset.name;
        const id = b.dataset.id;
        b.textContent = 'TRIGGERING...';
        b.disabled = true;
        try {
          const res = await fetch('/api/render/redeploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: name, serviceId: id })
          });
          const result = await res.json();
          if (result.success) {
            sound.success();
            alert(`[✓] Cloud build triggered on Render for ${name}.`);
          } else {
            sound.error();
            alert('[-] Error: ' + (result.error || 'Failed'));
          }
        } catch (e) {
          sound.error();
          alert('[-] Error: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    });

    // Local restart listener
    containerEl.querySelectorAll('.btn-action.restart').forEach(b => {
      b.addEventListener('click', async () => {
        sound.tap();
        const name = b.dataset.name;
        b.textContent = '...';
        await fetch(`/api/fleet/${name}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restart' })
        });
        sound.success();
        renderFleetMatrix(containerEl);
      });
    });

    // Copy URL
    containerEl.querySelectorAll('.copy-url').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.tap();
        const url = btn.dataset.url;
        navigator.clipboard.writeText(url);
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = orig, 1800);
      });
    });

    // Master Zeabur Launch button
    const zeaburDeployBtn = containerEl.querySelector('#btn-zeabur-deploy');
    if (zeaburDeployBtn) {
      zeaburDeployBtn.addEventListener('click', () => {
        sound.tap();
        window.open('https://dash.zeabur.com', '_blank');
        alert('Opening Zeabur Console (https://dash.zeabur.com):\n1. Click "Sign in with GitHub" (manisoft-git)\n2. Click "+ Create Project" -> name it "manisoft"\n3. Click "Deploy New Service" -> "Git" -> Select your fleet repos (Manisoft_Panel, Lumina, etc.)\n4. Under "Networking", click "Generate Domain" for free 24/7 HTTPS URLs!');
      });
    }

    // Master Koyeb Deploy All button
    const koyebPublishAllBtn = containerEl.querySelector('#btn-koyeb-publish-all');
    if (koyebPublishAllBtn) {
      koyebPublishAllBtn.addEventListener('click', async () => {
        sound.tap();
        try {
          // Check Koyeb auth status
          const statusRes = await fetch('/api/koyeb/status').then(r => r.json()).catch(() => ({ authenticated: false }));
          if (!statusRes.authenticated) {
            const token = prompt('Enter your Koyeb API Token to enable 24/7 autonomous deployment:\n(Get one free at https://app.koyeb.com/user/settings/api)');
            if (!token) return;
            const tokenRes = await fetch('/api/koyeb/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.trim() })
            }).then(r => r.json());
            if (!tokenRes.success) {
              alert('Failed to configure Koyeb token: ' + (tokenRes.error || 'Unknown error'));
              return;
            }
          }

          if (!confirm('Deploy entire fleet to Koyeb 24/7 cloud runner?')) return;
          koyebPublishAllBtn.textContent = '🚀 DEPLOYING KOYEB...';
          koyebPublishAllBtn.disabled = true;

          const pubRes = await fetch('/api/koyeb/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: 'all' })
          }).then(r => r.json());

          sound.success();
          alert('Koyeb Deployment Dispatched:\n' + (pubRes.result?.output || pubRes.output || 'Dispatched successfully!'));
        } catch (err) {
          sound.error();
          alert('Koyeb deploy error: ' + err.message);
        } finally {
          koyebPublishAllBtn.textContent = '🚀 DEPLOY KOYEB 24/7';
          koyebPublishAllBtn.disabled = false;
          renderFleetMatrix(containerEl);
        }
      });
    }

    // Master Cloud Deploy All button (Render)
    const cloudPublishAllBtn = containerEl.querySelector('#btn-cloud-publish-all');
    if (cloudPublishAllBtn) {
      cloudPublishAllBtn.addEventListener('click', async () => {
        if (!confirm('Deploy entire fleet to Render 24/7 cloud?')) return;
        sound.tap();
        cloudPublishAllBtn.textContent = '☁️ DEPLOYING ALL...';
        cloudPublishAllBtn.disabled = true;
        for (const p of projects) {
          try {
            await fetch('/api/render/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ project: p.name })
            });
          } catch (e) {}
        }
        sound.success();
        alert('All projects submitted to Render Cloud. Refreshing matrix...');
        renderFleetMatrix(containerEl);
      });
    }

    // Existing local buttons
    const publishAllBtn = containerEl.querySelector('#btn-publish-all');
    if (publishAllBtn) {
      publishAllBtn.addEventListener('click', async () => {
        sound.tap();
        publishAllBtn.textContent = '⚡ STARTING...';
        try {
          const res = await fetch('/api/fleet/publish', { method: 'POST' });
          const data = await res.json();
          sound.success();
          alert(data.message || 'Entire fleet started locally.');
        } catch (e) {
          sound.error();
          alert('Fleet start failed: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    }

    const syncAllBtn = containerEl.querySelector('#btn-sync-all');
    if (syncAllBtn) {
      syncAllBtn.addEventListener('click', async () => {
        sound.tap();
        syncAllBtn.textContent = '🐙 SYNCING...';
        try {
          const res = await fetch('/api/fleet/sync', { method: 'POST' });
          const data = await res.json();
          sound.success();
          alert(data.message || 'Repositories synced.');
        } catch (e) {
          sound.error();
          alert('Sync failed: ' + e.message);
        }
        renderFleetMatrix(containerEl);
      });
    }

    const makePublicBtn = containerEl.querySelector('#btn-make-public');
    if (makePublicBtn) {
      makePublicBtn.addEventListener('click', async () => {
        sound.tap();
        const token = prompt('Enter your GitHub Personal Access Token (PAT) with repo scope:\n(Create one at https://github.com/settings/tokens/new)');
        if (!token) return;
        makePublicBtn.textContent = '🌐 CONVERTING...';
        makePublicBtn.disabled = true;
        try {
          const res = await fetch('/api/github/make-public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.trim() })
          }).then(r => r.json());
          if (res.success) {
            sound.success();
            alert('Success!\nAll 7 repositories have been converted to PUBLIC!\nYou can now clone anywhere without authentication errors.');
          } else {
            sound.error();
            alert('Failed: ' + (res.error || 'Unknown error'));
          }
        } catch (e) {
          sound.error();
          alert('Request failed: ' + e.message);
        } finally {
          makePublicBtn.textContent = '🌐 MAKE REPOS PUBLIC';
          makePublicBtn.disabled = false;
        }
      });
    }

    const refreshBtn = containerEl.querySelector('#btn-fleet-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', () => { sound.tap(); renderFleetMatrix(containerEl); });

  } catch (err) {
    containerEl.innerHTML = `<div class="error-box">[-] Failed to ingest fleet: ${err.message}</div>`;
  }
}
