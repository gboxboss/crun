import pickle, pandas as pd, numpy as np
df=pd.DataFrame(pickle.load(open('rows.pkl','rb')))
print(df.Type.value_counts())
pol=df[df.Type=='POLITY']
print('distinct names', pol.Name.nunique(), 'all', df.Name.nunique())
print('year range', df.FromYear.min(), df.ToYear.max())
# timesteps: distinct FromYear values
fy=sorted(set(df.FromYear))
print('distinct FromYear breakpoints', len(fy))
bins=[-3400,-2000,-1000,-500,0,500,1000,1500,1700,1800,1900,1950,2025]
s=pd.Series(fy)
print(pd.cut(s,bins,right=False).value_counts().sort_index())
# region by centroid
def region(r):
    lo,la=r.lon,r.lat
    if lo is None: return 'none'
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
pol=pol.copy(); pol['region']=pol.apply(region,axis=1)
pol['span']=pol.ToYear-pol.FromYear+1
# polity-years per region per era: count distinct names active in era
eras=[(-3400,-1000),(-1000,-500),(-500,0),(0,500),(500,1000),(1000,1500),(1500,1800),(1800,1914),(1914,1945),(1945,2025)]
tab={}
for a,b in eras:
    sub=pol[(pol.FromYear<b)&(pol.ToYear>=a)]
    tab[f'{a}..{b}']=sub.groupby('region').Name.nunique()
t=pd.DataFrame(tab).fillna(0).astype(int)
print(t.to_string())
pickle.dump(pol, open('pol.pkl','wb'))
