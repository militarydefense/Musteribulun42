// Off The Books — Part 2 "Overtime" (STAY).
// Cold open on the twist, rewind, then build back to it. Share, save and follow prompts are built into the story.

loadImages(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 's12']);
const NO_CAPTION = new Set(['cold', 'boss', 'i1', 'rule', 'save', 'cta']);

const still = (name, a, b, o = {}) => ({
  img: true, vig: o.vig,
  draw(t, lt, dur) {
    const k = easeInOut(clamp(lt / Math.max(dur, .1)));
    let dx = 0, dy = 0;
    if (o.shake) { const s = o.shake(t); dx = Math.sin(t * 71) * 16 * s; dy = Math.cos(t * 53) * 12 * s; }
    drawImg(name, camAt(a, b, k), { dx, dy });
    if (o.after) o.after(t, lt, dur);
  },
});

// ---- overlays ----
// huge centered line that slams in (cold open and payoff)
function slam(lines, t, t0, y = 1180) {
  const k = clamp((t - t0) / .18);
  if (k <= 0) return;
  const s = lerp(1.6, 1, easeOut(k));
  ctx.save();
  ctx.fillStyle = `rgba(4,6,14,${.45 * k})`; ctx.fillRect(0, y - 190, W, 380);
  lines.forEach(([str, col], i) => withT(W / 2, y - 80 + i * 150, s, -.02, () =>
    text(str, 0, 0, 132, col, { stroke: '#05070F', strokeW: 22, shadow: 'rgba(0,0,0,.8)', shadowBlur: 30 })));
  ctx.restore();
}
function votedStamp(t, t0, word) {
  const k = pop(t, t0, .35);
  if (k <= 0) return;
  withT(W / 2, 760, k, -.08, () => {
    ctx.font = `900 96px ${SANS}`;
    const w = ctx.measureText(`VOTED: ${word}`).width + 110;
    rr(-w / 2, -95, w, 190, 22); ctx.fillStyle = 'rgba(5,7,15,.6)'; ctx.fill();
    ctx.lineWidth = 12; ctx.strokeStyle = C.gold; ctx.stroke();
    mono('YOU', 0, -52, 34, C.gold, { weight: 700, spacing: 10 });
    text(`VOTED: ${word}`, 0, 20, 96, C.gold);
  });
}
function pill(str, y, t, t0, o = {}) {
  const k = pop(t, t0, .35);
  if (k <= 0) return;
  withT(W / 2, y + Math.sin(t * 5) * (o.bob ? 6 : 0), k, 0, () => {
    ctx.font = `800 46px ${SANS}`;
    const w = ctx.measureText(str).width + 90;
    rr(-w / 2, -50, w, 100, 50); ctx.fillStyle = o.bg || C.gold; ctx.fill();
    text(str, 0, 3, 46, o.fg || C.navy, { weight: 800 });
  });
}
// paper-plane share prompt
function sharePrompt(t, t0) {
  const k = pop(t, t0, .35);
  if (k <= 0) return;
  withT(W / 2, 1010, k, 0, () => {
    rr(-430, -120, 860, 240, 36); ctx.fillStyle = 'rgba(8,11,22,.88)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
    // plane icon, gently flying
    withT(-320, -8 + Math.sin(t * 6) * 6, 1, -.25, () => {
      ctx.fillStyle = C.gold; ctx.beginPath();
      ctx.moveTo(-50, 0); ctx.lineTo(55, -42); ctx.lineTo(18, 48); ctx.lineTo(4, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(4, 10); ctx.lineTo(55, -42); ctx.stroke();
    });
    text('SEND THIS TO', 60, -40, 46, C.white, { weight: 800 });
    text('THAT ONE FRIEND', 60, 28, 62, C.gold);
  });
}
// rewind effect: tracking lines + ◀◀
function rewindFx(t, lt) {
  const a = clamp(1 - lt / .7);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 9; i++) { const y = (rnd(i + Math.floor(t * 20)) * H); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, y, W, 6 + rnd(i) * 14); }
  text('◀◀ REWIND', W / 2, 520, 72, C.white, { stroke: '#000', strokeW: 10, font: MONO, weight: 700 });
  ctx.restore();
}

