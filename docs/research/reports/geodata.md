# Geospatial data, map assets and commercial licensing for an automated map-video SaaS

**Research date:** 2026-10-01

## How to read this report

Each claim carries one of these tags:

- **[V]** Verified this session from the official page or the official repo/LICENSE file. The URL is given.
- **[S]** Verified only through a search-engine summary of the official page. The proxy blocked the page itself (osmfoundation.org, protomaps.com, maptiler.com, mapbox.com, google.com, naturalearthdata.com, eox.at, gebco.net, hydrosheds.org, zenodo, ncbi and others), so these need a quick manual re-check.
- **[K]** From prior knowledge. Not re-checked this session.
- **[E]** My own estimate or opinion.

**Limits of this research.** This sandbox's outbound proxy allowed only GitHub domains. The shared web-search quota also ran out partway through. Tags [S] and [K] mark the claims that need a human to click through before the founder relies on them.

---

## 1. Executive summary: the recommended license-safe data stack

The main finding is that **commercial map providers are the wrong foundation for this product.**

- **Mapbox** forbids map content in video except incidental promotional use, unless you sign a separate agreement **[S]**.
- **Google** offers no commercial license for Google Earth imagery **[S]**. Its Map Tiles API (Photorealistic 3D) allows only promotional videos of 30 seconds or less, and no offline use **[S]**.
- **Esri World Imagery** is not available for commercial reproduction without written permission **[S]**.
- **MapTiler** does sell video licenses, but the self-serve one targets individual creators (100k subscribers or fewer) **[S]**. A SaaS that renders for thousands of users would need a custom deal.

The answer is to **self-host open data and render it with an open-source engine**. That gives clean licenses and close to zero marginal cost per video.

### Recommended stack

| Layer | Recommended source | License | Attribution in video? | Notes |
|---|---|---|---|---|
| Small-scale vectors (world, continents, countries, coasts, rivers, lakes, cities) | **Natural Earth** 1:10m/50m/110m, incl. 31 point-of-view (POV) country variants | Public domain [V] | Not required (courtesy) | Default for anything zoomed out further than ~z6. Zero attribution burden. |
| Large-scale basemap (roads, cities, buildings, water, landuse) | **Protomaps daily planet PMTiles** (OSM-derived) | Tiles: ODbL "Produced Work"; styles CC0; code BSD-3 [V] | **Yes: OSM** | ~120 GB for z0–15 [V]. Self-host one file on object storage. |
| Alternative OSM basemap | OpenFreeMap (OpenMapTiles schema) | Code MIT; data ODbL + OpenMapTiles CC-BY design [V] | Yes: OSM **and** "© OpenMapTiles" | Use only if you prefer the OpenMapTiles schema. Self-host; don't lean on the donation-funded public instance at render scale. |
| Globe and continental imagery | **NASA Blue Marble NG** (500 m, monthly) and **Black Marble** (night lights) | Public domain; no NASA endorsement or logos [S] | Courtesy | The "Earth from space" look for intros and globe spins. |
| Regional satellite (10 m) | **EOX Sentinel-2 cloudless 2016** | CC BY 4.0 [S] | **Yes** | 2018–2025 editions are CC BY-NC-SA. Commercial use of those needs the paid EOX license [S]. |
| Terrain (hillshade, 3D) | **Copernicus DEM GLO-30/GLO-90**, e.g. via Mapterhorn tiles or your own terrarium build | Free Copernicus licence, notice required [S] | **Yes** (Copernicus/DLR/Airbus notice) | Mapterhorn code BSD-3, data from Copernicus and others [S]. |
| Bathymetry | **GEBCO 2025 Grid** | Public domain, commercial OK, acknowledgement required [S] | **Yes** (short citation) | |
| Modern admin-1/2 | Natural Earth admin-1; **geoBoundaries gbOpen** (check per-country license) | PD / CC BY 4.0 (some ODbL or CC BY-SA) [S] | Yes for geoBoundaries | **Exclude GADM.** It is non-commercial without permission [S]. |
| Historical borders | **Cliopatria** (Seshat): 3400 BCE–2024 CE, ~1,633 polities, 13,765 rows | CC BY 4.0 [V] | **Yes** | Backbone dataset. Provenance needs a check (section 6). |
| Historical, crowd-sourced | **OpenHistoricalMap** | CC0, with some features CC BY/BY-SA [S] | Courtesy, except flagged features | Filter features by their license tags. |
| Ancient places and roads | **Pleiades** (CC BY 3.0) [S], **Itiner-e** Roman roads (CC BY 4.0) [S] | | Yes | Avoid DARE tiles (CC BY-SA 3.0) and AWMC (CC BY-NC) [S]. |
| Events (battles, sieges, treaties) | **Wikidata** (coordinates P625, dates P585/P580/P582, participants P710) | CC0 [K] | No | |
| Geocoding | Self-hosted **Photon** (Apache-2.0) [V], **GeoNames** (CC BY 4.0) [K], Wikidata, Pleiades | | GeoNames: yes | **Never use public Nominatim in production.** It is capped at 1 request/second [S]. |
| Icons | Iconify sets filtered by SPDX license: Material Symbols (Apache-2.0), Phosphor and Tabler (MIT), Lucide (ISC), Maki/Temaki (CC0), Health Icons (MIT), Game Icons (CC BY 3.0) [V] | | Only the CC BY sets | **Ban** OpenMoji (CC BY-SA), "Custom Brand Icons" (CC BY-NC-SA) and any NC/SA/ND set [V]. |
| Flags | flag-icons (MIT, 542 flags) [V], Noto region-flags (public domain) [V], in-house redraws of historical flags | | No | Wikimedia Commons historical flags vary file by file; often CC BY-SA. |
| Military symbols | **milsymbol** (MIT; MIL-STD-2525C/D/E, APP-6 B/D/E) [V] | | No | NATO-style unit markers for war videos. |
| Fonts and glyphs | Google Fonts (mostly OFL) [K]; Protomaps basemaps-assets fonts (OFL) and sprites (MIT) [V] | | No | OFL places no restriction on rendered output. |
| Textures and FX | ambientCG, Poly Haven (CC0) [K]; procedural shaders | | No | Rain, snow, smoke and fire are best done procedurally, which needs no license at all. |

**Bottom line [E]:** this whole stack fits in roughly **1.5–4 TB of storage**, costing about **US$25–60/month** on object storage. Add about **US$50–120/month** for a self-hosted geocoder. Per-video data cost comes out at roughly **US$0.001–0.01**, which is egress and request charges only. The real costs sit elsewhere: **attribution engineering**, **historical-border quality** and **disputed-border policy**.

---

## 2. Basemap vector tiles and styles

### 2.1 OpenStreetMap / ODbL: what a rendered video owes

