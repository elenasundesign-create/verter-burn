// Мелкие помощники для анимаций
const $ = (s, root = document) => root.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);

const ease = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

// requestAnimationFrame-твин: fn(easedT, rawT)
function tween(dur, fn, easing = ease.inOut) {
  return new Promise(resolve => {
    const t0 = performance.now();
    function frame(now) {
      const raw = Math.min(1, (now - t0) / dur);
      fn(easing(raw), raw);
      if (raw < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

// Web Animations API c fill: forwards
function anim(el, keyframes, opts) {
  const o = Object.assign(
    { fill: 'forwards', easing: 'cubic-bezier(.65,0,.35,1)' },
    typeof opts === 'number' ? { duration: opts } : opts
  );
  return el.animate(keyframes, o).finished.catch(() => {});
}

// Отменить все JS-анимации (CSS-анимации не трогаем)
function cancelAnimations() {
  const hasCss = typeof CSSAnimation !== 'undefined';
  document.getAnimations().forEach(a => {
    if (hasCss && a instanceof CSSAnimation) return;
    a.cancel();
  });
}

// детерминированный генератор случайных чисел
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bez = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
