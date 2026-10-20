// Off The Books — Part 1 "The Number Is a Lie".
// Image shots use the AI stills in img/, info shots are drawn on ledger paper, cards are silent beats.

loadImages(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8a', 's8b', 's8c', 's9', 's10', 's11', 's12', 's13', 's14']);
const NO_CAPTION = new Set(['title', 'i1', 'i2', 'i3', 'rule', 'day', 'stand', 'cta']);

// a still with a slow camera move from cam a to cam b over the shot
const still = (name, a, b, o = {}) => ({
  img: true, vig: o.vig,
  draw(t, lt, dur) {
    const k = easeInOut(clamp(lt / Math.max(dur, .1)));
    let cam = camAt(a, b, k);
    let dx = 0, dy = 0;
    if (o.shake) { const s = o.shake(t); dx = Math.sin(t * 71) * 14 * s; dy = Math.cos(t * 53) * 10 * s; }
    if (o.freeze !== undefined && t >= o.freeze()) cam = camAt(a, b, easeInOut(clamp((o.freeze() - (t - lt)) / dur)));
    drawImg(name, cam, { dx, dy, filter: o.filter ? o.filter(t) : undefined });
    if (o.after) o.after(t, lt, dur);
  },
});

// ---- cards ----
function navyBg(glowY = 900) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, glowY, 0, W / 2, glowY, 900);
  g.addColorStop(0, 'rgba(245,197,24,.16)'); g.addColorStop(1, 'rgba(245,197,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const titleCard = {
  noPunch: true,
  draw(t, lt) {
    navyBg(960);
    const a = easeOut(prog(lt, 0, .3));
    mono('NOBODY CAN KNOW', W / 2, 700, 30, C.grey, { spacing: 10, alpha: a });
    text('PART 1', W / 2, 800, 64, C.white, { alpha: a, spacing: 4 });
    withT(W / 2, 950, lerp(1.15, 1, easeOut(prog(lt, .15, .35))), 0, () => text('THE NUMBER', 0, 0, 132, C.white, { alpha: prog(lt, .15, .2) }));
    withT(W / 2, 1100, pop(lt, .45, .4), -.02, () => text('IS A LIE', 0, 0, 150, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
    mono('OFF THE BOOKS', W / 2, 1640, 26, 'rgba(255,255,255,.4)', { spacing: 8 });
  },
};
const dayCard = { noPunch: true, draw(t, lt) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('DAY 2', W / 2, H / 2, 170, C.white, { alpha: easeOut(prog(lt, 0, .12)) }); } };
const ruleCard = {
  noPunch: true,
  draw(t, lt) {
    navyBg(1000);
    const g = pop(t, at('rule', 'rule'), .3);
    if (g > 0) withT(W / 2, 760, g, 0, () => {
      ctx.font = `700 34px ${MONO}`; rr(-120, -34, 240, 68, 10); ctx.fillStyle = C.gold; ctx.fill();
      mono('RULE 1', 0, 2, 34, C.navy, { weight: 700, spacing: 6 });
    });
    const a = easeOut(prog(t, at('rule', 'sign'), .25)), b = easeOut(prog(t, at('rule', 'tell'), .25));
    text('Sign the back.', W / 2, 960 + (1 - a) * 30, 112, C.white, { alpha: a });
    text('Tell no one.', W / 2, 1110 + (1 - b) * 30, 112, C.gold, { alpha: b });
  },
};
const standCard = {
  noPunch: true,
  draw(t, lt) {
    ledger('DAY 2 · WHERE YOU STAND');
    const rows = [
      ['CASH AFTER TAX (EST.)', v => usd(v), 13860000, C.ink],
      ['CLAIMED', v => usd(v), 0, C.ink],
      ['EXPOSED', v => Math.round(v) + '%', 27, '#B8860B'],
    ];
    rows.forEach(([label, f, val, col], i) => {
      const s = .15 + i * .45, k = easeOut(prog(lt, s, .3));
      const y = 560 + i * 272;
      mono(label, 170, y, 30, C.ink2, { align: 'left', alpha: k, spacing: 4 });
      text(f(count(lt, s, .7, 0, val)), 170, y + 96, 104, col, { align: 'left', alpha: k });
      if (label === 'EXPOSED') {
        ctx.save(); ctx.globalAlpha = k;
        rr(170, y + 170, 740, 22, 11); ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fill();
        rr(170, y + 170, Math.max(22, 740 * count(lt, s, .7, 0, .27)), 22, 11); ctx.fillStyle = C.gold; ctx.fill();
        ctx.restore();
      }
    });
    mono('Spent so far: $0', 170, 1420, 34, C.ink, { align: 'left', alpha: easeOut(prog(lt, 1.6, .3)), weight: 700, spacing: 2 });
  },
};
const ctaCard = {
  noPunch: true,
  draw(t, lt) {
    navyBg(900);
    mono('NOBODY CAN KNOW', W / 2, 640, 30, C.grey, { spacing: 10, alpha: easeOut(prog(lt, 0, .3)) });
    text('PART 2', W / 2, 790, 150, C.white, { alpha: easeOut(prog(lt, .05, .3)) });
    withT(W / 2, 950, pop(lt, .25, .4), 0, () => text('TOMORROW', 0, 0, 150, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
    const b = easeOut(prog(lt, .7, .3));
    text('Comment QUIT or STAY.', W / 2, 1150, 60, C.white, { alpha: b, weight: 800 });
    text('The majority writes Part 2.', W / 2, 1235, 46, C.grey, { alpha: b, weight: 600 });
    // the two buttons
    [['QUIT', 330], ['STAY', 750]].forEach(([s, x], i) => {
      const k = pop(lt, 1.0 + i * .15, .35);
      if (k > 0) withT(x, 1420, k, 0, () => { rr(-170, -62, 340, 124, 62); ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke(); text(s, 0, 4, 64, C.gold); });
    });
  },
};

// ---- ledger info screens ----
const info1 = {
  draw(t, lt) {
    ledger('PROBLEM 1 · THE JACKPOT');
    const tPaid = at('i1', 'paid'), tToday = at('i1', 'today'), tLess = at('i1', 'less'), tHalf = at('i1', 'half');
    const collapse = easeInOut(prog(t, tToday, .6));
    // headline number
    const big = count(t, tLess - .1, .9, 50e6, 22e6);
    withT(W / 2, 560, pop(lt, 0, .35), 0, () => text(usd(big), 0, 0, 118, C.ink));
    mono(collapse < .5 ? 'ADVERTISED JACKPOT' : 'CASH OPTION', W / 2, 460, 30, C.ink2, { spacing: 5 });
    // 30 yearly payments that collapse into one lump
    for (let i = 0; i < 30; i++) {
      const col = i % 6, row = Math.floor(i / 6);
      const appear = easeOut(prog(t, tPaid + i * .035, .2));
      if (appear <= 0) continue;
      const gx = 240 + col * 120, gy = 760 + row * 130;
      const x = lerp(gx, W / 2, collapse), y = lerp(gy, 1010, collapse);
      const w = lerp(96, 520 / 1.4, collapse), h = lerp(104, 300 / 1.6, collapse);
      ctx.save(); ctx.globalAlpha = appear * (collapse > 0 && i > 0 ? 1 - collapse : 1);
      rr(x - w / 2, y - h / 2, w, h, 10); ctx.fillStyle = i % 2 ? '#3E8E5A' : '#4AA368'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#2A6B41'; ctx.stroke();
      if (collapse < .3) mono(`Y${i + 1}`, x, y, 26, 'rgba(255,255,255,.85)', { weight: 700, alpha: 1 - collapse * 3 });
      ctx.restore();
    }
    if (collapse < .5) mono('PAID OVER 30 YEARS', W / 2, 1450, 34, C.ink, { weight: 700, alpha: easeOut(prog(t, tPaid + .8, .3)) * (1 - collapse * 2) });
    if (collapse > .5) text('ALL TODAY', W / 2, 1010, 64, C.white, { alpha: (collapse - .5) * 2 });
    stamp('≈ 44%', W / 2 + 230, 1240, 92, '#B8860B', pop(t, tHalf, .3), -.08);
    mono('Mega Millions cash value, $50M jackpot · Jul 2026', W / 2, 1600, 22, C.ink2, { alpha: .8, spacing: 1 });
  },
};
const info2 = {
  draw(t, lt) {
    ledger('PROBLEM 1 · THE TAX');
    const tIrs = at('i2', 'irs'), t24 = at('i2', '24'), tIsnt = at('i2', 'isnt'), t37 = at('i2', '37');
    mono('CASH OPTION', W / 2, 460, 30, C.ink2, { spacing: 5 });
    let v = 22e6;
    v = count(t, tIrs + .2, .8, v, 22e6 * .76);
    v = count(t, t37, .9, v, 22e6 * .63);
    const red = prog(t, tIrs + .2, .8) > 0 && prog(t, tIrs + .2, .8) < 1 || (prog(t, t37, .9) > 0 && prog(t, t37, .9) < 1);
    withT(W / 2, 560, pop(lt, 0, .35), 0, () => text(usd(v), 0, 0, 118, red ? C.red : C.ink));
    // arrow
    const a = easeOut(prog(t, tIrs, .3));
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(W / 2, 680); ctx.lineTo(W / 2, 800); ctx.moveTo(W / 2 - 34, 766); ctx.lineTo(W / 2, 800); ctx.lineTo(W / 2 + 34, 766); ctx.stroke(); ctx.restore();
    mono('FEDERAL WITHHOLDING', W / 2, 880, 30, C.ink2, { spacing: 5, alpha: a });
    // 24% then struck through, 37% replaces it
    const s24 = pop(t, t24 - .3, .35);
    if (s24 > 0) withT(W / 2, 1040, s24, -.05, () => {
      text('24%', 0, 0, 200, '#B8860B');
      const k = easeOut(prog(t, tIsnt, .3));
      if (k > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, 10); ctx.lineTo(-200 + 400 * k, -10); ctx.stroke(); }
    });
    const s37 = pop(t, t37, .35);
    if (s37 > 0) {
      withT(W / 2, 1280, s37, .04, () => text('37%', 0, 0, 220, C.red));
      mono('TOP FEDERAL RATE', W / 2, 1420, 32, C.ink, { weight: 700, alpha: easeOut(prog(t, t37 + .2, .3)) });
    }
    mono('IRS: 24% withheld on prizes over $5,000 · top rate 37%', W / 2, 1600, 22, C.ink2, { alpha: .8, spacing: 1 });
  },
};
// US tile-grid map. Gold = states that let winners stay anonymous (some only above a prize size).
const TILES = { AK: [0, 0], ME: [10, 0], VT: [9, 1], NH: [10, 1], WA: [0, 2], ID: [1, 2], MT: [2, 2], ND: [3, 2], MN: [4, 2], IL: [5, 2], WI: [6, 2], MI: [7, 2], NY: [8, 2], RI: [9, 2], MA: [10, 2],
  OR: [0, 3], NV: [1, 3], WY: [2, 3], SD: [3, 3], IA: [4, 3], IN: [5, 3], OH: [6, 3], PA: [7, 3], NJ: [8, 3], CT: [9, 3],
  CA: [0, 4], UT: [1, 4], CO: [2, 4], NE: [3, 4], MO: [4, 4], KY: [5, 4], WV: [6, 4], VA: [7, 4], MD: [8, 4], DE: [9, 4],
  AZ: [1, 5], NM: [2, 5], KS: [3, 5], AR: [4, 5], TN: [5, 5], NC: [6, 5], SC: [7, 5], DC: [8, 5],
  OK: [3, 6], LA: [4, 6], MS: [5, 6], AL: [6, 6], GA: [7, 6], HI: [0, 7], TX: [3, 7], FL: [8, 7] };
const ANON = new Set(['AZ', 'DE', 'GA', 'KS', 'MD', 'MT', 'NJ', 'ND', 'OH', 'TX', 'VA', 'WV', 'WY', 'MN', 'OR']);
const info3 = {
  draw(t, lt) {
    ledger('PROBLEM 2 · PUBLIC RECORD');
    text('CAN YOU STAY', W / 2, 470, 84, C.ink);
    text('ANONYMOUS?', W / 2, 570, 84, C.ink);
    const sz = 78, gap = 8, x0 = W / 2 - (11 * (sz + gap) - gap) / 2, y0 = 700;
    const tGold = at('i3', 'decides'), tPin = at('i3', 'bought');
    Object.entries(TILES).forEach(([st, [c, r]], i) => {
      const k = easeOut(prog(lt, .1 + (c + r) * .03, .25));
      if (k <= 0) return;
      const x = x0 + c * (sz + gap), y = y0 + r * (sz + gap);
      const gold = ANON.has(st) && t >= tGold - .4 + rnd(i) * .5;
      withT(x + sz / 2, y + sz / 2, k, 0, () => {
        rr(-sz / 2, -sz / 2, sz, sz, 10); ctx.fillStyle = gold ? C.gold : '#CFCAB9'; ctx.fill();
        mono(st, 0, 2, 24, gold ? C.navy : '#6E6A5E', { weight: 700, spacing: 0 });
      });
    });
    // legend
    const lg = easeOut(prog(t, tGold, .3));
    ctx.save(); ctx.globalAlpha = lg;
    rr(170, 1440, 40, 40, 8); ctx.fillStyle = C.gold; ctx.fill(); mono('Anonymity allowed*', 230, 1461, 28, C.ink, { align: 'left', spacing: 1 });
    rr(170, 1505, 40, 40, 8); ctx.fillStyle = '#CFCAB9'; ctx.fill(); mono('Your name goes public', 230, 1526, 28, C.ink, { align: 'left', spacing: 1 });
    ctx.restore();
    // pin on the state where the ticket was sold
    const p = pop(t, tPin, .4);
    if (p > 0) {
      const [c, r] = TILES.CA, x = x0 + c * (sz + gap) + sz / 2, y = y0 + r * (sz + gap) + sz / 2;
      withT(x, y - (1 - clamp(p)) * 200, 1, 0, () => {
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, -64, 30, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-22, -46); ctx.lineTo(0, 0); ctx.lineTo(22, -46); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -64, 11, 0, 7); ctx.fill();
      });
      // label in the empty top rows, with a leader line down to the pin
      const lx = x0 + (sz + gap) * 1.2, ly = y0 + 40, a = clamp(p);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(lx + 30, ly + 32); ctx.lineTo(x, y - 100); ctx.stroke(); ctx.restore();
      withT(lx, ly, a, 0, () => {
        rr(0, -34, 420, 68, 10); ctx.fillStyle = C.navy; ctx.fill();
        mono('TICKET SOLD HERE', 210, 2, 28, C.gold, { weight: 700, spacing: 2 });
      });
    }
    mono('*Some only above a prize size. The state where the ticket', W / 2, 1610, 21, C.ink2, { spacing: .5 });
    mono('was sold decides. Check your state lottery.', W / 2, 1642, 21, C.ink2, { spacing: .5 });
  },
};

