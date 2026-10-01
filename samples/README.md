# Sample videos (hand-directed previews)

These short videos preview the product's look before the real pipeline exists. Each scene was directed by hand in code, but they are rendered with the same approach the product will use:
- a MapLibre map;
- 2D overlays for arrows, labels, captions, particles and textures;
- a frame-by-frame deterministic render on CPU;
- audio timed to the narration's words.

| Scene | Format | Style | Topic |
|---|---|---|---|
| `hormuz` | 9:16, 1080×1920, ~34 s | Dark Geopolitics | Why the Strait of Hormuz matters |
| `hormuz_sat` | 9:16, 1080×1920, ~34 s | Orbital Satellite | Same script on a natural-colour satellite map |
| `napoleon1812` | 16:9, 1920×1080, ~64 s | Satellite War Map | Napoleon's invasion of Russia, 1812 |

**What is placeholder** (the product would replace these):
- **Narration:** Kokoro-82M (Apache-2.0), an open-source voice running on CPU.
- **Music:** `napoleon1812` has an original orchestral score written as MIDI in `tools/score.py` and rendered with FluidSynth + FluidR3_GM (MIT). The Hormuz samples use synthesized music from `tools/audio.py`.
- **Sound effects:** synthesized procedurally.
- **Scene design:** written directly in code. In the product, an AI director picks designer-made templates.

## Pipeline

1. `tools/tts.py` turns `scripts/<scene>.json` into `build/<scene>/narration.wav` and `timing.json`, which holds phrase and word times.
2. `www/scenes/<scene>.mjs` describes the scene as pure functions of time:
   - camera;
   - map paint state;
   - 2D overlay drawing;
   - sound-effect cues;
   - music spec.
3. `render.js` drives headless Chromium on Mesa llvmpipe frame by frame and pipes the frames into ffmpeg. `make.sh` runs several processes over frame ranges and concatenates the chunks.
4. `tools/audio.py` mixes narration + music bed + SFX, ducks the music under speech, and normalizes to −14 LUFS.

## Run

```bash
npm install && ./fetch-assets.sh                      # map data, terrain tiles, fonts, flags, MapLibre
pip install kokoro-onnx soundfile pillow numpy rasterio shapely mido              # voice model files: see KOKORO_DIR in tools/tts.py
export KOKORO_DIR=/path/to/kokoro-model-files        # kokoro-v1.0.onnx + voices-v1.0.bin
sudo apt-get install -y mesa-vulkan-drivers libegl-mesa0 libegl1 ffmpeg fluidsynth fluid-soundfont-gm
node server.js 8090 &
./make.sh hormuz 1080 1920 3
./make.sh hormuz_sat 1080 1920 3                      # satellite look (same scene, look=satellite)
SHARE_MAXRATE=3.3M ./make.sh napoleon1812 1920 1080 4
# preview stills: node render.js scene=hormuz w=1080 h=1920 stills=2.5,10,20 outdir=build/hormuz/stills
```

## Data and credits

- Natural Earth: public domain.
- Terrain from the Terrarium elevation tiles on AWS Open Data (Mapzen/Tilezen). Sources include SRTM, GMTED, ETOPO1 and EU-DEM: "Produced using Copernicus data and information funded by the European Union – EU-DEM layers".
- Satellite imagery: NASA Blue Marble (public domain) for the globe. The regional detail "contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium" (ESA WorldCover S2 RGBNIR composite, CC BY 4.0, AWS Open Data). Built by `tools/build_satellite.py` (Hormuz) and `tools/build_sat_tiles.py` (the 1812 tile pyramid, up to zoom 11 around Borodino and Moscow).
- 1812 blocs: built by `tools/build_1812.py` from Natural Earth modern borders, with corrections for Kaliningrad, Lithuania west of the Niemen, and Austrian Galicia (simplified; see the file header). The Berezina and Moskva are hand-traced.
- Icons: game-icons.net (CC BY 3.0, by Lorc, Delapouite and contributors) and Material Design Icons (Apache-2.0).
- Soundfont: FluidR3_GM (MIT).
- Fonts: Oswald, Montserrat, Inter, Cinzel and Cormorant Garamond (SIL OFL).
- Flags: flag-icons (MIT).
- MapLibre GL JS: BSD-3-Clause.

**Facts in the scripts:**
- *Hormuz:* the narrowest width is stated as "less than 40 km". Sources give 33 km (21 miles) or 39 km (21 nautical miles). The shipping lanes are about 2 miles each way, and about 20% of world oil consumption passes through (US EIA).
- *1812:* about 685,000 men in total ("more than six hundred thousand"). Crossing of the Niemen on 24 June. Borodino on 7 September, with roughly 70,000 killed or wounded. Moscow entered on 14 September and burning that night. The retreat ordered on 19 October. The Berezina crossing on 26–29 November. Survivor estimates run from about 31,000 to 120,000, so "fewer than one in five" holds even at the top of that range. The −26 °C reading is Minard's mid-November figure (−21 °R).
