# Per-video COGS model, vendor terms matrix and margin check (research date 2026-10-01)

## 0. Bottom line

- **Why earlier areas disagreed 5-10x.** They costed different pipelines. The model has two routings:
  - **Naive** routing: Opus or Sonnet on every stage, paid web search on every video, verbose scene JSON, AI images throughout, AI music. It costs **$0.75 per 45 s Short and $4.2 per 10-min video** (Standard, no regeneration).
  - **Recommended** routing: Opus only for the script, deterministic geo lookup, compact scene format, library images first, owned music library. It costs **$0.31 per Short and $1.95 per 10-min video**. With 1.5x regeneration that becomes $0.35 and $2.22.
- **Render compute and the Remotion licence do not drive margin** when MapLibre and globe scenes render on a GPU.
  - Rendering is about $0.005 per Short and $0.06-0.13 per 10-min video.
  - The Remotion fee is $0.01-0.02 per video, provided we make one licensed render per delivered output.
  - **What drives cost:** LLM tokens (60-70% of COGS), voice, and AI images or video.
- **Area 8's plans clear 70% only at about 55% utilisation.** Blended margin at 1.5x regeneration, after Polar fees:
  - At 55% utilisation: 77% / 74% / 71% (Starter / Creator / Pro).
  - At 100% utilisation: 64% / 59% / 53%.
  - With naive routing, the Pro plan falls to 45% (55% utilisation) and 6% (100%).
- **Shorts are the weak spot.** A Standard Short costs about $0.35 but earns one credit, which is $0.66 on the Pro plan. That is 40% gross margin at full use.
- **Minimum viable price for 70% gross margin**, recommended routing, 1.5x regeneration, 100% utilisation:
  - About **$0.97 per finished minute** for Standard long-form.
  - About **$1.53 per Standard Short**.
  - Blended mix: **about $1.14 per credit**. At 55% utilisation this drops to about **$0.63 per credit**, which is roughly Area 8's grid.
- **Terms outcome.**
  - Anthropic is green.
  - Google Vertex generative AI is **conditionally usable**: §20(d) bans services "likely to be accessed by individuals under the age of 18". The product must be 18+.
  - **Grounding with Google Search is red.** Its terms ban caching, modifying or interspersing results.
  - Remotion is green on use and yellow on how renders are counted.
  - ElevenLabs could not be verified (blocked), so it stays out of the defaults.

## 1. Method, and what I could and could not verify

**Verified on live primary sources on 2026-10-01:**
- Anthropic pricing, deprecations, prompt-caching and web-search pages, plus the Commercial Terms.
- Google Vertex pricing, Cloud TTS pricing, Cloud Run pricing, the Service Specific Terms (last modified Sept 30, 2026), the Services list and the GenAI Indemnified Services list.
- The AWS Price List bulk API for EC2 (version 20260925174521) and Lambda (published 2026-09-19).
- Cloudflare R2 and Polar fee docs, from their public GitHub sources.
- The Remotion repository at commit `c320056` (2026-10-01): terms, FAQ, pricing component, licensing package and Lambda source.

**Blocked by the egress proxy, so not verified live:**
- remotion.dev and remotion.pro (including the v4 terms at remotion.pro/terms-4-0).
- elevenlabs.io, aws.amazon.com (spot prices), docs.cloud.google.com (Veo and Gemini deprecation pages), hetzner.com, stripe.com, paddle.com and ai.google.dev.
- The session's WebSearch quota was also exhausted, so I could not look for published regeneration-rate data.

**Not measured:**
- No Claude API credentials exist in this container, so token budgets are **constructed estimates**, not measurements. Section 4 explains how they were built; Section 12 gives a measurement plan.

**Model code:**
- `/tmp/claude-0/-home-user-crun/7ef9826d-a86c-53b7-8a22-34a16f78f234/scratchpad/cogs_model2.py` (the COGS model).
- `.../scratchpad/margins.py` (margins and fees).

Every table below comes from these scripts.

## 2. Verified unit prices (V = verified 2026-10-01; U = unverified)

### LLM (Anthropic), per million tokens — https://platform.claude.com/docs/en/about-claude/pricing

| Model | Input | 5-min cache write | 1-h cache write | Cache read | Output | Batch (input / output) |
|---|---|---|---|---|---|---|
| Opus 5.5 (V) | $4 | $5 | $8 | $0.20 (0.05x) | $20 | $2 / $10 |
| Sonnet 5.5 (V) | $2 | $2.50 | $4 | $0.20 | $10 | $1 / $5 |
| Haiku 4.5 (V) | $1 | $1.25 | $2 | $0.10 | $5 | $0.50 / $2.50 |

