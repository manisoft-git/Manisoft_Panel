// Matrix Packet-Flow Tracer Canvas (2D Glowing Particle Vectors)
export function initPacketTracer(canvasEl) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  let width = canvasEl.width = canvasEl.offsetWidth || 300;
  let height = canvasEl.height = canvasEl.offsetHeight || 150;

  window.addEventListener('resize', () => {
    width = canvasEl.width = canvasEl.offsetWidth || 300;
    height = canvasEl.height = canvasEl.offsetHeight || 150;
  });

  const particles = [];
  for (let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      hue: Math.random() > 0.5 ? 140 : 180 // Green or Cyan
    });
  }

  function render() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.fillStyle = `hsl(${p.hue}, 100%, 50%)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
