"""Synthesize narration phrase by phrase with Kokoro (Apache-2.0) and write timing.

Usage: python3 tools/tts.py scripts/<scene>.json build/<scene>/  (KOKORO_DIR points at the model files)

Outputs:
  narration.wav  48 kHz mono
  timing.json    {duration, phrases:[{id, text, start, end, words:[{w, start, end}]}]}

Word times are approximate: each phrase's speech span is detected from the audio energy and
split across its words in proportion to their length. Production would force-align instead.
"""
import json
import os
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SR_OUT = 48000


def speech_span(x, sr, thresh_db=-38.0, win=0.01):
    n = max(1, int(sr * win))
    frames = len(x) // n
    if frames == 0:
        return 0.0, len(x) / sr
    e = np.array([np.sqrt(np.mean(x[i * n:(i + 1) * n] ** 2) + 1e-12) for i in range(frames)])
    db = 20 * np.log10(e / (e.max() + 1e-12))
    on = np.where(db > thresh_db)[0]
    if len(on) == 0:
        return 0.0, len(x) / sr
    return on[0] * win, (on[-1] + 1) * win


def word_times(text, s0, s1):
    words = re.findall(r"[^\s]+", text)
    weights = []
    for w in words:
        core = re.sub(r"[^\w'-]", "", w)
        wt = max(2, len(core)) + 1
        if re.search(r"[,;:?]$", w):
            wt += 4  # breath after punctuation
        weights.append(wt)
    total = sum(weights)
    out, t = [], s0
    for w, wt in zip(words, weights):
        d = (s1 - s0) * wt / total
        out.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def resample(x, sr_in, sr_out):
    if sr_in == sr_out:
        return x
    t_in = np.arange(len(x)) / sr_in
    t_out = np.arange(int(len(x) * sr_out / sr_in)) / sr_out
    return np.interp(t_out, t_in, x).astype(np.float32)


def main():
    spec_path, out_dir = sys.argv[1], sys.argv[2]
    model_dir = os.environ.get("KOKORO_DIR", ".")
    spec = json.load(open(spec_path))
    os.makedirs(out_dir, exist_ok=True)
    kok = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))

    pieces = [np.zeros(int(SR_OUT * spec.get("lead_in", 0.3)), dtype=np.float32)]
    t = spec.get("lead_in", 0.3)
    phrases = []
    for ph in spec["phrases"]:
        audio, sr = kok.create(ph["text"], voice=spec["voice"], speed=spec.get("speed", 1.0), lang=spec.get("lang", "en-us"))
        audio = resample(np.asarray(audio, dtype=np.float32), sr, SR_OUT)
        s0, s1 = speech_span(audio, SR_OUT)
        # trim edge silence, keep 40 ms padding
        a0 = max(0, int((s0 - 0.04) * SR_OUT))
        a1 = min(len(audio), int((s1 + 0.06) * SR_OUT))
        audio = audio[a0:a1]
        dur = len(audio) / SR_OUT
        start = t
        sp0, sp1 = start + 0.04, start + dur - 0.06
        phrases.append({
            "id": ph["id"], "text": ph["text"], "start": round(start, 3), "end": round(start + dur, 3),
            "words": word_times(ph["text"], sp0, sp1),
        })
        pieces.append(audio)
        t += dur
        gap = ph.get("pause", 0.3)
        pieces.append(np.zeros(int(SR_OUT * gap), dtype=np.float32))
        t += gap
        print(f"{ph['id']}: {start:6.2f}s  {dur:5.2f}s  {ph['text'][:60]}")

    tail = spec.get("tail", 1.5)
    pieces.append(np.zeros(int(SR_OUT * tail), dtype=np.float32))
    t += tail
    wav = np.concatenate(pieces)
    peak = np.abs(wav).max() + 1e-9
    wav = (wav / peak * 0.89).astype(np.float32)
    sf.write(os.path.join(out_dir, "narration.wav"), wav, SR_OUT)
    json.dump({"duration": round(t, 3), "phrases": phrases}, open(os.path.join(out_dir, "timing.json"), "w"), indent=1)
    print(f"total {t:.2f}s")


if __name__ == "__main__":
    main()
