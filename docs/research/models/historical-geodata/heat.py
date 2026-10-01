import pandas as pd, numpy as np
c=pd.read_csv('coverage_full.csv')
sym={3:'●',2:'◐',1:'○',0:'×'}
out=[]; cnt={}
for _,r in c.iterrows():
    poly=max(r.clio_score,r.ohm_score)
    if r.id in (100,36,37): poly=3
    comps=[poly, r.battle_score]
    f=None if pd.isna(r.front) else int(r.front); ro=None if pd.isna(r.route) else int(r.route)
    if f is not None: comps.append(f)
    if ro is not None: comps.append(ro)
    m=min(comps)
    v='GO' if m>=2 else ('CURATE' if m==1 else 'DEFER')
    cnt[v]=cnt.get(v,0)+1
    out.append(f"| {r.id} | {r.topic} | {r.tier} | {sym[int(r.clio_score)]} | {sym[int(r.ohm_score)]} | {'–' if f is None else sym[f]} | {'–' if ro is None else sym[ro]} | {sym[int(r.battle_score)]} | {v} |")
print('| # | Topic | Pop. tier (est.) | Polygons: Cliopatria | Polygons: OHM | Front lines (clean src) | Campaign routes (clean src) | Battle points (Wikidata) | v1 |')
print('|---|---|---|---|---|---|---|---|---|')
print('\n'.join(out))
print(cnt)
top50=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,18,19,21,23,24,31,46,50,54,69,75,79,80,81,82,89,99,100,16,20,22,25,26,27,28,29,30,32,33,34,35,36,37,38]
print(len(top50))
