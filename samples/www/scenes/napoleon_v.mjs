// Napoleon 1812, 43 s test segment (hook -> Moscow burning) in three army styles:
//   look = 'tokens'   : flag-on-pole army standards with an officer and strength bars (Kings & Generals campaign style)
//   look = 'figures'  : marching formations of soldier figures with a colour bearer (toy-soldier style)
//   look = 'counters' : military unit counters, stacked by strength (documentary / wargame style)
// Shared: van Wijk camera flights, constant-width arrows drawn phase by phase (older phases dim), top-down fire.
import * as F from '../fx.mjs';
import { cameraPath } from '../cam.mjs';

export default ({ T, W, H, K, A, look = 'figures' }) => {
  const D = A + 'data/';
  const w = (id, k, n) => T.ws(id, k, n);
  const tNapoleon = w('h1', 'Napoleon'), tMarched = w('h1', 'marched'), tSix = w('h1', 'six'), tRussia = w('h1', 'Russia');
  const tMost = w('h2', 'Most'), tNever = w('h2', 'never');
  const tJune = w('n1', 'June'), tGrand = w('n1b', 'Grand'), tCross = w('n1b', 'crosses'), tNiemen = w('n1b', 'Niemen');
  const tRussians = w('n2', 'Russians'), tUnexp = w('n2', 'unexpected'), tRetreat = w('n2b', 'retreat');
  const tMile = w('n3', 'Mile'), tBurning = w('n3', 'burning'), tVillages = w('n3', 'villages');
  const tHeat = w('n4', 'Heat'), tHunger = w('n4', 'hunger'), tDisease = w('n4', 'disease'), tTens = w('n4', 'tens'), tMarchEnd = T.p('n4').end;
  const tThen = w('n5', 'Then'), tSept = w('n5', 'September'), tBorodino = w('n5', 'Borodino');
  const tCollide = w('n5b', 'collide'), tSingle = w('n6', 'single'), tSeventy = w('n6', 'seventy');
  const tWeek = w('n7', 'week'), tMoscow = w('n7', 'Moscow'), tEmpty = w('n7b', 'empty');
  const tNight = w('n8', 'night'), tBurn = w('n8', 'burn');
  const tEnd = T.duration;

  const PL = {
    paris: [2.35, 48.86], kovno: [23.90, 54.90], vilna: [25.28, 54.69], vitebsk: [30.20, 55.19], smolensk: [32.05, 54.78],
    vyazma: [34.30, 55.21], borodino: [35.82, 55.52], moscow: [37.62, 55.75], volkovysk: [24.47, 53.16], orsha: [30.42, 54.51],
  };
  const C55 = Math.cos((55 * Math.PI) / 180);
  function route(wps, segs = 14) {
    const pts = K.catmull(wps, segs);
    const cum = K.cumLen(pts.map(([x, y]) => [x * C55, y])), L = cum[cum.length - 1];
    return { pts, cum: cum.map(v => v / L) };
  }
  function geoSlice(r, f) {
    const out = [[...r.pts[0], 0]];
    for (let i = 1; i < r.pts.length; i++) {
      if (r.cum[i] < f) { out.push([...r.pts[i], r.cum[i]]); continue; }
      const u = (f - r.cum[i - 1]) / Math.max(1e-9, r.cum[i] - r.cum[i - 1]);
      out.push([K.lerp(r.pts[i - 1][0], r.pts[i][0], u), K.lerp(r.pts[i - 1][1], r.pts[i][1], u), f]);
      break;
    }
    return out;
  }
  // French advance, phase by phase
  const F1 = route([[23.40, 54.86], [23.70, 54.88], PL.kovno, [24.6, 54.82], [25.15, 54.72]]);
  const F2 = route([[25.15, 54.72], [26.4, 54.85], [27.7, 54.98], [29.0, 55.12], PL.vitebsk, [31.2, 54.95], [31.95, 54.80]]);
  const F3 = route([[31.95, 54.80], [33.2, 54.98], PL.vyazma, [35.0, 55.50], [35.70, 55.52]]);
  const F4 = route([[35.76, 55.52], [36.1, 55.50], [36.9, 55.63], [37.50, 55.74]]);
  const R1 = route([[25.40, 54.88], [26.4, 55.38], [27.6, 55.86], [28.8, 55.78], [30.0, 55.58], [31.0, 55.28], [31.85, 55.0]]);
  const R2 = route([PL.volkovysk, [25.5, 53.08], [26.6, 53.18], [27.9, 53.28], [29.2, 53.18], [30.33, 53.9], [31.2, 54.42], [31.88, 54.68]]);
  const R3 = route([[32.2, 55.0], [33.3, 55.34], [34.4, 55.62], [35.3, 55.70], [35.93, 55.55]]);
  const march = route([PL.paris, [8.7, 50.1], [13.4, 52.5], [17.0, 52.4], [20.9, 53.2], [23.3, 54.75]], 10);
  const frLine = [[35.742, 55.43], [35.75, 55.48], [35.754, 55.53], [35.75, 55.58], [35.742, 55.62]];
  const ruLine = [[35.83, 55.435], [35.842, 55.48], [35.848, 55.53], [35.845, 55.575], [35.835, 55.615]];

  const ease = K.easeInOut;
  const f1 = t => K.ramp(t, tCross - 0.1, tNiemen + 0.8, ease);
  const f2 = t => K.ramp(t, tRetreat + 0.5, tHeat + 0.8, ease);
  const f3 = t => K.ramp(t, tHeat + 0.8, tBorodino - 0.2, ease);
  const f4 = t => K.ramp(t, tWeek - 0.1, tMoscow + 0.2, ease);
  const r12 = t => K.ramp(t, tRetreat - 0.3, tBurning + 0.3, ease);
  const r3 = t => K.ramp(t, tVillages, tHeat + 2.2, ease);
  // army strength (1 = full): melts on the march, bleeds at Borodino
  const frStr = t => 1 - 0.45 * K.ramp(t, tHeat, tMarchEnd + 0.5) - 0.15 * K.ramp(t, tCollide, tSeventy + 1) - 0.07 * K.ramp(t, tWeek, tMoscow);
  const ruStr = t => 0.75 - 0.25 * K.ramp(t, tCollide, tSeventy + 1);

  // ---- camera: settle before key lines, small bearing changes, fly on long hops ----
  const cam = cameraPath([
    { t: 0, center: [19.5, 52.3], zoom: 4.45, pitch: 0, bearing: 0, push: 0.04 },
    { t: tGrand - 0.15, dur: tGrand - tNever - 0.75, center: [23.74, 54.87], zoom: 8.15, pitch: 32, bearing: -6, fly: true, push: 0.035 },
    { t: tUnexp + 0.3, dur: tUnexp - tNiemen - 0.6, center: [27.7, 54.35], zoom: 6.35, pitch: 22, bearing: 0, push: 0.012 },
    { t: tMarchEnd, dur: tMarchEnd - tBurning + 0.4, center: [31.7, 54.85], zoom: 6.55, pitch: 26, bearing: 3, push: 0.01 },
    { t: tBorodino + 0.5, dur: tBorodino + 0.2 - tMarchEnd, center: [35.80, 55.525], zoom: 10.2, pitch: 40, bearing: 84, fly: true, push: 0.02, orbit: 0.5 },
    { t: tMoscow + 0.4, dur: tMoscow + 0.3 - tWeek, center: [37.61, 55.752], zoom: 10.35, pitch: 40, bearing: 88, fly: true, push: 0.025, orbit: 0.8 },
  ], { W, H });

  const style = {
    version: 8, transition: { duration: 0, delay: 0 },
    sources: {
      world: { type: 'image', url: A + 'sat/world.jpg', coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]] },
      sat: { type: 'raster', tiles: [A + 'sat/europe1812/{z}/{x}/{y}.jpg'], tileSize: 512, minzoom: 2, maxzoom: 11, bounds: [-12, 34, 62, 66] },
      dem: { type: 'raster-dem', tiles: [A + 'dem/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 8 },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#1d5674' } },
      { id: 'world', type: 'raster', source: 'world', paint: { 'raster-fade-duration': 0 } },
      { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-fade-duration': 0, 'raster-resampling': 'linear', 'raster-contrast': 0.06, 'raster-saturation': -0.08, 'raster-brightness-min': 0.03 } },
      { id: 'relief', type: 'hillshade', source: 'dem', paint: { 'hillshade-exaggeration': 0.3, 'hillshade-shadow-color': 'rgba(0,0,0,0.4)', 'hillshade-highlight-color': 'rgba(255,255,255,0.1)', 'hillshade-accent-color': 'rgba(0,0,0,0)' } },
    ],
  };

  let blocs, rivers, flags = {}, pages;
  const init = async () => {
    await F.loadIcons(A + 'icons.json');
    const b = await fetch(D + 'blocs1812.geojson').then(r => r.json());
    blocs = {};
    for (const f of b.features) blocs[f.properties.bloc] = f.geometry.coordinates.flatMap(poly => poly);
    const r = await fetch(D + 'rivers1812.geojson').then(r => r.json());
    rivers = {};
    for (const f of r.features) { const g = f.geometry; (rivers[f.properties.name] ||= []).push(...(g.type === 'MultiLineString' ? g.coordinates : [g.coordinates])); }
    for (const c of ['fr', 'ru']) flags[c] = await K.loadImage(A + `flags/${c}.svg`, 640, 480);
    pages = K.captionPages(T.allWords, 4);
  };

  const nightA = t => K.ramp(t, tNight - 0.5, tNight + 0.6);
  const emptyA = t => K.window01(t, tEmpty - 0.2, tEmpty + 0.3, tNight - 0.5, tNight);
  const mapFilter = t => {
    const n = nightA(t), e = emptyA(t);
    if (n < 0.001 && e < 0.001) return 'none';
    return `brightness(${(1 - 0.6 * n).toFixed(3)}) saturate(${(1 - 0.45 * n - 0.45 * e).toFixed(3)})`;
  };
  const C = { fr: '#2F6BFF', ru: '#E5383B', frDim: 'rgba(47,107,255,0.4)' };
  const fires = [[26.9, 55.34], [28.3, 55.70], [29.6, 55.48], [30.85, 55.18], [26.0, 53.13], [27.3, 53.25], [28.6, 53.24], [29.85, 53.62]];
  const moscowFires = Array.from({ length: 26 }, (_, i) => {
    const a = K.hash2(i, 77) * Math.PI * 2, r = 0.006 + 0.042 * Math.sqrt(K.hash2(i, 78));
    return { ll: [37.62 + Math.cos(a) * r * 1.7, 55.752 + Math.sin(a) * r], d: r, seed: i + 100 };
  });

  // ---------- armies ----------
  // army(g, p, o): p = screen point of the army (arrow head), o.dir = facing (+1 right / -1 left), o.str = strength
  function strengthBars(g, x, y, n, of, col, a) {
    for (let i = 0; i < of; i++) {
      g.save(); g.globalAlpha = a * (i < n ? 1 : 0.28);
      K.roundRect(g, x + i * 15, y, 11, 6, 2); g.fillStyle = i < n ? col : '#fff'; g.fill(); g.restore();
    }
  }
  function namePlate(g, x, y, label, sub, col, a, bars = null) {
    g.save(); g.globalAlpha = a;
    g.font = K.font(26, 'Oswald', 700); const lw = g.measureText(label).width + 30;
    const h = sub || bars ? 58 : 40;
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
    K.roundRect(g, x - lw / 2, y, lw, h, 8); g.fillStyle = 'rgba(10,14,22,0.86)'; g.fill(); g.shadowColor = 'transparent';
    K.roundRect(g, x - lw / 2, y, lw, 4, 2); g.fillStyle = col; g.fill(); g.restore();
    K.text(g, label, x, y + 22, { family: 'Oswald', weight: 700, size: 26, color: '#fff', halo: null, alpha: a, tracking: 1.5 });
    if (bars) strengthBars(g, x - (bars[1] * 15 - 4) / 2, y + 40, bars[0], bars[1], col, a);
    else if (sub) K.text(g, sub, x, y + 44, { family: 'Inter', weight: 800, size: 15, color: 'rgba(255,255,255,0.7)', halo: null, alpha: a, tracking: 1.5 });
  }
  const ARMY = {
    tokens(g, p, o) {
      const { nation, label, str, a, t, dir } = o;
      const x = p[0], y = p[1];
      g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, y, 30, 9, 0, 0, Math.PI * 2); g.fill(); g.restore();
      F.standard(g, x - 8 * dir, y, 116, flags[nation], t, { alpha: a, dir });
      F.soldier(g, x + 16 * dir, y + 2, 60, { nation, t, alpha: a, dir, standing: !o.moving, seed: 3 });
      namePlate(g, x, y + 16, label, null, nation === 'fr' ? C.fr : C.ru, a, [Math.max(1, Math.round(str * 5)), 5]);
    },
    figures(g, p, o) {
      const { nation, label, str, a, t, dir, path } = o;
      const blocks = Math.max(1, Math.round(str * 5));
      const fh = 30 * o.zsc, ranks = 3, files = 5;
      // blocks trail behind the head along the screen path (path runs tail -> head)
      const behind = d => { // point d px behind the head along the path
        let rem = d;
        for (let i = path.length - 1; i > 0; i--) {
          const s = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
          if (rem <= s) { const u = rem / s; return [K.lerp(path[i][0], path[i - 1][0], u), K.lerp(path[i][1], path[i - 1][1], u)]; }
          rem -= s;
        }
        return path[0];
      };
      const items = [];
      for (let b = 0; b < blocks; b++) {
        const c = path && path.length > 1 ? behind((30 + b * 92) * o.zsc) : [p[0] - dir * (30 + b * 92) * o.zsc, p[1]];
        for (let r = 0; r < ranks; r++) for (let f = 0; f < files; f++) {
          const x = c[0] - dir * (f * 15 + r * 6) * o.zsc + (K.hash2(b * 31 + r * 7 + f, 5) - 0.5) * 3;
          const y = c[1] + (r - 1) * 11 * o.zsc + (K.hash2(b * 31 + r * 7 + f, 6) - 0.5) * 2;
          items.push([y, x, b * 31 + r * 7 + f]);
        }
      }
      items.sort((u, v) => u[0] - v[0]);
      for (const [y, x, s] of items) F.soldier(g, x, y, fh, { nation, t, alpha: a, dir, standing: !o.moving, seed: s });
      const fb = path && path.length > 1 ? behind(4) : [p[0], p[1]];
      F.standard(g, fb[0] + 6 * dir, fb[1] - 2, 78 * o.zsc, flags[nation], t, { alpha: a, dir });
      F.soldier(g, fb[0], fb[1] + 2, 34 * o.zsc, { nation, t, alpha: a, dir, standing: !o.moving, seed: 1 });
      if (label) namePlate(g, fb[0], fb[1] - 92 * o.zsc - 40, label, null, nation === 'fr' ? C.fr : C.ru, a * o.labelA);
    },
    counters(g, p, o) {
      const { nation, label, str, a, t } = o;
      const n = Math.max(1, Math.round(str * 3));
      const col = nation === 'fr' ? C.fr : C.ru;
      const cw = 92, ch = 62;
      for (let k = n - 1; k >= 0; k--) {
        const x = p[0] - cw / 2 + k * 9, y = p[1] - ch - 18 - k * 9;
        g.save(); g.globalAlpha = a;
        g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 12; g.shadowOffsetY = 5;
        g.fillStyle = col; g.fillRect(x, y, cw, ch); g.shadowColor = 'transparent';
        g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, cw - 3, ch - 3);
        if (k === 0) {
          g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.beginPath();
          g.moveTo(x + 14, y + 14); g.lineTo(x + cw - 14, y + ch - 14); g.moveTo(x + cw - 14, y + 14); g.lineTo(x + 14, y + ch - 14); g.stroke();
          g.fillStyle = '#fff'; g.fillRect(x + cw / 2 - 9, y - 10, 4, 10); g.fillRect(x + cw / 2 + 5, y - 10, 4, 10); // XX = army echelon
          g.drawImage(flags[nation], x + 4, y + 4, 26, 19);
          g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1; g.strokeRect(x + 4, y + 4, 26, 19);
        }
        g.restore();
      }
      g.save(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(p[0], p[1] - 18); g.lineTo(p[0], p[1]); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(p[0], p[1], 4, 0, Math.PI * 2); g.fill(); g.restore();
      namePlate(g, p[0], p[1] + 12, label, null, col, a, [Math.max(1, Math.round(str * 5)), 5]);
    },
  };

  // ---------- draw ----------
  const draw = (g, t, api) => {
    const P = ll => api.project(ll);
    // pitched-camera depth test (MapLibre camera: 1.5*H px from the centre along the view ray)
    const mz = api.map.getZoom(), ws = 512 * Math.pow(2, mz), pch = api.map.getPitch() * Math.PI / 180, brg = api.map.getBearing() * Math.PI / 180;
    const merc = ([lng, lat]) => [(lng + 180) / 360 * ws, (0.5 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI)) * ws];
    const cc = api.map.getCenter(), c0 = merc([cc.lng, cc.lat]), dcam = 1.5 * H, fx = Math.sin(brg), fy = -Math.cos(brg);
    const camX = c0[0] - fx * dcam * Math.sin(pch), camY = c0[1] - fy * dcam * Math.sin(pch), camH = dcam * Math.cos(pch);
    const vis = ll => { const q = merc(ll); return ((q[0] - camX) * fx + (q[1] - camY) * fy) * Math.sin(pch) + camH * Math.cos(pch) > 0.35 * dcam; };
    const onScreen = p => p[0] > -200 && p[0] < W + 200 && p[1] > -200 && p[1] < H + 200;
    const slicePts = (r, f) => { let s = geoSlice(r, f); let i0 = 0; while (i0 < s.length - 1 && !vis(s[i0])) i0++; s = s.slice(i0); return s.length > 1 && vis(s[s.length - 1]) ? s.map(P) : null; };
    const arrow = (r, f, o) => { if (f <= 0.003) return null; const pts = slicePts(r, f); return pts ? { ...F.cleanArrow(g, pts, o), pts } : null; };

    // grade overlays
    const n = nightA(t);
    if (n > 0) { g.fillStyle = `rgba(8,18,52,${0.36 * n})`; g.fillRect(0, 0, W, H); }

    // ---- 1812 blocs (wide shots only) ----
    const wide = 1 - K.ramp(t, tMost + 0.6, tGrand - 0.6);
    if (wide > 0.01) {
      const PLs = lls => lls.map(P);
      const frRev = K.ramp(t, tNapoleon - 0.1, tNapoleon + 1.6, K.easeOut), ruRev = K.ramp(t, tRussia - 0.15, tRussia + 1.3, K.easeOut);
      if (frRev > 0) { const c = P(PL.paris); F.territory(g, blocs.french.map(PLs), { fill: 'rgba(47,107,255,0.48)', stroke: '#8DB0FF', width: 3, glow: 'rgba(120,160,255,0.55)', glowWidth: 24, alpha: wide, reveal: { x: c[0], y: c[1], r: frRev * 2600 }, edge: frRev < 1 ? 'rgba(200,220,255,0.9)' : null }); }
      if (ruRev > 0) { const c = P(PL.moscow); F.territory(g, blocs.russia.map(PLs), { fill: 'rgba(229,56,59,0.44)', stroke: '#FF8C8E', width: 3, glow: 'rgba(255,110,110,0.5)', glowWidth: 24, alpha: wide, reveal: { x: c[0], y: c[1], r: ruRev * 2600 }, edge: ruRev < 1 ? 'rgba(255,220,220,0.9)' : null }); }
      const bf = K.window01(t, tNapoleon + 0.6, tNapoleon + 1.2, tMost + 0.6, tGrand - 1.0), br = K.window01(t, tRussia + 0.2, tRussia + 0.8, tMost + 0.6, tGrand - 1.0);
      if (bf > 0) { const p = P([11.0, 47.9]); F.label(g, "NAPOLEON'S EMPIRE", p[0], p[1], { size: 38, tracking: 6, alpha: bf * wide }); F.label(g, '& ALLIES', p[0], p[1] + 40, { size: 26, tracking: 6, alpha: bf * wide, color: '#cfe0ff' }); }
      if (br > 0) { const p = P([36.5, 57.2]); F.label(g, 'RUSSIAN EMPIRE', p[0], p[1], { size: 42, tracking: 7, alpha: br * wide }); }
    }

    // ---- rivers ----
    const riverDraw = (name, a, o = {}) => {
      if (a <= 0.01 || !rivers[name]) return;
      const { width = 2, color = '150,205,240', glow = 0 } = o;
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      for (const line of rivers[name]) {
        const pts = line.filter(vis).map(P);
        if (pts.length < 2) continue;
        g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
        if (glow > 0) { g.globalAlpha = a * glow * 0.5; g.strokeStyle = `rgb(${color})`; g.lineWidth = width * 5; g.stroke(); }
        g.globalAlpha = a; g.strokeStyle = `rgb(${color})`; g.lineWidth = width; g.stroke();
      }
      g.restore();
    };
    const campA = K.ramp(t, tGrand - 1.2, tGrand);
    const niemenHi = K.window01(t, tNiemen - 0.3, tNiemen + 0.3, tRetreat, tRetreat + 1.0);
    riverDraw('Niemen', campA, { width: 2 + 3 * niemenHi, glow: 0.3 + niemenHi, color: niemenHi > 0.2 ? '120,200,255' : '150,205,240' });
    for (const r of ['Dvina', 'Dnieper', 'Moskva']) riverDraw(r, campA * 0.7, { width: 1.6 });
    if (niemenHi > 0) { const p = P([22.35, 55.22]); F.label(g, 'NIEMEN', p[0], p[1], { size: 34, tracking: 8, alpha: niemenHi, color: '#bfe6ff' }); }

    // ---- cities ----
    const cities = [['Kovno', PL.kovno, 'n'], ['Vilna', PL.vilna, 's'], ['Vitebsk', PL.vitebsk, 's'], ['Smolensk', PL.smolensk, 's'], ['Vyazma', PL.vyazma, 's'], ['Orsha', PL.orsha, 's']];
    for (const [nm, ll, pos] of cities) {
      if (!vis(ll)) continue;
      const p = P(ll);
      if (!onScreen(p)) continue;
      K.dot(g, p[0], p[1], 6, '#fff', { alpha: campA, stroke: 'rgba(10,12,16,0.9)', strokeWidth: 2.5 });
      F.label(g, nm.toUpperCase(), p[0], p[1] + (pos === 'n' ? -26 : 28), { size: 28, family: 'Oswald', weight: 600, tracking: 3, alpha: campA });
    }

    // ---- burning villages ----
    fires.forEach(([lng, lat], i) => {
      const t0 = tBurning - 0.3 + (i % 4) * 0.35;
      const a = K.ramp(t, t0, t0 + 0.5) * (1 - K.ramp(t, tSept, tBorodino));
      if (a <= 0 || !vis([lng, lat])) return;
      const p = P([lng, lat]);
      F.burnSpot(g, p[0], p[1], t, { scale: 0.75, alpha: a, seed: 30 + i });
    });

    // ---- arrows (older phases dim) ----
    const dimF = (t0) => 1 - 0.6 * K.ramp(t, t0, t0 + 0.8);
    const RU = { width: 20, color: C.ru }, FR = { width: 24, color: C.fr };
    const rA = 1 - K.ramp(t, tSept, tBorodino);
    const hR1 = arrow(R1, r12(t), { ...RU, alpha: K.ramp(t, tRetreat - 0.4, tRetreat) * rA * dimF(tHeat) });
    const hR2 = arrow(R2, r12(t), { ...RU, alpha: K.ramp(t, tRetreat - 0.4, tRetreat) * rA * dimF(tHeat) });
    const hR3 = arrow(R3, r3(t), { ...RU, alpha: rA });
    const hF1 = arrow(F1, f1(t), { ...FR, alpha: dimF(tRetreat + 0.5) });
    const hF2 = arrow(F2, f2(t), { ...FR, alpha: dimF(tHeat - 0.2) });
    const hF3 = arrow(F3, f3(t), { ...FR, alpha: dimF(tWeek) });
    const hF4 = arrow(F4, f4(t), { ...FR, alpha: 1 });

    // ---- Borodino: lines, gunfire, starburst, casualty card ----
    const lineA = K.window01(t, tSept - 0.3, tBorodino, tWeek, tWeek + 0.8);
    if (lineA > 0 && ruLine.every(vis) && frLine.every(vis)) {
      const ru = K.catmull(ruLine, 10).map(P), fr = K.catmull(frLine, 10).map(P);
      if (look === 'figures') {
        const lineOf = (pts, nation, dir, a) => {
          const cum = K.cumLen(pts), L = cum[cum.length - 1], items = [];
          const zf = K.clamp(Math.pow(2, (mz - 6.3) * 0.3), 0.85, 1.6);
          for (let d = 8; d < L; d += 17 * zf) for (let r = 0; r < 2; r++) { const q = K.pointAt(pts, cum, d); items.push([q[1] + dir * r * 12 * zf, q[0] + (r ? 8 : 0) * zf, d]); }
          items.sort((u, v) => u[0] - v[0]);
          for (const [y, x, s] of items) F.soldier(g, x, y, 34 * zf, { nation, t, alpha: a, dir: 1, standing: true, seed: s, back: nation === 'fr' });
        };
        lineOf(ru, 'ru', -1, lineA);
        lineOf(fr, 'fr', 1, K.window01(t, tCollide - 0.5, tCollide - 0.1, tWeek, tWeek + 0.8));
      } else {
        const stroke = (pts, col, a, teeth) => {
          g.save(); g.globalAlpha = a; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
          g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
          if (teeth) {
            g.shadowColor = 'transparent'; g.fillStyle = col; const cum = K.cumLen(pts), L = cum[cum.length - 1];
            for (let d = 10; d < L - 6; d += 24) { const q = K.pointAt(pts, cum, d), nx = Math.sin(q[2]), ny = -Math.cos(q[2]); const sg = nx < 0 ? 1 : -1;
              g.beginPath(); g.moveTo(q[0] - Math.cos(q[2]) * 8, q[1] - Math.sin(q[2]) * 8); g.lineTo(q[0] + nx * sg * 17, q[1] + ny * sg * 17); g.lineTo(q[0] + Math.cos(q[2]) * 8, q[1] + Math.sin(q[2]) * 8); g.fill(); }
          }
          g.restore();
        };
        stroke(ru, C.ru, lineA, true);
        stroke(fr, C.fr, K.window01(t, tCollide - 0.5, tCollide - 0.1, tWeek, tWeek + 0.8), false);
      }
      const bA = K.window01(t, tCollide - 0.1, tCollide + 0.2, tWeek + 0.2, tMoscow);
      F.battleLine(g, fr, t, { t0: tCollide - 0.05, t1: tWeek + 0.5, rate: 16, seed: 5, alpha: bA, scale: 1.7, drift: [10, -8] });
      F.battleLine(g, ru, t, { t0: tCollide, t1: tWeek + 0.5, rate: 16, seed: 9, alpha: bA, scale: 1.7, drift: [-10, -8] });
      const c = P([35.795, 55.525]);
      const pop = K.easeOutBack(K.ramp(t, tCollide - 0.1, tCollide + 0.35, x => x));
      const flash = Math.max(0, 1 - (t - tCollide) / 0.45);
      if (flash > 0 && t > tCollide) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,236,200,${0.45 * flash})`; g.fillRect(0, 0, W, H); g.restore(); }
      F.shockwave(g, c[0], c[1], t, tCollide, { r1: 460, dur: 0.9, width: 7 });
      const iA = K.window01(t, tCollide - 0.1, tCollide + 0.1, tSingle - 0.2, tSingle + 0.4);
      F.icon(g, 'sabres', c[0], c[1] - 70, 120 * pop, { alpha: iA, color: '#fff', outline: 'rgba(10,10,14,0.9)', outlineWidth: 10, blur: 20 });
      F.label(g, 'BORODINO', W / 2, H - 200, { size: 54, tracking: 10, alpha: K.window01(t, tBorodino - 0.2, tBorodino + 0.3, tWeek, tWeek + 0.6) });
    }
    const kA = K.window01(t, tSingle - 0.1, tSingle + 0.25, tWeek - 0.4, tWeek);
    if (kA > 0) {
      const v = Math.round(70000 * K.easeOut(K.ramp(t, tSingle, tSeventy + 0.9)) / 100) * 100;
      F.statCard(g, W / 2, 170, '≈' + K.fmtInt(v), 'KILLED OR WOUNDED  ·  IN ONE DAY', { alpha: kA, accent: '#FF6B6E', w: 660, bigSize: 100 });
    }

    // ---- Moscow ----
    const burnA = K.ramp(t, tBurn - 0.45, tBurn + 0.5);
    if (burnA > 0) {
      const q = [[37.49, 55.815], [37.77, 55.815], [37.49, 55.69]];
      if (q.every(vis)) F.areaFire(g, q.map(P), t, { alpha: burnA, spread: K.ramp(t, tBurn - 0.45, tBurn + 2.0, K.easeOut), night: nightA(t), seed: 3 });
    }
    const mosA = K.ramp(t, tWeek + 0.3, tMoscow);
    if (mosA > 0) {
      const p = P(PL.moscow), pop = K.easeOutBack(K.ramp(t, tMoscow - 0.3, tMoscow + 0.3, x => x));
      F.icon(g, 'basil', p[0], p[1] - 64, 110 * pop, { alpha: mosA, color: '#fff', outline: 'rgba(10,10,14,0.85)', outlineWidth: 9, blur: 18 });
      F.label(g, 'MOSCOW', p[0], p[1] - 156, { size: 58, tracking: 12, alpha: mosA });
      F.label(g, 'ABANDONED', p[0], p[1] - 112, { size: 26, family: 'Inter', weight: 800, tracking: 8, alpha: mosA * K.window01(t, tEmpty - 0.1, tEmpty + 0.3, tNight + 0.2, tNight + 0.8), color: '#ffd7a0' });
    }

    // ---- armies ----
    const army = ARMY[look];
    const zsc = K.clamp(Math.pow(2, (mz - 6.3) * 0.3), 0.85, 1.6);
    const pos = (h, r, f) => h ? h.base : null;
    // French: on the west bank before the crossing, then riding the current phase head
    const frA = K.ramp(t, tGrand - 0.6, tGrand - 0.1);
    const frWide = K.window01(t, tMarched + 0.2, tMarched + 0.8, tNever + 0.6, tGrand - 0.9);
    if (frWide > 0 && vis([22.6, 53.9])) army(g, P([22.6, 53.9]), { nation: 'fr', label: 'GRAND ARMY', str: 1, a: frWide, t, dir: 1, moving: false, path: null, labelA: 1, zsc: 0.9 });
    if (frA > 0) {
      let hp = null, path = null, moving = false;
      const phases = [[hF4, f4], [hF3, f3], [hF2, f2], [hF1, f1]];
      for (const [h, f] of phases) if (h && f(t) > 0.003) { hp = h.base; path = h.pts; moving = f(t) < 0.999; break; }
      if (!hp && vis(F1.pts[0])) { hp = P(F1.pts[0]); path = null; }
      if (look === 'figures' && t < tCross && vis([23.42, 54.86])) { // massed on the west bank
        hp = P([23.47, 54.865]); path = [P([23.20, 54.86]), hp];
      }
      const inBattle = look === 'figures' && t > tCollide - 0.4 && t < tWeek + 0.2;
      if (hp && onScreen(hp) && !inBattle) {
        const dir = path && path.length > 1 ? Math.sign(path[path.length - 1][0] - path[Math.max(0, path.length - 8)][0]) || 1 : 1;
        army(g, hp, { nation: 'fr', label: 'GRAND ARMY', str: frStr(t), a: frA, t, dir, moving, path, labelA: 1, zsc });
      }
    }
    // Russians
    const ruA = K.window01(t, tRussians - 0.1, tRussians + 0.3, tWeek - 0.3, tWeek + 0.3);
    if (ruA > 0) {
      const split = 1 - K.ramp(t, tBurning + 0.3, tBurning + 0.8);
      if (split > 0) {
        const a1 = hR1 && r12(t) > 0.01 ? [hR1.base, hR1.pts] : (vis(R1.pts[0]) ? [P(R1.pts[0]), null] : null);
        const a2 = hR2 && r12(t) > 0.01 ? [hR2.base, hR2.pts] : (vis(R2.pts[0]) ? [P(R2.pts[0]), null] : null);
        const mv = r12(t) > 0.01 && r12(t) < 0.999;
        if (a1) army(g, a1[0], { nation: 'ru', label: '1ST ARMY', str: 0.55, a: ruA * split, t, dir: 1, moving: mv, path: a1[1], labelA: 1, zsc });
        if (a2) army(g, a2[0], { nation: 'ru', label: '2ND ARMY', str: 0.4, a: ruA * split, t, dir: 1, moving: mv, path: a2[1], labelA: 1, zsc });
      }
      const merged = K.ramp(t, tBurning + 0.5, tBurning + 1.0);
      if (merged > 0) {
        let hp = hR3 && r3(t) > 0.01 && r3(t) < 0.999 ? hR3.base : (r3(t) >= 0.999 ? (vis([35.97, 55.53]) ? P([35.97, 55.53]) : null) : (vis(R3.pts[0]) ? P(R3.pts[0]) : null));
        const atBorodino = t > tSept;
        if (hp && onScreen(hp) && !(look === 'figures' && atBorodino && t > tBorodino)) {
          const dir = atBorodino ? -1 : 1;
          army(g, hp, { nation: 'ru', label: 'RUSSIAN ARMY', str: ruStr(t), a: ruA * merged * (atBorodino ? 1 - K.ramp(t, tCollide - 0.4, tCollide) : 1), t, dir, moving: r3(t) > 0.01 && r3(t) < 0.999, path: hR3 ? hR3.pts : null, labelA: 1, zsc });
        }
      }
    }

    // ---- HEAT / HUNGER / DISEASE ----
    const chipsA = K.window01(t, tHeat - 0.1, tHeat + 0.2, tThen - 0.2, tThen + 0.3);
    if (chipsA > 0) {
      [['HEAT', tHeat], ['HUNGER', tHunger], ['DISEASE', tDisease]].forEach(([s, t0], i) => {
        const a = chipsA * K.ramp(t, t0 - 0.05, t0 + 0.2);
        if (a <= 0) return;
        const x = 56, y = 150 + i * 78 + (1 - K.easeOutBack(K.ramp(t, t0 - 0.05, t0 + 0.35, x => x))) * 20;
        g.save(); g.globalAlpha = a; K.roundRect(g, x, y, 270, 62, 12); g.fillStyle = 'rgba(10,14,22,0.84)'; g.fill();
        K.roundRect(g, x, y, 8, 62, 4); g.fillStyle = C.ru; g.fill(); g.restore();
        K.text(g, s, x + 34, y + 33, { family: 'Oswald', weight: 700, size: 36, color: '#fff', halo: null, align: 'left', tracking: 4, alpha: a });
      });
      K.text(g, 'TENS OF THOUSANDS LOST', 56, 150 + 3 * 78 + 22, { family: 'Inter', weight: 800, size: 22, color: '#FFB4B5', halo: 'rgba(0,0,0,0.8)', haloWidth: 6, align: 'left', alpha: chipsA * K.ramp(t, tTens - 0.1, tTens + 0.3), tracking: 2 });
    }

    // ---- hook title, 600,000 card, five soldiers ----
    const titleA = K.window01(t, 0.05, 0.5, tSix - 0.45, tSix - 0.1);
    if (titleA > 0) {
      K.text(g, '1812', W / 2, 200, { family: 'Oswald', weight: 700, size: 150, color: '#fff', halo: 'rgba(0,0,0,0.55)', haloWidth: 14, alpha: titleA, tracking: 16 });
      K.text(g, "NAPOLEON'S INVASION OF RUSSIA", W / 2, 300, { family: 'Inter', weight: 800, size: 28, color: '#fff', halo: 'rgba(0,0,0,0.7)', haloWidth: 8, alpha: titleA * K.ramp(t, 0.4, 1.0), tracking: 7 });
    }
    const cardA = K.window01(t, tSix - 0.15, tSix + 0.2, tNever + 1.0, tGrand - 1.2);
    if (cardA > 0) {
      const v = Math.round(600000 * K.easeOut(K.ramp(t, tSix - 0.1, tSix + 1.3)) / 1000) * 1000;
      F.statCard(g, W / 2, 190, K.fmtInt(v) + '+', 'MEN MARCH INTO RUSSIA', { alpha: cardA, accent: '#8DB0FF', w: 640, bigSize: 110 });
      for (let i = 0; i < 5; i++) {
        const lost = i < 4 ? K.ramp(t, tNever + i * 0.16, tNever + i * 0.16 + 0.3) : 0;
        const ap = cardA * K.ramp(t, tMost - 0.3 + i * 0.06, tMost + i * 0.06);
        const x = W / 2 + (i - 2) * 70, y = 440;
        F.soldier(g, x, y, 96, { nation: lost > 0.5 ? 'frRet' : 'fr', t, alpha: ap * (1 - 0.72 * lost), standing: true, shadow: true });
      }
    }

    // ---- date pill ----
    const dates = [[tJune - 0.15, '24 JUNE 1812'], [tSept - 0.1, '7 SEPTEMBER 1812'], [tWeek, '14 SEPTEMBER 1812']];
    let cur = null;
    for (const d of dates) if (t >= d[0]) cur = d;
    if (cur) F.pill(g, 56, 52, cur[1], { alpha: K.ramp(t, dates[0][0], dates[0][0] + 0.3), size: 38, dy: (1 - K.easeOut(K.ramp(t, cur[0], cur[0] + 0.3))) * 30 });

    K.captions(g, pages, t, { x: W / 2, y: H - 92, size: 50, maxWidth: 1500 });
  };

  const shake = t => {
    const s = Math.max(0, 1 - (t - tCollide) / 0.7);
    if (t < tCollide || s <= 0) return null;
    return { x: (K.noise1(t * 40, 4) - 0.5) * 24 * s, y: (K.noise1(t * 40, 5) - 0.5) * 24 * s };
  };
  const post = (g, t, frame) => {
    K.vignette(g, W, H, { strength: 0.4, inner: 0.5 });
    K.grain(g, W, H, frame, 0.03);
    const fade = Math.max(1 - K.ramp(t, 0, 0.4), K.ramp(t, tEnd - 0.7, tEnd - 0.05));
    if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
  };

  const sfx = () => [
    { t: 0.1, type: 'riser', gain: -20 },
    { t: tNapoleon, type: 'whoosh-soft', gain: -18 }, { t: tSix - 0.05, type: 'impact', gain: -13 }, { t: tRussia, type: 'whoosh-soft', gain: -18 },
    ...[0, 1, 2, 3].map(i => ({ t: tNever + i * 0.16, type: 'thud', gain: -13 })),
    { t: tNever + 1.0, type: 'whoosh-long', gain: -13 },
    { t: tCross - 0.1, type: 'march', gain: -12, dur: tRetreat - tCross + 2 },
    { t: tRetreat - 0.1, type: 'whoosh', gain: -17 },
    { t: tBurning - 0.2, type: 'fire', gain: -21, dur: 5.5 },
    { t: tHeat, type: 'tick', gain: -16 }, { t: tHunger, type: 'tick', gain: -16 }, { t: tDisease, type: 'tick', gain: -16 },
    { t: tThen, type: 'whoosh-long', gain: -14 },
    { t: tCollide - 0.05, type: 'cannon', gain: -3 }, { t: tCollide, type: 'clash', gain: -12 },
    { t: tCollide + 0.2, type: 'battle', gain: -15, dur: tWeek - tCollide + 0.6 },
    ...Array.from({ length: 10 }, (_, k) => ({ t: tCollide + 0.5 + k * 0.42 + K.hash2(k, 3) * 0.25, type: 'cannon-far', gain: -12 - 6 * K.hash2(k, 4) })),
    { t: tSeventy, type: 'impact', gain: -12 },
    { t: tWeek, type: 'whoosh-long', gain: -15 },
    { t: tMoscow + 0.1, type: 'bell', gain: -12 }, { t: tMoscow + 1.35, type: 'bell', gain: -16 },
    { t: tEmpty, type: 'wind', gain: -24, dur: 2.0 },
    { t: tBurn - 0.2, type: 'fire', gain: -9, dur: tEnd - tBurn + 0.5 },
  ];

  return {
    duration: tEnd, style, init, camera: cam, mapFilter, draw, shake, post, sfx,
    music: { score: 'napoleon1812', marks: { tSix, tNever, tJune, tCross, tRetreat, tHeat, tThen, tCollide, tKilled: w('n6', 'killed'), tWeek, tMoscow, tEmpty, tNight, tBurn,
      tWaits: tEnd + 5, tRetreat2: tEnd + 8, tWinter: tEnd + 10, tCossacks: tEnd + 12, tBerezina: tEnd + 14, tOf: tEnd + 16, tFewer: tEnd + 18, tBack: tEnd + 20, end: tEnd } },
  };
};
