// Video 6 (v2) — "The janitor who secretly had $8 million" (Ronald Read).
// Rules: motion + voice at 0.0 s, payoff first, mystery → reveal, loop ending.

function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

// elderly janitor; sweep = broom angle driver, pins = show safety pins on the coat
function janitor(x, y, s, t, opts = {}) {
  withT(x, y, s, 0, () => {
    const sw = opts.sweep ? Math.sin(t * 7) : 0;
    // broom
    if (opts.broom !== false) withT(70, 40, 1, .35 + sw * .25, () => {
      ctx.fillStyle = '#8A5A33'; rr(-6, -170, 12, 260, 6); ctx.fill();
      ctx.fillStyle = '#D9B26A'; ctx.beginPath(); ctx.moveTo(-40, 90); ctx.lineTo(40, 90); ctx.lineTo(55, 150); ctx.lineTo(-55, 150); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#B48C45'; ctx.lineWidth = 3; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 9, 95); ctx.lineTo(i * 12, 148); ctx.stroke(); }
    });
    // legs + coat
    ctx.fillStyle = '#3B3F4A'; rr(-36, 60, 30, 110, 12); ctx.fill(); rr(6, 60, 30, 110, 12); ctx.fill();
    rr(-66, -62, 132, 146, 40); ctx.fillStyle = '#5C6B4E'; ctx.fill();
    ctx.fillStyle = '#4C5A40'; ctx.fillRect(-4, -62, 8, 146);
    if (opts.pins) {
      for (let i = 0; i < 3; i++) withT(-2, -30 + i * 38, 1.2, .2, () => {
        ctx.strokeStyle = '#E6E9EF'; ctx.lineWidth = 4; ctx.beginPath();
        ctx.ellipse(0, 0, 16, 6, 0, 0, 7); ctx.stroke();
        ctx.fillStyle = '#E6E9EF'; ctx.beginPath(); ctx.arc(-16, 0, 5, 0, 7); ctx.fill();
      });
      ctx.fillStyle = '#7A6A4E'; rr(-50, 10, 30, 22, 4); ctx.fill(); // patch
    }
    // head, cap, glasses
    ctx.beginPath(); ctx.arc(0, -120, 56, 0, 7); ctx.fillStyle = '#EBC3A0'; ctx.fill();
    ctx.fillStyle = '#E6E6E6'; ctx.beginPath(); ctx.arc(-52, -110, 16, 0, 7); ctx.arc(52, -110, 16, 0, 7); ctx.fill();
    ctx.fillStyle = '#2F4A6B'; ctx.beginPath(); ctx.arc(0, -138, 58, Math.PI, 0); ctx.fill(); rr(-10, -150, 90, 18, 8); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(-20, -118, 13, 0, 7); ctx.arc(20, -118, 13, 0, 7); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-20, -118, 4, 0, 7); ctx.arc(20, -118, 4, 0, 7); ctx.fill();
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
    if (opts.mood === 'wink') { ctx.arc(0, -96, 16, .2, Math.PI - .2); }
    else ctx.arc(0, -92, 12, .3, Math.PI - .3);
    ctx.stroke();
    if (opts.mood === 'wink') { ctx.fillStyle = '#EBC3A0'; ctx.fillRect(6, -134, 30, 18); ctx.beginPath(); ctx.arc(20, -116, 10, Math.PI + .3, -.3); ctx.stroke(); }
  });
}

function bigMoney(v, y, size, k = 1) {
  if (k <= 0) return;
  withT(W / 2, y, k, -.03, () => text('$' + Math.round(v).toLocaleString('en-US'), 0, 0, size, C.gold2, { stroke: C.ink, strokeW: size * .14, glow: C.gold, glowBlur: 40 }));
}

function hookTitle(t, k8) {
  if (k8 <= 0) return;
  bigMoney(8000000 * easeOut(clamp(k8)), 300, 140, 1);
}

function gasPump(s) {
  withT(0, 0, s, 0, () => {
    rr(-80, -200, 160, 330, 20); ctx.fillStyle = '#C0392B'; ctx.fill();
    rr(-55, -170, 110, 80, 10); ctx.fillStyle = '#F4F6FB'; ctx.fill();
    text('GAS', 0, -130, 40, C.ink);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(80, -60); ctx.quadraticCurveTo(150, 0, 110, 90); ctx.stroke();
    rr(-100, 130, 200, 30, 8); ctx.fillStyle = '#555'; ctx.fill();
  });
}

