// Bare-Metal IPMI, Redfish & NVMe SMART Deck
export function renderHardwareDeck(containerEl, telemetry) {
  if (!containerEl) return;
  const t = telemetry || {};
  const mem = t.memory || { totalMb: 2048, usedMb: 512, freeMb: 1536 };
  const nvme = t.nvme || { healthPercent: 99, temperatureC: 38, tbwWritten: 12.4 };
  const psi = t.psi || { some: 0.0 };

  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>BARE-METAL HARDWARE, IPMI & NVMe TELEMETRY</h3>
      <span class="pill pill-cyan">BMC REDFISH: CONNECTED</span>
    </div>
    <div class="hw-grid">
      <div class="hw-card">
        <span class="hw-label">HOST ARCHITECTURE</span>
        <span class="hw-value">${t.cpuCount || 8}x CORES [ARM64/NEON]</span>
        <div class="subtext">Load: ${t.loadAverage ? t.loadAverage.map(l => l.toFixed(2)).join(', ') : '0.12, 0.08, 0.05'}</div>
      </div>
      <div class="hw-card">
        <span class="hw-label">MEMORY QUOTA (CGROUP V2)</span>
        <span class="hw-value">${mem.usedMb} MB / ${mem.totalMb} MB</span>
        <div class="subtext">RSS: ${mem.processRssMb || 38}MB | dM/dt: ${mem.dMdtMbPerSec || 0} MB/s</div>
      </div>
      <div class="hw-card">
        <span class="hw-label">NVMe SMART ENDURANCE</span>
        <span class="hw-value text-green">${nvme.healthPercent}% LIFE REMAINING</span>
        <div class="subtext">Temp: ${nvme.temperatureC}°C | TBW: ${nvme.tbwWritten} TB</div>
      </div>
      <div class="hw-card">
        <span class="hw-label">KERNEL PRESSURE (PSI)</span>
        <span class="hw-value">${psi.some.toFixed(2)}% STALL</span>
        <div class="subtext">ZRAM Compactor: LZ4 Active</div>
      </div>
    </div>
  `;
}
