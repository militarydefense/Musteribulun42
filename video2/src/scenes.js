// Video 2 — "Why $9.99 Feels So Much Cheaper" (left-digit effect).
// Spliced into scene.html between the shared drawing kit and the caption/main code.

function drawDress(s = 1, color = '#FF4F7B') {
  ctx.save(); ctx.scale(s, s);
  // hanger
  ctx.strokeStyle = '#C9CFDB'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -250, 22, Math.PI, Math.PI * 2.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -228); ctx.lineTo(-150, -170); ctx.lineTo(150, -170); ctx.closePath(); ctx.stroke();
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(0, -180, 0, 260);
  g.addColorStop(0, color); g.addColorStop(1, '#B8264E');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-70, -180); ctx.quadraticCurveTo(0, -140, 70, -180); // neckline
  ctx.lineTo(95, -150); ctx.lineTo(75, -40); // bodice right
  ctx.quadraticCurveTo(170, 140, 200, 250); ctx.quadraticCurveTo(0, 285, -200, 250); // skirt
  ctx.quadraticCurveTo(-170, 140, -75, -40); ctx.lineTo(-95, -150); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-78, -55, 156, 22); // belt
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 6;
  for (const x of [-90, -30, 30, 90]) { ctx.beginPath(); ctx.moveTo(x * .5, -30); ctx.quadraticCurveTo(x * 1.1, 120, x * 1.6, 245); ctx.stroke(); }
  ctx.restore();
}

function drawTag(str, w, col = C.gold, txt = C.ink) {
  const h = w * .52;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2 + 30); ctx.lineTo(-w / 2 + h * .45, -h / 2); ctx.lineTo(w / 2 - 20, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, 20); ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, 20);
  ctx.lineTo(-w / 2 + h * .45, h / 2); ctx.lineTo(-w / 2, h / 2 - 30); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.arc(-w / 2 + h * .32, 0, h * .09, 0, 7); ctx.fillStyle = C.navy; ctx.fill();
  text(str, w * .1, 4, h * .52, txt);
  ctx.restore();
}

function crown(s) {
  ctx.save(); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, 30); ctx.lineTo(-70, -30); ctx.lineTo(-30, 0); ctx.lineTo(0, -45); ctx.lineTo(30, 0); ctx.lineTo(70, -30); ctx.lineTo(60, 30); ctx.closePath();
  ctx.fillStyle = C.gold2; ctx.shadowColor = C.gold; ctx.shadowBlur = 30; ctx.fill();
  ctx.restore();
}

// "$9.99" drawn per part so the left digit can be singled out. k: 0 = plain, 1 = 9 red / .99 faded
function bigPrice(x, y, size, k, t) {
  ctx.save();
  ctx.font = `900 ${size}px ${FONT}`;
  const parts = ['$', '9', '.99'];
  const ws = parts.map(p => ctx.measureText(p).width);
  let px = x - ws.reduce((a, b) => a + b) / 2;
  const boxes = [];
  parts.forEach((p, i) => {
    const cx = px + ws[i] / 2;
    let col = '#fff', a = 1, s = 1;
    if (i === 1) { col = k > .5 ? C.red : '#fff'; s = 1 + .18 * k + .03 * k * Math.sin(t * 8); }
    if (i === 2) a = 1 - .75 * k;
    ctx.globalAlpha = a;
    withT(cx, y, s, 0, () => text(p, 0, 0, size, col, { stroke: C.ink, strokeW: size * .08, glow: i === 1 && k > .5 ? C.red : null, glowBlur: 60 }));
    boxes.push([px, ws[i]]);
    px += ws[i];
  });
  ctx.restore();
  return boxes;
}

// big opening question, also rebuilt at the end of scene 8 for a seamless loop
function hookTitle(k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  text('WHY DID $39', W / 2, 200, 104, '#fff', { stroke: C.ink, strokeW: 16 });
  text('SELL MORE?', W / 2, 315, 118, C.gold2, { stroke: C.ink, strokeW: 18, glow: C.gold, glowBlur: 40 });
  ctx.restore();
}

