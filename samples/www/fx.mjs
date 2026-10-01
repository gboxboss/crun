// Effects for the satellite "war map" look: icons, beveled campaign arrows, unit badges, territories,
// troop-flow particles, fire, battle lines, snowfall, cards. Pure functions of their inputs (no randomness).
import { clamp, lerp, smooth, easeOut, hash2, noise1, roundRect, font, text } from './kit.mjs';

// ---------- icons (Iconify path data exported by tools/export_icons.mjs) ----------
const ICONS = {};
export async function loadIcons(url) {
  const j = await fetch(url).then(r => r.json());
  for (const [k, v] of Object.entries(j)) ICONS[k] = { w: v.w, h: v.h, paths: v.paths.map(d => new Path2D(d)) };
}
export function icon(g, name, x, y, size, o = {}) {
  const { color = '#fff', alpha = 1, rot = 0, shadow = 'rgba(0,0,0,0.55)', blur = 10, outline = null, outlineWidth = 0 } = o;
  const ic = ICONS[name];
  if (!ic || alpha <= 0.002 || size <= 0.5) return;
  const s = size / Math.max(ic.w, ic.h);
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y); if (rot) g.rotate(rot); g.scale(s, s); g.translate(-ic.w / 2, -ic.h / 2);
  if (shadow) { g.shadowColor = shadow; g.shadowBlur = blur; g.shadowOffsetY = blur * 0.3; }
  if (outline) {
    g.strokeStyle = outline; g.lineWidth = outlineWidth / s; g.lineJoin = 'round';
    for (const p of ic.paths) g.stroke(p);
    g.shadowColor = 'transparent';
  }
  g.fillStyle = color;
  for (const p of ic.paths) g.fill(p);
  g.restore();
}

// ---------- polyline helpers ----------
function cumulative(pts) {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return c;
}
// uniform samples [x, y, s] along pts up to length L
function resample(pts, cum, L, step) {
  const out = [];
  const n = Math.max(2, Math.ceil(L / step) + 1);
  let j = 1;
  for (let k = 0; k < n; k++) {
    const s = Math.min(L, k * step);
    while (j < cum.length - 1 && cum[j] < s) j++;
    const u = (s - cum[j - 1]) / Math.max(1e-9, cum[j] - cum[j - 1]);
    out.push([lerp(pts[j - 1][0], pts[j][0], u), lerp(pts[j - 1][1], pts[j][1], u), s]);
  }
  return out;
}
export function along(pts, frac) {
  const cum = cumulative(pts), L = cum[cum.length - 1], s = clamp(frac) * L;
  let j = 1;
  while (j < cum.length - 1 && cum[j] < s) j++;
  const u = (s - cum[j - 1]) / Math.max(1e-9, cum[j] - cum[j - 1]);
  const a = pts[j - 1], b = pts[j];
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), len: L };
}

