import osmium, pickle, collections, time, re
t0=time.time()
rels=[]; tagkeys=collections.Counter(); lic=collections.Counter(); src=collections.Counter()
class H(osmium.SimpleHandler):
    def relation(self, r):
        tg={t.k:t.v for t in r.tags}
        for k,v in tg.items():
            if 'licen' in k: lic[(k,v[:60])]+=1
        if tg.get('type')=='boundary' or tg.get('boundary'):
            outer=[m.ref for m in r.members if m.type=='w' and m.role in ('outer','')]
            rels.append(dict(id=r.id, tags=tg, w=outer[:1], nmem=len(r.members)))
            for k in ('source','source:geometry','source:name','source:url','source:date','source:1','source:2'):
                if k in tg: src[(k,tg[k][:80])]+=1
H().apply_file('ohm-planet.osm.pbf', locations=False, filters=[]) if False else None
reader_h=H()
reader_h.apply_file('ohm-planet.osm.pbf')
pickle.dump(dict(rels=rels, lic=lic, src=src), open('ohm_rels.pkl','wb'))
print('rels', len(rels), 'time', time.time()-t0)
