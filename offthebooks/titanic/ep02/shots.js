// LAST NIGHT ON THE TITANIC — Part 2 "Thief" (RUN won 5–0; vote: JUMP / TALK).
// Rules from P1 + NCK P2/P6 data: the new event is the first sentence (no recap), 42 s, no CTA in the middle,
// open loop (bowler hat tips his hat) BEFORE the vote, vote ≤3 s, CTA last ~2 s, every cut a different transition.
/*UI*/

loadImages(['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'ti4', 'ti5', 'ti13', 'ti17', 'ti18', 'ti20', 'ti27', 'ti28', 'ti30']);
const NO_CAPTION = new Set(['end']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4];

// ---- story clock continues from Part 1: 1:45:00 left (12:35 AM); the deck scene jumps to 12:45 ----
const JUMPS = () => [['road', 5 * 60], ['deck', 5 * 60]];
function clockSecs(t) {
  let s = 1 * 3600 + 45 * 60 - t;
  for (const [id, j] of JUMPS()) s -= j * easeInOut(prog(t, S(id), .6));
  return Math.max(0, s);
}
const hms = s => { s = Math.floor(s); return `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function danger(t) {
  const steps = [['water', 93], ['deck', 78], ['lady', 99]];
  let v = 88;
  for (const [id, to] of steps) { const k = easeOut(prog(t, S(id) + .2, .6)); if (k > 0) v = lerp(v, to, k); }
  return v;
}
const HUD_OFF = new Set(['choice', 'cta', 'end']);
function HUD() { return null; }
window.OVERLAY_EXTRA = (t, id) => {
  if (HUD_OFF.has(id)) return;
  const jumping = JUMPS().some(([j]) => t > S(j) && t < S(j) + .9);
  ctx.save();
  hudBox(40, 470, 'THE SHIP SINKS IN', hms(clockSecs(t)), { flash: jumping ? Math.abs(Math.sin(t * 14)) : 0, flashColor: C.red, color: jumping ? C.red : C.white });
  const d = danger(t), hot = d > 80;
  hudBox(526, 514, 'DANGER', Math.round(d) + '%', { color: hot && (t * 2 % 1) < .5 ? C.red : d > 50 ? C.gold : C.white, bar: d / 100, flash: hot ? .5 : 0, flashColor: C.red });
  ctx.restore();
};

function slam(lines, t, t0, y, t1 = Infinity) {
  const k = clamp((t - t0) / .15) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  const s = lerp(1.5, 1, easeOut(clamp((t - t0) / .15)));
  ctx.save(); ctx.globalAlpha = k;
  lines.forEach(([str, col], i) => withT(W / 2, y + i * 140, s, -.03, () =>
    text(str, 0, 0, 128, col, { stroke: '#05070F', strokeW: 22, shadow: 'rgba(0,0,0,.8)', shadowBlur: 30 })));
  ctx.restore();
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}

const CHOICES = [['JUMP', 'Leap into the lifeboat. With the bag.'], ['TALK', 'Tell the officer the truth. Lose the bag?']];
const H_ = w => at('hook', w);

const SHOTS = {
  // frame 0: the grab. Bright terrified face, hard hit, "HE FOUND YOU."
  hook: beats([['v1', .55, .42, 1.0, { tr: 'crash', shake: 1, rot: -3 }], ['ti28', .5, .45, 1.05, { tr: 'flash', move: 'out', fx: 'sway' }],
    ['ti4', .5, .5, 1.1, { tr: 'whip', move: 'in' }], ['ti17', .5, .45, 1.15, { tr: 'glitch', move: 'crash' }], ['v1', .5, .35, 1.5, { tr: 'red', shake: 1, rot: 4 }]],
    { cuts: () => [H_('titanic'), H_('diamonds'), H_('man'), H_('grabbed')],
      after: t => { slam([['HE FOUND', C.white], ['YOU.', C.red]], t, -.2, 990, H_('titanic'));
        if (t < 2.5) mono('PART 2 · FICTION INSPIRED BY REAL EVENTS', W / 2, 1830, 22, 'rgba(255,255,255,.7)', { spacing: 3 }); } }),
  run: beats([['w1', .5, .45, 1.05, { tr: 'impact', move: 'crash', rot: -5 }], ['ti18', .5, .45, 1.05, { tr: 'smash', move: 'in' }]],
    { cuts: () => [at('run', 'run')],
      after: t => commentCard(t, S('run') + .05, 'TOP COMMENT · PART 1', 'Run of course 🏃', 1000, at('run', 'run') + .5, 5) }),
  water: beats([['w2', .5, .5, 1.05, { tr: 'smash', move: 'in', shake: .6 }], ['v2', .45, .4, 1.3, { tr: 'impact', fx: 'flicker' }]],
    { cuts: () => [at('water', 'water')], tint: ICE,
      after: t => infoBox(t, at('water', 'minus') - .1, E('water') + .2, 1000, 'REAL · NORTH ATLANTIC, 1912', 'SEA WATER: −2°C (28°F)', { size: 56, type: true, cps: 30, w: 920 }) }),
  fact: beats([['ti13', .5, .55, 1.15, { tr: 'whip', move: 'left', fx: 'flicker' }], ['v2', .5, .55, 1.3, { tr: 'dip', move: 'in' }]],
    { cuts: () => [at('fact', 'minutes')], tint: ICE,
      after: t => overlayTag(t, S('fact') + .05, 'REAL FACT', 'Minutes,', 'not hours.', 'Water that cold causes cold shock and hypothermia fast.') }),
  road: beats([['v3', .5, .5, 1.05, { tr: 'whip', move: 'in' }], ['v3', .5, .45, 1.45, { tr: 'crash', shake: .5 }]],
    { cuts: () => [at('road', 'secret')],
      after: t => nameTag(t, at('road', 'scotland') - .05, E('road') + .1, 70, 360, 'REAL PLACE', 'SCOTLAND ROAD', 'E-DECK · THE CREW\'S LONG CORRIDOR') }),
  deck: beats([['v4', .5, .45, 1.05, { tr: 'flash', move: 'up' }], ['ti30', .5, .5, 1.1, { tr: 'whip', move: 'down', fx: 'sway' }], ['ti20', .5, .55, 1.15, { tr: 'dip', move: 'out', fx: 'sway' }]],
    { cuts: () => [at('deck', 'boat'), at('deck', 'first')],
      after: t => infoBox(t, at('deck', 'half') - .15, E('deck') + .2, 1000, 'REAL · LIFEBOAT 7, THE FIRST ONE DOWN', '28 PEOPLE · 65 SEATS', { size: 60, type: true, cps: 26, w: 940 }) }),
  see: beats([['ti27', .5, .45, 1.05, { tr: 'crash', move: 'in' }], ['v5', .5, .4, 1.1, { tr: 'flash', move: 'crash' }]],
    { cuts: () => [at('see', 'shes')] }),
  lady: beats([['v5', .5, .35, 1.4, { tr: 'impact', move: 'crash', fx: 'pulse' }], ['v5', .45, .3, 1.9, { tr: 'smash', rot: -4 }]],
    { cuts: () => [at('lady', 'stole')], tint: RED,
      after: t => stamp('THIEF!', W / 2, 1040, 130, C.red, pop(t, at('lady', 'stole'), .3), -.08) }),
  officer: beats([['w4', .5, .45, 1.05, { tr: 'impact', move: 'crash', rot: 3 }], ['v6', .5, .45, 1.1, { tr: 'whip', shake: .6 }]],
    { cuts: () => [at('officer', 'stop')],
      after: t => nameTag(t, S('officer') + .05, E('officer') + .1, 70, 360, 'SHIP\'S OFFICER', 'BOAT DECK', 'EVERYONE IS STARING AT YOU') }),
  inner: beats([['w3', .5, .45, 1.1, { tr: 'glitch', move: 'crash', fx: 'pulse' }], ['v6', .62, .5, 1.7, { tr: 'smash', fx: 'pulse' }]],
    { cuts: () => [at('inner', 'up')], tint: ICE }),
  // open loop before the vote
  loop: beats([['v7', .45, .3, 1.35, { tr: 'dip', move: 'in' }], ['w5', .5, .5, 1.1, { tr: 'impact', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('loop', 'tips')],
      after: t => nameTag(t, at('loop', 'tips'), E('loop') + .1, 70, 360, '???', 'THE BOWLER HAT', 'THEY\'RE TOGETHER') }),
  choice: beats([['v8', .5, .45, 1.05, { tr: 'flash', move: 'in', fx: 'sway' }], ['w6', .5, .5, 1.1, { tr: 'smash', move: 'down', shake: .5 }]],
    { cuts: () => [at('choice', 'or')],
      after: t => choiceBoxes(t, S('choice') + .1, CHOICES, 'COMMENT JUMP OR TALK', S('choice') + 3.0) }),
  cta: beats([['v8', .5, .35, 1.45, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('COMMENT: JUMP or TALK', 1520, t, S('cta'), { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, at('cta', 'follow') - .1); } }),
  end: { img: true, draw(t, lt) {
    drawImg('v7', [.45, .3, 1.45]);
    ctx.fillStyle = 'rgba(4,6,14,.68)'; ctx.fillRect(0, 0, W, H);
    mono('LAST NIGHT ON THE TITANIC', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('PART 3', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('JUMP or TALK?', W / 2, 1010, 74, C.gold, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('boom', 0, .9); add('hit', 0, .7); add('cloth', .05, .7);
  add('groan', H_('titanic') - .05, .6, 1.6); add('money_count', H_('diamonds'), .45, .35); add('glitch', H_('man'), .45); add('hit', H_('grabbed'), .7);
  add('heartbeat', S('run'), .5, 2); add('hit', S('run'), .7); add('cloth', S('run'), .7); add('click', S('run') + .1, .45); add('step', at('run', 'run'), .6); add('step', at('run', 'run') + .25, .55); add('step', at('run', 'run') + .5, .5);
  add('water', S('water'), .85, 3); add('thump', S('water'), .6); add('typewriter', at('water', 'minus'), .35, .8);
  add('drone', S('fact'), .45, 3.5); add('paper', S('fact') + .1, .35);
  for (let i = 0; i < 6; i++) add('step', S('road') + i * .4, .5);
  add('tick', S('road') + .05, .6); add('thump', at('road', 'secret'), .5);
  add('metal', S('deck'), .55); add('tick', S('deck') + .05, .6); add('horn', at('deck', 'boat') - .05, .45, 1.4); add('typewriter', at('deck', 'half') - .1, .35, .9);
  add('hit', at('see', 'shes'), .7);
  add('silence', S('lady') - .1, .3); add('stamp', at('lady', 'stole'), .8); add('hit', at('lady', 'stole'), .7);
  add('thud', S('officer'), .7); add('hit', S('officer'), .5); add('cloth', S('officer') + .05, .6);
  add('heartbeat', S('inner'), .7, 1.6); add('glitch', S('inner'), .45);
  add('drone', S('loop'), .55, 4); add('hit', at('loop', 'tips'), .7); add('glitch', at('loop', 'tips'), .4);
  add('thump', S('choice') + .1, .7); add('click', S('choice') + .35, .5); add('click', S('choice') + .65, .5);
  add('click', at('cta', 'follow') - .1, .8);
  add('hit', S('end'), .7); add('horn', S('end') + .1, .35, 1.0);
  return ev.sort((a, b) => a.t - b.t);
}
