const { chromium } = require('playwright');
const fs = require('fs');
const DATA='data=CgRCAggBIhoKFkNJSE0wb2dLRUlDQWdJRHpxOWExSXcQBUICCABKDQj___________8BEAA';
const P=(h,fov,t)=>`/web/@40.25136971,58.43718089,113.83096088a,0d,${fov}y,${h}h,${t}t,0r/${DATA}`;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('https://earth.google.com'+P(0,90,90), { timeout: 90000 });
  await p.waitForTimeout(35000);
  await p.mouse.click(903,309); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'pano/_ui.png', scale: 'css' });
  const go = u => p.evaluate(u => { history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate', {state:{}})); }, u);
  for (let h = 0; h < 360; h += 10) {
    await go(P(h,90,90)); await p.waitForTimeout(2500);
    let prev=null, same=0, buf;
    for (let i=0;i<30;i++){ buf=await p.screenshot(); if(prev&&buf.equals(prev)){ if(++same>=2) break;} else same=0; prev=buf; await p.waitForTimeout(800); }
    fs.writeFileSync(`pano/h${String(h).padStart(3,'0')}.png`, buf);
    console.log('h', h, 'stable', same>=2, 'url', p.url().split('/data')[0].split('@')[1]);
  }
  await b.close(); console.log('DONE');
})();
