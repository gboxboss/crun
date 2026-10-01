# Gap 2: Historical-border and military-geometry data. Clearance, coverage and v1 scope

## 0. How this was researched, and what could not be checked

- **Egress was restricted in this session.** The proxy blocked osf.io, zenodo.org, nature.com, euratlas.com, geacron.com, icr.ethz.ch, chronas.org, runningreality.org, wikidata.org, westpoint.edu, history.army.mil, archives.gov, ISW, DeepState and Liveuamap. The session's WebSearch budget was already used up. Three routes still worked: GitHub (git clone and code search), raw.githubusercontent.com and Amazon S3.
- **How I worked around it.** Wherever possible I used primary artefacts hosted on GitHub or S3, and I measured the data myself:
  - downloaded the Cliopatria v0.2.0 GeoJSON and queried it;
  - downloaded the full OpenHistoricalMap planet `planet-261001_0000.osm.pbf` (1.31 GB, 2026-10-01) and its daily QA statistics, and parsed both;
  - cloned historical-basemaps, Pleiades, the CRAN mirror of CShapes, Chronas, Natural Earth, the War Atlas dataset and three 2026 Wikidata battle snapshots.
- **Labels.** Each claim is marked VERIFIED (I read or measured the primary artefact), SECONDARY (a third-party document that cites the primary source) or UNVERIFIED/ESTIMATE.
- **Not done:** I could not read the OSF preprint itself, Zenodo, any vendor price list, or the West Point and CMH pages. Those claims are flagged and listed in the fact-check list.
- **Reproducible artefacts** are in `/tmp/claude-0/-home-user-crun/7ef9826d-a86c-53b7-8a22-34a16f78f234/scratchpad/geo/`: `coverage_full.csv`, `heat.md`, `topics.py`, `recipes.py`, `composer_eval.py`, `iou.py`, `cost.py`, `ohm*.py` and `score*.py`. The git repo was not modified.

## 1. Bottom line

1. **No single clean dataset covers the genre, but a legally clean stack exists.**
   - Base polygons: Cliopatria (CC BY 4.0) plus OHM (CC0) plus Natural Earth (public domain).
   - Your own curated "atlas layer", digitised from public-domain sources.
   - Events: Wikidata (CC0).
   - Ancient world: Pleiades and Itiner-e (both CC BY).
   - Avoid GPL, ShareAlike and NonCommercial sources entirely.
2. **The Cliopatria provenance risk is MEDIUM overall: low under US law, medium for EU exposure.** It can be used with mitigations (section 2).
3. **Resolution, not licence, is the real gap.**
   - Cliopatria offers annual snapshots at best: 1914–18 and 1939–45 are yearly, and before 1000 BCE the median step is about 100 years.
   - It contains no front lines and no campaigns.
   - OHM is much thinner than Cliopatria before 1500.
   - Scoring the top 100 topics, only **16 are "GO"** on open data alone, **76 need curation** and **8 should be deferred**. The deferrals are mostly live wars with no clean front-line source.
4. **Front lines and campaigns should come from public-domain government atlases**, digitised in-house. These are the Civil War Official Records Atlas, the US Army CMH "Green Books", West Point atlases, ABMC 1938, the CIA's *Balkan Battlegrounds*, and British WWI official histories published in 1945 or earlier.
   - Top-50 gap fill, PD-sourced items only: about $57k offshore or $93k onshore, roughly 4 months with 3 technicians (ESTIMATE).
   - Everything for the top 50: about $139k to $219k.
5. **Territory Composer pilot (run here).** I wrote recipes from model knowledge and composed them over Natural Earth admin-1 units.
   - The composed shapes reached IoU 0.58–0.85 against Cliopatria (median 0.745).
   - The two open reference datasets themselves agree at a median IoU of only about 0.63 across 18 polity-years.
   - So the approach is within the "noise floor" at continental scale, but it overshoots: 7 of 10 composed shapes were larger than the reference.
   - Use it to fill gaps and as an editing aid, with mandatory snapping and QA. Do not let it generate borders unsupervised.

## 2. (d) Cliopatria provenance memo

### What is VERIFIED from the repo
Source: github.com/Seshat-Global-History-Databank/cliopatria at commit ad28a69, v0.2.0, dated 2026-05-15.

- **Licence.** `LICENSE.md` grants CC BY 4.0 for "This data". It names no authors and makes no reservation about third-party sources.
- **README.** It says the dataset covers "over 1600 political entities", with roughly 14k records, from 3400 BCE to 2024 CE. For its "construction, and source material" it points to the OSF preprint osf.io/preprints/socarxiv/24wd6, which I could not reach.
- **`original_map_images/README.md`.** The images are "the original historical map images developed by Andrew Tollefson in 2014. They formed the basis of the initial Cliopatria data … also used to create this YouTube video (VHG9uSOwx2A) … provided for reference only. All Cliopatria GEOJSON releases incorporate many additional changes … based on reviews by historians." There are 507 PNGs at 4800×2400. An earlier README (commit aff4ea3, 2024) refers to "movie frame years".
  - **Provenance detail:** the dataset began as frames of a YouTube map-animation video, the same genre this product targets.
- **What the images show** (I viewed B078-202 and C300-1794):
  - The base is a blank Robinson-projection world map with modern first-level administrative subdivisions drawn in blue.
  - Most polities are painted by filling whole modern subdivisions; some edges are freehand.
  - The legends use Wikipedia wiki-link markup such as `[[Han Dynasty]]` and `>Chu<`.
  - **Inference, not proof:** the inputs were largely Wikipedia articles and maps, rendered through a different expressive medium (modern admin units). This is not a literal tracing of one atlas's linework.
  - **No image names a source atlas.** I found no licence or permission statement from Tollefson anywhere in the repo, the Seshat docs repo or GitHub code search.
- **Data I measured:**
  - 13,765 records: 13,380 POLITY and 385 RELATION.
  - 1,583 polity names; 508 distinct time breakpoints, which matches the 507 frames.
  - A Wikidata ID on 100% of rows. 1,407 distinct QIDs, of which 474 (33.7%) also appear on OHM boundaries of admin_level 1–2.
- **Median snapshot step by era:**

| Era | Median step |
|---|---|
| 3400–1000 BCE | 100 years |
| 1000–500 BCE | 25 years |
| 500 BCE – 1000 CE | 4–5 years |
| 1000–1500 | 7 years |
| 1500–1800 | 4 years |
| 1800–1914 | 2 years |
| 1914–18 and 1939–45 | annual |
| 1945–2024 | 3 years |

