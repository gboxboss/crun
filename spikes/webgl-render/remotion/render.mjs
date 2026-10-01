import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const A = Object.fromEntries(process.argv.slice(2).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; }));
const id = A.id || 'MapH';
const gl = A.gl || 'angle-egl';
const concurrency = +(A.c || 1);
const browserExecutable = A.exe || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (gl === 'angle-egl' || gl === 'egl') process.env.EGL_PLATFORM = 'surfaceless';
const cpu = () => { const l = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0].trim().split(/\s+/).slice(1).map(Number); return { busy: l.reduce((a, b) => a + b, 0) - l[3] - l[4], total: l.reduce((a, b) => a + b, 0) }; };
const tb = Date.now();
const serveUrl = A.serve || await bundle({ entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('build') });
const bundleMs = Date.now() - tb;
const chromiumOptions = { gl, enableMultiProcessOnLinux: true };
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, timeoutInMilliseconds: 120000 });
const c0 = cpu(); const t0 = Date.now();
let last = 0;
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation: A.out || `../out/remotion_${id}_${gl}_c${concurrency}.mp4`,
  browserExecutable, chromiumOptions, concurrency, frameRange: A.range ? A.range.split('-').map(Number) : null, imageFormat: A.fmt || 'jpeg', jpegQuality: 92, crf: 20, x264Preset: 'veryfast', pixelFormat: 'yuv420p',
  timeoutInMilliseconds: 120000,
  onProgress: ({ renderedFrames }) => { if (renderedFrames - last >= 30) { last = renderedFrames; console.log(`  rendered ${renderedFrames} @ ${((Date.now() - t0) / 1000).toFixed(1)}s`); } },
  onBrowserLog: (l) => { if (/error|Error/.test(l.text) && !/GroupMarker/.test(l.text)) console.log('  browser:', l.text.slice(0, 200)); },
});
const wall = Date.now() - t0; const c1 = cpu();
const busy = (c1.busy - c0.busy) / 100;
console.log(JSON.stringify({ id, gl, concurrency, bundleMs, wallMs: wall, range: A.range, msPerFrame: +(wall / composition.durationInFrames).toFixed(1), busyCpuSec: +busy.toFixed(1), cpuUtil: +(100 * (c1.busy - c0.busy) / (c1.total - c0.total)).toFixed(1), cpuSecPerFrame: +(busy / composition.durationInFrames).toFixed(3) }));
if (!A.serve) fs.writeFileSync('serveurl.txt', serveUrl);
