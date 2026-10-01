// Deterministic frame renderer: Playwright + MapLibre + ffmpeg.
// usage: node render.js key=value ...
//   w=1920 h=1080 pr=1 aa=1 from=0 to=180 fps=30 read=jpeg|png|cdpjpeg|cdppng|raw|none
//   out=out/x.mp4 passes=1 exe=shell|full flags=default|swangle scale=WxH (ffmpeg scale) stills=0,90,179 tag=name
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const A = Object.fromEntries(process.argv.slice(2).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; }));
const W = +(A.w || 1920), H = +(A.h || 1080), PR = +(A.pr || 1), AA = A.aa !== '0';
const FROM = +(A.from || 0), TO = +(A.to || 180), FPS = +(A.fps || 30);
const READ = A.read || 'jpeg', PASSES = +(A.passes || 1), OUT = A.out || '';
const EXE = A.exe === 'full' ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const FLAGS = {
  default: [],
  swangle: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  lvp: ['--use-gl=angle', '--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--disable-vulkan-surface', '--enable-unsafe-swiftshader'],
  eglmesa: ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  glmesa: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
}[A.flags || 'swangle'];
const ENV = { ...process.env };
if (A.flags === 'lvp') ENV.VK_ICD_FILENAMES = '/usr/share/vulkan/icd.d/lvp_icd.json';
if (A.flags === 'eglmesa') { ENV.EGL_PLATFORM = 'surfaceless'; }
if (A.lpthreads) ENV.LP_NUM_THREADS = A.lpthreads;
const STILLS = (A.stills || '').split(',').filter(Boolean).map(Number);
const TAG = A.tag || 'run';
const PORT = A.port || 8080;

function cpuJiffies() {
  const l = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0].trim().split(/\s+/).slice(1).map(Number);
  const idle = l[3] + l[4];
  const total = l.reduce((a, b) => a + b, 0);
  return { busy: total - idle, total };
}
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

(async () => {
  const tLaunch = Date.now();
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: FLAGS, env: ENV });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { const t = m.text(); if (/maplibre error/i.test(t)) errs.push(t); });
  await page.goto(`http://127.0.0.1:${PORT}/index.html?pr=${PR}&aa=${AA ? 1 : 0}${A.q ? '&' + A.q : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true);
  const info = await page.evaluate(() => window.__setup());
  const setupWall = Date.now() - tLaunch;
  const cdp = READ.startsWith('cdp') ? await page.context().newCDPSession(page) : null;
  const [cw, ch] = info.canvas;

  const results = [];
  for (let pass = 1; pass <= PASSES; pass++) {
    let ff = null, ffDone = null;
    const writeOut = OUT && pass === PASSES; // encode on last pass
    if (writeOut && READ !== 'none') {
      const inArgs = READ === 'raw'
        ? ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw}x${ch}`, '-framerate', String(FPS), '-i', '-']
        : ['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
      const vf = [];
      if (READ === 'raw') vf.push('vflip');
      if (A.scale) vf.push(`scale=${A.scale.replace('x', ':')}:flags=lanczos`);
      const args = ['-y', '-loglevel', 'error', ...inArgs, ...(vf.length ? ['-vf', vf.join(',')] : []),
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', OUT];
      ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
      ffDone = new Promise(r => ff.on('close', code => r(code)));
    }
    const c0 = cpuJiffies(); const w0 = Date.now();
    const fr = [];
    for (let i = FROM; i < TO; i++) {
      const t0 = performance.now();
      const r = await page.evaluate(([i, fps]) => window.__frame(i, fps), [i, FPS]);
      const t1 = performance.now();
      let buf = null;
      if (READ === 'finish') { await page.evaluate(() => window.__readback('finish')); }
      else if (READ === 'png' || READ === 'jpeg' || READ === 'webp') {
        const url = await page.evaluate(k => window.__readback(k, 0.92), READ);
        buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
      } else if (READ === 'cdpjpeg' || READ === 'cdppng') {
        const s = await cdp.send('Page.captureScreenshot', { format: READ === 'cdpjpeg' ? 'jpeg' : 'png', quality: READ === 'cdpjpeg' ? 92 : undefined, optimizeForSpeed: true, captureBeyondViewport: false });
        buf = Buffer.from(s.data, 'base64');
      } else if (READ === 'raw') {
        const b64 = await page.evaluate(() => {
          const u8 = window.__readback('raw');
          let s = ''; const CH = 0x8000;
          for (let k = 0; k < u8.length; k += CH) s += String.fromCharCode.apply(null, u8.subarray(k, k + CH));
          return btoa(s);
        });
        buf = Buffer.from(b64, 'base64');
      }
      const t2 = performance.now();
      if (ff && buf) { if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
      const t3 = performance.now();
      if (buf && STILLS.includes(i) && pass === PASSES) {
        const ext = READ.includes('png') ? 'png' : READ === 'raw' ? 'rgba' : 'jpg';
        fs.writeFileSync(`out/${TAG}_f${String(i).padStart(3, '0')}.${ext}`, buf);
      }
      fr.push({ i, render: t1 - t0, inPage: r.renderMs, renders: r.renders, ok: r.ok, read: t2 - t1, enc: t3 - t2, bytes: buf ? buf.length : 0, hash: buf ? crypto.createHash('md5').update(buf).digest('hex').slice(0, 10) : '' });
    }
    const loopWall = Date.now() - w0;
    let flushMs = 0;
    if (ff) { const f0 = Date.now(); ff.stdin.end(); await ffDone; flushMs = Date.now() - f0; }
    const c1 = cpuJiffies();
    const wall = Date.now() - w0;
    const busyCpuSec = (c1.busy - c0.busy) / 100;
    const util = (c1.busy - c0.busy) / (c1.total - c0.total);
    const R = fr.map(f => f.render), Rd = fr.map(f => f.read), E = fr.map(f => f.enc);
    const summary = {
      tag: TAG, pass, W, H, PR, AA, read: READ, frames: fr.length, setupWall, renderer: info.renderer,
      wallMs: wall, loopWallMs: loopWall, flushMs, msPerFrame: +(wall / fr.length).toFixed(1),
      render_mean: +mean(R).toFixed(1), render_p50: +pct(R, 0.5).toFixed(1), render_p95: +pct(R, 0.95).toFixed(1), render_max: +Math.max(...R).toFixed(1),
      rendersPerFrame: +mean(fr.map(f => f.renders)).toFixed(2), timeouts: fr.filter(f => !f.ok).length,
      read_mean: +mean(Rd).toFixed(1), enc_mean: +mean(E).toFixed(1), avgBytes: Math.round(mean(fr.map(f => f.bytes))),
      busyCpuSec: +busyCpuSec.toFixed(1), cpuUtil: +(util * 100).toFixed(1), cpuSecPerFrame: +(busyCpuSec / fr.length).toFixed(3),
      errs: errs.length,
    };
    console.log(JSON.stringify(summary));
    results.push({ summary, frames: fr });
  }
  fs.writeFileSync(`out/${TAG}.json`, JSON.stringify(results, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
