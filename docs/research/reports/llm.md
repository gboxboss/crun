# AI writing and planning pipeline for automated map-animation videos
**Research date:** 2026-10-01. **Scope:** topic → research → engaging script → storyboard → geospatial grounding; pasted script → storyboard; accuracy and safety; model costs; multiple languages.

## 0. How to read this report (evidence levels)
The research sandbox could only reach these sites: platform.claude.com, anthropic.com, cloud.google.com, GitHub (raw files and code search), PyPI and npm. These were blocked: openai.com, ai.google.dev, api-docs.deepseek.com, openrouter.ai, wikidata.org, wikipedia.org, YouTube and support.google.com, arxiv.org and elevenlabs.io. The shared WebSearch budget was also used up. Every claim is therefore labelled:
- **VERIFIED**: read today on the primary source (URL given).
- **SECONDARY**: read today on a reputable mirror or aggregator. These are the LiteLLM price table (its Gemini rows match Google's own page today, which suggests it is current), Open Terms Archive policy snapshots, and GitHub notes holding timestamped creator transcripts.
- **ESTIMATE / OPINION**: my own modelling or judgment.
- **MEMORY**: from training data, not re-checked today.

## 1. Executive summary
1. **Write scripts in fixed stages controlled by code. Do not use one free-roaming agent.** The stages are: research → cited fact sheet → hook/angle → draft → **two-phase critic** (a blind "cold read" first, then a rubric with hard gates) → targeted rewrite → claim check → **human approval** → TTS alignment → entity resolution → storyboard → deterministic validator and repair → render → frame check by a vision model (VLM QA).
2. **The LLM never produces coordinates or border shapes.** It names entities: Wikidata QIDs or names, plus dates and roles. A deterministic resolver turns those into geometry, and a validator enforces time and space rules. This is the main defence against "the arrow starts in the wrong country".
3. **The storyboard is data, not code.** It is a compact JSON storyboard format (a mini-language, "DSL") for a fixed, tested library of map and motion building blocks ("primitives"). Each beat is tied to word ranges from TTS alignment, so voice changes and translations do not break it. Generating code per video, as Remotion's prompt template and Code2Video/Manim do, is fine for research. It is too brittle for a hosted product.
4. **Recommended model routing (ESTIMATE):**
   - Claude Opus 5.5 for hooks, script and rewrite.
   - Claude Sonnet 5.5 for the critic and storyboard.
   - Gemini 3.5 Flash-Lite for long-context extraction, claim checks and frame checks.
   - Claude Haiku 4.5 for small utility steps.
   - Result: about **$0.52 per 60-second short** and **about $1.80 per 10-minute video** in LLM spend, web search included.
   - A budget tier on Gemini 3.8 Flash costs about **$0.19 / $0.75**. That rises to about $0.31 / $1.26 when Google's introductory price ends on 2027-01-01.
5. **Two policy facts shape the product:**
   - YouTube now explicitly names *"AI-generated content made with generic or unoriginal templates giving the impression of mass production"* as not eligible for monetization (SECONDARY, verbatim policy text).
   - Anthropic's Usage Policy lists *"automatically generate content and publish it for external consumption"* as a high-risk use. High-risk uses require human review and AI disclosure (VERIFIED).
   - Together these require a variety engine, a user approval gate, and disclosure metadata.

---

## 2. What makes explainer scripts keep viewers watching
Below are the most specific public frameworks, each turned into something a machine can check.

| # | Principle | Source (evidence level) | How to operationalize |
|---|---|---|---|
| 1 | **Deliver on the click in 5–10 s**, then add a *specific* intrigue line, then flow straight into the story with no signpost. "Let's get into it" is a signpost; "starting with…" is a bridge. Give necessary context only. | Paddy Galloway, Sweat Equity podcast 2026-02-17, 52:48–59:09 (youtu.be/dAR3d6xnG0o) and Colin & Samir 80:10 (youtu.be/L9CO1FcRHCM). Transcripts via github.com/Pu11en/youtube-money. SECONDARY | Gate: the first ~25 words confirm the title promise. Score: an intrigue line that names a date, person or number. Ban signpost phrases. |
| 2 | **The first minute matters most.** In minutes 1–3, "stop telling people what they will be watching and start showing them" with "crazy progression". Re-engage around minute 3 and minute 6. Put long explanations in the back half. Never signal the end early. "Video endings must always be abrupt." | Leaked MrBeast production guide (2024), transcriptions at github.com/echore/blog and robertnowell/video-essay. SECONDARY | Long form: re-engagement beats at about 3:00 and 6:00, no "finally" or "to wrap up" before the last 10%, end straight after the payoff. |
| 3 | **"But / therefore", never "and then".** Every beat is joined to the last by conflict or consequence. | Trey Parker & Matt Stone (NYU talk, youtu.be/vGUNqq3jVLg), popularized by Kallaway (youtu.be/t5Z-Q1bg1tU 00:28–02:46). SECONDARY | Measure the share of beat links that are causal ("but"/"therefore"). Target ≥ 0.7 and flag any run of "and then" links. |
| 4 | **Three-part hook:** a context lean (topic clarity plus a reason to lean in) → a "scroll-stop interjection" (*but / however*) → a "contrarian snapback". Use short sentences up front, longer ones later. Do not open with vague teasers like "wait till you see this". | Kallaway, youtu.be/LmXpbP7dD48 01:21–04:31 and 7I50PECz7SU. SECONDARY | Hook-pattern check, sentence-length ramp, banned vague openers. |
| 5 | **Open loops with payoffs no more than 60–90 s apart.** Use "soon X, first Y", but both X and Y must be interesting. The "invisible focus group" test: pause at 1, 2 and 4 minutes and ask what the viewer expects next. | George Blackman (writewithai.substack.com, 2024-03-24); Galloway 60:31–62:20. SECONDARY | Critic predicts "what's next" at checkpoints and passes only if the answer is specific. Every opened loop must close. |
| 6 | **Promise structure and active prose.** The title is a promise; reinforce it within the first minute and answer it by the end. Open on action ("look at this map"). Write "who did what to whom" with active agents. End with a reflective zoom-out. | Johnny Harris, David Perell interview 2025-03-12 (youtu.be/zq4b96m1AvM, 10:43–60:38). SECONDARY | Share of sentences with an active agent and verb, count of "look at this" map moments, a single central question stated early and answered late. |
| 7 | **Start from the misconception.** State the common belief, then overturn it. | Derek Muller's PhD research (TEDx youtu.be/RQaW2bFieo8). SECONDARY | Each section opens with an intuitive but wrong belief, then corrects it. |
| 8 | **A "puzzle list", not a random list.** Each section should need the previous one. | Galloway (Colin & Samir 33:01). SECONDARY | Sections must be causally linked. |
| 9 | **Shorts:** the hook must work with sound off in about 3 s; foreshadow the ending within 2 lines; write at 5th-grade reading level; end "satisfied but surprised"; cut the trailing second; design the loop. Pick a length strategy (11–25 s for loops or 40–60 s for watch time). | Jenny Hoyos and Galloway, compiled in robertnowell/video-essay `shorts_bible.md`. SECONDARY. The length bands are contested heuristics. | Gates on hook length, the last line being the payoff, and an explicit loop technique. |
| 10 | **Style without slop.** Banned-word list ("imagine, streamline, realm, game-changer, unlock, discover, skyrocket, abyss, vast, in a world where, revolutionize…"). Mix short, medium and long sentences. Write as if to one friend. | Blackman prompt; Kallaway (citing Gary Provost). SECONDARY | Lexical filter in code plus a sentence-length variance check. |

**Implications for map videos (OPINION):**
- A faceless map video's "re-engagement" is a *visual* turn: a border snapping, an army arrow reversing, a cut from globe to street level, a weather effect landing on the decisive moment.
- The script writer must therefore see the visual building blocks and mark map intent on each line. Use Harris's two-column format: narration on the left, visual intent on the right.
- Specificity (dates, distances, troop numbers, named people) carries most of the weight. It also creates the most accuracy risk, which is why the cited fact sheet is mandatory.

**Pacing anchors (SECONDARY / ESTIMATE):**
- Narration runs about 150 WPM for documentary voice-over and 160–180 WPM for Shorts. A 60-second short is about 150–170 words. 10 minutes is about 1,500 words; 20 minutes about 3,000.
- Change the visual every 2–5 s in Shorts and every 3–8 s in long form, one idea per visual.

---

## 3. The critic rubric (for an LLM judge plus code checks)
**Protocol.** Adapted from robertnowell/video-essay's two-phase judge, which came from a real failure: a single-pass judge passed a contradictory script at 9/10.
- **Phase 0, cold read.** A separate call that sees only the script, no rubric. It answers five questions:
  - What is the claim?
  - For each beat, did understanding get sharper, fuzzier, or stay the same?
  - Did the ending resolve the opening?
  - Which lines confused you? (quoted)
  - What is the one-line "explain it to a friend" summary?
- **Phase A, gates.** All must pass.
- **Phase B, scores** out of 100, using the Phase 0 report as evidence.
- **Different model from the writer.** For example, Sonnet critiques Opus, or Gemini critiques Claude. This reduces self-preference bias (MEMORY: Panickssery et al. 2024, arXiv 2404.13076).
- **Code computes mechanical metrics first:** WPM fit, sentence-length statistics, banned words, readability grade, timestamps of re-hooks, fact-ID coverage. These are passed to the judge as facts.

**Phase A: hard gates (long form and Shorts)**

| Gate | Fails when |
|---|---|
| G1 Click confirmation | The first ~25 words (Shorts: first line, ≤10 words, works with sound off) do not confirm the title/thumbnail promise. |
| G2 No throat-clearing | Greeting, channel name, "in this video we'll…", or "let's get into it" appears in the first 30 s. |
| G3 Grounding | Any number, date, name or quote lacks a fact-sheet ID, or a disputed figure is given without attribution. |
| G4 Central question | No single question by 20 s (Shorts) or 60 s (long form), or it is not answered by the end. |
| G5 Coherence | The cold read marked any beat "fuzzier", the ending only partly resolves the opening, or the friend summary adds hedges the hook did not. |
| G6 Ending | The end is signalled early, a recap coda follows the payoff, or a Short ends on a sign-off or trailing silence. |
| G7 Policy | Glorifies violence or extremism, describes gore, dehumanizes, makes unsupported claims about living people, or shows one-sided framing of a disputed territory without the selected worldview. |
| G8 Length fit | Word count is outside target ±8% at the preset WPM. |

**Phase B: scored dimensions (100 points)**

| Dimension | Pts | What earns points |
|---|---|---|
| Hook strength | 15 | Context lean → *but* interjection → contrarian snapback; a concrete number, name or date; misconception first; sound-off legible (Shorts). |
| Intrigue and open loops | 15 | A specific intrigue line in the intro; no gap longer than 90 s between payoffs (Shorts: 10–15 s); every loop closed; "soon X, first Y" with both sides interesting; the focus-group test passes at 1, 3 and 6 min. |
| Causal chaining | 10 | Causal-link share ≥ 0.7 (full marks ≥ 0.85); no runs of more than two "and then" links. |
| Stakes and agency | 10 | Active agents; a "so what" for the viewer by 0:30; stakes escalate (MrBeast's "stair-stepping"). |
| Specificity and novelty | 10 | Concrete details per minute; at least 3 non-obvious facts (checked against "common knowledge" from a cheap model); second-best point first (Kallaway heuristic). |
| Re-engagement cadence | 10 | Visual or narrative turns at about 3:00 and 6:00 and at each section change (Shorts: about 8–15 s); a pattern interrupt every 30–45 s. |
| Payoff | 10 | The biggest reveal sits in the last third; "satisfied but surprised"; resolves the central question. Shorts: the loop seam is designed. |
| Visual writability (map-native) | 10 | At least 70% of sentences carry a mappable action (move, grow, shrink, route, compare, zoom); one idea per visual; "look at this" moments. |
| Rhythm and word economy | 5 | Sentence-length variance; short sentences early; reading grade ≤ 8 (Shorts ≤ 5). |
| Voice and anti-slop | 5 | No banned words or AI clichés, no stacked hedges, no rhetorical coda. |

**Output (JSON):**
- `gates[]{id, pass, evidence_quote}`
- `scores{}`
- `focus_group[]{t, predicted_next, specific:boolean}`
- `worst_lines[]{line_id, problem, fix}`
- `verdict` (publish / rewrite / reject)

**Thresholds (ESTIMATE):** all gates pass and score ≥ 75 to proceed. Allow at most 2 rewrite loops; then pass the best version to the user with flagged weaknesses.

**Calibration plan (OPINION, essential):**
- Rubric scores are a proxy (Goodhart's law applies).
- Build a golden set of 100 topics with human-ranked script pairs and tune weights to maximize pairwise agreement.
- Once users opt in to YouTube Analytics, regress rubric scores on real average view duration (AVD) and percentage viewed, then re-weight quarterly.

---

## 4. Pipeline architecture

```
TOPIC or PASTED SCRIPT
  │
(0) Intake + risk triage ......... Haiku 4.5 / Flash-Lite → {topic, lang, format, aspect, length, risk_flags, QID guesses}
  │
(1) Research (code) .............. Wikidata/Wikipedia (dumps/APIs) + 3–12 web searches
  │                                 ↕ research cache keyed by QID + freshness TTL (reused across users)
(2) Cited fact sheet ............. Gemini 3.5 Flash-Lite (long context) → facts[]
  │
(3) Angles / hooks / titles ...... Opus 5.5 (effort high) → 3 angles × 5 hooks; user may pick
(4) Script draft (2-column) ...... Opus 5.5 → narration + visual intent + inline [F12] fact IDs
(5) Critic: cold read → gates → scores .. Sonnet 5.5 (different model)  ⟲ ≤2 loops
(6) Targeted rewrite ............. Opus 5.5 (line edits only)
(7) Claim verification ........... code (numbers/dates) + Flash-Lite entailment vs. sources
  │
  ══ HUMAN APPROVAL GATE (script, sources, risk notes) ══
  │
(8) TTS + forced alignment ....... (audio workstream) → word timestamps
(9) Entity resolution ............ code: QID → point / polygon / era border / route; Haiku only for ambiguous candidates
(10) Storyboard .................. Sonnet 5.5 per section; refs entity IDs + primitive catalog + style preset
(11) Validator + repair .......... code (schema, time, space, cadence, safe zones) ⟲ ≤2 → fallback primitive
  │
  ══ optional storyboard preview / per-scene regenerate ══
  │
(12) Render → keyframe VLM QA ..... Gemini 3.5 Flash-Lite on N frames → targeted re-render
(13) Metadata .................... title variants, description with sources, chapters, tags, AI-disclosure flag
```

**Pasted-script path:**
1. Segment into beats.
2. Extract claims and entities.
3. Retrieve and **fact-check as warnings**. Block only on policy violations.
4. Run the rubric and offer *optional* line-level "punch-up" suggestions. The user's wording stays unless they accept a change.
5. Check length fit against the target duration.
6. Join the main flow at step 8.

**Design rules (OPINION, grounded in the sources):**
- **Structured outputs everywhere, with limits in mind.** Claude's strict structured outputs allow **at most 24 optional parameters and 16 union-typed parameters across all schemas in one request**. Recursive schemas are unsupported, and compiled grammars are cached for 24 h (VERIFIED, platform.claude.com structured-outputs doc).
  - A rich storyboard with dozens of primitive types will exceed this.
  - So constrain the *beat skeleton* strictly, and check primitive parameters with AJV/Zod plus a repair loop.
- **Citations vs. JSON.** Claude's native document citations are incompatible with `output_config.format` (returns 400), according to Anthropic's API reference used for this research.
  - So step 2 either (a) uses citations in free text and converts to JSON in a cheap second call, or (b) uses our own `source_id` scheme inside JSON. I recommend (b) for simplicity.
- **Prompt caching layout.** Order the prompt as tools → system (house style guide + rubric + primitive catalog, byte-stable) → style-preset block → per-video content.
  - Cached prefix reads cost 5% of base on Opus 5.5 and 10% on Sonnet/Haiku (VERIFIED).
  - In the model, caching cuts static-prefix cost from about $0.25 to $0.02 per short (ESTIMATE).
  - Never put timestamps or user IDs in the system prompt.
- **Inject only relevant guidance, but keep it cacheable.** Remotion's prompt-to-motion-graphics template does "skill detection" to add only relevant guidance (VERIFIED README).
  - With caching it is cheaper to keep the *whole* primitive catalog static and cached.
  - Add only the selected style preset as a second cached block. A request allows at most 4 cache breakpoints.
- **Effort settings.** Opus 5.5 defaults to `medium` effort, and thinking cannot be turned off (Anthropic SDK reference). Use `high` for hooks and script, `medium` for the critic, `low` or `medium` for the storyboard. Handle `stop_reason: "refusal"` with server-side fallbacks. War and terrorism topics will hit safety classifiers more often than average.
- **Batch API** (50% off on Claude, VERIFIED; Gemini Flex/Batch about 50% off, VERIFIED on Vertex) is not suitable for interactive steps. Use it for nightly pre-research of trending topics, eval runs, and a possible "economy" queue tier.

---

## 5. Storyboard format and primitive catalog
**Timing rule:** beats are tied to **word index ranges** from TTS forced alignment, not seconds. Re-voicing, speed changes and translation then only re-time beats; they do not break them.

**Example of the compact format (illustrative):**
```json
{"video":{"aspect":"9:16","fps":30,"preset":"parchment-war","lang":"en"},
 "entities":[{"id":"E1","qid":"Q12557","kind":"polity","label":"Mongol Empire","at":1220},
             {"id":"E4","qid":"Q5753","kind":"city","label":"Samarkand"}],
 "beats":[{"id":"b07","words":[118,141],"intent":"invasion reaches Samarkand",
   "camera":{"op":"flyTo","fit":["E1","E4"],"pitch":35,"bearing":-12,"ease":"inOutCubic"},
   "layers":[{"op":"border","of":"E1","year":1220,"anim":"grow","from":1218},
             {"op":"arrow","style":"army","from":"E7","to":"E4","via":"route:R2","color":"faction:E1"},
             {"op":"pin","at":"E4","label":true},
             {"op":"fx","kind":"smoke","over":"E4","intensity":0.6}],
   "overlay":[{"op":"date_ticker","value":"1220"}],
   "audio":{"sfx":["horses_far"],"music":"act2_build"}}]}
```

**Primitive catalog shown to the LLM** (each entry: purpose, when to use, parameters, defaults per preset):
- **Camera:** flyTo, fit_bbox, orbit, follow_path, globe_spin, zoom_punch, street-level dive.
- **Map:** border_state(year), border_morph(y1→y2), region_highlight, choropleth(data), route_draw (land/sea/air), arrow (army/naval/migration/trade/supply), frontline, battle_marker, siege_ring, city_pin, label, callout, distance_ruler, size_compare overlay, elevation/terrain emphasis.
- **Effects:** rain, snow, fog, smoke, fire, fog-of-war, night/day, storm, heat haze, sandstorm, flood, explosion flash.
- **Media:** portrait card, flag, unit icons, archival image (Ken Burns), document, quote card.
- **Text and data:** title card, date ticker, counter, bar or line race, lower third.
- **Transitions:** map wipe, era dissolve, whip, match-cut.
- **Audio cues:** sfx, music act change, silence before the payoff.

**Prompting rule:** the storyboard model must **reference entity IDs only**. It may not invent coordinates. If it needs a missing entity, it outputs `{"need_entity":{"name":"…","kind":"…","at":year}}` and the resolver fills it in.

---

## 6. Geospatial grounding
**Recommended pattern: resolve first, then plan (OPINION).** Don't send the storyboard LLM on an open-ended tool loop.
1. **Extract.** In step 2 and again after script approval, an LLM lists entities: `{name, kind (polity/city/region/river/battle/army/route/person), date or date range, role, QID guess}`.
2. **Resolve deterministically.**
   - QID → Wikidata statements: coordinate location (P625), OSM relation (P402), geoshape (P3896), inception and dissolution dates (P571/P576), start and end time (P580/P582), country (P17), "part of" (P361). (MEMORY for property numbers.)
   - Historical borders come from snapshot datasets.
   - Ancient places come from Pleiades.
   - Modern borders come from Natural Earth or geoBoundaries.
   - Ambiguous names get a candidate list, and a cheap LLM picks one using context.
3. **Plan.** The storyboard uses only resolved IDs.
4. **Validate.** Deterministic rules (below).
5. **Repair.** Feed precise error messages back. After 2 failed attempts, **fall back to a safer primitive**: a region highlight instead of a precise frontline, or a straight arrow instead of a routed path.

A tool-using agent (`search_place`, `get_border(polity, year)`, `get_route(a, b, mode, year)`) is reserved for gaps such as custom routes or missing polities. That keeps cost and latency bounded.

**Validation rules (code):**
- Every reference resolves, and its kind matches Wikidata "instance of" (P31) classes.
- The entity existed at the beat's date (inception/dissolution or start/end overlap).
- The border year is within dataset coverage. Snap to the nearest snapshot and **flag if more than 25 years away**.
- Arrow endpoints lie within the source and target polygons or within X km of their points.
- Arrow bearing agrees with words in the narration ("east" → 45°–135°).
- Implied speed is plausible for the era and mode (e.g., an army march of more than about 40 km/day gets flagged).
- Land arrows do not cross open sea unless the mode is naval.
- The camera frame contains every highlighted entity.
- Numbers in on-screen text equal fact-sheet values.
- Label density and per-aspect-ratio safe zones are respected (Shorts UI: top ~250 px, bottom ~400 px and right ~120 px kept clear; SECONDARY).
- Beat length is 2–8 s, and the preset allows the primitive.

**Data reality checks (VERIFIED today):**
- `aourednik/historical-basemaps` is **GPL-3.0** and has only **54 snapshot years** from −123000 to 2010 (e.g., 1914, 1920, 1930, 1938, 1945, 1960, 1994). It cannot drive month-by-month war maps.
- Frontlines and campaign movements therefore need curated per-conflict layers or approximations clearly labelled "approximate". The data/licensing workstream must clear GPL use for a hosted SaaS.
- Natural Earth is public domain (VERIFIED, repo README). Pleiades is CC BY 3.0 (VERIFIED, README).
- Wikidata is CC0 and Wikipedia text is CC BY-SA (MEMORY). Use facts freely, but don't copy Wikipedia sentences into scripts.
- Public Nominatim allows "an absolute maximum of 1 request per second" (policy text quoted in third-party code; primary page not reachable). The Wikidata Query Service limits each client to "60 seconds of processing time each 60 seconds" (same). At SaaS scale, **self-host gazetteers and Wikidata/Wikipedia dumps**.
- AtlasPI (a historical-geography API for agents) exists but is very new: 0 stars, created April 2026. Do not depend on it.

---

## 7. Accuracy and safety
**Reducing invented facts (layered):**
1. **Retrieval first.** The writer may only use facts from the fact sheet, tagged inline as `[F12]`.
2. **Fact sheet schema:** `{id, claim, value, unit, date, entities[QID], sources[{url, title, quote_span, retrieved_at}], confidence, disputed, alt_values[]}`.
3. **Independent agreement.** Key numbers (casualties, troop counts, areas) need two independent sources, or must be attributed ("according to …") or given as ranges.
4. **Claim check.** Split the script into atomic claims. Code compares numbers and dates. A different, cheap model checks that each claim follows from its cited source snippet. This follows the ideas behind FActScore, SAFE and Chain-of-Verification (MEMORY: arXiv 2305.14251, 2403.18802, 2309.11495).
5. **Freshness.** Current-events topics get a short cache TTL and require web sources dated within N days.
6. **Treat retrieved pages as data, never instructions.** Use an allow/deny list of domains and strip prompt-injection text before the content reaches the writer.
7. **Publish sources** in the video description (also good for trust).

**Sensitive content policy (OPINION, informed by VERIFIED and SECONDARY policies):**

| Category | Handling |
|---|---|
| Wars and battles (historical) | Allowed. Neutral, non-glorifying tone. No gore. Casualty numbers attributed. Bodies shown in war-history education are ad-eligible on YouTube; graphic injury only gets limited ads (SECONDARY: YouTube advertiser guidelines snapshot). |
| Genocide and atrocities | Allowed as education. Denial is blocked. Victim-respectful framing. Warn the user about "limited ads" risk. |
| Terrorism and extremist groups | Education only. No recruitment-style or flattering framing. Never reuse a group's own propaganda media. YouTube: educational coverage of foreign terrorist organizations can earn ads; "glorification, denialism, recruitment" earns none (SECONDARY). Anthropic's Usage Policy bans content that promotes violent extremism, with no explicit education carve-out (VERIFIED), so expect refusals and route them. |
| Ongoing conflicts and recent tragedies | Flag events within the last 30 days. Require dated, attributed sources. YouTube "sensitive events" rules: content that "exploits, dismisses, or condones" the war in Ukraine is not monetizable (SECONDARY). |
| Disputed territories | User picks a worldview (neutral de facto with dashed lines, or a country view). Label disputed status. Map display laws vary by country (needs legal input). |
| Living people | Every claim cited. No photorealistic AI portraits of real people (deepfake risk; Anthropic bans synthetic media of political figures meant to deceive, VERIFIED). Use licensed photos or stylized icons. |
| Elections and politics | Balanced framing. No targeting. No synthetic media of politicians (VERIFIED). |

**Moderation stack (ESTIMATE / SECONDARY prices):**
- Intake classifier on Haiku 4.5 or Flash-Lite (about $0.002 per video).
- Output policy check inside the critic (gate G7).
- Optional second opinion from OpenAI `omni-moderation-latest`, listed at $0 (SECONDARY, LiteLLM).
- Alternatively, policy-driven classifiers: `gpt-oss-safeguard-20b` on Groq at $0.075/$0.30, or Llama Guard 3 at $0.20/$0.20 per 1M tokens (SECONDARY).
- Log every block and override.

**Mandatory product controls:**
- A **user approval gate on the script** before render. This satisfies the Usage Policy's high-risk "human-in-the-loop" expectation for auto-published content.
- **AI-use disclosure** in exported metadata.
- **"Variety engine"** to avoid YouTube's "inauthentic content" demonetization: rotate structure templates, presets, music and pacing; ask the user for their own angle or opinion; track how similar a channel's videos are to each other. YouTube *allows* "using AI to edit your video scripts or generate a unique background visual" and rejects "templated storylines… minimal variation" (SECONDARY, Open Terms Archive snapshot, policy update 2025-07-15).

---

## 8. Models, token budgets and cost per video

### 8.1 Prices used (per 1M tokens: input / cached input / output)

| Model | Price | Evidence |
|---|---|---|
| Claude Opus 5.5 | $4 / $0.20 / $20 (batch $2/$10) | VERIFIED platform.claude.com/docs/en/about-claude/pricing |
| Claude Sonnet 5.5 | $2 / $0.20 / $10 (batch $1/$5) | VERIFIED |
| Claude Haiku 4.5 | $1 / $0.10 / $5 | VERIFIED |
| Claude Fable 5.1 | $10 / $0.25 / $50 | VERIFIED (not needed) |
| Claude web search | $10 per 1,000 searches; web fetch free beyond tokens | VERIFIED |
| Gemini 3.1 Pro Preview | $2 / $0.20 / $12 (≤200K context; $4/$18 above) | VERIFIED cloud.google.com/vertex-ai/generative-ai/pricing |
| Gemini 3.8 Flash | $0.75 / $0.075 / $3.75 until 2026-12-31, then $1.50 / $0.15 / $7.50 | VERIFIED (Vertex) |
| Gemini 3.5 Flash | $1.50 / $0.15 / $9.00 | VERIFIED |
| Gemini 3.5 Flash-Lite | $0.30 / $0.03 / $2.50 (Flex/Batch $0.15/$1.25) | VERIFIED |
| Gemini 3.1 Flash-Lite | $0.25 / $0.025 / $1.50 | VERIFIED |
| Grounding with Google Search | 5,000 queries/month free (across Gemini 3 models), then $14 per 1,000 | VERIFIED |
| GPT-5.6 / -terra / -luna | $4/$20, $2/$12, $0.20/$1.20 (cached $0.40/$0.20/$0.02; batch 50%) | SECONDARY (LiteLLM, citing developers.openai.com) |
| GPT-5.5 | $5 / $30 | SECONDARY |
| DeepSeek V4 Flash / V4 Pro (DeepSeek API) | $0.30/$1.20 (cache hit $0.006); $1.32/$3.96 | SECONDARY (LiteLLM) |
| DeepSeek-V3.2, gpt-oss-120b, Llama 4 Maverick, Qwen3-235B, Kimi-K2-Thinking on Vertex | $0.56/$1.68; $0.09/$0.36; $0.35/$1.15; $0.22/$0.88; $0.60/$2.50 | VERIFIED (Vertex Model-as-a-Service) |
| Qwen3.8-Flash / Max (DashScope) | $0.15/$0.47; $2/$6 | SECONDARY |

Note: Claude 4.7+ tokenizers produce about 30% more tokens for the same text (VERIFIED). The estimates below are in Claude tokens.

### 8.2 Token budget per stage (ESTIMATE)
Format: cached static input + dynamic input → output (visible + thinking) × number of runs.

| Stage | 60-s short | 10-min long form |
|---|---|---|
| S1 intake/risk | 2K + 0.3K → 0.3K | same |
| S2 research plan | 2K + 0.5K → 0.5K | 2K + 1K → 1K |
| S4 cited fact sheet | 3K + 30K → 2.5K | 3K + 120K → 8K |
| S5 angles/hooks (+outline) | 8K + 3K → 1.5K + 2K | 8K + 10K → 3K + 4K |
| S6 script draft | 10K + 4K → 0.6K + 3K | 10K + 12K → 3K + 6K |
| S7 critic | 6K + 4K → 1.5K + 2K, ×2 | 6K + 15K → 3K + 4K, ×2 |
| S8 rewrite | 10K + 6K → 0.6K + 2K, ×1.5 | 10K + 15K → 3K + 4K, ×2 |
| S9 claim verification | 2K + 6K → 1K | 2K + 40K → 4K |
| S10 storyboard | 20K + 3K → 5K + 3K | (20K + 4K → 6K + 2K) ×8 sections |
| S11 geo disambiguation | 2K + 4K → 0.8K | 2K + 20K → 4K |
| S12 frame check (VLM) | 3K + 13K (8 frames) → 1K | 3K + 61K (40 frames) → 4K |
| S13 metadata | 2K + 2K → 0.6K | 2K + 6K → 1.5K |
| **Totals** | **~164K in (81K cached) / ~33K out**; 3 searches | **~588K in (226K cached) / ~131K out**; 12 searches |

### 8.3 LLM cost per video (ESTIMATE; includes web search at $10/1K)

| Configuration | 60-s short | 10-min long form |
|---|---|---|
| A Premium: Opus 5.5 writer and critic, Sonnet 5.5 storyboard, Haiku utility | $0.75 | $2.75 |
| B Balanced: Sonnet 5.5 for creative steps, Haiku utility | $0.47 | $1.92 |
| **E Recommended:** Opus 5.5 hooks/script/rewrite; Sonnet 5.5 critic and storyboard (compact format halves storyboard output); Gemini 3.5 Flash-Lite extraction/checks/frames; Haiku utility | **$0.52** | **$1.80** |
| D Hybrid: Opus 5.5 creative, Gemini 3.8 Flash storyboard, Flash-Lite utility | $0.56 | $1.74 |
| C Budget: Gemini 3.8 Flash introductory price plus Flash-Lite | $0.19 | $0.75 |
| C at 2027 list price | $0.31 | $1.26 |

**Sensitivities and levers (ESTIMATE, configuration E):**
- **Thinking tokens double:** $0.75 / $2.40. Thinking is the largest uncertainty, so cap it with effort settings.
- **Reused research** (popular topic, research cached by QID): −$0.05 / −$0.21.
- **Batch API on research and checking stages:** only −3%. Not worth the latency except for pre-research.
- **Storyboard output is the largest long-form item** (about $0.50 in E). Use short keys, preset defaults and generation per section.
- A 20-minute video is roughly 2× long form, about $3.5 in E.

**Bottom line:** LLM spend is likely a minority of total cost per video, next to TTS and rendering (handled by other workstreams). Paying for Opus on the writing steps costs only about $0.25 per short over the budget tier, and it buys the "astonishing" quality bar. **Offer premium writing as the default and the budget routing as a cheaper plan tier.** Re-test against Gemini 3.1 Pro or GPT-5.6-terra once there is an eval set.

---

## 9. Multiple languages
- **LLM quality (VERIFIED, Claude multilingual doc; Sonnet 4.5 score relative to English):**
  - Spanish 98.2%, Portuguese (BR) 97.8%, Italian 97.9%, French 97.5%, Indonesian 97.3%, Arabic 97.2%, German 97.0%.
  - Chinese 96.9%, Japanese 96.8%, Korean 96.7%, Hindi 96.7%, Bengali 95.4%.
  - Swahili 91.1%, Yoruba 79.7%.
  - Anthropic recommends stating the target language in the system prompt and asking for idiomatic native speech.
- **TTS coverage (VERIFIED, ElevenLabs Python SDK README):** Eleven v3 supports "70+ languages", Multilingual v2 29, Flash and Turbo v2.5 32.
- **Approach (OPINION).** Build one *language-independent storyboard*, then **transcreate** (adapt, not translate literally) the narration per language. Transcreation must keep beat boundaries and the hook mechanics; puns and idioms are rewritten, not translated. Then:
  - re-align TTS per language and re-time beats;
  - take map labels from Wikidata multilingual labels (era-appropriate names where available);
  - re-run the critic in the target language with that language's banned-phrase list;
  - handle right-to-left captions (Arabic, Urdu, Hebrew) and CJK line breaking;
  - convert units and dates per locale;
  - adjust pace per language (e.g., Hindi/Urdu documentary about 100–130 WPM, SECONDARY).
- **Suggested launch set (OPINION):** EN, ES, PT-BR, FR, DE, HI, ID, JA. Add AR, KO, IT and TR after testing pronunciation of place names, which is the weakest link: it needs per-language pronunciation lexicons.
- Non-Latin scripts use more tokens. Expect about 1.2–2× LLM cost for those languages (ESTIMATE).

---

## 10. Lessons from open-source prompt-to-video projects (VERIFIED from READMEs/LICENSE files unless noted)

| Project | What it does | Lesson |
|---|---|---|
| ShortGPT (MIT), MoneyPrinterTurbo (MIT), short-video-maker (MIT; Remotion + Kokoro TTS, English only; Whisper captions; Pexels clips) | Script → TTS → captions → stock clips found by keyword search | This produces the "cheap AI slideshow" look: generic stock footage that doesn't match the line, from a single-pass script. These channels are exactly what YouTube's inauthentic-content rule targets. **Don't match visuals by keyword. Plan visuals per beat, map-first, from structured data.** |
| Remotion prompt-to-motion-graphics template | Validation classifier → skill detection → one-shot code generation → sanitize → compile in the browser | Good: cheap gatekeeping classifier and modular "skills" knowledge. Bad fit for SaaS: compiling arbitrary generated code per video (errors, inconsistent quality, security). Use data plus a component library instead. |
| Code2Video (MIT; ICML 2026) | Planner → Coder (Manim) → Critic using a vision model with "visual anchors" for layout; best code from Claude-4-Opus, critic Gemini 2.5 Pro | **A vision-model critic on rendered frames** with an anchor grid catches layout problems text critics miss. Adopt it as stage 12. |
| TheoremExplainAgent (MIT, but README says "research purposes only… do not encourage… commercial applications") | Agentic planning, Manim code, retrieval over Manim docs, visual-fix loop | Agentic planning plus retrieval over docs reduces code errors. MEMORY: the paper reports frequent minor layout issues. Don't reuse the code commercially. |
| OpenMontage (**AGPL-3.0**) | research → proposal → script → scene_plan → assets → edit → compose; storyboard approval gate; cost estimates; reviewer skills | Validates the staged design and the approval gate. **AGPL: use as a design reference only.** |
| robertnowell/video-essay (license not checked) | Claude Code plugin with a two-phase script judge, Shorts rulebook, and retention-aware judging | Adopted its cold-read-then-rubric protocol. Rewrite the rubric text ourselves. |

No mature open-source "map-story" generator turned up in GitHub search. This is evidence of a gap, not proof.

---

## 11. Key risks (detail in the risks list)
- The critic's score may not track real retention.
- Invented facts or map errors on war and genocide topics.
- YouTube demonetizing users' channels as "mass-produced".
- Safety-classifier refusals on war topics.
- Schema limits of structured outputs.
- Thinking-token cost variance.
- The Gemini price step on 2027-01-01.
- GPL/AGPL and research-only licenses in tempting prior art.
- Rate limits of Wikimedia and Nominatim at scale.
- Prompt injection from retrieved web pages.
- Data residency (DeepSeek's own API).
- Mispronounced place names in non-English TTS.


## KEY RECOMMENDATIONS
- Build the writer as a code-orchestrated multi-stage pipeline (intake → research → cited fact sheet → hooks → script → two-phase critic → rewrite → claim check → human approval → entity resolution → storyboard → validator → render → VLM QA) rather than one autonomous agent, because each stage becomes testable, cacheable and cost-bounded.
- Never let the LLM emit coordinates or geometries — it outputs Wikidata QIDs/names + dates + roles, and a deterministic resolver plus validator (temporal, spatial, bearing, plausibility rules) produces the map data, because invented geography is the top accuracy risk in war and history videos.
- Represent the storyboard as compact JSON beats anchored to TTS word indices that reference a fixed, tested primitive library (camera, borders, arrows, routes, effects, media, text), not per-video generated code, because code generation is brittle and unsafe and word anchors survive re-voicing and translation.
- Adopt routing E as the default: Opus 5.5 for hooks, script and rewrite; Sonnet 5.5 for the critic and storyboard; Gemini 3.5 Flash-Lite for long-context extraction, claim checks and frame checks; Haiku 4.5 for utility. That is about $0.52 per short and $1.80 per 10-minute video, because premium writing costs only about $0.25–0.35 more per short than the budget tier.
- Offer a budget plan on Gemini 3.8 Flash plus Flash-Lite (about $0.19 per short, $0.75 per 10-minute video) but price it assuming Google's 2027 list price (about $0.31 / $1.26), because the introductory price ends on 2026-12-31.
- Use a two-phase critic (a blind cold read, then hard gates plus a 100-point rubric built on Galloway, MrBeast, Kallaway, Harris, Parker/Stone, Blackman and Hoyos), run on a different model than the writer, because single-pass self-grading misses contradictions and inflates scores.
- Make script approval by the user mandatory before render (storyboard preview optional) and add AI-use disclosure to exported metadata, because Anthropic's Usage Policy classes auto-generated, externally published content as a high-risk use needing human review and disclosure.
- Ship a variety engine (rotating structure templates and presets, a user-supplied angle, similarity tracking across a channel), because YouTube's July 2025 'inauthentic content' rule demonetizes templated, mass-produced AI videos, which would churn customers.
- Keep static prompt prefixes byte-stable and cached (style guide, rubric, primitive catalog), and cache research per Wikidata QID with a freshness TTL for reuse across users, because caching cuts static-input cost about 10x and reuse saves about 10% more.
- Use strict structured outputs only for the beat skeleton, and check primitive parameters with AJV/Zod plus at most 2 repair loops and a fallback primitive, because Claude's strict mode caps a request at 24 optional and 16 union-typed parameters.
- Self-host Wikidata/Wikipedia dumps and gazetteers, and keep paid web search to about 3 queries per short and 12 per long video ($10 per 1,000 on Claude), because the public Wikidata Query Service and Nominatim limits rule out SaaS-scale use.
- Add a sensitive-topic policy layer (war, genocide, terrorism, disputed territory, living people, events under 30 days old) that adjusts tone, requires attributed numbers, picks a border worldview, and routes model refusals to fallbacks, because these topics are the product's core and the riskiest.
- Go multilingual by building one language-independent storyboard and adapting (not literally translating) the narration per language, with Wikidata multilingual map labels. Launch with EN, ES, PT-BR, FR, DE, HI, ID and JA, because LLM and TTS quality is strongest there.
- Build an eval harness before scaling: 50–100 golden topics, human-ranked script pairs, unit tests for map accuracy, and later rubric weights re-fitted against opted-in YouTube retention data, because rubric scores are only a proxy.
- Treat AGPL (OpenMontage), GPL (historical-basemaps) and research-only (TheoremExplainAgent) projects as design references only, because their code or data can create licensing obligations for a hosted SaaS.

## COST ITEMS
- Claude Opus 5.5 input: $4.00 / per 1M input tokens (cache read $0.20; 5-min cache write $5; batch $2) (VERIFIED 2026-10-01. Cache hits on Opus 5.5 cost 0.05x base.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Opus 5.5 output: $20.00 / per 1M output tokens (batch $10) (VERIFIED. Thinking tokens are billed as output.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Sonnet 5.5: $2.00 in / $0.20 cached / $10.00 out / per 1M tokens (batch $1/$5) (VERIFIED) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Haiku 4.5: $1.00 in / $0.10 cached / $5.00 out / per 1M tokens (batch $0.50/$2.50) (VERIFIED) https://platform.claude.com/docs/en/about-claude/pricing
- Claude Fable 5.1: $10 in / $0.25 cached / $50 out / per 1M tokens (VERIFIED; not recommended for this pipeline) https://platform.claude.com/docs/en/about-claude/pricing
- Claude web search tool: $10 / per 1,000 searches (plus tokens of results) (VERIFIED. Web fetch has no extra charge beyond tokens.) https://platform.claude.com/docs/en/about-claude/pricing
- Claude data-residency multiplier (inference_geo=us): 1.1x / multiplier on all token prices (VERIFIED; only if US-only inference is required) https://platform.claude.com/docs/en/about-claude/pricing
- Gemini 3.8 Flash (Vertex, global): $0.75 in / $0.075 cached / $3.75 out / per 1M tokens, introductory through 2026-12-31 (VERIFIED. Becomes $1.50 / $0.15 / $7.50 from 2027-01-01. Flex/Batch about 50% off.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.5 Flash-Lite (Vertex, global): $0.30 in / $0.03 cached / $2.50 out / per 1M tokens (Flex/Batch $0.15 / $1.25) (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.1 Flash-Lite: $0.25 in / $0.025 cached / $1.50 out / per 1M tokens (batch $0.125 / $0.75) (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.5 Flash: $1.50 in / $0.15 cached / $9.00 out / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Gemini 3.1 Pro Preview: $2 in / $0.20 cached / $12 out (<=200K); $4 / $18 above 200K / per 1M tokens (batch $1 / $6) (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Grounding with Google Search (Gemini 3): $14 per 1,000 grounding queries after 5,000 free per month / per query (VERIFIED. Grounding input tokens are not charged.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- OpenAI GPT-5.6 / GPT-5.6-terra / GPT-5.6-luna: $4/$20; $2/$12; $0.20/$1.20 (cached $0.40/$0.20/$0.02) / per 1M tokens in/out; batch and flex 50% off (SECONDARY (LiteLLM table citing developers.openai.com/api/docs/pricing); openai.com was blocked, so verify on the primary page) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- OpenAI GPT-5.5: $5 in / $30 out / per 1M tokens (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- OpenAI omni-moderation-latest: $0 / per request (SECONDARY; verify current free status with OpenAI) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- DeepSeek V4 Flash (DeepSeek API): $0.30 in / $0.006 cache hit / $1.20 out / per 1M tokens (SECONDARY (citing api-docs.deepseek.com). Data is processed by a China-based provider. Also on Fireworks at $0.14 / $0.28 per LiteLLM.) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- DeepSeek V4 Pro (DeepSeek API): $1.32 in / $3.96 out / per 1M tokens (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- DeepSeek-V3.2 on Vertex MaaS: $0.56 in / $1.68 out (cache $0.056; batch $0.28/$0.84) / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- gpt-oss-120b on Vertex MaaS: $0.09 in / $0.36 out / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Llama 4 Maverick / Scout on Vertex MaaS: $0.35/$1.15; $0.25/$0.70 / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Qwen3-235B-A22B-Instruct-2507 on Vertex MaaS: $0.22 in / $0.88 out / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Kimi-K2-Thinking on Vertex MaaS: $0.60 in / $2.50 out / per 1M tokens (VERIFIED) https://cloud.google.com/vertex-ai/generative-ai/pricing
- gpt-oss-safeguard-20b on Groq (policy classifier): $0.075 in / $0.30 out / per 1M tokens (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Llama Guard 3 8B on Groq: $0.20 in / $0.20 out / per 1M tokens (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Google Gemini TTS (3.8 Flash TTS preview): $0.50 per 1M text input tokens / $9.00 per 1M audio output tokens (doubles 2027-01-01) / per 1M tokens (VERIFIED; relevant to the multilingual workstream. Chirp 3 HD voices $30 per 1M characters.) https://cloud.google.com/text-to-speech/pricing
- Estimated LLM cost per 60-s short, routing E (recommended): $0.52 / per video (includes 3 web searches) (ESTIMATE from the token model; range $0.46 (research reused) to $0.75 (thinking x2)) https://platform.claude.com/docs/en/about-claude/pricing
- Estimated LLM cost per 10-min video, routing E: $1.80 / per video (includes 12 web searches) (ESTIMATE; $2.40 if thinking doubles; a 20-min video is about $3.5) https://platform.claude.com/docs/en/about-claude/pricing
- Estimated LLM cost, budget routing C (Gemini 3.8 Flash + Flash-Lite): $0.19 short / $0.75 long (2027 price: $0.31 / $1.26) / per video (ESTIMATE) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Estimated LLM cost, premium routing A (Opus 5.5 writer and critic): $0.75 short / $2.75 long / per video (ESTIMATE) https://platform.claude.com/docs/en/about-claude/pricing

## RISKS
- The critic rubric may not track real retention (Goodhart's law): the scripts can learn to please the rubric rather than viewers. Mitigate with human pairwise evals and re-fitting weights on opted-in YouTube Analytics data.
- Invented or approximate facts and geography in war, genocide or ethnic-conflict videos could cause reputational and legal damage. Historical border data is coarse (54 snapshot years in historical-basemaps), so frontlines and campaigns need curated layers or clear 'approximate' labels.
- Users' channels could be demonetized under YouTube's 'inauthentic content' rule (July 2025) if the output looks templated or mass-produced. That drives churn, so variety and originality controls are product-critical.
- Anthropic's Usage Policy treats auto-generated, published content as high-risk. Without a human approval gate and AI disclosure, the use could breach the policy.
- Safety-classifier refusals (Opus 5.5 and Sonnet 5.5 have broader classifiers) on terrorism, genocide or war topics could break the pipeline mid-run. Server-side fallbacks and alternate-provider routing are needed.
- Strict structured-output limits (24 optional / 16 union parameters) and grammar-compile failures mean a rich storyboard schema cannot be fully constrained. Malformed or semantically invalid JSON must be caught by validators and repair loops.
- Cost variance: thinking tokens can double LLM cost per video; the newer Claude tokenizer uses about 30% more tokens; long-form storyboard output scales with video length.
- Price and model churn: Gemini 3.8 Flash's introductory price doubles on 2027-01-01. Preview models (e.g., Gemini 3.1 Pro Preview) can change or be retired. OpenAI and DeepSeek prices here are secondary and unverified.
- License contamination: AGPL (OpenMontage), GPL-3.0 (historical-basemaps code and data), research-only (TheoremExplainAgent), and CC BY-SA if Wikipedia sentences are copied verbatim into scripts.
- Rate limits and terms of free public services (public Wikidata Query Service, Nominatim at a maximum of 1 request per second) rule out SaaS scale. Self-hosted dumps and gazetteers are required.
- Prompt injection from retrieved web pages during research could steer scripts or leak system prompts. Retrieved content must be treated strictly as data, with domain allow-lists.
- Disputed borders and place names can be politically sensitive or legally restricted in some countries (map display laws), and this affects localization.
- Defamation risk in claims about living people and in user-pasted scripts presented as fact.
- Multilingual quality: place-name pronunciation in TTS, right-to-left and CJK captions, and weaker LLM and TTS quality in lower-resource languages.
- Latency: a 13-stage pipeline with critic loops may take minutes for a short and 10+ minutes for long form, which hurts UX unless stages are parallelized and progress is streamed.
- Data residency: routing to China-hosted DeepSeek or to US-only endpoints affects enterprise and EU customers and price (the US-only multiplier is 1.1x on Claude).

## QUESTIONS FOR FOUNDER
- What is your target retail price per video (or per plan) and your target gross margin? This decides whether premium routing (about $0.52 per short in LLM spend) is the default or a paid upgrade.
- Which provider accounts can you open now (Anthropic API, Google Cloud/Vertex, OpenAI, Groq)? Are you willing to use China-hosted APIs (DeepSeek) or open-weights hosts to save cost?
- Do you need data residency (EU or US-only processing) for any customer segment? On Claude, US-only inference costs 1.1x.
- Will you require users to approve the script (and optionally the storyboard) before rendering? I recommend making it mandatory for policy and quality reasons.
- What is your stance on sensitive topics: ongoing wars, genocide history, terrorism, disputed territories? Which border worldview should be the default, and should users be able to switch it?
- For user-pasted scripts with factual problems, should the system only warn, block, or offer automatic correction?
- What turnaround time do you promise (minutes or hours)? Is a cheaper slower 'economy' tier acceptable? This decides Batch API use.
- Which languages are in scope at launch, and in which markets do you expect your first paying users?
- May the system cache and reuse research across users for popular topics (never their private pasted scripts)?
- Will you ask users to connect YouTube Analytics (OAuth) so we can calibrate the script rubric against real retention? Are you comfortable with the privacy and consent work involved?
- Do you want 'creator-style' presets named after real channels? I recommend descriptive names instead, for legal and ethical reasons.
- What budget is available for a human evaluation panel (rating scripts and checking map accuracy) during the first 2–3 months?
- Should exported videos include automatic AI-disclosure text and a source list in the description by default?
- Will you subscribe to Wikimedia Enterprise or self-host Wikipedia/Wikidata dumps, and do you have a legal adviser to review GPL/AGPL/CC-BY-SA obligations and map-display laws?