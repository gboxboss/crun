# AI Map-Story Video Generator: Product & Build Plan

*Working name to be decided. Version 1, written 2026-10-01.*

**Who this is for:** the founder, and anyone joining the project later.
**What it is based on:** 9 research areas, each checked by an independent fact-checker, then a review that looked for gaps and 3 follow-up studies (cost model, historical data, visual direction), plus a hands-on rendering test. All of it is in [`docs/research/`](research/README.md) and [`spikes/webgl-render/`](../spikes/webgl-render/README.md).

**How to read it:**
- **Section 0** is a one-page summary.
- **Section 10** lists what I need from you.
- Everything in between is the detailed plan.

**Labels used:**
- **(V)** verified on a primary source on 2026-10-01.
- **(E)** estimate.
- **(M)** measured in this project.

Many vendor websites were blocked from the research container, so some prices are from dated secondary sources. Those are flagged in the research files. Re-check every price before you commit money.

---

## 0. One-page summary

**What we're building.** A web app where someone types a topic, or pastes a script, and gets a finished, narrated map-animation video in the style of the big history, geography and geopolitics channels. The video includes:
- camera flights over a globe or terrain;
- borders changing over time;
- army arrows and unit movements;
- routes drawing themselves;
- labels, flags, portraits and data overlays;
- weather and atmosphere effects;
- voice, music, sound effects and captions.

It comes in many visual styles, in vertical, horizontal and square formats, from 30-second shorts to long-form videos.

**Is it possible?** Yes. Nobody sells this today:
- Map tools only animate travel routes.
- "Faceless video" AI tools have no geographic engine. They produce stock-footage slideshows.

The research found the parts needed to build it, and the rendering test proved the hardest technical piece works cheaply.

**The five findings that shape the plan:**
1. **Top channels share the same ~150 animation building blocks.** What makes them look different is the style system (map look, colours, fonts, textures, motion feel, sound) and a script written together with the visuals. So the product is a **library of building blocks plus style presets plus an AI director**, not a set of fixed templates.
2. **Rendering is cheap; AI text generation is the main cost.**
   - Measured: a map frame renders on an ordinary CPU in about 1 second, which is about 1–3 cents per finished minute of video (M).
   - The language-model work (research, script, scene planning) is about 60–70% of the cost of a video (E).
3. **"Astonishing" comes from design, not more AI.** The evidence favours:
   - **hand-designed scene templates**, with the AI choosing among them, never drawing freehand;
   - **timing locked to the narration's words**;
   - a few **"hero shots"** per video;
   - a **variety engine** so videos don't look templated.
4. **Licensing traps are everywhere.** Mapbox, Google Earth/3D Tiles, Esri imagery, the popular GPL historical-border dataset, non-commercial AI models, and "free" music that triggers YouTube copyright claims (Content ID) are all out. A fully licence-safe open stack exists (Section 7).
5. **Platform rules are a product requirement:**
   - YouTube demonetises "mass-produced, templated" AI content (V).
   - EU AI Act Article 50 requires machine-readable AI marking of outputs from August 2026 (secondary sources).
   - Google's AI terms require the product to be 18+ (V).
   - The answers: variety, a required user review step, and built-in content credentials (C2PA) and watermarking.

**Estimated cost to make one video.** Recommended setup, including expected re-generations. Details in Section 6. These are estimates (±50%) until we measure real usage.

| Video | Budget quality | Standard | Premium (globe/3D + AI video shots) |
|---|---|---|---|
| 45-second Short (9:16) | ~$0.15 | ~$0.35–0.50 | ~$1.30 |
| 10-minute long-form (16:9) | ~$0.85 | ~$2.20–3.40 | ~$8–11 |

**Suggested pricing.** About **$1.15–1.35 per finished minute**, sold as credits in monthly plans. That keeps roughly 70% gross margin at typical usage and stays above ~60% even for customers who use every credit. It is still below long-form AI competitors (~$2/minute) and in line with shorts tools (~$1–2.60 per short).

**Timeline** (E, with me writing the code across sessions):
- **Weeks 1–3:** a first end-to-end sample video.
- **About 3 months:** a private alpha.
- **About 6 months:** a public beta.
- **About 12 months:** v1 with long-form, multi-language and war/history packs.

**What I need from you first** (Section 10):
1. Answers to about 12 decisions. Each has my recommendation.
2. API accounts and keys, added through the environment settings, never pasted in chat.
3. Network access for this environment.
4. 5–10 example videos you consider "astonishing".
5. A rough budget.

---

## 1. Research findings in brief

| Area | What we learned | Report |
|---|---|---|
| Genre | Same primitives across top channels; style system + visual-first script make the difference. 28 style presets and a 150-item technique catalog defined. Shorts: hook in the first 1–3 s, a visual change every 1.5–2 s. Long-form: change every 3–6 s, re-hooks every 30–60 s | [genre](research/reports/genre.md) |
| Competitors | Faceless AI tools (InVideo, Revid, StoryShort, TubeGen…) have no map engine. Map tools (mult.dev, TravelAnimator, Animaps) do travel routes only. Pro channels hand-build in After Effects + GEOlayers (weeks per video). Closest new entrants: iart.ai map skills, HeyGen HyperFrames. **Nobody owns "AI map storytelling".** | [market](research/reports/market.md) |
| Rendering | MapLibre GL (open source) in headless Chromium, driven frame by frame, is deterministic. **Measured: ~1 vCPU-second per 1080p frame on CPU with Mesa llvmpipe**; no GPU needed | [rendering](research/reports/rendering.md), [spike](../spikes/webgl-render/README.md) |
| Effects | Every technique has an implementation path: arrows, border morphs, conquest "spread" fills, rain/snow/fog, terrain, globe, parallax photos. Pitfalls found and solved: label placement, async tiles, deck.gl on terrain | [effects](research/reports/effects.md) |
| Map data | Self-host open data (Protomaps/OSM, Natural Earth, NASA, Copernicus DEM). Per-video data cost ~$0.001–0.01. Historical borders: Cliopatria (CC BY) + OpenHistoricalMap (CC0) + our own curated layer | [geodata](research/reports/geodata.md), [historical data](research/reports/gap2-historical-data.md) |
| AI pipeline | Staged pipeline, not one agent. The LLM never outputs coordinates. Scripts scored by a separate critic model against a retention rubric. User approval before render | [llm](research/reports/llm.md) |
| Audio | Google Gemini/Chirp TTS ~$0.015–0.03/min; ElevenLabs ~$0.09/min (unverified); open-source Kokoro ~$0.002/min. Music is the biggest *licensing* risk | [audio](research/reports/audio.md) |
| Visuals | 90% of non-map motion is free (parallax + procedural effects). AI images $0.02–0.13 each; AI video $0.05–0.20/s, so hero shots only | [visualgen](research/reports/visualgen.md) |
| Direction | Bounded template choice + timing solver + constraint layout reach near-designer quality in published systems. Vision-AI judges are unreliable for aesthetics, so human preference tests set the bar | [direction](research/reports/gap3-visual-direction.md) |
| Cost model | One reconciled cost model per video; LLM is the main lever; the margin depends on pricing per credit and on re-generation rates | [cost model](research/reports/gap1-cost-model.md) |
| SaaS & ops | TypeScript monorepo; content-addressed step caching; reserve-then-settle credit ledger; custom trust & safety policy for war/history content | [saas](research/reports/saas.md) |

