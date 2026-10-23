// ---- shared overlay widgets (Part 4+): in-story UI that keeps the screen moving without new pictures ----
const typed = (str, t, t0, cps = 28) => str.slice(0, Math.floor(clamp((t - t0) * cps, 0, str.length)));
const fadeIn = (t, t0, t1 = Infinity, d = .2) => easeOut(prog(t, t0, d)) * clamp((t1 - t) / .2);
function uiBox(x, y, w, h, o = {}) {
  rr(x, y, w, h, 18); ctx.fillStyle = o.bg || 'rgba(8,11,22,.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = o.border || 'rgba(245,197,24,.8)'; ctx.stroke();
}
// small tag + big value (value may be a function of t; o.type types it out)
function infoBox(t, t0, t1, y, tag, value, o = {}) {
  const k = fadeIn(t, t0, t1);
  if (k <= 0) return;
  const w = o.w || 760, h = o.h || 150, x = (W - w) / 2;
  ctx.save(); ctx.globalAlpha = k;
  uiBox(x, y, w, h, o);
  mono(tag, W / 2, y + 38, 24, o.tagCol || C.gold, { weight: 700, spacing: 4 });
  if (Array.isArray(value)) segText(value, W / 2, y + 100, o.size || 64, o.type ? Math.floor((t - t0 - .1) * (o.cps || 24)) : 1e9, 'center');
  else {
    const v = typeof value === 'function' ? value(t) : o.type ? typed(value, t, t0 + .1, o.cps || 24) : value;
    text(v, W / 2, y + 100, o.size || 64, o.col || C.white);
  }
  if (o.sub) mono(o.sub, W / 2, y + h - 16, 20, C.grey, { spacing: 2 });
  ctx.restore();
}
// "THE VOTES ARE IN": bars race from 0 to their share, then the winner badge
function voteRace(t, t0, rows, badge, badgeT, t1 = Infinity) {
  const k = fadeIn(t, t0, t1);
  if (k <= 0) return;
  const x = 80, w = W - 160, y = 330, h = 110 + rows.length * 96;
  ctx.save(); ctx.globalAlpha = k;
  uiBox(x, y, w, h);
  mono('THE VOTES ARE IN', x + 36, y + 44, 24, C.gold, { align: 'left', weight: 700, spacing: 4 });
  rows.forEach(([label, pct, note], i) => {
    const yy = y + 100 + i * 96, g = easeOut(prog(t, t0 + .2, 1.1)) * pct;
    text(label, x + 36, yy, 44, C.white, { align: 'left', weight: 800 });
    text(note || `${Math.round(g * 100)}%`, x + w - 36, yy, 40, C.gold, { align: 'right', weight: 800 });
    rr(x + 36, yy + 26, w - 72, 16, 8); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
    rr(x + 36, yy + 26, (w - 72) * g, 16, 8); ctx.fillStyle = C.gold; ctx.fill();
  });
  const b = pop(t, badgeT, .35);
  if (b > 0) withT(x + w - 150, y + 40, b, .06, () => { rr(-130, -30, 260, 60, 12); ctx.fillStyle = C.gold; ctx.fill(); text(badge, 0, 3, 32, C.navy); });
  ctx.restore();
}
// a real viewer comment, shown like an Instagram comment (username blurred)
function commentCard(t, t0, label, body, y = 1000, t1 = Infinity, likes = 0) {
  const k = fadeIn(t, t0, t1, .3);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const x = 60, w = W - 120, h = 250, yy = y + (1 - k) * 30;
  rr(x, yy, w, h, 26); ctx.fillStyle = 'rgba(250,250,252,.96)'; ctx.fill();
  mono(label, x + 40, yy + 46, 22, C.ink2, { align: 'left', weight: 700, spacing: 4 });
  ctx.fillStyle = '#C9CDD6'; ctx.beginPath(); ctx.arc(x + 75, yy + 125, 34, 0, 7); ctx.fill();
  rr(x + 130, yy + 92, 260, 26, 13); ctx.fillStyle = '#D5D8DF'; ctx.fill();
  text(body, x + 130, yy + 165, 44, C.ink, { align: 'left', weight: 700 });
  const hk = easeOut(prog(t, t0 + .6, .3));
  withT(x + w - 60, yy + 120, 1 + .25 * Math.sin(Math.PI * hk), 0, () => text('♥', 0, 0, 52, hk > .5 ? C.red : '#B5B9C2'));
  if (likes) text(String(likes), x + w - 60, yy + 180, 30, C.ink2, { weight: 800 });
  ctx.restore();
}
// typed name tag pinned next to a character
function nameTag(t, t0, t1, x, y, role, name, sub) {
  const k = fadeIn(t, t0, t1, .2);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = `800 42px ${SANS}`;
  const w = Math.max(ctx.measureText(name).width + 80, sub ? 470 : 260);
  const h = sub ? 150 : 108;
  rr(x, y, w, h, 12); ctx.fillStyle = 'rgba(8,11,22,.88)'; ctx.fill();
  ctx.fillStyle = C.gold; ctx.fillRect(x, y, 8, h);
  mono(role, x + 30, y + 32, 22, C.gold, { align: 'left', weight: 700, spacing: 4 });
  text(typed(name, t, t0 + .1, 22), x + 30, y + 76, 42, C.white, { align: 'left', weight: 800 });
  if (sub) mono(typed(sub, t, t0 + .5, 30), x + 30, y + 124, 20, C.grey, { align: 'left', spacing: 1.5 });
  ctx.restore();
}
// clue box: what you know vs what he just said
function contra(t, t0, t1, a, b) {
  const k = fadeIn(t, t0, t1);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const y = 330, w = 450, h = 200;
  [[a, 70, C.white], [b, W - 70 - w, C.red]].forEach(([[tag, val], x, col], i) => {
    const kk = easeOut(prog(t, t0 + i * .5, .25));
    ctx.globalAlpha = k * kk;
    uiBox(x, y, w, h, { border: i ? 'rgba(229,72,77,.9)' : 'rgba(245,197,24,.8)' });
    mono(tag, x + w / 2, y + 44, 22, i ? C.red : C.gold, { weight: 700, spacing: 3 });
    text(val, x + w / 2, y + 128, 50, col);
  });
  ctx.restore();
}
// info told on top of a scene: dark band with a mono tag and one or two lines
function overlayTag(t, t0, tag, l1, l2, src, t1 = Infinity) {
  const k = fadeIn(t, t0, t1, .3);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const g = ctx.createLinearGradient(0, 300, 0, 800);
  g.addColorStop(0, 'rgba(6,8,18,.9)'); g.addColorStop(1, 'rgba(6,8,18,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 300, W, 500);
  mono(tag, 70, 380, 28, C.gold, { align: 'left', weight: 700, spacing: 5 });
  text(l1, 70 + (1 - k) * -30, 460, 80, C.white, { align: 'left' });
  if (l2) text(l2, 70 + (1 - k) * -30, 550, 80, C.gold, { align: 'left' });
  if (src) mono(src, 70, 620, 22, C.grey, { align: 'left', spacing: 1 });
  ctx.restore();
}
function pill(str, y, t, t0, o = {}) {
  const k = pop(t, t0, .35) * clamp(((o.t1 ?? Infinity) - t) / .15);
  if (k <= 0) return;
  withT(W / 2, y + Math.sin(t * 5) * (o.bob ? 6 : 0), k, 0, () => {
    ctx.font = `800 46px ${SANS}`;
    const w = ctx.measureText(str).width + 90;
    rr(-w / 2, -50, w, 100, 50); ctx.fillStyle = o.bg || C.gold; ctx.fill();
    text(str, 0, 3, 46, o.fg || C.navy, { weight: 800 });
  });
}
// big gauge reading in the middle of the frame when EXPOSED jumps
function bigGauge(t, t0, t1, label, from, to, y = 1180) {
  const k = fadeIn(t, t0, t1, .25);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rr(60, y - 120, W - 120, 220, 24); ctx.fillStyle = 'rgba(8,11,22,.9)'; ctx.fill();
  mono(label, 110, y - 70, 26, C.grey, { align: 'left', weight: 700, spacing: 6 });
  const v = count(t, t0, .6, from, to);
  text(`${Math.round(v)}%`, 110, y + 20, 120, C.red, { align: 'left' });
  rr(470, y + 5, W - 580, 26, 13); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill();
  rr(470, y + 5, (W - 580) * v / 100, 26, 13); ctx.fillStyle = C.red; ctx.fill();
  ctx.restore();
}
// small REC badge with a live timer
function recBadge(t, t0, x = 860, y = 330, secs0 = 0) {
  if (t < t0) return;
  ctx.save();
  rr(x - 150, y - 34, 300, 68, 34); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
  ctx.fillStyle = (t * 2 % 1) < .6 ? C.red : 'rgba(229,72,77,.3)'; ctx.beginPath(); ctx.arc(x - 105, y, 14, 0, 7); ctx.fill();
  const s = Math.floor(secs0 + t - t0);
  mono(`REC ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`, x + 20, y + 2, 32, C.white, { weight: 700, spacing: 3 });
  ctx.restore();
}
// live waveform strip (recording / playback)
function waveStrip(t, t0, t1, y, col = C.red) {
  const k = fadeIn(t, t0, t1);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  rr(80, y - 70, W - 160, 140, 20); ctx.fillStyle = 'rgba(8,11,22,.85)'; ctx.fill();
  ctx.fillStyle = col;
  for (let i = 0; i < 48; i++) {
    const a = (.25 + .75 * Math.abs(Math.sin(i * 1.7 + t * 9) * Math.sin(i * .37 + t * 3))) * 50;
    ctx.fillRect(110 + i * 18, y - a, 10, a * 2);
  }
  ctx.restore();
}
// phone notification banner
function notif(t, t0, t1, y, app, title, body, o = {}) {
  const k = fadeIn(t, t0, t1, .25);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const x = 70, w = W - 140, h = 170, yy = y - (1 - k) * 40;
  rr(x, yy, w, h, 30); ctx.fillStyle = o.bg || 'rgba(245,246,250,.97)'; ctx.fill();
  rr(x + 30, yy + 34, 64, 64, 16); ctx.fillStyle = o.icon || '#3B82F6'; ctx.fill();
  text(o.glyph || '☁', x + 62, yy + 70, 38, '#fff');
  mono(app, x + 120, yy + 46, 22, o.red ? C.red : C.ink2, { align: 'left', weight: 700, spacing: 2 });
  text(title, x + 120, yy + 92, 40, C.ink, { align: 'left', weight: 800 });
  text(typed(body, t, t0 + .15, 40), x + 120, yy + 138, 32, C.ink2, { align: 'left', weight: 600 });
  ctx.restore();
}
// "WHAT WOULD YOU DO?" with two options, each with a one-line consequence
function choiceBoxes(t, t0, opts, footer, t1 = Infinity) {
  const k = fadeIn(t, t0, t1, .3);
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = .55 * k; ctx.fillStyle = '#04060D'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = k;
  text('WHAT WOULD YOU DO?', W / 2, 400, 64, C.white);
  opts.forEach(([title, sub], i) => {
    const kk = pop(t, t0 + .25 + i * .3, .35);
    if (kk <= 0) return;
    withT(W / 2, 560 + i * 210, kk, 0, () => {
      rr(-440, -80, 880, 170, 22); ctx.fillStyle = C.gold; ctx.fill();
      text(title, -400, -14, 64, C.navy, { align: 'left' });
      text(sub, -400, 52, 34, C.navy, { align: 'left', weight: 700 });
    });
  });
  if (footer) mono(footer, W / 2, 1030, 28, C.gold, { weight: 700, spacing: 4, alpha: easeOut(prog(t, t0 + 1, .3)) });
  ctx.restore();
}
// whole-frame effects: negative black-and-white flash, black cut
function negFlash(t, t0, d = .16) {
  if (t < t0 || t > t0 + d) return;
  ctx.save();
  ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function blackCut(t, t0, d = .3) { if (t >= t0 && t < t0 + d) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } }

// coloured segments [[str, colour], ...], typed out to n characters
function segText(segs, x, y, size, n, align = 'left') {
  ctx.save();
  ctx.font = `900 ${size}px ${SANS}`;
  const full = segs.reduce((w, [str]) => w + ctx.measureText(str).width, 0);
  let cx = align === 'center' ? x - full / 2 : x, left = Math.max(0, n);
  for (const [str, col] of segs) {
    const part = str.slice(0, left); left -= part.length;
    if (part) text(part, cx, y, size, col || C.white, { align: 'left' });
    cx += ctx.measureText(str).width;
    if (left <= 0) break;
  }
  ctx.restore();
}
// numbered typewriter list; each item = [start time, segments]
function typedList(t, t0, t1, y, tag, items, o = {}) {
  const k = fadeIn(t, t0, t1);
  if (k <= 0) return;
  const x = 70, w = W - 140, h = 90 + items.length * 78;
  ctx.save(); ctx.globalAlpha = k;
  uiBox(x, y, w, h, o);
  mono(tag, x + 36, y + 42, 24, o.tagCol || C.gold, { align: 'left', weight: 700, spacing: 4 });
  items.forEach(([ts, segs], i) => { if (t >= ts) segText(segs, x + 36, y + 100 + i * 78, o.size || 44, Math.floor((t - ts) * (o.cps || 30)), 'left'); });
  ctx.restore();
}
// deadline chip next to the HUD label: counts down in real time
function deadlineChip(t, t0, secsLeft, label = 'FRIDAY 5:00 PM', hot = false) {
  if (t < t0) return;
  const k = easeOut(prog(t, t0, .25)), s = Math.max(0, Math.floor(secsLeft - (t - t0)));
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  const str = `⏱ ${label} · ${d}D ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = `700 22px ${MONO}`;
  const w = ctx.measureText(str).width + 50;
  rr(W - 40 - w, 280, w, 46, 8); ctx.fillStyle = hot ? C.red : 'rgba(8,11,22,.88)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = hot ? C.red : C.gold; ctx.stroke();
  mono(str, W - 40 - w / 2, 304, 22, hot ? C.white : C.gold, { weight: 700, spacing: 1.5 });
  ctx.restore();
}
