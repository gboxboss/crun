// Frame engine: map (MapLibre, WebGL) + 2D overlay compositing, one pure frame at a time.
// Scene modules export default ({T, W, H, FPS, K, maplibregl, A}) => scene object:
//   { style, init?(ctx), camera(t), mapState?(t, api), background?(g, t), mapFilter?(t), shake?(t),
//     draw(g, t, api), post?(g, t, frame), sfx?(), music? }
import * as maplibregl from './lib/maplibre-gl.mjs';
import * as K from './kit.mjs';

const P = new URLSearchParams(location.search);
const SCENE = P.get('scene');
const W = +P.get('w'), H = +P.get('h'), FPS = +(P.get('fps') || 30);
const A = location.origin + '/assets/';

const el = document.getElementById('map');
el.style.width = W + 'px'; el.style.height = H + 'px';

const fonts = [['Oswald', 'Oswald.ttf'], ['Montserrat', 'Montserrat.ttf'], ['Inter', 'Inter.ttf'], ['Cinzel', 'Cinzel.ttf'], ['Cormorant', 'Cormorant.ttf']];
await Promise.all(fonts.map(async ([fam, file]) => { const f = new FontFace(fam, `url(${A}fonts/${file})`, { weight: '100 900' }); await f.load(); document.fonts.add(f); }));

const timing = await fetch(`/build/${SCENE}/timing.json`).then(r => r.json());
const T = K.makeTiming(timing);
const mod = await import(`./scenes/${SCENE}.mjs`);
const scene = mod.default({ T, W, H, FPS, K, maplibregl, A, ...(P.get('look') ? { look: P.get('look') } : {}) });

const out = document.createElement('canvas');
out.width = W; out.height = H;
const g = out.getContext('2d');

let map;
const paintCache = new Map();
const api = {
  get map() { return map; },
  W, H, T, K,
  project: ll => { const p = map.project(ll); return [p.x, p.y]; },
  projectLine: lls => lls.map(ll => { const p = map.project(ll); return [p.x, p.y]; }),
  // scale factor for "geo-locked" pixel sizes relative to a reference zoom
  zscale: zref => Math.pow(2, map.getZoom() - zref),
  paint(layer, prop, value) {
    const key = layer + '|' + prop, v = JSON.stringify(value);
    if (paintCache.get(key) === v) return;
    paintCache.set(key, v);
    map.setPaintProperty(layer, prop, value);
  },
};

window.__setup = () => new Promise(async (resolve, reject) => {
  if (scene.init) await scene.init(api);
  maplibregl.setNow(0);
  map = new maplibregl.Map({
    container: 'map', style: scene.style, interactive: false, attributionControl: false,
    fadeDuration: 0, pixelRatio: 1, renderWorldCopies: false, maxTileCacheSize: 4000,
    canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    ...scene.camera(0),
  });
  window.map = map;
  const orig = map.painter.render;
  map.painter.render = function (...a) { if (window.__skip) return; return orig.apply(this, a); };
  map.on('error', e => console.log('maplibre error: ' + (e.error && e.error.message)));
  map.once('idle', () => {
    const gl = map.painter.context.gl;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    resolve({ duration: scene.duration ?? T.duration, fps: FPS, renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '' });
  });
  setTimeout(() => reject(new Error('setup timeout')), 180000);
});

window.__meta = () => ({ duration: scene.duration ?? T.duration, sfx: scene.sfx ? scene.sfx() : [], music: scene.music || null });

// Ready = the map went idle, or (after at least one render pass) every tile is loaded and the style is settled.
function waitIdle(ms = 60000) {
  return new Promise(res => {
    let done = false, renders = 0;
    const t0 = performance.now();
    const onRender = () => { renders++; };
    const finish = ok => { if (done) return; done = true; map.off('render', onRender); res(ok); };
    map.on('render', onRender);
    map.once('idle', () => finish(true));
    const check = () => {
      if (done) return;
      if (renders >= 2 && map.areTilesLoaded() && map.isStyleLoaded()) return finish(true);
      if (performance.now() - t0 > ms) return finish(false);
      map.triggerRepaint();
      setTimeout(check, 20);
    };
    map.triggerRepaint();
    setTimeout(check, 0);
  });
}

window.__frame = async (i, quality = 0.92) => {
  const t = i / FPS;
  window.__skip = true;
  maplibregl.setNow(t * 1000);
  map.jumpTo(scene.camera(t));
  if (scene.mapState) scene.mapState(t, api);
  const ok = await waitIdle();
  window.__skip = false;
  map.redraw();

  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const sh = scene.shake ? scene.shake(t) : null;
  if (sh && (sh.x || sh.y)) { g.translate(W / 2 + sh.x, H / 2 + sh.y); g.scale(1.03, 1.03); g.translate(-W / 2, -H / 2); }
  if (scene.background) scene.background(g, t, api);
  g.save();
  const f = scene.mapFilter ? scene.mapFilter(t) : 'none';
  if (f && f !== 'none') g.filter = f;
  g.drawImage(map.getCanvas(), 0, 0, W, H);
  g.restore();
  scene.draw(g, t, api, i);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (scene.post) scene.post(g, t, i, api);
  return { ok, data: out.toDataURL('image/jpeg', quality) };
};

window.__ready = true;
