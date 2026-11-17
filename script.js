(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = document.getElementById('logo');
  const cv = document.getElementById('fx');
  const cx = cv.getContext('2d');
  const cols = ['#2f6bff', '#8a3dff', '#ff3da8', '#18e6ff', '#ff8a1f', '#2dff9a'];
  let W, H, ps = [], bursts = [];
  let tx = 0, ty = 0, cur = { x: 0, y: 0 }, last = -1e4;

  const mk = () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + 0.6,
    vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.4 + 0.1),
    c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 0.6 + 0.3
  });

  function size() {
    const D = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * D; cv.height = H * D;
    cx.setTransform(D, 0, 0, D, 0, 0);
    const n = Math.round(Math.min(60, (W * H) / 14000));
    ps = Array.from({ length: n }, mk);
    if (reduce) draw(0);
  }

  function dot(x, y, r, c, a) {
    cx.globalAlpha = a; cx.fillStyle = c;
    cx.beginPath(); cx.arc(x, y, r, 0, 6.283); cx.fill();
  }

  function draw(t) {
    cx.clearRect(0, 0, W, H);
    for (const p of ps) {
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
      }
      dot(p.x, p.y, p.r, p.c, p.a);
    }
    for (let i = bursts.length; i--;) {
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy; b.vy += 0.04; b.l -= 0.025;
      if (b.l <= 0) { bursts.splice(i, 1); continue; }
      dot(b.x, b.y, 2.2, b.c, b.l);
    }
    cx.globalAlpha = 1;
  }

  function frame(t) {
    draw(t);
    if (t - last > 2500) { tx = Math.sin(t / 1500) * 0.8; ty = Math.cos(t / 2000) * 0.5; }
    cur.x += (tx - cur.x) * 0.08;
    cur.y += (ty - cur.y) * 0.08;
    logo.style.setProperty('--ry', (cur.x * 18).toFixed(2) + 'deg');
    logo.style.setProperty('--rx', (6 - cur.y * 12).toFixed(2) + 'deg');
    requestAnimationFrame(frame);
  }

  addEventListener('resize', size);
  size();
  if (reduce) return;

  addEventListener('pointermove', e => {
    tx = (e.clientX / W - 0.5) * 2;
    ty = (e.clientY / H - 0.5) * 2;
    last = performance.now();
  }, { passive: true });

  addEventListener('pointerdown', e => {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * 6.283, s = Math.random() * 3 + 1;
      bursts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1,
        l: 1, c: cols[(Math.random() * cols.length) | 0] });
    }
  }, { passive: true });

  requestAnimationFrame(frame);
})();
