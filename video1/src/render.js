// Usage: node render.js <timings.json> <out> [--stills t1,t2,...]
// OVERLAY=<seconds> writes transparent PNG frames instead of a video (see below).
// SCENE=<path> selects the scene page (default: scene.html next to this file); timings.outro overrides OUTRO.
// Renders scene.html frame by frame in headless Chromium and pipes JPEG frames into ffmpeg.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, OUTRO = 3.4;
(async () => {
  const [timingsPath, out, flag, list] = process.argv.slice(2);
  const T = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
  T.total = T.duration + (T.outro ?? OUTRO);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.addInitScript(t => { window.T = t; }, T);
  await page.goto('file://' + path.resolve(process.env.SCENE || path.join(__dirname, 'scene.html')));
  await page.evaluate(() => Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 80px Inter`))).then(() => document.fonts.load('80px "Noto Color Emoji"', '🎰')));
  // wait for any <img> the scene uses (e.g. the AI hook frame used at the loop end)
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
  // OVERLAY=<seconds>: render only the first N seconds as transparent PNGs (text/caption layer over an AI clip)
  if (process.env.OVERLAY) {
    fs.mkdirSync(out, { recursive: true });
    await page.evaluate(() => { window.OVERLAY = true; });
    const n = Math.round(parseFloat(process.env.OVERLAY) * FPS);
    for (let i = 0; i < n; i++) {
      const data = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, i / FPS);
      fs.writeFileSync(path.join(out, `o_${String(i).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
    }
    await browser.close();
    return;
  }
  const grab = (t, type, q) => page.evaluate(([t, type, q]) => { render(t); return document.getElementById('c').toDataURL(type, q).split(',')[1]; }, [t, type, q]);

  if (flag === '--stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of list.split(',').map(Number)) fs.writeFileSync(path.join(out, `still_${t.toFixed(2)}.png`), Buffer.from(await grab(t, 'image/png'), 'base64'));
  } else {
    const n = Math.round(T.total * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      const buf = Buffer.from(await grab(i / FPS, 'image/jpeg', 0.93), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('total seconds', T.total.toFixed(2));
  }
  await browser.close();
})();
