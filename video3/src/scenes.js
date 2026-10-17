// Video 3 — "The Lifestyle Inflation Trap" (hedonic treadmill).
// Spliced into scene.html between the shared drawing kit and the caption/main code.

// start time (s) of the first spoken word matching w, for syncing pops to the voice
function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

function drawWallet(w, t, empty) {
  const h = w * .72;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#9A6234'); g.addColorStop(1, '#6B3F1D');
  rr(-w / 2, -h / 2, w, h, w * .1); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  if (!empty) for (let i = 0; i < 3; i++) withT(-w * .18 + i * w * .16, -h * .5, .38, -.25 + i * .22, () => drawBill(w * .9));
  rr(-w / 2, -h / 2 + h * .08, w, h * .92, w * .1); ctx.fillStyle = g; ctx.fill();
  ctx.setLineDash([w * .03, w * .02]); ctx.strokeStyle = '#E2B07A'; ctx.lineWidth = w * .012;
  rr(-w / 2 + w * .04, -h / 2 + h * .14, w * .92, h * .8, w * .07); ctx.stroke(); ctx.setLineDash([]);
  rr(w * .18, -h * .12, w * .36, h * .3, h * .15); ctx.fillStyle = '#5A3215'; ctx.fill();
  ctx.beginPath(); ctx.arc(w * .4, h * .03, w * .045, 0, 7); ctx.fillStyle = C.gold; ctx.fill();
  ctx.strokeStyle = '#2A1630'; ctx.lineWidth = w * .03; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const x = -w * .12 + s * w * .1, y = h * .02;
    ctx.beginPath(); ctx.ellipse(x, y, w * .055, w * .07, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * .01, y + w * .015, w * .03, 0, 7); ctx.fillStyle = '#2A1630'; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-w * .29, -h * .1); ctx.lineTo(-w * .17, -h * .14); ctx.moveTo(-w * .07, -h * .14); ctx.lineTo(w * .05, -h * .1); ctx.stroke();
  ctx.beginPath(); ctx.arc(-w * .12, h * .26, w * .07, Math.PI + .3, -.3); ctx.stroke();
  const drop = (t * .8) % 1;
  ctx.globalAlpha = 1 - drop;
  ctx.beginPath(); ctx.moveTo(-w * .36, -h * .02 + drop * 40); ctx.quadraticCurveTo(-w * .4, h * .06 + drop * 40, -w * .36, h * .08 + drop * 40);
  ctx.quadraticCurveTo(-w * .32, h * .06 + drop * 40, -w * .36, -h * .02 + drop * 40); ctx.fillStyle = '#7FC8FF'; ctx.fill();
  ctx.restore();
}

function drawPaycheck(w, t) {
  const h = w * .5;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  rr(-w / 2, -h / 2, w, h, 16); ctx.fillStyle = '#F4F6FB'; ctx.fill();
  ctx.shadowColor = 'transparent';
  rr(-w / 2, -h / 2, w, h * .28, 16); ctx.fillStyle = C.green; ctx.fill(); ctx.fillRect(-w / 2, -h / 2 + h * .14, w, h * .14);
  text('PAYCHECK', 0, -h / 2 + h * .15, h * .16, '#fff');
  text('+ RAISE', -w * .1, h * .12, h * .22, C.green);
  ctx.strokeStyle = '#B8C0D2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w * .4, h * .36); ctx.lineTo(w * .1, h * .36); ctx.stroke();
  // bouncing up-arrow
  withT(w * .33, h * .08 - Math.abs(Math.sin(t * 5)) * 10, 1, 0, () => {
    ctx.beginPath(); ctx.moveTo(0, -h * .28); ctx.lineTo(h * .18, -h * .05); ctx.lineTo(h * .07, -h * .05); ctx.lineTo(h * .07, h * .25);
    ctx.lineTo(-h * .07, h * .25); ctx.lineTo(-h * .07, -h * .05); ctx.lineTo(-h * .18, -h * .05); ctx.closePath();
    ctx.fillStyle = C.green; ctx.shadowColor = C.green; ctx.shadowBlur = 20; ctx.fill();
  });
  ctx.restore();
}

