# Completeness critic: contradictions and gaps found across the 9 research areas

## Contradictions

- Remotion licence cost per video. Area 2 (visual techniques) calls it about $0.01 per video, 'noise'; its fact-checker raises that to $0.05-0.20. Area 3 (render infra) says self-hosted per-scene renders could cost about $0.15 per video. Area 3's omission notes that Remotion Lambda renders chunks with licenseKey null and reports one usage event per video, which would make scene caching licence-neutral. Area 9 (architecture) assumes about 21 billable renders per video (about $2.1k/month at 10k videos) but still recommends independently rendered scene chunks plus thumbnails. No one has Remotion's written answer.
- Remotion free licence vs the team plan. Area 9 budgets $0 for the Remotion licence because '3 or fewer people keeps Remotion free'. Its own recommended beta team is founder, senior full-stack engineer, graphics engineer, motion designer and part-time LLM engineer, plus fractional legal. That is 5 or more people. Area 3's checker notes that contractors and agencies count toward the limit. So the Company License ($100/month minimum plus per-render fees) applies from beta, not from 'scale'.
- Preview and draft cost. Areas 3 and 9 treat previews as free and suggest renderMediaOnWeb for draft exports. Area 3 also suggests flagging customer low-res drafts as 'development' renders. Checkers on Areas 3 and 9 say client-side renders are billable, always send telemetry including the end user's IP, and that misreporting drafts counts as piracy. Area 8's 'unlimited low-res previews' on the free tier is only cost-free if previews run solely in the browser Player.
- COGS vs proposed pricing. Area 8 prices plans assuming about $0.15-0.35 COGS per finished minute and $0.25-0.45 per short, with LLM at $0.08-0.25 per short. But Area 5's recommended LLM routing alone costs $0.52 per short and $1.80 per 10-min video. Area 7's Standard visual tier is $1-1.5 per short (checker: $0.9-2.2) and $6-10 per 10-min video. Area 6's premium TTS is $0.11-0.20 per short. A Standard short therefore lands near $1.5-3, above Area 8's Creator price of about $0.97 per credit. Area 8's Pro tier sells minutes at $0.79 that its own premium COGS puts at $0.60-1.30.
- Which cost dominates. Area 5 says LLM spend is 'a minority next to TTS and rendering'. Its checker, using Area 6's verified Gemini TTS rates (about $0.014-0.027 per minute), says LLM is the largest variable cost unless premium TTS or AI video is used. Area 7's numbers imply visual assets (images plus Veo clips) dominate at Standard tier. Area 3 says render cost decides 3D styles. The areas disagree on where the main margin lever is.
- Render compute numbers and the infrastructure decision. Area 2 estimates 15-60 ms per frame on GPU ($0.01-0.03 per short); its checker says 80-200 ms. Area 3 estimates 10-50 fps per GPU box and 0.5-10 vCPU-s per frame on CPU. Area 8's local spike measured 0.65-3.2 CPU-s per frame but priced it at $0.03-0.05 per vCPU-hour, while Cloud Run is about $0.065 plus memory. Area 9 assumes 4-10 fps per 4-vCPU CPU worker (0.4-1 vCPU-s per frame), which is optimistic against Area 8's spike. The recommendations diverge: Area 2 says plan a GPU pool for production, Area 3 says Lambda on CPU only if a scene is 2-3 vCPU-s per frame or less, and Area 9 says start on Remotion Lambda.
- Chunk size. Area 2 recommends 300-900-frame chunks because each chunk pays 2-6 s of warm-up for style, tiles and fonts. Area 3 recommends about 2-6 s chunks for long-form. Area 9 renders one chunk per scene (about 3-15 s) with 0.5 s handles. Small chunks multiply warm-up time, possibly Remotion render counts, and Cloud Run Jobs' 1-minute minimum billing per instance.
- 'Bake then animate' vs the 3D camera catalog. Area 3's main cost lever is to render the basemap once as a 4-8K still and animate 2D transforms 'for most camera moves'. That cannot produce the orbit, pitch-tilt, terrain-grow, globe-dive or bearing-rotation moves that Areas 1 and 2 rank as core (C1, C4, C5, C16, G1, G4). Cost models that assume baking for most shots conflict with the planned visual grammar.
- deck.gl on terrain and globe. Areas 1 and 2 put arrows, trips, unit icons and region masks on deck.gl interleaved in MapLibre, and Area 2's camera IR includes roll. Area 2's own checker cites the deck.gl docs: layers are not draped on MapLibre terrain, globe uses the experimental GlobeView where TextLayer and non-billboard IconLayer don't render, MaskExtension doesn't work on globe, roll and non-default FOV aren't synced, and only one interleaved overlay is allowed. The most-used war primitives on 3D shots need a different implementation than the one planned.
- Historical borders source. Area 2 says there is 'no clean commercial dataset' (a gap). Area 4, and Area 1's checker, recommend Cliopatria (CC BY 4.0) as the backbone, but its provenance is unresolved. Area 5's resolver and validator are designed around aourednik historical-basemaps (GPL-3.0, 54 snapshots); its checker says server-side GPL use may be acceptable, while Areas 1, 2, 4 and 8 say avoid it. Area 8 assumes a 'curated licensed historical-borders library' exists.
- Territory Composer vs share-alike contamination. Area 4 builds a proprietary historical-polygon library from geoBoundaries units while 'never mixing in OSM'. Its checker counted gbOpen: about 38% of files are ODbL or CC BY-SA. Area 5's resolver also pulls OSM relation geometry (Wikidata P402) and geoBoundaries for modern borders.
- Google 18+ restriction vs product and market. Area 7 makes Google Vertex the primary image and video vendor, and Areas 5, 6 and 8 route LLM utility and TTS to Gemini. Area 7's checker cites Google Service Specific Terms §20(d), which ban generative services directed to or likely accessed by under-18s. Area 9 plans a 13+/16+ age gate, Area 8 plans a teacher/education tier with school site licences, and Area 1 targets Gen-Z short-form presets.
- Research cache vs search terms. Area 5 recommends a research cache keyed by Wikidata QID and shared across users, and a Gemini budget tier using Google Search grounding. Its checker says grounding terms (§20(k)) forbid caching, storing, modifying or interspersing grounded results. The checker also says Claude web search returns page content only as encrypted_content, so 'search on Claude, fact sheet on Gemini Flash-Lite' needs an extra web-fetch step or a third-party search API.
- Human approval. Area 5 makes user script approval mandatory, citing the Anthropic Usage Policy high-risk rule, and its checker says even that may not meet the 'qualified professional' requirement. Area 9's state machine has 'auto-approve in 1-click mode'. Area 8 proposes series planners and bans unattended autopilot only on low tiers. Area 3 mentions auto-posting.
- EU AI Act Art. 50 timing and method. Area 8 says the Digital Omnibus (Reg. 2026/1744) left Art. 50 unchanged, with grace only to 2 Dec 2026 for systems already on the market and none for new launches. Area 9 attributes the 2 Dec 2026 grace to a May 2026 deal. Area 7's checker says grace to Feb 2027. Area 1's checker leaves it open. Method also conflicts: Area 9 plans 'watermark later' and fixes the C2PA digitalSourceType as compositeWithTrainedAlgorithmicMedia; Area 8 wants a legal opinion on the assertion; checkers say YouTube ignores self-signed manifests, and the Code of Practice is voluntary but expects metadata plus watermark for signatories.
- Launch scope. Area 8 recommends 10-20 min 16:9 long-form as the launch wedge. Area 9's MVP caps videos at 30 s-5 min, adds 10-min long-form at beta, and reaches 10-20 min only at v1, 3-6 months later. Area 1 leaves shorts vs long-form to the founder and includes a vertical-only 'Nation Edit' preset among the 8 hero presets.
- Export resolution. Area 1 recommends exporting long-form at 1440p or higher so YouTube serves VP9/AV1. Areas 2, 3, 8 and 9 cost everything at 1080p30, with 4K as a paid tier at 2 credits per minute. 1440p is about 1.78x the pixels of 1080p and appears in no cost model.
- Music. Area 6 recommends a shared, build-once library generated with ElevenLabs Music and Lyria. Its checker says self-serve ElevenLabs Music terms don't grant music-library or reseller rights, and that Lyria 3 is Preview, not indemnified, and can produce similar output for multiple customers. Area 8 proposes unique per-video Lyria music instead. Area 1's phonk-driven 'Nation Edit' hero preset conflicts with Content-ID-safe sourcing and with YouTube blocking Shorts over 1 minute that carry a Content ID claim.
- Pixabay. Area 1 says Pixabay SFX are fine inside rendered videos. Area 6 says do not bundle Pixabay because of Content ID and redistribution limits. Area 7 calls Pixabay B-roll 'generally OK' pending legal review. Area 1's checker says Pixabay's API terms on hotlinking and systematic downloading are unchecked.
- Models scheduled for retirement. Areas 5, 8 and 9 route utility, QA and moderation to Claude Haiku 4.5, whose tentative retirement is 'not sooner than 2026-10-15'. Its 4,096-token minimum cacheable prompt also means Area 5's assumed 2K cached prefixes never cache. Area 7 recommends Veo 3.1 Fast for hero shots and Area 8 prices it, but the checker shows a Vertex deprecation date of 2026-11-17. Gemini 3.8 Flash/TTS figures in Areas 5, 6 and 8 partly use promo prices (paid as credits back) that end 2026-12-31.
- 9:16 safe zones. Area 1's 'post-anywhere' box (top 270, bottom 672, left 65, right 150) uses YouTube's 160 px top value while also recommending a 'conservative 380'; with 380 the box shrinks to about 865x868. Area 5's validator uses top about 250, bottom about 400, right about 120. Area 6 keeps captions clear of only the bottom ~20% (about 384 px), well short of Meta's 35% (672 px). These are three incompatible layout specs.
- Satellite imagery. Area 4 says EOX Sentinel-2 cloudless 2016 is the only free, commercial-OK global 10 m mosaic; its checker cites ESA WorldCover S2 composites for 2020/2021 (CC BY 4.0). Area 2 treats NASA Blue Marble as adequate for globe shots, but its checker says 500 m resolution can't support close zooms. The 'Orbital Satellite' hero preset depends on resolving this.
- Mapbox terms. Area 1 says no video use without a sales deal. Area 2 says the Product Terms allow internet-distributed video with attribution. Area 4 says only incidental promotional use. Area 4's checker says video rights can be purchased but §1.9 bans automated or bulk queries. All exclude Mapbox, but for conflicting reasons.
- Pronunciation and language. Areas 1 and 6 rely on an IPA lexicon fed to Google custom_pronunciations for proper nouns, but Area 6's checker says that feature is en-US only. Area 5 launches EN, ES, PT-BR, FR, DE, HI, ID and JA, while Area 6's free/draft TTS (Kokoro) has no German or Indonesian and gives word timestamps only for English.

