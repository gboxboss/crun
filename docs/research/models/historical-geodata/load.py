import json, pickle
from shapely.geometry import shape
d=json.load(open('cliopatria_polities_only.geojson'))
rows=[]
for f in d['features']:
    p=f['properties']; g=shape(f['geometry']) if f['geometry'] else None
    c=g.representative_point() if g is not None and not g.is_empty else None
    rows.append(dict(p, lon=c.x if c else None, lat=c.y if c else None, nverts=sum(len(pg.exterior.coords) for pg in getattr(g,'geoms',[g])) if g is not None and not g.is_empty else 0))
pickle.dump(rows, open('../rows.pkl','wb'))
print(len(rows)); print(rows[0].keys())