- **Quality defects found:**
  - Ukraine 2024 loses only about 21.9k km² (590,172 → 568,316 km²). "Russian-occupied territories" is 6,907 km², whereas widely reported figures put Russian occupation at about 18% of Ukraine (ESTIMATE). The 2022+ data is not usable.
  - "Kingdom of Prussia" 1807–1863 rows are 87–1,786 km² slivers. Prussia is effectively missing from 1815 to 1863, which breaks the German-unification topic.
  - The Han Dynasty row for 6–13 CE is 143 km² (an artefact around the Xin interregnum).
  - "Holy Roman Empire" has a single POLITY row; elsewhere it exists only as a composite.
- **Semantics vary from polity to polity:**
  - The German Empire includes German New Guinea (184k km² of the difference against historical-basemaps).
  - Empire of Japan 1938 includes occupied North China (1.21M km² of the difference).
  - The colony, occupation, vassal and claim distinctions therefore have to be modelled by you.
- **Coverage gaps** (no polygons found):
  - Gaul and the Celts, Aksum, Nubia, Wari and Tiwanaku, Hawaiʻi and the Māori, Đại Việt and Champa.
  - Most North American nations.
  - Very little before 1000 BCE: 28 distinct polities, 20 of them in the Near East.

### Legal analysis (opinion, not legal advice)
- **United States.** Historical borders are facts or ideas. *Feist* (1991) denies protection to facts. *Darden v. Peters* (4th Cir. 2007) and *Sparaco v. Lawler* (2d Cir. 2002) give thin protection to maps that depict existing facts. Merger limits protection where few expressions are possible, although *Mason v. Montgomery Data* (5th Cir. 1992) shows maps as a whole can be protected.
  - Re-expressing borders by painting modern admin units, followed by years of historian edits, is unlikely to copy protected expression.
  - **US risk: LOW.**
- **EU sui generis database right** (Directive 96/9/EC).
  - The CJEU held that topographic maps can be databases (*Freistaat Bayern v Verlag Esterbauer*, C-490/14, 2015).
  - Manual, screen-based "extraction" of a substantial part counts as extraction (*Directmedia*, C-304/07; *Apis-Hristovich*, C-545/07).
  - If Tollefson systematically transferred border data from a then-protected EU atlas, an EU maker could in theory claim against redistribution in the EU. Protection lasts 15 years from creation or substantial update, so modern atlases that are frequently updated stay protected.
  - Mitigating factors: the unknown, apparently Wikipedia-heavy mix of sources; snapping to admin units, which is not a systematic copy; substantial later modification; and no claim known to me in about 2 years of public CC BY release.
  - **EU risk: MEDIUM.**
- **Chain of title.** I found no written grant from Tollefson. Seshat's licensing of a third party's 2014 work is unproven in the material I could read.
- **Overall rating: MEDIUM.** Mitigations:
  - (i) Email Seshat (J. S. Bennett, P. Turchin) for written confirmation of Tollefson's permission and the list of source atlases.
  - (ii) Keep Cliopatria as an editable base, and progressively replace geometry for top topics with your own PD-sourced curation.
  - (iii) Carry media E&O insurance.
  - (iv) Show CC BY attribution automatically on every video.

## 3. (a) Source-by-licence matrix

| Source | Licence (status) | Covers SaaS rendering of user-monetised video? | Coverage note | Verdict | Cost |
|---|---|---|---|---|---|
| Cliopatria v0.2.0 | CC BY 4.0 (VERIFIED, LICENSE.md) | Yes, with attribution in video or description | World, 3400 BCE–2024, annual at best | **USE** (base) + mitigations | $0 |
| OpenHistoricalMap | CC0 "except where otherwise noted" (VERIFIED, ohm-deploy cgimap/overpass/taginfo configs) | Yes. Filter per-feature licence tags (§4) | 4,127 admin_level 2 relations; strong after 1500, weak before | **USE** (planet dumps, not live APIs) | $0 |
| Natural Earth admin-0/1, physical | Public domain (VERIFIED, LICENSE.md) | Yes | Modern; Composer building blocks | **USE** | $0 |
| Wikidata | CC0 (SECONDARY) | Yes | About 12k battles, about 8.4k with coordinates (BattleSight, Sep 2026, SECONDARY) | **USE** | $0 |
| Pleiades v4.1 | CC BY 3.0 (VERIFIED, repo README) | Yes, with attribution | 41,480 places (README); 42,372 rows measured; 81% in the Mediterranean and Near East | **USE** (ancient) | $0 |
| Itiner-e | CC BY 4.0 (SECONDARY) | Yes | About 300,000 km of Roman roads; no road chronology (SECONDARY quote of the paper) | **USE** | $0 |
| War Atlas open dataset | CC BY 4.0 (VERIFIED, manifest) | Yes | 3,010 battles, 1700 onward only; force and casualty ranges | **USE** (modern battles) | $0 |
| CDB90 (US Army CAA) | Public domain US-gov (SECONDARY) | Yes | About 660 battles, 1600–1973 | **USE** | $0 |
| AWMC geodata | ODbL (SECONDARY) | Yes: a video is a "Produced Work", so attribution only | Barrington-scale ancient Mediterranean | **USE** (no DB redistribution) | $0 |
| aourednik historical-basemaps | GPL-3.0 (VERIFIED LICENSE). Issue #74 (open, Jun 2026) asks whether GPL applies to the data; #76 commercial-permission request closed, outcome unread | Server-side use is unconditional (GPL §2), but a rendered video may be a "covered work" once users publish it, which would trigger GPL and source obligations. Credits "ThinkQuest" student maps of unknown title | 53 world snapshots | **AVOID in output.** Internal QA reference only | — |
| Chronas | CC BY-SA 4.0 for data, "substantially derived from Wikipedia" (VERIFIED, DATA-LICENSE.md) | ShareAlike would arguably force users' videos to be BY-SA | Province-level, yearly | **AVOID** | — |
| CShapes 2.0 | Website CC BY-NC-SA 4.0 (SECONDARY, two independent 2026 audits); the CRAN package bundles the data under "GPL (>= 2)" (VERIFIED DESCRIPTION) | NC blocks it | World 1886–2019, daily | **NEGOTIATE** a commercial licence with ETH ICR, or avoid | Unknown (RFQ) |
| Euratlas (Nüssli) Periodis GIS, Extended licence | Commercial (UNVERIFIED terms) | Unknown | Europe, century snapshots 1–2000 | **NEGOTIATE** mainly as QA ground truth; low value for production because of century steps | Unknown (RFQ). Break-even about $2–5k |
| GeaCron | Commercial data licensing (UNVERIFIED) | Unknown | World, yearly, 3000 BC onward (claimed) | **NEGOTIATE** for non-European gaps | Unknown. Break-even about $24k one-off (§8) |
| Centennia Historical Atlas | Commercial software (UNVERIFIED) | Unknown | Europe and Middle East, 1000 CE onward, about 0.1-year steps (from model knowledge) | **NEGOTIATE** (best fit for "every year" Europe videos) | Unknown. Break-even about $6k for polygons alone |
| Running Reality | Proprietary app (UNVERIFIED) | Unlikely | World model | **AVOID** unless they offer terms | Unknown |
| AtlasPI (atlaspi.it) | Code "Apache-2.0" (SECONDARY); data provenance unknown | Unknown | 1,000+ polities | **AVOID** until provenance is shown | — |
| CHGIS v6 | EULA: no redistribution or commercial use (SECONDARY) | No | China −222 to 1911 | **AVOID** for output | — |
| geoBoundaries | Mixed; about 38% ShareAlike (per brief, not re-verified) | Partly | Modern | **Avoid** for the Composer; use Natural Earth | — |
| ISW maps | All rights reserved by default (UNVERIFIED terms) | No without licence | Ukraine and others | **AVOID / negotiate** | Unknown |
| DeepStateMap | Permission-based. A third party states it was "officially authorized by the deepstatemap.live team" (VERIFIED README, sgofferj/tak-feeder-deepstate) | No without written authorisation | Ukraine, daily | **NEGOTIATE or avoid** | Unknown |
| Liveuamap | Commercial; paid tiers and API exist (from model knowledge, UNVERIFIED) | Only with licence | Many conflicts | **NEGOTIATE or avoid** | Unknown |

