# Non-map visual assets: image and video generation, archival media and asset processing

*Research date: 2026-10-01. Scope: everything on screen in a map-animation video that is not the map itself, meaning portraits, scene illustrations, props and icons, B-roll, archival photos and paintings, and the motion applied to them.*

## 0. How much of this was verified

The network in this session was heavily restricted. WebSearch was already used up (200/200), and the egress proxy blocked most vendor domains: ai.google.dev, openai.com, bfl.ai, fal.ai, replicate, runware, together, deepinfra, recraft, ideogram, huggingface.co, wikimedia, pexels, pixabay, unsplash.com, loc.gov, nasa.gov and others. The sources I could reach were:

- **Google Cloud primary pages.** The Vertex AI generative pricing page, the Google Cloud Service Specific Terms, the Generative AI Indemnified Services list, and Cloud Run pricing.
- **GitHub primary files.** LICENSE files and READMEs of the model, tool and icon repositories.
- **Two secondary price databases that are maintained in code:**
  - **LiteLLM's `model_prices_and_context_window.json`** (v1.105.0, main branch). Each entry cites the vendor pricing page it was copied from, and it includes deprecation dates.
  - **ComfyUI's partner "API node" price badges** (`comfy_api_nodes/nodes_*.py`). Several of these include a visible **×1.43 Comfy markup**. Where I could see the markup, I divided it out and flagged the result.

Labels used below:
- **[V]** verified on a primary source in this session
- **[V2]** verified on a secondary source that cites the vendor (LiteLLM or ComfyUI code)
- **[U]** from prior knowledge, not re-verified this session; a fact-checker should confirm it
- **[E]** my estimate or opinion

---

## 1. Bottom line

1. **About 90% of on-screen motion should be free at the margin.** The approach is: a still image, then cutout and depth, then 2.5D parallax, Ken Burns moves, procedural weather and FX (rain, snow, smoke, fog of war as WebGL particles or shaders), then a uniform style grade, all inside the renderer. Paid AI video is a garnish for hooks and hero shots. It is not the backbone.
2. **Main image engine: Google on Vertex AI.** It has the best price/quality range, from $0.017 to $0.24 per image. It offers 50% batch pricing for pre-generation. Most importantly, Google contractually indemnifies GA Gemini, Imagen and Veo outputs [V]. No other vendor I could verify offers that.
3. **Cheapest path: a self-hosted Apache-2.0 model** (Z-Image-Turbo, FLUX.2 [klein] 4B, Qwen-Image-2512) on scale-to-zero GPUs. Estimated cost is about $0.001–0.003 per image [E]. It also lets you train style LoRAs that you own.
4. **Avoid the license traps.** Each of these is detailed in §9:
   - Depth Anything V2 Base/Large/Giant
   - RMBG-2.0, which is now rembg's default
   - FLUX.1/FLUX.2 [dev] and the [klein] 9B weights
   - Hunyuan models
   - LTX-2.x's competitor clause
   - CC BY-SA, NC and ND archival media
3. **Build a global asset cache plus pre-generated per-style libraries** (historical figures, props, icons, flags). This is the biggest lever on cost. The estimated one-time cost is about $1–3k, and after that a large share of assets cost nothing [E].
6. **Estimated visual-asset cost per video [E]:**

   | Tier | Short (60 s) | Long-form (10 min) |
   |---|---|---|
   | Budget | ≈ $0.05–0.15 | ≈ $0.40–1.00 |
   | Standard (with 1–6 AI video hero clips) | ≈ $1–1.5 | ≈ $6–10 |
   | Cinematic premium | — | $15–25 |

---

## 2. What the genre needs (non-map)

| Asset class | Examples | Best source |
|---|---|---|
| Historical figure portraits | Napoleon, Genghis Khan, Churchill | Public-domain paintings or photos first, then restyled by an AI edit model and cached |
| Scene illustrations | Siege of Constantinople, a WWI trench | AI generation (style preset) + parallax |
| Props and units | Soldiers by era, ships, tanks, cannons, castles | Pre-generated per-style library (cutout PNG or SVG) |
| Icons and pictograms | Swords, shields, crowns, factories, oil, wheat | Open icon sets (MIT/ISC/Apache) or Recraft custom-style vectors |
| Flags and coats of arms | Modern and historical flags | flag-icons (MIT) + Wikimedia PD flags |
| Real photos and footage | WWII, modern cities, leaders | Public-domain archives (US government, museums), stock (Pexels/Pixabay) |
| Environmental effects | Rain, snow, fire, smoke, dust, fog of war, explosions | **Procedural in the renderer** (free), with optional AI video overlays |
| Hero motion shots | Cavalry charge, fleet sailing, rocket launch | AI image-to-video (Veo 3.1 Lite/Fast, Kling, Hailuo), used sparingly |

---

## 3. Image generation models: prices, status and licenses

### 3.1 Google (Vertex AI, which Google now calls the "Gemini Enterprise Agent Platform")

Source: https://cloud.google.com/vertex-ai/generative-ai/pricing [V]

| Model | Per-image price | Batch/Flex (50% off image output) | Notes |
|---|---|---|---|
| **Gemini 3.1 Flash-Lite Image (Nano Banana 2 Lite)** | **$0.034** at 1K ($30/M output tokens, 1120 tokens) | $15/M, so **≈ $0.017** | Cheapest Google option, 1K only |
| **Gemini 3.1 Flash Image (Nano Banana 2)** | $0.045 (512), **$0.067 (1K)**, **$0.101 (2K)**, $0.15 (4K) at $60/M | $30/M, so ≈ $0.034 at 1K | Strong editing and multi-reference; main workhorse |
| **Gemini 3 Pro Image (Nano Banana Pro)** | **$0.134 (1K/2K)**, $0.24 (4K) at $120/M | $60/M, so ≈ $0.067 at 2K | Best text rendering and reasoning; use for hero images and text-heavy infographics |
| Gemini 2.5 Flash Image (Nano Banana 1) | $0.039 (1290 tokens at $30/M) | $15/M, so ≈ $0.0195 | **Being retired:** the Gemini API date is 2026-10-02 and the Vertex date is 2027-03-15 per LiteLLM [V2]. Do not build on it. |
| Imagen 4 Fast / Imagen 4 / Imagen 4 Ultra | **$0.02 / $0.04 / $0.06** | n/a | Good plain text-to-image; Imagen 4 upscaling to 2K–4K costs $0.06 |

The same page has a footnote about "promotional pricing… 50% credits back on net spend on select models". Ask your Google rep about it.

