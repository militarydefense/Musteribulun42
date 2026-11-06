const { chromium } = require('playwright');
const fs = require('fs');
const LAT='37.2238', LON='38.9217', ALT='773';
const plan = JSON.parse(fs.readFileSync('plan.json'));
const CLIP = { x: 435, y: 110, width: 530, height: 942 };
const path = (d,h=0) => `/web/@${LAT},${LON},${ALT}a,${d}d,35y,${h}h,0t,0r`;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('https://earth.google.com' + path(3000), { timeout: 90000 });
  await p.waitForTimeout(32000);
  await p.mouse.click(903,309); await p.waitForTimeout(1000);
  await p.mouse.click(45,148); await p.waitForTimeout(1000);
  await p.mouse.click(47,1022); await p.waitForTimeout(2500);
  await p.mouse.click(288,396); await p.waitForTimeout(1500);
  await p.mouse.click(47,1022); await p.waitForTimeout(1500);
  const go = async (d,h=0) => p.evaluate(u => { history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate', {state:{}})); }, path(d,h));
  await go(600); await p.waitForTimeout(8000);
  await p.mouse.click(711,163); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'stills/_ui.png', scale: 'css' });
  for (const [k,d,h] of plan) {
    const t0 = Date.now();
    await go(d,h); await p.waitForTimeout(6000);
    let prev = null, same = 0, buf;
    for (let i = 0; i < 40; i++) {
      buf = await p.screenshot({ clip: CLIP });
      if (prev && buf.equals(prev)) { if (++same >= 2) break; } else same = 0;
      prev = buf; await p.waitForTimeout(2000);
    }
    fs.writeFileSync(`stills/k${String(k).padStart(2,'0')}.png`, buf);
    
    console.log('still', k, d, h, 'stable', same >= 2, ((Date.now()-t0)/1000).toFixed(1)+'s');
  }
  await b.close();
})();
