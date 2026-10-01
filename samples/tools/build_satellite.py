"""Build satellite imagery for the "Orbital Satellite" look.

Sources (both free for commercial use):
  - NASA Blue Marble (public domain), low-res global base, via the three-globe example image mirror.
  - ESA WorldCover Sentinel-2 RGBNIR annual composite 2021 (CC BY 4.0), read as overviews from the
    cloud-optimized GeoTIFFs on AWS Open Data. Water is made transparent (NDWI) so the base ocean shows.

Outputs Web-Mercator images + bounds for MapLibre image sources:
  www/assets/sat/world.jpg, <name>.png, sat.json

Usage: python3 tools/build_satellite.py www/assets/sat
"""
import io
import json
import math
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import rasterio
from PIL import Image

os.environ.setdefault("CURL_CA_BUNDLE", "/root/.ccr/ca-bundle.crt")
os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
BUCKET = "https://esa-worldcover-s2.s3.eu-central-1.amazonaws.com"
MAXLAT = 85.05112878

REGIONS = [  # name, west, south, east, north, pixels per degree
    ("gulf_mid", 32, 6, 70, 42, 96),
    ("gulf_fine", 47, 22, 60, 31, 375),
]


def merc_y(lat):
    lat = max(-MAXLAT, min(MAXLAT, lat))
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def to_mercator(img, west, south, east, north):
    """Reproject an equirectangular array (H, W, C) to Web Mercator with square pixels."""
    h, w = img.shape[:2]
    lon_span = math.radians(east - west)
    y0, y1 = merc_y(north), merc_y(south)
    out_h = int(round(w * (y0 - y1) / lon_span))
    ys = y0 - (np.arange(out_h) + 0.5) / out_h * (y0 - y1)
    lats = np.degrees(2 * np.arctan(np.exp(ys)) - np.pi / 2)
    src = (north - lats) / (north - south) * h - 0.5
    src = np.clip(src, 0, h - 1)
    i0 = np.floor(src).astype(int)
    i1 = np.minimum(i0 + 1, h - 1)
    f = (src - i0)[:, None, None]
    return (img[i0] * (1 - f) + img[i1] * f).astype(img.dtype)


def list_tiles(lat_lo, lat_hi):
    keys = set()
    for lat in range(lat_lo, lat_hi):
        prefix = f"rgbnir/2021/{'N' if lat >= 0 else 'S'}{abs(lat):02d}/"
        token = None
        while True:
            url = f"{BUCKET}/?list-type=2&prefix={prefix}" + (f"&continuation-token={urllib.parse.quote(token)}" if token else "")
            xml = urllib.request.urlopen(url).read().decode()
            import re
            keys.update(re.findall(r"<Key>([^<]+\.tif)</Key>", xml))
            m = re.search(r"<NextContinuationToken>([^<]+)</NextContinuationToken>", xml)
            if not m:
                break
            token = m.group(1)
    return keys


def tile_name(lat, lon):
    return f"rgbnir/2021/{'N' if lat >= 0 else 'S'}{abs(lat):02d}/ESA_WorldCover_10m_2021_v200_{'N' if lat >= 0 else 'S'}{abs(lat):02d}{'E' if lon >= 0 else 'W'}{abs(lon):03d}_S2RGBNIR.tif"


def read_tile(key, ppd):
    with rasterio.open("/vsicurl/" + BUCKET + "/" + key) as ds:
        a = ds.read(out_shape=(4, ppd, ppd), resampling=rasterio.enums.Resampling.average)
    return a.astype(np.float32)


def grade(a):
    """Reflectance (x10000) RGBNIR -> RGBA uint8 with water transparent."""
    r, g, b, nir = a
    valid = (r + g + b) > 0
    ndwi = (g - nir) / np.maximum(g + nir, 1)
    water = ndwi > 0.02
    rgb = np.stack([r, g, b], -1) / 10000.0
    rgb = np.clip(rgb * 3.0, 0, 1) ** (1 / 1.45)
    lum = rgb.mean(-1, keepdims=True)
    rgb = np.clip(lum + (rgb - lum) * 1.25, 0, 1)
    alpha = (valid & ~water).astype(np.float32)
    return np.concatenate([rgb * 255, alpha[..., None] * 255], -1).astype(np.uint8)


def build_region(name, west, south, east, north, ppd, out_dir, existing):
    W, H = (east - west) * ppd, (north - south) * ppd
    canvas = np.zeros((H, W, 4), dtype=np.uint8)
    jobs = []
    for lat in range(south, north):
        for lon in range(west, east):
            key = tile_name(lat, lon)
            if key in existing:
                jobs.append((lat, lon, key))
    print(f"{name}: {len(jobs)} tiles at {ppd} px/deg")

    def work(job):
        lat, lon, key = job
        try:
            return lat, lon, grade(read_tile(key, ppd))
        except Exception as e:  # noqa: BLE001
            print("fail", key, e)
            return lat, lon, None

    with ThreadPoolExecutor(16) as ex:
        for lat, lon, rgba in ex.map(work, jobs):
            if rgba is None:
                continue
            y = (north - (lat + 1)) * ppd
            x = (lon - west) * ppd
            canvas[y:y + ppd, x:x + ppd] = rgba
    merc = to_mercator(canvas.astype(np.float32), west, south, east, north).astype(np.uint8)
    # feather the region edges so it blends into the global base
    h, w = merc.shape[:2]
    fx = np.minimum(np.arange(w), np.arange(w)[::-1]) / max(1, w * 0.04)
    fy = np.minimum(np.arange(h), np.arange(h)[::-1]) / max(1, h * 0.04)
    feather = np.clip(np.minimum(fy[:, None], fx[None, :]), 0, 1)
    merc[..., 3] = (merc[..., 3] * feather).astype(np.uint8)
    Image.fromarray(merc, "RGBA").save(os.path.join(out_dir, f"{name}.png"), optimize=True)
    return [[west, north], [east, north], [east, south], [west, south]]


def build_world(out_dir):
    url = "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg"
    img = np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert("RGB")).astype(np.float32)
    # crop to the Web Mercator latitude range, then reproject
    h = img.shape[0]
    top = int((90 - MAXLAT) / 180 * h)
    img = img[top:h - top]
    merc = to_mercator(img, -180, -MAXLAT, 180, MAXLAT)
    Image.fromarray(np.clip(merc, 0, 255).astype(np.uint8)).resize((4096, 4096), Image.LANCZOS).save(os.path.join(out_dir, "world.jpg"), quality=92)
    return [[-180, MAXLAT], [180, MAXLAT], [180, -MAXLAT], [-180, -MAXLAT]]


def main():
    import urllib.parse  # noqa: F401
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    meta = {"world": build_world(out_dir)}
    lat_lo = min(r[2] for r in REGIONS)
    lat_hi = max(r[4] for r in REGIONS)
    existing = list_tiles(lat_lo, lat_hi)
    print(f"{len(existing)} Sentinel-2 tiles listed")
    for name, w, s, e, n, ppd in REGIONS:
        meta[name] = build_region(name, w, s, e, n, ppd, out_dir, existing)
    json.dump(meta, open(os.path.join(out_dir, "sat.json"), "w"), indent=1)
    print("done")


if __name__ == "__main__":
    import urllib.parse
    main()
