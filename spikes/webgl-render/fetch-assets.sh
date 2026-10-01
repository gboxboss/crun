#!/usr/bin/env bash
# Fetches the assets the spike page needs (they are not committed, to keep the repo small):
#   - Natural Earth GeoJSON layers (public domain)
#   - Noto Sans glyph PBFs from protomaps/basemaps-assets (SIL OFL)
#   - MapLibre GL JS dist files (BSD-3), copied from node_modules
# Run `npm install` first.
set -euo pipefail
cd "$(dirname "$0")"

NE=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
FONTS=https://raw.githubusercontent.com/protomaps/basemaps-assets/main/fonts

mkdir -p www/data www/lib www/fonts

for f in ne_10m_admin_0_countries ne_10m_admin_1_states_provinces_lines ne_10m_geography_marine_polys \
         ne_10m_lakes ne_10m_land ne_10m_populated_places_simple ne_10m_rivers_lake_centerlines \
         ne_50m_admin_0_countries ne_50m_ocean; do
  [ -f "www/data/$f.geojson" ] || curl -fsSL "$NE/$f.geojson" -o "www/data/$f.geojson"
done

for stack in "Noto Sans Regular" "Noto Sans Medium" "Noto Sans Italic"; do
  mkdir -p "www/fonts/$stack"
  enc=${stack// /%20}
  for start in $(seq 0 256 8192); do
    range="$start-$((start + 255))"
    [ -f "www/fonts/$stack/$range.pbf" ] || curl -fsSL "$FONTS/$enc/$range.pbf" -o "www/fonts/$stack/$range.pbf"
  done
done

cp node_modules/maplibre-gl/dist/maplibre-gl.mjs \
   node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs \
   node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs \
   node_modules/maplibre-gl/dist/maplibre-gl.css www/lib/

echo "assets ready"
