const TITLE = "Merer'in Defteri";
// Purpose (SKILL.md "First questions"): 'cinematic' or 'ad'.
const PURPOSE = 'cinematic';
// Look: authored for this film, "Merer'in defteri": black ink and red ochre on papyrus; the map draws itself on the
// logbook page. Base family handmade-ink, without its halftone and grey grade (the papyrus keeps its colour).
const LOOKS = {
  'merer-papyrus': { grade: 'contrast(1.04) saturate(0.96)', bloom: 0, texture: null, vignette: 0.22, grain: 0.035, grainHold: 2, hold: 24, line: 0.003, steps: 0,
    palette: { bg: '#d8c39a', ink: '#1e1a16', accent: '#a8342a', dim: '#b39a6c' } },
};
const LOOK_ID = 'merer-papyrus';
const LOOK = LOOKS[LOOK_ID];
const FINISH = { shutter: null, weave: 0, tone: null };
const FPS = 24;
const DURATION = 30;
const BPM = 100.10;                         // tools/beat_grid.py on the recording; the clip starts on a downbeat
const BEAT0 = 0;
const beat = (n) => BEAT0 + n * 60 / BPM, bar = (n) => beat(4 * n);
const OWN_MUSIC = { file: 'audio/music.wav', gain: 0.8 };
const INSTRUMENTS = [];
const CAST = {};
const FORMULAS = {};
const PALETTE = {
  bg: '#d8c39a',      // papyrus ground
  fibre: '#c4ab7c',   // papyrus fibres, darker strands
  ink: '#1e1a16',     // carbon ink: every line
  accent: '#a8342a',  // red ochre: day numbers, the route
  nile: '#3f6f8c',    // the flood wash
  white: '#f2eee4',   // Tura limestone, the casing
  night: '#5a4632',   // umber night multiply
  dim: '#b39a6c',
};
const TYPE = {
  lang: 'tr',
  roles: {
    display: { family: 'Apfel Grotezk', pkg: 'apfel-grotezk', version: '5.3.0', cap: 0.65, subsets: ['latin'], weights: [400, 700] },
    text: { family: 'Newsreader', pkg: 'newsreader', version: '5.3.0', cap: 0.67, variable: 'standard', varVersion: '5.3.0',
      axes: { opsz: [6.0, 72.0, 16.0], wght: [200.0, 800.0, 400.0] } },
    mono: null,
  },
  check: { strings: { display: ['GÜN 25', 'GÜN 26', 'TURA', 'AKHET-KHUFU', 'MÖ 2560'],
    text: ["Tura'da taş yükledik.", 'Ekip: kırk kişi. Yük: bir taş.', "Geceyi Khufu Gölü'nde geçirdik.",
      "Sabah Akhet-Khufu'ya yelken açtık.", 'Bir taş. Sonra binlercesi.', "Merer'in defteri", 'Bulundu: 2013'] },
    sizes: { text: 0.05 } },
};

// Every cue on a bar of the recording (bar = 2.398 s).
const CUES = {
  rubric: 0, tura: bar(1), boat: bar(3), night: bar(5), morning: bar(7), turn: bar(9), freeze: bar(10),
  lift: bar(11), end: DURATION,
};
const VO = [];
const CAPTIONS = null;
const CAPTION_STYLE = { role: 'text', accentRole: 'text', size: 0.05, caps: false, ink: PALETTE.ink, hi: PALETTE.ink, accent: PALETTE.accent, punch: 0 };

