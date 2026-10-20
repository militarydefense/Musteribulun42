// Usage: node render.js <episode build dir> [--stills t1,t2,...]
// Renders build/scene.html frame by frame in headless Chromium into build/video_noaudio.mp4,
// and writes build/events.json (the sound cues mix.py places).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30;
(async () => {
  const [dir, flag, list] = process.argv.slice(2);
  const T = JSON.parse(fs.readFileSync(path.join(dir, 'timings.json'), 'utf8'));
  T.total = T.duration;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exit(1); });
  await page.addInitScript(t => { window.T = t; }, T);
  await page.goto('file://' + path.resolve(dir, 'scene.html'));
  await page.evaluate(() => Promise.all(['900', '800', '700', '600'].map(w => document.fonts.load(`${w} 80px Inter`))
    .concat(['500', '700'].map(w => document.fonts.load(`${w} 40px JBM`)))));
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
  fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(await page.evaluate(() => window.events()), null, 1));
  const grab = (t, type, q) => page.evaluate(([t, type, q]) => { render(t); return document.getElementById('c').toDataURL(type, q).split(',')[1]; }, [t, type, q]);

  if (flag === '--stills') {
    const out = path.join(dir, 'stills');
    fs.mkdirSync(out, { recursive: true });
    for (const t of list.split(',').map(Number)) fs.writeFileSync(path.join(out, `still_${t.toFixed(2)}.jpg`), Buffer.from(await grab(t, 'image/jpeg', .85), 'base64'));
  } else {
    const n = Math.round(T.total * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(dir, 'video_noaudio.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      const buf = Buffer.from(await grab(i / FPS, 'image/jpeg', 0.92), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('total seconds', T.total.toFixed(2));
  }
  await browser.close();
})();