function oldCar(s, t) {
  withT(0, 0, s, 0, () => {
    rr(-220, -60, 440, 110, 30); ctx.fillStyle = '#8C93A8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-130, -60); ctx.lineTo(-80, -140); ctx.lineTo(90, -140); ctx.lineTo(140, -60); ctx.fill();
    rr(-70, -126, 70, 56, 8); ctx.fillStyle = '#BFE3F2'; ctx.fill(); rr(14, -126, 70, 56, 8); ctx.fill();
    ctx.fillStyle = '#6B7287'; rr(-60, -20, 40, 20, 6); ctx.fill();
    for (const wx of [-130, 130]) { ctx.beginPath(); ctx.arc(wx, 55, 46, 0, 7); ctx.fillStyle = '#222'; ctx.fill(); ctx.beginPath(); ctx.arc(wx, 55, 18, 0, 7); ctx.fillStyle = '#999'; ctx.fill(); }
    ctx.fillStyle = '#6E4A2E'; ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(160, -10, 18, 0, 7); ctx.arc(-170, 0, 14, 0, 7); ctx.fill(); ctx.globalAlpha = 1; // rust
  });
}

function certificate(w, rot) {
  withT(0, 0, 1, rot, () => {
    const h = w * .66;
    rr(-w / 2, -h / 2, w, h, 6); ctx.fillStyle = '#F3E8C8'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#2E7D4F'; rr(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 4); ctx.stroke();
    text('SHARES', 0, -h * .18, w * .13, '#2E7D4F');
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#C9B98F'; ctx.fillRect(-w * .32, h * (.02 + i * .1), w * .64, 6); }
  });
}

function safeBox(open, t) {
  rr(-240, -170, 480, 340, 18); ctx.fillStyle = '#7A808E'; ctx.fill();
  rr(-220, -150, 440, 300, 12); ctx.fillStyle = '#2B2F38'; ctx.fill();
  // certificates inside
  for (let i = 0; i < 9; i++) withT(0, 100 - i * 24, 1, (i % 2 ? .02 : -.02), () => certificate(380, 0));
  // door swinging open
  ctx.save(); ctx.translate(-220, 0); ctx.scale(Math.cos(open * 1.4), 1);
  rr(0, -150, 440, 300, 12); ctx.fillStyle = '#9AA1B0'; ctx.fill();
  ctx.beginPath(); ctx.arc(220, 0, 50, 0, 7); ctx.fillStyle = '#C9CFDB'; ctx.fill();
  ctx.strokeStyle = '#5A6070'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(220, -40); ctx.lineTo(220, 40); ctx.moveTo(180, 0); ctx.lineTo(260, 0); ctx.stroke();
  ctx.restore();
}

function check(ok, k) {
  text(ok ? '✓' : '✗', 0, 0, 90, ok ? '#4BE38A' : C.red, { stroke: C.ink, strokeW: 10 });
}

