// Story: NEW SEASON trailer for Last Night on the Titanic (impact, "history is being rewritten", "their fate is in your hands").
/*UI*/
loadImages(['ti1', 'ti3', 'ti7', 'ti10', 'ti14', 'ti15', 'ti17', 'ti20', 'ti21', 'ti22', 'ti24', 'ti25', 'ti27', 'ti28', 'ti30']);
const NO_CAPTION = new Set(['date', 'impact', 'hist', 'rewrite', 'fate', 'end']);
function HUD() { return null; }

function badge(t) {  // NEW SEASON pill, pulsing red dot
  const k = pop(t, .15, .4);
  if (k <= 0) return;
  withT(W / 2, 320, k * 1.3, 0, () => {
    rr(-230, -44, 460, 88, 44); ctx.fillStyle = C.red; ctx.fill();
    ctx.fillStyle = (t * 2 % 1) < .55 ? '#fff' : 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-175, 0, 13, 0, 7); ctx.fill();
    text('NEW SEASON', 20, 4, 48, C.white, { weight: 900 });
  });
}
function big(lines, t, t0, y = 1180, t1 = Infinity) {  // stacked big words that slam in one after another
  lines.forEach(([str, col, dt], i) => {
    const k = pop(t, t0 + (dt || 0), .3) * clamp((t1 - t) / .15);
    if (k <= 0) return;
    withT(W / 2, y + i * 130, lerp(1.5, 1, clamp(k)), 0, () => text(str, 0, 0, 112, col,
      { stroke: '#05070F', strokeW: 20, shadow: 'rgba(0,0,0,.8)', shadowBlur: 30, alpha: clamp(k * 2) }));
  });
}
window.OVERLAY_EXTRA = (t, id) => { if (id !== 'end') badge(t); };

