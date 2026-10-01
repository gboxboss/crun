import pickle, collections, re
d=pickle.load(open('ohm_rels.pkl','rb'))
rels=[r for r in d['rels'] if r['tags'].get('boundary')=='administrative']
def yr(s):
    if not s: return None
    m=re.match(r'^(-?)(\d{1,4})',s.strip())
    if not m: return None
    y=int(m.group(2)); return -y if m.group(1) else y
for lvl in ['1','2','3','4']:
    L=[r for r in rels if r['tags'].get('admin_level')==lvl]
    lic=collections.Counter(r['tags'].get('license') or r['tags'].get('licence') or r['tags'].get('source:license') or '(none)' for r in L)
    print('== admin_level',lvl,len(L),'license:',lic.most_common(10))
    src=collections.Counter((r['tags'].get('source') or r['tags'].get('source:url') or '(none)')[:70] for r in L)
    print('   sources:',src.most_common(25))
    if lvl in ('1','2'):
        print('   names sample:',[r['tags'].get('name') for r in L[:15]])
    wd=sum(1 for r in L if 'wikidata' in r['tags']); 
    nostart=sum(1 for r in L if not yr(r['tags'].get('start_date')))
    print('   with wikidata',wd,'no start_date',nostart)
