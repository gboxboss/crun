# Audio stack research: narration, music, SFX, alignment, mixing, captions

Research date: 2026-10-01. Author: research subagent (audio area).

## 0. How to read this report (source confidence)

The sandbox's egress proxy blocked most vendor websites this session: elevenlabs.io, openai.com, azure.microsoft.com, aws.amazon.com, cartesia.ai, deepgram.com, fish.audio, inworld.ai, hume.ai, pixabay.com, stability.ai, suno.com, epidemicsound.com, huggingface.co, ffmpeg.org, and others. The web-search budget was also used up. I therefore graded every claim by how I got it:

- **[V] VERIFIED**: I fetched it this session from a primary source. That covers cloud.google.com pricing pages, official GitHub repos and LICENSE files, the npm registry, PyPI, the official ElevenLabs and OpenAI SDK source, and FFmpeg docs.
- **[S] SECONDARY**: dated third-party compilations on GitHub that state their primary source and check date. Examples are the LiteLLM price table, the mahimailabs/voice-prices catalog, and a hand-maintained ElevenLabs rate card read off elevenlabs.io/pricing/api on 2026-09-15. These are probably right but need a fact-check.
- **[M] MEMORY / UNVERIFIED**: from my training data (cutoff mid-2026). Treat these as leads only.
- **[E] ESTIMATE / OPINION**: my own calculations or judgment.
- **[T] TESTED**: I measured it in the founder's container (4 vCPU, no GPU).

Planning assumption [E]: narration runs at about **900 characters per minute**. Documentary pace is roughly 140–150 wpm. My Kokoro test measured 828–877 chars/min [T]. Fast Shorts delivery can reach about 1,050 chars/min. To convert, $/1M chars × 0.0009 = $ per narrated minute.

---

## 1. Executive summary

1. **TTS is cheap except at the very top tier.** Google's new Gemini TTS models cost about **$0.009–0.027 per narrated minute** [V]. ElevenLabs costs **$0.09–0.16/min** [S]. Self-hosted Kokoro (Apache-2.0) costs about **$0.002/min** on CPU [T/E]. A 10-minute video costs roughly $0.15–0.35 in narration on Gemini and $0.90–2.00 on ElevenLabs.
2. **Music is the biggest licensing risk, not the biggest cost.** The winning pattern is a **build-once owned library**:
   - Generate it with tools trained on licensed data (ElevenLabs Music, Google Lyria), then curate it.
   - Add stems, loop points and beat grids.
   - It costs about $150–700 one-time for around 600 tracks, and **$0 per video** after that.
   - Avoid Suno and Udio (no official self-serve API [S]), Pixabay, YouTube Audio Library and Free Music Archive as bundled sources, and every non-commercial model.
3. **SFX follow the same pattern.** Generate about 2,000 effects once with ElevenLabs SFX v2 (which supports `loop` and `durationSeconds` [V]) and add curated CC0 packs. Ambience loops such as rain or fire should map 1:1 to the visual effect presets.
4. **Timing.** Use provider timestamps when they exist:
   - ElevenLabs `convertWithTimestamps` gives character-level timing [V].
   - Kokoro gives native word timestamps for English [V].
   - Otherwise, **force-align against the known script**. Use stable-ts `model.align(audio, text)` (MIT) or a wav2vec2 aligner. Do not transcribe and then align, because ASR mangles historical proper nouns.
   - Avoid the CC-BY-NC MMS weights and the AGPL whisper-timestamped.
5. **Mixing is solved and cheap.** In my test, VO plus a sidechain-ducked music bed plus SFX plus loudnorm to −14 LUFS rendered 60 s of audio in **about 4 s of CPU** and measured −14.4 LUFS integrated [T].
6. **Captions.** `@remotion/captions` (MIT) already provides `createTikTokStyleCaptions`, `parseSrt` and `serializeSrt`. `@remotion/elevenlabs` converts ElevenLabs transcripts to captions [V]. Burn captions in for vertical video and always export SRT/VTT.

---

## 2. TTS (narration)

### 2.1 Hosted API price table

Prices are per 1M characters unless noted. "/min" assumes 900 chars per minute. "TS" means native timestamps.

