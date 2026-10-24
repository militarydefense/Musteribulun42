// Off The Books — Part 5 "5:00 P.M." (LOCK).
// Part 3 formula: narrator + "you" + premise in the first sentence, bright first frame, karaoke captions,
// facts on top of scenes, no black title card. One new thing only: the red-jacket character.
/*UI*/

loadImages(['r1', 'r8', 'r9', 'q1b', 'q14', 't1', 't2', 't3', 't4', 't5', 't6']);
const NO_CAPTION = new Set(['end']);

// ---- local overlays (Part 3 style) ----
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
// big digital clock in the middle of the frame
function bigClock(t, t0, t1, str, red) {
  const k = fadeIn(t, t0, t1, .12);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rr(140, 560, W - 280, 230, 26); ctx.fillStyle = 'rgba(6,8,18,.88)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = red ? C.red : C.gold; ctx.stroke();
  mono('FRIDAY', W / 2, 615, 30, red ? C.red : C.gold, { weight: 700, spacing: 8 });
  text(str, W / 2, 720, 140, red ? C.red : C.white, { font: MONO, weight: 700 });
  ctx.restore();
}
// cloud "signed-in devices" list; the stranger's row appears at tNew
function deviceList(t, t0, t1, tNew) {
  const k = fadeIn(t, t0, t1, .25);
  if (k <= 0) return;
  const rows = [['iPhone 15', 'This device', C.white, 0], ['Office PC · Desk 14', 'Signed out ✓', '#58D68D', t0 + .3]];
  if (tNew) rows.push(['MacBook Pro', 'Riverside Apts · ACTIVE NOW', C.red, tNew]);
  const x = 70, w = W - 140, y = 330, h = 110 + rows.length * 120;
  ctx.save(); ctx.globalAlpha = k;
  uiBox(x, y, w, h);
  mono('SIGNED-IN DEVICES', x + 36, y + 46, 24, C.gold, { align: 'left', weight: 700, spacing: 4 });
  rows.forEach(([dev, st, col, ts], i) => {
    const kk = easeOut(prog(t, ts, .25));
    if (kk <= 0) return;
    const yy = y + 115 + i * 120;
    ctx.save(); ctx.globalAlpha = k * kk;
    if (col === C.red && (t * 2 % 1) < .5) { rr(x + 16, yy - 50, w - 32, 104, 14); ctx.fillStyle = 'rgba(229,72,77,.18)'; ctx.fill(); }
    text(dev, x + 40, yy - 8, 46, C.white, { align: 'left', weight: 800 });
    mono(st, x + 40, yy + 36, 24, col, { align: 'left', weight: 700, spacing: 1.5 });
    ctx.restore();
  });
  ctx.restore();
}

const CHOICES = [['CALL', 'Lock your number. They\'ll know you know.'], ['FIND', 'Riverside is ten minutes away.']];
const T_ = s => at('hook', s);