// One continuous shot across one papyrus page: every scene draws the same world (merer) through one camera path; the
// cuts between scenes fall on identical frames, so the viewer sees one move.
const SCENES = [
  { chapter: 'C1', from: CUES.rubric, to: CUES.tura, draw: world, action: 'a red reed stroke writes the day number', amb: { kind: 'room', gain: 0.03 } },
  { chapter: 'C1', from: CUES.tura, to: CUES.boat, draw: world, action: 'the ink map draws the Tura cliff and a block is cut from it', in: { type: 'cut' }, amb: { kind: 'air', gain: 0.04 } },
  { chapter: 'C1', from: CUES.boat, to: CUES.night, draw: world, action: 'forty tally strokes become the crew and the boat sails on the flood', in: { type: 'cut' }, amb: { kind: 'water', gain: 0.05 } },
  { chapter: 'C1', from: CUES.night, to: CUES.morning, draw: world, action: 'night falls on the page and the boat rocks at anchor', in: { type: 'cut' }, amb: { kind: 'water', gain: 0.04 } },
  { chapter: 'C1', from: CUES.morning, to: CUES.turn, draw: world, action: 'morning wipes in and the pyramid rises on the horizon', in: { type: 'cut' }, amb: { kind: 'air', gain: 0.04 } },
  { chapter: 'C1', from: CUES.turn, to: CUES.lift, draw: world, action: 'the block slides into the pyramid face and the face fills white', in: { type: 'cut' }, amb: { kind: 'air', gain: 0.03 } },
  { chapter: 'C1', from: CUES.lift, to: CUES.end, draw: world, action: 'the camera lifts off and the page is a torn fragment', in: { type: 'cut' }, amb: { kind: 'room', gain: 0.03 } },
];

const SFX = [];
const ROOM = { secs: 1.8, decay: 3.0, tone: 4200 };
const ARRANGEMENT = [{ section: 'all', from: 0, to: DURATION, parts: [] }];

// ------------------------------ the world: one papyrus page ------------------------------
// World units: 1 = the frame's short side at dist 1. The page runs x -0.9 .. 6.2, y -1.25 .. 1.25.
// The river band crosses it at y 0.22 .. 0.62; Tura's cliff at x 0, She-Khufu at x 2.6, Akhet-Khufu (the pyramid) at x 5.2.
const RIVER = [0.24, 0.62], PYR = { x: 5.2, base: 0.18, h: 0.9, half: 0.62 };
const sm = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// The boat's x along the river: loaded at Tura, sails to She-Khufu, anchors the night, sails to the pyramid's harbour.
function boatX(t) {
  return lerp(0.25, 2.6, EASE.inOut(sm(CUES.boat + 0.8, CUES.night + 1.0, t)))
    + (5.0 - 2.6) * EASE.inOut(sm(CUES.morning + 0.3, CUES.turn + 0.2, t));
}

// Camera path: crane down onto the rubric, push into Tura, track with the boat, hold the night, pull back to the
// pyramid, push into its face (freeze on the bar), then crane up off the page.
const CAMKEYS = [
  { t: 0, x: -0.05, y: -0.72, dist: 0.42 },
  { t: CUES.tura, x: -0.02, y: -0.32, dist: 0.72 },
  { t: CUES.boat - 0.4, x: 0.12, y: -0.05, dist: 0.62 },
  { t: CUES.night - 0.6, x: 2.25, y: 0.06, dist: 0.86 },
  { t: CUES.morning - 0.4, x: 2.62, y: 0.12, dist: 0.8 },
  { t: CUES.turn - 0.6, x: 4.7, y: -0.05, dist: 1.25 },
  { t: CUES.freeze, x: 5.2, y: -0.12, dist: 0.78 },
  { t: CUES.lift, x: 5.15, y: -0.1, dist: 0.84 },
  { t: CUES.end, x: 4.3, y: 0.0, dist: 2.35 },
];

// Seeded pseudo hieratic: rows of short ink signs, the logbook's own text, faint behind the map.
const SCRIPT = lazy(() => {
  const r = rng(41), rows = [];
  for (let row = 0; row < 26; row++) {
    const y = -1.15 + row * 0.092;
    if (y > RIVER[0] - 0.1 && y < RIVER[1] + 0.05) continue;
    let x = -0.85;
    while (x < 6.1) {
      const w = 0.012 + r() * 0.03, kind = Math.floor(r() * 5);
      rows.push({ x, y: y + (r() - 0.5) * 0.01, w, kind, red: r() < 0.035, a: r() });
      x += w + 0.008 + r() * 0.012;
      if (r() < 0.05) x += 0.06;
    }
  }
  return rows;
});
const FIBRES = lazy(() => {
  const r = rng(7), out = [];
  for (let i = 0; i < 520; i++) out.push({ h: r() < 0.55, p: r(), w: 0.0015 + r() * 0.004, a: 0.12 + r() * 0.22, s: r() });
  return out;
});
// The pyramid face as courses of blocks; each cell knows when it turns white (the thousands of trips).
const CELLS = lazy(() => {
  const r = rng(19), out = [], rows = 22;
  for (let i = 0; i < rows; i++) {
    const y0 = PYR.base - PYR.h * (1 - i / rows), y1 = PYR.base - PYR.h * (1 - (i + 1) / rows);
    const halfW0 = PYR.half * (i / rows), halfW1 = PYR.half * ((i + 1) / rows), n = Math.max(1, Math.round(halfW1 * 2 / 0.05));
    for (let j = 0; j < n; j++) {
      const u0 = j / n, u1 = (j + 1) / n, jit = (i % 2) * 0.5 / n;
      out.push({ i, y0, y1, xa: -halfW1 + 2 * halfW1 * clamp(u0 + jit), xb: -halfW1 + 2 * halfW1 * clamp(u1 + jit), d: r() });
    }
  }
  return out;
});