| Provider / model | Price | ≈ $/narrated min | TS | Conf. / source |
|---|---|---|---|---|
| **Google Gemini 3.8 Flash TTS (Preview)**, until 2026-12-31 | $0.50/1M text tok in; **$9.00/1M audio tok** out; audio = 25 tok/s | **$0.0135** | No (align) | [V] https://cloud.google.com/text-to-speech/pricing |
| Gemini 3.8 Flash TTS, **from 2027-01-01** | $1.00 in / **$18.00** out | **$0.027** | No | [V] same |
| Gemini 3.8 Flash-Lite TTS (Preview), 2026 / 2027 | $6.00 → $12.00 /1M audio tok | $0.009 → $0.018 | No | [V] same |
| Gemini 2.5 Flash TTS | $10/1M audio tok | $0.015 | No | [V] same |
| Gemini 2.5 Pro TTS / 3.1 Flash TTS (Preview) | $20/1M audio tok | $0.030 | No | [V] same |
| Gemini 3.8 Flash TTS via Gemini API **Batch** | $4.50/1M audio tok | $0.0068 | No | [S] LiteLLM table, https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json |
| Google Chirp 3: HD | $30/1M chars (first 1M chars/month free) | $0.027 | Only SSML `<mark>` (not usable with Chirp markup) | [V] pricing page + proto https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto |
| Google Instant custom voice | $60/1M | $0.054 | — | [V] |
| Google Studio / Neural2 / WaveNet | $160 / $16 / $4 | $0.144 / $0.0144 / $0.0036 | `<mark>` | [V] |
| **ElevenLabs eleven_v3 / Multilingual v2** | **$0.10 per 1K chars** (1 credit/char) | **$0.09** (up to $0.16 at $0.18/1K) | **Yes, char-level** | [S] https://github.com/mahimailabs/voice-prices (checked 2026-08-20) and openstory rate card (2026-09-15); LiteLLM shows $0.18/1K |
| ElevenLabs Flash / Turbo v2.5 | $0.05 per 1K (0.5 credit/char) | $0.045 | Yes | [S] same |
| OpenAI gpt-4o-mini-tts (also snapshot 2025-12-15) | $0.60/1M text tok + $12/1M audio tok ≈ $0.015/min | $0.015 | **No** | [S] LiteLLM; models and params [V] https://github.com/openai/openai-node/blob/master/src/resources/audio/speech.ts |
| OpenAI tts-1 / tts-1-hd | $15 / $30 | $0.0135 / $0.027 | No | [S] |
| Azure Neural (incl. Neural HD Flash) / HD V2 | $15 / $30 | $0.0135 / $0.027 | Yes (WordBoundary) [M] | [S] voice-prices azure.yml; pricetoken |
| Amazon Polly Neural / Generative / Long-Form | $16 / $30 / $100 | $0.0144 / $0.027 / $0.09 | Speech marks (check generative support) [M] | [S] LiteLLM + pricetoken |
| Cartesia Sonic-3 | Pro $5 per 100K credits = $0.05/1K; Startup $49 per 1.25M | $0.035–0.045 | Yes [M] | [S] voice-prices cartesia.yml (2026-08-21) |
| Deepgram Aura-2 / Aura-1 | $0.030 / $0.015 per 1K (PAYG) | $0.027 / $0.0135 | ? | [S] voice-prices (2026-05-27) |
| Inworld TTS-2 / 1.5 Max / 1.5 Mini (On-Demand) | $25 / $35 / $15 | $0.0225 / $0.0315 / $0.0135 | Yes [M] | [S] voice-prices inworld.yml (2026-08-07); Replicate resale shows $10/$5, so the figures conflict |
| Hume Octave | $0.15/1K overage (Creator plan) | $0.135 | ? | [S] voice-prices hume.yml |
| Rime Mist / Coda | $0.03 / $0.05 per 1K | $0.027 / $0.045 | ? | [S] |
| MiniMax speech-2.6-hd / turbo | $100 / $60 | $0.09 / $0.054 | Sentence-level subtitles [M] | [S] LiteLLM |
| Mistral Voxtral TTS (2603) | $16 | $0.0144 | ? | [S] LiteLLM |
| Groq Orpheus (English) | $22 | $0.0198 | ? | [S] LiteLLM |
| Fish Audio API, Murf (Falcon), Resemble | not verified (Fish ≈ $15/1M UTF-8 bytes [M]) | — | — | [M] |
| Hosted open models on fal (Kokoro / Chatterbox / Dia) | $20 / $25 / $40 | $0.018–0.036 | — | [S] https://github.com/affromero/pricetoken |