const SHOTS = {
  date: beats([['ti1', .5, .5, 1.05, { tr: 'dip', move: 'out', fx: 'sway' }], ['ti15', .5, .4, 1.05, { tr: 'whip', move: 'up' }],
    ['ti22', .5, .45, 1.05, { tr: 'crash', rot: -3, fx: 'sway' }]],
    { cuts: () => [at('date', 'nineteen'), at('date', 'twelve')],
      after: t => infoBox(t, S('date') + .05, E('date') + .3, 1000, 'SUNDAY NIGHT', 'APRIL 14, 1912 · 11:40 PM', { size: 54, type: true, cps: 34, w: 900 }) }),
  impact: beats([['ti21', .55, .5, 1.2, { tr: 'flash', move: 'crash', rot: 4, shake: 1 }], ['ti24', .5, .4, 1.05, { tr: 'shake', rot: -6 }],
    ['ti25', .5, .5, 1.05, { tr: 'dip', move: 'out', fx: 'sway' }]],
    { cuts: () => [S('impact') + .55, S('impact') + 1.05], shake: t => clamp(1 - (t - S('impact')) / 1.4),
      after: t => stamp('IMPACT', W / 2, 1000, 120, C.white, pop(t, S('impact') + .02, .25) * clamp((S('impact') + .55 - t) / .1), -.05) }),
  hist: beats([['ti28', .5, .45, 1.05, { tr: 'dip', move: 'out', fx: 'sway' }], ['ti30', .5, .5, 1.1, { move: 'down' }], ['ti20', .5, .55, 1.15, { tr: 'dip', move: 'in' }]],
    { cuts: () => [at('hist', '1500'), at('hist', 'never')], tint: ['#506080', .45],
      after: t => { big([['1,500+', C.red]], t, at('hist', '1500') - .05, 1000);
        if (t > at('hist', 'never')) big([['NEVER MADE IT', C.white], ['HOME.', C.white, .25]], t, at('hist', 'never'), 1200); } }),
  rewrite: beats([['ti14', .5, .3, 1.2, { tr: 'glitch', move: 'in', fx: 'pulse' }], ['ti1', .5, .5, 1.1, { tr: 'glitch', move: 'crash' }]],
    { cuts: () => [at('rewrite', 'rewritten')],
      after: (t) => {
        const t0 = at('rewrite', 'history');
        big([['HISTORY', C.white]], t, t0 - .05, 1000);
        // a red pen strikes through "HISTORY", then REWRITTEN slams in gold
        const s = easeOut(prog(t, at('rewrite', 'rewritten') - .25, .3));
        if (s > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(220, 990); ctx.lineTo(220 + 640 * s, 975); ctx.stroke(); ctx.restore(); }
        big([['IS BEING', C.white], ['REWRITTEN.', C.gold, .2]], t, at('rewrite', 'rewritten'), 1140);
      } }),
  fate: beats([['ti10', .5, .4, 1.15, { tr: 'flash', move: 'crash', fx: 'pulse' }], ['ti3', .32, .25, 1.6, { tr: 'whip', move: 'in' }],
    ['ti7', .58, .4, 1.4, { tr: 'crash', rot: 3 }], ['ti17', .5, .45, 1.2, { tr: 'glitch', fx: 'pulse' }], ['ti27', .5, .45, 1.05, { tr: 'flash', move: 'up' }]],
    { cuts: () => [at('fate', 'their'), at('fate', 'fate'), at('fate', 'is'), at('fate', 'your')],
      after: t => big([['THEIR FATE', C.white], ['IS IN', C.white, .15], ['YOUR HANDS.', C.gold, .35]], t, at('fate', 'fate') - .05, 1000) }),
  end: { img: true, draw(t, lt) {
    drawImg('ti21', [.5, .5, 1.1 + .05 * lt]);
    ctx.fillStyle = 'rgba(4,6,14,.72)'; ctx.fillRect(0, 0, W, H);
    withT(W / 2, 560, pop(lt, 0, .4), 0, () => { rr(-260, -52, 520, 104, 52); ctx.fillStyle = C.red; ctx.fill(); text('NEW SEASON', 0, 5, 58, C.white); });
    mono('LAST NIGHT ON THE', W / 2, 720, 40, C.gold, { spacing: 10, alpha: easeOut(prog(lt, .2, .3)) });
    withT(W / 2, 830, lerp(1.3, 1, easeOut(prog(lt, .25, .35))), 0, () => text('TITANIC', 0, 0, 150, C.white, { alpha: easeOut(prog(lt, .25, .3)), shadow: 'rgba(80,140,255,.6)', shadowBlur: 40 }));
    text('PART 1 · OUT NOW', W / 2, 980, 60, C.white, { alpha: easeOut(prog(lt, .7, .3)), weight: 800 });
    text('STAY or RUN?', W / 2, 1070, 60, C.gold, { alpha: easeOut(prog(lt, .9, .3)), weight: 800 });
    const k = easeOut(prog(lt, 1.2, .3));
    if (k > 0) { rr(140, 1380, W - 280, 150, 30); ctx.strokeStyle = `rgba(255,255,255,${.5 * k})`; ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      mono('TAP TO WATCH PART 1 ↓', W / 2, 1455, 30, `rgba(255,255,255,${.75 * k})`, { weight: 700, spacing: 4 }); }
  } },
};

function SFX() {
  const ev = [];
  const add = (name, t, gain = 1, d) => ev.push(d ? { name, t: +t.toFixed(3), gain, d: +d.toFixed(2) } : { name, t: +t.toFixed(3), gain });
  add('horn', 0, .8, 2.4); add('typewriter', S('date') + .1, .35, 1.2);
  add('bell3', at('date', 'nineteen') - .05, .7); add('hit', at('date', 'twelve'), .5);
  add('silence', S('impact') - .1, 1.7);
  add('groan', S('impact') - .05, 1.0, 2.6); add('boom', S('impact'), 1.0); add('gate', S('impact') + .05, .7);
  add('metal', S('impact') + .55, .7); add('water', S('impact') + .9, .6, 1.6);
  add('drone', S('hist'), .55, 4); add('thump', at('hist', '1500'), .7); add('thump', at('hist', 'never'), .6);
  add('glitch', S('rewrite'), .5); add('tick', S('rewrite') + .3, .5); add('tick', S('rewrite') + 1.3, .5);
  add('paper', at('rewrite', 'rewritten') - .25, .5); add('glitch', at('rewrite', 'rewritten'), .6); add('stamp', at('rewrite', 'rewritten') + .05, .6);
  add('heartbeat', S('fate'), .6, 2.6);
  for (const w of ['their', 'fate', 'is', 'your']) add('thump', at('fate', w), .45);
  add('hit', S('end'), .9); add('horn', S('end') + .2, .55, 2.0);
  return ev.sort((a, b) => a.t - b.t);
}