// ---------- campaign arrow ----------
// pts: screen polyline of the WHOLE route; frac: drawn fraction. Width can narrow along the route (w0 -> w1,
// after Minard). Beveled body, swept head, drop shadow, chevrons flowing toward the head.
export function warArrow(g, pts, frac, o = {}) {
  const { w0 = 30, w1 = null, color = '#2f6bff', dark = 'rgba(6,12,30,0.92)', alpha = 1, t = 0, chevrons = true,
    glow = 0, shadow = true, headScale = 1, taper = true } = o;
  if (frac <= 0.002 || alpha <= 0.002 || pts.length < 2) return null;
  const cum = cumulative(pts), Ltot = cum[cum.length - 1];
  if (Ltot < 4) return null;
  const Lv = clamp(frac) * Ltot;
  const P = resample(pts, cum, Lv, 3);
  const wAt = s => (w1 == null ? w0 : lerp(w0, w1, s / Ltot));
  const wh = wAt(Lv);
  const grow = clamp(Lv / (wh * 3));
  const hl = wh * 1.5 * headScale * lerp(0.55, 1, grow), hw = wh * 1.1 * headScale * lerp(0.55, 1, grow);
  const tip = P[P.length - 1];
  let bi = P.length - 1;
  while (bi > 0 && Lv - P[bi][2] < hl) bi--;
  const base = P[bi];
  let dx = tip[0] - base[0], dy = tip[1] - base[1];
  const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = -dy, ny = dx;
  const K = 5, left = [], right = [], center = [];
  for (let i = 0; i <= bi; i++) {
    const a = P[Math.max(0, i - K)], b = P[Math.min(bi, i + K)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l0 = Math.hypot(tx, ty) || 1, m = smooth((i - (bi - 2 * K)) / (2 * K));
    tx = lerp(tx / l0, dx, m); ty = lerp(ty / l0, dy, m);
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const s = P[i][2];
    const w = wAt(s) * (taper ? lerp(0.6, 1, smooth(s / (wAt(s) * 1.6))) : 1) / 2;
    left.push([P[i][0] - ty * w, P[i][1] + tx * w]);
    right.push([P[i][0] + ty * w, P[i][1] - tx * w]);
    center.push([P[i][0], P[i][1], s, tx, ty]);
  }
  const hx = base[0], hy = base[1];
  const tipX = hx + dx * hl, tipY = hy + dy * hl;
  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i++) path.lineTo(left[i][0], left[i][1]);
  path.lineTo(hx + nx * hw - dx * hl * 0.16, hy + ny * hw - dy * hl * 0.16);
  path.lineTo(tipX, tipY);
  path.lineTo(hx - nx * hw - dx * hl * 0.16, hy - ny * hw - dy * hl * 0.16);
  for (let i = right.length - 1; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
  path.closePath();

  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round'; g.lineCap = 'round';
  if (shadow) {
    g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = Math.max(6, wh * 0.7); g.shadowOffsetY = Math.max(3, wh * 0.3);
    g.fillStyle = dark; g.fill(path); g.restore();
  }
  g.fillStyle = color; g.fill(path);
  g.save(); g.clip(path);
  g.strokeStyle = 'rgba(0,0,0,0.30)'; g.lineWidth = wh * 0.5; g.stroke(path);      // inner edge shade -> rounded look
  g.beginPath();
  center.forEach((c, i) => (i ? g.lineTo(c[0], c[1]) : g.moveTo(c[0], c[1])));
  g.lineTo(hx + dx * hl * 0.45, hy + dy * hl * 0.45);
  g.strokeStyle = 'rgba(255,255,255,0.30)'; g.lineWidth = Math.max(1.5, wh * 0.2); g.stroke(); // centre sheen
  if (chevrons && center.length > 4) {
    const gap = wh * 2.4, speed = wh * 2.2, cw = wh * 0.26;
    g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = Math.max(1.2, wh * 0.13);
    const endS = center[center.length - 1][2] - wh * 0.6;
    for (let s = ((t * speed) % gap) + wh; s < endS; s += gap) {
      const i = Math.min(center.length - 1, Math.round(s / 3));
      const [cx, cy, , tx, ty] = center[i];
      const fade = smooth((s - wh) / gap) * smooth((endS - s) / gap);
      g.globalAlpha = alpha * fade;
      g.beginPath();
      g.moveTo(cx - tx * cw - ty * cw * 1.3, cy - ty * cw + tx * cw * 1.3);
      g.lineTo(cx + tx * cw, cy + ty * cw);
      g.lineTo(cx - tx * cw + ty * cw * 1.3, cy - ty * cw - tx * cw * 1.3);
      g.stroke();
    }
    g.globalAlpha = alpha;
  }
  g.restore();
  g.strokeStyle = dark; g.lineWidth = Math.max(1.6, wh * 0.075); g.stroke(path);
  if (glow > 0) {
    const r = wh * 2.6;
    const gl = g.createRadialGradient(tipX, tipY, 0, tipX, tipY, r);
    gl.addColorStop(0, `rgba(255,255,255,${0.45 * glow})`); gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(tipX - r, tipY - r, 2 * r, 2 * r);
  }
  g.restore();
  return { tip: [tipX, tipY], base: [hx, hy], dir: [dx, dy], width: wh };
}

// ---------- unit badge (pin with flag, ring and label) ----------
export function badge(g, x, y, o = {}) {
  const { img, ring = '#2f6bff', label = '', sub = '', scale = 1, alpha = 1, side = 1, stem = 40, t = 0 } = o;
  if (alpha <= 0.01 || scale <= 0.01) return;
  const R = 34 * scale, cy = y - stem * scale - R;
  g.save(); g.globalAlpha *= alpha;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, y, 13 * scale, 5 * scale, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 3 * scale; g.beginPath(); g.moveTo(x, y); g.lineTo(x, cy + R); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4 * scale, 0, Math.PI * 2); g.fill();
  g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 18 * scale; g.shadowOffsetY = 6 * scale;
  g.fillStyle = ring; g.beginPath(); g.arc(x, cy, R + 7 * scale, 0, Math.PI * 2); g.fill(); g.restore();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x, cy, R + 3 * scale, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(x, cy, R, 0, Math.PI * 2); g.clip();
  if (img) { const h = 2 * R, w = h * (img.width / img.height); g.drawImage(img, x - w / 2 + Math.sin(t * 2) * 2 * scale, cy - R, w, h); }
  const sh = g.createRadialGradient(x - R * 0.4, cy - R * 0.5, R * 0.1, x, cy, R * 1.1);
  sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = sh; g.fillRect(x - R, cy - R, 2 * R, 2 * R);
  g.restore();
  if (label) {
    g.font = font(Math.round(27 * scale), 'Oswald', 700); g.letterSpacing = `${1.5 * scale}px`;
    const lw = g.measureText(label).width;
    g.font = font(Math.round(17 * scale), 'Inter', 800); g.letterSpacing = `${1.5 * scale}px`;
    const sw = sub ? g.measureText(sub).width : 0;
    g.letterSpacing = '0px';
    const pw = Math.max(lw, sw) + 34 * scale, ph = (sub ? 64 : 44) * scale;
    const px = side > 0 ? x + R + 16 * scale : x - R - 16 * scale - pw, py = cy - ph / 2;
    g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 14 * scale; g.shadowOffsetY = 4 * scale;
    roundRect(g, px, py, pw, ph, 9 * scale); g.fillStyle = 'rgba(10,14,22,0.86)'; g.fill(); g.restore();
    roundRect(g, side > 0 ? px : px + pw - 6 * scale, py, 6 * scale, ph, 3 * scale); g.fillStyle = ring; g.fill();
    const tx = px + (side > 0 ? 20 : 14) * scale;
    text(g, label, tx, py + (sub ? 23 : 22) * scale, { family: 'Oswald', weight: 700, size: Math.round(27 * scale), color: '#fff', halo: null, align: 'left', tracking: 1.5 * scale });
    if (sub) text(g, sub, tx, py + 47 * scale, { family: 'Inter', weight: 800, size: Math.round(17 * scale), color: 'rgba(255,255,255,0.72)', halo: null, align: 'left', tracking: 1.5 * scale });
  }
  g.restore();
}

// ---------- top-left date pill ----------
export function pill(g, x, y, str, o = {}) {
  const { alpha = 1, size = 40, accent = '#FFD23F', iconName = 'calendar', dy = 0, clipH = null, sub = null } = o;
  if (alpha <= 0.01) return 0;
  g.save(); g.globalAlpha *= alpha;
  g.font = font(size, 'Oswald', 700); g.letterSpacing = '2px';
  const tw = g.measureText(str).width; g.letterSpacing = '0px';
  const h = size * 1.7, w = tw + size * 2.6;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 18; g.shadowOffsetY = 5;
  roundRect(g, x, y, w, h, h * 0.22); g.fillStyle = 'rgba(10,14,22,0.82)'; g.fill(); g.restore();
  roundRect(g, x, y, w, h, h * 0.22); g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1.5; g.stroke();
  icon(g, iconName, x + size * 0.95, y + h / 2, size * 0.9, { color: accent, shadow: null });
  g.save(); g.beginPath(); g.rect(x, y + 4, w, h - 8); g.clip();
  text(g, str, x + size * 1.75, y + h / 2 + 2 + dy, { family: 'Oswald', weight: 700, size, color: '#fff', halo: null, align: 'left', tracking: 2 });
  g.restore();
  g.restore();
  return w;
}