Notes:
- **Gemini promo [V]**: Vertex's pricing page says the 2026 Gemini 3.8 TTS rates are "promotional pricing provided through 50% credits back on net spend". Budget at the **2027 list price** ($0.027/min), not the promo. Source: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing.
- **Google input limit [V]**: Cloud TTS input is limited to **5,000 bytes per request** (proto). Long scripts must be chunked, and Gemini TTS can drift in voice between chunks. Fix this with a fixed `prompt` (style instruction), the same voice and seed, and sentence-level QA.
- **Google pronunciation [V]**: `custom_pronunciations` accepts IPA or X-SAMPA per phrase. This matters for names like "Berezina" or "Tenochtitlan".
- **ElevenLabs API surface [V]** (from the SDK reference https://github.com/elevenlabs/elevenlabs-js/blob/main/reference.md):
  - `textToSpeech.convertWithTimestamps` and `streamWithTimestamps`
  - `forcedAlignment.create`
  - pronunciation dictionaries
  - `textToDialogue`
  - `music.compose` with `compositionPlan`, `musicLengthMs`, `forceInstrumental` and `respectSectionsDurations`
  - `textToSoundEffects.convert` with `loop`, `durationSeconds` and `promptInfluence`
- **ElevenLabs plans [S]**: Free 10K credits; Starter $5 / 30K; Creator $22 / 100K; Pro $99 / 500K; Scale $330 / 2M. Source: https://github.com/mrgoonie/human-mcp/blob/main/plans/research/260228-elevenlabs-text-to-speech-api.md (Feb 2026). Business is about $1,320 / 11M [M]. Sources disagree on whether overage falls with tier ($0.30 → $0.18 → $0.12 per 1K) or there is one published API rate ($0.10/1K). Fact-check this; it is a 2x cost swing on the premium tier.

### 2.2 Self-hostable open models: license is the gate

| Model | Weights license (commercial SaaS?) | Notes | Source |
|---|---|---|---|
| **Kokoro-82M** | **Apache-2.0: yes** | 9 languages (en-US/GB, es, fr, hi, it, ja, pt-BR, zh). Native word `start_ts`/`end_ts`. 24 kHz mono. | [V] https://github.com/hexgrad/kokoro, https://pypi.org/project/kokoro/ (v0.9.4) |
| **Chatterbox** (Turbo 350M EN, Nano 110M EN, Multilingual V3 500M 23+ langs) | **MIT: yes** | Built-in Perth watermark. Nano runs 3x realtime on 8 CPU cores. | [V] https://github.com/resemble-ai/chatterbox |
| **VoxCPM2** | **Apache-2.0: yes** ("Commercial-Ready") | RTF ~0.3 on RTX 4090 (~0.13 with Nano-vLLM), ~8 GB VRAM | [V] https://github.com/OpenBMB/VoxCPM |
| **Qwen3-TTS** (0.6B/1.7B, Jan 2026) | **Apache-2.0: yes** | 10 languages, voice design, 3-s cloning | [V] https://github.com/QwenLM/Qwen3-TTS |
| Dia / Dia2 (Nari) | Apache-2.0: yes | Dialogue-oriented; ~2x realtime, ~4.4 GB VRAM | [V] https://github.com/nari-labs/dia |
| Zonos (Zyphra) | Apache-2.0: yes | ~2x realtime on 4090, 6 GB+ VRAM | [V] https://github.com/Zyphra/Zonos |
| NeuTTS Air | Apache-2.0 (Nano/2E use the NeuTTS Open License) | Perth watermark | [V] https://github.com/neuphonic/neutts-air |
| IndexTTS2 (bilibili) | Custom: royalty-free; separate license needed above 100M MAU or RMB 1B revenue; may not be used to improve other models | README still says "for commercial usage… contact", so get written confirmation | [V] https://github.com/index-tts/index-tts/blob/main/LICENSE |
| Orpheus 3B | Repo Apache-2.0; Llama-3.2 backbone, so the Llama license likely applies to the weights | Check the HF card | [V] repo / [M] weights |
| Sesame CSM-1B | Repo Apache-2.0; needs Llama-3.2-1B | Conversational, not a narrator | [V] |
| Higgs Audio v2 / v3 | v3: **Research & Non-Commercial** ("hosted/revenue use requires a separate license"). v2: community license with a user threshold [M] | Avoid without a deal | [V] https://github.com/boson-ai/higgs-audio |
| Fish-Speech / OpenAudio / **Fish Audio S2 Pro** | **Fish Audio Research License: NO.** Any hosted or API use is "Commercial" and needs a written license | Updated 2026-03-07 | [V] https://github.com/fishaudio/fish-speech/blob/main/LICENSE |
| F5-TTS | Code MIT; **weights CC-BY-NC: NO** | Emilia dataset | [V] https://github.com/SWivid/F5-TTS |
| XTTS-v2 (Coqui) | **CPML non-commercial: NO** (Coqui is defunct, so no license can be bought) | — | [M]; code MPL-2.0 [V] |
| StyleTTS2 | Code MIT; pretrained models require **telling listeners the speech is synthetic**, and inference uses a GPL phonemizer | Usable with care | [V] https://github.com/yl4579/StyleTTS2 |
| Spark-TTS | Code Apache-2.0; weights CC BY-NC-SA [M]: NO | — | [V]/[M] |
| VibeVoice (Microsoft) | MIT, but **TTS code removed (2025-09-05)** and "not recommended for commercial use" | Avoid | [V] https://github.com/microsoft/VibeVoice |

**Measured Kokoro benchmark [T]** (kokoro-onnx 0.6.1, 4 vCPU, no GPU):
- fp32 model: **RTF 0.63** (1.6x realtime), i.e. 37 s of audio in 23.8 s.
- int8 model: RTF 1.69 (slower on this CPU).
- Output is 24 kHz mono at about −21.8 LUFS.
- Compute cost is about 2.5 vCPU-minutes per narrated minute, roughly **$0.002/min** at ~$0.045/vCPU-hour [E].
- On a GPU it is far faster. AWS on-demand prices (us-east-1, from the EC2 price list file dated 2026-09-25 [S]): g4dn.xlarge (T4) **$0.526/h**, g6.xlarge (L4) **$0.8048/h**. At those rates the cost per minute is negligible; utilization is what matters [E].

**Quality opinion [E]:**
- ElevenLabs (v3 for expressive hooks, Multilingual v2 for long-form stability) is still the de-facto "faceless documentary narrator" sound.
- Gemini TTS with style prompts ("low, measured documentary narrator, building tension") is the strongest low-cost contender.
- Kokoro is clean but noticeably flatter over 10 minutes. Use it for drafts, previews, and free plans.
- Run a **blind listening test** (20+ raters, 5 scripts, 6 candidate voices) before locking a default, because rankings move every quarter.

**Commercial / resale terms:**
- ElevenLabs: paid plans include commercial rights; the free tier requires attribution [M].
- Google Cloud: the customer owns the output under the Cloud terms [M]. Preview models fall under Pre-GA terms with no SLA, and may be excluded from generative-AI indemnity [M].
- OpenAI usage policies require disclosing AI voices to listeners [M].
- Have counsel confirm that each vendor's API terms allow "embedding TTS in a SaaS whose end users monetize the output". This is standard, but get it in writing for ElevenLabs Business/Enterprise.
- Use only **premade or Voice-Designed voices that you own the rights to**. Never offer voices that sound like real public figures; war and politics content makes this especially dangerous.

---

## 3. Word and phoneme timestamps (visual sync and karaoke captions)

| Approach | Granularity | Cost | Notes |
|---|---|---|---|
| ElevenLabs `convertWithTimestamps` | Character-level, so words can be derived | Included | [V] SDK. `@remotion/elevenlabs` converts ElevenLabs transcripts to Remotion captions [V] https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/elevenlabs/elevenlabs-transcript-to-captions.mdx |
| Kokoro (PyTorch `KPipeline`) | Word `start_ts`/`end_ts` (English) | Free | [V] https://github.com/hexgrad/kokoro/blob/main/kokoro/pipeline.py |
| Google Cloud TTS | Only SSML `<mark>` timepoints; nothing automatic for Gemini or Chirp 3 HD markup | — | [V] proto |
| OpenAI speech | None | — | [V] SDK params |
| Azure WordBoundary, Polly speech marks, Cartesia/Inworld timestamps | Word-level | Included | [M] |
| **stable-ts `model.align(audio, text)`** | Word-level, aligned to **your known script** | CPU seconds per minute, <$0.001 | MIT [V] https://github.com/jianfch/stable-ts |
| WhisperX (wav2vec2 CTC alignment stage) | Word / char | Same | BSD-2 [V] https://github.com/m-bain/whisperX. Use its *alignment* step with your script text, not its transcript. |
| Montreal Forced Aligner | Phone- and word-level, the most precise | CPU, heavier setup | MIT code [V]; check pretrained-model licenses |
| ctc-forced-aligner | Word / char, 1,100+ languages | — | Code BSD-2 [V], but the **default model is MMS-300m; MMS weights are CC-BY-NC [M]**. Swap in Apache/MIT wav2vec2 models. |
| whisper-timestamped | — | — | **AGPL-3.0** [V]: avoid in a SaaS backend |
| ElevenLabs Forced Alignment API | Word / char | Price not verified | [V] exists in SDK |

Accuracy [E]:
- Clean TTS audio aligned against its exact source text is the easiest possible case. Expect typical word-boundary errors of a few tens of milliseconds with MFA or wav2vec2 aligners, and somewhat looser results with Whisper-based alignment.
- One frame at 30 fps is 33 ms. Viewers tolerate roughly ±80–100 ms for word-highlight captions and keyword-triggered map events.
- The bigger failure mode is **TTS saying something other than the text** (skipped words, v3 hallucinations, mispronunciations).

Recommended design [E]:
1. **Synthesize per sentence or scene.** Scene durations then come straight from audio lengths, with no alignment needed at scene level.
2. Use word-level timing only for captions and "on-word" triggers, such as pulsing the map label when the narrator says "Moscow".
3. Run an **ASR back-check** with faster-whisper (MIT [V]). Compute WER against the script, give proper nouns extra weight, and auto-regenerate the failing sentence.

---

## 4. Music (YouTube Content ID risk is the core issue)

### 4.1 Options assessed

| Source | Status / terms | Verdict | Conf. |
|---|---|---|---|
| **ElevenLabs Music** (`music_v2`, `music_v2_5`; v1 deprecated) | API supports composition plans with section durations, forced instrumental and finetunes [V]. About **$0.15/min** via API [S, rate card read 2026-09-15]. Marketed as trained on licensed data and "cleared for nearly all commercial uses". ElevenMusic terms (2026-09-11): you own output on every plan; free tier needs credit [S]. UMG multi-year deal 2026-09 [S]. | **Primary library generator, plus a per-video custom-score upsell** | [V]/[S] |
| **Google Lyria (Vertex)** | **Lyria 3 Pro $0.08 per full song; Lyria 3 $0.04 per 30-s clip; Lyria 2 $0.06 per generation** [V]. SynthID watermark. Commercial terms depend on the surface used [S]. | **Second library generator** (cheap, enterprise terms) | [V] https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing |
| **ACE-Step 1.5 / 1.5 XL** | **MIT** [V]. 10 s–10 min, under 2 s per song on A100 and under 10 s on RTX 3090 [V]. Training-data provenance is undisclosed, and the authors warn of "unintentional copyright infringement". | Optional, for volume or variety only, behind similarity QA. The legal posture is weaker. | [V] https://github.com/ace-step/ACE-Step-1.5 |
| Stable Audio Open 1.0 / Small | Stability AI Community License: free under **$1M annual revenue**; registration needed; Enterprise license above that [V license text]. Trained on CC data [M]. Better for SFX and textures than full scores. | OK early on; needs relicensing at $1M | [V] license text via https://github.com/Stability-AI/stable-fast-3d/blob/main/LICENSE.md |
| Stable Audio 2.5 (API / enterprise) | Licensed training data, enterprise indemnity [S] | Possible enterprise option | [S] |
| MusicGen / AudioCraft | **Weights CC-BY-NC 4.0** | **No** | [V] https://github.com/facebookresearch/audiocraft |
| YuE2 | Weights CC BY-NC 4.0 plus a creator permission; **companies need a commercial license** | **No** without a deal | [V] https://github.com/multimodal-art-projection/YuE |
| **Suno** | **No official public API.** A curated partner program was announced 2026-07-01. Unofficial "Suno APIs" violate the ToS. Terms (2026-08-10) tie commercial rights to downloads through approved channels. Litigation: UMG and Sony second suit 2026-09-18; GEMA won in Munich 2026-07-31 (memorization finding). | **No** | [S] https://github.com/sanic732/SunoForge/blob/main/files/DATA_LEGAL_2026-09.md, https://github.com/calesthio/generative-media-skills/blob/main/skills/providers/music-generation/suno-music/SKILL.md |
| **Udio** | Settled with UMG (2025-10) and Warner (2025-11); walled garden, downloads closed | **No** | [S] |
| Epidemic Sound | A **Partner Content API** exists with partner tokens, user tokens and "Epidemic Sound Connect" OAuth, so users sign in with their own ES subscription, which covers their channel clearance [V spec mirror]. Commercial terms are negotiated [M]. | **Optional "bring your own Epidemic Sound" integration** for premium users | [V] https://github.com/konfig-dev/konfig (epidemicsound.com spec cache) |
| Artlist / Soundstripe / Musicbed | Enterprise / API deals by negotiation [M] | Later, if customers demand it | [M] |
| Mubert, Beatoven, Soundraw APIs; AIVA | APIs exist with B2B pricing (unverified); AIVA has no public API [M] | Not needed if you build your own library | [M] |
| Pixabay Music | Free, but some tracks get Content ID claims and the license limits standalone redistribution and competing services [M] | **Do not bundle** | [M] |
| YouTube Audio Library | Licensed for use on YouTube by the creator; not redistributable by a third-party service [M] | **No** | [M] |
| Kevin MacLeod (CC BY 4.0) | Usable with an auto-inserted attribution line; overused, and third-party claims happen [M] | Fallback only | [M] |
| Free Music Archive | Mixed licenses, many NC/ND | **No** (unless you filter to CC0/CC-BY and verify) | [M] |

**Content ID facts [S]:**
- Fully AI-generated audio is reportedly **not eligible** for Content ID registration. You can use it in your own videos, but cannot claim third-party uses of it.
- Distributors (DistroKid, TuneCore/Believe) now handle AI tracks under their own rules. A UMG suit against DistroKid (2026-09) concerns mass AI uploads.

The practical risk for a **shared library** is that a bad actor registers one of your tracks through a distributor and then claims *every customer's* video. Mitigations [E]:
- Your ToS forbids registering or redistributing library tracks.
- Keep the library private: stream it into renders and never offer downloads of raw tracks.
- Keep a hash and fingerprint registry plus generation logs as proof of origin.
- Issue a **license certificate per render** (track ID, render ID, date) that users paste into disputes.
- Before each batch release, test new tracks by uploading them in private YouTube videos to see whether any claims fire.

### 4.2 Recommended music strategy [E]

1. **Owned library v1: about 40 moods × 15 tracks = 600 tracks.** Moods include epic orchestral war, tense strings, ancient or Middle-Eastern modal, East-Asian traditional, Celtic or medieval, Cold War synth, documentary ambient piano, upbeat "explainer" (Polymatter/Wendover-style), mystery, triumphant, tragic, and trailer hits and risers. Generate them with ElevenLabs Music and Lyria 3 Pro, producing about 3 candidates per keeper.
   - Cost: about 1,800 Lyria songs × $0.08 = $144, or about 4,500 minutes × $0.15 = $675 on ElevenLabs. The total is **$150–700 one-time**.
   - Human curation time is the real cost. Pre-filter with automated audio-quality and loudness checks.
2. **Per-track assets:**
   - Full mix and **stems** (natively, or via **Demucs, MIT** [V] https://github.com/adefossez/demucs).
   - Low, mid and high intensity variants.
   - A loopable 30–60 s segment with sample-accurate loop points.
   - 3 stingers or risers.
   - Metadata: BPM, key, beat and downbeat grid, section markers, energy curve, LUFS, mood, era and region tags, and the generation provenance record.
   - Do beat tracking with **librosa (ISC)**. Avoid essentia (AGPL) and madmom's models (CC BY-NC-SA [M]).
3. **Premium "custom score" feature.** ElevenLabs `compositionPlan` with `respectSectionsDurations` [V] can produce a cue whose sections land exactly on your scene durations. It costs about $0.15/min [S], so about $1.50 for a 10-minute video.
4. **Optional later:** an Epidemic Sound Connect integration for users who already subscribe.

---

## 5. Sound effects

| Source | License / price | Verdict |
|---|---|---|
| **ElevenLabs SFX v2** (`eleven_text_to_sound_v2`; 0.5–30 s; `loop`; `durationSeconds`) [V] | 40 credits/s with a set duration, or 200 credits per auto-length generation [S, Feb 2026]. That is about $0.004–0.012 per second depending on credit price [E]. | **Primary generator.** About 2,000 SFX × 4 s comes to roughly **$30–100 one-time** [E]. |
| CC0 packs: Kenney.nl, the Freesound CC0 subset, `@remotion/sfx` (MIT package; sounds required to be CC0) | Free; no attribution | Yes. Spot-check provenance, since Freesound has occasional rips. [V] https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/contributing/sfx.mdx |
| Stable Audio Open (local) | Community License (<$1M revenue) | Good for textures and ambiences early on |
| Sonniss GDC bundles | Royalty-free for productions [M]; unclear whether usage inside a SaaS or template that third parties render with is covered | Get written confirmation first |
| Zapsplat / Pixabay SFX | Attribution and plan rules; redistribution and template limits [M] | Avoid bundling |

Library v1 (about 2,000 sounds) [E]:
- **Map UI:** pin drop, pop, click, paper rustle, stamp, typewriter, marker draw, border "grow", counter tick.
- **Transitions:** whooshes, swishes, risers, impacts, braams, sub-drops.
- **War:** war drums, march, musket volleys, cannon, artillery, explosions, sword clash, cavalry, battle cries, aircraft, sirens.
- **Ambience loops:** light and heavy rain, thunder, wind, blizzard, desert wind, ocean, fire crackle, crowd, city, jungle. Link each to the matching **visual effect preset** (rain particles → rain bed + thunder spots).
- **Period sounds:** church bells, horns, ship creaks.

Normalize every SFX at ingest (peak and LUFS), and tag by intensity and era.

---

## 6. Mixing and mastering

Tested pipeline [T] (ffmpeg 6.1, 60 s, 4 vCPU, **about 4.0 s wall time, −14.4 LUFS integrated**):

```
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[vo][sc];
[1:a]volume=-6dB[mus];
[mus][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400:makeup=1[ducked];
[2:a]adelay=5000|5000,volume=-8dB[sfx];
[vo][ducked][sfx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]
```

Recommendations [E]:
- **Duck deterministically.** You already know every word's timing, so drive a music-gain envelope from it rather than using a compressor: −12 to −15 dB under speech, about 150 ms attack, 500–800 ms release, and swell back up in gaps longer than 1.2 s. Remotion `<Audio>` volume callbacks or an ffmpeg `volume` expression can apply it. Keep `sidechaincompress` as a fallback.
- **Master in two passes.** Run `loudnorm` once to measure, then again in linear mode (`measured_I`, `measured_TP` and so on [V] https://github.com/FFmpeg/FFmpeg/blob/master/doc/filters.texi) to **−14 LUFS integrated, −1 to −1.5 dBTP**, at 48 kHz with AAC at 192 kbps or more.
  - YouTube, TikTok and Instagram normalize playback to roughly −14 LUFS. This is an industry-measured convention, not an official spec [E].
  - Upsample 24 kHz TTS (Kokoro, Gemini) to 48 kHz.
- **Sync cuts to the beat.** The scene planner snaps transitions and "big reveal" moments to the nearest downbeat (within ±150 ms) using library beat grids. Choose cue entries at section starts, and use stems to drop drums in calm passages.
- **QA gates:** clipping, gaps longer than 1.5 s, per-sentence loudness variance, and ASR WER.

---

## 7. Captions

- **Vertical (Shorts, TikTok, Reels):**
  - Burned-in, word-by-word highlight with 2–4 words per "page" and a scale-pop on the active word.
  - Place names in an accent color that matches their pulsing map label. This is a "map-native" signature style [E].
  - Keep captions in the middle band, clear of the bottom ~20% and the right-side UI.
  - Build on `@remotion/captions` `createTikTokStyleCaptions` (a low `combineTokensWithinMilliseconds` gives word-by-word) [V] https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/captions/create-tiktok-style-captions.mdx (package v4.0.532, MIT, published 2026-10-01 [V npm]).
- **Horizontal long-form:** top channels lean on on-map labels and lower-thirds. Make burned-in captions a toggle, and **always export SRT/VTT** (`serializeSrt` [V]) for upload to YouTube CC.
- **Multi-language [E]:**
  - Translate the script with the LLM under duration constraints (±10% syllables, so visual timing still fits).
  - Re-voice with a multilingual TTS (Gemini, ElevenLabs, Chatterbox-Multilingual, Qwen3-TTS), re-align, and localize on-map labels (exonyms).
  - Offer multi-audio-track exports; YouTube's multi-language audio feature is [M].

---

## 8. Cost per video (audio only) [E]

Assumptions: 900 chars/min; 1.25x synthesis factor for QA retakes and edits, with sentence-level caching.

| Line item | 60-s Short | 10-min long-form |
|---|---|---|
| Premium TTS, ElevenLabs v3 at $0.10/1K | $0.11 | $1.13 |
| Same, if the $0.18/1K overage tier applies | $0.20 | $2.03 |
| Standard TTS, Gemini 3.8 Flash (2026 promo) | $0.017 | $0.17 |
| Standard TTS, Gemini 3.8 Flash (**2027 list**) | $0.034 | $0.34 |
| Budget TTS, Gemini 3.8 Flash-Lite (2027 list) | $0.023 | $0.23 |
| Draft/free TTS, Kokoro self-hosted | ~$0.003 | ~$0.03 |
| Alignment (stable-ts, CPU) | <$0.001 | ~$0.005 |
| Music (owned library) / SFX (owned library) | $0 / $0 | $0 / $0 |
| Optional custom score (ElevenLabs Music) | $0.15 | $1.50 |
| Mix and master CPU | <$0.001 | ~$0.005 |

Fixed costs [S/M/E]:
- ElevenLabs plan: Pro $99, Scale $330 or Business about $1,320 per month.
- One-time library build: about $200–800 in generation, plus curation labor.
- Library storage: about 70 GB, around $2/month on S3-class storage.
- Optional always-on GPU worker: g4dn.xlarge is about $384/month. It is not needed at the start, because Kokoro and alignment run on CPU workers.

Biggest cost levers [E]:
1. Kokoro for drafts and previews; premium voices only on final render.
2. Cache audio per sentence by hash(text + voice + settings), so edits re-synthesize only the changed sentences.
3. Use the Gemini Batch API (half price) for non-urgent renders.
4. Use a cheaper default voice on low-price plans.

---

## 9. Licensing risk table

| Item | Risk | Why | Action |
|---|---|---|---|
| Suno / Udio / unofficial APIs | **High** | No self-serve API, ToS violation, active litigation [S] | Exclude |
| NC weights (F5, MusicGen, YuE2, Spark, XTTS, MMS aligner, Fish S2, Higgs v3) | **High** | Non-commercial or research licenses [V] | License registry plus CI block |
| Shared music library hijacked into Content ID | Med-High | Third-party registration claims all users [E] | ToS ban, private streaming, per-render certificates, provenance logs |
| ACE-Step 1.5 outputs | Medium | MIT, but unknown training data; GEMA v Suno shows memorization can be found [S] | Licensed-data generators first; similarity QA |
| Pixabay / YouTube Audio Library / FMA | Medium | Redistribution limits and claims [M] | Don't bundle |
| Sonniss / Zapsplat in a SaaS | Medium | Template/redistribution scope unclear [M] | Written confirmation or skip |
| Stability Community License, IndexTTS2 license | Low-Med | Revenue/MAU thresholds [V] | Calendar a relicense trigger |
| ElevenLabs / Google TTS output for monetized videos | Low | Standard commercial terms [M] | Counsel review of API ToS; enterprise agreement |
| Voice cloning / impersonation (politicians in war videos) | **High (reputational/legal)** | Deepfake rules; EU AI Act Art. 50 transparency, applicable from 2026-08-02 [M] | No real-person voices; consent-verified cloning only; AI disclosure metadata |
| Gemini 3.8 TTS Preview | Medium (business) | Promo ends 2026-12-31; Pre-GA terms [V] | Price at the 2027 rate; multi-provider abstraction |
| AGPL tools (whisper-timestamped, essentia) | Medium | Network copyleft [V] | Avoid in the backend |

---

## 10. Build-once asset plan (summary) [E]

- **Voices:** 10–20 curated narrator presets per launch language (owned Voice-Design or premade voices), each with a style prompt, pace and pronunciation lexicon. An LLM generates IPA for proper nouns, fed to Google `custom_pronunciations` or ElevenLabs pronunciation dictionaries.
- **Music:** 600 tracks with stems, loops, stingers and beat grids (section 4.2). Plan 2–3 weeks for one person plus tooling.
- **SFX:** about 2,000 sounds (section 5), tagged and normalized, with ambience beds linked to visual FX presets.
- **Pipeline:** sentence TTS → cache → timestamps or alignment → ASR QA → scene durations → deterministic ducking → Remotion render → two-pass loudnorm → SRT/VTT export → license certificate.

## 11. Items a fact-checker should verify first

1. ElevenLabs per-1K pricing (one published rate vs per-tier overage) and the music $/min.
2. Inworld TTS prices (the On-Demand and Replicate figures conflict).
3. Suno partner API status.
4. The Epidemic Sound partner commercial model.
5. Pixabay and YouTube Audio Library redistribution clauses.
6. Polly generative speech-mark support.
7. Licenses on the Kyutai TTS and Higgs v2 weights.
8. The EU AI Act Art. 50 date.

## KEY RECOMMENDATIONS
- Put TTS behind a provider-agnostic interface and launch with three tiers: ElevenLabs v3/Multilingual v2 (premium), Gemini 3.8 Flash TTS via Cloud TTS (standard) and self-hosted Kokoro (drafts/free) - the cost per minute differs 10-50x between them.
- Pick the default narrator voice through a blind listening test (20+ raters, 5 scripts, about 6 voices) before committing - vendor quality rankings change every quarter.
- Synthesize narration per sentence, cache by hash(text+voice+settings), preview with Kokoro and use premium voices only on the final render - regenerations otherwise dominate TTS spend.
- Budget Gemini TTS at the 2027 list price ($18/1M audio tokens, about $0.027/min), not the 2026 promo ($9) - the promo ends 2026-12-31 and the model is still Preview.
- Use native timestamps where available (ElevenLabs convertWithTimestamps, Kokoro start_ts/end_ts); otherwise force-align against the known script with stable-ts or wav2vec2 - ASR transcripts mangle historical proper nouns.
- Never ship NC/research weights (F5-TTS, MusicGen, YuE2, Spark-TTS, XTTS, Fish S2, Higgs v3, the default MMS aligner) and avoid AGPL tools - keep a model/asset license registry enforced in CI.
- Build an owned, private music library (~600 tracks, ~40 moods, with stems, loops, stingers and beat grids) generated with licensed-data tools (ElevenLabs Music, Google Lyria 3/3 Pro) - about $150-700 one-time and $0 per video.
- Exclude Suno/Udio (no self-serve official API; unofficial wrappers violate ToS) and do not bundle Pixabay, YouTube Audio Library or Free Music Archive tracks - Content ID and redistribution risk.
- Protect the shared library: ToS ban on Content ID registration, stream-only access, provenance logs, a license certificate per render, and private-YouTube claim tests before each release - one hijacked track can hit every customer.
- Generate about 2,000 SFX once with ElevenLabs SFX v2 (loop and durationSeconds supported) plus curated CC0 packs, and link ambience beds to the visual effect presets - near-zero marginal cost and on-brand audio.
- Mix with deterministic ducking driven by word timestamps (music -12 to -15 dB under speech) and a two-pass loudnorm to -14 LUFS / -1 dBTP - tested at about 4 s CPU per minute of output.
- Burn in word-by-word captions for vertical video using @remotion/captions (createTikTokStyleCaptions), color-matching place names to map labels, and always export SRT/VTT - it is free (MIT) and fits the map style.
- Offer a premium 'custom score' using ElevenLabs Music composition plans with respectSectionsDurations matched to scene lengths (~$0.15/min) - a cheap, differentiating upsell.
- Add an automated audio QA loop (faster-whisper ASR WER check weighted on proper nouns, LLM-generated IPA lexicon, loudness/clipping/gap checks) - TTS mispronunciations and hallucinations are the main quality failure.
- Prohibit real-person voice cloning and add AI-disclosure metadata - war and politics content carries high deepfake and EU AI Act Art. 50 exposure.

## COST ITEMS
- Google Gemini 3.8 Flash TTS (Preview) audio output, through 2026-12-31: $9.00 / per 1M audio tokens (25 tokens/sec of audio; about $0.0135/min) (VERIFIED. Text input $0.50/1M tokens. Vertex page says the promo is implemented as 50% credits back.) https://cloud.google.com/text-to-speech/pricing
- Google Gemini 3.8 Flash TTS audio output, from 2027-01-01: $18.00 / per 1M audio tokens (about $0.027/min) (VERIFIED. Text input $1.00/1M tokens.) https://cloud.google.com/text-to-speech/pricing
- Google Gemini 3.8 Flash-Lite TTS audio output (2026 promo / 2027): $6.00 / $12.00 / per 1M audio tokens (about $0.009 / $0.018 per min) (VERIFIED) https://cloud.google.com/text-to-speech/pricing
- Google Gemini 2.5 Flash TTS / 2.5 Pro TTS / 3.1 Flash TTS audio output: $10 / $20 / $20 / per 1M audio tokens (about $0.015 / $0.03 / $0.03 per min) (VERIFIED) https://cloud.google.com/text-to-speech/pricing
- Gemini 3.8 Flash TTS via Gemini API Batch: $4.50 / per 1M audio tokens (about $0.0068/min) (SECONDARY (LiteLLM, citing ai.google.dev pricing)) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Google Chirp 3: HD voices: $30 / per 1M characters (about $0.027/min); first 1M chars/month free (VERIFIED. Instant custom voice $60/1M. Studio $160/1M; Neural2 $16/1M; WaveNet/Standard $4/1M.) https://cloud.google.com/text-to-speech/pricing
- ElevenLabs eleven_v3 / eleven_multilingual_v2 TTS: $0.10 (some sources $0.18 at Scale overage) / per 1K characters (about $0.09-0.16/min) (SECONDARY (voice-prices checked 2026-08-20; openstory rate card read off elevenlabs.io/pricing/api 2026-09-15). LiteLLM lists $0.18/1K. Fact-check against an invoice.) https://github.com/mahimailabs/voice-prices
- ElevenLabs Flash / Turbo v2.5 TTS: $0.05 / per 1K characters (about $0.045/min) (SECONDARY; 0.5 credits per character) https://github.com/mahimailabs/voice-prices
- ElevenLabs subscription plans: Starter $5 (30K credits), Creator $22 (100K), Pro $99 (500K), Scale $330 (2M); Business ~ $1,320 (11M) / per month (SECONDARY (Feb 2026); Business tier from memory, unverified) https://github.com/mrgoonie/human-mcp/blob/main/plans/research/260228-elevenlabs-text-to-speech-api.md
- ElevenLabs Music API (music_v2 / music_v2_5): $0.15 / per minute of generated music (SECONDARY (rate card read off elevenlabs.io/pricing/api on 2026-09-15). Model IDs verified in the official SDK.) https://github.com/openstory-so/openstory/blob/main/src/billing/elevenlabs-pricing.ts
- ElevenLabs Sound Effects (eleven_text_to_sound_v2): 40 credits/sec with set duration; 200 credits per auto-length generation / credits (about $0.004-0.012 per second depending on credit price) (SECONDARY (Feb 2026); dollar conversion is an estimate) https://github.com/mrgoonie/human-mcp/blob/main/plans/research/260228-elevenlabs-sound-effects-music-api.md
- ElevenLabs Scribe v2 transcription: $0.22 / per hour of audio (SECONDARY (2026-09-23). Optional, for the ASR back-check.) https://github.com/openstory-so/openstory/blob/main/src/billing/elevenlabs-pricing.ts
- OpenAI gpt-4o-mini-tts: $0.60 / $12.00 / per 1M text input tokens / per 1M audio output tokens (about $0.015/min) (SECONDARY. Model list (incl. gpt-4o-mini-tts-2025-12-15) verified in openai-node SDK. No timestamps.) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- OpenAI tts-1 / tts-1-hd: $15 / $30 / per 1M characters (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Azure Neural (incl. Neural HD Flash) / Azure HD V2: $15 / $30 / per 1M characters (SECONDARY (checked 2026-08-21). Custom Neural Professional $24/1M, HD $48/1M.) https://github.com/mahimailabs/voice-prices
- Amazon Polly Neural / Generative / Long-Form / Standard: $16 / $30 / $100 / $4 / per 1M characters (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Cartesia Sonic-3: $5 per 100K credits (Pro); $49 per 1.25M (Startup) / per month (1 credit per character; about $0.04-0.05 per 1K chars); PVC voices 1.5x (SECONDARY (checked 2026-08-21)) https://github.com/mahimailabs/voice-prices
- Deepgram Aura-2 / Aura-1 (pay-as-you-go): $0.030 / $0.015 / per 1K characters (SECONDARY (checked 2026-05-27)) https://github.com/mahimailabs/voice-prices
- Inworld TTS-2 / TTS-1.5 Max / TTS-1.5 Mini (On-Demand): $25 / $35 / $15 / per 1M characters (SECONDARY (checked 2026-08-07). Replicate resale lists $10/$5, so figures conflict; verify.) https://github.com/mahimailabs/voice-prices
- Hume Octave: $0.15 / per 1K characters overage (Creator plan $7/mo) (SECONDARY) https://github.com/mahimailabs/voice-prices
- Rime Mist / Coda: $0.03 / $0.05 / per 1K characters (Starter) (SECONDARY) https://github.com/mahimailabs/voice-prices
- MiniMax speech-2.6-hd / speech-2.6-turbo: $100 / $60 / per 1M characters (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Mistral Voxtral TTS (voxtral-mini-tts-2603): $16 / per 1M characters (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- Groq Orpheus v1 English: $22 / per 1M characters (SECONDARY) https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json
- fal-hosted Kokoro / Chatterbox / Dia: $20 / $25 / $40 / per 1M characters (SECONDARY; shows the markup versus self-hosting) https://github.com/affromero/pricetoken
- Self-hosted Kokoro-82M on CPU (measured): ~$0.002 / per narrated minute (RTF 0.63 on 4 vCPU = ~2.5 vCPU-min per audio min at ~$0.045/vCPU-h) (TESTED in container (kokoro-onnx 0.6.1 fp32); vCPU-hour price is an estimate) https://github.com/thewh1teagle/kokoro-onnx
- AWS g4dn.xlarge (T4) / g6.xlarge (L4) / g5.xlarge (A10G) on-demand, us-east-1 Linux: $0.526 / $0.8048 / $1.006 / per hour (SECONDARY (AWS price list file dated 2026-09-25, downloaded by a sibling research agent into the shared scratchpad). For self-hosted TTS, music or alignment GPU workers.) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv
- Google Lyria 3 Pro (Vertex): $0.08 / per full song (VERIFIED) https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
- Google Lyria 3 (Vertex): $0.04 / per 30-second clip (VERIFIED) https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
- Google Lyria 2 (Vertex): $0.06 / per generation (~30 s) (VERIFIED) https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
- One-time owned music library build (~600 keepers, ~1,800 candidates): $150-700 / one-time generation cost (excl. curation labor) (ESTIMATE: 1,800 x $0.08 Lyria 3 Pro = $144; or ~4,500 min x $0.15 ElevenLabs Music = $675) https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
- One-time owned SFX library build (~2,000 SFX x ~4 s): $30-100 / one-time (ESTIMATE from 40 credits/sec) https://github.com/mrgoonie/human-mcp/blob/main/plans/research/260228-elevenlabs-sound-effects-music-api.md
- Mix and master (ffmpeg ducking + loudnorm): ~4 s CPU per 60 s of output (<$0.001) / per minute of video (TESTED in container (ffmpeg 6.1.1, 4 vCPU), result -14.4 LUFS integrated) https://github.com/FFmpeg/FFmpeg/blob/master/doc/filters.texi
- Forced alignment (stable-ts / WhisperX alignment on CPU): <$0.001 / per narrated minute (ESTIMATE; MIT/BSD-2 licensed tools) https://github.com/jianfch/stable-ts
- Library storage (~70 GB music stems + SFX): ~$2 / per month (ESTIMATE at ~$0.023/GB-month object storage; S3 price not verified this session) https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.csv

## RISKS
- Pricing uncertainty: most vendor sites (ElevenLabs, OpenAI, Azure, AWS, Cartesia, Inworld, Epidemic, Pixabay, Suno) were blocked by the sandbox egress proxy, so many prices are secondary sources - the ElevenLabs per-1K rate alone varies 1.8x between sources.
- Gemini 3.8 TTS price doubles on 2027-01-01, the 2026 rate is a credits-back promo, and the model is Preview with Pre-GA terms (no SLA, may change or be deprecated, possibly no indemnity).
- Shared music library hijack: if any user or third party registers a library track with Content ID through a distributor, every customer using it can be claimed or demonetized; fully AI-generated audio reportedly cannot be registered defensively.
- AI music legal exposure is still moving (GEMA v Suno memorization ruling 2026-07-31; UMG/Sony second suit vs Suno 2026-09-18); open models with undisclosed training data (ACE-Step) could reproduce protected material.
- Accidental use of non-commercial or research weights (F5-TTS, MusicGen, YuE2, Spark-TTS, XTTS-v2, Fish S2, Higgs v3, the MMS-based default model in ctc-forced-aligner) or AGPL tools (whisper-timestamped, essentia) in production.
- Revenue- and MAU-threshold licenses (Stability Community <$1M revenue; bilibili IndexTTS2 100M MAU / RMB 1B) require relicensing as the company grows.
- TTS quality failures on long history scripts: mispronounced proper nouns, skipped or hallucinated words (especially expressive models like eleven_v3), and voice drift between Gemini TTS chunks (5,000-byte request limit).
- Voice cloning and impersonation in war/geopolitics content (fake leader speeches) creates reputational and legal exposure, including EU AI Act Article 50 transparency duties (applicable from 2026-08-02, unverified) and platform synthetic-media rules.
- YouTube monetization policy against mass-produced or 'inauthentic' content could demonetize users' channels if every video sounds alike (same voice, same music) - churn risk tied to audio variety.
- Vendor ToS changes (Suno rewrote terms in 2026 and tied commercial rights to downloads) can retroactively complicate a SaaS built on a single provider; multi-provider abstraction is needed.
- SFX library licenses (Sonniss GDC, Zapsplat, Pixabay) may not cover use inside a SaaS where third parties create and monetize videos; using them without written confirmation is a latent liability.
- Platform loudness targets (~-14 LUFS) are industry-measured conventions, not official specs; platforms can change normalization.

## QUESTIONS FOR FOUNDER
- Premium voice cost tolerance: is ~$1-2 of ElevenLabs narration per 10-minute video acceptable on top plans, or should the default be Gemini TTS (~$0.15-0.35 per 10 min) with ElevenLabs as an add-on?
- Will you sign vendor contracts with monthly commitments (e.g. ElevenLabs Scale $330 or Business ~ $1,320/month, Epidemic Sound partner deal), and what is the fixed monthly budget for audio vendors at launch?
- Legal stance on AI music: licensed-data generators only (ElevenLabs Music, Google Lyria), or do you accept open models with undisclosed training data (ACE-Step, MIT) for more variety at near-zero cost?
- Should users be able to clone their own voice? That needs consent verification, abuse policies and a hard ban on real public figures' voices.
- Which launch languages and markets? This drives TTS vendor choice, voice curation and caption/label localization, and whether EU AI Act transparency duties apply now.
- Do you have (or will you hire) counsel to review ElevenLabs, Google Cloud and OpenAI API terms for 'SaaS whose end users monetize outputs', plus a user ToS that bans registering library tracks in Content ID?
- Expected volume at launch and at 12 months (videos per month, average length, Shorts vs long-form mix) so ElevenLabs tier and commitment levels can be sized?
- Infrastructure preference: API-only at first, or are you willing to run self-hosted workers (Kokoro, alignment, Demucs, possibly ACE-Step) on CPU and GPU to cut costs?
- Do you want a premium per-video 'custom score' feature (music composed to scene timings, ~$1.50 per 10-minute video), or just the curated library?
- Who curates the music and SFX library (about 2-3 weeks of listening and tagging)? Do you have a sound designer or musician contact, or should curation be heavily automated?
- Is an optional 'connect your Epidemic Sound account' integration worth pursuing for creators who already subscribe?
- Can you grant the build environment network access to vendor domains (elevenlabs.io, openai.com, inworld.ai, cartesia.ai, huggingface.co, pixabay.com, epidemicsound.com) and provide API keys, so prices, terms and voice quality can be verified first-hand and benchmarked?