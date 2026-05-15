const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;
let dpr = 1;

let particles = [];
let stars = [];

const HORIZON_RATIO = 0.78;

function resize() {
  dpr = Math.min(1.25, window.devicePixelRatio || 1);
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildScene();
}

window.addEventListener("resize", resize);

function heartPoint(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  };
}

function buildScene() {
  particles = [];
  stars = [];

  const cx = W / 2;
  const cy = H / 2 + 10;
  const scale = Math.min(W, H) / 25;

  const count = 200;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const p = heartPoint(t);

    const ring = 0.88 + Math.sin(i * 0.7) * 0.03;
    const tx = cx + p.x * scale * ring;
    const ty = cy - p.y * scale * ring;

    const isName = i % 13 === 0;

    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      tx,
      ty,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      word: isName ? "Emelyne" : "I love you",
      isName,
      size: isName ? 12 + Math.random() * 3 : 8 + Math.random() * 2,
      alpha: isName ? 0.42 : 0.24
    });
  }

  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.8,
      alpha: 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function drawBackground(t) {
  ctx.fillStyle = "#020205";
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.85);
  glow.addColorStop(0, "rgba(255, 50, 110, 0.12)");
  glow.addColorStop(0.35, "rgba(255, 50, 110, 0.05)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function drawStars(t) {
  for (const s of stars) {
    const twinkle = 0.45 + Math.sin(t * 0.001 + s.phase) * 0.35;

    ctx.beginPath();
    ctx.shadowColor = "rgba(255,255,255,0.8)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle})`;
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}

function drawHeartGlow(t) {
  const cx = W / 2;
  const cy = H / 2 + 10;
  const pulse = 1 + Math.sin(t * 0.0025) * 0.03;
  const scale = Math.min(W, H) / 18 * pulse;

  ctx.save();
  ctx.shadowColor = "rgba(255, 70, 120, 0.8)";
  ctx.shadowBlur = 55;

  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, scale * 2.1);
  g.addColorStop(0, "rgba(255, 190, 210, 0.22)");
  g.addColorStop(0.25, "rgba(255, 95, 145, 0.14)");
  g.addColorStop(0.6, "rgba(255, 45, 100, 0.07)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();

  let started = false;
  for (let tt = 0; tt <= Math.PI * 2 + 0.03; tt += 0.03) {
    const p = heartPoint(tt);
    const x = cx + p.x * scale * 0.55;
    const y = cy - p.y * scale * 0.55;
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawParticles(t) {
  const cx = W / 2;
  const cy = H / 2 + 10;
  const pulse = 1 + Math.sin(t * 0.0025) * 0.03;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;

    p.vx += dx * 0.015;
    p.vy += dy * 0.015;
    p.vx += Math.sin(t * 0.001 + p.phase) * 0.004;
    p.vy += Math.cos(t * 0.0012 + p.phase) * 0.004;
    p.vx *= 0.88;
    p.vy *= 0.88;

    p.x += p.vx;
    p.y += p.vy;

    const wobbleX = Math.sin(t * 0.001 + p.phase) * 0.4;
    const wobbleY = Math.cos(t * 0.0012 + p.phase) * 0.4;

    const x = cx + (p.x - cx) * pulse + wobbleX;
    const y = cy + (p.y - cy) * pulse + wobbleY;

    const dist = Math.hypot(dx, dy);
    const alpha = Math.max(0.06, p.alpha * (1 - dist / 260));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.0008 + p.phase) * 0.03);

    if (p.isName) {
      const glow = 0.75 + Math.sin(t * 0.005 + p.phase) * 0.25;
      ctx.font = `800 ${p.size}px Georgia, serif`;
      ctx.shadowColor = "rgba(255, 70, 120, 1)";
      ctx.shadowBlur = 14 + glow * 10;
      ctx.fillStyle = `rgba(255, ${170 + glow * 30}, ${190 + glow * 20}, ${0.72 + glow * 0.18})`;
      ctx.fillText(p.word, 0, 0);
    } else {
      const glow = 0.55 + Math.sin(t * 0.004 + p.phase) * 0.25;
      ctx.font = `700 ${p.size}px "Courier New", monospace`;
      ctx.shadowColor = "rgba(255, 70, 120, 0.9)";
      ctx.shadowBlur = 8 + glow * 8;
      ctx.fillStyle = `rgba(255, ${90 + glow * 35}, ${140 + glow * 25}, ${0.45 + glow * 0.35})`;
      ctx.fillText(p.word, 0, 0);
    }

    ctx.restore();
  }

  ctx.globalCompositeOperation = "source-over";
}