// ---------- stat card ----------
export function statCard(g, cx, cy, big, small, o = {}) {
  const { alpha = 1, scale = 1, accent = '#FFB000', w = 620, bigSize = 120 } = o;
  if (alpha <= 0.01) return;
  g.save(); g.globalAlpha *= alpha; g.translate(cx, cy); g.scale(scale, scale);
  g.save(); g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 30; g.shadowOffsetY = 8;
  roundRect(g, -w / 2, -bigSize * 0.78, w, bigSize * 1.72, 22); g.fillStyle = 'rgba(10,14,22,0.84)'; g.fill(); g.restore();
  roundRect(g, -w / 2, -bigSize * 0.78, w, bigSize * 1.72, 22); g.strokeStyle = accent; g.globalAlpha *= 0.6; g.lineWidth = 2.5; g.stroke(); g.globalAlpha /= 0.6;
  text(g, big, 0, -bigSize * 0.08, { family: 'Oswald', weight: 700, size: bigSize, color: accent, halo: null, shadow: { color: accent + '88', blur: 28 } });
  text(g, small, 0, bigSize * 0.68, { family: 'Inter', weight: 800, size: Math.round(bigSize * 0.24), color: '#E8EEF4', halo: null, tracking: 2 });
  g.restore();
}

// ---------- territories ----------
export function territory(g, rings, o = {}) {
  const { fill = 'rgba(47,107,255,0.4)', stroke = '#6b9bff', width = 3, glow = 'rgba(107,155,255,0.5)', glowWidth = 26,
    alpha = 1, reveal = null, edge = null } = o;
  if (alpha <= 0.002) return;
  const path = new Path2D();
  for (const r of rings) { if (r.length < 3) continue; path.moveTo(r[0][0], r[0][1]); for (let i = 1; i < r.length; i++) path.lineTo(r[i][0], r[i][1]); path.closePath(); }
  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'round';
  if (reveal) { const c = new Path2D(); c.arc(reveal.x, reveal.y, Math.max(0, reveal.r), 0, Math.PI * 2); g.clip(c); }
  g.fillStyle = fill; g.fill(path, 'evenodd');
  if (glowWidth > 0) { g.save(); g.clip(path, 'evenodd'); g.strokeStyle = glow; g.lineWidth = glowWidth; g.stroke(path); g.restore(); }
  g.strokeStyle = stroke; g.lineWidth = width; g.stroke(path);
  if (reveal && edge) {
    g.save(); g.clip(path, 'evenodd');
    const r = Math.max(1, reveal.r);
    const gr = g.createRadialGradient(reveal.x, reveal.y, r * 0.86, reveal.x, reveal.y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, edge);
    g.fillStyle = gr; g.fillRect(reveal.x - r, reveal.y - r, 2 * r, 2 * r); g.restore();
  }
  g.restore();
}