// An ink line drawn on along its points by k (0..1), with a slight seeded wobble like a reed pen.
function inkPath(g, pts, k, w, color = PALETTE.ink, salt = 1) {
  if (k <= 0) return;
  const n = pts.length - 1, upto = k * n, last = Math.floor(upto);
  g.beginPath();
  for (let i = 0; i <= Math.min(n, last + 1); i++) {
    let [x, y] = pts[i];
    if (i === last + 1) { const f = upto - last; x = lerp(pts[i - 1][0], x, f); y = lerp(pts[i - 1][1], y, f); }
    const wob = (noise1(i * 0.7 + salt) - 0.5) * w * 0.9;
    i ? g.lineTo(x + wob, y - wob) : g.moveTo(x, y);
  }
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
}
const curve = (f, a, b, n = 60) => Array.from({ length: n + 1 }, (_, i) => f(lerp(a, b, i / n)));

function papyrus(g) {
  // torn fragment edge: an irregular polygon, the page itself
  const r = rng(3), edge = [];
  for (let i = 0; i <= 40; i++) edge.push([lerp(-0.9, 6.2, i / 40), -1.25 + (r() - 0.5) * 0.06 + (i > 33 ? (i - 33) * 0.03 : 0)]);
  for (let i = 0; i <= 14; i++) edge.push([6.2 - (r()) * 0.09 - Math.sin(i) * 0.03, lerp(-1.25, 1.25, i / 14)]);
  for (let i = 40; i >= 0; i--) edge.push([lerp(-0.9, 6.2, i / 40), 1.25 + (r() - 0.5) * 0.06 - (i < 5 ? (5 - i) * 0.03 : 0)]);
  for (let i = 14; i >= 0; i--) edge.push([-0.9 + r() * 0.08, lerp(-1.25, 1.25, i / 14)]);
  g.beginPath(); edge.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  const gr = g.createLinearGradient(-0.9, -1.25, 6.2, 1.25);
  gr.addColorStop(0, '#d2bb8f'); gr.addColorStop(0.45, PALETTE.bg); gr.addColorStop(1, '#cdb486');
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  // the strips of the papyrus: horizontal layer over vertical layer, each strip a darker fibre
  for (const f of FIBRES()) {
    g.globalAlpha = f.a * 0.6; g.fillStyle = PALETTE.fibre;
    if (f.h) g.fillRect(-0.9, -1.25 + f.p * 2.5, 7.1, f.w);
    else g.fillRect(-0.9 + f.p * 7.1, -1.25, f.w * 0.8, 2.5);
  }
  // sheet joins every 0.9 units (papyrus rolls are glued sheets)
  g.globalAlpha = 0.22; g.fillStyle = '#9f8559';
  for (let x = -0.4; x < 6.2; x += 0.9) g.fillRect(x, -1.25, 0.012, 2.5);
  g.globalAlpha = 1; g.restore();
  g.beginPath(); edge.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.strokeStyle = 'rgba(80,58,30,0.55)'; g.lineWidth = 0.006; g.stroke();
}