const SCENES = {
  1(t, lt, d, L) {
    background(t, C.gold);
    janitor(W / 2, 960, 1.6, t, { sweep: true });
    // dust puffs from the broom: motion from frame 0
    for (let i = 0; i < 5; i++) { const k = ((t * 1.4 + i / 5) % 1); ctx.globalAlpha = (1 - k) * .45; ctx.fillStyle = '#C9CFDB'; ctx.beginPath(); ctx.arc(W / 2 + 160 + k * 120, 1210 - k * 40, 18 + k * 30, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    const e = wordAt('$8');
    hookTitle(t, prog(t, e - .1, .7));
    if (t > e + .6) { glowCircle(W / 2, 300, 400, C.gold, .25); }
    const nk = pop(t, wordAt('nobody'), .3);
    if (nk > 0) withT(W / 2, 470, nk, .04, () => text('NOBODY KNEW 🤫', 0, 0, 72, '#fff', { stroke: C.ink, strokeW: 10 }));
  },
  2(t, lt, d, L) {
    background(t);
    const fl = wordAt('cleaned');
    withT(270, 870, pop(lt, .05, .35), 0, () => gasPump(1));
    janitor(660, 940, 1.15, t, { sweep: t > fl });
    const y = Math.round(lerp(1940, 2014, easeInOut(prog(t, wordAt('decades') - .5, 1.6))));
    withT(W / 2, 360, pop(lt, .1, .35), 0, () => {
      rr(-230, -80, 460, 160, 26); ctx.fillStyle = '#fff'; ctx.fill();
      text(String(y), 0, 6, 110, C.ink);
    });
    text('GAS + JANITOR', W / 2, 520, 56, '#9AA6C8', { stroke: C.ink, strokeW: 8 });
  },
  3(t, lt, d, L) {
    background(t);
    withT(330, 1000, pop(t, wordAt('used') - .1, .35), 0, () => oldCar(.95, t));
    const p = t > wordAt('safety') - .2;
    janitor(780, 900, 1.2, t, { broom: false, pins: p });
    if (p) withT(780, 560, pop(t, wordAt('safety'), .3), 0, () => text('SAFETY PINS', 0, 0, 56, '#fff', { stroke: C.ink, strokeW: 8 }));
    withT(330, 760, pop(t, wordAt('used'), .3), -.05, () => text('USED CAR', 0, 0, 56, '#9AA6C8', { stroke: C.ink, strokeW: 8 }));
  },
  4(t, lt, d, L) {
    background(t, C.green);
    pill('EVERY SPARE DOLLAR', 250, C.green, prog(lt, .05, .3));
    // coins drop into a jar, chart climbs behind
    const x0 = 140, x1 = 940, y0 = 1150, y1 = 450, k = easeInOut(prog(lt, .2, d - .4));
    ctx.save(); ctx.strokeStyle = '#4BE38A'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = '#4BE38A'; ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i <= 60 * k; i++) { const f = i / 60; const x = lerp(x0, x1, f), y = y0 - (y0 - y1) * (Math.pow(f, 2.2) + Math.sin(f * 30) * .02); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    for (let i = 0; i < 4; i++) { const c = ((lt * 1.3 + i / 4) % 1); withT(260, lerp(380, 900, c), .8, c * 6, () => drawCoin(40)); }
    janitor(260, 1020, .8, t, { broom: false });
    const sk = prog(t, wordAt('never'), .2);
    if (sk > 0) withT(680, 640, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('NEVER SOLD', '#4BE38A', sk));
  },
  5(t, lt, d, L) {
    background(t, C.gold);
    const op = easeInOut(prog(t, wordAt('safe') - .1, 1.0));
    withT(W / 2, 800, 1, 0, () => safeBox(op, t));
    // certificates burst out once the box is open
    const b = prog(t, wordAt('packed') - .1, 1.5);
    if (b > 0) for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (rnd(i) - .5) * 2.6, r = easeOut(b) * (300 + rnd(i + 4) * 350);
      withT(W / 2 + Math.cos(a) * r, 760 + Math.sin(a) * r, .55, (rnd(i + 7) - .5) * 2 + b * 2, () => certificate(300, 0));
    }
    if (op > .7) glowCircle(W / 2, 800, 500, C.gold, .25 * op);
    withT(W / 2, 330, pop(t, wordAt('stock'), .3), 0, () => text('STOCK CERTIFICATES', 0, 0, 64, '#fff', { stroke: C.ink, strokeW: 10 }));
  },
  6(t, lt, d, L) {
    background(t, C.gold);
    const h = pop(t, wordAt('hospital'), .35), lib = pop(t, wordAt('library'), .35);
    withT(290, 760, h, 0, () => { text('🏥', 0, 0, 220, '#fff'); text('$4.8M', 0, 200, 96, C.gold2, { stroke: C.ink, strokeW: 12 }); });
    withT(790, 760, lib, 0, () => { text('📚', 0, 0, 220, '#fff'); text('$1.2M', 0, 200, 96, C.gold2, { stroke: C.ink, strokeW: 12 }); });
    // money flies out to both
    for (let i = 0; i < 10; i++) {
      const k = ((lt * .9 + i / 10) % 1), tx = i % 2 ? 790 : 290;
      ctx.globalAlpha = (1 - k) * .9;
      withT(lerp(W / 2, tx, k), lerp(380, 700, k), .45, k * 4, () => drawBill(220));
      ctx.globalAlpha = 1;
    }
    text('GAVE IT AWAY', W / 2, 330, 72, '#fff', { stroke: C.ink, strokeW: 10 });
  },
  7(t, lt, d, L) {
    background(t);
    const rows = [['NO GENIUS', false, wordAt('genius')], ['NO LUCK', false, wordAt('luck')], ['JUST TIME', true, wordAt('time')]];
    rows.forEach(([s, ok, at], i) => {
      const k = pop(t, at, .3); if (k <= 0) return;
      withT(W / 2, 480 + i * 200, k, 0, () => {
        text(s, -60, 0, 96, ok ? C.gold2 : '#9AA6C8', { stroke: C.ink, strokeW: 12, glow: ok ? C.gold : null });
        withT(320, 0, 1, 0, () => check(ok));
      });
    });
    withT(W / 2, 1150, pop(t, wordAt('time'), .35), Math.sin(t * 2) * .2, () => text('⏳', 0, 0, 140, '#fff'));
  },
  8(t, lt, d, L) {
    background(t, C.gold);
    const q = pop(lt, .05, .35) * (1 - prog(lt, d - .65, .25));
    if (q > 0) withT(W / 2, 640, q, -.03, () => {
      text("WHAT'S YOUR", 0, -70, 110, '#fff', { stroke: C.ink, strokeW: 14 });
      text('EXCUSE?', 0, 60, 140, C.gold2, { stroke: C.ink, strokeW: 16, glow: C.gold });
    });
    // rebuild frame 0: janitor sweeping, no number yet
    const k = easeOut(prog(lt, d - .5, .45));
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; janitor(W / 2, 960, 1.6, t, { sweep: true }); ctx.restore(); }
  },
};
