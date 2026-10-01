// Drawing and timing toolkit for the sample scenes.
// Every function is a pure function of its inputs (time, seed, projected points): no Math.random,
// no wall clock, so any frame can be rendered independently and chunks stitch seamlessly.

// ---------- math & easing ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, s) => a + (b - a) * s;
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeInOut = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = x => Math.pow(clamp(x), 3);
export const easeOutBack = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const ramp = (t, t0, t1, ease = smooth) => ease(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
// 0 -> 1 between a0..a1, holds, 1 -> 0 between b0..b1
export const window01 = (t, a0, a1, b0, b1, ease = smooth) => Math.min(ramp(t, a0, a1, ease), 1 - ramp(t, b0, b1, ease));

export function hash(n) { // deterministic [0,1)
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
export const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
export function noise1(x, seed = 0) { // smooth value noise
  const i = Math.floor(x), f = x - i;
  const a = hash2(i, seed), b = hash2(i + 1, seed);
  return lerp(a, b, f * f * (3 - 2 * f));
}

// ---------- narration timing ----------
export function makeTiming(json) {
  const byId = Object.fromEntries(json.phrases.map(p => [p.id, p]));
  const p = id => byId[id];
  // word lookup: index or case-insensitive substring of the word
  const w = (id, key, nth = 0) => {
    const ph = byId[id];
    if (typeof key === 'number') return ph.words[Math.min(key, ph.words.length - 1)];
    const k = key.toLowerCase();
    let seen = 0;
    for (const word of ph.words) if (word.w.toLowerCase().includes(k)) { if (seen++ === nth) return word; }
    throw new Error(`word "${key}" not in ${id}`);
  };
  const allWords = json.phrases.flatMap(ph => ph.words.map(x => ({ ...x, phrase: ph.id })));
  return { json, p, w, ws: (id, key, n) => w(id, key, n).start, we: (id, key, n) => w(id, key, n).end, duration: json.duration, allWords };
}

// Group words into caption "pages" of up to maxWords, breaking after punctuation.
export function captionPages(allWords, maxWords = 3) {
  const pages = []; let cur = [];
  for (const w of allWords) {
    cur.push(w);
    if (cur.length >= maxWords || /[,.?!;:]$/.test(w.w)) { pages.push(cur); cur = []; }
  }
  if (cur.length) pages.push(cur);
  return pages.map((ws, i) => ({ words: ws, start: ws[0].start - 0.05, end: pages[i + 1] ? Math.min(pages[i + 1][0].start - 0.05, ws[ws.length - 1].end + 0.6) : ws[ws.length - 1].end + 0.6 }));
}

// ---------- camera ----------
function toMerc([lng, lat]) {
  const x = (lng + 180) / 360;
  const y = (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))) / 360;
  return [x, y];
}
function fromMerc([x, y]) {
  const lng = x * 360 - 180;
  const y2 = 180 - y * 360;
  const lat = (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90;
  return [lng, lat];
}
// keys: [{t, center, zoom, bearing, pitch, ease?, arc?}] ; arc = zoom-out amount mid-flight
export function cameraTrack(keys, { drift = 0.012, driftZoom = 0.04 } = {}) {
  return t => {
    let i = 0;
    while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    let s = 0;
    if (b !== a && t > a.t) {
      const startMove = b.t - (b.dur ?? (b.t - a.t));
      s = (b.ease || easeInOut)((t - startMove) / Math.max(1e-6, b.t - startMove));
    }
    const ma = toMerc(a.center), mb = toMerc(b.center);
    const c = fromMerc([lerp(ma[0], mb[0], s), lerp(ma[1], mb[1], s)]);
    let zoom = lerp(a.zoom, b.zoom, s) - (b.arc || 0) * Math.sin(Math.PI * s);
    // gentle life on holds: slow push + drift, never a dead frame
    zoom += driftZoom * Math.sin(t * 0.35);
    const bearing = lerp(a.bearing ?? 0, b.bearing ?? 0, s) + drift * 60 * Math.sin(t * 0.21);
    const pitch = lerp(a.pitch ?? 0, b.pitch ?? 0, s);
    return { center: c, zoom, bearing, pitch, padding: a.padding || b.padding };
  };
}

// ---------- geometry ----------
export function catmull(points, segs = 16) {
  if (points.length < 3) return points.slice();
  const out = [];
  const P = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let k = 0; k < segs; k++) {
      const t = k / segs, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => 0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
export function cumLen(pts) {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return c;
}
export function pointAt(pts, cum, d) {
  const total = cum[cum.length - 1];
  d = clamp(d, 0, total);
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const s = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
  return [lerp(pts[i - 1][0], pts[i][0], s), lerp(pts[i - 1][1], pts[i][1], s), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), i];
}
export function slice(pts, frac) {
  const cum = cumLen(pts), d = frac * cum[cum.length - 1];
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] < d) out.push(pts[i]);
    else { const p = pointAt(pts, cum, d); out.push([p[0], p[1]]); break; }
  }
  return out;
}

