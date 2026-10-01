const { chromium } = require('playwright-core');
const SHELL='/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const FULL='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const configs = [
  ['shell default', SHELL, []],
  ['shell --use-gl=angle --use-angle=swiftshader', SHELL, ['--use-gl=angle','--use-angle=swiftshader']],
  ['shell --enable-unsafe-swiftshader', SHELL, ['--enable-unsafe-swiftshader']],
  ['shell --use-angle=swiftshader-webgl', SHELL, ['--use-angle=swiftshader-webgl']],
  ['shell angle+swiftshader+unsafe', SHELL, ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']],
  ['full(new headless) default', FULL, []],
  ['full(new headless) angle+swiftshader+unsafe', FULL, ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']],
];
(async()=>{
  for (const [name, exe, args] of configs) {
    let browser;
    try {
      browser = await chromium.launch({ executablePath: exe, headless: true, args });
      const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      const logs=[]; page.on('console', m => logs.push(m.text()));
      await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'load' });
      await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
      const info = await Promise.race([page.evaluate(() => window.__setup()), new Promise((_,r)=>setTimeout(()=>r(new Error('timeout 90s')),90000))]);
      const t0=Date.now(); let ms=[];
      for (let i=0;i<10;i++){ const r=await page.evaluate(i=>window.__frame(i*18),i); ms.push(Math.round(r.renderMs)); }
      console.log(`OK  | ${name} | ${info.renderer} | ${info.version} | setup ${Math.round(info.setupMs)}ms | frames ${ms.join(',')} | errs ${logs.filter(l=>/error|WebGL/i.test(l)).slice(0,2).join(' ; ')}`);
    } catch (e) {
      console.log(`FAIL| ${name} | ${String(e.message).split('\n')[0].slice(0,200)}`);
    } finally { if (browser) await browser.close(); }
  }
})();
