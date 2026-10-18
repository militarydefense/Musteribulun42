// Renders drawThumb() from scene.html to a PNG. Usage: node thumb.js <out.png>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(() => { window.T = { lines: [], scenes: {}, duration: 1, total: 1 }; });
  await page.goto('file://' + path.resolve(__dirname, 'scene.html'));
  await page.evaluate(() => Promise.all(['900', '800', '700'].map(w => document.fonts.load(`${w} 80px Inter`))));
  const data = await page.evaluate(() => { drawThumb(1.0); return document.getElementById('c').toDataURL('image/png').split(',')[1]; });
  fs.writeFileSync(process.argv[2], Buffer.from(data, 'base64'));
  await browser.close();
})();
