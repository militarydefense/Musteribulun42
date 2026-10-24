// LAST NIGHT ON THE TITANIC — Part 1 "The Bag" (vote: STAY / RUN).
// Part 3 formula: "you" + the whole premise in the first sentence, bright face + ticking countdown on frame 0,
// karaoke captions, real facts on top of scenes, no black title card, no whoosh.
// New for this series: a story clock (SINKS IN) that jumps forward between scenes, and a DANGER bar.
/*UI*/

loadImages(['ti1', 'ti2', 'ti3', 'ti4', 'ti5', 'ti6', 'ti7', 'ti8', 'ti9', 'ti10',
  'ti11', 'ti12', 'ti13', 'ti14', 'ti15', 'ti16', 'ti17', 'ti18', 'ti19', 'ti20']);
const NO_CAPTION = new Set(['end']);
const SEPIA = ['#C8A060', .55], ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4];

// ---- story clock: 2:40:00 at the hook, real seconds tick, and it jumps forward between scenes ----
const JUMPS = () => [['water', 12 * 60], ['gate', 10 * 60], ['back', 8 * 60], ['stairs', 5 * 60]];
function clockSecs(t) {
  let s = 2 * 3600 + 40 * 60 - t;
  for (const [id, j] of JUMPS()) s -= j * easeInOut(prog(t, S(id), .6));
  return Math.max(0, s);
}
const hms = s => { s = Math.floor(s); return `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function danger(t) {
  const steps = [['time', 12], ['water', 35], ['seats', 52], ['aboard', 64], ['gate', 74], ['lady2', 86], ['stairs', 95]];
  let v = 0;
  for (const [id, to] of steps) { const k = easeOut(prog(t, S(id) + .2, .6)); if (k > 0) v = lerp(v, to, k); }
  return v;
}
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'man', 'end']);
function HUD() { return null; }
window.OVERLAY_EXTRA = (t, id) => {
  if (HUD_OFF.has(id)) return;
  const k = easeOut(prog(t, S('time'), .3));
  const jumping = JUMPS().some(([j]) => t > S(j) && t < S(j) + .9);
  ctx.save(); ctx.globalAlpha = k;
  hudBox(40, 470, 'THE SHIP SINKS IN', hms(clockSecs(t)), { flash: jumping ? Math.abs(Math.sin(t * 14)) : 0, flashColor: C.red, color: jumping ? C.red : C.white });
  const d = danger(t), hot = d > 80;
  hudBox(526, 514, 'DANGER', Math.round(d) + '%', { color: hot && (t * 2 % 1) < .5 ? C.red : d > 50 ? C.gold : C.white, bar: d / 100, flash: hot ? .5 : 0, flashColor: C.red });
  ctx.restore();
};

// ---- local overlays ----
function sinksIn(t, t1) {  // frame-0 countdown, big in the middle
  const k = clamp((t1 - t) / .2);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const sc = lerp(1.12, 1, easeOut(clamp(t / .25)));
  ctx.translate(W / 2, 1080); ctx.scale(sc, sc); ctx.translate(-W / 2, -1080);
  rr(60, 930, W - 120, 300, 28); ctx.fillStyle = 'rgba(6,8,18,.84)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = (t * 2 % 1) < .5 ? C.red : C.gold; ctx.stroke();
  mono('THE TITANIC SINKS IN', W / 2, 1000, 36, C.gold, { weight: 700, spacing: 8 });
  text(hms(2 * 3600 + 40 * 60 - t), W / 2, 1140, 168, C.white, { font: MONO, weight: 700, shadow: 'rgba(229,72,77,.6)', shadowBlur: 34 });
  ctx.restore();
}
function sepiaChip(t, t0, t1, str) {
  const k = fadeIn(t, t0, t1, .2);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = `800 40px ${SANS}`;
  const w = ctx.measureText(str).width + 70;
  rr(W / 2 - w / 2, 340, w, 76, 38); ctx.fillStyle = 'rgba(60,40,15,.85)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#E8C98A'; ctx.stroke();
  text(str, W / 2, 380, 40, '#F3DEAF', { weight: 800 });
  ctx.restore();
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}

const CHOICES = [['STAY', 'Wait at the gate. Keep it hidden.'], ['RUN', 'Find another way up. With the bag.']];
const H_ = w => at('hook', w);

const SHOTS = {
  // 0–6 s: a hit on frame 0 and a new picture every ~1 s, the countdown stays on top until "and"
  hook: beats([['ti10', .5, .4, 1.0, { tr: 'crash', shake: 1 }], ['ti19', .6, .45, 1.1, { tr: 'flash', move: 'in', rot: -4 }],
    ['ti1', .5, .5, 1.05, { tr: 'whip', move: 'out', fx: 'sway' }], ['ti12', .5, .45, 1.1, { tr: 'crash', move: 'in' }],
    ['ti4', .5, .5, 1.1, { tr: 'flash', move: 'crash' }], ['ti10', .5, .3, 1.6, { tr: 'red', move: 'in', rot: 3 }]],
    { cuts: () => [H_('minutes'), H_('titanic'), H_('holding'), H_('fortune'), H_('isnt')],
      after: t => {
        sinksIn(t, at('hook', 'and', 1));
        if (t < 3) mono('FICTION INSPIRED BY REAL EVENTS', W / 2, 1830, 22, 'rgba(255,255,255,.7)', { spacing: 4 });
        stamp('NOT YOURS.', W / 2, 760, 110, C.red, pop(t, H_('isnt'), .3), -.06);
      } }),
  time: beats([['ti14', .5, .3, 1.15, { tr: 'dip', move: 'in' }], ['ti14', .52, .3, 1.7, { tr: 'crash' }],
    ['ti15', .5, .4, 1.05, { tr: 'whip', move: 'up' }], ['ti19', .6, .45, 1.1, { tr: 'flash', shake: 1, rot: -5, fx: 'sway' }]],
    { cuts: () => [at('time', 'eleven'), at('time', 'the'), at('time', 'iceberg')], shake: t => t > at('time', 'iceberg') ? clamp(1 - (t - at('time', 'iceberg')) / 1.2) : 0,
      after: t => infoBox(t, S('time') + .1, at('time', 'the'), 1000, 'SUNDAY NIGHT', 'APRIL 14, 1912 · 11:40 PM', { size: 54, type: true, cps: 30, w: 900 }) }),
  you: beats([['ti2', .5, .4, 1.0, { tr: 'shake', fx: 'flicker', rot: -4 }], ['ti2', .5, .35, 1.4, { tr: 'crash', fx: 'flicker' }]],
    { cuts: () => [at('you', 'the')],
      after: t => nameTag(t, S('you') + .05, E('you') + .1, 70, 360, 'THIS IS YOU', 'TOMMY', '3RD CLASS · BOTTOM OF THE SHIP') }),
  flash: beats([['ti11', .5, .4, 1.0, { tr: 'flash', move: 'right' }], ['ti11', .45, .3, 1.35, { tr: 'whip', move: 'left' }],
    ['ti3', .5, .45, 1.05, { tr: 'crash', move: 'in' }]],
    { cuts: () => [at('flash', 'ran'), at('flash', 'pushed')], tint: SEPIA,
      after: t => sepiaChip(t, S('flash'), E('lady1') + .05, '10 MINUTES AGO') }),
  lady1: beats([['ti3', .32, .25, 1.7, { move: 'in', fx: 'pulse' }], ['ti3', .55, .55, 1.6, { tr: 'dip', move: 'down' }]],
    { cuts: () => [at('lady1', 'ill')], tint: SEPIA,
      after: t => { sepiaChip(t, S('flash'), E('lady1') + .05, '10 MINUTES AGO');
        nameTag(t, S('lady1') + .05, E('lady1'), 70, 450, 'FIRST CLASS', 'A STRANGER', 'YOU DON\'T KNOW HER NAME'); } }),
  open: beats([['ti12', .5, .45, 1.1, { tr: 'flash', move: 'crash', fx: 'pulse' }]]),
  diam: beats([['ti4', .5, .45, 1.0, { tr: 'flash', move: 'out' }], ['ti12', .5, .55, 1.4, { tr: 'crash' }]], { cuts: () => [at('diam', 'enough')],
    after: t => infoBox(t, at('diam', 'enough'), E('diam') + .1, 1000, 'IN YOUR HANDS', 'A WHOLE STREET IN NEW YORK', { size: 50, type: true, cps: 34, w: 920 }) }),
  water: beats([['ti6', .5, .6, 1.05, { tr: 'dip', move: 'down', fx: 'flicker' }], ['ti13', .5, .5, 1.0, { tr: 'whip', move: 'in' }],
    ['ti13', .5, .75, 1.35, { move: 'down', rot: 4, fx: 'flicker' }]],
    { cuts: () => [at('water', 'a'), at('water', 'sliding')], tint: ICE }),
  fact0: beats([['ti5', .5, .45, 1.0, { tr: 'whip', move: 'right', fx: 'sway' }], ['ti20', .5, .5, 1.05, { move: 'down' }]], { cuts: () => [at('fact0', 'knows')],
    after: t => pill('NOBODY ON BOARD KNOWS YET', 1520, t, S('fact0') + .1, { bg: C.gold, fg: C.navy }) }),
  seats: beats([['ti20', .5, .55, 1.15, { move: 'out', fx: 'sway' }], ['ti5', .6, .5, 1.2, { tr: 'crash' }]], { cuts: () => [at('seats', 'people')],
    after: t => { overlayTag(t, S('seats'), 'REAL FACT · 1912', '', '', '');
      bigCounter(t, S('seats') + .1, E('seats') + .05, 'LIFEBOAT SEATS', t => Math.round(count(t, S('seats') + .3, 1.6, 0, 1178, easeOut)).toLocaleString('en-US')); } }),
  aboard: beats([['ti1', .45, .45, 1.05, { tr: 'whip', move: 'out', fx: 'sway' }], ['ti5', .4, .5, 1.25, { tr: 'red', move: 'in' }]], { cuts: () => [at('aboard', 'on')],
    after: t => {
      bigCounter(t, S('aboard'), E('aboard') + .3, 'PEOPLE ON BOARD', t => Math.round(count(t, S('aboard') + .2, 1.2, 1178, 2224, easeOut)).toLocaleString('en-US'));
      pill('1,046 WITHOUT A SEAT', 1000, t, at('aboard', 'this'), { bg: C.red, fg: C.white, t1: E('aboard') + .3 });
    } }),
  gate: beats([['ti18', .5, .45, 1.0, { tr: 'crash', shake: 1, move: 'in' }], ['ti7', .5, .5, 1.05, { tr: 'shake', move: 'crash' }]], { cuts: () => [at('gate', 'the', 1)] }),
  steward: beats([['ti7', .58, .42, 1.35, { move: 'in', rot: -3 }], ['ti7', .58, .35, 1.6, { tr: 'crash', rot: 3, shake: .6 }]], { cuts: () => [at('steward', 'there')],
    after: t => nameTag(t, S('steward') + .05, E('steward') + .1, 70, 360, 'CREW', 'THE STEWARD', 'HE WON\'T OPEN THE GATE') }),
  late: beats([['ti7', .3, .35, 1.5, { tr: 'dip', move: 'left' }], ['ti5', .5, .5, 1.1, { move: 'out', fx: 'sway' }]], { cuts: () => [at('late', 'reached')],
    tint: ['#506080', .35],
    after: t => overlayTag(t, S('late'), 'REAL FACT', 'They reached the deck', 'too late.', 'Third class had the lowest survival rate.') }),
  back: beats([['ti8', .5, .45, 1.0, { tr: 'dip', move: 'in' }], ['ti8', .35, .3, 1.5, { tr: 'crash', fx: 'pulse' }]], { cuts: () => [at('back', 'but')] }),
  lady2: beats([['ti8', .4, .35, 1.25, { move: 'in', fx: 'pulse' }], ['ti16', .5, .4, 1.05, { tr: 'whip', fx: 'flicker' }],
    ['ti16', .45, .3, 1.5, { tr: 'crash', rot: -4, fx: 'pulse' }], ['ti7', .6, .4, 1.3, { tr: 'glitch', move: 'crash', rot: 5 }]],
    { cuts: () => [at('lady2', 'hide'), at('lady2', 'trust'), at('lady2', 'uniform')],
      after: t => { if (t > at('lady2', 'uniform')) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .5; ctx.fillStyle = '#C0262D'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        stamp('NO UNIFORMS.', W / 2, 1020, 90, C.red, pop(t, at('lady2', 'uniform'), .3), .05); } }),
  inner: beats([['ti16', .45, .35, 1.35, { move: 'in' }], ['ti10', .5, .45, 1.15, { tr: 'dip', move: 'in', fx: 'pulse' }]], { cuts: () => [at('inner', 'diamonds')], tint: ICE }),
  choice: beats([['ti10', .5, .42, 1.1, { move: 'in' }], ['ti13', .5, .45, 1.1, { tr: 'whip', move: 'left' }], ['ti18', .5, .45, 1.05, { tr: 'whip', move: 'in' }]],
    { cuts: () => [at('choice', 'stay'), at('choice', 'run')],
      after: t => choiceBoxes(t, S('choice') + .3, CHOICES, 'COMMENT STAY OR RUN') }),
  cta: beats([['ti2', .5, .4, 1.1, { tr: 'flash', fx: 'flicker' }], ['ti16', .5, .4, 1.15, { tr: 'whip' }], ['ti10', .5, .4, 1.2, { tr: 'crash' }]],
    { cuts: () => [at('cta', 'the'), at('cta', 'follow')],
      after: t => { choiceBoxes(t, S('choice') + .3, CHOICES, 'COMMENT STAY OR RUN'); followBtn(t, at('cta', 'follow') - .1); } }),
  // open loop: the man in the bowler hat
  stairs: beats([['ti9', .5, .35, 1.0, { tr: 'dip', move: 'up' }], ['ti9', .5, .2, 1.7, { tr: 'crash' }], ['ti9', .5, .75, 1.35, { move: 'down', fx: 'flicker' }]],
    { cuts: () => [at('stairs', 'bag'), at('stairs', 'stairs')], push: .1,
      after: t => nameTag(t, at('stairs', 'is') + .1, E('stairs') + .1, 70, 360, '???', 'THE BOWLER HAT', 'HE WANTS THE BAG') }),
  man: beats([['ti17', .5, .45, 1.2, { tr: 'glitch', move: 'in', fx: 'pulse' }]]),
  end: { img: true, draw(t, lt) {
    drawImg('ti17', [.5, .45, 1.32]);
    ctx.fillStyle = 'rgba(4,6,14,.6)'; ctx.fillRect(0, 0, W, H);
    mono('LAST NIGHT ON THE TITANIC', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .3)) });
    text('PART 2', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .3)) });
    text('STAY or RUN?', W / 2, 1020, 80, C.gold, { alpha: easeOut(prog(lt, .25, .3)) });
  } },
};

// ---- sound: ship sounds + per-element sounds, no whooshes ----
function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('boom', 0, .9); add('hit', 0, .6); add('hit', H_('minutes'), .45); add('horn', H_('titanic') - .05, .7, 2.0);
  add('thump', H_('holding'), .6); add('money_count', H_('fortune'), .5, .4);
  for (let i = 1; i < 5; i++) add('tick', i * 1.0, .4);
  add('stamp', H_('isnt'), .7); add('thump', H_('isnt'), .5);
  add('typewriter', S('time') + .1, .4, 1.2);
  add('bell3', at('time', 'the') - .05, .7);
  add('groan', at('time', 'iceberg') - .1, .9, 2.4); add('boom', at('time', 'iceberg'), .9);
  add('thud', S('you') + .05, .5); add('typewriter', S('you') + .15, .3, .6);
  add('step', at('flash', 'ran'), .5); add('step', at('flash', 'ran') + .3, .45); add('cloth', at('flash', 'pushed'), .6);
  add('drone', S('lady1') - .1, .45, 3);
  add('silence', S('open') - .3, .5); add('heartbeat', S('open') - .3, .7, 1.6);
  add('money_count', at('diam', 'diamonds') - .05, .7, .7); add('fill', at('diam', 'enough') + .1, .4, .6);
  add('water', S('water'), .8, 4.2); add('tick', S('water') + .05, .7); add('groan', at('water', 'sliding'), .6, 2.0);
  add('click', S('fact0') + .1, .5);
  add('fill', S('seats') + .3, .55, 1.4); add('fill', S('aboard') + .2, .55, 1.0); add('thump', at('aboard', 'this'), .7);
  add('step', S('gate'), .5); add('step', S('gate') + .25, .5); add('step', S('gate') + .5, .5);
  add('gate', at('gate', 'shut') - .05, .9); add('thump', S('gate'), .5); add('tick', S('gate') + .05, .6);
  add('hit', S('steward'), .5);
  add('paper', S('late') + .1, .4); add('drone', S('late'), .45, 4);
  add('tick', S('back') + .05, .6); add('thud', at('back', 'but'), .6);
  add('heartbeat', S('lady2'), .6, 6.5); add('cloth', at('lady2', 'hide'), .6); add('stamp', at('lady2', 'uniform'), .7); add('glitch', at('lady2', 'uniform'), .5); add('thump', at('lady2', 'trust'), .5);
  add('drone', S('inner'), .4, 3);
  add('thump', S('choice') + .3, .7); add('click', S('choice') + .55, .5); add('click', S('choice') + .85, .5);
  add('click', at('cta', 'follow') - .1, .8);
  add('tick', S('stairs') + .05, .6); add('drone', S('stairs'), .6, 5.5);
  for (let i = 0; i < 5; i++) add('step', S('stairs') + .4 + i * .62, .55);
  add('silence', S('man') - .45, .9); add('glitch', S('man'), .45); add('hit', E('man') - .05, .9);
  add('horn', S('end') + .1, .4, 1.2);
  return ev.sort((a, b) => a.t - b.t);
}
