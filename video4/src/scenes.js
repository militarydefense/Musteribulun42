// Video 4 — "$5 a Day → $206,742" (two brothers, compound interest). Light/warm palette test.
// Spliced into scene.html between the shared drawing kit and the caption/main code.

const INK = '#1B2440', GRASS = '#7CC36E', CREAM = '#FFF4DF';
const RATE = .08, PER_YEAR = 5 * 365;
const fv = y => PER_YEAR * ((Math.pow(1 + RATE, y) - 1) / RATE);
const money = v => '$' + Math.round(v).toLocaleString('en-US');

function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

function glowSoft(x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

function bgLight(t, tint) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FFF8EA'); g.addColorStop(.6, '#FCE7C4'); g.addColorStop(1, '#F6D9A8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (tint) glowSoft(W / 2, 700, 700, tint, .25);
  // soft sun + grass strip the characters stand on
  glowSoft(900, 420, 240, '255,200,80', .55);
  ctx.beginPath(); ctx.arc(900, 420, 70, 0, 7); ctx.fillStyle = '#FFD36B'; ctx.fill();
  ctx.fillStyle = GRASS; ctx.fillRect(0, 1095, W, 140);
  ctx.fillStyle = '#69B05C'; ctx.fillRect(0, 1095, W, 14);
  ctx.fillStyle = '#E9C48C'; ctx.fillRect(0, 1235, W, H - 1235);
}

function inkText(str, x, y, size, col = INK, opts = {}) {
  text(str, x, y, size, col, Object.assign({ stroke: '#fff', strokeW: size * .14 }, opts));
}

function lightPill(str, y, col, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  ctx.font = `900 46px ${FONT}`; const w = ctx.measureText(str).width + 80;
  withT(W / 2, y, lerp(.6, 1, easeBack(clamp(k))), 0, () => {
    rr(-w / 2, -42, w, 84, 42); ctx.fillStyle = col; ctx.fill();
    text(str, 0, 3, 46, '#fff');
  });
  ctx.restore();
}

// simple flat character; mood: happy | sad | neutral
function brother(x, y, s, shirt, mood, t, seed = 0) {
  const b = Math.sin(t * 3 + seed) * 4;
  withT(x, y + b, s, 0, () => {
    ctx.fillStyle = '#2B3550';
    rr(-38, 60, 30, 110, 12); ctx.fill(); rr(8, 60, 30, 110, 12); ctx.fill();
    rr(-62, -60, 124, 140, 46); ctx.fillStyle = shirt; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -120, 58, 0, 7); ctx.fillStyle = '#F2C6A0'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -138, 60, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = '#3A2A20'; ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(-20, -118, 6, 0, 7); ctx.arc(20, -118, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    if (mood === 'happy') ctx.arc(0, -102, 18, .2, Math.PI - .2);
    else if (mood === 'sad') ctx.arc(0, -82, 16, Math.PI + .4, -.4);
    else { ctx.moveTo(-12, -92); ctx.lineTo(12, -92); }
    ctx.stroke();
  });
}

function nameTag(str, x, y, col) {
  ctx.font = `900 40px ${FONT}`; const w = ctx.measureText(str).width + 44;
  rr(x - w / 2, y - 30, w, 60, 30); ctx.fillStyle = col; ctx.fill();
  text(str, x, y + 2, 40, '#fff');
}

function paperCup(x, y, s, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, -50); ctx.lineTo(34, -50); ctx.lineTo(26, 50); ctx.lineTo(-26, 50); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = '#C9B79C'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#9C6B3F'; ctx.fillRect(-31, -12, 62, 26);
  rr(-40, -62, 80, 16, 6); ctx.fillStyle = '#5A3A22'; ctx.fill();
  ctx.restore();
}

function cashStack(x, base, h) {
  const n = Math.floor(h / 22);
  for (let i = 0; i < n; i++) withT(x + Math.sin(i * 1.7) * 6, base - i * 22, .62, 0, () => drawBill(240));
}

function yearBadge(y, k) {
  if (k <= 0) return;
  withT(W / 2, 420, k, 0, () => {
    rr(-170, -70, 340, 140, 30); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    rr(-170, -70, 340, 50, 24); ctx.fillStyle = C.red; ctx.fill(); ctx.fillRect(-170, -40, 340, 20);
    text('YEAR', 0, -45, 34, '#fff');
    text(String(Math.round(y)), 0, 25, 80, INK);
  });
}

function hookTitle(k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  inkText('$5 A DAY', W / 2, 205, 118);
  inkText('→ $206,742?', W / 2, 330, 118, '#1E9E5A', { glow: 'rgba(30,158,90,.5)', glowBlur: 30 });
  ctx.restore();
}