function script(g, t, cam) {
  for (const s of SCRIPT()) {
    if (Math.abs(s.x - cam.x) > cam.dist * 1.2 + 0.2) continue;
    g.globalAlpha = 0.28 + 0.2 * s.a; g.strokeStyle = s.red ? PALETTE.accent : PALETTE.ink; g.lineWidth = 0.0042; g.lineCap = 'round';
    g.beginPath();
    const { x, y, w } = s;
    if (s.kind === 0) { g.moveTo(x, y - 0.02); g.lineTo(x + w * 0.3, y + 0.018); }
    else if (s.kind === 1) { g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 0.03, x + w, y); }
    else if (s.kind === 2) { g.moveTo(x, y - 0.018); g.lineTo(x + w, y - 0.012); g.moveTo(x + w * 0.4, y - 0.016); g.lineTo(x + w * 0.3, y + 0.02); }
    else if (s.kind === 3) { g.arc(x + w / 2, y, w * 0.4, 0.4, 5.2); }
    else { g.moveTo(x, y + 0.012); g.bezierCurveTo(x + w * 0.3, y - 0.03, x + w * 0.7, y + 0.03, x + w, y - 0.01); }
    g.stroke();
  }
  g.globalAlpha = 1;
}

// A red rubric (the day number) written by a reed: a fast swash stroke, then the letters.
function rubric(g, S, str, x, y, k, size = 0.075) {
  inkPath(g, curve((u) => [x - 0.32 + u * 0.64, y + 0.055 + Math.sin(u * 3.1) * 0.012], 0, 1, 30), EASE.out(clamp(k * 1.6)), 0.012, PALETTE.accent, 9);
  text(g, S, str, x, y, size, PALETTE.accent, 1, 0.04, { role: 'display', weight: 700, reveal: clamp(k * 1.4 - 0.15), spread: 0.5 });
}

function cliff(g, t) {
  // Tura's limestone cliff on the east bank, hatched in dry strokes; a block is cut out of its face
  const k = sm(CUES.tura - 0.2, CUES.tura + 1.8, t);
  const top = curve((u) => [lerp(-0.55, 0.42, u), -0.42 + Math.sin(u * 7.0) * 0.025 + u * 0.05], 0, 1, 40);
  inkPath(g, top, k, 0.006, PALETTE.ink, 2);
  inkPath(g, [[0.42, -0.37], [0.47, RIVER[0] - 0.02]], sm(CUES.tura + 1.2, CUES.tura + 1.8, t), 0.006, PALETTE.ink, 3);
  // hatching: vertical strata strokes appear behind the outline
  const r = rng(23);
  for (let i = 0; i < 80; i++) {
    const x = -0.52 + r() * 0.92, y0 = -0.38 + r() * 0.12, len = 0.08 + r() * 0.3, d = r() * 0.9;
    const kk = sm(CUES.tura + 0.4 + d * 1.6, CUES.tura + 0.8 + d * 1.6, t);
    if (kk > 0) inkPath(g, [[x, y0], [x + 0.01, Math.min(RIVER[0] - 0.03, y0 + len)]], kk, 0.003, 'rgba(30,26,22,0.6)', 30 + i);
  }
  // the block: its outline is cut on beats 7..9, then it lifts out white
  const cut = sm(CUES.tura + 2.0, CUES.tura + 3.4, t), out = EASE.out(sm(CUES.tura + 3.4, CUES.boat - 0.3, t));
  const bx = 0.04, by = -0.2;
  if (cut > 0) {
    g.save(); g.setLineDash([0.01, 0.006]);
    inkPath(g, [[bx - 0.07, by - 0.045], [bx + 0.07, by - 0.045], [bx + 0.07, by + 0.045], [bx - 0.07, by + 0.045], [bx - 0.07, by - 0.045]], cut, 0.005, PALETTE.ink, 5);
    g.restore();
  }
  if (out > 0) {
    g.globalAlpha = 0.5 * out; g.fillStyle = '#7b6646'; g.fillRect(bx - 0.07, by - 0.045, 0.14, 0.09); g.globalAlpha = 1;
  }
  // label
  const lk = sm(CUES.tura + 0.6, CUES.tura + 1.4, t);
  if (lk > 0) text(g, null, 'TURA', -0.32, -0.5, 0.032, PALETTE.ink, lk, 0.12, { role: 'display', weight: 700 });
}

