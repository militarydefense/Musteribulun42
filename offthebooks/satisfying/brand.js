// Clean stills (no counters) of scene.html at given times, for the channel avatar and banner.
// node brand.js 0.2,2.1,4.9  → out/brand_<t>.png
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, OUT = path.join(ROOT, 'out');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(`http://127.0.0.1:${server.address().port}/scene.html`);
  await p.waitForFunction(() => window.ready && window.kitchenReady, null, { timeout: 120000 });
  await p.evaluate(() => document.querySelectorAll('.num').forEach(e => e.style.display = 'none'));
  if (process.argv[3] === 'noknife') await p.evaluate(() => window.hideKnife());
  for (const t of process.argv[2].split(',').map(Number)) {
    await p.evaluate(t => window.renderAt(t), t);
    await p.screenshot({ path: path.join(OUT, `brand_${t.toFixed(2)}${process.argv[3] ? '_' + process.argv[3] : ''}.png`), timeout: 180000 });
  }
  await b.close(); server.close();
})();
