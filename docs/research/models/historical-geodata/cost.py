# units per topic: P_pd, P_np, F_pd, F_np, C_pd, C_np  (np = no public-domain source map; built from literature/OSINT)
U={
1:("WWII Europe/Eastern Front monthly",0,0,72,0,20,0),
2:("WWII other theatres (China/Burma/N.Africa) monthly",0,0,60,40,10,0),
3:("WWI all fronts",0,0,75,0,20,0),
4:("Rome Republic->476",10,0,0,0,0,15),
5:("Mongol conquests",0,32,0,0,0,15),
6:("Alexander",6,0,0,0,1,0),
7:("Napoleonic Wars",8,0,0,0,30,0),
8:("US Civil War (monthly control lines)",0,0,48,0,30,0),
9:("Ottoman rise",0,0,0,0,0,10),
10:("Russia-Ukraine 2022- (weekly)",0,0,0,200,0,10),
11:("Crusades",20,0,0,0,8,0),
12:("Three Kingdoms",33,0,0,0,0,10),
13:("Fall of W. Rome",5,0,0,0,10,0),
14:("Byzantium",5,0,0,0,0,10),
15:("Conquest of Aztecs",0,6,0,0,1,0),
17:("Scramble for Africa",6,0,0,0,5,0),
18:("Partition 1947",4,0,0,0,0,3),
19:("Korean War",0,0,37,0,10,0),
21:("Punic Wars",10,0,0,0,8,0),
23:("Early Islamic conquests",10,0,0,0,0,8),
24:("Vikings",10,0,0,0,10,0),
31:("Pacific War",0,0,45,0,15,0),
46:("US expansion",5,0,0,0,5,0),
50:("British Empire",5,0,0,0,0,0),
54:("Hannibal",2,0,0,0,3,0),
69:("Ancient Egypt",0,30,0,0,0,0),
75:("Black Death (spread fronts)",0,0,0,8,0,0),
79:("Austria-Hungary collapse / Versailles",6,0,0,0,0,0),
80:("Rise of Nazi Germany",4,0,0,0,0,0),
81:("Stalingrad",0,0,20,0,5,0),
82:("D-Day/Normandy",0,0,15,0,5,0),
89:("Israel-Gaza 2023-",0,0,0,30,0,5),
99:("Silk Road",0,0,0,0,0,5),
100:("Modern geopolitics claims",10,0,0,0,0,0),
16:("Conquest of Inca",0,5,0,0,2,0),
20:("Thirty Years' War",6,0,0,0,0,10),
22:("Hundred Years' War",10,0,0,0,0,6),
25:("Achaemenid Persia",0,0,0,0,2,0),
26:("Greco-Persian Wars",5,0,0,0,5,0),
27:("Peloponnesian War",6,0,0,0,0,5),
28:("Warring States/Qin",0,15,0,0,0,5),
29:("Russian Civil War",0,0,10,10,0,8),
30:("Spanish Civil War",0,0,0,15,0,8),
32:("American Revolution",3,0,0,0,10,0),
33:("Seven Years' War",3,0,0,0,0,8),
34:("Chinese Civil War",0,0,0,12,0,6),
35:("Vietnam War",0,0,10,0,8,0),
36:("Cold War blocs",10,0,0,0,0,0),
37:("Collapse of USSR",5,0,0,0,0,0),
38:("Yugoslav Wars",0,0,12,0,5,0),
}
assert len(U)==50, len(U)
H={'P_pd':(3.0,0.5),'P_np':(6.0,1.5),'F_pd':(1.0,0.25),'F_np':(2.5,0.75),'C_pd':(1.5,0.25),'C_np':(3.0,0.75)}  # (tech hrs, historian hrs)
keys=['P_pd','P_np','F_pd','F_np','C_pd','C_np']
tot={k:sum(v[i+1] for v in U.values()) for i,k in enumerate(keys)}
print('units', tot)
tech=sum(tot[k]*H[k][0] for k in keys); hist=sum(tot[k]*H[k][1] for k in keys)
print('tech hrs', tech, 'historian hrs', hist)
battles_qa=50*30*0.05
print('battle QA hrs', battles_qa)
for label,tr in [('offshore $25/h',25),('onshore $50/h',50)]:
    c=(tech+battles_qa)*tr + hist*80
    print(label, 'tech', (tech+battles_qa)*tr, 'historian', hist*80, 'TOTAL', c)
# PD-only scenario (drop *_np units -> those topics deferred)
pd_keys=['P_pd','F_pd','C_pd']
tpd=sum(tot[k]*H[k][0] for k in pd_keys); hpd=sum(tot[k]*H[k][1] for k in pd_keys)
print('PD-only tech',tpd,'hist',hpd,'cost offshore',(tpd+battles_qa)*25+hpd*80,'onshore',(tpd+battles_qa)*50+hpd*80)
np_keys=['P_np','F_np','C_np']
tnp=sum(tot[k]*H[k][0] for k in np_keys); hnp=sum(tot[k]*H[k][1] for k in np_keys)
print('non-PD tech',tnp,'hist',hnp,'cost offshore',tnp*25+hnp*80,'onshore',tnp*50+hnp*80)
print('Ukraine share np tech/hist', 200*2.5+10*3, 200*0.75+10*0.75)
