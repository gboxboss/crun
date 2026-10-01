# How to build the map-animation renderer: techniques, engines, determinism and a scene DSL

Research date: 2026-10-01. Labels used below:
- **[V]** means I verified the fact against a primary source (a URL, the npm registry, or source code I downloaded).
- **[V-s]** means I confirmed it through a search-engine snippet of the primary page. My sandbox could not fetch remotion.dev, gsap.com, mapbox.com, cesium.com or developers.google.com directly, so I read Remotion's docs from GitHub raw and its npm packages instead.
- **[E]** marks my own estimate or opinion.

---

## 0. Verdict

1. **The core can be built with open, commercially safe parts.**
   - MapLibre GL JS v6 handles basemap, globe, terrain and vector styling.
   - deck.gl 9.4 runs interleaved in the same WebGL context and handles geometry that changes every frame: arrows, trips, units, masks.
   - Our own WebGL2/Canvas overlay handles FX, labels, typography and media.
   - Remotion v4 hosts all of it. It turns "frame N" into a pure function and screenshots the composited page.
   - d3-geo runs as a second, CPU-friendly engine for stylized flat maps in any projection.
2. **Determinism is the hard part, and it can be solved.**
   - MapLibre has the hooks needed for frame-exact output: `setNow()`, `fadeDuration: 0` (which forces full symbol placement), `redraw()`, `areTilesLoaded()` and the `idle` event.
   - Some internal state is still path-dependent: variable-anchor label placement and async GeoJSON workers. Story labels and per-frame geometry must therefore live outside MapLibre's symbol and GeoJSON pipeline.
3. **The LLM should not write render instructions.** It should write a semantic storyboard (place names, word anchors, style tokens). A compiler then turns that into a resolved Render IR (coordinates, frame numbers, camera splines). This split is the single most important quality and reliability decision.
4. **Cost.** The Remotion licence is about $0.01 per video [V]. That is negligible. GPU time is what drives render cost.
   - On CPU, WebGL runs through SwANGLE/SwiftShader. That is fine for development but probably 5–20x slower than a GPU for terrain and globe shots [E].
   - Plan a GPU render pool (g4dn/g6-class) for production. Keep CPU SwANGLE for previews and burst capacity.

---

## 1. What the genre does