- **A rendered video is a "Produced Work" under ODbL.** You must include a notice "reasonably calculated" to make viewers aware that the content came from OSM under ODbL [K: ODbL §4.3]. Share-alike does **not** reach the video itself.
- **Watch for derivative databases.** If you *publicly use* a Produced Work made from a **Derivative Database**, you must offer that derivative database under ODbL (ODbL §4.6) [K]. An example would be merging OSM features with your proprietary historical layers into one tileset.
  - **Mitigation:** keep OSM-derived layers and proprietary layers as **separate sources**, composited only at render time. The OSMF's community guidelines treat that as a "collective database" [K]. Build the historical layer only from non-OSM sources (Natural Earth, Cliopatria, CC0 data).
- **Video guidance [S]**, from a search summary of the OSMF attribution guidance pages (the primary page was blocked, so this needs a re-check):
  - Where OSM is a major part of the production, attribution ("© OpenStreetMap" or "Map data from OpenStreetMap") should appear **in a corner of the map**.
  - That is **in addition to** attribution in the end credits or the description, which must include the openstreetmap.org/copyright URL.
  - Where the map is incidental, credits or description alone may be enough.
  - Sources: https://wiki.openstreetmap.org/wiki/Open_Data_License/Community_Guidelines/Attribution_For_Different_Media_Types and https://osmfoundation.org/wiki/Licence/Attribution_Guidelines
- **Recommendation [E]:** whenever an OSM-derived layer is visible, burn a small "© OpenStreetMap" into a corner of the frame. Also put the full credit in the description and on a per-video credits page. Map videos are "map-focused" by definition, so description-only attribution is a risk.

### 2.2 Provider comparison

