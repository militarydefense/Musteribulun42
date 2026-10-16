// Usage: node render.js <timings.json> <out> [--stills t1,t2,...]
// Renders scene.html frame by frame in headless Chromium and pipes JPEG frames into ffmpeg.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, OUTRO = 3.4;
(async () => {
  const [timingsPath, out, flag, list] = process.argv.slice(2);
  const T = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
  T.total = T.duration + OUTRO;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.addInitScript(t => { window.T = t; }, T);
  await page.goto('file://' + path.resolve(__dirname, 'scene.html'));
  await page.evaluate(() => Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 80px Inter`))).then(() => document.fonts.load('80px "Noto Color Emoji"', '🎰')));
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