Each report has a matching `.factcheck.md` file with the fact-checker's corrections. The [critic report](research/reports/critic.md) lists the contradictions between areas; this plan resolves them.

---

## 2. Product definition

### 2.1 Who it's for, in launch order

1. **Faceless history, geography and geopolitics creators**, including non-English ones. They post weekly long-form videos and daily shorts and will pay $29–199 a month. Most exposed to YouTube policy.
2. **Established map and history channels and their editors.** They want speed and editable output, and later layered export to After Effects or Premiere.
3. **Educators**, through a low-price teacher plan. Note that the product must be 18+ for its users, so this means teachers, not students (Section 7.6).
4. **Newsrooms and agencies** later, through the API, brand kits, SLAs and fact-check workflow.

### 2.2 Launch wedge (my recommendation)

- **Topics:**
  - Modern geography and geopolitics explainers, such as "Why is Chile so long?" or "Why does Egypt live on the Nile?". These need only modern map data, which is fully licence-clean.
  - Empire-scale history ("rise and fall", "every year" timelapses).
- **Battles and war campaigns** arrive in curated packs as the historical data is built (Section 5.5).
- **Ongoing wars are excluded from v1.** No legally clean front-line data exists.
- **Formats:** 9:16 shorts of 30–90 s, with a 61–90 s TikTok cut because TikTok Creator Rewards pays only for videos of at least 1 minute. 16:9 videos of 3–10 min at launch. 20-minute long-form at v1.

### 2.3 How the user experiences it

1. **Start.** Type a topic, or paste your own script. Pick a style, format, length, voice and language.
2. **Choose an angle.** The AI proposes 3 angles with hooks and titles; you pick or edit one.
3. **Review & personalise the script** (required step). Sources and fact-check notes are shown, and risky claims are flagged. You edit, add your own take, and approve. This step keeps videos original for YouTube and meets the AI providers' human-review rules.
4. **Preview.** A full-quality animated preview plays instantly in the browser at zero render cost. Edit:
   - per-scene "regenerate visual";
   - swap the scene type;
   - drag map arrows and camera points;
   - change style or aspect ratio (scenes are re-laid out, not cropped);
   - change voice or music.
5. **Render.** A cost estimate is shown first, then the final MP4 is rendered. Credits are refunded automatically if a render fails.
6. **Export.** You get:
   - the MP4 and SRT/VTT captions;
   - a title, description and chapters, plus an auto-generated sources and credits block;
   - the AI-disclosure guidance for each platform;
   - a C2PA content credential embedded in the file.

### 2.4 Style presets

The research defined 28 presets ([genre report §2](research/reports/genre.md)). Each preset is a **token bundle**:
- map style;
- palette roles;
- fonts;
- textures (paper, grain, film-look colour grading via a lookup table, LUT);
- motion profile (easing, timing, 12 fps "stutter" option);
- sound-effects kit;
- music moods;
- caption skin.

Launch with 4 polished presets and grow to 8–10 by beta. Suggested launch four, covering the main looks:

| # | Preset | Look | Fits |
|---|---|---|---|
| 1 | **Dark Geopolitics** | near-black ocean, charcoal land, glowing accents | geopolitics, military, economics |
| 2 | **Orbital Satellite** (the "very high quality" look) | true-colour globe with atmosphere, satellite imagery, 3D terrain, cinematic flights | "why is this place like this", megaprojects, openers |
| 3 | **Campaign Parchment** | painted relief under parchment, faction colours, thick arrows | ancient to early-modern history and battles |
| 4 | **Clean Explainer** | flat decluttered map, accent fills, crisp callouts | explainers, data stories, shorts |

Next in line:
- **Field Notes:** investigative paper-collage look.
- **Chronicle Timelapse:** "every year" borders.
- **Ops Room Tactical:** NATO symbols.
- **Antique Atlas.**
- **Newsreel Archival.**
- **Prestige Cinematic.**

Presets get generic names, **never named after real creators**, to avoid trademark and false-endorsement issues.

**Limit of the satellite look.** Free, commercially usable satellite imagery tops out at 10 m resolution. That is excellent at country and region scale but not at city-block scale. City close-ups therefore switch to a stylised vector map unless we license premium imagery later.

### 2.5 Feature scope by phase

| Feature | MVP (private alpha) | Beta | v1 | Later |
|---|---|---|---|---|
| Topic → video; paste script → video | ✓ | ✓ | ✓ | |
| Styles | 3–4 | 6–8 | 10+ | marketplace |
| Formats | 9:16, 16:9 | + 1:1, 4:5 | | |
| Length | up to 5 min | up to 10 min | up to 20 min, chapters | |
| Scene templates | 12–18 | 22+ | 30+ | |
| In-browser preview, per-scene regenerate | ✓ | ✓ | ✓ | |
| Inspector + direct map editing (drag arrows, camera) | basic | ✓ | ✓ | |
| Languages | English | + ES, PT-BR, FR, DE | + HI, ID, JA… | |
| Historical data | modern + empire-scale | "Empires & Eras" pack | "Wars" packs (public-domain sources) | live conflicts only if licensed |
| Premium: 3D globe/terrain, AI hero clips, custom score | 1 premium style | ✓ | ✓ | |
| Brand kit, team workspaces | | brand kit | teams | SSO |
| API, auto-publish to YouTube/TikTok | | | ✓ (needs platform audits) | |
| Layer export for After Effects/Premiere | | | | ✓ |

---

## 3. How a video gets made (the pipeline)

```
TOPIC or PASTED SCRIPT
 1  Intake & safety triage ............ cheap model + free moderation API → topic, risk flags, entity guesses
 2  Research ........................... Wikidata/Wikipedia (self-hosted dumps) + a few web searches
                                          → cited FACT SHEET (every number/date/name has a source id)
                                          research cached per topic/entity and reused across users
 3  Angles & hooks ..................... best writing model → 3 angles × 5 hooks; user picks
 4  Script (visual-first, 2 columns) .. best writing model → narration + visual intent + fact ids
 5  Critic (different model) .......... cold read → hard gates → 100-point retention rubric
                                          → targeted rewrite (≤2 loops)
 6  Claim check ........................ code checks numbers/dates; cheap model checks each claim vs its source
 ══ USER REVIEW & PERSONALISE (required) ══
 7  Voice ............................. TTS per sentence (cached) + forced alignment against the script
                                          → WORD TIMESTAMPS = master clock; ASR back-check for mispronunciation
 8  Entity resolution (deterministic) . Wikidata ids → points, routes, modern & era borders; validators
 9  Direction ......................... beats → director picks TEMPLATE + parameters per beat (enum only)
                                          → 3 candidate plans scored by code metrics + pairwise judge
10  Compiler .......................... timing solver, camera paths (van Wijk), 6×6 layout grid,
                                          safe zones per platform, style tokens → RENDER IR
 ══ IN-BROWSER PREVIEW (free) — optional storyboard edits ══
11  Assets ............................ icons/flags/portraits/images (cache first, then archive, then AI),
                                          parallax depth & cut-outs, music cue, SFX hits
12  Render ............................ CPU workers (Chromium + Mesa) render frame ranges in parallel
                                          → concat → audio mix (ducking, −14 LUFS) → captions
13  QA ................................ blank/frozen frames, tile errors, loudness, caption overflow,
                                          sync drift; vision-model defect scan on contact sheets → auto-fix scenes
14  Package ........................... C2PA credential + watermark, SRT/VTT, title/description/chapters,
                                          sources + data-attribution block, per-video credits page
```

