// Off The Books — Part 7 "The Trap" (POLICE). Golden rule (§31): frame 0 = a question to the viewer, spoken and on
// screen at the same time; the whole episode answers it and the vote returns to it. Voices: ElevenLabs v3 (natural).
/*UI*/

loadImages(['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8']);
const NO_CAPTION = new Set(['hook', 'end']);
const INNER = new Set(['inner']);
const ICE = ['#3A7BD5', .35], RED = ['#C0262D', .4];

// frame-0 question: huge, centred, readable before anything moves; KNOW and TRAP in red
function question(t, t1) {
  const k = clamp((t1 - t) / .25);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const s = lerp(1.08, 1, easeOut(clamp(t / .3)));
  ctx.translate(W / 2, 1060); ctx.scale(s, s); ctx.translate(-W / 2, -1060);
  rr(50, 800, W - 100, 520, 30); ctx.fillStyle = 'rgba(5,7,15,.82)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke();
  const L = [[['WOULD YOU WALK', C.white]], [['INTO A ROOM', C.white]], [['YOU ', C.white], ['KNOW', C.red]], [['IS A ', C.white], ['TRAP?', C.red]]];
  L.forEach((segs, i) => segText(segs, W / 2, 905 + i * 115, 90, 99, 'center'));
  ctx.restore();
}
function rec(t, t0, t1, dead) {
  if (t < t0 || t > t1) return;
  ctx.save();
  rr(W - 290, 330, 240, 70, 35); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
  const on = !dead && (t * 2 % 1) < .6;
  ctx.fillStyle = dead ? '#555' : on ? C.red : 'rgba(229,72,77,.3)'; ctx.beginPath(); ctx.arc(W - 245, 365, 15, 0, 7); ctx.fill();
  mono(dead ? 'NO SIGNAL' : 'REC', W - 150, 367, 30, dead ? C.grey : C.white, { weight: 700, spacing: 3 });
  ctx.restore();
}
function tag(t, t0, t1, str, col = C.gold, y = 1000) {
  const k = pop(t, t0, .3) * clamp((t1 - t) / .15);
  if (k <= 0) return;
  withT(W / 2, y, k, -.03, () => {
    ctx.font = `900 64px ${SANS}`; const w = ctx.measureText(str).width + 80;
    rr(-w / 2, -55, w, 110, 16); ctx.fillStyle = 'rgba(5,7,15,.85)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    text(str, 0, 6, 64, col);
  });
}
function followBtn(t, t0) {
  const f = pop(t, t0, .4);
  if (f > 0) withT(W / 2, 1150, f * (1 + .05 * Math.sin(t * 8)), 0, () => {
    rr(-300, -70, 600, 140, 70); ctx.fillStyle = C.white; ctx.fill(); text('+ FOLLOW', 0, 5, 72, C.navy);
  });
}
const CHOICES = [['SHOW', 'Put the ticket on the table.'], ['WALK OUT', 'Leave without it. The door is locked.']];

