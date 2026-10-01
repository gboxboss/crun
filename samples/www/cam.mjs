// Camera paths for map videos. Pure functions of time.
//   - "fly" moves follow the van Wijk & Nuij optimal zoom/pan path (the curve MapLibre's flyTo uses): zoom out,
//     glide, zoom in, with perceived speed kept even.
//   - "ease" moves interpolate center (in Mercator), zoom, pitch and bearing with a smooth ease.
//   - holds keep the shot alive with a slow, steady push-in and/or orbit instead of a wobble.
// keys: [{ t, center, zoom, pitch, bearing, push?, orbit? }, { t, dur, fly?, ease?, ... }, ...]
//   key.t = time the camera ARRIVES at the key; key.dur = how long the move into it takes (default: since previous).
//   push = zoom units per second during the hold after arriving; orbit = degrees per second during that hold.

const merc = ([lng, lat]) => [(lng + 180) / 360, 0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI)];
const unmerc = ([x, y]) => [x * 360 - 180, (360 / Math.PI) * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, s) => a + (b - a) * s;
export const easeInOutQuint = x => { x = clamp(x); return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2; };
export const easeInOutSine = x => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
// cubic-bezier(0.45, 0, 0.2, 1): gentle start, long soft landing (the "cinematic" ease)
export function bezier(p1x, p1y, p2x, p2y) {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    x = clamp(x);
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; t -= e / d; }
    return sy(clamp(t));
  };
}
export const cinematic = bezier(0.45, 0, 0.2, 1);

// van Wijk & Nuij: returns s in [0,1] -> {center, zoom} between two views; W, H in px, tile size 512
function flyPath(a, b, W, H, rho = 1.35) {
  const z0 = a.zoom, z1 = b.zoom;
  const ws0 = 512 * 2 ** z0;
  const p0 = merc(a.center), p1 = merc(b.center);
  const dx = (p1[0] - p0[0]) * ws0, dy = (p1[1] - p0[1]) * ws0;
  const u1 = Math.hypot(dx, dy);
  const w0 = Math.max(W, H), w1 = w0 / 2 ** (z1 - z0);
  const rho2 = rho * rho;
  const r = i => {
    const b_ = (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho2 * rho2 * u1 * u1) / (2 * (i ? w1 : w0) * rho2 * u1);
    return Math.log(Math.sqrt(b_ * b_ + 1) - b_);
  };
  if (u1 < 1e-3) {
    const k = Math.abs(Math.log(w1 / w0)) / rho;
    const dir = w1 < w0 ? -1 : 1;
    return s => ({ center: a.center, zoom: z0 - Math.log2(Math.exp(dir * rho * k * s)) });
  }
  const r0 = r(0), r1 = r(1), S = (r1 - r0) / rho;
  const wAt = s => Math.cosh(r0) / Math.cosh(r0 + rho * s);
  const uAt = s => (w0 * ((Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0)) / rho2)) / u1;
  return k => {
    const s = k * S, u = k >= 1 ? 1 : uAt(s);
    const scale = k >= 1 ? 2 ** (z1 - z0) : 1 / wAt(s);
    return { center: unmerc([lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)]), zoom: z0 + Math.log2(scale) };
  };
}

export function cameraPath(keys, { W = 1920, H = 1080 } = {}) {
  const K = keys.map(k => ({ pitch: 0, bearing: 0, push: 0, orbit: 0, ...k }));
  for (let i = 1; i < K.length; i++) {
    const k = K[i];
    k.dur = Math.max(0.05, Math.min(k.dur ?? k.t - K[i - 1].t, k.t - K[i - 1].t));
  }
  // state while holding after key i (drifted by push/orbit)
  const hold = (i, t) => {
    const k = K[i], dt = Math.max(0, t - k.t);
    return { center: k.center, zoom: k.zoom + k.push * dt, pitch: k.pitch, bearing: k.bearing + k.orbit * dt };
  };
  const paths = K.map((k, i) => {
    if (i === 0) return null;
    const from = hold(i - 1, k.t - k.dur);
    return { from, fly: k.fly ? flyPath(from, k, W, H, k.rho ?? 1.35) : null, ease: k.ease || cinematic };
  });
  return t => {
    let i = 0;
    while (i < K.length - 1 && t >= K[i + 1].t - K[i + 1].dur) i++;
    // i = last key whose move has started (or the first key)
    if (i === 0 && t < (K[1] ? K[1].t - K[1].dur : Infinity)) return hold(0, t);
    const k = K[i];
    if (t >= k.t) return hold(i, t);
    const P = paths[i], s = P.ease((t - (k.t - k.dur)) / k.dur);
    let center, zoom;
    if (P.fly) ({ center, zoom } = P.fly(s));
    else {
      const a = merc(P.from.center), b = merc(k.center);
      center = unmerc([lerp(a[0], b[0], s), lerp(a[1], b[1], s)]);
      zoom = lerp(P.from.zoom, k.zoom, s);
    }
    let db = ((k.bearing - P.from.bearing + 540) % 360) - 180;
    return { center, zoom, pitch: lerp(P.from.pitch, k.pitch, s), bearing: P.from.bearing + db * s };
  };
}
