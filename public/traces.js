// Agent Traces & Gantt Waterfall Deck
export function renderTracesDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>AUTONOMOUS AGENT EXECUTION TRACES & WATERFALL</h3>
      <span class="pill pill-green">ZERO BOTTLENECK DETECTED</span>
    </div>
    <div class="gantt-chart">
      <div class="gantt-row">
        <span class="gantt-label">1. Ingest & AST</span>
        <div class="gantt-bar-wrap"><div class="gantt-bar" style="width: 25%; background: var(--color-cyan);">2.1ms</div></div>
      </div>
      <div class="gantt-row">
        <span class="gantt-label">2. Module Resolve</span>
        <div class="gantt-bar-wrap"><div class="gantt-bar" style="width: 40%; background: var(--color-neon);">3.8ms</div></div>
      </div>
      <div class="gantt-row">
        <span class="gantt-label">3. 5-Layer Test</span>
        <div class="gantt-bar-wrap"><div class="gantt-bar" style="width: 65%; background: var(--color-amber);">6.2ms</div></div>
      </div>
      <div class="gantt-row">
        <span class="gantt-label">4. Sovereign Deploy</span>
        <div class="gantt-bar-wrap"><div class="gantt-bar" style="width: 15%; background: var(--color-neon);">1.4ms</div></div>
      </div>
    </div>
  `;
}