const SHOTS = {
  hook: beats([['y1', .5, .42, 1.05, { tr: 'crash', move: 'in', fx: 'pulse' }]],
    { after: t => question(t, E('hook') + .15) }),
  why: beats([['y2', .5, .45, 1.05, { tr: 'dip', move: 'in' }], ['y5', .5, .3, 1.35, { tr: 'smash', move: 'crash' }], ['y5', .5, .3, 1.1, { tr: 'flash', move: 'out' }], ['y1', .5, .4, 1.3, { tr: 'impact', fx: 'pulse' }]],
    { cuts: () => [at('why', 'your'), at('why', 'man'), at('why', 'they')],
      after: t => { tag(t, at('why', 'your') - .05, at('why', 'man') + .4, 'GRANT · HR · ???', C.white, 1000);
        tag(t, at('why', 'man') + .4, at('why', 'they'), 'THE CASHIER', C.red, 1000); } }),
  station: beats([['y3', .5, .45, 1.05, { tr: 'whip', move: 'right' }]],
    { after: t => tag(t, S('station') + .2, E('station'), '1 HOUR EARLIER · POLICE', C.gold, 520) }),
  det: beats([['y3', .7, .4, 1.5, { tr: 'dip', move: 'in' }], ['y4', .5, .55, 1.1, { tr: 'crash', move: 'in', fx: 'pulse' }]],
    { cuts: () => [at('det', 'go')],
      after: t => { overlayTag(t, S('det') + .05, 'REAL', 'Blackmail is a crime', 'in every U.S. state.', '', at('det', 'go'));
        tag(t, at('det', 'wearing'), E('det') + .2, 'HIDDEN MIC', C.red, 1000); } }),
  walk: beats([['y1', .55, .45, 1.2, { tr: 'smash', move: 'in' }], ['y5', .5, .3, 1.15, { tr: 'impact', move: 'crash' }]],
    { cuts: () => [at('walk', 'you', 1)], after: t => rec(t, at('walk', 'walk'), E('dead') + .3, t > S('dead') + .6) }),
  g1: beats([['y5', .5, .25, 1.6, { tr: 'crash', fx: 'pulse' }], ['y5', .2, .25, 1.6, { tr: 'whip' }]],
    { cuts: () => [at('g1', 'from')], after: t => rec(t, 0, 1e9, false) }),
  hr: beats([['y5', .8, .25, 1.6, { tr: 'whip', move: 'in' }]], { after: t => rec(t, 0, 1e9, false) }),
  inner: beats([['y8', .5, .42, 1.2, { tr: 'dip', move: 'in', fx: 'pulse' }]], { tint: ICE, after: t => rec(t, 0, 1e9, false) }),
  g2: beats([['y6', .5, .3, 1.25, { tr: 'impact', move: 'crash', rot: -3 }], ['y6', .5, .25, 1.55, { tr: 'smash', fx: 'pulse' }]],
    { cuts: () => [at('g2', 'or')], tint: RED, after: t => rec(t, 0, 1e9, false) }),
  win: beats([['y8', .5, .4, 1.1, { tr: 'flash', move: 'out' }]], { after: t => rec(t, 0, 1e9, false) }),
  dead: beats([['y8', .5, .38, 1.3, { tr: 'glitch', move: 'crash', fx: 'flicker' }]],
    { tint: ICE, after: t => rec(t, 0, 1e9, t > S('dead') + .5) }),
  g3: beats([['y6', .5, .4, 1.15, { tr: 'impact', move: 'crash' }]],
    { after: t => { rec(t, 0, 1e9, true); tag(t, S('g3') + .1, E('g3') + .3, 'SIGNAL JAMMER', C.red, 1000); } }),
  lock: beats([['y7', .5, .5, 1.1, { tr: 'smash', move: 'in', shake: .6 }], ['y8', .5, .4, 1.3, { tr: 'dip', move: 'crash', fx: 'pulse' }]],
    { cuts: () => [at('lock', 'locked')], tint: RED,
      after: t => { rec(t, 0, 1e9, true); tag(t, at('lock', 'locked') + .1, E('lock') + .1, 'LOCKED IN', C.red, 1000); } }),
  choice: beats([['y8', .5, .42, 1.1, { tr: 'flash', move: 'in' }], ['y6', .5, .35, 1.2, { tr: 'whip' }]],
    { cuts: () => [at('choice', 'now')],
      after: t => { question(t, 0); choiceBoxes(t, at('choice', 'now') - .1, CHOICES, 'COMMENT SHOW OR WALK OUT', at('choice', 'now') + 3.0); } }),
  cta: beats([['y1', .5, .4, 1.3, { tr: 'crash', fx: 'pulse' }]],
    { after: t => { pill('COMMENT: SHOW or WALK OUT', 1520, t, S('cta'), { bg: C.gold, fg: C.navy, bob: true }); followBtn(t, at('cta', 'follow') - .1); } }),
  end: { img: true, draw(t, lt) {
    drawImg('y7', [.5, .5, 1.25]);
    ctx.fillStyle = 'rgba(4,6,14,.7)'; ctx.fillRect(0, 0, W, H);
    mono('NOBODY CAN KNOW', W / 2, 760, 32, C.gold, { spacing: 8, alpha: easeOut(prog(lt, 0, .2)) });
    text('THE FINALE', W / 2, 880, 130, C.white, { alpha: easeOut(prog(lt, .05, .2)) });
    text('TOMORROW', W / 2, 1010, 74, C.red, { alpha: easeOut(prog(lt, .2, .2)) });
  } },
};

const HUD_OFF = new Set(['hook', 'choice', 'cta', 'end']);
function HUD(t, id) {
  if (HUD_OFF.has(id)) return null;
  const e1 = at('g2', 'half'), e2 = S('dead') + .4;
  let exposed = 96;
  if (t >= e1) exposed = count(t, e1, .5, 96, 70);
  if (t >= e2) exposed = count(t, e2, .5, 70, 99);
  const blink = t > e2 && t < e2 + 1.4 ? Math.max(0, Math.sin((t - e2) * Math.PI * 4)) : 0;
  return { cash: 13.86e6, spent: 0, exposed, label: 'DAY 7 · MONDAY 9:00', cashFlash: 0, expFlash: blink, expRed: t > e2 };
}

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('heartbeat', 0, .55, 3.2); add('drone', 0, .5, 3.5);
  add('hit', S('why'), .6); add('thump', at('why', 'man'), .6); add('stamp', at('why', 'man') + .4, .5);
  add('step', S('station'), .5); add('step', S('station') + .35, .5); add('door', S('station') + .1, .5);
  add('paper', at('det', 'go') - .2, .45); add('cloth', at('det', 'wearing'), .6); add('click', at('det', 'wearing') + .3, .5);
  add('door', S('walk') + .05, .8); add('thud', at('walk', 'walk'), .7); add('rec_beep', at('walk', 'walk') + .15, .7);
  add('silence', S('g1') - .1, .4); add('thump', at('g1', 'stolen'), .5);
  add('knock', S('hr') + .05, .4);
  add('heartbeat', S('inner'), .65, 2);
  add('hit', at('g2', 'half'), .7); add('drone', S('g2'), .5, 2.6);
  add('fill', S('win') + .1, .4, .5);
  add('static', S('dead'), .7, 1.2); add('glitch', S('dead') + .3, .6); add('buzz', S('dead') + .4, .4, .5);
  add('hit', S('g3'), .8); add('beep', S('g3') + .2, .4);
  add('metal', at('lock', 'locked') - .05, .8); add('thud', at('lock', 'locked'), .8); add('silence', at('lock', 'locked') + .1, .5);
  add('thump', at('choice', 'now') - .1, .7); add('click', at('choice', 'now') + .15, .5); add('click', at('choice', 'now') + .45, .5);
  add('click', at('cta', 'follow') - .1, .8);
  add('hit', S('end'), .7);
  return ev.sort((a, b) => a.t - b.t);
}
