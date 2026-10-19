// Video 6 — "Why Costco sells a $1.50 hot dog" (loss leader).
// Rules: motion + voice at 0.0 s, payoff first, one short "why", loop ending.

function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

function hotDog(w) {
  const h = w * .36;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  // bun
  rr(-w / 2, -h * .1, w, h * .75, h * .37); ctx.fillStyle = '#E9A95A'; ctx.fill();
  ctx.shadowColor = 'transparent';
  rr(-w / 2 + 10, -h * .02, w - 20, h * .3, h * .15); ctx.fillStyle = '#F6C887'; ctx.fill();
  // sausage
  rr(-w * .55, -h * .42, w * 1.1, h * .5, h * .25); ctx.fillStyle = '#B5432C'; ctx.fill();
  rr(-w * .5, -h * .38, w, h * .15, h * .08); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
  // mustard zigzag
  ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = h * .09; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) { const x = -w * .42 + i * w * .084; ctx.lineTo(x, -h * .17 + (i % 2 ? -h * .12 : h * .1)); }
  ctx.stroke();
  ctx.restore();
}

function soda(h) {
  const w = h * .62;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w * .38, h / 2); ctx.lineTo(-w * .38, h / 2); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save(); ctx.clip();
  ctx.fillStyle = '#E63946'; for (let i = -3; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-w + i * w * .35, -h / 2); ctx.lineTo(-w + i * w * .35 + w * .17, -h / 2); ctx.lineTo(-w * .4 + i * w * .35 + w * .17, h / 2); ctx.lineTo(-w * .4 + i * w * .35, h / 2); ctx.fill(); }
  ctx.restore();
  rr(-w * .55, -h / 2 - h * .08, w * 1.1, h * .1, 10); ctx.fillStyle = '#DDE3EE'; ctx.fill();
  ctx.strokeStyle = '#DDE3EE'; ctx.lineWidth = h * .04; ctx.beginPath(); ctx.moveTo(w * .1, -h / 2 - h * .06); ctx.lineTo(w * .3, -h * .78); ctx.stroke();
  ctx.restore();
}

function tag(str, w, col = C.gold, txt = C.ink, swing = 0) {
  const h = w * .52;
  ctx.save(); ctx.rotate(swing);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2 + 30); ctx.lineTo(-w / 2 + h * .45, -h / 2); ctx.lineTo(w / 2 - 20, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, 20); ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, 20);
  ctx.lineTo(-w / 2 + h * .45, h / 2); ctx.lineTo(-w / 2, h / 2 - 30); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.arc(-w / 2 + h * .32, 0, h * .09, 0, 7); ctx.fillStyle = C.navy; ctx.fill();
  text(str, w * .1, 4, h * .5, txt);
  ctx.restore();
}

// the combo: hot dog + soda + price tag; drop = 0..1 (0 = mid-fall, used at frame 0 and the loop end)
function combo(t, drop, x = W / 2, y = 880) {
  const k = easeBack(clamp(drop));
  const dy = lerp(-140, 0, k);
  withT(x - 120, y + 60 + dy, 1, Math.sin(t * 2) * .03, () => hotDog(470));
  withT(x + 230, y - 30 + dy * 1.2, 1, 0, () => soda(300));
  withT(x - 170, y - 220 + dy * .7, 1, 0, () => tag('$1.50', 360, C.gold, C.ink, Math.sin(t * 3) * .08));
}

function person(x, y, s, suit, mood, t) {
  withT(x, y + Math.sin(t * 3) * 3, s, 0, () => {
    rr(-34, 60, 28, 110, 12); ctx.fillStyle = '#20263A'; ctx.fill(); rr(6, 60, 28, 110, 12); ctx.fill();
    rr(-64, -60, 128, 140, 44); ctx.fillStyle = suit; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -60); ctx.lineTo(0, -20); ctx.lineTo(14, -60); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = C.red; ctx.fillRect(-5, -52, 10, 34);
    ctx.beginPath(); ctx.arc(0, -120, 58, 0, 7); ctx.fillStyle = '#F2C6A0'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -140, 58, Math.PI * 1.08, Math.PI * 1.92); ctx.fillStyle = mood === 'angry' ? '#CFCFCF' : '#3A2A20'; ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-20, -118, 6, 0, 7); ctx.arc(20, -118, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    if (mood === 'angry') { ctx.moveTo(-34, -142); ctx.lineTo(-8, -132); ctx.moveTo(34, -142); ctx.lineTo(8, -132); ctx.moveTo(-16, -88); ctx.lineTo(16, -88); }
    else if (mood === 'worried') { ctx.moveTo(-34, -132); ctx.lineTo(-8, -140); ctx.moveTo(34, -132); ctx.lineTo(8, -140); ctx.arc(0, -82, 14, Math.PI + .4, -.4); }
    else ctx.arc(0, -100, 16, .2, Math.PI - .2);
    ctx.stroke();
  });
}

