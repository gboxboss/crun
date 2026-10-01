# Recipes written from model knowledge BEFORE comparing to any ground truth geometry.
# op: ("C", ISO3, box|None) whole country clipped to box(lon0,lat0,lon1,lat1)
#     ("A", ISO3, [admin1 names], box|None) selected admin-1 units
#     ("X", ISO3, [admin1 names]) country minus listed admin-1 units
B=lambda a,b,c,d:(a,b,c,d)
R={
"Roman Empire @116":(116,[("C",c,None) for c in "ITA SMR VAT MLT ESP PRT AND FRA MCO BEL LUX CHE AUT SVN HRV BIH MNE SRB MKD ALB GRC BGR TUR CYP SYR LBN ISR PSE JOR TUN ARM IRQ".split()]+[
 ("X","ROU",["Suceava","Botosani","Iasi","Neamt","Bacau","Vaslui","Vrancea","Galati"]),
 ("A","HUN",["Gyor-Moson-Sopron","Gyôr","Sopron","Vas","Szombathely","Zala","Zalaegerszeg","Nagykanizsa","Veszprém","Komárom-Esztergom","Tatabánya","Fejér","Székesfehérvár","Dunaújváros","Somogy","Kaposvár","Tolna","Szekszárd","Baranya","Pécs","Budapest","Érd"],None),
 ("A","DEU",["Baden-Württemberg","Rheinland-Pfalz","Saarland"],None),("A","DEU",["Bayern"],B(-180,-90,180,48.9)),("A","DEU",["Hessen"],B(-180,-90,180,50.5)),("A","DEU",["Nordrhein-Westfalen"],B(-180,-90,7.0,90)),
 ("C","NLD",B(-180,-90,180,52.0)),("C","GBR",B(-180,-90,180,55.0)),("C","EGY",B(27,-90,180,90)),("C","LBY",B(-180,30.5,180,90)),("C","DZA",B(-180,34.5,180,90)),("C","MAR",B(-7.5,33.5,180,90)),("A","SAU",["Tabuk"],None)]),
"Ottoman Empire @1683":(1683,[("C",c,None) for c in "TUR CYP GRC BGR MKD ALB SRB BIH SYR LBN ISR PSE JOR IRQ EGY TUN".split()]+[
 ("A","HRV",["Osjecko-Baranjska","Vukovarsko-Srijemska","Brodsko-Posavska","Viroviticko-Podravska"],None),
 ("X","HUN",["Gyor-Moson-Sopron","Gyôr","Sopron","Vas","Szombathely","Zala","Zalaegerszeg","Nagykanizsa","Veszprém","Komárom-Esztergom","Tatabánya"]),
 ("A","ROU",["Constanta","Tulcea","Timis","Arad","Caras-Severin"],None),("A","UKR",["Khmel'nyts'kyy"],None),("A","UKR",["Odessa"],B(-180,-90,180,46.6)),
 ("A","SAU",["Makkah","Al Madinah"],None),("C","LBY",B(-180,29,180,90)),("C","DZA",B(-180,33,180,90))]),
"Achaemenid Empire @-500":(-500,[("C",c,None) for c in "IRN IRQ KWT SYR LBN ISR PSE JOR TUR CYP ARM AZE TKM UZB TJK AFG".split()]+[
 ("C","EGY",B(25,-90,180,90)),("C","LBY",B(19,30,180,90)),("A","PAK",["Sind","Punjab","K.P.","Baluchistan","F.A.T.A."],None),("C","BGR",B(-180,-90,180,43)),("C","GRC",B(-180,40.3,180,90))]),
"Han Dynasty @100":(100,[("A","CHN",["Beijing","Tianjin","Hebei","Shanxi","Shandong","Henan","Shaanxi","Gansu","Ningxia","Hubei","Hunan","Jiangxi","Anhui","Jiangsu","Shanghai","Zhejiang","Fujian","Guangdong","Guangxi","Guizhou","Sichuan","Chongqing","Yunnan","Liaoning"],None),
 ("A","CHN",["Inner Mongol"],B(-180,-90,180,42)),("A","CHN",["Xinjiang"],B(-180,-90,180,43)),("A","CHN",["Qinghai"],B(100,-90,180,90)),("C","VNM",B(-180,14,180,90)),("C","PRK",B(-180,-90,180,40.5))]),
"Mughal Empire @1700":(1700,[("X","IND",["Kerala","Assam","Arunachal Pradesh","Nagaland","Manipur","Mizoram","Tripura","Meghalaya","Sikkim","Ladakh","Goa","Andaman and Nicobar","Lakshadweep","Puducherry","Karnataka","Tamil Nadu"]),
 ("A","IND",["Karnataka"],B(-180,14,180,90)),("A","IND",["Tamil Nadu"],B(-180,11.5,180,90)),("C","BGD",None),("A","PAK",["Sind","Punjab","K.P.","F.A.T.A.","F.C.T.","Azad Kashmir"],None),
 ("A","AFG",["Kabul","Nangarhar","Laghman","Kunar","Logar","Parwan","Kapisa","Ghazni","Paktya","Khost","Wardak"],None)]),
"First French Empire @1812":(1812,[("C",c,None) for c in "FRA BEL LUX NLD SVN".split()]+[
 ("A","DEU",["Rheinland-Pfalz","Saarland","Bremen","Hamburg"],None),("A","DEU",["Nordrhein-Westfalen"],B(-180,-90,7.0,90)),("A","DEU",["Niedersachsen"],B(-180,52.3,10.5,90)),
 ("A","CHE",["Genève","Valais"],None),("C","HRV",B(-180,-90,16.3,90)),("C","HRV",B(-180,-90,180,44.2)),
 ("C","ITA",B(-180,41.0,13.0,46.5))]),
"Inca Empire @1525":(1525,[("C","PER",None),("X","ECU",["Sucumbios","Orellana","Napo","Pastaza","Morona Santiago","Zamora Chinchipe","Galápagos"]),
 ("A","BOL",["La Paz","Oruro","Potosí","Cochabamba","Chuquisaca","Tarija"],None),("C","CHL",B(-180,-35.5,180,90)),("C","ARG",B(-180,-34,-63.5,-21))]),
"Umayyad Caliphate @740":(740,[("C",c,None) for c in "PRT MAR TUN EGY SAU YEM OMN ARE QAT BHR KWT JOR ISR PSE LBN SYR IRQ IRN AFG TKM UZB TJK ARM AZE".split()]+[
 ("C","ESP",B(-180,-90,180,42.6)),("C","DZA",B(-180,32,180,90)),("C","LBY",B(-180,29,180,90)),("A","PAK",["Sind","Baluchistan"],None),("A","PAK",["Punjab"],B(-180,-90,180,30.5)),("C","GEO",B(-180,-90,180,42)),("C","TUR",B(38,-90,180,38.5))]),
"Mongol Empire @1259":(1259,[("C",c,None) for c in "MNG KAZ UZB TKM KGZ TJK AFG IRN IRQ AZE ARM GEO".split()]+[
 ("A","CHN",["Inner Mongol","Gansu","Ningxia","Shaanxi","Shanxi","Hebei","Beijing","Tianjin","Shandong","Henan","Liaoning","Jilin","Heilongjiang","Xinjiang","Qinghai","Xizang","Yunnan"],None),
 ("A","CHN",["Sichuan"],B(-180,30,180,90)),("A","CHN",["Jiangsu"],B(-180,33.5,180,90)),("A","CHN",["Anhui"],B(-180,33,180,90)),("A","CHN",["Hubei"],B(-180,32,180,90)),
 ("C","RUS",B(-180,-90,180,56)),("C","UKR",B(-180,-90,180,51)),("C","MDA",B(-180,-90,180,47))]),
"Byzantine Empire @1025":(1025,[("C",c,None) for c in "TUR GRC BGR MKD ALB CYP".split()]+[
 ("C","SRB",B(-180,-90,180,45.3)),("A","ITA",["Bari","Barletta-Andria Trani","Brindisi","Foggia","Lecce","Taranto","Matera","Potenza","Catanzaro","Cosenza","Crotene","Reggio Calabria","Vibo Valentia"],None),
 ("C","SYR",B(-180,35,37,90)),("A","ROU",["Constanta","Tulcea"],None)]),
}
