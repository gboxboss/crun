# Video rendering engine, render infrastructure and unit cost of compute, storage and delivery

*Research date: 2026-10-01. How to read the labels below:*
- **VERIFIED**: I read it on a primary source (official docs, a LICENSE or terms file, an official price list or API). The URL is given.
- **SNIPPET**: the primary page was blocked by the sandbox's egress proxy, so the figure comes from search-engine summaries of that page or of third-party reviews. Re-check it before you commit money.
- **ESTIMATE**: my own model or opinion.
- **MEASURED**: I ran it in this container.

Blocked during this research: remotion.dev/remotion.pro (I read the same docs from the GitHub source instead), aws.amazon.com (I used the official AWS Price List API instead), hetzner.com, modal.com, runpod.io, vast.ai, shotstack.io, creatomate.com, json2video.com, bunny.net, backblaze.com, mux.com and gsap.com. I also ran out of web searches near the end.

---

## 1. Executive summary

1. **Use Remotion as the engine.** It is React-based and renders with headless Chrome plus FFmpeg. Four things make it the best fit:
   - Its terms explicitly allow a prompt-to-video SaaS that generates Remotion code with AI and renders it.
   - It is free for companies with 3 or fewer employees, including automation. After that it costs $0.01 per render with a $100/month minimum.
   - It has the best in-browser Player for live preview and editing. Player previews are not billable renders.
   - It is the most mature option for distributed (chunked) rendering.

   HyperFrames, HeyGen's Apache-2.0 HTML-to-video framework launched in March 2026, is the strongest fallback with no license fee. It is pre-1.0 and built around GSAP, and GSAP's license has a "no-code visual animation tool" restriction (see risks).
2. **The map layer should be MapLibre GL JS (BSD-3), driven frame by frame inside Remotion.** Pair it with SVG/Canvas-2D (d3-geo) for flat "history map" styles. Use WebGL only where it adds real value: globe, 3D terrain, particles and atmosphere.
3. **Rendering is cheap compared with the rest of the pipeline. The variable that decides the cost is CPU vs GPU for WebGL scenes.** By my model:
   - Light or 2D scenes cost **$0.01–0.04 per finished minute** on CPU serverless.
   - Heavy 3D WebGL scenes on CPU (SwiftShader/"swangle") can cost **$0.13–0.43+ per minute** and render slowly.
   - The same heavy scenes on a GPU cost **$0.005–0.05 per minute**.
4. **MVP infrastructure:** use Remotion Lambda on CPU if the hands-on spike shows that a representative 3D map scene needs ≤ about 2–3 vCPU-seconds per 1080p frame. Otherwise build a self-hosted GPU render worker from day one. That worker is the same Docker image using `renderMedia({frameRange})` and `combineChunks()`.
5. **At scale:** run a steady baseline on cheap, always-busy GPU boxes, for example Hetzner GEX44, or EC2 g6f/g4dn reserved or spot. Burst to per-second serverless GPUs (Cloud Run L4 jobs, Modal) or to Lambda on CPU. Add scene-level render caching, and use the free in-browser Player preview before any paid final render.
6. **Do not build on render APIs** (Shotstack, Creatomate, JSON2Video, Plainly). They cost $0.19–1.38 per minute, roughly 10–100x self-hosting, and they cannot run custom WebGL map code, so they cannot reach the quality target.

---

## 2. What the renderer has to do

A finished video is a **scene graph** (JSON produced by the LLM planner) rendered by a library of React scene components. Typical components:
- a map camera path
- border morphs
- army arrows
- labels and callouts
- icons, flags and portraits
- weather particles
- captions
- audio tracks: voiceover, music and SFX

The hard technical constraints are:

| Constraint | Why it matters | Implication |
|---|---|---|
| **WebGL maps (MapLibre/deck.gl/three.js)** | Globe, terrain, hillshade, fog and particles are GPU workloads. Headless Chrome without a GPU falls back to software rasterizers (SwiftShader/llvmpipe). | GPU vs CPU dominates the render cost of 3D styles. |
| **Determinism** | Chunked or parallel rendering only works if frame N always looks identical. | All motion is a pure function of the frame number. Use seeded randomness, set MapLibre `fadeDuration: 0`, call `map.jumpTo()` per frame (never `flyTo` timers), and hold the frame with `delayRender()` until the map fires `idle`. Fonts and tiles must be served locally or from R2. Use homogeneous worker pools, so you never mix GPU models within one video. |
| **Parallel chunking** | A 10–20 minute long-form video at 30 fps is 18,000–36,000 frames. | Split into chunks, render them in parallel, then concatenate. Remotion documents this (`frameRange`, `h264-ts`, `combineChunks()`). |
| **Scene-level caching** | Users will edit one scene and re-export. | Render per scene keyed by a content hash. Concatenate the video segments and re-mix the audio once. |
| **Multiple aspect ratios** | 9:16 at 1080x1920 has the same pixel count as 16:9 at 1920x1080. | Cost scales with pixels × frames, not with orientation. 4K costs about 4x and 60 fps about 2x, so they suit premium tiers. |

---

## 3. Engine options compared

### 3.1 Remotion (recommended)

- **License (VERIFIED, Remotion T&C v5.0 source, https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/terms.mdx; LICENSE: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md):**
  - **Free License:** individuals, for-profit organizations with up to 3 employees, non-profits, and anyone evaluating. *"Free License Users may build automations without purchasing Renders."*
  - **Company License (4 or more people):**
    - *Remotion for Automators*: **$0.01 per render, billed in increments of 1,000 renders ($10), with a $100/month minimum spend.** It is defined as being "for organizations building automations such as video editors, prompt-to-video tools, automated video pipelines, embedding the Remotion Player."
    - *Remotion for Creators*: $25 per seat per month.
    - *Enterprise*: from a $500/month minimum.
  - **What counts as a render:** *"One render means outputting a video, an audio file, a still image, or an image sequence… Only successful renders count."* Development and failed renders are not charged.
  - **The Player:** *"Displaying a Remotion composition using the Remotion Player does not constitute a render."* However, a Company License user who embeds the Player needs Automators at the minimum spend.
  - **Our use case is explicitly allowed.** The terms say: *"It is allowed to build a prompt-to-motion graphics service that generates Remotion code using artificial intelligence and renders it. Allowing end-users to edit Remotion code is permitted if the code was initially generated by the service."*
  - **Not allowed:** letting users upload their own Remotion projects.
  - **Telemetry:** Automators customers must set a license key, which sends one telemetry event per render.
  - **Caveat:** that document is marked "Upcoming… will take effect upon the release of Remotion 5.0". The current v4 terms live at https://www.remotion.pro/terms-4-0, which I could not fetch. The FAQ (https://www.remotion.dev/docs/license/faq) states the same prices.
