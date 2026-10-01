import json
from shapely.geometry import shape, box
from shapely.ops import unary_union, transform
from shapely.validation import make_valid
from pyproj import Transformer
exec(open('recipes.py').read())
tr=Transformer.from_crs(4326,6933,always_xy=True).transform
a0={}; 
for f in json.load(open('ne_adm0.geojson'))['features']:
    a0.setdefault(f['properties']['ADM0_A3'],[]).append(make_valid(shape(f['geometry'])))
a1={}
for f in json.load(open('ne_adm1.geojson'))['features']:
    p=f['properties']; a1.setdefault(p['adm0_a3'],{}).setdefault(p['name'],[]).append(make_valid(shape(f['geometry'])))
missing=[]
def build(ops):
    parts=[]
    for op in ops:
        if op[0]=='C':
            g=unary_union(a0.get(op[1],[])); 
            if g.is_empty: missing.append(op[1])
            if op[2]: g=g.intersection(box(*op[2]))
        elif op[0]=='A':
            gs=[]
            for n in op[2]:
                if n in a1.get(op[1],{}): gs+=a1[op[1]][n]
                else: missing.append(op[1]+':'+n)
            g=unary_union(gs)
            if op[3]: g=g.intersection(box(*op[3]))
        elif op[0]=='X':
            g=unary_union(a0[op[1]]).difference(unary_union([x for n in op[2] for x in a1[op[1]].get(n,[])]))
        parts.append(g)
    return unary_union(parts)
clio=json.load(open('cliopatria/cliopatria_polities_only.geojson'))['features']
def cgeom(name,year):
    gs=[make_valid(shape(f['geometry'])) for f in clio if f['properties']['Name']==name and f['properties']['FromYear']<=year<=f['properties']['ToYear'] and f['properties']['Type']=='POLITY']
    return unary_union(gs) if gs else None
def ageom(fname,name):
    gs=[make_valid(shape(f['geometry'])) for f in json.load(open(f'historical-basemaps/geojson/{fname}.geojson'))['features'] if f['properties'].get('NAME')==name and f['geometry']]
    return unary_union(gs) if gs else None
def iou(a,b):
    a=make_valid(transform(tr,a)).buffer(0); b=make_valid(transform(tr,b)).buffer(0); return a.intersection(b).area/a.union(b).area, a.area/1e6, b.area/1e6
ref={"Roman Empire @116":("Roman Empire",("world_100","Roman Empire")),"Ottoman Empire @1683":("Ottoman Empire",("world_1700","Ottoman Empire")),
"Achaemenid Empire @-500":("Achaemenid Empire",("world_bc500","Achaemenid Empire")),"Han Dynasty @100":("Han Dynasty",("world_100","Han")),
"Mughal Empire @1700":("Mughal Empire",("world_1700","Mughal Empire")),"First French Empire @1812":("First French Empire",None),
"Inca Empire @1525":("Inca Empire",("world_1500","Inca Empire")),"Umayyad Caliphate @740":("Umayyad Caliphate",("world_700","Umayyad Caliphate")),
"Mongol Empire @1259":("Mongol Empire",("world_1200","Mongol Empire")),"Byzantine Empire @1025":("Byzantine Empire",("world_1000","Byzantine Empire"))}
print(f"{'case':28s} {'IoU(recipe,Clio)':>16s} {'IoU(recipe,aour)':>16s} {'IoU(Clio,aour)':>14s} {'A_recipe':>9s} {'A_clio':>9s}")
for k,(yr,ops) in R.items():
    g=build(ops); cn,ar=ref[k]; c=cgeom(cn,yr)
    r1=iou(g,c) if c is not None else (float('nan'),0,0)
    if ar:
        a=ageom(*ar); r2=iou(g,a)[0] if a is not None else float('nan'); r3=iou(c,a)[0] if (a is not None and c is not None) else float('nan')
    else: r2=r3=float('nan')
    print(f"{k:28s} {r1[0]:16.2f} {r2:16.2f} {r3:14.2f} {r1[1]:9.0f} {r1[2]:9.0f}")
print('missing', missing)