## Gaps sent to follow-up research

### Gap 1: No defensible, terms-compatible end-to-end cost model per video

**Why it matters:** Pricing, margins, model routing and infrastructure all hang on per-video COGS. The 9 areas disagree by 5-10x. Area 8's tiers assume $0.25-0.45 per short. Area 5's LLM routing alone is $0.52. Area 7's Standard visuals are $0.9-2.2. Remotion licence ranges from $0.01 to $0.21 per video depending on how renders are counted. Render compute ranges from $0.01 to $0.43 per minute. Nobody models regeneration (an estimated 1.5-3x), and previews may be billable. Several cheap vendors may also be unusable for this product: Google's 18+ clause, Google grounding's no-caching rule, ElevenLabs Music library rights, Haiku 4.5 retirement, Veo 3.1 Fast deprecation, and promo prices ending 2026-12-31. Without a reconciled model the founder cannot set prices, pick defaults, or know whether a 70%+ gross margin is reachable.

**Brief:**

Build one parametric COGS model and a vendor terms matrix.

(1) Reference videos. Define 4: (a) a 45 s flat/2D Short; (b) a 61-90 s TikTok cut; (c) a 10-min 2.5D MapLibre long-form; (d) a 10-min globe/terrain video with 3-6 AI hero clips. Cost each at 3 tiers: budget, standard and premium.

