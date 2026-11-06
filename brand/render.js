const { chromium } = require('playwright');
(async () => {
  const [html, out, w, h, transparent] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto('file://' + require('path').resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, omitBackground: transparent === '1' });
  await b.close();
})();
