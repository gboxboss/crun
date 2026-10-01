# Map-Animation Video SaaS: architecture, stack, operations, trust & safety, roadmap

*Research area: system architecture, engineering stack, operations, trust & safety, legal, and team/timeline. Prepared 2026-10-01.*

**How to read this.** **[V]** means VERIFIED. I read it from a primary source in this session, usually the vendor's own docs repo on GitHub, because the vendor sites were blocked by the research sandbox's egress proxy. The URL is given inline. **[S]** means it comes from a secondary source, such as a dated third-party snapshot or a docs mirror. **[E]** means it is my estimate or opinion. WebSearch was unavailable (the session budget was exhausted), so some pricing pages could not be fetched directly. Those items are marked [S] or [E] and listed for fact-checking.

---

## 1. Executive summary

1. **The product is a pipeline compiler, not a video editor.** A topic goes through research, script, a **scene DSL** (typed JSON) and asset/voice resolution, and then a deterministic React render (Remotion). Everything after the script is driven by the scene DSL. The AI writes it, the editor patches it, and the renderer consumes it. That one decision makes per-scene regeneration, style switching, aspect-ratio re-layout and cheap re-renders possible.
2. **Use TypeScript end to end.** That covers Next.js, the Remotion Player for in-browser preview, Remotion compositions, the zod schemas for the DSL, and Trigger.dev (or Inngest) for orchestration. Use Python only inside isolated containers, for forced alignment, GIS preprocessing and any self-hosted models.
3. **Orchestration: start with Trigger.dev Cloud.** It is Apache-2.0 and self-hostable, has no task timeouts, and provides waitpoints and realtime progress. Keep heavy rendering **off** its compute: its large-1x machine costs about 3.9x Cloud Run per vCPU-second. Inngest is a close alternative and is cheapest per step. Temporal Cloud now has a **no-base-fee Developer plan** and is the "graduate to" option.
4. **Put the render backend behind an adapter.** Start with Remotion Lambda (scales to zero, up to 200-way parallel chunks). Move bulk and long-form work to Cloud Run Jobs, GPU instances or your own CPU fleet once the spike's WebGL benchmark and your volume justify it. Per vCPU-second, Lambda and Cloud Run cost about the same. Lambda's advantage is parallelism, and only dedicated or reserved boxes are much cheaper.
5. **Fixed infrastructure cost is small.** Expect roughly $100–250/month at 100 videos/month, $300–700 at 1,000, and $1.5–3k at 10,000 [E]. Variable cost per video is dominated by LLM, TTS, image generation and render compute, so the margin levers are **content-addressed caching, scene-level re-render and budget caps**.
6. **Trust and safety is a core feature here.** The product's genre is war, atrocities, extremism history and disputed borders. Generic moderation APIs over-flag it. You need a custom "educational/documentary" policy layer, claim checking for statements about living people and ongoing conflicts, a configurable "worldview" for disputed borders, and **EU AI Act Art. 50 machine-readable marking (C2PA) from launch day**.
7. **The biggest business risk is outside your code.** YouTube's July 2025 **"inauthentic content"** policy demonetizes mass-produced, template-looking channels [V]. The product has to push variation and human input, or your customers' channels get demonetized and they churn.

---

## 2. Reference architecture (text diagram)

```
                          +-----------------------------------------------+
 Browser (Next.js app)    |  Editor: Script doc | Storyboard | Inspector  |
  - Remotion <Player>     |  Map handles (MapLibre/deck.gl) | AI command  |
    (free in-browser      +----------------------+------------------------+
     preview, no render)                         | JSON-Patch edits, uploads (presigned)
                                                 v
 +--------------------------------------------------------------------------------+
 | API / BFF: Next.js route handlers or tRPC (Vercel or Cloudflare)               |
 |  auth, projects, credit ledger, rate limits (Upstash), moderation pre-check    |
 +----------+-----------------------------+-----------------------+---------------+
            |                             |                       |
            v                             v                       v
   Postgres (Supabase/Neon)        Upstash Redis           Billing (Paddle/Polar MoR
   projects, scene DSL versions,   rate-limit buckets,     or Stripe Billing+Tax)
   jobs, job_steps, artifacts,     locks, idempotency      -> webhooks -> credit ledger
   credit_ledger, moderation,
   audit_log
            ^
            | step status / artifact refs
 +----------+---------------------------------------------------------------------+
 | ORCHESTRATOR (Trigger.dev tasks; alt: Inngest / Temporal)                      |
 |  research -> outline -> script -> [moderate+claim-check] -> storyboard(DSL)    |
 |  -> (waitpoint: user review, optional) -> fan-out per scene:                   |
 |       geo/asset resolve | image/icon pick | TTS + forced alignment             |
 |  -> timing lock -> render fan-out -> mux/mix -> QA -> C2PA sign -> deliver     |
 +---+-----------+--------------+---------------+-------------+-------------------+
     |           |              |               |             |
     v           v              v               v             v
  Claude API   Moderation     TTS / music    RENDER ADAPTER   QA worker (ffmpeg +
  (+web search, OpenAI omni   SFX libs,      - Remotion Lambda  VLM frame review:
  batch, cache) (free) +      aligner        - Cloud Run Jobs   Gemini Flash-Lite /
               policy LLM     (Python ctr)   - own CPU/GPU pool Claude Haiku)
                                                 |
                                                 v
                     Cloudflare R2 (content-addressed artifacts cas/<sha256>,
                     PMTiles map tiles, final MP4/SRT/thumbnails; zero egress)
                                                 |
                                                 v
                        Presigned download / CDN / (later) YouTube & TikTok upload
 Side-cars: PostHog (product analytics), Sentry (errors), Langfuse or PostHog
 (LLM traces and cost per step), status page, support inbox.
```

**Principles**

- **Postgres is the source of truth for state. The workflow engine is only the executor.** If you ever switch engines (Trigger.dev, Inngest or Temporal), project and job state survive.
- **Every step is a pure function with a cache key:**
  `key = sha256(stepName, stepVersion, canonicalJSON(inputs), modelId, styleVersion, rendererBundleHash)`.
  Outputs go to `r2://cas/<key>` and an `artifacts` row that records bytes, cost_usd, provider and latency. A step whose key already exists is **SKIPPED (cache hit)**. This one mechanism gives you idempotency, retries, partial regeneration and per-step cost accounting [E].
- **Scenes render as independent chunks** with about 0.5 s head/tail handles. Global layers (music bed with ducking, captions, transitions at cut points) are applied in a cheap final ffmpeg pass. Editing scene 7 re-renders only scene 7.

---

## 3. Job orchestration

### 3.1 Options compared

