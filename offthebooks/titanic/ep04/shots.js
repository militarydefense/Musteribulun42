// LAST NIGHT ON THE TITANIC — Part 4 "Your Life or the Diamonds" (Part 3 vote got no comments; story continues from
// the hanging boat). Rules from NCK P7 data (§34): spoken question ≤2 s, 2 lines on screen at 0.0 s, motion in frame 0,
// present tense only, vote words that need no backstory (LIFE / DIAMONDS), the vote returns to the opening question.
/*UI*/

loadImages(['z1', 'z2', 'z3', 'z4', 'z5', 'z6']);
const NO_CAPTION = new Set(['hook', 'end']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4], GOLD = ['#E8B04A', .35];

const JUMPS = () => [];
function clockSecs(t) { return Math.max(0, 1 * 3600 + 25 * 60 - t); }
const hms = s => { s = Math.floor(s); return `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function danger(t) {
  const steps = [['down', 92], ['wait', 97], ['feet', 99]];
  let v = 78;
  for (const [id, to] of steps) { const k = easeOut(prog(t, S(id) + .1, .5)); if (k > 0) v = lerp(v, to, k); }
  return v;
}
const HUD_OFF = new Set(['hook', 'choice', 'cta', 'end']);
function HUD() { return null; }
window.OVERLAY_EXTRA = (t, id) => {
  if (HUD_OFF.has(id)) return;
  ctx.save(); ctx.globalAlpha = easeOut(prog(t, S('stuck'), .3));
  hudBox(40, 470, 'THE SHIP SINKS IN', hms(clockSecs(t)), { color: C.white });
  const d = danger(t), hot = d > 90;
  hudBox(526, 514, 'DANGER', Math.round(d) + '%', { color: hot && (t * 2 % 1) < .5 ? C.red : C.gold, bar: d / 100, flash: hot ? .5 : 0, flashColor: C.red });
  ctx.restore();
};

// frame-0 question: 2 lines, fully visible at 0.0 s, low on the frame so Tommy's face stays clear
function question(t, t1) {
  const k = clamp((t1 - t) / .25);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const s = lerp(1.1, 1, easeOut(clamp(t / .25)));
  ctx.translate(W / 2, 1570); ctx.scale(s, s); ctx.translate(-W / 2, -1570);
  rr(60, 1440, W - 120, 260, 26); ctx.fillStyle = 'rgba(5,7,15,.8)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke();
  segText([['YOUR LIFE…', C.white]], W / 2, 1535, 84, 99, 'center');
  segText([['OR THE ', C.white], ['DIAMONDS?', C.gold]], W / 2, 1645, 84, 99, 'center');
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
// the second boat closing in: darkness creeping down from the top
function shadowDown(t, t0, amt) {
  const k = easeOut(prog(t, t0, .8)) * amt;
  if (k <= 0) return;
  const g = ctx.createLinearGradient(0, 0, 0, H * k);
  g.addColorStop(0, 'rgba(0,0,0,.92)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * k);
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1480, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}

const CHOICES = [['LIFE', 'Cut the rope. Fall. Live.'], ['DIAMONDS', 'Wait. Grab her glove.']];

const SHOTS = {
  hook: beats([['z1', .5, .4, 1.05, { tr: 'crash', move: 'in', shake: 1, rot: -3 }], ['z1', .5, .38, 1.12, { tr: 'impact', move: 'crash', rot: 3 }]],
    { cuts: () => [at('hook', 'or')], shake: t => .6 * clamp(1 - t / 1.2), after: t => question(t, E('hook') + .2) }),
  stuck: beats([['z2', .5, .5, 1.05, { tr: 'smash', move: 'down' }], ['z2', .55, .45, 1.6, { tr: 'whip', move: 'in', fx: 'sway' }]],
    { cuts: () => [at('stuck', 'above')], after: t => tag(t, at('stuck', 'feet'), E('stuck') + .1, '60 FT', C.gold, 1560, 90) }),
  lady: beats([['z3', .5, .35, 1.1, { tr: 'glitch', move: 'in' }], ['z3', .5, .45, 1.4, { tr: 'impact', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('lady', 'real')], tint: GOLD, after: t => tag(t, at('lady', 'real'), E('lady') + .1, 'THE REAL DIAMONDS', C.gold, 1700) }),
  shadow: beats([['z1', .5, .4, 1.25, { tr: 'red', move: 'in', fx: 'flicker' }]],
    { tint: RED, after: t => shadowDown(t, S('shadow') + .2, .7) }),
  down: beats([['z4', .5, .5, 1.05, { tr: 'impact', move: 'in', shake: .6 }], ['z4', .5, .5, 1.35, { tr: 'smash', move: 'crash' }]],
    { cuts: () => [at('down', 'right')], tint: RED,
      after: t => overlayTag(t, at('down', 'coming'), 'REAL · LIFEBOATS 13 & 15', 'Boat 13 was almost', 'crushed by Boat 15.', 'They cut the ropes just in time.', E('down') + 1.0) }),
  sailor: beats([['z5', .5, .45, 1.1, { tr: 'smash', move: 'crash', shake: 1, rot: 4 }], ['z5', .45, .6, 1.5, { tr: 'impact', move: 'in' }]],
    { cuts: () => [S('sailor') + (E('sailor') - S('sailor')) / 2], shake: t => .8 * clamp(1 - (t - S('sailor')) / 1.2) }),
  cut: beats([['z6', .5, .3, 1.1, { tr: 'whip', move: 'down' }], ['z6', .55, .7, 1.5, { tr: 'dip', move: 'in', fx: 'sway' }]],
    { cuts: () => [at('cut', 'water')], tint: ICE, after: t => tag(t, at('cut', 'water') - .1, E('cut') + .1, '−2°C', '#8FD3FF', 1450, 130) }),
  lady2: beats([['z3', .48, .4, 1.6, { tr: 'glitch', move: 'crash', fx: 'pulse' }], ['z3', .5, .6, 2.0, { tr: 'smash' }]],
    { cuts: () => [at('lady2', 'rich')], tint: GOLD }),
  wait: beats([['z2', .5, .5, 1.3, { tr: 'impact', move: 'crash', shake: 1 }], ['z4', .5, .5, 1.25, { tr: 'smash', move: 'in' }]],
    { cuts: () => [at('wait', 'crushed')], tint: RED, shake: t => .7 * clamp(1 - (t - S('wait')) / 1.0), after: t => shadowDown(t, S('wait'), .25) }),
  feet: beats([['z1', .5, .4, 1.3, { tr: 'shake', move: 'in', fx: 'pulse' }]],
    { tint: RED, after: t => { shadowDown(t, S('feet') - .3, .3); tag(t, at('feet', 'three'), E('feet') + .2, '3 FEET', C.red, 1560, 90); } }),
  choice: beats([['z4', .5, .45, 1.1, { tr: 'flash', move: 'in' }], ['z6', .5, .5, 1.2, { tr: 'whip' }]],
    { cuts: () => [at('choice', 'or')], after: t => choiceBoxes(t, S('choice'), CHOICES, 'COMMENT LIFE OR DIAMONDS', S('choice') + 3.0) }),
  cta: beats([['z1', .5, .4, 1.3, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('COMMENT: LIFE or DIAMONDS', 1700, t, S('cta'), { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, S('cta') + .5); } }),
  end: { img: true, draw(t, lt) {
    drawImg('z4', [.5, .5, 1.3]);
    ctx.fillStyle = 'rgba(4,6,14,.7)'; ctx.fillRect(0, 0, W, H);
    mono('LAST NIGHT ON THE TITANIC', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('PART 5', W / 2, 880, 150, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('LIFE or DIAMONDS?', W / 2, 1010, 70, C.gold, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('boom', 0, .9); add('hit', 0, .6); add('metal', .05, .7); add('groan', .1, .6, 1.5);
  add('hit', at('hook', 'or'), .7);
  add('metal', S('stuck'), .7); add('groan', S('stuck') + .1, .5, 1.5); add('water', at('stuck', 'ocean'), .4, 1.0);
  add('drone', S('lady'), .45, 3.5); add('money_count', at('lady', 'real'), .45, .4);
  add('glitch', S('shadow'), .4); add('heartbeat', S('shadow'), .55, 2.2);
  add('boom', S('down'), .8); add('metal', at('down', 'coming'), .7); add('groan', at('down', 'coming'), .7, 2.0); add('hit', at('down', 'right'), .9);
  add('paper', at('down', 'coming') + .05, .3);
  add('hit', S('sailor'), .9); add('thump', S('sailor') + .05, .7); add('cloth', S('sailor') + .3, .6);
  add('water', S('cut'), .6, 1.6); add('thump', at('cut', 'water'), .6);
  add('glitch', S('lady2'), .4); add('thump', at('lady2', 'rich'), .6); add('money_count', at('lady2', 'rich'), .4, .4);
  add('metal', S('wait'), .8); add('groan', S('wait'), .8, 1.5); add('hit', at('wait', 'crushed'), .9);
  add('heartbeat', S('feet') - .2, .8, 2.0); add('metal', at('feet', 'left'), .6);
  add('thump', S('choice') + .1, .7); add('click', S('choice') + .35, .5); add('click', S('choice') + .65, .5);
  add('click', S('cta') + .5, .8);
  add('hit', S('end'), .7);
  return ev.sort((a, b) => a.t - b.t);
}
