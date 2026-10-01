"""Build a Web-Mercator XYZ satellite tile pyramid for a region (512 px JPEG tiles).

Each tile composites, coarse to fine:
  - NASA Blue Marble (public domain), the global base (www/assets/sat/world.jpg, from build_satellite.py);
  - ESA WorldCover Sentinel-2 RGBNIR 2021 composite levels (CC BY 4.0) at increasing pixels/degree.
Water (NDWI) is replaced by a flat ocean colour that keeps a little of the original texture.

Usage: python3 tools/build_sat_tiles.py <preset> <out_dir>      e.g.  europe1812 www/assets/sat/europe1812
"""
import math
import os
import sys
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from build_satellite import MAXLAT, list_tiles, read_tile, tile_name  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
OCEAN = np.array([29, 86, 116], np.float32)

PRESETS = {
    # name: levels (west, south, east, north, px/deg, zooms covered)
    "europe1812": [
        (-12, 34, 62, 66, 40, range(2, 6)),
        (18, 50, 42, 60, 160, range(6, 8)),
        (22, 53, 39, 57, 750, range(8, 10)),
        (35, 55, 38, 56, 3000, range(10, 12)),  # Borodino + Moscow close-ups
    ],
}


def merc_y(lat):
    lat = max(-MAXLAT, min(MAXLAT, lat))
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def grade(a):
    r, g, b, nir = a
    valid = (r + g + b) > 0
    ndwi = (g - nir) / np.maximum(g + nir, 1)
    water = valid & (ndwi > 0.02)
    rgb = np.stack([r, g, b], -1) / 10000.0
    rgb = np.clip(rgb * 3.0, 0, 1) ** (1 / 1.45)
    lum = rgb.mean(-1, keepdims=True)
    rgb = np.clip(lum + (rgb - lum) * 1.25, 0, 1) * 255
    rgb[water] = OCEAN * 0.85 + rgb[water] * 0.15
    alpha = valid.astype(np.float32) * 255
    return np.concatenate([rgb, alpha[..., None]], -1).astype(np.uint8)


def build_level(west, south, east, north, ppd, existing):
    W, H = (east - west) * ppd, (north - south) * ppd
    canvas = np.zeros((H, W, 4), np.uint8)
    jobs = [(lat, lon, tile_name(lat, lon)) for lat in range(south, north) for lon in range(west, east)]
    jobs = [j for j in jobs if j[2] in existing]
    print(f"level {ppd} ppd: {len(jobs)} tiles -> {W}x{H}", flush=True)

    def work(job):
        lat, lon, key = job
        for attempt in range(3):
            try:
                return lat, lon, grade(read_tile(key, ppd))
            except Exception as e:  # noqa: BLE001
                err = e
        print("fail", key, err, flush=True)
        return lat, lon, None

    with ThreadPoolExecutor(24) as ex:
        for lat, lon, rgba in ex.map(work, jobs):
            if rgba is not None:
                y, x = (north - (lat + 1)) * ppd, (lon - west) * ppd
                canvas[y:y + ppd, x:x + ppd] = rgba
    # open sea inside the level has no Sentinel tiles: paint it ocean
    nodata = canvas[..., 3] == 0
    canvas[nodata, :3] = OCEAN.astype(np.uint8)
    canvas[nodata, 3] = 255 if ppd <= 40 else 0
    # reproject rows to mercator with square pixels
    ym0, ym1 = merc_y(north), merc_y(south)
    out_h = int(round(W * (ym0 - ym1) / math.radians(east - west)))
    ys = ym0 - (np.arange(out_h) + 0.5) / out_h * (ym0 - ym1)
    lats = np.degrees(2 * np.arctan(np.exp(ys)) - np.pi / 2)
    src = np.clip((north - lats) / (north - south) * H - 0.5, 0, H - 1)
    merc = np.empty((out_h, W, 4), np.uint8)
    for s in range(0, out_h, 512):
        e = min(out_h, s + 512)
        i0 = np.floor(src[s:e]).astype(int)
        i1 = np.minimum(i0 + 1, H - 1)
        f = (src[s:e] - i0)[:, None, None]
        merc[s:e] = (canvas[i0] * (1 - f) + canvas[i1] * f).astype(np.uint8)
    del canvas
    # feather the edges so finer levels blend into coarser ones
    if ppd > 40:
        fx = np.clip(np.minimum(np.arange(W), np.arange(W)[::-1]) / (W * 0.03), 0, 1)
        fy = np.clip(np.minimum(np.arange(out_h), np.arange(out_h)[::-1]) / (out_h * 0.03), 0, 1)
        for s in range(0, out_h, 1024):
            e = min(out_h, s + 1024)
            merc[s:e, :, 3] = (merc[s:e, :, 3] * np.minimum(fy[s:e, None], fx[None, :])).astype(np.uint8)
    img = Image.fromarray(merc, "RGBA")
    # mercator bounds in normalized world units [0,1]
    nx0, nx1 = (west + 180) / 360, (east + 180) / 360
    ny0, ny1 = (1 - ym0 / math.pi) / 2, (1 - ym1 / math.pi) / 2
    return {"img": img, "b": (nx0, ny0, nx1, ny1), "ppd": ppd}


