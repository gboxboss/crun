// Sample 1 — "Dark Geopolitics" vertical short: the Strait of Hormuz.
export default ({ T, W, H, K, A, look = 'dark' }) => {
  const SAT = look === 'satellite';
  const D = A + 'data/';
  // Safe zone for TikTok / Shorts / Reels UI (1080x1920): top 270, bottom 672, left 65, right 150
  const SAFE = { top: 270, bottom: H - 672, left: 65, right: W - 150 };
  const midX = (SAFE.left + SAFE.right) / 2;
  const cx = x => K.clamp(x, SAFE.left + 110, SAFE.right - 110);

  // ---- narration anchors ----
  const tHook = 0.0;
  const tHormuz = T.ws('h2', 'Hormuz');
  const tForty = T.ws('h3', 'forty');
  const tLanes = T.ws('h4', 'shipping');
  const tFifth = T.ws('h5', 'fifth');
  const tOil = T.ws('h5', 'oil');
  const countries = [
    { a3: 'SAU', name: 'SAUDI ARABIA', flag: 'sa', word: ['h6', 'Saudi'], port: [50.16, 26.64], labelAt: [45.2, 23.6] },
    { a3: 'IRQ', name: 'IRAQ', flag: 'iq', word: ['h6', 'Iraq'], port: [48.80, 29.68], labelAt: [44.0, 32.5] },
    { a3: 'KWT', name: 'KUWAIT', flag: 'kw', word: ['h6', 'Kuwait'], port: [48.15, 29.07], labelAt: [47.6, 29.35] },
    { a3: 'QAT', name: 'QATAR', flag: 'qa', word: ['h6', 'Qatar'], port: [51.55, 25.93], labelAt: [51.2, 25.3] },
    { a3: 'ARE', name: 'UAE', flag: 'ae', word: ['h6', 'Emirates'], port: [52.73, 24.12], labelAt: [54.3, 23.6] },
  ].map(c => ({ ...c, t: T.ws(...c.word) }));
  const tIran = T.ws('h7', 'Iran');
  const tOman = T.ws('h7', 'Oman');
  const tClosed = T.ws('h8', 'closed');
  const tSurge = T.ws('h8', 'surge');
  const tWatched = T.ws('h9', 'watched');
  const tEnd = T.duration;

  // ---- geography ----
  const STRAIT = [56.40, 26.62];
  const RULER = [[56.341, 26.828], [56.40, 26.47]]; // Iranian island coast -> Musandam/Quoin side (~40 km)
  // trunk route through the Gulf, the strait and out into the Gulf of Oman
  const trunk = K.catmull([[49.4, 28.7], [50.6, 27.9], [51.9, 27.1], [53.4, 26.55], [55.0, 26.35], [56.0, 26.45], [56.40, 26.62], [56.75, 26.42], [57.2, 25.8], [58.1, 25.0], [59.4, 24.2]], 10);
  const portJoin = c => K.catmull([c.port, ...({ SAU: [[51.2, 27.2]], IRQ: [[49.6, 29.2]], KWT: [[49.0, 28.9]], QAT: [[52.3, 26.6]], ARE: [[53.6, 25.3], [54.6, 25.9]] }[c.a3]), ...trunkFrom(c.a3)], 8);
  const trunkFrom = a3 => {
    const k = { SAU: 2, IRQ: 0, KWT: 0, QAT: 3, ARE: 4 }[a3];
    return [[49.4, 28.7], [50.6, 27.9], [51.9, 27.1], [53.4, 26.55], [55.0, 26.35], [56.0, 26.45], [56.40, 26.62], [56.75, 26.42], [57.2, 25.8], [58.1, 25.0], [59.4, 24.2]].slice(k);
  };
  countries.forEach(c => { c.route = portJoin(c); });
  const laneIn = K.catmull([[55.55, 26.48], [56.05, 26.60], [56.38, 26.70], [56.72, 26.55], [57.05, 26.05]], 10);
  const laneOut = K.catmull([[57.0, 25.92], [56.66, 26.40], [56.38, 26.55], [56.05, 26.42], [55.55, 26.32]], 10);

  // ---- camera ----
  const pad = { top: SAFE.top, bottom: H - SAFE.bottom, left: SAFE.left, right: W - SAFE.right };
  const cam = K.cameraTrack([
    { t: 0, center: [36, 21], zoom: 1.55, bearing: 0, pitch: 0, padding: pad },
    { t: 3.9, dur: 3.9, center: [53.2, 26.6], zoom: 4.35, bearing: -30, pitch: 18, padding: pad },
    { t: 5.6, dur: 1.6, center: STRAIT, zoom: 6.7, bearing: -42, pitch: 38, padding: pad },
    { t: tForty + 0.4, dur: 1.1, center: [56.38, 26.66], zoom: 7.55, bearing: -44, pitch: 42, padding: pad },
    { t: tLanes + 1.2, dur: 2.0, center: [56.55, 26.45], zoom: 7.0, bearing: -50, pitch: 46, padding: pad },
    { t: tFifth + 1.0, dur: 2.2, center: [53.0, 26.9], zoom: 5.15, bearing: -48, pitch: 28, padding: pad },
    { t: countries[0].t + 0.3, dur: 2.6, center: [51.2, 26.6], zoom: 4.55, bearing: -46, pitch: 22, padding: pad },
    { t: tIran + 0.2, dur: 2.0, center: [56.3, 26.7], zoom: 5.95, bearing: -40, pitch: 34, padding: pad },
    { t: tClosed + 0.2, dur: 0.9, center: STRAIT, zoom: 6.9, bearing: -40, pitch: 42, padding: pad },
    { t: tWatched + 0.1, dur: 3.3, center: [50, 24], zoom: 2.0, bearing: -10, pitch: 0, padding: pad },
    { t: tEnd, dur: tEnd - tWatched - 0.1, center: [44, 23], zoom: 1.85, bearing: 0, pitch: 0, padding: pad },
  ], { drift: 0.008, driftZoom: 0.03 });

  // ---- style (dark geopolitics) ----
  // map labels on the bright satellite base: white with a heavy dark outline
  const LB = SAT ? { halo: 'rgba(10,12,16,0.9)', haloWidth: 11 } : {};
  const C = { ocean: '#070b10', land: '#18202a', border: '#3a4654', amber: '#FFB000', red: '#FF4D4D', cyan: '#3FD0FF', text: '#E8EEF4' };
  const hl = (id, a3, color) => [
    { id: `hl-${id}`, type: 'fill', source: 'countries', filter: ['==', ['get', 'ADM0_A3'], a3], paint: { 'fill-color': color, 'fill-opacity': 0 } },
    { id: `hlo-${id}`, type: 'line', source: 'countries', filter: ['==', ['get', 'ADM0_A3'], a3], paint: { 'line-color': color, 'line-width': SAT ? 3.2 : 2.2, 'line-opacity': 0, 'line-blur': 0.5 } },
  ];
  const satLayers = [
    { id: 'world', type: 'raster', source: 'world', paint: { 'raster-fade-duration': 0, 'raster-resampling': 'linear', 'raster-saturation': 0.05 } },
    { id: 'ocean-tint', type: 'fill', source: 'ocean', paint: { 'fill-color': '#2b7d99', 'fill-opacity': 0.42 } },
    { id: 'gulf-mid', type: 'raster', source: 'gulfMid', paint: { 'raster-fade-duration': 0, 'raster-brightness-max': 0.93, 'raster-contrast': 0.06, 'raster-saturation': 0.12 } },
    { id: 'gulf-fine', type: 'raster', source: 'gulfFine', paint: { 'raster-fade-duration': 0, 'raster-brightness-max': 0.93, 'raster-contrast': 0.06, 'raster-saturation': 0.12 } },
    { id: 'relief', type: 'hillshade', source: 'dem', paint: { 'hillshade-shadow-color': 'rgba(40,25,10,0.42)', 'hillshade-highlight-color': 'rgba(255,255,255,0.10)', 'hillshade-accent-color': 'rgba(40,25,10,0.2)', 'hillshade-exaggeration': 0.45, 'hillshade-illumination-direction': 315 } },
  ];
  const satSources = {
    world: { type: 'image', url: A + 'sat/world.jpg', coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]] },
    gulfMid: { type: 'image', url: A + 'sat/gulf_mid.png', coordinates: [[32, 42], [70, 42], [70, 6], [32, 6]] },
    gulfFine: { type: 'image', url: A + 'sat/gulf_fine.png', coordinates: [[47, 31], [60, 31], [60, 22], [47, 22]] },
    ocean: { type: 'geojson', data: D + 'ne_10m_ocean.geojson', tolerance: 0.3 },
  };
  const style = {
    version: 8,
    projection: { type: 'globe' },
    transition: { duration: 0, delay: 0 },
    sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 0.8, 8, 0.2] },
    sources: {
      land: { type: 'geojson', data: D + 'ne_10m_land.geojson', tolerance: 0.3 },
      countries: { type: 'geojson', data: D + 'ne_10m_admin_0_countries.geojson', tolerance: 0.3 },
      dem: { type: 'raster-dem', tiles: [A + 'dem/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 8 },
      ...(SAT ? satSources : {}),
    },
    layers: SAT ? [
      { id: 'bg', type: 'background', paint: { 'background-color': '#1c5670' } },
      ...satLayers,
      ...countries.flatMap(c => hl(c.a3, c.a3, C.amber)),
      ...hl('IRN', 'IRN', C.red),
      ...hl('OMN', 'OMN', '#2EC4B6'),
      { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': 'rgba(255,255,255,0.55)', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 7, 1.3] } },
    ] : [
      { id: 'bg', type: 'background', paint: { 'background-color': C.ocean } },
      { id: 'land', type: 'fill', source: 'land', paint: { 'fill-color': C.land } },
      { id: 'relief', type: 'hillshade', source: 'dem', paint: { 'hillshade-shadow-color': 'rgba(0,0,0,0.85)', 'hillshade-highlight-color': 'rgba(150,175,200,0.32)', 'hillshade-accent-color': 'rgba(0,0,0,0.4)', 'hillshade-exaggeration': 0.65, 'hillshade-illumination-direction': 315 } },
      { id: 'coast-glow', type: 'line', source: 'land', paint: { 'line-color': '#2b4a66', 'line-width': 3, 'line-blur': 3, 'line-opacity': 0.6 } },
      { id: 'coast', type: 'line', source: 'land', paint: { 'line-color': '#4b6f8c', 'line-width': 0.8 } },
      ...countries.flatMap(c => hl(c.a3, c.a3, C.amber)),
      ...hl('IRN', 'IRN', C.red),
      ...hl('OMN', 'OMN', '#2EC4B6'),
      { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': C.border, 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 7, 1.2] } },
    ],
  };

  // ---- assets ----
  const flags = {};
  let pages;
  const init = async () => {
    for (const c of [...countries.map(c => c.flag), 'ir', 'om']) flags[c] = await K.loadImage(A + `flags/${c}.svg`);
    pages = K.captionPages(T.allWords, 3);
  };

  // ---- per-frame map state ----
  const mapState = (t, api) => {
    countries.forEach((c, i) => {
      const on = K.ramp(t, c.t - 0.1, c.t + 0.35) * (1 - K.ramp(t, tIran - 0.2, tIran + 0.6));
      api.paint(`hl-${c.a3}`, 'fill-opacity', (SAT ? 0.38 : 0.32) * on);
      api.paint(`hlo-${c.a3}`, 'line-opacity', on);
    });
    const iran = K.ramp(t, tIran - 0.05, tIran + 0.4) * (1 - K.ramp(t, tWatched, tWatched + 1));
    const oman = K.ramp(t, tOman - 0.05, tOman + 0.4) * (1 - K.ramp(t, tWatched, tWatched + 1));
    api.paint('hl-IRN', 'fill-opacity', 0.28 * iran); api.paint('hlo-IRN', 'line-opacity', iran);
    api.paint('hl-OMN', 'fill-opacity', 0.32 * oman); api.paint('hlo-OMN', 'line-opacity', oman);
  };

  // ---- background (space behind the globe) ----
  const background = (g, t) => {
    const gr = g.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.42, H * 0.8);
    gr.addColorStop(0, '#0d1626'); gr.addColorStop(1, '#020306');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 220; i++) {
      const x = K.hash2(i, 1) * W, y = K.hash2(i, 2) * H, r = 0.5 + 1.3 * K.hash2(i, 3) ** 3;
      g.globalAlpha = 0.25 + 0.6 * K.hash2(i, 4) * (0.7 + 0.3 * Math.sin(t * 2 + i));
      g.fillStyle = '#cfe3ff'; g.fillRect(x, y, r, r);
    }
    g.globalAlpha = 1;
  };

  // tanker comets (stateless emission along a route)
  function tankers(g, api, route, t, o) {
    const { t0, interval = 0.45, speed = 2.6, color = '255,190,70', tFreeze = Infinity } = o;
    const pts = api.projectLine(route);
    const cum = K.cumLen(pts), L = cum[cum.length - 1];
    const te = Math.min(t, tFreeze);
    const v = speed * 100; // px/s at current zoom feel
    const life = L / v;
    const kMin = Math.max(0, Math.floor((te - life - t0) / interval)), kMax = Math.floor((te - t0) / interval);
    for (let k = kMin; k <= kMax; k++) {
      const age = te - (t0 + k * interval);
      if (age < 0 || age > life) continue;
      const d = age * v;
      const frozen = t > tFreeze;
      const a = frozen ? 0.35 + 0.25 * Math.sin(t * 8 + k) : 1;
      for (let j = 6; j >= 0; j--) {
        const p = K.pointAt(pts, cum, d - j * 7);
        K.dot(g, p[0], p[1], j === 0 ? 4.2 : 3.2 - j * 0.35, `rgba(${frozen ? '255,77,77' : color},${(j === 0 ? 1 : 0.5 - j * 0.06) * a})`, { glow: j === 0 ? 14 : 0 });
      }
    }
  }

  const draw = (g, t, api) => {
    const P = ll => api.project(ll);
    const zs = api.zscale(6.5);

    // strait marker (visible from the first frame on the globe)
    const sp = P(STRAIT);
    const markerA = 1 - K.ramp(t, tForty - 0.3, tForty + 0.2) + K.ramp(t, tWatched, tWatched + 0.6);
    K.pulseRing(g, sp[0], sp[1], t, { color: '255,77,77', r0: 6, r1: 60, rings: 3, alpha: K.clamp(markerA) });
    K.dot(g, sp[0], sp[1], 6, '#FF4D4D', { glow: 20, alpha: K.clamp(markerA) });

    // satellite look: a soft dark scrim behind top titles so they read over bright desert
    if (SAT) {
      const scrimA = Math.max(K.window01(t, 0.05, 0.4, 3.6, 4.1), K.ramp(t, tWatched + 0.4, tWatched + 1.0));
      if (scrimA > 0) { const gr = g.createLinearGradient(0, 0, 0, SAFE.top + 420); gr.addColorStop(0, `rgba(0,0,0,${0.55 * scrimA})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, SAFE.top + 420); }
    }
    // hook title
    const hookA = K.window01(t, 0.05, 0.4, 3.6, 4.1);
    K.text(g, "THE WORLD'S MOST", midX, SAFE.top + 70, { family: 'Oswald', weight: 700, size: 82, color: C.text, halo: 'rgba(0,0,0,0.6)', haloWidth: 10, alpha: hookA, tracking: 2 });
    K.text(g, 'DANGEROUS CHOKEPOINT', midX, SAFE.top + 162, { family: 'Oswald', weight: 700, size: 82, color: C.red, halo: 'rgba(0,0,0,0.6)', haloWidth: 10, alpha: hookA * K.easeOutBack(K.ramp(t, 0.25, 0.7, x => x)), tracking: 2 });

    // name label
    const nameA = K.window01(t, tHormuz - 0.1, tHormuz + 0.3, tLanes - 0.2, tLanes + 0.2);
    if (nameA > 0) {
      const lp = P([56.15, 26.95]);
      const tr = K.lerp(18, 6, K.easeOut(K.ramp(t, tHormuz - 0.1, tHormuz + 0.8)));
      K.text(g, 'STRAIT OF', lp[0] - 40, lp[1] - 74, { family: 'Oswald', weight: 500, size: 34, color: SAT ? '#ffffff' : '#9fb3c8', alpha: nameA, tracking: tr, ...LB });
      K.text(g, 'HORMUZ', lp[0] - 40, lp[1] - 28, { family: 'Oswald', weight: 700, size: 66, color: C.text, alpha: nameA, tracking: tr, ...LB, shadow: { color: 'rgba(255,77,77,0.6)', blur: 24 } });
    }

    // ruler (< 40 km)
    const rA = K.window01(t, tForty - 0.35, tForty, tLanes - 0.2, tLanes + 0.2);
    if (rA > 0) {
      const a = P(RULER[0]), b = P(RULER[1]);
      const pr = K.easeInOut(K.ramp(t, tForty - 0.35, tForty + 0.5));
      const bx = K.lerp(a[0], b[0], pr), by = K.lerp(a[1], b[1], pr);
      g.save(); g.globalAlpha = rA;
      g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.setLineDash([10, 7]);
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang) * 16, ny = Math.cos(ang) * 16;
      g.lineWidth = 4; g.beginPath(); g.moveTo(a[0] - nx, a[1] - ny); g.lineTo(a[0] + nx, a[1] + ny); g.stroke();
      if (pr > 0.98) { g.beginPath(); g.moveTo(b[0] - nx, b[1] - ny); g.lineTo(b[0] + nx, b[1] + ny); g.stroke(); }
      g.restore();
      const km = Math.round(40 * pr);
      const mx = (a[0] + b[0]) / 2 + 150, my = (a[1] + b[1]) / 2;
      K.roundRect(g, mx - 118, my - 46, 236, 92, 14);
      g.save(); g.globalAlpha = rA; g.fillStyle = 'rgba(8,12,18,0.82)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.stroke(); g.restore();
      K.text(g, `< ${km} KM`, mx, my, { family: 'Oswald', weight: 700, size: 58, color: '#ffffff', halo: null, alpha: rA });
    }

    // shipping lanes
    const lA = K.window01(t, tLanes - 0.1, tLanes + 0.3, tFifth + 0.3, tFifth + 1.0);
    if (lA > 0) {
      const grow = K.easeInOut(K.ramp(t, tLanes, tLanes + 1.4));
      K.arrow(g, api.projectLine(laneIn), grow, { width: 14 * zs, fill: 'rgba(63,208,255,0.85)', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 2, tail: 0.6, head: 2.2, alpha: lA, shadow: 'rgba(63,208,255,0.5)' });
      K.arrow(g, api.projectLine(laneOut), grow, { width: 14 * zs, fill: 'rgba(255,176,0,0.9)', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 2, tail: 0.6, head: 2.2, alpha: lA, shadow: 'rgba(255,176,0,0.5)' });
      const lp = P([57.25, 25.75]);
      K.text(g, 'SHIPPING LANES', lp[0], lp[1] - 40, { family: 'Oswald', weight: 600, size: 38, color: C.text, alpha: lA * K.ramp(t, tLanes + 0.3, tLanes + 0.7), tracking: 3, ...LB });
      K.text(g, '~3 KM EACH WAY', lp[0], lp[1] + 4, { family: 'Inter', weight: 700, size: 28, color: SAT ? '#ffffff' : '#9fb3c8', alpha: lA * K.ramp(t, tLanes + 0.5, tLanes + 0.9), tracking: 2, ...LB });
    }

    // tanker flow along the trunk + per-country routes
    const flowA = K.ramp(t, tFifth - 0.2, tFifth + 0.4);
    if (flowA > 0) {
      g.save(); g.globalAlpha = flowA * (1 - K.ramp(t, tWatched, tWatched + 1.2));
      tankers(g, api, trunk, t, { t0: tFifth - 3, interval: 0.32, speed: 3.4, tFreeze: tClosed + 0.15 });
      countries.forEach((c, i) => { if (t > c.t) tankers(g, api, c.route, t, { t0: c.t - 0.2, interval: 0.55, speed: 3.0, tFreeze: tClosed + 0.15 }); });
      g.restore();
    }

    // stat card: ~20% of the world's oil
    const sA = K.window01(t, tFifth - 0.1, tFifth + 0.25, countries[0].t - 0.4, countries[0].t + 0.1);
    if (sA > 0) {
      const v = Math.round(20 * K.easeOut(K.ramp(t, tFifth - 0.1, tOil + 0.4)));
      const y = SAFE.top + 120;
      g.save(); g.globalAlpha = sA;
      K.roundRect(g, midX - 300, y - 92, 600, 210, 22); g.fillStyle = 'rgba(8,12,18,0.78)'; g.fill();
      g.strokeStyle = 'rgba(255,176,0,0.55)'; g.lineWidth = 2.5; g.stroke(); g.restore();
      K.text(g, `≈${v}%`, midX, y + 4, { family: 'Oswald', weight: 700, size: 132, color: C.amber, halo: null, alpha: sA, shadow: { color: 'rgba(255,176,0,0.5)', blur: 30 } });
      K.text(g, "OF THE WORLD'S OIL · EVERY DAY", midX, y + 88, { family: 'Inter', weight: 800, size: 30, color: C.text, halo: null, alpha: sA, tracking: 2 });
    }

    // country labels + flags
    countries.forEach((c, i) => {
      const a = K.ramp(t, c.t - 0.05, c.t + 0.3) * (1 - K.ramp(t, tIran - 0.3, tIran + 0.3));
      if (a <= 0) return;
      const lp0 = P(c.labelAt), lp = [cx(lp0[0]), lp0[1]];
      const pop = K.easeOutBack(K.ramp(t, c.t - 0.05, c.t + 0.45, x => x));
      K.flag(g, flags[c.flag], lp[0], lp[1] - 46, 84, t, { alpha: a, scale: pop });
      K.text(g, c.name, lp[0], lp[1] + 12, { family: 'Oswald', weight: 700, size: SAT ? 42 : 38, color: SAT ? '#ffffff' : C.amber, alpha: a, tracking: 2, ...LB });
      const pp = P(c.port);
      K.dot(g, pp[0], pp[1], 6, '#FFB000', { glow: 16, alpha: a });
    });

    // Iran / Oman labels
    const iA = K.window01(t, tIran - 0.05, tIran + 0.3, tClosed - 0.3, tClosed + 0.2);
    const oA = K.window01(t, tOman - 0.05, tOman + 0.3, tClosed - 0.3, tClosed + 0.2);
    if (iA > 0) { const p0 = P([55.6, 28.3]), p = [cx(p0[0]), p0[1]]; K.flag(g, flags.ir, p[0], p[1] - 60, 92, t, { alpha: iA, scale: K.easeOutBack(K.ramp(t, tIran, tIran + 0.45, x => x)) }); K.text(g, 'IRAN', p[0], p[1], { family: 'Oswald', weight: 700, size: 58, color: SAT ? '#ffffff' : '#ff8a8a', alpha: iA, tracking: 6, ...LB }); }
    if (oA > 0) { const p0 = P([57.6, 23.6]), p = [cx(p0[0]), p0[1]]; K.flag(g, flags.om, p[0], p[1] - 60, 92, t, { alpha: oA, scale: K.easeOutBack(K.ramp(t, tOman, tOman + 0.45, x => x)) }); K.text(g, 'OMAN', p[0], p[1], { family: 'Oswald', weight: 700, size: 58, color: SAT ? '#ffffff' : '#7fe3d8', alpha: oA, tracking: 6, ...LB }); }

    // closure: barrier slam + warning
    const cA = K.window01(t, tClosed - 0.05, tClosed + 0.1, tWatched - 0.2, tWatched + 0.4);
    if (cA > 0) {
      const a = P(RULER[0]), b = P(RULER[1]);
      const pr = K.easeOutBack(K.ramp(t, tClosed - 0.05, tClosed + 0.3, x => x));
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      g.save(); g.globalAlpha = cA; g.lineCap = 'round';
      g.shadowColor = 'rgba(255,40,40,0.9)'; g.shadowBlur = 30;
      g.strokeStyle = '#ff3b3b'; g.lineWidth = 16;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(K.lerp(a[0], m[0], pr), K.lerp(a[1], m[1], pr)); g.stroke();
      g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(K.lerp(b[0], m[0], pr), K.lerp(b[1], m[1], pr)); g.stroke();
      g.restore();
      const flash = Math.max(0, 1 - (t - tClosed) / 0.35);
      if (flash > 0 && t >= tClosed) { g.fillStyle = `rgba(255,60,60,${0.35 * flash})`; g.fillRect(0, 0, W, H); }
      const wA = cA * K.ramp(t, tSurge - 0.15, tSurge + 0.2);
      const y = SAFE.top + 110;
      g.save(); g.globalAlpha = wA; K.roundRect(g, midX - 320, y - 70, 640, 140, 20); g.fillStyle = 'rgba(40,6,8,0.85)'; g.fill(); g.strokeStyle = '#ff4d4d'; g.lineWidth = 3; g.stroke(); g.restore();
      const bounce = 1 + 0.06 * Math.sin((t - tSurge) * 10) * Math.max(0, 1 - (t - tSurge));
      g.save(); g.translate(midX, y); g.scale(bounce, bounce);
      K.text(g, 'OIL PRICES ▲', 0, 2, { family: 'Oswald', weight: 700, size: 84, color: '#ff4d4d', halo: null, alpha: wA, tracking: 3, shadow: { color: 'rgba(255,60,60,0.7)', blur: 26 } });
      g.restore();
    }

    // outro title
    const eA = K.ramp(t, tWatched + 0.4, tWatched + 1.0);
    if (eA > 0) {
      K.text(g, 'STRAIT OF HORMUZ', midX, SAFE.top + 70, { family: 'Oswald', weight: 700, size: 86, color: C.text, alpha: eA, tracking: 4, shadow: { color: 'rgba(255,77,77,0.6)', blur: 26 } });
      K.text(g, "≈20% OF THE WORLD'S OIL · <40 KM WIDE", midX, SAFE.top + 150, { family: 'Inter', weight: 800, size: 30, color: '#9fb3c8', alpha: eA, tracking: 2 });
    }

    // captions (word by word) inside the safe zone
    K.captions(g, pages, t, { x: midX, y: SAFE.bottom - 120, size: 76, maxWidth: SAFE.right - SAFE.left - 20 });
  };

  const shake = t => {
    const s = Math.max(0, 1 - (t - tClosed) / 0.5);
    if (t < tClosed || s <= 0) return null;
    return { x: (K.noise1(t * 40, 1) - 0.5) * 34 * s, y: (K.noise1(t * 40, 2) - 0.5) * 34 * s };
  };

  const post = (g, t, frame) => {
    K.vignette(g, W, H, SAT ? { strength: 0.38, inner: 0.55 } : { strength: 0.6, inner: 0.5 });
    const red = Math.max(0, Math.sin(Math.PI * K.ramp(t, tSurge - 0.2, tSurge + 1.4, x => x))) * 0.5;
    if (red > 0) K.vignette(g, W, H, { strength: red, color: '200,20,20', inner: 0.35 });
    K.grain(g, W, H, frame, SAT ? 0.035 : 0.07);
  };

  const sfx = () => [
    { t: 0.0, type: 'riser', gain: -10, dur: 3.6 },
    { t: 3.7, type: 'whoosh', gain: -8 },
    { t: tHormuz - 0.05, type: 'impact', gain: -9 },
    { t: tForty - 0.35, type: 'tick-run', gain: -16, dur: 0.85 },
    { t: tLanes, type: 'whoosh-soft', gain: -14 },
    { t: tFifth - 0.1, type: 'pop', gain: -10 },
    { t: tFifth + 0.9, type: 'whoosh', gain: -12 },
    ...countries.map(c => ({ t: c.t, type: 'pop', gain: -12 })),
    { t: tIran, type: 'pop-low', gain: -10 }, { t: tOman, type: 'pop-low', gain: -10 },
    { t: tClosed - 0.04, type: 'boom', gain: -3 },
    { t: tSurge - 0.1, type: 'alarm', gain: -16 },
    { t: tWatched - 0.3, type: 'whoosh-long', gain: -9 },
  ];

  return {
    duration: T.duration, style, init, camera: cam, mapState, background, draw, shake, post, sfx,
    music: { mood: 'dark-pulse', bpm: 92, drops: [{ t: tClosed - 0.6, dur: 0.6 }], swellAt: [tFifth, tClosed + 0.3], end: T.duration },
  };
};
