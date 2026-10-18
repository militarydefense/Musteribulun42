// History test — "The Great Emu War" (1932). Flat outback cartoon style, no AI imagery.
// Spliced into scene.html between the shared drawing kit and the caption/main code.

const INK = '#2B1D14';

function wordAt(w, from = 0) {
  for (const l of T.lines) for (const x of l.words) {
    if (x.s >= from && x.w.toLowerCase().replace(/[^a-z0-9$]/g, '') === w) return x.s;
  }
  return 1e9;
}

function bgOutback(t, opts = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1100);
  g.addColorStop(0, '#F7C77E'); g.addColorStop(1, '#F3A35C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // sun
  ctx.fillStyle = '#FFE7A8'; ctx.beginPath(); ctx.arc(840, 470, 90, 0, 7); ctx.fill();
  // distant hills
  ctx.fillStyle = '#D9824A';
  ctx.beginPath(); ctx.moveTo(0, 860);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 820 + Math.sin(x * .006) * 40);
  ctx.lineTo(W, 1100); ctx.lineTo(0, 1100); ctx.fill();
  // wheat field or red dirt
  if (opts.wheat) {
    ctx.fillStyle = '#E7B94C'; ctx.fillRect(0, 960, W, 300);
    ctx.strokeStyle = '#C9962E'; ctx.lineWidth = 4;
    for (let i = 0; i < 70; i++) {
      const x = (i * 97) % W, y = 975 + (i * 53) % 260, sway = Math.sin(t * 2 + i) * 6;
      ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x + sway, y); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#C4673A'; ctx.fillRect(0, 960, W, 300);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 131) % W, 980 + (i * 71) % 240, 26, 6);
  }
  ctx.fillStyle = '#8F4A2A'; ctx.fillRect(0, 1260, W, H - 1260);
}

function outlineText(str, x, y, size, col, opts = {}) {
  text(str, x, y, size, col, Object.assign({ stroke: INK, strokeW: size * .16 }, opts));
}

