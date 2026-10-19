// Video 5 — "1 penny doubled for 30 days vs $1,000,000".
// Rules from the first four videos: motion + voice at 0.0 s (no title card), payoff first, loop ending.

const pennyValue = d => 0.01 * Math.pow(2, d - 1);
const usd = v => v < 1 ? Math.round(v * 100) + '¢' : '$' + (v < 100 ? v.toFixed(2) : Math.floor(v).toLocaleString('en-US'));

function wordAt(w, from = 0, nth = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) { if (nth-- === 0) return x.s; }
  }
  return 1e9;
}

function penny(r, t) {
  ctx.save();
  const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
  g.addColorStop(0, '#F6B98A'); g.addColorStop(.55, '#C8733F'); g.addColorStop(1, '#7E3F1C');
  ctx.shadowColor = 'rgba(255,170,90,.6)'; ctx.shadowBlur = r * .5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = r * .07; ctx.strokeStyle = '#9A5228'; ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, 7); ctx.stroke();
  text('1¢', 0, -r * .05, r * .8, '#FCE3CC', { stroke: '#7E3F1C', strokeW: r * .08 });
  text('ONE CENT', 0, r * .55, r * .18, '#FCE3CC', { weight: 800 });
  ctx.restore();
}

function briefcase(w, t, dim = 0) {
  const h = w * .7;
  ctx.save();
  ctx.globalAlpha = 1 - dim * .5;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  ctx.strokeStyle = '#2B2B2B'; ctx.lineWidth = w * .05;
  rr(-w * .16, -h / 2 - w * .14, w * .32, w * .2, w * .06); ctx.stroke();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#3A3A3A'); g.addColorStop(1, '#141414');
  rr(-w / 2, -h / 2, w, h, w * .06); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.gold; rr(-w * .08, -h / 2 + h * .08, w * .16, h * .1, 6); ctx.fill();
  rr(-w * .42, -h * .05, w * .84, h * .3, 12); ctx.fillStyle = 'rgba(245,183,0,.15)'; ctx.fill();
  text('$1,000,000', 0, h * .1, w * .13, C.gold2, { weight: 900 });
  ctx.restore();
}

function dayBadge(d, k, y = 330) {
  if (k <= 0) return;
  withT(W / 2, y, k, 0, () => {
    rr(-160, -78, 320, 156, 26); ctx.fillStyle = '#fff'; ctx.fill();
    rr(-160, -78, 320, 52, 22); ctx.fillStyle = C.red; ctx.fill(); ctx.fillRect(-160, -46, 320, 20);
    text('DAY', 0, -52, 36, '#fff');
    text(String(d), 0, 28, 92, C.ink);
  });
}

function bigValue(v, y, size, col = C.gold2) {
  text(usd(v), W / 2, y, size, col, { stroke: C.ink, strokeW: size * .14, glow: C.gold, glowBlur: 30 });
}

// the two contenders; penny falls in from the top (used at frame 0 and again at the loop end)
function openingScene(t, fall) {
  const k = easeOut(clamp(fall));
  const py = lerp(250, 780, k), rot = (1 - k) * 2.2;
  if (fall >= 1 && fall < 1.25) glowCircle(310, 780, 380 * (fall - 1) * 4, C.gold, .5 * (1.25 - fall) * 4);
  withT(310, py, 1, rot, () => penny(170, t));
  if (k < 1) { // motion streaks while falling
    ctx.strokeStyle = 'rgba(255,200,140,.5)'; ctx.lineWidth = 8;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(310 + i * 70, py - 190); ctx.lineTo(310 + i * 70, py - 330); ctx.stroke(); }
  }
  withT(790, 800, 1, 0, () => briefcase(380, t));
}

