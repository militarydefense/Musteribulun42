// Renders scene.html frame by frame with headless Chromium (software WebGL).
// node render.js stills 0.2,3,10          → out/still_<t>.jpg
// node render.js frames <from> <to>        → out/f_<n>.jpg   (frame numbers, end exclusive)
// node render.js timeline                  → out/timeline.json (duration + cut times, for the audio)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = __dirname, OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await page.goto(`http://127.0.0.1:${port}/scene.html`);
  await page.waitForFunction(() => window.ready && (window.kitchenReady || !document.querySelector('#shade')), null, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  const [mode, a, b] = process.argv.slice(2);
  const tl = await page.evaluate(() => window.TIMELINE);
  if (mode === 'timeline') fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(tl));
  if (mode === 'stills') for (const t of a.split(',').map(Number)) {
    await page.evaluate(t => window.renderAt(t), t);
    await page.screenshot({ path: path.join(OUT, `still_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 90, timeout: 600000 });
  }
  if (mode === 'frames') {
    const from = +a, to = Math.min(+b, Math.ceil(tl.duration * tl.fps)), t0 = Date.now();
    for (let n = from; n < to; n++) {
      await page.evaluate(t => window.renderAt(t), n / tl.fps);
      await page.screenshot({ path: path.join(OUT, `f_${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92, timeout: 600000 });
      if ((n - from) % 60 === 0) console.log(`frame ${n}/${to} ${((Date.now() - t0) / (n - from + 1) / 1000).toFixed(2)} s/frame`);
    }
  }
  console.log('duration', tl.duration.toFixed(2), 'cuts', tl.cuts.length);
  await browser.close(); server.close();
})();