**Design rules:**
- **The LLM never writes coordinates, frame numbers, colours or animation code.** It writes a *semantic storyboard*: place and polity references, word anchors and style tokens. Deterministic code turns that into the exact render instructions (the Render IR). This is the most important reliability decision.
- **Every step is a cached pure function.** The cache key is a hash of inputs, versions and model, with outputs stored by hash. That one mechanism gives retries, idempotency, cheap per-scene regeneration and exact per-step cost accounting.
- **Audio is the clock.** Visuals are anchored to words, not seconds, so re-voicing or translating re-times the beats without breaking them.
- **The pasted-script path** joins at step 6. Facts are checked and shown as *warnings*; the user's wording is kept unless they accept suggestions.

---

## 4. The quality system: how we get "astonishing"

### 4.1 Script quality

- **Narrative templates:**
  - geographic "why" explainer;
  - battle/campaign;
  - rise and fall;
  - geopolitical crisis;
  - "every year" timelapse;
  - short micro-arc.
- **Critic rubric** ([llm report §3](research/reports/llm.md)). Built on Paddy Galloway, the MrBeast production guide, Kallaway hooks, "but/therefore" causality, Johnny Harris's promise structure and George Blackman's open loops.
  - **Hard gates:**
    - the promise is confirmed within ~25 words;
    - no throat-clearing;
    - every fact cited;
    - one central question, answered by the end;
    - coherent cold read;
    - abrupt ending;
    - policy;
    - length fit.
  - **100-point score:**
    - hook;
    - open loops;
    - causal chaining;
    - stakes;
    - specificity;
    - re-engagement cadence;
    - payoff;
    - "map-writability";
    - rhythm;
    - anti-slop vocabulary.
- **The critic runs on a different model from the writer**, to avoid self-preference.
- **Calibration.** A golden set of 50–100 topics with human-ranked script pairs. Later, re-weight the rubric against real retention data from design partners.

### 4.2 Visual direction ([gap-3 report](research/reports/gap3-visual-direction.md))

- **Template library.** Motion designs authored by a designer, with parameters and variants. MVP set of 18:

  | # | Templates |
  |---|---|
  | 1–4 | globe-to-region, zoom-to-focus, highlight-hold-push, route journey |
  | 5–8 | army arrows, unit blocks moving, forces intro, clash |
  | 9–12 | territory change (border morph), timelapse run, person intro, stat callout |
  | 13–16 | size compare, data-map reveal, chart build, environment (terrain + rain/snow/fog) |
  | 17–18 | chapter card, hook montage |

  These are estimated to cover 86–98% of beats in the launch presets.
- **Director (LLM).** It splits the script into beats and picks a template ID from a **list limited to the preset and beat type**, fills in its parameters, and marks hero beats.
- **Best-of-3 on the plan.** Three text plans are scored with code metrics (shot-length distribution, sync, density, repetition) and a pairwise judge. Only the winner is rendered.
- **Variety engine:**
  - camera-transition priors fitted to real channels;
  - no more than 2 identical templates or 3 identical camera moves in a row;
  - **per-customer channel memory** that avoids repeating the same structures.

  This is the direct answer to YouTube's "looks like it's made with a template" rule.
- **Hero shots.** One every 60–90 s in long-form and one per short, at the narrative peak. Examples: a 3D terrain orbit with weather, a mass arrow sweep, a full border morph.

### 4.3 Timing and layout rules (evidence-graded)