// ---------- particles moving along a route (troops) ----------
export function troopFlow(g, pts, t, o = {}) {
  const { count = 120, speed = 60, spread = 16, color = '150,190,255', core = '255,255,255', size = 2.4, alpha = 1, seed = 1, upto = 1 } = o;
  if (alpha <= 0.01 || pts.length < 2) return;
  const cum = cumulative(pts), L = cum[cum.length - 1], Lmax = L * clamp(upto);
  g.save();
  for (let i = 0; i < count; i++) {
    const v = speed * (0.75 + 0.5 * hash2(i, seed + 1));
    const s = (hash2(i, seed) * L + t * v) % L;
    if (s > Lmax) continue;
    let j = 1; while (j < cum.length - 1 && cum[j] < s) j++;
    const u = (s - cum[j - 1]) / Math.max(1e-9, cum[j] - cum[j - 1]);
    const a = pts[j - 1], b = pts[j];
    const dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
    const off = (hash2(i, seed + 2) - 0.5) * 2 * spread + (noise1(t * 0.9 + i * 0.37, seed) - 0.5) * spread * 0.5;
    const x = lerp(a[0], b[0], u) - (dy / dl) * off, y = lerp(a[1], b[1], u) + (dx / dl) * off;
    const f = smooth(s / 30) * smooth((Lmax - s) / 30) * alpha;
    if (f <= 0.01) continue;
    g.globalAlpha = f * 0.45; g.fillStyle = `rgb(${color})`;
    g.beginPath(); g.arc(x, y, size * 2.1, 0, Math.PI * 2); g.fill();
    g.globalAlpha = f; g.fillStyle = `rgb(${core})`;
    g.beginPath(); g.arc(x, y, size, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// massed troops in an area (ellipse), gently milling
export function troopMass(g, cx, cy, rx, ry, t, o = {}) {
  const { count = 200, color = '150,190,255', core = '255,255,255', size = 2.2, alpha = 1, seed = 3 } = o;
  if (alpha <= 0.01) return;
  g.save();
  for (let i = 0; i < count; i++) {
    const a = hash2(i, seed) * Math.PI * 2, r = Math.sqrt(hash2(i, seed + 1));
    const x = cx + Math.cos(a) * r * rx + (noise1(t * 0.7 + i, seed) - 0.5) * 6;
    const y = cy + Math.sin(a) * r * ry + (noise1(t * 0.7 + i, seed + 9) - 0.5) * 4;
    g.globalAlpha = alpha * 0.4; g.fillStyle = `rgb(${color})`; g.beginPath(); g.arc(x, y, size * 2, 0, Math.PI * 2); g.fill();
    g.globalAlpha = alpha; g.fillStyle = `rgb(${core})`; g.beginPath(); g.arc(x, y, size, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// ---------- fire ----------
export function blaze(g, x, y, t, o = {}) {
  const { scale = 1, alpha = 1, seed = 1, smoke = 1, wind = 0.6, tongues = 9 } = o;
  if (alpha <= 0.01 || scale <= 0.02) return;
  g.save();
  // smoke column (behind the flames)
  for (let i = 0; i < 12; i++) {
    const life = 4.5, ph = ((t + hash2(i, seed) * life) % life) / life;
    const sx = x + wind * ph * ph * 110 * scale + (noise1(t * 0.5 + i, seed) - 0.5) * 24 * scale;
    const sy = y - 10 * scale - ph * 130 * scale;
    const r = (10 + 46 * ph) * scale;
    const a = 0.42 * (1 - ph) * smooth(ph * 5) * smoke * alpha;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
    gr.addColorStop(0, `rgba(38,34,32,${a})`); gr.addColorStop(1, 'rgba(38,34,32,0)');
    g.fillStyle = gr; g.fillRect(sx - r, sy - r, 2 * r, 2 * r);
  }
  g.globalCompositeOperation = 'lighter';
  const fl = 0.75 + 0.25 * noise1(t * 7, seed + 3);
  const R = 64 * scale;
  const gl = g.createRadialGradient(x, y - 8 * scale, 0, x, y - 8 * scale, R);
  gl.addColorStop(0, `rgba(255,150,50,${0.55 * fl * alpha})`); gl.addColorStop(0.5, `rgba(255,90,20,${0.18 * fl * alpha})`); gl.addColorStop(1, 'rgba(255,60,10,0)');
  g.fillStyle = gl; g.fillRect(x - R, y - 8 * scale - R, 2 * R, 2 * R);
  for (let i = 0; i < tongues; i++) {
    const life = 0.55 + 0.35 * hash2(i, seed + 4), ph = ((t + hash2(i, seed + 5) * life) % life) / life;
    const bx = x + (hash2(i, seed + 6) - 0.5) * 26 * scale;
    const h = (22 + 26 * hash2(i, seed + 7)) * scale * Math.sin(Math.PI * Math.min(1, ph * 1.2 + 0.1));
    const w = (5 + 5 * hash2(i, seed + 8)) * scale * (1 - ph * 0.5);
    const sway = (noise1(t * 3 + i, seed + 2) - 0.5) * 14 * scale + wind * 6 * scale;
    const by = y - ph * 6 * scale;
    const gr = g.createLinearGradient(bx, by, bx + sway, by - h);
    gr.addColorStop(0, `rgba(255,236,170,${0.85 * alpha})`); gr.addColorStop(0.35, `rgba(255,150,40,${0.7 * alpha})`); gr.addColorStop(1, 'rgba(255,60,10,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(bx - w, by);
    g.quadraticCurveTo(bx - w * 0.9 + sway * 0.4, by - h * 0.55, bx + sway, by - h);
    g.quadraticCurveTo(bx + w * 0.9 + sway * 0.4, by - h * 0.55, bx + w, by);
    g.closePath(); g.fill();
  }
  for (let i = 0; i < 8; i++) {
    const life = 1.8, ph = ((t + hash2(i, seed + 9) * life) % life) / life;
    const ex = x + (hash2(i, seed + 10) - 0.5) * 40 * scale + wind * ph * 50 * scale + Math.sin(t * 6 + i) * 4 * scale;
    const ey = y - 12 * scale - ph * 110 * scale;
    g.fillStyle = `rgba(255,${170 + Math.round(60 * hash2(i, seed))},90,${(1 - ph) * alpha * (0.6 + 0.4 * Math.sin(t * 20 + i))})`;
    g.fillRect(ex, ey, 2.4 * scale, 2.4 * scale);
  }
  g.restore();
}

// ---------- battle: muzzle flashes and gun smoke along a line ----------
export function battleLine(g, pts, t, o = {}) {
  const { t0 = 0, t1 = 1e9, rate = 16, seed = 1, alpha = 1, scale = 1, smokeLife = 3.2, drift = [14, -6] } = o;
  if (alpha <= 0.01 || t < t0 || pts.length < 2) return;
  const cum = cumulative(pts), L = cum[cum.length - 1];
  const kNow = Math.floor((Math.min(t, t1) - t0) * rate), kOld = Math.max(0, Math.floor((t - smokeLife - t0) * rate));
  const pos = k => {
    const s = hash2(k, seed) * L;
    let j = 1; while (j < cum.length - 1 && cum[j] < s) j++;
    const u = (s - cum[j - 1]) / Math.max(1e-9, cum[j] - cum[j - 1]);
    return [lerp(pts[j - 1][0], pts[j][0], u) + (hash2(k, seed + 3) - 0.5) * 10 * scale, lerp(pts[j - 1][1], pts[j][1], u) + (hash2(k, seed + 4) - 0.5) * 10 * scale];
  };
  g.save();
  for (let k = kOld; k <= kNow; k++) {
    const tk = t0 + (k + hash2(k, seed + 1)) / rate, age = t - tk;
    if (age < 0 || age > smokeLife || tk > t1) continue;
    const [x, y] = pos(k), ph = age / smokeLife;
    const r = (7 + 30 * easeOut(ph)) * scale;
    const sx = x + drift[0] * age * scale, sy = y + drift[1] * age * scale;
    const a = 0.5 * (1 - ph) * alpha;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
    gr.addColorStop(0, `rgba(236,232,224,${a})`); gr.addColorStop(1, 'rgba(236,232,224,0)');
    g.fillStyle = gr; g.fillRect(sx - r, sy - r, 2 * r, 2 * r);
  }
  g.globalCompositeOperation = 'lighter';
  for (let k = Math.max(0, kNow - 4); k <= kNow; k++) {
    const tk = t0 + (k + hash2(k, seed + 1)) / rate, age = t - tk;
    if (age < 0 || age > 0.14 || tk > t1) continue;
    const [x, y] = pos(k), f = 1 - age / 0.14, r = 26 * scale * (0.6 + 0.4 * f);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,244,200,${0.95 * f * alpha})`); gr.addColorStop(0.3, `rgba(255,170,60,${0.6 * f * alpha})`); gr.addColorStop(1, 'rgba(255,120,20,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.restore();
}

// ---------- snow ----------
export function snowfall(g, W, H, t, o = {}) {
  const { count = 420, alpha = 1, wind = 150, speed = 120, seed = 9 } = o;
  if (alpha <= 0.01) return;
  g.save();
  for (let i = 0; i < count; i++) {
    const d = hash2(i, seed), depth = 0.25 + 0.75 * d * d;
    const vx = wind * depth * (0.8 + 0.4 * hash2(i, seed + 3)), vy = speed * depth * (0.8 + 0.4 * hash2(i, seed + 4));
    const x0 = hash2(i, seed + 1) * (W + 400) - 200, y0 = hash2(i, seed + 2) * (H + 200);
    const y = ((y0 + t * vy) % (H + 200)) - 100;
    const x = ((x0 + t * vx + Math.sin(t * 1.4 + i) * 18 * depth) % (W + 400) + W + 400) % (W + 400) - 200;
    const r = 0.8 + 4.2 * depth * depth;
    if (depth > 0.8) {
      g.globalAlpha = alpha * 0.35; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r * 1.8, 0, Math.PI * 2); g.fill();
      g.globalAlpha = alpha * 0.6; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    } else {
      g.globalAlpha = alpha * (0.45 + 0.5 * depth); g.strokeStyle = '#fff'; g.lineWidth = r * 1.6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - vx * 0.03, y - vy * 0.03); g.stroke();
    }
  }
  g.restore();
}

// soft noise texture with transparent centre (frost creeping in from the edges)
export function makeFrost(W, H, seed = 4) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); const im = x.createImageData(W, H);
  const cell = (ix, iy, s) => hash2(ix * 7919 + iy, s);
  const vn = (px, py, sc, s) => {
    const fx = px / sc, fy = py / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(cell(ix, iy, s), cell(ix + 1, iy, s), sx), lerp(cell(ix, iy + 1, s), cell(ix + 1, iy + 1, s), sx), sy);
  };
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const n = 0.5 * vn(px, py, 60, seed) + 0.3 * vn(px, py, 18, seed + 1) + 0.2 * vn(px, py, 5, seed + 2);
    const ex = Math.min(px, W - px) / W, ey = Math.min(py, H - py) / H;
    const edge = 1 - smooth(Math.min(ex * 4.5, ey * 3.2));
    const a = clamp((edge * 1.25 - 0.35) + (n - 0.5) * 0.9);
    const i = (py * W + px) * 4;
    im.data[i] = 232; im.data[i + 1] = 242; im.data[i + 2] = 252; im.data[i + 3] = Math.round(255 * a * a);
  }
  x.putImageData(im, 0, 0);
  return c;
}

// short shockwave ring
export function shockwave(g, x, y, t, t0, o = {}) {
  const { r1 = 260, dur = 0.7, color = '255,255,255', width = 6, alpha = 1 } = o;
  const age = t - t0;
  if (age < 0 || age > dur) return;
  const ph = age / dur, r = r1 * easeOut(ph);
  g.save(); g.globalAlpha = alpha * (1 - ph);
  g.strokeStyle = `rgb(${color})`; g.lineWidth = width * (1 - ph * 0.6);
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.restore();
}

// map label: white text with heavy outline
export function label(g, str, x, y, o = {}) {
  const { size = 30, family = 'Oswald', weight = 700, color = '#fff', alpha = 1, tracking = 2, align = 'center', halo = 'rgba(8,10,14,0.88)', haloWidth = null } = o;
  text(g, str, x, y, { size, family, weight, color, alpha, tracking, align, halo, haloWidth: haloWidth ?? Math.max(5, size * 0.28) });
}

// ---------- clean campaign arrow (v2) ----------
// Constant on-screen width (no zoom scaling), crisp isosceles head, flat fill with a soft drop shadow and a thin
// darker edge. Optional slight taper at the tail. style: 'solid' | 'outline' (white fill, coloured edge) | 'dashed'.
export function cleanArrow(g, pts, o = {}) {
  const { width = 22, color = '#2f6bff', edge = 'rgba(0,0,0,0.55)', alpha = 1, head = 2.3, headLen = 1.9, tail = 0.55,
    shadow = true, style = 'solid', dashT = 0 } = o;
  if (alpha <= 0.002 || pts.length < 2) return null;
  const cum = cumulative(pts), L = cum[cum.length - 1];
  if (L < 3) return null;
  const P = resample(pts, cum, L, 2.5);
  const grow = clamp(L / (width * 4));
  const hl = width * headLen * lerp(0.5, 1, grow), hw = (width * head) / 2 * lerp(0.5, 1, grow);
  let bi = P.length - 1;
  while (bi > 0 && L - P[bi][2] < hl) bi--;
  const tip = P[P.length - 1], base = P[bi];
  let dx = tip[0] - base[0], dy = tip[1] - base[1];
  const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const nx = -dy, ny = dx;
  const left = [], right = [], K = 6;
  for (let i = 0; i <= bi; i++) {
    const a = P[Math.max(0, i - K)], b = P[Math.min(bi, i + K)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l0 = Math.hypot(tx, ty) || 1, m = smooth((i - (bi - 2 * K)) / (2 * K));
    tx = lerp(tx / l0, dx, m); ty = lerp(ty / l0, dy, m);
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const w = (width / 2) * lerp(tail, 1, smooth(P[i][2] / (width * 5)));
    left.push([P[i][0] - ty * w, P[i][1] + tx * w]); right.push([P[i][0] + ty * w, P[i][1] - tx * w]);
  }
  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i++) path.lineTo(left[i][0], left[i][1]);
  path.lineTo(base[0] + nx * hw, base[1] + ny * hw);
  path.lineTo(base[0] + dx * hl, base[1] + dy * hl);
  path.lineTo(base[0] - nx * hw, base[1] - ny * hw);
  for (let i = right.length - 1; i >= 0; i--) path.lineTo(right[i][0], right[i][1]);
  path.closePath();
  g.save(); g.globalAlpha *= alpha; g.lineJoin = 'miter'; g.miterLimit = 3;
  if (shadow) { g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = width * 0.5; g.shadowOffsetY = width * 0.22; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fill(path); g.restore(); }
  if (style === 'outline') {
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.fill(path); g.strokeStyle = color; g.lineWidth = Math.max(2, width * 0.18); g.stroke(path);
  } else {
    g.fillStyle = color; g.fill(path);
    if (style === 'dashed') { // moving light dashes along the centre line (retreats, supply lines)
      g.save(); g.clip(path); g.beginPath();
      for (let i = 0; i <= bi; i++) (i ? g.lineTo(P[i][0], P[i][1]) : g.moveTo(P[i][0], P[i][1]));
      g.setLineDash([width * 0.9, width * 0.9]); g.lineDashOffset = -dashT * width * 2;
      g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = width * 0.3; g.stroke(); g.restore();
    }
    g.strokeStyle = edge; g.lineWidth = Math.max(1.2, width * 0.08); g.stroke(path);
  }
  g.restore();
  return { tip: [base[0] + dx * hl, base[1] + dy * hl], base: [base[0], base[1]], dir: [dx, dy] };
}

// ---------- Napoleonic soldier figures (procedural sprites) ----------
// A marching line infantryman: shako with plume, coat with tails, white crossbelts and trousers, shouldered musket.
// Sprites are pre-rendered per uniform and walk phase, then stamped; height h is in screen px.
const SPRITES = new Map();
const UNIFORMS = {
  fr: { coat: '#2448a8', facing: '#c8312b', trousers: '#eef0f2', shako: '#15161a', plume: '#c8312b', plate: '#d9b44a' },
  ru: { coat: '#1f5a36', facing: '#b8322c', trousers: '#eef0f2', shako: '#15161a', plume: '#15161a', plate: '#d9b44a' },
  frRet: { coat: '#5f6e8f', facing: '#8a5552', trousers: '#c9ccd2', shako: '#2a2b30', plume: '#7a4442', plate: '#9a8a5a' },
};
function drawSoldier(c, u, U, ph, standing, back = false) {
  const ink = 'rgba(10,10,14,0.95)', X = 60, Y = 200; // feet at (X, Y) in 120x210 sprite space
  const sw = standing ? 0 : Math.sin(ph) * 0.42, bob = standing ? 0 : Math.abs(Math.cos(ph)) * 2.2;
  c.save(); c.translate(0, -bob); c.lineCap = 'round'; c.lineJoin = 'round';
  const leg = (a, front) => {
    const hx = X + (front ? 2 : -2), hy = Y - 62, kx = hx + Math.sin(a) * 30, ky = hy + Math.cos(a) * 30;
    const fx = kx + Math.sin(a * 0.5) * 30, fy = ky + Math.cos(a * 0.5) * 30 + bob;
    for (const [col, w] of [[ink, 17], [U.trousers, 12]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke(); }
    c.fillStyle = ink; c.beginPath(); c.ellipse(fx + 5, fy + 1, 9, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = ink; c.lineWidth = 12; c.beginPath(); c.moveTo(kx + (fx - kx) * 0.62, ky + (fy - ky) * 0.62); c.lineTo(fx, fy - 2); c.stroke(); // gaiters
  };
  leg(-sw, false);
  // musket (behind the body), shouldered on the left side
  c.strokeStyle = ink; c.lineWidth = 7; c.beginPath(); c.moveTo(X - 6, Y - 80); c.lineTo(X + 16, Y - 182); c.stroke();
  c.strokeStyle = '#6b4a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(X - 6, Y - 80); c.lineTo(X + 13, Y - 168); c.stroke();
  c.strokeStyle = '#c9ced6'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(X + 13, Y - 168); c.lineTo(X + 18, Y - 196); c.stroke();
  // coat tails + torso
  c.fillStyle = U.coat; c.strokeStyle = ink; c.lineWidth = 3.5;
  c.beginPath(); c.moveTo(X - 15, Y - 112); c.lineTo(X + 15, Y - 112); c.lineTo(X + 16, Y - 70); c.lineTo(X - 2, Y - 64); c.lineTo(X - 22, Y - 52); c.lineTo(X - 17, Y - 72); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(X - 12, Y - 110); c.lineTo(X + 13, Y - 74); c.moveTo(X + 12, Y - 110); c.lineTo(X - 13, Y - 74); c.stroke();
  c.fillStyle = U.facing; c.fillRect(X - 15, Y - 113, 30, 5);
  if (back) { // knapsack with rolled greatcoat
    c.fillStyle = '#7a5a36'; c.strokeStyle = ink; c.lineWidth = 2.5; K_rr(c, X - 13, Y - 108, 26, 26, 4); c.fill(); c.stroke();
    c.fillStyle = '#8b8f99'; K_rr(c, X - 15, Y - 115, 30, 8, 4); c.fill(); c.stroke();
  }
  leg(sw, true);
  // arm holding the musket butt
  c.strokeStyle = ink; c.lineWidth = 12; c.beginPath(); c.moveTo(X - 2, Y - 106); c.lineTo(X - 9, Y - 88); c.lineTo(X - 5, Y - 80); c.stroke();
  c.strokeStyle = U.coat; c.lineWidth = 8; c.stroke();
  // head + shako + plume
  c.fillStyle = back ? '#3a2a1e' : '#e2b993'; c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.arc(X + 1, Y - 124, 10, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = U.shako; c.beginPath(); c.moveTo(X - 10, Y - 130); c.lineTo(X + 12, Y - 130); c.lineTo(X + 13, Y - 156); c.lineTo(X - 11, Y - 156); c.closePath(); c.fill();
  if (!back) { c.fillStyle = U.plate; c.fillRect(X - 3, Y - 146, 7, 8); }
  c.fillStyle = U.plume; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.ellipse(X + 1, Y - 163, 5, 8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = ink; c.fillRect(X - 13, Y - 132, 26, 3.5); // visor
  c.restore();
}
function K_rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function soldierSprite(nation, frame, standing, back) {
  const key = nation + frame + (standing ? 's' : '') + (back ? 'b' : '');
  if (SPRITES.has(key)) return SPRITES.get(key);
  const c = document.createElement('canvas'); c.width = 240; c.height = 420;
  const x = c.getContext('2d'); x.scale(2, 2);
  drawSoldier(x, 1, UNIFORMS[nation], (frame / 8) * Math.PI * 2, standing, back);
  SPRITES.set(key, c);
  return c;
}
// one figure; (x, y) = feet; h = figure height in px; dir = +1 facing right, -1 left
export function soldier(g, x, y, h, o = {}) {
  const { nation = 'fr', t = 0, alpha = 1, dir = 1, standing = false, speed = 1.8, seed = 0, shadow = true, back = false } = o;
  if (alpha <= 0.01 || h < 3) return;
  const frame = standing ? 0 : Math.floor(((t * speed + seed * 0.37) % 1 + 1) % 1 * 8);
  const spr = soldierSprite(nation, frame, standing, back);
  const s = h / 200, w = 120 * s, hh = 210 * s;
  g.save(); g.globalAlpha *= alpha;
  if (shadow) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(x, y, 14 * s * 1.6, 5 * s * 1.6, 0, 0, Math.PI * 2); g.fill(); }
  g.translate(x, y); g.scale(dir, 1);
  g.drawImage(spr, -60 * s, -200 * s, w, hh);
  g.restore();
}
// flag on a pole carried at the front (waving tricolour etc.)
export function standard(g, x, y, h, img, t, o = {}) {
  const { alpha = 1, dir = 1 } = o;
  if (alpha <= 0.01) return;
  const top = y - h, fw = h * 0.62, fh = h * 0.44;
  g.save(); g.globalAlpha *= alpha; g.lineCap = 'round';
  g.strokeStyle = 'rgba(10,10,14,0.95)'; g.lineWidth = Math.max(3, h * 0.05); g.beginPath(); g.moveTo(x, y); g.lineTo(x, top - h * 0.06); g.stroke();
  g.strokeStyle = '#8a6a3a'; g.lineWidth = Math.max(1.6, h * 0.025); g.stroke();
  g.fillStyle = '#d9b44a'; g.beginPath(); g.arc(x, top - h * 0.07, h * 0.035, 0, Math.PI * 2); g.fill();
  const strips = 16, iw = img.width, ih = img.height;
  for (let i = 0; i < strips; i++) {
    const u = i / strips, dx = dir * fw * u, wave = Math.sin(t * 6 - u * 5) * fh * 0.12 * u;
    const sx = dir > 0 ? iw * u : iw * (1 - u - 1 / strips);
    g.drawImage(img, sx, 0, iw / strips + 1, ih, x + (dir > 0 ? dx : dx - fw / strips), top + wave, fw / strips + 0.8, fh);
    const sh = 0.16 * Math.sin(t * 6 - u * 5 + 1.2) * u;
    g.fillStyle = sh > 0 ? `rgba(255,255,255,${sh})` : `rgba(0,0,0,${-sh})`;
    g.fillRect(x + (dir > 0 ? dx : dx - fw / strips), top + wave, fw / strips + 0.8, fh);
  }
  g.restore();
}

// ---------- fire seen from above: glow + flicker + embers + a smoke plume drifting downwind ----------
export function burnSpot(g, x, y, t, o = {}) {
  const { scale = 1, alpha = 1, seed = 1, wind = [1, -0.35], smoke = 1, heat = 1 } = o;
  if (alpha <= 0.01 || scale <= 0.02) return;
  g.save();
  // smoke plume: soft dark puffs that grow and drift downwind, rising toward the camera (up the screen)
  for (let i = 0; i < 14; i++) {
    const life = 5.0, ph = ((t + hash2(i, seed) * life) % life) / life;
    const d = ph * 150 * scale;
    const sx = x + wind[0] * d + (noise1(t * 0.4 + i, seed) - 0.5) * 18 * scale;
    const sy = y + wind[1] * d - ph * 40 * scale;
    const r = (9 + 42 * Math.sqrt(ph)) * scale;
    const a = 0.34 * smooth(ph * 6) * (1 - ph) * smoke * alpha;
    const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
    gr.addColorStop(0, `rgba(46,42,40,${a})`); gr.addColorStop(0.6, `rgba(52,48,46,${a * 0.55})`); gr.addColorStop(1, 'rgba(52,48,46,0)');
    g.fillStyle = gr; g.fillRect(sx - r, sy - r, 2 * r, 2 * r);
  }
  g.globalCompositeOperation = 'lighter';
  const fl = 0.78 + 0.22 * noise1(t * 6 + seed, seed) + 0.1 * Math.sin(t * 23 + seed);
  for (const [R, c, a] of [[70, '255,110,30', 0.22], [30, '255,150,50', 0.5], [12, '255,230,170', 0.75]]) {
    const r = R * scale * (0.9 + 0.1 * fl);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${c},${a * fl * heat * alpha})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 10; i++) {
    const life = 1.6, ph = ((t + hash2(i, seed + 9) * life) % life) / life;
    const ex = x + (hash2(i, seed + 10) - 0.5) * 22 * scale + wind[0] * ph * 40 * scale;
    const ey = y - ph * 50 * scale + wind[1] * ph * 20 * scale;
    g.fillStyle = `rgba(255,${170 + Math.round(70 * hash2(i, seed))},90,${(1 - ph) * alpha * heat})`;
    g.fillRect(ex, ey, 2.2 * scale + 0.6, 2.2 * scale + 0.6);
  }
  g.restore();
}

// ---------- texture-based fire & smoke (organic shapes instead of circles) ----------
function fbmCanvas(size, seed, cell, oct, map) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'), im = x.createImageData(size, size);
  const val = (ix, iy, s, per) => hash2(((ix % per) + per) % per * 7919 + ((iy % per) + per) % per, s);
  const vn = (px, py, sc, s) => {
    const per = Math.round(size / sc), fx = px / sc, fy = py / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return lerp(lerp(val(ix, iy, s, per), val(ix + 1, iy, s, per), sx), lerp(val(ix, iy + 1, s, per), val(ix + 1, iy + 1, s, per), sx), sy);
  };
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    let n = 0, amp = 0.5, sc = cell, tot = 0;
    for (let o = 0; o < oct; o++) { n += amp * vn(px, py, sc, seed + o); tot += amp; amp *= 0.5; sc /= 2; }
    const [r, gg, b, a] = map(n / tot, px / size, py / size);
    const i = (py * size + px) * 4; im.data[i] = r; im.data[i + 1] = gg; im.data[i + 2] = b; im.data[i + 3] = a;
  }
  x.putImageData(im, 0, 0);
  return c;
}
let FIRE_TEX = null, SMOKE_TEX = null;
function fireTextures() {
  if (FIRE_TEX) return;
  // burning ground: tileable noise thresholded into irregular hot patches (red -> orange -> yellow-white)
  FIRE_TEX = [0, 1].map(k => fbmCanvas(256, 40 + k * 7, 64, 5, n => {
    const v = clamp((n - 0.43) / 0.24);
    if (v <= 0) return [0, 0, 0, 0];
    return [255, Math.round(60 + 170 * v), Math.round(20 + 140 * v * v), Math.round(255 * Math.min(1, v * 1.6))];
  }));
  // smoke puff: fbm with a soft round falloff
  SMOKE_TEX = fbmCanvas(192, 77, 48, 5, (n, u, v) => {
    const d = Math.hypot(u - 0.5, v - 0.5) * 2, fall = clamp(1 - d) ** 1.6;
    const a = clamp((n - 0.28) / 0.5) * fall;
    return [255, 255, 255, Math.round(255 * a)];
  });
}
// city/area fire: quad = projected [nw, ne, sw] corners of the burning area; spread in [0,1] grows it from the centre
export function areaFire(g, quad, t, o = {}) {
  const { alpha = 1, spread = 1, wind = [-1, -0.3], night = 1, seed = 0, smoke = 1 } = o;
  if (alpha <= 0.01 || spread <= 0.01) return;
  fireTextures();
  const [nw, ne, sw] = quad;
  const ax = (ne[0] - nw[0]), ay = (ne[1] - nw[1]), bx = (sw[0] - nw[0]), by = (sw[1] - nw[1]);
  const cx = nw[0] + (ax + bx) / 2, cy = nw[1] + (ay + by) / 2, R = Math.hypot(ax, ay) / 2;
  // smoke first: dark plumes, lit orange from below near the fire at night
  g.save();
  for (let i = 0; i < 20; i++) {
    const life = 7, ph = ((t * 0.9 + hash2(i, seed + 3) * life) % life) / life;
    const ox = (hash2(i, seed + 4) - 0.5) * 1.2 * R * spread, oy = (hash2(i, seed + 5) - 0.5) * 0.6 * R * spread;
    const d = ph * R * 2.8;
    const sx = cx + ox + wind[0] * d, sy = cy + oy + wind[1] * d - ph * R * 0.6;
    const sz = R * (0.5 + 1.4 * Math.sqrt(ph)) * (0.6 + 0.4 * spread);
    const a = 0.7 * smooth(ph * 5) * (1 - ph) * smoke * alpha;
    g.save(); g.translate(sx, sy); g.rotate(hash2(i, seed + 6) * 6.28 + t * 0.05);
    g.globalAlpha = a; g.filter = 'brightness(0.22)'; g.drawImage(SMOKE_TEX, -sz / 2, -sz / 2, sz, sz);
    const lit = night * (1 - ph) ** 2;
    if (lit > 0.02) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * lit * 0.55; g.filter = 'sepia(1) saturate(4) hue-rotate(-12deg) brightness(0.8)'; g.drawImage(SMOKE_TEX, -sz / 2, -sz / 2, sz, sz); }
    g.restore();
  }
  g.restore();
  g.filter = 'none';
  // burning patches mapped onto the area (affine), two drifting layers, soft round edge that grows with spread
  const bw = Math.ceil(R * 2.4), bh = bw;
  const buf = document.createElement('canvas'); buf.width = bw; buf.height = bh;
  const bx2 = buf.getContext('2d');
  for (let k = 0; k < 2; k++) {
    const fl = 0.75 + 0.25 * noise1(t * 5 + k * 3, seed + k);
    bx2.save();
    bx2.setTransform(ax / 256, ay / 256, bx / 256, by / 256, nw[0] - (cx - bw / 2), nw[1] - (cy - bh / 2));
    const off = (t * 9 * (k ? -1 : 1)) % 256;
    bx2.globalAlpha = fl * (k ? 0.85 : 1); bx2.globalCompositeOperation = 'lighter';
    for (const dx of [-256, 0, 256]) bx2.drawImage(FIRE_TEX[k], off + dx, k ? off * 0.5 : 0, 256, 256);
    bx2.restore();
  }
  const mr = R * 1.3 * Math.max(0.08, spread);
  const mask = bx2.createRadialGradient(bw / 2, bh / 2, mr * 0.35, bw / 2, bh / 2, mr);
  mask.addColorStop(0, 'rgba(0,0,0,1)'); mask.addColorStop(1, 'rgba(0,0,0,0)');
  bx2.globalCompositeOperation = 'destination-in'; bx2.fillStyle = mask; bx2.fillRect(0, 0, bw, bh);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = alpha;
  g.drawImage(buf, cx - bw / 2, cy - bh / 2); g.globalAlpha = alpha * 0.3; g.drawImage(buf, cx - bw / 2, cy - bh / 2);
  const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 2.2 * (0.4 + 0.6 * spread));
  gl.addColorStop(0, `rgba(255,120,40,${0.35 * alpha})`); gl.addColorStop(1, 'rgba(255,80,20,0)');
  g.globalAlpha = 1; g.fillStyle = gl; g.fillRect(cx - R * 2.5, cy - R * 2.5, R * 5, R * 5);
  for (let i = 0; i < 26; i++) { // embers lifting downwind
    const life = 2.4, ph = ((t + hash2(i, seed + 9) * life) % life) / life;
    const ex = cx + (hash2(i, seed + 10) - 0.5) * R * 1.6 * spread + wind[0] * ph * R * 0.8;
    const ey = cy + (hash2(i, seed + 11) - 0.5) * R * 0.8 * spread - ph * R * 0.7;
    g.fillStyle = `rgba(255,${180 + Math.round(60 * hash2(i, seed))},100,${(1 - ph) * alpha * (0.5 + 0.5 * Math.sin(t * 17 + i))})`;
    g.fillRect(ex, ey, 2.4, 2.4);
  }
  g.restore();
}