def render_tile(levels, z, x, y):
    n = 2 ** z
    tb = (x / n, y / n, (x + 1) / n, (y + 1) / n)
    out = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
    for L in levels:
        b, img = L["b"], L["img"]
        ix0, iy0, ix1, iy1 = max(tb[0], b[0]), max(tb[1], b[1]), min(tb[2], b[2]), min(tb[3], b[3])
        if ix1 <= ix0 or iy1 <= iy0:
            continue
        sx, sy = img.width / (b[2] - b[0]), img.height / (b[3] - b[1])
        box = ((ix0 - b[0]) * sx, (iy0 - b[1]) * sy, (ix1 - b[0]) * sx, (iy1 - b[1]) * sy)
        px0, py0 = round((ix0 - tb[0]) * n * 512), round((iy0 - tb[1]) * n * 512)
        px1, py1 = round((ix1 - tb[0]) * n * 512), round((iy1 - tb[1]) * n * 512)
        if px1 - px0 < 1 or py1 - py0 < 1:
            continue
        part = img.resize((px1 - px0, py1 - py0), Image.BILINEAR if (box[2] - box[0]) < (px1 - px0) else Image.LANCZOS, box=box)
        out.alpha_composite(part, (px0, py0))
    return out.convert("RGB")


def main():
    preset, out_dir = sys.argv[1], sys.argv[2]
    spec = PRESETS[preset]
    os.makedirs(out_dir, exist_ok=True)
    world = Image.open(os.path.join(os.path.dirname(out_dir.rstrip("/")), "world.jpg")).convert("RGBA")
    levels = [{"img": world, "b": (0.0, 0.0, 1.0, 1.0), "ppd": world.width / 360}]
    lat_lo, lat_hi = min(s[1] for s in spec), max(s[3] for s in spec)
    existing = list_tiles(lat_lo, lat_hi)
    print(f"{len(existing)} Sentinel-2 tiles listed", flush=True)
    for (w, s, e, nn, ppd, zooms) in spec:
        L = build_level(w, s, e, nn, ppd, existing)
        L["zooms"] = zooms
        levels.append(L)
    jobs = []
    for L in levels[1:]:
        b = L["b"]
        for z in L["zooms"]:
            n = 2 ** z
            for x in range(int(b[0] * n), int(math.ceil(b[2] * n))):
                for y in range(int(b[1] * n), int(math.ceil(b[3] * n))):
                    jobs.append((z, x, y))
    jobs = sorted(set(jobs))
    print(f"{len(jobs)} tiles to write", flush=True)

    def write(job):
        z, x, y = job
        p = os.path.join(out_dir, str(z), str(x))
        os.makedirs(p, exist_ok=True)
        render_tile(levels, z, x, y).save(os.path.join(p, f"{y}.jpg"), quality=88)

    with ThreadPoolExecutor(4) as ex:
        list(ex.map(write, jobs))
    print("done", flush=True)


if __name__ == "__main__":
    import urllib.parse  # noqa: F401  (used by list_tiles)
    main()
