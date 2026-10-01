# Map-Animation Video SaaS: Market, Competitors, Pricing and Platform Policy
Research date: 2026-10-01. Area: market, competitors, pricing, platform policy.

## 0. Method and confidence (read first)

Live web access was badly limited in this session. The web-search quota was already used up. The egress proxy also blocked almost every vendor domain (invideo.io, mult.dev, remotion.dev, support.google.com, reddit.com, trustpilot.com, producthunt.com, eur-lex and others). I worked around this with four kinds of source:

1. **Primary text reachable another way:**
   - YouTube's channel monetization policy page (a copy of support.google.com/youtube/answer/1311392 saved today by a parallel agent).
   - TikTok's Content Monetisation / Creator Rewards terms (Open Terms Archive mirror, January 2026 version).
   - Google Cloud pricing pages (cloud.google.com was reachable).
   - Vendor plan pages transcribed word for word by a pricing-harvest project (api-evangelist, September 2026).
2. **Dated 2026 secondary research** found through GitHub code search: competitor teardowns from August and September 2026, policy notes, and Product Hunt API digests. Several are themselves AI-assisted research notes. Treat them as strong leads, not proof.
3. **The local WebGL render spike** in this container. It is preliminary.
4. **My own prior knowledge**, labelled as such.

**Labels:**
- **[V]** = verified today against primary text or a word-for-word mirror.
- **[S]** = 2026 secondary source (URL given). Check it before quoting publicly.
- **[E]** = my estimate or opinion.
- **[U]** = from memory, not verified.

The policy section is the most solid. Most competitor prices are [S] and must be re-checked on the vendor pages before you publish a pricing page.

---

## 1. Executive summary

1. **No one owns "AI map storytelling" yet.**
   - The AI faceless-video tools (Revid, AutoShorts, StoryShort, Zebracat, Faceless.so, TubeGen, InVideo, Pictory, Fliki) produce stock footage, AI-image slideshows or avatars. None of them has a geographic engine.
   - The map tools (mult.dev, TravelAnimator, TravelBoast, Trip Replay) only do travel routes. They have no script, history, borders, armies or narration.
   - The top channels' real workflow is After Effects + GEOlayers 3 + MapTiler/OSM tiles + skilled editors. It is manual and expensive.
   - The closest "AI + maps" entrant I found is iart.ai. It is a general "AI motion agent" that open-sourced a Vox-style map-animation skill. I found no funded, traction-bearing "AI history/geography map video generator". **The caveat:** my search ability was degraded, so a focused search is still needed.
2. **Demand is real and large.**
   - About 16 major English geopolitics/explainer channels hold roughly 55M combined subscribers [S]. Kings and Generals has about 4M, RealLifeLore about 7.9M and 1.9B views, Johnny Harris about 7.5M.
   - Faceless-automation tooling is a proven business: Crayo is reported at about $600K/month, Submagic at $8M ARR bootstrapped, Higgsfield at $200M ARR [S].
3. **Platform policy is the main business risk, and it can also differentiate us.**
   - YouTube's current monetization policy explicitly excludes "AI-generated content made with generic or unoriginal templates giving the impression of mass production" [V].
   - Enforcement reportedly terminated 16 large AI channels in January 2026 [S].
   - A tool that builds originality, editorial control and disclosure into the workflow will keep its users monetized. Pure autopilot tools will not.
4. **Regulation now applies to us directly.** EU AI Act Article 50 applies from **2 August 2026**. The Digital Omnibus (Reg. (EU) 2026/1744) did *not* move it [S]. A product launched after that date gets no grace period for machine-readable marking (C2PA plus watermark under the final Code of Practice, 10 June 2026) [S].
5. **Pricing room exists.** Long-form AI-video competitors charge about $1.94–2.47 per finished minute (TubeGen) [S]. Shorts tools work out to about $1–2.60 per short [S]. My COGS estimate for a stylized, mostly vector map video is about $0.15–0.35 per finished minute [E]. A $29/$79/$199 credit ladder at about $0.66–0.97 per minute supports **≈75–85% gross margin at typical usage** [E].

---

## 2. Competitive landscape

### 2.1 Category map
- **A. Faceless/AI explainer generators**: prompt → script → stock, AI images or AI video → TTS → captions. These are the direct substitutes for faceless creators.
- **B. Avatar/presenter tools** (Synthesia, HeyGen, Captions, Argil, Vidnoz). Face-led. Mostly irrelevant for maps, apart from optional presenter features.
- **C. Editors and clippers** (OpusClip, Kapwing, VEED, CapCut, Descript). They edit existing footage.
- **D. Map/travel animation tools** (mult.dev, TravelAnimator, TravelBoast, Trip Replay, GEOlayers, Earth Studio, MapChart). Map-native, but no AI storytelling.
- **E. AI motion-graphics agents and engines** (iart.ai, Hera YC S25, HyperFrames, Remotion templates, Canva+Cavalry). This is the fastest-moving threat category.

### 2.2 Competitor table: AI faceless and explainer generators

