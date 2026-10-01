import pickle, pandas as pd, numpy as np, re
pol=pickle.load(open('pol.pkl','rb'))
fy=sorted(set(pol.FromYear))
def steps(a,b): return [y for y in fy if a<=y<=b]
def gaps(a,b):
    s=steps(a,b); 
    return len(s), (np.median(np.diff(s)) if len(s)>1 else None)
for a,b in [(-3400,-1000),(-1000,-500),(-500,0),(0,500),(500,1000),(1000,1500),(1500,1800),(1800,1914),(1914,1918),(1939,1945),(1945,2024)]:
    print(a,b,gaps(a,b))
print(steps(1800,1830)); print(steps(1910,1950)); print(steps(-340,-300)); print(steps(1200,1300))
kw=['Rom','Macedon','Mongol','Ottoman','Inca','Aztec','Napole','French','Confedera','United States','Han','Wei','Shu','Wu','Prussia','Habsburg','Austria','Holy Roman','Byzant','Sasan','Achaemen','Seleuc','Ptolem','Carthag','Crusad','Jerusalem','Mughal','Maratha','British','Soviet','German','Korea','Ukrain','Pakistan','India','Timur','Golden Horde','Ilkhan','Yuan','Song','Jin','Qing','Ming','Tang','Sui','Qin','Japan','Tokugawa','Swed','Poland','Lithuan','Kievan','Rus','Muscov','Russia','Spanish','Portug','Venice','Mali','Songhai','Zulu','Ethiop','Abbasid','Umayyad','Rashidun','Fatimid','Ayyubid','Mamluk','Seljuk','Khwarazm','Vietnam','Khmer','Gupta','Maurya','Kushan','Parthia','Hittite','Assyria','Babylon','Egypt','Persia','Iran','Israel','Hellen','Athen','Sparta','Gaul','Frank','Carolingian','Visigoth','Ostrogoth','Vandal','Hun','Avar','Bulgar','Serbia','Hungar','Japan','Manchu','Taiping','Vichy','Italy','Yugoslav','Czech','Viet','China']
names=pol.Name.unique()
for k in kw:
    m=[n for n in names if k.lower() in n.lower()]
    print(k, len(m), m[:12])
