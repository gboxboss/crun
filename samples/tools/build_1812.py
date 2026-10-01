"""Approximate 1812 blocs for the Napoleon sample, built from Natural Earth (public domain) modern borders.

  french: Napoleon's empire, client states and the allies that sent corps into Russia (Austria, Prussia)
  russia: the Russian Empire in Europe

Corrections to modern borders: Kaliningrad -> Prussia; Lithuania west of the Niemen (Sudovia) -> Duchy of
Warsaw; Austrian Galicia, Bukovina
and Transcarpathia in modern Ukraine -> Austria. Spain, Scandinavia and the Balkans are left out (not in either bloc).
Simplified: the small Bialystok district (Russian 1807-15) stays with Poland.
Also writes the key rivers (Natural Earth, plus a hand-traced Berezina and Moskva).

Usage: python3 tools/build_1812.py www/assets/data
"""
import json
import os
import sys

from shapely.geometry import LineString, MultiPolygon, Polygon, box, mapping, shape
from shapely.ops import unary_union

D = sys.argv[1]
countries = json.load(open(os.path.join(D, "ne_50m_admin_0_countries.geojson")))["features"]
rivers = json.load(open(os.path.join(D, "ne_10m_rivers_lake_centerlines.geojson")))["features"]
geo = {f["properties"]["ADM0_A3"]: shape(f["geometry"]).buffer(0) for f in countries}
EUROPE = box(-12, 34, 70, 72)

FRENCH = ["FRA", "BEL", "NLD", "LUX", "DEU", "CHE", "LIE", "ITA", "SMR", "VAT", "MCO", "AUT", "CZE", "SVK", "HUN", "SVN", "HRV", "POL"]
RUSSIA = ["RUS", "BLR", "LTU", "LVA", "EST", "FIN", "UKR", "MDA"]

# Neman from Grodno to the sea, closed round the south-west: Lithuania beyond it was Duchy of Warsaw
from shapely.ops import linemerge
parts = []
for f in rivers:
    if f["properties"].get("name") == "Neman":
        g = shape(f["geometry"])
        parts.extend(g.geoms if g.geom_type == "MultiLineString" else [g])
neman = linemerge(parts)
if neman.geom_type == "MultiLineString":
    neman = max(neman.geoms, key=lambda l: l.length)
coords = list(neman.coords)
if coords[0][0] < coords[-1][0]:
    coords = coords[::-1]  # flow order: from the east (source) to the sea
lower = [c for c in coords if c[0] < 23.95 and c[1] > 54.85]  # Kaunas -> sea (Natural Earth)
upper = [(23.83, 53.68), (23.98, 54.02), (24.18, 54.16), (24.05, 54.40), (24.03, 54.60), (23.95, 54.70), (23.92, 54.88)]  # Grodno -> Kaunas, traced
sudovia_cut = Polygon(upper + lower + [(20.0, 55.6), (20.0, 53.5), (23.83, 53.5)]).buffer(0)
bialystok = Polygon([(22.2, 54.4), (22.2, 53.1), (22.6, 52.45), (23.2, 52.25), (24.2, 52.6), (24.2, 54.4)])
galicia = Polygon([(21.5, 47.3), (21.5, 50.75), (23.6, 50.55), (24.4, 50.5), (25.1, 50.3), (25.25, 49.6), (25.6, 49.0),
                   (26.4, 48.45), (26.9, 48.3), (26.6, 47.7), (24.5, 47.6)])

french = unary_union([geo[a] for a in FRENCH if a in geo])
russia = unary_union([geo[a] for a in RUSSIA if a in geo])
kalin = MultiPolygon([p for p in geo["RUS"].geoms if 19 < p.centroid.x < 23 and 54 < p.centroid.y < 56])
russia = russia.difference(kalin.buffer(0.01))
ltu = geo["LTU"]
sud = ltu.intersection(sudovia_cut)
gal = geo["UKR"].intersection(galicia)
french = unary_union([french, kalin, sud, gal])
russia = russia.difference(sud).difference(gal)
french = french.intersection(EUROPE).simplify(0.02, preserve_topology=True)
russia = russia.intersection(EUROPE).simplify(0.02, preserve_topology=True)


def polys(g):
    return [p for p in (g.geoms if g.geom_type == "MultiPolygon" else [g]) if p.area > 0.02]


out = {"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"bloc": "french"}, "geometry": mapping(MultiPolygon(polys(french)))},
    {"type": "Feature", "properties": {"bloc": "russia"}, "geometry": mapping(MultiPolygon(polys(russia)))},
]}
json.dump(out, open(os.path.join(D, "blocs1812.geojson"), "w"))

keep = {"Neman": "Niemen", "Daugava": "Dvina", "Dnepre": "Dnieper", "Dnipro": "Dnieper"}
rv = []
for f in rivers:
    n = f["properties"].get("name")
    if n in keep:
        rv.append({"type": "Feature", "properties": {"name": keep[n]}, "geometry": f["geometry"]})
rv.append({"type": "Feature", "properties": {"name": "Niemen"}, "geometry": mapping(LineString(upper))})
hand = {
    "Berezina": [(28.22, 54.95), (28.27, 54.70), (28.33, 54.48), (28.37, 54.34), (28.44, 54.28), (28.50, 54.22),
                 (28.60, 54.08), (28.78, 53.83), (28.98, 53.52), (29.15, 53.25), (29.22, 53.14)],
    "Moskva": [(35.25, 55.55), (35.70, 55.55), (36.05, 55.62), (36.45, 55.72), (36.80, 55.75), (37.20, 55.78),
               (37.42, 55.80), (37.55, 55.75), (37.62, 55.749), (37.70, 55.70), (37.85, 55.62), (38.10, 55.52), (38.45, 55.35)],
}
import math


def meander(c, amp=0.012, seed=1.0):
    """Densify a traced line and add gentle bends so it reads as a river, not a ruler line."""
    out = []
    for (x0, y0), (x1, y1) in zip(c, c[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(2, int(L / 0.004))
        nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        for k in range(n):
            u = k / n
            x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
            d = sum(math.sin((x * 37 + y * 53) * f + seed * f) / f for f in (1.0, 2.3, 5.1)) * amp
            out.append((x + nx * d, y + ny * d))
    out.append(c[-1])
    return out


for n, c in hand.items():
    rv.append({"type": "Feature", "properties": {"name": n}, "geometry": mapping(LineString(meander(c, seed=len(n))))})
json.dump({"type": "FeatureCollection", "features": rv}, open(os.path.join(D, "rivers1812.geojson"), "w"))
print("french", len(polys(french)), "polys; russia", len(polys(russia)), "polys; rivers", len(rv))
