- [unverifiable] OpenAI GPT-5.6 is priced at $4/$20, GPT-5.6-terra at $2/$12 and GPT-5.6-luna at $0.20/$1.20 per 1M tokens (seen only in a secondary source).
  -> developers.openai.com and prices.azure.com were blocked. The LiteLLM table matches the report, and its Azure rows are the same. One oddity: LiteLLM sources the $4/$20 tier to developers.openai.com under the name 'gpt-5.6-sol', while the bare 'gpt-5.6' row has no source. The model naming is uncertain. GPT-5.5 is listed at $5/$30 with $0.50 cached. (https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json)
- [unverifiable] DeepSeek V4 Flash on DeepSeek's API costs $0.30 input (cache hit $0.006) and $1.20 output per 1M tokens (seen only in a secondary source).
  -> api-docs.deepseek.com was blocked, and LiteLLM matches the report. LiteLLM also lists cheaper non-China hosts for the same model: Fireworks $0.14/$0.28, Databricks $0.14/$0.28, Azure $0.19/$0.51. These are secondary sources. (https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json)
- [corrected] Bottom line: LLM spend is likely a minority of total cost per video, next to TTS and rendering.
  -> This is likely wrong under Google TTS pricing. TTS is about $0.0135 per minute, so it is about 3% of routing E's $0.52 LLM spend on a short. Unless you use premium TTS (ElevenLabs) or generative image or video, LLM spend is probably the largest variable cost per video, which makes model routing the main cost lever. Rendering cost was not verified. (https://cloud.google.com/text-to-speech/pricing)