(2) Prices. Re-verify every unit price on live primary pages and record URL plus date:
- Anthropic: Opus 5.5, Sonnet 5.5, Haiku 4.5 including its retirement status; web search $/1k; web fetch; batch; minimum cacheable tokens per model; cache write and read multipliers. Use platform.claude.com pricing and the model-deprecations page.
- Google Vertex: Gemini Flash/Flash-Lite text; Gemini TTS at both 2026 promo and 2027 list; Chirp 3 HD; Imagen 4; Nano Banana 2 and Pro; Veo 3.1 Lite and Fast with deprecation dates; the successor (e.g., Gemini Omni Flash). Use cloud.google.com pricing pages.
- ElevenLabs: API per-1K rate vs plan credits; v4 models; Music billing per started minute; SFX.
- Compute: AWS Lambda arm; EC2 g4dn, g6 and g6f on-demand and spot; Cloud Run CPU, L4, worker pools, and the 1-minute minimum.
- Hetzner GEX44.
- Cloudflare R2.
- Polar, Paddle and Stripe fees on VAT-inclusive totals.

(3) Remotion render counting. Read the v4 terms (remotion.pro/terms-4-0), the v5 terms.mdx, the @remotion/licensing registerUsageEvent docs, and the Lambda source (packages/serverless/src/handlers/renderer.ts). Determine whether each of these counts as a billable render: self-orchestrated chunk renders, per-scene cached renders, renderStill thumbnails and QA stills, and renderMediaOnWeb drafts. Also determine how the headcount threshold treats contractors. Draft the clarification email to Remotion.