// ---- the episode ----
const SHOTS = {
  s1: still('s1', [.5, .55, 1.0], [.5, .62, 1.12]),
  s2: still('s2', [.5, .5, 1.05], [.55, .45, 1.22]),
  s3: still('s3', [.5, .45, 1.15], [.5, .42, 1.02]),
  title: titleCard,
  s4: still('s4', [.5, .6, 1.0], [.6, .45, 1.15]),
  i1: info1,
  i2: info2,
  s5: still('s5', [.5, .45, 1.08], [.5, .42, 1.2], { shake: t => clamp(1 - Math.abs(t - at('s5', '14') - .2) * 2) }),
  s6: still('s6', [.55, .3, 1.25], [.5, .5, 1.0]),
  i3: info3,
  rule: ruleCard,
  day: dayCard,
  s7: still('s7', [.4, .55, 1.12], [.45, .6, 1.0]),
  s8: {
    img: true,
    draw(t, lt, dur) {
      const t2 = at('s8', 'same', 1) - .1, t3 = at('s8', 'same', 2) - .1;
      const [n, s0] = t < t2 ? ['s8a', S('s8')] : t < t3 ? ['s8b', t2] : ['s8c', t3];
      const k = clamp((t - s0) / 1.2);
      drawImg(n, camAt([.5, .5, 1.12], [.5, .5, 1.0], easeOut(k)));
    },
  },
  s9: still('s9', [.5, .5, 1.0], [.55, .4, 1.15], {
    freeze: () => at('s9', 'except') - .05,
    filter: t => t >= at('s9', 'except') - .05 ? 'grayscale(.85) contrast(1.15) brightness(.85)' : undefined,
  }),
  s10: still('s10', [.72, .25, 1.35], [.6, .45, 1.0]),
  s11: still('s11', [.5, .4, 1.0], [.5, .3, 1.18], { vig: .65 }),
  stand: standCard,
  s12: still('s12', [.5, .45, 1.0], [.6, .55, 1.12]),
  s13: still('s13', [.5, .5, 1.12], [.45, .45, 1.0], { vig: .35 }),
  s14: still('s14', [.5, .5, 1.0], [.6, .45, 1.15], { vig: .7 }),
  cta: ctaCard,
};