const SHOTS = {
  // 0–6 s: bright Lucky + $50M slam, NOBODY CAN KNOW, then a 3-2-1 clock to 5:00
  hook: beats([['r1', .5, .42, 1.0], ['t6', .5, .45, 1.05], ['t4', .5, .4, 1.1], ['r8', .5, .42, 1.1]],
    { cuts: () => [T_('nobody'), T_('bosss'), T_('3')],
      after: t => {
        slam([['YOU WON', C.white], [usd(count(t, .05, .9, 0, 50e6, easeOut)), C.gold]], t, -.3, 760, T_('nobody'));
        stamp('NOBODY CAN KNOW', W / 2, 820, 92, C.red, pop(t, T_('nobody'), .3) * clamp((T_('bosss') - t) / .15), -.06);
        nameTag(t, T_('bosss') + .05, T_('3'), 70, 330, 'YOUR BOSS', 'MR. GRANT', 'DEADLINE: FRIDAY 5 PM');
        const sec = t < T_('2') ? 57 : t < T_('1') ? 58 : 59;
        bigClock(t, T_('3') - .1, E('hook') + .05, `4:59:${sec}`);
      } }),
  five: beats([['t1', .5, .5, 1.0], ['t1', .42, .4, 1.4], ['t6', .5, .45, 1.15]],
    { cuts: () => [at('five', 'nothing'), at('five', 'thats')],
      after: t => bigClock(t, S('five'), at('five', 'nothing'), '5:00:00', true) }),
  vote: beats([['r8', .5, .42, 1.1], ['r9', .49, .4, 1.6]],
    { cuts: () => [at('vote', 'already')],
      after: t => votedStamp(t, S('vote') + .05, 'LOCK', at('vote', 'already')) }),
  lock: beats([['t6', .5, .5, 1.1], ['r9', .49, .4, 1.6], ['r8', .5, .45, 1.2]], { cuts: () => [at('lock', 'twofactor'), at('lock', 'sign')],
    after: t => typedList(t, S('lock'), E('lock') + .1, 360, '4:58 P.M. · YOU LOCKED IT', [
      [at('lock', 'new'), [['1. New password ', C.white], ['✓', '#58D68D']]],
      [at('lock', 'twofactor'), [['2. Two-factor ', C.white], ['ON ✓', '#58D68D']]],
      [at('lock', 'sign'), [['3. Signed out everywhere ', C.white], ['✓', '#58D68D']]]]) }),
  list: beats([['r8', .5, .42, 1.15], ['q1b', .5, .42, 1.2], ['r9', .49, .4, 1.6]], { cuts: () => [at('list', 'list'), at('list', 'so')],
    after: t => { overlayTag(t, S('list') + .05, 'REAL RULE', 'Your cloud lists', 'every device.', 'Settings → Devices. Check it.', at('list', 'so'));
      deviceList(t, at('list', 'so'), E('list') + .1); } }),
  twist: beats([['t6', .5, .45, 1.15], ['r9', .49, .45, 1.8], ['q1b', .5, .42, 1.25]],
    { cuts: () => [at('twist', 'laptop'), at('twist', 'riverside')],
      after: t => { deviceList(t, S('twist'), E('twist') + .1, at('twist', 'laptop'));
        bigGauge(t, at('twist', 'riverside'), E('twist') + .1, 'EXPOSED', 93, 96, 1010); } }),
  who: beats([['t2', .5, .5, 1.0], ['t2', .55, .55, 1.4]], { cuts: () => [at('who', 'but')] }),
  him: beats([['t3', .5, .45, 1.0], ['t2', .5, .5, 1.1], ['t3', .52, .4, 1.35]], { cuts: () => [at('him', 'new'), at('him', 'if')],
    after: t => nameTag(t, S('him') + .1, E('him'), 70, 330, '???', 'RIVERSIDE', 'HE HAS YOUR CODES') }),
  code: beats([['r8', .5, .42, 1.15], ['r9', .49, .4, 1.6]], { cuts: () => [at('code', 'login')],
    after: t => notif(t, at('code', 'buzzes') - .1, E('code') + .1, 360, 'MESSAGES · NOW', 'Your login code: 482-019', "You didn't ask for this.", { icon: '#34C759', glyph: '✉' }) }),
  fact: beats([['t2', .55, .5, 1.35], ['t3', .5, .42, 1.1], ['r9', .49, .4, 1.6]],
    { cuts: () => [at('fact', 'scammers'), at('fact', 'every')],
      after: t => overlayTag(t, S('fact') + .05, 'REAL SCAM · SIM SWAP', 'Your number.', 'His phone.', 'Scammers talk your carrier into moving your number.') }),
  rule: beats([['r8', .5, .45, 1.1], ['t6', .5, .45, 1.15], ['r1', .5, .5, 1.1]], { cuts: () => [at('rule', 'text'), at('rule', 'use', 1)],
    after: t => { overlayTag(t, S('rule') + .05, 'RULE 5', 'No text codes.', 'Use an app.');
      pill('AUTHENTICATOR APP ✓', 1520, t, at('rule', 'authenticator') - .05, { bg: '#58D68D', fg: C.navy }); } }),
  grant: beats([['t4', .5, .4, 1.0], ['t4', .5, .3, 1.35]], { cuts: () => [at('grant', 'monday')],
    after: t => nameTag(t, S('grant') + .05, E('grant') + .1, 70, 330, 'YOUR BOSS', 'MR. GRANT', 'SATURDAY · ON THE PHONE') }),
  two: beats([['t4', .45, .35, 1.2], ['t3', .5, .42, 1.15]], { cuts: () => [at('two', 'one', 1)],
    after: t => pill('TWO OF THEM', 1520, t, at('two', 'two') - .05, { bg: C.red, fg: C.white }) }),
  choice: beats([['r8', .5, .42, 1.2], ['t2', .5, .5, 1.05]], { cuts: () => [at('choice', 'go')],
    after: t => choiceBoxes(t, S('choice'), CHOICES, 'COMMENT CALL OR FIND') }),
  cta: beats([['t3', .5, .42, 1.1], ['r8', .5, .45, 1.2]], { cuts: () => [at('cta', 'follow')],
    after: t => {
      choiceBoxes(t, S('choice'), CHOICES, 'COMMENT CALL OR FIND');
      const f = pop(t, at('cta', 'follow') - .1, .4);
      if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
        rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
      });
    } }),
  // open loop: he sold you the ticket (Part 1 gas station)
  third: beats([['t3', .5, .45, 1.15], ['t5', .5, .45, 1.0], ['t5', .5, .4, 1.3]],
    { cuts: () => [at('third', 'youve'), at('third', 'hes')],
      after: t => nameTag(t, at('third', 'hes') + .05, E('third') + .1, 70, 330, 'PART 1 · GAS STATION', 'THE CASHIER', 'HE SOLD YOU THE TICKET') }),
  end: { noPunch: true, draw() { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } },
};