**The rule to adopt:**
- CC0, PD, CC BY and ODbL: accept, for rendered output only.
- BY-SA, GPL, NC, ND, EULA-restricted or unknown sources: never ship. Use them at most as internal QA.

## 4. OpenHistoricalMap, measured

All figures below were computed from the 2026-10-01 planet on S3, plus OHM's own daily QA files.

- **Size.** 194,375,979 nodes, 7,651,584 ways, 203,770 relations (OHM `feature.summary.csv`). OHM's SotM-2026 deck reports 3.6M dated elements, 192k boundaries, 2,177 volunteer mappers, 1 paid developer and 17M requests per day ("We don't need more scrapers!").
- **Administrative boundaries.** 77,812 relations: admin_level 8 = 24,081; level 2 = 4,127; level 1 = 862. Of the 4,989 level 1–2 relations with a start date, 3,701 at level 2 carry Wikidata IDs.
- **Distinct state-level polities by era** (Cliopatria vs OHM):

| Era | Cliopatria | OHM |
|---|---|---|
| 1000–500 BCE | 72 | 26 |
| 500–0 BCE | 156 | 32 |
| 0–500 | 144 | 56 |
| 500–1000 | 325 | 123 |
| 1000–1500 | 519 | 252 |
| 1500–1800 | 327 | 453 |
| 1800–1914 | 329 | 592 |
| 1914–45 | 142 | 345 |
| 1945+ | 275 | 479 |

  OHM is stronger after 1500, especially in the Americas, Africa and colonial units. It is far weaker in antiquity: East Asia 0–500 has 7 OHM polities against 44 in Cliopatria. OHM's own "earth-years-admin-2" metric is 561.15.
- **Licence tags, all ways.** CC-BY-4.0 on 2,370,269 ways (31%, mostly bulk imports); ODbL on 229,710 (3.0%); GPL v3 on 1,498.
- **Licence tags on the 38,408 member ways of level 1–2 borders** (what matters for borders):

| Tag | Ways | Share |
|---|---|---|
| Untagged | 32,925 | 85.7% |
| CC0 / PD | 3,137 | 8.2% |
| CC BY variants | 2,339 | 6.1% |
| CC BY-SA | 6 | 0.02% |

  Relation-level: only 108 of 4,127 level 2 relations (2.6%) carry a licence tag, and all of those are CC0.
- **Provenance flags in source tags.** "OSM Contributors" (ODbL-derived), "Bing" and "Yahoo" (imagery tracing), and China's national geographic information system. On the positive side, US State Department LSIB (PD), Droysen and Spruner-Menke (PD 19th-century atlases) and the Newberry Atlas of Historical County Boundaries.
- **Verdict: USE**, with a filter:
  - drop BY-SA, GPL and unknown-licence features;
  - keep CC BY features and list them in the attribution;
  - ODbL is fine for produced works.
- Issue #377 (OpenHistoricalMap/issues) shows that some pre-CC0 contributions were made under ODbL and were never relicensed. That is a small residual risk.

## 5. (b) Coverage heatmap: top 100 topics by data type

**Method.**
- The popularity tier is my ESTIMATE; YouTube and TikTok were unreachable, so no view counts were measured.
- **Polygons.** Score 3 if snapshot spacing in the topic window is at or below the needed resolution; 2 if within 3×; 1 if coarser; 0 if the key polities are absent.
  - Cliopatria: scored from its rows.
  - OHM: scored only on relations whose Wikidata IDs match Cliopatria's key polities.
- **Battle points.** I could not query Wikidata directly, so I used the maximum of three 2026 Wikidata snapshots on GitHub:
  - wellknownable (Jul 2026): 2,227 battles with 12 or more sitelinks and precise P625 coordinates;
  - Casus Belli (Aug 2026): 4,615 battles from 1443–1821, 3,020 with exact P625;
  - War Atlas (Jul 2026): 3,010 battles from 1700 onward.
- **Front lines and campaign routes.** My judgement of clean-source availability (§6).
- **Key:** ● 3, ◐ 2, ○ 1, × 0, – not needed.
- **v1 status:** GO if every needed component is at least 2; CURATE if the weakest is 1; DEFER if any is 0.

