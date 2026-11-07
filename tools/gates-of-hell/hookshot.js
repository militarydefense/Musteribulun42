const { chromium } = require('playwright');
const DATA='data=CgRCAggBIhoKFkNJSE0wb2dLRUlDQWdJRHpxOWExSXcQBUICCABKDQj___________8BEAA';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`https://earth.google.com/web/@40.25136971,58.43718089,113.83096088a,0d,34y,58h,86t,0r/${DATA}`, { timeout: 90000 });
  await p.waitForTimeout(35000); await p.mouse.click(903,309); await p.waitForTimeout(2000);
  let prev=null, same=0, buf;
  for (let i=0;i<30;i++){ buf=await p.screenshot({clip:{x:0,y:70,width:1400,height:990}, timeout:180000}); if(prev&&buf.equals(prev)){ if(++same>=2) break;} else same=0; prev=buf; await p.waitForTimeout(800); }
  require('fs').writeFileSync('hookimg.png', buf); console.log('stable', same>=2); await b.close();
})();