| Tool | What it does | Price (USD/mo) | Notable limits | Gap vs our concept | Conf. / source |
|---|---|---|---|---|---|
| Revid.ai | Prompt → viral short, Auto-Mode, public API + MCP + CLI | Hobby $39 (2,000 credits) · Growth ~$99 · Ultra ~$199 | Short-form centric | No map engine; generic visuals | [S] [landscape 2026-09](https://raw.githubusercontent.com/muzzamilhassan/automation/HEAD/research/video-maker-tools-landscape-2026-09.md) |
| AutoShorts.ai | Faceless series on autopilot + auto-post | Free 1 video (watermark) · $19 · $39 · $69 | **1 series per account on every plan** | Templated; exactly the "mass-produced" pattern | [S] same |
| Faceless.so | Shorts generator, 7-platform auto-post, API on Ultra | $24 · $49 · $107 · $166 (≈$0.96 per storyboard short on Starter) | 9:16 only, 30/60/90 s presets; no free render; no refunds once credits are used | No long-form; Pexels/gameplay B-roll | [S] [teardown Aug-2026](https://raw.githubusercontent.com/digiegold-rgb/tolley-site/HEAD/scripts/briefs/data/competitor-deep-dive-2026-08.json) |
| Faceless.video | Series autopilot | $20 (30 credits) → $149 (350 credits) | Pricing multiplies per series | Same | [S] landscape |
| Crayo | Short-form templates | ~$13–19 · $27 · $55 | No trial; ToS frames use as personal/non-commercial | Legal grey zone for monetizers | [S] landscape |
| StoryShort | Faceless shorts and long-form, auto-post | $39 · $69 · $129 · $199 (≈40% off yearly) | Long-form only on $129+; "all sales final"; Trustpilot ≈2.5 | AI-image slideshow look | [S] teardown |
| Zebracat | Text/blog/audio → video, AI scenes, avatars | Cat $39 · Super $99 · Unlimited $199 (~50% off annual); Enterprise $398–599 (only tier with API) | **5-min max, 1080p cap**, no auto-post | No maps; short | [S] teardown |
| TubeGen | Full long-form faceless YouTube pipeline | $149 · $297 · $849 (≈$1.94–2.47 per finished minute) | No trial or refunds; generic scripts; 30-min export cap | Long-form but no maps; reviewers and Fortune tie it to "AI-slop" sleep-history channels | [S] teardown |
| InVideo AI | Prompt → video (stock + generative) | **Sources conflict**: "from $28/mo" vs "Basic $9/seat, Pro $25, Ultra $60 (annual)" | No API; credits don't roll over | Stock look, no geo | [S, conflicting] landscape + [directory](https://raw.githubusercontent.com/ilovefree-com/free-ai-tools-directory/HEAD/04-video-animation.md) |
| Pictory | Script/blog/URL → video | $25 · $35 · $119 (annual); API ~$79/mo | | Stock look | [S] landscape |
| Fliki | TTS-first video | Free 5 min (watermark, **no commercial rights**) · $8 · $21 · $66 (API on Premium) | | | [S] landscape |
| Higgsfield | Cinematic generative video | From ~$9; reported $200M ARR / $1.3B valuation | | Photoreal generative video, not maps | [S] [startup research](https://raw.githubusercontent.com/Zalamancer/autoStudio/HEAD/AutoAnimation/docs/startup-research.md) |
| Synthesia / HeyGen / Captions / Argil / Vidnoz | Avatar presenters | Synthesia ~$18–29 entry, Creator ~$64–89; HeyGen Creator $29, API Avatar IV ≈$0.05–0.067/s; Captions $24.99 / $69.99 / $139.99; Argil $39 / $149 / $499; Vidnoz $26.99 / $74.99 | Uncanny lip-sync complaints; Synthesia API gating reported inconsistently | Face-led; YouTube's AI-persona rule bites on political topics | [S] landscape, teardown, [Captions harvest](https://raw.githubusercontent.com/api-evangelist/captions/HEAD/plans/captions-plans-pricing.yml) |
| OpusClip / Kapwing / VEED / CapCut / Descript | Clippers and editors | OpusClip free 60 credits, Pro $29; Kapwing Pro $16/member (annual); VEED Lite ~$19, Pro $49; CapCut free tier reportedly lacks a commercial-use licence; Descript API beta since April 2026 | | Edit existing footage | [S] landscape |
| Vyond / Steve.ai / Animaker | Animated explainer builders | **Vyond Starter $58, Professional $100, Enterprise $137, Agency $167 per user/mo (annual: $699/$1,199/$1,649/$1,999 per year)**; Steve.ai and Animaker "from $15" | Vyond max 25/40/90 min | Character animation, manual, no geo | Vyond [V] (verbatim harvest of [vyond.com/plans](https://www.vyond.com/plans/), 2026-09-20); others [S] |

### 2.3 Competitor table: map-specific and data-viz tools

| Tool | What it does | Price | Gap vs our concept | Conf. / source |
|---|---|---|---|---|
| **mult.dev** | Browser travel-route animations. Show HN (Dec 2022): "zero-config alternative to Google Earth Studio". Feb 2026 maker post: Google Maps route import, vertical or horizontal, MP4 in 3–5 min | "Travel Animations Pro" package: Earth style (NASA-derived imagery), photos/stickers, GPX, real routes via Google Directions API, sea routes, Full HD, **max 180 s, 48 places**, white-label, 30-day money-back. Price not captured; a third-party claim of "$49–299/mo" looks unreliable | Travel only: no script, narration, borders, armies, data | [S] [page snapshot](https://raw.githubusercontent.com/mwhitt/mod-llm-demo/HEAD/train/allowed/0038.md), [HN](https://news.ycombinator.com/item?id=33946209), [Reddit](https://www.reddit.com/r/SideProject/comments/1rdaleq/built_a_travel_animation_map_tool_multdev/) |
| **TravelAnimator** (Lascade) | App: Google Maps URL → travel map video; 250+ 3D vehicles, 30+ styles, 4K/HD, photos on routes; Product Hunt 2026-01-29 (420 votes) | Subscription, amount not verified | Travel only | [S] [PH digest](https://raw.githubusercontent.com/yiGmMk/producthunt/HEAD/content/en/post/producthunt-daily-2026-01-29.md); price [U] |
| TravelBoast | Mobile "My Journey Routes" animations | Freemium with watermark, premium subscription | Travel only | [U] |
| Trip Replay, Locusify, triptrail, Travel-Story, travel-animation, lil-mappo | Free, no-signup or open-source route-video makers (2025–26). Several are MapLibre + WebCodecs; some are Claude Code skills | Free | Shows "route lines on a globe" is now a commodity | [S] PH 2025-12-31; GitHub topic `map-animation` |
| **GEOlayers 3** (After Effects plugin) | The pro map workflow. Johnny Harris's editor postings ask for it; RealLifeLore descriptions credit "MapTiler, OpenStreetMap Contributors, and GEOlayers" | One-time licence (~US$195 [U]) + AE subscription + tile plan (e.g. MapTiler Flex $25/mo) + skilled editor hours | Manual, slow, talent-bound. **This is the incumbent workflow we automate** | [S] [premiumbeat](https://www.premiumbeat.com/blog/making-maps-for-johnny-harris/), [aescripts](https://aescripts.com/geolayers/) |
| Google Earth Studio | Free browser keyframing over Google 3D imagery | Free | Manual, no API, attribution required. Commercial-use status is disputed (a Sept-2026 audit says "no commercial license, ever"). **Do not build on it** | [S, conflicting] [audit](https://raw.githubusercontent.com/muzzamilhassan/automation/HEAD/research/premium-upgrade-research-2026-09-20.md) |
| MapChart | Free "colour the regions" static maps, widely used as stills by Shorts map accounts | Free (ads) | Static | [U] |
| Flourish (Canva), Datawrapper | Data-viz incl. animated maps/story mode; newsroom maps | Free tiers + business/newsroom plans | Interactive embeds, not narrated video | [U] |
| kepler.gl | Open-source (MIT) geospatial viz with trip animation | Free | Analyst tool | [U] |
| Mapbox Studio / GL JS | Styling and rendering platform | 50,000 free web map loads/mo, then metered; GL JS proprietary since v2 | Infrastructure, not a competitor | [S] [mapbox.com/pricing](https://www.mapbox.com/pricing) |
| **iart.ai** | "AI motion agent" (prompt/CSV/brand kit → editable motion graphics, batch export). Open-sourced MIT `map-animation-skills`: Vox-style zooms, drawn routes, pins, region highlights, via Earth Studio → AE or GeoJSON/SVG | Not captured | Closest AI+maps entrant found; generic motion, no history/narrative engine | [S] [GitHub](https://github.com/iart-ai/map-animation-skills) |
| HyperFrames (HeyGen, Apache-2.0) | Agent-oriented HTML/GSAP deterministic renderer; ~49k stars in under a year; lists "map animations" as a use case | Free open source | Signals HeyGen ($100M+ ARR [S]) could ship map explainers | [S] landscape |

### 2.4 What users complain about (and what we should do instead)

From the August 2026 teardown, which cites Trustpilot, AppSumo, G2 and Capterra reviews [S]:
1. **Opaque credits and double meters**: video count plus AI credits (Zebracat), project caps plus credits (Faceless.so), credits that expire with no rollover. → One simple unit (finished minutes), an estimate shown before every render, and rollover.
2. **Paying before seeing the result.** Users ask for cheap watermarked previews; the TubeGen and Zebracat failures cost credits. → A free low-res "animatic" preview is the default; credits are spent only on the final render.
3. **Cannot edit after render**: text, voice and music are locked, so users rebuild and burn credits again. → A scene graph you can edit, with per-scene regeneration.
4. **Failed renders not refunded; peak-time crashes.** → Automatic refunds for failures, with a published policy.
5. **Generic "slop" output**: inconsistent scenes, distorted AI faces, stock clips that don't match the script. → Deterministic vector map scenes plus curated assets; no photoreal faces by default.
6. **Length and resolution caps**: 5-min max (Zebracat), 90 s (Faceless.so), long-form only on $129+ plans (StoryShort). → 10–20 min long-form and 4K on Pro.
7. **Generic scripts that need heavy rewriting** (TubeGen). → A research-backed, cited script with a hook/retention structure.
8. **Billing traps and no-refund policies**: AppSumo lifetime-deal "bait-and-switch" (Zebracat), surprise annual renewals (Vidnoz Trustpilot ≈2.3). → Clear billing, a 7–14-day refund window, no lifetime deals.
9. **Copyright problems**: "royalty-free" music triggering Content ID; possibly copyrighted tracks in libraries (StoryShort, NoLang). → Only licensed, Content-ID-safe music with a dispute-help workflow.
10. **AI image/video models can't draw accurate maps.** Labels come out garbled ("cannot render precise, consistent technical diagrams" [S]). This is the core technical reason generic tools fail at our niche, and it is our moat.

### 2.5 White space
**The opening is "Kings-and-Generals/RealLifeLore-grade maps from a prompt or a script, at long-form length, editable, accurate and policy-safe".**
- Travel apps prove people will pay for map motion.
- Faceless tools prove they will pay for automated script, voice and edit.
- No one combines the two with *historical* data: borders by year, armies, fronts, routes, weather and fog-of-war effects, data overlays.

---

## 3. Demand signals

### 3.1 Channel scale (supply side of the format)

| Channel | Subs / scale | Source |
|---|---|---|
| Kurzgesagt | 24M+ | [S] [research log Apr-2026](https://raw.githubusercontent.com/fy538/project-parallax/HEAD/project/RESEARCH_LOG.md) |
| Vox | 12.5M; ~2.1M avg views/video | [S] same |
| OverSimplified | 8M+ | [S] same |
| RealLifeLore | ~7.9M; ~1.91B total views; one video ("why nobody wants this land") at 8.86M views | [S] same + public trending datasets |
| Johnny Harris | ~7.5M | [S] same |
| Wendover Productions | ~4.9M | [S] same |
| Kings and Generals | ~4M | [S] same |
| PolyMatter / CaspianReport | ~1.93M / ~1.8M | [S] same |
| Kraut | ~600K, but ~34.6K avg likes/video | [S] same |
| EmperorTigerstar, Ollie Bye, Epic History, MapMen, short-form map accounts | Large, but not verified this session | [U]: check Social Blade |

Market sizing from the same source: about 16 major English channels, about 55M combined subscribers, an estimated 15–30M unique regular viewers [S]. Non-English history/geo channels (Spanish, Portuguese, Hindi, Arabic, Indonesian, German, French) multiply this [E].

### 3.2 Creator economics (why creators will pay)
- **YouTube ad RPM** for geopolitics/education is about $4–7 for US/UK audiences. CaspianReport is estimated at about $8–11K/month from AdSense alone [S, research log].
- **Shorts**: about 74% of Shorts views come from non-subscribers, so Shorts are the discovery funnel for long-form [S]. Some 2026 niche reports quote Shorts RPMs of $2–35. I treat those as **implausible**; Shorts pay far less than long-form.
- **TikTok Creator Rewards**: about $0.40–1.00 per 1,000 qualified views (community-reported) [S]. Eligible videos must be **at least 1 minute long** [V] ([TikTok terms, Open Terms Archive mirror](https://github.com/OpenTermsArchive/pga-versions/blob/main/TikTok/Content%20Monetisation%20Policy.md)).
- **Value anchor [E]**: a 10-min map-heavy video done by hand (AE + GEOlayers) takes a skilled editor days. Freelance cost is plausibly $500–3,000 per video [U]. We would replace that with $10–30 of credits.

### 3.3 Faceless-automation market signals [S, single secondary source; verify]
- Crayo about $600K/month revenue; Submagic $8M ARR with 13 employees.
- Higgsfield $200M ARR and $1.3B valuation; HeyGen $100M+ ARR; OpusClip $215M valuation; Captions/Mirage $500M valuation.
- Canva acquired Cavalry (data-driven animation) in February 2026; Hera (text-to-motion-graphics) went through YC S25 ([startup research](https://raw.githubusercontent.com/Zalamancer/autoStudio/HEAD/AutoAnimation/docs/startup-research.md)).
- Open-source demand: MoneyPrinterTurbo ~122k GitHub stars; HyperFrames ~49k in under a year [S landscape].

### 3.4 Segments and willingness to pay

| Segment | Job to be done | WTP [E] | Fit | Notes |
|---|---|---|---|---|
| Faceless history/geo/geopolitics creators (incl. non-English) | Weekly long-form plus daily shorts | $29–199/mo | **Launch segment** | Most price-sensitive about per-video cost; most exposed to policy risk |
| Established map/history channels and their editors | Speed up pre-viz and maps; keep their own style | $79–499/mo | High (pro features, export layers) | Want editable output and AE/Premiere export, not autopilot |
| Educators / teachers / edtech | Classroom explainers, flipped lessons | $5–15/mo per teacher; site licences | Medium | Low WTP; procurement; child-safety; accuracy matters most |
| News & digital media explainer desks | Breaking-news map explainers in minutes | $500–5,000+/mo | High value, later | Need brand kits, API, SLA, legal review, C2PA under their own cert |
| Travel creators / tourism boards | Route and trip stories | $0–15/mo | Low (commoditized) | Cover as a style; don't compete on price |
| Wargaming / strategy / alt-history communities (HOI4, Total War, r/imaginarymaps) | Battle recaps, alt-history timelines, campaign AARs | $10–30/mo | Medium | Great word-of-mouth and template seeding |
| Corporate / NGO / museums | Supply-chain, migration, climate, heritage stories | $199–999/mo | Medium | Data overlays, brand compliance |

### 3.5 Counter-signals (be honest about these)
- **The "AI slop" backlash is mainstream** [S, [playbook](https://raw.githubusercontent.com/danielzhang04/kb/HEAD/orgs/faceless-youtube/knowledge/research/niche-playbooks/universal.md)]:
  - A Kapwing sweep flagged 278 AI-slop channels with about 63B views and estimated about 21% of Shorts served to new users are pure slop.
  - YouTube's January 2026 wave reportedly terminated 16 channels (about 35M subscribers, about 4.7B lifetime views).
- **War content specifically**: DFRLab (March 2026) found AI-generated YouTube channels co-opting war coverage to farm nearly 2B views [S, [DFRLab](https://dfrlab.org/2026/03/23/ai-generated-youtube-channels-co-opt-war-coverage-to-farm-nearly-two-billion-views/)]. Our war/geopolitics niche is the one most scrutinized for synthetic misinformation.
- **Audience research claims** (secondary, method unclear): AI narration causes higher early drop-off, and AI-perceived content gets lower trust [S]. → Offer own-voice cloning, human narration upload, and visibly crafted output.

---

## 4. Platform policy and regulation

### 4.1 YouTube [V unless marked]
Source: monetization policy text ([support.google.com/youtube/answer/1311392](https://support.google.com/youtube/answer/1311392)).
- **15 July 2025**: "repetitious content" was renamed **"inauthentic content"** and clarified to include "repetitive or mass-produced" content.
- **Generic or repetitive content.** These are listed as not monetizable:
  - "Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"
  - "**AI-generated content made with generic or unoriginal templates giving the impression of mass production without adding the creator's original, authentic insights or perspective**"
- **Allowed**: the same intro and outro when "the bulk of your content is different". YouTube also says "the substance of each video should be materially varied".
- **Unsatisfying or off-putting content** (a newer section) explicitly allows "using AI to edit your video scripts or generate a unique background visual". It disallows content "that lacks a clear narrative arc", and "realistic visuals tricking viewers into believing a fake ... natural disaster has occurred".
- **AI Personas Related to Sensitive Topics**: channels using AI personas presenting as human experts on "health, legal issues, finances, or politics" **cannot monetize**. This is relevant if we ever add AI presenters for geopolitics.
- **Reviewers look at the channel as a whole**: "main theme, most viewed, newest, biggest watch-time, metadata, About". Demonetization is channel-wide, so one user's bad batch kills their whole channel.
- **Altered/synthetic disclosure** [S]:
  - Disclosure is mandatory for *realistic* synthetic people, places or events. It is not needed for clearly animated or stylized content or for production assistance.
  - YouTube says disclosure does not reduce reach or monetization.
  - Since **May 2026** YouTube auto-detects and can apply labels itself ([blog 2026-05-27](https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/)).
  - A 2026-09-24 test upload showed YouTube **carries forward C2PA 2.1+ "made with AI" assertions as a visible label** ("How this was made: Made with AI") ([support 15447836](https://support.google.com/youtube/answer/15447836), [test notes](https://raw.githubusercontent.com/wiltodelta/remove-ai-watermarks/HEAD/docs/legal-and-safety.md)).
- **Ad suitability**: war, massacre, terrorism and similar keywords in titles and thumbnails trigger limited ads, even for neutral coverage [S]. Our war niche needs a title and thumbnail "ad-safety" checker.

### 4.2 TikTok
- **Creator Rewards**: "eligible User Content with a duration of at least 1 minute" (January 2026 version) [V]. → Offer 61–90 s vertical cuts as a first-class format.
- **AI labeling**: TikTok reads C2PA Content Credentials to auto-label AI content and adds its own invisible watermark to content made with its AI tools ([newsroom 2025-11-19](https://newsroom.tiktok.com/more-ways-to-spot-shape-and-understand-ai-content?lang=en)) [S]. Secondary sources report strikes for unlabeled realistic AI [S].
- **Unoriginal/duplicate-content enforcement** from 15 September 2025 (reduced visibility, points) [S]. → Platform-specific variants, not identical cross-posts.
- **Auto-posting via the Content Posting API** requires an app audit (reported 2–6 weeks); until then posts are private-only [S]. The US algorithm has been run by the TikTok USDS Joint Venture since 22 January 2026 [S].

### 4.3 Meta (Instagram/Facebook) [S]
- Since July 2025: reduced distribution and monetization exclusion for unoriginal or reposted content ([TechCrunch](https://techcrunch.com/2025/07/14/following-youtube-meta-announces-crackdown-on-unoriginal-facebook-content/)).
- "AI info" labels are applied from C2PA/IPTC indicators.
- AI disclosure in ads is reported as mandatory globally in 2026.

### 4.4 EU AI Act Article 50 [S unless marked]
- **Timeline**:
  - Article 50 applies from **2 August 2026**.
  - The Digital Omnibus on AI (Regulation (EU) 2026/1744, Official Journal 24 July 2026) pushed high-risk duties to December 2027 / August 2028 but **left Article 50 unchanged**.
  - Only systems **already on the market before 2 August 2026** get until **2 December 2026** for Art. 50(2) marking ([Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/), [summary](https://raw.githubusercontent.com/f-o-x11/dreaming-press/HEAD/content/posts/eu-digital-omnibus-ai-act-delay-august-2-transparency-deadline-founders.md)). **A new product launching now has no grace period.**
- **Provider duty (that's us)**: machine-readable marking of synthetic audio, image, video and text, plus a detection mechanism. There is a carve-out for "standard editing" that doesn't substantially alter the input.
- **Final Code of Practice** on transparency of AI-generated content (10 June 2026) ([EU page](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content)):
  - Two required layers: **secured metadata (C2PA satisfies it) plus a robust watermark**.
  - Optional fingerprinting and logging.
  - Detection/verification protocols.
  - Standardized EU disclosure icons.
- **Deployer duty (our users)**: visible disclosure for **deepfakes**, meaning content resembling real persons, places or events that would falsely appear authentic. There is a lighter regime for artistic, satirical or fictional work. AI text on matters of public interest needs disclosure unless a human editor takes editorial responsibility.
- **Penalties**: up to €15M or 3% of worldwide turnover ([summary](https://raw.githubusercontent.com/spdaly/brain/HEAD/wiki/concepts/Article%2050%20transparency%20obligations.md)).

### 4.5 Other jurisdictions [S]
- **India**: IT Rules amendment G.S.R. 120(E), in force 20 February 2026. Intermediaries offering synthetic-content tools must not enable removal of labels, metadata or identifiers. The MeitY FAQ says no "remove watermark" or "export without metadata" functions ([MeitY PDF](https://www.meity.gov.in/static/uploads/2026/02/550681ab908f8afb135b0ad42816a1c9.pdf)).
- **China**: AI labeling measures in force since 1 September 2025.
- **South Korea**: AI Framework Act since 22 January 2026.
- **US**: state deepfake laws (e.g. Washington 2026; California AB 2655 on political content).
- **Map-depiction laws** [U/E]: India and China penalize "incorrect" national boundaries. → Disputed-border handling must be configurable.

### 4.6 Policy-risk table

| Policy | What it says | Risk to users / us | Likelihood × impact [E] | Product mitigation |
|---|---|---|---|---|
| YouTube inauthentic / generic-repetitive [V] | Templated, mass-produced AI content can't monetize; enforced channel-wide | Users demonetized → churn and blame on us | High × High | Variety engine (no two videos share a structure, palette or motion signature); required human review/edit step; custom voice, brand and POV prompts; per-channel style uniqueness; "authorship log" export; no unattended bulk autopilot on low tiers |
| YouTube unsatisfying/off-putting [V] | No narrative arc, shock-only, fake-disaster realism | Medium × High | | Narrative-arc linting; ban photoreal fake-event generation |
| YouTube AI personas on sensitive topics [V] | AI "experts" on politics can't monetize | Medium × Medium | | No AI-presenter avatars for political topics; default faceless map style |
| YouTube altered/synthetic disclosure + C2PA carry-forward [S] | Realistic synthetic content must be disclosed; C2PA "made with AI" shows as a label | High × Medium (perception) | | Stylized by default (generally exempt); per-video disclosure advisor; granular C2PA assertions; legal review of the digitalSourceType choice |
| YouTube ad-suitability for war content [S] | Violent keywords and imagery → limited ads | High × Medium | | Title, thumbnail and script "ad-safety" checker; non-graphic war iconography (arrows, unit icons, not gore) |
| TikTok AI labels, C2PA, invisible watermark [S] | Auto-labels; strikes for unlabeled realistic AI | Medium × Medium | | Embed C2PA; prompt users to toggle the label; keep visuals stylized |
| TikTok unoriginal-content rules; Creator Rewards ≥1 min [V/S] | Duplicate cross-posts penalized; monetization needs ≥60 s | High × Medium | | Platform-native variants (different hooks, captions, framing); 61–90 s TikTok preset |
| Meta unoriginal content [S] | Reposted / low-effort AI loses distribution | Medium × Medium | | Same as above |
| EU AI Act Art. 50 + Code of Practice [S] | Machine-readable marking + watermark + detection; deepfake disclosure | Certain × High (fines up to 3% turnover) | | C2PA manifests on every export, invisible watermark, public verify endpoint, disclosure UI and EU icon option, records retention |
| India IT Rules 2026 [S] | No label/metadata removal features | Medium × Medium | | Never offer "export without metadata"; keep marks on all tiers |
| Copyright / Content ID [S] | Claims block or monetize; music is the main trigger | High × Medium | | Licensed music with an allow-list registry; dispute pack; no scraping of YouTube clips (that breaches YouTube's ToS regardless of fair use [S]) |
| Map data licences [S] | OSM ODbL needs attribution; MapTiler Free is **non-commercial**; Earth Studio is unsafe; the common historical-borders set (aourednik) is **GPL-3.0** | Medium × High | | Licensed tiles (MapTiler Flex/Unlimited or self-hosted OSM/Natural Earth), auto-generated attribution in descriptions, curated licensed historical-borders library |
| Disputed borders / national map laws [U] | Some states penalize "wrong" borders | Low–Med × High | | Per-audience border presets (de facto / de jure / local law), dashed disputed lines |
| Misinformation / propaganda misuse [S] | War channels farming views with synthetic coverage | Medium × High (reputation) | | Citation-backed scripts, fact-check report, refusal policy for fabricated current-event footage, abuse monitoring |

### 4.7 Implications: compliance-by-design features (all [E])
1. Free low-res preview, then a human-in-the-loop "Review & Personalize" step before the final render (edit hook, POV, voice, brand). Record it in an authorship log the user can download.
2. A "Channel Fingerprint": each workspace gets unique style parameters (palette, typography, motion curves, transitions, music mood) so channels on our platform don't look alike. Templates vary per video.
3. Stylized-by-default rendering. Photoreal generative video is opt-in "hero shots", auto-flagged for disclosure.
4. C2PA plus invisible watermark on every export. Choose the assertions carefully: e.g. mark as a composite that includes AI-generated elements rather than "fully AI-generated", if counsel agrees. This affects whether YouTube shows "Made with AI".
5. Script fact-check with sources, a "contested claims" flag, and disputed-border presets.
6. Ad-safety and policy linter on titles, thumbnails and scripts.

---

## 5. Pricing recommendation

### 5.1 Price anchors (from §2)
- **Shorts tools**: $19–49 entry, $99–199 high (AutoShorts, Faceless.so, StoryShort, Zebracat, Revid). That works out to about $1–2.60 per short [S].
- **Long-form AI**: TubeGen $149–849/mo, about $1.94–2.47 per finished minute [S].
- **Avatars**: about $3–4 per minute via API (HeyGen) [S].
- **Render-only APIs**: Shotstack $0.20/min on subscription ($39/mo) or $0.30/min PAYG; JSON2Video $16.95/mo for 50 min; Creatomate $54/mo [S].
- **Travel map apps**: $0–10/mo [U].
- **Pro manual path**: AE (~$23/mo [U]) + GEOlayers (~$195 [U]) + tiles ($25+/mo) + editor time.

### 5.2 COGS model per finished minute [E, based on stated prices]

| Component | Assumption | Cost |
|---|---|---|
| LLM: research, script, scene plan, QA | Sonnet 5.5 $2/$10 per 1M tokens, Haiku 4.5 for QA, prompt caching, Batch (−50%) where not interactive. Short ≈$0.08–0.25 per video; 10-min ≈$0.8–1.5 per video incl. ~20 web searches (search-tool price not verified) | ≈$0.08–0.15/min long-form |
| Narration | Google Chirp 3 HD **$30 per 1M characters** [V, [cloud.google.com/text-to-speech/pricing](https://cloud.google.com/text-to-speech/pricing)]; ~900 characters/min | ≈$0.03/min (premium third-party voices ≈$0.10–0.30/min [U]) |
| Render | Local spike: ≈0.65 CPU-s per 1080p frame (CPU-only Mesa, no AA) up to ≈3.2 CPU-s with SwiftShader → 0.33–1.6 vCPU-h per minute at 30 fps; ~$0.03–0.05 per vCPU-h | ≈$0.01–0.08/min, plus Remotion Automators $0.01 per render |
| AI imagery (optional) | Imagen 4 Fast **$0.02/image** [V, [Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)]; 3–6 per minute | ≈$0.06–0.12/min |
| Generative "hero" video (optional) | Veo 3.1 Lite video-only **$0.03/s 720p, $0.05/s 1080p**; Veo 3.1 Fast video-only **$0.10/s 1080p** [V, Vertex] | $0.15–0.50 per 5-s shot |
| Storage, egress, music/SFX amortization | | ≈$0.02–0.05/min |
| **Total** | | **Standard ≈$0.15–0.35/min. Premium (premium voice + images + 2 hero shots/min) ≈$0.60–1.30/min. A 60-s short ≈$0.25–0.45** (fixed LLM overhead) |

Payment fees (Stripe or a merchant of record such as Paddle) add about 4–8% of revenue [U].

### 5.3 Recommended tiers [E]
One unit: **1 credit = 1 minute of finished 1080p standard video**, billed in 30-s steps.

| Plan | Price (monthly / annual-equivalent) | Credits | Key features | GM at full use → at typical ~55% use |
|---|---|---|---|---|
| **Free** | $0 | 3/mo (three ≤60 s videos) | 720p, watermark + end card, 3 starter styles, standard voice, **non-commercial licence**, 7-day storage, slow queue, unlimited low-res previews (rate-limited) | n/a (CAC ≈$0.75–1.35 per active free user/mo) |
| **Creator** | $29 / $23 | 30 | 1080p, no watermark, all aspect ratios with re-layout, commercial licence, paste-your-script, per-scene regen, 2 brand presets, standard + HD voices, upload own narration | ~64–84% → ~80–90% |
| **Pro** | $79 / $63 | 100 | 4K (2 credits/min), premium voices and own-voice clone, AI imagery, 10 hero-shot credits, 5 languages, brand kit, priority render, long-form up to 20 min | ~56–81% → ~75–88% |
| **Studio** | $199 / $159 | 300, 3 seats | Team review/approval, series planner, white-label, custom style training, API beta, AE/Premiere layer export | ~47–77% → ~68–85% |
| **Business / Media** | from $499/mo (annual) | Custom | SSO, SLA, newsroom templates, C2PA signed with the customer's cert, legal/fact-check workflow, indemnity, dedicated support | ≥75% target |
| **Top-ups** | $1.25/credit (packs of 25/100/500 with volume discount), valid 12 months | | | |
| **Education** | Teacher $9/mo or $79/yr (12 credits, no watermark, classroom-safe filters); school site licences | | | |
| **API** | Full pipeline **$1.00 per finished minute** list, tiering to $0.50 at 10k+ min/mo; render-only from our scene JSON $0.25/min; **$99/mo minimum** | | | Mirrors Remotion's $100 minimum and Shotstack's $0.20–0.30 |

Feature surcharges in credits: 4K ×2, premium voice +0.5/min, hero shot 1 credit (Lite) or 3 credits (Fast) per 5 s. Show the estimate before every render. Unused subscription credits roll over for one cycle; refund credits automatically on failed renders.

**Rationale:**
1. $0.66–0.97 per minute undercuts TubeGen by 2–3× while matching shorts tools per video.
2. A simple single unit answers the #1 complaint category.
3. Premium features carry their own credit prices, so heavy users can't push gross margin below about 50%.
4. **Target blended COGS ≤20–25% of revenue (GM ≥75%)**, with a hard floor of 60% GM per plan at full use after payment fees. Re-price if telemetry breaks it.
5. Regional (PPP) pricing at roughly 40–60% off for India, LatAm and SEA, where faceless-creator density is high. Gate it by card country.

### 5.4 Free tier and abuse prevention [E]
- **Purpose**: viral loop (end card "Made with ___") and a showcase of quality.
- **Controls**:
  - Email plus phone verification (or a card) to unlock the free credits.
  - Cloudflare Turnstile-style bot checks; device and IP fingerprinting; one free account per phone or payment instrument.
  - Block disposable email domains; low-priority queue; daily preview caps.
  - Similarity detection for bulk near-duplicate prompts (farm signal).
  - Non-commercial licence plus watermark plus C2PA.
  - Automatic deletion after 7 days.
  - Content moderation: extremist propaganda, graphic violence, real-person deepfakes, fabricated current-event footage.
- **Paid tiers**: velocity limits on top-ups and a merchant of record for VAT and chargebacks. **Avoid lifetime deals** (the Zebracat AppSumo backlash [S]).

---

## 6. Positioning and differentiation

**Positioning statement [E]:** "The AI studio for map-driven storytelling: research-backed scripts and cinematic, accurate animated maps (borders through time, armies, routes, data and weather) in any format, editable scene by scene, and safe to monetize."

**What would make it clearly the best:**
1. **A geo-truth engine**: geocoding, a curated, licensed historical-borders-by-year library, battle and route datasets, and a citation report. Generic AI image/video models cannot draw accurate labelled maps, so this is the moat.
2. **A map-native motion grammar**:
   - Camera language: fly-to, orbit, punch-in, parallax terrain.
   - Border morphs and front lines.
   - Unit icons with animated arrows and pincer movements; route drawing with vehicles.
   - Choropleth/bubble data overlays; callouts, portraits and flags.
   - Particle FX: rain, snow, smoke, fire, fog of war.
   - All deterministic, so output is consistent and re-renderable.
3. **Long-form first, with auto shorts**: 10–20 min 16:9, plus automatically *re-composed* (not cropped) 9:16, 1:1 and 4:5 cutdowns, including 61–90 s TikTok-eligible versions.
4. **An editable scene graph plus chat editing**: per-scene regeneration, swap styles without re-scripting, export layers for pros (AE/Premiere/XML).
5. **Style system with uniqueness**: many presets by genre (parchment medieval, WW2 newsreel, modern intel-briefing, minimalist flat, satellite/terrain, retro atlas, neon data). Each workspace gets a unique fingerprint, so outputs don't look templated. Never clone a specific channel's trade dress.
6. **Policy-safe by design** (§4.7): this is a feature creators will pay for in 2026.
7. **Transparent economics**: estimate before render, free previews, refunds on failure, rollover.

---

## 7. Go-to-market ideas [E]
1. **Showcase channels.** Run 3–5 in-house channels (e.g. English long-form history, English shorts geography, Spanish and Hindi geopolitics) with genuine editorial input. Publish retention and RPM results; this is proof the output monetizes.
2. **Programmatic SEO gallery.** One page per topic: "Animated map of the Roman Empire", "WW2 Eastern Front map animation", "History of Poland's borders", each with a free sample video and "make your own". Target "how to make Kings and Generals style maps" and "map animation software" queries.
3. **Template/topic marketplace.** Community-submitted styles and topic packs, with revenue share later.
4. **Creator partnerships.** Mid-size (100k–1M) history/geo channels and map-focused TikTok accounts get free Pro in exchange for credited use, case studies and affiliate. 30% recurring affiliate for 12 months, the category norm.
5. **Communities.** r/MapPorn, r/imaginarymaps, r/NewTubers, r/PartneredYoutube (follow the rules), Paradox/HOI4 and Total War communities, faceless-creator Skool groups; YouTube tutorials.
6. **Launches.** Product Hunt with a map-heavy demo; Hacker News "Show HN" on the rendering tech.
7. **Education.** Free teacher plan, Teachers Pay Teachers resources, ISTE.
8. **Media (phase 2).** Outbound to digital newsrooms' explainer desks with API, brand kit and fast-turnaround demos on current events, behind an accuracy workflow.
9. **Localization from day 1** (script and voice in 10+ languages). Most competitors' quality drops off outside English [S].

---

## 8. Gaps and what to verify next
- **Re-check every [S] price** on vendor pages: InVideo (conflicting), Synthesia API gating (conflicting), mult.dev, TravelAnimator and TravelBoast prices (not captured).
- **Do a focused search** for 2024–2026 "AI map video" / "AI history video" startups. My search was degraded; iart.ai and Hera are the nearest found.
- **Get legal opinions** on:
  - Whether a stylized programmatic map video counts as an Art. 50(2) "synthetic video".
  - Which C2PA digitalSourceType to assert.
  - Google Earth Studio commercial terms (sources conflict).
  - GPL-3.0 historical-border data.
- **Pull channel stats** for EmperorTigerstar, Ollie Bye, Epic History and MapMen from Social Blade.


## KEY RECOMMENDATIONS
- Position as the map-native storytelling studio (geo-accurate maps + research-backed narrative), not another faceless generator, because no competitor found combines a geographic/historical engine with AI scripting and narration.
- Launch wedge: 10-20 min 16:9 history/geopolitics explainers with auto re-composed 9:16/1:1/4:5 cutdowns, because faceless competitors cap at 90 s-5 min (Zebracat 5 min, Faceless.so 90 s) and long-form is where RPM is.
- Price on one transparent unit (1 credit = 1 finished minute): Free 3, Creator $29/30, Pro $79/100, Studio $199/300, top-ups $1.25, because it undercuts TubeGen's ~$1.94-2.47/min while keeping ~75-85% gross margin at typical use.
- Make free low-res animatic previews, per-scene regeneration, a pre-render cost estimate and automatic refunds for failed renders the default, because paying before seeing the result and opaque credits are the top complaint categories across competitors.
- Build originality and compliance into the workflow (unique per-channel style fingerprint, required human review/personalize step, authorship log, narrative-arc and ad-safety linting), because YouTube demonetizes templated mass-produced AI content channel-wide.
- Keep visuals stylized by default and make photoreal generative video an opt-in hero shot with automatic disclosure prompts, because stylized/animated content is generally exempt from YouTube's altered-content label and avoids war-misinformation risk.
- Ship EU AI Act Article 50 compliance at launch (C2PA manifest + invisible watermark + verification endpoint + deepfake disclosure UI), because new systems launched after 2 Aug 2026 get no grace period and fines reach 3% of turnover.
- Get a legal opinion on which C2PA assertion to use (composite vs fully AI-generated), because YouTube now surfaces C2PA 'made with AI' metadata as a visible label that affects how viewers perceive users' videos.
- Offer a 61-90 s vertical preset and platform-specific variants rather than identical cross-posts, because TikTok Creator Rewards requires videos of at least 1 minute and TikTok/Meta penalize duplicate or unoriginal reposts.
- Use only commercially licensed map data with automated attribution (paid MapTiler or self-hosted OSM/Natural Earth, a curated licensed historical-borders library) and never Google Earth Studio, MapTiler Free or CapCut free, because those are non-commercial or disputed for a hosted SaaS.
- Add disputed-border presets and a citation/fact-check report to every script, because accuracy is both the moat and the liability shield for war and geopolitics content.
- Sequence segments: faceless and history creators first, then pro map channels (layer export), then educators (cheap teacher plan), then newsrooms (API, SLA, brand kits), because willingness to pay and product readiness rise in that order.
- Run 3-5 in-house showcase channels plus a programmatic SEO topic gallery and a 30% recurring affiliate program, and avoid AppSumo lifetime deals, because visible proof that videos monetize is the strongest acquisition lever and lifetime deals have caused competitor backlash.
- Make the free tier non-commercial, 720p and watermarked, with phone/card verification, device fingerprinting and similarity detection, because free AI video tiers attract content-farm abuse that burns compute.

## COST ITEMS
- Remotion Company License - Remotion for Automators: $0.01 per render, $100/month minimum / per render / monthly minimum (fixed) (From the project's known facts; confirmed by a Sept-2026 secondary source. Free if the company has 3 or fewer employees. Not re-fetched today (domain blocked).) https://www.remotion.dev/docs/license/pricing
- Remotion for Creators seat: $25/seat/month / per seat per month (fixed) (Alternative licence; Enterprise from $500/month.) https://www.remotion.dev/docs/license/pricing
- Claude Sonnet 5.5 API: $2 input / $10 output per 1M tokens (cache read $0.20); Batch API 50% off / per 1M tokens (From the project's known facts (cached 2026-09-25), not re-verified by me. Estimated $0.08-0.25 per short and $0.8-1.5 per 10-min video for research, script and scene plan.) https://www.anthropic.com/pricing
- Claude Haiku 4.5 API: $1 input / $5 output per 1M tokens / per 1M tokens (Known facts; suitable for QA and lint passes.) https://www.anthropic.com/pricing
- Google Cloud Text-to-Speech Chirp 3: HD voices: $30 per 1M characters (0-1M tier) / per 1M characters (Verified from the cloud.google.com page saved today. About 900 characters per narrated minute, so about $0.027/min. The same page lists Studio voices at $160 per 1M characters.) https://cloud.google.com/text-to-speech/pricing
- Vertex AI Imagen 4 Fast / Imagen 4 / Imagen 4 Ultra: $0.02 / $0.04 / $0.06 per image / per generated image (Verified from the saved cloud.google.com page. Optional illustrative assets, ~3-6 per minute, so about $0.06-0.12/min.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Vertex AI Veo 3.1 Lite (video only): $0.03/s (720p), $0.05/s (1080p); with audio $0.05/s 720p, $0.08/s 1080p / per second of generated video (Verified from the saved page ('per 1 count', taken to mean per second). Use only for opt-in 5-s hero shots, about $0.15-0.25 each.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Vertex AI Veo 3.1 Fast (video only): $0.08/s (720p), $0.10/s (1080p), $0.25/s (4K) / per second of generated video (Verified from the saved page. Veo 3.1 standard video-only is $0.20/s at 720p/1080p.) https://cloud.google.com/vertex-ai/generative-ai/pricing
- Render compute (CPU-only WebGL map frames): about 0.65 CPU-s per 1080p frame (Mesa llvmpipe, no AA), up to about 3.2 CPU-s (SwiftShader), so 0.33-1.6 vCPU-hours per finished minute at 30 fps, about $0.01-0.08/min / per finished minute (Preliminary measurement by a parallel agent. The $/vCPU-hour figure is my estimate (~$0.03-0.05); confirm with the infra research.) local spike: /tmp/claude-0/-home-user-crun/7ef9826d-a86c-53b7-8a22-34a16f78f234/scratchpad/spike/seq1.log
- Shotstack render API (competitor/alternative): $0.20/min on subscription from $39/mo (200 credits); $0.30/min pay-as-you-go / per rendered minute (Secondary (Sept-2026 landscape doc). A price anchor for API pricing.) https://shotstack.io/pricing
- Creatomate / JSON2Video render APIs: Creatomate Essential $54/mo (~143 min at 720p); JSON2Video Hobby $16.95/mo (50 min, 1-min max), Professional $49.95 (200 min) / per month (Secondary (Sept-2026 landscape doc). Anchors only.) https://json2video.com/pricing
- Replicate Wan 2.2 i2v FAST (open-weight image-to-video): $0.05 per ~5-s 480p clip / per clip (Secondary (Sept-2026 landscape doc). A cheaper option for subtle motion on illustrations.) https://replicate.com/blog/wan-22
- MapTiler Cloud: Free (non-commercial, logo required); Flex $25/mo; Unlimited $295/mo; extra sessions $2.00 / $1.50 per 1,000 / per month (Secondary (api-evangelist harvest). The free tier is NOT usable commercially. RealLifeLore credits MapTiler.) https://www.maptiler.com/cloud/pricing/
- Mapbox web map loads: 50,000 free web map loads per month, then metered / per month (Secondary (2026 notes citing mapbox.com). GL JS is proprietary since v2; check terms for video/broadcast use.) https://www.mapbox.com/pricing
- HeyGen API (optional AI presenter): about $0.05-0.067 per second (Avatar IV 1080p), prepaid from $5 / per second of avatar video (Secondary. Only relevant if a presenter feature is added; avoid for political topics (YouTube AI-persona rule).) https://www.heygen.com/api-pricing
- C2PA production signing certificate / signing service: Quote-based (e.g. Truepic); basic Adobe identity reportedly free / annual / contract (fixed) (Secondary. Needed for trust-listed Content Credentials under the EU Code of Practice; budget for it.) https://raw.githubusercontent.com/indranilbanerjee/digital-marketing-pro/HEAD/docs/c2pa-production-cert-guide.md
- Payment processing / merchant of record: about 4-8% of revenue (Stripe or Paddle-style MoR incl. VAT handling) / % of revenue (From memory, not verified; include in gross-margin math.) https://www.paddle.com/pricing

## RISKS
- Platform demonetization of users: YouTube's inauthentic/generic-repetitive policy is enforced channel-wide (16 large AI channels reportedly terminated in Jan 2026). If our output looks templated, users lose monetization, churn and blame the product.
- War and geopolitics content draws the heaviest scrutiny: DFRLab (Mar 2026) found AI channels farming ~2B views off war coverage. Our niche risks reputational damage, ad limits on violent keywords, and misuse for propaganda.
- EU AI Act Article 50 applies from 2 Aug 2026 with no grace period for newly launched systems. Missing C2PA plus watermark marking or detection could mean fines up to 3% of turnover, and the provider/deployer split and whether programmatic map video is in scope are legally unsettled.
- Labeling trade-off: embedding C2PA 'AI-generated' assertions (needed for compliance) can trigger visible 'Made with AI' labels on YouTube, TikTok and Meta, which some users will see as hurting trust and retention.
- Competitive convergence: well-funded players (HeyGen with HyperFrames, which lists map animations; Canva after the Cavalry acquisition; InVideo; Higgsfield; iart.ai; Hera) could add map modules. Open-source agent skills and coding agents are commoditizing basic route and zoom animations.
- Data and asset licensing: MapTiler Free is non-commercial; Google Earth Studio's commercial status is disputed; the most-used historical-borders dataset (aourednik) is GPL-3.0 and approximate; OSM needs ODbL attribution; 'royalty-free' music causes Content ID claims.
- Map accuracy and legal exposure: wrong historical borders or disputed-territory depictions (e.g. Kashmir, Crimea, Taiwan) can cause backlash or breach national map laws (India, China), so accuracy is both moat and liability.
- Cost blowouts: generative video ($0.03-0.10+/s), premium voices, 4K and long-form renders on CPU (spike: up to ~3 CPU-s/frame with SwiftShader) can push heavy users' COGS above plan price if features aren't credit-priced.
- Free-tier and content-farm abuse: multi-accounting and bulk generation burn compute and associate the brand with AI slop.
- Competitor pricing data in this report is mostly secondary (live vendor pages were blocked), so price positioning may be off until each figure is re-verified.
- Distribution dependencies: TikTok's Content Posting API audit (reported 2-6 weeks), changes under the TikTok USDS Joint Venture, and YouTube API quotas could limit auto-posting features.
- Audience backlash against AI narration and 'AI slop' may cap retention for users who don't customize voice and visuals, which hurts word-of-mouth.

## QUESTIONS FOR FOUNDER
- What is your budget and runway for the first 12 months (engineering, cloud/GPU, LLM, legal, marketing), and what launch date are you targeting?
- How many people will be on the team (including contractors) in year 1? Remotion is free only up to 3 employees; beyond that the Automators licence ($100/mo minimum) or another engine applies.
- Which launch segment do you want to own first: faceless history/geo creators, established map channels (pro export), educators, or newsrooms/media?
- Where will the company be incorporated, and will you serve EU users at launch? Do you want to sign the EU Code of Practice on AI-generated content (it gives a presumption of conformity)?
- What is your stance on C2PA labeling: accept visible 'Made with AI' labels on platforms, or should counsel look for a defensible 'composite/AI-assisted' assertion? Do you have a lawyer for AI Act, copyright and map-law questions?
- Will the product allow photoreal generative video and images (e.g. Veo hero shots, realistic battle scenes), or stay stylized-only by default?
- What content policy do you want for current wars, elections and disputed borders? Which default border depiction (de facto vs de jure), and should there be per-country presets?
- Do you want auto-posting to YouTube, TikTok and Instagram in v1? This needs Google/YouTube API verification and a TikTok app audit, plus accounts in your company's name.
- Which accounts can you open now: Anthropic API, Google Cloud (Vertex AI, TTS), AWS or another render cloud, Stripe or Paddle (merchant of record), domain and brand name, analytics?
- Which languages must be supported at launch (script and voice), and do you want regional/PPP pricing for India, LatAm and SEA?
- Will you staff in-house showcase channels with human editorial input (people, time), since that is the strongest proof-of-quality GTM lever?
- Are you open to a lifetime-deal or AppSumo launch, or should we commit to subscriptions only (recommended)? What refund policy are you comfortable with?
- Is a free tier acceptable as a marketing cost (estimated ~$0.75-1.35 per active free user per month), and what CAC/payback targets do you have?
- Do you want an API/B2B offering (newsrooms, agencies) in year 1, or only after the creator product is proven?