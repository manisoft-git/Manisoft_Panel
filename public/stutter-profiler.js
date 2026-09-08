// WebGL / WebGPU Frametime Stutter & Reflow Profiler
export function renderStutterProfiler(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>FRAMETIME STUTTER & REFLOW PROFILER</h3>
      <span class="pill pill-green">60 FPS // ZERO LAYOUT JANK</span>
    </div>
    <div class="profiler-stats">
      <div class="p-stat"><strong>p99 Frametime:</strong> 16.4ms</div>
      <div class="p-stat"><strong>Layout Shifts (CLS):</strong> 0.000</div>
      <div class="p-stat"><strong>Render Loop:</strong> RequestAnimationFrame Offloaded</div>
    </div>
  `;
}
