// Linux Chaos Engineering & Fault Injection Engine
import { sound } from './sound.js';

export function renderChaosDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>CHAOS ENGINEERING & KERNEL FAULT INJECTION LAB</h3>
      <span class="pill pill-red">SANDBOX MODE: ENGAGED</span>
    </div>
    <div class="chaos-controls">
      <div class="slider-group">
        <label>Synthetic Packet Loss: <span id="val-packet-loss">0%</span></label>
        <input type="range" id="slider-loss" min="0" max="50" value="0">
      </div>
      <div class="slider-group">
        <label>Carrier Latency Jitter: <span id="val-latency">0 ms</span></label>
        <input type="range" id="slider-jitter" min="0" max="500" value="0" step="10">
      </div>
      <div class="slider-group">
        <label>cgroup Memory Throttle: <span id="val-mem-throttle">Unlimited</span></label>
        <input type="range" id="slider-throttle" min="200" max="650" value="650">
      </div>
      <div class="chaos-actions">
        <button id="btn-fire-chaos" class="btn-danger-sm">💥 INJECT FAULT SCENARIO</button>
        <button id="btn-reset-chaos" class="btn-ghost-sm">RESTORE EQUILIBRIUM</button>
      </div>
    </div>
  `;

  const lossInput = containerEl.querySelector('#slider-loss');
  const jitterInput = containerEl.querySelector('#slider-jitter');
  if (lossInput) {
    lossInput.addEventListener('input', () => {
      containerEl.querySelector('#val-packet-loss').textContent = `${lossInput.value}%`;
    });
  }
  if (jitterInput) {
    jitterInput.addEventListener('input', () => {
      containerEl.querySelector('#val-latency').textContent = `${jitterInput.value} ms`;
    });
  }

  const fireBtn = containerEl.querySelector('#btn-fire-chaos');
  if (fireBtn) {
    fireBtn.addEventListener('click', () => {
      sound.error();
      alert(`[CHAOS LAB] Injected ${lossInput.value}% packet loss and ${jitterInput.value}ms jitter into test cgroup.`);
    });
  }
}
