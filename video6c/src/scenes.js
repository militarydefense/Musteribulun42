// Video 6 (full Seedance) — text/number layer only. Every scene is drawn over AI footage
// (render with OVERLAY set), so nothing here paints a background.

function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

function topShade(h = 700, a = .75) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(5,10,24,${a})`); g.addColorStop(1, 'rgba(5,10,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, h);
}

function label(str, y, size, col, k, rot = 0) {
  if (k <= 0) return;
  withT(W / 2, y, k, rot, () => text(str, 0, 0, size, col, { stroke: C.ink, strokeW: size * .15, glow: col === C.gold2 ? C.gold : null, glowBlur: 30 }));
}

const SCENES = {
  1(t, lt) {
    topShade();
    const e = wordAt('$8'), k = prog(t, e - .1, .7);
    if (k > 0) {
      label('$' + Math.round(8000000 * easeOut(k)).toLocaleString('en-US'), 225, 140, C.gold2, 1, -.03);
      if (t > e + .6) glowCircle(W / 2, 225, 400, C.gold, .25);
    }
    label('NOBODY KNEW 🤫', 365, 72, '#fff', pop(t, wordAt('nobody'), .3), .04);
  },
  2(t, lt) {
    topShade();
    const y = Math.round(lerp(1940, 2014, easeInOut(prog(t, wordAt('decades') - .5, 1.6))));
    withT(W / 2, 230, pop(lt, .05, .3), 0, () => { rr(-210, -75, 420, 150, 26); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); text(String(y), 0, 6, 104, C.ink); });
    label('GAS STATION ⛽ + JANITOR 🧹', 390, 50, '#fff', pop(lt, .3, .3));
  },
  3(t, lt) {
    topShade();
    label('USED CAR 🚗', 230, 76, '#fff', pop(t, wordAt('used'), .3), -.03);
    label('SAFETY PINS 🧷', 360, 76, C.gold2, pop(t, wordAt('safety'), .3), .03);
  },
  4(t, lt) {
    topShade();
    pill('EVERY SPARE DOLLAR → STOCKS', 230, C.green, prog(lt, .05, .3));
    const sk = prog(t, wordAt('never'), .2);
    if (sk > 0) withT(W / 2, 420, lerp(2.2, 1, easeOut(sk)), -.06, () => drawStamp('NEVER SOLD', '#4BE38A', sk));
  },
  5(t, lt) {
    topShade();
    label('SAFE DEPOSIT BOX', 230, 70, '#fff', pop(lt, .1, .3));
    label('PACKED WITH STOCKS 📜', 360, 70, C.gold2, pop(t, wordAt('packed'), .3), .03);
  },
  6(t, lt) {
    topShade(760);
    withT(W / 2, 230, pop(t, wordAt('hospital'), .3), 0, () => text('$4.8M → 🏥 HOSPITAL', 0, 0, 72, C.gold2, { stroke: C.ink, strokeW: 11, glow: C.gold }));
    withT(W / 2, 370, pop(t, wordAt('library'), .3), 0, () => text('$1.2M → 📚 LIBRARY', 0, 0, 72, C.gold2, { stroke: C.ink, strokeW: 11, glow: C.gold }));
  },
  7(t, lt) {
    topShade(820);
    [['NO GENIUS ✗', '#fff', 'genius'], ['NO LUCK ✗', '#fff', 'luck'], ['JUST TIME ✓', C.gold2, 'time']].forEach(([s, col, w], i) =>
      label(s, 210 + i * 150, 96, col, pop(t, wordAt(w), .3)));
  },
  8(t, lt, d) {
    topShade();
    const q = pop(lt, .05, .35) * (1 - prog(lt, d - .65, .25));
    if (q > 0) withT(W / 2, 300, q, -.03, () => {
      text("WHAT'S YOUR", 0, -70, 100, '#fff', { stroke: C.ink, strokeW: 14 });
      text('EXCUSE?', 0, 55, 130, C.gold2, { stroke: C.ink, strokeW: 16, glow: C.gold });
    });
  },
};