(4) Terms matrix. For every priced vendor, mark green, yellow or red on each of these:
- use inside a SaaS whose end users monetize outputs
- age restrictions (Google Service Specific Terms §20(d))
- caching, storing or sharing outputs across users (Google grounding §20(k); Claude web search encrypted_content)
- training on outputs (Google §17(b); Anthropic Commercial Terms)
- indemnity scope
- music-library or redistribution rights (ElevenLabs Music self-serve vs Enterprise; Lyria)

(5) Token budgets. Ground them by running, or finding published measurements for, one short and one 10-min script plus storyboard generation on the Claude API with structured outputs and effort settings. Capture input, output and thinking tokens. Also find competitor or industry data on regeneration and re-roll rates; if none exists, model 1.0, 1.5, 2 and 3x scenarios.

(6) Render compute. Leave per-frame CPU and GPU seconds as inputs to be filled from the WebGL spike, with ranges.

Deliverable:
- A spreadsheet or table: verified unit prices; cost per stage for each reference video and tier; sensitivity to regeneration rate, render fps and 1080p vs 1440p vs 4K output.
- Gross margin under Area 8's plans ($29/30, $79/100, $199/300, $1.25 top-up) at 55% and 100% utilisation, after payment fees.
- The terms matrix.
- A recommended default routing per tier that keeps blended gross margin at 70% or higher, using only vendors rated green.
- The minimum viable price per finished minute.

### Gap 2: Historical-border and military-geometry data for war and history topics is neither cleared nor complete

**Why it matters:** Era-correct borders, front lines, campaign arrows and occupation zones are the genre's core content and what its pedantic audience judges hardest. The areas disagree on the source: Area 2 says no clean dataset exists, Area 4 says Cliopatria, and Area 5 says GPL historical-basemaps. Cliopatria's CC BY 4.0 grant rests on unresolved provenance: 507 maps hand-traced by Tollefson in 2014 from unknown atlases. It also has measured gaps: sparse before 1000 BCE and outside Europe and the Near East, no front lines or campaigns, and anachronistic names. geoBoundaries is about 38% share-alike, which breaks the proposed Territory Composer. Commercial options (Euratlas, GeaCron, CShapes commercial) have unknown SaaS terms. The LLM-plus-geometry Territory Composer is untested. Until this is resolved, the founder cannot scope which topics v1 can render accurately, or budget for curation.

**Brief:**

Resolve the historical-geodata question with evidence.

(1) Cliopatria provenance memo. Read the OSF preprint (osf.io/preprints/socarxiv/24wd6), the repo README, original_map_images/, and the Zenodo records for github.com/Seshat-Global-History-Databank/cliopatria. Establish which source atlases were traced and whether Tollefson's work was licensed for CC BY release. Summarise the legal risk: US merger doctrine and thin protection for borders as facts vs the EU database right. Rate it low, medium or high.

(2) Commercial and alternative sources. Get current terms and prices, and whether they cover hosted SaaS rendering of user-monetized video, for:
- Euratlas (Extended licence)
- GeaCron (data licensing)
- Centennia historical atlas
- CShapes 2.0 (commercial licence via ETH ICR)
- Chronas
- Running Reality, and any other commercial historical-GIS vendor you find
- the aourednik GPL question: whether rendering-only use creates obligations

(3) OpenHistoricalMap. Measure coverage and licensing through its API, Overpass or taginfo: feature counts by era and region, and the share tagged CC BY or CC BY-SA.

(4) Coverage audit.
- Compile a top-100 topic list for the genre, for example: Rome, Alexander, Three Kingdoms China, Mongols, Crusades, Ottoman expansion, Inca/Aztec conquest, Thirty Years' War, Napoleon 1805-1815, US Civil War, Scramble for Africa, WWI fronts, WWII Eastern Front by month, Partition 1947, Korea, Ukraine 2022+. Rank them by YouTube/TikTok popularity where data allows.
- For each topic, score availability and licence for: polity polygons at the needed time resolution; front lines; campaign routes; battle points and dates (Wikidata SPARQL counts on P625 plus P585/P580).
- Sources to score: Cliopatria (download the GeoJSON and query it), OHM, Wikidata, Pleiades, Itiner-e.