function hookTitle(k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  text('GOT A RAISE?', W / 2, 200, 108, '#fff', { stroke: C.ink, strokeW: 16 });
  text('STILL BROKE?', W / 2, 318, 120, C.gold2, { stroke: C.ink, strokeW: 18, glow: C.gold, glowBlur: 40 });
  ctx.restore();
}

// opening composition, shared by scene 1 and the loop end of scene 7
function hookScene(t, k, broke) {
  withT(330, 820, k, 0, () => drawBrain(150, broke > 0 ? 'pain' : 'happy', t, { raise: true }));
  withT(470, 560 - Math.sin(t * 2) * 8, k, -.12, () => drawPaycheck(340, t));
  withT(800, 880, k, .06, () => drawWallet(250, t, true));
  if (broke > 0) withT(800, 690, broke, -.08, () => text('$0', 0, 0, 120, C.red, { stroke: C.ink, strokeW: 14, glow: C.red }));
}

function person(x, y, s, col) {
  withT(x, y, s, 0, () => {
    ctx.beginPath(); ctx.arc(0, -70, 38, 0, 7); ctx.fillStyle = '#F2C6A0'; ctx.fill();
    rr(-50, -25, 100, 120, 45); ctx.fillStyle = col; ctx.fill();
  });
}

function bar(x, base, h, w, col, label, glow) {
  ctx.save(); if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 40; }
  rr(x - w / 2, base - h, w, h, 22); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  text(label, x, base + 55, 48, '#fff', { stroke: C.ink, strokeW: 8 });
}

