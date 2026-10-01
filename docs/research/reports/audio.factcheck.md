- [unverifiable] ElevenLabs API TTS is advertised at $0.10 per 1K characters for eleven_v3 / Multilingual v2 and $0.05 per 1K for Flash/Turbo, and Eleven Music at $0.15 per minute (read off elevenlabs.io/pricing/api on 2026-09-15).
  -> elevenlabs.io is blocked, so the primary source could not be checked. Two independent dated secondary sources agree: the openstory rate card (2026-09-15) and voice-prices (v3 checked 2026-08-20). Both give $0.10/1K for v3 and Multilingual v2, $0.05/1K for Flash/Turbo, and $0.15/min for music.
- voice-prices says the rate is 'identical across every plan column from Free through Business'. It also lists a separate 'v3 Conversational' row at $0.05/1K. LiteLLM's $0.18/1K looks stale.
- Subscription credit math still implies $0.12–0.22 per 1K credits on bundled plans (for example Pro at $99 for 500K credits), so confirm with a real invoice.
- Music is billed per started minute (openstory: a 61 s track bills as 2 minutes). Short library cues and stingers therefore cost more per second than the report assumes. (https://github.com/mahimailabs/voice-prices/blob/main/prices/providers/elevenlabs.yml)
- [corrected] The official ElevenLabs JS SDK exposes textToSpeech.convertWithTimestamps (character-level timing), forcedAlignment.create, music.compose with compositionPlan/respectSectionsDurations/forceInstrumental, music models music_v2 and music_v2_5 (music_v1 deprecated), and SFX model eleven_text_to_sound_v2 with loop and durationSeconds.
  -> These all exist: the methods, the character-level alignment arrays, the MusicModelId values {music_v1 (deprecated), music_v2, music_v2_5}, SfxModelId 'eleven_text_to_sound_v2', loop (v2 only) and durationSeconds of 0.5–30 s. Two parameters behave differently from what the report says, and both affect the 'custom score' feature:
- `respectSectionsDurations` 'only applies to music_v1; for music_v2 and music_v2_5 section durations are always enforced and this is ignored'.
- `forceInstrumental` 'can only be used with prompt', not with a compositionPlan. Timed cues must therefore keep out vocals through negative_styles.
- Plans allow up to 30 chunks of 3–120 s each, 10 min total.
- The SDK also offers music stem separation, video-to-music, inpainting and C2PA signing, which the report did not use. (https://github.com/elevenlabs/elevenlabs-js/blob/main/src/api/resources/music/client/requests/BodyComposeMusicV1MusicPost.ts)
- [unverifiable] Suno has no official self-serve public API; a curated API partner program was announced 2026-07-01, and third-party 'Suno APIs' are unofficial and violate Suno's ToS.
  -> suno.com is blocked. The claim matches two independent secondary compilations (verified 2026-07-10 and valid as of 2026-09-30). Those sources also add facts the report left out:
- Warner settled with and partnered with Suno in 2025-11; BMG and Believe/TuneCore partnered in 2026-08/09.
- SOCAN and Round Hill have sued.
- The 2026-08-10 terms tie commercial rights to approved download channels.
The 'exclude Suno' verdict stands. (https://github.com/calesthio/generative-media-skills/blob/main/skills/providers/music-generation/suno-music/SKILL.md)
- [corrected] @remotion/captions (MIT) provides createTikTokStyleCaptions/parseSrt/serializeSrt and @remotion/elevenlabs converts ElevenLabs TTS transcripts to captions; package v4.0.532 published 2026-10-01.
  -> The npm details are confirmed: @remotion/captions, @remotion/elevenlabs and @remotion/sfx are 4.0.532, MIT, published 2026-10-01. Two corrections:
- elevenLabsTranscriptToCaptions() converts ElevenLabs Speech-to-Text (Scribe) responses with word granularity. It does not convert TTS convertWithTimestamps character alignment, so you need your own character-to-word grouping or a paid Scribe pass.
- The core `remotion` and `@remotion/renderer` packages are 'SEE LICENSE IN LICENSE.md'. That is the Remotion License, which requires a paid Company License for for-profits with more than 3 employees. (https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/elevenlabs/elevenlabs-transcript-to-captions.mdx)
- [unverifiable] Gemini 3.8 Flash TTS via Gemini API Batch costs $4.50/1M audio tokens (half price).
  -> ai.google.dev is blocked. LiteLLM lists gemini/gemini-3.8-flash-tts output at $9, with batch and flex at $4.50, but it does not say whether the 2027 doubling also applies on the Gemini API. Batch is a Developer-API feature, not the Cloud TTS path the report recommends. Batch jobs can also take up to many hours, so it only suits deferred renders. (https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json)
- [unverifiable] ElevenLabs Music is the right primary generator for a shared, build-once library reused across all customers ('cleared for nearly all commercial uses').
  -> The music-terms pages are blocked. This secondary source (verified against official terms 2026-07-10) reports two limits:
- Self-serve Music rights cover online and offline commercial use except film, TV, radio and Studio Games. Enterprise Music covers all uses.
- Rights such as 'reseller, or music-library/repository rights' should not be assumed unless the contract grants them. Music inputs may not name artists, songs or labels.
A private library re-served to thousands of customers could fall under library or redistribution restrictions. Get a written ElevenLabs Enterprise Music agreement before building the library. (https://github.com/calesthio/generative-media-skills/blob/main/skills/providers/music-generation/elevenlabs-music/SKILL.md)
- [unverifiable] Inworld TTS-2 / 1.5 Max / 1.5 Mini On-Demand cost $25 / $35 / $15 per 1M characters; Cartesia Sonic-3 ~$0.05/1K; Deepgram Aura-2 $0.030/1K; Hume Octave $0.15/1K.
  -> The vendor sites are blocked. The figures match voice-prices (Inworld checked 2026-08-07; Cartesia, now labelled Sonic-3.6, checked 2026-08-21; Deepgram 2026-05-27). The Inworld $25 vs Replicate $10 conflict remains open. Inworld's cheaper prepaid tiers (Creator $25/mo up to Growth $1,500/mo) were not modelled. (https://github.com/mahimailabs/voice-prices/blob/main/prices/providers/inworld.yml)

CONFIRMED: 15 of 22

## OMISSIONS
- The music strategy is legally unverified for the 'shared library' use case. The report recommends ElevenLabs Music and Lyria as library generators 'trained on licensed data' with 'enterprise terms'. Neither part is established for this use:
- ElevenLabs self-serve Music terms reportedly exclude film, TV, radio and Studio Games, and do not grant music-library, repository or reseller rights.
- Lyria 3 and 3 Pro are Preview, have no stated licensed-data provenance, and are not on Google's Generative AI Indemnified Services list.
- Google's terms warn that a generative service 'may … produce the same or similar Generated Output for multiple customers'. That raises the chance of fingerprint collisions and Content ID disputes.
Get an ElevenLabs Enterprise Music agreement, or a written Google position, before building the library.
- ElevenLabs now lists `eleven_v4` and `eleven_v4_turbo` (90+ languages) in its official skills repo (github.com/elevenlabs/skills, text-to-speech/SKILL.md). The report treats v3 as the flagship, so v4's price and quality need checking before the premium tier is locked.
- Remotion licensing. Only some packages are MIT (captions, elevenlabs, sfx). The core `remotion` and `@remotion/renderer` packages use the Remotion License: free only for individuals and companies with up to 3 employees, and a paid Company License otherwise. The audio plan depends on Remotion `<Audio>` volume callbacks, so this is a fixed cost and compliance item.
- Gemini 3.8 Flash TTS (both Flash and Flash-Lite) supports voice design and voice replication, per the Vertex pricing page. That allows owned custom narrator voices at Gemini prices, instead of relying on ElevenLabs Voice Design for brand voices.
- ElevenLabs Music API features the report did not use:
- Stem separation (no need to run Demucs yourself).
- Video-to-music: score a rendered video directly, up to 600 s and 200 MB.
- Inpainting and section edits.
- C2PA signing.
Music is billed per started minute, so generate stingers and risers with the SFX API instead. The `forceInstrumental` flag is unavailable with composition plans.
- Lyria 3 Pro output is a single MP3 per prompt (44.1 kHz, 192 kbps, about 184 s max) with no stems or loop points. Stems, beat grids and lossless masters all add post-processing cost. Lyria 2 is the only GA Lyria and returns roughly 30 s of instrumental WAV.
- Google `custom_pronunciations` currently supports en-US only and not Instant Clone voices. A multilingual proper-noun lexicon needs another mechanism: ElevenLabs pronunciation dictionaries, SSML phoneme where supported, or respelling.
- Kokoro word timestamps come only from the PyTorch KPipeline for English. The kokoro-onnx path that was benchmarked does not provide them. Kokoro's English G2P also pulls in GPLv3 phonemizer-fork and espeak-ng, which belong in the license registry.
- Some licenses have revenue thresholds the report did not list:
- NeuTTS Nano and 2E (NeuTTS Open License) are free only below $5M annual revenue.
- The Stability Community License counts affiliate revenue and requires 'Powered by Stability AI' attribution.
- Google Cloud TTS also offers an async `synthesizeLongAudio` endpoint (output to GCS). It may cut chunking and voice-drift work for some voices, though voice support was not verified.
- Cheaper GPU option for self-hosted TTS and alignment workers: AWS g6f.xlarge (fractional L4) at $0.2375/h on-demand, versus the g4dn and g6 instances quoted.
- Under EU AI Act Art. 50(2), the SaaS is likely itself a 'provider' of a system generating synthetic audio and video. It must machine-mark outputs (for example C2PA or watermark metadata), not only add disclosure text. War and politics content also falls under the 'matters of public interest' labelling rules for deepfakes.
- The cost model leaves out ElevenLabs request limits. eleven_v3 reportedly caps at about 3,000 characters per request, versus 10K for Multilingual v2 and 40K for Flash. Plans also differ in concurrency (2–15 concurrent requests) and output formats: 192 kbps MP3 needs Creator+, and 44.1 kHz PCM/WAV needs Pro+. These shape plan choice and throughput, not just per-character price.

## RELIABILITY
I could verify most claims the report marked [V] directly against primary sources (Google pricing pages, the TTS proto and discovery doc, LICENSE files, SDK source, npm/PyPI, the AWS Price List API), and nearly all held up. That covers the Gemini TTS, Chirp and Lyria prices, the 5,000-byte limit, Polly and GPU prices, and every open-model license verdict (Fish, F5, MusicGen, YuE2, Higgs v3, IndexTTS2, Stability, ACE-Step, Kokoro, Chatterbox). The ElevenLabs $0.10/1K and $0.15/min figures could not be checked against the blocked vendor site, but two independent dated secondary sources agree and LiteLLM's $0.18 looks stale. Even so, confirm with an invoice before pricing plans. The errors are mostly technical details: `respectSectionsDurations` and `forceInstrumental` don't behave as described for music_v2/v2.5, `@remotion/elevenlabs` handles STT transcripts rather than TTS alignment, Kokoro timestamps are English-only and PyTorch-only, and `custom_pronunciations` is en-US only. The weak point that matters for the decision is the music strategy. It assumes ElevenLabs Music and Lyria outputs can be built into a shared library and re-served to all customers on self-serve or 'enterprise' terms. Lyria is Preview and not indemnified, and ElevenLabs self-serve music terms reportedly withhold library and repository rights, so that assumption needs vendor contracts before building. The per-video cost conclusions (Gemini about $0.03/min, ElevenLabs about $0.09–0.20/min, near-zero CPU mixing and alignment) are sound.