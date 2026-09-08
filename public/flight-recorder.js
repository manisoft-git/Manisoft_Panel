// Deterministic Event-Sourced Flight Recorder & Time-Travel Replayer
export function renderFlightRecorder(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>DETERMINISTIC FLIGHT RECORDER & TIME-TRAVEL REPLAYER</h3>
      <span class="pill pill-cyan">TIMELINE: 100% CAPTURED</span>
    </div>
    <div class="recorder-timeline">
      <input type="range" id="timeline-scrubber" min="0" max="100" value="100" class="scrubber-slider">
      <div class="timeline-labels">
        <span>T-00:15:00 [BOOT]</span>
        <span>T-00:07:30 [VERIFY]</span>
        <span>LIVE [T-00:00:00]</span>
      </div>
    </div>
    <div class="recorder-log-view">
      <pre id="recorder-pre">[FLIGHT RECORDER] Microsecond-accurate frame replay active. Scrub slider to rewind state.</pre>
    </div>
  `;
}