function drawReflection(t) {
  const horizon = H * HORIZON_RATIO;

  const water = ctx.createLinearGradient(0, horizon, 0, H);
  water.addColorStop(0, "rgba(255, 40, 110, 0.00)");
  water.addColorStop(0.18, "rgba(255, 40, 110, 0.05)");
  water.addColorStop(1, "rgba(255, 40, 110, 0.16)");
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, W, H - horizon);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizon, W, H - horizon);
  ctx.clip();

  ctx.globalCompositeOperation = "lighter";

  const cx = W / 2;
  const cy = H / 2 + 10;
  const pulse = 1 + Math.sin(t * 0.0025) * 0.03;

  for (const p of particles) {
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;

    const x = cx + (p.x - cx) * pulse;
    const y = cy + (p.y - cy) * pulse;

    const ry = horizon + (horizon - y) + Math.sin(t * 0.001 + p.phase) * 2;
    const alpha = p.isName ? 0.12 : 0.08;

    ctx.save();
    ctx.translate(x, ry);
    ctx.rotate(Math.sin(t * 0.0008 + p.phase) * 0.02);

    if (p.isName) {
      ctx.font = `800 ${p.size}px Georgia, serif`;
      ctx.shadowColor = "rgba(255, 70, 120, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(255, 160, 185, ${alpha})`;
      ctx.fillText(p.word, 0, 0);
    } else {
      ctx.font = `700 ${p.size}px "Courier New", monospace`;
      ctx.shadowColor = "rgba(255, 70, 120, 0.45)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(255, 110, 150, ${alpha})`;
      ctx.fillText(p.word, 0, 0);
    }

    ctx.restore();
  }

  const waveCount = 18;
  for (let i = 0; i < waveCount; i++) {
    const y = horizon + i * ((H - horizon) / waveCount);
    const wave = Math.sin(t * 0.002 + i * 0.5) * 4;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 70, 120, ${0.03 + i * 0.0015})`;
    ctx.lineWidth = 1;
    ctx.moveTo(0, y + wave);
    ctx.lineTo(W, y - wave * 0.25);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}

function drawTitle(t) {
  const x = W / 2;
  const y = H / 2 + 10;
  const mainSize = Math.min(62, Math.max(30, W * 0.048));
  const subSize = Math.max(12, mainSize * 0.3);
  const pulse = 1 + Math.sin(t * 0.003) * 0.015;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `900 ${mainSize * pulse}px Georgia, serif`;
  ctx.shadowColor = "rgba(255, 70, 120, 0.8)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.fillText("Emelyne", x, y);

  ctx.fillStyle = "rgba(255, 75, 120, 0.95)";
  ctx.fillText("Emelyne", x + 1, y);

  ctx.font = `italic 700 ${subSize}px Georgia, serif`;
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(255, 210, 220, 0.94)";
  ctx.fillText("♥  I love you  ♥", x, y + mainSize * 0.74);

  ctx.restore();
}

function drawFlare(t) {
  const cx = W / 2;
  const cy = H / 2 + 10;
  const r = Math.min(W, H) * 0.09 * (1 + Math.sin(t * 0.0028) * 0.02);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "rgba(255, 90, 140, 0.7)";
  ctx.shadowBlur = 35;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(255, 180, 200, 0.14)");
  g.addColorStop(0.45, "rgba(255, 90, 140, 0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}

function loop(t) {
  drawBackground(t);
  drawStars(t);
  drawHeartGlow(t);
  drawFlare(t);
  drawParticles(t);
  drawTitle(t);
  drawReflection(t);
  requestAnimationFrame(loop);
}

resize();
requestAnimationFrame(loop);