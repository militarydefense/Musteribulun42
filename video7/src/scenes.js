// Video 7 — "She invested $24K, he invested $72K, she retired richer" (Day 5 format).
// Motion + voice at 0.0 s, payoff first, loop ending.

// $200/month = $2,400/year, 8% a year, value at the end of each year of age.
function fvAt(age, who) {
  const [a0, a1] = who === 'emma' ? [25, 35] : [35, 65];
  const at = n => { let v = 0; for (let a = 25; a < n; a++) { if (a >= a0 && a < a1) v += 2400; v *= 1.08; } return v; };
  const f = Math.floor(age);
  return lerp(at(f), at(Math.min(f + 1, 65)), age - f);
}
const EMMA = '#FF6FA3', JAKE = '#3BA7FF';
const kusd = v => '$' + Math.round(v / 1000) + 'K';
const fullusd = v => '$' + (Math.round(v / 1000) * 1000).toLocaleString('en-US');

function wordAt(w, from = 0, nth = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) { if (nth-- === 0) return x.s; }
  }
  return 1e9;
}

// a stack of n bills seen from the side
function cashStack(n, w = 260) {
  for (let i = 0; i < n; i++) {
    const y = -i * 18;
    rr(-w / 2, y - 16, w, 16, 4); ctx.fillStyle = i % 2 ? '#3E9B5E' : '#4DB06E'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-w * .08, y - 16, w * .16, 16);
  }
}

function person(name, color, t, seed, mood = 0) {
  drawPerson(color, 'cash', t, seed);
  if (mood) { // smile when winning
    ctx.strokeStyle = '#2A1630'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -26 + Math.sin(t * 4 + seed) * 4, 14, .2, Math.PI - .2); ctx.stroke();
  }
  rr(-90, 170, 180, 60, 30); ctx.fillStyle = color; ctx.fill();
  text(name, 0, 200, 40, '#fff');
}

// the opening tableau (frame 0 and the loop end): two stacks land, $24K vs $72K
function opening(t, lt, k = 1) {
  const fall = i => easeOut(clamp((lt - i * .12) / .35));
  const e = fall(0), j = fall(1);
  ctx.save(); ctx.globalAlpha = k;
  withT(300, lerp(200, 980, e), 1, 0, () => cashStack(4));
  withT(780, lerp(100, 980, j), 1, 0, () => cashStack(12));
  if (e >= 1) withT(300, 860, 1, 0, () => text('$24K', 0, -40, 96, '#fff', { stroke: C.ink, strokeW: 14 }));
  if (j >= 1) withT(780, 700, 1, 0, () => text('$72K', 0, -40, 96, '#fff', { stroke: C.ink, strokeW: 14 }));
  withT(300, 1150, .8, 0, () => person('EMMA', EMMA, t, 0));
  withT(780, 1150, .8, 0, () => person('JAKE', JAKE, t, 2));
  ctx.restore();
}

// horizontal age timeline 25 -> 65
const TX0 = 110, TX1 = 970;
const ax = a => lerp(TX0, TX1, (a - 25) / 40);
function timeline(y) {
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(TX0, y); ctx.lineTo(TX1, y); ctx.stroke();
  for (const a of [25, 35, 45, 55, 65]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ax(a), y, 9, 0, 7); ctx.fill();
    text(String(a), ax(a), y + 50, 40, '#9AA6C8', { weight: 800 });
  }
}
function segment(y, a0, a1, k, color) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.moveTo(ax(a0), y); ctx.lineTo(ax(lerp(a0, a1, k)), y); ctx.stroke(); ctx.restore();
}

// bar chart used in scenes 5-6
function bars(t, jv, ev, crown = 0) {
  const base = 1180, scale = 620 / 378000;
  const bar = (x, v, color, label) => {
    const h = Math.max(v * scale, 8);
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 35;
    rr(x - 150, base - h, 300, h, 22); ctx.fillStyle = color; ctx.fill(); ctx.restore();
    text(label, x, base + 55, 46, '#fff');
    if (v > 1000) text(kusd(v), x, base - h - 60, 92, '#fff', { stroke: C.ink, strokeW: 14 });
  };
  bar(300, ev, EMMA, 'EMMA'); bar(780, jv, JAKE, 'JAKE');
  if (crown > 0) withT(300, base - ev * scale - 180, crown, -.08, () => text('👑', 0, 0, 120, '#fff'));
}