function bubble(str, x, y, w, k, col = '#fff', txt = C.ink) {
  if (k <= 0) return;
  withT(x, y, k, 0, () => {
    rr(-w / 2, -70, w, 140, 40); ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, 66); ctx.lineTo(90, 66); ctx.lineTo(60, 120); ctx.fill();
    text(str, 0, 4, 46, txt, { weight: 900 });
  });
}

function memberCard(w, t) {
  const h = w * .62;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  rr(-w / 2, -h / 2, w, h, w * .06); ctx.fillStyle = '#F4F6FB'; ctx.fill();
  ctx.shadowColor = 'transparent';
  rr(-w / 2, -h / 2, w, h * .32, w * .06); ctx.fillStyle = '#2D5BD8'; ctx.fill(); ctx.fillRect(-w / 2, -h / 2 + h * .18, w, h * .14);
  text('MEMBER', 0, -h / 2 + h * .16, h * .16, '#fff');
  ctx.beginPath(); ctx.arc(-w * .3, h * .12, h * .17, 0, 7); ctx.fillStyle = '#C9CFDB'; ctx.fill();
  for (let i = 0; i < 3; i++) { rr(-w * .08, h * (.0 + i * .12), w * .4 - i * 40, 14, 7); ctx.fillStyle = '#C9CFDB'; ctx.fill(); }
  ctx.restore();
}