| # | Topic | Tier | Clio | OHM | Front | Route | Battles | v1 |
|---|---|---|---|---|---|---|---|---|
| 1 | WWII Europe/Eastern Front monthly | A | ○ | ○ | ◐ | ● | ● | CURATE |
| 2 | WWII global monthly | A | ○ | ○ | ◐ | ● | ● | CURATE |
| 3 | WWI fronts | A | ○ | ○ | ● | ● | ● | CURATE |
| 4 | Rome Republic→476 | A | ● | ○ | ○ | ◐ | ● | CURATE |
| 5 | Mongol conquests | A | ○ | ○ | ○ | ◐ | ● | CURATE |
| 6 | Alexander | A | ◐ | × | ○ | ◐ | ● | CURATE |
| 7 | Napoleonic Wars | A | ◐ | ◐ | ◐ | ● | ● | GO |
| 8 | US Civil War | A | ○ | ○ | ● | ● | ● | CURATE |
| 9 | Ottoman rise | A | ● | ◐ | ○ | ◐ | ● | CURATE |
| 10 | Russia–Ukraine 2022– | A | ○ | × | × | ○ | ● | DEFER |
| 11 | Crusades | A | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 12 | Three Kingdoms | A | ○ | × | ○ | ○ | ◐ | CURATE |
| 13 | Fall of W. Rome | A | ◐ | ◐ | ○ | ◐ | ● | CURATE |
| 14 | Byzantium | A | ● | ◐ | ○ | ○ | ● | CURATE |
| 15 | Aztec conquest | A | ○ | ○ | ○ | ◐ | ● | CURATE |
| 16 | Inca conquest | B | ○ | ○ | ○ | ◐ | ● | CURATE |
| 17 | Scramble for Africa | A | ◐ | ◐ | – | ◐ | ● | GO |
| 18 | Partition 1947 | A | ◐ | ○ | – | ◐ | ○ | CURATE |
| 19 | Korean War | A | ○ | ○ | ● | ● | ● | CURATE |
| 20 | Thirty Years' War | B | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 21 | Punic Wars | A | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 22 | Hundred Years' War | B | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 23 | Early Islamic conquests | A | ◐ | ○ | ○ | ○ | ● | CURATE |
| 24 | Vikings | A | ◐ | × | – | ○ | ● | CURATE |
| 25 | Achaemenid Persia | B | ◐ | × | – | ○ | ● | CURATE |
| 26 | Greco-Persian Wars | B | ○ | × | ○ | ○ | ◐ | CURATE |
| 27 | Peloponnesian War | B | ○ | × | ○ | ○ | ◐ | CURATE |
| 28 | Warring States/Qin | B | ◐ | × | ○ | ○ | ○ | CURATE |
| 29 | Russian Civil War | B | ○ | ○ | ◐ | ◐ | ● | CURATE |
| 30 | Spanish Civil War | B | ○ | × | ◐ | ◐ | ● | CURATE |
| 31 | Pacific War | A | ○ | × | ● | ● | ● | CURATE |
| 32 | American Revolution | B | ◐ | ○ | ◐ | ◐ | ● | GO |
| 33 | Seven Years' War | B | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 34 | Chinese Civil War | B | ◐ | ○ | ◐ | ◐ | ● | GO |
| 35 | Vietnam War | B | ○ | × | ◐ | ◐ | ● | CURATE |
| 36 | Cold War blocs | B | ● | ◐ | – | – | ● | GO |
| 37 | Collapse of USSR | B | ○ | ○ | – | – | ◐ | GO* |
| 38 | Yugoslav Wars | B | ○ | ○ | ○ | ◐ | ● | CURATE |
| 39 | Arab–Israeli wars 1948–73 | B | ○ | ○ | ◐ | ◐ | ● | CURATE |
| 40 | Gulf Wars | B | × | ○ | ◐ | ◐ | ◐ | CURATE |
| 41 | Syrian Civil War | B | ○ | × | × | ○ | ● | DEFER |
| 42 | Taiping Rebellion | C | ◐ | ○ | ○ | ○ | ● | CURATE |
| 43 | Qing decline/Opium Wars | B | ◐ | ○ | ○ | ○ | ● | CURATE |
| 44 | Unification of Germany | B | ○ | ○ | ◐ | ◐ | ● | CURATE |
| 45 | Unification of Italy | B | ◐ | ○ | ◐ | ◐ | ● | GO |
| 46 | US expansion | A | ◐ | ○ | – | – | ● | GO |
| 47 | Russian Siberia | B | ● | ○ | – | ○ | ◐ | CURATE |
| 48 | Partitions of Poland | B | ○ | ○ | – | – | ● | CURATE |
| 49 | Mughal Empire | B | ● | ◐ | – | ○ | ● | CURATE |
| 50 | British Empire | A | ● | ● | – | – | ● | GO |
| 51 | Spanish Empire | B | ● | ● | – | ○ | ● | CURATE |
| 52 | Portuguese Empire | C | ◐ | ○ | – | ○ | ● | CURATE |
| 53 | Age of Exploration | B | ◐ | ● | – | ◐ | ● | GO |
| 54 | Hannibal | A | ○ | ○ | ○ | ◐ | ● | CURATE |
| 55 | Gallic Wars | B | ○ | × | ○ | ◐ | ● | CURATE |
| 56 | Caesar's Civil War | B | ○ | × | ○ | ◐ | ● | CURATE |
| 57 | Roman–Persian wars | B | ● | ○ | ○ | ○ | ● | CURATE |
| 58 | Justinian | B | ◐ | ○ | ○ | ○ | ● | CURATE |
| 59 | Carolingians | B | ◐ | ◐ | – | ○ | ◐ | CURATE |
| 60 | Norman Conquest | B | × | × | ○ | ◐ | ◐ | DEFER |
| 61 | Reconquista | B | ◐ | ◐ | – | ○ | ● | CURATE |
| 62 | Timur | B | ○ | × | ○ | ○ | ○ | CURATE |
| 63 | Fall of Constantinople | B | ○ | ○ | ○ | ◐ | ○ | CURATE |
| 64 | Ottoman decline | B | ● | ◐ | ○ | ○ | ● | CURATE |
| 65 | Sengoku Japan | B | ○ | ○ | ○ | ○ | ● | CURATE |
| 66 | Imjin War | C | ○ | × | ○ | ○ | ● | CURATE |
| 67 | Tang | B | ● | × | – | ○ | ○ | CURATE |
| 68 | Han & Xiongnu | B | ◐ | × | – | ○ | ◐ | CURATE |
| 69 | Ancient Egypt | A | ◐ | × | – | – | ● | GO |
| 70 | Assyria & Babylon | B | ◐ | ○ | – | ○ | ● | CURATE |
| 71 | Bronze Age Collapse | B | ○ | × | – | ○ | ○ | CURATE |
| 72 | Maurya | C | ◐ | × | – | – | × | DEFER |
| 73 | Abbasids | B | ◐ | ○ | – | – | ● | GO |
| 74 | Seljuks/Manzikert | C | ◐ | ○ | ○ | ○ | ● | CURATE |
| 75 | Black Death spread | A | ○ | ○ | – | ◐ | ◐ | CURATE |
| 76 | Kievan Rus' | B | ◐ | × | – | ○ | ● | CURATE |
| 77 | Rise of Muscovy | B | ● | ◐ | – | ○ | ● | CURATE |
| 78 | Great Northern War | C | ○ | ○ | ○ | ◐ | ● | CURATE |
| 79 | Austria-Hungary collapse / Versailles | A | ◐ | ○ | – | – | ● | GO |
| 80 | Rise of Nazi Germany | A | ○ | × | – | – | ● | CURATE |
| 81 | Stalingrad | A | ○ | ○ | ● | ● | ◐ | CURATE |
| 82 | D-Day/Normandy | A | ○ | × | ● | ● | ◐ | CURATE |
| 83 | North Africa 1940–43 | B | ○ | ○ | ● | ● | ● | CURATE |
| 84 | Winter War | B | ○ | ○ | ◐ | ◐ | ◐ | CURATE |
| 85 | Falklands | C | ○ | ○ | ◐ | ◐ | ○ | CURATE |
| 86 | Iran–Iraq War | C | ○ | ○ | ○ | ○ | ◐ | CURATE |
| 87 | Soviet–Afghan War | B | × | × | ○ | ○ | ◐ | DEFER |
| 88 | Afghanistan 2001–21 | B | ○ | × | ○ | ○ | ● | CURATE |
| 89 | Israel–Gaza 2023– | A | ○ | ○ | × | ○ | ● | DEFER |
| 90 | Sudan & Tigray | C | ○ | × | × | ○ | ◐ | DEFER |
| 91 | Mexican–American War | C | ○ | ○ | ◐ | ◐ | ◐ | CURATE |
| 92 | Latin American independence | B | ◐ | ◐ | ○ | ○ | ● | CURATE |
| 93 | Zulu & Boer wars | C | ○ | ○ | ◐ | ◐ | ● | CURATE |
| 94 | Haitian Revolution | C | ○ | ○ | ○ | ○ | ● | CURATE |
| 95 | Mesoamerica pre-contact | B | ● | ○ | – | – | ◐ | GO |
| 96 | Mali & Songhai | B | ◐ | ○ | – | ○ | ○ | CURATE |
| 97 | Khmer Empire | C | ◐ | × | – | – | × | DEFER |
| 98 | Ottoman–Habsburg / Vienna | B | ◐ | ○ | ○ | ◐ | ● | CURATE |
| 99 | Silk Road | A | ● | ● | – | ◐ | ● | GO |
| 100 | Modern geopolitics explainers | A | ○ | ○ | – | – | ● | GO* |

