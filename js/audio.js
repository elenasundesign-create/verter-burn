// Все звуки синтезируются Web Audio — без внешних файлов
const Sound = (() => {
  let ctx = null, master = null, white = null, brown = null;
  let muted = false;
  const loops = {};
  let crackleTimer = null;
  let fireLevel = 0;

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = muted ? 0 : .9;
      master.connect(comp);
      comp.connect(ctx.destination);
      white = makeBuf(false);
      brown = makeBuf(true);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function makeBuf(isBrown) {
    const len = ctx.sampleRate * 3;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (isBrown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return b;
  }

  const now = () => ctx.currentTime;

  function env(g, t, gain, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + .01));
  }

  function noise({ at = 0, dur = .2, type = 'bandpass', f = 1000, f2 = null, q = 1, gain = .3, attack = .005, buf = 'white', out = null } = {}) {
    if (!ctx) return;
    const t = now() + at;
    const src = ctx.createBufferSource();
    src.buffer = buf === 'brown' ? brown : white;
    src.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    fl.Q.value = q;
    const g = ctx.createGain();
    env(g, t, gain, attack, dur);
    src.connect(fl); fl.connect(g); g.connect(out || master);
    src.start(t, Math.random() * 2);
    src.stop(t + dur + .05);
  }

  function tone({ at = 0, dur = .2, type = 'sine', f = 440, f2 = null, gain = .2, attack = .005, out = null } = {}) {
    if (!ctx) return;
    const t = now() + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    env(g, t, gain, attack, dur);
    o.connect(g); g.connect(out || master);
    o.start(t);
    o.stop(t + dur + .05);
  }

  // ---------- петли ----------
  function startLoop(name, build) {
    if (!ctx) return null;
    stopLoop(name, .05);
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(master);
    const l = { g, nodes: [], extra: {} };
    build(l);
    loops[name] = l;
    return l;
  }

  function stopLoop(name, fade = .5) {
    const l = loops[name];
    if (!l || !ctx) return;
    delete loops[name];
    const t = now();
    l.g.gain.cancelScheduledValues(t);
    l.g.gain.setValueAtTime(l.g.gain.value, t);
    l.g.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => {
      l.nodes.forEach(n => { try { n.stop(); } catch (e) {} });
      try { l.g.disconnect(); } catch (e) {}
    }, fade * 1000 + 120);
  }

  function noiseSrc(l, buf) {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.start(0, Math.random() * 2);
    l.nodes.push(s);
    return s;
  }

  // ---------- звуки сцен ----------
  const api = {
    init,

    click() { tone({ f: 2400, f2: 1300, dur: .04, type: 'triangle', gain: .05 }); },

    key() {
      noise({ type: 'bandpass', f: rand(1600, 3400), q: 2, dur: .035, gain: .05 });
      tone({ f: rand(110, 160), dur: .03, gain: .025 });
    },

    drawerNudge() {
      noise({ type: 'bandpass', f: 400, f2: 600, q: 1.5, dur: .35, attack: .05, gain: .12, buf: 'brown' });
      tone({ at: .3, f: 180, f2: 90, dur: .12, gain: .12 });
    },

    drawer() {
      noise({ type: 'bandpass', f: 240, f2: 520, q: 1.1, dur: 1.35, attack: .15, gain: .3, buf: 'brown' });
      for (let i = 0; i < 16; i++) {
        noise({ at: .05 + i * .075 + Math.random() * .03, type: 'bandpass', f: rand(800, 1600), q: 4, dur: .035, gain: .045 });
      }
      tone({ at: 1.3, f: 120, f2: 45, dur: .35, gain: .5 });
      noise({ at: 1.3, type: 'lowpass', f: 800, dur: .12, gain: .25 });
    },

    paper() {
      noise({ type: 'highpass', f: 1600, f2: 5000, q: .7, dur: .55, attack: .1, gain: .16 });
      noise({ at: .12, type: 'bandpass', f: 3200, q: 1, dur: .3, gain: .07 });
    },

    crumple(d = 1.8) {
      const n = Math.floor(d * 48);
      for (let i = 0; i < n; i++) {
        noise({ at: Math.random() * d, type: 'bandpass', f: rand(1200, 6500), q: rand(.6, 3), dur: rand(.012, .08), gain: rand(.05, .28) });
      }
      for (let t = 0; t < d; t += rand(.18, .35)) {
        noise({ at: t, type: 'lowpass', f: 900, dur: .09, gain: .14 });
      }
    },

    whoosh(d = 1) {
      noise({ type: 'bandpass', f: 280, f2: 1900, q: 1.3, dur: d, attack: d * .65, gain: .32 });
    },

    impact() {
      tone({ f: 150, f2: 40, dur: .4, gain: .6 });
      noise({ type: 'lowpass', f: 1600, f2: 250, dur: .2, gain: .35 });
      noise({ type: 'highpass', f: 4500, dur: .06, gain: .12 });
      api.glitch(.55, .05);
    },

    glitch(d = .6, at = 0) {
      let t = at;
      while (t < at + d) {
        const l = rand(.02, .06);
        tone({ at: t, type: 'square', f: rand(180, 2200), dur: l, gain: .045 });
        t += l + Math.random() * .02;
      }
    },

    crtOn() {
      noise({ type: 'highpass', f: 2500, dur: .25, gain: .08 });
      tone({ f: 60, dur: .35, gain: .14 });
      tone({ at: .05, f: 15600, dur: .5, gain: .012 });
      startLoop('hum', l => {
        [[60, .5], [120, .25], [15700, .05]].forEach(([f, v]) => {
          const o = ctx.createOscillator(); o.frequency.value = f;
          const g = ctx.createGain(); g.gain.value = v;
          o.connect(g); g.connect(l.g); o.start(); l.nodes.push(o);
        });
        l.g.gain.linearRampToValueAtTime(.05, now() + .6);
      });
    },

    crtOff() {
      tone({ f: 1100, f2: 50, dur: .45, type: 'sawtooth', gain: .05 });
      noise({ type: 'highpass', f: 2000, dur: .15, gain: .1 });
      stopLoop('hum', .3);
    },

    box() {
      noise({ type: 'lowpass', f: 700, dur: .14, gain: .18 });
      noise({ at: .04, type: 'bandpass', f: 1500, q: 2, dur: .08, gain: .07 });
    },

    tray() {
      noise({ type: 'bandpass', f: 1500, f2: 950, q: 3, dur: .55, attack: .08, gain: .13 });
      tone({ at: .55, f: 320, f2: 200, dur: .06, gain: .07 });
    },

    pull() { noise({ type: 'bandpass', f: 2600, q: 2, dur: .4, attack: .06, gain: .07 }); },

    strike() {
      noise({ type: 'highpass', f: 2600, f2: 1200, q: .8, dur: .24, attack: .01, gain: .5 });
      for (let i = 0; i < 14; i++) {
        noise({ at: Math.random() * .26, type: 'bandpass', f: rand(2500, 7000), q: 6, dur: .012, gain: .28 });
      }
    },

    ignite() {
      noise({ type: 'lowpass', f: 300, f2: 1400, q: .7, dur: .7, attack: .05, gain: .32 });
      startLoop('match', l => {
        const s = noiseSrc(l, white);
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 650;
        s.connect(f); f.connect(l.g);
        l.g.gain.linearRampToValueAtTime(.05, now() + .4);
      });
    },

    matchOut() { stopLoop('match', .3); },

    igniteBig() {
      tone({ f: 75, f2: 32, dur: 1.3, gain: .6 });
      noise({ type: 'lowpass', f: 200, f2: 2600, dur: 1.5, attack: .15, gain: .55 });
    },

    fireStart() {
      const l = startLoop('fire', l => {
        const rumbleS = noiseSrc(l, brown);
        const rumbleF = ctx.createBiquadFilter(); rumbleF.type = 'lowpass'; rumbleF.frequency.value = 420;
        const rumbleG = ctx.createGain(); rumbleG.gain.value = 0;
        rumbleS.connect(rumbleF); rumbleF.connect(rumbleG); rumbleG.connect(l.g);

        const roarS = noiseSrc(l, white);
        const roarF = ctx.createBiquadFilter(); roarF.type = 'bandpass'; roarF.frequency.value = 650; roarF.Q.value = .6;
        const roarG = ctx.createGain(); roarG.gain.value = 0;
        roarS.connect(roarF); roarF.connect(roarG); roarG.connect(l.g);

        const hissS = noiseSrc(l, white);
        const hissF = ctx.createBiquadFilter(); hissF.type = 'highpass'; hissF.frequency.value = 4200;
        const hissG = ctx.createGain(); hissG.gain.value = 0;
        hissS.connect(hissF); hissF.connect(hissG); hissG.connect(l.g);

        l.extra = { rumbleG, roarG, hissG };
        l.g.gain.value = 1;
      });
      if (!l) return;
      clearInterval(crackleTimer);
      crackleTimer = setInterval(() => {
        if (!ctx) return;
        const v = fireLevel;
        let k = Math.random() * v * 4;
        while (k-- > 0.6) {
          noise({ at: Math.random() * .05, type: 'bandpass', f: rand(1400, 6500), q: rand(3, 10), dur: rand(.004, .03), gain: rand(.05, .32) * v });
        }
        if (Math.random() < v * .08) noise({ type: 'lowpass', f: 650, dur: .06, gain: .32 * v });
      }, 50);
    },

    fireLevel(v) {
      fireLevel = v;
      const l = loops.fire;
      if (!l || !l.extra.rumbleG) return;
      const t = now();
      l.extra.rumbleG.gain.setTargetAtTime(v * .55, t, .2);
      l.extra.roarG.gain.setTargetAtTime(v * .16, t, .2);
      l.extra.hissG.gain.setTargetAtTime(v * .035, t, .2);
    },

    fireStop() {
      clearInterval(crackleTimer);
      fireLevel = 0;
      stopLoop('fire', 2.5);
    },

    collapse() {
      tone({ f: 62, f2: 28, dur: 1.6, gain: .5 });
      noise({ type: 'lowpass', f: 520, f2: 140, dur: 1.9, attack: .1, gain: .45 });
      for (let i = 0; i < 34; i++) {
        noise({ at: Math.random() * 1.6, type: 'bandpass', f: rand(600, 4000), q: rand(2, 6), dur: rand(.01, .06), gain: rand(.08, .3) });
      }
    },

    chime() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ at: i * .2, f, dur: 2.8, gain: .055, attack: .02 }));
    },

    stopAll() {
      clearInterval(crackleTimer);
      fireLevel = 0;
      Object.keys(loops).forEach(k => stopLoop(k, .15));
    },

    toggleMute() {
      muted = !muted;
      if (master) master.gain.setTargetAtTime(muted ? 0 : .9, now(), .05);
      return muted;
    },
  };

  return api;
})();