const SCENES = {
  1(t, lt, d, L) {
    background(t, C.gold);
    opening(t, lt);
    const tk = pop(lt, .9, .4);
    if (tk > 0) withT(W / 2, 250, tk, 0, () => {
      text('PAID LESS.', 0, -55, 100, '#fff', { stroke: C.ink, strokeW: 14 });
      text('GOT MORE?', 0, 65, 100, C.gold2, { stroke: C.ink, strokeW: 14, glow: C.gold });
    });
    const rk = prog(t, wordAt('richer'), .2);
    if (rk > 0) {
      glowCircle(300, 900, 420, C.gold, .45 * rk);
      withT(300, 560, lerp(2.2, 1, easeOut(rk)), -.08, () => drawStamp('RICHER', C.gold2, rk));
    }
  },
  2(t, lt, d, L) {
    background(t);
    withT(W / 2, 400, pop(lt, 0, .35) * .9, 0, () => person('EMMA', EMMA, t, 0));
    const ty = 900;
    timeline(ty);
    const sk = easeInOut(prog(t, wordAt('25'), 1.2));
    segment(ty, 25, 35, sk, EMMA);
    pill('$200 / MONTH', 660, EMMA, prog(t, wordAt('$200'), .3));
    const st = prog(t, wordAt('stops'), .2);
    if (st > 0) {
      withT(ax(35) + 10, ty - 110, lerp(1.8, .6, easeOut(st)), -.1, () => drawStamp('STOP', C.red, st));
      ctx.save(); ctx.globalAlpha = st * .9; ctx.setLineDash([16, 18]); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(ax(35), ty); ctx.lineTo(ax(65), ty); ctx.stroke(); ctx.restore();
    }
    const tot = pop(t, wordAt('forever'), .35);
    if (tot > 0) withT(W / 2, 1120, tot, 0, () => text('TOTAL: $24,000', 0, 0, 80, C.gold2, { stroke: C.ink, strokeW: 12 }));
  },
  3(t, lt, d, L) {
    background(t);
    withT(W / 2, 470, pop(lt, 0, .35) * .9, 0, () => person('JAKE', JAKE, t, 2));
    const ty = 900;
    timeline(ty);
    segment(ty - 60, 25, 35, 1, 'rgba(255,111,163,.35)');
    const sk = easeInOut(prog(t, wordAt('$200', t - lt), 1.6));
    segment(ty, 35, 65, sk, JAKE);
    // years ticking
    const yrs = Math.round(30 * sk);
    if (sk > 0) text(yrs + ' YEARS', Math.min(ax(lerp(35, 65, sk)) - 40, 850), ty - 90, 56, '#fff', { stroke: C.ink, strokeW: 10 });
    const tot = pop(t, wordAt('years'), .35);
    if (tot > 0) withT(W / 2, 1120, tot, 0, () => text('TOTAL: $72,000', 0, 0, 80, C.gold2, { stroke: C.ink, strokeW: 12 }));
  },
  4(t, lt, d, L) {
    background(t, C.gold);
    withT(300, 900, .9, 0, () => person('EMMA', EMMA, t, 0));
    withT(780, 900, .9, 0, () => person('JAKE', JAKE, t, 2));
    const k = pop(lt, .1, .4);
    if (k > 0) withT(W / 2, 460, k * (1 + .04 * Math.sin(t * 8)), 0, () => {
      text('8%', 0, 0, 260, '#4BE38A', { stroke: C.ink, strokeW: 24, glow: '#4BE38A' });
      text('SAME RETURN', 0, 170, 60, '#fff', { stroke: C.ink, strokeW: 10 });
    });
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 8;
    text('=', W / 2, 900, 140, '#fff', { stroke: C.ink, strokeW: 14 });
  },
  5(t, lt, d, L) {
    background(t);
    pill('AGE 65', 260, C.gold, prog(lt, 0, .3));
    const jk = easeOut(prog(t, wordAt('jake'), 1.6));
    bars(t, 293630 * jk, 0);
  },
  6(t, lt, d, L) {
    background(t, C.gold);
    pill('AGE 65', 260, C.gold, 1);
    const ek = easeInOut(prog(t, wordAt('$378000') - .1, 1.4));
    bars(t, 293630, 377844 * ek, pop(t, wordAt('$378000') + 1.4, .4));
    if (ek >= 1) glowCircle(300, 560, 360, C.gold, .35 + .1 * Math.sin(t * 6));
    const dk = pop(t, wordAt('$378000') + 1.5, .35);
    if (dk > 0) withT(780, 380, dk, .06, () => text('+$84K', 0, 0, 100, '#4BE38A', { stroke: C.ink, strokeW: 14, glow: '#4BE38A' }));
  },
  7(t, lt, d, L) {
    background(t);
    // both growth curves, age 25 -> 65
    const x0 = 120, x1 = 960, y0 = 1180, y1 = 420, top = 377844;
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x0, y1 - 20); ctx.lineTo(x0, y0); ctx.lineTo(x1 + 20, y0); ctx.stroke();
    text('25', x0, y0 + 45, 38, '#9AA6C8', { weight: 800 }); text('65', x1, y0 + 45, 38, '#9AA6C8', { weight: 800 });
    const aEnd = lerp(25, 65, easeInOut(prog(lt, .1, 1.8)));
    for (const [who, col] of [['jake', JAKE], ['emma', EMMA]]) {
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 25;
      ctx.beginPath();
      for (let a = 25; a <= aEnd; a += .25) {
        const x = lerp(x0, x1, (a - 25) / 40), y = y0 - (y0 - y1) * fvAt(a, who) / top;
        a === 25 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
    }
    const bk = pop(t, wordAt('ten'), .35);
    if (bk > 0) withT(W / 2, 330, bk, -.03, () => text('+10 YEARS OF GROWTH', 0, 0, 74, C.gold2, { stroke: C.ink, strokeW: 12, glow: C.gold }));
  },
  8(t, lt, d, L) {
    background(t, C.gold);
    const q = pop(lt, .05, .35) * (1 - prog(lt, 1.3, .25));
    if (q > 0) withT(W / 2, 620, q, -.03, () => {
      text('WHICH ONE', 0, -70, 110, '#fff', { stroke: C.ink, strokeW: 14 });
      text('ARE YOU?', 0, 60, 120, C.gold2, { stroke: C.ink, strokeW: 14, glow: C.gold });
    });
    // rebuild frame 0 so the loop restarts as the stacks land
    if (lt > 1.4) opening(t, (lt - 1.4) * .5, easeOut(prog(lt, 1.4, .3)));
  },
};
