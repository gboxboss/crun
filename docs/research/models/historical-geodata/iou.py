import json
from shapely.geometry import shape
from shapely.ops import unary_union
from shapely.validation import make_valid
from pyproj import Transformer
from shapely.ops import transform
tr=Transformer.from_crs(4326,6933,always_xy=True).transform
clio=json.load(open('cliopatria/cliopatria_polities_only.geojson'))['features']
def cgeom(name,year):
    gs=[make_valid(shape(f['geometry'])) for f in clio if f['properties']['Name']==name and f['properties']['FromYear']<=year<=f['properties']['ToYear'] and f['properties']['Type']=='POLITY']
    return unary_union(gs) if gs else None
cache={}
def ageom(fname,names):
    if fname not in cache: cache[fname]=json.load(open(f'historical-basemaps/geojson/{fname}.geojson'))['features']
    gs=[make_valid(shape(f['geometry'])) for f in cache[fname] if (f['properties'].get('NAME') in names) and f['geometry']]
    return unary_union(gs) if gs else None
pairs=[('Roman Empire',100,'world_100',['Roman Empire']),('Han Dynasty',100,'world_100',['Han']),('Parthian Empire',100,'world_100',['Parthian Empire']),('Kushan Empire',100,'world_100',['Kushan Empire']),
('Ilkhanate',1279,'world_1279',['Ilkhanate']),('Golden Horde',1300,'world_1300',['Khanate of the Golden Horde','Golden Horde']),('Mamluk Sultanate',1279,'world_1279',['Mamluke Sultanate']),
('Ottoman Empire',1600,'world_1600',['Ottoman Empire']),('Mughal Empire',1600,'world_1600',['Mughal Empire']),('Ming Dynasty',1600,'world_1600',['Ming Chinese Empire']),('Safavid Empire',1600,'world_1600',['Safavid Empire']),
('Ottoman Empire',1815,'world_1815',['Ottoman Empire']),('Russian Empire',1815,'world_1815',['Russian Empire']),('Kingdom of Prussia',1806,'world_1800',['Prussia']),('Austrian Empire',1815,'world_1815',['Austrian Empire']),
('German Empire',1914,'world_1914',['German Empire']),('Russian Empire',1914,'world_1914',['Russian Empire']),('Ottoman Empire',1914,'world_1914',['Ottoman Empire']),('Empire of Japan',1938,'world_1938',['Empire of Japan']),('Nazi Germany',1938,'world_1938',['Germany'])]
print(f"{'polity':22s} {'yr':>5s} {'A_clio':>9s} {'A_aour':>9s} {'IoU':>5s}")
for n,y,f,an in pairs:
    try:
        a=cgeom(n,y); b=ageom(f,an)
        if a is None or b is None: print(n,y,'missing', a is None, b is None); continue
        a=transform(tr,a); b=transform(tr,b)
        i=a.intersection(b).area; u=a.union(b).area
        print(f"{n:22s} {y:5d} {a.area/1e6:9.0f} {b.area/1e6:9.0f} {i/u:5.2f}")
    except Exception as e: print(n,y,'err',e)