| Provider | License / ToS for our use case | Cost | Verdict |
|---|---|---|---|
| **Protomaps** (PMTiles, daily builds) | Tiles are an ODbL Produced Work, OSM attribution required. Styles CC0 (Protomaps credit requested, not required). Code BSD-3. Forks or tile APIs must not be called "Protomaps" [V] https://github.com/protomaps/basemaps | Free download, ~120 GB for z0–15. Each extra zoom level roughly doubles size [V] (protomaps/docs → docs.protomaps.com/basemaps/downloads). A search snippet gave 138.4 GB for the 2026-09-28 build [S, unverified]. | **Primary choice.** One file; HTTP range reads from R2/S3; no tile server needed. |
| **OpenFreeMap** | Code MIT; public instance free with "no limits on the number of map views or requests"; attribution required (OpenFreeMap, OpenMapTiles, OSM) [V] https://github.com/hyperknot/openfreemap | Free; weekly planet in Btrfs/MBTiles | Good for dev and preview. **Self-host for production rendering**, because the public instance runs on donations. |
| **OpenMapTiles** (schema) | Code BSD; schema/cartography CC-BY; must credit "© OpenMapTiles © OpenStreetMap contributors" [V] https://github.com/openmaptiles/openmaptiles | Free (self-generate) | Adds a second credit line. Prefer Protomaps unless you need this schema. |
| **VersaTiles** | Software MIT [V]; tile data is OSM (ODbL) | Free | Viable alternative; no advantage for video. |
| **MapTiler Cloud** | Terms allow commercial derivative work including video, but video/game exports "require contacting MapTiler". A Flex-tier video license is described for individual creators with ≤100k subscribers [S] https://www.maptiler.com/cloud/pricing/ | Flex ~$25–30/mo (sources conflict); Unlimited $295/mo [S] | Possible **premium partner** for high-res satellite or 3D through a custom SaaS deal. Not for the core stack. |
| **Mapbox** | Product Terms: no Licensed Map Content in printed or video media except as expressly set out. Free rights only to *promote your Licensed Application* with incidental map content. Studio limited to 100 high-res static exports per account lifetime. Commercial video means contacting Mapbox [S] (Product Terms Oct 2025 PDF; https://docs.mapbox.com/help/dive-deeper/static-maps/) | Custom | **Do not use.** Also avoid Mapbox GL JS v2+, which is under a proprietary license tied to Mapbox billing [K]. Use **MapLibre GL** (BSD-3) [K]. |
| **Stadia Maps** | Hosted OSM/OpenMapTiles-based styles; check ToS for print/video [K] | Paid tiers roughly $20–250/mo [K, unverified] | Unnecessary if self-hosting. |
| **Esri basemaps** | World Imagery "not available for commercial use… may not be reproduced or transmitted for commercial purposes, except as expressly permitted in writing by Esri"; export layer needs an ArcGIS subscription [S] (Esri Community/ArcGIS item pages) | Subscription | **Do not use.** |
| **Google Maps Platform / Earth Studio** | Map Tiles API policies: no caching/extraction/offline use; promotional videos only, ≤30 s, about your app, marked "for promotional purposes only" [S] https://developers.google.com/maps/documentation/tile/policies. Earth Studio: "Google currently does not offer a license to use Google Earth imagery for commercial applications"; it is free for news, research, education and non-profit use [S] https://www.google.com/earth/studio/faq/. Google's geo guidelines let *individual creators* use Earth content in monetized YouTube videos for educational or entertainment purposes with attribution [S]. That is a personal permission with no API, not a license for a SaaS to generate content automatically [E]. | Free, but unlicensable for us | **Exclude from automated rendering.** At most, let users upload their own Earth Studio clips under their own responsibility (put this in the ToS). |

---

## 3. Satellite and Earth-observation imagery

| Source | Resolution | License | Commercial video? | Attribution |
|---|---|---|---|---|
| **NASA Blue Marble NG** | 500 m, 12 monthly mosaics | US government work, not copyrighted; must not imply NASA endorsement; NASA logos/insignia restricted [S] https://www.nasa.gov/nasa-brand-center/images-and-media/ | **Yes** | "NASA Earth Observatory / Blue Marble" (courtesy) |
| **NASA Black Marble** (VIIRS night lights) | ~500 m; 2012 & 2016 composites, plus annual/monthly products on LAADS [S] https://viirsland.gsfc.nasa.gov/Products/NASA/BlackMarble.html | Same NASA policy | **Yes** | Courtesy |
| **NASA GIBS / Worldview** (daily MODIS/VIIRS true colour, fires, smoke) | 250 m–1 km | NASA open data policy [K] | **Yes** [K] | Courtesy. Good for *date-accurate* storms, wildfire smoke and snow cover, which give a premium "real event" look. |
| **EOX Sentinel-2 cloudless 2016** | 10 m | **CC BY 4.0** [S] https://eox.at/2025/03/sentinel-2-cloudless-2024/ | **Yes** | "Sentinel-2 cloudless – https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)" [K wording] |
| **EOX cloudless 2018–2024 and EOxCloudless 2025** (released June 2026 [S]) | 10 m | **CC BY-NC-SA 4.0**. Commercial use needs the "EOX Commercial Attribution-RestrictedUse 1.1" license; price not public [S] https://cloudless.eox.at/pricing | Only with the paid license | |
| **Raw Copernicus Sentinel-2 / Landsat** | 10 m / 30 m | Copernicus: free, full and open, credit "Contains modified Copernicus Sentinel data [year]" [K]. Landsat: US public domain [K] | **Yes** | Building your own cloudless mosaic is real engineering (STAC + cloud masking + compositing). Phase 2 at most. |
| **Esri World Imagery, Mapbox Satellite, Google** | sub-metre | Restricted (section 2.2) | **No** without contracts | |
| **MapTiler Satellite** | high-res | Commercial terms; video needs a custom deal [S] | Negotiable | Candidate for a paid "4K close-up" tier. |

**Practical point [E].** The 2016 EOX mosaic is the only free, commercial-OK, global 10 m cloud-free basemap. It shows its age: some seams, haze and dated land cover. Most top channels **stylise** satellite imagery anyway (colour grading, desaturation, painterly filters), which hides those flaws. EOX also sells downloads of the original GeoTIFF tiles [S] (https://eox.at/2017/03/sentinel-2-cloudless-original-tiles-available/). Even under CC BY you may need to buy the bulk data, because bulk-scraping their WMTS for a SaaS would be poor practice. Ask EOX for a quote on the 2016 bulk data plus a commercial license for 2024/2025.

---

## 4. Elevation, terrain and bathymetry

| Source | License | Attribution | Notes |
|---|---|---|---|
| **Copernicus DEM GLO-30 / GLO-90** | Free licence for the general public. GLO-30 was formerly restricted for Armenia/Azerbaijan; newer versions released Armenia, Azerbaijan and Moldova [S] https://docs.sentinel-hub.com/api/latest/static/files/data/dem/resources/license/License-COPDEM-30.pdf | Required notice when modified: "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved" [S] | Best global DEM. The long credit goes in the description or credits page. |
| **Mapterhorn** | Code BSD-3; tiles are Terrarium WebP at 512 px, in planet.pmtiles for low zooms plus high-zoom files; data mainly Copernicus DEM, with swissALTI3D etc. at high resolution [V/S] https://github.com/mapterhorn/mapterhorn | "© Mapterhorn" plus source list at mapterhorn.com/attribution [S] | Whole archive 9.8 TiB [S]. You only need low and mid zooms. Mirror rather than hot-link. |
| **AWS Terrain Tiles** (Mapzen/Tilezen "terrarium") | Mixed open sources | Required list: USGS (SRTM/3DEP/GMTED), "Produced using Copernicus data…" (EU-DEM), ETOPO1/NOAA, plus national agencies (AU, AT, CA, MX, NZ, NO, UK) [V] https://github.com/tilezen/joerd/blob/master/docs/attribution.md | Older (c. 2017), but free and z0–15. |
| **SRTM** | US public domain [K] | Courtesy (USGS/NASA) | Superseded by Copernicus for quality. |
| **GEBCO 2025 Grid** | Public domain; commercial use explicitly allowed; must not imply endorsement [S] https://www.gebco.net/data-products-gridded-bathymetry-data/gebco2025-grid | "GEBCO Compilation Group (2025) GEBCO 2025 Grid (doi:10.5285/37c52e96-24ea-67ce-e063-7086abc05f29)" [S] | 15 arc-second global (86400×43200, ~7.5 GB as int16 [E]). |
| **Natural Earth shaded relief / NE II rasters** | Public domain [V] https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md | None | Perfect for the classic "atlas" style at low zooms. Natural Earth III (shadedrelief.com) has its own terms, which I could not fetch [K]. |

---

## 5. Modern political boundaries and disputed borders

### 5.1 Datasets

- **Natural Earth Admin-0/1** [V/S]
  - Public domain; "no permission is needed".
  - Draws borders by **de facto control**.
  - Since v5 it ships **31 pre-built point-of-view variants**, `ne_10m_admin_0_countries_<iso3>`, including India (IND) and China (CHN). Each has `fclass_*` worldview attributes.
  - Sources: https://github.com/nvkelso/natural-earth-vector/blob/master/packages/Natural_Earth_quick_start/LOCALIZATION.md and https://www.naturalearthdata.com/about/terms-of-use/
  - **This is the key asset for a worldview feature.**
- **geoBoundaries** [S]
  - gbOpen is CC BY 4.0 compatible, but some countries are ODbL or CC BY-SA, so check per-file metadata.
  - gbAuthoritative (UN SALB) **cannot be used commercially**.
  - The CGAZ composite is clipped to US State Department boundaries [V].
  - Source: https://github.com/geoBoundaryBot/geoBoundaries
- **GADM:** "freely available for academic use and other non-commercial use. Redistribution, or commercial use is not allowed without prior permission" [S] https://gadm.org/license.html. **Exclude.**
- **Overture Maps** [S]: Divisions theme is **ODbL** (OSM-derived); Places is **CDLA-Permissive-2.0** (no share-alike). Source: https://docs.overturemaps.org/attribution/
- **OSM boundaries:** ODbL, same Produced Work rules as section 2.1.
- **UN boundaries (UNGIS / UN Clear Map):** in my understanding, terms carry restrictions and disclaimers [K, unverified]. Not needed.

### 5.2 Legal and regulatory risk from disputed borders

- **India.** The Criminal Law Amendment Act 1961 §2(2) punishes publishing "a map of India which is not in conformity with the maps of India as published by the Survey of India" with up to 6 months' imprisonment and/or a fine. §2(1) covers questioning territorial integrity (up to 3 years) [S] https://www.mha.gov.in/sites/default/files/CriminalLawAmendmentAct1961.pdf. The 2016 draft Geospatial Information Regulation Bill (₹1–100 crore fines, 7 years) **was never enacted** [S] https://en.wikipedia.org/wiki/Geospatial_Information_Regulation_Bill.
- **China.** Maps and map-bearing products need vetting. In October 2025 customs seized 60,000 export maps for "mislabelling" Taiwan and omitting the nine-dash line. Reported fines run from CNY 10k to 500k, with possible licence revocation [S] https://hongkongfp.com/2025/10/16/chinese-customs-seize-60000-problematic-maps-over-mislabelling-taiwan-omitting-south-china-sea-claims/.
- **Others [K, unverified]:** Argentina (Malvinas/Antarctic depiction rules), Morocco (Western Sahara), Russia/Ukraine (Crimea, the 2022-annexed oblasts), Israel/Palestine, Cyprus, Kosovo, the Japan–Korea islands, and the Ethiopia/Somaliland region.
- **Practical exposure [E].** A foreign SaaS without staff, entities or servers in India or China has low *direct* enforcement risk. The real risks are:
  - **(a)** platform complaints and audience backlash, which hurts users' channels;
  - **(b)** risk if you later open an India or China entity, or sell to schools or governments there;
  - **(c)** app-store and payment-partner pressure.
- **Product mitigation:**
  - A per-video `worldview` setting built from the Natural Earth POV variants.
  - Default: de facto borders, with disputed areas drawn hatched or dashed and given neutral labels.
  - Auto-suggest the IND or CHN POV when the user's channel locale or topic indicates it.
  - Sensitivity flags in the script planner for known hotspots.
  - ToS language making the user responsible for published content.
  - A "Disputed borders shown as…" disclaimer card that users can toggle.

---

## 6. Historical borders and historical geodata (the core differentiator)

### 6.1 Source-by-source licensing

| Source | Coverage | License | Usable in user-monetized videos? |
|---|---|---|---|
| **Cliopatria** (Seshat) | 3400 BCE–2024 CE, worldwide polities | **CC BY 4.0** [V] https://github.com/Seshat-Global-History-Databank/cliopatria (LICENSE.md) | **Yes, with attribution** and a "changes made" note. Provenance caveat below. |
| **OpenHistoricalMap** | Crowd-sourced; patchy but growing | **CC0**, except some features under CC BY / CC BY-SA [S] https://www.openhistoricalmap.org/copyright | Yes (CC0 part). Filter out SA features using their source/license tags. |
| **aourednik/historical-basemaps** | ~50 world snapshots from antiquity to 2010 | **GPL-3.0** [V] https://github.com/aourednik/historical-basemaps/blob/master/LICENSE. README: "work in progress", sources "collected, adapted and converted from diverse sources, sometimes only available through the wayback machine" (e.g. ThinkQuest) [V] | **Avoid in production.** A copyleft software license on data is ambiguous, and upstream provenance is unclear. Use only for internal QA comparison. |
| **CShapes 2.0** (ETH ICR) | States 1886–2019 | **CC BY-NC-SA 4.0** [S] https://icr.ethz.ch/data/cshapes/ | **No** (non-commercial). Ask ETH for a commercial license if wanted. |
| **Chronas** | Province-level, year by year, 1–2000 CE | Data **CC BY-SA 4.0**, "substantially derived from Wikipedia" [V] https://github.com/Chronasorg/chronas-api/blob/master/DATA-LICENSE.md | **Avoid.** Share-alike would arguably push BY-SA onto users' videos. |
| **Euratlas** | Europe/Mediterranean (15°W–50°E, 20–60°N), one snapshot per century, 1–2000 | Commercial. Simple license ~€100–160 per snapshot; Extended ~€480–640 + VAT; site licence also offered [S] https://www.euratlas.net/shop/maps_gis/gis_1700.html | **Possibly**, if the Extended license covers SaaS-rendered videos. Must be confirmed in writing. All ~20 snapshots at Extended ≈ €10–13k [E]. High-value for the Europe-centric history niche. |
| **GeaCron** | World, 3000 BC to today, year by year | Commercial offer; KML/shapefile exports [S] https://geacron.com/the-geacron-project/ | Contact them. Their year-level granularity could be the best commercial option. |
| **Ancient World Mapping Center** (UNC) | Roman provinces, ancient coastlines | **CC BY-NC** (3.0/4.0) [S] https://awmc.unc.edu/maps/ | **No.** |
| **Pleiades** | ~41k ancient places | **CC BY 3.0** [S] https://pleiades.stoa.org/ | **Yes**, attribution required. |
| **DARE** (Digital Atlas of the Roman Empire) | Roman places and map tiles | **CC BY-SA 3.0** [S] https://imperium.ahlfeldt.se/ | Avoid the tiles (SA). Gazetteer facts are lower-risk, but EU database right applies to bulk extraction [K]. Use Pleiades instead. |
| **Itiner-e** | 299,171 km of Roman roads (Scientific Data, Nov 2025) | **CC BY 4.0** [S] https://www.nature.com/articles/s41597-025-06140-z | **Yes.** Excellent "roads drawing themselves" content. |
| **World Historical Gazetteer** | Aggregator | Aggregate DB is **CC BY-NC 4.0**; each dataset keeps its own licence (21 licences tracked) [S] https://whgazetteer.org/licenses/ | Don't bulk-ingest WHG. Go to the permissive underlying sources directly. |
| **Wikidata** | Battles, treaties, sieges, people, capitals with coordinates and dates | **CC0** [K] | **Yes.** The structured event backbone. |
| **Wikipedia / Commons maps** | Huge | CC BY-SA, mostly | Use as **LLM research input only**, never as rendered geometry or images. Facts are not copyrightable. |

### 6.2 Cliopatria: what it covers, and its gaps

I downloaded the current release (`cliopatria.geojson.zip`, 44 MB zipped / 166 MB GeoJSON) and analysed it [V, measured].

**Contents:**
- 13,765 rows: 13,380 POLITY and 385 RELATION.
- 1,633 unique names.
- Each row has FromYear/ToYear, Area, Wikipedia, Wikidata, SeshatID, Components and MemberOf fields.
- Median row span is 8 years, so smooth year-by-year border animation is feasible.

**Active polities by year** (centroid-based region buckets, [E] approximate):

| Year | Active polities | Notes |
|---|---|---|
| 3000 BCE | 4 | Egypt/Mesopotamia/Indus only |
| 1000 BCE | 12 | Very sparse |
| 500 BCE | 48 | Achaemenid era reasonably covered |
| 1 CE | 45 | Americas: 3 |
| 1000 CE | 133 | Europe/Near East-heavy (76) |
| 1500 CE | 141 | Americas: 5 |
| 1800 CE | 128 | Americas: 9 |
| 1939 | 86 | Colonial empires aggregated (e.g. "British Africa", "French Africa") |
| 2024 | 195 | |

**Gaps and quality issues:**
- **(a)** Pre-1000 BCE is thin.
- **(b)** The pre-Columbian Americas, sub-Saharan Africa, Southeast Asia and Oceania are under-represented before the 19th century.
- **(c)** It holds polity extents only: **no front lines, occupation zones, provinces, tribal territories or month-level war dynamics**. That is exactly what war videos need.
- **(d)** Label QA is needed. For 1939 the file includes rows named "Denmark-Norway", "Kingdom of Great Britain", "Principality of Bulgaria" and "First Hellenic Republic". These anachronistic names show the need for a curated override layer.

**Provenance caveat.** The README links its "construction, and source material" to an OSF preprint (https://osf.io/preprints/socarxiv/24wd6) that I could not open. The Zenodo record mentions "original images" [S]. If the polygons were digitised from copyrighted atlases, CC BY 4.0 may not fully clear them.
- In the US, borders as facts and their rough geometry have thin protection [K]. EU database right is a separate question.
- **Get counsel to read the preprint's sources section before launch.** Keep the option of swapping in Euratlas/GeaCron licensed data for affected regions.

### 6.3 A "Territory Composer" for when no dataset exists (LLM + gazetteer + geometry)

The goal is to generate plausible, clearly labelled *approximate* territories, front lines and campaign zones.

1. **Research.** The LLM, with web research, produces a structured "territory recipe" in JSON per polity per keyframe. It contains:
   - `include_units`: modern admin-1/2 IDs from Natural Earth or geoBoundaries, or Wikidata QIDs with P131 chains;
   - `include_points`: cities or forts held, each resolved through Wikidata, Pleiades or GeoNames, with a source citation;
   - `exclude_points`;
   - `natural_boundaries`: rivers from Natural Earth or HydroRIVERS, ridgelines, coastlines;
   - `buffer_networks`: for steppe or riverine polities, buffers around roads, rivers or oases (e.g. Itiner-e roads);
   - `anchor_dataset`: the closest Cliopatria or OHM polygon, if any;
   - `confidence`: low, medium or high;
   - `sources`.
2. **Geometry engine.** This step is deterministic (Turf/JSTS or shapely), with no LLM geometry.
   - Union the included units.
   - Clip to era-appropriate coastline and land.
   - Cut along river polylines.
   - For contested zones, use constrained Voronoi partitions between competing polities' held points.
   - Apply morphological smoothing to remove "modern admin-border" artefacts, then simplify.
   - For front lines, interpolate between dated control points (e.g. "city X captured on date Y", from Wikidata or Wikipedia text) to get monthly lines.
3. **Validation.**
   - Every `include_point` must be inside and every `exclude_point` outside.
   - Area must fall within ±X% of known area (Wikidata P2046, or Seshat territory variables).
   - Measure IoU against Cliopatria neighbours in time, and topology continuity across keyframes (no teleporting borders).
   - Run an LLM critic pass against the cited sources.
4. **Honest rendering.**
   - Low-confidence borders get soft or feathered edges, hatching, "approx." labels and an on-screen "approximate borders" note.
   - The user can edit any polygon in the editor.
5. **Flywheel (moat).**
   - Every user-corrected or reviewed polygon goes into a proprietary curated library, built **only** from PD/CC0/CC BY inputs and kept separate from OSM.
   - Commission a historian/GIS contractor for the 200 most-requested topics (Rome, Mongols, Napoleon, WWI/WWII, Ottomans, Crusades, US Civil War, Partition, etc.).

**Risks:**
- Hallucinated borders presented as fact. That damages trust, and the "map accuracy" comment sections on YouTube are brutal.
- Anachronism from modern admin units.
- Politically sensitive historical maps (Partition 1947, Israel/Palestine 1947–49, Kashmir, Crimea, Taiwan).
- Use of current-war control maps from ISW, DeepStateMap or Liveuamap, which are copyrighted [K] and must **not** be traced.

---

## 7. Gazetteers and geocoding

| Tool / data | License | Notes |
|---|---|---|
| **Nominatim public API** | OSMF policy: absolute max 1 request/second; bulk geocoding discouraged; caching required; the policy does not apply to self-hosted instances [S] https://operations.osmfoundation.org/policies/nominatim/ | Dev only. Software is GPL-2 [K]; fine as a self-hosted service. |
| **Photon** (komoot) | **Apache-2.0** [V] https://github.com/komoot/photon | Weekly worldwide dumps from GraphHopper. Worldwide index **~95 GB disk** (2026), grows ~10%/yr. **64 GB RAM recommended**, NVMe SSD, Java 21+ [V]. Results are OSM data, so ODbL attribution applies. |
| **Pelias** | **MIT** [V] https://github.com/pelias/pelias | Elasticsearch-based; imports OSM, OpenAddresses, Who's On First and GeoNames. Heavier to run than Photon. |
| **GeoNames** | **CC BY 4.0** [K] | ~12M names. `cities500` / `allCountries` dumps; credit "GeoNames". |
| **Who's On First** | Mapzen's work CC0; per-source licences inside (GeoNames CC BY, Quattroshapes CC BY, Natural Earth PD) [V] https://github.com/whosonfirst-data/whosonfirst-data | Good hierarchy and admin polygons. Linking to the licence is required. |
| **Wikidata** | **CC0** [K] | Best for historical names, events, coordinates and dates. |
| **Overture Places** | **CDLA-Permissive-2.0** (no share-alike) [S] | Modern POIs; rarely needed for history videos. |
| **Pleiades** | CC BY 3.0 [S] | Ancient names ↔ coordinates. |

**Recommendation [E].** A typical video needs only 20–200 place resolutions. Build a **local "place resolver" service** on SQLite/Postgres full-text search. It should cover GeoNames `cities500`, Wikidata places with P625, and Pleiades, with an LLM disambiguation step that checks coordinates against scene context. Add self-hosted Photon later for street-level modern topics. Avoid commercial geocoders (Google, Mapbox), whose ToS restrict storing results and showing them on non-provider maps [K].

---

## 8. Rivers, coasts, lakes, cities and roads

- **Natural Earth:** rivers and lake centrelines, lakes, coastlines, populated places, roads and railroads at 10m/50m/110m. **Public domain** [V]. Covers most video needs.
- **HydroSHEDS / HydroRIVERS / HydroLAKES:** detailed global rivers with stream order, good for "rivers light up" effects. In my understanding the current license is **CC BY 4.0** (it changed from an earlier custom license) [K, unverified, as hydrosheds.org was blocked]. Confirm before use.
- **OSM** (via Protomaps tiles): city-scale streets, buildings, rail and waterways. ODbL attribution.
- **Itiner-e** (Roman roads, CC BY 4.0) and **Pleiades**: ancient networks.
- **Historical coastlines and sea levels** (e.g. the Ice Age Doggerland/Beringia look): derive from **GEBCO** by thresholding at −120 m. That is PD-derived and needs no extra license [E].

---

## 9. Visual assets: flags, arms, icons, military symbols, fonts and textures

### 9.1 Flags and coats of arms

- **flag-icons:** MIT, 4×3 and 1×1 SVGs [V] https://github.com/lipis/flag-icons. Iconify lists 542 flags [V].
- **Circle Flags:** MIT [V via Iconify].
- **Noto region-flags:** "public domain or otherwise exempt from copyright" [V] https://github.com/googlefonts/noto-emoji.
- **Historical flags and coats of arms (Wikimedia Commons):** the *design* of an old flag is usually public domain, but a specific SVG *rendering* may be CC BY-SA or CC BY [K].
  - **Approach:** commission in-house redraws of about 300 key historical flags and banners (Roman vexilla, Mongol tug, crusader banners, imperial standards). Or ingest only Commons files whose `extmetadata.LicenseShortName` is PD/CC0, and store the license per asset.
- **State emblems** are protected from use *as trademarks* (Paris Convention Art. 6ter) [K]. Editorial use in videos is fine. Never put them in your own branding.

### 9.2 Icon sets

These come from Iconify's `collections.md`, which records each set's license [V] https://raw.githubusercontent.com/iconify/icon-sets/master/collections.md. Allow-list sets by SPDX ID automatically.

- **Allow, no attribution needed:**
  - Material Symbols: Apache-2.0, 15,717 icons
  - Phosphor: MIT, 9,072
  - Tabler: MIT, 6,220
  - Lucide: ISC
  - Bootstrap and Heroicons: MIT
  - Health Icons: MIT, 2,042
  - Maki: CC0, 215
  - Temaki: CC0, 557
  - Fluent Emoji Flat: MIT
  - Noto Emoji: Apache-2.0 images, OFL fonts [V]
  - Weather Icons and Map Icons: OFL
- **Allow, attribution required:**
  - **Game Icons:** CC BY 3.0, 4,133 icons. Swords, shields, catapults and helmets make it ideal for war videos. Its license.txt asks for "Icons made by {author}" [V] https://github.com/game-icons/icons
  - **Twemoji:** graphics CC BY 4.0 [V] https://github.com/jdecked/twemoji
  - **Font Awesome Free:** icons CC BY 4.0, fonts OFL, code MIT [V] https://github.com/FortAwesome/Font-Awesome
- **Block:**
  - OpenMoji: CC BY-SA 4.0, share-alike [V]
  - Custom Brand Icons: CC BY-NC-SA [V]
  - Any NC, ND or SA set

### 9.3 Military symbology

**milsymbol:** MIT; supports MIL-STD-2525C/D/E, STANAG APP-6 B/D/E and FM 1-02.2 [V] https://github.com/spatialillusions/milsymbol. It generates SVG/canvas unit symbols (infantry, armour, artillery, echelon markers) that can be animated along arrows.

### 9.4 Fonts and map-label glyphs

- **Google Fonts:** almost all OFL 1.1, some Apache-2.0 or UFL [K]. OFL puts no restriction on rendered pixels or video.
- **Noto Sans/Serif** cover nearly all scripts, which you need for multi-language.
- **Stylistic families (all OFL [K]):** Cinzel (Roman), IM Fell (old atlas), Playfair, Oswald, Bebas Neue.
- **Glyph PBFs** for MapLibre: build them with maplibre/font-maker or a similar tool. Or use the Protomaps basemaps-assets fonts (OFL) and sprites (MIT, from tangrams/icons) [V] https://github.com/protomaps/basemaps-assets.
- **Recommendation [E]:** render hero labels and callouts as SVG/DOM/canvas overlays, not map-engine labels. That gives full typographic and animation control and avoids glyph-PBF limits.

### 9.5 Textures and effects

- **ambientCG and Poly Haven:** CC0 PBR textures and HDRIs [K]. Use for parchment, paper and terrain materials.
- **Rain, snow, fog of war, fire and smoke:** procedural (GLSL/WebGL particles, noise), which needs no licensing.
- **Optional data-driven weather:** ERA5 reanalysis through the Copernicus Climate Data Store. The licence allows commercial use with attribution [K, verify].

---

## 10. Attribution obligations and how to meet them in a video

### 10.1 What each layer requires

| Layer | Minimum required | Recommended placement |
|---|---|---|
| OSM-derived tiles (Protomaps/OpenFreeMap/Photon results shown) | "© OpenStreetMap contributors" + link to openstreetmap.org/copyright | **On-frame corner while visible** + description + credits page |
| OpenMapTiles schema (only if used) | "© OpenMapTiles" | Same as OSM |
| EOX S2 cloudless 2016 | EOX + Copernicus Sentinel credit, CC BY 4.0 | On-frame small credit during satellite shots (best practice) + description |
| Copernicus DEM | The DLR/Airbus/ESA notice | Description / credits page |
| GEBCO | Citation | Description / credits page |
| Cliopatria, Pleiades, Itiner-e, geoBoundaries, GeoNames | Creator, license, link, and "modified" | Description / credits page |
| Game Icons, Twemoji, Font Awesome icons | Author(s) + license | Credits page (link in description) |
| NASA, Natural Earth, Wikidata, CC0 assets | None (courtesy) | Credits page |

**CC BY 4.0 works in our favour.** Its §3(a)(2) says attribution can be given "in any reasonable manner based on the medium", including through a URI to a resource that holds the required information [K]. So a **per-video public credits URL** in the description is a defensible way to satisfy CC BY 4.0. CC BY 3.0 sources (Game Icons, Pleiades) need credit "reasonable to the medium" [K]; a credits page plus a description line should also do. OSM's map-focused guidance is the one that pushes for **on-frame** attribution.

### 10.2 Implementation: a credits manifest

- **Track usage.** Every asset and dataset in the registry carries `license_spdx`, `attribution_text`, `on_frame_required` and `share_alike` fields. The renderer logs which ones actually appeared in each scene.
- **Generate attribution automatically** from that log:
  - an on-frame micro-credit layer: 8–10 px equivalent, bottom corner, styled per preset and safe-area aware for 9:16 UI overlays;
  - an optional 1.5 s end card (off by default for Shorts);
  - a ready-to-paste **YouTube/TikTok description block**;
  - a permanent public **credits page** (`/credits/{videoId}`).
- **Make attribution unremovable.** Users on any tier, including white-label, cannot switch off *required* on-frame credits. Put this in the ToS.
- **Enforce the license policy in CI:** reject any asset whose license isn't on the allow-list (PD, CC0, MIT, Apache-2.0, BSD, ISC, OFL, CC BY 3.0/4.0, ODbL as Produced Work).

**Example description block:**

> Map data © OpenStreetMap contributors (ODbL) – openstreetmap.org/copyright · Natural Earth (public domain) · Imagery: NASA Blue Marble & Black Marble; Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016 & 2017), CC BY 4.0 · Elevation: produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the EU and ESA · Bathymetry: GEBCO 2025 Grid · Historical borders adapted from Cliopatria (Seshat Global History Databank), CC BY 4.0 · Full credits: https://<app>/credits/<id>

---

## 11. Storage and self-hosting cost estimates

### 11.1 Tile pyramid sizes

Method [E]: count tiles as 4^z per zoom, assume ~30–40% of tiles need storing (land, with ocean tiles deduplicated by PMTiles), and assume ~15–25 KB per 256 px WebP satellite tile.

| Dataset | Zoom range | Estimated size | Basis |
|---|---|---|---|
| Protomaps planet (OSM vector) | z0–15 | **~120 GB** (138 GB per one unverified snippet) | [V] docs; [S] snippet |
| Protomaps planet | z0–14 | ~60–70 GB | "each zoom roughly doubles" [V], [E] |
| Natural Earth (all vectors) | n/a | <1 GB; rasters a few GB | [E] |
| NASA Blue Marble NG (one or two months) | z0–9 (~305 m/px at 256 px) | ~2–6 GB per month variant | [E] |
| NASA Black Marble 2016 | z0–8 | ~1–3 GB | [E] |
| EOX S2 cloudless 2016 (10 m) | z0–12 | ~80–200 GB | [E] |
|  | z0–13 | ~0.3–0.8 TB | [E] |
|  | z0–14 (native 10 m) | ~1.2–3 TB | [E] |
| Terrain (Copernicus 30 m as Terrarium WebP, 512 px) | z0–11 | ~0.1–0.3 TB (whole Mapterhorn archive incl. high-res national data: 9.8 TiB [S]) | [E] |
| GEBCO 2025 grid | source | ~7.5 GB raw; a few GB as tiles | [E] |
| Cliopatria | n/a | 44 MB zip / 166 MB GeoJSON | [V] measured |
| Photon worldwide index | n/a | ~95 GB disk, 64 GB RAM recommended | [V] |

### 11.2 Monthly and per-video cost

- **Total hot data:** about 1.5–4 TB, depending on the satellite max zoom. **Start with S2 at z0–13** (~0.5 TB). Most map videos rarely need 10 m satellite detail, and city close-ups can use OSM vector styling.
- **Storage:**
  - Cloudflare R2 runs about $0.015/GB-month with zero egress [K, verify at https://developers.cloudflare.com/r2/pricing/]. That gives 1.5–4 TB ≈ **$22–60/month**.
  - Alternative: one dedicated server with 2×4–8 TB NVMe at roughly €60–120/month [E]. It holds everything plus Photon, colocated with the render workers.
- **One-time processing** (gdal/rio-pmtiles builds of the S2, BMNG and terrain pyramids): tens to a few hundred CPU-hours, roughly **<$100** on spot instances [E].
- **Per-video variable cost:**
  - A 60 s video with 3–6 camera moves reads maybe 2k–20k tiles (50–500 MB).
  - With R2 (free egress, ~$0.36 per million Class-B reads [K]) plus a node-local tile cache, that is roughly **$0.001–0.01 per video** [E].
  - Data is a rounding error next to TTS, LLM and render compute.
- **Hidden fixed costs [E]:**
  - legal review of the data stack: ~$2k–10k one-time;
  - optional EOX commercial license for recent imagery: price on request;
  - optional Euratlas Extended licenses: ~€10–13k for all snapshots;
  - historian/GIS curation contractor: ongoing.

---

## 12. Open items I could not verify (re-check manually)

1. The exact wording of the OSMF Attribution Guidelines' video section (osmfoundation.org blocked).
2. The current Mapbox Product Terms text, and MapTiler's video-license terms and prices (sources conflict: $25 vs $30).
3. EOX commercial license pricing, and whether the 2016 bulk GeoTIFFs must be bought.
4. The Cliopatria source-material preprint (OSF) for provenance.
5. HydroSHEDS' current license.
6. GeoNames CC BY 4.0, Wikidata CC0, ambientCG/Poly Haven CC0, and Google Fonts licensing (high confidence, but not re-checked this session).
7. Cloudflare R2 prices.
8. Euratlas and GeaCron license terms for SaaS video rendering. Email both.


## KEY RECOMMENDATIONS
- Self-host all map data and render with open-source engines (MapLibre GL, deck.gl, three.js), never with third-party tile APIs at render time. Licensing stays clean and per-video data cost drops to roughly $0.001-0.01.
- Use Protomaps daily planet PMTiles (~120 GB, ODbL Produced Work) for detailed basemaps and Natural Earth (public domain, 31 point-of-view variants) for everything zoomed out. Together they cover nearly every scene with minimal attribution.
- Exclude Mapbox, Google (Earth Studio and Photorealistic 3D Tiles), Esri imagery and GADM from the automated pipeline. Their terms forbid or require custom contracts for commercial or video use.
- Build imagery on NASA Blue Marble and Black Marble (public domain) plus EOX Sentinel-2 cloudless 2016 (CC BY 4.0), and request quotes from EOX and MapTiler for a premium recent and high-res tier. Free imagery from 2018 on is non-commercial only.
- Use Copernicus DEM (mirrored from Mapterhorn or built yourself) for terrain and GEBCO 2025 for bathymetry. Both are free for commercial use and need only a credit line.
- Adopt Cliopatria (CC BY 4.0, 3400 BCE-2024 CE) as the historical-border backbone, plus the CC0 part of OpenHistoricalMap, behind a curated override layer. Cliopatria has measurable gaps (sparse before 1000 BCE and in the Americas and Africa, no front lines) and label errors.
- Do not use CShapes, AWMC, the World Historical Gazetteer aggregate, Chronas, DARE tiles or aourednik/historical-basemaps in rendered frames. They are non-commercial, share-alike or GPL with unclear provenance.
- Build a Territory Composer: the LLM writes a structured recipe from gazetteer points and modern units, a deterministic geometry engine builds the shape, and validation plus uncertainty styling follow. Store reviewed polygons in a proprietary library that never mixes in OSM. This makes historical coverage a moat while avoiding ODbL share-alike.
- Run a local place resolver on GeoNames, Wikidata and Pleiades, and add self-hosted Photon (Apache-2.0) later. Public Nominatim is capped at 1 request per second and is not allowed as a production geocoder.
- Enforce an automated license allow-list (PD, CC0, MIT, Apache, BSD, ISC, OFL, CC BY, ODbL as Produced Work) and block NC, SA and ND assets such as OpenMoji. A single share-alike asset could push its license onto users' monetized videos.
- Ship a per-render credits manifest: on-frame micro-credit whenever OSM or EOX layers are visible, an auto-generated description block, and a permanent /credits/{videoId} page. CC BY 4.0 accepts a URI and OSM wants on-map credit for map-focused video.
- Add a per-video worldview setting based on Natural Earth's point-of-view variants, with hatched disputed areas and sensitivity flags. India's 1961 map law and China's map-vetting regime create backlash and expansion risk.
- Use milsymbol (MIT) for NATO/APP-6 unit markers, Game Icons (CC BY 3.0) for war iconography, flag-icons (MIT) for modern flags, and in-house redraws for historical flags. This covers war-video visuals without share-alike exposure.
- Commission a one-time legal review ($2k-10k estimate) of the data stack, Cliopatria provenance and attribution UX before public launch. Several terms could only be checked through search summaries.

## COST ITEMS
- Protomaps planet PMTiles daily build (OSM vector basemap): $0 / per download (~120 GB, z0-15) (ODbL Produced Work, OSM attribution required. Each zoom level roughly doubles size; z0-14 is about half.) https://docs.protomaps.com/basemaps/downloads
- OpenFreeMap public tile instance: $0 / unlimited requests (Donation-funded. Attribution required (OpenFreeMap, OpenMapTiles, OSM). Self-host for production render load.) https://github.com/hyperknot/openfreemap
- MapTiler Cloud Flex plan: ~$25-30 / per month (Search-level only; sources conflict on the price. A video license is described for individual creators with 100k subscribers or fewer, so a SaaS needs a custom contract.) https://www.maptiler.com/cloud/pricing/
- MapTiler Cloud Unlimited plan: $295 / per month (Search-level only. Still needs a custom agreement for video/SaaS rendering.) https://www.maptiler.com/cloud/pricing/
- Mapbox map content in video: Custom (no public price) / contract (Product Terms bar video media except incidental promotion of your own app; Studio limited to 100 high-res static exports per account lifetime.) https://docs.mapbox.com/help/dive-deeper/static-maps/
- Google Earth Studio: $0 but no commercial license offered / n/a (Not licensable for automated SaaS rendering. Map Tiles API videos limited to 30 s or less and promotional only.) https://www.google.com/earth/studio/faq/
- EOX Sentinel-2 cloudless 2016 (10 m): $0 (CC BY 4.0) / license (Bulk GeoTIFF delivery may be a paid service; ask EOX.) https://eox.at/2025/03/sentinel-2-cloudless-2024/
- EOX cloudless 2018-2025 commercial license: Price on request / license (The free editions are CC BY-NC-SA 4.0. Commercial use is under the EOX Commercial Attribution-RestrictedUse 1.1 license.) https://cloudless.eox.at/pricing
- NASA Blue Marble / Black Marble imagery: $0 / public domain (No NASA endorsement or logos.) https://www.nasa.gov/nasa-brand-center/images-and-media/
- Copernicus DEM GLO-30/GLO-90: $0 / license (Attribution notice required.) https://docs.sentinel-hub.com/api/latest/static/files/data/dem/resources/license/License-COPDEM-30.pdf
- GEBCO 2025 bathymetry grid: $0 / public domain (Acknowledgement required.) https://www.gebco.net/data-products-gridded-bathymetry-data/gebco2025-grid
- Natural Earth vectors and rasters: $0 / public domain (Includes 31 point-of-view boundary variants.) https://github.com/nvkelso/natural-earth-vector/blob/master/LICENSE.md
- Cliopatria historical borders: $0 / CC BY 4.0 (44 MB zip, 13,765 rows, 1,633 polities (measured).) https://github.com/Seshat-Global-History-Databank/cliopatria
- Euratlas historical GIS data, Simple license: EUR 100-160 / per century snapshot (Europe/Mediterranean only; check whether the Simple license allows commercial video.) https://www.euratlas.net/shop/maps_gis/gis_1700.html
- Euratlas historical GIS data, Extended license: EUR 480-640 + VAT / per century snapshot (About EUR 10-13k for all ~20 snapshots (estimate). SaaS/video rights must be confirmed in writing.) https://www.euratlas.net/shop/maps_gis/gis_1700.html
- GADM commercial use: Permission/license required (price unknown) / license (Recommend excluding GADM; use Natural Earth or geoBoundaries.) https://gadm.org/license.html
- Nominatim public API: $0 / max 1 request/second (Not for production; self-host instead.) https://operations.osmfoundation.org/policies/nominatim/
- Self-hosted Photon geocoder server: ~$50-120 (estimate) / per month (Worldwide index ~95 GB disk; 64 GB RAM recommended; NVMe SSD.) https://github.com/komoot/photon
- Object storage for map data (Cloudflare R2): ~$0.015/GB-month, zero egress (unverified) / per GB-month (1.5-4 TB data stack is about $22-60/month (estimate).) https://developers.cloudflare.com/r2/pricing/
- Per-video map data read/egress cost: ~$0.001-0.01 (estimate) / per video (Assumes R2-style free egress and a node-local tile cache.) estimate - no source (based on 2k-20k tile reads per video)
- One-time tile pyramid processing (S2, BMNG, terrain): <$100 (estimate) / one-time (Tens to a few hundred CPU-hours on spot instances.) estimate - no source
- Legal review of data stack and attribution: ~$2,000-10,000 (estimate) / one-time (Recommended before public launch.) estimate - no source

## RISKS
- Attribution non-compliance at scale. Thousands of user videos with missing or removed OSM, EOX, Copernicus or CC BY credits could draw takedown or complaint campaigns against the platform. Mitigate with forced on-frame credits and per-video credits pages.
- Share-alike contamination. One BY-SA asset (OpenMoji, Chronas, DARE, Wikimedia map SVGs) or merging OSM into the proprietary historical database could impose BY-SA or ODbL obligations on users' videos or on your core dataset.
- Cliopatria provenance. If its polygons were digitised from copyrighted atlases, the CC BY 4.0 grant may not fully clear them. EU database rights may also apply.
- Historical inaccuracy and LLM-hallucinated borders or front lines. Map-literate audiences on YouTube punish errors, which can hurt users' channels and the product's reputation.
- Coverage gaps. Free historical data is thin before 1000 BCE and for the pre-colonial Americas, Africa and Southeast Asia, and has no front lines or occupation zones. War videos therefore depend on generated geometry.
- Disputed borders and political sensitivity (Kashmir, Arunachal, Aksai Chin, Taiwan, South China Sea, Crimea, Western Sahara, Israel/Palestine). Legal exposure exists in India (1961 Act) and China (map vetting, fines, customs seizures). Platform backlash and future market-entry problems also follow.
- Vendor ToS drift. Mapbox, MapTiler, Google, Esri and EOX change terms frequently. Any later premium integration needs contract-level, not ToS-level, assurance covering SaaS-rendered, user-monetized video.
- Several license facts were verified only through search summaries, because the proxy blocked the primary pages (OSMF guidelines, Mapbox terms, EOX pricing, HydroSHEDS, GeoNames). A wrong assumption could surface late.
- Satellite quality gap. The only free, commercial-OK global 10 m mosaic is from 2016, with seams and haze; recent imagery requires paid licenses. Close-up satellite shots may look dated next to competitors using Google Earth Studio manually.
- Operational risk from hot-linking free community services (OpenFreeMap public instance, Mapterhorn tiles, public Nominatim, AWS terrain tiles): rate limits, outages or bans. Mirror everything you depend on.
- Users uploading third-party map footage (e.g. Google Earth Studio, news-channel maps, DeepStateMap/ISW screenshots) into the editor creates secondary copyright liability. You need DMCA processes and ToS clauses.

## QUESTIONS FOR FOUNDER
- Will you accept a small, non-removable on-frame credit such as '© OpenStreetMap' when OSM-based layers are visible, including on Shorts and TikTok? Or should the product avoid OSM layers in shorts and rely on public-domain Natural Earth and NASA data instead?
- What budget, if any, do you have for licensed premium data: an EOX commercial license for recent satellite years, a MapTiler or other high-res imagery partnership, or Euratlas/GeaCron historical datasets (Euratlas is roughly EUR 10-13k for all Extended snapshots)? Do you want it now or as a later premium tier?
- Which markets will you target first? In particular, do you expect many users or customers in India, China, Pakistan or other countries with map laws? That decides the default worldview policy and whether you need country-specific border presets.
- What is your stance on disputed borders by default: de facto control (Natural Earth default), hatched 'disputed' areas, or automatically follow the user's chosen country point of view?
- Will you fund a one-time legal review (roughly $2k-10k) of the data stack, Cliopatria provenance and attribution UX before launch? Do you have a lawyer, and which jurisdiction is your company in?
- Are you willing to invest in a curated proprietary historical-borders library (historian/GIS contractor time) as a competitive moat? If so, which topics or eras matter most for your target audience (e.g. Rome, Mongols, WWII, the Napoleonic Wars, Ottomans, modern geopolitics)?
- Should users be allowed to upload their own map footage or images (e.g. Google Earth Studio clips) into videos, given the shifted copyright responsibility and the DMCA/takedown process this requires?
- Which cloud or hosting provider will run the render workers? Map data storage (about 1.5-4 TB) should sit next to them to avoid egress fees. Are you open to a dedicated server (e.g. Hetzner) for data and geocoding?
- How much satellite close-up detail do you need? Free imagery tops out at Sentinel-2's 10 m, which is fine for regions but not for city blocks or individual buildings. Would stylised OSM vector cities be acceptable for city-scale scenes?
- For paid white-label tiers, will you allow removal of your own branding while keeping legally required data attributions (OSM, EOX, CC BY credits) non-removable?
- Do you want to give back to the open-data community, for example by contributing curated historical borders to OpenHistoricalMap? That builds goodwill but is weighed against keeping a proprietary dataset.