const SCENES = {
  1(t, lt, d, L) {
    const broke = pop(t, wordAt('broke'), .35);
    background(t, broke > 0 ? C.red : C.green);
    hookTitle(1);
    hookScene(t, 1, broke);
    if (broke > 0) for (let i = 0; i < 6; i++) { // coins leaking out of the empty wallet
      const k = ((lt - wordAt('broke') + .25) * .7 + i / 6) % 1;
      withT(800 + Math.sin(i * 2) * 60, 1000 + k * 260, .7, k * 6, () => { ctx.globalAlpha = 1 - k; drawCoin(30); ctx.globalAlpha = 1; });
    }
  },
  2(t, lt, d, L) {
    background(t);
    pill('EVEN $100K+ EARNERS', 250, C.gold, prog(lt, .05, .3));
    const half = wordAt('half', T.lines[1].start);
    const red = prog(t, wordAt('paycheck', half), .3);
    for (let i = 0; i < 10; i++) {
      const x = 170 + (i % 5) * 185, y = 560 + Math.floor(i / 5) * 290;
      const isRed = i % 2 === 0;
      const k = pop(lt, .1 + i * .05, .3);
      if (k > 0) person(x, y, k * 1.15, isRed && red > 0 ? C.red : '#5B6B8C');
      if (isRed && red > 0) withT(x + 45, y - 120, pop(t, wordAt('paycheck', half) + i * .04, .25), 0, () => text('📅', 0, 0, 52, '#fff'));
    }
    const sk = pop(t, half, .35);
    if (sk > 0) withT(W / 2, 1170, sk, -.04, () => text('≈ 1 IN 2', 0, 0, 120, C.red, { stroke: C.ink, strokeW: 14, glow: C.red }));
  },
  3(t, lt, d, L) {
    background(t, C.red);
    pill('LIFESTYLE INFLATION', 250, C.red, prog(lt, .05, .3));
    const base = 1180;
    const inc = easeOut(prog(t, wordAt('raise', T.lines[3].start), .8));
    bar(280, base, 200 + 420 * inc, 200, C.green, 'INCOME', true);
    const items = [['🚗', 'car'], ['🏢', 'apartment'], ['🍔', 'takeout']];
    let spend = 0;
    items.forEach(([ic, w], i) => {
      const at = wordAt(w, T.lines[3].start);
      const k = pop(t, at, .3), drop = easeInOut(prog(t, at + .45, .4));
      spend += easeOut(prog(t, at + .7, .3));
      if (k > 0 && drop < 1) withT(lerp(560 + i * 170, 780, drop), lerp(430, 900, drop), k * (1 - drop * .6), 0, () => text(ic, 0, 0, 130, '#fff'));
    });
    bar(780, base, 180 + 145 * spend, 200, C.red, 'SPENDING', spend > 2.5);
    if (lt > 1.3 && lt < L[1]) withT(W / 2, 760, pop(lt, 1.3, .3), 0, () => text('📈', 0, 0, 130, '#fff'));
  },
  4(t, lt, d, L) {
    background(t, C.blue);
    pill(t > wordAt('hedonic') ? 'HEDONIC TREADMILL' : 'YOUR BRAIN ADAPTS', 250, C.blue, prog(lt, .05, .3));
    // treadmill
    const tx = W / 2, ty = 1000;
    ctx.save();
    ctx.strokeStyle = '#8C93A8'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx + 250, ty); ctx.lineTo(tx + 300, ty - 380); ctx.lineTo(tx + 180, ty - 400); ctx.stroke();
    rr(tx - 330, ty - 20, 660, 70, 35); ctx.fillStyle = '#2B3550'; ctx.fill();
    ctx.save(); rr(tx - 310, ty - 10, 620, 50, 25); ctx.clip();
    ctx.fillStyle = '#3E4A6B'; ctx.fillRect(tx - 310, ty - 10, 620, 50);
    ctx.fillStyle = C.gold;
    for (let i = -1; i < 9; i++) { const x = tx - 310 + ((i * 80 - t * 400) % 720 + 720) % 720 - 40; ctx.fillRect(x, ty - 10, 22, 50); }
    ctx.restore(); ctx.restore();
    const run = Math.abs(Math.sin(t * 9));
    withT(tx - 40, ty - 200 - run * 22, 1, Math.sin(t * 9) * .06, () => drawBrain(140, lt > L[1] ? 'pain' : 'neutral', t, { arms: false }));
    // sweat
    if (lt > L[1]) { const k = (t * 1.5) % 1; ctx.globalAlpha = 1 - k; text('💧', tx + 100 + k * 40, ty - 330 + k * 60, 50, '#fff'); ctx.globalAlpha = 1; }
    // yesterday's upgrades fading to "normal"
    const fade = easeOut(prog(lt, L[1] + .4, 1.2));
    ['🚗', '🏢', '🍔'].forEach((ic, i) => {
      const x = 240 + i * 300, y = 450;
      ctx.save(); ctx.globalAlpha = 1 - .65 * fade; text(ic, x, y, 110, '#fff'); ctx.restore();
      text(fade > .5 ? 'NORMAL' : 'NEW!', x, y + 95, 40, fade > .5 ? '#8C93A8' : C.gold2, { stroke: C.ink, strokeW: 8 });
    });
    if (lt > L[1] + 1.6) withT(W / 2, 1180, pop(lt, L[1] + 1.6, .3), -.04, () => text('NEED MORE', 0, 0, 96, C.red, { stroke: C.ink, strokeW: 12 }));
  },
  5(t, lt, d, L) {
    background(t);
    pill('YEAR AFTER YEAR', 250, C.gold, prog(lt, .05, .3));
    const x0 = 140, x1 = 940, y0 = 1150, y1 = 450;
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x0, y1 - 30); ctx.lineTo(x0, y0); ctx.lineTo(x1 + 20, y0); ctx.stroke();
    const lines = [['INCOME', C.green, wordAt('income', T.lines[6].start), .92], ['SPENDING', C.red, wordAt('spending', T.lines[6].start), .6], ['SAVINGS', C.gold2, wordAt('savings', T.lines[6].start), 0]];
    lines.forEach(([lab, col, at, top], i) => {
      const k = easeInOut(prog(t, at - .1, .9)); if (k <= 0) return;
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 20;
      ctx.beginPath();
      const yAt = f => top ? y0 - 40 - (y0 - y1) * top * Math.pow(f, 1.2) - i * 18 : y0 - 22;
      for (let s = 0; s <= 40 * k; s++) { const f = s / 40; const x = lerp(x0 + 20, x1, f); s ? ctx.lineTo(x, yAt(f)) : ctx.moveTo(x, yAt(f)); }
      ctx.stroke(); ctx.restore();
      const ex = lerp(x0 + 20, x1, k), ey = yAt(k);
      text(lab, Math.min(ex, x1 - 120), ey + (i === 1 ? 60 : -50), 44, col, { stroke: C.ink, strokeW: 8 });
    });
    const z = pop(t, wordAt('zero', T.lines[6].start), .35);
    if (z > 0) withT(800, 1050, z * (1 + .05 * Math.sin(t * 8)), 0, () => text('$0', 0, 0, 110, C.red, { stroke: C.ink, strokeW: 12, glow: C.red }));
  },
  6(t, lt, d, L) {
    background(t, C.green);
    pill('THE FIX', 250, C.green, prog(lt, .05, .3));
    const half = wordAt('half', T.lines[7].start);
    const split = easeInOut(prog(t, half, .7));
    // the raise coin splits: half saved, half spent
    if (split < 1) withT(W / 2, 560, pop(lt, .1, .35) * (1 - split * .3), 0, () => drawCoin(120));
    if (split > 0) {
      withT(lerp(W / 2, 290, split), lerp(560, 700, split), .8, 0, () => drawCoin(100));
      withT(lerp(W / 2, 790, split), lerp(560, 700, split), .8, 0, () => drawCoin(100));
      text('SAVE 50%', 290, 860, 64, C.green, { stroke: C.ink, strokeW: 10 });
      text('ENJOY 50%', 790, 860, 64, C.gold2, { stroke: C.ink, strokeW: 10 });
      text('🐷', 290, 990, 120, '#fff'); text('🎉', 790, 990, 120, '#fff');
    }
    const sk = prog(t, wordAt('day', half), .2);
    if (sk > 0 && lt < L[1]) withT(W / 2, 1190, lerp(2.2, 1, easeOut(sk)), -.05, () => drawStamp('ON PAYDAY', C.green, sk));
    if (lt > L[1]) withT(W / 2, 1190, pop(lt, L[1], .35), 0, () => drawBrain(85, 'happy', t, { raise: true, wave: true }));
  },
  7(t, lt, d, L) {
    // "next year you'll get another raise" -> rebuild the opening frame for a seamless loop
    background(t, C.green);
    const cal = pop(lt, .1, .35) * (1 - prog(lt, 1.6, .3));
    if (cal > 0) withT(W / 2, 700, cal, -.04, () => {
      rr(-230, -200, 460, 400, 36); ctx.fillStyle = '#F4F6FB'; ctx.fill();
      rr(-230, -200, 460, 110, 36); ctx.fillStyle = C.red; ctx.fill(); ctx.fillRect(-230, -130, 460, 40);
      text('NEXT YEAR', 0, -142, 52, '#fff'); text('2027', 0, 60, 150, C.ink);
    });
    const k = easeOut(prog(lt, 1.7, .55));
    if (k > 0) { hookTitle(k); hookScene(t, k, 0); }
    const f = pop(lt, .3, .35) * (1 - prog(lt, 1.6, .3));
    if (f > 0) withT(W / 2, 1190, f, 0, () => {
      rr(-210, -50, 420, 100, 50); ctx.fillStyle = '#FF0033'; ctx.fill();
      text('FOLLOW 🧠', 0, 3, 50, '#fff');
    });
  },
};
