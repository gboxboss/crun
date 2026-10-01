import pickle, json, pandas as pd, numpy as np
exec(open('topics.py').read())
pol=pickle.load(open('pol.pkl','rb'))
wk=json.load(open('wd/apsisxcoder_wellknownable/public/data/wars.json'))['battles']
wk=pd.DataFrame([dict(y=b['year'],lon=b['coord']['lon'],lat=b['coord']['lat'],sl=b['sitelinks']) for b in wk if b.get('coord')])
cb=json.load(open('wd/ElvisNicolae_casus-bellli/data/battles.json'))
cb=pd.DataFrame([dict(y=b['date']['year'],lon=b['location']['lng'],lat=b['location']['lat']) for b in cb if b.get('location') and b['date'].get('year') is not None])
wa=pd.read_csv('Purcell-Analytics_war_atlas_data/battles.csv').rename(columns={'year':'y','lng':'lon'})
pl=pd.read_csv('pleiades.datasets/data/gis/places.csv')
def inbox(df,b,y0,y1):
    return df[(df.y>=y0)&(df.y<=y1)&(df.lon>=b[0])&(df.lon<=b[2])&(df.lat>=b[1])&(df.lat<=b[3])]
rows=[]
for (i,name,y0,y1,bb,keys,need,front,route,tier) in T:
    present=[k for k in keys if (pol.Name==k).any()]
    sub=pol[pol.Name.isin(keys)&(pol.ToYear>=y0)&(pol.FromYear<=y1)]
    # distinct snapshot breakpoints within window across key polities
    bps=sorted(set([y for y in sub.FromYear if y0<=y<=y1]+[y0]))
    span=max(1,y1-y0+1)
    interval=span/len(bps)
    if len(sub)==0: cs=0
    elif interval<=need: cs=3
    elif interval<=3*need: cs=2
    else: cs=1
    if len(present)<len(keys) and cs>1: cs-=1
    nb=len(inbox(wk,bb,y0,y1)); ncb=len(inbox(cb,bb,y0,y1)) if (y1>=1443 and y0<=1821) else None
    nwa=len(inbox(wa,bb,y0,y1)) if y1>=1700 else None
    allb=max(nb, ncb or 0, nwa or 0)
    bs=0 if allb==0 else 1 if allb<3 else 2 if allb<10 else 3
    npl=int(((pl.representative_longitude.between(bb[0],bb[2]))&(pl.representative_latitude.between(bb[1],bb[3]))).sum()) if y1<=640 else None
    rows.append(dict(id=i,topic=name,y0=y0,y1=y1,tier=tier,need_res=need,clio_rows=len(sub),clio_bps=len(bps),clio_interval=round(interval,2),clio_keys=f"{len(present)}/{len(keys)}",clio_score=cs,
                     wd_notable=nb,wd_1443_1821=ncb,waratlas=nwa,battle_score=bs,pleiades=npl,front=front,route=route))
df=pd.DataFrame(rows)
df.to_csv('coverage_partial.csv',index=False)
pd.set_option('display.width',250); pd.set_option('display.max_rows',200)
print(df[['id','topic','tier','need_res','clio_rows','clio_interval','clio_keys','clio_score','wd_notable','wd_1443_1821','waratlas','battle_score','pleiades','front','route']].to_string(index=False))
