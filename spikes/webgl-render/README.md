# Spike: deterministic WebGL map rendering on CPU

**Question:** can a server with no GPU render frame-accurate map-animation video cheaply enough for a SaaS?
**Answer:** yes. At 1080p30, one map frame costs about **1.0–1.1 vCPU-seconds**, so a finished minute of video costs about **$0.011** at $0.02 per vCPU-hour, or **$0.028** at $0.05. Frames are byte-identical between runs.

Run on 2026-10-01 in a 4-vCPU / 15 GB cloud container with no GPU.

## The scene

A 6-second, 30 fps camera move from Western Europe to Iraq, built on Natural Earth GeoJSON with MapLibre GL JS 6.11.2:

- the camera pitches to 55° and rotates as it travels;
- a London to Baghdad route draws itself, with a moving head marker;
- Iraq's fill and outline fade in;
- country and city labels are shown.

Every property of the scene is a pure function of the frame time.

Evidence: `results/vertical_frame179.jpg`, `results/horizontal_frame090.jpg`, `results/seq1.log` (per-run timing summaries) and `results/par.log` (parallel runs).

## What made it fast

1. **Mesa llvmpipe instead of Chrome's SwiftShader.** Install `mesa-vulkan-drivers libegl-mesa0 libegl1`, set `EGL_PLATFORM=surfaceless`, and launch Chromium with `--use-gl=angle --use-angle=gl-egl`. This is about 3× cheaper than SwiftShader.
2. **One paint per output frame.** By default MapLibre repaints 2–3 times while waiting for `idle`. Suppressing `map.painter.render` until the map is idle, then calling `map.redraw()` once, is about 2.5× cheaper.
3. **Freezing time and disabling fades:**
   - `maplibregl.setNow(t)`
   - `fadeDuration: 0`
   - style `transition: {duration: 0}`
   - `preserveDrawingBuffer: true`
4. **Reading frames back with `canvas.toDataURL('image/jpeg', 0.92)`.** This is cheaper than CDP screenshots. Frames are piped into ffmpeg (`libx264 -preset veryfast -crf 20 -pix_fmt yuv420p`).
5. **Running 3–4 browser processes per 4-vCPU box.** Each process renders its own frame range. The chunks are then joined with `ffmpeg -c copy`.

## Key numbers (1080p, warm cache)

All rows except the last are on llvmpipe.

| Setup | ms/frame (1 process) | vCPU-s/frame |
|---|---|---|
| Recommended: antialiasing on, 1 paint, JPEG | 369 | ~1.05 (box saturated at 3–4 processes → 4 fps per 4 vCPU) |
| No antialiasing | 275 | 0.65 |
| Remotion 4.0.532, `gl: 'angle-egl'`, concurrency 1 | 482 | 1.40 |
| SwiftShader (Chrome default) with a naive pipeline | 2,438 | 9.0 |

The Remotion configuration is about 20–25% slower than the plain Playwright pipeline. Raising Remotion's concurrency does not help. Scale it by splitting frame ranges across separate processes or machines.

## Caveats

- **Scene complexity.** This is a zoom 4–5 Natural Earth scene. A detailed OSM basemap at zoom 8–14 or 3D terrain will cost more. Budget 1.5–3× until measured.
- **Labels pop in and out.** Zoom-based label filters change abruptly during camera moves. The production renderer should draw story labels in its own overlay with timeline-driven fades.
- **Mixed CPU models.** Byte-identical output across different CPU models (AVX2 variants) has not been tested. Render all chunks of one video on one instance type.

## Reproduce

```bash
sudo apt-get install -y mesa-vulkan-drivers libegl-mesa0 libegl1 ffmpeg
npm install            # maplibre-gl, playwright-core (uses an existing Chromium; set the path in render.js)
./fetch-assets.sh      # Natural Earth layers, Noto Sans glyphs, MapLibre dist
node server.js 8080 &  # static server for www/
EGL_PLATFORM=surfaceless node render.js w=1080 h=1920 flags=eglmesa read=jpeg q=skip=1 passes=2 out=out/vertical.mp4
```

`render.js` arguments are documented at the top of the file. `parallel.sh` runs N processes over split frame ranges and concatenates the chunks. `remotion/` holds the same scene inside Remotion: `bundle.mjs`, then `render.mjs`, with `browserExecutable` pointing at a local Chromium.

Data and asset licences:
- Natural Earth: public domain.
- Noto Sans glyphs: SIL OFL.
- MapLibre GL JS: BSD-3-Clause.
- `www/data/country_labels.geojson`: a small label-point file derived from Natural Earth.
