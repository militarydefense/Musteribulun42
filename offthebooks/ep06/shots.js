// Off The Books — Part 6 "Sunday" (CALL).
// Rules from the Part 2 YouTube / Titanic P1 retention data: no recap in the first 10 s (the new event is the first sentence),
// 45 s, open loop (Monday 9 AM invite) BEFORE the vote, CTA last and 2 s, one share line, varied cuts per frame.
/*UI*/

loadImages(['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'r1', 'r8', 'r9', 'q1b', 't2', 't3', 't4', 't5']);
const NO_CAPTION = new Set(['end']);
const INNER = new Set(['inner']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .35];

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
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}

const CHOICES = [['TRUST', 'Claim it tonight. Your name stays off the news.'], ['POLICE', 'Hand over the recording. End it Monday.']];
const H_ = w => at('hook', w);

const SHOTS = {
  // frame 0: bright shocked Lucky on the phone + $50M slam; the new event is in the first sentence
  hook: beats([['u1', .5, .4, 1.0, { tr: 'crash', shake: 1 }], ['r1', .5, .45, 1.05, { tr: 'flash', move: 'in' }],
    ['u2', .3, .66, 1.55, { tr: 'whip', move: 'right' }], ['t3', .5, .42, 1.1, { tr: 'glitch', move: 'crash' }], ['u1', .5, .32, 1.5, { tr: 'red', move: 'in', rot: 3 }]],
    { cuts: () => [H_('nobody'), H_('phone'), H_('someone'), H_('pretending')],
      after: t => {
        slam([['YOU WON', C.white], [usd(count(t, -.45, .55, 0, 50e6, easeOut)), C.gold]], t, -.3, 760, H_('nobody'));
        stamp('NOBODY CAN KNOW', W / 2, 820, 92, C.red, pop(t, H_('nobody'), .3) * clamp((H_('phone') - t) / .15), -.06);
        notif(t, H_('phone'), H_('pretending'), 360, 'CARRIER · SECURITY ALERT', 'Someone called as you', 'Today, 8:42 AM · "lost my phone"', { icon: C.red, glyph: '!', red: true });
      } }),
  rep: beats([['u2', .3, .66, 1.55, { move: 'in', fx: 'pulse' }], ['t2', .5, .45, 1.05, { tr: 'glitch', move: 'right' }]],
    { cuts: () => [at('rep', 'asked')],
      after: t => nameTag(t, S('rep') + .05, at('rep', 'asked'), 70, 360, 'PHONE COMPANY', 'SUPPORT', 'ON THE LINE WITH YOU') }),
  lock: beats([['r8', .5, .42, 1.15, { tr: 'crash', move: 'in' }]],
    { after: t => notif(t, S('lock') + .1, E('fact') + .2, 360, 'CARRIER · ACCOUNT', 'Number Lock: ON', 'Your number can\'t be moved.', { icon: '#34C759', glyph: '✓' }) }),
  fact: beats([['q1b', .5, .42, 1.15, { tr: 'whip', move: 'left' }], ['r9', .49, .4, 1.6, { tr: 'dip', move: 'in' }]],
    { cuts: () => [at('fact', 'nobody')],
      after: t => overlayTag(t, at('fact', 'nobody') - .1, 'REAL TIP', 'Ask for a number lock', 'or a port-out PIN.', 'Most big carriers offer it, free.') }),
  rule: beats([['r1', .5, .5, 1.1, { tr: 'flash', move: 'out' }], ['u7', .5, .45, 1.1, { tr: 'crash' }]],
    { cuts: () => [at('rule', 'with')],
      after: t => { overlayTag(t, S('rule') + .05, 'RULE 6', 'Lock your number', 'with your carrier.');
        pill('NUMBER LOCK ✓', 1520, t, at('rule', 'lock') - .05, { bg: '#58D68D', fg: C.navy }); } }),
  // payoff: the scammer's phone dies
  dead: beats([['u3', .5, .45, 1.05, { tr: 'glitch', move: 'crash', fx: 'flicker' }], ['u3', .5, .55, 1.5, { tr: 'shake', rot: -4 }]],
    { cuts: () => [at('dead', 'lost')], tint: RED }),
  callback: beats([['u2', .6, .66, 1.6, { tr: 'dip', move: 'in' }], ['u4', .5, .45, 1.05, { tr: 'whip', fx: 'pulse' }]],
    { cuts: () => [at('callback', 'number')],
      after: t => infoBox(t, at('callback', 'number') - .1, E('grant') + .3, 860, 'CALLBACK NUMBER HE LEFT', '(555) 014-2209', { size: 72, type: true, cps: 18 }) }),
  grant: beats([['u4', .5, .38, 1.5, { tr: 'crash', fx: 'pulse' }], ['t4', .5, .4, 1.1, { tr: 'glitch', move: 'crash', rot: -3 }]],
    { cuts: () => [at('grant', 'its')],
      after: t => { infoBox(t, at('callback', 'number') - .1, E('grant') + .3, 860, 'CALLBACK NUMBER HE LEFT', '(555) 014-2209', { size: 72 });
        stamp('GRANT · MOBILE', W / 2, 1090, 74, C.red, pop(t, at('grant', 'its'), .3), -.05); } }),
  inner: beats([['u5', .5, .45, 1.1, { tr: 'dip', move: 'in', fx: 'flicker' }], ['t5', .5, .45, 1.1, { tr: 'flash', move: 'crash' }]],
    { cuts: () => [at('inner', 'sold')], tint: ICE,
      after: t => nameTag(t, at('inner', 'sold'), E('inner') + .1, 70, 360, 'PART 1 · GAS STATION', 'THE CASHIER', 'GRANT\'S PARTNER?') }),
  share: beats([['t3', .5, .42, 1.15, { tr: 'whip', move: 'right' }], ['q1b', .5, .45, 1.2, { tr: 'crash' }]],
    { cuts: () => [at('share', 'still')],
      after: t => pill('SEND THIS TO THEM ↗', 1520, t, S('share') + .1, { bg: C.white, fg: C.navy, bob: true, t1: E('share') }) }),
  // open loop before the vote: Monday 9 AM
  monday: beats([['u6', .5, .5, 1.05, { tr: 'dip', move: 'in' }], ['u6', .4, .5, 1.4, { tr: 'crash' }], ['u6', .45, .58, 1.9, { tr: 'red', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('monday', 'grant'), at('monday', 'one')],
      after: t => notif(t, at('monday', 'calendar') - .1, E('monday') + .1, 360, 'CALENDAR · MONDAY 9:00 AM', 'Meeting: Grant, HR, ???', 'Room 4B · Attendance required', { icon: '#FF9500', glyph: '▦' }) }),
  choice: beats([['u7', .5, .45, 1.1, { tr: 'flash', move: 'in' }], ['t4', .5, .4, 1.15, { tr: 'whip' }]],
    { cuts: () => [at('choice', 'or')],
      after: t => choiceBoxes(t, S('choice') + .1, CHOICES, 'COMMENT TRUST OR POLICE', S('choice') + 3.1) }),
  cta: beats([['u7', .5, .4, 1.35, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('COMMENT: TRUST or POLICE', 1520, t, S('cta'), { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, at('cta', 'follow') - .1); } }),
  end: { img: true, draw(t, lt) {
    drawImg('u6', [.5, .5, 1.2]);
    ctx.fillStyle = 'rgba(4,6,14,.7)'; ctx.fillRect(0, 0, W, H);
    mono('NOBODY CAN KNOW', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('PART 7', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('MONDAY, 9 A.M.', W / 2, 1010, 70, C.red, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

// ---- HUD: EXPOSED dips when the number is locked, then jumps when Grant's number shows up ----
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'end']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = S('lock') + .2, e2 = at('grant', 'its');
  let exposed = 96;
  if (t >= e1) exposed = count(t, e1, .6, 96, 88);
  if (t >= e2) exposed = count(t, e2, .5, 88, 99);
  const blink = t > e2 && t < e2 + 1.4 ? Math.max(0, Math.sin((t - e2) * Math.PI * 4)) : 0;
  return { cash: 13.86e6, spent: 0, exposed, label: 'DAY 6 · SUNDAY', cashFlash: 0, expFlash: blink, expRed: t > e2 };
}

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('hit', 0, .7); add('money_count', 0, .7, .4); add('stamp', H_('nobody'), .7);
  add('ring', H_('phone') - .15, .45, .8); add('beep', H_('phone') + .1, .5);
  add('glitch', H_('someone'), .4); add('thump', H_('pretending'), .6);
  add('static', S('rep'), .25); add('click', S('rep') + .05, .4);
  add('typewriter', S('lock') + .05, .4, .6); add('fill', S('lock') + .2, .55, .7);
  add('paper', at('fact', 'nobody') - .1, .4);
  add('knock', at('rule', 'rule'), .6); add('fill', at('rule', 'lock'), .45, .5);
  add('glitch', S('dead'), .6); add('buzz', S('dead') + .1, .6, .6); add('hit', at('dead', 'lost'), .7);
  add('silence', S('callback') - .1, .4); add('typewriter', at('callback', 'number'), .45, 1.2);
  add('drone', S('grant'), .5, 4); add('stamp', at('grant', 'its'), .8); add('hit', at('grant', 'its'), .8);
  add('heartbeat', S('inner'), .55, 3); add('thud', at('inner', 'sold'), .6);
  add('click', S('share') + .1, .5);
  add('ring', at('monday', 'calendar') - .05, .3, .5); add('beep', at('monday', 'calendar') + .2, .5);
  add('tick', at('monday', 'monday'), .5); add('thump', at('monday', 'grant'), .5); add('thump', at('monday', 'one'), .7);
  add('thump', S('choice') + .1, .7); add('click', S('choice') + .35, .5); add('click', S('choice') + .65, .5);
  add('click', at('cta', 'follow') - .1, .8);
  add('hit', S('end'), .7);
  return ev.sort((a, b) => a.t - b.t);
}
