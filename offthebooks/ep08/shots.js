// Off The Books — NOBODY CAN KNOW Part 8, the FINALE. Self-contained (§35): a stranger understands it from frame 0,
// the whole story resolves inside the video, no vote. Frame 0 = bright money shot + a 2-line question (≤2.2 s).
/*UI*/

loadImages(['w1', 'w2', 'w3', 'w4', 'w5', 'y5', 'y6', 'y7', 'y8']);
const NO_CAPTION = new Set(['hook', 'rules', 'end']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4], GOLD = ['#E8B04A', .3];

// frame-0 question: middle of the frame, between the faces (top) and the glowing ticket (bottom)
function question(t, t1) {
  const k = clamp((t1 - t) / .25);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const s = lerp(1.08, 1, easeOut(clamp(t / .25))) * (1 + .02 * Math.sin(t * 9));
  ctx.translate(W / 2, 1110); ctx.scale(s, s); ctx.translate(-W / 2, -1110);
  rr(60, 975, W - 120, 270, 26); ctx.fillStyle = 'rgba(5,7,15,.8)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = C.gold; ctx.stroke();
  segText([['$50,000,000', C.gold]], W / 2, 1075, 104, 99, 'center');
  segText([['GIVE HIM ', C.white], ['HALF?', C.red]], W / 2, 1195, 88, 99, 'center');
  ctx.restore();
}
function tag(t, t0, t1, str, col = C.gold, y = 1560, size = 64) {
  const k = pop(t, t0, .3) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  withT(W / 2, y, k, -.03, () => {
    ctx.font = `900 ${size}px ${SANS}`; const w = ctx.measureText(str).width + 80;
    rr(-w / 2, -size * .86, w, size * 1.72, 16); ctx.fillStyle = 'rgba(5,7,15,.85)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    text(str, 0, size * .1, size, col);
  });
}
function rec(t, t0, t1) {
  if (t < t0 || t > t1) return;
  ctx.save();
  rr(W - 290, 330, 240, 70, 35); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
  ctx.fillStyle = (t * 2 % 1) < .6 ? C.red : 'rgba(229,72,77,.3)'; ctx.beginPath(); ctx.arc(W - 245, 365, 15, 0, 7); ctx.fill();
  mono('REC', W - 150, 367, 30, C.white, { weight: 700, spacing: 3 });
  ctx.restore();
}
// a real fact, small and low so faces stay clear
function realLine(t, t0, t1, l1) {
  const k = fadeIn(t, t0, t1, .15);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rr(70, 1690, W - 140, 140, 18); ctx.fillStyle = 'rgba(5,7,15,.88)'; ctx.fill();
  mono('REAL', W / 2, 1730, 24, C.gold, { weight: 700, spacing: 6 });
  text(l1[0], W / 2, 1778, 36, C.white, { weight: 800 });
  text(l1[1], W / 2, 1815, 36, C.white, { weight: 800 });
  ctx.restore();
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1480, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}
const RULES = ['Tell no one.', 'Get a lawyer first.', 'Sign the back of the ticket.', 'No personal logins at work.',
  'Use an app for codes, not texts.', 'Lock your number with your carrier.', 'Claim through a trust, if allowed.'];

