"""Build the soundtrack for a sample: procedural placeholder music + synthesized SFX + narration,
music ducked under the voice, normalized to -14 LUFS.

Usage: python3 tools/audio.py build/<scene>   (reads narration.wav, timing.json, meta.json; writes mix.wav)

The music and SFX here are synthesized placeholders so the samples carry no third-party rights;
the product would use a licensed library (see docs/PLAN.md, section 5.6).
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

SR = 48000
rng = np.random.default_rng(7)


def db(x):
    return 10 ** (x / 20)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env_ad(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e


def fft_filter(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    mask = ((f >= lo) & (f <= hi)).astype(float)
    # soft edges
    mask = np.convolve(mask, np.ones(64) / 64, mode="same")
    return np.fft.irfft(X * mask, n=len(x))


def reverb(x, secs=1.2, mix=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.0 / secs))
    ir = fft_filter(ir, 150, 6000)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return (1 - mix) * x + mix * wet * 0.6


# ---------------- SFX ----------------
def sfx(kind, dur=None):
    if kind in ("whoosh", "whoosh-soft", "whoosh-long"):
        d = {"whoosh": 0.9, "whoosh-soft": 0.7, "whoosh-long": 1.8}[kind]
        n = int(d * SR)
        noise = rng.standard_normal(n)
        t = np.arange(n) / n
        out = np.zeros(n)
        # sweep band upward then down by mixing a few band-passed copies with moving gains
        bands = [(200, 600), (500, 1500), (1200, 3500), (3000, 8000)]
        for k, (lo, hi) in enumerate(bands):
            centre = (k + 0.5) / len(bands)
            gain = np.exp(-((t - centre * 0.8 - 0.1) ** 2) / 0.03)
            out += fft_filter(noise, lo, hi) * gain
        out *= np.sin(np.pi * t) ** 1.5
        return out / (np.abs(out).max() + 1e-9)
    if kind in ("impact", "boom"):
        d = 1.6 if kind == "impact" else 3.2
        n = int(d * SR)
        t = np.arange(n) / SR
        f = 70 * np.exp(-t * 3) + 32
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3.0 if kind == "impact" else 1.4))
        crack = fft_filter(rng.standard_normal(n), 80, 2500) * np.exp(-t * 18)
        out = body * 1.0 + crack * 0.5
        out = reverb(out, 2.0 if kind == "boom" else 1.2, 0.35)
        return out / (np.abs(out).max() + 1e-9)
    if kind in ("pop", "pop-low"):
        f0 = 900 if kind == "pop" else 380
        n = int(0.25 * SR)
        t = np.arange(n) / SR
        out = np.sin(2 * np.pi * (f0 * (1 + 0.6 * np.exp(-t * 60))) * t) * np.exp(-t * 28)
        out += fft_filter(rng.standard_normal(n), 2000, 9000) * np.exp(-t * 300) * 0.4
        return out / (np.abs(out).max() + 1e-9)
    if kind == "tick-run":
        d = dur or 0.8
        n = int(d * SR)
        out = np.zeros(n)
        k = 0
        while True:
            pos = int((k / 16) * n * (1 - 0.3 * (k / 16)))
            if pos >= n - 2000 or k > 40:
                break
            tick = np.sin(2 * np.pi * 2400 * np.arange(1200) / SR) * np.exp(-np.arange(1200) / SR * 220)
            out[pos:pos + 1200] += tick
            k += 1
        return out / (np.abs(out).max() + 1e-9)
    if kind == "riser":
        d = dur or 3.0
        n = int(d * SR)
        t = np.arange(n) / n
        f = 120 + 900 * t ** 2
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
        noise = fft_filter(rng.standard_normal(n), 800, 7000) * 0.6
        out = (tone + noise * t) * t ** 2
        return out / (np.abs(out).max() + 1e-9)
    if kind == "alarm":
        out = np.zeros(int(1.2 * SR))
        for k, f in enumerate([880, 660, 880]):
            s = int(k * 0.32 * SR)
            n = int(0.24 * SR)
            tt = np.arange(n) / SR
            out[s:s + n] += np.sign(np.sin(2 * np.pi * f * tt)) * 0.3 * np.minimum(1, tt * 80) * np.exp(-tt * 6)
        out = fft_filter(out, 300, 4000)
        return out / (np.abs(out).max() + 1e-9)
    if kind == "drum":
        n = int(1.4 * SR)
        t = np.arange(n) / SR
        f = 55 + 40 * np.exp(-t * 20)
        out = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
        out += fft_filter(rng.standard_normal(n), 60, 900) * np.exp(-t * 25) * 0.6
        out = reverb(out, 1.5, 0.3)
        return out / (np.abs(out).max() + 1e-9)
    if kind == "clash":
        n = int(1.6 * SR)
        t = np.arange(n) / SR
        out = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, dcy in [(1870, 5), (2730, 7), (3990, 9), (5410, 12), (920, 4)])
        out = out * 0.25 + fft_filter(rng.standard_normal(n), 2000, 10000) * np.exp(-t * 40) * 0.6
        out = reverb(out, 1.4, 0.3)
        return out / (np.abs(out).max() + 1e-9)
    if kind == "fire":
        d = dur or 4.0
        n = int(d * SR)
        t = np.arange(n) / SR
        rumble = fft_filter(rng.standard_normal(n), 40, 400) * 0.5
        crack = np.zeros(n)
        idx = rng.integers(0, n - 800, int(d * 45))
        for i in idx:
            crack[i:i + 800] += rng.standard_normal(800) * np.exp(-np.arange(800) / 90) * rng.uniform(0.2, 1)
        crack = fft_filter(crack, 1500, 9000)
        out = (rumble + crack * 0.7) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
        return out / (np.abs(out).max() + 1e-9)
    if kind == "wind":
        d = dur or 6.0
        n = int(d * SR)
        t = np.arange(n) / SR
        base = rng.standard_normal(n)
        lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t) * np.sin(2 * np.pi * 0.07 * t + 1)
        out = (fft_filter(base, 250, 1200) * lfo + fft_filter(base, 1200, 3500) * (1 - lfo) * 0.5)
        out *= np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5)
        return out / (np.abs(out).max() + 1e-9)
    if kind == "paper":
        n = int(0.6 * SR)
        t = np.arange(n) / SR
        out = fft_filter(rng.standard_normal(n), 1500, 8000) * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * np.exp(-t * 4)
        return out / (np.abs(out).max() + 1e-9)
    raise ValueError(kind)


# ---------------- music ----------------
def note_freq(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def pad_voice(freq, n, bright=0.5):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 8):
        amp = (1 / h) * (bright ** (h - 1))
        for det in (-0.12, 0.0, 0.11):
            out += amp * np.sin(2 * np.pi * freq * h * (1 + det / 100) * t + h * det * 7)
    return out


def music_dark_pulse(dur, spec):
    n = int(dur * SR)
    t = np.arange(n) / SR
    bpm = spec.get("bpm", 92)
    beat = 60 / bpm
    drone = 0.5 * np.sin(2 * np.pi * 55 * t) + 0.3 * np.sin(2 * np.pi * 82.41 * t + 1) + 0.15 * np.sin(2 * np.pi * 110 * t)
    drone *= 0.6 + 0.4 * np.sin(2 * np.pi * t / 8)
    # pulsing low synth on eighths with pumping envelope
    eighth = beat / 2
    ph = (t % eighth) / eighth
    pump = np.exp(-ph * 5)
    seq = [45, 45, 48, 45, 43, 45, 50, 48]
    idx = (t / eighth).astype(int) % len(seq)
    f = note_freq(np.array(seq))[idx]
    phase = 2 * np.pi * np.cumsum(f) / SR
    pulse = (np.sin(phase) + 0.35 * np.sin(2 * phase) + 0.15 * np.sin(3 * phase)) * pump
    hats = fft_filter(rng.standard_normal(n), 6000, 12000) * np.exp(-((t % (beat / 4)) / (beat / 4)) * 18) * 0.08
    out = drone * 0.55 + pulse * 0.35 + hats
    return out


def music_epic_minor(dur, spec):
    n = int(dur * SR)
    t = np.arange(n) / SR
    bpm = spec.get("bpm", 68)
    bar = 4 * 60 / bpm
    chords = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm Bb F C
    out = np.zeros(n)
    seg = int(2 * bar * SR)
    for k in range(0, n, seg):
        ch = chords[(k // seg) % len(chords)]
        m = min(seg + int(0.8 * SR), n - k)
        env = np.minimum(1, np.arange(m) / SR / 1.2) * np.minimum(1, (m - np.arange(m)) / SR / 1.0)
        for note in ch:
            out[k:k + m] += pad_voice(note_freq(note), m, 0.45) * env * 0.12
        out[k:k + m] += pad_voice(note_freq(ch[0] - 12), m, 0.3) * env * 0.16
    out = reverb(out, 2.5, 0.35)
    return out


def build_music(dur, spec):
    mood = spec.get("mood", "dark-pulse")
    m = music_dark_pulse(dur, spec) if mood == "dark-pulse" else music_epic_minor(dur, spec)
    t = np.arange(len(m)) / SR
    g = np.ones_like(m)
    for sw in spec.get("swellAt", []):
        g *= 1 + 0.6 * np.exp(-((t - sw) ** 2) / 2.0)
    for dr in spec.get("drops", []):
        g *= 1 - 0.95 * np.clip((t - dr["t"]) / 0.15, 0, 1) * np.clip((dr["t"] + dr["dur"] - t) / 0.05, 0, 1)
    for sec in spec.get("sections", []):  # {t0,t1,gain_db}
        w = np.clip((t - sec["t0"]) / 0.8, 0, 1) * np.clip((sec["t1"] - t) / 0.8, 0, 1)
        g *= 1 + (db(sec["gain_db"]) - 1) * w
    end = spec.get("end", dur)
    g *= np.clip((end - t) / 1.8, 0, 1) * np.clip(t / 0.6, 0, 1)
    m = m * g
    return m / (np.abs(m).max() + 1e-9)


def main():
    B = sys.argv[1]
    timing = json.load(open(os.path.join(B, "timing.json")))
    meta = json.load(open(os.path.join(B, "meta.json")))
    voice, sr = sf.read(os.path.join(B, "narration.wav"))
    assert sr == SR
    dur = max(meta["duration"], len(voice) / SR) + 0.5
    n = int(dur * SR)
    t = np.arange(n) / SR

    # speech envelope for ducking
    sp = np.zeros(n)
    for ph in timing["phrases"]:
        sp[int(ph["start"] * SR):int(ph["end"] * SR)] = 1
    k = int(0.25 * SR)
    sp = np.convolve(sp, np.ones(k) / k, mode="same")
    duck = 1 - 0.78 * np.clip(sp * 1.5, 0, 1)  # about -13 dB under speech

    music = np.zeros(n)
    if meta.get("music"):
        m = build_music(dur, meta["music"])
        music[:len(m)] = m[:n]
    music *= duck * db(-14)

    fx = np.zeros(n)
    for cue in meta.get("sfx", []):
        s = sfx(cue["type"], cue.get("dur"))
        i0 = int(max(0, cue["t"]) * SR)
        i1 = min(n, i0 + len(s))
        fx[i0:i1] += s[: i1 - i0] * db(cue.get("gain", -10))

    v = np.zeros(n)
    v[: min(n, len(voice))] = voice[:n]
    mix = v + music + fx
    mix = np.tanh(mix * 1.1) / 1.1
    raw = os.path.join(B, "mix_raw.wav")
    sf.write(raw, np.stack([mix, mix], -1).astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(B, "mix.wav")], check=True)
    print("mix.wav written")


if __name__ == "__main__":
    main()