// emu facing right (dir = 1) or left (-1); run = 0..1 leg cycle speed
function emu(x, y, s, dir, t, run = 0, seed = 0, mood = 'neutral') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const ph = t * 14 * run + seed, bob = run ? Math.abs(Math.sin(ph)) * 10 : Math.sin(t * 2 + seed) * 3;
  ctx.translate(0, -bob);
  // legs
  ctx.strokeStyle = '#7A6A58'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k of [0, Math.PI]) {
    const a = run ? Math.sin(ph + k) * .7 : 0;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(Math.sin(a) * 40 - 8, 85); ctx.lineTo(Math.sin(a * 1.4) * 55, 140 + bob);
    ctx.lineTo(Math.sin(a * 1.4) * 55 + 22, 140 + bob); ctx.stroke();
  }
  // fluffy body
  ctx.fillStyle = '#5A4130';
  for (const [bx, by, r] of [[-40, -10, 55], [10, -20, 60], [45, 0, 45], [-10, 20, 50], [-60, 20, 38]]) { ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#6E513C';
  for (const [bx, by, r] of [[-20, -25, 30], [20, -30, 26]]) { ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill(); }
  // neck + head
  ctx.strokeStyle = '#8FA3B8'; ctx.lineWidth = 24;
  const nod = run ? Math.sin(ph) * 8 : Math.sin(t * 3 + seed) * 6;
  ctx.beginPath(); ctx.moveTo(50, -40); ctx.quadraticCurveTo(70, -110, 62 + nod, -170); ctx.stroke();
  ctx.fillStyle = '#8FA3B8'; ctx.beginPath(); ctx.ellipse(70 + nod, -180, 30, 26, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4A3B30'; ctx.beginPath(); ctx.moveTo(92 + nod, -186); ctx.lineTo(128 + nod, -176); ctx.lineTo(92 + nod, -168); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(76 + nod, -188, 11, 0, 7); ctx.fill();
  ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.arc(76 + nod, -188, 11, Math.PI, 0); ctx.globalAlpha = .25; ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(79 + nod, -187, 5, 0, 7); ctx.fill();
  if (mood === 'smug') { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(62 + nod, -204); ctx.lineTo(90 + nod, -198); ctx.stroke(); }
  if (mood === 'angry') { ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(64 + nod, -210); ctx.lineTo(92 + nod, -196); ctx.stroke(); }
  ctx.restore();
}

function soldier(x, y, s, dir, t, opts = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const walk = opts.walk ? Math.sin(t * 9) : 0;
  ctx.translate(0, -Math.abs(walk) * 6);
  ctx.fillStyle = '#3F3A2C';
  rr(-30 + walk * 8, 60, 24, 90, 10); ctx.fill(); rr(6 - walk * 8, 60, 24, 90, 10); ctx.fill();
  rr(-48, -50, 96, 120, 30); ctx.fillStyle = '#9C8A5A'; ctx.fill();
  ctx.fillStyle = '#7E6F45'; ctx.fillRect(-48, 20, 96, 12);
  ctx.beginPath(); ctx.arc(0, -90, 44, 0, 7); ctx.fillStyle = '#F1C7A0'; ctx.fill();
  // slouch hat, one side pinned up
  ctx.fillStyle = '#6B5432';
  ctx.beginPath(); ctx.ellipse(0, -118, 74, 16, 0, 0, 7); ctx.fill();
  rr(-40, -160, 80, 46, 20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-74, -118); ctx.quadraticCurveTo(-80, -160, -44, -150); ctx.lineTo(-40, -118); ctx.fill();
  ctx.fillStyle = '#4A3A22'; ctx.fillRect(-40, -128, 80, 10);
  // face
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(12, -92, 5, 0, 7); ctx.arc(-12, -92, 5, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
  if (opts.mood === 'shock') ctx.ellipse(0, -66, 10, 13, 0, 0, 7);
  else if (opts.mood === 'sad') ctx.arc(0, -58, 12, Math.PI + .5, -.5);
  else ctx.arc(0, -76, 14, .3, Math.PI - .3);
  ctx.stroke();
  if (opts.gun) withT(40, 0, 1, opts.recoil ? -.05 + Math.sin(t * 60) * .03 : 0, () => lewisGun());
  if (opts.flag) {
    ctx.strokeStyle = '#5A4632'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(50, 40); ctx.lineTo(50, -140); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(50, -140); ctx.quadraticCurveTo(100, -150 + Math.sin(t * 6) * 8, 130, -130); ctx.lineTo(50, -95); ctx.fill();
  }
  ctx.restore();
}

function lewisGun() {
  ctx.fillStyle = '#2E2E2E';
  rr(0, -14, 170, 26, 8); ctx.fill();          // barrel shroud
  rr(150, -6, 50, 10, 4); ctx.fill();          // muzzle
  rr(-40, -10, 50, 30, 8); ctx.fill();         // stock
  ctx.beginPath(); ctx.ellipse(60, -24, 46, 12, 0, 0, 7); ctx.fill(); // pan magazine
  ctx.fillStyle = '#4A4A4A'; ctx.beginPath(); ctx.ellipse(60, -27, 30, 6, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2E2E2E'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(150, 10); ctx.lineTo(130, 70); ctx.moveTo(150, 10); ctx.lineTo(175, 70); ctx.stroke(); // bipod
}

function truck(x, y, s, t, bump) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const shake = bump ? Math.sin(t * 38) * 16 : 0, tilt = bump ? Math.sin(t * 23) * .06 : 0;
  ctx.save(); ctx.translate(0, shake); ctx.rotate(tilt);
  rr(-220, -90, 300, 110, 14); ctx.fillStyle = '#5E6B4A'; ctx.fill();      // bed
  rr(80, -150, 150, 170, 22); ctx.fillStyle = '#6E7C56'; ctx.fill();        // cab
  rr(110, -130, 90, 60, 10); ctx.fillStyle = '#BFE3F2'; ctx.fill();         // window
  rr(220, -60, 50, 80, 12); ctx.fillStyle = '#6E7C56'; ctx.fill();          // hood
  soldier(-90, -150, .62, 1, t, { gun: true, mood: 'shock' });
  ctx.restore();
  for (const wx of [-150, 170]) {
    ctx.save(); ctx.translate(wx, 40); ctx.rotate(t * 12);
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 48, 0, 7); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.moveTo(0, -30); ctx.lineTo(0, 30); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function dust(x, y, t, n = 6, seed = 0) {
  for (let i = 0; i < n; i++) {
    const k = ((t * 1.6 + i / n + seed) % 1);
    ctx.globalAlpha = (1 - k) * .55; ctx.fillStyle = '#E2B48A';
    ctx.beginPath(); ctx.arc(x - k * 160, y - k * 40 + Math.sin(i) * 10, 20 + k * 40, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function banner(str, y, col, k, size = 52) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  ctx.font = `900 ${size}px ${FONT}`; const w = ctx.measureText(str).width + 90;
  withT(W / 2, y, lerp(.6, 1, easeBack(clamp(k))), -.02, () => {
    ctx.fillStyle = col; rr(-w / 2, -size * .9, w, size * 1.8, 14); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    text(str, 0, 4, size, '#fff', { stroke: INK, strokeW: size * .12 });
  });
  ctx.restore();
}

function hookTitle(k, line2 = 'vs EMUS') {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k);
  outlineText('AUSTRALIA', W / 2, 200, 120, '#fff');
  outlineText(line2, W / 2, 325, 130, '#FFD23F');
  ctx.restore();
}

function faceOff(t, k) {
  ctx.save(); ctx.globalAlpha = clamp(k);
  soldier(270, 900, 1.25, 1, t, { gun: true });
  emu(800, 860, 1.25, -1, t, 0, 1, 'angry');
  withT(W / 2, 620, 1 + .05 * Math.sin(t * 6), 0, () => outlineText('VS', 0, 0, 120, '#E8492C'));
  ctx.restore();
}

const SCENES = {
  1(t, lt, d, L) {
    bgOutback(t);
    hookTitle(1);
    faceOff(t, 1);
    const k = pop(t, wordAt('1932'), .3);
    if (k > 0) withT(W / 2, 470, k, -.05, () => drawStamp('1932', '#8F2D1C', 1));
  },
  2(t, lt, d, L) {
    bgOutback(t, { wheat: true });
    // the emu horde grazing in the wheat
    const herd = pop(lt, 0, .4);
    for (let i = 0; i < 9; i++) emu(560 + (i % 3) * 180 + (i > 5 ? 40 : 0), 900 + Math.floor(i / 3) * 110, .55 * herd, i % 2 ? 1 : -1, t, 0, i);
    const n = Math.round(20000 * easeOut(prog(t, wordAt('20000'), 1.2)));
    if (n > 0) withT(780, 470, 1, 0, () => { outlineText(n.toLocaleString('en-US'), 0, 0, 110, '#fff'); outlineText('EMUS', 0, 95, 64, '#FFD23F'); });
    const army = easeOut(prog(t, wordAt('army') - .1, .9));
    if (army > 0) {
      soldier(lerp(-200, 200, army), 960, .95, 1, t, { gun: true, walk: army < 1 });
      soldier(lerp(-350, 60, army), 1010, .85, 1, t, { gun: true, walk: army < 1 });
      const g = pop(t, wordAt('machine'), .3);
      banner('2 MACHINE GUNS', 700, '#5E6B4A', g, 48);
    }
  },
  3(t, lt, d, L) {
    bgOutback(t);
    const wrong = wordAt('wrong'), split = wordAt('split');
    if (t < wrong) {
      soldier(330, 930, 1.2, 1, t, { gun: true });
      withT(610, 560, pop(lt, .1, .3), 0, () => {
        rr(-150, -70, 300, 140, 40); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
        outlineText('EASY 😎', 0, 4, 60, INK, { stroke: '#fff', strokeW: 4 });
      });
    } else {
      // emus scatter in every direction
      const k = prog(t, split - .2, 3);
      const dirs = [[-1, -.2], [1, -.1], [-1, .25], [1, .3], [-.6, .5], [.7, -.35], [-1, .05], [1, .15]];
      dirs.forEach(([dx, dy], i) => {
        const x = W / 2 + dx * k * 900 * (0.7 + (i % 3) * .2), y = 880 + dy * k * 500;
        emu(x, y, .6, dx > 0 ? 1 : -1, t, 1, i);
        dust(x - dx * 60, y + 80, t, 4, i * .2);
      });
      soldier(W / 2, 960, .95, 1, t, { gun: true, mood: 'shock', recoil: true });
      const sk = prog(t, wrong, .2);
      withT(W / 2, 470, lerp(2.2, 1, easeOut(sk)), -.08, () => drawStamp('WRONG', '#C0392B', sk));
      const m = pop(t, wordAt('30'), .3);
      banner('30 MPH', 650, '#E8492C', m, 64);
    }
  },
  4(t, lt, d, L) {
    bgOutback(t);
    const bump = t > wordAt('bumpy') - .3;
    const tx = lerp(-200, 520, easeOut(prog(lt, 0, 1.4)));
    for (let i = 0; i < 4; i++) {
      const ex = tx + 380 + i * 120 + (bump ? (t - wordAt('bumpy')) * 160 : 0);
      emu(ex, 900 + (i % 2) * 70, .55, 1, t, 1, i); dust(ex - 60, 980 + (i % 2) * 70, t, 3, i * .3);
    }
    truck(tx, 1000, 1, t, bump);
    dust(tx - 260, 1050, t, 7);
    const z = pop(t, wordAt('single'), .3);
    banner('SHOTS FIRED: 0', 520, '#8F2D1C', z, 54);
  },
  5(t, lt, d, L) {
    bgOutback(t);
    const b = Math.round(9860 * easeOut(prog(t, wordAt('nearly'), 1.6)));
    withT(W / 2, 470, 1, 0, () => {
      rr(-300, -90, 600, 180, 24); ctx.fillStyle = '#3A2A1E'; ctx.fill();
      text('BULLETS FIRED', 0, -40, 42, '#FFD23F');
      text(b.toLocaleString('en-US'), 0, 40, 100, '#fff');
    });
    const leave = easeInOut(prog(t, wordAt('packed'), 1.8));
    soldier(lerp(420, -150, leave), 960, 1, -1, t, { flag: true, mood: 'sad', walk: leave > 0 && leave < 1 });
    soldier(lerp(620, 50, leave), 1010, .9, -1, t, { gun: true, mood: 'sad', walk: leave > 0 && leave < 1 });
    emu(880, 900, .7, -1, t, 0, 3, 'smug');
  },
  6(t, lt, d, L) {
    bgOutback(t, { wheat: true });
    for (let i = 0; i < 5; i++) emu(160 + i * 190, 920 + (i % 2) * 60, .6, i % 2 ? -1 : 1, t, 0, i, 'smug');
    withT(W / 2, 520, pop(lt, .1, .35), 0, () => {
      rr(-330, -100, 660, 200, 26); ctx.fillStyle = '#3A2A1E'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#FFD23F'; ctx.stroke();
      text('EMUS 1', -165, 0, 66, '#FFD23F'); text('ARMY 0', 165, 0, 66, '#fff');
      ctx.fillStyle = '#FFD23F'; ctx.fillRect(-4, -60, 8, 120);
    });
  },
  7(t, lt, d, L) {
    // title card, then the opening face-off returns so the loop restarts seamlessly
    bgOutback(t);
    const name = pop(t, wordAt('great'), .4);
    hookTitle(1 - prog(t, wordAt('great') - .2, .2), 'vs EMUS');
    if (name > 0) {
      outlineText('THE GREAT', W / 2, 205, 104, '#fff');
      withT(W / 2, 330, name, -.03, () => outlineText('EMU WAR', 0, 0, 140, '#FFD23F'));
    }
    faceOff(t, 1);
  },
};

// canvas-drawn thumbnail (used as the final frame and as a standalone PNG)
function drawThumb(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bgOutback(t);
  glowCircle(W / 2, 760, 600, '#FFD23F', .3);
  emu(640, 1080, 2.4, -1, t, 0, 0, 'angry');
  soldier(250, 1150, 1.05, 1, t, { gun: true, mood: 'shock' });
  outlineText('EMUS', W / 2, 220, 190, '#fff');
  outlineText('WON A WAR?!', W / 2, 400, 130, '#FFD23F');
  withT(W / 2, 1420, 1, -.04, () => drawStamp('AUSTRALIA 1932', '#FFD23F', 1));
}