**Other Anthropic terms (V):**
- **Server tools:** web search costs $10 per 1,000 searches; web fetch has no extra charge beyond tokens.
- **Data residency:** `inference_geo: "us"` multiplies all token prices by 1.1x.
- **Tokenizer:** Claude 4.7 and later models produce "approximately 30% more tokens" for the same text.
- **Minimum cacheable prefix:** 512 tokens for Opus 5.5 and Sonnet 5.5; 4,096 for Haiku 4.5 (https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
- **Cache scope:** caches are isolated per workspace and are never shared across organisations.

**Haiku 4.5 retirement status (V)** — https://platform.claude.com/docs/en/about-claude/model-deprecations:
- `claude-haiku-4-5-20251001` is **Active**, with tentative retirement "Not sooner than October 15, 2026". That date is two weeks away.
- Anthropic gives at least 60 days' notice, so if Haiku 4.5 were deprecated today, the earliest retirement would be about end of November 2026.
- No Haiku successor is listed. By comparison, Opus 5.5 is safe to at least 2027-09-22 and Sonnet 5.5 to at least 2027-09-28.

### Google Vertex AI — https://cloud.google.com/vertex-ai/generative-ai/pricing and https://cloud.google.com/text-to-speech/pricing (V)

| Item | Price | Notes |
|---|---|---|
| Gemini 3.5 Flash-Lite | $0.30 in / $2.50 out per M tokens | Batch/Flex is 50% off |
| Gemini 3.1 Flash-Lite | $0.25 / $1.50 per M tokens | |
| Gemini 3.6, 3.7 and 3.8 Flash | $0.75 / $3.75 per M tokens, intro price through **2026-12-31**; $1.50 / $7.50 from 2027-01-01 | The promo is paid as "50% credits back" |
| Gemini 3.8 Flash TTS (**Preview**) | $0.50 text in / **$9** audio out per M tokens to 2026-12-31; **$1 / $18 from 2027-01-01** | 25 audio tokens per second, so list price is **$0.0276/min** and promo is $0.0138/min |
| Gemini 3.8 Flash-Lite TTS (Preview) | $1 / $12 per M tokens list ($0.50 / $6 promo) | $0.018/min list |
| Gemini 2.5 Flash TTS (not marked Preview) | $0.50 / $10 per M tokens | **$0.0153/min** |
| Chirp 3 HD | $30 per million characters; first 1M characters per month free | About 915 characters per minute (E), so **$0.0275/min** |
| Imagen 4 Fast / Standard / Ultra | $0.02 / $0.04 / $0.06 per image | |
| Nano Banana 2 (Gemini 3.1 Flash Image) | $0.045 (512 px) / **$0.067 (1K)** / $0.101 (2K) / $0.15 (4K) | $60 per M output tokens |
| Nano Banana 2 Lite | $0.034 per 1K image | |
| Nano Banana Pro (Gemini 3 Pro Image) | $0.134 (1K or 2K) / $0.24 (4K) | |
| Veo 3.1 Lite | 720p $0.03/s video-only, $0.05/s with audio; 1080p **$0.05/s**, $0.08/s with audio | Unit is "/1 count", which is per second |
| Veo 3.1 Fast | 1080p $0.10/s video-only, $0.12/s with audio; 4K $0.25 / $0.30 | |
| Veo 3.1 | 1080p $0.20/s video-only, $0.40/s with audio | |
| Gemini Omni Flash (video successor) | $17.50 per M video-output tokens; 5,792 tokens/s at 720p, 8,688 at 1080p | **$0.101/s at 720p, $0.152/s at 1080p** |
| Lyria 3 / Lyria 3 Pro | $0.04 per 30 s clip / $0.08 per full song | |
| Grounding with Google Search | 5,000 queries per month free, then $14 per 1,000 | **Red under the terms** (see Section 7) |
| Gemini 3.5 Transcribe (word timings) | $0.0051 per audio-minute (blended) | |

**Veo deprecation status:** the Veo 3.1 Fast and Veo 3.1 Lite deprecation dates are **unverified** because docs.cloud.google.com was blocked. Both are still listed on the pricing page on 2026-10-01.

### Compute, storage and payments

| Item | Price | Source |
|---|---|---|
| Lambda (arm, us-east-1) | $0.0000133334 per GB-s (tier 1); $0.20 per M requests | V, AWS Price List |
| EC2 on-demand, us-east-1, Linux | g4dn.xlarge (T4) **$0.526/h**; g6.xlarge (L4) **$0.8048/h**; g6f.large (1/8 L4) $0.202/h; **g6f.xlarge (1/8 L4, 4 vCPU) $0.2375/h**; c8g.2xlarge $0.31904/h; c7g.2xlarge $0.29/h | V, AWS Price List CSV v20260925174521 |
| EC2 spot | Not verifiable (spot feed blocked) | Modelled as 60-65% off on-demand (E) |
| Cloud Run, us-central1, Tier 1 | Services and jobs: CPU $0.000018 per vCPU-s, memory $0.000002 per GiB-s. **Worker pools:** CPU $0.000011244 per vCPU-s, memory $0.000001235 per GiB-s. **L4 GPU $0.0001867/s** (non-zonal). Jobs and instance-based billing have a **1-minute minimum** | V, https://cloud.google.com/run/pricing |
| Hetzner GEX44 | About €184/month plus setup fee (last known) | U, blocked |
| Cloudflare R2 Standard | $0.015 per GB-month; Class A $4.50 per M; Class B $0.36 per M; free egress | V, cloudflare-docs `r2/pricing.mdx` |
| Polar | Starter **5% + 50¢**; Pro $20/month with 3.8% + 40¢; Growth $100/month with 3.6% + 35¢; Scale $400/month with 3.4% + 30¢; **+1.5% for non-US cards**; fees apply **to the VAT-inclusive total** (Polar's own worked example uses $37.50 including VAT) | V, polarsource/polar `docs/merchant-of-record/fees.mdx` |
| Paddle | 5% + 50¢ on the total | U, blocked |
| Stripe | 2.9% + 30¢, plus 0.7% Billing, 0.5% Tax, 1.5% international | U, blocked |
| Remotion | Automators **$0.01 per render, charged in 1,000-render ($10) increments, $100/month minimum**; Creators $25 per seat per month; Enterprise from $500/month | V, Remotion repo `terms.mdx` and `FreePricing.tsx` |

**ElevenLabs:** all pages (pricing, API pricing, terms, help center) were blocked, so **nothing is verified**. ElevenLabs is left out of the default routing.

## 3. Reference videos and render inputs

| ID | Video | Length / format | Words (~155 wpm) | Scenes | Frames at 30 fps | Render class |
|---|---|---|---|---|---|---|
| a | Flat/2D Short | 45 s, 9:16 1080x1920 | 115 | 10 | 1,350 | A (CPU) |
| b | TikTok cut | 75 s, 9:16 | 195 | 16 | 2,250 | 70% A + 30% B |
| c | 2.5D MapLibre long-form | 10 min, 16:9 1080p | 1,550 | 90 | 18,000 | B (GPU) |
| d | Globe/terrain long-form with 3-6 AI hero clips (24 s total) | 10 min, 16:9 | 1,550 | 90 | 18,000 | 85% C + 15% B, plus AI video |

**Per-frame inputs for the WebGL spike to fill.** Each is the cost of one 1080p frame including encoding:

| Class | Midpoint used | Range |
|---|---|---|
| A, 2D on CPU | 0.25 vCPU-s | 0.10-0.50 |
| B, MapLibre on CPU via SwiftShader | 1.5 vCPU-s | 0.5-3.0 |
| B, MapLibre on a GPU instance | 0.04 instance-s | 0.02-0.10 |
| C, globe/terrain on a GPU instance | 0.08 instance-s | 0.03-0.20 |

**Scaling assumptions:**
- Render time scales linearly with pixels on CPU, and by pixels^0.9 on GPU: 1440p is 1.78x the pixels of 1080p, 4K is 4x.
- A 1.25x overhead covers browser start, idle tails and retries.

## 4. Token budgets: estimates, not measurements

**How they were built:**
- Narration words are converted to tokens at about 1.75 tokens per word, which reflects the newer tokenizer's roughly 30% uplift.
- The scene plan is a structured JSON scene list (storyboard), with each scene's camera keyframes, map layers, labels and asset references:
  - Naive format: about 350 tokens per scene.
  - Recommended compact format: 170-200 tokens per scene.
- Thinking tokens are billed as output.
  - Opus 5.5 cannot turn thinking off. Its default effort is `medium`.
  - Sonnet 5.5 can run with thinking off via `between_tools`, which applies at effort `high` or lower.
- Stable system prompts (style bible, schema, few-shot examples) are cache reads at $0.20/M.

**First-pass tokens per video, recommended Standard routing:**

| Stage | Model | Short (a): uncached in / cache read / out / think | 10-min (c): uncached in / cache read / out / think / searches |
|---|---|---|---|
| Research | Sonnet 5.5 | 8.0k / 0 / 1.2k / 1.75k, Wikipedia via our backend, no paid search | 40k / 30k / 6k / 7k / 5 searches |
| Script (hooks, draft, punch-up) | **Opus 5.5** | 5k / 12k / 1.2k / 2.1k | 25k / 120k / 9k / 10.5k |
| Storyboard (compact format) | Sonnet 5.5 | 3k / 9k / 1.8k / 2.1k | 24k / 60k / 16.2k / 12.6k |
| Geo and asset resolution | Haiku 4.5 (Sonnet as fallback) | 2.5k / 5k / 0.6k / 0 | 15k / 30k / 3.6k / 0 |
| Visual QA on keyframes (~1,100 tokens per still) | Sonnet 5.5 | 3 stills: 6.3k / 3k / 0.8k / 1.05k | 15 stills: 21.5k / 5k / 3k / 2.1k |
| Metadata (merged into storyboard) | Sonnet 5.5 | 0.7k out | 1.5k out |
| **Total** | | **≈25k / 29k / 6.3k / 7.0k** | **≈126k / 245k / 39k / 32k / 5** |
| **LLM cost** | | **$0.226** | **$1.27** |

**Worked check for the 10-min script stage:**
- Uncached input: 25,000 × $4/M = $0.100.
- Cache reads: 120,000 × $0.20/M = $0.024.
- Output plus thinking: (9,000 + 10,500) × $20/M = $0.390.
- Total: **$0.514**.

**Uncertainty:** ±50% on tokens moves a Standard Short from $0.23 to $0.48, and a 10-min video from $1.51 to $2.92 (both at 1.5x regeneration).

**Regeneration and re-roll data:** I found no competitor or industry figures, so the model uses 1.0x, 1.5x, 2x and 3x scenarios.
- Each extra iteration re-runs only part of the work (scene-level edits): script 25%, storyboard 30%, voice 30%, images 50%, AI video 60%, render 35%, Remotion fee 100%, research 0%.
- AI images also have a fixed 1.5x re-roll and AI video a 2x re-roll.

## 5. Cost per stage, recommended routing, regeneration 1.5x (USD per finished video)

| Video | Tier | LLM | Voice | Images | AI video | Music | Render | Remotion | Storage + orchestration | **Total** | $ per finished min |
|---|---|---|---|---|---|---|---|---|---|---|---|
| a | budget | 0.089 | 0.020 | 0 | 0 | 0 | 0.002 | 0.015 | 0.013 | **0.14** | 0.19 |
| a | standard | 0.249 | 0.032 | 0.037 | 0 | 0 | 0.005 | 0.015 | 0.013 | **0.35** | 0.47 |
| a | premium | 0.640 | 0.032 | 0.377 | 0 | 0.132 | 0.005 | 0.015 | 0.013 | **1.21** | 1.62 |
| b | budget | 0.109 | 0.033 | 0 | 0 | 0 | 0.005 | 0.015 | 0.016 | **0.18** | 0.14 |
| b | standard | 0.326 | 0.053 | 0.037 | 0 | 0 | 0.009 | 0.015 | 0.016 | **0.46** | 0.37 |
| b | premium | 0.816 | 0.053 | 0.377 | 0 | 0.132 | 0.012 | 0.015 | 0.016 | **1.42** | 1.14 |
| c | budget | 0.445 | 0.261 | 0 | 0 | 0 | 0.054 | 0.015 | 0.076 | **0.85** | 0.085 |
| c | standard | 1.409 | 0.424 | 0.225 | 0 | 0 | 0.070 | 0.015 | 0.076 | **2.22** | 0.222 |
| c | premium | 3.309 | 0.424 | 2.513 | 0 | 0.528 | 0.155 | 0.015 | 0.076 | **7.02** | 0.702 |
| d | budget | 0.445 | 0.261 | 0 | 0 | 0 | 0.100 | 0.015 | 0.076 | **0.90** | 0.090 |
| d | standard | 1.409 | 0.424 | 0.225 | 0 | 0 | 0.129 | 0.015 | 0.076 | **2.28** | 0.228 |
| d | premium | 3.309 | 0.424 | 2.513 | **3.120** | 0.528 | 0.286 | 0.015 | 0.076 | **10.27** | 1.03 |

**Sensitivity to regeneration** (total per video at 1.0x / 1.5x / 2x / 3x):

| Video and tier | 1.0x | 1.5x | 2x | 3x |
|---|---|---|---|---|
| a, standard | 0.31 | 0.35 | 0.40 | 0.48 |
| b, standard | 0.40 | 0.46 | 0.51 | 0.63 |
| c, standard | 1.95 | 2.22 | 2.48 | 3.02 |
| d, standard | 2.00 | 2.28 | 2.55 | 3.10 |
| c, budget | 0.74 | 0.85 | 0.96 | 1.17 |
| d, premium | 8.60 | 10.27 | 11.94 | 15.28 |

**Naive routing for comparison** (regeneration 1.0x; budget / standard / premium):
- a: $0.25 / $0.75 / $1.93
- c: $1.32 / $4.19 / $11.28
- d: $1.37 / $4.24 / $13.87

**How this reconciles the earlier areas:**
- **Area 8 ($0.25-0.45 per Short)** matches the recommended Standard Short ($0.31-0.35).
- **Area 5 ($0.52 of LLM per Short)** matches naive routing, which uses Opus or Sonnet everywhere, paid search on every video and verbose JSON.
- **Area 7 ($0.9-2.2 for Standard visuals)** assumes AI images throughout. Library-first visuals cost $0.04 per Short and $0.23 per 10-min video.

**Render sensitivity** (render dollars only, Standard tier):

| Video | 24 fps 1080p | 30 fps 1080p | 30 fps 1440p | 30 fps 4K | 60 fps 4K |
|---|---|---|---|---|---|
| a | 0.004 | 0.005 | 0.008 | 0.019 | 0.037 |
| c | 0.048 | 0.059 | 0.100 | 0.207 | 0.414 |
| d | 0.088 | 0.110 | 0.185 | 0.382 | 0.765 |

**Render path matters more than resolution** (10-min MapLibre video c):

| Path | Range per video |
|---|---|
| CPU via SwiftShader, 0.5-3 vCPU-s per frame | c8g spot $0.05-0.30; c8g on-demand $0.12-0.75; Cloud Run worker pool $0.15-0.93; **Lambda arm $0.26-1.53** |
| GPU, 0.02-0.10 instance-s per frame | g6f.xlarge **$0.03-0.15**; g4dn.xlarge $0.07-0.33; g6.xlarge $0.10-0.50; Cloud Run L4 worker pool $0.11-0.57 |

The extremes span $0.003-0.15 per minute at 1080p30. A 4K60 globe on Cloud Run L4 can reach about $0.8 per minute. That explains the $0.01-0.43 per minute disagreement in the earlier areas.

**Other sensitivities:**
- **Voice (video c, Standard):** Gemini 2.5 Flash TTS $0.18; 3.8 Flash TTS at promo price $0.16; 3.8 Flash TTS at 2027 list price $0.32; Chirp 3 HD $0.32.
- **AI video vendor (video d, Premium):** Veo 3.1 Lite 1080p is $3.12 of $10.27. Switching to Veo 3.1 Fast raises the total to $13.39; Omni Flash 720p raises it to $13.47. A deprecation of Veo 3.1 Lite therefore adds about 30% to Premium globe videos.

## 6. Remotion: how renders are counted

**Sources (V):** Remotion repo at `c320056`, files `packages/docs/docs/terms.mdx` (v5, marked "Upcoming document"), `docs/license/faq.mdx`, `licensing/register-usage-event.mdx`, `serverless/src/handlers/{renderer,launch,still}.ts` and `renderer/src/render-media.ts`.
- **v4 terms (currently in force) were not readable:** remotion.pro was blocked.
- **Render definition (v5 terms):** "One render means outputting a video, an audio file, a still image, or an image sequence ... Only successful renders count."
- **Render definition (current FAQ):** "1 render is the successful generation of a video, audio, GIF, still image or PDF. Previews in the Remotion Studio or Remotion Player do not count as Renders."
- **Prompt-to-video use:** explicitly allowed, including letting users edit AI-generated code. Letting users **upload their own Remotion code is not allowed.**

| Case | Finding | Status |
|---|---|---|
| Lambda chunk renders | `renderer.ts` L366-367 passes `licenseKey: null` with the comment "Not doing telemetry for the individual chunks". `launch.ts` L864 sends **one** `cloud-render` event per `renderMediaOnLambda`. Billable: **1 per video** | Green |
| Self-orchestrated chunk renders (`renderMedia` called with `frameRange`) | Each `renderMedia()` call that has a key registers an event (`render-media.ts` L866-876). Read literally, every chunk "outputs a video", so N chunks = N renders. Remotion's own Lambda shows the intended pattern (one event per final output). **Written confirmation needed** before mirroring it | Yellow |
| Per-scene cached renders (scene clips stitched with ffmpeg) | Each clip is a successful video output, so it is likely billable. 90 scenes = **$0.90** per 10-min first render | Yellow/red. Cache assets and frames, not scene clips |
| `renderStill` thumbnails | Billable: `still.ts` L369 sends `isStill: true` | $0.01 each |
| `renderStill` for automated QA | "Successful renders produced for internal tooling, internal workflows ... count toward chargeable" unless classified as development. Pipeline QA is not development | Billable. Extract QA stills with ffmpeg instead |
| `renderMediaOnWeb` drafts | Client-side renders are $0.01 each. Telemetry "cannot be disabled". Only `localhost` and similar hosts count as development | Billable |
| `<Player>` previews | Not a render. For Company License users, Player embedding counts as automation and falls under Automators (the $100/month minimum) | Free per preview |
| Contractors and headcount | Free License covers up to 3 people. Aggregation "equally extends to ... part-time employees or ... independent contractors". The FAQ says freelancers who help operate Remotion aggregate. Free License users "may build automations without purchasing Renders" | **Contractors count** |

**Licence cost per 10-min video by design choice:**

| Design | Licence cost |
|---|---|
| 1 final render | $0.01 |
| Plus a thumbnail still | $0.02 |
| Plus 3 web drafts | $0.05 |
| Plus 20 counted chunks | $0.25 |
| Plus 40 QA stills | $0.65 |
| Per-scene clips (90) plus final and thumbnail | $0.92 |
| All of the above | **$1.52** |

**Model default:** 1 render, plus re-renders after regeneration.

**Draft email to Remotion (hi@remotion.dev):**

> Subject: Licensing clarification — automated prompt-to-video SaaS (Remotion for Automators)
>
> Hi Remotion team — we are building a SaaS that generates map-animation videos from a user's topic. Our service writes the Remotion code with AI; users edit only parameters or AI-generated code and never upload their own Remotion projects. Before we finalise our architecture we'd like written answers on render counting:
> 1. **Chunking:** if our own workers split one final video into N `renderMedia()` frame-range chunks and concatenate them (the way `@remotion/serverless` does), may we, like `renderer.ts`, omit the licence key on chunk calls and register exactly one `cloud-render` event per delivered video? Is that 1 render or N?
> 2. **Scene caching:** if we render scenes as separate clips so that an edit re-renders only the changed scenes, is each intermediate clip that is never delivered as-is a billable render?
> 3. **Stills:** we assume thumbnails delivered to users via `renderStill()` are billable. Are automated QA stills that are never delivered billable, or may they be flagged `isProduction:false`? If billable, is extracting frames with ffmpeg from an already-licensed render acceptable?
> 4. **Drafts:** are low-resolution `renderMediaOnWeb()` drafts on our production domain billed at $0.01 each? Does `<Player>` preview in our editor fall entirely under the Automators minimum?
> 5. **Headcount:** do part-time contractors who never touch Remotion code (designers, marketers) count toward the 3-person Free License limit? Does the 4+ threshold refer to total company headcount, or only to personnel operating the Remotion Software?
> 6. **Terms version:** which of these answers differ under the current v4 terms (remotion.pro/terms-4-0) versus the upcoming v5 terms? When do the v5 terms take effect?
> 7. **Pricing assurance:** can you give us written pricing assurance ($0.01 per render, $100/month minimum) for 24 months, as the terms allow?
>
> Thank you!

## 7. Vendor terms matrix

G = green, Y = yellow (usable with a documented mitigation), R = red (do not use as-is).

| Vendor / service | Use in SaaS where end users monetize outputs | Age restriction | Caching, storing or sharing outputs across users | Vendor training on our data / our use of outputs for training | Indemnity scope | Music or redistribution rights | **Overall** |
|---|---|---|---|---|---|---|---|
| Anthropic Claude API (Opus/Sonnet 5.5) | **G**: may "power products and services Customer makes available to its own customers and end users" | **G**: no age clause in the Commercial Terms | **G**: customer owns outputs. Web search: `encrypted_content` must be passed back unchanged, and "citations must be included" when outputs are shown directly to users (so put sources in the video description) | **G**: "Anthropic may not train models on Customer Content" | **Y**: IP indemnity for paid use; excludes combining Services with non-Anthropic technology, modifications and trademark claims | n/a | **Green** |
| Claude Haiku 4.5 | G | G | G | G | Y | n/a | **Yellow** (retirement window; keep Sonnet fallback) |
| Google Vertex GA models (Gemini text, Imagen 4, Veo 3.1, Nano Banana) | G | **R → G only if the product is 18+**: §20(d) bans services "likely to be accessed by individuals under the age of 18" | **G**: Generated Output is Customer Data. §20(b) notes outputs may repeat across customers | **G** (§18: Google won't train on Customer Data). **Y** (§17(b): we may not use outputs to build models similar to Google's) | **G** for GA Gemini/Imagen/Veo, excluding trademark claims and outputs we knew infringed | n/a | **Green, if 18+** |
| Gemini 3.8 Flash TTS (Preview), Gemini 3.1 Pro Preview | G | R → G if 18+ | G | G / Y | **Y**: not GA, so not on the indemnified list; pre-GA terms apply | n/a | **Yellow** |
| Cloud TTS (Chirp 3 HD, Gemini 2.5 Flash TTS) | G | **Y**: §20 also covers "any Generally Available generative AI features of a Service" | G | G | **Y**: Text-to-Speech is not on the indemnified list | n/a | **Green, if 18+** |
| Lyria 3 / 3 Pro | G | R → G if 18+ | G (Customer Data) | G / Y | **Y**: not on the indemnified list | **Y**: no exclusivity; similar output possible | **Green, if 18+** (curated library preferred) |
| **Grounding with Google Search** | **R**: results only to the user who prompted, with Search Suggestions | R (if not 18+) | **R**: "will not ... cache"; "will not modify, or intersperse any other content with" Grounded Results | R: no analyzing or training | G (listed) | n/a | **Red** |
| ElevenLabs (TTS, Music, SFX) | U | U | U | U | U | Brief flags self-serve vs Enterprise music-library rights; **not verifiable** (blocked) | **Yellow/Red, unverified**; excluded from defaults |
| Remotion | **G**: prompt-to-video and AI-generated code allowed; user-uploaded code banned | n/a | **G**: "does not pose any restrictions on media generated" | n/a | **Y**: software "as is", no indemnity | n/a | **Green** (render counting yellow) |
| AWS EC2/Lambda, GCP Cloud Run, Cloudflare R2 | G | n/a | G | n/a | Standard | n/a | **Green** |
| Hetzner GEX44 | G (U) | n/a | G | n/a | n/a | n/a | **Green (unverified)** |
| Polar (merchant of record) | G (fees verified; acceptable-use policy for AI products not checked) | — | — | — | — | — | **Green / Yellow** |
| Paddle, Stripe | U | — | — | — | — | — | **Unverified** |

## 8. Gross margin under Area 8's plans, after payment fees

**Assumptions:**
- **Payment fees:** Polar Starter, 5% + 50¢ on the VAT-inclusive total, +1.5% for non-US cards. Customer mix is 50% US (no VAT) and 50% EU (20% VAT, international card).
- **Fee as a share of the ex-VAT price:** Starter plan 8.1%; Creator 7.0%; Pro 6.7%; a 20-credit top-up pack 8.4%.
  - Pro-plan fee in dollars: $10.45 for a US customer, $16.02 for an EU customer.
  - **A single $1.25 top-up loses $0.56 (45%) to fees**, so sell packs.
- **Credits:**
  - 1 credit = 1 finished minute, rounded up per started minute, minimum 1 per video.
  - Premium costs 3 credits per minute; Budget 0.5 credits per minute.
  - Regeneration 1.5x, recommended routing.
- **Blended mix (share of credits):** 30% a-standard, 15% b-standard, 25% c-standard, 5% d-standard, 5% a-budget, 5% c-budget, 7.5% c-premium, 7.5% d-premium.

| Plan | Utilisation | a-std | b-std | c-std | d-std | c-budget | c-prem | d-prem | **Blended** |
|---|---|---|---|---|---|---|---|---|---|
| $29 / 30 credits | 55% | 72% | 79% | 79% | 79% | 82% | 79% | 72% | **77%** |
| $29 / 30 credits | 100% | 55% | 68% | 69% | 68% | 74% | 68% | 56% | **64%** |
| $79 / 100 credits | 55% | 68% | 77% | 78% | 77% | 81% | 77% | 69% | **74%** |
| $79 / 100 credits | 100% | 48% | 64% | 65% | 64% | 71% | 63% | 50% | **59%** |
| $199 / 300 credits | 55% | 64% | 74% | 75% | 74% | 79% | 74% | 65% | **71%** |
| $199 / 300 credits | 100% | 40% | 59% | 60% | 59% | 68% | 58% | 42% | **53%** |
| Top-up, 20 credits at $1.25 | 100% | 63% | 73% | 74% | 73% | 78% | 73% | 64% | **70%** |

**How regeneration moves the Pro plan's blended margin** (55% / 100% utilisation):

| Regeneration | Pro plan blended margin |
|---|---|
| 1.0x | 74% / 59% |
| 2x | 69% / 48% |
| 3x | 63% / 38% |

**Naive routing** at 1.5x: blended COGS is $0.58 per credit, giving the Pro plan **45% / 6%**.

## 9. Recommended default routing (vendors usable after mitigation; Google conditional on going 18+)

| Stage | Budget ("queued", Batch API) | Standard (default) | Premium |
|---|---|---|---|
| Research | Sonnet 5.5, effort low; Wikipedia and Wikidata via our backend; no paid search | Sonnet 5.5, effort medium. Shorts: Wikipedia plus `web_fetch`. Long-form: about 5 Claude web searches. **Cache research notes per topic across users** | Opus 5.5 with 4-15 searches, plus a fact-check pass |
| Script | Sonnet 5.5 | **Opus 5.5**, effort medium | Opus 5.5, effort high |
| Storyboard (compact format) | Sonnet 5.5 low | Sonnet 5.5 medium | Opus 5.5 |
| Geo resolution | Deterministic gazetteer plus Haiku 4.5 (Sonnet `between_tools` fallback) | Same | Same |
| Visual QA | Rule-based checks only | 3-15 keyframes on Sonnet, extracted with ffmpeg | 8-40 keyframes |
| Voice | Gemini 2.5 Flash TTS ($0.015/min) or Chirp 3 HD | Gemini 2.5 Flash TTS (GA) by default; 3.8 Flash TTS opt-in until GA. **Model at 2027 list prices** | 3.8 Flash TTS |
| Images | Library only (public-domain, CC0 and owned icons) | Library first, plus Imagen 4 Fast (1 per Short, 6 per 10-min) | Nano Banana 2 at 1K (3 per Short, 20 per 10-min) |
| Music and SFX | Owned or bought-out library | Owned library | Library, or Lyria 3 Pro |
| AI video | none | none | Veo 3.1 Lite 1080p video-only, at most 24 s per video, opt-in |
| Render | c8g spot (2D); g4dn spot (WebGL) | c8g (2D); **g6f.xlarge** (WebGL) | g4dn or g6 (globe) |
| Remotion | 1 render per output; previews via Player | Same | Same |
| Payments | Polar Starter, then Pro above about $1.4k per month in sales | Same | Same |

This routing reaches 70% or more blended only at about 55% utilisation (Section 8). Reaching 70% at full utilisation needs the price changes in Section 10.

## 10. Minimum viable price per finished minute

Targets 70% gross margin after 6.7% fees plus a $0.005 per-credit fixed share, recommended routing, regeneration 1.0x / **1.5x** / 2x, 100% utilisation:

| Video | Budget (per min) | Standard (per min) | Premium (per min) |
|---|---|---|---|
| a, 45 s Short | 0.71 / **0.82** / 0.93 | 1.79 / **2.04** / 2.29 (= **$1.53 per Short**) | 6.19 / 7.03 / 7.88 |
| b, 75 s | 0.55 / 0.63 / 0.71 | 1.41 / **1.60** / 1.80 | 4.39 / 4.98 / 5.58 |
| c, 10-min 2.5D | 0.33 / **0.38** / 0.42 | 0.86 / **0.97** / 1.09 | 2.68 / **3.08** / 3.48 |
| d, 10-min globe | 0.35 / 0.40 / 0.44 | 0.88 / **1.00** / 1.12 | 3.75 / **4.47** / 5.19 |

**Blended mix:** $1.14 per credit at 100% utilisation, $0.91 at 80% and $0.63 at 55%. So $199 should buy about 175, 218 or 318 credits respectively.

## 11. Fixed monthly costs (variable COGS excluded)

- **Remotion:** $0 while the team, including contractors, is 3 people or fewer. After that, $100/month minimum, which covers 10,000 renders.
- **Polar Pro:** $20/month (optional).
- **Owned music library or commission:** a one-time cost. The founder needs to supply this input.
- **GPU:**
  - On-demand or spot fleets have no fixed cost.
  - A Hetzner GEX44 costs about €184/month (unverified). At 100% use that is about $0.29/h for a full RTX 4000 Ada, compared with $0.2375/h for 1/8 of an L4 on g6f.xlarge.
- **Not costed here:** database, queue, monitoring and Cloud Run idle minimum instances.

## 12. Measurement plan to replace the estimates

1. Run 10 Short and 10 long-form topics through the real pipeline.
2. Log `usage` for every stage: input, cache read and write, output, thinking, and `server_tool_use.web_search_requests`.
3. Use `count_tokens` (free) for prompts.
4. Log every regeneration event, by stage and by scene.
5. Feed the per-frame CPU and GPU seconds from the WebGL spike into `PF` in `cogs_model2.py` and re-run `margins.py`.

## Sources (all accessed 2026-10-01)

- https://platform.claude.com/docs/en/about-claude/pricing
- https://platform.claude.com/docs/en/about-claude/model-deprecations
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
- https://www.anthropic.com/legal/commercial-terms
- https://cloud.google.com/vertex-ai/generative-ai/pricing
- https://cloud.google.com/text-to-speech/pricing
- https://cloud.google.com/terms/service-terms
- https://cloud.google.com/terms/generative-ai-indemnified-services
- https://cloud.google.com/terms/services
- https://cloud.google.com/run/pricing
- https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json
- https://raw.githubusercontent.com/cloudflare/cloudflare-docs/production/src/content/docs/r2/pricing.mdx
- https://raw.githubusercontent.com/polarsource/polar/main/docs/merchant-of-record/fees.mdx
- https://github.com/remotion-dev/remotion (commit c320056): `LICENSE.md`, `packages/docs/docs/terms.mdx`, `packages/docs/docs/license/faq.mdx`, `packages/promo-pages/src/components/homepage/FreePricing.tsx`, `packages/docs/docs/licensing/register-usage-event.mdx`, `packages/serverless/src/handlers/renderer.ts`, `launch.ts`, `still.ts`, `packages/renderer/src/render-media.ts`

## KEY RECOMMENDATIONS
- Adopt the recommended routing: Opus 5.5 only for the script, Sonnet 5.5 for research, storyboard and QA, and a deterministic gazetteer plus Haiku 4.5 (with Sonnet fallback) for geo lookup, because it cuts blended COGS from $0.58 to $0.27 per credit.
- Make the product 18+ only (in the terms plus age attestation at signup) before calling any Google generative service, because Google's Service Specific Terms §20(d) forbid use in services likely to be accessed by under-18s.
- Never use Grounding with Google Search; use Claude web search ($10 per 1,000 searches) with sources listed in the video description, and cache research notes per topic across users, because Google's §20(k) bans caching or modifying grounded results.
- Default to library-first visuals and an owned or bought-out music library, with AI images only to fill gaps (1 per Short, 6 per 10-min video at Standard), because AI images and music are the second-largest variable cost after LLM tokens.
- Use GA voices by default (Gemini 2.5 Flash TTS at $0.015/min, or Chirp 3 HD at $0.0275/min) and model every Google price at its 2027 list rate, because the 3.8 Flash TTS discount ends 2026-12-31 and that model is Preview (not indemnified).
- Render 2D on CPU (c8g, spot when possible) and MapLibre or globe scenes on fractional or entry GPUs (g6f.xlarge at $0.2375/h, g4dn.xlarge at $0.526/h); never use Lambda with software (SwiftShader) WebGL, because that path costs 5-25x more per 10-min video.
- Make exactly one Remotion render per delivered output: previews in the Player, thumbnails and QA stills extracted with ffmpeg, no per-scene clip renders. Send the drafted clarification email and get written confirmation on chunk counting, because loose designs cost up to $1.52 per 10-min video.
- Stay on the Remotion Free License while total headcount, including contractors, is 3 or fewer, because the terms aggregate contractors and Free License users may run automations without buying renders.
- Fix the plan grid: either keep Area 8's prices with no credit rollover and a monitored utilisation of 60% or less, or re-size Pro to about $199 for 220 credits, because the current grid gives only 53% blended gross margin at 100% utilisation.
- Price Standard Shorts at the equivalent of $1.0-1.5 each (for example 1.5 credits, or plans sized at about $1 per credit), because a Standard Short costs about $0.35 and the Pro plan's $0.66 credit leaves 40% margin at full use.
- Charge Premium globe and AI-hero-clip videos at 3 or more credits per minute, cap AI video at about 24 s per video behind an explicit opt-in, and keep an Omni Flash fallback priced in (+30%), because Veo 3.1 Lite alone is about 30% of Premium COGS and its deprecation date is unverified.
- Sell top-ups only in packs of $20 or more and use Polar Starter (5% + 50¢ on the VAT-inclusive total, +1.5% for non-US cards) until about $1.4k per month in sales, then Polar Pro, because a single $1.25 top-up loses 45% to fees.
- Run a Batch-API 'queued' budget tier (50% off tokens) and build model-agnostic routing with fallbacks, because Haiku 4.5's tentative retirement is 'not sooner than' 2026-10-15 and no successor is listed.
- Log per-stage token usage, regeneration events and render seconds from day one, and run a 20-topic benchmark, because all token budgets in this model are constructed estimates (±50%).

## COST ITEMS
- Claude Opus 5.5 input / output: $4 / $20 / per million tokens (Verified 2026-10-01. 5-min cache write $5, 1-h cache write $8, cache read $0.20 (0.05x). Batch $2 / $10. Thinking cannot be disabled; default effort is medium.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Sonnet 5.5 input / output: $2 / $10 / per million tokens (Verified. Cache write $2.50, cache read $0.20. Batch $1 / $5. Minimum cacheable prefix 512 tokens.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Haiku 4.5 input / output: $1 / $5 / per million tokens (Verified. Cache read $0.10; minimum cacheable prefix 4,096 tokens. Active, tentative retirement not sooner than 2026-10-15 (model-deprecations page).) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Message Batches discount: 50% off input and output / per request (Verified. Stacks with caching. Not available with fast mode.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude web search: $10 / per 1,000 searches (plus tokens) (Verified. Failed searches are not billed. Citations must be shown when outputs are displayed directly to end users.) https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
- Claude web fetch: $0 extra / tokens only (Verified. An average 10 kB page is about 2,500 tokens.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude US-only inference (inference_geo us): 1.1x / multiplier on all token prices (Verified. Only needed if data residency is required.) https://platform.claude.com/docs/en/about-claude/pricing
- Gemini 3.5 Flash-Lite: $0.30 / $2.50 / per million tokens (global) (Verified. Batch/Flex $0.15 / $1.25. Gemini 3.1 Flash-Lite is $0.25 / $1.50.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.6/3.7/3.8 Flash: $0.75 / $3.75 promo through 2026-12-31; $1.50 / $7.50 from 2027-01-01 / per million tokens (Verified. Promo is paid as 50% credits back.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.8 Flash TTS (Preview): $0.50 text in / $9 audio out promo; $1 / $18 from 2027-01-01 / per million tokens (25 audio tokens per second) (Verified. List price about $0.0276 per narration minute; promo $0.0138. Preview, so not on the indemnified list.) https://cloud.google.com/text-to-speech/pricing
- Gemini 3.8 Flash-Lite TTS (Preview): $1 / $12 list ($0.50 / $6 promo) / per million tokens (Verified. About $0.018/min at list price.) https://cloud.google.com/text-to-speech/pricing
- Gemini 2.5 Flash TTS: $0.50 / $10 / per million tokens (Verified. About $0.0153/min. Not labelled Preview.) https://cloud.google.com/text-to-speech/pricing
- Chirp 3 HD voices: $30 (first 1M characters per month free) / per million characters (Verified price. About 915 characters per minute (estimate), so about $0.0275/min.) https://cloud.google.com/text-to-speech/pricing
- Imagen 4 Fast / Imagen 4 / Imagen 4 Ultra: $0.02 / $0.04 / $0.06 / per image (Verified. GA Imagen is on Google's indemnified list.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Nano Banana 2 (Gemini 3.1 Flash Image): $0.045 (512 px) / $0.067 (1K) / $0.101 (2K) / $0.15 (4K) / per output image (Verified: $60 per million output tokens at 747/1,120/1,680/2,520 tokens per image. Nano Banana 2 Lite is $0.034 per 1K image.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Nano Banana Pro (Gemini 3 Pro Image): $0.134 (1K or 2K) / $0.24 (4K) / per output image (Verified.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Veo 3.1 Lite: $0.03 (720p) / $0.05 (1080p) video-only; $0.05 / $0.08 with audio / per second of video (Verified price. Deprecation date unverified (docs.cloud.google.com blocked).) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Veo 3.1 Fast: $0.08 (720p) / $0.10 (1080p) / $0.25 (4K) video-only / per second of video (Verified price; deprecation unverified. With audio: $0.10 / $0.12 / $0.30.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Veo 3.1: $0.20 (1080p video-only) / $0.40 with audio; $0.40 / $0.60 at 4K / per second of video (Verified.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini Omni Flash video output: $17.50 per million video tokens (= $0.034/s at 360p, $0.101/s at 720p, $0.152/s at 1080p) / per second of video (derived) (Verified: 1,931/5,792/8,688/17,376 tokens per second at 360p/720p/1080p/4K. Input $1.50 per million.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Lyria 3 / Lyria 3 Pro: $0.04 per 30 s clip / $0.08 per full song / per generation (Verified. Not on Google's GenAI indemnified list.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Grounding with Google Search: $14 (after 5,000 free per month) / per 1,000 grounding queries (Verified price, but RED under Service Terms §20(k): no caching, no modifying or interspersing results.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.5 Transcribe (word timings for captions): $0.0051 / per audio-minute (blended) (Verified. Self-hosted forced alignment is the alternative.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- AWS Lambda arm compute: $0.0000133334 / per GB-second (tier 1, us-east-1) (Verified (published 2026-09-19). Requests $0.20 per million. About $0.082 per vCPU-hour at 1.7 GB per vCPU.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json
- EC2 g4dn.xlarge (T4, 4 vCPU) on-demand: $0.526 / per hour, us-east-1 Linux (Verified, Price List v20260925174521. g4dn.2xlarge $0.752. Spot not verifiable (modelled at 65% off).) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g6.xlarge (L4, 4 vCPU) on-demand: $0.8048 / per hour, us-east-1 Linux (Verified. g6.2xlarge $0.9776.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 g6f fractional L4 on-demand: g6f.large $0.202; g6f.xlarge $0.2375; g6f.2xlarge $0.475; gr6f.4xlarge $1.066 / per hour, us-east-1 Linux (Verified. g6f.large and g6f.xlarge are 1/8 of an L4 (3 GB VRAM); effective date 2026-09-01.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- EC2 c8g.2xlarge / c7g.2xlarge (CPU) on-demand: $0.31904 / $0.29 / per hour (8 vCPU) (Verified. About $0.040 per vCPU-hour.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- Cloud Run worker pools (us-central1, Tier 1): CPU $0.000011244 per vCPU-s; memory $0.000001235 per GiB-s; L4 $0.0001867/s / per second (Verified. A 4 vCPU / 16 GiB / L4 worker is about $0.905/h.) https://cloud.google.com/run/pricing
- Cloud Run jobs and instance-based services: CPU $0.000018 per vCPU-s; memory $0.000002 per GiB-s; L4 $0.0001867/s; 1-minute minimum / per second (Verified. A 4 vCPU / 16 GiB / L4 job is about $1.05/h. Free tier 240k vCPU-s per month.) https://cloud.google.com/run/pricing
- Hetzner GEX44 (RTX 4000 SFF Ada): about €184 plus setup (last known) / per month (UNVERIFIED: hetzner.com blocked by the egress proxy.) https://www.hetzner.com/dedicated-rootserver/gex44/
- Cloudflare R2 Standard: $0.015 per GB-month; Class A $4.50 per million; Class B $0.36 per million; egress free / storage and operations (Verified from the source of developers.cloudflare.com/r2/pricing. Free tier 10 GB-month, 1M Class A, 10M Class B.) https://raw.githubusercontent.com/cloudflare/cloudflare-docs/production/src/content/docs/r2/pricing.mdx
- Remotion for Automators: $0.01 per render (charged in 1,000-render increments), $100 minimum / per render / per month (Verified in the repo (v5 terms plus FreePricing.tsx). Free while 3 or fewer people, contractors aggregated. Creators $25 per seat per month; Enterprise from $500/month.) https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/terms.mdx
- Polar merchant-of-record fees: Starter 5% + 50¢; Pro $20/month + 3.8% + 40¢; Growth $100/month + 3.6% + 35¢; Scale $400/month + 3.4% + 30¢; +1.5% non-US cards / per transaction, on the VAT-inclusive total (Verified. Organisations created before 2026-05-27 keep 4% + 40¢ (+0.5% on subscriptions).) https://raw.githubusercontent.com/polarsource/polar/main/docs/merchant-of-record/fees.mdx
- Paddle fees: 5% + 50¢ (last known) / per transaction (UNVERIFIED: paddle.com blocked.) https://www.paddle.com/pricing
- Stripe fees: 2.9% + 30¢; +0.7% Billing; +0.5% Tax; +1.5% international (last known) / per transaction (UNVERIFIED: stripe.com blocked. Not a merchant of record.) https://stripe.com/pricing
- ElevenLabs TTS / Music / SFX: not verified / per 1K characters / per minute (UNVERIFIED: elevenlabs.io and help.elevenlabs.io blocked. Excluded from the default routing.) https://elevenlabs.io/pricing/api

## RISKS
- Google age clause (§20(d)): if the product is accessible to under-18s (many TikTok and Shorts creators are teens), every Google generative service is non-compliant and Google may suspend access immediately. Mitigation is an 18+ policy with age attestation, or re-routing voice and images, which raises COGS.
- Utilisation risk: at 100% utilisation the $199/300 plan delivers only 53% blended gross margin (40% for Standard Shorts). Heavy users self-select into the largest plan, so the 55% utilisation assumption may not hold for that cohort.
- Shorts are under-priced at 1 credit: Standard Short COGS is about $0.35 at 1.5x regeneration, versus $0.66 revenue per credit on Pro.
- Regeneration behaviour is unknown: going from 1.5x to 3x drops Pro-plan blended margin from 71% to 63% at 55% utilisation, and from 53% to 38% at 100%. No industry data was found.
- Token budgets are constructed, not measured (no API credentials in the container): ±50% tokens moves a 10-min Standard video between $1.51 and $2.92.
- Remotion render-counting ambiguity: self-orchestrated chunks, per-scene clips, QA stills and web drafts could add $0.25-1.50 per 10-min video. The v5 terms are 'upcoming' and the v4 terms could not be read (remotion.pro blocked).
- Promotional prices end 2026-12-31 (Gemini 3.x Flash and 3.8 Flash TTS) and roughly double on 2027-01-01. Any plan priced on promo rates loses margin in January.
- Haiku 4.5 retirement: tentative date 'not sooner than 2026-10-15', no successor listed. Geo and extraction routes need a Sonnet 5.5 fallback (about 2x cost on that stage, small in absolute terms).
- Veo 3.1 Lite and Fast deprecation dates could not be verified. The fallback (Omni Flash 720p at $0.101/s) raises Premium globe-video COGS by about 30%.
- Indemnity gaps: Anthropic's IP indemnity excludes combinations with non-Anthropic technology and trademark claims; Google's covers only GA Gemini, Imagen and Veo (not Preview TTS, Cloud TTS or Lyria); Remotion gives no indemnity. Final composited videos have no single indemnifying party.
- Claude web search requires citations when outputs are displayed directly to end users. Videos must carry source lists, and cross-user caching of research notes should be reviewed by counsel.
- Unverified vendors: ElevenLabs (prices, music-library rights, training on data), Stripe, Paddle, Hetzner and EC2 spot prices could not be checked because of egress blocks. Do not commit to them without verification.
- Small top-up transactions: a single $1.25 top-up loses 45% to Polar's fixed fee.
- GPU fleet utilisation: on-demand GPU nodes idle between jobs. The 1.25x overhead may understate costs at low volume, especially on Cloud Run with its 1-minute minimum and on GPUs with minimum instances.

## QUESTIONS FOR FOUNDER
- How many people, including part-time contractors and freelancers who touch the codebase, will work on the product in the next 12 months? This decides whether the Remotion Free License applies ($0) or the Company License ($100/month minimum).
- Will you make the product 18+ only (terms plus age attestation, not marketed to minors)? Without that, Google's generative services (Gemini TTS, Imagen, Nano Banana, Veo, Lyria) cannot be used.
- What exactly is a credit? Is it 1 finished minute, 1 video, or 30 seconds? Do Shorts cost 1 credit? Can unused credits roll over? These choices move gross margin by 15-30 points.
- Are you willing to change Area 8's grid? For example, Pro at about $199 for 220 credits, Shorts at 1.5 credits, Premium at 3 credits per minute.
- What customer geography do you expect (US vs EU/UK share), and do you prefer a merchant of record (Polar or Paddle) or Stripe plus your own tax compliance?
- What budget do you have for a one-time music and SFX library buyout or commissioned tracks with SaaS-redistribution rights, so Standard videos have no per-video music cost?
- Will Budget-tier users accept delayed (queued) delivery, so Budget can use the Batch API (50% off tokens) and spot instances?
- Should 1440p, 4K or 60 fps be offered, and at which tiers? 4K60 raises render cost 7-8x, still small next to LLM cost but material for globe videos.
- Can you provide Anthropic and Google Cloud accounts (and an AWS account with GPU and spot quotas) so the 20-topic token benchmark and the render spike can be run against real billing?
- How much legal risk will you accept on AI voice, music and image indemnity gaps? Do you want enterprise agreements (Anthropic, Google, Remotion Enterprise from $500/month) for stronger terms?
- Do you need US-only data residency for any customers? It adds 10% to Claude token costs.
- Will you send the drafted Remotion clarification email, and do you want a 24-month written price assurance from them before launch?