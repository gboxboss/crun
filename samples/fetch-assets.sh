#!/usr/bin/env bash
# Fetch the open assets the sample scenes use (not committed):
#   Natural Earth vectors (public domain), Terrarium elevation tiles from the AWS Open Data
#   registry (attribution: Mapzen/Tilezen sources), Google Fonts (SIL OFL), flag-icons (MIT),
#   MapLibre GL JS dist (BSD-3). Run `npm install` first.
set -euo pipefail
cd "$(dirname "$0")"
A=www/assets
mkdir -p $A/data $A/dem $A/fonts $A/flags www/lib

NE=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_10m_admin_0_countries ne_10m_land ne_10m_ocean ne_10m_lakes ne_10m_rivers_lake_centerlines ne_50m_land ne_50m_admin_0_countries; do
  [ -s "$A/data/$f.geojson" ] || curl -fsSL "$NE/$f.geojson" -o "$A/data/$f.geojson"
done

GF=https://raw.githubusercontent.com/google/fonts/main/ofl
fetch_font() { [ -s "$A/fonts/$2" ] || curl -fsSL "$GF/$1" -o "$A/fonts/$2"; }
fetch_font 'oswald/Oswald%5Bwght%5D.ttf' Oswald.ttf
fetch_font 'montserrat/Montserrat%5Bwght%5D.ttf' Montserrat.ttf
fetch_font 'inter/Inter%5Bopsz,wght%5D.ttf' Inter.ttf
fetch_font 'cinzel/Cinzel%5Bwght%5D.ttf' Cinzel.ttf
fetch_font 'cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf' Cormorant.ttf

FL=https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3
for c in sa iq kw qa ae ir om bh fr ru; do
  [ -s "$A/flags/$c.svg" ] || curl -fsSL "$FL/$c.svg" -o "$A/flags/$c.svg"
done

# Terrarium DEM tiles: world z0-4, plus the two scene areas up to z8
python3 - <<'EOF' > /tmp/dem_tiles.txt
import math
def tiles(z, w, s, e, n):
    def xy(lon, lat):
        x = (lon + 180) / 360 * 2**z
        y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * 2**z
        return int(x), int(y)
    x0, y0 = xy(w, n); x1, y1 = xy(e, s)
    for x in range(max(0, x0), min(2**z - 1, x1) + 1):
        for y in range(max(0, y0), min(2**z - 1, y1) + 1):
            print(f"{z}/{x}/{y}")
for z in range(0, 5): tiles(z, -180, -85, 180, 85)
for z in range(5, 9):
    tiles(z, 40, 16, 64, 34)   # Gulf / Strait of Hormuz
    tiles(z, 18, 49, 42, 60)   # Niemen to Moscow
EOF
grep -v '^$' /tmp/dem_tiles.txt | while read t; do
  [ -s "$A/dem/$t.png" ] || echo "$t"
done | xargs -P 16 -I{} sh -c 'mkdir -p "$(dirname "'$A'/dem/{}.png")" && curl -fsSL "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{}.png" -o "'$A'/dem/{}.png" || true'

cp node_modules/maplibre-gl/dist/maplibre-gl.mjs node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs \
   node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs node_modules/maplibre-gl/dist/maplibre-gl.css www/lib/
echo "assets ready: $(find $A/dem -name '*.png' | wc -l) DEM tiles"
python3 tools/flatten_dem.py $A/dem
# satellite base for the "Orbital Satellite" look (Blue Marble + Sentinel-2 mosaics, ~2-3 min)
[ -s $A/sat/sat.json ] || python3 tools/build_satellite.py $A/sat
# 1812 blocs + rivers, scene icons, Europe satellite pyramid (Napoleon sample, ~6 min)
python3 tools/build_1812.py $A/data
node tools/export_icons.mjs $A
[ -s $A/sat/europe1812/9/306/162.jpg ] || python3 tools/build_sat_tiles.py europe1812 $A/sat/europe1812