function river(g, t) {
  // the bank lines are drawn first; the flood then washes in as blue that bleeds at its edges
  const kb = sm(CUES.tura + 0.8, CUES.boat + 0.6, t);
  const bank = (y0, salt) => curve((x) => [x, y0 + Math.sin(x * 2.3 + salt) * 0.03], -0.9, 6.2, 140);
  inkPath(g, bank(RIVER[0], 0), kb, 0.005, PALETTE.ink, 11);
  inkPath(g, bank(RIVER[1], 2), kb, 0.005, PALETTE.ink, 12);
  const flood = sm(CUES.boat - 0.2, CUES.boat + 2.6, t);
  if (flood <= 0) return;
  const reach = lerp(-0.9, 6.2, EASE.out(flood));
  for (let layer = 0; layer < 3; layer++) {
    g.beginPath();
    const pad = 0.012 * (2 - layer);
    for (let x = -0.9; x <= reach; x += 0.05) g.lineTo(x, RIVER[0] + pad + Math.sin(x * 2.3) * 0.03 + (noise1(x * 3 + layer) - 0.5) * 0.012);
    for (let x = reach; x >= -0.9; x -= 0.05) g.lineTo(x, RIVER[1] - pad + Math.sin(x * 2.3 + 2) * 0.03 + (noise1(x * 3 + 9 + layer) - 0.5) * 0.012);
    g.closePath(); g.fillStyle = PALETTE.nile; g.globalAlpha = 0.18 + 0.14 * layer; g.fill();
  }
  g.globalAlpha = 1;
  // current lines, drifting downstream
  const r = rng(51);
  for (let i = 0; i < 46; i++) {
    const x0 = -0.9 + r() * 7.1, y = lerp(RIVER[0] + 0.06, RIVER[1] - 0.06, r()), drift = ((t * 0.05 + r()) % 1) * 0.08;
    if (x0 > reach) continue;
    g.globalAlpha = 0.35 * flood; inkPath(g, [[x0 + drift, y], [x0 + drift + 0.05, y + 0.004], [x0 + drift + 0.09, y]], 1, 0.0028, '#20405a', 70 + i);
  }
  g.globalAlpha = 1;
}

