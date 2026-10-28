// node banner.js → out/logo_render.png + out/logo_labels.json (screen positions under each bar)
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
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/scene.html`);
  await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
  const pos = await p.evaluate(() => window.renderLogo()) || [];
  await p.screenshot({ path: path.join(OUT, 'logo_render.png'), timeout: 300000 });
  fs.writeFileSync(path.join(OUT, 'logo_labels.json'), JSON.stringify(pos));
  console.log(JSON.stringify(pos));
  await b.close(); server.close();
})();
