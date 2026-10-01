import osmium, pickle, collections, time
d=pickle.load(open('ohm_rels.pkl','rb'))
rels=[r for r in d['rels'] if r['tags'].get('boundary')=='administrative' and r['tags'].get('admin_level') in ('1','2','3','4')]
need_w=set(r['w'][0] for r in rels if r['w'])
wfirst={}; wlic=collections.Counter(); nways=0
class HW(osmium.SimpleHandler):
    def way(self,w):
        global nways
        nways+=1
        if w.id in need_w and len(w.nodes)>0:
            wfirst[w.id]=w.nodes[len(w.nodes)//2].ref
        for t in w.tags:
            if 'licen' in t.k: wlic[(t.k,t.v[:40])]+=1
t0=time.time(); HW().apply_file('ohm-planet.osm.pbf'); print('ways',nways,len(wfirst),time.time()-t0)
need_n=set(wfirst.values()); nloc={}; nlic=collections.Counter()
class HN(osmium.SimpleHandler):
    def node(self,n):
        if n.id in need_n: nloc[n.id]=(n.location.lon,n.location.lat)
        if len(n.tags):
            for t in n.tags:
                if 'licen' in t.k: nlic[(t.k,t.v[:40])]+=1
t0=time.time(); HN().apply_file('ohm-planet.osm.pbf'); print('nodes',len(nloc),time.time()-t0)
for r in rels:
    r['loc']=nloc.get(wfirst.get(r['w'][0])) if r['w'] else None
pickle.dump(dict(rels=rels,wlic=wlic,nlic=nlic),open('ohm_rels_loc.pkl','wb'))
print(wlic.most_common(15)); print(nlic.most_common(15))