\*Polygons for these come from Natural Earth (PD) plus CIA maps (US-gov PD), not Cliopatria.

**Totals: 16 GO, 76 CURATE, 8 DEFER.** Score distributions:
- Cliopatria polygons {0: 3, 1: 46, 2: 37, 3: 14}
- OHM polygons {0: 29, 1: 55, 2: 12, 3: 4}
- Battle points {0: 2, 1: 8, 2: 18, 3: 72}

Battle points are the best-covered layer. Pre-1443 counts rely on the "notable" snapshot only.

**Queries to re-run when Wikidata is reachable:** `SELECT (COUNT(DISTINCT ?b) AS ?n) WHERE { ?b wdt:P31/wdt:P279* wd:Q178561; wdt:P625 ?c. {?b wdt:P585 ?t} UNION {?b wdt:P580 ?t} FILTER(YEAR(?t)>=Y0 && YEAR(?t)<=Y1) }`, with a `wikibase:box` service per topic.

## 6. Front lines and campaigns

**Legally clean candidates** (status from 17 U.S.C. §105 and copyright terms; individual sites UNVERIFIED this session):

- **ACW:** *Atlas to Accompany the Official Records of the Union and Confederate Armies* (GPO, 1891–95; 178 plates). PD.
- **WWI:** ABMC *American Armies and Battlefields in Europe* (GPO, 1938). PD.
  - British *History of the Great War* map volumes **published 1945 or earlier** are also usable: UK Crown copyright on published works lasts 50 years (CDPA s.163), so these expired before 1996 and were not restored in the US.
  - **Avoid UK WWII official histories (1950s–60s).** They were still protected in the UK on 1 Jan 1996, so URAA restored their US copyright for 95 years from publication.
- **WWII, Korea, Vietnam:**
  - US Army CMH *United States Army in World War II* ("Green Books", about 78 volumes, ESTIMATE of about 25 maps each).
  - CMH Korean War volumes (Appleman et al.), CMH and USMC Vietnam histories.
  - All US-gov PD, but check each volume for credited third-party maps.
- **West Point (USMA Department of History):**
  - Maps drawn by USMA staff cartographers are PD under §105. *West Point Atlas of American Wars* (1959) is the core; Wikimedia uses a "PD-USGov-Military-Army-USMA" template.
  - **Caution:** commercial reprints (Avery/Square One, Tess, Greenhill) can add new copyrighted material. The Esposito-Elting *Napoleonic Wars* atlas (Praeger 1964) is plausibly PD but needs per-plate review.
- **Yugoslav Wars:** CIA *Balkan Battlegrounds* (2002). US-gov PD, with front-line maps.
- **NARA RG 242 captured German OKH *Lagekarten*.** Anonymous wartime works. Their US status after URAA is unclear, so treat them as **fact sources to redraw from, not images to reproduce**.
- **Pre-1931 historical atlases.** PD in the US, and in life+70 countries where the author died more than 70 years ago:
  - Shepherd *Historical Atlas* (1911/1923; Shepherd died 1934)
  - Droysen (1886), Spruner-Menke (1880), Freeman (1881)
  - Butler *Atlas of Ancient and Classical Geography* (1907), Muir (1911; died 1941)
  - These carry campaign routes for antiquity and the Middle Ages (Alexander, Hannibal, the Crusades, the Norse). Several are already cited as sources in OHM.
- **Redraw, do not reproduce.** Facts such as unit positions and lines are not protectable in the US. Restyle everything into your own vectors and keep a source citation for each feature.

**Live-war sources are off-limits without a licence.**
- ISW, DeepState and Liveuamap are all-rights-reserved by default.
- DeepState grants case-by-case authorisation; a third-party README states it was "officially authorized" (VERIFIED).
- Liveuamap sells paid tiers and an API (UNVERIFIED). I found no public ISW data-licensing programme (UNVERIFIED).
- Systematically extracting their data adds database-right exposure; Ukraine's 2023 copyright law (from model knowledge) also has a database right.
- **Recommendation:** no live fronts in v1 unless licensed in writing.

**Digitising effort (ESTIMATE)** per georeferenced map:

| Task | Technician | Historian QA |
|---|---|---|
| Front-line snapshot | 1.0 h (0.3 georeference + 0.5 trace + 0.2 attributes) | 0.25 h |
| Campaign arrow set | 1.5 h | 0.25 h |
| Polity snapshot edited from a Cliopatria base | 3 h | 0.5 h |

Without a PD source map, roughly double to 2.5× those hours. Rates (ESTIMATE, not verified): offshore GIS technician $25/h; onshore $50/h; PhD historian $80/h.

## 7. Territory Composer: prior art, pilot, protocol

