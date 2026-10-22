// Off The Books — Part 3 "What Ticket?" (DENY).
// Premise in the first line, the vote as one short beat, a new picture on almost every phrase.
// Facts sit on top of the scenes; share, save, comment and follow each come once, inside the story.

loadImages(['s4', 'p1', 'p2', 'p5', 'p6', 'p7', 'p8', 'p10', 'p17', 'q1', 'q1b', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16']);
const NO_CAPTION = new Set(['note', 'save', 'cta']);

// ---- overlays ----
// huge centered line that slams in
function slam(lines, t, t0, y = 1180, t1 = Infinity) {
  const k = clamp((t - t0) / .18) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  const s = lerp(1.6, 1, easeOut(clamp((t - t0) / .18)));
  ctx.save(); ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(4,6,14,.45)'; ctx.fillRect(0, y - 190, W, 380);
  lines.forEach(([str, col], i) => withT(W / 2, y - 80 + i * 150, s, -.02, () =>
    text(str, 0, 0, 132, col, { stroke: '#05070F', strokeW: 22, shadow: 'rgba(0,0,0,.8)', shadowBlur: 30 })));
  ctx.restore();
}
function votedStamp(t, t0, word, t1 = Infinity) {
  const k = pop(t, t0, .35) * clamp((t1 - t) / .15);
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
// info told on top of a scene: dark band behind a mono tag and one or two lines
function overlayTag(t, t0, tag, l1, l2, src) {
  const k = easeOut(prog(t, t0, .3));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const g = ctx.createLinearGradient(0, 330, 0, 800);
  g.addColorStop(0, 'rgba(6,8,18,.88)'); g.addColorStop(1, 'rgba(6,8,18,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 330, W, 470);
  mono(tag, 70, 400, 28, C.gold, { align: 'left', weight: 700, spacing: 5 });
  text(l1, 70 + (1 - k) * -30, 480, 80, C.white, { align: 'left' });
  if (l2) text(l2, 70 + (1 - k) * -30, 570, 80, C.gold, { align: 'left' });
  if (src) mono(src, 70, 640, 22, C.grey, { align: 'left', spacing: 1 });
  ctx.restore();
}
// paper-plane share prompt
function sharePrompt(t, t0) {
  const k = pop(t, t0, .35);
  if (k <= 0) return;
  withT(W / 2, 1010, k, 0, () => {
    rr(-430, -120, 860, 240, 36); ctx.fillStyle = 'rgba(8,11,22,.88)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
    withT(-320, -8 + Math.sin(t * 6) * 6, 1, -.25, () => {
      ctx.fillStyle = C.gold; ctx.beginPath();
      ctx.moveTo(-50, 0); ctx.lineTo(55, -42); ctx.lineTo(18, 48); ctx.lineTo(4, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(4, 10); ctx.lineTo(55, -42); ctx.stroke();
    });
    text('SEND THIS TO', 60, -40, 46, C.white, { weight: 800 });
    text('THE GLOVEBOX GUY', 60, 28, 58, C.gold);
  });
}
// red REC badge with a live timer (record beat)
function recBadge(t, t0) {
  const k = pop(t, t0, .3);
  if (k <= 0) return;
  withT(W / 2, 1480, k, 0, () => {
    rr(-230, -60, 460, 120, 60); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
    ctx.fillStyle = (t * 2 % 1) < .6 ? C.red : 'rgba(229,57,53,.3)'; ctx.beginPath(); ctx.arc(-150, 0, 22, 0, 7); ctx.fill();
    const s = Math.max(0, t - t0);
    mono(`REC 00:${String(Math.floor(s)).padStart(2, '0')}`, 40, 3, 48, C.white, { weight: 700, spacing: 4 });
  });
}

// character name tag pinned next to someone in the picture (like a case-file label)
function nameTag(t, t0, t1, x, y, role, name) {
  const k = easeOut(prog(t, t0, .25)) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = `800 40px ${SANS}`;
  const w = Math.max(ctx.measureText(name).width, 160) + 60;
  rr(x, y, w, 104, 12); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
  ctx.fillStyle = C.gold; ctx.fillRect(x, y, 8, 104);
  mono(role, x + 30, y + 30, 22, C.gold, { align: 'left', weight: 700, spacing: 4 });
  text(name, x + 30, y + 72, 40, C.white, { align: 'left', weight: 800 });
  ctx.restore();
}
// red demand tag under the CASH box
function demandTag(t, t0, t1, str) {
  const k = pop(t, t0, .3) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  withT(60 + 180, 372, k, 0, () => { rr(-180, -36, 360, 72, 10); ctx.fillStyle = C.red; ctx.fill(); text(str, 0, 3, 40, C.white); });
}
// a real viewer comment, shown like an Instagram comment (username blurred)
function commentCard(t, t0, label, body, y = 1000) {
  const k = easeOut(prog(t, t0, .3));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const x = 60, w = W - 120, h = 250;
  rr(x, y + (1 - k) * 30, w, h, 26); ctx.fillStyle = 'rgba(250,250,252,.96)'; ctx.fill();
  const yy = y + (1 - k) * 30;
  mono(label, x + 40, yy + 46, 22, C.ink2, { align: 'left', weight: 700, spacing: 4 });
  ctx.fillStyle = '#C9CDD6'; ctx.beginPath(); ctx.arc(x + 75, yy + 125, 34, 0, 7); ctx.fill();
  rr(x + 130, yy + 92, 260, 26, 13); ctx.fillStyle = '#D5D8DF'; ctx.fill();
  text(body, x + 130, yy + 165, 44, C.ink, { align: 'left', weight: 700 });
  // heart, filling in
  const hk = easeOut(prog(t, t0 + .6, .3));
  withT(x + w - 60, yy + 130, 1 + .25 * Math.sin(Math.PI * hk), 0, () => text('♥', 0, 0, 52, hk > .5 ? C.red : '#B5B9C2'));
  ctx.restore();
}
// big gauge reading in the middle of the frame when EXPOSED jumps
function bigGauge(t, t0, t1, label, from, to, y = 1480) {
  const k = easeOut(prog(t, t0, .25)) * clamp((t1 - t) / .2);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rr(60, y - 120, W - 120, 220, 24); ctx.fillStyle = 'rgba(8,11,22,.88)'; ctx.fill();
  mono(label, 110, y - 70, 26, C.grey, { align: 'left', weight: 700, spacing: 6 });
  const v = count(t, t0, .6, from, to);
  text(`${Math.round(v)}%`, 110, y + 20, 120, C.red, { align: 'left' });
  rr(470, y + 5, W - 580, 26, 13); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill();
  rr(470, y + 5, (W - 580) * v / 100, 26, 13); ctx.fillStyle = C.red; ctx.fill();
  ctx.restore();
}

// ---- cards ----
const saveCard = {
  noPunch: true,
  draw(t, lt) {
    ledger('');
    const h = pop(lt, 0, .35);
    withT(W / 2, 330, h, 0, () => {
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(40, 60); ctx.lineTo(0, 30); ctx.lineTo(-40, 60); ctx.closePath(); ctx.fill();
    });
    text('SAVE THIS', W / 2, 470, 64, C.ink, { alpha: easeOut(prog(lt, .05, .3)) });
    text('IF SOMEONE KNOWS', W / 2, 560, 84, C.ink, { alpha: easeOut(prog(lt, .1, .3)) });
    const items = ['Sign the back tonight', 'Photograph both sides', 'Never leave it in the car', 'Admit nothing', 'Keep every threat', 'Let a lawyer do the talking'];
    items.forEach((s, i) => {
      const k = easeOut(prog(lt, .35 + i * .28, .25));
      const y = 730 + i * 130;
      ctx.save(); ctx.globalAlpha = k;
      rr(130, y - 38, 76, 76, 14); ctx.fillStyle = C.gold; ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(148, y); ctx.lineTo(164, y + 18); ctx.lineTo(190, y - 16); ctx.stroke();
      ctx.restore();
      text(s, 240, y + 2, 52, C.ink, { align: 'left', weight: 800, alpha: k });
    });
    mono('Rules vary by state. Not legal advice.', W / 2, 1560, 24, C.ink2, { alpha: .8, spacing: 1 });
  },
};
const ctaCard = {
  img: true, vig: .3, noPunch: true,
  draw(t, lt, dur) {
    drawImg('q16', camAt([.5, .45, 1.05], [.6, .35, 1.2], easeInOut(clamp(lt / dur))), {});
    ctx.fillStyle = 'rgba(8,11,22,.72)'; ctx.fillRect(0, 0, W, H);
    mono('NOBODY CAN KNOW', W / 2, 470, 30, C.grey, { spacing: 10 });
    text('PART 4', W / 2, 600, 140, C.white);
    withT(W / 2, 750, pop(lt, .1, .4), 0, () => text('TOMORROW', 0, 0, 140, C.gold, { shadow: 'rgba(245,197,24,.45)', shadowBlur: 40 }));
    text('Comment RECORD or REPORT 👇', W / 2, 930, 56, C.white, { alpha: easeOut(prog(lt, .4, .3)), weight: 800 });
    [['RECORD', 310], ['REPORT', 770]].forEach(([s, x], i) => {
      const k = pop(lt, .55 + i * .12, .35);
      if (k > 0) withT(x, 1070, k, 0, () => { rr(-200, -60, 400, 120, 60); ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke(); text(s, 0, 4, 58, C.gold); });
    });
    const f = pop(t, at('cta', 'follow') - .1, .4);
    if (f > 0) {
      const pulse = 1 + .05 * Math.sin(t * 8);
      withT(W / 2, 1290, f * pulse, 0, () => {
        rr(-300, -78, 600, 156, 78); ctx.fillStyle = C.gold; ctx.fill();
        text('+ FOLLOW', 0, 5, 80, C.navy);
      });
      text('Parts 1 & 2 are on my profile', W / 2, 1440, 44, C.grey, { weight: 700, alpha: clamp(f) });
    }
  },
};

const SHOTS = {
  // premise first: won $50M -> nobody can know -> boss wants half
  hook: beats([['s4', .5, .55, 1.0], ['p17', .5, .45, 1.05], ['p1', .5, .45, 1.1], ['p8', .5, .42, 1.1]],
    { cuts: () => [at('hook', 'nobody'), at('hook', 'last'), at('hook', 'said')],
      after: t => { slam([['YOU WON', C.white], ['$50,000,000', C.gold]], t, 0, 760, at('hook', 'nobody'));
        stamp('NOBODY CAN KNOW', W / 2, 820, 92, C.red, pop(t, at('hook', 'nobody'), .3) * clamp((at('hook', 'last') - t) / .15), -.06);
        nameTag(t, at('hook', 'last') + .1, S('vote'), 600, 560, 'THE BOSS', 'MR. GRANT');
        demandTag(t, at('hook', 'half') - .05, at('vote', 'top'), '−$6,930,000?');
        pill('HE WANTS HALF', 1520, t, at('hook', 'half') - .1, { bg: C.red, fg: C.white }); } }),
  vote: beats([['q1', .5, .45, 1.0], ['q1', .5, .5, 1.2]],
    { cuts: () => [at('vote', 'top')],
      after: t => { votedStamp(t, S('vote') + .05, 'DENY');
        commentCard(t, at('vote', 'top') - .05, 'YOUR TOP COMMENT · PART 2', '"deny deny deny pls pin"', 890);
        demandTag(t, at('hook', 'half') - .05, at('vote', 'top'), '−$6,930,000?');
        stamp('DENY ×3', W / 2, 1500, 80, C.red, pop(t, at('vote', 'three'), .3), -.06); } }),
  deny: beats([['p6', .5, .5, 1.05], ['q1', .5, .4, 1.4]],
    { cuts: () => [at('deny', 'what')],
      after: t => slam([['WHAT', C.white], ['TICKET?', C.gold]], t, at('deny', 'what'), 1180) }),
  boss1: beats([['q2', .5, .45, 1.0], ['q2', .55, .25, 1.6]], { cuts: () => [at('boss1', 'call')],
    after: t => nameTag(t, S('boss1') + .05, at('boss1', 'call'), 60, 1380, 'THE BOSS', 'MR. GRANT') }),
  walk: beats([['q3', .5, .5, 1.0], ['q1b', .5, .42, 1.25], ['q3', .6, .2, 1.9]],
    { cuts: () => [at('walk', 'heart'), at('walk', 'heres')] }),
  fact1: beats([['q4', .5, .5, 1.0], ['p5', .5, .4, 1.1], ['q4', .72, .55, 1.8]],
    { cuts: () => [at('fact1', 'until'), at('fact1', 'sold')],
      after: t => { overlayTag(t, S('fact1') + .1, 'PROBLEM 4 · THE PHONE CALL', "They don't know", 'who has it.');
        pill('THEY ONLY KNOW THE STORE', 1520, t, at('fact1', 'sold') - .1); } }),
  fact2: beats([['q5', .5, .5, 1.0], ['q5', .5, .5, 1.5]], { cuts: () => [at('fact2', 'whoever')],
    after: t => stamp("UNSIGNED = ANYONE'S", W / 2, 1450, 84, C.red, pop(t, at('fact2', 'unsigned'), .3), -.06) }),
  danger: beats([['q2', .3, .3, 1.7], ['q6', .5, .5, 1.0], ['q6', .58, .62, 1.7], ['q6', .3, .15, 1.6]],
    { cuts: () => [at('danger', 'wallet'), at('danger', 'jacket'), at('danger', 'chair')] }),
  rule: beats([['p7', .5, .5, 1.0], ['q7', .5, .5, 1.0]], { cuts: () => [at('rule', 'second')],
    after: t => overlayTag(t, at('rule', 'rule') - .05, 'RULE 3', 'Sign the back.', 'Tonight.') }),
  home: beats([['q7', .55, .6, 1.5], ['q8', .5, .5, 1.0], ['q8', .55, .45, 1.6]],
    { cuts: () => [at('home', 'photo'), at('home', 'case')],
      after: t => pill('📸 FRONT + BACK', 1520, t, at('home', 'both') - .1) }),
  share: beats([['q9', .5, .55, 1.0], ['q9', .4, .6, 1.5]], { vig: .7, cuts: () => [at('share', 'send')], after: t => sharePrompt(t, S('share') + .1) }),
  morning: beats([['q10', .5, .5, 1.0], ['q10', .62, .42, 2.0]], { cuts: () => [at('morning', 'yellow')] }),
  note: beats([['q11', .5, .45, 1.0], ['q11', .5, .45, 1.25]], { cuts: () => [at('note', 'or')], shake: t => clamp(1 - Math.abs(t - at('note', 'everybody')) * 3),
    after: t => bigGauge(t, at('note', 'everybody'), E('note') + .1, 'EXPOSED', 60, 84) }),
  mistake: beats([['q12', .5, .45, 1.0], ['q12', .5, .35, 1.4], ['q16', .5, .5, 1.05], ['q13', .5, .5, 1.0], ['q13', .45, .55, 1.4]],
    { cuts: () => [at('mistake', 'mistake'), at('mistake', 'asking'), at('mistake', 'extortion'), at('mistake', 'crime')],
      after: t => { overlayTag(t, at('mistake', 'extortion') - .05, 'HIS MISTAKE', 'Pay me or I talk', '= extortion.');
        stamp('A CRIME IN EVERY STATE', W / 2, 1600, 76, C.red, pop(t, at('mistake', 'crime'), .3), -.05); } }),
  record: beats([['q14', .5, .5, 1.0], ['q14', .55, .62, 1.6]], { cuts: () => [at('record', 'record')],
    after: t => { overlayTag(t, S('record') + .1, 'ONE-PARTY CONSENT', 'Most states:', 'you can record.', 'Some states need everyone to agree. Check yours.'); recBadge(t, at('record', 'record')); } }),
  save: saveCard,
  choice: beats([['q16', .5, .45, 1.05], ['q14', .5, .55, 1.2], ['q15', .5, .5, 1.0], ['q15', .62, .5, 1.5]],
    { cuts: () => [at('choice', 'secretly'), at('choice', 'walk'), at('choice', 'hr')],
      after: t => pill('RECORD or REPORT? 👇', 1520, t, at('choice', 'secretly'), { bob: true }) }),
  cta: ctaCard,
  // open loop after the vote: a third option, paid off in Part 4 (the trust from Part 2)
  third: beats([['q1', .5, .45, 1.15], ['q16', .5, .45, 1.1], ['p7', .5, .5, 1.05], ['q8', .55, .45, 1.3], ['p2', .5, .45, 1.1]],
    { vig: .6, cuts: () => [at('third', 'nobodys'), at('third', 'fast'), at('third', 'risky'), at('third', 'lawyer')],
      after: t => { slam([['OPTION 3', C.gold]], t, S('third') + .05, 760, at('third', 'nobodys'));
        pill('NOBODY VOTED FOR IT 👀', 1520, t, at('third', 'nobodys'), { bob: true }); } }),
};

// ---- HUD ----
const HUD_OFF = new Set(['save', 'cta']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = at('rule', 'sign'), e2 = at('note', 'everybody'), e3 = at('mistake', 'extortion');
  let exposed = 68;
  if (t >= e1) exposed = count(t, e1, .5, 68, 60);
  if (t >= e2) exposed = count(t, e2, .5, 60, 84);
  if (t >= e3) exposed = count(t, e3, .6, 84, 71);
  let expFlash = [e1, e2, e3].some(e => t > e && t < e + .8) ? 1 : 0;
  // "he wants half": CASH and EXPOSED blink red three times
  const th = at('hook', 'half') - .05, blink = t > th && t < th + 1.5 ? Math.max(0, Math.sin((t - th) * Math.PI * 4)) : 0;
  if (blink) expFlash = blink;
  const label = ['hook', 'vote', 'deny'].includes(id) ? 'PART 3 · WHAT TICKET?' : 'DAY 3';
  return { cash: 13.86e6, spent: 0, exposed, label, cashFlash: blink, expFlash, expRed: blink > 0 };
}

// ---- sound cues ----
// recorded foley for actions, cinematic hits only on the big beats, no whooshes (they sound cheap)
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1) => ev.push({ name, t: +t.toFixed(3), gain });
  add('step', S('morning') + .1, .4);
  add('coins', 0.02, .8); add('hit', .05, .7); add('stamp', at('hook', 'nobody'), .7);
  add('step', at('hook', 'last'), .5); add('thump', at('hook', 'half') - .05, .9);
  add('thump', S('vote') + .05, .8); add('pin', at('vote', 'top'), .6); add('click', at('vote', 'top') + .6, .4); add('stamp', at('vote', 'three'), .7);
  add('cloth', at('deny', 'look'), .5); add('boom', at('deny', 'what') - .05, .9);
  add('paper', at('hook', 'last') + .1, .35); add('cash_drop', at('hook', 'half'), .45); for (let i = 0; i < 3; i++) add('beep', at('hook', 'half') - .05 + i * .5, .25);
  add('beep', S('boss1') + .25, .35); add('click', at('boss1', 'call'), .5);
  add('step', S('walk') + .3, .5); add('step', S('walk') + .85, .45); add('step', S('walk') + 1.4, .4);
  for (let i = 0; i < 4; i++) add('thud', at('walk', 'heart') + i * .42, .55);
  add('riser_short', at('walk', 'heres') - .2, .6);
  add('paper', S('fact1') + .1, .5); add('click', at('fact1', 'until'), .45); add('pin', at('fact1', 'sold'), .6);
  add('scratch', S('fact2'), .4); add('stamp', at('fact2', 'unsigned'), .8); add('cloth', at('fact2', 'whoever'), .4);
  add('glitch', S('danger') + .05, .45); add('cloth', at('danger', 'wallet'), .55); add('metal', at('danger', 'jacket'), .35); add('drone', at('danger', 'chair') - .3, .5);
  add('knock', at('rule', 'rule'), .8); add('door', at('rule', 'second'), .45); add('scratch', at('rule', 'second') + .5, .55);
  add('click', at('home', 'photo') + .1, .7); add('click', at('home', 'case'), .6);
  add('door', S('share') + .05, .4); add('paper', S('share') + .4, .45); add('click', at('share', 'send'), .6);
  add('paper', at('morning', 'yellow'), .6);
  add('silence', S('note') - .05, 1.2); add('hit', S('note'), .8); add('thump', at('note', 'everybody'), .9);
  add('riser_short', S('mistake') - .1, .5); add('thump', at('mistake', 'extortion') - .05, .8); add('hit', at('mistake', 'crime') - .05, .6); add('metal', at('mistake', 'crime') + .1, .5);
  add('beep', at('record', 'record'), .45); add('cloth', S('record') + .1, .45);
  for (let i = 0; i < 6; i++) add('paper', S('save') + .35 + i * .28, .45);
  add('riser', S('choice'), .8); add('thump', at('choice', 'walk'), .7); add('knock', at('choice', 'hr'), .7);
  add('thump', S('cta'), .7); add('click', at('cta', 'follow') - .1, .8);
  add('hit', S('third') + .05, .6); add('drone', at('third', 'nobodys'), .45);
  add('tick', at('third', 'fast'), .5); add('thump', at('third', 'risky'), .6); add('riser_short', at('third', 'lawyer') - .3, .6);
  add('beep', at('note', 'everybody') + .1, .4);
  return ev.sort((a, b) => a.t - b.t);
}
