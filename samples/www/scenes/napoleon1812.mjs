// Sample 2 — "Campaign Parchment" horizontal: Napoleon's march on Moscow, 1812.
// Era-correct map: coastlines, rivers and relief only (no modern borders), period place names.
export default ({ T, W, H, K, A }) => {
  const D = A + 'data/';
  const ink = '#3b2a17';

  // ---- narration anchors ----
  const tTitleOut = T.p('n2').start - 0.4;
  const tNapoleon = T.ws('n2', 'Napoleon');
  const tSix = T.ws('n2', 'six');
  const tLargest = T.ws('n2', 'largest');
  const tCross = T.ws('n3', 'cross');
  const tNiemen = T.ws('n3', 'Niemen');
  const tRussia = T.ws('n3', 'Russia');
  const tRussians = T.ws('n4', 'Russians');
  const tRetreat = T.ws('n4', 'retreat');
  const tBurning = T.ws('n4', 'burning');
  const tSept = T.ws('n5', 'September');
  const tBorodino = T.ws('n5', 'Borodino');
  const tCollide = T.ws('n5', 'collide');
  const tWeek = T.ws('n6', 'week');
  const tMoscow = T.ws('n6', 'Moscow');
  const tEmpty = T.ws('n6', 'empty');
  const tFire = T.ws('n6', 'fire');
  const tWaits = T.ws('n7', 'waits');
  const tOctober = T.ws('n7', 'October');
  const tTurns = T.ws('n7', 'turns');
  const tWinter = T.ws('n8', 'winter');
  const tFraction = T.ws('n9', 'fraction');
  const tEnd = T.duration;

  // ---- places (period names) ----
  const PL = {
    kovno: [23.90, 54.90], vilna: [25.28, 54.69], vitebsk: [30.20, 55.19], smolensk: [32.05, 54.78],
    vyazma: [34.30, 55.21], borodino: [35.82, 55.52], moscow: [37.62, 55.75], maloyaroslavets: [36.46, 55.01],
    orsha: [30.42, 54.51], berezina: [28.50, 54.23], molodechno: [26.85, 54.31],
  };
  const cityLabels = [
    ['Kovno', PL.kovno, 'nw'], ['Vilna', PL.vilna, 'n'], ['Vitebsk', PL.vitebsk, 'n'], ['Smolensk', PL.smolensk, 's'],
    ['Vyazma', PL.vyazma, 'n'], ['Borodino', PL.borodino, 'n'], ['Moscow', PL.moscow, 'e'],
  ];

  // route helper in geo space, distances corrected for latitude
  function route(wps, segs = 16) {
    const pts = K.catmull(wps, segs);
    const cor = pts.map(([x, y]) => [x * Math.cos((55 * Math.PI) / 180), y]);
    const cum = K.cumLen(cor), L = cum[cum.length - 1];
    const fracAt = wps.map((_, i) => cum[Math.min(i * segs, cum.length - 1)] / L);
    const at = f => { const p = K.pointAt(cor, cum, f * L); const i = Math.min(p[3], pts.length - 1); const s = (f * L - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]); return [K.lerp(pts[i - 1][0], pts[i][0], s), K.lerp(pts[i - 1][1], pts[i][1], s)]; };
    return { pts, fracAt, at };
  }
  const adv = route([[23.35, 54.93], PL.kovno, PL.vilna, [27.7, 55.15], PL.vitebsk, PL.smolensk, PL.vyazma, PL.borodino, [36.9, 55.65], PL.moscow]);
  const ret = route([PL.moscow, [37.0, 55.35], PL.maloyaroslavets, [35.2, 55.05], [34.3, 55.02], [32.05, 54.62], PL.orsha, PL.berezina, PL.molodechno, [25.28, 54.55], [24.0, 54.75], [23.2, 54.85]]);
  const rus = route([[25.3, 54.85], [27.4, 55.55], [30.2, 55.45], [32.1, 55.15], [34.3, 55.45], [36.25, 55.7]]);

  // arrow growth: piecewise by narration
  const F = adv.fracAt; // indices: 0 west bank,1 kovno,2 vilna,3,4 vitebsk,5 smolensk,6 vyazma,7 borodino,8,9 moscow
  const advFrac = t => {
    if (t < tCross) return 0;
    if (t < tRussians) return K.lerp(0, F[1] + 0.012, K.ramp(t, tCross, tCross + 1.8, K.easeInOut));
    if (t < tSept) return K.lerp(F[1] + 0.012, F[5], K.ramp(t, tRetreat, tBurning + 2.4, K.easeInOut));
    if (t < tWeek) return K.lerp(F[5], F[7] - 0.012, K.ramp(t, tSept - 0.2, tBorodino + 0.4, K.easeInOut));
    return K.lerp(F[7] - 0.012, 1, K.ramp(t, tWeek, tMoscow + 0.2, K.easeInOut));
  };
  const rusFrac = t => t < tBurning + 1.2 ? K.lerp(0, rus.fracAt[3], K.ramp(t, tRetreat - 0.4, tBurning + 1.2, K.easeInOut)) : K.lerp(rus.fracAt[3], 1, K.ramp(t, tBurning + 1.2, tBorodino + 0.2, K.easeInOut));
  const retFrac = t => K.ramp(t, tTurns, tEnd - 2.6, x => K.easeInOut(x) * 0.85 + x * 0.15);

  // ---- camera (16:9) ----
  const cam = K.cameraTrack([
    { t: 0, center: [31.0, 55.2], zoom: 5.2, bearing: 0, pitch: 18 },
    { t: tNapoleon + 1.6, dur: 2.8, center: [24.3, 54.95], zoom: 6.95, bearing: -6, pitch: 42 },
    { t: tCross + 0.8, dur: 1.4, center: [24.5, 54.92], zoom: 7.25, bearing: -4, pitch: 44 },
    { t: tRetreat + 1.2, dur: 3.0, center: [28.6, 55.0], zoom: 6.05, bearing: 0, pitch: 34 },
    { t: tBorodino + 0.2, dur: 2.4, center: [35.55, 55.45], zoom: 7.25, bearing: 8, pitch: 46 },
    { t: tMoscow + 0.4, dur: 2.2, center: [37.0, 55.62], zoom: 7.45, bearing: 10, pitch: 46 },
    { t: tTurns + 2.6, dur: 3.6, center: [30.9, 54.95], zoom: 5.55, bearing: 0, pitch: 26 },
    { t: tEnd, dur: tEnd - tTurns - 2.6, center: [30.4, 54.9], zoom: 5.75, bearing: 0, pitch: 30 },
  ], { drift: 0.006, driftZoom: 0.025 });

  // ---- style ----
  const S = { sea: '#9eb0a6', land: '#e7d6ab' };
  const style = {
    version: 8,
    transition: { duration: 0, delay: 0 },
    sources: {
      land: { type: 'geojson', data: D + 'ne_10m_land.geojson', tolerance: 0.3 },
      lakes: { type: 'geojson', data: D + 'ne_10m_lakes.geojson' },
      rivers: { type: 'geojson', data: D + 'ne_10m_rivers_lake_centerlines.geojson' },
      dem: { type: 'raster-dem', tiles: [A + 'dem/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 8 },
    },
    layers: [
      { id: 'sea', type: 'background', paint: { 'background-color': S.sea } },
      { id: 'water-line-3', type: 'line', source: 'land', paint: { 'line-color': '#6f8a86', 'line-width': 22, 'line-opacity': 0.08 } },
      { id: 'water-line-2', type: 'line', source: 'land', paint: { 'line-color': '#6f8a86', 'line-width': 12, 'line-opacity': 0.14 } },
      { id: 'water-line-1', type: 'line', source: 'land', paint: { 'line-color': '#5c7672', 'line-width': 5, 'line-opacity': 0.25 } },
      { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': S.land } },
      { id: 'relief', type: 'hillshade', source: 'dem', paint: { 'hillshade-shadow-color': 'rgba(92,70,38,0.75)', 'hillshade-highlight-color': 'rgba(255,248,226,0.6)', 'hillshade-accent-color': 'rgba(92,70,38,0.35)', 'hillshade-exaggeration': 1.0, 'hillshade-illumination-direction': 315 } },
      { id: 'lakes', type: 'fill', source: 'lakes', paint: { 'fill-color': S.sea } },
      { id: 'lake-edge', type: 'line', source: 'lakes', paint: { 'line-color': '#6b5636', 'line-width': 0.8, 'line-opacity': 0.6 } },
      { id: 'rivers', type: 'line', source: 'rivers', filter: ['<=', ['get', 'scalerank'], 8], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#5f8ea6', 'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 8, 2.0], 'line-opacity': 0.75 } },
      { id: 'niemen-glow', type: 'line', source: 'rivers', filter: ['==', ['get', 'name'], 'Neman'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#2f78b5', 'line-width': 9, 'line-blur': 5, 'line-opacity': 0 } },
      { id: 'niemen', type: 'line', source: 'rivers', filter: ['==', ['get', 'name'], 'Neman'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#245f93', 'line-width': 3.2, 'line-opacity': 0 } },
      { id: 'coast', type: 'line', source: 'land', paint: { 'line-color': '#6b5636', 'line-width': 1.1 } },
    ],
  };

  let paper, pages;
  const init = async () => {
    paper = K.makePaper(Math.round(W / 2), Math.round(H / 2), { base: [236, 222, 186], seed: 5 });
    pages = T.json.phrases.map(p => ({ text: p.text, start: p.start, end: p.end + 0.25 }));
  };

  const mapState = (t, api) => {
    const n = K.window01(t, tNiemen - 0.15, tNiemen + 0.35, tRussians - 0.5, tRussians + 0.3);
    api.paint('niemen-glow', 'line-opacity', 0.85 * n * (0.75 + 0.25 * Math.sin(t * 5)));
    api.paint('niemen', 'line-opacity', n);
  };

  const winterA = t => K.ramp(t, tWinter - 0.3, tWinter + 2.2);
  const mapFilter = t => {
    const w = winterA(t);
    const fireWarm = K.window01(t, tFire, tFire + 1, tTurns, tTurns + 2) * 0.12;
    if (w <= 0.001 && fireWarm <= 0.001) return 'none';
    return `saturate(${(1 - 0.65 * w).toFixed(3)}) brightness(${(1 + 0.1 * w).toFixed(3)}) sepia(${(fireWarm).toFixed(3)})`;
  };

  // ---- drawing helpers ----
  function unit(g, x, y, s, o) {
    const { fill, label, sub, alpha = 1, french = false } = o;
    if (alpha <= 0.01 || s <= 0.01) return;
    const w = 120 * s, h = 70 * s;
    g.save(); g.globalAlpha *= alpha;
    g.shadowColor = 'rgba(40,25,10,0.5)'; g.shadowBlur = 14 * s; g.shadowOffsetY = 6 * s;
    g.fillStyle = fill; g.fillRect(x - w / 2, y - h / 2, w, h);
    g.shadowColor = 'transparent';
    g.strokeStyle = '#f3e7c6'; g.lineWidth = 3.5 * s; g.strokeRect(x - w / 2 + 5 * s, y - h / 2 + 5 * s, w - 10 * s, h - 10 * s);
    g.strokeStyle = ink; g.lineWidth = 2.5 * s; g.strokeRect(x - w / 2, y - h / 2, w, h);
    g.strokeStyle = '#f3e7c6'; g.lineWidth = 3 * s; // infantry cross
    g.beginPath(); g.moveTo(x - w / 2 + 12 * s, y - h / 2 + 12 * s); g.lineTo(x + w / 2 - 12 * s, y + h / 2 - 12 * s);
    g.moveTo(x + w / 2 - 12 * s, y - h / 2 + 12 * s); g.lineTo(x - w / 2 + 12 * s, y + h / 2 - 12 * s); g.stroke();
    if (french) { // tricolour on a staff
      const fx = x - w / 2, fy = y - h / 2;
      g.strokeStyle = ink; g.lineWidth = 2.5 * s; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy - 46 * s); g.stroke();
      const fw = 14 * s, fh = 26 * s;
      [['#2b4b9b', 0], ['#f4f0e6', 1], ['#c8352e', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(fx + i * fw, fy - 46 * s, fw, fh); });
      g.strokeStyle = ink; g.lineWidth = 1.5 * s; g.strokeRect(fx, fy - 46 * s, fw * 3, fh);
    }
    g.restore();
    K.text(g, label, x, y + h / 2 + 22 * s, { family: 'Cinzel', weight: 700, size: Math.round(24 * s), color: ink, halo: 'rgba(240,228,196,0.85)', haloWidth: 6, alpha, tracking: 2 });
    if (sub) K.text(g, sub, x, y + h / 2 + 50 * s, { family: 'Cormorant', weight: 700, size: Math.round(24 * s), color: '#5b4326', halo: 'rgba(240,228,196,0.85)', haloWidth: 5, alpha, tracking: 1 });
  }

  function cartouche(g, str, x, y, alpha) {
    if (alpha <= 0.01) return;
    g.save(); g.globalAlpha *= alpha;
    g.font = K.font(40, 'Cinzel', 700); g.letterSpacing = '6px';
    const w = g.measureText(str).width + 70;
    g.fillStyle = 'rgba(244,232,200,0.92)'; g.fillRect(x, y - 36, w, 72);
    g.strokeStyle = ink; g.lineWidth = 2.5; g.strokeRect(x, y - 36, w, 72);
    g.lineWidth = 1; g.strokeRect(x + 6, y - 30, w - 12, 60);
    g.restore();
    K.text(g, str, x + w / 2, y + 2, { family: 'Cinzel', weight: 700, size: 40, color: ink, halo: null, alpha, tracking: 6 });
  }

  function swords(g, x, y, s, alpha) {
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.scale(s, s);
    g.lineCap = 'round';
    for (const dir of [-1, 1]) {
      g.save(); g.rotate(dir * Math.PI / 4);
      g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 46); g.stroke();
      g.strokeStyle = '#f3e7c6'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -56); g.lineTo(0, 30); g.stroke();
      g.strokeStyle = ink; g.lineWidth = 8; g.beginPath(); g.moveTo(-18, 32); g.lineTo(18, 32); g.stroke();
      g.restore();
    }
    g.restore();
  }

  const burnSites = [[27.6, 55.2, 0.18], [PL.vitebsk[0], PL.vitebsk[1] + 0.02, 0.36], [PL.smolensk[0], PL.smolensk[1], 0.55], [33.2, 55.05, 0.7]];

  const draw = (g, t, api) => {
    const P = ll => api.project(ll);
    const zs = api.zscale(6.5);

    // parchment texture over the map
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.85;
    g.drawImage(paper, 0, 0, W, H); g.restore();
    // winter frost wash
    const w = winterA(t);
    if (w > 0) { g.fillStyle = `rgba(226,234,240,${0.32 * w})`; g.fillRect(0, 0, W, H); }

    // era label
    const rA = K.window01(t, tRussia - 0.1, tRussia + 0.8, tSept - 0.5, tSept + 0.5) * 0.85;
    if (rA > 0) { const p = P([31.4, 56.5]); K.text(g, 'RUSSIAN EMPIRE', p[0], p[1], { family: 'Cinzel', weight: 700, size: 64, color: 'rgba(80,55,30,0.55)', halo: null, alpha: rA, tracking: 26 }); }
    const nA = K.window01(t, tNiemen - 0.1, tNiemen + 0.4, tRussians - 0.4, tRussians + 0.3);
    if (nA > 0) { const p = P([22.95, 55.32]); K.text(g, 'Niemen', p[0], p[1], { family: 'Cormorant', weight: 700, size: 40, color: '#1f4f7a', halo: 'rgba(240,228,196,0.8)', haloWidth: 5, alpha: nA }); }

    // cities
    const cityA = K.ramp(t, tNapoleon + 1.0, tNapoleon + 2.0);
    for (const [name, ll, pos] of cityLabels) {
      const p = P(ll);
      const big = name === 'Moscow' || name === 'Borodino';
      K.dot(g, p[0], p[1], big ? 7 : 5, ink, { alpha: cityA, stroke: '#f3e7c6', strokeWidth: 2 });
      const off = { n: [0, -24], s: [0, 26], e: [16, 0], nw: [-12, -24] }[pos];
      K.text(g, name, p[0] + off[0], p[1] + off[1], { family: 'Cormorant', weight: 700, size: big ? 36 : 30, color: ink, halo: 'rgba(240,228,196,0.85)', haloWidth: 6, alpha: cityA, align: pos === 'e' ? 'left' : pos === 'nw' ? 'right' : 'center' });
    }

    // fires left behind by the retreating Russians
    for (const [lng, lat, f] of burnSites) {
      const tb = K.lerp(tRetreat - 0.3, tBorodino + 0.2, f) + 0.2;
      const a = K.ramp(t, tb, tb + 0.6) * (1 - K.ramp(t, tSept + 1.0, tSept + 2.5));
      if (a > 0 && t > tBurning - 1.0) { const p = P([lng, lat]); K.fire(g, p[0], p[1], t, { scale: 0.75 * Math.min(1.3, zs), alpha: a, seed: Math.round(lng * 10) }); }
    }

    // advance arrow (French, blue)
    const af = advFrac(t);
    const advA = 1 - 0.55 * K.ramp(t, tTurns, tTurns + 1.5);
    K.arrow(g, api.projectLine(adv.pts), af, { width: 46 * zs, fill: '#2f4b7c', stroke: 'rgba(40,25,10,0.9)', strokeWidth: 2.5, tail: 0.5, head: 1.9, headLen: 1.3, alpha: advA, shadow: 'rgba(40,25,10,0.45)' });

    // Russian army retreating ahead (green)
    const rf = rusFrac(t);
    const rusA = K.ramp(t, tRussians - 0.1, tRussians + 0.4) * (1 - K.ramp(t, tCollide + 0.8, tCollide + 2.2));
    if (rusA > 0) {
      K.arrow(g, api.projectLine(rus.pts), rf, { width: 30 * zs, fill: '#35603d', stroke: 'rgba(40,25,10,0.85)', strokeWidth: 2, tail: 0.45, head: 1.9, alpha: rusA * 0.9, shadow: 'rgba(40,25,10,0.35)' });
      const p = P(rus.at(Math.max(0.0001, rf)));
      const us = Math.max(0.7, Math.min(1.2, zs));
      unit(g, p[0] + 20 * us, p[1] - 80 * us, 0.85 * us, { fill: '#35603d', label: 'RUSSIAN ARMY', alpha: rusA });
    }

    // French army block + mass
    const blockA = K.ramp(t, tNapoleon - 0.1, tNapoleon + 0.4) * (1 - K.ramp(t, tFire + 0.6, tFire + 1.4));
    if (blockA > 0) {
      const head = adv.at(Math.max(0.0001, af - 0.015));
      const p = P(head);
      const us = Math.max(0.8, Math.min(1.25, zs));
      const s = us * K.easeOutBack(K.ramp(t, tNapoleon - 0.1, tNapoleon + 0.5, x => x));
      // reserve columns massing behind at the start
      for (let k = 0; k < 5; k++) {
        const ka = K.ramp(t, tLargest + k * 0.18, tLargest + k * 0.18 + 0.35) * (1 - K.ramp(t, tCross, tCross + 1.2));
        if (ka <= 0) continue;
        const q = P([23.0 - (k % 3) * 0.32, 54.75 + (k > 2 ? 0.28 : 0) + (k % 2) * 0.12]);
        unit(g, q[0], q[1], 0.55 * Math.min(1.4, zs) * K.easeOutBack(ka), { fill: '#2f4b7c', label: '', alpha: ka });
      }
      unit(g, p[0] - 10 * us, p[1] - 92 * us, s, { fill: '#2f4b7c', label: 'GRANDE ARMÉE', alpha: blockA, french: true });
      const cA = K.window01(t, tSix - 0.1, tSix + 0.4, tCross + 0.4, tCross + 1.0) * blockA;
      if (cA > 0) {
        const n = Math.round(600000 * K.easeOut(K.ramp(t, tSix - 0.1, tSix + 1.4)) / 1000) * 1000;
        K.text(g, K.fmtInt(n) + '+', p[0] + 150 * us, p[1] - 108 * us, { family: 'Cinzel', weight: 700, size: 66, color: '#2a3f6a', halo: 'rgba(240,228,196,0.9)', haloWidth: 10, alpha: cA, align: 'left' });
        K.text(g, 'MEN UNDER ARMS', p[0] + 154 * us, p[1] - 58 * us, { family: 'Cinzel', weight: 700, size: 26, color: ink, halo: 'rgba(240,228,196,0.9)', haloWidth: 6, alpha: cA, align: 'left', tracking: 4 });
      }
    }

    // Borodino clash
    if (t > tCollide - 0.2 && t < tMoscow + 0.5) {
      const p = P(PL.borodino);
      const a = K.window01(t, tCollide - 0.2, tCollide + 0.1, tWeek, tMoscow);
      const pop = K.easeOutBack(K.ramp(t, tCollide - 0.15, tCollide + 0.35, x => x));
      for (let k = 0; k < 5; k++) K.smokePuff(g, p[0] + (k - 2) * 26 * zs, p[1] + ((k * 37) % 3 - 1) * 14 * zs, t, tCollide - 0.05 + k * 0.12, { scale: 0.9 * zs, seed: k + 3, color: '210,200,180' });
      const flash = Math.max(0, 1 - (t - tCollide) / 0.4);
      if (flash > 0 && t > tCollide) { const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 420); gr.addColorStop(0, `rgba(255,236,190,${0.75 * flash})`); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
      K.pulseRing(g, p[0], p[1], t - tCollide, { color: '90,40,20', r0: 20, r1: 220, period: 1.2, rings: 2, width: 4, alpha: a * K.clamp(1 - (t - tCollide) / 2.4) });
      swords(g, p[0], p[1] - 10, 0.9 * pop * Math.min(1.3, zs), a);
      K.text(g, 'BORODINO', p[0], p[1] + 96 * Math.min(1.3, zs), { family: 'Cinzel', weight: 700, size: 46, color: ink, halo: 'rgba(240,228,196,0.9)', haloWidth: 8, alpha: a, tracking: 8 });
      K.text(g, '7 September 1812', p[0], p[1] + 140 * Math.min(1.3, zs), { family: 'Cormorant', weight: 700, size: 34, color: '#5b4326', halo: 'rgba(240,228,196,0.9)', haloWidth: 6, alpha: a });
    }

    // Moscow burning
    const mf = K.ramp(t, tFire - 0.3, tFire + 1.2) * (1 - 0.6 * K.ramp(t, tTurns, tTurns + 3)) * (1 - K.ramp(t, tWinter, tWinter + 2));
    if (mf > 0) {
      const p = P(PL.moscow);
      const gl = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], 260 * zs);
      gl.addColorStop(0, `rgba(255,120,30,${0.35 * mf})`); gl.addColorStop(1, 'rgba(255,120,30,0)');
      g.fillStyle = gl; g.fillRect(0, 0, W, H);
      [[0, 0], [-34, 14], [30, 18], [12, -20], [-18, -26]].forEach(([dx, dy], k) => K.fire(g, p[0] + dx * zs, p[1] + dy * zs, t, { scale: 1.05 * zs, alpha: mf * K.ramp(t, tFire - 0.3 + k * 0.25, tFire + 0.3 + k * 0.25), seed: 40 + k }));
    }
    const mA = K.window01(t, tMoscow - 0.1, tMoscow + 0.3, tTurns + 1, tTurns + 2.5);
    if (mA > 0) { const p = P(PL.moscow); K.pulseRing(g, p[0], p[1], t, { color: '120,40,20', r0: 8, r1: 54, rings: 2, alpha: mA * (1 - K.ramp(t, tFire, tFire + 0.5)) }); }

    // retreat arrow: dark, shrinking (after Minard)
    const rt = retFrac(t);
    if (rt > 0) K.arrow(g, api.projectLine(ret.pts), rt, { width: 40 * zs, widthEnd: 7 * zs, fill: 'rgba(96,36,30,0.92)', stroke: 'rgba(40,25,10,0.9)', strokeWidth: 2, tail: 1, head: 2.4, headLen: 2.2, shadow: 'rgba(40,25,10,0.4)' });
    if (t > tTurns + 0.4) {
      const p = P(PL.berezina);
      const a = K.window01(t, tTurns + 3.2, tTurns + 4, tEnd - 1.5, tEnd - 0.5);
      K.text(g, 'Berezina', p[0], p[1] + 30, { family: 'Cormorant', weight: 700, size: 30, color: '#1f4f7a', halo: 'rgba(240,228,196,0.85)', haloWidth: 5, alpha: a });
    }

    // snow
    K.snow(g, W, H, t, { count: 380, alpha: w, wind: 110, speed: 120, size: 3.2, seed: 9 });
    if (w > 0) K.vignette(g, W, H, { strength: 0.45 * w, color: '235,242,248', inner: 0.5 });

    // date cartouche
    const dates = [[tTitleOut + 0.3, 'JUNE 1812'], [tSept, 'SEPTEMBER 1812'], [tOctober, 'OCTOBER 1812'], [tWinter, 'NOVEMBER 1812']];
    let cur = null; for (const d of dates) if (t >= d[0]) cur = d;
    if (cur) cartouche(g, cur[1], 60, 80, K.ramp(t, cur[0], cur[0] + 0.35) * (1 - K.ramp(t, tEnd - 1.6, tEnd - 0.8)));

    // title card
    const tA = 1 - K.ramp(t, tTitleOut - 0.3, tTitleOut + 0.5);
    if (tA > 0) {
      g.fillStyle = `rgba(236,222,186,${0.55 * tA})`; g.fillRect(0, 0, W, H);
      const s = 1 + 0.04 * K.ramp(t, 0, tTitleOut + 0.5, x => x);
      g.save(); g.translate(W / 2, H / 2); g.scale(s, s);
      K.text(g, '1812', 0, -40, { family: 'Cinzel', weight: 700, size: 230, color: ink, halo: null, alpha: tA * K.ramp(t, 0.1, 0.9), tracking: 18, shadow: { color: 'rgba(60,40,15,0.35)', blur: 20, y: 6 } });
      g.fillStyle = `rgba(59,42,23,${0.8 * tA * K.ramp(t, 0.6, 1.4)})`; g.fillRect(-330, 92, 660, 2.5);
      K.text(g, 'THE MARCH ON MOSCOW', 0, 140, { family: 'Cinzel', weight: 600, size: 50, color: ink, halo: null, alpha: tA * K.ramp(t, 0.7, 1.5), tracking: 14 });
      g.restore();
    }

    // ending line
    const eA = K.ramp(t, tFraction + 0.2, tFraction + 1.0);
    if (eA > 0) K.text(g, 'ONLY A FRACTION RETURNED', W / 2, H * 0.22, { family: 'Cinzel', weight: 700, size: 62, color: '#2a1d10', halo: 'rgba(240,236,228,0.85)', haloWidth: 10, alpha: eA, tracking: 10 });

    // subtitles (documentary style)
    const sub = pages.find(p => t >= p.start && t < p.end);
    if (sub) {
      const a = K.ramp(t, sub.start, sub.start + 0.15) * (1 - K.ramp(t, sub.end - 0.15, sub.end));
      g.font = K.font(34, 'Inter', 600);
      const tw = g.measureText(sub.text).width;
      g.save(); g.globalAlpha = 0.6 * a; g.fillStyle = '#120c06'; K.roundRect(g, W / 2 - tw / 2 - 22, H - 118, tw + 44, 58, 10); g.fill(); g.restore();
      K.text(g, sub.text, W / 2, H - 89, { family: 'Inter', weight: 600, size: 34, color: '#fbf3e2', halo: null, alpha: a });
    }
  };

  const shake = t => {
    const s = Math.max(0, 1 - (t - tCollide) / 0.6);
    if (t < tCollide || s <= 0) return null;
    return { x: (K.noise1(t * 38, 4) - 0.5) * 30 * s, y: (K.noise1(t * 38, 5) - 0.5) * 30 * s };
  };

  const post = (g, t, frame) => {
    K.vignette(g, W, H, { strength: 0.55, color: '60,38,14', inner: 0.42 });
    K.grain(g, W, H, frame, 0.08);
    const fade = K.ramp(t, tEnd - 1.0, tEnd - 0.1);
    if (fade > 0) { g.fillStyle = `rgba(14,9,4,${fade})`; g.fillRect(0, 0, W, H); }
  };

  const sfx = () => [
    { t: 0.2, type: 'drum', gain: -8 }, { t: 0.5, type: 'paper', gain: -18 },
    { t: tNapoleon + 0.3, type: 'whoosh-long', gain: -15 },
    { t: tSix, type: 'drum', gain: -10 },
    ...[0, 1, 2, 3, 4].map(k => ({ t: tLargest + k * 0.18, type: 'pop-low', gain: -20 })),
    { t: tCross - 0.1, type: 'drum', gain: -10 }, { t: tCross, type: 'whoosh', gain: -16 },
    { t: tRussians, type: 'pop-low', gain: -16 },
    { t: tBurning - 0.2, type: 'fire', gain: -19, dur: 4.5 },
    { t: tSept, type: 'paper', gain: -18 }, { t: tBorodino - 0.1, type: 'drum', gain: -8 },
    { t: tCollide - 0.04, type: 'boom', gain: -4 }, { t: tCollide, type: 'clash', gain: -12 },
    { t: tMoscow, type: 'drum', gain: -12 },
    { t: tFire - 0.3, type: 'fire', gain: -12, dur: 7 },
    { t: tOctober, type: 'paper', gain: -18 }, { t: tTurns, type: 'whoosh-long', gain: -13 },
    { t: tWinter - 0.2, type: 'wind', gain: -9, dur: tEnd - tWinter + 0.5 },
    { t: tFraction, type: 'impact', gain: -14 },
  ];

  return {
    duration: T.duration, style, init, camera: cam, mapState, mapFilter, draw, shake, post, sfx,
    music: { mood: 'epic-minor', bpm: 66, swellAt: [tCollide, tFire], drops: [{ t: tWinter - 0.9, dur: 0.9 }], sections: [{ t0: tWinter, t1: tEnd + 1, gain_db: -5 }], end: T.duration },
  };
};
