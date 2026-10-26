// LAST NIGHT ON THE TITANIC — Part 3 "Bait" (JUMP won 3–0; vote: CLIMB / GRAB).
// Fixes from Part 2 data (skip 41%, 100→~60% by 0:03): Part 2 opened with a dark, unknown threat ("a man in a bowler
// hat grabbed your scarf"), four unrelated dark pictures and a vote recap at 0:05. Part 3: one bright action picture on
// frame 0 with the giant countdown (Part 1's best opening), premise + new action in sentence one, no recap anywhere,
// a real fact at 0:09, the twist at 0:21, open loop before the vote, vote ≤3 s, CTA last.
/*UI*/

loadImages(['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'v5', 'w3', 'w5', 'w6', 'v8', 'ti4', 'ti20', 'ti27']);
const NO_CAPTION = new Set(['end']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4], GOLD = ['#E8B04A', .35];

const JUMPS = () => [['stop', 3 * 60]];
function clockSecs(t) {
  let s = 1 * 3600 + 30 * 60 - t;
  for (const [id, j] of JUMPS()) s -= j * easeInOut(prog(t, S(id), .6));
  return Math.max(0, s);
}
const hms = s => { s = Math.floor(s); return `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function danger(t) {
  const steps = [['land', 70], ['coal', 85], ['stop', 97]];
  let v = 60;
  for (const [id, to] of steps) { const k = easeOut(prog(t, S(id) + .2, .6)); if (k > 0) v = lerp(v, to, k); }
  return v;
}
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'end']);
function HUD() { return null; }
window.OVERLAY_EXTRA = (t, id) => {
  if (HUD_OFF.has(id)) return;
  const jumping = JUMPS().some(([j]) => t > S(j) && t < S(j) + .9);
  ctx.save(); ctx.globalAlpha = easeOut(prog(t, S('land'), .3));
  hudBox(40, 470, 'THE SHIP SINKS IN', hms(clockSecs(t)), { flash: jumping ? Math.abs(Math.sin(t * 14)) : 0, flashColor: C.red, color: jumping ? C.red : C.white });
  const d = danger(t), hot = d > 80;
  hudBox(526, 514, 'DANGER', Math.round(d) + '%', { color: hot && (t * 2 % 1) < .5 ? C.red : d > 50 ? C.gold : C.white, bar: d / 100, flash: hot ? .5 : 0, flashColor: C.red });
  ctx.restore();
};

// frame-0 countdown (Part 1 style), lower third so the jumping hero stays visible
function sinksIn(t, t1) {
  const k = clamp((t1 - t) / .2);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const sc = lerp(1.12, 1, easeOut(clamp(t / .25)));
  ctx.translate(W / 2, 1080); ctx.scale(sc, sc); ctx.translate(-W / 2, -1080);
  rr(60, 930, W - 120, 300, 28); ctx.fillStyle = 'rgba(6,8,18,.84)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = (t * 2 % 1) < .5 ? C.red : C.gold; ctx.stroke();
  mono('THE TITANIC SINKS IN', W / 2, 1000, 36, C.gold, { weight: 700, spacing: 8 });
  text(hms(clockSecs(t)), W / 2, 1140, 168, C.white, { font: MONO, weight: 700, shadow: 'rgba(229,72,77,.6)', shadowBlur: 34 });
  ctx.restore();
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}

const CHOICES = [['CLIMB', 'Back up the rope. Face the bowler hat.'], ['GRAB', 'Take the real diamonds from her glove.']];
const H_ = w => at('hook', w);

const SHOTS = {
  // frame 0: bright mid-air jump + giant countdown; one clear action, not a montage
  hook: beats([['x1', .5, .35, 1.05, { tr: 'crash', move: 'down', shake: .6 }], ['v8', .5, .45, 1.15, { tr: 'whip', move: 'down', rot: -4 }],
    ['w6', .5, .5, 1.1, { tr: 'smash', move: 'down' }], ['ti4', .5, .5, 1.1, { tr: 'flash', move: 'crash' }]],
    { cuts: () => [H_('jumped'), H_('lifeboat'), H_('stolen')],
      after: t => { sinksIn(t, H_('jumped'));
        if (t < 2.5) mono('PART 3 · FICTION INSPIRED BY REAL EVENTS', W / 2, 1830, 22, 'rgba(255,255,255,.7)', { spacing: 3 }); } }),
  land: beats([['x2', .5, .55, 1.05, { tr: 'impact', move: 'crash', rot: 4 }], ['x2', .5, .3, 1.45, { tr: 'smash', fx: 'sway' }]],
    { cuts: () => [at('land', 'every')], shake: t => clamp(1 - (t - S('land')) / .8) }),
  fact: beats([['x3', .5, .35, 1.05, { tr: 'flash', move: 'up' }], ['x3', .45, .3, 1.5, { tr: 'impact', shake: .6 }], ['ti20', .5, .55, 1.15, { tr: 'whip', move: 'down', fx: 'sway' }]],
    { cuts: () => [at('fact', 'fired'), at('fact', 'jumping')],
      after: t => overlayTag(t, S('fact') + .05, 'REAL · LIFEBOAT 14', 'An officer fired', 'warning shots.', 'To stop people jumping into a lowering boat.') }),
  next: beats([['x4', .65, .5, 1.25, { tr: 'dip', move: 'left' }], ['v5', .5, .35, 1.3, { tr: 'smash', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('next', 'her')] }),
  lady: beats([['x4', .35, .35, 1.55, { tr: 'glitch', move: 'in', fx: 'pulse' }], ['x4', .6, .4, 1.6, { tr: 'dip', move: 'crash' }]],
    { cuts: () => [at('lady', 'now')], tint: GOLD }),
  open: beats([['x5', .5, .5, 1.25, { move: 'in', fx: 'pulse' }]], { push: .12 }),
  coal: beats([['x5', .5, .5, 1.0, { tr: 'impact', move: 'crash' }]],
    { after: t => stamp('COAL.', W / 2, 1030, 150, C.red, pop(t, at('coal', 'coal'), .3), -.06) }),
  inner: beats([['x9', .5, .4, 1.3, { tr: 'dip', move: 'in', fx: 'flicker' }], ['w3', .5, .45, 1.1, { tr: 'glitch', move: 'crash' }]],
    { cuts: () => [at('inner', 'bait')], tint: ICE }),
  glove: beats([['w5', .5, .5, 1.1, { tr: 'smash', move: 'in' }], ['x6', .5, .62, 1.6, { tr: 'flash', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('glove', 'while')],
      after: t => infoBox(t, at('glove', 'real') - .1, E('glove') + .1, 1000, 'THE REAL DIAMONDS', 'IN HER GLOVE', { size: 72, col: C.gold }) }),
  stop: beats([['x7', .5, .4, 1.1, { tr: 'impact', move: 'crash', rot: -6, shake: 1 }], ['x7', .5, .55, 1.35, { tr: 'shake', fx: 'sway', rot: 5 }]],
    { cuts: () => [at('stop', 'halfway')], shake: t => clamp(1 - (t - S('stop')) / 1.0) }),
  loop: beats([['x8', .5, .45, 1.1, { tr: 'dip', move: 'up' }], ['w5', .5, .5, 1.15, { tr: 'impact', move: 'crash', fx: 'pulse' }], ['x8', .62, .55, 1.6, { tr: 'smash', fx: 'pulse' }]],
    { cuts: () => [at('loop', 'bowler'), at('loop', 'knife')], tint: RED,
      after: t => nameTag(t, at('loop', 'knife') - .05, E('loop') + .1, 70, 360, '???', 'THE BOWLER HAT', 'A KNIFE ON YOUR ROPE') }),
  choice: beats([['x9', .5, .4, 1.1, { tr: 'flash', move: 'in' }], ['x6', .5, .6, 1.35, { tr: 'whip', move: 'crash' }]],
    { cuts: () => [at('choice', 'or')],
      after: t => choiceBoxes(t, S('choice') + .1, CHOICES, 'COMMENT CLIMB OR GRAB', S('choice') + 3.0) }),
  cta: beats([['x9', .5, .32, 1.45, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('COMMENT: CLIMB or GRAB', 1520, t, S('cta'), { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, at('cta', 'follow') - .1); } }),
  end: { img: true, draw(t, lt) {
    drawImg('x8', [.5, .45, 1.3]);
    ctx.fillStyle = 'rgba(4,6,14,.68)'; ctx.fillRect(0, 0, W, H);
    mono('LAST NIGHT ON THE TITANIC', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('PART 4', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('CLIMB or GRAB?', W / 2, 1010, 74, C.gold, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('boom', 0, .9); add('hit', 0, .6); add('horn', .1, .5, 1.6);
  for (let i = 1; i < 3; i++) add('tick', i * .9, .45);
  add('cloth', H_('jumped'), .7); add('hit', H_('lifeboat'), .6); add('metal', H_('lifeboat') + .05, .5); add('money_count', H_('stolen'), .45, .35);
  add('thud', S('land'), .9); add('boom', S('land'), .6); add('water', S('land') + .1, .5, 1.2); add('thump', at('land', 'every'), .6);
  add('hit', at('fact', 'fired'), .8); add('glitch', at('fact', 'fired') + .02, .3); add('paper', S('fact') + .05, .35);
  add('drone', S('next'), .5, 6); add('thump', at('next', 'her'), .7);
  add('heartbeat', S('lady'), .6, 3);
  add('cloth', S('open') + .1, .6); add('silence', S('open') + .4, .9);
  add('stamp', at('coal', 'coal'), .9); add('hit', S('coal'), .8);
  add('glitch', at('inner', 'bait'), .5);
  add('money_count', at('glove', 'real'), .5, .5); add('hit', S('glove'), .5);
  add('metal', S('stop'), .9); add('groan', S('stop'), .8, 2); add('hit', at('stop', 'halfway'), .8);
  add('drone', S('loop'), .6, 3.5); add('hit', at('loop', 'knife'), .8); add('glitch', at('loop', 'bowler'), .4);
  add('thump', S('choice') + .1, .7); add('click', S('choice') + .35, .5); add('click', S('choice') + .65, .5);
  add('click', at('cta', 'follow') - .1, .8);
  add('hit', S('end'), .7);
  return ev.sort((a, b) => a.t - b.t);
}