- **Status (VERIFIED, npm registry):** `remotion` 4.0.532 was published 2026-10-01, so releases come almost daily.
- **Server rendering:**
  - **Self-hosted** `@remotion/renderer` (`renderMedia`, `frameRange`). This is what you run in your own containers.
  - **Remotion Lambda** (AWS, CPU only). Concurrency is chosen automatically: about 75–150 Lambdas per video, with at least 20 frames per Lambda. Limits are 15 minutes per invocation, 10 GB RAM and 10 GB disk, and 1,000 concurrent executions per region by default (VERIFIED: https://www.remotion.dev/docs/lambda/limits, https://www.remotion.dev/docs/lambda/concurrency).
  - **Cloud Run.** Remotion's comparison page describes it as alpha and "not actively being developed" (SNIPPET, https://www.remotion.dev/docs/compare-ssr).
  - **Vercel Sandbox.**
- **Lambda cost examples (VERIFIED, https://www.remotion.dev/docs/lambda/cost-example).** These are simple, non-WebGL compositions at 2048 MB in us-east-1:

  | Video | Cost | Render time (warm) |
  |---|---|---|
  | 1 minute | $0.017 | 18.9 s |
  | 10-minute HD | $0.103 | 56 s |
  | 10-second 4K | $0.013 | – |

  Treat these as a lower bound for map scenes.
- **GPU (VERIFIED, https://www.remotion.dev/docs/gpu):**
  - WebGL content (Three.js, Skia, Mapbox and similar) benefits from a GPU.
  - *"In headless mode, Chromium disables the GPU, leading to a significant slowdown."*
  - *"AWS Lambda instances have no GPU."*
  - The cloud GPU guide (https://www.remotion.dev/docs/miscellaneous/cloud-gpu) recommends **EC2 g4dn.xlarge**, NVIDIA driver 535.x, `--gl=vulkan`, and `--chrome-mode="chrome-for-testing"`.
  - The `--gl` options are `angle` (the 5.0 default), `egl`, `angle-egl` (recommended for Linux with a GPU), `vulkan`, `swiftshader`, and `swangle` (the default on Lambda and Cloud Run) (SNIPPET of https://www.remotion.dev/docs/gl-options).
- **Hardware encoding (VERIFIED, https://www.remotion.dev/docs/hardware-acceleration):** NVENC on Linux and Windows from v4.0.484, H.264 and H.265 only. The bundled Linux ARM64 binaries do not include NVENC.
- **Distributed rendering on your own infrastructure (VERIFIED):**
  - The blueprint is at https://www.remotion.dev/docs/distributed-rendering. Each chunk renders the same number of frames, uses codec `h264-ts`, and sets `enforceAudioTrack`.
  - Chunks are joined with `combineChunks()`, available from v4.0.279 (https://www.remotion.dev/docs/renderer/combine-chunks). Lambda uses the same API internally.
- **Client-side (WebCodecs) rendering (VERIFIED, https://www.remotion.dev/docs/client-side-rendering):**
  - Stable from 4.0.491 via `renderMediaOnWeb()`.
  - Supports a *subset* of CSS. For example `z-index`, `mix-blend-mode` and `backdrop-filter` are not supported in the default mode.
  - `<ThreeCanvas>`, Skia, Lottie and Rive are supported.
  - Telemetry is always sent, and client renders are billable under Automators.
  - It is useful later for free-tier or draft exports that cost us nothing, but it is risky for final quality. Arbitrary MapLibre canvases are not listed as supported.
- **Player and Editor Starter:**
  - The `<Player>` gives a real-time in-browser preview at zero server cost.
  - The Editor Starter is a paid template with a timeline, canvas, font picker and asset uploads, sold as a one-time purchase to free-license users (VERIFIED: https://www.remotion.dev/docs/editor-starter). I could not verify its price because remotion.pro was blocked; I believe it was about $600 one-time in 2025 (UNVERIFIED).

### 3.2 Alternatives

| Engine | License / status (VERIFIED via npm or GitHub unless noted) | WebGL maps | Parallel chunks | Developer speed | Verdict |
|---|---|---|---|---|---|
| **Remotion** | Source-available. Free for ≤3 employees, then $0.01/render with $100/month minimum. Very active. | Yes: any DOM, Canvas or WebGL in Chrome. GPU via `--gl`. | Built in (Lambda) plus documented DIY | Highest: React ecosystem, Player, LLMs write it well | **Primary** |
| **HyperFrames** (HeyGen), https://github.com/heygen-com/hyperframes | Apache-2.0, no per-render fee. npm `hyperframes` first published 2026-03-23; v0.8.103 on 2026-10-01. Seeks each frame in headless Chrome and encodes with FFmpeg. Adapters for GSAP, CSS, Lottie, Three.js, Anime.js and WAAPI. Has an AWS Lambda distributed-render package and ships agent "skills". README claims 55k+ stars. | Yes (same headless-Chrome approach) | Lambda package | High, but plain HTML plus GSAP; pre-1.0 and churning | **Plan B / hedge** if Remotion's terms worsen. Avoid GSAP in our scenes (see risks). |
| **Revideo** (Motion Canvas fork) | MIT. `@revideo/core` 0.10.4 (Feb 2025) and 0.10.5-alpha (Apr 2025), then nothing until **0.11.0 on 2026-07-10**, a roughly 15-month gap. | Canvas-2D-centric; WebGL only through custom nodes | Has a parallel renderer | Medium | Maintenance risk. Not recommended. |
| **Motion Canvas** | MIT. `@motion-canvas/core` last release 3.17.2 (2024-12-14). | Canvas 2D | No first-class distributed rendering | Medium | Stale. Not recommended. |
| **DIY Playwright + FFmpeg** | Your own code. Chromium is BSD; FFmpeg is LGPL/GPL depending on the build. | Yes | You build it | Low to medium (1–3 engineer-weeks for a robust version) | Possible escape hatch. In effect you would rebuild a lesser Remotion. |
| **Manim / MoviePy (Python)** | MIT | No real map stack; MoviePy is slow compositing | DIY | Low for this genre | Not suitable |
| **Pure FFmpeg** | LGPL/GPL | No | Trivial | – | Use it for final concat, mux and loudness only |
| **Blender (+BlenderGIS)** | GPL. Rendered output is not covered by the GPL (ESTIMATE/known) | Photoreal 3D terrain, but needs a GPU (EEVEE/Cycles) and seconds per frame | Frame ranges are easy | Low; Python scene building is hard for an LLM to drive | Later, for "premium cinematic 3D" hero shots only |
| **Unreal / Unity / Godot headless** | UE EULA: linear content is royalty-free (from memory, UNVERIFIED). Godot is MIT and has a `--write-movie` mode. | Excellent 3D, but a large build effort and GPU-only. Map-tile licensing for 3D tiles is restrictive. | Possible | Very low | Not for MVP |
| **Custom wgpu/Skia renderer** | Your own code | Fastest at runtime | You build it | Very low | Only at very large scale |

**Render APIs** (all SNIPPET; pages blocked):

| API | Pricing | Notes |
|---|---|---|
| Shotstack | about $0.20/min on a subscription from $39/month; $0.30/min pay-as-you-go | |
| Creatomate | Essential $54/month (2,000 credits), Growth $129/month (10,000), Beyond $249–299/month (50,000) | About 31 credits per 1080p/25fps minute, so about $0.19–0.84/min |
| JSON2Video | Hobby $16.95/3,000 credits, Pro $49.95/12,000, Startup $99.95/30,000 | 1 credit = 1 s of FHD, so about $0.20–0.34/min |
| Plainly (After Effects templates) | $69/month for 50 min up to $649/month for 600 min, $1,500 unlimited | About $1.08–1.38/min |
| Rendi | Billed per GB processed | FFmpeg-as-a-service only |

These are JSON-timeline or After Effects template renderers. **None can execute custom WebGL map code with frame-accurate camera control.** Use none of them.

---

## 4. Throughput and hardware

### 4.1 WebGL in headless Chrome: CPU vs GPU

- **Chrome removed the silent SwiftShader fallback for WebGL** (SNIPPET of the Chromium blink-dev "Intent to Remove: SwiftShader Fallback", https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM).
  - The deprecation began in Chrome 130.
  - **From M139, WebGL context creation fails** instead of falling back, unless SwiftShader is requested explicitly (`--use-angle=swiftshader`/swangle) or `--enable-unsafe-swiftshader` is passed.
  - Implication: CPU renderers must pin flags explicitly, and Chrome upgrades are a regression risk. Remotion Lambda ships Chrome 149 for 4.0.452+ and uses swangle explicitly (VERIFIED: https://www.remotion.dev/docs/lambda/runtime).
- **Public data points.** There are no clean public MapLibre-in-Remotion benchmarks; these are the best proxies:
  - Foundry VTT scene in headless Chromium: **4 fps on SwiftShader vs 35 fps on GPU**; screenshots in 3.3 s vs 0.9 s, about 3.5x faster (VERIFIED, https://github.com/Txpple/fvtt-mcp-dnd5e/issues/2). Hardware was an Intel iGPU laptop, so a datacenter NVIDIA card should gain more.
  - Chromium using the GPU instead of SwiftShader: **4 fps → 58 fps** (SNIPPET, https://dev.to/orca_forge/why-chromium-was-ignoring-my-gpu-and-how-i-boosted-performance-from-4fps-to-58fps-4dnc).
  - Remotion-based OpenChatCut on Linux with swangle: **"~0.3–0.5 FPS"** export with all CPU cores pegged; the fix was switching to `angle-egl` on an RTX 3060 Ti with NVENC (VERIFIED, https://github.com/0xsline/OpenChatCut/issues/159). This is a realistic pessimistic case for heavy compositions on CPU.
  - Without a GPU, pointing ANGLE at Mesa **llvmpipe (`--use-angle=gl`) was about 4x faster than SwiftShader** (24 s → 6 s per 3D page) (SNIPPET, https://microlink.io/blog/webgl-without-a-gpu). **The spike should test llvmpipe vs swangle on CPU.**
- **GPU in containers is fiddly.** You need:
  - the NVIDIA container runtime, with graphics capabilities rather than only compute
  - Vulkan/EGL ICDs
  - Chrome for Testing rather than headless-shell
  - flags such as `--gl=angle-egl` or `--gl=vulkan`

  Without all of this, Chrome silently uses SwiftShader even when `--gpus all` is set (SNIPPET from several GitHub issues). **Always assert `WEBGL_debug_renderer_info` reports NVIDIA at worker start-up and fail fast otherwise.**
- **ESTIMATE of what to expect for 1080p map frames:**

  | Scene type | CPU cost per frame |
  |---|---|
  | Flat 2D (SVG/Canvas) | about 0.1–0.4 vCPU-s |
  | 2.5D MapLibre vector map | about 0.5–2 vCPU-s on swangle |
  | Globe + 3D terrain + fog + particles | about 2–10+ vCPU-s on swangle |

  - **On one L4/T4-class GPU with 4–8 vCPUs, expect about 10–50 frames/s per box.** The ceiling comes from screenshot capture, JPEG/PNG transfer and CPU-side JavaScript (tile parsing, React), not from the GPU.
  - The parallel spike's numbers should replace these.

### 4.2 Encoding

- **MEASURED in this container** (4 vCPU, Ubuntu FFmpeg 6.1.1, libx264, CRF 18, 1080p30, 300-frame test pattern, **while another job was loading the machine to about 9**, so treat these as conservative):

  | Preset | Speed | Output |
  |---|---|---|
  | ultrafast | 151 fps | |
  | **veryfast** | **62 fps** | about 8.6 Mbps |
  | faster | 38 fps | |
  | medium | 26 fps | |

  On high-entropy noise, veryfast fell to 11.8 fps. Real map content sits between the two.
  - Encoding therefore costs about **0.03–0.15 vCPU-s per frame**. That is under $0.01 per finished minute, and small next to WebGL frame generation.
  - **Use `x264Preset: veryfast` or `faster` at CRF 17–20.** YouTube and TikTok re-encode anyway, so a high bitrate matters more than preset efficiency.
- **NVENC:**
  - NVIDIA reports roughly 600 fps for NVENC H.264 1080p vs about 95 fps for x264 medium. A T4 handles 17–18 simultaneous 1080p streams (SNIPPET of https://developer.nvidia.com/blog/turing-h264-video-encoding-speed-and-quality/).
  - At about 10 Mbps or more for 1080p, the quality gap is negligible. On GPU workers, use Remotion's `hardwareAcceleration: "if-possible"` (x64 only).

### 4.3 Chunking and concatenation

- **Chunk size.** Use about 2–6 s chunks for long-form. Each chunk pays a fixed start-up cost: Chrome launch, bundle load, map style, font and tile warm-up. A local or R2 tile cache cuts the warm-up sharply. Remotion Lambda's default is at least 20 frames per Lambda.
- **Audio.** Render it separately (`separateAudioTo`) or mix it with FFmpeg, then mux once at the end. This avoids AAC priming gaps at chunk seams. Remotion's blueprint covers this.
- **Scene-level cache.** A natural unit is one chunk per scene (about 3–15 s). The cache key is a hash of the scene JSON, asset hashes, style version, renderer and Chrome version, resolution and fps. When a user edits one scene, only that scene is re-rendered, followed by an FFmpeg concat of `h264-ts` segments plus an audio re-mux.
  - For cross-scene transitions, render "handles" (for example 0.5 s of overlap) or keep transitions inside a scene.
- **License caveat.** On a Company License, every `renderMedia()` call that outputs a file may count as a billable render. 15 scene renders would then be $0.15 per video, versus $0.01 for one `renderMediaOnLambda()` call. **Ask Remotion in writing how chunked or self-hosted distributed renders are counted.** It is free while you have 3 or fewer employees.

---

## 5. Infrastructure prices

| Provider / SKU | Price | Status / source |
|---|---|---|
| AWS Lambda, Arm | $0.0000133334 per GB-s (tier 1, first 7.5B GB-s); requests $0.20/M; free 400k GB-s per month | VERIFIED, AWS Price List API (published 2026-09-19): https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json |
| AWS Lambda, x86 | $0.0000166667 per GB-s (tier 1) | VERIFIED, same source |
| Lambda vCPU mapping | 128–3008 MB: 2 vCPU; 5308–7076 MB: 4; 8846+ MB: 6 (CPU share scales with memory; 1,769 MB ≈ 1 full vCPU) | VERIFIED (Remotion: https://www.remotion.dev/docs/lambda/runtime) |
| EC2 us-east-1 on-demand, Linux | c7g.4xlarge (16 vCPU) $0.58/h; c8g.4xlarge $0.638/h; c7i.4xlarge $0.714/h; c7a.4xlarge $0.821/h | VERIFIED, AWS Price List CSV: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv |
| EC2 GPU on-demand | **g4dn.xlarge** (T4 16 GB, 4 vCPU) $0.526/h; g4dn.2xlarge $0.752/h; **g6.xlarge** (L4 24 GB, 4 vCPU) $0.8048/h; g6.2xlarge $0.9776/h; **g6f.xlarge** (fractional L4, 3 GB GPU memory, 4 vCPU) **$0.2375/h**; g5.xlarge (A10G) $1.006/h | VERIFIED, same CSV. g6f uses fractional GPUs: validate Chrome/Vulkan support. |
| EC2 spot | Typically 50–70% below on-demand | ESTIMATE (the spot feed was blocked) |
| GCP Cloud Run, instance-based billing and Jobs (Tier 1) | CPU $0.000018/vCPU-s; memory $0.000002/GiB-s; **L4 GPU $0.0001867/s non-zonal** ($0.0002909 zonal); RTX PRO 6000 $0.00036522/s. Jobs are billed for the whole instance lifetime with a **1-minute minimum**. | VERIFIED: https://cloud.google.com/run/pricing |
| Cloud Run request-based services | CPU $0.000024/vCPU-s active; memory $0.0000025/GiB-s; $0.40 per M requests | VERIFIED, same page |
| Cloud Run "Delayed Jobs" | CPU $0.0000126/vCPU-s; memory $0.0000014/GiB-s; L4 same $0.0001867/s. Prices "dynamic, can change up to once every 30 days". | VERIFIED, same page |
| Cloud Run free tier (instance-based) | 240k vCPU-s and 450k GiB-s per month | VERIFIED, same page |
| Modal | CPU $0.0000131 per **physical core**-s (= 2 vCPU); memory $0.00000222/GiB-s; T4 $0.000164/s; L4 $0.000222/s (about $0.80/h); A10 $0.000306/s. Region multiplier 1.25–2.5x and a non-preemptible surcharge. | SNIPPET (https://modal.com/pricing blocked) |
| RunPod | L4 $0.44/h community, $0.49/h secure; RTX A4000 $0.17/$0.25 per hour; RTX 4000 Ada about $0.18/h(?); serverless flex 16 GB tier $0.00016/s | SNIPPET (https://www.runpod.io/pricing) |
| Vast.ai | Marketplace pricing; consumer GPUs roughly $0.10–0.40/h | ESTIMATE (blocked). Consumer-GPU datacenter EULA risk applies. |
| Hetzner Cloud CCX (dedicated vCPU) | Third price rise of 2026 on **2026-06-15**: CCX33 (8 vCPU) €62.49 → **€138.49/month**; CCX43 €124.99 → €275.99 (EU). US CCX33 $76.99 → $165.99. Applies to new orders and rescales only. | SNIPPET (wz-it.com, webhosting.today, northflank; hetzner.com blocked) |
| Hetzner GEX44 dedicated GPU | RTX 4000 SFF Ada 20 GB, i5-13500, 64 GB: **€184/month + €79 setup**. One source says €234/month as of Aug 2026. | SNIPPET, conflicting: verify on https://www.hetzner.com/dedicated-rootserver/matrix-gpu/ |
| Cloudflare R2 | Standard $0.015/GB-month; Infrequent Access $0.01/GB-month (+$0.01/GB retrieval); Class A $4.50/M; Class B $0.36/M; **egress free**; free tier 10 GB, 1M Class A, 10M Class B | VERIFIED (Cloudflare docs source): https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/pricing.mdx |
| Backblaze B2 | $6.95/TB-month; free egress up to 3x stored, then $0.01/GB | SNIPPET |
| Bunny Stream / CDN | Storage about $0.005–0.01/GB-month; CDN from $0.01/GB (EU/US), $0.03 (Asia), $0.045 (South America); H.264 encoding free; $1/month minimum | SNIPPET |
| Mux | Storage about $0.0024–0.003 per minute-month; 100k free delivery minutes, then about $0.0008/min; Plus/Premium encoding is extra | SNIPPET (https://www.mux.com/docs/pricing/overview). Not needed for MVP. |

---

## 6. Cost per finished minute of 1080p30 video (1,800 frames)

### 6.1 CPU paths

All figures are ESTIMATES built from the verified prices above. The unknown is vCPU-seconds per frame, which covers frame generation and capture plus about 0.05 for encoding.

| Effective $/vCPU-s | 0.3 vCPU-s/frame (2D, light) | 1 (2.5D map) | 3 (globe/terrain) | 10 (pathological, OpenChatCut-like) |
|---|---|---|---|---|
| Lambda Arm ($0.0000236; 1,769 MB per vCPU) | $0.013 | $0.042 | $0.127 | $0.425 |
| Cloud Run Jobs, 1 vCPU + 2 GiB ($0.0000220) | $0.012 | $0.040 | $0.119 | $0.396 |
| Cloud Run Delayed Jobs ($0.0000154) | $0.008 | $0.028 | $0.083 | $0.277 |
| EC2 c7g.4xlarge on-demand at 80% utilization ($0.0000126) | $0.007 | $0.023 | $0.068 | $0.227 |
| Hetzner CCX33 at €138.49 and 50% utilization (≈$0.0000156) | $0.008 | $0.028 | $0.084 | $0.281 |

- **Lambda overhead.** Add about 20–40% for Lambda orchestration, cold starts and per-chunk tile and font warm-up.
- **Calibration.** Remotion's own example ($0.017 per 1-minute video) corresponds to about 0.4 vCPU-s per frame for a simple composition.

### 6.2 GPU paths

ESTIMATES. Per-box frames per wall-second is the unknown.

| Box (price) | 10 fps | 25 fps | 50 fps |
|---|---|---|---|
| Cloud Run L4 + 4 vCPU + 16 GiB ($1.047/h) | $0.052 | $0.021 | $0.010 |
| Modal L4 + 2 cores + 16 GiB (about $1.02/h before multipliers) | $0.051 | $0.020 | $0.010 |
| EC2 g6.xlarge L4 ($0.805/h) | $0.040 | $0.016 | $0.008 |
| EC2 g4dn.xlarge T4 ($0.526/h) | $0.026 | $0.011 | $0.005 |
| RunPod L4 secure ($0.49/h) | $0.025 | $0.010 | $0.005 |
| Hetzner GEX44 at about $215–274/month, 50% utilization | $0.030–0.038 | $0.012–0.015 | $0.006–0.008 |
| EC2 g6f.xlarge fractional L4 ($0.2375/h; likely the low-fps column) | $0.012 | $0.005 | $0.002 |

- **Cloud Run cold starts.** The 1-minute minimum per job instance and GPU cold starts add a fixed amount per job, roughly $0.01–0.02. Batch the chunks of one video onto as few instances as is sensible.

### 6.3 Per-video render cost

ESTIMATE. Render only: excludes LLM, TTS, music, image generation and map data.

| Video | Path | Compute | Remotion license | Storage (30 days in R2) | Total |
|---|---|---|---|---|---|
| 60 s Short, 2.5D map style | Lambda CPU, 1 vCPU-s/frame | about $0.05 | $0 (≤3 staff) or $0.01 | under $0.001 | **about $0.05–0.06** |
| 60 s Short, 3D globe | Cloud Run L4 at 25 fps, plus start-up | about $0.03–0.04 | $0–0.01 | under $0.001 | **about $0.04–0.05** |
| 10-min long-form, 3D-heavy | Lambda CPU, 3 vCPU-s/frame | about $1.3–1.8 | $0–0.01 | about $0.01 | **about $1.3–1.8** |
| 10-min long-form, 3D-heavy | GPU pool at 25 fps (g6 / GEX44) | about $0.12–0.16 | $0–0.15 (if counted per scene) | about $0.01 | **about $0.15–0.30** |

**Conclusions:**
- **For Shorts, render infrastructure barely matters.**
- **For long-form 3D styles, a GPU cuts render cost by about 5–10x** and cuts wall-clock time sharply. One 25 fps box renders 10 minutes of video in 12 minutes; split across 8 boxes it takes about 1.5–2 minutes plus start-up.
- Lambda's roughly 150-way parallelism gives a fast wall-clock even on CPU, at the higher cost.

---

## 7. Storage and delivery

- **Output size.** 1080p30 H.264 at about 8–12 Mbps is about **60–90 MB per finished minute** (MEASURED 8.6 Mbps for veryfast CRF 18 on a test pattern). That is about **$0.001 per minute-month** in R2 Standard, and downloads are free because R2 egress is free.
- **Use R2 for everything:**
  - user uploads and generated assets
  - per-scene render cache
  - final MP4s
  - PMTiles basemaps
  - fonts, icons and the overlay library

  Set lifecycle rules, for example: finals deleted or moved to Infrequent Access after 30–90 days, and scene cache evicted after 14 days of inactivity.
- **No streaming platform is needed for MVP.** Users preview in the Remotion Player, which renders live from the scene JSON and assets, and they download the MP4. Mux or Bunny Stream only make sense later for share pages and hosted players.
- **Cheaper fallbacks:** Backblaze B2 at $6.95/TB with 3x free egress, or Bunny Storage plus CDN.

---

## 8. Cost-cutting architecture

1. **Preview before paying.** The Remotion Player previews and edits in real time in the browser. There is no server render, and it is not a billable Remotion render. Paid final renders happen only on "Export".
2. **Low-resolution drafts.** For share or approval links, render 540p at 15 fps (about 1/8 of the pixel-frames). Mark them as development renders where the terms allow.
3. **Route scenes by type** (the biggest lever):
   - Flat history-map scenes (Ollie Bye, EmperorTigerstar, MapMen look: borders, arrows, labels) use **SVG/Canvas-2D with d3-geo projections**, which is cheap on CPU.
   - Only globe, 3D terrain, extrusions and particle scenes use the WebGL/GPU path.
4. **Bake, then animate.** For slow push-ins and pans:
   - Render the basemap once as a high-resolution still (for example 4–8K).
   - Animate the camera with 2D transforms, then overlay the vector animations.
   - Per-frame map cost drops to almost zero. Most human editors work this way in After Effects.
5. **Reusable FX library.** Pre-render rain, snow, smoke, fire, fog-of-war and dust as alpha overlays (WebM VP9 alpha or PNG sequences) once, and composite them. Reserve live three.js particles for GPU scenes.
6. **Tile and asset caching:**
   - Self-host vector tiles as **PMTiles on R2** (no per-tile API fees), with a node-local disk cache in each worker.
   - Pre-warm the style, glyphs and sprites into the image.
   - Pin style versions so cached scenes stay valid.
7. **Scene-hash render cache.** This makes per-scene regeneration cheap (section 4.3).
8. **Encoding settings:**
   - x264 veryfast/faster at CRF 17–20 on CPU, NVENC on GPU.
   - 1080p30 by default. 60 fps (2x) and 4K (about 4x) as paid tiers. 4K uploads earn YouTube's higher-bitrate VP9/AV1 encodes, which looks better even when viewed at 1080p.
9. **Quotas and abuse control.** Set per-plan render-minute quotas, a concurrency cap per user, and render-time watchdogs. Kill frames that wait on `idle` too long and log the frame.

---

## 9. Recommendation

### MVP (first launch to about 2–5k finished minutes per month)
- **Engine:** Remotion 4.x with a library of typed scene components (map camera, borders, arrows, callouts, captions, FX). Use MapLibre GL JS with PMTiles for maps, d3-geo/SVG for flat styles, and `@remotion/three` for particles. Use the Player in the web app.
- **Rendering**, decided by the spike:
  - **If** a representative 3D map scene costs **≤ about 2–3 vCPU-s per frame on swangle (or llvmpipe)**, use **Remotion Lambda (Arm, CPU)** for all finals. It needs no orchestration to build, scales to zero, renders fast through parallelism, and costs **≤ about $0.13 per minute**.
  - **Otherwise**, build the **self-hosted render worker** now. It is one Docker image: Chrome for Testing, NVIDIA/Vulkan-ready, `renderMedia({frameRange})` per chunk, then `combineChunks()`. Run it on **EC2 g6/g4dn** (Remotion's documented GPU path) behind a queue, or on Cloud Run Jobs with L4 if your spike proves Chrome WebGL works there.
- **Storage:** Cloudflare R2.
- **License:** the Free License while the company has 3 or fewer employees. Budget $100/month minimum (Automators) from the 4th hire.

### Scale
- A **GPU baseline pool** sized to steady load, either:
  - Hetzner GEX44 or similar dedicated boxes, about €184–234/month each, the cheapest per frame when busy; or
  - EC2 g6f/g4dn reserved or spot.
- **Bursting** to Cloud Run L4 jobs, Modal, or Lambda on CPU for 2D scenes.
- **Scene-level cache, chunked parallelism and priority queues:** paid users first, and Shorts before long-form.
- **Negotiate a Remotion Enterprise or flat deal** once render counts reach the hundreds of thousands per month, or if per-chunk counting applies.
- **Keep HyperFrames (Apache-2.0) or a DIY Playwright renderer as a hedge.** The scene components are React/HTML, and a port is feasible as long as you avoid Remotion-only APIs in core scene logic.

---

## 10. Spike checklist

These are the numbers needed to finalize the cost model:
- Frame time for 1080p MapLibre scenes, flat 2.5D and globe + terrain, under:
  - swangle
  - `--use-angle=gl` (llvmpipe)
  - a GPU (`angle-egl`/`vulkan`)
- Tile warm-up time per chunk.
- Encode time.
- Peak RAM per Chrome tab.
- Whether a Cloud Run L4 container exposes Vulkan/EGL to Chrome.
- Whether g6f fractional GPUs work with Chrome WebGL.


## KEY RECOMMENDATIONS
- Use Remotion as the core engine: its terms explicitly allow AI prompt-to-video SaaS, it is free while the company has 3 or fewer employees and $0.01/render ($100/month minimum) after, and its Player gives free real-time in-browser previews.
- Render maps with MapLibre GL JS (BSD-3) driven per frame (jumpTo + delayRender until 'idle', fadeDuration 0) rather than Mapbox GL, so there are no proprietary license or per-load fees and output is deterministic for chunked rendering.
- Route each scene by type: SVG/Canvas-2D (d3-geo) for flat history-map styles and WebGL/GPU only for globe, terrain and particles, because 3D WebGL on CPU can cost 10-30x more per frame.
- Use 'bake then animate' for most camera moves (render the basemap once as a high-resolution still, then animate transforms and overlays), because it drops per-frame map cost close to zero.
- Pre-render a reusable library of alpha FX overlays (rain, snow, smoke, fire, fog-of-war) instead of simulating them live per video, because it is a one-time cost reused across all users.
- Let the spike decide MVP infrastructure: if a representative 3D map scene is 2-3 vCPU-s/frame or less on swangle/llvmpipe, ship on Remotion Lambda (Arm, CPU, under ~$0.13/min, no orchestration to build); otherwise build the GPU render worker from day one.
- Build one Docker render worker (Chrome for Testing, NVIDIA/Vulkan-ready, renderMedia with frameRange, then combineChunks), because the same image serves local dev, CPU fleets and GPU fleets, and fails fast if WebGL is not on the GPU.
- At scale, run a steady GPU baseline (Hetzner GEX44 or EC2 g6f/g4dn reserved or spot, about $0.005-0.015/min at good utilization) and burst to Cloud Run L4 jobs, Modal or Lambda, because baseline boxes are 3-10x cheaper per frame when kept busy.
- Store everything in Cloudflare R2 (assets, PMTiles, scene cache, finals) with lifecycle rules, because egress is free and storage is about $0.001 per finished minute-month.
- Skip Mux and Bunny Stream for MVP: previews run in the Remotion Player and users download MP4s, so no streaming infrastructure is needed.
- Add a scene-hash render cache with per-scene segments and FFmpeg concat plus one audio re-mux, so editing one scene re-renders only that scene.
- Use x264 veryfast/faster at CRF 17-20 on CPU and NVENC on GPU at 1080p30 by default, with 60 fps and 4K as paid tiers, because encoding is then under 10% of render cost and the price scales with pixel-frames.
- Do not use Shotstack, Creatomate, JSON2Video or Plainly: they cost $0.19-1.38/min (10-100x self-hosting) and cannot run custom WebGL map code.
- Keep HyperFrames (Apache-2.0) or a DIY Playwright+FFmpeg renderer as a license hedge by keeping scene logic in plain React/HTML, and avoid GSAP in scenes because of its no-code-tool license restriction.
- Get written confirmation from Remotion on how self-hosted chunked or per-scene renders are counted (1 per video vs 1 per renderMedia call) before designing scene caching around it.

## COST ITEMS
- Remotion for Automators (Company License, 4+ employees): $0.01 / per successful render, billed in blocks of 1,000 ($10), $100/month minimum (Free License (<=3 employees) may build automations without buying renders. The v5.0 terms are marked 'upcoming'; the current v4 terms are at remotion.pro/terms-4-0 (not fetched). Player previews are not renders.) https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/terms.mdx
- Remotion for Creators seat: $25 / per seat per month (Not needed for developers working on automations.) https://www.remotion.dev/docs/license/faq
- Remotion Enterprise License: $500 / per month minimum (Custom terms; a fit for negotiating a flat per-chunk or volume deal.) https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/terms.mdx
- Remotion Editor Starter template: ~$600 (UNVERIFIED) / one-time purchase (Docs confirm a one-time purchase for free-license users; the price was not verifiable because remotion.pro was blocked.) https://www.remotion.dev/docs/editor-starter
- Remotion Lambda example: 1-minute video (simple composition): $0.017 / per render (warm, 2048 MB, us-east-1) (Non-WebGL lower bound; a 10-minute HD video was $0.103.) https://www.remotion.dev/docs/lambda/cost-example
- AWS Lambda compute, Arm: $0.0000133334 / per GB-second (tier 1, first 7.5B GB-s/month) (About $0.0000236 per effective vCPU-second (1,769 MB = 1 vCPU). Free tier 400k GB-s per month.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json
- AWS Lambda compute, x86: $0.0000166667 / per GB-second (tier 1) (Requests $0.20 per million.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json
- EC2 c7g.4xlarge (16 vCPU Graviton3), on-demand: $0.58 / per hour, us-east-1 Linux (c8g.4xlarge $0.638, c7i.4xlarge $0.714, c7a.4xlarge $0.821 per hour.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g4dn.xlarge (NVIDIA T4 16 GB, 4 vCPU, 16 GiB), on-demand: $0.526 / per hour, us-east-1 Linux (Remotion's documented GPU instance; g4dn.2xlarge $0.752/h.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g6.xlarge (NVIDIA L4 24 GB, 4 vCPU, 16 GiB), on-demand: $0.8048 / per hour, us-east-1 Linux (g6.2xlarge $0.9776/h.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g6f.xlarge (fractional L4, 3 GB GPU memory, 4 vCPU, 16 GiB), on-demand: $0.2375 / per hour, us-east-1 Linux (Cheapest NVIDIA GPU box found; Chrome WebGL/Vulkan compatibility is unvalidated.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g5.xlarge (A10G), on-demand: $1.006 / per hour, us-east-1 Linux (Likely overkill for map rendering.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- GCP Cloud Run CPU (instance-based billing / Jobs, Tier 1): $0.000018 / per vCPU-second (Memory $0.000002/GiB-s. Jobs are billed for the instance lifetime with a 1-minute minimum. Free 240k vCPU-s and 450k GiB-s per month.) https://cloud.google.com/run/pricing
- GCP Cloud Run NVIDIA L4 GPU (non-zonal redundancy): $0.0001867 / per second (~$0.67/h GPU only) (Zonal redundancy $0.0002909/s. With 4 vCPU and 16 GiB, about $1.05/h in total. RTX PRO 6000 $0.00036522/s.) https://cloud.google.com/run/pricing
- GCP Cloud Run Delayed Jobs CPU: $0.0000126 / per vCPU-second (Memory $0.0000014/GiB-s; dynamic prices that can change every 30 days; suits non-urgent long-form renders.) https://cloud.google.com/run/pricing
- GCP Cloud Run request-based CPU (services): $0.000024 / per vCPU-second active (Memory $0.0000025/GiB-s; $0.40 per million requests.) https://cloud.google.com/run/pricing
- Modal CPU: $0.0000131 / per physical core-second (2 vCPU) (SNIPPET (page blocked). Memory $0.00000222/GiB-s; region multiplier 1.25-2.5x and a non-preemptible surcharge.) https://modal.com/pricing
- Modal NVIDIA L4: $0.000222 / per second (~$0.80/h) (SNIPPET. T4 $0.000164/s, A10 $0.000306/s.) https://modal.com/pricing
- RunPod L4 pod: $0.44-0.49 / per hour (community / secure) (SNIPPET. RTX A4000 $0.17-0.25/h; serverless flex 16 GB tier about $0.00016/s. Community cloud consumer GPUs carry an NVIDIA EULA risk.) https://www.runpod.io/pricing
- Hetzner Cloud CCX33 (8 dedicated vCPU): EUR 138.49 / per month (EU, new orders after 2026-06-15) (SNIPPET via wz-it.com, webhosting.today and northflank; was EUR 62.49. CCX43 EUR 275.99. US CCX33 $165.99.) https://www.hetzner.com/cloud/
- Hetzner GEX44 dedicated GPU server (RTX 4000 SFF Ada 20 GB): EUR 184 (possibly EUR 234 as of Aug 2026) + EUR 79 setup / per month (SNIPPET, conflicting sources; verify. Unmetered 1 Gbit/s; EU locations.) https://www.hetzner.com/dedicated-rootserver/matrix-gpu/
- Cloudflare R2 Standard storage: $0.015 / per GB-month (Egress free. Class A $4.50/M, Class B $0.36/M. Infrequent Access $0.01/GB-month + $0.01/GB retrieval. Free 10 GB.) https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/pricing.mdx
- Backblaze B2 storage: $6.95 / per TB-month (SNIPPET. Free egress up to 3x stored, then $0.01/GB.) https://www.backblaze.com/cloud-storage/pricing
- Bunny Stream / CDN: $0.005-0.01 storage; $0.01 delivery / per GB-month storage; per GB delivered (EU/US) (SNIPPET. Asia $0.03/GB, South America $0.045/GB; H.264 encoding free; $1/month minimum.) https://bunny.net/pricing/
- Mux video: ~$0.0024-0.003 storage; ~$0.0008 delivery / per minute-month stored; per minute delivered after 100k free minutes (SNIPPET. Not needed for MVP.) https://www.mux.com/docs/pricing/overview
- Shotstack render API: $0.20-0.30 / per rendered minute (subscription from $39/month, or pay-as-you-go) (SNIPPET. Cannot run custom WebGL maps.) https://shotstack.io/pricing/
- Creatomate render API: $54 / $129 / $249-299 / per month for 2k / 10k / 50k credits (~31 credits per 1080p minute = $0.19-0.84/min) (SNIPPET.) https://creatomate.com/pricing
- JSON2Video render API: $16.95 / $49.95 / $99.95 / per month for 3k / 12k / 30k credits (1 credit = 1 s FHD, ~$0.20-0.34/min) (SNIPPET.) https://web.json2video.com/pricing/
- Plainly (After Effects template rendering): $69 (50 min) to $649 (600 min); $1,500 unlimited / per month (SNIPPET. About $1.08-1.38/min.) https://www.plainlyvideos.com/pricing
- ESTIMATE: CPU render, 2.5D map (1 vCPU-s/frame), Lambda Arm: ~$0.042 (+20-40% overhead) / per finished 1080p30 minute (Model: 1,800 frames x vCPU-s/frame x $/vCPU-s. 3 vCPU-s/frame = $0.127; 10 = $0.425.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json
- ESTIMATE: GPU render at 25 fps per box: ~$0.005-0.021 / per finished 1080p30 minute (g6f $0.005, g4dn $0.011, GEX44 $0.012-0.015, g6 $0.016, Cloud Run L4 $0.021.) https://cloud.google.com/run/pricing
- MEASURED: libx264 1080p30 CRF 18 encode on 4 vCPU (contended): veryfast 62 fps / medium 26 fps / frames per second (~0.03-0.15 vCPU-s per frame) (Measured in this container while another job loaded it to ~9; high-entropy content dropped veryfast to 11.8 fps. Encoding is under $0.01 per finished minute.) https://ffmpeg.org/

## RISKS
- Remotion license risk: it is source-available, not open source. The v5.0 terms are 'upcoming' and may change; telemetry and a license key become mandatory for Automators; the Free License ends at 4 employees (contractors in collaborations count). Self-hosted chunked or per-scene renders may each count as a $0.01 render, multiplying license cost by the number of scenes.
- CPU WebGL performance risk: headless Chrome on SwiftShader/swangle can be pathologically slow for 3D maps (one Remotion app reported 0.3-0.5 fps at 1080p). If the spike confirms this, Lambda-only rendering becomes expensive ($0.4+/min) and slow for long-form, and a GPU fleet is needed earlier.
- GPU-in-container fragility: Chrome often falls back to software rendering silently unless NVIDIA graphics capabilities, Vulkan/EGL ICDs, Chrome for Testing and the right --gl flag are all present. Remotion has not tested GPU on Cloud Run, and Cloud Run may expose only CUDA (compute), not graphics. Fractional g6f GPUs are unvalidated.
- Chrome upgrade risk: the SwiftShader WebGL fallback was removed (M139+), and future Chrome or driver changes can break rendering or change pixels. Pin Chrome versions per renderer release and run visual regression tests.
- Determinism and seams: map tiles that are not fully loaded produce blank or flickering frames; mixed GPU or driver types across chunks can cause visible seams; AAC audio priming can cause clicks at chunk boundaries if Remotion's chunking rules are not followed.
- Remotion Cloud Run integration is alpha and 'not actively developed'. Lambda has a 15-minute limit per invocation, 10 GB RAM/disk, and a 1,000 default concurrency per region (lower for new accounts), which needs quota increases.
- GSAP license: its free license prohibits use in no-code visual animation tools that compete with Webflow, so the product should avoid GSAP. That reduces the appeal of GSAP-centric HyperFrames as a drop-in alternative.
- Mapbox GL JS v2+/v3 is proprietary with per-load billing and ToS limits; using it in the render path creates licensing and cost exposure (use MapLibre plus self-hosted PMTiles).
- Provider price volatility: Hetzner raised cloud prices three times in 2026 (CCX roughly 2.2x on 2026-06-15) and GEX44 pricing is inconsistent across sources; Cloud Run Delayed Jobs prices can change every 30 days.
- Consumer GPU marketplaces (Vast.ai, RunPod community) may run GeForce cards whose NVIDIA driver EULA restricts datacenter deployment; reliability and security of untrusted hosts is also a concern for user content.
- Cost-model uncertainty: all $/minute figures depend on vCPU-s per frame or fps per GPU box, which are not yet measured for this product's scenes. Treat them as ranges until the spike reports.
- Abuse and cost blow-ups from free tiers or rapid re-renders unless per-plan quotas, concurrency caps and watchdogs are in place from day one.
- Framework maintenance risk for alternatives: Revideo had a ~15-month release gap and Motion Canvas has been stagnant since Dec 2024; HyperFrames is pre-1.0 and changes fast.

## QUESTIONS FOR FOUNDER
- How many employees or contractors will work on the product in the next 12 months? Remotion is free at 3 or fewer people, and $100/month minimum plus $0.01/render from the 4th.
- Which cloud do you prefer, and do you have startup credits (AWS Activate, Google for Startups, Cloudflare)? This decides Lambda/EC2 vs Cloud Run vs Hetzner for the first fleet.
- What volume do you expect in months 1, 6 and 12 (videos per month, average length, Shorts vs long-form mix)? This sizes whether an always-on GPU baseline box (~EUR 184-234/month or ~$384/month for g4dn) pays off.
- What render wait times are acceptable (e.g., a 60 s Short in under 2 minutes, a 10-minute video in under 10 minutes)? Faster means more parallelism and more start-up overhead.
- Is cinematic 3D (globe, 3D terrain, atmospheric effects) required at launch, or can the MVP ship with 2D/2.5D map styles and add 3D styles once the GPU pipeline is validated?
- Should 60 fps and 4K exports be paid tiers or available to everyone? Each roughly doubles or quadruples render cost.
- How long should finished videos and scene caches be stored for users (e.g., 30, 90 days, forever on paid plans)?
- What fixed monthly infrastructure budget can you carry before revenue (e.g., $0, $300 or $1,000/month)?
- May we contact Remotion to confirm in writing how chunked or per-scene self-hosted renders are counted, and to discuss Enterprise pricing later?
- Do you need EU-only data residency for any customers? That favors Hetzner or EU regions and affects provider choice.
- What is your legal risk tolerance for third-party license restrictions (e.g., GSAP's no-code-tool clause, Mapbox ToS)? Do you want a lawyer to review the Remotion, map-data and font licenses before launch?
- Do you want an in-browser export option (Remotion WebCodecs client-side rendering) for free-tier users, so the server cost is zero but the quality and browser support are more limited?