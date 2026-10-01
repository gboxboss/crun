- [corrected] Gemini 3.1 Flash-Lite Image (Nano Banana 2 Lite) costs $0.034 per 1K image ($30/M output), and Flex/Batch image output is $15/M. It is the cheapest Google option.
  -> The prices are confirmed: 1120 tokens = $0.034, batch $15/M ≈ $0.017, and output is 1K only. But it is NOT the cheapest Google option at standard pricing: Imagen 4 Fast is $0.02 per image. Flash-Lite is cheapest only on Batch/Flex. (https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [corrected] Google is the only vendor offering contractual IP indemnity for generated output ('No other vendor I could verify offers that').
  -> Other vendors offer output IP indemnity:
- OpenAI's Copyright Shield, under its Services Agreement for API customers
- Microsoft's Customer Copyright Commitment for Azure OpenAI
- AWS indemnity for Amazon Nova models, including Nova Canvas (image) and Nova Reel (video), on Bedrock
- Adobe Firefly enterprise indemnity
- Getty, Shutterstock and Bria generative offerings

The exact terms could not be re-fetched here because those domains are blocked from this session. Verify them before relying on 'Google only' as a differentiator. (https://openai.com/policies/services-agreement/)
- [corrected] LiteLLM lists a Vertex deprecation date of 2026-11-17 for veo-3.1-*-001, which suggests a successor is coming. The report applies this only to 'Veo 3.1' (standard) and recommends Veo 3.1 Fast for hero shots.
  -> The 2026-11-17 date applies to BOTH vertex_ai/veo-3.1-generate-001 AND veo-3.1-fast-generate-001. Veo 3.1 Fast, the recommended hero-shot model, is therefore about 7 weeks from its listed deprecation. veo-3.1-lite-generate-001 has no date listed. The Gemini API Veo 3.1 preview IDs are dated 2026-10-22. Plan a successor (e.g. Gemini Omni Flash) now. (https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
- [corrected] Seedream layer separation costs ≈$0.032 (1K–1.5K) to $0.064 per image.
  -> Those are Comfy badge prices that include the 1.43× markup: $0.032175 = 1.43 × $0.0225, and $0.06435 = 1.43 × $0.045. The likely direct price is about $0.0225–0.045, and about $0.018 for the Flash variant ($0.02574 badge). This is inconsistent with the report dividing out the markup for Seedream 5.0 Flash. (https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bytedance.py)
- [corrected] Qwen-Image-Layered is ideal for parallax, and asset processing (cutout, depth or layers, fill, upscale) costs about $0.0002–0.001 per asset, 'in practice free'. Self-hosted Qwen-Image-2512 costs about $0.001–0.003 per image.
  -> Qwen-Image-Layered is built on the 20B Qwen-Image base. Its README example uses 50 inference steps and recommends the 640px resolution bucket. Layers therefore come out at about 640px, far below the 2048 master, and take minutes on an L4 or need a larger GPU. Self-hosting a 20B Qwen-Image-2512 likewise costs well above $0.001–0.003 per image unless Lightning-distilled and quantized. The 'free' figure holds only for BiRefNet, DA3, LaMa and Real-ESRGAN. (https://github.com/QwenLM/Qwen-Image-Layered)
- [corrected] Icon licenses: Lucide ISC, Phosphor MIT, Tabler MIT, Material Symbols Apache-2.0 (15,717 icons), flag-icons MIT, Game-icons CC BY 3.0 (4,133 icons), Twemoji CC BY 4.0, OpenMoji CC BY-SA 4.0. Pictogrammers MDI uses a 'custom license; review before use'.
  -> All are correct except MDI. The Pictogrammers Free License distributes MDI icons under Apache 2.0, and Iconify lists them as Apache 2.0 (7,447 icons), so MDI is commercially usable. Also, Game-icons' CC BY 3.0 requires crediting each icon's individual author (Lorc, Delapouite, etc.), not just the site. (https://github.com/iconify/icon-sets/blob/master/collections.md)
- [corrected] Standard tier visual-asset cost: ≈$1.0–1.5 per 60 s short (NB2 2K or NB Pro for about 4 new images, 1–2 Veo 3.1 Lite/Fast 1080p 6 s no-audio clips at $0.30–0.60 each, +30% retries).
  -> On the report's own assumptions, the upper bound is understated. Two Veo 3.1 Fast 1080p 6 s clips cost $1.20, plus about 4.2 new images at $0.101–0.134 ≈ $0.50, times 1.3 for retries ≈ $2.2. A realistic range is about $0.9–2.2. The long-form ($6–10) and library ($1–3k) arithmetic checks out. (https://cloud.google.com/vertex-ai/generative-ai/pricing)
- [unverifiable] Self-hosted Z-Image-Turbo / FLUX.2 klein 4B on an L4 cost about $0.0006–0.002 per image (2–6 s each).
  -> This is plausible for 4–6B distilled models at about 1MP, since Z-Image-Turbo is sub-second on an H800 and an L4 is several times slower. It excludes the text encoder, VAE, cold starts, and idle billing before scale-down. Benchmark before relying on it. (https://cloud.google.com/run/pricing)
- [unverifiable] Pexels/Pixabay terms: free commercial use; no competing stock service; no Content ID registration (Pexels); no permanent hotlinking (Pixabay API).
  -> pexels.com and pixabay.com are blocked by the egress proxy, and no mirror was found. Have legal confirm before building automated stock ingestion. (https://www.pexels.com/license/)
- [unverifiable] EU AI Act Art. 50 transparency duties apply from 2 Aug 2026, unless the Digital Omnibus changed the timing.
  -> The 2 Aug 2026 general application date is correct per the Act. The Commission's Digital Omnibus proposal (Nov 2025) included a grace period for the Art. 50(2) marking duty, reportedly to Feb 2027 for systems already on the market. Its adoption status could not be checked. Either way, the SaaS is itself a 'provider' generating synthetic video, so machine-readable marking is its own obligation, not optional. (https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

CONFIRMED: 25 of 35

## OMISSIONS
- GOOGLE 18+ RESTRICTION [verified]. Service Specific Terms §20(d): 'Customer will not, and will not allow End Users to, use a Generative AI Service as part of a website, Customer Application, or other online service that is directed towards or is likely to be accessed by individuals under the age of 18.' A YouTube/TikTok creator tool is very likely to attract under-18 users. Building on Vertex therefore requires real age-gating (18+) in the ToS and signup flow, or a non-Google path for minors. This shapes the target market.
- GOOGLE OUTPUT-TRAINING BAN [verified]. Service Specific Terms §17(b): you may not use Generated Output to '(i) substitute, replace, or circumvent the use of a Google Model ... or (ii) create or improve models similar to a Google Model'. The report recommends two things that collide with this:
- training style LoRAs that you own
- migrating bulk generation to self-hosted models

If those LoRAs are trained on the Gemini/Imagen-generated style libraries, that likely breaches Google's terms. FLUX's licence and OpenAI's terms have similar output-training bans. Train LoRAs only on PD, commissioned or self-generated open-model data.
- INDEMNITY SCOPE GAPS [verified]. The indemnity list covers only the Agent Platform (Vertex) API, not the Gemini Developer API / AI Studio keys. It covers only 'unmodified' output, while the pipeline modifies everything. It protects the SaaS company, not end users, so decide what IP warranty, if any, to give customers. It excludes trademark claims from use in commerce (flags, insignia, logos). It may not apply where usage is paid with free startup or promotional credits ('not provided free of charge'). Have counsel confirm before marketing 'indemnified' output.
- Other indemnifying vendors exist (OpenAI Copyright Shield, Azure OpenAI Customer Copyright Commitment, AWS Amazon Nova Canvas/Reel on Bedrock, Adobe Firefly, Getty/Shutterstock/Bria). Amazon Nova Canvas/Reel in particular were not evaluated as a second indemnified image and video source for redundancy.
- IMMINENT CHURN in the recommended stack. Per LiteLLM:
- Veo 3.1 Fast and Veo 3.1 (the -001 models) deprecate on Vertex on 2026-11-17, about 7 weeks away.
- The Gemini API Veo 3.1 previews deprecate on 2026-10-22.
- The Gemini 3.x image GA IDs deprecate on 2027-05-28.
- Grok Imagine image-quality deprecates on 2026-11-02.
- The Gemini Omni Flash preview on the Gemini API was dated 2026-09-30.

The launch plan needs a successor model, likely Gemini Omni Flash, plus regression tests before launch.
- Cheap hosted open models were skipped as a bridge between APIs and self-hosting. FLUX.1 [schnell] is $0.003 per image on fal (LiteLLM), and Z-Image/klein-class models run on aggregators such as Runware and Replicate. These give near-self-hosted cost with no GPU operations, and they avoid Google's 18+ and output-training restrictions for budget tiers.
- Archival VIDEO sources are barely covered, yet real-footage B-roll is core to the genre. Free options include:
- NARA and US military footage (public domain)
- Internet Archive / Prelinger collections (many PD films)
- NASA video
- Wikimedia Commons video

Also missing is the Openverse API, which searches CC-licensed media with license_type=commercial/modification filters and would simplify license-safe retrieval. British Pathé, AP and Reuters archives are paid options for a premium tier.
- Jurisdiction of public-domain status. 'PD-Art' and 'PD in US' on Commons do not mean public domain worldwide (e.g. European life+70 works, Soviet and Axis WWII photos, works PD only in the US). A global SaaS serving EU users needs a country-aware rule. Separately, many IWM photos are Crown-copyright-expired and therefore PD on Commons, even though IWM's own download licence is non-commercial.
- Self-hosting costs are mis-sized for the large models. Qwen-Image, Qwen-Image-2512 and Qwen-Image-Layered are 20B parameters. Layered defaults to 50 steps at a 640px bucket, so it is neither 'free' nor high resolution. Wan2.2 TI2V-5B needs at least 24 GB. Cloud Run GPU billing is instance-based, so idle time until scale-down is billed. Serverless GPU clouds (RunPod, Modal, Vast, etc.; prices not verified here) and GKE spot L4s may be materially cheaper than about $1.05/hr Cloud Run L4s.
- Square-master cropping trade-off. Cropping a 2048² image to 9:16 or 16:9 discards about 44% of the frame. Wide establishing shots and battle scenes composed for a square will often crop badly. Budget for aspect-specific generation or outpainting (FLUX Expand $0.05, Imagen/Gemini edit) on hero assets.
- License pass-through duties. LTX §3.1 requires your own ToS to carry Attachment A restrictions, and LTX Attachment A also bans 'military, warfare' applications. Google's Generative AI Prohibited Use Policy is incorporated into the AUP. The SaaS's end-user terms must flow down these acceptable-use restrictions (Google, Veo, BFL) or it is in breach.
- Style-imitation and trade-dress risk. Presets that copy a named channel's look (e.g. 'Kurzgesagt style', a specific map channel's palette or characters) or a living illustrator's style create passing-off and trademark exposure, and vendor filters may block them. Name presets generically.
- Content ID collision is two-sided. Stock contributors, and AI-music or footage resellers, sometimes register assets in Content ID, so users' videos may get claimed even when the use is lawful. Plan a claims-dispute workflow and provenance records (asset ID, license, timestamp) per render.
- Pexels, Pixabay and the Unsplash guideline pages, OpenAI and BFL pricing/terms, and Hugging Face model cards were not verifiable. The stock-API ToS in particular needs legal review before any automated ingestion is shipped.

## RELIABILITY
Mostly reliable on hard numbers, weaker on what it left out. Every Google price I re-checked against the live Vertex and Cloud Run pages was exact. The open-weight license claims were all correct against the GitHub LICENSE files and READMEs: FLUX.2 klein 4B vs 9B/dev, Depth Anything V2 and DA3, rembg's RMBG-2.0 default, Hunyuan's territory exclusion, the LTX revenue and competitor clauses, and Wan 2.2. Its secondary prices also match LiteLLM and the ComfyUI badges, apart from one place where Comfy's markup was left in (Seedream layer separation). The decision-critical problems are elsewhere:

- **Google 18+ ban:** Google's terms forbid using its generative AI in any service likely to be used by under-18s, a major issue for a creator tool.
- **Google output-training ban:** Google forbids using its outputs to train or improve similar models, which conflicts with the plan to train LoRAs and move bulk generation to self-hosted models.
- **Indemnity overstated:** it is limited to the Vertex API and to unmodified output, and other vendors also offer indemnity.
- **Veo 3.1 Fast retiring soon:** the recommended hero-shot model has a listed deprecation about 7 weeks away.
- **Self-hosting underestimated:** compute for the 20B Qwen-Image models, especially Qwen-Image-Layered, is understated.
- **Short-video costs understated:** the upper bound of the Standard-tier short cost is too low.

The stock/archival ToS claims (Pexels, Pixabay) are still unverified. Use the price tables and the open-weight license allowlist as-is, but get legal review on the Google terms and the stock ToS, and re-plan the video-model choice, before committing.