// ---- HUD: EXPOSED only goes up ----
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'third', 'end']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = at('twist', 'riverside');
  const exposed = t >= e1 ? count(t, e1, .6, 93, 96) : 93;
  const blink = t > e1 && t < e1 + 1.2 ? Math.max(0, Math.sin((t - e1) * Math.PI * 4)) : 0;
  const label = ['five', 'vote'].includes(id) ? 'PART 5 · 5:00 P.M.' : 'DAY 5';
  return { cash: 13.86e6, spent: 0, exposed, label, cashFlash: 0, expFlash: blink, expRed: blink > 0 };
}

// ---- sound: recorded foley + per-element sounds, no whooshes ----
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('money_count', .05, .8, .85); add('stamp', T_('nobody'), .7);
  for (const w of ['3', '2', '1']) add('beep', T_(w), .55);
  add('silence', S('five') - .1, .9); add('hit', S('five'), .9);
  for (let i = 0; i < 4; i++) add('tick', S('five') + .3 + i * 1.0, .5);
  add('stamp', S('vote') + .05, .8); add('click', at('vote', 'already'), .5);
  for (const w of ['new', 'twofactor', 'sign']) add('typewriter', at('lock', w), .45, .7);
  add('click', S('list') + .1, .5); add('paper', at('list', 'so'), .4);
  add('beep', at('twist', 'laptop'), .6); add('glitch', at('twist', 'riverside'), .5); add('fill', at('twist', 'riverside'), .5, .6);
  add('drone', S('who'), .5, 4.5); add('thud', at('who', 'but'), .6);
  add('static', S('him'), .3);
  add('buzz', at('code', 'buzzes') - .2, .9); add('beep', at('code', 'login'), .5);
  add('paper', S('fact') + .1, .4); add('click', at('fact', 'every'), .4);
  add('knock', at('rule', 'rule'), .7); add('fill', at('rule', 'authenticator') - .05, .45, .5);
  add('ring', S('grant') - .4, .35, .9); add('thump', at('grant', 'monday'), .7);
  add('thump', at('two', 'one'), .6); add('thump', at('two', 'one', 1), .6);
  add('thump', S('choice'), .7); add('click', S('choice') + .25, .5); add('click', S('choice') + .55, .5); add('click', at('cta', 'follow') - .1, .8);
  add('drone', S('third'), .5, 4); add('silence', at('third', 'hes') - .05, 1.2); add('hit', at('third', 'hes'), .9);
  return ev.sort((a, b) => a.t - b.t);
}