Visual vocabulary of the reference channels (Kings and Generals, RealLifeLore, Johnny Harris, EmperorTigerstar, Epic History, Polymatter and others), most of it hand-built today in After Effects with GEOlayers 3. GEOlayers offers "highlight features (borders, streets, lakes, rivers…), animate driving routes, extrude buildings… satellite imagery, street maps, terrain" ([Stadia/GEOlayers docs](https://docs.stadiamaps.com/tutorials/getting-started-with-geolayers/)) [V-s].

- **Camera:** globe spins; space-to-ground zooms; slow pushes with pitch over relief; whip pans between theatres.
- **Map content:**
  - Borders and territories that change over time, often with a year counter.
  - Conquest "spread" fills and choropleths.
  - Thick tapered military arrows and NATO-style unit counters.
  - Routes that draw themselves with glowing heads.
  - Pins, labels and callouts with leader lines.
- **Media:** portraits and photos (cutouts, Ken Burns, 2.5D parallax), flags, icons, small charts.
- **Atmosphere:** paper or parchment textures, grain, vignette, weather (rain, snow, storms), smoke and fire, fog of war, day/night, glows.
- **Timing:** everything is locked to narration words, with SFX hits on reveals.

---

## 2. Map and render engines compared

| Engine | License | Projections and 3D | Fit for us | Determinism notes |
|---|---|---|---|---|
| **MapLibre GL JS 6.11.2** (2026-09-24) | BSD-3-Clause [V] [npm](https://www.npmjs.com/package/maplibre-gl) | Projections: mercator, globe, vertical-perspective [V] (source `projection_factory.ts`). Also terrain, hillshade (multiple methods), `color-relief` (hypsometric tint), sky/atmosphere, fill-extrusion, `global-state` expressions, custom WebGL layers. WebGL2 only (`contextType` "restricted to 'webgl2'") [V] | **Primary geo engine.** Vector and raster styling, globe, terrain | Has `setNow/now/restoreNow` "for deterministic rendering… frame-by-frame video capture" [V] ([docs](https://maplibre.org/maplibre-gl-js/docs/API/functions/setNow/), `src/util/time_control.ts`). `redraw()` = "Force a synchronous redraw" [V]. Pitfalls in §3 |
| **deck.gl 9.4.0** (2026-09-05) | MIT [V] | Layers: TripsLayer (`currentTime` is external: "the playhead of the animation") [V], PathLayer, ArcLayer, PolygonLayer, IconLayer, TerrainLayer, MaskExtension. MapLibre v5+ globe support in all integration modes since 9.1 [V] ([what's new](https://deck.gl/docs/whats-new)) | **Per-frame geometry and effects layer**, interleaved into MapLibre's GL context | Attribute updates are synchronous on the GPU. Its own GlobeView is still *experimental* in 9.4 [V]. MaskExtension: "Masking is not supported in GlobeView", max 4 masks [V] ([doc](https://deck.gl/docs/api-reference/extensions/mask-extension)) |
| **d3-geo 3.1.1** + d3-geo-projection 4.0 | ISC [V] | Any projection (orthographic, Natural Earth, Winkel tripel, Robinson…), projection morphing, SVG or Canvas2D | **Second engine** for stylized flat or orthographic looks; CPU-cheap; ideal for 2D "atlas" and EmperorTigerstar-style presets | Fully synchronous, so it is trivially deterministic. No tiles or terrain; vector datasets must be pre-generalized |
| **three.js r186** / **globe.gl 2.46** / three-globe | MIT [V] | Full 3D: custom globe shaders (atmosphere, clouds, ocean specular, night lights), particles, postprocessing (pmndrs `postprocessing`, Zlib [V]) | **Premium globe shots, photo parallax, FX** | Deterministic if driven only by frame time. Avoid `clock.getDelta()` and R3F `useFrame`; Remotion docs say animate "directly rendered into the markup" ([three docs](https://www.remotion.dev/docs/three)) [V] |
| **CesiumJS 1.145** | Apache-2.0 [V] | Photoreal 3D globe, 3D Tiles, terrain, clock-driven time | Optional premium path *with our own data* | Cesium **ion** Community is non-commercial; Commercial from ~$149/mo [V-s] ([pricing](https://cesium.com/platform/cesium-ion/pricing/)). Google Photorealistic 3D Tiles policies allow "promotional videos of the experiences you build" [V-s] ([policies](https://developers.google.com/maps/documentation/tile/policies)). That does **not** clearly cover user-monetized content: **avoid** |
| **Mapbox GL JS 3.32** | Proprietary [V]: "licensed under the Mapbox TOS for use only with the relevant Mapbox product(s)", needs an active Mapbox account ([LICENSE.txt](https://github.com/mapbox/mapbox-gl-js/blob/main/LICENSE.txt)) | Excellent features | **Not recommended.** It ties every render to Mapbox billing (~$5 per 1k web map loads after 50k free [V-s]). Product Terms allow "video media distributed by Internet, cable, and satellite" with Mapbox/OSM attribution [V-s] ([Product Terms 2025-10](https://www.mapbox.com/legal/product-terms)) | Same internals as MapLibre |
| **kepler.gl 3.3-alpha** / **hubble.gl 1.4** | MIT [V] | Config-driven deck.gl apps; hubble.gl = keyframed deck.gl animation and video export | **Prior art** for the config/keyframe DSL, not the runtime | hubble.gl was last published 2025-05 [V] |
| **MapLibre Native (node) 6.4.1** | BSD-2 [V] | Static server-side tile rendering | Later optimization for basemap-only frames | No custom JS layers or deck.gl |
| **Blender + BlenderGIS** | GPL | Film-grade terrain | Out of scope for v1 (GPU-heavy, slow) [E] | |

**Recommendation [E]:**
- Use MapLibre + deck.gl as the default engine and d3-geo for flat stylized presets.
- Add a three.js globe for "planet" shots later.
- Do not use Mapbox GL JS, Google 3D Tiles or Cesium ion data in v1.

---

## 3. Determinism playbook (the "frame contract")

Each frame must be a pure function f(IR, frameNumber). Chunks of a video must render identically on different machines, starting cold.

### 3.1 Verified MapLibre facts (from v6.11.2 source and Remotion's official maps doc)

- **Remotion's official maps page uses MapLibre + Turf, not Mapbox** [V] ([maps.mdx](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/maps.mdx) → remotion.dev/docs/maps).
  - Recommended settings: `interactive: false`, `fadeDuration: 0`, `preserveDrawingBuffer: true`. Use `useDelayRender()` until load.
  - Each frame it calls `map.jumpTo(map.calculateCameraOptionsFromTo(...))`, then `map.once('idle', () => continueRender(handle))`.
  - Lines are animated with `turf.lineSliceAlong` and `setData`.
  - Render with `--gl=angle --concurrency=1`, and **do not call `map.remove()`**.
- **`fadeDuration === 0` forces full symbol placement** [V]. In `src/style/style.ts`: `forceFullPlacement ||= this._layerOrderChanged || fadeDuration === 0;` with the comment "to ensure that newly loaded tiles will fully display symbols in their first frame".
  - Otherwise placement is incremental with a 2 ms time budget measured with `now()` (`pauseable_placement.ts`) [V]. That is wall-clock dependent.
- **Placement still depends on the previous frame** [V]. `placement.ts` reads `prevPlacement.variableOffsets[...]` to keep the previous anchor for `text-variable-anchor` labels, and keeps previous vertical orientations.
  - A chunk that starts cold may therefore choose different label anchors than a sequential render.
  - **Fix:** do not use variable anchors in basemap styles. Render story labels in our own overlay with a per-scene precomputed layout.
- **The time hooks are public** [V]: `setNow()`, `restoreNow()`, `now()` and `isTimeFrozen()`. The [maplibre-gl-video-export plugin](https://github.com/bjperson/maplibre-gl-video-export) (BSD-3, v0.2.0) says it needs v5.11.0 or later for this API [V].
  - Call `maplibregl.setNow(frame * 1000 / fps)` before every frame so any remaining internal transitions are frame-locked.
- **Async paths:**
  - `GeoJSONSource.setData()` and `updateData()` return a `Promise` [V]. They re-tile in a web worker, so geometry that changes every frame through `setData` needs an idle wait each frame. That is slow and a source of flicker.
  - Prefer deck.gl (synchronous GPU attributes) or the overlay for per-frame geometry. Use `setPaintProperty` / `setGlobalStateProperty` for animated styling.
- **`global-state` expression** (since 5.6.0) with `map.setGlobalStateProperty()` [V] ([spec](https://maplibre.org/maplibre-style-spec/expressions/#global-state)).
  - One `year` or `t` variable can drive era filters, choropleth interpolation, extrusion heights and opacities. This is ideal for "borders through time".
  - Caveat [E]: if it is used in filters or layout properties it triggers worker re-layout, so wait for `idle`.
- **Canvas:**
  - `canvasContextAttributes` (`antialias` defaults to false, `preserveDrawingBuffer` defaults to false) [V].
  - `pixelRatio` can be set explicitly; set it so the result does not depend on the host DPR [V].
  - **`maxCanvasSize` defaults to `[4096, 4096]`** [V]. Raise it for 2x-supersampled 1080p or for 4K.
- **Raster fades:** `raster-fade-duration` exists in the style spec [V]. Set it to 0 on every raster layer. Also set the style-level `transition: {duration: 0, delay: 0}`.

### 3.2 Frame contract for every engine and FX module [E]

1. **Inputs are only (IR, frame, seed).**
   - Ban `Math.random`, `Date.now`, `performance.now` and any RAF-driven state (enforce with a lint rule).
   - Use Remotion's `random(seed)` or `@remotion/noise` (MIT [V]), or `simplex-noise` / `alea` (MIT [V]).
2. **Particles and simulations must be stateless.** Position is a closed-form function f(seed_i, t), for example with modulo wrap for rain. Alternatively, re-simulate from scene start inside each chunk (warm-up), never from the previous frame.
3. **Map per-frame sequence:**
   1. `setNow(tMs)`
   2. `jumpTo(camera(frame))`
   3. Apply paint and global-state values
   4. `redraw()`
   5. If `!areTilesLoaded()`, await `idle`
   6. `continueRender`

   Remotion's `delayRender` timeout defaults to 30 s [V] (`DEFAULT_TIMEOUT = 30000` in `@remotion/renderer`). Keep the per-frame wait to seconds at most by serving tiles locally.
4. **Prefetch.** Before rendering a chunk, sample the chunk's camera path every ~0.5 s and `jumpTo` + `idle`, to warm the tile cache. Raise `maxTileCacheSize`.
5. **Load fonts first.** Fonts (`document.fonts.ready`), glyph PBFs, sprites and images load before frame 0 of each chunk.
6. **Never call `flyTo` or `easeTo` during a render.** Compute camera paths yourself (§5, row 2).
7. **Same GPU backend for every chunk of one video.** SwANGLE and NVIDIA output differ slightly per pixel, and mixing them could show at chunk seams.
8. **Golden tests in CI.** Render frame N (a) sequentially and (b) cold-started at a chunk boundary, then compare SSIM or hashes.

---

## 4. Frame host and compositing architecture

### 4.1 Frame host options

| Option | License / cost | How frames are captured | Notes |
|---|---|---|---|
| **Remotion 4.0.532** (2026-10-01) | Free for ≤3-employee companies, *including* SaaS automation ("as long as your total headcount is 3 or less") [V] ([FAQ](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/license/faq.mdx)). Otherwise "Remotion for Automators" **$0.01/render, $100/mo minimum**; Creators $25/seat/mo; Enterprise "Starting at $500 per month" [V] (strings in `@remotion/promo-pages@4.0.532`, [pricing](https://www.remotion.dev/docs/license/pricing)). Stills count as renders; Player and Studio previews do not [V] | CDP `Page.captureScreenshot` of the composited page [V] (from `@remotion/renderer` dist) | Mature: Lambda / Cloud Run, frame-range chunking, audio mixing, `@remotion/captions`, Player for in-app preview, `OffthreadVideo`. GL options: `swangle, angle, egl, swiftshader, vulkan, angle-egl` [V] (`dist/options/gl.js`). Lambda and Cloud Run default to swangle; docs recommend `angle-egl` on GPU cloud and warn of angle memory leaks on long renders, so split them [V-s] ([gl-options](https://www.remotion.dev/docs/gl-options)) |
| **HyperFrames 0.8.103** (HeyGen) | Apache-2.0, no per-render fee [V] ([repo](https://github.com/heygen-com/hyperframes), LICENSE © HeyGen 2026) | Uses `HeadlessExperimental.beginFrame` (begin-frame control), with `Page.captureScreenshot` as fallback [V] (strings in the npm package) | HTML-first, "built for agents", has a Lambda renderer. Newer and less proven. **Plan B** if Remotion terms change |
| **Custom Puppeteer/Playwright + WebCodecs or readPixels → FFmpeg** | Apache-2.0 tooling | Our choice | Most control and cheapest per frame. Highest engineering cost. Consider once volume justifies it [E] |
| Motion Canvas 3.17 / Revideo 0.11 | MIT [V] | Canvas | Good DSL ideas (time events). Motion Canvas has had no release since 2025-02 [V] |

**Recommendation [E]:**
- Use Remotion for v1. $0.01 per video is noise next to TTS and LLM cost.
- Make the Render IR host-agnostic so the renderer can move to HyperFrames or a custom host later.
- Use the Remotion Player for in-browser previews in the editor. They do not count as renders and run on the user's GPU.

### 4.2 Layer stack (bottom to top) inside one Remotion composition [E]

| Z | Layer | Tech | WebGL context |
|---|---|---|---|
| 0 | Background: space, stars, sky gradient, paper | CSS/Canvas/three.js | 0 or 1 |
| 1 | Basemap: raster relief/imagery, vector land/water, hillshade, color-relief, terrain, atmosphere | MapLibre | **A** |
| 2 | Geo data: territories, choropleth, extrusions, borders (static geometry, animated paint/global-state) | MapLibre layers | A |
| 3 | Per-frame geo geometry: arrows, trips, unit icons, geo particles, masks | deck.gl `MapboxOverlay({interleaved:true})` | A (shared) |
| 4 | Geo-anchored FX: territory SDF spread, fog of war, water, terminator | MapLibre **custom layers** (get the map's projection matrix; terrain and globe aligned) | A |
| 5 | Screen FX: rain, snow, lightning, clouds, masked to regions projected with `map.project` | WebGL2 overlay canvas | **B** |
| 6 | Labels, callouts, leader lines, milsymbol units, flags, icons, charts, Lottie | React SVG/HTML | none |
| 7 | Media: cutouts, parallax photos, clips | three.js (`@remotion/three`) / `OffthreadVideo` | **C** |
| 8 | Typography: titles, kinetic captions, year counter | React/CSS, fonts preloaded | none |
| 9 | Post: grain, vignette, LUT/grade, letterbox, optional bloom | CSS blend modes (server render supports them; the client-side renderer does *not* support `mix-blend-mode` [V-s] ([limitations](https://www.remotion.dev/docs/client-side-rendering/limitations))) or a WebGL pass | B |

Practical rules:
- Keep 3 or fewer WebGL contexts per page [E].
- For overlays on a globe, cull points on the far side (dot product of the surface normal with the camera direction) [E].
- At high pitch over terrain, geo-anchored items must be MapLibre or deck.gl layers (with deck.gl `TerrainExtension`, which works on globe as of 9.4 [V]), not a flat SVG overlay. Otherwise they float over mountains.

### 4.3 Headless WebGL, resolution and output

- **Chrome removed automatic SwiftShader fallback** (Chrome 137+). WebGL now needs `--enable-unsafe-swiftshader` or explicit ANGLE SwiftShader [V-s] ([blink-dev intent](https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM), [Chromium SwiftShader doc](https://chromium.googlesource.com/chromium/src/+/main/docs/gpu/swiftshader.md)).
  - Remotion's renderer already passes `--use-gl=angle --use-angle=swiftshader` and `--enable-unsafe-swiftshader` for swangle [V] (renderer dist).
  - Chromium says software WebGL is "not intended for running untrusted content". Never execute user-supplied JS in render pages [E].
- **GPU:** Remotion's cloud-GPU guide uses a g4dn.xlarge (~$375/mo) with NVIDIA drivers and `--gl=vulkan` / chrome-for-testing [V] ([cloud-gpu.mdx](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/miscellaneous/cloud-gpu.mdx)). On-demand prices: g4dn.xlarge ~$0.526/h, g6.xlarge (L4) ~$0.805/h in us-east-1 [V-s] (third-party price trackers).
- **Resolution and quality [E]:**
  - Render 1080x1920 / 1920x1080 at 30 fps for v1.
  - Use `antialias: true` (MSAA) on GPU rather than supersampling.
  - Supersample (pixelRatio 1.5–2) only for thin-line or text-heavy styles on GPU.
  - Offer 4K as a paid tier: it costs 4x the pixels and needs `maxCanvasSize` raised.
- **Chunking [E]:**
  - Long-form video (10–20 min is 18k–36k frames) must be chunked. Each chunk pays a 2–6 s warm-up (style, tiles, fonts), so use chunks of 300–900 frames.
  - The Remotion doc recommends `--concurrency=1` for WebGL-heavy pages. Scale out with more processes or containers instead of more tabs.

---

## 5. Technique → implementation table

Difficulty runs from 1 (trivial) to 5 (research-grade). Render cost is per frame on GPU: low is under 3 ms, medium is 3–15 ms, high is over 15 ms or N times the frame [E].

| # | Technique | Recommended implementation | Libraries (license) | Diff. | Cost | Determinism pitfalls |
|---|---|---|---|---|---|---|
| 1 | Globe spin, space→ground zoom | MapLibre `projection: globe` + sky/atmosphere. Camera via `jumpTo` per frame. Premium variant: three.js globe with cloud and night-light textures (NASA, public domain) | maplibre-gl (BSD-3), three/globe.gl (MIT) | 2 | med | Tile loads at each zoom step: prefetch along the path. Globe→mercator handover happens automatically at higher zoom; test the framing |
| 2 | Long pans and zooms (the "flyTo look") | Compute the van Wijk & Nuij path ourselves with `d3.interpolateZoom` (rho = √2 default) [V] ([d3-interpolate](https://github.com/d3/d3-interpolate#interpolateZoom)). MapLibre's flyTo uses the same algorithm, curve 1.42 [V] (camera.ts). Map u/w to center/zoom in Web-Mercator space | d3-interpolate (ISC), bezier-easing (MIT) | 2 | low | Never call flyTo/easeTo at render time. Easing must be a pure function |
| 3 | Cinematic 3D camera (orbit, dolly, follow an arrow head) | Centripetal Catmull-Rom splines over keyframes {lng, lat, alt, bearing, pitch, roll}. Use `calculateCameraOptionsFromCameraLngLatAltRotation` / `calculateCameraOptionsFromTo` [V] (exist in v6). Arc-length reparametrize + ease. Add a "look-at" target spline | maplibre-gl, custom math | 3 | low | Clamp camera altitude above terrain (`queryTerrainElevation`), which depends on DEM tiles being loaded |
| 4 | Terrain, hillshade, hypsometric tint, exaggeration | `raster-dem` from self-hosted DEM, `setTerrain({exaggeration})`, `hillshade-method` and highlight/shadow colors, `color-relief` [V] (style-spec 26.4.4) | MapLibre; DEM: Mapterhorn (CC BY 4.0, Copernicus 30 m) [V-s] ([data access](https://mapterhorn.com/data-access/)) | 2 | med–high at high pitch | DEM tile loading; terrain level of detail changes with camera, which is fine because it is camera-pure |
| 5 | Route drawing (single route, glowing head) | Static GeoJSON with `lineMetrics: true`. Animate `line-gradient` with `['step', ['line-progress'], color, p, 'transparent']` via `setPaintProperty`, so geometry is never re-uploaded. Head = overlay icon at `turf.along(line, p·L)`. Glow = 2–3 stacked lines with `line-blur`. Great-circle paths via `turf.greatCircle` | maplibre-gl; @turf/turf 7.4 (MIT) [V] | 2 | low | Avoid `lineSliceAlong` + `setData` per frame (async worker) unless you wait for idle. MapLibre has no `line-trim-offset` (absent from spec [V]) |
| 6 | Many moving routes (trade flows, migrations, fleets) | deck.gl `TripsLayer` with `currentTime = f(frame)` [V], `trailLength`, `fadeTrail` | @deck.gl/geo-layers (MIT) | 2 | low–med | currentTime must come from the frame; timestamps precomputed in the IR |
| 7 | **Thick curved military arrows that grow** | Custom polygon generator. Project waypoints to Mercator meters, fit a spline, sample, offset by width profile w(s) (tail→body→neck), add arrowhead (optionally swallowtail or a split front), truncate at arc length s(t) with the head riding the tip. Render as deck.gl `SolidPolygonLayer` + `PathLayer` outline (or SVG overlay for flat maps). Add an inner gradient and texture. mil-sym-ts (Apache-2.0 [V]) renders 2525/APP-6 multipoint graphics, but the look is doctrinal, not cinematic. There is no good off-the-shelf "cinematic arrow" library in JS [V-s]: build it (~500 LOC) | deck.gl (MIT), turf (MIT), optional mil-sym-ts (Apache-2.0) | 3 | low | Self-intersection at sharp turns (smooth the curvature). Width in screen vs geographic units must be consistent across zoom |
| 8 | Unit counters and NATO symbols moving | milsymbol 3.0.4 (MIT [V]) renders APP-6 B/D/E and 2525 C/D/E unit symbols to SVG/Canvas [V] ([repo](https://github.com/spatialillusions/milsymbol)). Convert to an IconLayer atlas or SVG overlay; position = along(path, p(frame)) | milsymbol (MIT) | 2 | low | Pre-rasterize the atlas before frame 0 |
| 9 | **Borders changing between eras** | (a) Default: cross-fade era A→B fills, with the border line drawing in. (b) Better: polygon diff (gained = B∖A, lost = A∖B) revealed with a directional or distance-field wipe from the shared border, plus a glowing "front" line. (c) Drive era by `global-state` `year` filters. (d) flubber only for stylized single shapes: it ignores all but the first outer ring and has no hole support [V] ([flubber README](https://github.com/veltman/flubber)) | turf / polyclip (MIT), maplibre global-state, flubber (MIT) | 3–4 | low–med | Precompute diffs offline per scene. Topology mismatch between datasets causes slivers: snap to a shared topology (mapshaper MPL-2.0 [V] / TopoJSON) |
| 10 | **Territory "spreading" fills (conquest)** | Precompute a distance-to-origin raster over the scene bbox (2–4k px), clipped to the target region. Optionally use cost-distance so the spread flows along valleys and around seas. Upload as a texture; a custom-layer fragment shader shows pixels where `d < t·dmax + noise` with a bright, slightly turbulent front. Jump-flooding (JFA) can compute it on the GPU ([JFA](https://en.wikipedia.org/wiki/Jump_flooding_algorithm)) | Custom GLSL in a MapLibre custom layer or deck.gl BitmapLayer subclass | 4 | med | Pure in t once the field is precomputed. Compute the field offline (worker/server), never progressively |
| 11 | Choropleth and data transitions | Data-driven `fill-color` using `['interpolate', ...]` over a value lerped by `global-state` t, or two layers cross-faded. Legend + number tickers in the overlay | MapLibre | 2 | low | Avoid feature-state churn per frame on huge layers |
| 12 | 3D bars, extrusions, spikes | `fill-extrusion` with height from global-state t; or deck.gl ColumnLayer | MapLibre / deck.gl | 2 | med | None special |
| 13 | **Labels and callouts** | Own overlay. Project anchors with `map.project`. Run a per-scene layout solver once (priority, fixed anchors, leader lines, safe areas for 9:16) and animate with springs and easing. Basemap labels minimal, with `text-allow-overlap` and fixed anchors | React/SVG; @remotion/layout-utils (MIT [V]) for text measurement | 3 | low | MapLibre placement is path-dependent with variable anchors (§3.1). Fonts must be loaded |
| 14 | Kinetic typography, titles, year counters | Own animation helpers: `interpolate`/`spring` from remotion, anime.js 4.5 (MIT [V]) or Motion 13 (MIT [V]) in seek mode. **Avoid GSAP**: its free licence prohibits use "in tools that allow users to build visual animations without code… that competes with Webflow's visual animation building capabilities" [V-s] ([GSAP standard license](https://gsap.com/community/standard-license/)). npm license field: "Standard 'no charge' license" [V] | remotion, animejs, motion | 2 | low | Seek by frame; no RAF timelines |
| 15 | Icons and flags | Iconify sets filtered by license: many are MIT/Apache, but **Game Icons is CC BY 3.0** (attribution required) [V-s] ([collections](https://github.com/iconify/icon-sets/blob/master/collections.md)). flag-icons / country-flag-icons (MIT [V]) | @iconify/json (MIT wrapper; per-set licenses vary) | 1 | low | Pre-rasterize |
| 16 | Lottie | `lottie-web` 5.13 (MIT [V]) `goToAndStop(frame, true)`, or `@remotion/lottie` (Remotion license). dotLottie-web 0.80 (MIT [V]; WASM engine). Assets: LottieFiles "Lottie Simple License" allows commercial use with no attribution, but prohibits scraping to build a competing service [V-s] ([license](https://lottiefiles.com/page/license)) | lottie-web | 1–2 | low | Map composition fps to video fps; preload JSON |
| 17 | Rain and snow over a region | Screen-space WebGL2 overlay with stateless particles (`pos = hash(i) + vel·t mod H`) and depth layers. Region mask: project the region polygon each frame with `map.project` → low-res Path2D mask → blur → `destination-in`. In geo space, deck.gl ScatterplotLayer + MaskExtension works on mercator only (not on GlobeView [V]) | Custom GLSL; pixi.js 8.21 (MIT [V]) as an alternative | 2–3 | med | Stateless particles only. Seed per element |
| 18 | Fire, smoke, explosions | Flipbook sprite sheets (commissioned or procedurally baked fbm) or Lottie. Explosion = flash overlay + seeded camera shake (noise on center/bearing for N frames) + debris particles + SFX cue | Custom; three.js | 3 | med | Shake must be noise(seed, t), not random per frame |
| 19 | Storm clouds and lightning | Clouds: scrolling fbm-noise shader or NASA cloud texture on globe. Lightning: seeded midpoint-displacement bolt with branches, timed flash curve, glow | Custom GLSL / Canvas | 3 | med | Seeded bolt geometry per strike id |
| 20 | Fog and fog of war | Inverse mask (world minus known territory) filled with an animated fbm "cloud" shader with a feathered SDF edge. Reveal by animating the SDF threshold. Atmospheric fog via MapLibre sky `fog`/atmosphere-blend [V] | Custom layer | 3 | med | Same as #10 |
| 21 | Water and ocean | Custom layer under land: animated normal-mapped water with time uniform, shoreline foam from distance-to-coast texture; on globe, specular from sun direction | Custom GLSL; Natural Earth coastlines (public domain [V-s]) | 3–4 | med | Pure in t |
| 22 | Day/night terminator | Subsolar point from date (simple astronomical formula). Night hemisphere = densified geodesic circle (radius ≈ 90°) around the antisolar point as a fill with a soft edge, or a shader on globe/three.js. Night lights from NASA Black Marble (public domain) | Custom | 2 | low | Use story time, not wall time |
| 23 | Glow and bloom | Cheap: stacked blurred lines and halos. Full: render the map canvas to a texture → threshold → separable blur → add (WebGL pass), or `postprocessing` UnrealBloom in three.js scenes | postprocessing (Zlib [V]) | 2–3 | med–high on CPU | Extra full-screen passes are costly on SwANGLE |
| 24 | Paper, parchment, grain, vignette, color grade | Pre-made textures (multiply/overlay blend), grain tiles offset by seeded random per frame, 3D-LUT shader per preset | CSS/WebGL | 1 | low | Grain offset seeded by frame |
| 25 | Motion blur | Default: none, or an analytic screen-space blur from camera velocity on whip pans (velocity field is known from consecutive camera states). Remotion `<CameraMotionBlur>` averages N samples (default 10, shutterAngle 180°) and is "destructive to colors" [V] ([doc](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/motion-blur/camera-motion-blur.mdx)). Use it only for DOM/SVG overlays on short segments, **never wrapping the WebGL map** (it would render N maps) | @remotion/motion-blur (MIT [V]) | 3 | high if sampled | Sampled blur multiplies render time by N |
| 26 | 2.5D photo parallax | Precompute depth once per image. Apache-licensed weights only: **Depth Anything V2 Small** (V2 Base/Large/Giant are CC-BY-NC-4.0) [V] ([README](https://github.com/DepthAnything/Depth-Anything-V2)); **DA3MONO-LARGE / DA3-SMALL / DA3-BASE are Apache-2.0** (DA3-LARGE/GIANT are CC BY-NC 4.0) [V] ([README](https://github.com/ByteDance-Seed/Depth-Anything-3)). Displaced mesh in three.js with small camera dolly; fill disocclusions with LaMa (Apache-2.0 [V]) | three.js, ONNX Runtime | 3 | med | Depth is precomputed, so it is pure at render time |
| 27 | Portrait cutouts | BiRefNet (MIT [V], [LICENSE](https://github.com/ZhengPeng7/BiRefNet)), then stroke, drop shadow and duotone per preset. **Avoid RMBG-2.0** (CC BY-NC 4.0; commercial use needs a BRIA agreement [V-s]) | BiRefNet | 2 | low (precomputed) | Precompute |
| 28 | Charts on maps | SVG mini-bars/pies anchored by `map.project`, or deck.gl ColumnLayer. Observable Plot (ISC [V]) for overlay charts | — | 2 | low | Number formatting locale fixed |
| 29 | Scene transitions | Zoom-through (camera continues into the next scene's map), wipes along borders, map-to-photo match cuts, `@remotion/transitions` | Remotion | 2 | low–med | Overlapping scenes need both maps alive: avoid two map instances by sharing one map and switching style state |
| 30 | Projection morphs (globe → flat Robinson) | d3-geo `geoProjectionMutator` interpolation (flat styles); MapLibre only between globe and mercator | d3-geo (ISC) | 3 | low (2D) | None |

---

## 6. Data the renderer needs (licensing only)

| Need | Commercial-safe source | Status |
|---|---|---|
| Vector basemap | **Protomaps basemaps**: code BSD-3, map design CC0, data ODbL "© OpenStreetMap" visible attribution required [V] ([repo](https://github.com/protomaps/basemaps)). Serve as PMTiles (pmtiles 4.5, BSD-3 [V]) from local disk in the render worker | Recommended |
| Generalized world vectors and painterly relief | **Natural Earth**: "All versions … are in the public domain", commercial use allowed, no credit needed [V-s] ([terms](https://www.naturalearthdata.com/about/terms-of-use/)) | Recommended |
| Satellite-like imagery | NASA Blue Marble NG / Black Marble: public domain, credit NASA [V-s] ([NASA](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/)). EOX Sentinel-2 cloudless: **2018–2024 editions are CC BY-NC-SA**, only 2016 is CC BY 4.0, commercial via EOX [V-s] ([EOX](https://eox.at/2024/08/sentinel-2-cloudless-2023/)) | NASA free; EOX needs a purchase |
| Terrain DEM | Mapterhorn: CC BY 4.0, code BSD-3 [V-s] | Recommended |
| Historical borders | **historical-basemaps is GPL-3.0** [V] ([LICENSE](https://github.com/aourednik/historical-basemaps)) and self-described as "work in progress". **CShapes 2.0 is CC BY-NC-SA 4.0** [V-s] | **Gap**: no clean commercial dataset. Plan to curate your own or license one |
| Map tiles via SaaS | MapTiler: Flex $25/mo, Unlimited $295/mo; "export for videos & games" needs contact [V-s] ([pricing](https://www.maptiler.com/cloud/pricing/)) | Not needed if self-hosting |

---

## 7. A scene DSL that an LLM can write and a renderer can execute

### 7.1 Prior art and what to borrow

| Prior art | What it does | What to borrow |
|---|---|---|
| Creatomate RenderScript ([docs](https://creatomate.com/docs/api/render-script/json-structure)) | Elements on tracks with `time`/`duration`, keyframes and enter/exit animations [V-s] | Element / track / keyframe model |
| Shotstack Edit API ([docs](https://shotstack.io/docs/guide/getting-started/core-concepts/)) | timeline → tracks → clips {asset, start, length, transition, effect} [V-s] | Clip and transition model |
| Mapbox storytelling template (BSD-3) | Chapters with `location {center, zoom, pitch, bearing}`, `mapAnimation`, `onChapterEnter/Exit` layer opacity [V] ([repo](https://github.com/mapbox/storytelling)) | Camera-per-beat and layer-state model |
| kepler.gl / hubble.gl (MIT) | Layer configs plus keyframed deck.gl/camera animation | Keyframing of deck.gl and camera state |
| Motion Canvas **time events** | Named `waitUntil` events that are dragged to align with voice-over; moving one shifts later events [V-s] ([docs](https://motioncanvas.io/docs/time-events/)) | Exactly the anchor model we need |
| Remotion | Typed props (zod) per composition | Schema-validated props |

### 7.2 Design: two levels [E]

1. **Storyboard DSL (written by the LLM, semantic).**
   - No coordinates, hex colors or seconds unless the user overrides.
   - References resolve through a gazetteer: `place:`, `polity:Name@year`, `river:`, `battle:`.
   - Times are anchored to narration words, for example `word:crossed`, `word:600,000#2`, `+0.3s`, `after:arrow1`.
   - Visual values are style tokens: `faction.blue`, `emphasis.high`.
   - The schema is enforced with JSON-schema structured outputs (supported by the Claude API per project context).
2. **Compiler.** Steps:
   1. Generate TTS and word-alignment timestamps.
   2. Resolve anchors to frames.
   3. Resolve entities to geometry (with era).
   4. Auto-frame the camera: fit the bounds of referenced entities with aspect-specific safe-area padding, so 9:16 and 16:9 get different framing.
   5. Plan the camera path (van Wijk or spline).
   6. Lay out labels per scene.
   7. Resolve style tokens from the preset.
   8. Validate density: no more than N simultaneous elements, at least 1.2 s dwell per label, no off-screen anchors.
3. **Render IR (renderer input, explicit and pure).** Every property is a constant or a keyframe track in frames.
4. **QA loop.** Render one low-res still per scene and have a vision model critique overlaps, wrong places and empty frames before the full render. This is cheap compared with re-renders.

### 7.3 Storyboard sketch (abridged)

```jsonc
{
  "version": "storyboard/1",
  "format": {"aspect": "9:16", "fps": 30, "quality": "1080p"},
  "style": "parchment-war",                      // preset: basemap, palette, fonts, FX defaults, SFX kit
  "voice": {"preset": "narrator-deep"}, "music": {"mood": "tense"},
  "scenes": [{
    "id": "s3",
    "narration": "In June 1812, Napoleon crossed the Niemen with over 600,000 men.",
    "map": {"engine": "auto", "projection": "mercator", "era": 1812,
            "terrain": {"exaggeration": 1.4}, "basemap": "relief-muted"},
    "camera": [
      {"at": "start", "frame": {"fit": ["place:Niemen River", "place:Moscow"]}, "pitch": 25},
      {"at": "word:crossed", "frame": {"focus": "place:Kaunas", "scale": "region"},
       "move": "fly", "ease": "inOutCubic"}
    ],
    "elements": [
      {"id": "fr", "type": "territory", "of": "polity:French Empire@1812", "token": "faction.blue",
       "enter": {"at": "start", "anim": "fade"}},
      {"id": "a1", "type": "arrow", "kind": "military", "faction": "blue",
       "path": ["place:Kaunas", "place:Vilnius", "place:Smolensk"], "size": "army",
       "enter": {"at": "word:crossed", "anim": "grow", "until": "word:men"}},
      {"type": "unit", "symbol": {"app6": "infantry", "echelon": "army"}, "label": "Grande Armée",
       "follow": "a1"},
      {"type": "counter", "format": "{n} men", "from": 0, "to": 600000, "enter": {"at": "word:600,000"}},
      {"type": "fx", "fx": "rain", "region": "polity:Russian Empire@1812", "intensity": 0.5},
      {"type": "callout", "anchor": "place:Niemen River", "title": "The crossing",
       "media": {"query": "Napoleon crossing Niemen painting", "treatment": "parallax"}}
    ],
    "sfx": [{"at": "word:crossed", "cue": "drum-hit"}],
    "transition_out": {"type": "zoom-through"}
  }]
}
```

### 7.4 Render IR sketch (TypeScript)

```ts
type Track<T> = T | { keys: { f: number; v: T; ease?: EaseId }[] };
interface RenderIR {
  fps: number; width: number; height: number; frames: number; seed: number;
  preset: PresetRef;                          // resolved style JSON, fonts, LUT, textures
  engine: 'maplibre' | 'd3' | 'three-globe';
  camera: { keys: { f: number; center: [number, number]; zoom: number; bearing: number;
                    pitch: number; roll?: number }[];
            interp: ('vanwijk' | 'catmullrom' | 'hold')[] };
  mapState: { year?: Track<number>; layerOpacity: Record<string, Track<number>> };
  layers: Array<{ id: string; kind: LayerKind; z: number; in: number; out: number;
                  geom?: GeoJSONRef | AssetRef; props: Record<string, Track<any>> }>;
  audio: { voice: AssetRef; music: AssetRef; duck: Track<number>;
           sfx: { f: number; asset: AssetRef; gain: number }[] };
  captions: { words: { text: string; f0: number; f1: number }[]; style: CaptionStyleId };
}
// LayerKind: territory | border | choropleth | extrusion | route | trips | arrow | unit | marker
//  | label | callout | counter | title | caption | icon | flag | lottie | image | parallax | video
//  | fx.rain | fx.snow | fx.fog | fx.fogOfWar | fx.fire | fx.smoke | fx.explosion | fx.lightning
//  | fx.clouds | fx.water | fx.terminator | fx.spread | post.grain | post.vignette | post.lut | post.bloom
```

Why this split works [E]:
- The LLM never invents coordinates, frame numbers or colors.
- Per-scene regeneration means re-compiling one scene.
- An editor UI can edit the storyboard (anchors, tokens) without touching the IR.
- The IR is the stable contract that lets you swap frame hosts.

---

## 8. Cost notes for the render stage

- **[V] Remotion licence:** $0.01 per render (stills count) with a $100/mo minimum once over 3 employees. Lambda reference costs are for *non-WebGL* compositions: 1-min video $0.017 warm, 10-min HD $0.103, 10-s 4K $0.013 (2048 MB arm64, us-east-1) [V] ([cost-example](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/lambda/cost-example.mdx)). Lambda arm64 compute is $0.0000133334 per GB-s [V-s].
- **[E] WebGL map compositions are far heavier than those examples.**
  - On a GPU (T4/L4), a 1080p MapLibre + deck.gl + overlay frame should take roughly 15–60 ms including screenshot capture. That is about 1–3 min of GPU for a 60 s short, or about $0.01–0.03 on-demand at g4dn rates (less on spot).
  - On CPU SwANGLE it may be 150–800 ms per frame. That is 4–25 core-minutes per short: still cents, but slow, and it hurts turnaround.
  - The parallel hands-on spike should replace these guesses.
- **[E] Precompute steps:** depth maps, cutouts, distance fields and border diffs are seconds of CPU per scene and can be cached across users (for example "France 1812" diffs, popular portraits).
- **[E] Biggest render-cost levers:** local PMTiles (no network waits); pre-baked raster basemaps per preset (fewer vector layers); avoiding sampled motion blur and supersampling; 30 fps rather than 60; reusing cached scene renders across regenerations.

---

## 9. Open engineering risks

See the `risks` field. In short:
- CPU WebGL speed.
- MapLibre async edge cases at scale.
- The licence landmines found: GSAP, Google 3D Tiles, Cesium ion Community, NC model weights, NC/GPL border data, CC BY icon sets.
- The historical-border data gap.
- The art-direction effort needed to reach "astonishing".

Note: the primary pages for GSAP, Mapbox Product Terms, Google Tiles policies, Cesium and MapTiler pricing were not directly fetchable from my sandbox. Those are marked [V-s] and are listed in checkable_claims for independent verification.

## KEY RECOMMENDATIONS
- Use MapLibre GL JS v6 (BSD-3) as the primary geo engine, not Mapbox GL JS: Mapbox v2+ is proprietary, account-bound and billed per map load.
- Run deck.gl 9.4 interleaved in MapLibre's WebGL context for geometry that changes every frame (arrows, trips, units, geo particles): its GPU updates are synchronous, while GeoJSONSource.setData is async in a worker.
- Enforce a strict frame contract: interactive:false, fadeDuration:0, raster-fade-duration:0, style transition 0, maplibregl.setNow(frameMs), jumpTo, then redraw() and await idle when tiles are missing, preserveDrawingBuffer:true, fixed pixelRatio. This removes wall-clock dependence.
- Render story labels, callouts and typography in your own overlay with a per-scene precomputed layout, not MapLibre symbol layers: variable-anchor placement depends on the previous frame's placement, which breaks chunked rendering.
- Compute all camera motion yourself (d3.interpolateZoom for van Wijk-Nuij long moves, Catmull-Rom splines for cinematic shots) and never call flyTo/easeTo at render time, so every frame is a pure function of time.
- Use Remotion 4 as the frame host for v1, because $0.01/render is negligible and it brings Lambda/Cloud Run, chunking, audio, captions and a free in-editor Player preview. Keep the Render IR host-agnostic, with HyperFrames (Apache-2.0) as plan B.
- Adopt a two-level DSL: the LLM writes a semantic storyboard (place/polity@year references, narration-word anchors, style tokens) and a compiler resolves geometry, frames, camera and layout into a Render IR. LLMs are unreliable at emitting coordinates and timecodes.
- Make every FX module stateless, a function of (seed, t), and ban Math.random, Date.now and RAF state with a lint rule, so chunks rendered in parallel stitch seamlessly.
- Do not use GSAP: its free licence prohibits use in no-code visual animation tools that compete with Webflow. Use Remotion interpolate/spring, anime.js or Motion (MIT) instead.
- Self-host all map data (Protomaps PMTiles with ODbL attribution, Natural Earth, NASA imagery, Mapterhorn DEM) on local disk in render workers. Avoid Google Photorealistic 3D Tiles (policy covers promotional videos only), Cesium ion Community (non-commercial) and EOX 2018+ imagery (non-commercial).
- Animate conquest fills with precomputed distance fields and a threshold shader, and border changes with polygon-diff reveals plus cross-fades. These are deterministic, look premium, and avoid flubber's single-ring limits.
- Use Apache/MIT AI models only for photo treatments: Depth Anything V2-Small or DA3MONO-LARGE for parallax, BiRefNet for cutouts, LaMa for inpainting. Avoid DAv2-Base/Large, DA3-Large/Giant and RMBG-2.0, which are non-commercial.
- Plan production rendering on GPU instances (angle-egl or vulkan, about $0.53-0.81/h on-demand) and keep CPU SwANGLE for dev and burst. Chunk long videos into 300-900 frame segments and add golden-frame tests at chunk boundaries.
- Skip sampled motion blur over WebGL maps: Remotion CameraMotionBlur renders N copies. Use an analytic camera-velocity blur on whip pans only.
- Build styles as data presets (basemap style JSON or pre-baked raster relief PMTiles, palette, fonts, textures, LUT, FX defaults, SFX kit), so adding styles is content work rather than engine work.

## COST ITEMS
- Remotion for Automators (company licence, >3 employees): $0.01 / per render (video, still, GIF, audio or PDF); $100/month minimum (Verified from strings in @remotion/promo-pages@4.0.532 on npm: '$0.01 per render, $100/mo minimum'. Free for companies with 3 or fewer employees, including automation (license FAQ). Player/Studio previews do not count.) https://www.remotion.dev/docs/license/pricing
- Remotion for Creators: $25 / per seat per month (Verified in @remotion/promo-pages bundle. Only needed for staff who make videos in Studio.) https://www.remotion.dev/docs/license/pricing
- Remotion Enterprise: from $500 / per month ('Starting at $500 per month' (promo-pages bundle).) https://www.remotion.dev/docs/license/pricing
- Remotion Lambda reference render cost (non-WebGL compositions): $0.017 (1-min video), $0.103 (10-min HD), $0.013 (10-s 4K) / per render, warm Lambda, 2048MB arm64, us-east-1 (WebGL map compositions will cost several times more (estimate); excludes S3 and transfer.) https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/lambda/cost-example.mdx
- AWS Lambda compute (arm64): $0.0000133334 / per GB-second (first tier, us-east-1) (Confirmed via search snippets of pricing guides; x86 is $0.0000166667.) https://aws.amazon.com/lambda/pricing/
- EC2 g4dn.xlarge (NVIDIA T4) GPU render node: $0.526 / per hour on-demand, us-east-1 (~$375-384/month) (Remotion's cloud-GPU guide uses this instance (~$375/month). Spot is cheaper.) https://calculator.holori.com/aws/ec2/g4dn.xlarge
- EC2 g6.xlarge (NVIDIA L4) GPU render node: $0.8048 / per hour on-demand, us-east-1 (Third-party price tracker.) https://calculator.holori.com/aws/ec2/g6.xlarge
- Estimated GPU render cost, 60-s 1080p30 map short: $0.01-0.03 (estimate) / per video (ESTIMATE: assumes 15-60 ms/frame on T4/L4 at g4dn on-demand rates. Replace with the hands-on spike's measurements.) https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/miscellaneous/cloud-gpu.mdx
- Cesium ion Commercial (only if Cesium-hosted data is used): $149 individual / ~$524 team / per month (From search snippets; Community plan is non-commercial. Not needed if CesiumJS (Apache-2.0) runs on self-hosted data.) https://cesium.com/platform/cesium-ion/pricing/
- Mapbox GL JS web map loads (if Mapbox were used): $5.00 per 1,000 (50k-100k), $4.00 (100k-200k), $3.00 (200k-1M); first 50k/month free / per 1,000 map loads (Third-party summaries via search. Not recommended.) https://www.mapbox.com/pricing
- MapTiler Cloud (optional hosted tiles): Flex $25; Unlimited $295 / per month (Search snippets; free plan is non-commercial; video export use requires contacting MapTiler. Not needed if self-hosting Protomaps PMTiles.) https://www.maptiler.com/cloud/pricing/
- GSAP (all plugins): $0 / licence (Free but carries a Webflow-competition restriction; recommended to avoid.) https://gsap.com/community/standard-license/
- Open map data (Protomaps basemap, Natural Earth, NASA Blue/Black Marble, Mapterhorn DEM): $0 licence / plus self-hosting storage/egress (OSM ODbL and Mapterhorn CC BY 4.0 require attribution; Natural Earth is public domain.) https://github.com/protomaps/basemaps
- EOX Sentinel-2 cloudless 2018-2024 imagery (commercial use): commercial licence required (price not found) / licence (2018-2024 editions are CC BY-NC-SA; only the 2016 edition is CC BY 4.0.) https://eox.at/2024/08/sentinel-2-cloudless-2023/

## RISKS
- CPU-only WebGL (SwANGLE/SwiftShader) may be 5-20x slower than GPU for terrain and globe shots (estimate). Production may need a GPU fleet, which brings capacity, spot-interruption and driver-maintenance burden.
- Chrome is phasing out software WebGL. Since Chrome 137 it needs --enable-unsafe-swiftshader; a further removal would break the CPU render path, so pin Chromium versions.
- MapLibre has async internals: tile loads, worker-based GeoJSON setData, global-state re-layout and path-dependent label placement. At scale these can cause popping, flicker, chunk-seam mismatches or 30 s delayRender timeouts.
- Long renders with ANGLE leak memory, according to Remotion's docs. Without chunking and process recycling, renders fail late and waste compute.
- Licence landmines in this area: GSAP's Webflow-competition clause; Google Photorealistic 3D Tiles (promotional-video scope only); Cesium ion Community (non-commercial); non-commercial AI weights (DAv2-Large, DA3-Large/Giant, RMBG-2.0); EOX 2018+ imagery; GPL or NC historical border datasets; CC BY icon sets (for example Game Icons) that require attribution.
- There is no clean commercial historical-borders dataset. Accuracy errors in war/history videos create reputational risk and user complaints. Building your own needs sustained human or AI curation.
- Attribution duties (OSM ODbL '© OpenStreetMap', CC BY DEM and icons, NASA credit) must reach the final video or its description. That is an operational and UX problem, because users may strip credits.
- deck.gl GlobeView is experimental and MaskExtension does not support it. Some region-masked effects need custom shaders on globe scenes.
- Overlays on globe or 3D terrain can float over mountains or show through the far side of the planet unless they are terrain-aware or occlusion-culled.
- An LLM-planned scene can be valid JSON yet visually incoherent: wrong places, overlaps, empty frames, pacing mismatches. This needs a compiler with validators and vision-QA stills, which adds cost and latency.
- Reaching 'astonishing' quality depends mostly on art direction (presets, textures, motion design, SFX), not code. Underinvesting there yields the generic look the founder wants to avoid.
- Remotion licence terms or pricing could change, and the company tier triggers once headcount exceeds 3. Keeping the IR host-agnostic mitigates this; HyperFrames (Apache-2.0) is the fallback.
- maxCanvasSize defaults to 4096x4096 and 4K costs 4x the pixels. Premium 4K or supersampled output multiplies render cost and memory.

## QUESTIONS FOR FOUNDER
- What render infrastructure budget can you commit: a GPU render pool (for example 1-3 g4dn/g6 instances at about $380-590/month each on-demand, less on spot) versus slower CPU-only serverless rendering? What turnaround should users expect (under 5 minutes vs under 30 minutes per video)?
- How many people will the company have in year 1? At 3 or fewer, Remotion is free; above that, budget $100/month minimum plus $0.01 per render.
- Which 3-5 reference channels or styles should we match first (for example Kings and Generals painted war maps, RealLifeLore 3D terrain, EmperorTigerstar flat border timelapses, Johnny Harris paper-collage, minimal Shorts globe)? This sets the first presets and engine priorities.
- What output targets: 1080p30 only at launch, or also 4K and/or 60 fps as paid tiers? Both raise render cost a lot.
- Are you willing to fund custom art assets (painted basemap textures, VFX sprite sheets, icon packs, SFX kit, LUTs) with clear commercial/SaaS licences? These drive perceived quality more than code.
- Should we build and curate our own historical-borders dataset, given that open ones are GPL or non-commercial? Or budget to license a commercial one? How much historical accuracy review do you want?
- How should we handle mandatory attributions (© OpenStreetMap, CC BY icons, DEM, NASA credit)? Options: a small on-screen credit, an auto-generated description text users must paste, or avoiding attribution-required assets entirely.
- Do you want realistic satellite imagery as a style? That needs a paid licence (for example EOX commercial, or another provider), since free modern mosaics are non-commercial.
- Will users edit scenes in a timeline/editor at launch, or only regenerate scenes? This decides how much of the storyboard DSL is exposed and whether the in-browser Remotion Player preview is needed in v1.
- What legal-risk stance on AI-generated or AI-processed imagery (portrait cutouts, parallax, generated paintings of historical figures) in videos that users monetize?
- Do you have, or will you create, AWS/GCP accounts and a preferred cloud region? This affects GPU availability, Lambda vs Cloud Run, and data-residency choices.