// ---------- drawing ----------
export function font(size, family = 'Inter', weight = 600) { return `${weight} ${size}px ${family}`; }

export function text(g, str, x, y, o = {}) {
  const { size = 32, family = 'Inter', weight = 700, color = '#fff', halo = 'rgba(0,0,0,0.75)', haloWidth = 6,
    align = 'center', baseline = 'middle', alpha = 1, tracking = 0, shadow = null } = o;
  if (alpha <= 0.001) return;
  g.save();
  g.globalAlpha *= alpha;
  g.font = font(size, family, weight);
  g.textAlign = align; g.textBaseline = baseline;
  g.letterSpacing = `${tracking}px`;
  g.lineJoin = 'round';
  if (shadow) { g.shadowColor = shadow.color; g.shadowBlur = shadow.blur; g.shadowOffsetY = shadow.y || 0; }
  if (halo && haloWidth > 0) { g.strokeStyle = halo; g.lineWidth = haloWidth; g.strokeText(str, x, y); g.shadowColor = 'transparent'; }
  g.fillStyle = color;
  g.fillText(str, x, y);
  g.restore();
}

// Tapered "campaign" arrow along screen points. frac in [0,1] = growth.
export function arrow(g, pts, frac, o = {}) {
  const { width = 40, tail = 0.35, head = 2.0, headLen = 1.6, fill = '#2F4B7C', stroke = 'rgba(20,15,10,0.85)',
    strokeWidth = 3, alpha = 1, shadow = 'rgba(0,0,0,0.35)', highlight = 'rgba(255,255,255,0.18)', widthEnd = null, dash = null } = o;
  if (frac <= 0.001 || alpha <= 0.001 || pts.length < 2) return;
  const part = slice(pts, frac);
  if (part.length < 2) return;
  const cum = cumLen(part), L = cum[cum.length - 1];
  if (L < 2) return;
  const hl = Math.min(width * headLen, L * 0.6);
  const bodyEnd = L - hl;
  const wEnd = widthEnd ?? width;
  const left = [], right = [];
  const N = Math.max(8, Math.ceil(L / 6));
  for (let k = 0; k <= N; k++) {
    const d = (k / N) * bodyEnd;
    const [x, y, ang] = pointAt(part, cum, d);
    const s = d / Math.max(1e-6, bodyEnd);
    const wBase = lerp(width, wEnd, s);
    const w = wBase * lerp(tail, 1, smooth(Math.min(1, s * 4))) / 2;
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    left.push([x + nx * w, y + ny * w]); right.push([x - nx * w, y - ny * w]);
  }
  const [hx, hy, hang] = pointAt(part, cum, bodyEnd);
  const [tx, ty] = pointAt(part, cum, L);
  const hw = (wEnd * head) / 2;
  const nx = -Math.sin(hang), ny = Math.cos(hang);
  const poly = [...left, [hx + nx * hw, hy + ny * hw], [tx, ty], [hx - nx * hw, hy - ny * hw], ...right.reverse()];
  g.save();
  g.globalAlpha *= alpha;
  g.beginPath();
  poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  if (dash) g.setLineDash(dash);
  if (shadow) { g.shadowColor = shadow; g.shadowBlur = width * 0.5; g.shadowOffsetY = width * 0.18; }
  g.fillStyle = fill; g.fill();
  g.shadowColor = 'transparent';
  g.lineJoin = 'round';
  g.strokeStyle = stroke; g.lineWidth = strokeWidth; g.stroke();
  if (highlight) { // inner sheen along the left edge
    g.beginPath(); left.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = highlight; g.lineWidth = Math.max(1.5, width * 0.12); g.stroke();
  }
  g.restore();
}

