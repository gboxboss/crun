// Sample 2 — "Satellite War Map", 16:9: Napoleon's invasion of Russia, 1812.
// Sentinel-2 / Blue Marble base, 1812 blocs, beveled campaign arrows that narrow as the army melts (after Minard),
// unit badges, troop flows, burning villages, the Borodino battle line, Moscow burning at night, the winter.
import * as F from '../fx.mjs';

export default ({ T, W, H, K, A, maplibregl }) => {
  const D = A + 'data/';
  const w = (id, k, n) => T.ws(id, k, n);

  // ---- narration anchors ----
  const tNapoleon = w('h1', 'Napoleon'), tMarched = w('h1', 'marched'), tSix = w('h1', 'six'), tRussia = w('h1', 'Russia');
  const tMost = w('h2', 'Most'), tNever = w('h2', 'never');
  const tJune = w('n1', 'June'), tGrand = w('n1b', 'Grand'), tCross = w('n1b', 'crosses'), tNiemen = w('n1b', 'Niemen');
  const tRussians = w('n2', 'Russians'), tUnexp = w('n2', 'unexpected'), tRetreat = w('n2b', 'retreat');
  const tBurning = w('n3', 'burning'), tVillages = w('n3', 'villages');
  const tHeat = w('n4', 'Heat'), tHunger = w('n4', 'hunger'), tDisease = w('n4', 'disease'), tMarchEnd = T.p('n4').end;
  const tThen = w('n5', 'Then'), tSept = w('n5', 'September'), tBorodino = w('n5', 'Borodino');
  const tCollide = w('n5b', 'collide');
  const tSingle = w('n6', 'single'), tSeventy = w('n6', 'seventy'), tKilled = w('n6', 'killed');
  const tWeek = w('n7', 'week'), tMoscow = w('n7', 'Moscow'), tEmpty = w('n7b', 'empty');
  const tNight = w('n8', 'night'), tBurn = w('n8', 'burn');
  const tWaits = w('n9', 'waits'), tFive = w('n9', 'five');
  const tOct = w('n9b', 'October'), tRetreat2 = w('n9b', 'retreat');
  const tWinter = w('n10', 'winter'), tArrives = w('n10', 'arrives');
  const tFreezing = w('n11', 'Freezing'), tCossacks = w('n11', 'Cossacks'), tFalls = w('n11', 'falls');
  const tBerezina = w('n12', 'Berezina'), tThousands = w('n12', 'thousands'), tLost = w('n12', 'lost');
  const tOf = w('n13', 'Of'), tSix2 = w('n13', 'six'), tFewer = w('n13', 'fewer'), tFive2 = w('n13', 'five'), tBack = w('n13', 'back');
  const tEnd = T.duration;

  // ---- places ----
  const PL = {
    paris: [2.35, 48.86], kovno: [23.90, 54.90], vilna: [25.28, 54.69], vitebsk: [30.20, 55.19], smolensk: [32.05, 54.78],
    vyazma: [34.30, 55.21], borodino: [35.82, 55.52], moscow: [37.62, 55.75], maloyaroslavets: [36.46, 55.01],
    orsha: [30.42, 54.51], studianka: [28.37, 54.33], borisov: [28.50, 54.23], molodechno: [26.85, 54.31], volkovysk: [24.47, 53.16],
  };
  // routes: geo waypoints, smoothed once in geo space; fracAt[i] = arc fraction of waypoint i
  function route(wps, segs = 14) {
    const c = Math.cos((55 * Math.PI) / 180);
    const pts = K.catmull(wps, segs);
    const cum = K.cumLen(pts.map(([x, y]) => [x * c, y])), L = cum[cum.length - 1];
    return { pts, cum: cum.map(v => v / L), fracAt: wps.map((_, i) => cum[Math.min(i * segs, cum.length - 1)] / L) };
  }
  // the part of a route from 0 to f (geo fraction), as [lng, lat, frac]
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
  const adv = route([[23.50, 54.84], PL.kovno, PL.vilna, [27.7, 54.98], PL.vitebsk, PL.smolensk, [33.2, 54.98], PL.vyazma, [35.0, 55.50], [35.725, 55.52], [36.1, 55.50], [36.9, 55.63], [37.52, 55.735]]);
  const ret = route([[37.55, 55.70], [37.05, 55.33], PL.maloyaroslavets, [36.15, 55.22], [35.6, 55.28], [34.3, 55.0], [33.2, 54.74], [32.05, 54.55], [31.3, 54.38], [30.42, 54.30],
    [29.4, 54.30], [28.37, 54.30], [27.6, 54.18], [26.85, 54.16], [25.28, 54.46], [24.1, 54.62], [23.45, 54.66]]);
  const rus1 = route([[25.40, 54.86], [26.4, 55.38], [27.6, 55.86], [28.8, 55.78], [30.0, 55.58], [31.0, 55.28], [31.85, 54.98]]);
  const rus2 = route([PL.volkovysk, [25.5, 53.08], [26.6, 53.18], [27.9, 53.28], [29.2, 53.18], [30.33, 53.9], [31.2, 54.42], [31.88, 54.70]]);
  const rus3 = route([[32.15, 55.0], [33.3, 55.34], [34.4, 55.62], [35.3, 55.70], [35.95, 55.56]]);
  const march = route([PL.paris, [8.7, 50.1], [13.4, 52.5], [17.0, 52.4], [20.9, 53.2], [23.3, 54.75]], 10);
  const A_ = adv.fracAt; // 0 start, 1 kovno, 2 vilna, 3, 4 vitebsk, 5 smolensk, 6, 7 vyazma, 8, 9 borodino-west, 10, 11, 12 moscow
  const R_ = ret.fracAt; // 0 moscow .. 2 maloyaroslavets .. 5 vyazma .. 7 smolensk .. 9 orsha .. 11 studianka .. 16 niemen

  const advFrac = t => {
    if (t < tCross - 0.2) return 0;
    if (t < tRetreat - 0.2) return K.lerp(0, A_[1] + 0.01, K.ramp(t, tCross - 0.2, tNiemen + 0.9, K.easeInOut));
    if (t < tThen) return K.lerp(A_[1] + 0.01, A_[7], K.ramp(t, tRetreat - 0.2, tMarchEnd, K.easeInOut));
    if (t < tWeek - 0.2) return K.lerp(A_[7], A_[9], K.ramp(t, tThen, tCollide - 0.1, K.easeInOut));
    return K.lerp(A_[9], 1, K.ramp(t, tWeek - 0.2, tMoscow + 0.25, K.easeInOut));
  };
  const retFrac = t => {
    if (t < tRetreat2 - 0.1) return 0;
    if (t < tFreezing) return K.lerp(0, R_[5], K.ramp(t, tRetreat2 - 0.1, tArrives + 0.3, K.easeInOut));
    if (t < tBerezina - 0.4) return K.lerp(R_[5], R_[9], K.ramp(t, tFreezing, tFalls + 0.6, K.easeInOut));
    if (t < tOf) return K.lerp(R_[9], R_[11] + 0.012, K.ramp(t, tBerezina - 0.4, tLost, K.easeInOut));
    return K.lerp(R_[11] + 0.012, 1, K.ramp(t, tOf, tFewer, K.easeInOut));
  };
  const rusFrac = t => K.ramp(t, tRetreat - 0.25, tVillages + 0.8, K.easeInOut);
  const rus3Frac = t => K.ramp(t, tVillages + 0.4, tHeat + 1.8, K.easeInOut);

  // ---- camera (16:9) ----
  const keys = [
    { t: 0, center: [19.5, 52.3], zoom: 4.45, pitch: 0, bearing: 0 },
    { t: tNever + 0.5, dur: tNever + 0.5, center: [20.2, 52.7], zoom: 4.7, pitch: 14, bearing: 0, ease: x => K.smooth(x) },
    { t: tGrand - 0.2, dur: tGrand - tNever - 0.8, center: [23.62, 54.84], zoom: 8.15, pitch: 52, bearing: -10, arc: 0.6 },
    { t: tNiemen + 1.0, center: [23.78, 54.86], zoom: 8.35, pitch: 54, bearing: -5 },
    { t: tUnexp + 0.4, dur: tUnexp - tNiemen - 0.6, center: [27.4, 54.25], zoom: 6.25, pitch: 36, bearing: 0 },
    { t: tMarchEnd, dur: tMarchEnd - tBurning + 0.4, center: [31.6, 54.75], zoom: 6.35, pitch: 38, bearing: 4 },
    { t: tBorodino + 0.7, dur: tBorodino + 0.3 - tMarchEnd, center: [35.775, 55.525], zoom: 10.35, pitch: 56, bearing: 80, arc: 0.8 },
    { t: tKilled + 1.4, dur: tKilled + 0.7 - tCollide, center: [35.79, 55.528], zoom: 10.55, pitch: 58, bearing: 92 },
    { t: tMoscow + 0.4, dur: tMoscow + 0.3 - tWeek, center: [37.60, 55.75], zoom: 10.45, pitch: 54, bearing: 96, arc: 1.4 },
    { t: tBurn + 1.0, dur: tBurn + 0.9 - tNight, center: [37.62, 55.752], zoom: 10.75, pitch: 56, bearing: 86 },
    { t: tOct + 0.4, dur: tOct - tBurn - 0.7, center: [37.58, 55.74], zoom: 10.1, pitch: 50, bearing: 58 },
    { t: tArrives + 0.4, dur: tArrives - tRetreat2 + 0.1, center: [33.0, 54.85], zoom: 6.55, pitch: 36, bearing: 0 },
    { t: tFalls + 0.6, dur: tFalls - tArrives - 0.1, center: [30.9, 54.42], zoom: 7.15, pitch: 42, bearing: -6 },
    { t: tThousands + 0.3, dur: tThousands - tFalls - 0.4, center: [28.42, 54.28], zoom: 8.5, pitch: 52, bearing: -12, arc: 0.3 },
    { t: tSix2 + 0.7, dur: tSix2 - tThousands - 0.5, center: [30.4, 54.95], zoom: 5.85, pitch: 26, bearing: 0 },
    { t: tEnd, dur: tEnd - tSix2 - 0.7, center: [30.2, 54.95], zoom: 5.72, pitch: 24, bearing: 0, ease: x => x },
  ];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (k.dur == null) k.dur = k.t - keys[i - 1].t;
    k.dur = Math.max(0.2, Math.min(k.dur, k.t - keys[i - 1].t));
  }
  const cam = K.cameraTrack(keys, { drift: 0.004, driftZoom: 0.02 });

  // ---- style ----
  const style = {
    version: 8,
    transition: { duration: 0, delay: 0 },
    sources: {
      world: { type: 'image', url: A + 'sat/world.jpg', coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]] },
      sat: { type: 'raster', tiles: [A + 'sat/europe1812/{z}/{x}/{y}.jpg'], tileSize: 512, minzoom: 2, maxzoom: 11, bounds: [-12, 34, 62, 66] },
      dem: { type: 'raster-dem', tiles: [A + 'dem/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 8 },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#1d5674' } },
      { id: 'world', type: 'raster', source: 'world', paint: { 'raster-fade-duration': 0 } },
      { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-fade-duration': 0, 'raster-resampling': 'linear', 'raster-contrast': 0.08, 'raster-saturation': 0.08, 'raster-brightness-min': 0.04 } },
      { id: 'relief', type: 'hillshade', source: 'dem', paint: { 'hillshade-exaggeration': 0.3, 'hillshade-shadow-color': 'rgba(0,0,0,0.4)', 'hillshade-highlight-color': 'rgba(255,255,255,0.10)', 'hillshade-accent-color': 'rgba(0,0,0,0)' } },
    ],
  };

  // ---- data ----
  let blocs, rivers, flags = {}, pages, frost;
  const init = async () => {
    await F.loadIcons(A + 'icons.json');
    const b = await fetch(D + 'blocs1812.geojson').then(r => r.json());
    blocs = {};
    for (const f of b.features) blocs[f.properties.bloc] = f.geometry.coordinates.flatMap(poly => poly);
    const r = await fetch(D + 'rivers1812.geojson').then(r => r.json());
    rivers = {};
    for (const f of r.features) {
      const g = f.geometry, lines = g.type === 'MultiLineString' ? g.coordinates : [g.coordinates];
      (rivers[f.properties.name] ||= []).push(...lines);
    }
    for (const c of ['fr', 'ru']) flags[c] = await K.loadImage(A + `flags/${c}.svg`, 640, 480);
    pages = K.captionPages(T.allWords, 4);
    frost = F.makeFrost(Math.round(W / 3), Math.round(H / 3));
  };

  // ---- looks over time ----
  const nightA = t => K.window01(t, tNight - 0.5, tNight + 0.5, tFive, tOct + 0.3);
  const winterA = t => K.ramp(t, tWinter - 0.4, tWinter + 2.4);
  const emptyA = t => K.window01(t, tEmpty - 0.2, tEmpty + 0.3, tNight - 0.5, tNight);
  const mapState = (t, api) => {
    const wv = winterA(t);
    for (const id of ['sat', 'world']) {
      api.paint(id, 'raster-brightness-min', +((id === 'sat' ? 0.04 : 0) + 0.24 * wv).toFixed(3));
      api.paint(id, 'raster-contrast', +((id === 'sat' ? 0.08 : 0) + 0.22 * wv).toFixed(3));
      api.paint(id, 'raster-saturation', +((id === 'sat' ? 0.08 : 0) - 0.62 * wv).toFixed(3));
    }
  };
  const mapFilter = t => {
    const n = nightA(t), e = emptyA(t);
    if (n < 0.001 && e < 0.001) return 'none';
    return `brightness(${(1 - 0.58 * n).toFixed(3)}) saturate(${(1 - 0.45 * n - 0.4 * e).toFixed(3)})`;
  };

  const C = { fr: '#2F6BFF', frLight: '#7FA6FF', ru: '#E5383B', ruLight: '#FF7A7C', ret: '#1E2F6E', gold: '#FFD23F' };
  const fires = [[26.9, 55.32], [28.3, 55.66], [29.6, 55.43], [30.85, 55.12], [26.0, 53.13], [27.3, 53.25], [28.6, 53.24], [29.85, 53.62], [33.0, 55.12], [34.0, 55.33]];
  const moscowFires = Array.from({ length: 40 }, (_, i) => {
    const a = K.hash2(i, 77) * Math.PI * 2, r = 0.012 + 0.05 * Math.sqrt(K.hash2(i, 78));
    return { ll: [37.62 + Math.cos(a) * r * 1.6, 55.75 + Math.sin(a) * r], d: r, seed: i + 100 };
  });
  const raids = [[0.30, 1], [0.36, -1], [0.43, 1], [0.50, -1], [0.56, 1], [0.62, -1]]; // [route fraction, side]
  const frLine = [[35.742, 55.43], [35.75, 55.48], [35.754, 55.53], [35.75, 55.58], [35.742, 55.62]];
  const ruLine = [[35.83, 55.435], [35.842, 55.48], [35.848, 55.53], [35.845, 55.575], [35.835, 55.615]];

  const dates = [
    [tJune - 0.15, '24 JUNE 1812'], [tSept - 0.1, '7 SEPTEMBER 1812'], [tWeek, '14 SEPTEMBER 1812'],
    [tWaits, 'ROLL'], [tOct - 0.1, '19 OCTOBER 1812'], [tWinter - 0.3, 'NOVEMBER 1812'],
  ];
  const MONTHS = ['SEPTEMBER', 'OCTOBER'];
  const rollDate = t => { // 14 Sep -> 19 Oct while he waits
    const d = Math.round(K.lerp(14, 49, K.ramp(t, tWaits, tOct - 0.3, x => x)));
    return d <= 30 ? `${d} ${MONTHS[0]} 1812` : `${d - 30} ${MONTHS[1]} 1812`;
  };

  // ---- draw ----
  const draw = (g, t, api) => {
    const P = ll => api.project(ll);
    const PL_ = lls => lls.map(P);
    const zoom = api.map.getZoom();
    const zs = K.clamp(Math.pow(2, zoom - 6.3), 0.5, 1.9);
    const us = K.clamp(Math.pow(2, (zoom - 6.3) * 0.35), 0.8, 1.25); // ui-ish scale for badges/labels on the map
    // ground points behind (or nearly behind) a pitched camera project to garbage: test depth along the view ray
    // MapLibre camera: distance 1.5*H px from the centre along the view ray (default 36.87deg vertical fov)
    const mz = api.map.getZoom(), ws = 512 * Math.pow(2, mz), pch = api.map.getPitch() * Math.PI / 180, brg = api.map.getBearing() * Math.PI / 180;
    const merc = ([lng, lat]) => [(lng + 180) / 360 * ws, (0.5 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI)) * ws];
    const cc = api.map.getCenter(), c0 = merc([cc.lng, cc.lat]), dcam = 1.5 * H;
    const fx = Math.sin(brg), fy = -Math.cos(brg);
    const camX = c0[0] - fx * dcam * Math.sin(pch), camY = c0[1] - fy * dcam * Math.sin(pch), camH = dcam * Math.cos(pch);
    const vis = ll => { const q = merc(ll); return ((q[0] - camX) * fx + (q[1] - camY) * fy) * Math.sin(pch) + camH * Math.cos(pch) > 0.35 * dcam; };
    const drawRoute = (r, f, o) => {
      if (f <= 0.002) return null;
      let sl = geoSlice(r, f), i0 = 0;
      while (i0 < sl.length - 1 && !vis(sl[i0])) i0++;
      if (!vis(sl[sl.length - 1])) return null;
      sl = sl.slice(i0);
      if (sl.length < 2) return null;
      const fs = sl[0][2], fe = sl[sl.length - 1][2];
      const ww = fr => (o.w1 == null ? o.w0 : K.lerp(o.w0, o.w1, fr));
      return F.warArrow(g, sl.map(P), 1, { ...o, w0: ww(fs), w1: ww(fe), taper: i0 === 0 && fs === 0 });
    };

    // night + empty-city grade overlays
    const n = nightA(t);
    if (n > 0) { g.fillStyle = `rgba(8,18,52,${0.38 * n})`; g.fillRect(0, 0, W, H); }
    const wv = winterA(t);
    if (wv > 0) {
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(150,180,215,${0.30 * wv})`; g.fillRect(0, 0, W, H); g.restore();
      g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(205,222,245,${wv})`; g.fillRect(0, 0, W, H); g.restore();
    }

    // ---- 1812 blocs ----
    const wide = 1 - K.ramp(t, tMost + 0.6, tGrand - 0.6);
    const frRev = K.ramp(t, tNapoleon - 0.1, tNapoleon + 1.6, K.easeOut);
    const ruRev = K.ramp(t, tRussia - 0.15, tRussia + 1.3, K.easeOut);
    const blocAlpha = Math.max(wide, K.ramp(t, tOf - 0.2, tOf + 0.8) * 0.55);
    if (frRev > 0 && blocAlpha > 0.01) {
      const c = P(PL.paris);
      F.territory(g, blocs.french.map(PL_), { fill: `rgba(47,107,255,${0.46 * wide + 0.12})`, stroke: '#8DB0FF', width: 2.5 + wide, glow: 'rgba(120,160,255,0.55)', glowWidth: 22 * wide + 6, alpha: blocAlpha, reveal: { x: c[0], y: c[1], r: frRev * 2600 }, edge: frRev < 1 ? 'rgba(200,220,255,0.9)' : null });
    }
    if (ruRev > 0 && blocAlpha > 0.01) {
      const c = P(PL.moscow);
      F.territory(g, blocs.russia.map(PL_), { fill: `rgba(229,56,59,${0.42 * wide + 0.07})`, stroke: '#FF8C8E', width: 2.5 + wide, glow: 'rgba(255,110,110,0.5)', glowWidth: 22 * wide + 6, alpha: blocAlpha, reveal: { x: c[0], y: c[1], r: ruRev * 2600 }, edge: ruRev < 1 ? 'rgba(255,220,220,0.9)' : null });
    }
    // bloc names on the wide shot
    const bnA = K.window01(t, tRussia + 0.2, tRussia + 0.8, tMost + 0.6, tGrand - 1.0);
    const bfA = K.window01(t, tNapoleon + 0.6, tNapoleon + 1.2, tMost + 0.6, tGrand - 1.0);
    if (bfA > 0) { const p = P([11.0, 47.9]); F.label(g, "NAPOLEON'S EMPIRE", p[0], p[1], { size: 38, tracking: 6, alpha: bfA }); F.label(g, '& ALLIES', p[0], p[1] + 40, { size: 26, tracking: 6, alpha: bfA, color: '#cfe0ff' }); }
    if (bnA > 0) { const p = P([36.5, 57.2]); F.label(g, 'RUSSIAN EMPIRE', p[0], p[1], { size: 42, tracking: 7, alpha: bnA }); }

    // ---- rivers ----
    const riverDraw = (name, a, o = {}) => {
      if (a <= 0.01 || !rivers[name]) return;
      const { width = 2, color = '160,215,255', glow = 0 } = o;
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
    riverDraw('Niemen', campA, { width: 2 + 3 * niemenHi * zs / 1.9, glow: 0.3 + niemenHi, color: niemenHi > 0.2 ? '120,200,255' : '150,205,240' });
    for (const r of ['Dvina', 'Dnieper', 'Moskva']) riverDraw(r, campA * 0.75, { width: 1.6 });
    const berHi = K.window01(t, tBerezina - 0.4, tBerezina + 0.4, tOf, tOf + 1);
    riverDraw('Berezina', campA * 0.75 + berHi * 0.25, { width: 1.6 + 4 * berHi, glow: berHi, color: berHi > 0.2 ? '190,235,255' : '150,205,240' });
    if (niemenHi > 0) { const p = P([22.75, 55.16]); F.label(g, 'NIEMEN', p[0], p[1], { size: 34, family: 'Oswald', tracking: 8, alpha: niemenHi, color: '#bfe6ff' }); }
    if (berHi > 0) { const p = P([28.30, 54.66]); F.label(g, 'BEREZINA', p[0], p[1], { size: 34, tracking: 8, alpha: berHi, color: '#d9f2ff' }); }

    // ---- cities ----
    const cityA = campA * (1 - 0.7 * K.window01(t, tNight - 0.3, tNight + 0.3, tOct, tOct + 1));
    const cities = [['Kovno', PL.kovno, 'n'], ['Vilna', PL.vilna, 'n'], ['Vitebsk', PL.vitebsk, 'n'], ['Smolensk', PL.smolensk, 'n'], ['Vyazma', PL.vyazma, 'n'], ['Borodino', PL.borodino, 's'], ['Moscow', PL.moscow, 'n'], ['Maloyaroslavets', PL.maloyaroslavets, 's'], ['Orsha', PL.orsha, 's'], ['Borisov', PL.borisov, 's']];
    for (const [nm, ll, pos] of cities) {
      if (nm === 'Moscow' && t > tWeek - 0.3) continue;
      if (nm === 'Borodino' && t > tSept - 0.3 && t < tWeek + 1) continue;
      if (!vis(ll)) continue;
      const p = P(ll);
      if (p[0] < -50 || p[0] > W + 50 || p[1] < -50 || p[1] > H + 50) continue;
      K.dot(g, p[0], p[1], 5.5, '#fff', { alpha: cityA, stroke: 'rgba(10,12,16,0.9)', strokeWidth: 2.5 });
      F.label(g, nm.toUpperCase(), p[0], p[1] + (pos === 'n' ? -22 : 24), { size: 22, family: 'Inter', weight: 800, tracking: 2, alpha: cityA });
    }

    // ---- march across Europe (hook) ----
    const mA = K.window01(t, tMarched - 0.1, tMarched + 0.4, tNever + 0.3, tGrand - 0.8);
    if (mA > 0) F.troopFlow(g, PL_(march.pts), t, { count: 220, speed: 140, spread: 7, size: 2.0, alpha: mA, color: '70,120,255', core: '215,228,255', upto: K.ramp(t, tMarched - 0.1, tMarched + 1.6), seed: 4 });

    // ---- army mass on the Niemen ----
    const massA = K.window01(t, tJune - 0.6, tJune + 0.2, tCross + 0.6, tCross + 1.8);
    if (massA > 0) { const c = P([23.48, 54.84]); F.troopMass(g, c[0], c[1], 170 * zs / 1.9, 80 * zs / 1.9, t, { count: 320, alpha: massA, size: 2.6, color: '60,110,255', core: '205,222,255' }); }
    const crossA = K.window01(t, tCross - 0.2, tCross + 0.3, tRetreat, tRetreat + 1.2);
    if (crossA > 0) {
      for (const [k, dy] of [[0, -0.045], [1, 0], [2, 0.04]]) {
        const pts = PL_(K.catmull([[23.42, 54.84 + dy], [23.70, 54.87 + dy * 0.6], [23.98, 54.89 + dy * 0.3], [24.3, 54.88]], 10));
        F.troopFlow(g, pts, t, { count: 90, speed: 70 * zs, spread: 6 * zs / 1.9 + 2, size: 2.5, color: '60,110,255', core: '205,222,255', alpha: crossA, seed: 10 + k, upto: K.ramp(t, tCross - 0.2, tCross + 1.2) });
      }
    }

    // ---- burning villages (Russian scorched earth) ----
    fires.forEach(([lng, lat], i) => {
      const t0 = tBurning - 0.3 + (i % 5) * 0.32 + (i >= 8 ? 2.2 : 0);
      const a = K.ramp(t, t0, t0 + 0.4) * (1 - K.ramp(t, tSept, tBorodino));
      if (a <= 0) return;
      const p = P([lng, lat]);
      if (!vis([lng, lat])) return;
      F.blaze(g, p[0], p[1], t, { scale: 0.85 * zs, alpha: a, seed: 30 + i, tongues: 7, smoke: 1.3 });
    });

    // ---- Russian armies ----
    const r12A = K.window01(t, tRussians - 0.1, tRussians + 0.4, tVillages + 0.2, tVillages + 0.8);
    let h1 = null, h2 = null;
    if (r12A > 0) {
      const f = rusFrac(t);
      h1 = drawRoute(rus1, f, { w0: 22 * zs, w1: 18 * zs, color: C.ru, alpha: r12A, t });
      h2 = drawRoute(rus2, f, { w0: 22 * zs, w1: 18 * zs, color: C.ru, alpha: r12A, t });
    }
    const r3A = K.window01(t, tVillages + 0.2, tVillages + 0.6, tSept, tBorodino);
    let h3 = null;
    if (r3A > 0) h3 = drawRoute(rus3, rus3Frac(t), { w0: 24 * zs, w1: 26 * zs, color: C.ru, alpha: r3A, t });
    // Russian position at Borodino: a fortified line facing west
    const defA = K.window01(t, tSept - 0.3, tBorodino, tWeek, tWeek + 0.8);
    if (defA > 0 && ruLine.every(vis)) {
      const pts = K.catmull(ruLine, 10).map(P);
      g.save(); g.globalAlpha = defA; g.lineCap = 'round'; g.lineJoin = 'round';
      g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
      g.strokeStyle = C.ru; g.lineWidth = 11 * us; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      g.shadowColor = 'transparent'; g.fillStyle = C.ru;
      const cum = K.cumLen(pts), L = cum[cum.length - 1];
      for (let d = 10; d < L - 6; d += 22 * us) { // teeth pointing west (toward the French)
        const q = K.pointAt(pts, cum, d), nx = Math.sin(q[2]), ny = -Math.cos(q[2]);
        const sgn = nx < 0 ? 1 : -1, tx = q[0] + nx * sgn * 16 * us, ty = q[1] + ny * sgn * 16 * us;
        g.beginPath(); g.moveTo(q[0] - Math.cos(q[2]) * 7 * us, q[1] - Math.sin(q[2]) * 7 * us); g.lineTo(tx, ty); g.lineTo(q[0] + Math.cos(q[2]) * 7 * us, q[1] + Math.sin(q[2]) * 7 * us); g.fill();
      }
      g.restore();
    }

    // ---- French advance (narrows as the army melts) ----
    const af = advFrac(t);
    const advA = t < tRetreat2 - 0.4 ? 1 : 0.22 * (1 - K.ramp(zoom, 6.0, 6.8)) + 0.45 * K.ramp(t, tOf, tFewer) + 0.78 * (1 - K.ramp(t, tRetreat2 - 0.4, tRetreat2 + 0.8));
    const adv1 = drawRoute(adv, af, { w0: 40 * zs, w1: 15 * zs, color: C.fr, alpha: advA, t, glow: K.window01(t, tCross, tCross + 0.3, tMoscow, tMoscow + 0.5) * 0.8 });

    // ---- Borodino ----
    if (t > tCollide - 0.6 && t < tMoscow + 1) {
      const bA = K.window01(t, tCollide - 0.15, tCollide + 0.2, tWeek + 0.3, tMoscow);
      const sc = 1.9 * us;
      const flA = K.window01(t, tCollide - 0.3, tCollide, tWeek, tWeek + 0.8);
      if (flA > 0 && frLine.every(vis)) { const pts = K.catmull(frLine, 10).map(P); g.save(); g.globalAlpha = flA; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10; g.strokeStyle = C.fr; g.lineWidth = 11 * us; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.restore(); }
      if (frLine.every(vis) && ruLine.every(vis)) F.battleLine(g, PL_(frLine), t, { t0: tCollide - 0.05, t1: tWeek + 0.6, rate: 20, seed: 5, alpha: bA, scale: sc });
      if (frLine.every(vis) && ruLine.every(vis)) F.battleLine(g, PL_(ruLine), t, { t0: tCollide, t1: tWeek + 0.6, rate: 20, seed: 9, alpha: bA, scale: sc, drift: [-12, -6] });
      const c = P([35.79, 55.52]);
      const pop = K.easeOutBack(K.ramp(t, tCollide - 0.1, tCollide + 0.35, x => x));
      const flash = Math.max(0, 1 - (t - tCollide) / 0.45);
      if (flash > 0 && t > tCollide) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,236,200,${0.55 * flash})`; g.fillRect(0, 0, W, H); g.restore(); }
      F.shockwave(g, c[0], c[1], t, tCollide, { r1: 520, dur: 0.9, width: 8 });
      F.shockwave(g, c[0], c[1], t, tCollide + 0.15, { r1: 380, dur: 0.8, width: 5, color: '255,210,150' });
      const iA = K.window01(t, tCollide - 0.1, tCollide + 0.1, tSingle, tSingle + 0.6);
      F.icon(g, 'sabres', c[0], c[1] - 40, 150 * pop, { alpha: iA, color: '#fff', outline: 'rgba(10,10,14,0.9)', outlineWidth: 10, blur: 24 });
      const lA = K.window01(t, tBorodino - 0.2, tBorodino + 0.3, tWeek, tWeek + 0.6);
      F.label(g, 'BORODINO', c[0], c[1] + 70, { size: 54, tracking: 10, alpha: lA });
    }

    // Moscow burning
    const burnA = K.ramp(t, tBurn - 0.4, tBurn + 0.6) * (1 - 0.75 * K.ramp(t, tFive, tOct)) * (1 - K.ramp(t, tRetreat2, tArrives));
    if (burnA > 0) {
      const c = P(PL.moscow);
      const R = 620 * us;
      const gl = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], R);
      gl.addColorStop(0, `rgba(255,120,30,${0.45 * burnA})`); gl.addColorStop(0.5, `rgba(255,80,20,${0.18 * burnA})`); gl.addColorStop(1, 'rgba(255,60,10,0)');
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(c[0] - R, c[1] - R, 2 * R, 2 * R); g.restore();
      for (const f of moscowFires) {
        const t0 = tBurn - 0.4 + f.d * 22;
        const a = burnA * K.ramp(t, t0, t0 + 0.35);
        if (a <= 0) continue;
        const p = P(f.ll);
        F.blaze(g, p[0], p[1], t, { scale: 1.05 * us, alpha: a, seed: f.seed, wind: -0.9, smoke: 1.6, tongues: 8 });
      }
    }

    // ---- Moscow ----
    const mosA = K.ramp(t, tWeek + 0.2, tMoscow);
    if (mosA > 0) {
      const p = P(PL.moscow);
      const pop = K.easeOutBack(K.ramp(t, tMoscow - 0.3, tMoscow + 0.3, x => x));
      const fa = mosA * (1 - K.ramp(t, tRetreat2 + 0.6, tArrives));
      F.icon(g, 'basil', p[0], p[1] - 70 * us, 120 * us * pop, { alpha: fa, color: '#fff', outline: 'rgba(10,10,14,0.85)', outlineWidth: 9, blur: 18 });
      F.label(g, 'MOSCOW', p[0], p[1] - 168 * us, { size: Math.round(60 * us), tracking: 12, alpha: fa * K.ramp(t, tMoscow - 0.2, tMoscow + 0.3) });
      const eA = K.window01(t, tEmpty - 0.1, tEmpty + 0.3, tNight + 0.2, tNight + 0.8);
      F.label(g, 'ABANDONED', p[0], p[1] - 122 * us, { size: Math.round(28 * us), family: 'Inter', weight: 800, tracking: 8, alpha: eA * fa, color: '#ffd7a0' });
    }
    // ---- retreat ----
    const rf = retFrac(t);
    let retH = null;
    if (rf > 0) {
      retH = drawRoute(ret, rf, { w0: 19 * zs, w1: 9 * zs, color: C.ret, dark: 'rgba(235,242,255,0.95)', alpha: 1, t, chevrons: true, glow: 0.5 });
      // stragglers falling away from the column once it breaks up
      const sA = K.window01(t, tFreezing, tFalls, tOf + 1, tFewer);
      const sp = geoSlice(ret, rf * 0.98).filter(vis).map(P);
      if (sA > 0 && sp.length > 2) F.troopFlow(g, sp, t * 0.25, { count: 160, speed: 18, spread: 30 * zs / 1.9 + 8, size: 1.7, color: '170,180,200', core: '230,236,245', alpha: sA * 0.8, seed: 21 });
    }
    // Cossack raids
    raids.forEach(([f, lat], i) => {
      const t0 = tCossacks - 0.35 + i * 0.22, a = K.window01(t, t0, t0 + 0.15, t0 + 1.5, t0 + 2.1);
      if (a <= 0) return;
      const tgt = geoSlice(ret, f).pop(), from = P([tgt[0] + 0.1, tgt[1] + lat * 0.36]), to = P(tgt);
      if (!vis(tgt)) return;
      const pts = [from, [(from[0] * 0.4 + to[0] * 0.6) + (to[1] - from[1]) * 0.12, (from[1] * 0.4 + to[1] * 0.6) - (to[0] - from[0]) * 0.12], to];
      F.warArrow(g, K.catmull(pts, 8), K.ramp(t, t0, t0 + 0.45, K.easeOut) * 0.9, { w0: 12 * zs + 4, color: C.ru, alpha: a, t, chevrons: false });
      g.save(); g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10; g.fillStyle = C.ru; g.beginPath(); g.arc(from[0], from[1], 30 * us, 0, Math.PI * 2); g.fill();
      g.shadowColor = 'transparent'; g.strokeStyle = '#fff'; g.lineWidth = 3.5 * us; g.stroke(); g.restore();
      F.icon(g, 'cossack', from[0], from[1], 42 * us, { alpha: a, color: '#fff', shadow: null });
      const hit = t - (t0 + 0.45);
      if (hit > 0 && hit < 0.35) { g.save(); g.globalCompositeOperation = 'lighter'; const r = 36 * us, gr = g.createRadialGradient(to[0], to[1], 0, to[0], to[1], r); gr.addColorStop(0, `rgba(255,230,190,${1 - hit / 0.35})`); gr.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = gr; g.fillRect(to[0] - r, to[1] - r, 2 * r, 2 * r); g.restore(); }
    });
    // Berezina crossing
    const bzA = K.window01(t, tBerezina - 0.3, tBerezina + 0.2, tOf, tOf + 0.8);
    if (bzA > 0) {
      for (const [k, ll] of [[0, [28.355, 54.345]], [1, [28.375, 54.318]]]) { const p = P(ll); F.icon(g, 'bridge', p[0], p[1] - 4, 54 * us, { alpha: bzA, color: '#fff', outline: 'rgba(10,10,14,0.9)', outlineWidth: 6 }); }
      const atk = [[[28.75, 54.62], [28.62, 54.50], [28.46, 54.38]], [[28.25, 54.05], [28.32, 54.18], [28.36, 54.27]]];
      atk.forEach((a3, i) => {
        const t0 = tThousands - 0.5 + i * 0.3;
        F.warArrow(g, K.catmull(PL_(a3), 8), K.ramp(t, t0, t0 + 0.7, K.easeOut), { w0: 18 * zs * 0.6, color: C.ru, alpha: bzA, t });
      });
      const c = P(PL.studianka);
      F.battleLine(g, [[c[0] - 60 * us, c[1] - 30 * us], [c[0] + 60 * us, c[1] + 26 * us]], t, { t0: tThousands - 0.2, rate: 12, seed: 33, alpha: bzA, scale: us * 0.8 });
    }

    // ---- badges ----
    const frBadgeA = K.ramp(t, tGrand - 0.1, tGrand + 0.3) * (1 - K.ramp(t, tOf - 0.3, tOf + 0.3)) * (1 - K.window01(t, tCollide - 0.3, tCollide, tWeek, tWeek + 0.5));
    if (frBadgeA > 0 && t < tRetreat2 + 0.2 && adv1) {
      const atMoscow = t > tMoscow - 0.2;
      const p = atMoscow ? P([37.47, 55.715]) : adv1.base;
      const sub = t < tHeat ? 'NAPOLEON' : t < tSept ? 'THINNING FAST' : t < tWeek ? 'NAPOLEON' : 'WAITING IN MOSCOW';
      F.badge(g, p[0], p[1], { img: flags.fr, ring: C.fr, label: 'GRAND ARMY', sub, scale: us * K.easeOutBack(K.ramp(t, tGrand - 0.1, tGrand + 0.4, x => x)), alpha: frBadgeA, side: -1, t });
    }
    if (retH && t >= tRetreat2 + 0.2) {
      const p = retH.base;
      const sub = t < tWinter ? 'RETREATING' : t < tCossacks ? 'FREEZING' : 'FALLING APART';
      F.badge(g, p[0], p[1], { img: flags.fr, ring: C.ret, label: 'GRAND ARMY', sub, scale: us * 0.92, alpha: frBadgeA, side: 1, t });
    }
    const pop = (t0) => K.easeOutBack(K.ramp(t, t0 - 0.05, t0 + 0.4, x => x));
    if (r12A > 0) {
      const f = rusFrac(t);
      const p1 = f > 0.01 && h1 ? h1.base : P(rus1.pts[0]), p2 = f > 0.01 && h2 ? h2.base : P(rus2.pts[0]);
      F.badge(g, p1[0], p1[1], { img: flags.ru, ring: C.ru, label: '1ST ARMY', sub: 'BARCLAY', scale: us * 0.9 * pop(tRussians), alpha: r12A, t, side: 1 });
      F.badge(g, p2[0], p2[1], { img: flags.ru, ring: C.ru, label: '2ND ARMY', sub: 'BAGRATION', scale: us * 0.9 * pop(tRussians + 0.15), alpha: r12A, t, side: 1 });
    }
    const ruBadgeA = K.window01(t, tVillages + 0.2, tVillages + 0.6, tCollide - 0.2, tCollide + 0.3);
    if (ruBadgeA > 0) {
      const p = h3 && rus3Frac(t) < 0.999 && t < tSept ? h3.base : P(rus3Frac(t) > 0.02 ? [35.93, 55.535] : rus3.pts[0]);
      F.badge(g, p[0], p[1], { img: flags.ru, ring: C.ru, label: 'RUSSIAN ARMY', sub: 'KUTUZOV', scale: us * 0.95 * pop(tVillages + 0.3), alpha: ruBadgeA, t, side: 1 });
    }

    // ---- Borodino casualties ----
    const kA = K.window01(t, tSingle - 0.1, tSingle + 0.25, tWeek - 0.4, tWeek);
    if (kA > 0) {
      const v = Math.round(70000 * K.easeOut(K.ramp(t, tSingle - 0.1, tSeventy + 0.9)) / 100) * 100;
      F.statCard(g, W / 2, 170, '≈' + K.fmtInt(v), 'KILLED OR WOUNDED  ·  IN ONE DAY', { alpha: kA, accent: '#FF6B6E', w: 660, bigSize: 104, scale: 0.96 + 0.04 * K.easeOutBack(K.ramp(t, tSingle - 0.1, tSingle + 0.3, x => x)) });
    }

    // ---- HEAT / HUNGER / DISEASE chips ----
    const chipsA = K.window01(t, tHeat - 0.1, tHeat + 0.2, tThen - 0.2, tThen + 0.3);
    if (chipsA > 0) {
      [['HEAT', tHeat], ['HUNGER', tHunger], ['DISEASE', tDisease]].forEach(([s, t0], i) => {
        const a = chipsA * K.ramp(t, t0 - 0.05, t0 + 0.2);
        if (a <= 0) return;
        const x = 56, y = 150 + i * 78 + (1 - K.easeOutBack(K.ramp(t, t0 - 0.05, t0 + 0.35, x => x))) * 20;
        g.save(); g.globalAlpha = a; K.roundRect(g, x, y, 270, 62, 12); g.fillStyle = 'rgba(10,14,22,0.84)'; g.fill();
        K.roundRect(g, x, y, 8, 62, 4); g.fillStyle = C.ru; g.fill(); g.restore();
        K.text(g, s, x + 34, y + 33, { family: 'Oswald', weight: 700, size: 36, color: '#fff', halo: null, align: 'left', tracking: 4, alpha: a });
        K.text(g, '−', x + 240, y + 31, { family: 'Oswald', weight: 700, size: 40, color: C.ruLight, halo: null, alpha: a });
      });
      K.text(g, 'TENS OF THOUSANDS LOST', 56, 150 + 3 * 78 + 22, { family: 'Inter', weight: 800, size: 22, color: '#FFB4B5', halo: 'rgba(0,0,0,0.8)', haloWidth: 6, align: 'left', alpha: chipsA * K.ramp(t, w('n4', 'tens') - 0.1, w('n4', 'tens') + 0.3), tracking: 2 });
    }

    // ---- winter thermometer ----
    const thA = K.window01(t, tWinter - 0.1, tWinter + 0.4, tOf, tOf + 0.6);
    if (thA > 0) {
      const temp = Math.round(K.lerp(0, -26, K.ramp(t, tWinter, tFalls + 0.8, x => x)));
      const x = W - 300, y = 56;
      g.save(); g.globalAlpha = thA; K.roundRect(g, x, y, 240, 72, 14); g.fillStyle = 'rgba(10,14,22,0.82)'; g.fill(); g.restore();
      F.icon(g, 'thermo', x + 40, y + 36, 46, { alpha: thA, color: '#9fd8ff', shadow: null });
      K.text(g, `${temp}°C`, x + 150, y + 38, { family: 'Oswald', weight: 700, size: 44, color: '#E6F4FF', halo: null, alpha: thA });
    }

    // ---- snow + frost ----
    if (wv > 0) {
      F.snowfall(g, W, H, t, { alpha: wv, count: 520, wind: 190, speed: 150 });
      g.save(); g.globalAlpha = 0.55 * wv; g.drawImage(frost, 0, 0, W, H); g.restore();
    }

    // ---- hook title, 600,000 card, people row ----
    const titleA = K.window01(t, 0.05, 0.5, tSix - 0.45, tSix - 0.1);
    if (titleA > 0) {
      const s = 1 + 0.03 * K.ramp(t, 0, tSix, x => x);
      g.save(); g.translate(W / 2, 200); g.scale(s, s);
      K.text(g, '1812', 0, 0, { family: 'Oswald', weight: 700, size: 150, color: '#fff', halo: 'rgba(0,0,0,0.55)', haloWidth: 14, alpha: titleA, tracking: 16 });
      K.text(g, "NAPOLEON'S INVASION OF RUSSIA", 0, 100, { family: 'Inter', weight: 800, size: 28, color: '#fff', halo: 'rgba(0,0,0,0.7)', haloWidth: 8, alpha: titleA * K.ramp(t, 0.4, 1.0), tracking: 7 });
      g.restore();
    }
    const cardA = K.window01(t, tSix - 0.15, tSix + 0.2, tNever + 1.0, tGrand - 1.2);
    if (cardA > 0) {
      const v = Math.round(600000 * K.easeOut(K.ramp(t, tSix - 0.1, tSix + 1.3)) / 1000) * 1000;
      F.statCard(g, W / 2, 190, K.fmtInt(v) + '+', 'MEN MARCH INTO RUSSIA', { alpha: cardA, accent: '#8DB0FF', w: 640, bigSize: 110, scale: 0.96 + 0.04 * K.easeOutBack(K.ramp(t, tSix - 0.15, tSix + 0.3, x => x)) });
    }
    const people = (cx, cy, a, tLose0, tLose1, size = 64) => {
      for (let i = 0; i < 5; i++) {
        const x = cx + (i - 2) * size * 1.15;
        const lost = i < 4 ? K.ramp(t, K.lerp(tLose0, tLose1, i / 3), K.lerp(tLose0, tLose1, i / 3) + 0.25) : 0;
        const ap = a * K.ramp(t, tLose0 - 1.2 + i * 0.06, tLose0 - 0.9 + i * 0.06);
        F.icon(g, 'person', x, cy + lost * 8, size, { alpha: ap * (1 - 0.6 * lost), color: lost > 0.5 ? '#E5383B' : '#fff', outline: 'rgba(0,0,0,0.85)', outlineWidth: 4 });
      }
    };
    if (cardA > 0) people(W / 2, 372, cardA * K.ramp(t, tMost - 0.2, tMost + 0.2), tNever, tNever + 0.6, 84);

    // ---- ending ----
    const endA = K.window01(t, tOf - 0.1, tOf + 0.3, tEnd - 1.4, tEnd - 0.8);
    if (endA > 0) {
      const v = Math.round(600000 * K.easeOut(K.ramp(t, tOf, tSix2 + 0.8)) / 1000) * 1000;
      const done = K.ramp(t, tFewer - 0.1, tFewer + 0.3);
      F.statCard(g, W / 2, 175, K.fmtInt(v) + '+', done > 0.5 ? 'FEWER THAN 1 IN 5 MADE IT BACK' : 'MARCHED INTO RUSSIA', { alpha: endA, accent: done > 0.5 ? '#FF7A7C' : '#8DB0FF', w: 700, bigSize: 104 });
      people(W / 2, 352, endA * K.ramp(t, tSix2, tSix2 + 0.4), tFewer, tFive2 + 0.2, 80);
    }
    // closing title
    const closeA = K.ramp(t, tBack + 0.6, tBack + 1.3);
    if (closeA > 0) {
      g.fillStyle = `rgba(4,6,10,${0.62 * closeA})`; g.fillRect(0, 0, W, H);
      K.text(g, '1812', W / 2, H / 2 - 30, { family: 'Oswald', weight: 700, size: 170, color: '#fff', halo: null, alpha: closeA, tracking: 18 });
      K.text(g, 'THE MARCH ON MOSCOW', W / 2, H / 2 + 80, { family: 'Inter', weight: 800, size: 30, color: '#cfd8e6', halo: null, alpha: closeA, tracking: 10 });
    }

    // ---- date pill ----
    let cur = null;
    for (const d of dates) if (t >= d[0]) cur = d;
    if (cur && t < tOf) {
      const str = cur[1] === 'ROLL' ? rollDate(t) : cur[1];
      const a = K.ramp(t, dates[0][0], dates[0][0] + 0.3) * (1 - K.ramp(t, tOf - 0.4, tOf));
      const slide = (1 - K.easeOut(K.ramp(t, cur[0], cur[0] + 0.3))) * 30;
      F.pill(g, 56, 52, str, { alpha: a, size: 38, dy: slide, accent: t > tWinter - 0.3 ? '#9fd8ff' : C.gold });
    }

    // ---- captions ----
    K.captions(g, pages, t, { x: W / 2, y: H - 92, size: 50, maxWidth: 1500 });
  };

  const shake = t => {
    const s = Math.max(0, 1 - (t - tCollide) / 0.7);
    if (t < tCollide || s <= 0) return null;
    return { x: (K.noise1(t * 40, 4) - 0.5) * 30 * s, y: (K.noise1(t * 40, 5) - 0.5) * 30 * s };
  };

  const post = (g, t, frame) => {
    K.vignette(g, W, H, { strength: 0.42, inner: 0.5 });
    K.grain(g, W, H, frame, 0.03);
    const fin = K.ramp(t, 0, 0.4);
    const fade = Math.max(1 - fin, K.ramp(t, tEnd - 0.7, tEnd - 0.05));
    if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
  };

  const cannons = [];
  for (let k = 0; k < 14; k++) cannons.push({ t: tCollide + 0.5 + k * 0.42 + K.hash2(k, 3) * 0.25, type: 'cannon-far', gain: -12 - 6 * K.hash2(k, 4) });
  const sfx = () => [
    { t: 0.1, type: 'riser', gain: -20 },
    { t: tNapoleon, type: 'whoosh-soft', gain: -18 }, { t: tSix - 0.05, type: 'impact', gain: -13 },
    { t: tRussia, type: 'whoosh-soft', gain: -18 },
    ...[0, 1, 2, 3].map(i => ({ t: tNever + i * 0.2, type: 'thud', gain: -12 })),
    { t: tNever + 1.0, type: 'whoosh-long', gain: -13 },
    { t: tCross - 0.1, type: 'march', gain: -14, dur: tRetreat - tCross + 1.5 },
    { t: tRetreat - 0.1, type: 'whoosh', gain: -17 },
    { t: tBurning - 0.2, type: 'fire', gain: -21, dur: 5.5 },
    { t: tHeat, type: 'tick', gain: -16 }, { t: tHunger, type: 'tick', gain: -16 }, { t: tDisease, type: 'tick', gain: -16 },
    { t: tThen, type: 'whoosh-long', gain: -14 },
    { t: tCollide - 0.05, type: 'cannon', gain: -3 }, { t: tCollide, type: 'clash', gain: -12 },
    { t: tCollide + 0.2, type: 'battle', gain: -15, dur: tWeek - tCollide + 0.6 },
    ...cannons,
    { t: tSeventy, type: 'impact', gain: -12 },
    { t: tWeek, type: 'whoosh-long', gain: -15 },
    { t: tMoscow + 0.1, type: 'bell', gain: -12 }, { t: tMoscow + 1.35, type: 'bell', gain: -16 },
    { t: tEmpty, type: 'wind', gain: -24, dur: 2.0 },
    { t: tBurn - 0.2, type: 'fire', gain: -9, dur: tOct - tBurn + 1.5 },
    { t: tWaits, type: 'clock', gain: -16, dur: tOct - tWaits - 0.2 },
    { t: tRetreat2, type: 'whoosh-long', gain: -14 },
    { t: tWinter - 0.4, type: 'wind', gain: -10, dur: tEnd - tWinter + 0.4 },
    ...[0, 1, 2, 3, 4, 5].map(i => ({ t: tCossacks - 0.35 + i * 0.22 + 0.45, type: 'hit', gain: -14 })),
    { t: tCossacks - 0.4, type: 'gallop', gain: -14, dur: 1.8 },
    { t: tBerezina - 0.3, type: 'whoosh', gain: -16 }, { t: tThousands, type: 'cannon-far', gain: -12 }, { t: tThousands + 0.5, type: 'cannon-far', gain: -15 },
    { t: tOf, type: 'whoosh-long', gain: -15 },
    ...[0, 1, 2, 3].map(i => ({ t: K.lerp(tFewer, tFive2 + 0.2, i / 3), type: 'thud', gain: -12 })),
    { t: tBack + 0.6, type: 'impact', gain: -10 },
  ];

  return {
    duration: T.duration, style, init, camera: cam, mapState, mapFilter, draw, shake, post, sfx,
    music: { score: 'napoleon1812', marks: { tSix, tNever, tKilled, tJune, tCross, tRetreat, tHeat, tThen, tCollide, tWeek, tMoscow, tEmpty, tNight, tBurn, tWaits, tRetreat2, tWinter, tCossacks, tBerezina, tOf, tFewer, tBack, end: T.duration } },
  };
};