**Prior art** (from model knowledge; verify the citations):
- Thiessen/Voronoi territories (Hodder & Orton 1976).
- XTENT, which weights centres by size and distance (Renfrew & Level 1979).
- Cost-distance and least-cost catchments in archaeology.
- Turchin et al. 2013, PNAS: a gridded polity-emergence model validated against atlases.
- Seshat "World Sample-30" coding.
- Plewe 2002: uncertainty in historical GIS. Gregory & Ell 2007: *Historical GIS*.
- Kitamura & Lagerlöf, and Abramson 2017: Euratlas-derived European polity panels.
- CShapes 2.0 methodology (Schvitz et al. 2022).
- "Princes and Townspeople" (CC0 per a SECONDARY source): town-level dated polity membership, which is exactly the point-to-polygon input a Voronoi composer needs.
- Anders 2020: territorial control estimated from event data.
- Historical-basemaps' BORDERPRECISION field and Cliopatria's disclaimer both argue for rendering uncertainty (blurred or hatched borders).

**Pilot run here, with real numbers.**
- I wrote 10 recipes (`recipes.py`) as an LLM would: whole countries, admin-1 units and clip boxes over Natural Earth. I then scored them by equal-area IoU (EPSG:6933).

| Polity-year | IoU vs Cliopatria | IoU vs historical-basemaps (near year) | Cliopatria vs historical-basemaps |
|---|---|---|---|
| Roman 116 | 0.74 | 0.72 | 0.75 |
| Ottoman 1683 | 0.67 | (1700) | — |
| Achaemenid −500 | 0.77 | 0.74 | 0.83 |
| Han 100 | 0.72 | 0.65 | 0.70 |
| Mughal 1700 | 0.85 | 0.81 | 0.87 |
| French Empire 1812 | 0.63 | — | — |
| Inca 1525 | 0.58 | 0.48 | 0.68 |
| Umayyad 740 | 0.75 | (year mismatch) | — |
| Mongol 1259 | 0.77 | (year mismatch) | — |
| Byzantine 1025 | 0.84 | 0.65 | 0.66 |

- **Agreement between the two open datasets** across 18 polity-years: IoU from 0.23 (Kushan 100) to 0.94 (Russia 1914), median about 0.63. The low values come from semantics: colonies, de facto occupation, vassals.
- **Recipe vs Cliopatria:** median 0.745. The recipe was larger than the reference in 7 of 10 cases, typically by over-including modern desert provinces.
- **Caveats:**
  - I authored the recipes, so this measures model knowledge, not a pipeline.
  - Earlier in the session I had seen Cliopatria area figures for a few polities, so there is mild contamination.
  - n = 10.
- **Cost:** roughly $0.02 per polity-year with Sonnet 5.5 (3k tokens in, 1.5k out = $0.006 + $0.015), or about $0.01 with the Batch API.

**Proposed 10-topic protocol.** Use the 10 polity-years above, plus a front-line set for future work: Eastern Front Dec-1941 and Jul-1943, ACW Jan-1863, Korea Sep-1950.

- **Ground truth:**
  - Cliopatria;
  - OHM where the QID matches;
  - Euratlas or GeaCron for evaluation only, if licensed;
  - historical-basemaps for internal reference only.
- **Arms:**
  - A: LLM freehand coordinates;
  - B: admin-1 recipe;
  - C: recipe snapped to Natural Earth rivers, ridges and coasts, plus a Voronoi step from Wikidata-dated control points;
  - D: nearest Cliopatria snapshot;
  - E: human edit.
- **Metrics:**
  - IoU;
  - area ratio;
  - boundary F-score at 25 km and 50 km;
  - 95th-percentile Hausdorff distance;
  - historian rubric, 0–3.
- **Pass:** IoU ≥ max(0.75, reference agreement − 0.05), area within ±20%, and rubric ≥ 2 on 8 of 10.
  - Arm B currently passes on IoU only for continental shots.
  - Zoomed regional shots need arm C plus human QA.

## 8. (c) Cost and time to fill gaps for the top 50 topics

The top 50 are the 34 tier-A topics plus 16 tier-B topics. Units per topic are in `cost.py`. **All hours and rates are ESTIMATES.**

**Units needed:**

| Unit | Count |
|---|---|
| Polity snapshots, PD-sourced | 207 |
| Polity snapshots, no PD source | 88 |
| Front-line snapshots, PD-sourced | 404 |
| Front-line snapshots, no PD source | 315 (200 of them Ukraine weekly) |
| Campaign sets, PD-sourced | 228 |
| Campaign sets, no PD source | 147 |
| Battle QA | 50 topics × 30 battles × 3 min = 75 h |

**Unit costs** (offshore technician, $80 historian):
- Polity snapshot: PD $115 (3×25 + 0.5×80); non-PD $270.
- Front line: PD $45; non-PD $122.50.
- Campaign set: PD $57.50; non-PD $135.

**Totals:**
- Technician hours: 3,123.5 + 75 = 3,198.5. Historian hours: 740.
- **Offshore:** 3,198.5 × $25 = $79,963, plus 740 × $80 = $59,200, total **$139,163**.
- **Onshore:** $159,925 + $59,200 = **$219,125**.
- **PD-only subset** (recommended v1): technician 1,367 + 75 = 1,442 h, historian 261.5 h.
  - Offshore: 1,442 × 25 + 261.5 × 80 = **$56,970**. Onshore: **$93,020**.
  - Time: about 16 weeks with 3 technicians at 30 productive hours a week, plus a 0.25 FTE historian.
- **Ukraine alone:** 530 technician hours + 157.5 historian hours, about $25,850 to build. Weekly upkeep is 52 × $122.50 ≈ **$6,370 per year**, plus legal risk.

**Licence vs commission break-even** (prices are unknown, so request quotes):
- Centennia replaces about 54 European PD polity units: 54 × $115 ≈ $6.2k.
- GeaCron replaces the 88 non-PD polity units: 88 × $270 ≈ $23.8k.
- Euratlas is mainly QA ground truth: worth about $2–5k.
- A DeepState or ISW licence is worth up to about $10–20k a year only if live wars are a must-have. It saves the build and upkeep above and moves the legal risk to the vendor.

## 9. (e) Recommended v1 scope and dataset stack

**v1 "Empires & Eras" pack** (annual to decade resolution, ships on open data plus light curation):
- Rome (empire-scale), Byzantium, Ottoman rise and decline, the Mongols (with curated Mongol-campaign route sets), caliphates (Rashidun, Umayyad, Abbasid), Crusader states.
- Mughal, British, Spanish and Portuguese empires; US expansion; Scramble for Africa; Versailles; Cold War and the USSR collapse.
- Silk Road and the Age of Exploration (curated routes).
- Ancient Egypt, Assyria and Persia (era-scale), Han and Tang China.
- Modern geopolitics (Natural Earth).