const SHOTS = {
  hook: beats([['w1', .5, .45, 1.08, { tr: 'crash', move: 'in', shake: 1 }], ['w1', .5, .45, 1.18, { tr: 'impact', move: 'crash', rot: 3 }]],
    { cuts: () => [at('hook', 'would')], shake: t => .5 * clamp(1 - t / 1), after: t => question(t, E('hook') + .2) }),
  ctx: beats([['y5', .5, .4, 1.05, { tr: 'smash', move: 'in' }], ['w1', .65, .35, 1.5, { tr: 'whip', move: 'right' }]],
    { cuts: () => [at('ctx', 'now')], after: t => tag(t, S('ctx') + .1, at('ctx', 'now'), 'BOSS · HR · CASHIER', C.white) }),
  g: beats([['y6', .5, .3, 1.25, { tr: 'impact', move: 'crash', rot: -3 }]], { tint: RED }),
  walk: beats([['y7', .5, .5, 1.1, { tr: 'smash', move: 'in', shake: .6 }], ['w1', .4, .75, 1.6, { tr: 'flash', move: 'in', fx: 'pulse' }]],
    { cuts: () => [at('walk', 'so')], after: t => tag(t, at('walk', 'locked'), at('walk', 'so'), 'LOCKED', C.red, 1560, 90) }),
  grab: beats([['w2', .5, .45, 1.1, { tr: 'impact', move: 'crash' }]],
    { after: t => stamp('COPY', W / 2, 1530, 170, C.red, pop(t, at('grab', 'freezes'), .3), -.12) }),
  lucky: beats([['y8', .5, .42, 1.15, { tr: 'dip', move: 'in' }], ['y8', .5, .4, 1.4, { tr: 'whip', move: 'crash' }]],
    { cuts: () => [at('lucky', 'real')],
      after: t => { tag(t, at('lucky', 'claimed'), E('lucky') + .2, 'CLAIMED 9 A.M. · TRUST', C.gold, 1560, 58);
        realLine(t, at('lucky', 'trust'), E('lucky') + .4, ['Some U.S. states let you claim a prize', 'through a trust and keep your name private.']); } }),
  grant2: beats([['y6', .5, .45, 1.1, { tr: 'glitch', move: 'in' }]], { tint: RED, after: t => tag(t, S('grant2') + .2, E('grant2'), 'NO RECORDING?', C.red) }),
  hr: beats([['w3', .5, .4, 1.05, { tr: 'flash', move: 'in' }], ['w3', .5, .55, 1.3, { tr: 'smash', move: 'crash' }]],
    { cuts: () => [at('hr', 'company')], after: t => rec(t, at('hr', 'recorded') - .1, E('play') + .2) }),
  play: beats([['w3', .5, .6, 1.25, { tr: 'impact', move: 'in', fx: 'pulse' }], ['w2', .5, .35, 1.3, { tr: 'smash', move: 'crash', shake: 1 }]],
    { cuts: () => [at('play', 'or')], after: t => { rec(t, 0, 1e9); tag(t, at('play', 'or'), E('play') + .2, 'CAUGHT', C.red, 1560, 90); } }),
  knock: beats([['y5', .5, .45, 1.05, { tr: 'dip', move: 'out' }]], {}),
  sec: beats([['w4', .5, .4, 1.05, { tr: 'whip', move: 'in' }], ['w4', .6, .55, 1.45, { tr: 'impact', move: 'crash' }]],
    { cuts: () => [at('sec', 'cashier')], after: t => tag(t, at('sec', 'cashier'), E('sec') + .2, 'HE DID THIS BEFORE', C.red, 1560, 58) }),
  out: beats([['w5', .5, .4, 1.05, { tr: 'flash', move: 'in' }], ['w5', .5, .32, 1.35, { tr: 'dip', move: 'in', fx: 'sway' }]],
    { cuts: () => [at('out', 'and')], tint: GOLD, after: t => tag(t, at('out', 'exactly'), E('out') + .3, 'NOBODY KNOWS.', C.gold, 1600, 80) }),
  rules: { img: true, draw(t, lt) {
    drawImg('w5', [.5, .4, 1.25]);
    ctx.fillStyle = 'rgba(4,6,14,.86)'; ctx.fillRect(0, 0, W, H);
    mono('SAVE THIS', W / 2, 470, 30, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('7 RULES IF YOU EVER WIN', W / 2, 560, 68, C.white, { alpha: easeOut(prog(lt, 0, .2)) });
    RULES.forEach((r, i) => {
      const k = easeOut(prog(lt, .15 + i * .17, .2));
      text(`${i + 1}`, 110, 700 + i * 125, 64, C.gold, { align: 'left', alpha: k });
      text(r, 190, 700 + i * 125, 44, C.white, { align: 'left', alpha: k, weight: 800 });
    });
  } },
  ask: beats([['w5', .5, .4, 1.2, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('ANONYMOUS or TELL EVERYONE? 👇', 1700, t, S('ask') + .1, { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, S('ask') + .8); } }),
  end: { img: true, draw(t, lt) {
    drawImg('w5', [.5, .4, 1.3]);
    ctx.fillStyle = 'rgba(4,6,14,.7)'; ctx.fillRect(0, 0, W, H);
    mono('NOBODY CAN KNOW', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('THE END', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('Follow for the next story', W / 2, 1010, 60, C.gold, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

// ---- HUD: EXPOSED stays at 99% until his own recording plays, then falls to 0% ----
const HUD_OFF = new Set(['hook', 'rules', 'ask', 'end']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e = S('play') + .3;
  const exposed = t < e ? 99 : count(t, e, 1.2, 99, 0);
  return { cash: 50e6, spent: 0, exposed, label: 'MONDAY · 9:40 A.M.', cashFlash: 0, expFlash: 0, expRed: t < e };
}

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('hit', 0, .7); add('money_count', 0, .7, .5); add('thump', at('hook', 'would'), .7);
  add('door', S('ctx') + .05, .5); add('thump', at('ctx', 'now'), .6);
  add('hit', S('g'), .7); add('drone', S('g'), .45, 3);
  add('metal', at('walk', 'locked'), .8); add('thud', at('walk', 'locked') + .05, .6); add('paper', at('walk', 'so') + .2, .5);
  add('paper', S('grab'), .6); add('silence', at('grab', 'freezes') - .1, .8); add('stamp', at('grab', 'freezes'), .9);
  add('glitch', at('lucky', 'real'), .4); add('fill', at('lucky', 'trust'), .5, .6);
  add('static', S('grant2'), .25); add('heartbeat', S('grant2'), .5, 2.5);
  add('click', S('hr') + .1, .6); add('rec_beep', at('hr', 'recorded'), .7);
  add('static', S('play'), .3); add('hit', at('play', 'or'), .9); add('fill', S('play') + .3, .6, 1.2);
  add('knock', S('knock') + .3, .9); add('knock', S('knock') + .6, .9);
  add('door', S('sec'), .7); add('stamp', at('sec', 'cashier'), .6);
  add('step', S('out') + .2, .5); add('step', S('out') + .6, .5); add('bell3', at('out', 'exactly'), .4);
  for (let i = 0; i < 7; i++) add('click', S('rules') + .15 + i * .17, .45);
  add('click', S('ask') + .8, .8);
  add('hit', S('end'), .7);
  return ev.sort((a, b) => a.t - b.t);
}