const SCENES = {
  1(t, lt, d, L) {
    background(t, C.gold);
    combo(t, lt / .4);
    if (lt > .38 && lt < .7) { ctx.fillStyle = `rgba(255,240,200,${(.7 - lt) * 1.2})`; ctx.fillRect(0, 0, W, H); }
    // year counter races past while the price never moves
    const y0 = wordAt('1985'), yr = Math.round(lerp(1985, 2026, easeInOut(prog(t, y0 - .4, 1.4))));
    if (t > y0 - .4) withT(W / 2, 300, pop(t, y0 - .4, .3), 0, () => {
      rr(-230, -80, 460, 160, 26); ctx.fillStyle = '#fff'; ctx.fill();
      text(String(yr), 0, 6, 110, C.ink);
    });
    if (t > y0 + .8) withT(W / 2, 445, pop(t, y0 + .8, .3), 0, () => text('STILL $1.50', 0, 0, 72, C.gold2, { stroke: C.ink, strokeW: 12, glow: C.gold }));
    const sk = prog(t, wordAt('purpose'), .2);
    if (sk > 0) withT(W / 2, 1150, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('ON PURPOSE', C.red, sk));
  },
  2(t, lt, d, L) {
    background(t, t > wordAt('raise') ? C.red : null);
    person(300, 900, 1.05, '#2E3B5E', t > wordAt('founder') ? 'worried' : 'happy', t);
    withT(300, 680, 1, 0, () => text('CEO', 0, 0, 44, '#9AA6C8'));
    const f = pop(t, wordAt('founder'), .35);
    if (f > 0) { person(780, 900, 1.05 * f, '#4A2E5E', 'angry', t); withT(780, 680, f, 0, () => text('FOUNDER', 0, 0, 44, '#9AA6C8')); }
    // losing-money chart above the CEO
    const lm = prog(t, wordAt('losing'), .9);
    if (lm > 0 && t < wordAt('founder') + .3) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.shadowColor = C.red; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(170, 330); for (let i = 1; i <= 6 * lm; i++) ctx.lineTo(170 + i * 50, 330 + i * 30 + (i % 2) * 25); ctx.stroke(); ctx.restore();
      text('LOSING MONEY', 310, 270, 52, C.red, { stroke: C.ink, strokeW: 8 });
    }
    const bk = pop(t, wordAt('raise'), .3);
    if (bk > 0) withT(660, 400, bk, 0, () => {
      rr(-290, -110, 580, 220, 44); ctx.fillStyle = C.red; ctx.fill();
      ctx.beginPath(); ctx.moveTo(70, 106); ctx.lineTo(130, 106); ctx.lineTo(110, 170); ctx.fill();
      text('RAISE IT AND', 0, -45, 54, '#fff');
      if (t > wordAt('kill')) withT(0, 45, pop(t, wordAt('kill'), .25), 0, () => text("I'LL KILL YOU", 0, 0, 66, '#FFD23F', { stroke: C.ink, strokeW: 10 }));
    });
    if (t > wordAt('raise')) withT(430, 1150, 1, Math.sin(t * 4) * .05, () => hotDog(260));
  },
  3(t, lt, d, L) {
    background(t);
    const you = wordAt('you', T.lines[2].start);
    if (t < you) {
      withT(W / 2, 720, pop(lt, 0, .35), 0, () => hotDog(520));
      const x = prog(t, wordAt('product'), .3);
      if (x > 0) {
        ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(260, 560); ctx.lineTo(260 + 560 * x, 560 + 320 * x); ctx.stroke(); ctx.restore();
        text('NOT THE PRODUCT', W / 2, 1050, 72, '#fff', { stroke: C.ink, strokeW: 10 });
      }
    } else {
      withT(W / 2, 700, pop(t, you, .4), 0, () => drawBrain(200, 'neutral', t));
      withT(W / 2 + 230, 520, pop(t, you + .2, .3), .25, () => tag('YOU', 300, C.red, '#fff', Math.sin(t * 4) * .1));
      withT(W / 2, 1060, pop(t, you + .3, .35), -.04, () => text('THE PRODUCT', 0, 0, 100, C.gold2, { stroke: C.ink, strokeW: 14, glow: C.gold }));
    }
  },
  4(t, lt, d, L) {
    background(t, C.gold);
    withT(300, 560, pop(lt, 0, .35), 0, () => hotDog(300));
    const cheap = pop(t, wordAt('store'), .35);
    if (cheap > 0) {
      withT(760, 560, cheap, 0, () => text('🏬', 0, 0, 220, '#fff'));
      withT(760, 380, cheap, -.08, () => text('SO CHEAP!', 0, 0, 64, '#4BE38A', { stroke: C.ink, strokeW: 10 }));
    }
    const r = prog(t, wordAt('renewing'), .4);
    if (r > 0) {
      withT(W / 2, 1000, easeBack(r), 0, () => memberCard(420, t));
      ctx.save(); ctx.strokeStyle = C.gold2; ctx.lineWidth = 14; ctx.lineCap = 'round';
      const a = t * 4;
      ctx.beginPath(); ctx.arc(W / 2, 1000, 300, a, a + 4.5); ctx.stroke(); ctx.restore();
      text('RENEW ↻', W / 2, 1290, 60, C.gold2, { stroke: C.ink, strokeW: 10 });
    }
  },
  5(t, lt, d, L) {
    background(t, C.gold);
    pill("COSTCO'S PROFIT", 250, C.gold, prog(lt, .05, .3));
    const base = 1150, k = easeOut(prog(t, wordAt('memberships'), .9));
    ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 40;
    rr(180, base - 620 * k, 320, 620 * k, 24); ctx.fillStyle = C.gold; ctx.fill(); ctx.restore();
    rr(600, base - 220 * k, 320, 220 * k, 24); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
    text('MEMBERSHIPS', 340, base + 55, 46, '#fff', { stroke: C.ink, strokeW: 8 });
    text('EVERYTHING', 760, base + 40, 40, '#9AA6C8'); text('ELSE', 760, base + 85, 40, '#9AA6C8');
    if (t > wordAt('most')) withT(340, base - 620 * k - 70, pop(t, wordAt('most'), .3), 0, () => text('MOST', 0, 0, 80, C.gold2, { stroke: C.ink, strokeW: 12 }));
    withT(760, base - 220 * k - 60, k, 0, () => text('🌭', 0, 0, 90, '#fff'));
  },
  6(t, lt, d, L) {
    background(t, C.red);
    withT(260, 760, 1, 0, () => hotDog(320));
    for (let i = 0; i < 3; i++) withT(560 + i * 170, 780, pop(lt, .2 + i * .12, .3), 0, () => text(['🛒', '📺', '🥩'][i], 0, 0, 120, '#fff'));
    ctx.save(); ctx.strokeStyle = C.gold2; ctx.lineWidth = 10; ctx.setLineDash([20, 14]);
    ctx.beginPath(); ctx.moveTo(440, 760); ctx.lineTo(500 + 420 * easeOut(prog(lt, .1, .6)), 760); ctx.stroke(); ctx.restore();
    const sk = prog(t, wordAt('loss'), .2);
    if (sk > 0) withT(W / 2, 470, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('LOSS LEADER', C.red, sk));
  },
  7(t, lt, d, L) {
    background(t, C.gold);
    const q = pop(lt, .05, .35) * (1 - prog(t, wordAt('ask') - .1, .25));
    if (q > 0) withT(W / 2, 640, q, -.03, () => {
      text('TOO CHEAP?', 0, 0, 130, C.gold2, { stroke: C.ink, strokeW: 16, glow: C.gold });
      text('🤔', 0, 170, 130, '#fff');
    });
    const ask = pop(t, wordAt('ask'), .3) * (1 - prog(lt, d - .75, .25));
    if (ask > 0) withT(W / 2, 640, ask, 0, () => text("WHAT'S IT SELLING?", 0, 0, 84, '#fff', { stroke: C.ink, strokeW: 12 }));
    // rebuild frame 0 (combo mid-drop) so the loop restarts seamlessly
    const k = easeOut(prog(lt, d - .55, .5));
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; combo(t, 0); ctx.restore(); }
  },
};