function boat(g, t) {
  // an Old Kingdom cargo boat in side profile (after the Met / AIC river boat models): crescent hull with raised
  // ends, a bipod mast and a square sail, two steering oars at the stern, the white block on deck; drawn in one line.
  const x = boatX(t), y = RIVER[0] + 0.16, k = sm(CUES.boat, CUES.boat + 1.4, t);
  if (k <= 0) return;
  const rock = Math.sin(t * 2.1) * 0.035 * (0.4 + sm(CUES.night, CUES.night + 1, t) - sm(CUES.morning, CUES.morning + 1, t) * 0.6);
  g.save(); g.translate(x, y); g.rotate(rock);
  const hull = curve((u) => [lerp(-0.2, 0.2, u), 0.035 * Math.sin(u * Math.PI) - 0.07 * Math.pow(Math.abs(u - 0.5) * 2, 3)], 0, 1, 40);
  const deck = curve((u) => [lerp(0.21, -0.21, u), -0.012 - 0.06 * Math.pow(Math.abs(u - 0.5) * 2, 4)], 0, 1, 30);
  const H = [...hull, ...deck];
  if (k >= 1) { g.beginPath(); H.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fillStyle = '#8a6a3e'; g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; }
  inkPath(g, H, k, 0.006, PALETTE.ink, 21);
  const km = sm(CUES.boat + 0.9, CUES.boat + 1.8, t);
  inkPath(g, [[-0.02, -0.02], [0.0, -0.26]], km, 0.005, PALETTE.ink, 22);
  inkPath(g, [[0.04, -0.02], [0.0, -0.26]], km, 0.005, PALETTE.ink, 23);
  const ks = sm(CUES.boat + 1.4, CUES.boat + 2.2, t), billow = 0.012 * Math.sin(t * 1.3);
  if (ks > 0) {
    g.beginPath(); g.moveTo(-0.08, -0.25); g.quadraticCurveTo(0.0 + billow, -0.17, -0.08, -0.08); g.lineTo(0.1, -0.08);
    g.quadraticCurveTo(0.14 + billow, -0.17, 0.1, -0.25); g.closePath();
    g.fillStyle = '#efe3c6'; g.globalAlpha = 0.85 * ks; g.fill(); g.globalAlpha = 1; g.lineWidth = 0.004; g.strokeStyle = PALETTE.ink; g.stroke();
  }
  inkPath(g, [[-0.15, -0.04], [-0.24, 0.07]], km, 0.004, PALETTE.ink, 24);
  inkPath(g, [[-0.12, -0.04], [-0.2, 0.08]], km, 0.004, PALETTE.ink, 25);
  // the block on deck
  const kb = sm(CUES.boat + 0.4, CUES.boat + 1.0, t);
  if (kb > 0) { g.fillStyle = PALETTE.white; g.fillRect(0.06, -0.06 * kb - 0.012, 0.09, 0.05 * kb); g.strokeStyle = PALETTE.ink; g.lineWidth = 0.004; g.strokeRect(0.06, -0.06 * kb - 0.012, 0.09, 0.05 * kb); }
  // the crew: 40 tally strokes, written as 8 groups of five above the boat, then they drop onto the deck
  for (let i = 0; i < 40; i++) {
    const grp = Math.floor(i / 5), inG = i % 5;
    const wk = sm(CUES.boat + 0.3 + i * 0.045, CUES.boat + 0.45 + i * 0.045, t);
    if (wk <= 0) continue;
    const drop = EASE.inOut(sm(CUES.boat + 2.5 + grp * 0.08, CUES.boat + 3.3 + grp * 0.08, t));
    const tx = -0.26 + grp * 0.068 + inG * 0.011, ty = -0.36;
    const dx = -0.17 + (i % 20) * 0.0115, dy = (i < 20 ? -0.035 : -0.05) - 0.004 * Math.sin(i);
    const px = lerp(tx, dx, drop), py = lerp(ty, dy, drop), len = lerp(0.035, 0.022, drop);
    g.strokeStyle = PALETTE.ink; g.lineWidth = 0.0035; g.beginPath();
    if (inG === 4 && drop < 0.05) { g.moveTo(tx - 0.048, ty + 0.01); g.lineTo(tx + 0.004, ty - 0.025); }
    else { g.moveTo(px, py); g.lineTo(px + 0.002, py - len * wk); }
    g.stroke();
    if (drop > 0.6) dot(g, null, px + 0.002, py - len - 0.004, 0.0035, PALETTE.ink, drop);
  }
  g.restore();
}