// ---- HUD ----
const HUD_ON = new Set(['s4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14']);
function HUD(t, id) {
  if (!HUD_ON.has(id)) return null;
  const k = id === 's4' ? easeOut(prog(t, S('s4'), .35)) : 1;
  const c0 = at('s5', '50'), c1 = at('s5', '14') + .3;
  const cash = count(t, c0, c1 - c0, 50e6, 13.86e6, easeOut);
  const cashFlash = t > c0 && t < c1 + .5 ? .6 + .4 * Math.sin(t * 20) : 0;
  const e1 = at('s11', 'office'), e2 = at('s11', 'there');
  let exposed = count(t, e1, .5, 0, 12);
  exposed = Math.max(exposed, count(t, e2, .5, 12, 27));
  if (t < e1) exposed = 0;
  const expFlash = (t > e1 && t < e1 + .6) || (t > e2 && t < e2 + .8) ? 1 : 0;
  const label = id === 's4' || id === 's5' ? 'PROBLEM 1' : id === 's6' ? 'PROBLEM 2' : 'DAY 2';
  return { k, cash, spent: 0, exposed, label, cashFlash, expFlash };
}

// ---- sound cues for mix.py ----
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1) => ev.push({ name, t: +t.toFixed(3), gain });
  for (const s of shotList()) if (s.s > 0 && !['day'].includes(s.id)) add('whoosh', s.s - .12, .8);
  add('drone', 0, 1);
  add('drawer', S('s2') + .1, .9);
  add('hit', at('s3', 'starts'), 1);
  add('boom', S('title'), 1);
  add('hit', at('s4', 'problem'), .7);
  for (let i = 0; i < 30; i += 3) add('tick', at('i1', 'paid') + i * .035, .5);
  add('swoosh_up', at('i1', 'today'), .8);
  add('count', at('i1', 'less') - .1, .9);
  add('stamp', at('i1', 'half'), 1);
  add('cash_drop', at('i2', 'irs') + .2, 1);
  add('stamp', at('i2', '24') - .3, .8);
  add('scratch', at('i2', 'isnt'), .9);
  add('stamp', at('i2', '37'), 1);
  add('count', at('s5', '50'), 1);
  add('cash_drop', at('s5', '14') + .1, 1);
  add('hit', at('s5', '14') + .1, .9);
  add('static', S('s6'), .5);
  add('hit', at('s6', 'problem'), .7);
  for (let i = 0; i < 8; i++) add('tick', S('i3') + .1 + i * .08, .35);
  add('pin', at('i3', 'bought'), 1);
  add('stamp', at('rule', 'rule'), .8);
  add('hit', at('rule', 'tell'), .7);
  add('silence', S('day'), E('day') - S('day'));
  add('beep', at('s7', 'you') - .2, .6);
  add('hit', at('s9', 'except') - .05, 1.2);
  add('static', S('s10'), .4);
  add('riser_short', at('s11', 'everyone'), .8);
  add('stamp', at('s11', 'office'), .7);
  add('stamp', at('s11', 'there'), 1);
  for (let i = 0; i < 9; i++) add('type', S('stand') + .15 + i * .2, .6);
  add('thud', at('s12', 'boss') - .1, 1);
  add('riser', at('s13', 'you') - 1.0, 1);
  add('hit', at('s14', 'stay'), 1.1);
  add('boom', S('cta'), .9);
  return ev.sort((a, b) => a.t - b.t);
}