// ---- cards ----
function navyBg(glowY = 900) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, glowY, 0, W / 2, glowY, 900);
  g.addColorStop(0, 'rgba(245,197,24,.16)'); g.addColorStop(1, 'rgba(245,197,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const info1 = {
  draw(t, lt) {
    ledger('PROBLEM 3 · THE CLOCK');
    text('CLAIM WINDOW', W / 2, 470, 92, C.ink);
    // timeline 0 -> 1 year with markers
    const x0 = 170, x1 = 910, y = 760;
    const grow = easeOut(prog(t, at('i1', 'depending'), 1.4));
    rr(x0, y - 18, x1 - x0, 36, 18); ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fill();
    rr(x0, y - 18, (x1 - x0) * grow, 36, 18); ctx.fillStyle = C.gold; ctx.fill();
    [['WIN', 0], ['90 DAYS', .25], ['180 DAYS', .5], ['1 YEAR', 1]].forEach(([s, f], i) => {
      const k = easeOut(prog(t, at('i1', 'depending') + f * 1.2, .25));
      const x = lerp(x0, x1, f);
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.ink; ctx.fillRect(x - 3, y - 50, 6, 100); ctx.restore();
      mono(s, x, y + 100, 28, C.ink, { weight: 700, alpha: k, spacing: 2 });
    });
    // ticking clock
    const ck = easeOut(prog(lt, 0, .35));
    withT(W / 2, 1110, ck, 0, () => {
      ctx.lineWidth = 14; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 130, 0, 7); ctx.stroke();
      const a = t * 4;
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 100, -Math.cos(a) * 100); ctx.stroke();
      ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a / 12) * 65, -Math.cos(a / 12) * 65); ctx.stroke();
    });
    stamp('MISS IT = $0', W / 2, 1400, 100, C.red, pop(t, at('i1', 'nothing'), .3), -.07);
    mono('Mega Millions: 90 days to 1 year, set by the state where the ticket was sold', W / 2, 1610, 21, C.ink2, { spacing: .5 });
  },
};
const ruleCard = {
  noPunch: true,
  draw(t, lt) {
    navyBg(1000);
    const g = pop(t, at('rule', 'rule'), .3);
    if (g > 0) withT(W / 2, 760, g, 0, () => { rr(-120, -34, 240, 68, 10); ctx.fillStyle = C.gold; ctx.fill(); mono('RULE 2', 0, 2, 34, C.navy, { weight: 700, spacing: 6 }); });
    const a = easeOut(prog(t, at('rule', 'before'), .25)), b = easeOut(prog(t, at('rule', 'cousin') - .3, .25));
    text('Get a lawyer.', W / 2, 960 + (1 - a) * 30, 116, C.white, { alpha: a });
    text('Before you claim.', W / 2, 1100 + (1 - a) * 30, 84, C.gold, { alpha: a });
    text('(Not your cousin.)', W / 2, 1260, 52, C.grey, { alpha: b, weight: 700 });
  },
};
const saveCard = {
  noPunch: true,
  draw(t, lt) {
    ledger('');
    // bookmark icon + header
    const h = pop(lt, 0, .35);
    withT(W / 2, 330, h, 0, () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(40, 60); ctx.lineTo(0, 30); ctx.lineTo(-40, 60); ctx.closePath(); ctx.fill();
    });
    text('SAVE THIS', W / 2, 470, 64, C.ink, { alpha: easeOut(prog(lt, .05, .3)) });
    text('IF YOU EVER WIN', W / 2, 560, 92, C.ink, { alpha: easeOut(prog(lt, .1, .3)) });
    const items = ['Sign the back of the ticket', 'Tell no one', "Don't change your routine", 'Lawyer before you claim', 'Ask about a trust', 'Claim before the deadline'];
    items.forEach((s, i) => {
      const k = easeOut(prog(lt, .35 + i * .28, .25));
      const y = 730 + i * 130;
      ctx.save(); ctx.globalAlpha = k;
      rr(150, y - 38, 76, 76, 14); ctx.fillStyle = C.gold; ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(168, y); ctx.lineTo(184, y + 18); ctx.lineTo(210, y - 16); ctx.stroke();
      ctx.restore();
      text(s, 260, y + 2, 54, C.ink, { align: 'left', weight: 800, alpha: k });
    });
    mono('Rules vary by state. Not legal advice.', W / 2, 1560, 24, C.ink2, { alpha: .8, spacing: 1 });
  },
};
const ctaCard = {
  noPunch: true,
  draw(t, lt) {
    navyBg(800);
    mono('NOBODY CAN KNOW', W / 2, 470, 30, C.grey, { spacing: 10 });
    text('PART 3', W / 2, 600, 140, C.white);
    withT(W / 2, 750, pop(lt, .1, .4), 0, () => text('TOMORROW', 0, 0, 140, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
    text('Comment PAY or DENY 👇', W / 2, 930, 60, C.white, { alpha: easeOut(prog(lt, .4, .3)), weight: 800 });
    [['PAY', 330], ['DENY', 750]].forEach(([s, x], i) => {
      const k = pop(lt, .55 + i * .12, .35);
      if (k > 0) withT(x, 1070, k, 0, () => { rr(-170, -60, 340, 120, 60); ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke(); text(s, 0, 4, 62, C.gold); });
    });
    // follow button, pulsing
    const f = pop(t, at('cta', 'follow') - .1, .4);
    if (f > 0) {
      const pulse = 1 + .05 * Math.sin(t * 8);
      withT(W / 2, 1290, f * pulse, 0, () => {
        rr(-300, -78, 600, 156, 78); ctx.fillStyle = C.gold; ctx.fill();
        text('+ FOLLOW', 0, 5, 80, C.navy);
      });
      text('Part 1 is on my profile', W / 2, 1440, 44, C.grey, { weight: 700, alpha: clamp(f) });
    }
  },
};

const SHOTS = {
  cold: beats([['p1', .5, .42, 1.15], ['p8', .5, .45, 1.05]], { after: t => slam([['I KNOW ABOUT', C.white], ['THE TICKET.', C.gold]], t, 0) }),
  vote: beats([['p10', .5, .45, 1.05], ['p1', .5, .55, 1.0]], { after: t => votedStamp(t, at('vote', 'voted') - .1, 'STAY') }),
  rewind: beats([['p11', .5, .5, 1.0], ['p11', .45, .38, 1.6], ['s12', .5, .45, 1.1], ['p11', .62, .55, 1.35]], { after: (t, lt) => rewindFx(t, lt) }),
  i1: info1,
  rule: ruleCard,
  car: beats([['p2', .5, .5, 1.0], ['p2', .45, .36, 1.6], ['p7', .5, .5, 1.05], ['p2', .55, .6, 1.25]]),
  share: beats([['p2', .45, .4, 1.35]], { vig: .8, after: t => sharePrompt(t, S('share') + .1) }),
  night: beats([['p3', .5, .55, 1.2], ['p9', .5, .5, 1.0], ['p9', .6, .42, 1.45]]),
  desk: beats([['p3', .5, .62, 1.5], ['p4', .5, .5, 1.0], ['p4', .42, .3, 1.6], ['p10', .5, .45, 1.1]], { after: t => pill('WHAT WOULD YOU DO? 👇', 1520, t, at('desk', 'leans'), { bob: true }) }),
  boss: beats([['p8', .5, .45, 1.2]], { shake: t => clamp(1 - (t - S('boss')) * 2), after: t => slam([['I KNOW ABOUT', C.white], ['THE TICKET.', C.gold]], t, S('boss')) }),
  cam: beats([['p5', .5, .4, 1.0], ['p5', .5, .33, 1.55], ['p8', .5, .5, 1.25]], { after: t => pill('HE WANTS $6.9M', 1520, t, at('cam', 'half'), { bg: C.red, fg: C.white }) }),
  save: saveCard,
  choice: beats([['p6', .5, .5, 1.0], ['p10', .5, .45, 1.2], ['p8', .5, .45, 1.1]]),
  cta: ctaCard,
};

// ---- HUD ----
const HUD_OFF = new Set(['i1', 'rule', 'save', 'cta']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = at('boss', 'ticket'), e2 = at('cam', 'half');
  let exposed = 27;
  if (t >= e1) exposed = count(t, e1, .5, 27, 55);
  if (t >= e2) exposed = count(t, e2, .5, 55, 68);
  const expFlash = (t > e1 && t < e1 + .8) || (t > e2 && t < e2 + .8) ? 1 : 0;
  const label = ['cold', 'vote'].includes(id) ? 'PART 2 · OVERTIME' : 'DAY 2';
  return { cash: 13.86e6, spent: 0, exposed, label, cashFlash: 0, expFlash };
}

// ---- sound cues ----
// recorded foley (engine/sfx) for actions, cinematic hits only on the big beats, whoosh only on act changes
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1) => ev.push({ name, t: +t.toFixed(3), gain });
  for (const id of ['vote', 'i1', 'rule', 'night', 'save', 'cta']) add('whoosh', S(id) - .12, .6);
  add('boom', 0, 1); add('thump', 0.02, .8);
  add('thump', at('vote', 'voted') - .1, .9);
  add('glitch', S('rewind'), .7); add('paper', S('rewind') + 1.4, .6); add('click', S('rewind') + 2.6, .4); add('paper', S('rewind') + 4.1, .5);
  for (let i = 0; i < 6; i++) add('tick', at('i1', 'depending') + i * .25, .45);
  add('thump', at('i1', 'nothing'), .9);
  add('knock', at('rule', 'rule'), .8); add('paper', at('rule', 'lawyer'), .6);
  add('door', S('car') + .05, .5); add('click', S('car') + 1.0, .4); add('paper', S('car') + 5.0, .4);
  add('click', S('share') + .1, .6);
  add('drone', S('night'), .7); add('step', S('night') + 1.2, .5); add('step', S('night') + 1.75, .45);
  add('step', S('desk') + .2, .55); add('step', S('desk') + .75, .5); add('cloth', at('desk', 'sits'), .6); add('riser_short', at('desk', 'leans'), .7);
  add('boom', S('boss'), 1); add('thump', at('boss', 'ticket'), .8);
  add('glitch', S('cam'), .5); add('click', S('cam') + .4, .4); add('coins', at('cam', 'half'), .9);
  for (let i = 0; i < 6; i++) add('paper', S('save') + .35 + i * .28, .45);
  add('riser', S('choice'), .8); add('thump', at('choice', 'deny'), 1);
  add('thump', S('cta'), .7); add('click', at('cta', 'follow') - .1, .8);
  return ev.sort((a, b) => a.t - b.t);
}