function pyramid(g, t) {
  // Akhet-Khufu on the west bank: a hatched triangle rises on the horizon at morning; at the turn the block slides into
  // its face and the courses turn white, one block per trip.
  const rise = EASE.out(sm(CUES.morning + 0.6, CUES.morning + 3.2, t));
  if (rise <= 0) return;
  g.save(); g.translate(PYR.x, 0);
  const top = PYR.base - PYR.h * rise;
  g.beginPath(); g.moveTo(-PYR.half, PYR.base); g.lineTo(0, top); g.lineTo(PYR.half, PYR.base); g.closePath();
  g.save(); g.clip();
  g.fillStyle = '#c9b082'; g.fillRect(-PYR.half, top, PYR.half * 2, PYR.h);
  for (let i = 0; i < 36; i++) inkPath(g, [[-PYR.half + i * 0.036, PYR.base], [-PYR.half + i * 0.036 + 0.08, top]], 1, 0.0025, 'rgba(30,26,22,0.45)', 90 + i);
  const fill = sm(CUES.turn + 0.9, CUES.freeze + 0.1, t), more = sm(CUES.freeze + 0.6, CUES.lift + 0.6, t);
  for (const c of CELLS()) {
    const on = c.i >= 19 && Math.abs((c.xa + c.xb) / 2 - 0.08) < 0.06 ? fill : clamp((more * 1.25 - c.d * 0.25 - (1 - c.i / 22) * 0.3) * 1.6);
    if (on <= 0) continue;
    g.fillStyle = PALETTE.white; g.globalAlpha = on; g.fillRect(c.xa, c.y1, c.xb - c.xa, c.y0 - c.y1);
    g.globalAlpha = on * 0.5; g.strokeStyle = PALETTE.ink; g.lineWidth = 0.0016; g.strokeRect(c.xa, c.y1, c.xb - c.xa, c.y0 - c.y1);
  }
  g.globalAlpha = 1; g.restore();
  inkPath(g, [[-PYR.half, PYR.base], [0, top], [PYR.half, PYR.base]], 1, 0.007, PALETTE.ink, 99);
  // the travelling block slides from the harbour up into the lowest course
  const slide = EASE.inOut(sm(CUES.turn - 0.4, CUES.turn + 1.0, t));
  if (slide > 0 && slide < 1) {
    const sx = lerp(-0.2, 0.08, slide), sy = lerp(RIVER[0] + 0.1, PYR.base - 0.02, slide);
    g.fillStyle = PALETTE.white; g.fillRect(sx - 0.03, sy - 0.02, 0.06, 0.04); g.strokeStyle = PALETTE.ink; g.lineWidth = 0.003; g.strokeRect(sx - 0.03, sy - 0.02, 0.06, 0.04);
  }
  // casing glow: the white face catches the morning
  const glow = sm(CUES.freeze, CUES.lift, t);
  if (glow > 0) {
    const gr = g.createRadialGradient(0, PYR.base - PYR.h * 0.45, 0.05, 0, PYR.base - PYR.h * 0.45, 0.9);
    gr.addColorStop(0, `rgba(255,250,235,${0.35 * glow})`); gr.addColorStop(1, 'rgba(255,250,235,0)');
    g.fillStyle = gr; g.fillRect(-1, -1.2, 2, 1.6);
  }
  const lk = sm(CUES.morning + 2.4, CUES.morning + 3.2, t);
  if (lk > 0) text(g, null, 'AKHET-KHUFU', 0, PYR.base + 0.035, 0.028, PALETTE.ink, lk, 0.12, { role: 'display', weight: 700 });
  g.restore();
}

function lake(g, t) {
  // She-Khufu: the harbour basin where the crew spent the night, a loop of the bank with reeds
  const k = sm(CUES.boat + 2.4, CUES.night, t);
  if (k <= 0) return;
  const loop = curve((u) => [2.6 + Math.cos(u) * 0.32, RIVER[0] - 0.04 - Math.abs(Math.sin(u)) * 0.12], Math.PI, TAU, 40);
  inkPath(g, loop, k, 0.005, PALETTE.ink, 61);
  const r = rng(63);
  for (let i = 0; i < 22; i++) {
    const x = 2.3 + r() * 0.6, y = RIVER[0] - 0.05 - r() * 0.06, kk = sm(CUES.boat + 3 + i * 0.05, CUES.boat + 3.4 + i * 0.05, t);
    const sway = Math.sin(t * 1.7 + i) * 0.006;
    inkPath(g, [[x, y], [x + sway, y - 0.05 - r() * 0.03]], kk, 0.0028, PALETTE.ink, 80 + i);
  }
}

function route(g, t) {
  // the red route line follows the boat on the water: the film's thread from Tura to the pyramid
  const x = boatX(t);
  if (x <= 0.3) return;
  inkPath(g, curve((u) => [u, RIVER[0] + 0.2 + Math.sin(u * 2.3) * 0.012], 0.25, x - 0.2, 60), 1, 0.004, PALETTE.accent, 5);
}