const SCENES = {
  1(t, lt, d, L) {
    background(t, C.gold);
    const fall = lt / .35;
    const shake = lt > .35 && lt < .7 ? Math.sin(lt * 90) * 14 * (.7 - lt) : 0;
    ctx.save(); ctx.translate(shake, 0);
    openingScene(t, fall);
    ctx.restore();
    const beats = pop(t, wordAt('beats'), .3);
    if (beats > 0) withT(W / 2 + 40, 790, beats * (1 + .06 * Math.sin(t * 8)), 0, () => text('>', 0, 0, 200, '#4BE38A', { stroke: C.ink, strokeW: 20, glow: '#4BE38A' }));
    // title arrives after the first second, never as a static opener
    const tk = pop(lt, .9, .4);
    if (tk > 0) withT(W / 2, 250, tk, 0, () => {
      text('1 PENNY', -170, 0, 96, '#fff', { stroke: C.ink, strokeW: 14 });
      text('vs $1M', 210, 0, 96, C.gold2, { stroke: C.ink, strokeW: 14 });
    });
    const dk = pop(t, wordAt('30'), .3);
    if (dk > 0) withT(W / 2, 1150, dk, -.05, () => drawStamp('30 DAYS', C.red, 1));
  },
  2(t, lt, d, L) {
    background(t);
    const l2 = L[0], l3 = L[1];
    const day = lt < l3 ? Math.round(1 + 9 * easeInOut(prog(lt, l2, 1.0))) : Math.round(10 + 10 * easeInOut(prog(lt, l3, 1.0)));
    dayBadge(day, 1);
    // coin stack grows with the value (log scale so it is visible)
    const v = pennyValue(day), n = Math.max(1, Math.round(Math.log2(v * 100) * 1.4));
    for (let i = 0; i < n; i++) withT(300 + Math.sin(i * 1.3) * 8, 1060 - i * 22, .55, 0, () => {
      ctx.beginPath(); ctx.ellipse(0, 0, 90, 26, 0, 0, 7); ctx.fillStyle = i % 2 ? '#B8652F' : '#C8733F'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#7E3F1C'; ctx.stroke();
    });
    withT(300, 560, 1, 0, () => text(usd(v), 0, 0, 96, '#FCE3CC', { stroke: C.ink, strokeW: 14 }));
    withT(790, 880, 1, 0, () => briefcase(330, t));
    withT(790, 640, 1, 0, () => text('$1,000,000', 0, 0, 64, C.gold2, { stroke: C.ink, strokeW: 10 }));
  },
  3(t, lt, d, L) {
    background(t);
    // linear scale: the penny is a sliver next to the million
    const base = 1180, top = 580, k = easeOut(prog(lt, 0, .6));
    rr(560, base - (base - top) * k, 300, (base - top) * k, 20); ctx.fillStyle = C.gold; ctx.fill();
    text('$1M', 710, top - 60, 84, C.gold2, { stroke: C.ink, strokeW: 12 });
    rr(200, base - 6, 300, 6, 3); ctx.fillStyle = '#C8733F'; ctx.fill();
    text('$5,242', 350, base - 70, 70, '#FCE3CC', { stroke: C.ink, strokeW: 10 });
    withT(350, 760, pop(lt, .3, .4), 0, () => drawBrain(120, 'happy', t, { raise: true, wave: true }));
    const sk = prog(lt, 1.0, .2);
    if (sk > 0) withT(W / 2, 330, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('NOT EVEN CLOSE', C.red, sk));
  },
  4(t, lt, d, L) {
    background(t, C.gold);
    const day = Math.round(21 + 7 * easeIn(prog(t, wordAt('then'), 1.8)));
    dayBadge(day, 1);
    const v = pennyValue(day);
    const base = 1180, top = 600, maxV = 1342177.28;
    const mh = (base - top) * 1e6 / maxV, ph = (base - top) * v / maxV;
    rr(560, base - mh, 300, mh, 20); ctx.fillStyle = 'rgba(245,183,0,.55)'; ctx.fill();
    text('$1M', 710, base - mh - 50, 64, C.gold2, { stroke: C.ink, strokeW: 10 });
    ctx.save(); ctx.shadowColor = '#FF9A4D'; ctx.shadowBlur = 40;
    rr(200, base - Math.max(ph, 6), 300, Math.max(ph, 6), 20); ctx.fillStyle = '#E07B3C'; ctx.fill(); ctx.restore();
    withT(350, Math.min(base - ph - 60, 1100), 1, 0, () => text(usd(v), 0, 0, 74, '#FCE3CC', { stroke: C.ink, strokeW: 12 }));
    if (v > 1e6) {
      const sk = prog(t, wordAt('$13'), .2);
      glowCircle(350, base - ph, 300, '#FF9A4D', .4 * (1 - prog(t, wordAt('28'), 1)));
      if (sk > 0) withT(350, 880, lerp(2.2, 1, easeOut(sk)) * .8, -.12, () => drawStamp('PASSED!', '#FFFFFF', sk));
    }
  },
  5(t, lt, d, L) {
    background(t, C.gold);
    const day = Math.round(28 + 2 * easeOut(prog(lt, .1, .8)));
    // money rain behind the number
    for (let i = 0; i < 16; i++) {
      const y = ((lt * 700 + rnd(i + 3) * 1500) % 1400) - 100;
      ctx.globalAlpha = .7;
      withT(rnd(i) * W, y, .5 + rnd(i + 8) * .3, lt * 2 + i, () => i % 3 ? drawCoin(40) : drawBill(220));
      ctx.globalAlpha = 1;
    }
    dayBadge(day, 1);
    bigValue(pennyValue(day), 640, 120);
    withT(790, 1000, 1, 0, () => briefcase(220, t, 1));
    const x5 = pop(t, wordAt('$53'), .35);
    if (x5 > 0) withT(300, 1000, x5, -.05, () => text('5×', 0, 0, 160, '#4BE38A', { stroke: C.ink, strokeW: 18, glow: '#4BE38A' }));
  },
  6(t, lt, d, L) {
    background(t);
    pill('COMPOUNDING', 250, C.gold, prog(lt, .05, .3));
    // exponential curve: slow, slow, slow ... then all at once
    const marks = [[wordAt('slow'), 12], [wordAt('slow', 0, 1), 18], [wordAt('slow', 0, 2), 23], [wordAt('all'), 30]];
    let dEnd = 2;
    for (const [at, dd] of marks) if (t > at) dEnd = lerp(dEnd, dd, easeOut(prog(t, at, .5)));
    const x0 = 120, x1 = 960, y0 = 1180, y1 = 420;
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x0, y1 - 20); ctx.lineTo(x0, y0); ctx.lineTo(x1 + 20, y0); ctx.stroke();
    ctx.save(); ctx.strokeStyle = C.gold2; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = C.gold; ctx.shadowBlur = 25;
    ctx.beginPath();
    for (let dd = 1; dd <= dEnd; dd += .25) {
      const x = lerp(x0, x1, (dd - 1) / 29), y = y0 - (y0 - y1) * pennyValue(dd) / pennyValue(30);
      dd === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
    ['SLOW', 'SLOW', 'SLOW'].forEach((s, i) => { const k = pop(t, marks[i][0], .3); if (k > 0) withT(250 + i * 220, 1090, k, 0, () => text(s, 0, 0, 56, '#9AA6C8', { stroke: C.ink, strokeW: 8 })); });
    const boom = pop(t, marks[3][0], .35);
    if (boom > 0) withT(760, 560, boom, -.06, () => text('BOOM', 0, 0, 120, '#4BE38A', { stroke: C.ink, strokeW: 16, glow: '#4BE38A' }));
  },
  7(t, lt, d, L) {
    background(t, C.gold);
    const q = pop(lt, .05, .35) * (1 - prog(lt, 1.2, .25));
    if (q > 0) withT(W / 2, 620, q, -.03, () => {
      text('WOULD YOU STILL', 0, -80, 84, '#fff', { stroke: C.ink, strokeW: 12 });
      text('TAKE THE $1M?', 0, 40, 104, C.gold2, { stroke: C.ink, strokeW: 14, glow: C.gold });
    });
    // rebuild frame 0: briefcase waiting, penny poised at the top -> the loop restarts mid-fall
    const k = easeOut(prog(lt, 1.25, .5));
    if (k > 0) {
      ctx.save(); ctx.globalAlpha = k;
      withT(790, 800, 1, 0, () => briefcase(380, t));
      withT(310, lerp(-200, 250, k), 1, 2.2, () => penny(170, t));
      ctx.restore();
    }
  },
};

function easeIn(k) { return k * k * k; }
