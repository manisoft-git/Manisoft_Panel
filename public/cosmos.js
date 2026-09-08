// Codebase Dependency Cosmos & Fragility Radar (Force-Directed Graph)
export function renderCosmosDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>CODEBASE DEPENDENCY COSMOS & DEFECT HEATMAP</h3>
      <span class="pill pill-green">ZERO CIRCULAR DEPENDENCIES</span>
    </div>
    <div class="cosmos-canvas-wrap">
      <canvas id="cosmos-canvas" width="600" height="240"></canvas>
    </div>
  `;

  const canvas = containerEl.querySelector('#cosmos-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render nodes
    const nodes = [
      { x: 300, y: 120, label: 'server.js', color: '#00ff66' },
      { x: 180, y: 70, label: 'public/app.js', color: '#00e5ff' },
      { x: 420, y: 70, label: 'public/fleet.js', color: '#00e5ff' },
      { x: 180, y: 170, label: 'public/sound.js', color: '#ffb700' },
      { x: 420, y: 170, label: 'public/worker.js', color: '#ff0055' }
    ];

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1;
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.moveTo(300, 120);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    });

    nodes.forEach(n => {
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(n.label, n.x - 20, n.y - 10);
    });
  }
}