const SCENES = {
  1(t, lt, d, L) {
    // frame 0 is already fully composed: in the feed the viewer decides within half a second
    background(t, C.pink);
    hookTitle(1);
    withT(W / 2, 600, 1 + .015 * Math.sin(t * 3), Math.sin(t * 2.2) * .04, () => drawDress(.85));
    withT(W / 2 - 250, 960, 1, -.12, () => drawTag('$34', 330, '#C9CFDB'));
    const win = lt > 1.7 ? 1.08 + .03 * Math.sin(t * 9) : 1 + .04 * Math.sin(t * 6);
    withT(W / 2 + 250, 960, win, .1, () => drawTag('$39', 330));
    const ck = pop(lt, 1.7, .35);
    if (ck > 0) { glowCircle(W / 2 + 250, 960, 300, C.gold, .35); withT(W / 2 + 250, 820, ck, .1, () => crown(1.1)); }
    const sk = prog(lt, 2.0, .2);
    if (sk > 0) withT(W / 2, 1180, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('MORE SALES', C.green, sk));
  },
  2(t, lt, d, L) {
    background(t);
    pill('MIT + CHICAGO STUDY', 250, C.gold, prog(lt, .05, .3));
    const cols = [['$34', 250, '#C9CFDB'], ['$39', 340, C.gold], ['$44', 210, '#C9CFDB']];
    const base = 1110;
    cols.forEach(([p, h, col], i) => {
      const x = 240 + i * 300, k = pop(lt, .15 + i * .12, .35);
      if (k <= 0) return;
      withT(x, 440, k * .42, 0, () => drawDress(1, i === 1 ? '#FF4F7B' : '#8C93A8'));
      withT(x, 610, k * .7, 0, () => drawTag(p, 260, col));
      const bh = h * easeOut(prog(lt, .9 + i * .1, 1.0));
      ctx.save(); if (i === 1) { ctx.shadowColor = C.gold; ctx.shadowBlur = 40; }
      rr(x - 90, base - bh, 180, bh, 20); ctx.fillStyle = i === 1 ? C.gold : 'rgba(255,255,255,.25)'; ctx.fill(); ctx.restore();
    });
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(110, base, 860, 6);
    text('SALES', W / 2, base + 50, 40, 'rgba(255,255,255,.7)', { weight: 800 });
    const ck = pop(lt, 2.0, .35);
    if (ck > 0) withT(540, base - 340 - 45, ck, 0, () => crown(.8));
    const items = [['Same dress', L[1] + .1], ['Higher price', L[1] + .9], ['More sales', L[1] + 1.7]];
    items.forEach(([s, at], i) => {
      const kk = pop(lt, at, .3); if (kk <= 0) return;
      withT(185 + i * 355, 1240, kk, 0, () => {
        rr(-170, -45, 340, 90, 45); ctx.fillStyle = i === 2 ? C.green : 'rgba(255,255,255,.14)'; ctx.fill();
        text(s, 0, 3, 38, '#fff', { weight: 800 });
      });
    });
  },
  3(t, lt, d, L) {
    const stopAt = L[1] + .55;
    const k = easeOut(prog(lt, stopAt, .3));
    background(t, k > .5 ? C.red : null);
    pill('LEFT → RIGHT', 250, C.blue, prog(lt, .05, .3));
    const boxes = bigPrice(W / 2, 640, 300, k, t);
    // reading beam sweeps from the left edge and freezes on the 9
    const sweep = easeInOut(prog(lt, .6, 1.6));
    const target = boxes[1][0] + boxes[1][1] / 2;
    const bx = lt < stopAt ? lerp(boxes[0][0] - 40, boxes[2][0] + boxes[2][1] * .6, sweep * (lt < L[1] ? 1 : 0)) : target;
    const beamX = lt >= L[1] ? lerp(bx, target, prog(lt, L[1], .5)) : bx;
    ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = C.blue;
    rr(beamX - 95, 470, 190, 340, 30); ctx.fill(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(300, 1000); ctx.lineTo(beamX, 820); ctx.stroke(); ctx.restore();
    const lazy = lt > 2.4;
    withT(250, 1060, pop(lt, .1, .4) * .85, 0, () => drawBrain(130, lazy ? 'sleepy' : 'neutral', t, { arms: false }));
    if (lazy) { const z = (lt * 1.1) % 1; ctx.globalAlpha = 1 - z; text('z', 360 + z * 50, 920 - z * 70, 50 + z * 30, '#fff'); ctx.globalAlpha = 1; }
    if (k > 0) withT(760, 1040, pop(lt, stopAt + .1, .35), -.05, () => drawStamp('STOP', C.red, 1));
  },
  4(t, lt, d, L) {
    background(t);
    const a = pop(lt, .25, .4), b = pop(lt, 1.7, .4);
    if (a > 0) withT(265, 760, a, -.04, () => {
      rr(-190, -260, 380, 520, 40); ctx.fillStyle = 'rgba(245,183,0,.15)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
      text('FEELS LIKE', 0, -180, 50, C.gold2);
      text('$9', 0, 30, 200, C.gold2, { stroke: C.ink, strokeW: 20, glow: C.gold, glowBlur: 40 });
      text('🧠', 0, 190, 80, '#fff');
    });
    if (b > 0) withT(815, 760, b, .04, () => {
      rr(-190, -260, 380, 520, 40); ctx.fillStyle = 'rgba(255,59,59,.15)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke();
      text('REALLY', 0, -180, 50, '#fff');
      text('$10', 0, 30, 180, '#fff', { stroke: C.ink, strokeW: 20 });
      text('🧾', 0, 190, 80, '#fff');
    });
    const ne = pop(lt, 1.2, .3);
    if (ne > 0) withT(W / 2, 760, ne, 0, () => text('≠', 0, 0, 160, C.red, { stroke: C.ink, strokeW: 14 }));
    pill('$9.99', 250, C.gold, prog(lt, .05, .3));
  },
  5(t, lt, d, L) {
    background(t, C.gold);
    const k = pop(lt, .2, .45);
    withT(W / 2, 540, k, -.04, () => {
      text('THE', 0, -170, 70, '#fff', { stroke: C.ink, strokeW: 10 });
      text('LEFT-DIGIT', 0, -40, 150, C.gold2, { stroke: C.ink, strokeW: 20, glow: C.gold, glowBlur: 50 });
      text('EFFECT', 0, 110, 150, '#fff', { stroke: C.ink, strokeW: 20 });
    });
    withT(W / 2, 1020, pop(lt, .5, .45), 0, () => drawBrain(150, 'happy', t, { raise: true, wave: true }));
    // little 9 orbiting the brain
    withT(W / 2 + Math.cos(t * 3) * 240, 1000 + Math.sin(t * 3) * 70, pop(lt, .8, .3), 0, () => text('9', 0, 0, 90, C.red, { stroke: C.ink, strokeW: 10 }));
  },
  6(t, lt, d, L) {
    background(t, C.red);
    pill('EVERYWHERE', 250, C.red, prog(lt, .05, .3));
    const rain = ['$2.99', '$7.99', '$14.99', '$0.99', '$49.99', '$5.99', '$29.99', '$199', '$3.99'];
    ctx.save(); ctx.beginPath(); ctx.rect(0, 310, W, 950); ctx.clip();
    for (let i = 0; i < 14; i++) {
      const y = ((lt * 520 + rnd(i + 9) * 1700) % 1700) - 150;
      ctx.save(); ctx.globalAlpha = lt > L[1] ? .3 : .85;
      withT(rnd(i + 2) * (W - 200) + 100, y, .5 + rnd(i + 4) * .3, (rnd(i) - .5) * .8, () => drawTag(rain[i % rain.length], 300, i % 3 ? '#E3E7EF' : C.gold));
      ctx.restore();
    }
    ctx.restore();
    const big = [['$4.99', 270, 560, -.12, L[1] + .05], ['$19.99', 810, 760, .1, L[1] + 1.05], ['$99.99', 400, 1000, -.05, L[1] + 2.2]];
    big.forEach(([s, x, y, r, at]) => { const k = pop(lt, at, .35); if (k > 0) withT(x, y, k, r, () => drawTag(s, 470, C.gold)); });
  },
  7(t, lt, d, L) {
    background(t, C.green);
    pill('THE FIX', 250, C.green, prog(lt, .05, .3));
    withT(W / 2, 600, pop(lt, 0, .45), 0, () => drawBrain(150, 'happy', t, { raise: true }));
    const r = easeOut(prog(lt, L[1], .6));
    if (lt > .4) {
      const k = pop(lt, .4, .35);
      withT(W / 2, 960, k, 0, () => {
        ctx.globalAlpha = 1 - .55 * r;
        text('$9.99', -230 - 40 * r, 0, 130, '#fff', { stroke: C.ink, strokeW: 14 });
        ctx.globalAlpha = 1;
        text('→', 40, 0, 120, C.gold2, { stroke: C.ink, strokeW: 12 });
        if (r > 0) withT(250, 0, easeBack(r), 0, () => text('$10', 0, 0, 160, C.green, { stroke: C.ink, strokeW: 16, glow: C.green, glowBlur: 40 }));
      });
    }
    const sk = prog(lt, L[1] + 1.5, .2);
    if (sk > 0) withT(W / 2, 1180, lerp(2.2, 1, easeOut(sk)), -.05, () => drawStamp('ALWAYS', C.green, sk));
  },
  8(t, lt, d, L) {
    background(t, C.pink);
    // rebuild the opening frame so the loop back to scene 1 feels continuous
    const q = pop(lt, .2, .4);
    withT(W / 2, 640, q * (1 - prog(lt, 1.9, .3)), 0, () => {
      drawTag('$_.99', 520, C.gold);
      text('?', 210, -150, 140, C.red, { stroke: C.ink, strokeW: 14 });
    });
    const dk = easeOut(prog(lt, 2.1, .6));
    if (dk > 0) {
      hookTitle(dk);
      withT(W / 2, lerp(-300, 600, dk), 1, Math.sin(t * 2.2) * .04, () => drawDress(.85));
      withT(W / 2 - 250, 960, pop(lt, 2.3, .3), -.12, () => drawTag('$34', 330, '#C9CFDB'));
      withT(W / 2 + 250, 960, pop(lt, 2.45, .3), .1, () => drawTag('$39', 330));
    }
    // silent follow CTA (the voice keeps looping instead of saying "follow")
    const f = pop(lt, .6, .35) * (1 - prog(lt, 2.0, .3));
    if (f > 0) withT(W / 2, 1180, f * (1 + .04 * Math.sin(t * 6)), 0, () => {
      rr(-210, -50, 420, 100, 50); ctx.fillStyle = '#FF0033'; ctx.fill();
      text('FOLLOW 🧠', 0, 3, 50, '#fff');
    });
  },
};