**IP indemnity [V].** Google's Service Specific Terms §20 extend Google's indemnity to "allegations that an unmodified Generated Output from a Generative AI Indemnified Service … infringes a third party's Intellectual Property Rights" (https://cloud.google.com/terms/service-terms). The indemnified list (last modified July 20, 2026) covers the Vertex/Agent Platform API "used with generally available versions of … Gemini, Imagen, Veo" when the use is not free of charge (https://cloud.google.com/terms/generative-ai-indemnified-services).
- Exclusions include: preview models; ignoring or disabling safety filters; continuing to use output after an infringement notice; trademark claims arising from use "in trade or commerce".
- The terms also say outright that Google "does not assert any ownership rights" in outputs. They also warn that output "may… produce the same or similar Generated Output for multiple customers", which matters for Content ID (see Risks).

### 3.2 OpenAI

All [V2] from LiteLLM, which cites developers.openai.com/api/docs/pricing; the per-size figures are from fal's pass-through pricing.

- **gpt-image-2** (snapshot 2026-04-21) and **gpt-image-2.5-flare / -sunburst** (2026-09-08). Image output costs $30/M tokens and image input $8/M. Per image this works out to:
  - **low ≈ $0.005–0.006**
  - **medium ≈ $0.04–0.053**
  - **high ≈ $0.16–0.21** (1024² to 1920×1080)
- **Retirements per LiteLLM:** gpt-image-1 on **2026-10-23**; gpt-image-1.5 and gpt-image-1-mini on 2026-12-01.
- **Takeaway:** gpt-image-2 "low" is the cheapest image from a major vendor, but low-quality outputs need testing for the "astonishing" bar. "Medium" ($0.04) competes with Imagen 4 Standard.
- I found no indemnity of OpenAI outputs that I could verify for API customers [U].

### 3.3 Black Forest Labs (FLUX)

API prices [V2] (LiteLLM black_forest_labs entries + ComfyUI nodes_bfl.py):

| Model | Price |
|---|---|
| FLUX1.1 [pro] | $0.04 |
| FLUX1.1 [pro] Ultra | $0.06 |
| FLUX.1 Kontext [pro] | $0.04 |
| FLUX.1 Kontext [max] | $0.08 |
| FLUX.1 Fill / Expand | $0.05 |
| **FLUX.2 [pro]** | **$0.03 for the first MP + $0.015 per extra MP** (+ $0.015 per reference) |
| FLUX.2 [max] | $0.07 + $0.03 per MP |
| FLUX.2 [flex] (Azure) | ≈ $0.05/MP |

Open-weight licenses [V] (https://github.com/black-forest-labs/flux and https://github.com/black-forest-labs/flux2):
- **FLUX.1 [schnell]: Apache-2.0**
- **FLUX.2 [klein] 4B and 4B Base: Apache-2.0.** These are distilled, run "sub-second", fit in about 8 GB VRAM, and support multi-reference editing.
- **FLUX.1 [dev] family, FLUX.2 [dev] (32B), and FLUX.2 [klein] 9B / 9B KV / 9B Base: Non-Commercial license.**
  - The license defines use "in direct interactions with or that has impact on end users" or "for revenue-generating activity" as **not** non-commercial. So hosting these in the SaaS needs a paid BFL license (https://bfl.ai/pricing/licensing; the price was not verifiable here). Historically it cost about $999/month for 100k images [U].
  - Outputs, by contrast, "may [be used] for any purpose (including for commercial purposes)".
  - The license also requires content filters and AI disclosure "to the extent required under applicable law" [V] (model_licenses/LICENSE-FLUX-NON-COMMERICAL).

### 3.4 Other API models

Prices are [V2] from ComfyUI badges, with the ×1.43 markup removed where it was visible, or from fal/LiteLLM.

- **Seedream (ByteDance):**

  | Version | Price per image |
  |---|---|
  | 4.0 | $0.03 |
  | 4.5 | $0.04 |
  | 5.0 Lite | $0.035 |
  | 5.0 Flash | ≈ $0.018 |
  | 5.0 Pro | $0.045 (≤ ~2.6 MP) or $0.09 (larger) |

  Seedream also has a **"layer separation"** endpoint at ≈ $0.032 per image, which is directly useful for parallax.
- **Ideogram 3:** turbo $0.03, default $0.06 (fal also lists $0.06), quality $0.09. The character-reference option costs more. Ideogram V4 is also listed.
- **Recraft:**
  - V3/V4 raster $0.04; **V3/V4 vector (SVG) $0.08**
  - V4.1 $0.035; V4.1 Flash ≈ $0.007
  - V4 Pro raster $0.25; V4 Pro vector $0.30
  - **Custom style from reference images ≈ $0.005**
  - Vectorize $0.01; remove background $0.01; crisp upscale $0.004

  Recraft is the best fit for a **consistent icon style per preset** (true SVG plus a saved custom style).
- **xAI Grok Imagine image:** $0.02 (quality/pro $0.05; image 2.0 $0.06) [V2].
- **Bria 3.2 (trained on licensed data):** $0.04 on fal [V2]. This is an option if a "commercially safe training data" story matters to enterprise buyers.
- **Midjourney:** I found no official public API in any source I could reach. Unofficial proxies violate Midjourney's ToS [U]. **Do not plan on it.**
- **Aggregators:** fal resells Google at a markup: Nano Banana 2 at $0.08 (1K) vs $0.067 direct, and Nano Banana Pro at $0.15 vs $0.134 [V2]. Runway's API resells Veo 3.1 Fast at $0.15/s vs $0.10–0.12 direct [V2]. Replicate, Runware, Together and DeepInfra price lists could not be fetched this session. **Recommendation [E]:** call Google directly (cheaper, plus indemnity and batch). Use one aggregator (fal or Replicate) as a router for non-Google models so you can switch quickly.

### 3.5 Open-weight image models for self-hosting (licenses [V] from GitHub)

| Model | License | Commercial SaaS use? | Notes |
|---|---|---|---|
| **Z-Image-Turbo (Tongyi/Alibaba, 6B)** | **Apache-2.0** | Yes | 8 steps; fits in 16 GB; #1 open-source model on Artificial Analysis (Dec 2025 per its README) |
| **FLUX.2 [klein] 4B / 4B Base** | **Apache-2.0** | Yes | Sub-second; multi-reference editing; the Base model can be fine-tuned with LoRA |
| **Qwen-Image / Qwen-Image-2512 / Qwen-Image-Edit-2511 / Qwen-Image-Layered** | **Apache-2.0** (repo LICENSE) | Yes | **Qwen-Image-Layered splits an image into RGBA layers, which is ideal for parallax.** Qwen-Image-2.0 (Feb 2026) appears to be API/Qwen Chat only. |
| HiDream-I1 | MIT | Yes, but it uses **Llama-3.1-8B-Instruct as a text encoder**, so Llama community license terms also apply | |
| FLUX.1 [schnell] | Apache-2.0 | Yes | Older quality |
| SD 3.5 | Stability Community License: free under $1M annual revenue, enterprise license above [U] | Yes until you hit the threshold | |
| FLUX.1/.2 [dev], klein 9B | Non-commercial | **No** without a BFL license | |
| HunyuanImage 3.0 / HunyuanVideo 1.5 | Tencent license, **"DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA"** | **No** for a global SaaS | |

**Self-hosting cost [V] for the inputs.** Cloud Run GPU pricing (https://cloud.google.com/run/pricing):
- NVIDIA L4: **$0.0001867/s**
- RTX PRO 6000: $0.00036522/s
- CPU: $0.000018 per vCPU-second; memory: $0.000002 per GiB-second

An L4 with 4 vCPU and 16 GiB therefore costs about **$1.05/hour all-in**, and scales to zero.

**[E] Per-image estimate.** Z-Image-Turbo or klein-4B at about 1 MP should take roughly 2–6 s on an L4, which is about **$0.0006–0.002 per image** before cold starts. That is about 10–30× cheaper than a $0.02–0.034 API image. It only pays off once utilization is reasonable (roughly 30–50k or more images per month); before that, cold-start latency (20–60 s model load) and engineering time dominate.

---

## 4. Video generation models (price per second)

| Model | 720p | 1080p | Audio | Status and notes | Source |
|---|---|---|---|---|---|
| **Veo 3.1 Lite** | **$0.03** | **$0.05** | $0.05 / $0.08 with audio | Cheapest from a top lab; indemnified once GA | [V] Vertex |
| **Veo 3.1 Fast** | $0.08 | $0.10 | $0.10 / $0.12 with audio; 4K $0.25 (video only) / $0.30 (with audio) | Best value for hero shots | [V] |
| Veo 3.1 | $0.20 (720p/1080p, video only) | — | $0.40 with audio; 4K $0.40 / $0.60 | LiteLLM lists a Vertex deprecation date of 2026-11-17 for veo-3.1-*-001, which suggests a successor is coming [V2] | [V] |
| Gemini Omni Flash (video) | ≈ $0.10 | ≈ $0.15 | Output includes audio; 360p ≈ $0.034; 4K ≈ $0.30 | Token-priced at $17.50/M output tokens | [V] derived |
| Kling v3 Omni | $0.084 | $0.112 | +33% with audio; 4K $0.42 | Comfy price, possibly about 1.4× over direct | [V2] |
| Kling 2.5 Turbo Pro | — | ≈ $0.07 | — | — | [V2] |
| MiniMax Hailuo H3 | 768p $0.06 | 2K $0.13 | — | 480p $0.05; Hailuo-02 1080p ≈ $0.08/s | [V2] fal/Comfy |
| Seedance 2.0 | $0.30 | $0.68 | — | 480p $0.135; Seedance 2.5 at 720p $0.47 | [V2] fal |
| Runway Gen-4 Turbo / Gen-4.5 / Aleph 2 | $0.05 / $0.12 / $0.28 | | | 1 credit = $0.01 | [V2] |
| Luma Ray 3.2 | $0.06 | $0.24 | — | — | [V2] |
| Wan (Alibaba API) | $0.10 | $0.15 | — | 480p $0.05 | [V2] |
| Grok Imagine Video 1 / 1.5 | $0.07 / $0.14 | — / $0.25 | — | — | [V2] |
| Vidu 3 Turbo | $0.06 | $0.08 | — | — | [V2] |
| **Sora 2 / Sora 2 Pro** | $0.10 / $0.30 | Pro high-res $0.50 | — | **LiteLLM marks the API deprecated as of 2026-09-24 (Azure: 2026-10-15). Do not build on it.** | [V2] |
| **Wan 2.2 (open weights)** | self-host | | | **Apache-2.0.** The TI2V-5B model does "5-second 720P … in under 9 minutes on a single consumer-grade GPU" | [V] GitHub |
| **LTX-2.x (open weights)** | self-host | | | Free for entities under **$10M annual revenue**, and SaaS hosting is allowed. But **§20 forbids use "in any product … that directly competes with Licensor's commercial products"** (Lightricks runs LTX Studio). You must also keep watermarks and provenance intact. | [V] GitHub LICENSE-2_x |

**Is self-hosting video worth it? [E] No, not early on.** A 5 s Wan 2.2 5B clip on a rented L4 or 4090 costs about $0.15–0.30, which is ≈ $0.03–0.06/s. That is no cheaper than Veo 3.1 Lite ($0.03–0.05/s), the quality is lower, and it ties up GPUs for minutes per clip.

### When paid AI video is worth it vs parallax

- **Parallax (free) wins for:** portraits, static scenes, landscapes, cities, battle tableaux, documents, and anything where a slow push-in plus layer separation plus FX overlays reads as "cinematic". This is how most top human-made channels animate stills today.
- **AI video wins for:**
  - the first 1–3 seconds of a short (the hook that drives retention)
  - real physical motion that parallax fakes badly: ships sailing, cavalry charging, explosions, crowds, a rocket launch, a river flooding
  - occasional "wow" transitions
- **Policy [E]:**
  - Generate video only **image-to-video from an already-approved, cached still**. That keeps the style consistent and avoids paying for a clip that is off-style.
  - Default to no-audio output, because narration, music and SFX are added separately (this halves Veo prices).
  - Cap spend per video by tier.
  - Cache clips globally by semantic key (for example "napoleonic cavalry charge, style X, 16:9").

---

## 5. Cheap motion: the 2.5D parallax and asset-processing stack (licenses [V])

| Step | Tool | License | Notes |
|---|---|---|---|
| Monocular depth | **Depth Anything 3: DA3MONO-LARGE (0.35B), DA3METRIC-LARGE, DA3-BASE, DA3-SMALL** | **Apache-2.0** | DA3-LARGE, GIANT and NESTED are **CC BY-NC 4.0**. https://github.com/ByteDance-Seed/Depth-Anything-3 |
| Depth (older) | Depth Anything V2 **Small only** | Apache-2.0 | **V2 Base/Large/Giant are CC-BY-NC-4.0**, so not for SaaS. https://github.com/DepthAnything/Depth-Anything-V2 |
| Depth alternative | MoGe | Code MIT (DINOv2 parts Apache) | Check the weights' license separately [U] |
| Layer decomposition | **Qwen-Image-Layered** (Apache-2.0), or Seedream layer-separation API (≈ $0.032) | | Produces RGBA layers directly, giving cleaner parallax than depth slicing |
| Background removal | **BiRefNet** (MIT). Through rembg (MIT), use `-m birefnet-general` or `birefnet-portrait` | | **rembg's default model is now `bria-rmbg` (RMBG-2.0), which "requires a paid agreement for commercial use."** Always set the model explicitly. |
| Segmentation | SAM 2 (Apache-2.0) | | SAM 3's license is royalty-free but bars use "related to military or warfare purposes". That clause is aimed at end use, but prefer SAM 2 to avoid arguing about it. |
| Inpainting disoccluded background | LaMa (Apache-2.0), IOPaint (Apache-2.0) | | Or an API edit model |
| Upscaling | Real-ESRGAN (BSD-3-Clause) | | Recraft crisp upscale at $0.004 is an API fallback |
| Vectorization | vtracer (MIT) | | Or Recraft vectorize at $0.01 |
| Embeddings for semantic asset search | SigLIP/big_vision (Apache-2.0), OpenCLIP (MIT-style) | | Self-host for near-zero cost |

**Pipeline [E]:**
1. Generate a still (or fetch an archival one) as a **2048² square master**. Either generate at 2K or generate at 1K and run Real-ESRGAN 2×. One square master crops cleanly to both 1920×1080 and 1080×1920, so a single asset serves every aspect ratio.
2. Run BiRefNet for a subject cutout.
3. Run DA3-Mono or Qwen-Image-Layered to get depth or layers.
4. Use LaMa to fill the background behind the subject.
5. In the renderer, displace a mesh or stack layers with a camera move, then add procedural particles (rain, snow, embers, smoke, dust), light sweeps, and a per-style grade (LUT, paper texture, halftone, grain, vignette).

Processing compute is roughly $0.0002–0.001 per asset on an L4, and seconds per asset on CPU [E]. In practice it is free.

**Applying the same grade and texture to every asset**, whether generated, archival or stock, is the cheapest way to make mixed sources look like one channel.

---

## 6. Archival and real media

| Source | License position | Use in generated videos | Status |
|---|---|---|---|
| **The Met Open Access** | CC0 for public-domain works ("unrestricted commercial and noncommercial use"; images of PD works carry the CC0 icon) | Yes, no attribution required (credit is courteous) | [V] github.com/metmuseum/openaccess |
| **National Gallery of Art (US)** | Data under CC0; open-access images are also on Wikimedia Commons | Yes | [V] github.com/NationalGalleryOfArt/opendata |
| Smithsonian Open Access | Millions of CC0 items; metadata on the AWS Open Data registry | Yes (CC0 items only) | [V] for the repo; [U] for the image counts |
| Rijksmuseum | Images of PD works in Rijksstudio are free to use (PD/CC0); an API key is required and the API was recently revamped | Yes | [U] |
| **Wikimedia Commons** | Mixed licenses. The MediaWiki API (`prop=imageinfo&iiprop=extmetadata`) returns LicenseShortName, AttributionRequired, Artist and UsageTerms, so you can filter automatically. | **Auto-use PD, PD-Art and CC0 only.** Allow CC BY with auto-generated credits. **Exclude BY-SA, NC and ND.** Many WWII sources are traps: Bundesarchiv photos are CC BY-SA 3.0 DE, and Imperial War Museum images use a non-commercial licence. | [U] |
| Library of Congress | Rights vary per item ("no known restrictions" vs restricted); there is a JSON API | Use only items flagged free to use | [U] |
| NARA and US military photos | US federal works are public domain | Yes. Avoid implying endorsement and agency insignia. | [U] |
| NASA images and video | Generally not copyrighted. **NASA logos and insignia are restricted.** Some third-party content on NASA sites is copyrighted. | Yes, with care | [U] |
| Europeana | Rights statement per item; filter `reusability=open` | Yes for PD/CC0 (handle BY/BY-SA as above) | [U] |
| **Pexels** | Free license with no attribution required. The API asks for a link to Pexels and photographer credit where possible. **Do not build a competing stock service, and do not register content in Content ID.** Restrictions apply to identifiable people. | Generally OK for modern B-roll embedded inside videos; get a legal sign-off | [U]: domain blocked |
| **Pixabay** | Free commercial use. The API **forbids permanent hotlinking** (download and cache yourself) and must show the source in search UIs. Standalone redistribution and building a substitute stock service are prohibited. | Generally OK; get a legal sign-off | [U] |
| **Unsplash** | The license allows commercial use. **API guidelines require hotlinking, photographer attribution and a download trigger** [V], and apps must not replicate Unsplash. | Hard to square hotlinking with server-side video rendering. **Not recommended** as an automated source. | [V] for the guidelines (github.com/unsplash/unsplash-js) |
| Getty / Shutterstock / Storyblocks APIs | Enterprise contracts; Getty and Shutterstock also sell indemnified AI generation | Possible premium-tier add-on | Prices not verifiable here [U] |

**CC BY-SA in videos [U]: get legal confirmation.** Under CC 4.0, a cropped, stylized or parallax-animated image is likely "Adapted Material", so ShareAlike could pull that part of the user's video under BY-SA. Exclude BY-SA by default. For CC BY, put an auto-generated credits block in the video description or an end card.

**Real events:** use **real archival photos for real events**, and AI imagery only for illustrative or stylized reconstructions. Never generate AI "photos" that pass as real historical photographs; that is a misinformation and platform-policy risk.

---

## 7. Icons, flags and prop libraries (licenses [V] from GitHub)

**Safe for commercial use, no attribution required:**
- Lucide (ISC)
- Phosphor (MIT)
- Tabler (MIT)
- Material Symbols (Apache-2.0; 15,717 icons per Iconify)
- **flag-icons (MIT)** for modern flags
- Noto Emoji (font under OFL; images Apache-2.0 [U])

**Attribution required:**
- **Game-icons.net (CC BY 3.0, 4,133 icons):** swords, shields, castles, cannons and crowns, which suits war videos very well. Credit it in a credits page and video descriptions.
- Twemoji graphics (CC BY 4.0).

**Avoid:**
- **OpenMoji (CC BY-SA 4.0):** share-alike.
- Pictogrammers MDI: custom license; review it before use.

**Iconify collections list:** https://github.com/iconify/icon-sets/blob/master/collections.md gives the license for every set and is a good machine-readable allowlist.

**Per-style consistency [E].** Recolor and restroke open SVG icons per preset programmatically (free). Use Recraft V4 vector with a saved custom style (≈ $0.08 + $0.005) only for the gaps, such as era-specific units ("Roman legionary", "Panzer IV", "trireme").

---

## 8. Style consistency

1. **Define each style preset as a bundle:**
   - a prompt block
   - 3–6 reference images
   - palette, line weight and texture parameters
   - a negative list (anachronisms)
   - **a render-time grade** (LUT, texture, grain), which is the free unifier
   - optionally, a self-hosted LoRA on an Apache-2.0 base (FLUX.2 klein 4B Base, Z-Image, Qwen-Image)
2. **Multi-reference generation** keeps outputs on-style. It is available on:
   - Nano Banana 2 and Pro
   - FLUX.2 pro/max (+$0.015–0.03 per reference [V2])
   - Seedream 4.x/5 (+$0.003 per extra reference [V2])
   - Ideogram character reference
   - Recraft custom styles
3. **Historical figures:**
   1. Take a PD painting or photo as the identity reference.
   2. Restyle it with an edit model (Nano Banana 2, FLUX Kontext/FLUX.2, or Qwen-Image-Edit-2511).
   3. Store the result as a canonical character sheet per figure per style.
   4. Reuse it as a reference for that figure in every later scene, for all users.
4. **Automated QA:** a vision LLM (Gemini Flash or Claude Haiku class) checks style match, anachronisms (wrong uniforms or weapons, modern objects), anatomy and text artifacts, and retries or falls back to another model. Budget about 20–30% extra generations for retries [E].

---

## 9. Content restrictions and compliance

- **Real people.** Google and OpenAI restrict photorealistic depictions of real people, especially living public figures, to varying and shifting degrees [U]; test this empirically.
  - Recommended policy [E]: stylized illustrations only, for **deceased historical figures**.
  - For **living politicians**, use PD or licensed photos (for example US government official portraits) with a clear "photo" or "illustration" distinction.
  - Never produce photoreal AI images of living people.
- **Deepfake and disclosure rules [U, legal check needed]:**
  - YouTube requires creators to disclose realistic altered or synthetic content. TikTok requires AI labels and reads C2PA.
  - The **EU AI Act Art. 50** transparency duties (machine-readable marking of synthetic content; deepfake disclosure) apply from **2 Aug 2026**, unless the "Digital Omnibus" amendments changed timing.
  - Model licenses also impose duties: **FLUX requires content filtering and AI disclosure where the law requires it** [V], and **LTX forbids stripping watermarks or provenance** [V].
  - Google outputs carry SynthID [U]. Compositing strips C2PA metadata, so **add your own C2PA manifest to the final MP4** [E].
- **Violence and war:** keep imagery stylized (arrows, smoke, silhouettes) and avoid gore. Vendor safety filters will block much of it anyway, and graphic content risks YouTube age-restriction and demonetization [U].
- **Hate symbols in WWII content:** YouTube allows them only with educational or documentary context. Germany's StGB §86a has an exception for history and education [U]. Make this a per-style or per-market setting.
- **YouTube "inauthentic or mass-produced content" monetization policy (July 2025) [U]:** a templated look shared across many channels is a monetization risk for your users. Asset variety, per-render variation and script originality help.
- **Copyright of AI output [U]:** in the US, purely AI-generated images are generally not copyrightable (Thaler v. Perlmutter, 2025; USCO Part 2 report). Your cached library is therefore not exclusive IP, and users cannot block each other with it, except through Content ID misuse (see Risks).

---

## 10. Cost-killers: the global cache and libraries

1. **Global asset cache with dedup across users.**
   - **Key:** a canonical descriptor `{entity (Wikidata QID), subject, era, style_preset@version, framing, aspect_class}` plus a SigLIP embedding stored in pgvector.
   - **Lookup order:** exact key, then near-duplicate by embedding (cosine above a threshold), then VLM verification, then reuse.
   - **Admission:** only QA-passed assets go in. Store the provenance and license of each asset (model, date, terms, attribution text).
   - Google's terms say outputs are Customer Data and that Google claims no ownership [V], so reuse across your own users is fine.
2. **Pre-generated libraries per style [E]:**

   | Library | Size | One-time cost (via Gemini batch at ≈ $0.017–0.034) |
   |---|---|---|
   | Top historical figures (Wikidata, ranked by sitelinks) | 2,000 × 6 styles | ≈ $200–400 |
   | Props and units | 500 × 6 | ≈ $50–100 |
   | Recraft vector icons for the gaps | 1,000 × 6 | ≈ $500 |
   | QA and retries | — | ≈ $1,000 |

   **Total: about $1–3k one-time.**
3. **Use the batch tier** (50% off) for anything not latency-critical: library builds, overnight long-form jobs.
4. **Generate at 1K and upscale with Real-ESRGAN** instead of paying for 2K/4K (for example, $0.034 + ~$0.001 vs $0.101–0.15).
5. **Use square masters** so one asset serves 16:9, 9:16, 1:1 and 4:5.
6. **Route by tier:** self-hosted or Lite models for budget plans; Nano Banana 2 or Pro only for hero images and text-heavy images.
7. **Use procedural FX instead of generated FX:** rain, snow, fire, smoke and fog of war as shaders or particles, never as paid video.

---

## 11. Per-video visual-asset cost model [E]

**Assumptions:** a 60-second short has about 12 non-map "beats"; a 10-minute long-form video has about 80. Maps are rendered procedurally (another workstream). Asset mix at maturity: 40% from cache or libraries, 25% archival PD, 35% newly generated.

| Tier | Short 60 s | Long 10 min | What's included |
|---|---|---|---|
| **Budget** | **≈ $0.05–0.15** | **≈ $0.40–1.00** | New images on NB2 Lite ($0.034), Imagen 4 Fast ($0.02) or self-hosted (≈ $0.002); parallax and procedural FX; no AI video |
| **Standard** | **≈ $1.0–1.5** | **≈ $6–10** | NB2 at 2K ($0.101) for most, NB Pro ($0.134) for hero images; 1–2 (short) or 6 (long) Veo 3.1 Lite or Fast 1080p no-audio clips of 6 s ($0.30–0.60 each); +30% retries |
| **Cinematic premium** | ≈ $2–4 | ≈ $15–25 | 10+ AI video clips (Veo 3.1 at $0.20/s or Kling v3 1080p), NB Pro throughout |

At launch, before the cache warms up, expect about 1.5–2× these figures.

---

## 12. Recommended visual-asset stack

**Budget / default:**
- Images: Gemini 3.1 Flash-Lite Image, or Imagen 4 Fast, on Vertex (batch where possible). Later, move bulk to self-hosted Z-Image-Turbo or FLUX.2 [klein] 4B on Cloud Run L4.
- Edits and consistency: Nano Banana 2.
- Icons: open sets (Lucide, Tabler, Phosphor, Material, flag-icons, Game-icons with credit), recolored per style.
- Processing: BiRefNet, DA3-Mono-Large, Qwen-Image-Layered, LaMa, Real-ESRGAN, vtracer.
- Archival: Met, NGA, Smithsonian, Wikimedia (PD/CC0/BY filter), US government sources; Pexels and Pixabay for modern B-roll.
- Motion: parallax and procedural FX only.

**Premium additions:**
- Images: Nano Banana Pro for hero images and text-heavy infographics; Recraft V4 vector for custom icon gaps; FLUX.2 pro or Seedream 5 Pro as a second opinion or fallback.
- Video: Veo 3.1 Lite or Fast (image-to-video, no audio) for hooks and hero shots; Kling v3 or Hailuo H3 as an alternative look or price.
- Media: optional Getty, Shutterstock or Storyblocks enterprise deal for real modern footage.

**Do not use:**
- Sora 2 API (deprecated)
- gpt-image-1 (retiring 2026-10-23)
- Gemini 2.5 Flash Image on the Gemini API
- Midjourney (no API)
- FLUX [dev] or klein 9B without a license
- Depth Anything V2 B/L/G
- RMBG-2.0
- Hunyuan
- LTX-2.x until legal clears §20

---

## 13. Licensing risk table

| Item | Risk | Why | Mitigation |
|---|---|---|---|
| Vertex Gemini, Imagen, Veo (GA, paid) | **Low** | IP indemnity for unmodified output [V] | Use GA model IDs only; keep safety filters on |
| OpenAI gpt-image-2 | Low–Med | Output usable commercially [U]; no indemnity verified | Use for non-sensitive assets |
| FLUX API (pro/max/Kontext) | Low–Med | Commercial output allowed; no indemnity verified | — |
| FLUX [dev] / klein 9B self-hosted | **High** | Non-commercial license; a SaaS counts as commercial [V] | Buy a BFL license, or use klein 4B (Apache) |
| Z-Image, Qwen-Image family, Wan 2.2, klein 4B, FLUX schnell, DA3 Mono/Metric/Base/Small, BiRefNet, SAM 2, LaMa, Real-ESRGAN, vtracer | **Low** | Apache, MIT or BSD [V] | Keep NOTICE files |
| HiDream-I1 | Med | MIT, but the bundled Llama 3.1 terms apply [V] | Comply with Llama terms or skip it |
| SD 3.5 | Med | Revenue threshold [U] | Track revenue |
| LTX-2.x | **Med–High** | Competitor clause §20; watermark preservation [V] | Legal review, or avoid |
| Hunyuan models | **High** | EU, UK and South Korea excluded [V] | Avoid |
| Depth Anything V2 B/L/G, DA3 Large/Giant | **High** | CC BY-NC [V] | Use DA3-Mono-Large or V2-Small |
| RMBG-2.0 (rembg default) | **High** | Paid commercial agreement required [V] | Set `-m birefnet-*` explicitly |
| SAM 3 | Med | "Military or warfare purposes" clause [V] | Use SAM 2 |
| Wikimedia CC BY-SA / NC / ND | **High** | Share-alike or non-commercial | Filter on extmetadata |
| Wikimedia PD / CC0 / CC BY | Low | — | Auto-generate credits for BY |
| Met, NGA, Smithsonian CC0 | Low | [V]/[U] | — |
| Pexels / Pixabay | Low–Med | ToS limits on competing services and Content ID; identifiable people [U] | Legal sign-off; no stock-browsing UI that looks like theirs |
| Unsplash API | Med | Hotlinking requirement [V] | Avoid for rendering |
| Game-icons, Twemoji | Low | CC BY attribution [V] | Credits page and description |
| OpenMoji | **High** | CC BY-SA [V] | Avoid |
| AI depictions of real or living people | **High** | Deepfake and defamation rules, vendor policies | Policy: no photoreal; deceased historical figures only |

---

## 14. AI video vs parallax vs archival: decision rules [E]

1. **Is the beat about a real, documented moment that has public-domain photos or footage?** Use **archival** (with parallax and grade).
2. **Is it illustrative (a portrait, a scene, a concept)?** Use an **AI still**, or a cached one, then parallax and FX.
3. **Does it need real physical motion, or is it the hook in the first 3 seconds of a short?** Use **AI image-to-video from the approved still** (Veo 3.1 Lite or Fast), within the tier budget, and cache the clip.
4. **Is it weather or an effect (rain, snow, fire, smoke, fog)?** Use a **procedural** renderer effect. Never pay for it.
5. **Is it a modern-world B-roll beat (cities, oil rigs, ports)?** Use **Pexels or Pixabay** first, and AI only if nothing suitable exists.


## KEY RECOMMENDATIONS
- Use Google Vertex AI as the primary image and video vendor (Gemini 3.1 Flash-Lite Image, Nano Banana 2 and Pro, Imagen 4, Veo 3.1 Lite and Fast): it has the widest price range ($0.017-0.24 per image), 50% batch pricing, and the only verified IP indemnity for generated output (GA versions, paid use).
- Animate stills with 2.5D parallax and procedural FX (rain, snow, smoke, fog) in the renderer as the default for ~90% of non-map beats, because the marginal cost is near zero and the result matches how top channels animate stills.
- Limit paid AI video to image-to-video hooks and hero shots from already-approved cached stills (Veo 3.1 Lite at $0.03-0.05/s, or Fast at $0.08-0.10/s, without audio), with a per-tier cap, because it is the most expensive line item.
- Build a global asset cache (Wikidata-keyed descriptor plus SigLIP embedding plus vision-model QA) and pre-generate per-style libraries of historical figures, props and icons for about $1-3k one-time, because reuse across users is the biggest cost lever.
- Generate 2048-pixel square masters (or 1K upscaled with Real-ESRGAN) and crop per aspect ratio, so one asset serves 16:9, 9:16, 1:1 and 4:5.
- Plan a migration of bulk image generation to self-hosted Apache-2.0 models (Z-Image-Turbo, FLUX.2 klein 4B, Qwen-Image-2512) on scale-to-zero L4 GPUs at about $1.05/hr, because that cuts per-image cost about 10-30x once volume justifies it.
- Use only commercial-safe processing models (BiRefNet MIT, DA3-Mono-Large Apache, Qwen-Image-Layered Apache, SAM 2, LaMa, Real-ESRGAN, vtracer) and always pass rembg an explicit BiRefNet model, because rembg's default (RMBG-2.0) and Depth Anything V2 B/L/G are non-commercial.
- Block the trap licenses in code: FLUX dev and klein 9B, Hunyuan (excludes EU, UK and South Korea), LTX-2.x pending legal review (competitor clause), Sora 2 (deprecated), gpt-image-1 (retiring 2026-10-23), and Gemini 2.5 Flash Image on the Gemini API (retiring 2026-10-02).
- Filter archival media by machine-readable license (Wikimedia extmetadata): auto-use only PD, CC0 and CC BY with auto-generated credits, and exclude BY-SA, NC and ND (watch Bundesarchiv and IWM WWII images), because share-alike or non-commercial terms could contaminate users' monetized videos.
- Use real archival photos for real events and AI only for stylized illustration, and never create photoreal AI images of living people, to limit deepfake, misinformation and platform-policy exposure.
- Apply one per-style render grade (LUT, texture, grain) to every asset, generated, archival or stock, because it unifies mixed sources at zero cost.
- Embed a C2PA manifest and AI disclosure in final MP4s and expose an AI-label toggle for YouTube and TikTok, because EU AI Act Art. 50, platform rules, and the FLUX and LTX licenses require disclosure or provenance.
- Use open icon sets (Lucide, Tabler, Phosphor, Material, flag-icons; Game-icons with CC BY credit) recolored per style, and use Recraft V4 vector with saved custom styles (~$0.08) only for era-specific gaps.

## COST ITEMS
- Gemini 3.1 Flash-Lite Image (Nano Banana 2 Lite), 1K output: $0.034 (batch/flex ~$0.017) / per image (VERIFIED. $30/M output tokens, 1120 tokens per 1K image; batch $15/M.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.1 Flash Image (Nano Banana 2): $0.045 (512) / $0.067 (1K) / $0.101 (2K) / $0.15 (4K) / per image (VERIFIED. $60/M output tokens (non-global $66); batch $30/M, so 50% off.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3 Pro Image (Nano Banana Pro): $0.134 (1K/2K) / $0.24 (4K) / per image (VERIFIED. $120/M output tokens; batch $60/M (~$0.067 at 2K).) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 2.5 Flash Image (Nano Banana 1): $0.039 (batch ~$0.0195) / per image (VERIFIED price. LiteLLM deprecation: Gemini API 2026-10-02, Vertex 2027-03-15.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Imagen 4 Fast / Imagen 4 / Imagen 4 Ultra: $0.02 / $0.04 / $0.06 / per image (VERIFIED.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Imagen 4 upscaling to 2K/3K/4K: $0.06 / per image (VERIFIED. Self-hosted Real-ESRGAN is far cheaper.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- OpenAI gpt-image-2 / gpt-image-2.5 (flare, sunburst): $30 per 1M image output tokens; $8/M image input; ~$0.005-0.006 low, ~$0.04-0.053 medium, ~$0.16-0.21 high (1024-1920px) / per image (SECONDARY (LiteLLM cites developers.openai.com pricing; per-size figures from fal pass-through). gpt-image-1 deprecated 2026-10-23.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- FLUX1.1 [pro] / Ultra / Kontext [pro] / Kontext [max]: $0.04 / $0.06 / $0.04 / $0.08 / per image (SECONDARY (black_forest_labs entries); bfl.ai blocked in this session.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- FLUX.2 [pro] / FLUX.2 [max]: $0.03 first MP + $0.015/extra MP / $0.07 + $0.03/MP (+$0.015-0.03 per reference image) / per image (SECONDARY (ComfyUI price badge).) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bfl.py
- Seedream 4.0 / 4.5 / 5.0 Lite / 5.0 Flash / 5.0 Pro: $0.03 / $0.04 / $0.035 / ~$0.018 / $0.045 (<=~2.6MP) or $0.09 / per image (SECONDARY. Flash price derived by dividing out Comfy's 1.43x markup.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bytedance.py
- Seedream layer separation (RGBA layers): ~$0.032 (1K-1.5K) to $0.064 / per image (SECONDARY. Useful for parallax.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bytedance.py
- Ideogram 3.0 turbo / default / quality: $0.03 / $0.06 / $0.09 / per image (SECONDARY; Comfy shows 1.43x these; fal lists v3 at $0.06.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_ideogram.py
- Recraft V4 raster / V4 vector SVG / V4.1 Flash / V4 Pro raster / V4 Pro vector: $0.04 / $0.08 / ~$0.007 / $0.25 / $0.30 / per image (SECONDARY; Comfy 1.43x markup divided out. LiteLLM lists recraftv3 at $0.04.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_recraft.py
- Recraft custom style creation / vectorize / remove background / crisp upscale: $0.005 / $0.01 / $0.01 / $0.004 / per call (SECONDARY; markup divided out.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_recraft.py
- xAI Grok Imagine image (base / quality / 2.0): $0.02 / $0.05 / $0.06 / per image (SECONDARY.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Bria text-to-image 3.2 (licensed training data) via fal: $0.0398 / per image (SECONDARY.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Nano Banana 2 / Nano Banana Pro via fal (aggregator markup check): $0.08 (1K), $0.12 (2K) / $0.15 (1K-2K), $0.30 (4K) / per image (SECONDARY. About 19% above Vertex direct; call Google directly.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Veo 3.1 Lite (video only / with audio): 720p $0.03 / $0.05; 1080p $0.05 / $0.08 / per second (VERIFIED. Cheapest hero-shot option.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Veo 3.1 Fast (video only / with audio): 720p $0.08 / $0.10; 1080p $0.10 / $0.12; 4K $0.25 / $0.30 / per second (VERIFIED.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Veo 3.1 standard (video only / with audio): 720p-1080p $0.20 / $0.40; 4K $0.40 / $0.60 / per second (VERIFIED. LiteLLM shows veo-3.1-*-001 Vertex deprecation 2026-11-17.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini Omni Flash video output (includes audio): 360p ~$0.034; 720p ~$0.101; 1080p ~$0.152; 4K ~$0.304 / per second (VERIFIED token price ($17.50/M; 1931/5792/8688/17376 tokens per second); per-second figures derived.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Sora 2 / Sora 2 Pro / Sora 2 Pro high-res: $0.10 / $0.30 / $0.50 / per second (SECONDARY. Deprecation date 2026-09-24 (Azure 2026-10-15). Do not use.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Kling v3 Omni (no audio / with audio): 720p $0.084 / $0.112; 1080p $0.112 / $0.14; 4K $0.42 / per second (SECONDARY (Comfy); may include about 1.4x markup over direct Kling API.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_kling.py
- Kling 2.5 Turbo Pro: $0.35 per 5 s / $0.70 per 10 s (~$0.07/s) / per clip (SECONDARY.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_kling.py
- MiniMax Hailuo H3 via fal: 480p $0.05; 768p $0.06; 2K $0.13; 4K $0.16 / per second (SECONDARY. Hailuo-02 via Comfy: 768p 6 s $0.28; 1080p 6 s $0.49.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Seedance 2.0 via fal: 480p $0.135; 720p $0.303; 1080p $0.682; 4K $1.555 / per second (SECONDARY. Seedance 2.5 at 720p is $0.473/s; via Runway, seedance2 is $0.36/s and mini $0.16/s.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Runway Gen-4 Turbo / Gen-4.5 / Aleph 2: $0.05 / $0.12 / $0.28 / per second (SECONDARY (cites docs.dev.runwayml.com; 1 credit = $0.01).) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Luma Ray 3.2: 720p $0.30 per 5 s (~$0.06/s); 1080p $1.20 per 5 s (~$0.24/s) / per clip (SECONDARY.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_luma.py
- Wan video API (Alibaba): 480p $0.05; 720p $0.10; 1080p $0.15 / per second (SECONDARY. Wan 2.2 open weights are Apache-2.0 for self-hosting.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_wan.py
- xAI Grok Imagine video v1 / v1.5: v1: 480p $0.05, 720p $0.07; v1.5: 480p $0.08, 720p $0.14, 1080p $0.25 / per second (SECONDARY.) https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json
- Vidu 3 Turbo: 720p $0.06; 1080p $0.08 / per second (SECONDARY.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_vidu.py
- Cloud Run GPU NVIDIA L4 (non-zonal redundancy): $0.0001867 GPU + $0.000018/vCPU-s + $0.000002/GiB-s (about $1.05/hr with 4 vCPU and 16 GiB) / per second (VERIFIED (tier-1 regions). Scale-to-zero self-hosting of open models; all-in hourly figure derived.) https://cloud.google.com/run/pricing
- Cloud Run GPU NVIDIA RTX PRO 6000 (non-zonal): $0.00036522 GPU (about $2.06/hr with 8 vCPU and 32 GiB) / per second (VERIFIED GPU rate; all-in figure derived.) https://cloud.google.com/run/pricing
- Self-hosted image generation (Z-Image-Turbo / FLUX.2 klein 4B on L4): ~$0.0006-0.002 / per image (ESTIMATE: 2-6 s per ~1MP image at ~$1.05/hr, excluding cold starts and engineering.) https://cloud.google.com/run/pricing
- Self-hosted Wan 2.2 TI2V-5B video: ~$0.15-0.30 per 5 s 720p clip (~$0.03-0.06/s) / per clip (ESTIMATE from README claim (<9 min per 5 s 720p on a consumer GPU) times ~$1-2/hr GPU; not cheaper than Veo 3.1 Lite.) https://github.com/Wan-Video/Wan2.2
- Asset processing (BiRefNet cutout, DA3 depth, LaMa fill, Real-ESRGAN upscale) self-hosted: ~$0.0002-0.001 / per asset (ESTIMATE; runs on CPU at low volume.) https://cloud.google.com/run/pricing
- Bria background removal API / Bria video background removal: ~$0.0126 / ~$0.035 per second / per image / per second (SECONDARY; Comfy shows $0.018 and $0.05/s, assumed to include a 1.43x markup. Self-hosted BiRefNet is ~free.) https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bria.py
- Pre-generated per-style library (2,000 figures + 500 props x 6 styles, plus icon gaps, QA): ~$1,000-3,000 one-time / one-time (ESTIMATE using batch prices of $0.017-0.034 per image plus Recraft vectors and retries.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Archival sources: Met, NGA, Smithsonian CC0; Wikimedia Commons; LoC; NASA; Europeana; Pexels/Pixabay APIs: $0 / per asset (Free; cost is engineering for license filtering and credits. Pexels/Pixabay terms not re-verified (domains blocked).) https://github.com/metmuseum/openaccess
- BFL commercial license for self-hosting FLUX [dev]-class weights: unknown (historically ~$999/month for ~100k images) / per month (UNVERIFIED; README points to bfl.ai/pricing/licensing (blocked). Avoid by using klein 4B (Apache-2.0).) https://github.com/black-forest-labs/flux
- Getty / Shutterstock / Storyblocks enterprise media API: unknown (enterprise contract) / per month (UNVERIFIED; optional premium-tier add-on.) https://www.gettyimages.com/

## RISKS
- Verification gap: most vendor sites (OpenAI, BFL, fal, Replicate, Runware, Recraft, Ideogram, Pexels, Pixabay, Wikimedia, Hugging Face) were blocked by the egress proxy, and the WebSearch budget was used up. Non-Google prices come from LiteLLM and ComfyUI code and must be re-checked before committing.
- Model churn: Sora 2 API deprecated (2026-09-24), gpt-image-1 retiring 2026-10-23, Gemini 2.5 Flash Image retiring on the Gemini API 2026-10-02, and a Veo 3.1 GA deprecation date listed for 2026-11-17. A provider abstraction and model registry with automated quality regression tests are mandatory.
- License contamination from open weights: FLUX dev/klein 9B, Depth Anything V2 B/L/G, DA3 Large/Giant, RMBG-2.0 (rembg's default), Hunyuan territory exclusion, LTX-2.x competitor clause, HiDream's bundled Llama terms. A single wrong default in a dependency creates commercial liability.
- Archival license contamination: CC BY-SA, NC and ND images (e.g., Bundesarchiv CC BY-SA, IWM non-commercial) entering monetized user videos. Missing CC BY attribution. Misjudged public-domain status of non-US photos.
- Shared cached assets across many users mean identical visuals on many channels. This creates Content ID collision risk (a user wrongly claims a shared asset or stock clip) and fits YouTube's 'inauthentic/mass-produced content' monetization policy. Google's terms also note identical outputs can be generated for multiple customers.
- Real-person and deepfake exposure: AI portraits of living politicians, defamation, election-deepfake laws, and vendor policy refusals that break automated pipelines unpredictably.
- Disclosure and provenance obligations (EU AI Act Art. 50 from Aug 2026, YouTube/TikTok AI labels, FLUX and LTX license clauses) that compositing can break by stripping C2PA metadata.
- Quality risk: cheap tiers (gpt-image-2 low, Flash-Lite, self-hosted turbo models) may fall short of the 'astonishing' bar, and anachronisms (wrong uniforms or weapons) damage credibility in history content. A QA loop adds 20-30% generation overhead.
- Safety filters on war and violence prompts may refuse or degrade battle scenes, so you need fallback models and prompt rewriting.
- Aggregator markups (fal, Runway, Comfy) of 15-50% over direct prices if used by default.
- Self-hosting GPUs too early: cold starts (20-60 s model load), idle cost and ops burden before volume justifies it.
- Unsplash's hotlinking requirement and Pexels/Pixabay anti-competition clauses could make automated stock embedding a ToS breach if not reviewed.

## QUESTIONS FOR FOUNDER
- Do you already have, or can you open, a Google Cloud billing account (and apply for Google for Startups AI credits)? The recommended stack concentrates on Vertex AI for price, batch discounts and IP indemnity.
- What per-video cost ceilings per plan do you want (e.g., short: $0.15 budget / $1.50 pro; long-form: $1 / $10), and what monthly price points are you targeting, so we can set AI-video caps per tier?
- Will you approve a one-time budget of about $1-3k to pre-generate per-style libraries (historical figures, props, icons) before launch?
- Are you comfortable with the same cached visuals appearing in many users' videos, or should premium plans get exclusive or fresh generations (which costs more)?
- What is your legal stance on depicting real people: deceased historical figures stylized only? Living politicians only via public-domain or licensed photos? Any photoreal AI people at all?
- Should the product allow CC BY archival assets that require attribution (we would auto-insert credits into video descriptions or end cards), or restrict to public domain and CC0 only?
- Which markets will you launch in (EU/UK in particular)? That affects AI Act disclosure duties and excludes some model licenses (Hunyuan).
- How should the product handle historically accurate hate symbols in WWII/Nazi-era content (e.g., Nazi flags on maps): allowed with context, blurred, or per-market setting?
- Do you want a premium tier with licensed stock or editorial footage (Getty, Shutterstock or Storyblocks enterprise contract), which has a fixed monthly cost?
- Are you willing to run GPU infrastructure (self-hosted open models on Cloud Run, Modal or RunPod) after launch, or stay API-only at first?
- What are your expected company revenue and headcount over the next 2 years? Several licenses have thresholds (SD 3.5 ~$1M revenue, LTX-2.x $10M, Remotion's company tiers).
- Is 4K output required at launch, or is 1080p enough? 4K roughly doubles to triples image and video generation costs.
- Who will act as your legal reviewer for stock-API terms (Pexels, Pixabay, Unsplash), CC BY-SA handling, and the LTX and BFL licenses before launch?