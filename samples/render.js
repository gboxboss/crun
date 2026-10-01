// Render a scene (or a frame range of it) to MP4, or dump preview stills.
// usage:
//   node render.js scene=hormuz w=1080 h=1920 from=0 to=300 out=build/hormuz/chunk0.mp4
//   node render.js scene=hormuz w=1080 h=1920 stills=1.5,6,12 outdir=build/hormuz/stills
//   node render.js scene=hormuz w=1080 h=1920 meta=build/hormuz/meta.json
// Needs: the static server (node server.js 8090), Mesa EGL (llvmpipe), ffmpeg, a Chromium build.
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const A = Object.fromEntries(process.argv.slice(2).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; }));
const W = +A.w, H = +A.h, FPS = +(A.fps || 30), PORT = A.port || 8090;
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const FLAGS = ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--disable-web-security'];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true, args: FLAGS, env: { ...process.env, EGL_PLATFORM: 'surfaceless' } });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => { const t = m.text(); if (/error/i.test(t)) console.error('[page]', t); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/index.html?scene=${A.scene}&w=${W}&h=${H}&fps=${FPS}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const info = await page.evaluate(() => window.__setup());
  console.error(`[setup] ${A.scene} ${W}x${H} ${info.duration}s renderer=${info.renderer}`);

  if (A.meta) {
    const meta = await page.evaluate(() => window.__meta());
    fs.mkdirSync(path.dirname(A.meta), { recursive: true });
    fs.writeFileSync(A.meta, JSON.stringify(meta, null, 1));
  }

  if (A.stills) {
    fs.mkdirSync(A.outdir, { recursive: true });
    for (const ts of A.stills.split(',').map(Number)) {
      const r = await page.evaluate(i => window.__frame(i), Math.round(ts * FPS));
      fs.writeFileSync(path.join(A.outdir, `t${ts.toFixed(2).padStart(6, '0')}.jpg`), Buffer.from(r.data.split(',')[1], 'base64'));
      console.error(`[still] t=${ts} ok=${r.ok}`);
    }
  }

  if (A.out) {
    const from = +(A.from || 0), to = A.to ? +A.to : Math.ceil(info.duration * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), A.out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise(r => ff.on('close', r));
    const t0 = Date.now();
    for (let i = from; i < to; i++) {
      const r = await page.evaluate(i => window.__frame(i), i);
      if (!r.ok) console.error(`[warn] frame ${i} idle timeout`);
      const buf = Buffer.from(r.data.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(res => ff.stdin.once('drain', res));
      if ((i - from) % 60 === 0) console.error(`[render] ${A.scene} frame ${i}/${to} ${((Date.now() - t0) / Math.max(1, i - from + 1)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end();
    await done;
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
