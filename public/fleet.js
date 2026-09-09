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

    let html = `
      <div class="deck-header-row">
        <div>
          <h3>LIVE FLEET ADDRESS MATRIX & 24/7 CLOUD HYPERVISOR</h3>
          <p style="font-size:0.75rem; color:#8892b0; margin:4px 0 0 0;">
            Manage local instances & 1-tap publish/unpublish directly to Render 24/7 Cloud Servers.
          </p>
        </div>
        <div class="deck-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="btn-cloud-publish-all" class="btn-primary-sm" style="background:#10b981; color:#000;">☁️ DEPLOY ALL 24/7</button>
          <button id="btn-publish-all" class="btn-primary-sm">⚡ START ALL LOCAL</button>
          <button id="btn-sync-all" class="btn-secondary-sm">🐙 SYNC GITHUB</button>
          <button id="btn-fleet-refresh" class="btn-ghost-sm">↻ REFRESH</button>
        </div>
      </div>
      <div class="fleet-table-wrapper" style="overflow-x:auto;">
        <table class="noc-table">
          <thead>
            <tr>
              <th>PROJECT</th>
              <th>STACK</th>
              <th>LOCAL STATUS</th>
              <th>24/7 CLOUD ADDRESS (RENDER)</th>
              <th>CLOUD STATE</th>
              <th>1-TAP CLOUD CONTROLS</th>
              <th>LOCAL CONTROLS</th>
            </tr>
          </thead>
          <tbody>
    `;

    projects.forEach(p => {
      const isRunning = p.liveStatus === 'running';
      const localStatusBadge = isRunning 
        ? `<span class="pill pill-green"><span class="dot-pulse green"></span> ONLINE (${p.latencyMs || 4}ms)</span>`
        : (p.liveStatus === 'decommissioned' 
            ? `<span class="pill pill-red"><span class="dot-pulse red"></span> DECOMMISSIONED</span>`
            : `<span class="pill pill-amber"><span class="dot-pulse amber"></span> STOPPED</span>`);

      const localUrl = p.publicUrl || `http://127.0.0.1:${p.port}`;
      const hasCloud = !!p.cloudService;
      const isSuspended = hasCloud && p.cloudService.suspended;
      const cloudUrl = hasCloud ? (p.cloudService.url || '') : '';

      const cloudStateBadge = !hasCloud
        ? `<span class="pill pill-ghost" style="opacity:0.6;">OFFLINE (0 COST)</span>`
        : (isSuspended
            ? `<span class="pill pill-amber">SUSPENDED (0 COST)</span>`
            : `<span class="pill pill-green" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid #10b981;"><span class="dot-pulse green"></span> 24/7 LIVE</span>`);

      const cloudUrlDisplay = (hasCloud && cloudUrl && !isSuspended)
        ? `<div class="url-cell"><a href="${cloudUrl}" target="_blank" class="live-link" rel="noopener" style="color:#38bdf8;">${cloudUrl}</a> <button class="btn-icon copy-url" title="Copy URL" data-url="${cloudUrl}">📋</button></div>`
        : `<span style="color:#64748b; font-size:0.8rem;">—</span>`;

      let cloudActionBtns = '';
      if (!hasCloud) {
        cloudActionBtns = `<button class="btn-action cloud-deploy" data-name="${p.name}" style="background:#10b981; color:#000; font-weight:700;">🚀 DEPLOY 24/7</button>`;
      } else if (isSuspended) {
        cloudActionBtns = `
          <button class="btn-action cloud-resume" data-name="${p.name}" data-id="${p.cloudService.id}" style="background:#3b82f6; color:#fff;">RESUME</button>
          <button class="btn-action cloud-redeploy" data-name="${p.name}" data-id="${p.cloudService.id}">REDEPLOY</button>
        `;
      } else {
        cloudActionBtns = `
          <a href="${cloudUrl}" target="_blank" class="btn-action open" rel="noopener" style="background:#0ea5e9; color:#fff;">VISIT</a>
          <button class="btn-action cloud-unpublish danger" data-name="${p.name}" data-id="${p.cloudService.id}" style="border-color:#f43f5e; color:#f43f5e;">UNPUBLISH</button>
          <button class="btn-action cloud-redeploy" data-name="${p.name}" data-id="${p.cloudService.id}">REBUILD</button>
        `;
      }

      html += `
        <tr data-project="${p.name}">
          <td class="proj-title"><strong>${p.name.toUpperCase()}</strong></td>
          <td><span class="badge badge-tech">${p.framework || 'Python / Web'}</span></td>
          <td>${localStatusBadge}</td>
          <td>${cloudUrlDisplay}</td>
          <td>${cloudStateBadge}</td>
          <td><div class="action-buttons" style="display:flex; gap:6px; flex-wrap:wrap;">${cloudActionBtns}</div></td>
          <td>
            <div class="action-buttons" style="display:flex; gap:6px;">
              <a href="${localUrl}" target="_blank" class="btn-action open" rel="noopener">LOCAL</a>
              <button class="btn-action restart" data-name="${p.name}">RELOAD</button>
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
            alert(`[✓] Project ${name} is deploying to Render 24/7 Cloud!\nLive Address: ${result.result.url || 'Building...'}`);
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
        if (!confirm(`Unpublish ${name} from 24/7 cloud? (Service will be suspended and scale to zero).`)) return;
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
            alert(`[✓] Build triggered on Render for ${name}.`);
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
        navigator.clipboard.writeText(btn.dataset.url);
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '📋', 1500);
      });
    });

    // Master Cloud Deploy All button
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
        alert('All projects submitted to Render Cloud. Check the table for build statuses.');
        renderFleetMatrix(containerEl);
      });
    }

    // Existing buttons
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

    const refreshBtn = containerEl.querySelector('#btn-fleet-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', () => { sound.tap(); renderFleetMatrix(containerEl); });

  } catch (err) {
    containerEl.innerHTML = `<div class="error-box">[-] Failed to ingest fleet: ${err.message}</div>`;
  }
}
