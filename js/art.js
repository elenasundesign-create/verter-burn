// Вся графика сайта — SVG-строки. Координаты сцены: 1440×900.
const Art = (() => {
  const VB = 'viewBox="0 0 1440 900"';
  const f1 = n => +n.toFixed(1);

  // ---------- пиксельный шрифт 5×7 ----------
  const FONT = {
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  };

  function pixelText(str, x, y, s, fill) {
    let out = '', cx = x;
    for (const ch of str) {
      const g = FONT[ch];
      if (g) g.forEach((row, ry) => [...row].forEach((c, rx) => {
        if (c === '1') out += `<rect x="${f1(cx + rx * s)}" y="${f1(y + ry * s)}" width="${s + .3}" height="${s + .3}"/>`;
      }));
      cx += 6 * s;
    }
    return `<g fill="${fill}" shape-rendering="crispEdges">${out}</g>`;
  }
  const pixelWidth = (str, s) => str.length * 6 * s - s;

  // ---------- кадр 1: тумба спереди ----------
  function cabinet() {
    const h = (440 - 40) / 3;
    let drawers = '';
    for (let i = 0; i < 3; i++) {
      const y = 310 + i * (h + 10);
      drawers += `
      <g class="cab-drawer" id="cab-drawer-${i}">
        <rect x="572" y="${f1(y)}" width="296" height="${f1(h)}" rx="4" fill="url(#cbDrawer)" stroke="#6a92a5" stroke-width="1.5"/>
        <rect x="575" y="${f1(y + 2)}" width="290" height="2" fill="#d6ebf3" opacity=".75"/>
        <rect x="575" y="${f1(y + h - 4)}" width="290" height="2" fill="#5f8699" opacity=".5"/>
        <rect x="664" y="${f1(y + 40)}" width="120" height="13" rx="6.5" fill="#000" opacity=".25" filter="url(#fBlur3)"/>
        <rect x="665" y="${f1(y + 21)}" width="9" height="16" rx="2" fill="url(#cbMetal)"/>
        <rect x="766" y="${f1(y + 21)}" width="9" height="16" rx="2" fill="url(#cbMetal)"/>
        <rect x="660" y="${f1(y + 29)}" width="120" height="13" rx="6.5" fill="url(#cbMetal)" stroke="#7b8287" stroke-width="1"/>
        <rect x="704" y="${f1(y + h - 36)}" width="32" height="17" rx="2" fill="#a4c9da" stroke="#7299ab" stroke-width="1.4"/>
      </g>`;
    }
    return `
<svg ${VB}>
  <defs>
    <radialGradient id="cbSpot" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#2a363c"/>
      <stop offset=".55" stop-color="#11181b"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cbFloor" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#1e272b"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cbFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#acd0e0"/><stop offset="1" stop-color="#86aec1"/>
    </linearGradient>
    <linearGradient id="cbTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bcd8e4"/><stop offset="1" stop-color="#d6ebf3"/>
    </linearGradient>
    <linearGradient id="cbSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6f97aa"/><stop offset="1" stop-color="#4f7385"/>
    </linearGradient>
    <linearGradient id="cbDrawer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#abcfdf"/><stop offset="1" stop-color="#92b9cb"/>
    </linearGradient>
    <linearGradient id="cbMetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f5f7f8"/><stop offset=".5" stop-color="#a6adb2"/><stop offset="1" stop-color="#d8dcdf"/>
    </linearGradient>
  </defs>
  <ellipse cx="720" cy="440" rx="600" ry="440" fill="url(#cbSpot)"/>
  <ellipse cx="720" cy="772" rx="470" ry="86" fill="url(#cbFloor)"/>
  <ellipse cx="742" cy="762" rx="230" ry="20" fill="#000" opacity=".85" filter="url(#fBlur16)"/>
  <g id="cabinet">
    <polygon points="560,300 880,300 912,284 592,284" fill="url(#cbTop)"/>
    <polygon points="880,300 912,284 912,724 880,740" fill="url(#cbSide)"/>
    <rect x="560" y="300" width="320" height="440" fill="url(#cbFront)"/>
    <rect x="560" y="300" width="320" height="2" fill="#e3f1f7" opacity=".8"/>
    ${drawers}
    <rect x="574" y="740" width="26" height="14" rx="2" fill="#26292b"/>
    <rect x="842" y="740" width="26" height="14" rx="2" fill="#26292b"/>
  </g>
</svg>`;
  }

  // ---------- кадр 2: ящик, вид сверху ----------
  function drawerScene() {
    let stack = '';
    for (let k = 5; k >= 1; k--) {
      const c = 232 - k * 5;
      stack += `<rect x="${530 + k * 1.6}" y="${190 + k * 2.6}" width="380" height="537" fill="rgb(${c},${c - 2},${c - 7})" stroke="#b8b4ab" stroke-width=".8"/>`;
    }
    return `
<svg ${VB}>
  <defs>
    <radialGradient id="dwFloorGlow" cx=".5" cy=".55" r=".55">
      <stop offset="0" stop-color="#1c2428"/><stop offset="1" stop-color="#000"/>
    </radialGradient>
  </defs>
  <rect width="1440" height="900" fill="url(#dwFloorGlow)"/>
</svg>
<svg id="dwBox" ${VB}>
  <defs>
    <linearGradient id="dwInner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#456e82"/><stop offset="1" stop-color="#6d9aaf"/>
    </linearGradient>
    <linearGradient id="dwFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c7e1ec"/><stop offset="1" stop-color="#97bdcf"/>
    </linearGradient>
    <linearGradient id="dwPaper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6f4ef"/><stop offset="1" stop-color="#e6e3db"/>
    </linearGradient>
    <filter id="dwNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" result="n"/>
      <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .1 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect x="384" y="-60" width="672" height="850" fill="#88b1c4"/>
  <rect x="420" y="-60" width="600" height="822" fill="url(#dwInner)"/>
  <polygon points="420,-60 448,-60 448,740 420,762" fill="#a5cadb"/>
  <polygon points="1020,-60 992,-60 992,740 1020,762" fill="#5a8497"/>
  <polygon points="420,762 448,740 992,740 1020,762" fill="#7ca6ba"/>
  ${stack}
  <g id="dwTopSheet">
    <rect x="530" y="190" width="380" height="537" fill="url(#dwPaper)" stroke="#c9c5bc" stroke-width=".8"/>
    <rect x="530" y="190" width="380" height="537" fill="#fff" filter="url(#dwNoise)"/>
  </g>
  <rect x="372" y="760" width="696" height="58" rx="10" fill="url(#dwFront)"/>
  <rect x="380" y="761" width="680" height="2" fill="#e6f3f8" opacity=".9"/>
  <path d="M656 826 L656 854 Q656 866 668 866 L784 866 Q796 866 796 854 L796 826" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="12" filter="url(#fBlur3)"/>
  <path d="M650 816 L650 848 Q650 860 662 860 L778 860 Q790 860 790 848 L790 816" fill="none" stroke="#c9cfd2" stroke-width="12" stroke-linecap="round"/>
  <path d="M650 816 L650 848 Q650 860 662 860 L778 860 Q790 860 790 848 L790 816" fill="none" stroke="#f3f5f6" stroke-width="3" stroke-linecap="round" transform="translate(-2 -3)" opacity=".8"/>
</svg>
<svg ${VB} style="pointer-events:none">
  <defs>
    <linearGradient id="tbTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a9cddd"/><stop offset="1" stop-color="#c3e0ec"/>
    </linearGradient>
    <linearGradient id="tbShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="tbVig" cx=".5" cy=".5" r=".75">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/>
    </radialGradient>
  </defs>
  <rect x="420" y="168" width="600" height="160" fill="url(#tbShade)"/>
  <rect x="356" y="-80" width="728" height="232" rx="22" fill="url(#tbTop)"/>
  <rect x="356" y="146" width="728" height="22" rx="6" fill="#7aa3b6"/>
  <rect x="362" y="146" width="716" height="2" fill="#dff0f7" opacity=".7"/>
  <rect width="1440" height="900" fill="url(#tbVig)"/>
</svg>`;
  }

  // ---------- лапки котика (готовые картинки из референса) ----------
  // tip — кончики пальчиков в пикселях картинки; ниже лапка продлена «рукой» за край кадра
  const PAW = {
    left: { src: 'assets/paw-left.png', tip: [165, 22] },
    right: { src: 'assets/paw-right.png', tip: [172, 22] },
    w: 337, h: 916,
  };
  // лапка в SVG: кончики пальчиков в (x, y), deg — поворот (0 — смотрит вверх), k — масштаб
  function pawImage(side, x, y, deg, k) {
    const { src, tip } = PAW[side];
    return `<image href="${src}" width="${PAW.w}" height="${PAW.h}" transform="translate(${x} ${y}) rotate(${deg}) scale(${k}) translate(${-tip[0]} ${-tip[1]})"/>`;
  }

  // ---------- смятый комок бумаги ----------
  function ball(seed = 11) {
    const r = rng(seed);
    const R = 122;
    const TAU = Math.PI * 2;
    const rings = [[0, 1], [.36, 7], [.68, 13], [1, 22]];
    const pts = rings.map(([fr, n], ri) => {
      const off = r() * TAU;
      const arr = [];
      for (let i = 0; i < n; i++) {
        let a = off + i / n * TAU + (r() - .5) * (TAU / n) * .5;
        a = ((a % TAU) + TAU) % TAU;
        const rr = R * fr * (ri === 3 ? .84 + r() * .3 : .85 + r() * .3);
        arr.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr * .94, a });
      }
      arr.sort((p, q) => p.a - q.a);
      return arr;
    });

    const tris = [];
    const c = pts[0][0];
    pts[1].forEach((p, i) => tris.push([c, p, pts[1][(i + 1) % pts[1].length]]));
    for (let k = 1; k < 3; k++) {
      const A = pts[k], B = pts[k + 1], n = A.length, m = B.length;
      let i = 0, j = 0;
      while (i < n || j < m) {
        const an = i < n ? A[(i + 1) % n].a + (i + 1 >= n ? TAU : 0) : Infinity;
        const bn = j < m ? B[(j + 1) % m].a + (j + 1 >= m ? TAU : 0) : Infinity;
        if (an < bn) { tris.push([A[i % n], B[j % m], A[(i + 1) % n]]); i++; }
        else { tris.push([A[i % n], B[j % m], B[(j + 1) % m]]); j++; }
      }
    }

    const L = (() => { const v = [-.45, -.62, .64]; const l = Math.hypot(...v); return v.map(x => x / l); })();
    const shade = (cx, cy, jitter = .9) => {
      const d = Math.min(.97, Math.hypot(cx, cy) / R);
      let n = [cx / R + (r() - .5) * jitter, cy / R + (r() - .5) * jitter, Math.sqrt(1 - d * d)];
      const l = Math.hypot(...n); n = n.map(x => x / l);
      const b = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
      const v = clamp(Math.round(112 + 132 * b + (r() - .5) * 16), 70, 248);
      return `rgb(${v},${v - 3},${v - 10})`;
    };

    let out = `<polygon points="${pts[3].map(p => `${f1(p.x)},${f1(p.y)}`).join(' ')}" fill="#8f8b83"/>`;
    tris.forEach(t => {
      const cx = (t[0].x + t[1].x + t[2].x) / 3, cy = (t[0].y + t[1].y + t[2].y) / 3;
      const col = shade(cx, cy);
      out += `<polygon points="${t.map(p => `${f1(p.x)},${f1(p.y)}`).join(' ')}" fill="${col}" stroke="${col}" stroke-width="1" stroke-linejoin="round"/>`;
      if (r() < .4) out += `<line x1="${f1(t[0].x)}" y1="${f1(t[0].y)}" x2="${f1(t[1].x)}" y2="${f1(t[1].y)}" stroke="#000" stroke-opacity=".16" stroke-width="1"/>`;
    });
    // торчащие края листа
    for (let k = 0; k < 7; k++) {
      const p = pts[3][Math.floor(r() * pts[3].length)];
      const a = p.a + (r() - .5) * .5;
      const o = { x: p.x + Math.cos(a) * rand(6, 18), y: p.y + Math.sin(a) * rand(6, 18) };
      const i1 = { x: p.x * .78 + (r() - .5) * 20, y: p.y * .78 + (r() - .5) * 20 };
      const i2 = { x: p.x * .9 + (r() - .5) * 30, y: p.y * .9 + (r() - .5) * 30 };
      const col = shade(o.x * .9, o.y * .9, 1.4);
      out += `<polygon points="${[o, i1, i2].map(q => `${f1(q.x)},${f1(q.y)}`).join(' ')}" fill="${col}" stroke="#000" stroke-opacity=".12" stroke-width=".8"/>`;
    }
    return `<svg viewBox="-150 -150 300 300">${out}</svg>`;
  }

  // ---------- подиум ----------
  function podium() {
    let ribs = '';
    for (let d = -84; d <= 84; d += 6) {
      const a = d * Math.PI / 180;
      const x = 720 + 400 * Math.sin(a), y = 700 + 62 * Math.cos(a);
      ribs += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="920" stroke="#0b2230" stroke-opacity="${f1(.12 + .1 * Math.abs(Math.sin(a)))}" stroke-width="1.6"/>`;
    }
    return `
<svg ${VB}>
  <defs>
    <radialGradient id="pdBack" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#1f2b33"/><stop offset=".6" stop-color="#0c1216"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="pdBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#1c3542"/><stop offset=".12" stop-color="#4a7689"/>
      <stop offset=".36" stop-color="#88b2c6"/><stop offset=".5" stop-color="#9ec5d7"/>
      <stop offset=".68" stop-color="#7ca6ba"/><stop offset=".88" stop-color="#436c7f"/>
      <stop offset="1" stop-color="#19303c"/>
    </linearGradient>
    <linearGradient id="pdFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".5"/>
      <stop offset="1" stop-color="#000" stop-opacity=".92"/>
    </linearGradient>
    <radialGradient id="pdTop" cx=".5" cy=".42" r=".62">
      <stop offset="0" stop-color="#c4e0ec"/><stop offset=".7" stop-color="#9dc4d6"/><stop offset="1" stop-color="#7ea8bb"/>
    </radialGradient>
  </defs>
  <ellipse cx="720" cy="420" rx="640" ry="440" fill="url(#pdBack)"/>
  <rect x="320" y="700" width="800" height="220" fill="url(#pdBody)"/>
  ${ribs}
  <rect x="320" y="700" width="800" height="220" fill="url(#pdFade)"/>
  <ellipse cx="720" cy="700" rx="400" ry="62" fill="url(#pdTop)"/>
  <ellipse cx="720" cy="700" rx="400" ry="62" fill="none" stroke="#e1f1f7" stroke-opacity=".55" stroke-width="1.5"/>
  <ellipse id="scorch" cx="720" cy="698" rx="200" ry="28" fill="#0a0d0f" opacity="0" filter="url(#fBlur16)"/>
  <ellipse id="screenGlow" cx="720" cy="690" rx="230" ry="34" fill="#5f86ff" opacity=".14" filter="url(#fBlur16)"/>
</svg>`;
  }

  // ---------- компьютер ----------
  function computer() {
    let caseVents = '';
    for (let x = 566; x <= 676; x += 7) caseVents += `<rect x="${x}" y="592" width="3" height="62" rx="1.5" fill="#a69c86"/>`;
    let monVents = '';
    for (let x = 592; x <= 674; x += 6) monVents += `<rect x="${x}" y="500" width="2.6" height="36" rx="1.3" fill="#aba18b"/>`;
    let keys = '';
    for (let row = 0; row < 4; row++) {
      const y = 683 + row * 6.2;
      const x0 = 527 - row * 3.4, x1 = 863 + row * 3.4;
      const n = 28;
      const w = (x1 - x0) / n;
      for (let i = 0; i < n; i++) {
        keys += `<rect x="${f1(x0 + i * w + .8)}" y="${f1(y)}" width="${f1(w - 1.6)}" height="4.6" rx="1" fill="#f1ebde" stroke="#b6ac95" stroke-width=".6"/>`;
      }
    }
    const vw = pixelWidth('VERTER', 5);
    const ui = `
      <g fill="#fff">
        <rect x="614" y="284" width="14" height="3" opacity=".85"/>
        <rect x="634" y="284" width="11" height="3" opacity=".85"/>
        <rect x="651" y="284" width="16" height="3" opacity=".85"/>
        <rect x="673" y="284" width="10" height="3" opacity=".85"/>
        <rect x="778" y="281" width="48" height="8" opacity=".92"/>
        <rect x="614" y="300" width="62" height="2" opacity=".6"/>
        <rect x="614" y="307" width="118" height="2" opacity=".6"/>
        <rect x="614" y="314" width="92" height="2" opacity=".6"/>
        <rect x="614" y="326" width="146" height="2" opacity=".55"/>
        <rect x="614" y="333" width="74" height="2" opacity=".55"/>
        <rect x="614" y="343" width="30" height="7" opacity=".9"/>
      </g>
      ${pixelText('VERTER', 720 - vw / 2, 382, 5, '#fff')}
      <rect class="blink" x="${720 - vw / 2}" y="432" width="11" height="5" fill="#fff"/>`;
    return `
<svg ${VB}>
  <defs>
    <linearGradient id="cpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6dfce"/><stop offset="1" stop-color="#c8bfa8"/>
    </linearGradient>
    <linearGradient id="cpTopF" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9d1be"/><stop offset="1" stop-color="#efe9db"/>
    </linearGradient>
    <linearGradient id="cpRecess" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a59b85"/><stop offset="1" stop-color="#c6bda7"/>
    </linearGradient>
    <radialGradient id="cpScreen" cx=".5" cy=".46" r=".62">
      <stop offset="0" stop-color="#4c7bff"/><stop offset=".7" stop-color="#2a50d6"/><stop offset="1" stop-color="#18318f"/>
    </radialGradient>
    <clipPath id="cpScreenClip"><rect x="602" y="274" width="236" height="196" rx="22"/></clipPath>
    <pattern id="cpScan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".2"/></pattern>
  </defs>
  <ellipse cx="726" cy="678" rx="215" ry="18" fill="#05121a" opacity=".6" filter="url(#fBlur8)"/>

  <!-- системный блок -->
  <polygon points="545,575 895,575 880,558 560,558" fill="url(#cpTopF)"/>
  <rect x="545" y="575" width="350" height="97" rx="4" fill="url(#cpFront)"/>
  <rect x="547" y="575" width="346" height="2" fill="#f6f2e8"/>
  ${caseVents}
  <rect x="712" y="590" width="160" height="24" rx="2" fill="#d6ceba" stroke="#aaa08a"/>
  <rect x="728" y="600" width="100" height="4" rx="2" fill="#2a2723"/>
  <rect x="846" y="598" width="16" height="8" rx="1" fill="#bdb39c"/>
  <rect x="712" y="624" width="160" height="24" rx="2" fill="#d6ceba" stroke="#aaa08a"/>
  <rect x="728" y="634" width="100" height="4" rx="2" fill="#2a2723"/>
  <rect x="846" y="632" width="16" height="8" rx="1" fill="#bdb39c"/>
  <circle cx="866" cy="661" r="2.4" fill="#59e07a"/>
  <rect x="560" y="660" width="40" height="3" fill="#b0a68e"/>
  <rect x="545" y="668" width="350" height="4" fill="#a2987f"/>

  <!-- монитор -->
  <rect x="670" y="548" width="100" height="12" fill="#bab099"/>
  <polygon points="584,232 856,232 870,245 570,245" fill="url(#cpTopF)"/>
  <rect x="570" y="245" width="300" height="308" rx="10" fill="url(#cpFront)"/>
  <rect x="573" y="246" width="294" height="2" fill="#f6f2e8"/>
  <rect x="588" y="262" width="264" height="222" rx="18" fill="url(#cpRecess)"/>
  <rect x="588" y="262" width="264" height="222" rx="18" fill="none" stroke="#8e846f" stroke-width="2" opacity=".6"/>
  <rect x="602" y="274" width="236" height="196" rx="22" fill="#0b0f16"/>
  <g clip-path="url(#cpScreenClip)">
    <g id="screenLit">
      <rect x="602" y="274" width="236" height="196" fill="url(#cpScreen)"/>
      <g id="screenUI">${ui}</g>
      <rect x="602" y="274" width="236" height="196" fill="url(#cpScan)"/>
      <rect id="screenFlash" x="602" y="274" width="236" height="196" fill="#fff" opacity="0"/>
    </g>
  </g>
  <path d="M614 292 Q640 282 700 281 L692 297 Q646 300 618 314 Z" fill="#fff" opacity=".07"/>
  ${monVents}
  <rect x="696" y="504" width="48" height="16" rx="2" fill="#9b917b"/>
  <rect x="703" y="510" width="34" height="3" fill="#dbd3c1"/>
  <circle cx="780" cy="514" r="6" fill="#b9af98" stroke="#958b75"/>
  <circle cx="800" cy="514" r="6" fill="#b9af98" stroke="#958b75"/>
  <circle cx="820" cy="514" r="6" fill="#b9af98" stroke="#958b75"/>
  <rect x="836" y="504" width="20" height="22" rx="3" fill="#d0c7b2" stroke="#a1977f"/>

  <!-- клавиатура и мышь -->
  <polygon points="522,680 868,680 882,708 508,708" fill="url(#cpTopF)"/>
  ${keys}
  <rect x="508" y="708" width="374" height="8" rx="2" fill="#bcb29b"/>
  <path d="M893 640 C935 650 936 690 914 692" stroke="#cdc4af" stroke-width="2" fill="none"/>
  <ellipse cx="916" cy="701" rx="22" ry="11" fill="url(#cpFront)" stroke="#aaa08a"/>
  <line x1="916" y1="690" x2="916" y2="698" stroke="#aaa08a"/>
</svg>`;
  }

  // ---------- пепел ----------
  function ash() {
    const r = rng(5);
    let specks = '', embers = '', chunks = '';
    for (let i = 0; i < 70; i++) {
      const x = 600 + r() * 240, y = 660 + r() * 40;
      const top = 702 - 58 * Math.exp(-Math.pow((x - 720) / 85, 2));
      if (y < top + 4) continue;
      const v = Math.round(70 + r() * 70);
      specks += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6 + r() * 1.6)}" fill="rgb(${v},${v - 4},${v - 8})" opacity=".8"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const x = 630 + r() * 180;
      const y = 702 - 52 * Math.exp(-Math.pow((x - 720) / 85, 2)) + 6 + r() * 12;
      chunks += `<polygon points="${f1(x)},${f1(y)} ${f1(x + 4 + r() * 5)},${f1(y - 2 - r() * 4)} ${f1(x + 8 + r() * 5)},${f1(y + 1)}" fill="#1b1918" opacity=".85"/>`;
    }
    for (let i = 0; i < 16; i++) {
      const x = 625 + r() * 190;
      const y = 702 - 50 * Math.exp(-Math.pow((x - 720) / 85, 2)) + 8 + r() * 16;
      const s = 1.5 + r() * 2.8;
      embers += `<circle class="ember" cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="#ff7a2a" style="animation-delay:-${f1(r() * 2)}s;animation-duration:${f1(1 + r() * 1.6)}s"/>`;
    }
    return `
<svg ${VB}>
  <defs>
    <radialGradient id="ashG" cx=".5" cy=".2" r=".8">
      <stop offset="0" stop-color="#77716b"/><stop offset=".55" stop-color="#3d3936"/><stop offset="1" stop-color="#1a1817"/>
    </radialGradient>
    <filter id="ashGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4"/></filter>
  </defs>
  <ellipse cx="720" cy="702" rx="210" ry="22" fill="#000" opacity=".55" filter="url(#fBlur8)"/>
  <path d="M552 704 C590 696 612 676 646 666 C672 652 700 640 728 644 C760 648 786 664 812 676 C840 688 866 698 890 704 Q720 720 552 704 Z" fill="url(#ashG)"/>
  <path d="M640 670 C676 652 712 642 742 650" stroke="#9a948d" stroke-opacity=".35" stroke-width="2" fill="none"/>
  ${chunks}
  ${specks}
  <g filter="url(#ashGlow)">${embers}</g>
  <g>${embers.replace(/r="([\d.]+)"/g, (m, v) => `r="${f1(v * .45)}"`).replace(/#ff7a2a/g, '#ffd28a')}</g>
</svg>`;
  }

  // ---------- пламя (начало координат — у головки спички) ----------
  function flame() {
    return `
      <circle r="46" fill="url(#gFlameGlow)"/>
      <g class="flame">
        <path d="M0 6 C-11 0 -11 -17 -4 -30 C-1 -37 0 -45 0 -50 C5 -39 12 -27 11 -12 C10 -2 6 4 0 6 Z" fill="#ff8f2a"/>
        <path d="M0 5 C-7 0 -7 -12 -2 -22 C0 -27 1 -31 1 -34 C4 -26 8 -18 7 -8 C6 -1 4 3 0 5 Z" fill="#ffc35a"/>
        <path d="M0 4 C-4 1 -4 -7 -1 -14 C1 -10 4 -6 3 -1 C3 2 2 3 0 4 Z" fill="#fff4c4"/>
        <ellipse cx="0" cy="1" rx="4" ry="4.5" fill="#4a73ff" opacity=".55"/>
      </g>`;
  }

  // ---------- спички и руки ----------
  function matches() {
    let trayMatches = '';
    for (let i = 0; i < 8; i++) {
      const y = 597 + i * 8.4;
      trayMatches += `
        <g id="trayMatch-${i}">
          <rect x="352" y="${f1(y - 2.4)}" width="140" height="4.8" rx="2" fill="#e8cb94" stroke="#bb9259" stroke-width=".5"/>
          <ellipse cx="352" cy="${f1(y)}" rx="8" ry="5.6" fill="url(#gMatchHead)"/>
        </g>`;
    }
    let grit = '';
    const r = rng(3);
    for (let i = 0; i < 90; i++) grit += `<circle cx="${f1(332 + r() * 176)}" cy="${f1(672 + r() * 18)}" r="${f1(.5 + r())}" fill="#2a1a11" opacity=".7"/>`;
    const lw = pixelWidth('VERTER', 3);

    return `
<svg ${VB}>
  <!-- рука с коробком -->
  <g id="boxHand" transform="translate(-460 460)">
    ${pawImage('left', 412, 556, -6, .72)}
    <g id="tray">
      <rect x="338" y="584" width="166" height="82" rx="2" fill="#d9c7a2" stroke="#b39b72"/>
      <rect x="343" y="589" width="156" height="72" fill="#c7b089"/>
      ${trayMatches}
    </g>

    <rect x="330" y="580" width="180" height="90" rx="3" fill="#efe6d2"/>
    <rect x="336" y="586" width="168" height="78" rx="2" fill="#c3352a"/>
    <rect x="342" y="592" width="156" height="66" rx="1" fill="none" stroke="#f3e8d0" stroke-width="1.5"/>
    ${pixelText('VERTER', 420 - lw / 2, 606, 3, '#f7efe0')}
    <g transform="translate(420 646) scale(.32)" opacity=".95">
      <path d="M0 6 C-11 0 -11 -17 -4 -30 C-1 -37 0 -45 0 -50 C5 -39 12 -27 11 -12 C10 -2 6 4 0 6 Z" fill="#ffd27a"/>
    </g>
    <rect x="330" y="670" width="180" height="22" rx="2" fill="#4a2e1f"/>
    ${grit}
    <rect x="330" y="670" width="180" height="2" fill="#2b1a10"/>

  </g>

  <!-- рука, которая держит спичку (0,0 — точка щипка) -->
  <g id="pinchHand" transform="translate(1200 1200)">
    <g id="heldMatch" style="visibility:hidden">
      <rect x="-134" y="-2.6" width="142" height="5.2" rx="2.6" fill="#e8cb94" stroke="#bb9259" stroke-width=".6"/>
      <ellipse cx="-134" cy="0" rx="9" ry="6.4" fill="url(#gMatchHead)"/>
    </g>
    ${pawImage('right', -14, -14, -45, .56)}
    <g transform="translate(-140 0)"><g id="heldFlameRot"><g id="heldFlame" class="flame-wrap" opacity="0">${flame()}</g></g></g>
  </g>

  <!-- летящая спичка (0,0 — головка) -->
  <g id="flyMatch" style="display:none">
    <rect x="0" y="-2.6" width="142" height="5.2" rx="2.6" fill="#e8cb94" stroke="#bb9259" stroke-width=".6"/>
    <ellipse cx="0" cy="0" rx="9" ry="6.4" fill="url(#gMatchHead)"/>
    <g transform="translate(-6 0)"><g id="flyFlameRot">${flame()}</g></g>
  </g>
</svg>`;
  }

  return { PAW, cabinet, drawerScene, ball, podium, computer, ash, matches };
})();
