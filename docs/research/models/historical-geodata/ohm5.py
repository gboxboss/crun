import pickle, re, pandas as pd, collections, json
d=pickle.load(open('ohm_rels_loc.pkl','rb'))
def yr(s):
    if not s: return None
    m=re.match(r'^\s*(-?)(\d{1,4})',s)
    if not m: return None
    y=int(m.group(2)); return -y if m.group(1) else y
rows=[]
for r in d['rels']:
    t=r['tags']; s=yr(t.get('start_date')); e=yr(t.get('end_date'))
    rows.append(dict(id=r['id'],lvl=t.get('admin_level'),name=t.get('name:en') or t.get('name'),wd=t.get('wikidata'),s=s,e=e if e is not None else 2026,lon=r['loc'][0] if r.get('loc') else None,lat=r['loc'][1] if r.get('loc') else None))
o=pd.DataFrame(rows)
o.to_pickle('ohm_df.pkl')
o2=o[o.lvl.isin(['1','2'])].dropna(subset=['s'])
print('admin1-2 with dates', len(o2), 'with loc', o2.lon.notna().sum())
def region(lo,la):
    if lo is None or pd.isna(lo): return 'none'
    if -25<=lo<=45 and la>=35: return 'Europe'
    if 25<=lo<=63 and 12<=la<35: return 'NearEast/MENA-east'
    if -20<=lo<25 and 15<=la<37: return 'N.Africa'
    if -20<=lo<=55 and la<15: return 'SubSaharanAfrica'
    if 45<lo<=90 and la>=35: return 'CentralAsia/Steppe'
    if 63<lo<=92 and la<35: return 'SouthAsia'
    if 92<lo<=150 and la>=18: return 'EastAsia'
    if 92<lo<=160 and la<18: return 'SE Asia/Oceania'
    if lo>90 and la>=35: return 'EastAsia'
    if lo< -30 and la>=13: return 'N.America/Mesoamerica'
    if lo< -30 and la<13: return 'S.America'
    return 'other'
o2=o2.copy(); o2['region']=[region(a,b) for a,b in zip(o2.lon,o2.lat)]
eras=[(-3400,-1000),(-1000,-500),(-500,0),(0,500),(500,1000),(1000,1500),(1500,1800),(1800,1914),(1914,1945),(1945,2026)]
tab={}
for a,b in eras:
    sub=o2[(o2.s<b)&(o2.e>=a)]
    tab[f'{a}..{b}']=sub.groupby('region').apply(lambda x: x.wd.fillna(x.name).nunique())
t=pd.DataFrame(tab).fillna(0).astype(int); print(t.to_string())
print('relations (snapshots) per era:', {f'{a}..{b}': int(((o2.s<b)&(o2.e>=a)).sum()) for a,b in eras})