| Rule | Value |
|---|---|
| A label or highlight appears relative to the spoken word | 0–200 ms *before* the word; never more than ~100 ms late |
| Camera settles before the key noun | ≥ 300 ms |
| Sound effect lands relative to the visual hit | within ±1 frame |
| Flight durations | computed (van Wijk–Nuij path, MapLibre's curve 1.42), never chosen by the LLM |
| New elements entering | at most 2 per 0.5 s |
| Ideas on screen | the current idea plus at most one earlier element |
| Labels | sit on the map, not in side panels |
| Layout | 6×6 anchor grid, plus per-platform safe zones (TikTok, Shorts and Reels interfaces cover parts of the 9:16 frame) |

### 4.4 Automated QA gates (before delivery)

- **Pre-render:**
  - schema valid;
  - assets resolve;
  - text fits (measured with real font metrics);
  - safe zones respected;
  - geography sane: entity existed at that date, arrow endpoints in the right places, plausible march speeds;
  - faction colours consistent.
- **Render:** fail a chunk on map tile errors rather than render blank map tiles.
- **Post-render:**
  - blank or frozen frames;
  - silence;
  - loudness at −14 LUFS and −1 dBTP;
  - caption-versus-audio sync under 80 ms;
  - vision-model defect scan of contact sheets (overlaps, wrong region highlighted, unreadable text).
- **Vision models catch defects; they don't judge beauty.** Their agreement with expert aesthetic ratings is only r ≈ 0.43–0.48.

### 4.5 Launch quality bar (measurable "astonishing")

For each preset and format:
1. **Against professional reference clips.** Same audio, so only the visuals differ. Pairwise human tests on Prolific; win rate **≥ 40%** (a 95% lower bound above 35%).
2. **Against an "AI slideshow" baseline:** win rate ≥ 75%.
3. **Critical defects** (wrong geography, overlapping key labels, sync error over 250 ms): **≤ 2%**, audited on 150 or more renders.
4. **"Same template?" test.** Three videos from one channel must not look more templated than a real human channel's.

Cost per test round: ~$1.3k minimal, ~$5k full, plus ~$1.1k for an expert panel (E).

---

## 5. Technical architecture

### 5.1 Stack

| Layer | Choice | Why / notes |
|---|---|---|
| Language | **TypeScript monorepo** (pnpm + Turborepo); Python only in isolated containers (alignment, image processing, geodata builds) | one type system for AI schemas, editor, compiler and renderer |
| Web app | Next.js, Tailwind + shadcn/ui; in-browser preview player | preview costs nothing |
| Video framework | **Remotion v4** for composition, audio and captions, plus its **Player** for preview | its terms explicitly allow AI prompt-to-video SaaS (V). Free while the company is **≤ 3 people, contractors included** (V); otherwise $0.01/render with a $100/month minimum (V). Kept behind an adapter so we can switch to a direct Playwright renderer (proven in the spike) or HyperFrames (Apache-2.0) |
| Map engine | **MapLibre GL JS v6** (BSD-3) for basemap, globe and terrain; **d3-geo** for flat stylised presets; **three.js** for premium globe and FX; deck.gl only for flat (non-terrain, non-globe) map scenes | deck.gl layers do **not** drape on MapLibre terrain, and its globe mode is experimental (V), so on 3D shots arrows and units are MapLibre layers or custom WebGL layers |
| Orchestration | **Trigger.dev** (Apache-2.0) behind a thin interface; alternatives Inngest or Temporal | durable steps, waitpoints for user review, realtime progress. Never render frames on its compute |
| Render workers | Docker image: Chromium + **Mesa llvmpipe** + ffmpeg; frame-range chunks across many small CPU workers | measured ~1 vCPU-s/frame (M). Scale-to-zero container jobs at MVP; cheap steady boxes or spot later |
| Database & auth | Supabase Pro ($25/mo incl. auth for 100k monthly users) (V), or Neon + Better Auth | few vendors for a small team |
| Storage | **Cloudflare R2** ($0.015/GB-month, free egress) (V) | videos, caches, self-hosted map tiles (PMTiles) |
| LLMs | Claude (writing, critique, direction); a cheap model for utility steps | Section 5.2 |
| TTS | Google Gemini/Chirp TTS standard; ElevenLabs premium (pending verification); Kokoro (Apache-2.0) for free drafts | Section 5.6 |
| Images & video gen | Google Vertex (Imagen 4, Nano Banana 2/Pro, Veo) for gaps and hero shots; library and archive first | requires 18+ product (Section 7.6) |
| Payments | Merchant of record: **Polar** (5% + 50¢ on the VAT-inclusive total) (V) or Paddle; Stripe at scale | handles global VAT; needs a company entity |
| Observability | PostHog (analytics), Sentry (errors), Langfuse or our own table (LLM cost per step) | |
| Safety & provenance | OpenAI omni-moderation (free) + custom documentary-context policy model; **C2PA** via c2pa-node (MIT) + Meta Video Seal/AudioSeal watermark (MIT) | Section 7 |

### 5.2 AI model routing (recommended default)

| Stage | Model | Why |
|---|---|---|
| Hooks, script, rewrite | Claude Opus 5.5 (effort medium/high) | writing quality is the product; it costs only ~$0.25 more per short than the budget route |
| Critic, research synthesis, director plans, plan judge, vision QA | Claude Sonnet 5.5 | a different model from the writer; strong at structured output |
| Utility (intake, disambiguation, metadata) | a cheap model (Haiku 4.5 today; it has a tentative retirement "not sooner than 2026-10-15", so keep a fallback) | cost |
| Budget plan tier | Sonnet for the script and cheaper models elsewhere; Batch API (50% off) for "queued" jobs | margins |

Notes:
- **Prices (V):** Opus 5.5 is $4/$20 per million tokens in/out, Sonnet 5.5 $2/$10, Haiku 4.5 $1/$5. Cache reads cost $0.20 per million on Opus and Sonnet.
- **Prompt caching.** A large, byte-stable system prompt (style guide, rubric, building-block catalogue) is cached.
- **No Google Search grounding.** Its terms forbid caching, storing or rewriting the results (V).
- **Research sources.** Claude web search ($10 per 1,000 searches) and our own Wikipedia/Wikidata dumps. Sources must be shown, so they go in the video description.
- **Refusals.** Expect "refusal" responses on war and terrorism topics. Handle them with server-side fallbacks.
- **No distillation.** Training our own models on Claude or Google outputs is not allowed by their terms.

### 5.3 The renderer and its "frame contract"

Every frame must be a pure function of `(Render IR, frame number, seed)`. Then chunks rendered on different machines join seamlessly. Measured and verified rules:
- MapLibre settings: `setNow(t)`, `fadeDuration: 0`, zero style and raster transitions, `preserveDrawingBuffer`, fixed pixel ratio.
- Per frame: `jumpTo`, then wait for `idle`, then **paint once**.
- No `flyTo` or `easeTo` at render time. Camera paths are computed by us.
- **Story labels are drawn in our own overlay.** MapLibre's label placement depends on the previous frame, and labels pop during zooms.
- Particle effects (rain, snow, smoke) are **stateless** functions of seed and time. A lint rule bans `Math.random` and `Date.now`.
- Fonts, sprites and tiles are preloaded. The tile cache is warmed along the camera path before each chunk.
- All chunks of one video render on the same instance type. Golden-frame tests run in CI.

Layer stack:
- background;
- basemap;
- territories and data;
- per-frame geometry (arrows, routes, units);
- geo-anchored shaders (conquest spread, fog of war, water, day/night);
- screen effects (rain, snow, lightning);
- labels and callouts;
- media (cut-outs, parallax photos);
- typography;
- post-processing (grain, vignette, colour grade).

The full technique-to-implementation table is in the [effects report §5](research/reports/effects.md).

### 5.4 Render infrastructure and speed

- **Measured** ([spike](../spikes/webgl-render/README.md)): one 4-vCPU box renders about 4 frames per second at 1080p. That is ~1.05 vCPU-s per frame, about 0.55 vCPU-hours per finished minute.
- **Speed for users.** A 60-s short is 1,800 frames, about 7.5 minutes on one box. Split across ~8 boxes it takes about **1 minute**. Long-form scales the same way.
- **Cost:**
  - ~$0.01–0.03 per finished minute at $0.02–0.05 per vCPU-hour.
  - Serverless containers (around $0.065 per vCPU-hour plus memory) cost ~$0.04–0.07 per minute. Still small.
  - Budget 1.5–3× for detailed basemaps or 3D terrain until measured.
- **Remotion Lambda is not used.** AWS Lambda has no GPU and no Mesa, so Remotion would fall back to SwiftShader, which is 3× slower. Use our own image instead.
- **GPU is optional.** Test a GPU pool (EC2 g4dn or g6f, Cloud Run L4) only if 3D-heavy presets need faster turnaround.
- **One licensed render per delivered video.** Previews run in the browser Player and don't count as renders (V). QA stills come from ffmpeg, not Remotion renders. Chunk counting is to be confirmed with Remotion in writing (draft email in the [cost-model report §6](research/reports/gap1-cost-model.md)).

### 5.5 Map and historical data (all self-hosted; licence-checked)

| Need | Source | Licence / obligation |
|---|---|---|
| World and continent vectors, coasts, rivers, cities, disputed-border "points of view" | **Natural Earth** | public domain (V) |
| Detailed basemap (roads, cities, landuse) | **Protomaps** planet PMTiles (~120 GB) on R2 | OSM ODbL: "© OpenStreetMap" **on-frame while visible** + description |
| Globe imagery and night lights | **NASA Blue Marble / Black Marble** (500 m) | public domain; no NASA logos |
| Regional satellite (10 m) | **EOX Sentinel-2 cloudless 2016** (CC BY) and **ESA WorldCover S2 composites 2020/2021** (CC BY) | attribution; newer EOX years need a paid licence |
| Terrain and bathymetry | **Copernicus DEM** (via Mapterhorn or own build), **GEBCO** | credit lines + Copernicus liability sentence |
| Historical borders (base) | **Cliopatria** (3400 BCE–2024, 1,583 polities, Wikidata-linked) | CC BY 4.0. Provenance risk rated **medium** (EU database right); mitigations below |
| Historical borders (crowd) | **OpenHistoricalMap** planet dump | CC0, filtered per feature licence tag |
| Ancient places and roads | **Pleiades** (CC BY 3.0), **Itiner-e** Roman roads (CC BY 4.0) | attribution |
| Battles and events | **Wikidata** (CC0), War Atlas (CC BY), CDB90 (US government, public domain) | |
| Front lines and campaign arrows | **Our own curated layer**, redrawn from public-domain government atlases (US Civil War Official Records Atlas, US Army CMH "Green Books", West Point maps, ABMC 1938, CIA *Balkan Battlegrounds*, pre-1931 atlases) | facts redrawn in our style, with a citation per feature |
| Military symbols, flags, icons | milsymbol (MIT), flag-icons (MIT), Material, Phosphor, Tabler, Lucide; Game-icons (CC BY 3.0, credit each author) | allow-list by licence ID |

**Never in rendered output:**
- Mapbox (bulk/automated query ban; proprietary GL JS);
- Google Map Tiles, 3D Tiles and Earth Studio;
- Esri imagery;
- GADM;
- aourednik historical-basemaps (GPL-3.0);
- Chronas (CC BY-SA);
- CShapes 2.0 (non-commercial);
- ShareAlike geoBoundaries files (~38% of them);
- ISW, DeepState and Liveuamap (without a licence).

**Historical data plan** ([gap-2 report](research/reports/gap2-historical-data.md)):
- **Coverage today.** Of the top 100 genre topics, **16 are ready** on open data alone, **76 need curation** and **8 should be deferred** (mostly live wars).
- **Cliopatria mitigations:**
  - ask Seshat for written provenance confirmation;
  - show attribution automatically;
  - progressively replace the top topics with our own public-domain-sourced curation;
  - carry media errors & omissions (E&O) insurance;
  - fix the known defects first (Ukraine 2022+, Prussia 1807–1863, Han 6–13 CE).
- **"Territory Composer" for gaps.** The LLM writes a recipe (modern admin units + held cities + rivers); code builds the shape.
  - Pilot accuracy: median overlap score (IoU) 0.745 against Cliopatria. The two open datasets agree with each other at only ~0.63.
  - Use it only with snapping, human QA and "approximate border" styling.
- **Curation budget (E):**
  - pilot of 5 topics: ~$6–9k;
  - public-domain-sourced top 50: ~$57k offshore / ~$93k onshore, about 16 weeks;
  - live-war upkeep (if ever licensed): ~$6k a year plus legal risk.

### 5.6 Audio

- **Narration.** Behind a provider-neutral interface; tiers:
  - Standard: Gemini 2.5 Flash TTS (GA, ~$0.015/min) or Gemini 3.8 Flash TTS (preview; ~$0.027/min at its 2027 list price).
  - Premium: ElevenLabs (~$0.09/min; price unverified; check its v4 models).
  - Free drafts: Kokoro (Apache-2.0, ~$0.002/min on CPU) (M).
- **Narrator voice.** Choose the default with a blind listening test.
- **Pronunciation lexicon** for historical names. Google's custom pronunciation works in en-US only; use respelling or ElevenLabs dictionaries for other languages.
- **Timing.** Synthesize per sentence and cache it. Force-align against the known script (stable-ts MIT, or a wav2vec2 aligner with a commercial licence; avoid the non-commercial MMS weights). Run an ASR back-check with faster-whisper (MIT) that re-generates mispronounced sentences.
- **Music: the biggest licensing risk.** YouTube blocks Shorts over 1 minute that carry a Content ID claim (per YouTube's October 2024 announcement; re-verify). We need a **private library with explicit SaaS redistribution rights**:
  - **Option A:** commission or buy out ~60–100 tracks for the MVP (get quotes).
  - **Option B:** an AI-generated library, only under a written enterprise agreement. ElevenLabs self-serve music terms reportedly exclude library/reseller rights. Google Lyria is preview and not covered by Google's IP indemnity.
  - **Option C, later:** "connect your Epidemic Sound account".
  - **Never** use Suno, Udio, Pixabay, the YouTube Audio Library, or non-commercial models.
  - Protect the library with: a terms-of-service ban on Content ID registration, stream-only access, provenance logs and a licence certificate per render.
- **Sound effects.** CC0 packs plus a one-time generated library of ~2,000 sounds (~$30–100), with ambience beds tied to visual effects (rain visuals → rain bed).
- **Mixing** (M, tested). Deterministic ducking from word timestamps, then a two-pass loudnorm to −14 LUFS. About 4 s of CPU per minute.

### 5.7 Non-map visuals

**Decision order for each beat:**
1. Real event with public-domain media → **archival** (Met, NGA, Smithsonian CC0; Wikimedia PD/CC0 only; US government).
2. Illustrative → **AI still** (cache first) + 2.5D parallax.
3. Needs real physical motion, or is the hook → **AI image-to-video** from an approved still (premium, capped).
4. Weather or effects → **procedural, never paid**.

**Processing models (commercial-safe only):**
- BiRefNet for cut-outs (MIT).
- Depth Anything V2-Small or DA3-Mono-Large for depth (Apache).
- LaMa for filling in backgrounds (Apache).
- Real-ESRGAN for upscaling.
- **Avoid:** RMBG-2.0 (rembg's default!), Depth Anything V2 Base/Large, FLUX dev/klein-9B, Hunyuan models, LTX-2.

**Global asset cache.** Generate "Napoleon portrait, Campaign Parchment style" once and reuse it for every user. Pre-built per-style libraries cost about $1–3k one-time (E).

**AI video model churn.** Veo 3.1 Fast has a listed deprecation date of 2026-11-17, so build on a model registry with fallbacks. Veo 3.1 Lite costs $0.05/s at 1080p without audio (V).

**People.** No photoreal AI images of living people. Historical figures appear as stylised illustrations or public-domain portraits.

### 5.8 Data model and job flow (summary)

**Main tables:**
- `projects`;
- `project_versions` (storyboard snapshots + patches = undo history);
- `jobs` and `job_steps` (status, cache key, cost, provider);
- `artifacts` (content-addressed);
- `credit_ledger` (double-entry; reserve, then settle; automatic refund on failure);
- `moderation_events`;
- `audit_log`;
- `assets` (licence, attribution, provenance);
- `channel_history` (for the variety engine).

**Job states:**
1. INTAKE → RESEARCH → SCRIPT → CLAIM_CHECK → **USER_REVIEW**
2. STORYBOARD → CREDIT_RESERVE → per-scene (GEO / ASSETS / VOICE) → TIMING_LOCK → **PREVIEW**
3. RENDER → MIX → QA (auto-fix ≤ 2) → PACKAGE → DELIVERED

**Partial regeneration.** Editing scene 4's narration re-runs only that scene's voice, timing and render, then the final mix.

### 5.9 Repository layout (planned)

```
apps/web               Next.js app: dashboard, editor (script / storyboard / inspector), billing
apps/render-worker     Docker: Chromium + Mesa + ffmpeg; renders frame ranges of a Render IR
apps/media-worker      Python: forced alignment, ASR check, cut-outs/depth, audio QA
packages/dsl           zod schemas: Storyboard, RenderIR, StylePreset, Template params
packages/compiler      storyboard → Render IR (resolve, timing solver, camera paths, layout)
packages/scenes        scene templates + primitives (MapLibre, d3-geo, three.js, overlays, FX)
packages/styles        preset token bundles (map styles, palettes, fonts, textures, motion, SFX kits)
packages/pipeline      orchestration tasks, step cache, cost accounting
packages/ai            prompts, rubric, critic, director, claim checker (versioned, eval-tested)
packages/geo           gazetteer/resolver, historical borders, territory composer, validators
data/                  build scripts for PMTiles, borders, icon/flag libraries (data itself in R2)
docs/                  this plan, research, decisions log
spikes/                experiments (webgl-render is the first)
```

---

## 6. Costs

### 6.1 Variable cost per video

This uses the recommended routing, includes an estimated **1.5×** for user re-generations, and prices Google at its 2027 list prices. From the [cost-model report](research/reports/gap1-cost-model.md), with direction best-of-3 from the [gap-3 report](research/reports/gap3-visual-direction.md) and render cost from the spike.

| | Short 45 s, standard | 10-min, standard | 10-min globe + AI clips, premium |
|---|---|---|---|
| LLM (research, script, critic, storyboard, QA) | $0.25 | $1.41 | $3.31 |
| Direction best-of-3 + plan judge (extra) | ~$0.11 | ~$0.90 | ~$0.90 |
| Voice | $0.03 | $0.42 | $0.42 |
| Images (library first) | $0.04 | $0.23 | $2.51 |
| AI video hero clips | – | – | $3.12 |
| Music | $0 (owned library) | $0 | $0.53 (custom score) |
| Render compute (CPU) | ~$0.01 | ~$0.07–0.30 | ~$0.15–0.60 |
| Remotion licence (if >3 people) | $0.01–0.02 | $0.01–0.02 | $0.01–0.02 |
| Storage + orchestration | $0.01 | $0.08 | $0.08 |
| **Total (E, ±50%)** | **≈ $0.45** | **≈ $3.1–3.4** | **≈ $11** |

**Takeaways:**
- **LLM tokens are the main lever.** The fixes are caching, compact storyboard format, re-generation limits, the Batch API on non-urgent work and research reuse.
- **Re-generation behaviour is unknown.** At 3× instead of 1.5×, the Pro-plan margin drops about 8–15 points. Measure it from day one.
- **Budget tier:** ~$0.15 per short and ~$0.85 per 10-minute video, with cheaper models and no AI images.

### 6.2 Fixed monthly costs (E)

| | Build phase | ~1,000 videos/month | ~10,000 videos/month |
|---|---|---|---|
| Hosting, DB, Redis, R2, monitoring, email | $50–150 | $300–700 | $1.5–3k |
| Map data storage (1.5–4 TB in R2) | $25–60 | $25–60 | $25–60 |
| Remotion licence | $0 if ≤ 3 people incl. contractors; else $100 minimum | $100 | $100–300 |
| LLM/TTS during development and testing | $100–300 | – | – |

### 6.3 One-time costs (E: get quotes)

| Item | Estimate | When |
|---|---|---|
| Motion design: 18 templates + 4 preset skins (~17 designer person-weeks) | ~$20–40k at freelance rates; or I build first versions and a designer polishes (less) | MVP → beta |
| Legal review: data stack, Cliopatria provenance, ToS/AUP/privacy, AI Act, music | ~$5–15k | before public launch |
| Music library with SaaS redistribution rights | quote-based | before alpha |
| SFX library (generated + CC0) | ~$30–100 + curation time | MVP |
| Visual asset libraries (portraits, props, icons per style) | ~$1–3k | beta |
| Historical curation (pilot of 5 topics → public-domain-sourced top 50) | ~$6–9k → $57–93k | beta → v1 |
| Human preference test rounds | ~$1.3–5k per round + ~$1.1k expert panel | before beta and v1 |
| C2PA trust-listed signing certificate | quote-based | before public launch |
| E&O / media liability insurance | ~$2–6k per year | public launch |

### 6.4 Pricing (to validate after measuring real costs)

- **One unit:** 1 credit = 1 finished minute of standard 1080p video, minimum 1 credit per video. Show the estimate before every render. Refund failures automatically. Roll unused credits over one month.
- **Premium features cost extra credits:** premium styles (3D globe/terrain), premium voice, 4K, AI hero clips.
- **Margin target:** ≥ 70% gross margin at typical usage, and never below ~60% even when a customer uses 100% of their credits, after payment fees. Fees are 7–10% on EU sales because the merchant of record charges on the VAT-inclusive total. Final prices are set after Phase 0 measures real costs.

Example grid (E):

| Plan | Price/month | Credits | ≈ $/credit |
|---|---|---|---|
| Free | $0 | 2–3 short videos, 720p, watermark, non-commercial, slow queue | – |
| Creator | $29 | 22 | $1.32 |
| Pro | $79 | 65 | $1.22 |
| Studio (3 seats) | $199 | 170 | $1.17 |
| Credit packs | $25 / $100 | 18 / 80 | $1.25–1.39 |
| Business / API | from $499/month or ~$1 per finished minute | custom | |

**Why this works:**
- **Competitive price:** under long-form AI competitors (~$1.94–2.47/min, secondary) and in line with shorts tools (~$1–2.60 per short).
- **Selling points:** maps, research and accuracy, which nobody else has.
- **No lifetime deals.** They caused backlash at competitors.
- **Regional pricing:** 40–60% off for India, Latin America and Southeast Asia, gated by card country.

---

## 7. Legal, licensing and platform policy

### 7.1 Licence gate (enforced in code)

- **Allowed in rendered output:** public domain, CC0, MIT, Apache-2.0, BSD, ISC, OFL fonts, CC BY 3.0/4.0 (with automatic credits), ODbL as a "produced work" (with attribution).
- **Blocked:** anything non-commercial, ShareAlike, no-derivatives, GPL or AGPL in output, unknown licence, or "research only".
- **Registry.** Every asset, dataset and model has a record: licence ID, attribution text, whether on-frame credit is required, and provenance.

### 7.2 Attribution engine

Built automatically from what actually appeared in each video:
- a small on-frame credit while OSM or EOX layers are visible;
- a ready-to-paste description block;
- a permanent `/credits/{videoId}` page.

Required credits cannot be removed on any plan.

### 7.3 Platform policies

| Platform | Rule | Product response |
|---|---|---|
| YouTube | "Inauthentic content" (15 July 2025): templated, mass-produced AI content is not monetisable, judged channel-wide (V) | variety engine + channel memory, required review & personalise step, authorship log, no unattended autopilot on low tiers |
| YouTube | Realistic synthetic people, places or events need disclosure. Labels appear from trusted C2PA manifests | stylised by default; per-video disclosure advisor |
| YouTube | Shorts over 1 min with a Content ID claim are blocked | Content-ID-safe music only |
| YouTube | War keywords → limited ads | title/thumbnail ad-safety checker |
| TikTok | Creator Rewards needs videos of at least 1 min; AI labels read via C2PA; duplicate cross-posts penalised | 61–90 s preset; platform-specific variants |
| Auto-posting | YouTube API uploads stay private until a Google audit; TikTok needs an app audit | plan audits before marketing auto-post (v1) |

### 7.4 EU AI Act Article 50 and labelling

- **What's required.** We are a "provider" of a system that generates synthetic audio, video and text. Outputs need **machine-readable marking**. Article 50 applies from **2 Aug 2026**; a new product gets no grace period (secondary legal summaries).
- **The voluntary Code of Practice** (10 June 2026) expects **signed metadata (C2PA) plus an imperceptible watermark**.
- **Plan:**
  - C2PA manifest on every export, with a trust-listed certificate;
  - Meta Video Seal and AudioSeal watermarks (MIT);
  - a public verification page;
  - an optional visible AI label.
- **Ask counsel:**
  - which C2PA "digital source type" to assert;
  - whether stylised map animation is in scope at all. Our AI narration is in scope regardless.
- **Never offer "export without metadata".** India's 2026 IT Rules also forbid it.

### 7.5 Content policy for this genre

| Topic | Default |
|---|---|
| Historical wars, battles, genocides, terrorism history | Allowed in documentary tone; no gore; casualty figures attributed |
| Glorification, recruitment, propaganda reproduction, atrocity/Holocaust denial | Blocked |
| Ongoing conflicts and elections | Allowed only with dated citations and neutral framing; no live front-line maps in v1 |
| Living people | Every claim cited; no photoreal AI likeness; no voice clones of real people |
| Disputed borders | Default: de facto control, disputed areas dashed or hatched, neutral labels. User-selectable "worldview" presets from Natural Earth's point-of-view files. Warnings for markets with map laws (India, China) |

Generic moderation tools over-flag war history. A custom policy classifier for documentary context decides; generic flags are only signals.

### 7.6 Age: 18+

Google's generative AI terms forbid use in services "likely to be accessed" by under-18s (V). TikTok's Creator Rewards programme also requires creators to be 18+, so our paying audience is adult anyway. So:
- 18+ in the terms;
- age attestation at signup;
- no marketing to minors.

### 7.7 For counsel (before public launch)

- ToS, acceptable-use policy, privacy policy and DPA.
- DMCA agent; DSA contact point.
- Cliopatria chain of title.
- Music rights.
- C2PA assertion.
- Codec patents (H.264/AAC at volume).
- Merchant-of-record approval for "AI video about wars and politics".
- Anthropic's human-review requirement for auto-published content.
- Use of reference YouTube clips in evaluations.

---

## 8. Roadmap

All durations are estimates. They assume I write the code across sessions, you make the decisions and run accounts, and a motion designer joins by beta.

### Phase 0: Foundations and first real video (weeks 1–3)

**Build:**
- the monorepo;
- the storyboard → Render IR schemas;
- the frame-contract renderer in a Docker worker (Mesa, chunking, concat);
- 5 templates: globe-to-region, highlight-hold, route journey, army arrows, stat callout;
- **2 styles**: Dark Geopolitics plus a satellite/terrain test of Orbital Satellite;
- TTS + forced alignment + captions + audio mix.

**Then:**
- hand-write a storyboard and render a **60-s short and a 3-min horizontal video**;
- run the LLM script and storyboard pipeline on 10 topics;
- **measure real tokens, time and cost**.

**Exit criteria:**
- you watch the samples and say "this direction is right";
- the measured cost per video is within the Section 6 ranges.

### Phase 1: MVP / private alpha (≈ weeks 4–12)

- **Web app:** auth; topic and paste flows; angle picker; script review; in-browser preview; per-scene regenerate; render queue; downloads.
- **Content:** 12–18 templates; 3–4 styles; 9:16 + 16:9; up to 5 minutes; English.
- **Business and safety:** credits and billing (once the company is set up); moderation v1; attribution engine; C2PA; QA gates; cost dashboards.
- **10–20 design partners** using it for real channels.

**Exit criteria:**
- design partners publish videos;
- defect rate ≤ 5%;
- the first human preference round has been run.

### Phase 2: Beta (≈ months 4–6)

- 10-minute long-form;
- 6–8 styles; 1:1 and 4:5;
- inspector with map handles; brand kit;
- variety engine with channel memory; vision-model QA;
- "Empires & Eras" history pack;
- ES, PT-BR, FR and DE;
- referral programme; status page;
- the launch quality bar (Section 4.5) measured and met.

**Exit criteria:** quality bar passed; public launch.

### Phase 3: v1 (≈ months 7–12)

- 20-minute videos with chapters;
- "Wars" packs from public-domain atlases;
- worldview presets;
- premium tier: 3D globe/terrain, AI hero clips, custom score;
- teams; API;
- YouTube/TikTok publishing (after platform audits);
- more languages; template library growth.

### Phase 4: Scale (12 months+)

- dedicated render fleet or spot capacity;
- enterprise and newsroom features (SSO, SLA);
- After Effects/Premiere layer export;
- a style marketplace;
- self-hosted image models, once volume justifies them.

---

## 9. Top risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Output looks templated → users demonetised → churn | variety engine, channel memory, required personalisation, "same template?" test in the launch bar |
| 2 | Wrong borders, facts or names in front of a pedantic audience | cited fact sheet, claim check, deterministic geo resolution + validators, curated data, "approximate" styling, sources in the description |
| 3 | Music Content ID claims on users' videos | licensed library with SaaS rights only; provenance + certificate per render; Content-ID registration banned |
| 4 | Licence contamination (one ShareAlike/non-commercial asset or model) | licence registry + CI allow-list; blocked list in Section 5.5 |
| 5 | "Not astonishing": competent but bland | designer-authored templates, hero shots, human preference bar before launch, motion designer on the team |
| 6 | LLM cost overruns (thinking tokens, re-generations) | per-step cost logging, budgets per job, caching, Batch API, re-generation limits in plans |
| 7 | EU AI Act or platform-labelling non-compliance | C2PA + watermark from day one; counsel review |
| 8 | Model and vendor churn (Haiku 4.5, Veo 3.1 Fast, Gemini preview TTS, promo prices ending 2026-12-31) | provider-neutral interfaces, model registry, regression tests, budget at list prices |
| 9 | Remotion licence terms (headcount includes contractors; v5 terms pending) | stay ≤ 3 people during MVP or pay $100/month; one render per output; adapter to a direct renderer or HyperFrames |
| 10 | Historical data provenance (Cliopatria) and coverage gaps | written confirmation from Seshat, progressive replacement with public-domain curation, E&O insurance, deferred topics |
| 11 | Misuse for war propaganda or misinformation | content policy, refusal routes, abuse monitoring, no fabricated current-event footage |
| 12 | Scope creep ("many styles, many lengths") | phase gates above; 4 polished styles before more |

---

## 10. What I need from you

### 10.1 Decisions (my recommendation in **bold**)

| # | Decision | Recommendation |
|---|---|---|
| 1 | Launch focus | **Modern geography/geopolitics + empire-scale history; 9:16 shorts (incl. 61–90 s) + 16:9 up to 10 min. Battles in curated packs; no ongoing wars in v1** |
| 2 | Age policy | **18+ only** (needed for Google's AI services; matches monetisation programmes) |
| 3 | Team size in the first 6–12 months (contractors count) | **Stay ≤ 3 during MVP** (Remotion free), or accept $100/month |
| 4 | Required script review step before render | **Yes** |
| 5 | Ongoing wars and disputed borders | **No live wars in v1; borders shown de facto with dashed disputed areas, worldview presets later** |
| 6 | AI imagery | **Stylised only; no photoreal living people; AI video clips as an opt-in premium** |
| 7 | Launch styles (pick 4) | **Dark Geopolitics, Orbital Satellite, Campaign Parchment, Clean Explainer** |
| 8 | Default voice | **Google TTS standard + ElevenLabs premium, chosen by a blind listening test; user voice cloning later, with consent checks** |
| 9 | Music route | **Commissioned or bought-out library with written SaaS rights for MVP** (or an enterprise AI-music agreement) |
| 10 | EU users at launch | **Yes, with C2PA + watermark from day one** |
| 11 | Pricing direction | **Credits ≈ $1.15–1.35 per finished minute; no lifetime deals** |
| 12 | Product name, domain, company jurisdiction | yours to choose (needed for billing, terms and the C2PA certificate) |

### 10.2 Examples from you

- **5–10 videos you consider "astonishing"**, with links and what you love about each.
- **2–3 you consider "AI slop"**, to make sure we avoid it.

These become the quality benchmark and the first style targets.

### 10.3 Accounts and API keys

**How to add them safely.** Open the cloud environment menu in this session's title bar → **Edit** → add each key under API credentials (or as an environment variable) with the names below. A new session picks them up. Please **never paste keys into the chat.** Set a spending limit or budget alert on each account.

| Needed for | Account | Variable name(s) I will read | When |
|---|---|---|---|
| Script, critic, direction | Anthropic API | `ANTHROPIC_API_KEY` | Phase 0 |
| TTS, images, hero video, render containers | Google Cloud project with Vertex AI, Text-to-Speech and Cloud Run enabled; a service account with only those roles | `GOOGLE_CLOUD_PROJECT`, `GOOGLE_SERVICE_ACCOUNT_JSON` | Phase 0 |
| Storage, map tiles | Cloudflare (R2) | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Phase 0 |
| Database, auth | Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Phase 1 |
| Orchestration | Trigger.dev | `TRIGGER_SECRET_KEY` | Phase 1 |
| Premium voice (optional) | ElevenLabs | `ELEVENLABS_API_KEY` | Phase 1 |
| Billing (needs a company) | Polar or Paddle | `POLAR_ACCESS_TOKEN` (or Paddle keys) | Phase 1 |
| Later | YouTube Data API project, TikTok developer app, PostHog, Sentry | names given when needed | Phase 2–3 |

Startup credit programmes (Google for Startups, AWS Activate, Cloudflare) can cover much of the early API and compute spend. Worth applying once the company exists.

### 10.4 Network access for this environment

The research and rendering test were blocked from many hosts. To let me build and test here, open the cloud environment menu → **Edit** → **Network access**. Either choose a broader access level or add these domains:
- **APIs:** `api.anthropic.com`, `*.googleapis.com`, `*.r2.cloudflarestorage.com`, `*.supabase.co`, `api.trigger.dev`, `api.elevenlabs.io`.
- **Map data downloads:** `build.protomaps.com`, `naciscdn.org`, `naturalearthdata.com`, `data.source.coop`. GitHub and Amazon S3 already work.
- **Packages and fonts:** `cdn.jsdelivr.net`, `unpkg.com`.
- **Vendor docs, to re-verify prices and terms:** `remotion.dev`, `remotion.pro`, `elevenlabs.io`, `maptiler.com`, `eox.at`, `hetzner.com`.

Access levels are described at https://code.claude.com/docs/en/claude-code-on-the-web.

### 10.5 People and vendors

- **Motion designer / art director** (contract): defines the presets and polishes templates. This is the biggest quality lever. Needed by beta.
- **Lawyer** (IP / AI / privacy): needed before public launch.
- **Historian / GIS curator** (contract): needed for the history packs in beta and v1.
- **Composer or music licensor:** needed before the alpha.

### 10.6 Emails to send

I'll draft these for you to send:
1. **Remotion:** how renders are counted for chunks, scenes and stills; written price assurance. A draft is already in the [cost-model report §6](research/reports/gap1-cost-model.md).
2. **Seshat (Cliopatria):** provenance of the source maps.
3. **EOX:** price for recent satellite mosaics.
4. **ElevenLabs:** enterprise music and TTS terms for a SaaS library.
5. **Euratlas, GeaCron, Centennia:** historical data licences for SaaS video.
6. **Anthropic:** confirm that the human-review step meets the usage policy.

### 10.7 Budget

To size the plan, please tell me roughly:
- the monthly amount you can spend on APIs and infrastructure during the build;
- the one-time amount available for design, legal, music and data (Section 6.3).

---

## Appendix A: Research index

See [`docs/research/README.md`](research/README.md). It covers the 9 research reports and fact-checks, the critic report, the 3 follow-up studies, and the models, scripts and datasets behind them.

## Appendix B: Glossary

- **Render IR:** the exact, machine-readable instructions for every frame (coordinates, timings, colours). Produced by our compiler, never by the LLM.
- **Storyboard / scene DSL:** the AI-written plan for the video's scenes, using place names, word anchors and style tokens.
- **Template:** a designer-made scene type (for example "army arrows") with adjustable parameters.
- **Preset:** a complete visual style (map look, colours, fonts, textures, motion, sounds).
- **C2PA:** an industry standard for signed "content credentials" embedded in media files.
- **Forced alignment:** finding the exact time each word is spoken in the narration audio.
- **llvmpipe / SwiftShader:** software graphics drivers that let a server without a graphics card render WebGL.
- **PMTiles:** a single-file map-tile format that can be served straight from cheap object storage.
