import pickle, pandas as pd, numpy as np
exec(open('topics.py').read())
o=pd.read_pickle('ohm_df.pkl'); o=o[o.lvl.isin(['1','2'])].dropna(subset=['s'])
pol=pickle.load(open('pol.pkl','rb'))
cov=pd.read_csv('coverage_partial.csv')
res=[]
for (i,name,y0,y1,bb,keys,need,front,route,tier) in T:
    qids=set(pol[pol.Name.isin(keys)].Wikidata.dropna())
    m=o[o.wd.isin(qids)&(o.e>=y0)&(o.s<=y1)]
    # snapshots: distinct start years within window for matched polities
    bps=sorted(set([s for s in m.s if y0<=s<=y1]+([y0] if len(m) else [])))
    interval=(y1-y0+1)/len(bps) if bps else None
    inb=o[(o.e>=y0)&(o.s<=y1)&(o.lon>=bb[0])&(o.lon<=bb[2])&(o.lat>=bb[1])&(o.lat<=bb[3])]
    if len(m)==0: sc=0
    elif interval<=need: sc=3
    elif interval<=3*need: sc=2
    else: sc=1
    res.append(dict(id=i,ohm_key_rels=len(m),ohm_keys_matched=f"{m.wd.nunique()}/{len(qids)}",ohm_interval=round(interval,2) if interval else None,ohm_inbox=len(inb),ohm_score=sc))
r=pd.DataFrame(res); cov=cov.merge(r,on='id'); cov.to_csv('coverage_full.csv',index=False)
pd.set_option('display.width',250); pd.set_option('display.max_rows',200)
print(cov[['id','topic','clio_score','clio_interval','ohm_key_rels','ohm_keys_matched','ohm_interval','ohm_inbox','ohm_score']].to_string(index=False))
print(cov[['clio_score','ohm_score','battle_score']].describe())
print('clio score dist', cov.clio_score.value_counts().sort_index().to_dict(), 'ohm', cov.ohm_score.value_counts().sort_index().to_dict(), 'battles', cov.battle_score.value_counts().sort_index().to_dict())