**v1 "Wars" pack** (front lines from PD atlases):
- ACW (OR Atlas)
- WWI (ABMC, West Point, UK official histories ≤1945)
- WWII Europe, Pacific and North Africa (CMH, West Point; Eastern Front monthly redrawn from West Point plus Lagekarten facts)
- Korea (CMH)
- Napoleonic campaigns (PD 19th-century atlases)
- Punic Wars, Hannibal and Alexander (Shepherd, Butler)
- Vietnam (CMH/USMC), Yugoslav Wars (CIA)

**Defer:**
- Live conflicts: Ukraine 2022+, Gaza, Sudan, Syria.
- Before 1000 BCE outside Egypt and Mesopotamia.
- Sub-Saharan Africa before 1800, mainland Southeast Asia, pre-Columbian detail.
- Month-level fronts for wars without PD atlases: Spanish, Chinese and Russian civil wars.

**Stack:**
- PostGIS with per-feature provenance and licence fields.
- Base layers: Cliopatria v0.2.0, OHM planet (licence-filtered), Natural Earth.
- Your own CC0-or-proprietary "atlas layer", digitised from PD sources.
- Events: Wikidata snapshot via QLever/WDQS, plus CDB90 and War Atlas.
- Ancient: Pleiades, Itiner-e, AWMC.
- An auto-generated attribution block for every render (CC BY sources need it).
- Uncertainty rendering and user overrides.

## 10. Verified-vs-unverified ledger

- **VERIFIED from primary sources:**
  - licences of Cliopatria, historical-basemaps, Chronas, Natural Earth and Pleiades;
  - OHM's CC0 configuration and its planet statistics;
  - the CRAN CShapes DESCRIPTION;
  - all coverage, IoU and licence-tag measurements above.
- **SECONDARY:**
  - CShapes website licence (CC BY-NC-SA); Itiner-e (CC BY); Wikidata (CC0);
  - BattleSight battle counts; Princes & Townspeople (CC0); CHGIS EULA.
- **UNVERIFIED** (could not reach):
  - the OSF preprint text; all vendor terms and prices (Euratlas, GeaCron, Centennia, Running Reality, CShapes commercial, ISW, DeepState, Liveuamap);
  - the West Point, CMH and NARA site statements; YouTube popularity;
  - geoBoundaries' ShareAlike share; labour rates.

## KEY RECOMMENDATIONS
- Adopt a strict licence gate: ship only CC0/PD/CC BY/ODbL-derived geometry in rendered output; never ship GPL (historical-basemaps), BY-SA (Chronas), NC (CShapes 2.0 web licence, CHGIS, GADM) — because a user-monetised video can become a covered/adapted work.
- Use Cliopatria v0.2.0 as the base polygon layer with mitigations (written provenance confirmation from Seshat, auto-attribution, E&O insurance) — because US risk is low and overall chain-of-title risk is medium, and nothing open beats its pre-1500 coverage.
- Ingest OHM from the daily S3 planet dump, filtering by per-feature licence tags — because OHM is CC0 by default but ~6% of state-level border ways carry CC BY tags and the project asks scrapers to stay off its live APIs.
- Build the Territory Composer on Natural Earth admin-1 (public domain), not geoBoundaries — because NE is PD and the pilot already reached median IoU 0.745 vs Cliopatria using it.
- Gate the Composer with snapping + historian QA and use it to fill gaps, not as primary truth — because composed shapes overshot the reference in 7/10 pilot cases and open references only agree at median IoU ~0.63.
- Create an owned 'atlas layer' by digitising PD government atlases (OR Atlas 1891-95, CMH Green Books, West Point/USMA maps, ABMC 1938, CIA Balkan Battlegrounds, UK WWI official histories published 1945 or earlier) — because they are the only clean source of front lines and campaign arrows.
- Do not use UK WWII official-history maps or reproduce German Lagekarten images; redraw facts only — because URAA restored US copyright on works still protected in the UK or Germany in 1996.
- Fund the PD-only top-50 curation (~$57k offshore / ~$93k onshore, ~16 weeks with 3 technicians) before v1, and defer non-PD items (~$82k) to v1.5 — because that unlocks the highest-tier war topics at the lowest risk.
- Exclude live conflicts (Ukraine 2022+, Gaza, Sudan, Syria) from v1 unless a written ISW/DeepState/Liveuamap licence is obtained — because no clean front-line source exists and live upkeep is about $6.4k/yr plus legal and misinformation risk.
- Model sovereignty semantics explicitly (metropole/colony/occupation/vassal/claim) in the schema — because those differences, not geometry, drive most disagreement between datasets (e.g., Japan 1938 +1.21M km² occupied China; German Empire with New Guinea).
- Request quotes from Centennia, GeaCron, Euratlas and ETH ICR (CShapes) and buy only below break-even (~$6k, ~$24k, ~$2-5k respectively) with explicit SaaS/user-video rights — because current prices and terms are unknown.
- Auto-generate attribution credits (end card + description text) for every render and expose 'data confidence' badges and fuzzy-border rendering — because CC BY requires attribution and pedantic audiences punish false precision.
- Fix known Cliopatria defects before launch (Ukraine 2022+, Prussia 1807-1863 slivers, Han 6-13 CE artefact, HRE representation) — because they fall inside high-tier topics.
- Launch v1 with the 'Empires & Eras' plus PD 'Wars' packs (16 GO + PD-curated war topics) and route out-of-scope prompts to an 'approximate' mode — because 76/100 topics need curation to meet the genre's accuracy bar.