function hookScene(t, k) {
  withT(0, 0, 1, 0, () => {
    ctx.globalAlpha = clamp(k);
    brother(300, 930, 1.05, '#F08A3C', 'neutral', t, 0);
    brother(780, 930, 1.05, '#3C7DF0', 'neutral', t, 2);
    nameTag('MAX', 300, 700, '#F08A3C'); nameTag('LEO', 780, 700, '#3C7DF0');
    withT(300, 590 - Math.abs(Math.sin(t * 3)) * 16, 1, 0, () => { drawCoin(52); });
    withT(780, 590 - Math.abs(Math.sin(t * 3 + 1)) * 16, 1, 0, () => { drawCoin(52); });
    ctx.globalAlpha = 1;
  });
}

const SCENES = {
  1(t, lt, d, L) {
    bgLight(t);
    hookTitle(1);
    hookScene(t, 1);
    const k = pop(t, wordAt('same', T.lines[0].start + 1.2), .3);
    if (k > 0) withT(W / 2, 600, k, 0, () => inkText('=', 0, 0, 110, C.red));
  },
  2(t, lt, d, L) {
    bgLight(t);
    const cof = wordAt('coffee'), inv = wordAt('invests');
    brother(300, 930, 1.05, '#F08A3C', t > cof ? 'happy' : 'neutral', t, 0);
    brother(780, 930, 1.05, '#3C7DF0', t > inv ? 'happy' : 'neutral', t, 2);
    nameTag('MAX', 300, 700, '#F08A3C'); nameTag('LEO', 780, 700, '#3C7DF0');
    // Max: coin -> coffee
    const a = easeInOut(prog(t, cof - .2, .5));
    if (a < 1) withT(300, lerp(590, 820, a), 1 - a * .5, 0, () => drawCoin(52));
    if (t > cof) { withT(400, 860, pop(t, cof + .1, .35), -.1, () => text('☕', 0, 0, 130, '#fff')); inkText('SPEND', 300, 470, 72, '#E06A1E'); }
    // Leo: coin -> piggy bank, sapling sprouts
    const b = easeInOut(prog(t, inv - .2, .5));
    if (b < 1) withT(780, lerp(590, 820, b), 1 - b * .5, 0, () => drawCoin(52));
    if (t > inv) {
      withT(890, 900, pop(t, inv + .1, .35), 0, () => text('🐷', 0, 0, 130, '#fff'));
      withT(670, 1050 - 40 * easeOut(prog(t, inv + .6, 1)), pop(t, inv + .5, .35), 0, () => text('🌱', 0, 0, 90, '#fff'));
      inkText('INVEST', 780, 470, 72, '#1E9E5A');
    }
  },
  3(t, lt, d, L) {
    bgLight(t, '255,211,107');
    lightPill('ONE YEAR', 250, C.red, prog(lt, .05, .3));
    // day counter
    const day = Math.max(1, Math.round(365 * easeInOut(prog(lt, .2, 2.4))));
    withT(W / 2, 560, pop(lt, .1, .35), 0, () => {
      rr(-190, -150, 380, 300, 34); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      rr(-190, -150, 380, 80, 30); ctx.fillStyle = C.red; ctx.fill(); ctx.fillRect(-190, -100, 380, 30);
      text('DAY', 0, -110, 46, '#fff'); text(String(day), 0, 45, 130, INK);
    });
    // equation types itself in
    const parts = [['$5', INK], ['×', C.red], ['365', INK], ['=', C.red], ['$1,825', '#1E9E5A']];
    const st = [.3, .7, 1.0, 1.9, 2.2];
    ctx.font = `900 96px ${FONT}`;
    const ws = parts.map(p => ctx.measureText(p[0]).width + 28);
    let x = W / 2 - ws.reduce((a, b) => a + b) / 2;
    parts.forEach(([s, col], i) => {
      const k = pop(lt, st[i], .3);
      if (k > 0) withT(x + ws[i] / 2, 900, k, 0, () => inkText(s, 0, 0, 96, col));
      x += ws[i];
    });
    if (lt > 2.4) withT(W / 2, 1040, pop(lt, 2.4, .3), 0, () => inkText('PER YEAR', 0, 0, 56, '#1E9E5A'));
  },
  4(t, lt, d, L) {
    bgLight(t);
    const y = lt < L[1] ? 10 * easeInOut(prog(lt, .2, 3.2)) : 10 + 10 * easeInOut(prog(lt, L[1] - .1, 1.1));
    yearBadge(y, pop(lt, 0, .35));
    // Max: pile of empty cups grows with the years
    const cups = Math.floor(y * 1.4);
    for (let i = 0; i < cups; i++) paperCup(70 + (i % 5) * 52, 1080 - Math.floor(i / 5) * 62, .65);
    brother(390, 990, .8, '#F08A3C', 'sad', t, 0); nameTag('MAX', 390, 810, '#F08A3C');
    // Leo: cash stack + live counter
    cashStack(680, 1060, 40 + Math.min(fv(y) / 83516 * 330, 400));
    brother(880, 990, .8, '#3C7DF0', 'happy', t, 2); nameTag('LEO', 880, 810, '#3C7DF0');
    withT(760, 590, 1, 0, () => inkText(money(fv(y)), 0, 0, 84, '#1E9E5A'));
    inkText('*8% avg. yearly return · illustrative', W / 2, 1290, 30, '#6B5B45', { weight: 700 });
  },
  5(t, lt, d, L) {
    bgLight(t, '124,240,165');
    const y = 20 + 10 * easeInOut(prog(lt, 0, 1.2));
    yearBadge(y, 1);
    for (let i = 0; i < 30; i++) paperCup(70 + (i % 5) * 52, 1080 - Math.floor(i / 5) * 62, .65);
    brother(390, 990, .8, '#F08A3C', 'sad', t, 0); nameTag('MAX', 390, 810, '#F08A3C');
    cashStack(680, 1060, 40 + Math.min(fv(y) / 83516 * 330, 400));
    brother(880, 990, .8, '#3C7DF0', 'happy', t, 2); nameTag('LEO', 880, 810, '#3C7DF0');
    const big = lt > 1.2 ? 1 + .04 * Math.sin(t * 7) : 1;
    withT(760, 590, big, 0, () => inkText(money(fv(y)), 0, 0, 92, '#1E9E5A', { glow: 'rgba(30,158,90,.6)', glowBlur: 30 }));
    if (lt > L[1]) {
      withT(250, 560, pop(lt, L[1] + .3, .35), -.05, () => {
        inkText(money(PER_YEAR * 30), 0, -40, 70, C.red);
        inkText('SPENT', 0, 40, 56, C.red);
      });
      const sk = prog(t, wordAt('nothing'), .2);
      if (sk > 0) withT(270, 1180, lerp(2.2, 1, easeOut(sk)), -.08, () => drawStamp('$0 LEFT', C.red, sk));
    }
    inkText('*8% avg. yearly return · illustrative', W / 2, 1290, 30, '#6B5B45', { weight: 700 });
  },
  6(t, lt, d, L) {
    bgLight(t, '255,211,107');
    lightPill('COMPOUND INTEREST', 250, '#1E9E5A', prog(lt, .05, .3));
    // money tree: each coin spawns two more
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const n = 1 << r, k = pop(lt, .3 + r * .75, .35);
      if (k <= 0) continue;
      for (let i = 0; i < n; i++) {
        const x = W / 2 + (i - (n - 1) / 2) * (900 / Math.max(n, 2)) * (r ? 1 : 0), y = 460 + r * 175;
        if (r) {
          const px = W / 2 + (Math.floor(i / 2) - ((n / 2) - 1) / 2) * (900 / Math.max(n / 2, 2)) * (r > 1 ? 1 : 0), py = 460 + (r - 1) * 175;
          ctx.strokeStyle = 'rgba(27,36,64,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px, py + 40); ctx.lineTo(x, y - 40); ctx.stroke();
        }
        withT(x, y, k * (1 - r * .12), 0, () => drawCoin(56));
      }
    }
    if (lt > 3.2) withT(W / 2, 1180, pop(lt, 3.2, .3), 0, () => inkText('MONEY → MORE MONEY', 0, 0, 64, '#1E9E5A'));
  },
  7(t, lt, d, L) {
    bgLight(t, '255,211,107');
    const a = pop(t, wordAt('money', T.lines[9].start), .35), b = pop(t, wordAt('years'), .35);
    if (a > 0) withT(W / 2, 520, a, -.03, () => {
      inkText('MORE MONEY', 0, 0, 104, '#8C7A62');
      ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-330, 10); ctx.lineTo(330, -10); ctx.stroke();
    });
    if (b > 0) withT(W / 2, 760, b, .03, () => inkText('MORE YEARS', 0, 0, 120, '#1E9E5A', { glow: 'rgba(30,158,90,.5)', glowBlur: 30 }));
    withT(W / 2, 1000, pop(lt, .1, .35), Math.sin(t * 2) * .2, () => text('⏳', 0, 0, 150, '#fff'));
  },
  8(t, lt, d, L) {
    // "which brother are you?" -> rebuild the opening frame for a seamless loop
    bgLight(t);
    const q = pop(lt, .05, .35) * (1 - prog(lt, 1.0, .25));
    if (q > 0) withT(W / 2, 620, q, -.03, () => {
      inkText('WHICH', 0, -120, 120); inkText('BROTHER', 0, 0, 120, '#E06A1E'); inkText('ARE YOU?', 0, 120, 120);
    });
    const f = pop(lt, .3, .3) * (1 - prog(lt, 1.0, .25));
    if (f > 0) withT(W / 2, 1180, f, 0, () => { rr(-210, -50, 420, 100, 50); ctx.fillStyle = '#FF0033'; ctx.fill(); text('FOLLOW 🧠', 0, 3, 50, '#fff'); });
    const k = easeOut(prog(lt, 1.05, .5));
    if (k > 0) { hookTitle(k); hookScene(t, k); }
  },
};
