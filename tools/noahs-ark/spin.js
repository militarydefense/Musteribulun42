const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');
const cloud = f => parseFloat(execSync(`python3 cloudcheck.py ${f}`).toString());
const LAT=39.44061, LON=44.23485, ALT=1990, D=26214400, HEAD=44.125;
const PART=+(process.argv[2]||0), NPART=+(process.argv[3]||1);
const S=3.5, FPS=60, DEG=60;
const n = Math.round(S*FPS);
const CLIP = { x: 435, y: 110, width: 530, height: 942 };
const path = lon => `/web/@${LAT},${lon.toFixed(5)},${ALT}a,${D}d,35y,${HEAD}h,0t,0r`;
(async () => {
  fs.mkdirSync('spin', { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('https://earth.google.com/web/@39.44061,44.23485,1990a,3000d,35y,0h,0t,0r', { timeout: 90000 });
  await p.waitForTimeout(32000);
  await p.mouse.click(903,309); await p.waitForTimeout(1000);
  await p.mouse.click(45,148); await p.waitForTimeout(1000);
  await p.mouse.click(47,1022); await p.waitForTimeout(2500);
  await p.mouse.click(288,396); await p.waitForTimeout(1500);
  await p.mouse.click(47,1022); await p.waitForTimeout(1500);
  const go = async u => p.evaluate(u => { history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate', {state:{}})); }, u);
  await go('/web/@39.44061,44.23485,1990a,600d,35y,0h,0t,0r'); await p.waitForTimeout(8000);
  await p.mouse.click(711,163); await p.waitForTimeout(1500);
  // warm up the globe tiles across the whole spin range
  for (let a = DEG; a >= 0; a -= 10) { await go(path(LON + a)); await p.waitForTimeout(4000); }
  await p.screenshot({ path: 'spin/_ui.png', scale: 'css' });
  const setClean = async () => { await p.mouse.click(47,1022); await p.waitForTimeout(2500); await p.mouse.click(288,396); await p.waitForTimeout(1500); await p.mouse.click(47,1022); await p.waitForTimeout(1500); };
  for (let j = 0; j <= n; j++) {
    if (j % NPART !== PART) continue;
    if (fs.existsSync(`spin/s${String(j).padStart(3,'0')}.png`)) continue;
    const u = j / n, lon = LON + DEG * Math.pow(1 - u, 3);
    await go(path(lon)); await p.waitForTimeout(1200);
    let prev = null, same = 0, buf;
    for (let i = 0; i < 30; i++) {
      buf = await p.screenshot({ clip: CLIP, timeout: 180000 });
      if (prev && buf.equals(prev)) { if (++same >= 2) break; } else same = 0;
      prev = buf; await p.waitForTimeout(600);
    }
    const fn = `spin/s${String(j).padStart(3,'0')}.png`;
    fs.writeFileSync(fn, buf);
    let cv = cloud(fn), tries = 0;
    while (cv > 0.085 && tries < 2) {
      console.log('cloudy', j, cv, '-> re-select Clean'); tries++;
      await setClean(); await p.waitForTimeout(2500);
      let pr = null, sm = 0, bb;
      for (let i = 0; i < 30; i++) { bb = await p.screenshot({ clip: CLIP, timeout: 180000 }); if (pr && bb.equals(pr)) { if (++sm >= 2) break; } else sm = 0; pr = bb; await p.waitForTimeout(600); }
      fs.writeFileSync(fn, bb); cv = cloud(fn);
    }
    if (j % 10 == 0) console.log('cloud', cv, 'spin', j, '/', n, 'lon', lon.toFixed(3), 'stable', same >= 2, new Date().toISOString().slice(11,19));
  }
  await b.close();
  console.log('DONE');
})();
