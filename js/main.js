// Сценарий: тумба → ящик → лист → сминание → компьютер → спичка → огонь → пепел
(() => {
  const stage = $('#stage');
  function fit() {
    const s = Math.min(innerWidth / 1440, innerHeight / 900);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener('resize', fit);
  fit();

  // ---------- сборка графики ----------
  $('#scene-cabinet').innerHTML = Art.cabinet();
  $('#scene-drawer').innerHTML = Art.drawerScene();
  $('#pc-podium').innerHTML = Art.podium();
  $('#pc-computer').innerHTML = Art.computer();
  $('#pc-ash').innerHTML = Art.ash();
  $('#pc-matches').innerHTML = Art.matches();
  $('#handL').innerHTML = `<img src="${Art.PAW.left.src}" alt="">`;
  $('#handR').innerHTML = `<img src="${Art.PAW.right.src}" alt="">`;
  Fire.init($('#fire'));

  const el = {
    cabinet: $('#scene-cabinet'),
    drawer: $('#scene-drawer'),
    dwBox: $('#dwBox'),
    topSheet: $('#dwTopSheet'),
    computer: $('#scene-computer'),
    pc: $('#pc-computer'),
    ash: $('#pc-ash'),
    matches: $('#pc-matches'),
    flash: $('#flash'),
    dim: $('#dim'),
    sheet: $('#sheet'),
    sheetInner: $('#sheet .sheet-inner'),
    creases: $('#sheet .creases'),
    ta: $('#message'),
    burn: $('#btn-burn'),
    handL: $('#handL'),
    handR: $('#handR'),
    ball: $('#ball'),
    final: $('#final'),
    again: $('#btn-again'),
    hint: $('#hint'),
    frame: $('#hud-frame'),
    fade: $('#fade'),
  };

  const show = e => e.classList.remove('hidden');
  const hide = e => e.classList.add('hidden');
  const setHint = t => { el.hint.textContent = t; };
  const setFrame = n => { el.frame.textContent = String(n).padStart(2, '0'); };

  let state = 'cabinet';
  let idleTimer = 0;

  function armIdle(ms) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => restart(), ms);
  }

  async function cutTo(fn) {
    await anim(el.fade, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-in' });
    fn();
    await anim(el.fade, [{ opacity: 1 }, { opacity: 0 }], { duration: 650, easing: 'ease-out' });
  }

  // ---------- сброс ----------
  const boxHand = $('#boxHand'), pinchHand = $('#pinchHand'), tray = $('#tray');
  const heldMatch = $('#heldMatch'), heldFlame = $('#heldFlame'), heldFlameRot = $('#heldFlameRot');
  const flyMatch = $('#flyMatch'), flyFlameRot = $('#flyFlameRot');
  const MATCH_I = 3;

  function setBox(p) { boxHand.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)})`); }
  function setPinch(p) {
    pinchHand.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.r)})`);
    heldFlameRot.setAttribute('transform', `rotate(${f(-p.r)})`);
  }
  function f(n) { return +n.toFixed(2); }

  function resetAll() {
    clearTimeout(idleTimer);
    cancelAnimations();
    Fire.stop();
    Fire.reset();
    Sound.stopAll();

    [el.drawer, el.computer, el.sheet, el.ball, el.final, el.matches, el.burn].forEach(hide);
    show(el.cabinet);
    el.burn.classList.add('off');
    el.ta.value = '';
    el.ta.readOnly = false;
    el.topSheet.style.visibility = '';
    el.pc.style.filter = '';
    $('#pc-podium').style.filter = '';

    $(`#trayMatch-${MATCH_I}`).style.visibility = '';
    heldMatch.style.visibility = 'hidden';
    heldFlame.setAttribute('opacity', '0');
    flyMatch.style.display = 'none';
    tray.setAttribute('transform', '');
    setBox({ x: -460, y: 460 });
    setPinch({ x: 1200, y: 1200, r: 0 });

    setFrame(1);
    setHint('нажми на тумбу');
    state = 'cabinet';
  }

  async function restart() {
    state = 'busy';
    await cutTo(resetAll);
  }

  // ---------- кадр 1 → 2: тумба открывается ----------
  el.cabinet.addEventListener('click', async () => {
    if (state !== 'cabinet') return;
    state = 'busy';
    Sound.init();
    Sound.click();
    setHint('');
    Sound.drawerNudge();
    await anim($('#cab-drawer-0'), [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(12px) scale(1.035)' }], { duration: 450 });
    await anim(el.cabinet, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.7)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)' });
    hide(el.cabinet);

    show(el.drawer);
    setFrame(2);
    anim(el.drawer, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, fill: 'none' });
    Sound.drawer();
    await anim(el.dwBox, [{ transform: 'translateY(-660px)' }, { transform: 'translateY(0)' }], { duration: 1500, easing: 'cubic-bezier(.25,.8,.25,1)' });
    setHint('возьми лист');
    state = 'drawer';
  });

  // ---------- кадр 2 → 3: берём лист ----------
  el.drawer.addEventListener('click', async () => {
    if (state !== 'drawer') return;
    state = 'busy';
    setHint('');
    Sound.paper();
    el.topSheet.style.visibility = 'hidden';
    show(el.sheet);

    const s = 380 / 460;
    anim(el.dim, [{ opacity: 0 }, { opacity: 1 }], 800);
    anim(el.drawer, [{ filter: 'blur(0px)' }, { filter: 'blur(4px)' }], 900);
    await anim(el.sheet, [
      { transform: `translate(40px, 120px) scale(${s}) rotate(0deg)`, boxShadow: '0 2px 4px rgba(0,0,0,.3)' },
      { transform: 'translate(14px, 46px) scale(.94) rotate(-2.5deg)', boxShadow: '0 30px 50px rgba(0,0,0,.55)', offset: .45 },
      { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', boxShadow: '0 40px 80px rgba(0,0,0,.7)' },
    ], { duration: 1150, easing: 'cubic-bezier(.3,.7,.2,1)' });
    anim(el.sheetInner, [{ opacity: 0 }, { opacity: 1 }], 500);

    setFrame(3);
    show(el.burn);
    state = 'writing';
    el.ta.focus();
    armIdle(180000);
  });

  el.ta.addEventListener('input', () => {
    if (state !== 'writing') return;
    Sound.key();
    el.burn.classList.toggle('off', !el.ta.value.trim());
    armIdle(180000);
  });

  // ---------- поджечь ----------
  el.burn.addEventListener('click', () => {
    const text = el.ta.value.trim();
    if (state !== 'writing' || !text) return;
    state = 'busy';
    clearTimeout(idleTimer);
    Store.add(text);
    el.ta.readOnly = true;
    el.ta.blur();
    el.burn.classList.add('off');
    Sound.click();
    run();
  });

  async function run() {
    await crumple();
    await toss();
    await cutTo(() => {
      hide(el.drawer);
      hide(el.sheet);
      hide(el.burn);
      el.dim.getAnimations().forEach(a => a.cancel());
      show(el.computer);
      setFrame(4);
    });
    Sound.crtOn();
    await anim($('#screenLit'), [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .3, offset: .35 }, { opacity: 1 }], { duration: 700, fill: 'none' });
    await wait(400);
    await flyBall();
    await wait(600);
    setFrame(5);
    Fire.start();
    await matchesSequence();
    await burn();
    finale();
  }

  // ---------- сминание ----------
  function crumplePolys() {
    const W = 460, H = 650, cx = 230, cy = 325, N = 48;
    const per = 2 * (W + H);
    const r = rng(Date.now() & 0xffff);
    const p0 = [];
    for (let i = 0; i < N; i++) {
      let d = i / N * per;
      let x, y;
      if (d < W) { x = d; y = 0; }
      else if ((d -= W) < H) { x = W; y = d; }
      else if ((d -= H) < W) { x = W - d; y = H; }
      else { d -= W; x = 0; y = H - d; }
      p0.push({ x, y });
    }
    const mid = p0.map(p => ({ x: lerp(p.x, cx, .48) + (r() - .5) * 60, y: lerp(p.y, cy, .55) + (r() - .5) * 60 }));
    const end = p0.map(p => {
      const a = Math.atan2(p.y - cy, p.x - cx);
      const k = 122 * (.85 + r() * .3);
      return { x: cx + Math.cos(a) * k, y: cy + Math.sin(a) * k * .94 };
    });
    const poly = ps => `polygon(${ps.map(p => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(',')})`;
    return [poly(p0), poly(mid), poly(end)];
  }

  function drawCreases() {
    let s = '';
    for (let i = 0; i < 26; i++) {
      const x = rand(0, 460), y = rand(0, 650), a = rand(0, Math.PI), l = rand(60, 260);
      const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
      s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#000" stroke-opacity="${rand(.08, .22).toFixed(2)}" stroke-width="${rand(.6, 1.6).toFixed(1)}"/>`;
      s += `<line x1="${(x + 1.5).toFixed(1)}" y1="${(y + 1.5).toFixed(1)}" x2="${(x2 + 1.5).toFixed(1)}" y2="${(y2 + 1.5).toFixed(1)}" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/>`;
    }
    el.creases.innerHTML = s;
  }

  // лапки в сцене сминания: dx, dy — сдвиг, r — наклон (у правой зеркально)
  const pawL = (dx, dy, r) => ({ transform: `translate(${dx}px, ${dy}px) rotate(${18 + r}deg)` });
  const pawR = (dx, dy, r) => ({ transform: `translate(${-dx}px, ${dy}px) rotate(${-18 - r}deg)` });
  const paws = (frames, opts) => Promise.all([
    anim(el.handL, frames.map(f => Object.assign(pawL(...f.p), f.offset !== undefined ? { offset: f.offset } : {})), opts),
    anim(el.handR, frames.map(f => Object.assign(pawR(...f.p), f.offset !== undefined ? { offset: f.offset } : {})), opts),
  ]);

  async function crumple() {
    drawCreases();
    const [c0, c1, c2] = crumplePolys();
    el.ball.innerHTML = Art.ball(Math.floor(Math.random() * 1000));

    await paws([{ p: [0, 700, -6] }, { p: [0, 0, 0] }], { duration: 750, easing: 'cubic-bezier(.2,.8,.3,1)' });
    await wait(150);

    Sound.crumple(1.9);
    const D = 1700;
    anim(el.creases, [{ opacity: 0 }, { opacity: 1 }], D * .6);
    anim(el.sheet, [
      { clipPath: c0, transform: 'translate(0px,0px) scale(1) rotate(0deg)', filter: 'brightness(1)' },
      { clipPath: c1, transform: 'translate(0px,6px) scale(1) rotate(-4deg)', filter: 'brightness(.93)', offset: .5 },
      { clipPath: c2, transform: 'translate(0px,0px) scale(1) rotate(3deg)', filter: 'brightness(.85)' },
    ], { duration: D, easing: 'cubic-bezier(.5,0,.4,1)' });
    await paws([{ p: [0, 0, 0] }, { p: [30, -20, 4], offset: .5 }, { p: [58, -40, 8] }], { duration: D, easing: 'cubic-bezier(.5,0,.4,1)' });

    show(el.ball);
    anim(el.ball, [{ opacity: 0, transform: 'scale(1) rotate(3deg)' }, { opacity: 1, transform: 'scale(1) rotate(3deg)' }], 160);
    await anim(el.sheet, [{ opacity: 1 }, { opacity: 0 }], 200);

    Sound.crumple(.9);
    await Promise.all([
      anim(el.ball, [
        { transform: 'scale(1) rotate(3deg)' }, { transform: 'scale(.9,.94) rotate(6deg)' },
        { transform: 'scale(.97) rotate(4deg)' }, { transform: 'scale(.86,.9) rotate(8deg)' },
        { transform: 'scale(.9) rotate(7deg)' },
      ], { duration: 900, easing: 'ease-in-out' }),
      paws([{ p: [58, -40, 8] }, { p: [72, -40, 10] }, { p: [60, -40, 8] }, { p: [76, -38, 11] }, { p: [68, -38, 9] }], { duration: 900, easing: 'ease-in-out' }),
    ]);

    await paws([{ p: [68, -38, 9] }, { p: [20, 700, -8] }], { duration: 650, easing: 'cubic-bezier(.5,0,.8,.4)' });
  }

  async function toss() {
    Sound.whoosh(.5);
    await anim(el.ball, [
      { transform: 'translate(0px,0px) scale(.9) rotate(7deg)' },
      { transform: 'translate(0px,-30px) scale(.95) rotate(-10deg)', offset: .3 },
      { transform: 'translate(-80px,640px) scale(1.3) rotate(-120deg)' },
    ], { duration: 650, easing: 'cubic-bezier(.4,0,.9,.5)' });
    hide(el.ball);
  }

  // ---------- комок летит в компьютер ----------
  async function flyBall() {
    const P0 = { x: 250, y: 1080 }, P1 = { x: 380, y: 40 }, P2 = { x: 720, y: 372 };
    const kf = [];
    const N = 30;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = bez(P0.x, P1.x, P2.x, t), y = bez(P0.y, P1.y, P2.y, t);
      const s = lerp(1.3, .1, Math.pow(t, 1.15));
      kf.push({ transform: `translate(${(x - 720).toFixed(1)}px, ${(y - 395).toFixed(1)}px) scale(${s.toFixed(3)}) rotate(${(t * 620).toFixed(0)}deg)` });
    }
    show(el.ball);
    Sound.whoosh(1.1);
    await anim(el.ball, kf, { duration: 1150, easing: 'linear' });
    hide(el.ball);
    Sound.impact();
    screenGlitch(700);
    shake(el.pc, 380, 6);
  }

  function screenGlitch(d) {
    anim($('#screenFlash'), [{ opacity: 0 }, { opacity: .9, offset: .08 }, { opacity: 0 }], { duration: Math.min(450, d), fill: 'none' });
    const kf = [];
    for (let i = 0; i < 14; i++) {
      kf.push({ transform: `translate(${rand(-16, 16).toFixed(1)}px, ${rand(-6, 6).toFixed(1)}px) skewX(${rand(-12, 12).toFixed(1)}deg)`, opacity: Math.random() > .3 ? 1 : .15 });
    }
    kf.push({ transform: 'translate(0px,0px) skewX(0deg)', opacity: 1 });
    return anim($('#screenUI'), kf, { duration: d, easing: 'linear', fill: 'none' });
  }

  function shake(target, d, amp) {
    const kf = [];
    for (let i = 0; i < 8; i++) kf.push({ transform: `translate(${rand(-amp, amp).toFixed(1)}px, ${rand(-amp / 2, amp / 2).toFixed(1)}px)` });
    kf.push({ transform: 'translate(0px,0px)' });
    return anim(target, kf, { duration: d, easing: 'linear', fill: 'none' });
  }

  // ---------- коробок и спичка ----------
  const HEAD = -140; // локальная позиция пламени у головки спички
  function headWorld(p) {
    const a = p.r * Math.PI / 180;
    return { x: p.x + Math.cos(a) * HEAD, y: p.y + Math.sin(a) * HEAD };
  }

  function tweenPose(from, to, dur, ez, set, each) {
    return tween(dur, t => {
      const p = { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), r: lerp(from.r || 0, to.r || 0, t) };
      set(p);
      if (each) each(p, t);
    }, ez);
  }

  async function matchesSequence() {
    show(el.matches);

    // рука с коробком
    Sound.box();
    await tweenPose({ x: -460, y: 460 }, { x: 0, y: 0 }, 850, ease.out, setBox);
    await wait(200);

    // коробок открывается
    Sound.tray();
    await tween(600, t => tray.setAttribute('transform', `translate(${f(130 * t)} 0)`), ease.inOut);
    await wait(150);

    // вторая рука берёт спичку
    const grab = { x: 614, y: 597 + MATCH_I * 8.4, r: 0 };
    await tweenPose({ x: 1150, y: 1150, r: -25 }, grab, 900, ease.out, setPinch);
    $(`#trayMatch-${MATCH_I}`).style.visibility = 'hidden';
    heldMatch.style.visibility = 'visible';
    await wait(120);

    Sound.pull();
    const pulled = { x: 800, y: 600, r: -6 };
    await tweenPose(grab, pulled, 650, ease.inOut, setPinch);

    // чиркаем о боковину
    const s0 = { x: 639, y: 681, r: 0 };
    await tweenPose(pulled, s0, 450, ease.inOut, setPinch);
    await wait(120);
    Sound.strike();
    let lit = false;
    const s1 = { x: 494, y: 684, r: -3 };
    await tweenPose(s0, s1, 240, ease.inOut, setPinch, (p, t) => {
      const h = headWorld(p);
      if (Math.random() < .7) Fire.sparks(h.x + 6, h.y, 3);
      if (!lit && t > .55) { lit = true; igniteMatch(h); }
    });
    await wait(450);

    // поднимаем горящую спичку, коробок уходит
    const up = { x: 830, y: 610, r: 60 };
    Sound.box();
    await Promise.all([
      tweenPose(s1, up, 850, ease.inOut, setPinch),
      tweenPose({ x: 0, y: 0 }, { x: -480, y: 480 }, 850, ease.in, setBox),
    ]);
    await wait(500);

    // замах и бросок
    const back = { x: 905, y: 700, r: 82 };
    await tweenPose(up, back, 380, ease.inOut, setPinch);
    const rel = { x: 770, y: 560, r: 20 };
    Sound.whoosh(.8);
    await tweenPose(back, rel, 150, ease.in, setPinch);

    const a = rel.r * Math.PI / 180;
    const head = { x: rel.x + Math.cos(a) * -134, y: rel.y + Math.sin(a) * -134 };
    heldMatch.style.visibility = 'hidden';
    heldFlame.setAttribute('opacity', '0');
    flyMatch.style.display = '';
    tweenPose(rel, { x: 1220, y: 1180, r: 0 }, 700, ease.inOut, setPinch);
    await flyMatchTo(head, rel.r, { x: 720, y: 385 });
    flyMatch.style.display = 'none';
    Sound.matchOut();
    hide(el.matches);
  }

  function igniteMatch(h) {
    Sound.ignite();
    Fire.sparks(h.x, h.y, 18);
    heldFlame.setAttribute('opacity', '1');
    anim(heldFlame, [{ transform: 'scale(0)' }, { transform: 'scale(1.9)', offset: .25 }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-out', fill: 'none' });
  }

  function flyMatchTo(from, r0, to) {
    const P1 = { x: (from.x + to.x) / 2 + 30, y: Math.min(from.y, to.y) - 230 };
    return tween(760, t => {
      const x = bez(from.x, P1.x, to.x, t), y = bez(from.y, P1.y, to.y, t);
      const r = r0 - 560 * t;
      const s = 1 - .45 * t;
      flyMatch.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})`);
      flyFlameRot.setAttribute('transform', `rotate(${f(-r)})`);
    }, ease.linear);
  }

  // ---------- горение ----------
  const EMITTERS = [
    { x: 720, y: 440, w: 210, rate: 70, scale: 1.15 },
    { x: 720, y: 300, w: 200, rate: 45, scale: 1 },
    { x: 640, y: 246, w: 120, rate: 40, scale: 1.1 },
    { x: 800, y: 246, w: 120, rate: 40, scale: 1.1 },
    { x: 578, y: 330, w: 16, rate: 14, scale: .8 },
    { x: 862, y: 330, w: 16, rate: 14, scale: .8 },
    { x: 578, y: 470, w: 16, rate: 14, scale: .8 },
    { x: 862, y: 470, w: 16, rate: 14, scale: .8 },
    { x: 720, y: 540, w: 280, rate: 40, scale: .9 },
    { x: 560, y: 568, w: 40, rate: 14, scale: .8 },
    { x: 880, y: 568, w: 40, rate: 14, scale: .8 },
    { x: 720, y: 640, w: 320, rate: 45, scale: .9 },
    { x: 695, y: 690, w: 340, rate: 35, scale: .75 },
    { x: 916, y: 696, w: 30, rate: 8, scale: .5 },
  ];

  function crtOff() {
    Sound.crtOff();
    anim($('#screenLit'), [
      { transform: 'scale(1,1)', opacity: 1 },
      { transform: 'scale(1,.012)', opacity: 1, offset: .55 },
      { transform: 'scale(0,.012)', opacity: 0 },
    ], { duration: 520, easing: 'ease-in' });
    anim($('#screenGlow'), [{ opacity: .14 }, { opacity: 0 }], 400);
  }

  function collapse() {
    Sound.collapse();
    anim(el.pc, [
      { transform: 'scale(1,1) skewX(0deg)', opacity: 1 },
      { transform: 'scale(1,.9) skewX(1.5deg)', opacity: 1, offset: .25 },
      { transform: 'scale(1.04,.45) skewX(-2deg)', opacity: .9, offset: .6 },
      { transform: 'scale(1.1,.06) skewX(0deg)', opacity: 0 },
    ], { duration: 2400, easing: 'cubic-bezier(.5,0,.8,.6)' });
    shake(el.computer, 600, 4);
    Fire.fadeEmitters();
    Fire.addEmitter({ x: 720, y: 676, w: 240, rate: 60, scale: .85, delay: .3 });
    Fire.addEmitter({ x: 650, y: 690, w: 80, rate: 20, scale: .6, delay: .5 });
    Fire.addEmitter({ x: 795, y: 690, w: 80, rate: 20, scale: .6, delay: .5 });
    anim(el.ash, [{ opacity: 0 }, { opacity: 1 }], { duration: 1800, delay: 900 });
    anim($('#scorch'), [{ opacity: 0 }, { opacity: .55 }], { duration: 2000 });
  }

  const podium = $('#pc-podium');

  async function burn() {
    Sound.igniteBig();
    anim(el.flash, [{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 0 }], { duration: 1100, fill: 'none' });
    shake(el.pc, 300, 3);
    screenGlitch(900);

    const ig = { x: 720, y: 385 };
    EMITTERS.forEach(e => Fire.addEmitter(Object.assign({}, e, { delay: Math.hypot(e.x - ig.x, e.y - ig.y) / 170 })));
    Fire.setIntensity(.3);
    Sound.fireStart();

    let off = false, collapsed = false;
    const T = 21;
    await tween(T * 1000, (t, raw) => {
      const ft = raw * T;
      const I = ft < 5 ? lerp(.3, 1, ft / 5)
        : ft < 10 ? 1
        : ft < 14 ? lerp(1, .4, (ft - 10) / 4)
        : ft < 19 ? lerp(.4, .06, (ft - 14) / 5)
        : lerp(.06, 0, (ft - 19) / 2);
      Fire.setIntensity(I);
      Sound.fireLevel(I);

      const c = clamp((ft - .8) / 8, 0, 1);
      el.pc.style.filter = `brightness(${lerp(1, .26, c).toFixed(3)}) sepia(${lerp(0, .6, c).toFixed(3)}) contrast(${lerp(1, 1.25, c).toFixed(3)})`;
      const dark = ft < 3 ? ft / 3 : ft < 15 ? 1 : lerp(1, .45, clamp((ft - 15) / 6, 0, 1));
      podium.style.filter = `brightness(${lerp(1, .5, dark).toFixed(3)}) sepia(${lerp(0, .35, dark).toFixed(3)})`;

      if (!off && ft > 1.8) { off = true; crtOff(); }
      if (!collapsed && ft >= 10) { collapsed = true; collapse(); }
    }, ease.linear);
  }

  function finale() {
    Sound.fireStop();
    Sound.chime();
    Fire.addEmitter({ x: 720, y: 652, w: 100, rate: 2.5, smokeOnly: true, scale: .7 });
    setFrame(6);
    show(el.final);
    anim(el.final, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1200, easing: 'ease-out' });
    state = 'final';
    armIdle(90000);
  }

  el.again.addEventListener('click', () => {
    if (state !== 'final') return;
    Sound.click();
    restart();
  });

  // ---------- клавиши и панель выгрузки ----------
  const admin = $('#admin');
  function resetClear() {
    const b = admin.querySelector('[data-act="clear"]');
    delete b.dataset.armed;
    b.textContent = 'очистить всё';
  }
  function updateAdmin() { $('#admin-count').textContent = Store.all().length; resetClear(); }

  addEventListener('keydown', e => {
    if (e.code === 'KeyE' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      admin.hidden = !admin.hidden;
      if (!admin.hidden) updateAdmin();
      return;
    }
    if (document.activeElement === el.ta) return;
    if (e.code === 'KeyF') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
    if (e.code === 'KeyM') Sound.toggleMute();
    if (e.code === 'Escape' && !admin.hidden) admin.hidden = true;
  });

  admin.addEventListener('click', e => {
    const act = e.target.dataset && e.target.dataset.act;
    if (act === 'txt') Store.exportTxt();
    if (act === 'json') Store.exportJson();
    if (act === 'clear') {
      const b = e.target;
      if (b.dataset.armed) { Store.clear(); updateAdmin(); resetClear(); }
      else { b.dataset.armed = '1'; b.textContent = 'точно удалить? нажми ещё раз'; }
    }
    if (act === 'close' || e.target === admin) admin.hidden = true;
  });

  resetAll();
})();