- [unverifiable] Public Nominatim allows at most 1 request per second; the Wikidata Query Service limits each client to 60 seconds of processing per 60 seconds. Wikidata property IDs P625, P402, P3896, P571, P576, P580, P582, P17, P361, P31.
  -> osmfoundation.org, mediawiki.org and wikidata.org were all blocked, so none of this could be checked live. The figures match well-known policy text and property IDs, so they are plausible. (https://operations.osmfoundation.org/policies/nominatim/)
- [unverifiable] Groq gpt-oss-safeguard-20b at $0.075/$0.30, Llama Guard 3 at $0.20/$0.20, and OpenAI omni-moderation-latest free.
  -> groq.com and openai.com were blocked; LiteLLM matches. LiteLLM also lists Llama-Guard-3-8B on DeepInfra at $0.055 (secondary). (https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json)
- [corrected] Claude Haiku 4.5 is a stable choice for utility steps.
  -> Haiku 4.5 is Active, but its tentative retirement is "Not sooner than October 15, 2026," two weeks from now. Anthropic gives at least 60 days' notice. Haiku also has no 5.x successor and is the most expensive utility option: gpt-oss-120b on Vertex costs $0.09/$0.36 and Gemini 3.1 Flash-Lite $0.25/$1.50. (https://platform.claude.com/docs/en/about-claude/model-deprecations)

CONFIRMED: 21 of 27

## OMISSIONS
- Google Search grounding terms forbid our planned use. Service Specific Terms §20(k) ban caching, storing, analysing, modifying or interspersing Grounded Results, and require showing them with Search Suggestions to the end user who asked. They therefore cannot feed a fact-sheet cache shared across users or be rewritten into scripts. The budget tier needs a different search source: Claude web search plus fetch, or a third-party search API with terms that allow storage.
- Claude web search returns page content only as `encrypted_content`. The developer can read only the URL, title and a cited_text of at most 150 characters. The proposed split (search on Claude, fact sheet on Gemini Flash-Lite) needs an extra web-fetch step, which bills plain-text tokens on Claude, or a third-party search API. This changes both the architecture and the cost model. Citations must also be shown to end users.
- Remotion is not open source. Its license is free only for individuals, non-profits and companies with up to 3 employees. Above that, a prompt-to-video SaaS falls under 'Remotion for Automators': $0.01 per render, minimum $100/month (remotion-dev/remotion LICENSE.md and the docs license FAQ). The report's label 'short-video-maker (MIT; Remotion...)' hides this.
- Distillation is banned. The Anthropic Usage Policy forbids using outputs to train models without authorization, and Commercial Terms §D.4 bans training competing models. A common cost-cutting path (fine-tune a cheap open model on Claude-written scripts) is therefore off-limits unless Anthropic approves. Check the Google and OpenAI terms for similar clauses before planning it (not verified here).
- The human review requirement is narrower than the report implies. The Anthropic Usage Policy requires review by "a qualified professional in that field" and disclosure "at the beginning of each session." The report assumes an end-user approval click satisfies this. Get written confirmation from Anthropic. Commercial Terms §D.3 also requires telling users that factual claims in outputs may be wrong.
- YouTube rules beyond 'inauthentic content' (Open Terms Archive snapshot):
- Reused content bans videos that "exclusively feature readings of other materials you did not originally create, like text from websites," and applies to the whole channel.
- A new 'Unsatisfying or Off-putting Content' section penalises repeated violence or loss themes without a cohesive narrative, and realistic fake-disaster visuals.
- 'AI Personas Related to Sensitive Topics' covers politics.
- From memory, not verified: YouTube's separate 'altered or synthetic content' disclosure toggle, and TikTok's labelling rules for AI-generated content.
- EU AI Act Article 50 transparency duties (from memory; status not verified): they are expected to apply from August 2026. They include machine-readable marking of synthetic audio and video, and disclosure of AI-generated public-interest text unless a human holds editorial responsibility. If they apply, the product will likely need C2PA or watermark metadata on exports. A proposed 'Digital Omnibus' delay should be checked.
- The cost conclusion is likely reversed. Gemini TTS is billed at 25 audio tokens per second, about $0.0135 per minute ($0.027 from 2027). That makes LLM spend the largest variable cost per video, not 'a minority next to TTS and rendering.' Model routing, caching and regeneration limits are the main margin levers.
- Cheaper models were overlooked:
- gpt-oss-120b on Vertex at $0.09/$0.36 (about 10x cheaper than Haiku) for intake, triage and metadata;
- Gemini 3.1 Flash-Lite at $0.25/$1.50 for extraction and frame checks;
- Gemini 3 Flash Preview at $0.50 input;
- Flex or Batch (50% off) for frame checks and claim verification, which are not interactive;
- DeepSeek V4 Flash on US hosts such as Fireworks or Databricks at $0.14/$0.28 (secondary source), which avoids the China data-residency issue.
- Gemini 3.8 Flash's introductory price is paid back as "50% credits back on net spend", not invoiced at the lower rate. Only 3 months of it remain. Plan cash flow at list price.
- Caching details change the cost model:
- Haiku 4.5's minimum cacheable prompt is 4,096 tokens, so its 2K prefixes never cache.
- Changing effort or thinking settings invalidates caches.
- The default cache lifetime is 5 minutes, and writes cost 1.25x, so low launch traffic pays more writes.
- Caches are isolated per workspace.
The cost model assumes steady cache hits.
- Structured outputs cannot enforce numeric ranges, string lengths or array sizes, and allow at most 20 strict tools. Timings, intensities and word ranges in the storyboard always need validation in code.
- The per-video cost has no regeneration multiplier. Users re-rolling hooks, scripts or scenes, plus billed refusals and fallback calls, could raise real LLM cost per delivered video by 1.5–3x.
- Natural Earth provides official 'point-of-view' boundary files for each country. They are a ready-made way to implement the disputed-territory 'worldview' selector and to help with map-display laws such as India's and China's.
- The GPL vs AGPL difference is not explained. historical-basemaps is GPL-3.0 (no clause for network use), so purely server-side rendering may be acceptable, while sending GeoJSON to browser previews counts as distribution. This should go to legal review rather than an automatic ban.
- Model lifecycle risk:
- Haiku 4.5's tentative retirement is 'not sooner than 2026-10-15'.
- Sonnet 4.5, whose multilingual scores are cited, retires 2026-11-30.
- Gemini 3.1 Pro and the Gemini TTS models are Preview.
The multilingual table measures MMLU knowledge Q&A, not script-writing quality.

## RELIABILITY
The report is reliable on the facts it marked VERIFIED. I re-checked every Anthropic price, the Vertex/Gemini and Model-as-a-Service prices, the TTS prices, the Usage Policy and Commercial Terms wording and dates, the structured-output limits, the citations incompatibility, the effort defaults, the historical-basemaps license and 54 snapshot years, and the project licenses. All match the primary sources as of 2026-10-01, and its cost arithmetic reproduces (about $0.53 per short in routing E). The OpenAI and DeepSeek prices remain unverifiable because the primary pages were blocked; they match the secondary table. The weaknesses are mostly in interpretation and omission:
- Google Search grounding's terms forbid the caching and reuse the design depends on.
- Claude web search content comes back encrypted, which breaks the planned search-to-Gemini handoff.
- The human-review claim overstates compliance: the Usage Policy asks for a 'qualified professional', not just a user approval click.
- The Remotion license and the distillation ban are missing.
- The 'LLM is a minority of cost' conclusion is probably backwards, given Gemini TTS at about $0.0135 per minute.
Use the price tables as-is, but fix the research-source architecture and get legal or Anthropic sign-off on the policy points before building.