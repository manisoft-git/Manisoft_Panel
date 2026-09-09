// Live Fleet Address Matrix Deck Controller
import { sound } from './sound.js';

export async function renderFleetMatrix(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = '<div class="loading-spinner">SCANNING MULTI-PROJECT SOVEREIGN FLEET...</div>';

  try {
    const res = await fetch('/api/fleet');
    const data = await res.json();
    const projects = data.projects || [];

    let html = `
      <div class="deck-header-row">
        <h3>LIVE FLEET ADDRESS MATRIX & HYPERVISOR</h3>
        <div class="deck-actions">
          <button id="btn-publish-all" class="btn-primary-sm">⚡ PUBLISH ENTIRE FLEET</button>
          <button id="btn-sync-all" class="btn-secondary-sm">🐙 SYNC ALL TO GITHUB</button>
          <button id="btn-fleet-refresh" class="btn-ghost-sm">↻ REFRESH</button>
        </div>
      </div>
      <div class="fleet-table-wrapper">
        <table class="noc-table">
          <thead>
            <tr>
              <th>PROJECT NAME</th>
              <th>FRAMEWORK</th>
              <th>PORT</th>
              <th>STATUS & LATENCY</th>
              <th>LIVE PUBLIC ADDRESS</th>
              <th>SSL CERT</th>
              <th>1-TAP ACTIONS</th>
            </tr>
          </thead>
          <tbody>
    `;

    projects.forEach(p => {
      const isRunning = p.liveStatus === 'running';
      const statusBadge = isRunning 
        ? `<span class="pill pill-green"><span class="dot-pulse green"></span> ONLINE (${p.latencyMs || 4}ms)</span>`
        : (p.liveStatus === 'decommissioned' 
            ? `<span class="pill pill-red"><span class="dot-pulse red"></span> DECOMMISSIONED</span>`
            : `<span class="pill pill-amber"><span class="dot-pulse amber"></span> STOPPED</span>`);

      const liveUrl = p.publicUrl || `http://127.0.0.1:${p.port}`;
      html += `
        <tr data-project="${p.name}">
          <td class="proj-title"><strong>${p.name.toUpperCase()}</strong></td>
          <td><span class="badge badge-tech">${p.framework || 'Python / Web'}</span></td>
          <td><code>:${p.port}</code></td>
          <td>${statusBadge}</td>
          <td>
            <div class="url-cell">
              <a href="${liveUrl}" target="_blank" class="live-link" rel="noopener">${liveUrl}</a>
              <button class="btn-icon copy-url" title="Copy URL" data-url="${liveUrl}">📋</button>
            </div>
          </td>
          <td><span class="ssl-counter">🔒 ${p.sslDaysLeft || 90}d</span></td>
          <td>
            <div class="action-buttons">
              <a href="${liveUrl}" target="_blank" class="btn-action open" rel="noopener">LAUNCH</a>
              <button class="btn-action restart" data-name="${p.name}">RELOAD</button>
              <button class="btn-action unpublish danger" data-name="${p.name}">UNPUBLISH</button>
              <button class="btn-action qr" data-port="${p.port}">QR</button>
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

    // Attach Action Listeners
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

    containerEl.querySelectorAll('.btn-action.unpublish').forEach(b => {
      b.addEventListener('click', async () => {
        sound.error();
        const name = b.dataset.name;
        if (!confirm(`Confirm de-provisioning and scale-to-zero for ${name}?`)) return;
        b.textContent = 'DECOMMISSIONING...';
        await fetch(`/api/cloud/unpublish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: name })
        });
        sound.success();
        renderFleetMatrix(containerEl);
      });
    });

    containerEl.querySelectorAll('.btn-action.qr').forEach(b => {
      b.addEventListener('click', async () => {
        sound.tap();
        const port = b.dataset.port;
        const res = await fetch(`/tunnel/${port}`);
        const tData = await res.json();
        alert(`Ephemeral Micro-Tunnel provisioned for port :${port}\nPublic Link: ${tData.qrUrl || 'http://127.0.0.1:' + port}`);
      });
    });

    const publishAllBtn = containerEl.querySelector('#btn-publish-all');
    if (publishAllBtn) {
      publishAllBtn.addEventListener('click', async () => {
        sound.tap();
        publishAllBtn.textContent = '⚡ PUBLISHING...';
        try {
          const res = await fetch('/api/fleet/publish', { method: 'POST' });
          const data = await res.json();
          sound.success();
          alert(data.message || 'Entire fleet published.');
        } catch (e) {
          sound.error();
          alert('Fleet publish failed: ' + e.message);
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
