"""Flatten sea-floor relief in Terrarium tiles (elevation < 0 m -> 0 m) and write a flat fallback tile.

Map styles here shade land relief only; bathymetry would show through gaps in ocean polygons.
Usage: python3 tools/flatten_dem.py www/assets/dem
"""
import os
import sys

import numpy as np
from PIL import Image

root = sys.argv[1]
flat = np.zeros((256, 256, 3), dtype=np.uint8)
flat[..., 0] = 128  # terrarium: (R*256 + G + B/256) - 32768 = 0 m
Image.fromarray(flat).save(os.path.join(root, "flat.png"))
n = 0
for d, _, files in os.walk(root):
    for f in files:
        if not f.endswith(".png") or f == "flat.png":
            continue
        p = os.path.join(d, f)
        a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32)
        h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
        if (h < 0).any():
            h = np.maximum(h, 0) + 32768
            r = np.floor(h / 256)
            g = np.floor(h - r * 256)
            b = np.round((h - r * 256 - g) * 256).clip(0, 255)
            Image.fromarray(np.stack([r, g, b], -1).astype(np.uint8)).save(p)
            n += 1
print(f"flattened {n} tiles")
