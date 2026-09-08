// Autonomous Visual Regression SSIM Arbiter
export function renderSSIMDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>HEADLESS VISUAL REGRESSION & SSIM ARBITER</h3>
      <span class="pill pill-green">SSIM SCORE: 0.998 [ZERO DRIFT]</span>
    </div>
    <div class="ssim-preview">
      <div class="ssim-col">
        <span class="subtext">Baseline Snapshot</span>
        <div class="mock-viewport baseline">PASS</div>
      </div>
      <div class="ssim-col">
        <span class="subtext">Current Staging</span>
        <div class="mock-viewport staging">PASS</div>
      </div>
    </div>
  `;
}
