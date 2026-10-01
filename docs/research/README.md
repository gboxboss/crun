# Research index (2026-10-01)

These are the source material for [`docs/PLAN.md`](../PLAN.md).

## How the research was done

1. Nine research areas were investigated in parallel.
2. An independent fact-checker then tried to refute each report's prices, licences and terms against primary sources.
3. A completeness critic compared all the reports and found the contradictions and gaps between them.
4. Three follow-up studies filled the biggest gaps.

Many vendor websites were blocked from the research container's network. Each report labels every claim (verified, secondary or estimate) and explains how it was checked. **Re-verify prices and terms before you commit money.**

## Reports

| Area | Report | Fact-check |
|---|---|---|
| Genre anatomy, 28 style presets, 150-technique catalog, retention structure, quality bar | [genre.md](reports/genre.md) | [genre.factcheck.md](reports/genre.factcheck.md) |
| Implementing the effects; engines; determinism; scene DSL | [effects.md](reports/effects.md) | [effects.factcheck.md](reports/effects.factcheck.md) |
| Rendering engine and infrastructure cost | [rendering.md](reports/rendering.md) | [rendering.factcheck.md](reports/rendering.factcheck.md) |
| Map data, imagery, historical borders, licensing, attribution | [geodata.md](reports/geodata.md) | [geodata.factcheck.md](reports/geodata.factcheck.md) |
| AI writing pipeline, critic rubric, grounding, model costs | [llm.md](reports/llm.md) | [llm.factcheck.md](reports/llm.factcheck.md) |
| Voice, music, SFX, alignment, mixing, captions | [audio.md](reports/audio.md) | [audio.factcheck.md](reports/audio.factcheck.md) |
| AI images and video, archival media, asset processing | [visualgen.md](reports/visualgen.md) | [visualgen.factcheck.md](reports/visualgen.factcheck.md) |
| Market, competitors, pricing, platform policy | [market.md](reports/market.md) | [market.factcheck.md](reports/market.factcheck.md) |
| SaaS architecture, operations, trust & safety, roadmap | [saas.md](reports/saas.md) | [saas.factcheck.md](reports/saas.factcheck.md) |
| Contradictions and gaps across all areas | [critic.md](reports/critic.md) | |
| Follow-up 1: reconciled per-video cost model, vendor terms, margins | [gap1-cost-model.md](reports/gap1-cost-model.md) | |
| Follow-up 2: historical borders and front lines (licences, coverage of the top 100 topics, curation cost) | [gap2-historical-data.md](reports/gap2-historical-data.md) | |
| Follow-up 3: automated visual direction (shot grammar, prior art, evaluation, MVP templates) | [gap3-visual-direction.md](reports/gap3-visual-direction.md) | |

## Models and scripts

- **[`models/cogs/`](models/cogs/)** (Follow-up 1): the per-video cost model (`cogs_model.py`) and the margin calculator (`margins.py`).
- **[`models/direction/`](models/direction/)** (Follow-up 3):
  - the shot-grammar spec;
  - the camera-transition prior;
  - the MVP template library;
  - the reference-corpus manifest;
  - the annotation schema;
  - `measure_corpus.py`, a shot and camera-motion annotator for reference videos.

  The measured short-form shot dataset is not included because it is third-party data. It can be regenerated from the public AutoShot labels, as described in the report.
- **[`models/historical-geodata/`](models/historical-geodata/)** (Follow-up 2):
  - the topic list;
  - the coverage scoring and heatmap (`coverage_full.csv`, `heat.md`);
  - the Territory Composer pilot (`recipes.py`, `composer_eval.py`, `iou.py`);
  - the curation cost model (`cost.py`);
  - the OpenHistoricalMap analysis scripts.

  Input data (Cliopatria, OHM planet, Natural Earth) is not included; the scripts expect it to be downloaded locally.

## Hands-on spike

[`spikes/webgl-render/`](../../spikes/webgl-render/README.md) is a measured, deterministic MapLibre render on CPU. It covers Playwright and Remotion variants, timings and stills.