## COST ITEMS
- Cliopatria polygons (CC BY 4.0): $0 / per video / one-time (Attribution required in every published video; provenance mitigation costs separate) https://github.com/Seshat-Global-History-Databank/cliopatria/blob/main/LICENSE.md
- OpenHistoricalMap planet dump (CC0, 1.31 GB pbf, daily): $0 / per download (Use dumps not live API; optional donation to OHM recommended) https://s3.amazonaws.com/planet.openhistoricalmap.org/planet/planet-261001_0000.osm.pbf
- Natural Earth admin-0/admin-1/physical (public domain): $0 / one-time (Territory Composer building blocks) https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md
- Wikidata battles/events (CC0): $0 / per query/snapshot (Licence SECONDARY-verified; run own snapshot via WDQS/QLever) https://www.wikidata.org/wiki/Wikidata:Licensing
- Pleiades gazetteer v4.1 (CC BY 3.0): $0 / one-time (Attribution required) https://github.com/isawnyu/pleiades.datasets
- War Atlas open battle dataset (CC BY 4.0): $0 / one-time (1700+ only; attribution required) https://github.com/Purcell-Analytics/war_atlas_data
- Curation: polity snapshot from PD atlas (3h tech + 0.5h historian): $115 offshore / $190 onshore / per snapshot (Rates assumed: tech $25/h offshore or $50/h onshore; historian $80/h) estimate (this report, cost.py)
- Curation: polity snapshot without PD source (6h + 1.5h): $270 / $420 / per snapshot (ESTIMATE) estimate (this report, cost.py)
- Curation: front-line snapshot from PD atlas (1h + 0.25h): $45 / $70 / per front-line snapshot (ESTIMATE) estimate (this report, cost.py)
- Curation: front-line snapshot without PD source (2.5h + 0.75h): $122.50 / $185 / per front-line snapshot (ESTIMATE) estimate (this report, cost.py)
- Curation: campaign arrow set from PD atlas (1.5h + 0.25h): $57.50 / $95 / per campaign map (ESTIMATE; non-PD $135 / $210) estimate (this report, cost.py)
- Top-50 gap fill, PD-sourced subset (1,442 tech h + 261.5 historian h): $56,970 offshore / $93,020 onshore / one-time (About 16 weeks with 3 technicians) estimate (this report, cost.py)
- Top-50 gap fill, everything (3,198.5 tech h + 740 historian h): $139,163 offshore / $219,125 onshore / one-time (Includes 315 non-PD front lines (200 = Ukraine weekly)) estimate (this report, cost.py)
- Live front-line upkeep (Ukraine weekly, in-house): $6,370 / per year (52 x $122.50; excludes legal risk and any licence) estimate (this report)
- Territory Composer LLM call (Sonnet 5.5, ~3k in / 1.5k out tokens): $0.021 (≈$0.011 with Batch API) / per polity-year recipe (Using brief's cached prices $2/$10 per 1M tokens) https://www.anthropic.com/pricing
- Euratlas GIS data, Extended licence: unknown (RFQ) / one-time licence (Site unreachable; break-even ~$2-5k as QA ground truth) https://www.euratlas.com
- GeaCron data licence: unknown (RFQ) / licence (Break-even ~$24k vs commissioning 88 non-PD polity snapshots) https://geacron.com
- Centennia Historical Atlas data licence: unknown (RFQ) / licence (Break-even ~$6k for polygons alone) https://www.historicalatlas.com
- CShapes 2.0 commercial licence (ETH ICR): unknown (RFQ) / licence (Public licence reported as CC BY-NC-SA 4.0) https://icr.ethz.ch/data/cshapes/
- ISW / DeepStateMap / Liveuamap licence for live fronts: unknown (RFQ) / per year (Worth up to ~$10-20k/yr only if live wars are required) https://deepstatemap.live
- IP counsel review of data stack and Cliopatria chain of title: $3,000-8,000 (ESTIMATE) / one-time (Unverified market rate) estimate (this report)
- Media E&O / IP liability insurance: $2,000-6,000 (ESTIMATE) / per year (Unverified; depends on revenue and jurisdiction) estimate (this report)

## RISKS
- Cliopatria chain of title is unproven: there is no written grant from Andrew Tollefson, and the source atlases are undisclosed. Risk is low in the US but medium in the EU because of the sui generis database right, and could force geometry replacement for top topics.
- The pedantic genre audience will spot errors. Defects found include Cliopatria's Ukraine 2022+ (6,907 km² 'occupied'), missing Prussia 1815-1863 and the Han 6-13 CE artefact; without a correction workflow these cause reputational damage.
- Inconsistent semantics (de jure vs de facto, colonies, vassals, occupations) across Cliopatria, OHM and others produce contradictory maps; 18-pair inter-dataset IoU median is only ~0.63.
- The Territory Composer hallucinates or overreaches: 7/10 pilot recipes were larger than the reference. Unsupervised generation will produce confidently wrong borders in close-up shots.
- OHM per-feature licence encumbrances: CC BY on ~6% of state-level border ways, a few BY-SA and GPL ways, ODbL-derived and imagery-traced sources, plus legacy ODbL contributions never relicensed (issue #377). OHM infrastructure is fragile (1 paid developer).
- Public-domain status pitfalls: URAA-restored foreign works (UK WWII official histories, possibly German Lagekarten), commercial reprints of West Point atlases adding copyrighted maps, and CMH volumes containing credited third-party maps.
- Live-conflict maps (Ukraine, Gaza, Sudan) bring copyright and database-right exposure (ISW/DeepState/Liveuamap), fast staleness, misinformation liability and platform-policy risk.
- Curation cost and time estimates (hours per map, $25-50/h technicians, $80/h historians) are unvalidated; a 2x overrun is plausible without a pilot sprint.
- Vendor licences (Euratlas, GeaCron, Centennia, CShapes commercial) may exclude SaaS rendering or user monetisation, or be priced above break-even, leaving non-European ancient and medieval gaps unfilled.
- Disputed modern borders (Kashmir, Crimea, Taiwan, Western Sahara) can breach national map laws (e.g., India, China) and alienate audiences; a per-market display policy is needed.
- Attribution non-compliance by end users (CC BY requires credit in published videos) could expose the platform; attribution must be automated and hard to remove.
- Several items could not be verified this session: OSF preprint text, vendor terms, West Point/CMH site statements, Wikidata live counts and YouTube popularity rankings. These conclusions should be fact-checked before commitments.

## QUESTIONS FOR FOUNDER
- Legal stance: will you launch on Cliopatria with a MEDIUM provenance rating if we get Seshat's written confirmation plus E&O insurance, or do you require full chain-of-title before launch?
- Budget: approve the PD-only top-50 curation (~$57k offshore / ~$93k onshore, ~16 weeks), the full top-50 (~$139k-219k), or a smaller pilot sprint (e.g., 5 topics) first to validate hours per map?
- Must v1 include live wars (Ukraine 2022+, Israel-Gaza)? If yes, are you willing to pay for an ISW/DeepState/Liveuamap licence and accept the added legal and moderation burden?
- Company jurisdiction and target markets: will you operate or sell in the EU (database-right exposure), India or China (map-display laws)?
- Are you comfortable auto-inserting source attribution (end card + description text) into every user video, and preventing users from removing it?
- Do you want a part-time historian editor (≈0.25-0.5 FTE) on staff, or a contractor marketplace model?
- Should curated, PD-sourced layers be contributed back to OpenHistoricalMap as CC0 (goodwill and community fixes) or kept proprietary as a moat?
- Who will contact Seshat, Euratlas, GeaCron, Centennia (Clockwork Mapping), ETH ICR and DeepState for quotes and permissions? I can draft the emails.
- Product policy: for out-of-scope topics (e.g., Khmer Empire, Maurya, Sudan), should the app refuse, warn ('approximate data') or generate with a visible confidence badge?
- Do you accept stylised 'uncertain border' visuals (blur/hatching) as part of the house style, or must every era show crisp borders?
- Do you need the products' WWII/WWI maps to depict modern-day disputed regions according to a specific country's official position?