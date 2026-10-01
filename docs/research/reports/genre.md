# Deconstructing the Map-Animation Video Genre: style presets, technique catalog, story structure and quality bar

**Research date:** 2026-10-01. **How this was checked:** WebFetch was blocked by the egress proxy for every domain I tried (aescripts.com, premiumbeat.com, wikipedia.org, support.google.com and others). Every **VERIFIED** item below is therefore backed by search-engine result text taken from the cited URL, not by a full read of the page. Each one carries an inline URL. Items marked **ESTIMATE** are my own analysis of the genre or industry rules of thumb. "Secondary" means a blog or aggregator rather than the official source, so re-check those before relying on them.

---

## 0. Executive summary

1. **Same building blocks, different styling.** Top map channels (Kings and Generals, RealLifeLore, Johnny Harris, Epic History, The Operations Room, Wendover, PolyMatter, EmperorTigerstar, Ollie Bye) mostly use the same roughly 100 animation primitives: camera flights, border fills and morphs, arrows, pins, labels, portraits, counters, environmental effects and textures. What separates them is a **style system** (basemap, palette, typography, texture, motion feel and sound) and a **visual-first script**. So the product should be a declarative scene DSL built on a catalog of primitives, with style presets as theme tokens. It should not be a set of fixed templates.
2. **Hand-crafted quality is slow to make.**
   - Epic History's Waterloo episode took about 6 weeks, made by one person in After Effects ([militaryhistorynow](https://militaryhistorynow.com/2016/01/11/back-to-the-future-how-epic-history-tv-is-re-inventing-the-war-documentary/)).
   - Kings and Generals uses a team split into maps, 3D and editing ([Adobe community thread](https://community.adobe.com/t5/after-effects-discussions/how-to-edit-like-kings-and-generals-youtube-channel/td-p/13068327)).
   - Johnny Harris and Vox build maps in **GEOlayers 3** for After Effects ([aescripts](https://aescripts.com/learn/post/how-johnny-harris-makes-maps); [toolfarm, $329.99](https://www.toolfarm.com/buy/markus_bergelt_geolayers/)).

   The automation opportunity is real. The bar to clear is "edited by a motion designer", not "slideshow".
3. **The data-licensing traps most likely to break the business:**
   - **Google Photorealistic 3D Tiles / Map Tiles API:** videos are allowed only as ≤30 s promotional videos about your own app ([Google policies](https://developers.google.com/maps/documentation/tile/policies)).
   - **Mapbox:** no video-media use without a separate deal with sales ([Mapbox terms via pricing/product terms](https://www.mapbox.com/pricing)).
   - **aourednik historical-basemaps:** GPL-3.0 ([GitHub](https://github.com/aourednik/historical-basemaps)).
   - **EOX Sentinel-2 cloudless 2018+:** CC BY-NC-SA ([EOX](https://eox.at/2017/08/sentinel-2-global-cloudless-mosaic/)).

   The product needs an open stack: MapLibre, self-hosted OSM/Natural Earth tiles, open DEMs, NASA imagery, plus commercial imagery that is licensed explicitly.
4. **Platform rules shape the product:**
   - YouTube Shorts can be ≤3 min and either square or vertical ([1of10](https://1of10.com/blog/how-long-can-youtube-shorts-be/)).
   - TikTok Creator Rewards pays only for videos of **≥1 min** ([gemlist](https://www.gemlist.io/blog/tiktok-creator-rewards-requirements), secondary).
   - YouTube's July 2025 "inauthentic content" policy demonetizes templated, mass-produced videos ([Social Media Today](https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/)).

   Variety between videos and real user input are therefore requirements, not nice-to-haves.

---

## 1. Genre landscape: who sets the bar and how they work

| Channel | Scale (VERIFIED where URL given) | Look / signature | Known tools & process |
|---|---|---|---|
| Johnny Harris | 7.96M subs (Sep 2026) [socialblade/vidiq via search](https://vidiq.com/youtube-stats/channel/@johnnyharris/) | Muted, desaturated maps. Paper, grain, light leaks, halftone. Hand-drawn arrows and circles animated in steps, highlighter sweeps, photos "pinned to a wall", red string ([flatpackfx](https://www.flatpackfx.com/blog/johnny-harris-style-map-animation-adobe-after-effects)) | GEOlayers 3 plus custom Mapbox styles. He keyframes 5 camera properties (lat, lon, zoom, bearing, pitch) and offsets the bearing keys so the camera "comes down and orbits" ([nofilmschool/mapanimation guide](https://nofilmschool.com/how-create-vox-style-map-animations-after-effects)). Writes the script and the visuals together ([medium](https://medium.com/@contact_15635/5-storytelling-tips-by-vox-filmmaker-johnny-harris-7daeee95e351)) |
| Vox-style explainers | — | Clean, decluttered map, accent-color fills, callouts. Graphics animated "on twos" at 12 fps inside a 24 fps timeline for a handmade stutter ([nofilmschool](https://nofilmschool.com/how-create-vox-style-map-animations-after-effects)) | GEOlayers plus a Mapbox style with labels stripped out |
| RealLifeLore | 7.94M subs (Sep 2026) ([vidiq](https://vidiq.com/youtube-stats/channel/UCP5tjEmvPItGyLhmjdwP7Ww/)) | Map-first: "the map IS the content". Every video answers "Why is X the way it is?". 10–20 min, faceless narration ([becomeviral case study](https://becomeviral.com/blog/reallifelore-case-study), secondary) | After Effects, Photoshop, Audition, Premiere ([biography, secondary](https://youthmotivator4life.com/joseph-pisenti-biography/)) |
| Kings and Generals | ~4.16M subs (Jun 2026) ([hypeauditor](https://hypeauditor.com/youtube/UCMmaBzfCCwZ2KqaBJjkj0fw/)) | Painted campaign maps, faction-colored unit blocks, thick arrows, 3D marching soldiers. Switched from Google Earth to original maps in Aug 2017 ([fandom](https://youtube.fandom.com/wiki/Kings_and_Generals)) | Photoshop and After Effects. Separate people own maps, 3D and editing ([Adobe thread](https://community.adobe.com/t5/after-effects-discussions/how-to-edit-like-kings-and-generals-youtube-channel/td-p/13068327)) |
| Epic History | — | Detailed campaign maps plus archival paintings. 15–20 min films narrated by a BBC broadcaster | After Effects. About 6 weeks for Waterloo, one person ([militaryhistorynow](https://militaryhistorynow.com/2016/01/11/back-to-the-future-how-epic-history-tv-is-re-inventing-the-war-documentary/)) |
| The Operations Room | ~1.4M subs (search snippet) | Top-down tactical battle maps, NATO-style unit symbology (they made a "NATO Symbology Special") | Team of researchers, animators and editors ([Patreon](https://www.patreon.com/TheOperationsRoom/about)) |
| Wendover Productions | — | Clean motion graphics, sweeping satellite/"drone" geographic overviews, flows and logistics ([becomeviral](https://becomeviral.com/blog/wendover-productions-case-study)) | Credits list multiple writers, animators and sound engineers |
| PolyMatter | ~1.94M subs (May 2026) ([hypeauditor](https://hypeauditor.com/youtube/UCgNg3vwj3xt7QOrcIDaHdFg/)) | Minimal flat or dark maps, maps that morph into charts (ESTIMATE from viewing) | — |
| Historia Civilis | — | Colored squares stand in for people and armies; minimalist ([fandom](https://youtube.fandom.com/wiki/Historia_Civilis)) | Adobe CC |
| Simple History / Armchair Historian | 5.11M / 2.49M subs | Character-illustration-led, with maps as connective tissue | Armchair Historian has a dedicated team of artists and animators ([Wikipedia via search](https://en.wikipedia.org/wiki/The_Armchair_Historian)) |
| EmperorTigerstar / Ollie Bye | 346K / 237K (fandom wiki, possibly stale) ([wiki](https://thefutureofeuropes.fandom.com/wiki/Mappers_by_Subscribers)) | "Every year" political timelapses. Ollie Bye uses smooth vector graphics rather than raster ([namu](https://en.namu.wiki/w/Ollie%20Bye)) | EmperorTigerstar: Paint.NET/MS Paint plus Filmora (namu wiki, secondary) |
| Map Men | — | Comedy plus map graphics, live-action desk, props and SFX ([Geographical](https://geographical.co.uk/news/map-men-where-comedy-meets-geography)) | — |

**Short-form landscape.** I could not find an authoritative ranking of TikTok, Shorts or Reels map accounts. The data points found were: @georainbolt about 3.2M TikTok followers, Flag Geography about 405K, History on Maps about 371K YouTube subs ([vidiq](https://vidiq.com/youtube-stats/channel/UC7JrMLRDJLUh5BPBYykMcrQ/)), plus "countryball/nation edit" phonk-style animations and AnimateMyMap-made conquest clips ([TikTok discover](https://www.tiktok.com/tag/mapanimation)).

**Dominant short-form formats (ESTIMATE from the search landscape):**
- "every year" timelapses
- country size and stat comparisons
- what-if / alt-history conquests
- "why does X look like this?"
- zoom from space down to a place
- travel route animations
- nation edits cut to phonk music

**Direct AI competitors:**
- Animaps: $9.90/$19.90 per month, max 1440p, prompt-to-map ([pricing](https://animaps.ai/pricing))
- mapanimation.io: text-to-map-video ([site](https://mapanimation.io/))
- AnimateMyMap: 5 camera modes
- Mult.dev: travel routes, $5.99–$34.99 one-time packs ([App Store/blog](https://mult.dev/articles/best-travel-map-animation-tools-in-2026))
- Easymotion

All of them are **map clip tools**. None produces a researched, narrated, scored documentary. That gap is the product's positioning.

---

## 2. (A) Style preset taxonomy: 28 presets

Fonts below are Google Fonts. Almost all are OFL, which explicitly permits commercial use in video ([OFL FAQ](https://openfontlicense.org/how-to-use-ofl-fonts/)). Special Elite, Permanent Marker and Luckiest Guy are Apache-2.0. Verify each family at build time.

"Ref" means a **genre reference** for designers. Do not use creator names in the product UI or marketing (see Risks). AR fit uses H = 16:9, V = 9:16, S = 1:1/4:5.

| # | Preset | Basemap & texture | Palette (hex) | Typography | Motion feel | Signature overlays | Topic fit / AR | Ref |
|---|---|---|---|---|---|---|---|---|
| 1 | **Field Notes** (investigative) | Desaturated satellite or terrain, paper multiply, grain, halftone, light leaks | paper #D9CBB0, water #8FA3A8, marker red #C8102E, highlighter #F5D90A, ink #1E1E1E | Bebas Neue / Oswald plus Courier Prime | Cinematic push-ins; overlays stepped at 12 fps | Hand-drawn circles and arrows, pinned polaroids, red string, highlighter sweeps on documents | Geopolitics, investigations / H V | Johnny Harris |
| 2 | **Clean Explainer** | Flat vector, labels stripped, single-tone land | land #E6E6E6, ocean #FFFFFF or #CFE3EE, accent #FFC233, alert #E8483C, text #222 | Inter / Archivo | Snappy ease-out, 250–400 ms | Accent fills, elbow callouts, stat cards | Economics, policy / H V S | Vox, Wendover |
| 3 | **Dark Geopolitics** | Near-black ocean, charcoal land, thin borders, glow | #0B0F14, #1C232B, border #3A4654, cyan #3FD0FF, amber #FFB000, red #FF4D4D | Space Grotesk / IBM Plex Sans | Smooth, confident, slight bloom | Glowing outlines, range rings, counters | Military budgets, power blocs, tech / H V | PolyMatter, Caspian Report |
| 4 | **Campaign Parchment** | Painted relief under a parchment overlay, vignette | parchment #E8D9B5, earth #A88B5C, sea #7E9CA6, faction red #9E2A2B, blue #2F4B7C, gold #C9A227 | Cinzel / Cormorant Garamond | Slow, epic, heavy easing | Unit blocks with banners, thick tapered arrows with drop shadow, clash bursts | Ancient to early-modern war / H (V ok) | Kings and Generals, Epic History |
| 5 | **Ops Room Tactical** | Top-down muted terrain, minimal labels | terrain #9A9A8A, water #5E7480. APP-6 fills: friend #80E0FF, hostile #FF8080, neutral #AAFFAA, unknown #FFFF80 | Barlow Condensed / JetBrains Mono | Measured, clock-driven | NATO symbols, phase lines, time HUD | WW2 to present battles / H | The Operations Room |
| 6 | **Antique Atlas** | Engraving-style hachures, hand-tinted regions, compass rose, cartouche | paper #EFE3C8, ink #5B4636, tints #D8A7A0 #A7C4A0 #E5D08F | IM Fell English / Old Standard TT | Slow drifts, ink-bleed reveals | Ships with wakes, sea-monster vignettes, rhumb lines | Age of exploration, colonial history / H S | Old atlases |
| 7 | **Shadow Relief** ("Blender map") | Old map or flat colors over long-shadow hillshade, terrain exaggeration | shadow #2B2B2B at 60%, warm highlight #FFF2D6 | Libre Baskerville | Very slow sun sweeps, pitch reveals | Elevation profiles, river traces | Physical geography, mountains as borders / H V | Sean Conway, [Stamen](https://stamen.com/shadows-on-maps-are-getting-a-lot-more-exciting-and-heres-why/) |
| 8 | **Orbital Satellite** | True-color globe, atmosphere, night lights | atmosphere #6FB7FF, labels white with soft shadow, accent #FFD54A | Montserrat / Inter | Long flights from space down to the ground | Pulse pins, great-circle arcs | Megaprojects, "why is nobody living here" / H V | Wendover, RealLifeLore openers |
| 9 | **Chronicle Timelapse** | Flat political map, thin borders | ocean #A8C8E0, 20+ distinct pastel faction colors, border #333 | Rubik / Roboto Condensed | Metronomic: 0.2–1 s per year | Large year ticker, faction labels, event captions | "Every year" histories / H V S | EmperorTigerstar, Ollie Bye |
| 10 | **Newsreel Archival** | Grayscale or sepia, gate weave, scratches, flicker | sepia #704214 tint, white text | Old Standard TT / Special Elite | Jittery 18 fps feel | Title cards, period photos, globe-spin bumpers | WWI–WWII, interwar / H S | 1940s newsreels |
| 11 | **Declassified** | Manila folder, typewriter, redaction bars, CRT radar | manila #E6D5A8, stamp #B22222, CRT #33FF66 on #001100 | Special Elite / VT323 | Typewriter reveals, stamp slams | "TOP SECRET" stamps, radar sweeps, dossier cards | Cold War, espionage, nukes / H V | Spy documentaries |
| 12 | **Blueprint** | Blue grid, white linework | #0E3B6E, lines #FFFFFF at 70%, accent #FFD400 | Space Mono / Rajdhani | Precise linear-to-eased draws | Dimension lines, cross-sections | Canals, infrastructure, megaprojects / H V | Engineering explainers |
| 13 | **Broadsheet** | Newsprint, halftone, column rules | #F2EFE6, #111, red #D0021B | Playfair Display / Libre Franklin | Paper slides, headline zooms | Clippings, headline stacks, datelines | 19th–20th-century events, elections / H S | Newspaper montages |
| 14 | **Sketchbook** | Paper with ink outlines, marker fills with "boiling" lines | #FAF7F0, ink #222, markers #FF6B6B #4ECDC4 #FFE66D | Patrick Hand / Caveat / Permanent Marker | Stepped, playful | Doodled arrows, scribble fills | Education, light comedy / H V S | Map Men vibe, whiteboard |
| 15 | **Cartoon Pop** | Saturated flat colors, thick black outlines | #FF595E #FFCA3A #8AC926 #1982C4 #6A4C93 | Fredoka / Luckiest Guy | Bouncy squash and stretch | Character stickers, speech bubbles | Comedic history, kids / V H | OverSimplified vibe |
| 16 | **Minimal Tokens** | Plain background, abstract terrain | #F4F1EA or #1A1A1A, primary-colored tokens | Merriweather / Source Sans 3 | Deliberate, diagrammatic | Colored squares as people and armies, relationship lines | Political intrigue, Roman politics / H | Historia Civilis |
| 17 | **Data Atlas** | Grey land, clean legend | land #EEEEEE, sequential viridis or ColorBrewer | Inter / IBM Plex Sans | Smooth value tweens | Choropleths, bars on map, counters | Demographics, economy / H V S | Data journalism |
| 18 | **Spike Field** | Black background, extruded spikes, no land fill | #0A0A12, gradient #FFD166→#EF476F | Inter | Slow orbit, rising spikes | 3D spikes, glow | Population, GDP density / V H | [Alasdair Rae spikes](https://www.axios.com/2020/11/29/world-population-density-3d-map) |
| 19 | **Grand Strategy** | Province mosaic, game-style UI chrome (original design, not a game's trade dress) | provinces in saturated nation colors, chrome #2A2420, gold #C8A951 | Cinzel / Roboto Condensed | Tick-based "game turn" pacing | Province flips, resource counters, war-score bar | What-if / alt-history, Gen Z / V H | Paradox-style map videos |
| 20 | **Synthwave** | Dark neon grid, wireframe globe | #0D0221, magenta #FF2A6D, cyan #05D9E8 | Orbitron / Exo 2 | Glitch cuts, fast | Scanlines, glitch transitions | Future geopolitics, tech / V | Short-form edits |
| 21 | **Nation Edit** (phonk) | High-contrast flags and maps, black frames | black/white, flag colors, accent #FF0033 | Anton / Bebas Neue | Cuts on the beat, shake, speed ramps, strobe | Flag flashes, stat slams, VS split | Country comparisons, Gen Z / V only | TikTok nation and countryball edits |
| 22 | **Watercolor Storybook** | Watercolor washes on paper | #F6E7CB #A3C4BC #E7A977 | Lora / Amatic SC | Gentle drifts, wash transitions | Painted icons, dotted journey lines | Culture, myths, travel, kids / H V S | Illustrated atlases |
| 23 | **Topographic** | Contours, hypsometric tints | #5E8C61→#C9B27C→#FFFFFF, contours #7A5C3E | Barlow / Source Sans 3 | Slow, exploratory | Elevation callouts, trail lines | Mountains, rivers, expeditions / H V | Outdoor and adventure |
| 24 | **Prestige Cinematic** | Dark desaturated 3D terrain, volumetric fog, low sun | #2E2A24, fog #C8C2B4, gold #D4AF37 | Cormorant SC / Cinzel | Very slow, long holds, music-led | Sparse labels, silhouettes, embers | Fall of civilizations, ancient worlds / H | Prestige history documentaries |
| 25 | **Crisis Desk** | Clean news map, pulsing hotspots | navy #0A1F44, red #E10600, white | Oswald / Roboto Condensed | Urgent and punchy | Lower thirds, tickers, LIVE-style pulses (no fake "LIVE" claims) | Current events (strict accuracy rules) / V H | TV news graphics |
| 26 | **Mythic Atlas** | Fantasy-map aesthetic, illuminated borders | #E9DCC0, ink, illuminated gold #B8860B | Uncial Antiqua / MedievalSharp | Mystical drifts, glow reveals | Illuminated initials, legendary creatures | Legends, lost cities, myths / H V | Fantasy cartography |
| 27 | **Kids Atlas** | Bright rounded shapes, big icons | #4CC9F0 #F72585 #FFD60A #80ED99 | Baloo 2 / Nunito | Bouncy, friendly | Animal and food icons, large labels | Kids' education / H V S | Classroom content |
| 28 | **Weather & Climate Desk** | Radar palettes, isobars, wind streamlines | radar #00C853→#FFD600→#D50000, isobars #FFFFFF at 60% | Inter / Roboto Mono | Continuous flow fields | Rain and snow particles, storm cells, temperature counters | Climate, disasters, monsoons / H V | Weather broadcasts |

**Recommendation:** each preset should be a token bundle with these parts:
- basemap style JSON
- palette roles (land, water, borders, factionN, accent, alert, text)
- font stack
- texture stack (paper, grain, vignette, LUT)
- motion profile (easing curves, default durations, step-rate 12/24/30 fps, overshoot)
- SFX kit
- music mood tags
- caption skin

**Launch with 6–8 hero presets** (suggested: 1, 2, 3, 4, 5, 8, 9, 21). Ship them polished rather than 28 mediocre ones.

---

## 3. (B) Technique catalog: 150 items

**Prevalence key (ESTIMATE from genre viewing and tutorials):**
- ★★★ = near-ubiquitous in top channels
- ★★ = common
- ★ = signature or rare "wow" move

**Implementation hints** come first in each group. All libraries named are open source (licenses checked where cited).

### 3.1 Camera (implement as keyframes on lat, lon, zoom, bearing, pitch with per-preset easing: MapLibre GL `jumpTo` per frame, deterministic)

| ID | Technique: what it is → narrative purpose | Prev |
|---|---|---|
| C1 | **Space dive**: globe → country → city zoom → answers "where are we?" | ★★★ |
| C2 | **Slow push-in** (1–3% scale per sec) → keeps frames alive during narration | ★★★ |
| C3 | **Pull-back reveal** → shows scale and context ("and this was just the beginning") | ★★★ |
| C4 | **Orbit** (bearing offset while descending) → reveals terrain and drama ([Johnny Harris technique](https://nofilmschool.com/how-create-vox-style-map-animations-after-effects)) | ★★ |
| C5 | **Pitch tilt** top-down → oblique → moves from "diagram" into "place" | ★★ |
| C6 | **Follow cam** locked to a route head or army → journey and pursuit | ★★ |
| C7 | **Feature pan** along a river, coast or border → guides the eye along the argument | ★★ |
| C8 | **Fly-between** A→B with a zoom arc (van Wijk-style smooth zoom) → keeps geographic continuity instead of cutting | ★★★ |
| C9 | **Whip-pan / speed ramp** with motion blur → energy, especially in shorts | ★★ |
| C10 | **Micro-drift on holds** (never fully static) → prevents a "dead frame" | ★★★ |
| C11 | **Tilt-shift DOF** → miniature feel and focus | ★ |
| C12 | **Camera shake** on impacts or explosions → violence, emphasis | ★★ |
| C13 | **Split-screen theaters** → parallel events (Eastern vs Western Front) | ★ |
| C14 | **Projection morph** (globe ↔ flat; Mercator ↔ equal-area) → "maps lie" explainers (d3-geo) | ★ |
| C15 | **Dolly-zoom** on a region → shock beat | ★ |
| C16 | **Bearing rotation to fit a vertical frame** (turn Chile or Japan to portrait) → required for 9:16 | ★★ |

### 3.2 Borders, regions, territory (GeoJSON polygons in MapLibre fill/line layers; polygon morphing with flubber, MIT ([GitHub](https://github.com/veltman/flubber)); turf.js for buffers and clips)

| ID | Technique → purpose | Prev |
|---|---|---|
| B1 | **Region fill fade-in** in an accent color → names the subject | ★★★ |
| B2 | **Border stroke draw-on** (trim-path / line-dash offset) → introduces a boundary | ★★★ |
| B3 | **Territory morph over time** → conquest, expansion, collapse | ★★★ |
| B4 | **Directional sweep fill** (wipe along the axis of advance) → shows where conquest came from | ★★ |
| B5 | **Pulsing glow outline** → emphasis on mention | ★★ |
| B6 | **Hatched fill** for occupied, contested or claimed areas → nuance (ISW-style front maps) | ★★ |
| B7 | **Dashed borders** for disputed or de-facto lines → accuracy and neutrality | ★★ |
| B8 | **Isolation**: dim and desaturate everything except the subject → focus | ★★★ |
| B9 | **Spotlight mask** (circle or iris reveal) → focus, transitions | ★★ |
| B10 | **Country lift/extrude** (pop-up tile with shadow) → "this one" | ★★ |
| B11 | **Drag-and-compare**: drag a country's true outline over another (true-size, re-projected) → scale comparison | ★★ |
| B12 | **Partition split**: polygon breaks apart with gaps → partitions and independence | ★★ |
| B13 | **Absorb/annex**: color bleeds into a neighbor → unification | ★★ |
| B14 | **Allegiance flip**: regions switch color one by one (stagger) → alliances, elections | ★★ |
| B15 | **Name morph** (Persia→Iran, Constantinople→Istanbul) → continuity across eras | ★ |
| B16 | **Ghost borders** (onion-skin of earlier borders) → before vs now | ★ |
| B17 | **Sub-national drilldown** (states or provinces fade in on zoom) → layered explanation | ★★ |
| B18 | **Water and river emphasis** (glow, flow animation) → rivers as borders and trade routes | ★★ |

### 3.3 Routes, arrows, troop and fleet movement (deck.gl TripsLayer `currentTime`/`trailLength` ([docs](https://deck.gl/docs/developer-guide/animations-and-transitions)), ArcLayer, turf `along`/`bezierSpline`, SVG tapered-arrow meshes)

| ID | Technique → purpose | Prev |
|---|---|---|
| R1 | **Route draw-on with a leading icon** (ship, plane, horse) → journeys, expeditions | ★★★ |
| R2 | **Thick tapered campaign arrow** growing along a spline, with drop shadow → offensives | ★★★ |
| R3 | **Pincer / double envelopment** arrows that close → encirclement plans | ★★ |
| R4 | **Retreat arrows** (dashed, faded, reversed) → collapse, withdrawal | ★★ |
| R5 | **Great-circle arcs** → flights, missiles, global links | ★★ |
| R6 | **Flow particles** along lanes (width ∝ volume) → trade, oil, shipping | ★★ |
| R7 | **Comet trail** (fading tail) → speed and recency | ★★ |
| R8 | **Milestone route** (stops pop with dates and photos) → explorers, campaigns | ★★ |
| R9 | **Unit block slides** along a path with formation spacing → army maneuvers | ★★★ |
| R10 | **Fleet movement** with wake trails → naval campaigns | ★★ |
| R11 | **Supply-line pulse** (dots traveling along a line; it breaks when cut) → logistics, sieges | ★ |
| R12 | **Migration swarm** (many agents with noise) → peoples, refugees, diasporas | ★ |
| R13 | **Feint vs main thrust** (thin decoy arrow vs thick arrow) → deception | ★ |
| R14 | **Arrow "hit" stop** (arrow halts at a line with a burst and recoil) → failed attack | ★★ |

### 3.4 Markers, labels, callouts (SVG/Canvas overlays projected from lon/lat each frame; collision-avoidance pass)

| ID | Technique → purpose | Prev |
|---|---|---|
| M1 | **Pin drop** with bounce and ripple → place introduction | ★★★ |
| M2 | **Radar ping** pulses → active hotspot | ★★★ |
| M3 | **City dot plus type-on label** → orientation | ★★★ |
| M4 | **Elbow callout** with leader line → facts tied to a place | ★★★ |
| M5 | **Numbered sequence markers** → order of events | ★★ |
| M6 | **Range rings** (missile range, a day's march) → reach and threat | ★★ |
| M7 | **Distance ruler** with a live km/mi counter → scale | ★★ |
| M8 | **Curved labels** along rivers and ranges → cartographic polish | ★ |
| M9 | **Kinetic label** (tracking, scale settle) → emphasis | ★★ |
| M10 | **Stamp/badge slam** ("CAPITAL", "1453", "FALLEN") → punctuation | ★★ |
| M11 | **Highlighter sweep** over document text synced to the VO → evidence | ★★ |
| M12 | **Hand-drawn circle/underline** (stepped) → "look here" | ★★ |
| M13 | **Red-string board** linking pinned items → causal web | ★ |
| M14 | **"?" / "!" pop** over a region → open loop, surprise | ★ |
| M15 | **Label hierarchy system** (countries tracked caps, cities title case, water italic blue) → readability and credibility | ★★★ |

### 3.5 Icons, flags, portraits, photos (flag-icons, MIT ([GitHub](https://github.com/lipis/flag-icons)); Flagpedia PD; Wikidata P18 portraits; background removal with BiRefNet, MIT; 2.5D with Depth-Anything-V2-**Small**, Apache-2.0 only ([GitHub](https://github.com/DepthAnything/Depth-Anything-V2/issues/320)))

| ID | Technique → purpose | Prev |
|---|---|---|
| I1 | **Flag pop/wave** on a territory → identity | ★★★ |
| I2 | **Flag clipped inside a country shape** → identity plus territory | ★★ |
| I3 | **Portrait card** (name, title, dates) → introduces an actor | ★★★ |
| I4 | **2.5D parallax portrait or photo** (depth-map displacement) → life in archival stills | ★★ |
| I5 | **Pinned polaroid with tape** on the map → place plus evidence | ★★ |
| I6 | **Ken Burns archival photo** with a frame → texture of the era | ★★★ |
| I7 | **Resource icons** popping on regions (oil, grain, ports) → economic geography | ★★★ |
| I8 | **3D model on map** (ship, tank, legionaries) → spectacle | ★ |
| I9 | **Heraldry / coats of arms** → medieval factions | ★ |
| I10 | **Cut-out puppet character** → humor, personality | ★ |
| I11 | **Newspaper/document slide-in** → evidence | ★★ |
| I12 | **Era-correct flags** (not modern flags for 1500 AD) → credibility | ★★★ (as a requirement) |
| I13 | **Landmark silhouette** rising from a city → recognition | ★★ |

### 3.6 Data-viz overlays (deck.gl ColumnLayer, ScatterplotLayer, HeatmapLayer; MapLibre fill-extrusion; d3 scales)

| ID | Technique → purpose | Prev |
|---|---|---|
| D1 | **Animated choropleth** with legend → spatial patterns | ★★ |
| D2 | **Bars or columns rising from places** → compare magnitudes in place | ★★ |
| D3 | **Proportional circles** that grow → size of cities, armies, GDP | ★★ |
| D4 | **Rolling counter** (population, casualties, $) → stakes | ★★★ |
| D5 | **Dot density** ("1 dot = 10,000 people") → human scale | ★ |
| D6 | **Heatmap** → intensity (battles, earthquakes) | ★ |
| D7 | **Spike map** extrusions → density drama | ★ |
| D8 | **Timeline scrubber** with event ticks → orientation in time | ★★ |
| D9 | **Map → chart morph** (regions fly into a bar chart) → from where to how much | ★★ |
| D10 | **Side-by-side comparison panels** → A vs B | ★★ |
| D11 | **Isochrones** (travel-time bands) → access, logistics | ★ |
| D12 | **Animated scale bar and north arrow** → credibility | ★ |
| D13 | **Sankey-on-map flows** → trade and migration volumes | ★ |
| D14 | **Ranking race** (bar-chart race next to the map) → change over time | ★★ |

### 3.7 Environment and weather effects (custom WebGL particle and shader layers over MapLibre; Mapbox GL v3.9+ has built-in rain and snow ([docs](https://docs.mapbox.com/mapbox-gl-js/example/rain/)) but brings Mapbox licensing, so build our own; elevation-threshold masks from the DEM for floods and sea level)

| ID | Technique → purpose | Prev |
|---|---|---|
| E1 | **Rain** (streak particles, darker grade, wet sheen) → monsoon, misery, mud campaigns | ★ |
| E2 | **Snow** plus a frost vignette and whitening terrain → winter campaigns (Russia 1812, 1941) | ★★ |
| E3 | **Storm cells** with lightning flashes → storms, the Armada | ★ |
| E4 | **Volumetric fog/mist** in valleys → mystery, ambush | ★★ |
| E5 | **Fog of war** (unknown areas obscured, revealed by exploration) → discovery, intelligence | ★★ |
| E6 | **Spreading fire front** (noise-driven) → burning cities, scorched earth | ★★ |
| E7 | **Smoke plumes** → battles, industry | ★★ |
| E8 | **Artillery flashes and shockwave rings** → bombardment | ★★ |
| E9 | **Flood fill** rising by elevation → floods, dam failures | ★ |
| E10 | **Sea-level / paleo-coastline** (Doggerland, Beringia) → prehistory, climate | ★★ |
| E11 | **Day/night terminator sweep** with city lights → time, global scale | ★★ |
| E12 | **Seasons cycle** (green → brown → white) → agriculture, campaign seasons | ★ |
| E13 | **Ice-sheet advance/retreat** → ice ages, climate | ★ |
| E14 | **Desertification sweep** → droughts, collapse | ★ |
| E15 | **Wind streamlines** → monsoons, trade winds, sailing routes | ★ |
| E16 | **Ocean currents flow** → navigation, climate | ★ |
| E17 | **Plague/disease spread** (organic blob plus dots) → pandemics | ★★ |
| E18 | **Cloud layer fly-through** → transitions and altitude | ★★★ |
| E19 | **Nuclear blast rings** (fireball, blast, thermal radii) → stakes | ★★ |
| E20 | **Earthquake ripple / tsunami propagation** → disasters | ★ |
| E21 | **Volcanic ash plume** → eruptions (Johnny Harris has a volcano map tutorial) | ★ |
| E22 | **Heat shimmer / temperature tint** → heatwaves | ★ |

### 3.8 Battle and military (milsymbol for APP-6 / MIL-STD-2525, MIT ([GitHub](https://github.com/spatialillusions/milsymbol)))

| ID | Technique → purpose | Prev |
|---|---|---|
| W1 | **NATO/APP-6 unit counters** → modern operational clarity | ★★ |
| W2 | **Faction unit blocks** with banners and strength text → pre-modern armies | ★★★ |
| W3 | **Animated front line** (thick, toothed, advancing) → war of position | ★★ |
| W4 | **Pocket/encirclement shrink** → cauldron battles | ★★ |
| W5 | **Siege ring** around a city (pulsing, with countdown) → sieges | ★★ |
| W6 | **Fortification lines** (crenellated or patterned stroke) → walls, the Maginot Line | ★ |
| W7 | **Clash burst** (crossed swords, explosion) → battle moments | ★★★ |
| W8 | **Strength bars shrinking** per side → attrition | ★★ |
| W9 | **Order-of-battle panel** (troops, guns, ships) → stakes before the fight | ★★ |
| W10 | **Tactical formations** (phalanx, line, wedge) at tactical zoom → how battles were won | ★★ |
| W11 | **Artillery arcs** and impact markers → bombardment | ★ |
| W12 | **Air raid paths** with flak bursts → air war | ★ |
| W13 | **Naval line of battle**, ship icons sinking → naval combat | ★ |
| W14 | **Commander portrait attached to a unit** → personalizes the maneuver | ★★ |
| W15 | **Casualty counters** at the end of the battle → consequence | ★★ |
| W16 | **Terrain-advantage callouts** (high ground, river crossing, chokepoint) → why the battle went that way | ★★ |

### 3.9 Time and era devices

| ID | Technique → purpose | Prev |
|---|---|---|
| T1 | **Year ticker** (large rolling digits) → time-lapse anchor | ★★★ |
| T2 | **Date/calendar flip** (day-level) → campaigns, crises | ★★ |
| T3 | **Era/chapter title card** → structure and rest | ★★★ |
| T4 | **Before/after wipe slider** → change | ★★ |
| T5 | **Bottom timeline ribbon** with a moving marker → orientation | ★★ |
| T6 | **Time-lapse speed ramp** (years per second accelerate or slow at key events) → rhythm | ★★ |
| T7 | **Era-shifting basemap style** (parchment → modern) → passage of centuries | ★ |
| T8 | **Battle clock HUD** (hours) → tactical tempo | ★ |
| T9 | **"Meanwhile" split** across two locations → parallel threads | ★★ |

### 3.10 2.5D and 3D (MapLibre v5 globe, terrain, sky, fog; terrain exaggeration can be animated ([MapLibre example](https://maplibre.org/maplibre-gl-js/docs/examples/sky-fog-terrain/), [v5 release](https://github.com/maplibre/maplibre-gl-js/releases/tag/v5.0.0)))

| ID | Technique → purpose | Prev |
|---|---|---|
| G1 | **Terrain grow** (exaggeration 0→2) → "the mountains explain everything" | ★★ |
| G2 | **Sun-angle sweep** on hillshade / long shadows → drama, relief | ★★ |
| G3 | **Extruded countries or regions** → emphasis, data | ★★ |
| G4 | **Globe spin with atmosphere** → openers, global scope | ★★★ |
| G5 | **Layered paper cut-out parallax** → handmade depth | ★★ |
| G6 | **Map unfold / paper fold** → intro device | ★ |
| G7 | **Elevation cross-section** pulled from a line → passes, barriers | ★★ |
| G8 | **3D landmarks** (simple low-poly) → recognition | ★ |
| G9 | **Underwater bathymetry reveal** (water drains) → seas, chokepoints | ★ |

### 3.11 Scene transitions

| ID | Technique → purpose | Prev |
|---|---|---|
| X1 | **Cloud punch-through** → zoom-level change | ★★★ |
| X2 | **Zoom-through a dot** into the next scene → continuity | ★★ |
| X3 | **Shape match-cut** (country outline → object) → wit | ★★ |
| X4 | **Whip/swish pan** with blur and whoosh → pace | ★★★ |
| X5 | **Paper tear / burn** → era break | ★ |
| X6 | **Ink bleed / watercolor wash** → soft chapter change | ★ |
| X7 | **Glitch / RGB split** → modern or tech scenes, shorts | ★★ |
| X8 | **Globe flip** to the other hemisphere → "meanwhile, across the world" | ★★ |
| X9 | **Fade through black** with a chapter title → rest beat | ★★ |
| X10 | **Iris/mask wipe** shaped like a region → focus | ★ |

### 3.12 Typography and captions

| ID | Technique → purpose | Prev |
|---|---|---|
| Y1 | **Kinetic stat card** (huge number plus subline) → hook, stakes | ★★★ |
| Y2 | **Word-by-word captions** with the active word highlighted (1–3 words) → Shorts retention ([Hormozi-style spec](https://ascynd.io/en/blog/hormozi-captions)) | ★★★ (short-form) |
| Y3 | **Keyword emphasis** (color and scale on key nouns) → comprehension | ★★ |
| Y4 | **Quote card** with portrait and attribution → primary-source voice | ★★ |
| Y5 | **Typewriter reveal** → documents, dates | ★★ |
| Y6 | **Lower thirds** (person, place, date) → orientation | ★★★ |
| Y7 | **First-frame hook text** (question or claim) → stops the scroll | ★★★ (short-form) |
| Y8 | **Numbered chapter headers** → long-form structure and YouTube chapters | ★★ |

### 3.13 Texture, grade, post

| ID | Technique → purpose | Prev |
|---|---|---|
| P1 | **Paper/parchment multiply** → handmade warmth | ★★★ |
| P2 | **Animated film grain** (also hides gradient banding) → cohesion | ★★ |
| P3 | **Vignette** → focus | ★★★ |
| P4 | **Glow/bloom** on accents → modern polish | ★★ |
| P5 | **Light leaks / film burns** → documentary feel | ★★ |
| P6 | **Edge chromatic aberration** → lens realism | ★ |
| P7 | **Halftone** → print styles | ★ |
| P8 | **Per-preset LUT grade** that unifies maps, photos and icons → one coherent piece | ★★★ |
| P9 | **Stepped animation on twos** (12 fps overlays) → handmade feel ([Vox](https://nofilmschool.com/how-create-vox-style-map-animations-after-effects)) | ★★ |
| P10 | **Gate weave, scratches, flicker** → archival | ★ |
| P11 | **Soft drop shadows / ambient occlusion** under overlays → depth hierarchy | ★★★ |
| P12 | **Motion blur** on fast moves → realism | ★★ |

**Sound primitives (ESTIMATE, standard editing practice):**
- whoosh on camera moves and transitions
- riser before reveals
- impact or boom on border flips and clashes
- pop or click for pins, labels and counters
- paper rustle and marker squeak for paper styles
- typewriter clicks
- ambient beds that match the environmental effect (rain, wind, battle)
- a "drop" (silence) before a twist

([sound-design practice](https://medium.com/@amir.otaifa/whoosh-the-importance-of-sound-design-in-animation-video-70393f012718)). Every visual primitive should carry a default SFX hook in the DSL.

---

## 4. (C) Story and retention structure

### 4.1 Hooks
**VERIFIED (secondary):**
- 50–60% of Shorts drop-offs happen in the first 3 s. The target is a swipe-away rate of <25% in the first 3 s, and >40% means the hook is broken ([shortimize](https://www.shortimize.com/blog/youtube-shorts-retention-rate)).
- Paddy Galloway's study of 3.3B views (5,400 Shorts, 33 channels) found that Shorts with <60% "viewed vs swiped away" rarely performed well, and the best sat at 70–90% ([X thread](https://x.com/PaddyG96/status/1646898368495382528?lang=en)).
- MrBeast's leaked guide: the first minute "is the most important minute"; "crazy progression" (front-loading story beats) ([Dexerto](https://www.dexerto.com/youtube/leaked-mrbeast-pdf-reveals-youtubers-secrets-to-video-success-2900841/)).
- Long form: about 70% retention at 30 s is a widely cited benchmark ([influencernotes](https://influencernotes.com/academy/youtube-audience-retention-first-30-seconds), secondary).

**Short-form hook patterns for map videos (0–3 s; ESTIMATE, from the genre):**
1. **Motion at frame 0.** The camera is already moving and the subject is already highlighted. No logo, no "hey guys".
2. **Geographic oddity question:** "Why is Chile 4,300 km long but only 177 km wide?"
3. **Contradiction:** "This country has no army, and nobody has invaded it in 75 years."
4. **Stakes stat slam:** a huge counter plus the region lighting up red.
5. **End state first:** show the final empire or border, then "How did a tiny city do this?"
6. **What-if:** "What if Rome never fell?"
7. **Direct address of a visible map feature:** "Look at this border. It's perfectly straight. Here's why."
8. **Countdown/list:** "3 borders that make no sense."

**Pair a spoken hook (~10–14 words) with first-frame on-screen text.** The often-quoted "85% watch on mute" figure is a 2016 Facebook publisher statistic ([NiemanLab](https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/)). TikTok and Shorts are mostly sound-on, so text should **reinforce** the voice rather than replace it.

**Long-form first 30 s (ESTIMATE / creator practice):**
- Start with a cold open in medias res: the moment of highest stakes, on the map.
- State the **promise** that matches the title. Harris builds hooks around a title/thumbnail "promise" and visual anchors before context ([medium](https://medium.com/@contact_15635/5-storytelling-tips-by-vox-filmmaker-johnny-harris-7daeee95e351)). "Pattern-matched hooks retain ~78% at 30 s" is a secondary, unverified claim.
- Preview the payoff and plant 1–2 open loops.
- Put any channel intro or sponsor after the hook (≥30–60 s).

### 4.2 Narrative arcs to hard-code as script templates
1. **Geographic "Why" explainer** (RealLifeLore formula; [becomeviral](https://becomeviral.com/blog/reallifelore-case-study)): oddity question → physical geography (terrain, rivers, climate) → historical layer → economic/political layer → twist/complication → present-day consequence → callback to the opening image.
2. **Battle/campaign** (Kings and Generals / Epic History pattern, ESTIMATE): strategic situation and stakes → actors (portraits) → forces (order of battle) → terrain → plans (arrows) → phases of the clash (2–5) → turning point → aftermath (border change, casualties) → legacy.
3. **Rise and fall of an empire:** humble origin → first expansion → golden age (map at its peak) → internal cracks → external shock → collapse (fragmentation morph) → what remained.
4. **Geopolitical crisis:** today's flashpoint → historical roots → each actor's interests (color-coded) → military balance → scenarios (what-if branches) → open question.
5. **Every-year timelapse:** music-led. Pause on 5–10 inflection years with short captions, and speed up through quiet centuries.
6. **Short-form micro-arc (20–60 s):** hook (0–3 s) → context (3–10 s) → 2–3 escalating beats → twist or payoff → loop line.

**Open loops and curiosity gaps:**
- Plant "we'll come back to this river" style loops, and close each one within the video.
- Give every chapter a mini-cliffhanger ("…but he had made one fatal mistake").
- Nested questions: answer the previous loop as you open a new one ([cold-open craft](https://glcoverage.com/blog/cold-opens-in-scripts/)).
- Raise stakes with specifics: numbers, names, distances, dates.

### 4.3 Pacing numbers (engineering defaults)
| Parameter | Shorts / TikTok / Reels | Long-form 10–20 min | Basis |
|---|---|---|---|
| Narration speed | 160–185 WPM | 140–155 WPM | Documentary 135–150, explainers ~145 WPM; <120 feels slow, >180 is fatiguing ([syllaby/flowshorts, secondary](https://flowshorts.app/blog/words-per-minute-speaking)). The short-form figure is an ESTIMATE |
| Script length | 45 s ≈ 120–140 words | 10 min ≈ 1,450–1,550 words | Derived from WPM |
| Visual change (any layer: camera target, new overlay, label, cut) | Every 1.5–2 s | Every 3–6 s on maps; a new "scene" every 8–20 s | Shorts 1.5–2 s ([secondary](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8)); map long-form is an ESTIMATE |
| Larger pattern interrupt (chapter card, style shift, music change) | n/a | Every 10–20 s in the first 3 min, then every 25–40 s | AIR analysis of 100 channels (secondary, same URL) |
| Max simultaneous new elements | 1–2 | 2–3 | ESTIMATE (cognitive load) |
| Holds after big reveals | 0.5–1 s | 1.5–3 s | ESTIMATE |

**The engineering rule:** the narration's **word-level timestamps** (forced alignment) are the master clock. Each visual event is anchored to a word (e.g., a highlight lands when the country name is spoken, ±2 frames).

### 4.4 Lengths that perform (VERIFIED, secondary unless noted)
- **YouTube Shorts:** max 3 min, square or vertical, since 15 Oct 2024 ([1of10](https://1of10.com/blog/how-long-can-youtube-shorts-be/)).
  - Most high performers are 20–40 s; 50–60 s works for narrated storytelling ([toptal/opus summaries](https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention)).
  - Galloway: Shorts with AVD >50 s averaged 4.1M views; the algorithm seemed to favor 40 s+ Shorts with strong retention ([videogen summary](https://videogen.io/blog/decoding-the-youtube-shorts-algorithm-a-deep-dive-into-3-3-billion-views)).
- **TikTok:** only videos **≥1 min** earn Creator Rewards; "qualified views" means ≥5 s ([gemlist](https://www.gemlist.io/blog/tiktok-creator-rewards-requirements)). Educational content does well at 42–90 s ([quso/teleprompter](https://www.teleprompter.com/blog/how-long-should-a-tiktok-video-be)). So the product should offer a **61–90 s TikTok cut** by default.
- **Instagram Reels:** max 3 min since Jan 2025. Reels over 3 min aren't recommended to non-followers ([metricool](https://metricool.com/instagram-reels-length/)).
- **Long-form:** the genre clusters at 10–20 min (RealLifeLore; Epic History 15–20 min). Targets are 50–60% average view percentage at 10 min and 35–45% at 20 min ([prepublish](https://prepublish.ai/blog/good-average-view-duration-youtube), secondary).

### 4.5 Captions
- **Short-form:** word-by-word, 1–3 words per line, heavy sans in all caps (Montserrat Black or Anton), white text with a thick black stroke, and the active or key word in yellow/green ([spec](https://ascynd.io/en/blog/hormozi-captions)). Claimed lifts of 12–80% in watch time are vendor claims and unverified ([kreateflo](https://kreateflo.com/blog/which-animated-caption-styles-actually-increase-video-watch-time)).
- **Map shorts need captions that avoid the subject.** Use a layout engine that places captions in the free band of the safe zone opposite the map's focus.
- **Long-form:** usually no burned-in captions. Map labels and stat cards do that work. Ship an SRT/VTT file for platform captions and translations.

### 4.6 Music and SFX
- **Mix spec:**
  - YouTube normalizes down to −14 LUFS, so master at about −14 LUFS integrated with a true peak of −1 dBTP ([criticallisteninglab](https://www.criticallisteninglab.com/en/learn/loudness/youtube)).
  - Duck music under the voice by about 12–18 dB (ESTIMATE).
  - SFX should sit under the voice and never compete with it ([practice](https://medium.com/@amir.otaifa/whoosh-the-importance-of-sound-design-in-animation-video-70393f012718)).
- **Mood mapping (ESTIMATE):**
  - war/ancient: orchestral, epic percussion
  - geopolitics: dark synth or piano pulse
  - explainers: plucky or lo-fi
  - timelapse: one continuous cinematic track
  - nation edits: phonk (licensing risk)
- **Structure:** change the music at chapter boundaries, drop to silence before twists, and hit a "stinger" on reveals.
- **Loop tricks for Shorts:**
  - Make the last sentence grammatically flow into the first ("…and that's why—" / "—this country is shaped like a knife").
  - Match the first and last frames.
  - Loops push retention above 100% and are rewarded ([virvid/directai, secondary](https://virvid.ai/blog/looping-structure-shorts-retention-2026)).

---

## 5. (D) Quality bar: top-tier vs amateur / "AI slop"

Context: 404 Media documented AI "Boring History" channels flooding YouTube with error-filled, recycled scripts and visuals ([404media](https://www.404media.co/ai-generated-boring-history-videos-are-flooding-youtube-and-drowning-out-real-history/)). YouTube's July 2025 policy targets templated, mass-produced content ([SMT](https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/)). Being visibly *not* slop is both a product requirement and a compliance requirement.

| Dimension | Top-tier (must do) | Slop tells (must avoid) |
|---|---|---|
| **Geographic truth** | Borders correct for the era (no modern borders in 1200 AD), period coastlines, era-correct place names and flags, disputed areas marked as disputed, honest fuzziness for pre-modern "spheres of influence" ([critique of anachronistic precision](https://en.wikipedia.org/wiki/The_Historical_Atlas_of_China)) | Modern borders on ancient maps, wrong flags, misplaced cities |
| **Sync** | Visual events land on the spoken word; camera arrives *as* the place is named | Visuals drift; long holds while the narration moves on |
| **Camera** | Eased, purposeful, continuous geography (fly rather than cut when nearby); no tile pop-in or blank tiles | Linear zooms, jitter, loading artifacts, random zooms on static images |
| **Decluttering** | Basemap labels stripped; only narrated labels shown; no collisions; clear label hierarchy | Busy default basemap, overlapping labels |
| **Consistency** | Each faction keeps one color all video; legend; one design system | Colors change scene to scene |
| **Depth & layering** | Soft shadows, glows, z-order, semi-transparent fills over terrain | Flat stacked clip-art |
| **Cohesion** | One grade, grain and texture across maps, photos and icons | Mismatched stock photos and AI images |
| **Imagery honesty** | Public-domain archival (PD-Art faithful reproductions; [Commons](https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs)), illustrations clearly stylized, correct person in portraits | Photorealistic AI "historical photos" with wrong uniforms, fake archival material |
| **Script** | Specific numbers, names and dates; causal chains ("because… therefore…"); stakes; open loops; nuance; sources | Filler ("In this video…"), AI clichés ("tapestry", "delve", "annals of history"), vague claims, hallucinated facts |
| **Voice** | Natural prosody, correct pronunciation of place and person names (lexicon), emotional range | Monotone TTS, mispronounced names, glitches (the 404 Media example had a voice glitch at 1h15m) |
| **Sound** | SFX on every motion, ducked music, silence used deliberately | No SFX, loud generic stock music |
| **Pacing** | Alternates fast and slow, breathes after reveals | Uniform cadence, a wall of narration |
| **Typography** | Proper fonts, kerning, readable at phone size | Default system fonts, tiny text |
| **Delivery tech** | Consistent fps; dither/grain against banding; export long-form at 1440p+ so YouTube serves VP9/AV1 ([secondary](https://swarmify.com/blog/what-you-need-to-know-about-the-video-bitrate/)); BT.709 color | 1080p H.264 mush on thin lines, banding |
| **Originality** | Variation between videos (camera, styles, structure), user-specific inputs | Same template every time (YPP risk) |

**Recommended automated QA gates:**
1. Label-collision and safe-zone checker.
2. Sync checker (event-to-word offset).
3. Faction color consistency.
4. Vision-LLM critique of sampled frames against a rubric.
5. Fact-check pass with citations.
6. Era-consistency check on flags and place names (Wikidata dates).
7. Loudness check.

---

## 6. (E) Short vs long form

| Aspect | 9:16 Shorts / TikTok / Reels | 16:9 long-form | 1:1 / 4:5 feed |
|---|---|---|---|
| Framing | Rotate the bearing so tall subjects fit (C16); tighter zooms; one subject per frame; split top and bottom for comparisons | Wide establishing shots, multiple actors at once | 4:5 is 1080×1350; centered compositions |
| Text size (ESTIMATE) | Labels ≥44–56 px cap height on 1080 width; ≤3 labels at once | Labels ≥28–36 px at 1080p (scale up for 1440p/4K) | Between the two |
| Pacing | Change every 1.5–2 s; VO 160–185 WPM | Change every 3–6 s; VO 140–155 WPM; chapters | Like shorts |
| Hook | 0–3 s, visual plus text plus voice | Cold open of 15–45 s | 0–3 s |
| Captions | Word-by-word burned-in | Usually none (SRT instead) | Burned-in |
| Ending | Loop line, no outro | Payoff, then a call to action or the next-video tease | Loop |
| Render | 1080×1920 at 30 fps (60 for fast edits) | 2560×1440 or 3840×2160 at 24/30 fps | 1080×1080 / 1080×1350 |

**Safe zones on a 1080×1920 canvas (VERIFIED, secondary; platforms change these, so keep them configurable):**
- **TikTok:** keep clear 130 px top, 484 px bottom, 44 px left, 140 px right. That leaves an 896×1306 window. Keep key content ≥370 px above the bottom even with an expanded caption ([cadenus](https://cadenus.io/resources/blog/tiktok-safe-zone/)).
- **YouTube Shorts:** UI covers about 160 px top, 320 px bottom and 150 px on the right rail. A conservative setting is top/bottom 380, left 60, right 120 ([poster.ly/postplanify](https://postplanify.com/tools/youtube-shorts-safe-zone-checker)).
- **Meta (Instagram/Facebook Reels and Stories), unified March 2026:** top 14% (269 px), bottom 35% (672 px), sides 6% (65 px). That leaves about 950×979 ([frameextractor](https://frameextractor.video/blog/instagram-safe-zones/)).
- **Recommended "post-anywhere" safe box:** the intersection of the above, which is top 270, bottom 672, left 65, right 150, giving **865×978 px**.
  - Map focus and captions must live inside it.
  - Decorative background (map extent, textures) still fills the whole frame.
  - Offer per-platform exports so a TikTok-only video can use the larger TikTok window.

**Repurposing:** generate vertical cuts from long-form by **re-laying out** scenes (rotate bearing, re-place labels, re-time to the faster VO). A center crop does not work.

---

## 7. Data and asset sourcing notes (genre-critical; deeper licensing is likely another agent's area)

- **Usable:**
  - Natural Earth: public domain ([terms](https://www.naturalearthdata.com/about/terms-of-use/)).
  - OpenHistoricalMap: CC0 with per-feature exceptions ([copyright](https://www.openhistoricalmap.org/copyright)).
  - Protomaps OSM tiles: ODbL, attribution "© OpenStreetMap" required ([LICENSE_DATA](https://github.com/protomaps/basemaps/blob/main/LICENSE_DATA.md)).
  - NASA Blue Marble: public domain, credit NASA; no NASA logos ([NASA EO](https://earthobservatory.nasa.gov/ContentFeature/BlueMarble/bmng.pdf)).
  - Sentinel-2 cloudless **2016**: CC BY 4.0.
  - Mapzen/AWS Terrarium terrain: attribution required ([AWS registry](https://registry.opendata.aws/terrain-tiles/)).
  - milsymbol: MIT. flag-icons: MIT. Flagpedia: PD.
  - OFL fonts. Pixabay SFX inside rendered videos is fine; redistributing them as a library product is not ([picdefense/Pixabay FAQ](https://pixabay.com/service/faq/)).
- **Avoid or license first:**
  - Google Map Tiles / Photorealistic 3D Tiles: promo videos only, ≤30 s ([policies](https://developers.google.com/maps/documentation/tile/policies)).
  - Google Earth Studio: a manual tool; Google offers no commercial imagery license, although monetized educational YouTube use with attribution is tolerated ([FAQ](https://www.google.com/earth/studio/faq/)). It cannot run inside a SaaS pipeline.
  - Mapbox video use requires sales.
  - Sentinel-2 cloudless 2018–2023: NC; commercial license via EOX.
  - historical-basemaps: GPL-3.0.
  - RMBG-2.0: CC BY-NC.
  - Depth-Anything-V2 Base/Large: CC BY-NC.
  - Cesium ion: renders/videos are allowed for its own content on ion+ (from $149/mo), but third-party assets carry their own terms ([Cesium guide](https://cesium.com/learn/ion/content-usage-and-attribution-guide/)).

---

## 8. Platform policy constraints that shape the product
- **YouTube** "inauthentic content" (renamed 15 Jul 2025): templated or mass-produced content with minimal variation is ineligible for monetization. AI-assisted content is fine if it is original and adds value ([SMT](https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/)).
- **YouTube** altered/synthetic disclosure is required for *realistic* synthetic people, events or places. Cloning *someone else's* voice requires disclosure ([secondary summary](https://shortsfast.com/blog/youtube-ai-content-disclosure-rules-2026/)). Stylized map animation generally does not; photoreal AI "historical scenes" probably do.
- **TikTok** auto-labels AI content via C2PA and requires labels on realistic AI visuals or audio ([secondary](https://www.cinerads.com/blog/tiktok-ai-content-policy)).
- **Implication:** default to stylized, non-photoreal generated imagery. Embed honest C2PA/metadata where relevant. Add an upload checklist that tells users when to tick "altered content".

---

## 9. What I need from the founder
See questions_for_founder. The most important decisions:
1. Which 6–8 launch presets, and 5–10 reference videos you consider "astonishing".
2. Your stance on AI-generated imagery, current wars and disputed borders.
3. Shorts-first or long-form-first.
4. Whether you will pay for commercial satellite/3D data.
5. Your per-video cost ceiling.


## KEY RECOMMENDATIONS
- Build the renderer around a declarative scene/timeline DSL whose vocabulary is the ~150-primitive technique catalog, with style presets as swappable token bundles (basemap, palette roles, fonts, textures, motion profile, SFX kit, caption skin), because top channels share primitives and differ mainly in styling, and an LLM can plan structured JSON reliably.
- Launch with 6-8 polished hero presets (Clean Explainer, Field Notes, Dark Geopolitics, Campaign Parchment, Ops Room Tactical, Orbital Satellite, Chronicle Timelapse, Nation Edit) rather than 28, because perceived quality per preset drives conversion and each preset needs QA.
- Make word-level forced-alignment timestamps of the voiceover the master clock, and anchor every visual event to a word (+/-2 frames), because tight sync is the biggest visible difference between pro work and slop.
- Have the script writer emit narration and a visual beat list together (the 'visual-first' method), with a visual change every 1.5-2 s in shorts and every 3-6 s in long form, because the genre's best creators write visuals and script together.
- Hard-code 5-6 proven narrative templates (geographic 'Why' explainer, battle/campaign, rise-and-fall, geopolitical crisis, every-year timelapse, short micro-arc) with hook, open-loop and loop-ending rules, because structure drives retention more than visuals do.
- Use only an open/commercially clean map stack (MapLibre GL v5 globe+terrain, self-hosted Protomaps/OSM tiles, Natural Earth, OpenHistoricalMap, NASA Blue Marble, Sentinel-2 2016 CC BY or licensed EOX, open DEMs) and exclude Google Map Tiles/Photorealistic 3D, Google Earth Studio and Mapbox, because their ToS forbid or restrict video output.
- Do not ship aourednik historical-basemaps (GPL-3.0) as the core border source; build a curated, versioned historical-border dataset from CC0/PD sources plus LLM-assisted, human-reviewed polygons with uncertainty flags, because border accuracy is the genre's credibility currency and GPL creates legal ambiguity.
- Default to stylized, non-photoreal imagery and public-domain archival assets, and forbid fake 'archival photos' by default, because AI history slop is a recognized and criticized category, and realistic synthetic media triggers disclosure and labeling on YouTube and TikTok.
- Build an automated QA gate (label collisions, safe zones, sync offsets, faction color consistency, era-correct flags and names, loudness -14 LUFS/-1 dBTP, plus a vision-LLM frame critique) before delivery, because consistent polish at scale needs machine checks.
- Use a configurable all-platform 9:16 safe box (top 270, bottom 672, left 65, right 150 px on 1080x1920, giving 865x978) plus per-platform overrides, and re-lay out (not crop) when converting 16:9 to 9:16, because platform UIs differ and changed as recently as March 2026.
- Offer length presets tied to monetization: 20-45 s (YouTube Shorts virality), 61-90 s (TikTok Creator Rewards requires at least 1 min), and 8-20 min long-form exported at 1440p+, because each target has different economics, and 1440p uploads get VP9/AV1 quality on YouTube.
- Build per-video variation and real user input (topic angle, voice, style seed, edits) into every generation, because YouTube's July 2025 inauthentic-content policy demonetizes templated mass-produced output, which would destroy customer value.
- Attach a default SFX and music-mood behavior to every primitive and preset (whoosh on camera moves, impacts on border flips, pops on pins, ambient beds for weather FX), because sound design is a cheap, high-impact quality multiplier.
- Maintain a pronunciation lexicon (IPA/SSML) for places and historical figures, because mispronounced names are an instant credibility killer in this genre.
- Never name presets after real creators in the UI or marketing (use 'Field Notes', not 'Johnny Harris style'), because of trademark, false-endorsement and goodwill risks.

## COST ITEMS
- Remotion Company License - Remotion for Automators: $0.01 / per render, $100/month minimum (Applies to prompt-to-video / automated pipelines. Free only for companies with 3 or fewer employees.) https://www.remotion.dev/docs/license/pricing
- GEOlayers 3 (After Effects plugin) - reference tool used by Johnny Harris/Vox: $329.99 / one-time per seat ($205 upgrade from v2) (Desktop After Effects tool. Not usable in a server pipeline; useful only for the internal design team to prototype presets.) https://www.toolfarm.com/buy/markus_bergelt_geolayers/
- Animaps (competitor) Starter / Pro: $9.90 / $19.90 / per month (80 / 180 credits; up to 40 / 90 animations) (Price anchor for map-clip tools. Max 1440p, no narration or script.) https://animaps.ai/pricing
- Mult.dev (competitor) Pro packs: $5.99 / $24.99 / $34.99 / one-time for 5 / 25 / 100 videos (valid 3 years) (Travel-route niche price anchor.) https://mult.dev/articles/best-travel-map-animation-tools-in-2026
- Mapbox Static Images API: Free up to 50k, then $1.00 / $0.80 / $0.60 / per 1,000 requests (tiers 50k-500k / 500k-1M / 1M-5M) (Video-media use of Mapbox map content needs separate rights from Mapbox sales, so it is not recommended.) https://www.mapbox.com/pricing
- Cesium ion+ (commercial use of Cesium World Terrain etc.): from $149 / per month (50 GB storage) (Search snippet from Cesium blog/guide. Third-party assets (Google 3D, Bing) carry their own restrictions. Verify the current plan pricing.) https://cesium.com/learn/ion/content-usage-and-attribution-guide/
- Claude Sonnet 5.5 API (script writing / scene planning): $2 input / $10 output / per 1M tokens (cache read $0.20; Batch API 50% off) (From the project's known facts (cached 2026-09-25), not re-verified by me.) https://www.anthropic.com/pricing
- Claude Haiku 4.5 API (QA checks, captions, classification): $1 input / $5 output / per 1M tokens (From the project's known facts, not re-verified.) https://www.anthropic.com/pricing
- Claude Opus 5.5 API (premium research/script): $4 input / $20 output / per 1M tokens (cache read $0.20) (From the project's known facts, not re-verified.) https://www.anthropic.com/pricing
- Natural Earth vector/raster data: $0 / public domain (No attribution required.) https://www.naturalearthdata.com/about/terms-of-use/
- OpenHistoricalMap data / vector tiles: $0 / CC0 (with per-feature exceptions) (Self-host tiles to avoid load on the OHM servers.) https://www.openhistoricalmap.org/copyright
- NASA Blue Marble Next Generation imagery: $0 / public domain (credit NASA Earth Observatory) (No NASA logos or implied endorsement.) https://earthobservatory.nasa.gov/ContentFeature/BlueMarble/bmng.pdf
- EOX Sentinel-2 cloudless 2016 mosaic: $0 / CC BY 4.0 (attribution required) (2018-2023 mosaics are CC BY-NC-SA; commercial license from EOX at an unknown price (request a quote).) https://eox.at/2017/08/sentinel-2-global-cloudless-mosaic/
- Mapzen/AWS Terrarium terrain tiles: $0 / AWS open data (attribution required) (Self-host or cache to control egress cost.) https://registry.opendata.aws/terrain-tiles/
- Pixabay sound effects: $0 / royalty-free inside rendered videos (Cannot be redistributed as a standalone library or template product.) https://pixabay.com/service/faq/

## RISKS
- Data/ToS traps: Google 3D Tiles and Google Earth, Mapbox, EOX 2018+ imagery, GPL historical borders, and NC-licensed AI models (RMBG-2.0, Depth-Anything Base/Large) could each make rendered customer videos infringing. A legal review of the full asset and model bill of materials is needed before launch.
- Historical and geographic accuracy: auto-generated borders, flags, place names and 'facts' will sometimes be wrong. The genre's audience is famously pedantic, so errors damage both the brand and customers' channels. A curated border database, citations and QA are needed.
- Disputed borders and live conflicts (Kashmir, Crimea and Ukraine, Taiwan, Israel and Palestine, Western Sahara, South China Sea) create political backlash, possible legal exposure in some jurisdictions, and platform moderation risk. Neutral defaults and clear point-of-view settings are required.
- Platform monetization policy: YouTube's inauthentic/mass-produced content policy and AI-disclosure rules, plus TikTok AIGC labels, could demonetize or down-rank customers' videos if output looks templated or uses realistic synthetic imagery. That would directly drive churn.
- Quality ceiling: hand-made channels spend weeks per video (about 6 weeks for an Epic History episode). Fully automatic output may hit an 'uncanny sameness' plateau. A strong per-scene editor and regeneration will probably be needed to reach 'astonishing'.
- Trade dress and naming: presets that clone a specific creator's look or use their names (Johnny Harris, Kings and Generals, Kurzgesagt, Paradox game UIs) invite trademark or false-endorsement claims and community backlash.
- Music and SFX licensing: Content ID claims on customers' videos, and libraries (e.g., Pixabay) that forbid redistribution as a library product. Phonk-style edits depend on music that is hard to license.
- Graphic violence and war glorification in battle content, plus extremist misuse (e.g., propaganda maps, irredentist content), need moderation policies and topic filters.
- Platform specs drift (Meta changed safe zones in March 2026; Shorts length changed in Oct 2024). Layout rules must be data-driven, not hard-coded.
- Low-priced competitors (Animaps $9.90-$19.90/mo, Mult.dev one-time packs) anchor price expectations for 'map animation', even though they don't produce full documentaries. Positioning must stress narrated, researched, finished videos.
- Short-form monetization for end users is weak (Galloway's 2023 study: about $0.06 per 1,000 Shorts views), which limits willingness to pay among faceless-channel operators unless long-form or TikTok 1-min+ outputs are strong.
- Several genre metrics in this report (retention lifts from captions, safe-zone pixels, WPM norms) come from secondary blogs, and the egress proxy blocked full-page verification. Re-validate them before treating them as hard specs.

## QUESTIONS FOR FOUNDER
- Which customer segment comes first: faceless-channel operators (volume, price-sensitive), educators/creators (quality, editing), or brands/newsrooms/agencies (accuracy, compliance)? This decides shorts-first vs long-form-first.
- Please share 5-10 specific videos (any channel or platform) that you consider 'astonishing', plus 2-3 you consider slop. These become the quality benchmark and the first preset targets.
- Which 6-8 style presets do you want at launch? (Suggested: Clean Explainer, Field Notes, Dark Geopolitics, Campaign Parchment, Ops Room Tactical, Orbital Satellite, Chronicle Timelapse, Nation Edit.)
- What is your stance on AI-generated imagery (historical scenes, portraits of real people, battle illustrations): allowed with labels, stylized only, or forbidden by default?
- Should the product allow current/ongoing conflicts and disputed territories? If so, what default point of view for borders (de facto, de jure, per-viewer-country), and who signs off on that policy?
- What maximum variable cost per finished minute of video can you accept (e.g., $0.10, $0.50, $1.00) at launch, and what retail price points are you considering?
- Fully automatic at launch, or do you want a human-in-the-loop editor (per-scene regenerate, timeline tweaks) in v1?
- Are you willing to pay for commercial data licenses (e.g., EOX Sentinel-2 commercial, Cesium ion+, licensed music library) to get premium satellite/3D looks and safe music?
- Which voice/TTS approach: stock voices only, users cloning their own voice, or both? Which launch languages?
- What maximum video length for v1 (e.g., 3 min, 10 min, 20 min)? Long-form multiplies render and QA complexity.
- Do you have a budget and counsel for a legal review of data, model and asset licenses and of platform ToS (YouTube, TikTok, Meta) before public launch?
- Should the product auto-publish to YouTube/TikTok (OAuth upload, AI-disclosure flags), or deliver files only at first?