import osmium, collections, pickle
mem=collections.defaultdict(set)  # way -> set(levels)
class HR(osmium.SimpleHandler):
    def relation(self,r):
        if r.tags.get('boundary')=='administrative' and r.tags.get('admin_level') in ('1','2','3','4'):
            lvl=r.tags.get('admin_level')
            for m in r.members:
                if m.type=='w': mem[m.ref].add(lvl)
HR().apply_file('ohm-planet.osm.pbf')
print('member ways', len(mem))
lic=collections.Counter(); src=collections.Counter(); n=collections.Counter()
class HW(osmium.SimpleHandler):
    def way(self,w):
        if w.id in mem:
            l2 = '2' in mem[w.id] or '1' in mem[w.id]
            n['all']+=1; n['l12']+=l2
            v=w.tags.get('license') or w.tags.get('licence') or w.tags.get('source:license')
            lic[('l12' if l2 else 'l34', v)]+=1
            s=w.tags.get('source')
            if s and l2: src[s[:70]]+=1
HW().apply_file('ohm-planet.osm.pbf')
print(n); print(lic.most_common(30)); print(src.most_common(40))
