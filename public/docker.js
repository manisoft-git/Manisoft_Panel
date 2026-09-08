// Docker & Cluster Hypervisor Deck
export function renderDockerDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>DOCKER & CLOUD CONTAINER HYPERVISOR</h3>
      <span class="pill pill-green">CGROUP V2 ENFORCED (MemoryMax=650M)</span>
    </div>
    <div class="container-list">
      <div class="container-card">
        <div class="c-title">manisoft-singularity:v100.0</div>
        <div class="c-meta">STATUS: ACTIVE | PORTS: 3000, 6379 | REPLICAS: 1/1</div>
      </div>
      <div class="container-card">
        <div class="c-title">sibling-mesh-bridge</div>
        <div class="c-meta">STATUS: STANDBY | CGROUP: ISOLATED | IO: NORMAL</div>
      </div>
    </div>
  `;
}
