# Sample videos (hand-directed previews)

These two short videos preview the product's look before the real pipeline exists. Each scene was directed by hand in code, but they are rendered with the same approach the product will use:
- a MapLibre map;
- 2D overlays for arrows, labels, captions, particles and textures;
- a frame-by-frame deterministic render on CPU;
- audio timed to the narration's words.

| Scene | Format | Style | Topic |
|---|---|---|---|
| `hormuz` | 9:16, 1080×1920, ~34 s | Dark Geopolitics | Why the Strait of Hormuz matters |
| `napoleon1812` | 16:9, 1920×1080, ~46 s | Campaign Parchment | Napoleon's march on Moscow, 1812 |

**What is placeholder** (the product would replace these):
- **Narration:** Kokoro-82M (Apache-2.0), an open-source voice running on CPU.
- **Music:** synthesized in `tools/audio.py`.
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
pip install kokoro-onnx soundfile pillow              # voice model files: see KOKORO_DIR in tools/tts.py
export KOKORO_DIR=/path/to/kokoro-model-files        # kokoro-v1.0.onnx + voices-v1.0.bin
sudo apt-get install -y mesa-vulkan-drivers libegl-mesa0 libegl1 ffmpeg
node server.js 8090 &
./make.sh hormuz 1080 1920 3
./make.sh napoleon1812 1920 1080 3
# preview stills: node render.js scene=hormuz w=1080 h=1920 stills=2.5,10,20 outdir=build/hormuz/stills
```

## Data and credits

- Natural Earth: public domain.
- Terrain from the Terrarium elevation tiles on AWS Open Data (Mapzen/Tilezen). Sources include SRTM, GMTED, ETOPO1 and EU-DEM: "Produced using Copernicus data and information funded by the European Union – EU-DEM layers".
- Fonts: Oswald, Montserrat, Inter, Cinzel and Cormorant Garamond (SIL OFL).
- Flags: flag-icons (MIT).
- MapLibre GL JS: BSD-3-Clause.

**Facts in the scripts:**
- *Hormuz:* the narrowest width is stated as "less than 40 km". Sources give 33 km (21 miles) or 39 km (21 nautical miles). The shipping lanes are about 2 miles each way, and about 20% of world oil consumption passes through (US EIA).
- *1812:* more than 600,000 men in total, the battle of Borodino on 7 September 1812, Moscow entered and burning from 14 September, and the retreat beginning in October. These are standard textbook figures.
