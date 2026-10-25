// Topology Graph Deck (Host Processes, Ports & Network Bridges)
export function renderTopologyDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>SOVEREIGN TOPOLOGY & PORT MATRIX</h3>
      <span class="pill pill-cyan">4 FLEET APPS + 1 CONTROL PLANE</span>
    </div>
    <div class="topology-matrix">
      <div class="topo-node master">
        <strong>MISSION CONTROL CORE</strong>
        <code>127.0.0.1:3000</code>
      </div>
      <div class="topo-branch">⇄</div>
      <div class="topo-fleet-nodes">
        <div class="topo-node">lumina (:8080)</div>
        <div class="topo-node">passmaster_ai (:5050)</div>
        <div class="topo-node">starshine (:5000)</div>
        <div class="topo-node">aether-transport (:9090)</div>
      </div>
    </div>
  `;
}