(5) Front lines and campaigns. Find legally clean sources. Test the lead that US-government military atlases are public domain: West Point Department of History atlases, US Army Center of Military History maps and the Green Books, NARA. Estimate the cost of digitising them (hours per map, contractor rates). Confirm that ISW, DeepStateMap and Liveuamap are off-limits, and check whether any of them sells licences.

(6) Territory Composer evidence. Find academic or prior art on reconstructing polity extents from point and control data (Voronoi or cost-distance methods, Seshat methodology, historical-GIS uncertainty representation). Specify a 10-topic test protocol comparing LLM-generated recipes against Euratlas or Cliopatria ground truth by IoU.

Deliverable:
(a) A source-by-licence matrix with a verdict for each: use, avoid or negotiate, plus cost.
(b) A coverage heatmap: top-100 topics by data type.
(c) Cost and time to fill the gaps for the top 50 topics, comparing licensing, commissioning and public-domain atlas digitising.
(d) The Cliopatria provenance memo.
(e) A recommended v1 launch scope (eras and topics that can be done accurately) and the dataset stack to support it.

### Gap 3: No evidence-backed method for making automatically planned scenes reach top-channel visual quality (the 'direction' layer)

**Why it matters:** The founder's main requirement is 'astonishing', not slideshow. Every area converges on a scene DSL, a primitive library, style presets and VLM QA. None shows how an automated system should choose, sequence, frame and time shots the way a motion designer does, or how to measure whether it succeeds. Area 1's pacing and density numbers are estimates or from secondary blogs. Area 5's rubric scores scripts, not visuals. Area 2 notes that LLM storyboards can be valid JSON yet visually incoherent. VLM QA catches defects, not blandness. The same gap drives YouTube 'inauthentic content' risk, because direction that looks templated means customers get demonetized. Without an evidence-based direction design and an evaluation loop, the build risks a generic look, and there is no way to tell when quality is good enough to launch.

**Brief:**

Produce an empirical spec and architecture for automated visual direction.

(1) Reference corpus. Annotate shot by shot 12-15 reference videos across formats:
- Kings and Generals battle
- Epic History campaign
- RealLifeLore 'why' explainer
- Johnny Harris
- PolyMatter
- an EmperorTigerstar or Ollie Bye timelapse
- Wendover
- 4-5 high-performing TikTok/Shorts map accounts

If direct video access is blocked, use transcripts, creator process breakdowns (nofilmschool, premiumbeat, flatpackfx, aescripts, School of Motion, Adobe community threads) and any published frame-by-frame analyses. For each shot record: duration; camera move type; primitives used (with IDs from Area 1's catalog); number of simultaneous new elements; how the visual event relates to the spoken word (lead or lag in frames); transition type; SFX hit; music change. Output distributions per format: shot-length histogram, primitives per minute, camera-move transition grammar (which move tends to follow which), sync offsets, and frequency of pattern interrupts.

(2) Prior art on automated direction. Review systems and papers and extract which techniques have evidence of improving perceived quality: Code2Video (visual anchors), TheoremExplainAgent, Remotion's prompt-to-motion-graphics template, HeyGen HyperFrames agent skills, iart.ai map-animation-skills, Hera (YC S25), automated data-video and data-story generation research, map storytelling and camera-path work (van Wijk-Nuij, Mapbox storytelling, narrative cartography studies), and virtual cinematography and automatic camera planning. Candidate techniques include: a hand-authored shot-template library with parameter variation, retrieval of exemplar storyboards, few-shot prompting from an annotated corpus, best-of-N generation with VLM ranking, and constraint solvers for timing and layout.

(3) Evaluation. Find published evidence on how reliable VLM-as-judge is for video aesthetics and motion quality (e.g., VBench, VideoScore and similar; their correlation with human ratings). Design a human-preference protocol: pairwise comparison against reference clips, rater source and cost (e.g., Prolific), and sample sizes. Use it to calibrate automated scores and to define a launch quality bar.

(4) Recommendation. Propose a direction architecture that turns beat types into shot templates, with LLM choices bounded by validated templates and a variety engine. From the corpus statistics, estimate the minimum template set that covers about 80% of beats per launch preset, and the motion-designer authoring effort in person-weeks.

Deliverable: the annotated corpus (CSV) and summary statistics; a 'shot grammar' spec per format and preset that replaces Area 1's estimates; a prior-art memo graded by strength of evidence; the evaluation protocol with costs; and the MVP template list with effort estimate.