| Engine | Model | Pricing (verified unless marked) | Fit for this product |
|---|---|---|---|
| **Trigger.dev** | Managed TS tasks on their compute; no timeouts; `triggerAndWait`/batch fan-out; waitpoints; realtime React hooks; idempotency keys; Apache-2.0 self-host | Free $0 (incl. $5 usage), Hobby $10/mo, Pro $50/mo (usage credit equal to fee); **$0.000025/run**; compute micro $0.0000169/s … large-1x (4 vCPU/8 GB) **$0.00034/s**, large-2x (8 vCPU/16 GB) $0.00068/s [S: docs mirror dated Jun 2026, https://raw.githubusercontent.com/reclear-io/llmref/main/registry/trigger-dev/2026.07.02/llms-full.txt; official https://trigger.dev/pricing]. Concurrency: Free 20 / Hobby 50 / Pro 200+ prod; 14-day max queued TTL [V: https://github.com/triggerdotdev/trigger.dev/blob/main/docs/limits.mdx]. License Apache-2.0 [V: repo LICENSE] | **Best DX for a solo TS founder.** Watch compute price: use it for orchestration and API steps, not frame rendering. |
| **Inngest** | Orchestrates functions you host (serverless or servers); steps are memoized; flow control | Hobby free: 50k executions/mo, 5 concurrent steps. **Pro $99/mo: 1M executions, then $50/M; 100 concurrency then $25 per 25** [V: https://github.com/inngest/website/blob/main/components/RedesignedPricing/plans.ts]. Step timeout up to 2 h (subject to host); 1,000 steps/function; 4 MiB step return; "a run with five steps uses six executions" [V: https://github.com/inngest/website/blob/main/pages/docs/durable-execution/limits.mdx]. Server is SSPL with Apache-2.0 future license [V: inngest/inngest LICENSE.md] | Cheapest per step; you run the compute (Cloud Run, Fly, etc.). Good alternative. |
| **Temporal** | Gold-standard durable execution; you host workers; deterministic workflow code | **Developer plan: no base fee, 10% of usage; $50 per 1M Actions**; Business: greater of $500/mo or 10%; active storage $0.042/GBh, retained $0.00105/GBh [V: https://github.com/temporalio/documentation/blob/main/docs/evaluate/cloud/pricing.mdx → https://docs.temporal.io/cloud/pricing]. Server MIT [V] | Most robust for complex sagas; steeper learning curve. Graduate here if you outgrow the others. |
| **Hatchet** | Postgres-backed queue and workflows; MIT; Cloud or self-host | Cloud Developer: 100k runs/mo free, then ~$10/M [S: https://github.com/api-evangelist/hatchet/blob/main/plans/hatchet-plans-pricing.yml]; MIT [V: repo LICENSE] | Good self-host option on your own Postgres; smaller ecosystem. |
| **BullMQ** | Redis queue library (MIT) | Free plus Redis (Upstash PAYG $0.20/100k commands, fixed 250 MB $10/mo [V: https://github.com/upstash/docs/blob/main/redis/overall/billing.mdx]) | Fine as a **render worker queue**. You would hand-build durability, DAGs and human-in-the-loop. |
| **AWS Step Functions** | JSON state machines | Standard **$0.000025/state transition** (first 4,000 free); Express $1/M requests + $0.00001667/GB-s [V: AWS Price List API, AmazonStates us-east-1, https://aws.amazon.com/step-functions/pricing/] | Natural if you go all-in on AWS with Remotion Lambda, but poor DX and ASL lock-in. |

**Per-video orchestration cost [E].** A 60 s Short has about 60 steps. A 10-min video has about 400.
- **Inngest:** about $0.003 for the Short and $0.02 for 10 min.
- **Temporal:** about 3 actions per activity, giving $0.01–0.06.
- **Trigger.dev:** run fees are negligible. Compute while waiting on HTTP APIs is billed, so put API-calling tasks on `micro`. That gives about $0.01–0.04 for a Short and $0.1–0.3 for long-form.
- **Conclusion:** orchestration is never the cost problem. Rendering on the orchestrator's compute would be.

**Why not render on Trigger.dev compute?** Its large-1x is 4 vCPU/8 GB at $0.00034/s. On Cloud Run the same shape is 4×$0.000018 + 8×$0.000002 = **$0.000088/s** [V: https://cloud.google.com/run/pricing, instance-based Tier 1], about 3.9x cheaper. Lambda at 10 GB (6 vCPU) ARM is about $0.0000222 per vCPU-s, roughly at parity with Cloud Run [V: $0.0000133334/GB-s ARM, AWS Price List API]. Cloudflare Containers cost $0.000020/vCPU-s plus $0.0000025/GiB-s [V: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/pricing.mdx]. Cloud Run also offers NVIDIA L4 GPUs at $0.0001867/s (non-zonal) [V], which matters if the spike shows software WebGL is the bottleneck.

**Recommendation.** Use Trigger.dev Cloud (Hobby, then Pro) for the MVP, with workflow code written against a thin `Pipeline` interface. Rendering calls out to a `RenderBackend` adapter. Revisit at about 5k videos/month: either self-host Trigger.dev (Apache-2.0) or move to Inngest or Temporal if per-run economics or reliability demand it.

### 3.2 Video job state machine

```
DRAFT
  └─(submit topic | paste script)──► INTAKE_MODERATION ──fail──► BLOCKED (reason, appeal)
                                         │pass
                                         ▼
RESEARCHING (web search + source cache; citations stored)
  ▼
OUTLINING ──► SCRIPTING (hook/retention passes) ──► CLAIM_CHECK + SCRIPT_MODERATION
                                                        │ flagged ► NEEDS_USER_EDIT (waitpoint)
                                                        ▼
                                           [SCRIPT_REVIEW waitpoint]  (auto-approve in 1-click mode)
  ▼
STORYBOARDING (scene DSL; zod validate; auto-repair ≤2 tries) ──► [STORYBOARD_REVIEW waitpoint, optional]
  ▼
CREDIT_RESERVE (estimate → hold credits; insufficient ► AWAITING_PAYMENT)
  ▼
PER-SCENE FAN-OUT (parallel; each with cache check):
   ├─ GEO_RESOLVE (boundaries/era data, routes, camera bounds per aspect ratio)
   ├─ ASSET_RESOLVE (icons, flags, portraits, generated/stock images, SFX)  ─► asset moderation
   └─ VOICE (TTS ─► forced alignment ─► word timestamps)
  ▼
TIMING_LOCK (scene durations from audio; caption cues; music cue points)
  ▼
PREVIEW_READY  (Remotion Player preview in browser: zero render cost)
  ▼
RENDERING (fan-out: one chunk per scene or frame range; retries per chunk)
  ▼
MUX_MIX (concat, transitions at cuts, VO + music ducking + SFX, EBU R128 loudness)
  ▼
QA (deterministic checks + sampled VLM review)
   ├─ fail(fixable) ► AUTO_FIX (re-render affected scenes, ≤2 loops) ► QA
   └─ fail(hard)    ► NEEDS_REVIEW (user notified; credits released)
  ▼
PACKAGING (C2PA manifest, thumbnails, SRT/VTT, title/description/chapters)
  ▼
DELIVERED (R2; email/webhook; CREDIT_SETTLE = actual cost ≤ reserved)
Terminal: FAILED (auto-refund reserve), CANCELED (refund unused), BLOCKED
Every step: PENDING → RUNNING → SUCCEEDED | FAILED(attempt n) | SKIPPED_CACHED
```

**Idempotency and partial regeneration [E: design]**

- **Job and step keys.** Job steps carry `(job_id, step_key)` unique constraints. External calls use idempotency keys where supported (billing, Trigger.dev `idempotencyKey`). The credit ledger is double-entry with unique `(job_id, entry_type)`, so a retried settle never double-charges.
- **Edit → invalidate → recompute.** The editor emits JSON-Patch ops. The server computes which DAG nodes' input hashes changed and enqueues only those. For example:
  - Editing scene 4's narration re-runs TTS(4), alignment(4), timing lock, render(4) and the mux. Scenes 1–3 and 5–N are cache hits.
  - A style switch changes `styleVersion`, which re-renders every scene but reuses research, script, TTS and assets.
  - An aspect-ratio switch re-runs GEO_RESOLVE camera framing (a 9:16 frame needs different `fitBounds` padding and zoom, not a crop) plus the renders.
- **Versioning.** Each accepted edit creates a `project_version` (DSL snapshot plus patch). Undo and redo are patch inverses. "Regenerate scene" creates a sibling variant the user can pick.

### 3.3 Remotion licensing interacts with chunking (important)

- **Who needs a paid license [V].** Remotion is free for individuals and organizations of **up to 3 people**, including SaaS automation. Larger companies building "video editors, prompt-to-video tools, automated video pipelines or using the Remotion Player" need **Remotion for Automators: $0.01 per render, $100/month minimum**. Creators seats are $25/mo, Enterprise starts at $500/mo. Source: https://www.remotion.dev/docs/license/faq (repo: packages/docs/docs/license/faq.mdx; constants `RENDER_UNIT_PRICE = 10` per 1,000 and `$100/mo minimum` in packages/promo-pages/src/components/homepage/FreePricing.tsx).
- **What counts as a render [V].** "1 render is the successful generation of a video, audio, GIF, still image or PDF", and Player/Studio previews do not count. Every `renderStill()` thumbnail and every separately invoked scene-chunk `renderMedia()` therefore plausibly counts as a render.
  - One `renderMediaOnLambda()` call with internal chunking costs 1 render.
  - Twenty self-orchestrated scene renders plus a thumbnail could cost 21 renders, or **$0.21/video** [E].
- **Action:** ask Remotion in writing how scene-chunk caching is counted before you exceed 3 people.
- **Cloud Run variant [V].** `@remotion/cloudrun` is "in Alpha status and not actively being developed" (https://www.remotion.dev/docs/cloudrun). On GCP, use the generic Node SSR APIs in a Cloud Run Job instead. A Vercel Sandbox renderer exists but is experimental [V: docs/vercel/index.mdx].

---

## 4. Stack recommendation and costs

### 4.1 Stack table

| Layer | Recommendation | Price (status) | Why / alternatives |
|---|---|---|---|
| Language | **TypeScript monorepo** (pnpm + Turborepo); Python microservices only for alignment, GIS and self-hosted models | n/a | One type system for DSL, editor, renderer and pipeline. |
| Frontend | Next.js (App Router), Tailwind + shadcn/ui, Zustand + Immer patches, **Remotion Player** for preview, MapLibre GL + deck.gl for map handles | Player use falls under Automators if >3 people [V] | Player preview = zero render cost per edit. |
| Hosting (web) | Vercel Pro (simplest for Next.js), or Cloudflare Workers Paid **$5/mo** [V: cloudflare-docs workers/platform/pricing.mdx] | Vercel ≈ $20/seat/mo + usage [E, unverified] | Keep web tier stateless. |
| DB | **Supabase Pro $25/mo** (incl. 100k MAU auth; then $0.00325/MAU; 8 GB disk then $0.125/GB; 250 GB egress then $0.09/GB) [V: https://github.com/supabase/supabase/blob/master/packages/shared-data/plans.ts]; or **Neon Launch** $0.106/CU-hour, storage $0.35/GB-mo, no minimum [V: https://github.com/neondatabase/website/blob/main/content/docs/introduction/plans.md] | see left | Supabase also bundles Auth and Realtime: fewer vendors for a solo founder. |
| Auth | Supabase Auth (bundled), or **Better Auth** (MIT [V]) with Neon | Clerk: Hobby 50k MRU free, Pro $25/mo, $0.02/MRU 50–100k [S: snapshot of clerk.com/pricing 2026-05-09] | Avoid per-user auth fees for a consumer-scale funnel. WorkOS only for later enterprise SSO. |
| Orchestration | **Trigger.dev** (see §3) | Hobby $10 → Pro $50/mo + usage [S] | Inngest Pro $99 [V] as alternative. |
| Render | Remotion (Lambda first) behind an adapter | Lambda $0.0000133334/GB-s ARM, $0.20/M requests [V: AWS Price List API]; Remotion "Hello World" render ≈ $0.001 [V: docs/lambda/cost-example.mdx]; Lambda max 15 min/function, max 200 concurrency per render, 1,000 account default [V: docs/lambda/limits.mdx, concurrency.mdx] | Cloud Run Jobs / GPU (L4 $0.0001867/s [V]) once benchmarked. |
| Object storage | **Cloudflare R2**: $0.015/GB-mo, IA $0.01; Class A $4.50/M, Class B $0.36/M; **egress free**; free tier 10 GB, 1M A, 10M B [V: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/pricing.mdx] | see left | Video downloads are egress-heavy; R2 removes that cost. Host PMTiles map tiles here too. |
| Cache / rate limit | Upstash Redis PAYG $0.20/100k cmds; free 500k cmds [V] | | `@upstash/ratelimit` token buckets. |
| Payments | **Merchant of Record at launch**: Polar (Starter 5%+50¢; Pro $20/mo 3.8%+40¢; Growth $100/mo 3.6%+35¢; Scale $400/mo 3.4%+30¢; +1.5% intl; $15/dispute) [V: https://github.com/polarsource/polar/blob/main/docs/merchant-of-record/fees.mdx] or Paddle (5%+50¢) [S] | Stripe direct: 2.9%+30¢ US cards; Billing PAYG **0.7%** of billing volume; Stripe Tax 0.5%/txn; Stripe Managed Payments (MoR, preview) **+3.5%** on top [S: G2 snapshot of stripe.com/billing/pricing 2026-07-01; github.com/BoilerHAUS/EPSCAxplor payments-comparison] | Global creator audience means VAT/GST in dozens of countries; MoR absorbs that. Revisit Stripe Billing + Tax at ≈$50–100k MRR [E]. |
| Email | AWS SES $0.10/1,000 [V: AWS Price List API, AmazonSES] or Resend (free tier, unverified) | | Transactional only. |
| Analytics | **PostHog**: 1M events/mo free, 5k replays [V: https://github.com/PostHog/posthog.com/blob/master/src/pages-content/pricing-data.js] | | Use cookieless mode for EU. |
| Errors | Sentry Developer (free) → Team (~$26/mo, unverified) [V that plans exist: https://github.com/getsentry/sentry-docs/blob/master/docs/pricing/index.mdx] | | |
| LLM observability | **Langfuse** Cloud: Hobby free (50k units), Core $29/mo, Pro $199/mo, $8/100k units [V: https://github.com/langfuse/langfuse-docs/blob/main/md-override/pricing.md]; core is open source (repo LICENSE now © ClickHouse, Inc.) [V]. Alt: Helicone (Apache-2.0) [V], or PostHog AI observability | | Also write cost per step to your own `artifacts` table, which is the margin source of truth. |
| Bot protection | Cloudflare Turnstile (Free plan exists) [V: cloudflare-docs turnstile/plans.mdx] | | On signup and generate endpoints. |
| Moderation | OpenAI `omni-moderation-latest` (**free**, text+image) [V: mirror of OpenAI moderation guide, https://raw.githubusercontent.com/llms-txt-archive/openai-platform/main/api/docs/guides/moderation.md] + custom policy LLM (Claude Haiku 4.5) or **gpt-oss-safeguard-20b/120b (Apache-2.0, bring-your-own-policy)** [V: https://github.com/openai/gpt-oss-safeguard] ; Llama Guard 4 (12B, multimodal, MLCommons taxonomy incl. S5 Defamation, S10 Hate, S13 Elections) [V: PurpleLlama MODEL_CARD] | | See §6. |
| Provenance | C2PA via `@contentauth/c2pa-node` (MIT, v0.9.9 on npm 2026-09-30) [V: registry.npmjs.org]; c2pa-rs MIT/Apache-2.0 [V] | | Art. 50 machine-readable marking. |

### 4.2 Fixed monthly infrastructure (order of magnitude) [E]

| Item | 100 videos/mo | 1,000 videos/mo | 10,000 videos/mo |
|---|---|---|---|
| Web hosting (Vercel/CF) | $0–20 | $20–50 | $100–300 |
| Postgres + Auth | $0–25 | $25–75 | $150–400 |
| Orchestrator base | $10 | $50 | $50–300 (+concurrency add-ons) |
| Redis | $0 | $0–10 | $10–20 |
| R2 storage (finals kept 90 d, intermediates 7 d) | <$5 | ~$10–20 | ~$80–150 |
| Errors + analytics + LLM traces | $0 | $30–60 | $200–600 |
| Remotion license | $0 if ≤3 people; else $100 min | $0 / $100 | $0 / $100–300 (depends on chunk counting) |
| Email, domain, status page, support desk | $10–30 | $30–80 | $100–300 |
| **Total fixed** | **≈$50–250** | **≈$300–700** | **≈$1.5–3k** |

### 4.3 Variable per-video costs in this research area [E unless marked]

| Component | 60 s Short | 10-min long-form | Notes |
|---|---|---|---|
| Orchestration | $0.003–0.04 | $0.02–0.3 | §3.1 |
| Render compute (CPU, software WebGL) | ~$0.02–0.05 | ~$0.15–0.5 | Assumes 4–10 fps per 4-vCPU worker at 1080p; Cloud Run 4 vCPU/8 GiB = $0.000088/s [V rate]; replace with spike numbers. |
| Remotion license | $0.01 (1 render) to $0.1+ (per-scene chunks) | $0.01–0.6 | Only if >3 people [V] |
| Storage + ops (R2) | <$0.005 | ~$0.01–0.03 | ~60 MB/min of output at 8 Mbps H.264 |
| Moderation | $0 (OpenAI) + ~$0.005 policy LLM | ~$0.01–0.02 | |
| QA (ffmpeg + VLM) | ~$0.003–0.03 | ~$0.02–0.08 | §7 |
| Payment fees (per $20 subscription) | MoR: ~$1.50 (+$0.30 intl) | | Stripe direct ≈ $1.12 + intl/FX |

---

## 5. Editor UX after generation

**How competitors handle it [E, from general product knowledge; not re-verified this session]**

- **Descript**: you edit the video by editing the transcript, and "scenes" act as slide-like cuts. AI actions apply to selections.
- **InVideo AI**: a natural-language "magic box" for edits ("change voice", "replace scene 3 media"), then a regenerate step, with an advanced timeline as a fallback.
- **Canva**: template, layers, a brand kit, and Magic tools inside the canvas.
- **CapCut**: a full NLE timeline plus script-to-video, auto-captions and templates.
- **Common pattern**: **AI produces a structured draft; users mostly do coarse edits (text, voice, media swap, style), and a minority uses a timeline.**

**Recommended editor, built on the scene DSL**

1. **Script view.** A document editor with one block per scene. Editing text shows a diff badge and an "will re-voice scene 4 (≈0.2 credits)" estimate, then re-TTS and re-time that scene only.
2. **Storyboard view.** Scene cards show a Player thumbnail or loop and the scene type (globe flight, border change, troop arrows, route, callout, portrait card, data chart, weather/FX overlay, title). Each card has **Regenerate visual** (with prompt), **Swap type** and **Lock**.
3. **Preview.** Remotion `<Player>` in the browser with low-res tiles, so no render credits are spent during editing.
4. **Inspector** for the selected element: text, colors, timing in/out, easing.
   - **Map-specific direct manipulation** is the moat:
     - Drag arrow and route control points on a live MapLibre canvas.
     - "Set camera keyframe here" (center/zoom/pitch/bearing captured from the map).
     - Scrub a year slider for historical borders.
     - Drag labels to resolve collisions.
     - Pick icons and flags from a licensed library.
5. **Global controls.**
   - Style preset.
   - Aspect ratio: a re-layout engine with platform safe zones and per-aspect camera framing, not a crop.
   - Voice, music, caption style.
   - **Brand kit**: logo, palette, fonts, intro/outro, watermark.
6. **AI command bar.** Natural-language edits produce a JSON Patch validated against the zod schema before it is applied. Undo/redo and version history come from the patch log.
7. **Render panel.** Shows a cost estimate, draft vs final quality, and the queue position.

**Build vs buy**

- **Remotion Editor Starter: $600 one-time** [V: https://www.remotion.dev/docs/editor-starter/vs-studio]. It is an NLE boilerplate (timeline, canvas, captions, exports, asset upload, undo) with JSON state.
  - It explicitly does not include keyframes, transitions, project management, auth, mobile, or multiple frame rates [V: docs/editor-starter/features-not-included.mdx].
  - It may not be redistributed in open source [V].
  - It is useful as a reference or component source. Your core is a scene editor, so do not adopt it wholesale [E].
- **Remotion Timeline**: a separate paid component [V: docs/timeline/index.mdx].
- **Open source options**:
  - xzdarcy/react-timeline-editor (MIT) [V] and OpenCut (MIT) [V].
  - designcombo/react-video-editor uses the "OpenVideo License" (free for small companies, paid for larger) [V].
  - twick uses the "Sustainable Use License" [V], which is likely unsuitable for SaaS embedding.
- **Remotion `renderMediaOnWeb()`** (client-side WebCodecs rendering, stable from v4.0.491) could offload **draft** exports to the user's browser. It emulates a CSS subset (no `perspective`, limited backgrounds) [V: docs/client-side-rendering/limitations.mdx], so test it against map/WebGL scenes before relying on it.

---

## 6. Trust & safety and legal

### 6.1 Content policy for this genre [E: recommended policy]

| Category | Default | Mechanism |
|---|---|---|
| Wars, battles, genocides, terrorism **history**, told in documentary tone | **Allowed** (EDSA: educational/documentary) | Custom policy classifier, not raw moderation flags (violence scores will fire constantly). |
| Graphic gore imagery | Disallowed in generated assets; stylized depiction only (icons, arrows, casualty counters) | Asset moderation (omni-moderation image) plus style constraints. |
| Glorification or recruitment for designated terrorist/extremist orgs; propaganda reproduction; atrocity/Holocaust denial | **Blocked** | Policy LLM with examples; human review queue. |
| Hate against protected groups; dehumanizing framing of ethnic groups in conflict narratives | Blocked/rewrite | Llama Guard S10-style categories plus custom rules. |
| Ongoing conflicts and elections (Ukraine–Russia, Israel–Gaza, Sudan, Taiwan Strait, current elections) | Allowed **with citations required**, neutral framing, date-stamped "as of" captions | Claim-check pass; sources stored per claim. |
| Living persons | Allowed; **no unsourced allegations of crimes or misconduct**; no photoreal likeness generation; no voice cloning of real people | Claim-check flags statements about named living people without citations. Defamation is a category in Llama Guard 4 (S5) [V]. |
| Sexual content, CSAM, self-harm instructions | Blocked (zero tolerance for CSAM, with reporting process) | omni-moderation plus hard blocks. |
| Disputed borders (Kashmir, Crimea and occupied Ukrainian regions, Taiwan, Western Sahara, Palestine, Arunachal/Aksai Chin, South China Sea, Cyprus, Kosovo, …) | **Neutral default**: de facto control lines with dashed disputed segments and a neutral label. User-selectable "worldview" presets. Export warning for jurisdictions with map laws (e.g., India, China) | Data layer carries a `disputed` flag; QA checks that the preset was applied. The data research workstream should confirm the worldview datasets available. |

**Stack**

- **Pre-generation**: free omni-moderation on topic and pasted script.
- **Policy decision**: a policy LLM decides allow / allow-with-conditions / block. Use Claude Haiku 4.5 at ~$0.005 per check [E], or self-hosted gpt-oss-safeguard-20b (Apache-2.0, policy-as-prompt) [V].
- **Post-generation**: the same check on the generated script, plus image moderation on every generated or uploaded asset.
- **Human review queue** for appeals and borderline cases.
- **Audit log** of decisions, which payment processors and app stores may ask for.

**Defamation and liability [E, legal opinion; get counsel]**

- **Section 230 may not apply.** When *your* system writes the script, you are arguably the "information content provider", so §230 protection is weaker than for pure user uploads.
- **Mitigations**:
  - Grounded research with stored citations.
  - Automatic softening or flagging of uncited factual claims about living people.
  - A visible "AI-generated script, review before publishing" acknowledgement in the UI.
  - ToS warranties and indemnity from users for published content.

### 6.2 Copyright, DMCA, DSA

- **User-pasted scripts and uploads.** The ToS should state that the user warrants their rights, and you take a license to process the content only.
- **DMCA §512(c) safe harbor** for user-uploaded material: register a designated agent with the US Copyright Office (I recall about $6 every 3 years; unverified), publish a notice-and-takedown and counter-notice process, and keep a repeat-infringer policy.
- **EU Digital Services Act.** As a *hosting service* you need a point of contact, ToS disclosures, notice-and-action and statements of reason [E]. Keep share links unlisted and avoid public galleries so you are not an "online platform" with heavier duties.
- **Output IP.** Purely AI-generated material may not be copyrightable in the US, so assign whatever rights you hold to the user and say so plainly [E].
- **Music and Content ID.** Use only libraries licensed for SaaS redistribution that will not trigger Content ID claims on your users' uploads. Store a **license provenance record per render** (asset ID, license, version), which also helps with dispute resolution [E].
- **Map data.** OSM-derived data carries ODbL attribution obligations for produced works. Render the attribution automatically in end cards or descriptions [E; the data workstream should verify].

### 6.3 AI labeling and platform policy

- **EU AI Act Article 50** became applicable on **2 Aug 2026** [S]. Under the May 2026 omnibus deal, systems already on the market get a watermarking grace period until **2 Dec 2026**; a product launched after August 2026 should comply on day one [S: summary of https://www.europarl.europa.eu/news/en/press-room/20260427IPR42011/ai-act-deal-on-simplification-measures-ban-on-nudifier-apps].
  - As a *provider* of a system generating synthetic audio and video, you must mark outputs in a machine-readable way.
  - The final EU Code of Practice on AI-generated content (10 Jun 2026) points to layered marking: metadata such as C2PA, plus watermarking [S: https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content].
  - **Implementation**:
    - Sign every MP4 with a C2PA manifest (`compositeWithTrainedAlgorithmicMedia` digital source type).
    - Embed a lightweight invisible audio/video watermark (later).
    - Offer an optional visible "AI-generated" end-card or caption toggle.
  - Platforms may strip metadata on re-encode, so the watermark layer matters.
- **YouTube.** The "repetitious content" policy was renamed **"inauthentic content"** on **15 Jul 2025** to cover "repetitive or mass-produced" content. Channels where "content feels interchangeable from video to video are not allowed to monetize" [V: captured text of https://support.google.com/youtube/answer/1311392].
  - Product implications:
    - Push per-video variation: scene-type diversity, style randomization within a brand, and custom hooks.
    - Encourage human edits.
    - Never market the product as "faceless channel spam".
  - Realistic synthetic content needs the "altered or synthetic" disclosure in YouTube Studio (https://support.google.com/youtube/answer/14328491). Clearly animated map graphics are generally not "realistic", but AI voices and photoreal generated imagery of real events may be.
  - Generate a per-video disclosure recommendation [E]. Secondary sources report YouTube and TikTok auto-labeling via C2PA in 2026 [S], so self-labeling plus C2PA is the safe default.

### 6.4 Privacy

- **GDPR** (if EU users):
  - DPA templates.
  - A subprocessor list (LLM, TTS, payments, hosting).
  - SCCs or the EU–US Data Privacy Framework for transfers.
  - Data-retention schedule (prompts, scripts, renders).
  - DSAR and deletion tooling (delete the project, cascade to R2 `cas/` objects with no other references).
  - Cookieless analytics or a consent banner.
  - Request zero- or limited-data-retention terms from LLM vendors where available.
- **CCPA/CPRA** thresholds likely won't apply early, but give the same rights. Set a 13+ age gate (16+ where required); COPPA means no child-directed service.
- **Voice cloning** (future): require a consent recording and verification, and block public-figure voices.

### 6.5 Payment fraud, free-tier abuse, rate limiting [E]

- **Free tier**: 1–2 short renders, 720p, **visible watermark**, a verified email, Turnstile, and disposable-email and IP/device velocity checks. Card-on-file trials are more abuse-resistant than no-card free tiers.
- **Credits**:
  - Reserve at render start and settle actual usage.
  - Auto-refund failures; credits are non-refundable once consumed; monthly expiry for plan credits.
  - Hold back top-up packs for new accounts for X hours if risk signals are present.
- **Disputes and fraud**: Polar and Paddle charge $15 per dispute [V for Polar]. Watch chargeback ratios, require 3DS where available, and use velocity rules on card attempts.
- **Rate limits**:
  - Per-user concurrent jobs (free 1, paid 2–5).
  - Daily generation caps.
  - Per-IP signup limits.
  - **Global spend circuit breakers** per provider (LLM, TTS, image) with alerting.
  - **Per-job budget caps** that stop runaway agent loops.

---

## 7. Automated QA of rendered videos [E: design; costs from verified unit prices]

**Pre-render (deterministic, free)**
- Zod schema validation of the DSL.
- Every asset URL resolves (HTTP 200, MIME, dimensions).
- Text-fit measurement using the actual font metrics: caption and label overflow, platform safe zones for 9:16 UI overlays.
- Narration duration vs scene duration.
- Geo sanity: coordinates in bounds, camera never inside terrain, borders dataset available for the requested year.

**Render-time**
- Wait for MapLibre `idle` (all tiles and sprites loaded) before releasing each frame (`delayRender`/`continueRender`) with a timeout.
- Capture console errors and failed tile requests per chunk, and fail the chunk instead of silently rendering grey tiles.

**Post-render (ffmpeg/ffprobe, cents of CPU)**
- ffprobe: duration, fps, resolution, codec, audio stream present.
- `blackdetect` and `freezedetect` catch blank or stuck segments. A per-frame luminance-variance or perceptual-hash check catches untextured or grey tiles.
- `silencedetect` and `ebur128`: target about −14 LUFS integrated with true peak ≤ −1 dBTP for YouTube/TikTok.
- A/V sync: compare caption cue times against forced-alignment word timestamps (drift under 80 ms), and check that audio and video stream durations match.

**VLM review** (sampled frames: 1–2 per scene plus thumbnails, with a rubric covering missing tiles, overlapping or cut-off text, a map region that doesn't match the narration, glitches)
- **Gemini 3.1 Flash-Lite**: $0.25/M input (text/image/video), $1.50/M output on Vertex global [V: Vertex AI pricing page captured 2026-10-01, https://cloud.google.com/vertex-ai/generative-ai/pricing]. That is about **$0.003–0.01 per Short** and **$0.02–0.06 per 10-min video** [E]. It can also take the whole low-res video at about 1 fps.
- **Claude Haiku 4.5** ($1/$5 per M): images are roughly (w×h)/750 tokens, so about 1.2k tokens per 720p frame and 20 frames ≈ $0.03 [E].
- A failure triggers AUTO_FIX of only the affected scenes (max 2 loops), then human review.

---

## 8. Team, phases, timeline [E]

**What drives quality.** "Astonishing" output depends far more on **motion design and scene-type craft** (camera easing, typography, layered FX like rain or fog of war, sound design) than on infrastructure. The hardest hire, or the hardest skill to build, is a motion-design lead who defines the style presets.

| Phase | Duration (solo + AI coding agent) | Scope |
|---|---|---|
| **0. Spikes** | 2–3 wks | WebGL render benchmark (in progress), scene DSL v0, 3 scene types end to end, cost per video measured. |
| **1. MVP (private alpha)** | +8–10 wks | Topic or pasted script → research → script → storyboard → render; **1–2 styles**, 9:16 + 16:9, 30 s–5 min; 8–12 scene types (globe flight, region highlight, border change for a limited era set, arrows/troop moves, route draw, pins/callouts, portrait/image card, counters/charts, title, rain/snow FX); English; one TTS vendor; captions; music library; per-scene regenerate; credits + MoR billing; moderation v1; R2; basic QA. |
| **2. Beta** | +8–12 wks | 5–8 styles, 1:1 + 4:5, long-form to 10 min, inspector + map handles, brand kit, VLM QA, C2PA, cache-driven partial re-render, aspect re-layout engine, referral program, status page. |
| **3. v1** | +3–6 months | 10–20 min with chapters, multi-language (dub + localized labels), worldview presets, team workspaces, public API, direct YouTube/TikTok publishing (requires API app verification and quota extension), template library. |
| **4. Scale** | 12 mo+ | Own render fleet (CPU/GPU), possible self-hosted Trigger.dev/Temporal, enterprise (SSO via WorkOS), SOC 2. |

**Team**
- **Solo founder:** the MVP is feasible in about 3–4 months full-time with AI coding agents, provided scope stays tight.
- **Small team (recommended by beta):** founder/PM, one senior full-stack TS engineer, one graphics engineer (MapLibre/deck.gl/WebGL/Remotion), one motion designer / art director, a part-time LLM/prompt engineer, and fractional legal counsel. Add support and T&S at about 1k paying users.
- **Licensing:** staying at **≤3 people keeps Remotion free** [V].

---

## 9. Compliance checklist (pre-launch)

- [ ] Company entity and jurisdiction chosen; MoR (Paddle/Polar) or Stripe account approved for "AI video generation" (check acceptable-use policies).
- [ ] ToS, AUP (war/extremism/defamation/border rules), Privacy Policy, Cookie notice, DPA and subprocessor list, refund and credit policy.
- [ ] DMCA designated agent registered; takedown and counter-notice pages; repeat-infringer policy.
- [ ] DSA hosting obligations: contact point, notice-and-action form, statement of reasons template (if EU users).
- [ ] EU AI Act Art. 50: C2PA signing on every output; watermark plan; disclosure helper text for YouTube/TikTok.
- [ ] Moderation pipeline live (input, script, assets) with audit log and appeal path; CSAM escalation procedure.
- [ ] Claim-check plus citations for living persons and ongoing conflicts; worldview default documented.
- [ ] License ledger for every font, icon, music track, SFX, map dataset and model, recording commercial SaaS-redistribution rights; ODbL/attribution automation.
- [ ] Remotion license status tracked (headcount ≤3, otherwise Automators); written clarification on chunk/still counting.
- [ ] GDPR tooling: data export and delete, retention TTLs (intermediates 7 d, finals 30–90 d), vendor zero-retention where possible.
- [ ] Age gate (13+/16+), no child-directed marketing.
- [ ] Fraud and abuse: Turnstile, velocity limits, watermark on free tier, spend circuit breakers, per-job budget caps.
- [ ] Security: secrets manager, least-privilege IAM for render roles, presigned URLs with short TTL, backups and PITR on Postgres.

---

## 10. Gaps and items to re-verify

- **Not fetched directly** (blocked or out of search budget): trigger.dev/pricing (used a June 2026 docs mirror), stripe.com and paddle.com pricing (used dated secondary snapshots), clerk.com/pricing (May 2026 snapshot), Vercel and Sentry base plan prices, Hatchet Cloud tiers, and the DMCA agent fee.
- **Remotion render counting** for self-orchestrated scene chunks and thumbnails needs written confirmation from Remotion.
- **Render cost rows** depend on the parallel WebGL spike; recompute §4.3 with measured fps.


## KEY RECOMMENDATIONS
- Adopt a TypeScript monorepo end to end (Next.js + Remotion + zod scene DSL + Trigger.dev): one type system shared by the AI, the editor and the renderer; Python only in isolated containers.
- Make a versioned JSON scene DSL the single source of truth that both the AI and the editor patch: it is what makes per-scene regeneration, style switching and aspect-ratio re-layout cheap and deterministic.
- Implement content-addressed step caching (sha256 of inputs, versions and model) in Postgres plus R2: idempotency, retries, partial regeneration and per-step cost accounting all come from one mechanism.
- Orchestrate with Trigger.dev Cloud at MVP (Apache-2.0, no timeouts, waitpoints, realtime) but never render frames on its compute: large-1x at $0.00034/s is about 3.9x Cloud Run per vCPU-second.
- Put rendering behind a RenderBackend adapter: start with Remotion Lambda for scale-to-zero parallelism, and move bulk or long-form to Cloud Run Jobs, L4 GPUs or your own fleet once the WebGL spike shows the cost curve.
- Use Cloudflare R2 for all artifacts, PMTiles map tiles and final videos, with lifecycle TTLs: zero egress fees on a download-heavy product.
- Use Supabase Pro ($25/mo, with bundled auth for 100k MAU) or Neon plus Better Auth: avoid per-user auth vendors in a consumer funnel.
- Launch payments through a Merchant of Record (Polar or Paddle) to offload global VAT/GST; revisit Stripe Billing plus Stripe Tax at roughly $50-100k MRR, when fee savings outweigh the compliance burden.
- Sell credits tied to output minutes with a reserve-then-settle double-entry ledger, auto-refunds on failure, and a tiny watermarked free tier: this protects margins against abuse and failed renders.
- Build layered trust and safety for war and history content: free OpenAI omni-moderation plus a custom documentary-context policy classifier (Claude Haiku or Apache-2.0 gpt-oss-safeguard), citation-backed claim checks for living people and ongoing conflicts, and worldview presets for disputed borders, because generic classifiers over-flag this genre.
- Ship EU AI Act Art. 50 marking from day one (C2PA via MIT c2pa-node plus a watermark roadmap) and generate per-video YouTube/TikTok disclosure guidance: the obligation is already applicable for new systems.
- Design against YouTube's 'inauthentic content' policy: enforce variation and human editing in the product so customers' channels stay monetizable, since their churn is your biggest business risk.
- Gate every delivery on automated QA (MapLibre idle checks, ffmpeg black/freeze/silence/EBU R128, caption-overflow measurement, sampled VLM review at roughly $0.003-0.06/video): bad frames are expensive to your reputation and cheap to catch.
- Get Remotion's written answer on how per-scene chunk renders and thumbnails are counted, and track headcount (3 people or fewer is free): per-scene caching could multiply the $0.01/render fee.
- Build the editor as a script, storyboard and inspector with direct map manipulation rather than a full NLE: it matches how users actually edit AI drafts and is where the product can stand out.

## COST ITEMS
- Remotion for Automators (company license, >3 people): $0.01 / per render, $100/month minimum (VERIFIED via github.com/remotion-dev/remotion packages/docs/docs/license/faq.mdx and promo-pages FreePricing.tsx (RENDER_UNIT_PRICE=10 per 1000). Covers prompt-to-video apps and Player embedding. Free for organizations of 3 people or fewer.) https://www.remotion.dev/docs/license/faq
- Remotion for Creators seat: $25 / per seat per month (VERIFIED. Not needed for developers working on automations.) https://www.remotion.dev/docs/license/pricing
- Remotion Enterprise License: from $500 / per month (VERIFIED; includes Editor Starter.) https://www.remotion.dev/docs/license/pricing
- Remotion Editor Starter: $600 / one-time (VERIFIED. Template; no redistribution in open source.) https://www.remotion.dev/docs/editor-starter/vs-studio
- Remotion Lambda Hello World render: $0.001 / per render (warm, 2048 MB, us-east-1) (VERIFIED docs example; real map scenes will cost far more.) https://www.remotion.dev/docs/lambda/cost-example
- AWS Lambda compute (ARM): $0.0000133334 / per GB-second (tier 1), plus $0.20 per 1M requests (VERIFIED via AWS Price List API us-east-1; x86 is $0.0000166667/GB-s.) https://aws.amazon.com/lambda/pricing/
- Google Cloud Run CPU (instance-based, Tier 1): $0.000018 / per vCPU-second (VERIFIED. Free tier 240,000 vCPU-s/month.) https://cloud.google.com/run/pricing
- Google Cloud Run memory (instance-based, Tier 1): $0.000002 / per GiB-second (VERIFIED. Free tier 450,000 GiB-s/month.) https://cloud.google.com/run/pricing
- Google Cloud Run NVIDIA L4 GPU (non-zonal): $0.0001867 / per second (~$0.67/hour) plus CPU and memory (VERIFIED. Relevant if GPU WebGL rendering is much faster.) https://cloud.google.com/run/pricing
- Cloudflare Containers: $0.000020 per vCPU-s; $0.0000025 per GiB-s / per second, beyond included usage (VERIFIED via cloudflare-docs repo; requires the $5/mo Workers Paid plan.) https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers Paid plan: $5 / per month minimum (VERIFIED.) https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare R2 Standard storage: $0.015 / per GB-month (Infrequent Access $0.01) (VERIFIED. Egress free; free tier 10 GB-month.) https://developers.cloudflare.com/r2/pricing/
- Cloudflare R2 operations: $4.50 Class A / $0.36 Class B / per million requests (VERIFIED. Free 1M Class A and 10M Class B per month.) https://developers.cloudflare.com/r2/pricing/
- Trigger.dev plans: Free $0 ($5 credit) / Hobby $10 / Pro $50 / per month (fee includes equal usage credit) (SECONDARY: docs mirror dated Jun 2026 (github.com/reclear-io/llmref). Re-verify.) https://trigger.dev/pricing
- Trigger.dev per-run fee: $0.000025 / per run (SECONDARY (docs mirror Jun 2026).) https://trigger.dev/pricing
- Trigger.dev compute large-1x (4 vCPU / 8 GB): $0.00034 / per second (SECONDARY. micro $0.0000169/s, small-1x $0.0000338/s, medium-2x $0.00017/s, large-2x $0.00068/s. Extra concurrency on Pro $10/mo per 50.) https://trigger.dev/pricing
- Inngest Pro: $99 / per month incl. 1M executions; then $50 per 1M; concurrency $25 per extra 25 (VERIFIED via github.com/inngest/website RedesignedPricing/plans.ts. Hobby free: 50k executions, 5 concurrent steps.) https://www.inngest.com/pricing
- Temporal Cloud Actions: $50 / per 1M Actions (volume discounts on Business+) (VERIFIED via temporalio/documentation. Developer plan: no base fee, plus 10% of usage; Business: greater of $500/mo or 10%.) https://docs.temporal.io/cloud/pricing
- Temporal Cloud storage: $0.042 active / $0.00105 retained / per GB-hour (VERIFIED.) https://docs.temporal.io/cloud/pricing
- Hatchet Cloud Developer: Free 100k runs; ~$10 per 1M after / per month (SECONDARY (api-evangelist/hatchet plans yml). Hatchet is MIT and self-hostable.) https://hatchet.run/pricing
- AWS Step Functions Standard: $0.000025 / per state transition (first 4,000/month free) (VERIFIED via AWS Price List API. Express: $1/M requests + $0.00001667/GB-s.) https://aws.amazon.com/step-functions/pricing/
- Upstash Redis PAYG: $0.20 / per 100K commands (fixed 250 MB plan $10/mo) (VERIFIED via upstash/docs billing.mdx. Free tier 500K commands/month.) https://upstash.com/pricing/redis
- Supabase Pro: $25 / per month (100k MAU incl., then $0.00325/MAU; 250 GB egress then $0.09/GB) (VERIFIED via supabase/supabase packages/shared-data/plans.ts. Team $599/mo.) https://supabase.com/pricing
- Neon Launch compute: $0.106 / per CU-hour; storage $0.35/GB-month; no minimum (VERIFIED via neondatabase/website repo.) https://neon.com/docs/introduction/plans
- Clerk Pro: $25 / per month; 50k MRU included; $0.02/MRU for 50k-100k (SECONDARY (third-party snapshot 2026-05-09).) https://clerk.com/pricing
- Polar MoR Starter: 5% + $0.50 / per transaction (+1.5% international cards) (VERIFIED via polarsource/polar docs. Applies to organizations created on/after May 27, 2026. Pro $20/mo at 3.8%+40c; Growth $100/mo at 3.6%+35c; Scale $400/mo at 3.4%+30c. Disputes $15.) https://docs.polar.sh/merchant-of-record/fees
- Paddle MoR: 5% + $0.50 / per transaction (SECONDARY; re-verify.) https://www.paddle.com/pricing
- Stripe card processing (US): 2.9% + $0.30 / per successful card charge (SECONDARY (G2 snapshot 2026-06/07). International and FX surcharges extra.) https://stripe.com/pricing
- Stripe Billing (pay as you go): 0.7% / of billing volume (SECONDARY (G2 agent snapshot of stripe.com 2026-07-01).) https://stripe.com/billing/pricing
- Stripe Tax: 0.5% / per transaction (no-code) (SECONDARY.) https://stripe.com/tax/pricing
- Stripe Managed Payments (Stripe MoR, preview): +3.5% / on top of standard Stripe processing fees (SECONDARY; preview status.) https://stripe.com/managed-payments
- AWS SES email: $0.10 / per 1,000 emails (VERIFIED via AWS Price List API ($0.0001/message).) https://aws.amazon.com/ses/pricing/
- PostHog product analytics: $0 / first 1M events + 5k session replays per month (VERIFIED via PostHog/posthog.com pricing-data.js.) https://posthog.com/pricing
- Langfuse Cloud: Hobby free (50k units) / Core $29 / Pro $199 / per month; overage $8 per 100k units (VERIFIED via langfuse-docs md-override/pricing.md.) https://langfuse.com/pricing
- Sentry Team plan: ~$26 / per month (ESTIMATE/unverified; plan structure (Developer free, Team, Business) verified in sentry-docs.) https://sentry.io/pricing/
- OpenAI moderation (omni-moderation-latest): $0 / free endpoint (text + images) (VERIFIED via a GitHub mirror of the OpenAI moderation guide.) https://platform.openai.com/docs/guides/moderation
- Gemini 3.1 Flash-Lite (Vertex AI, global) for VLM QA: $0.25 input / $1.50 output / per 1M tokens (text/image/video input) (VERIFIED from a capture of the Vertex pricing page 2026-10-01.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Claude Haiku 4.5 (QA / policy classifier): $1 input / $5 output / per 1M tokens (Given in project context (cached 2026-09-25).) https://docs.anthropic.com/en/docs/about-claude/pricing
- Cloudflare Turnstile: $0 / Free plan (VERIFIED that a Free plan exists.) https://developers.cloudflare.com/turnstile/plans/
- DMCA designated agent registration: ~$6 / per registration, renew every 3 years (UNVERIFIED (from memory; copyright.gov not reachable).) https://www.copyright.gov/dmca-directory/
- Vercel Pro: ~$20 / per seat per month + usage (ESTIMATE/unverified.) https://vercel.com/pricing

## RISKS
- Platform monetization risk: YouTube's 'inauthentic content' (mass-produced/template) policy can demonetize customers' channels, driving churn and reputational damage if the product produces interchangeable videos.
- Defamation and misinformation liability: AI-written scripts about living persons, ongoing wars or atrocities can be false; Section 230 protection is weaker when the service itself authors the content.
- Disputed borders: depicting Kashmir, Crimea, Taiwan, Palestine etc. can create legal exposure in some jurisdictions (map laws) and backlash from users; one default cannot satisfy everyone.
- Extremist or propaganda misuse of a war/geopolitics generator could trigger payment-processor or MoR account termination and platform bans.
- Generic moderation APIs over-flag violent historical content, causing false blocks and poor UX unless a custom documentary-context policy layer is built and tuned.
- Remotion licensing: per-render fees may multiply if per-scene chunks and thumbnails each count as renders; the license is source-available (not OSI) and terms or prices could change.
- Render performance and cost uncertainty: software WebGL in headless Chrome without GPU may be slow; Lambda has a 15-minute function limit; 10-20 minute long-form videos stress chunking and the Lambda concurrency default of 1,000 per account.
- Orchestrator compute pricing premium (Trigger.dev about 3.9x Cloud Run per vCPU-s) if heavy work accidentally runs on it; vendor maturity and lock-in for workflow engines.
- EU AI Act Art. 50 non-compliance at launch (missing machine-readable marking); C2PA metadata stripped by platform re-encoding, so a watermark layer is also needed.
- Copyright exposure: user uploads, music Content ID false claims against users, AI images resembling protected works, and missing ODbL/OSM attribution on produced works.
- Free-tier abuse, card testing and chargebacks consuming expensive GPU/LLM/TTS budget; runaway agent loops without per-job budget caps.
- Privacy and regulatory: storing user scripts and prompts with multiple subprocessors (LLM, TTS, payments) under GDPR; DSA hosting obligations if serving EU users.
- Pricing data staleness: several vendor prices (Trigger.dev, Stripe, Paddle, Clerk, Vercel, Sentry) were only verified via secondary snapshots during this research.
- Solo-founder scope creep: 'many styles, many lengths, many formats' can stall the MVP; quality depends on motion-design craft that is hard to automate or hire for.

## QUESTIONS FOR FOUNDER
- Where is (or will) the company be incorporated, and where are you based? This decides Stripe availability, Merchant-of-Record choice, tax registration, and GDPR/DSA exposure.
- How many people do you expect on the team in the first 12 months? Staying at 3 or fewer keeps Remotion free; 4 or more triggers the $100/month minimum Automators license.
- What monthly budget can you commit to infrastructure and AI APIs during development and beta, and what runway do you have?
- Target pricing: what monthly price points, will there be a free tier, and are you OK with a visible watermark and very limited renders on free?
- Default mode: fully automatic one-click generation, or review gates (approve script, approve storyboard) before rendering credits are spent?
- Content stance: should the product allow ongoing conflicts and current elections (e.g., Ukraine-Russia, Israel-Gaza, Taiwan) with mandatory citations, or restrict them at launch?
- Disputed borders: which default worldview do you want (de facto control with dashed disputed lines?), and will you offer per-country worldview presets?
- Launch markets and languages: will you serve EU users at launch (AI Act Art. 50, GDPR, DSA apply) and which languages beyond English, and when?
- Ops tolerance: do you prefer fully managed services (higher unit cost, less ops) or are you willing to self-host orchestration and render workers later to cut costs?
- Which cloud accounts and startup credits do you already have (AWS Activate, Google for Startups, Cloudflare, Vercel, Supabase), so the render backend can follow the credits?
- Do you want direct publishing to YouTube/TikTok in v1? It requires API app verification and quota extensions that take weeks.
- Retention policy: how long should finished videos and intermediate files be kept (e.g., 30/90 days vs a permanent library)? This drives storage cost and privacy posture.
- Do you have access to a motion designer or art director to define the style presets, or budget to hire or contract one?
- Are you willing to engage legal counsel before public launch for ToS/AUP/Privacy, the DMCA agent, and a defamation and disputed-borders review?
- Will you allow user uploads (images, logos, voice samples) at MVP? Each adds moderation, copyright and consent obligations.