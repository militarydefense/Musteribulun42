// Renders channel branding (logo + banner) with the same drawing kit as scene.html.
// Usage: node brand.js <outdir>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const WALLET = `
function drawWallet(w, mood, t) {
  const h = w * .72;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#9A6234'); g.addColorStop(1, '#6B3F1D');
  rr(-w / 2, -h / 2, w, h, w * .1); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  // bills peeking out
  for (let i = 0; i < 3; i++) withT(-w * .18 + i * w * .16, -h * .5, .38, -.25 + i * .22, () => drawBill(w * .9));
  rr(-w / 2, -h / 2 + h * .08, w, h * .92, w * .1); ctx.fillStyle = g; ctx.fill();
  ctx.setLineDash([w * .03, w * .02]); ctx.strokeStyle = '#E2B07A'; ctx.lineWidth = w * .012;
  rr(-w / 2 + w * .04, -h / 2 + h * .14, w * .92, h * .8, w * .07); ctx.stroke(); ctx.setLineDash([]);
  // clasp flap
  rr(w * .18, -h * .12, w * .36, h * .3, h * .15); ctx.fillStyle = '#5A3215'; ctx.fill();
  ctx.beginPath(); ctx.arc(w * .4, h * .03, w * .045, 0, 7); ctx.fillStyle = C.gold; ctx.fill();
  // face
  ctx.strokeStyle = '#2A1630'; ctx.lineWidth = w * .03; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const x = -w * .12 + s * w * .1, y = h * .02;
    ctx.beginPath(); ctx.ellipse(x, y, w * .055, w * .07, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * .01, y + w * .015, w * .03, 0, 7); ctx.fillStyle = '#2A1630'; ctx.fill();
  }
  // worried brows + mouth
  ctx.beginPath(); ctx.moveTo(-w * .29, -h * .1); ctx.lineTo(-w * .17, -h * .14); ctx.moveTo(-w * .07, -h * .14); ctx.lineTo(w * .05, -h * .1); ctx.stroke();
  ctx.beginPath(); ctx.arc(-w * .12, h * .26, w * .07, Math.PI + .3, -.3); ctx.stroke();
  // sweat drop
  ctx.beginPath(); ctx.moveTo(-w * .36, -h * .02); ctx.quadraticCurveTo(-w * .4, h * .06, -w * .36, h * .08); ctx.quadraticCurveTo(-w * .32, h * .06, -w * .36, -h * .02);
  ctx.fillStyle = '#7FC8FF'; ctx.fill();
  ctx.restore();
}`;

const LOGO = `
cv.width = 800; cv.height = 800;
const g = ctx.createRadialGradient(400, 330, 40, 400, 400, 520);
g.addColorStop(0, '#1C3170'); g.addColorStop(1, '#060B1C');
ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 800);
glowCircle(400, 380, 380, C.gold, .35);
// gold ring (YouTube crops the logo to a circle)
ctx.lineWidth = 26; ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(400, 400, 372, 0, 7); ctx.stroke();
withT(400, 360, 1, 0, () => drawBrain(190, 'wink', 0.5, { raise: true }));
withT(620, 190, 1, .2, () => drawCoin(78));
// small wallet bottom-left, peeking
withT(205, 600, 1, -.18, () => drawWallet(200, 'worried', 0));
`;

const BANNER = `
cv.width = 2560; cv.height = 1440;
const g = ctx.createRadialGradient(1280, 720, 100, 1280, 720, 1500);
g.addColorStop(0, '#1C3170'); g.addColorStop(1, '#050A18');
ctx.fillStyle = g; ctx.fillRect(0, 0, 2560, 1440);
for (let i = 0; i < 160; i++) {
  ctx.globalAlpha = .2 + rnd(i + 3) * .5; ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.arc(rnd(i + 1) * 2560, rnd(i + 50) * 1440, 2 + rnd(i + 9) * 5, 0, 7); ctx.fill();
}
ctx.globalAlpha = 1;
// outer (TV-only) decorations: coins + bills drifting
for (let i = 0; i < 14; i++) {
  const x = rnd(i + 200) * 2560, y = rnd(i + 300) * 1440;
  if (Math.abs(x - 1280) < 820 && Math.abs(y - 720) < 260) continue;
  withT(x, y, .7 + rnd(i) * .6, rnd(i + 7) * 6, () => i % 3 ? drawCoin(40) : drawBill(170));
}
// safe area (1546x423) content
glowCircle(1280, 720, 700, C.gold, .18);
withT(655, 720, 1, 0, () => drawBrain(115, 'wink', 0.5, { raise: true }));
withT(1915, 735, 1, .08, () => drawWallet(230, 'worried', 0));
// title laid out from measured widths so it stays centered
const parts = [['BRAIN', '#fff', 118, {}], ['VS', C.red, 80, {}], ['WALLET', C.gold2, 118, { glow: C.gold, glowBlur: 30 }]];
const gap = 34;
const widths = parts.map(([s, , size]) => { ctx.font = '900 ' + size + 'px ' + FONT; return ctx.measureText(s).width; });
let x = 1280 - (widths.reduce((a, b) => a + b, 0) + gap * 2) / 2;
parts.forEach(([s, col, size, o], i) => { text(s, x + widths[i] / 2, 650, size, col, Object.assign({ stroke: C.ink, strokeW: size * .14 }, o)); x += widths[i] + gap; });
text('The psychology of why you spend', 1280, 775, 54, '#E6ECFF', { weight: 700 });
rr(1280 - 300, 815, 600, 70, 35); ctx.fillStyle = '#FF0033'; ctx.fill();
text('NEW SHORTS EVERY DAY', 1280, 852, 38, '#fff');
`;

(async () => {
  const out = process.argv[2];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => { window.T = { lines: [], scenes: {}, duration: 1, total: 1 }; });
  await page.goto('file://' + path.resolve(__dirname, 'scene.html'));
  await page.evaluate(() => Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 80px Inter`))));
  for (const [name, code] of [['logo.png', LOGO], ['banner.png', BANNER]]) {
    const data = await page.evaluate(src => { (0, eval)(src); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, WALLET + code);
    fs.writeFileSync(path.join(out, name), Buffer.from(data, 'base64'));
  }
  await browser.close();
})();
