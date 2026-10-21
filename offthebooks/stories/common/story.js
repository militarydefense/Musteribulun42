// Shared pieces for 1080x1920 Instagram story clips (no narration, no HUD; music is added in the app).
// Keep text between y=300 and y=1560: the story header and the reply bar cover the rest.
const NO_CAPTION = new Set(Object.keys(T.shots));
function HUD() { return null; }
function SFX() { return []; }

function navyBg(glowY = 900) {
  ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, glowY, 0, W / 2, glowY, 900);
  g.addColorStop(0, 'rgba(245,197,24,.16)'); g.addColorStop(1, 'rgba(245,197,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// darken the lower part of a still so story text reads
function shade() {
  const g = ctx.createLinearGradient(0, H * .35, 0, H);
  g.addColorStop(0, 'rgba(6,8,18,0)'); g.addColorStop(.45, 'rgba(6,8,18,.82)'); g.addColorStop(1, 'rgba(6,8,18,.95)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const t = ctx.createLinearGradient(0, 0, 0, 720);
  t.addColorStop(0, 'rgba(6,8,18,.9)'); t.addColorStop(.6, 'rgba(6,8,18,.6)'); t.addColorStop(1, 'rgba(6,8,18,0)');
  ctx.fillStyle = t; ctx.fillRect(0, 0, W, 720);
}
// header block: small mono tag + two-tone headline
function header(tag, a, b, k = 1) {
  mono(tag, 70, 330, 26, C.gold, { align: 'left', weight: 700, spacing: 5, alpha: k });
  text(a, 70, 410, 92, C.white, { align: 'left', alpha: k });
  if (b) text(b, 70, 505, 92, C.gold, { align: 'left', alpha: k });
}
// two-sided vote bar; pct = left share 0..1, animated from 50/50 between t0 and t0+d
function voteBar(t, t0, d, L, R, pct, y = 1130, showPct = true) {
  const p = lerp(.5, pct, easeInOut(prog(t, t0, d)));
  const x0 = 70, x1 = W - 70, xm = lerp(x0, x1, p);
  const lp = Math.round(p * 100), rp = 100 - lp;
  text(showPct ? `${L} ${lp}%` : L, x0, y - 50, 62, p >= .5 ? C.gold : C.white, { align: 'left' });
  text(showPct ? `${rp}% ${R}` : R, x1, y - 50, 62, p < .5 ? C.gold : C.white, { align: 'right' });
  rr(x0, y, x1 - x0, 22, 11); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
  rr(p >= .5 ? x0 : xm, y, p >= .5 ? xm - x0 : x1 - xm, 22, 11); ctx.fillStyle = C.gold; ctx.fill();
}
function lineIn(str, y, t, t0, col = C.white, size = 58, w = 800) {
  const k = easeOut(prog(t, t0, .3));
  if (k > 0) text(str, 70, y + (1 - k) * 20, size, col, { align: 'left', alpha: k, weight: w });
}
function confetti(t, t0) {
  const lt = t - t0;
  if (lt < 0 || lt > 3) return;
  const cols = [C.gold, '#FFFFFF', '#E5484D', '#7C5CFF', '#2FBF71'];
  for (let i = 0; i < 90; i++) {
    const x = rnd(i) * W + Math.sin(lt * 3 + i) * 40, y = -40 + (rnd(i + 99) * .6 + .5) * lt * 900 + rnd(i + 7) * 300 - 300;
    if (y > H) continue;
    withT(x, y, 1, lt * 6 + i, () => { ctx.fillStyle = cols[i % 5]; ctx.fillRect(-9, -5, 18, 10); });
  }
}
// "tap for a reminder" zone where the user drops the countdown / link sticker
function stickerZone(t, t0, label) {
  const k = easeOut(prog(t, t0, .3));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k * (.6 + .4 * Math.sin(t * 4));
  mono(label, W / 2, 1300, 34, C.gold, { weight: 700, spacing: 5 });
  ctx.restore();
}
const still = (name, a, b, after) => ({
  img: true, vig: .2,
  draw(t, lt, dur) { drawImg(name, camAt(a, b, easeInOut(clamp(lt / dur))), {}); shade(); if (after) after(t, lt, dur); },
});
