// Lossless Media & WebCodecs Scrubber Deck
export function renderMediaDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>LOSSLESS WEBCODECS & AUDIO OSCILLOSCOPE</h3>
      <span class="pill pill-cyan">OFFSCREEN CANVAS READY</span>
    </div>
    <div class="media-body">
      <p class="subtext">Frame-accurate WebCodecs scrubbing active. Direct canvas blit enabled.</p>
    </div>
  `;
}