// The logbook entry for the moment: screen space, in the text role, written in by word, held, then fading.
const ENTRIES = [
  { a: CUES.tura + 1.0, b: CUES.boat - 0.1, s: "Tura'da taş yükledik." },
  { a: CUES.boat + 1.2, b: CUES.night - 0.1, s: 'Ekip: kırk kişi. Yük: bir taş.' },
  { a: CUES.night + 0.5, b: CUES.morning - 0.1, s: "Geceyi Khufu Gölü'nde geçirdik." },
  { a: CUES.morning + 0.6, b: CUES.turn - 0.1, s: "Sabah Akhet-Khufu'ya yelken açtık." },
  { a: CUES.turn + 0.9, b: CUES.lift - 0.1, s: 'Bir taş. Sonra binlercesi.' },
];
function entry(g, S, t, nightK) {
  g.save(); g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
  const top = -S.H / S.u * 0.5 + S.H / S.u * 0.15;
  for (const e of ENTRIES) {
    if (t < e.a || t > e.b + 0.4) continue;
    const kIn = clamp((t - e.a) / 1.2), out = 1 - sm(e.b, e.b + 0.4, t);
    const lines = (() => { setType(g, TYPE, 'text', 5.4, { weight: 500 }); return e.s.length > 22 ? e.s.split(/(?<=\.)\s|(?<=:)\s(?=[A-ZÇĞİÖŞÜa-z])/).slice(0, 2) : [e.s]; })();
    const ink = nightK > 0.5 ? PALETTE.white : PALETTE.ink;
    lines.forEach((ln, i) => text(g, S, ln, 0, top + i * 0.075, 0.054, ink, out, 0, { role: 'text', weight: 520, reveal: clamp(kIn * 1.3 - i * 0.3), by: 'word', spread: 0.6 }));
  }
  g.restore();
}

function endCard(g, S, t) {
  const k = sm(CUES.lift + 0.6, CUES.lift + 1.6, t);
  if (k <= 0) return;
  g.save(); g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
  const y = S.H / S.u * 0.5 - S.H / S.u * 0.27;
  text(g, S, "Merer'in defteri", 0, y, 0.066, PALETTE.ink, k, 0, { role: 'text', weight: 600, reveal: k, by: 'word', spread: 0.5 });
  const k2 = sm(CUES.lift + 1.2, CUES.lift + 2.2, t);
  text(g, S, 'MÖ 2560 CİVARI', 0, y + 0.075, 0.03, PALETTE.accent, k2, 0.14, { role: 'display', weight: 700 });
  const k3 = sm(CUES.lift + 1.8, CUES.lift + 2.6, t);
  text(g, S, 'Bulundu: 2013', 0, y + 0.13, 0.042, PALETTE.ink, k3, 0, { role: 'text', weight: 450 });
  g.restore();
}

function world(g, k, t, S) {
  // one continuous shot: crane down onto the rubric, push in at Tura, track with the boat, hold the night,
  // pull back to the pyramid, push into its face (freeze on the bar at 23.98), crane up off the page
  const tt = t < CUES.freeze ? t : t < CUES.freeze + 0.6 ? CUES.freeze + (t - CUES.freeze) * 0.15 : t - 0.51;
  const cam = CAM.path(CAMKEYS, t);
  CAM.handheld(cam, t, 0.35, 5);
  g.fillStyle = '#2b2118'; g.fillRect(0, 0, S.W, S.H);
  plane(g, S, cam, 0, (g) => {
    papyrus(g);
    script(g, tt, cam);
    rubric(g, S, 'GÜN 25', -0.05, -0.78, clamp(tt / 1.6));
    if (tt > CUES.morning - 0.2) rubric(g, S, 'GÜN 26', 3.35, -0.55, clamp((tt - CUES.morning + 0.2) / 1.4), 0.06);
    river(g, tt); cliff(g, tt); lake(g, tt); route(g, tt); pyramid(g, tt); boat(g, tt);
  });
  // night: the page darkens to umber, stars pricked in pale dots; the morning wipes it off left to right
  const nightK = sm(CUES.night - 0.3, CUES.night + 1.0, tt) * (1 - sm(CUES.morning - 0.2, CUES.morning + 0.9, tt));
  if (nightK > 0) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = nightK * 0.85; g.fillStyle = PALETTE.night; g.fillRect(0, 0, S.W, S.H); g.restore();
    const r = rng(88);
    for (let i = 0; i < 70; i++) {
      const sx = r() * S.W, sy = r() * S.H * 0.45, tw = 0.6 + 0.4 * noise1(t * 1.5 + i);
      g.globalAlpha = nightK * tw * (r() < 0.2 ? 0.9 : 0.5); g.fillStyle = '#f2e6c8';
      g.beginPath(); g.arc(sx, sy, (1 + r() * 2.2) * S.u / 1080, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  }
  entry(g, S, tt, nightK);
  endCard(g, S, tt);
}

function score(ctx, out) {
  // the music is the user's pick, a recording (OWN_MUSIC): nothing is written here
}
