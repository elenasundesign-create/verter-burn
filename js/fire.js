// Огонь, дым и искры на canvas
const Fire = (() => {
  const W = 1440, H = 900;
  let cv, g, dpr = 1, spriteFire, spriteSmoke;
  let flames = [], smokes = [], embers = [], emitters = [];
  let I = 0, running = false, last = 0, clock = 0, raf = 0;
  const DENSITY = 2.6;

  function sprite(stops) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(s => gr.addColorStop(s[0], s[1]));
    x.fillStyle = gr;
    x.fillRect(0, 0, 128, 128);
    return c;
  }

  function init(canvas) {
    cv = canvas;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    g = cv.getContext('2d');
    spriteFire = sprite([
      [0, 'rgba(255,246,214,1)'],
      [.22, 'rgba(255,196,86,.85)'],
      [.5, 'rgba(255,104,22,.42)'],
      [.8, 'rgba(170,32,6,.1)'],
      [1, 'rgba(120,10,0,0)'],
    ]);
    spriteSmoke = sprite([
      [0, 'rgba(38,36,34,.6)'],
      [.6, 'rgba(28,27,26,.25)'],
      [1, 'rgba(20,20,20,0)'],
    ]);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function reset() {
    flames = []; smokes = []; embers = []; emitters = [];
    I = 0; clock = 0;
    if (g) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); }
  }

  function addEmitter(e) {
    emitters.push(Object.assign({ w: 20, rate: 20, scale: 1, delay: 0, level: 0, target: 1, acc: 0, sacc: 0, eacc: 0, t0: clock }, e));
  }

  function fadeEmitters() { emitters.forEach(e => { e.target = 0; }); }
  function setIntensity(v) { I = v; }

  function sparks(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(60, 280);
      embers.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0, max: rand(.2, .55), r: rand(.7, 1.8), grav: 520 });
    }
  }

  function spawnFlame(e) {
    flames.push({
      x: e.x + (Math.random() - .5) * e.w,
      y: e.y + (Math.random() - .5) * 8,
      vx: (Math.random() - .5) * 24,
      vy: -rand(60, 150) * e.scale,
      life: 0,
      max: rand(.45, .95),
      size: rand(14, 32) * e.scale * (.6 + .4 * Math.min(1, I * 1.2)),
      seed: Math.random() * 10,
    });
  }

  function spawnSmoke(e) {
    smokes.push({
      x: e.x + (Math.random() - .5) * e.w * .8,
      y: e.y - 40 * e.scale,
      vx: (Math.random() - .5) * 20 + 6,
      vy: -rand(35, 75),
      life: 0,
      max: rand(3, 5.5),
      s0: 25 * e.scale,
      s1: rand(110, 190) * e.scale,
      a: rand(.3, .5),
    });
  }

  function spawnEmber(e) {
    embers.push({
      x: e.x + (Math.random() - .5) * e.w,
      y: e.y - 10,
      vx: (Math.random() - .5) * 40,
      vy: -rand(90, 250),
      life: 0,
      max: rand(1.2, 3),
      r: rand(.8, 2.2),
      grav: -20,
      wob: Math.random() * 6,
    });
  }

  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    clock += dt;
    update(dt);
    draw();
    if (running) raf = requestAnimationFrame(loop);
  }

  function update(dt) {
    for (const e of emitters) {
      if (clock - e.t0 < e.delay) continue;
      e.level += (e.target - e.level) * Math.min(1, dt * (e.target > e.level ? 1.3 : .9));
      if (e.smokeOnly) {
        e.sacc += e.rate * dt;
        while (e.sacc >= 1) { spawnSmoke(e); e.sacc--; }
        continue;
      }
      const k = e.level * I;
      e.acc += e.rate * DENSITY * k * dt;
      while (e.acc >= 1) { spawnFlame(e); e.acc--; }
      e.sacc += e.rate * .09 * k * dt;
      while (e.sacc >= 1) { spawnSmoke(e); e.sacc--; }
      e.eacc += e.rate * .06 * k * dt;
      while (e.eacc >= 1) { spawnEmber(e); e.eacc--; }
    }

    for (const p of flames) {
      p.life += dt;
      p.vy -= 120 * dt;
      p.vx += Math.sin(clock * 7 + p.seed) * 34 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    flames = flames.filter(p => p.life < p.max);
    if (flames.length > 2600) flames.splice(0, flames.length - 2600);

    for (const s of smokes) {
      s.life += dt;
      s.vx += 6 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    smokes = smokes.filter(s => s.life < s.max);
    if (smokes.length > 260) smokes.splice(0, smokes.length - 260);

    for (const p of embers) {
      p.life += dt;
      p.vy += p.grav * dt;
      if (p.wob !== undefined) p.vx += Math.sin(clock * 4 + p.wob) * 40 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    embers = embers.filter(p => p.life < p.max);
  }

  function draw() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    g.globalCompositeOperation = 'source-over';
    for (const s of smokes) {
      const t = s.life / s.max;
      const size = lerp(s.s0, s.s1, t);
      g.globalAlpha = s.a * (t < .15 ? t / .15 : 1 - (t - .15) / .85);
      g.drawImage(spriteSmoke, s.x - size, s.y - size, size * 2, size * 2);
    }

    g.globalCompositeOperation = 'lighter';

    if (flames.length > 20) {
      let sx = 0, sy = 0, n = 0;
      for (let i = 0; i < flames.length; i += 7) { sx += flames[i].x; sy += flames[i].y; n++; }
      const cx = sx / n, cy = sy / n;
      const r = 260 + 320 * I;
      const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `rgba(255,120,40,${(.22 * Math.min(1, flames.length / 300) * (.85 + Math.random() * .15)).toFixed(3)})`);
      grd.addColorStop(1, 'rgba(255,80,20,0)');
      g.globalAlpha = 1;
      g.fillStyle = grd;
      g.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    for (const p of flames) {
      const t = p.life / p.max;
      const s = p.size * (1 - t * .8);
      g.globalAlpha = (t < .1 ? t / .1 : 1 - (t - .1) / .9) * .7;
      g.drawImage(spriteFire, p.x - s * .75, p.y - s * 1.35, s * 1.5, s * 2.7);
    }

    g.fillStyle = '#ffb35a';
    for (const p of embers) {
      g.globalAlpha = 1 - p.life / p.max;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }

    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  return { init, start, stop, reset, addEmitter, fadeEmitters, setIntensity, sparks };
})();