export function pulseRing(g, x, y, t, o = {}) {
  const { color = '255,77,77', r0 = 10, r1 = 70, period = 1.6, rings = 2, width = 3, alpha = 1 } = o;
  for (let k = 0; k < rings; k++) {
    const ph = ((t / period + k / rings) % 1 + 1) % 1;
    g.beginPath(); g.arc(x, y, lerp(r0, r1, ph), 0, Math.PI * 2);
    g.strokeStyle = `rgba(${color},${(1 - ph) * 0.9 * alpha})`; g.lineWidth = width; g.stroke();
  }
}

export function dot(g, x, y, r, color, o = {}) {
  const { glow = 0, alpha = 1, stroke = null, strokeWidth = 2 } = o;
  g.save(); g.globalAlpha *= alpha;
  if (glow) { g.shadowColor = color; g.shadowBlur = glow; }
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = color; g.fill();
  if (stroke) { g.shadowColor = 'transparent'; g.strokeStyle = stroke; g.lineWidth = strokeWidth; g.stroke(); }
  g.restore();
}

export function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// Image (flag) with a gentle cloth wave, drawn in vertical strips.
export function flag(g, img, x, y, w, t, o = {}) {
  const { alpha = 1, amp = 0.05, scale = 1, shadow = true } = o;
  if (alpha <= 0.001 || scale <= 0.001) return;
  const h = w * 0.75;
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y); g.scale(scale, scale);
  if (shadow) { g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 12; g.shadowOffsetY = 5; g.fillStyle = '#000'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent'; }
  const strips = 24;
  for (let i = 0; i < strips; i++) {
    const sx = (img.naturalWidth || 640) * i / strips, sw = (img.naturalWidth || 640) / strips;
    const dx = -w / 2 + (w * i) / strips;
    const off = Math.sin(t * 5 + i * 0.45) * amp * h * (i / strips);
    const shade = 0.12 * Math.sin(t * 5 + i * 0.45 + 1.2) * (i / strips);
    g.drawImage(img, sx, 0, sw + 0.5, img.naturalHeight || 480, dx, -h / 2 + off, w / strips + 0.8, h);
    if (shade) { g.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`; g.fillRect(dx, -h / 2 + off, w / strips + 0.8, h); }
  }
  g.restore();
}

// Loads an image (SVG included) and rasterizes it at a fixed size, so strip-drawing has real pixels.
export async function loadImage(url, w = 640, h = 480) {
  const img = new Image(w, h);
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  c.naturalWidth = w; c.naturalHeight = h;
  return c;
}

// ---------- particles (stateless) ----------
export function snow(g, W, H, t, o = {}) {
  const { count = 260, alpha = 1, wind = 40, speed = 90, seed = 7, size = 2.6 } = o;
  if (alpha <= 0.001) return;
  g.save();
  for (let i = 0; i < count; i++) {
    const depth = 0.35 + 0.65 * hash2(i, seed);
    const x0 = hash2(i, seed + 1) * (W + 200) - 100, y0 = hash2(i, seed + 2) * (H + 100);
    const y = ((y0 + t * speed * depth) % (H + 100)) - 50;
    const x = ((x0 + t * wind * depth + Math.sin(t * 1.3 + i) * 14 * depth) % (W + 200) + W + 200) % (W + 200) - 100;
    g.globalAlpha = alpha * (0.35 + 0.65 * depth);
    g.beginPath(); g.arc(x, y, size * depth, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  }
  g.restore();
}

// Fire at a screen point: flickering flames + rising embers + smoke column.
export function fire(g, x, y, t, o = {}) {
  const { scale = 1, alpha = 1, seed = 1, smokeAlpha = 0.5 } = o;
  if (alpha <= 0.01) return;
  g.save();
  // smoke
  for (let i = 0; i < 14; i++) {
    const life = 3.2, ph = ((t + hash2(i, seed) * life) % life) / life;
    const sx = x + (noise1(t * 0.6 + i, seed) - 0.5) * 40 * scale + ph * 30 * scale;
    const sy = y - ph * 140 * scale;
    const r = (14 + ph * 46) * scale;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
    gr.addColorStop(0, `rgba(55,48,42,${0.35 * (1 - ph) * smokeAlpha * alpha})`);
    gr.addColorStop(1, 'rgba(55,48,42,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill();
  }
  // glow
  const fl = 0.8 + 0.2 * noise1(t * 8, seed + 3);
  const gl = g.createRadialGradient(x, y, 0, x, y, 60 * scale);
  gl.addColorStop(0, `rgba(255,170,60,${0.55 * fl * alpha})`); gl.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(x, y, 60 * scale, 0, Math.PI * 2); g.fill();
  // flames
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const life = 0.9, ph = ((t + hash2(i, seed + 5) * life) % life) / life;
    const fx = x + (hash2(i, seed + 6) - 0.5) * 26 * scale + Math.sin(t * 9 + i) * 3 * scale;
    const fy = y - ph * 46 * scale;
    const r = (10 * (1 - ph) + 2) * scale;
    g.fillStyle = `rgba(255,${Math.round(200 - 140 * ph)},${Math.round(80 - 60 * ph)},${0.5 * (1 - ph) * alpha})`;
    g.beginPath(); g.arc(fx, fy, r, 0, Math.PI * 2); g.fill();
  }
  // embers
  for (let i = 0; i < 10; i++) {
    const life = 2.2, ph = ((t + hash2(i, seed + 9) * life) % life) / life;
    const ex = x + (hash2(i, seed + 10) - 0.5) * 50 * scale + ph * 40 * scale * (hash2(i, seed + 11) - 0.3);
    const ey = y - ph * 120 * scale;
    g.fillStyle = `rgba(255,190,90,${(1 - ph) * alpha})`;
    g.fillRect(ex, ey, 2.2 * scale, 2.2 * scale);
  }
  g.restore();
}

export function smokePuff(g, x, y, t, t0, o = {}) {
  const { scale = 1, alpha = 1, seed = 3, color = '230,220,200' } = o;
  const age = t - t0;
  if (age < 0 || age > 3) return;
  g.save();
  for (let i = 0; i < 9; i++) {
    const a = hash2(i, seed) * Math.PI * 2, sp = 20 + 60 * hash2(i, seed + 1);
    const ph = clamp(age / 3);
    const px = x + Math.cos(a) * sp * easeOut(ph) * scale, py = y + Math.sin(a) * sp * easeOut(ph) * scale * 0.6 - age * 12 * scale;
    const r = (12 + 40 * easeOut(ph)) * scale;
    const gr = g.createRadialGradient(px, py, 0, px, py, r);
    gr.addColorStop(0, `rgba(${color},${0.5 * (1 - ph) * alpha})`); gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// ---------- post ----------
export function vignette(g, W, H, o = {}) {
  const { strength = 0.55, color = '0,0,0', inner = 0.45 } = o;
  const r = Math.hypot(W, H) / 2;
  const gr = g.createRadialGradient(W / 2, H / 2, r * inner, W / 2, H / 2, r);
  gr.addColorStop(0, `rgba(${color},0)`); gr.addColorStop(1, `rgba(${color},${strength})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

// Pre-generated noise tiles; one picked per frame (deterministic) for animated grain.
const grainTiles = [];
export function makeGrain(n = 6, size = 256) {
  for (let k = 0; k < n; k++) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'); const im = x.createImageData(size, size);
    for (let i = 0; i < size * size; i++) { const v = Math.floor(hash2(i, k + 11) * 255); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); grainTiles.push(c);
  }
}
export function grain(g, W, H, frame, amount = 0.06) {
  if (!grainTiles.length) makeGrain();
  const tile = grainTiles[frame % grainTiles.length];
  g.save(); g.globalAlpha = amount; g.globalCompositeOperation = 'overlay';
  const pat = g.createPattern(tile, 'repeat'); g.fillStyle = pat;
  g.translate((frame * 37) % 256, (frame * 91) % 256); g.fillRect(-256, -256, W + 512, H + 512);
  g.restore();
}

// Paper / parchment texture generated once (fbm value noise + fibres).
export function makePaper(W, H, o = {}) {
  const { base = [232, 216, 176], seed = 3 } = o;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); const im = x.createImageData(W, H);
  const cell = (ix, iy, s) => hash2(ix * 7919 + iy, s);
  const vnoise = (px, py, sc, s) => {
    const fx = px / sc, fy = py / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(cell(ix, iy, s), cell(ix + 1, iy, s), sx), lerp(cell(ix, iy + 1, s), cell(ix + 1, iy + 1, s), sx), sy);
  };
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const n = 0.5 * vnoise(px, py, 260, seed) + 0.3 * vnoise(px, py, 70, seed + 1) + 0.2 * vnoise(px, py, 14, seed + 2);
    const fib = vnoise(px * 0.25, py * 6, 3, seed + 4) * 0.08;
    const v = 0.86 + 0.22 * n - fib;
    const i = (py * W + px) * 4;
    im.data[i] = clamp(base[0] * v, 0, 255); im.data[i + 1] = clamp(base[1] * v, 0, 255); im.data[i + 2] = clamp(base[2] * v, 0, 255); im.data[i + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return c;
}

// Word-by-word captions (short-form style).
export function captions(g, pages, t, o = {}) {
  const { x, y, size = 74, family = 'Montserrat', weight = 900, color = '#ffffff', active = '#FFD23F', maxWidth = 860, upper = true } = o;
  const page = pages.find(p => t >= p.start && t < p.end);
  if (!page) return;
  const pop = easeOutBack(clamp((t - page.start) / 0.14));
  g.save();
  g.font = font(size, family, weight);
  g.textBaseline = 'middle'; g.lineJoin = 'round';
  const words = page.words.map(w => (upper ? w.w.toUpperCase() : w.w).replace(/[,.;:]$/, ''));
  const space = size * 0.36;
  const widths = words.map(w => g.measureText(w).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  const sc = Math.min(1, maxWidth / total) * (0.9 + 0.1 * pop);
  g.translate(x, y); g.scale(sc, sc);
  let cx = -total / 2;
  words.forEach((w, i) => {
    const on = t >= page.words[i].start - 0.03;
    const isActive = on && (i === words.length - 1 || t < page.words[i + 1].start - 0.03);
    const lift = isActive ? -size * 0.05 : 0;
    g.lineWidth = size * 0.2; g.strokeStyle = 'rgba(0,0,0,0.92)';
    g.strokeText(w, cx, lift);
    g.fillStyle = isActive ? active : on ? color : 'rgba(255,255,255,0.55)';
    g.fillText(w, cx, lift);
    cx += widths[i] + space;
  });
  g.restore();
}

export const fmtInt = n => Math.round(n).toLocaleString('en-US');
