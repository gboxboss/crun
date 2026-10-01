"""Orchestral underscore written as MIDI and rendered with FluidSynth + FluidR3_GM (MIT soundfont).

Each score is a function of the scene's narration marks (seconds), so music hits land on story beats.
Usage (from audio.py): render(spec, dur) -> float32 stereo array at 48 kHz.
"""
import os
import subprocess
import tempfile

import mido
import numpy as np
import soundfile as sf

SR = 48000
SF2 = os.environ.get("SOUNDFONT", "/usr/share/sounds/sf2/FluidR3_GM.sf2")
TPB = 960  # ticks per beat at 60 bpm -> 960 ticks per second

# channel -> (GM program, volume)
CH = {
    "strings": (0, 48, 100), "slow": (1, 49, 92), "cello": (2, 42, 100), "bass": (3, 43, 104),
    "horn": (4, 60, 96), "brass": (5, 61, 92), "trombone": (6, 57, 90), "tuba": (7, 58, 92),
    "timp": (8, 47, 112), "drums": (9, 48, 100), "choir": (10, 52, 84), "bells": (11, 14, 92),
    "trem": (12, 44, 92), "pizz": (13, 45, 96), "celesta": (14, 8, 80), "oohs": (15, 53, 80),
}
N = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def m(name):  # "D3" -> 50, "Bb2" -> 46
    name = name.replace("Bb", "A#").replace("Eb", "D#").replace("Ab", "G#")
    return 12 * (int(name[-1]) + 1) + N[name[:-1]]


CHORDS = {  # voicings (low -> high), D minor world
    "Dm": ["D3", "A3", "D4", "F4", "A4"], "Bb": ["Bb2", "F3", "Bb3", "D4", "F4"], "F": ["F2", "C3", "F3", "A3", "C4"],
    "C": ["C3", "G3", "C4", "E4", "G4"], "Gm": ["G2", "D3", "G3", "Bb3", "D4"], "A": ["A2", "E3", "A3", "C#4", "E4"],
    "A7": ["A2", "E3", "G3", "C#4", "E4"], "Dm9": ["D3", "A3", "E4", "F4", "A4"], "Eb": ["Eb3", "Bb3", "Eb4", "G4", "Bb4"],
}
ROOT = {"Dm": "D2", "Bb": "Bb1", "F": "F2", "C": "C2", "Gm": "G1", "A": "A1", "A7": "A1", "Dm9": "D2", "Eb": "Eb2"}


class Score:
    def __init__(self):
        self.ev = []  # (time_s, order, channel, msg)

    def note(self, ch, pitch, t, dur, vel=80):
        c = CH[ch][0]
        p = m(pitch) if isinstance(pitch, str) else pitch
        self.ev.append((t, 1, c, mido.Message("note_on", channel=c, note=p, velocity=int(max(1, min(127, vel))))))
        self.ev.append((t + max(0.03, dur), 0, c, mido.Message("note_off", channel=c, note=p, velocity=0)))

    def chord(self, ch, name, t, dur, vel=70, top=5, octave=0):
        for p in CHORDS[name][:top]:
            self.note(ch, m(p) + 12 * octave, t, dur, vel)

    def cc(self, ch, t0, t1, v0, v1, num=11, step=0.05):
        c = CH[ch][0]
        n = max(1, int((t1 - t0) / step))
        for k in range(n + 1):
            u = k / n
            self.ev.append((t0 + (t1 - t0) * u, -1, c, mido.Message("control_change", channel=c, control=num, value=int(v0 + (v1 - v0) * u))))

    def roll(self, ch, pitch, t0, t1, v0, v1, rate=14):
        n = int((t1 - t0) * rate)
        for k in range(n):
            u = k / max(1, n - 1)
            self.note(ch, pitch, t0 + k / rate, 1.0 / rate, v0 + (v1 - v0) * u)

    def write(self, path):
        mid = mido.MidiFile(ticks_per_beat=TPB)
        tr = mido.MidiTrack()
        mid.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=1000000))  # 60 bpm: 1 beat = 1 s
        for name, (c, prog, vol) in CH.items():
            tr.append(mido.Message("program_change", channel=c, program=prog, time=0))
            tr.append(mido.Message("control_change", channel=c, control=7, value=vol, time=0))
            tr.append(mido.Message("control_change", channel=c, control=11, value=110, time=0))
            tr.append(mido.Message("control_change", channel=c, control=91, value=70, time=0))  # reverb send
        last = 0
        for t, _, _, msg in sorted(self.ev, key=lambda e: (e[0], e[1])):
            tick = int(round(max(0.0, t) * TPB))
            tr.append(msg.copy(time=tick - last))
            last = tick
        mid.save(path)


def napoleon1812(k, dur):
    S = Score()
    beat = 0.6  # 100 bpm
    q = lambda t: round(t / beat) * beat  # snap to the beat grid

    # A. hook: low pedal, timpani roll into "six hundred thousand", dark chords, a cold hold on "never"
    S.note("bass", "D1", 0.0, k["tSix"] + 0.2, 70); S.note("cello", "D2", 0.0, k["tSix"] + 0.2, 60)
    S.cc("bass", 0.0, k["tSix"], 50, 120); S.cc("cello", 0.0, k["tSix"], 50, 120)
    S.chord("slow", "Dm", 0.3, k["tSix"] - 0.3, 55, top=4)
    S.roll("timp", "D2", k["tSix"] - 1.8, k["tSix"] - 0.05, 30, 110)
    hit = k["tSix"]
    S.note("timp", "D2", hit, 1.5, 125); S.note("drums", 36, hit, 1, 120); S.note("drums", 57, hit, 2, 110)
    S.chord("brass", "Dm", hit, 0.5, 115, top=4); S.note("tuba", "D2", hit, 1.2, 110)
    for i, c in enumerate(["Dm", "Bb", "Gm", "A"]):
        t = hit + 0.1 + i * 0.85
        if t > k["tJune"] - 0.6:
            break
        S.chord("strings", c, t, 0.9, 82 if c != "A" else 90)
        S.note("bass", ROOT[c], t, 0.9, 92)
    S.chord("choir", "Dm", k["tNever"] - 0.3, k["tJune"] - k["tNever"] + 0.2, 70, top=4)
    S.note("timp", "A1", k["tNever"], 1.2, 100)
    S.roll("timp", "A1", k["tJune"] - 1.2, k["tJune"] - 0.02, 20, 105)

    # B. the march: snare cadence, cello/bass ostinato, chord pads, horn theme; thins into heat/hunger/disease
    t0, t1 = q(k["tJune"]), k["tThen"] - 0.3
    prog = ["Dm", "Bb", "F", "C", "Dm", "Bb", "Gm", "A"]
    theme = [("D4", 2), ("A4", 1), ("F4", 1), ("E4", 1), ("D4", 1), ("C4", 1), ("D4", 2), ("A3", 2), ("Bb3", 1), ("C4", 1), ("D4", 2), ("E4", 2), ("A3", 4)]
    t, bar = t0, 0
    while t < t1:
        c = prog[bar % len(prog)]
        heat = t > k["tHeat"] - 0.3
        loud = 1.0 if t > k["tRetreat"] else 0.82
        if heat:
            c = ["Gm", "Dm", "A", "Dm"][bar % 4]
            loud = 0.75
        S.chord("strings", c, t, 4 * beat, 70 * loud, top=4)
        root = m(ROOT[c])
        for i in range(8):  # eighth-note ostinato: root, root, fifth, fifth...
            p = root + (7 if (i // 2) % 2 else 0) + 12
            S.note("cello", p, t + i * beat / 2, beat / 2 * 0.8, (88 if i % 2 == 0 else 70) * loud)
        S.note("bass", root, t, 4 * beat, 85 * loud)
        # military snare: rat-a-tat on beat 1, flams, roll into the next bar
        for b in range(4):
            tb = t + b * beat
            S.note("drums", 38, tb, 0.1, (100 if b % 2 == 0 else 80) * loud)
            S.note("drums", 38, tb + beat * 0.5, 0.1, 62 * loud)
            if b == 3:
                for r in range(4):
                    S.note("drums", 38, tb + beat * (0.5 + r * 0.125), 0.06, (55 + r * 10) * loud)
        S.note("drums", 36, t, 0.3, 95 * loud); S.note("drums", 36, t + 2 * beat, 0.3, 80 * loud)
        bar += 1
        t += 4 * beat
    # horn theme over the march, brass answers once the Russians retreat
    tt = q(k["tCross"])
    for p, d in theme:
        if tt > k["tHeat"] - 0.5:
            break
        S.note("horn", p, tt, d * beat * 0.95, 92)
        tt += d * beat
    S.cc("horn", k["tCross"], k["tCross"] + 2, 70, 115)
    if k["tRetreat"] < k["tHeat"]:
        S.chord("brass", "Dm", q(k["tRetreat"]), 2 * beat, 95, top=4)
        S.chord("brass", "Bb", q(k["tRetreat"]) + 2 * beat, 2 * beat, 90, top=4)
    S.note("trem", "D4", k["tHeat"] - 0.3, k["tThen"] - k["tHeat"], 60); S.note("trem", "A3", k["tHeat"] - 0.3, k["tThen"] - k["tHeat"], 55)

    # C. Borodino: rising tremolo, timpani, brass stabs, crash on "collide", driving battle bars
    S.note("trem", "D3", k["tThen"] - 0.2, k["tCollide"] - k["tThen"] + 0.2, 70); S.note("trem", "A3", k["tThen"] - 0.2, k["tCollide"] - k["tThen"] + 0.2, 70)
    S.cc("trem", k["tThen"] - 0.2, k["tCollide"], 50, 127)
    S.roll("timp", "D2", k["tCollide"] - 1.6, k["tCollide"] - 0.03, 40, 120, rate=16)
    tc = k["tCollide"]
    S.note("timp", "D2", tc, 2, 127); S.note("drums", 57, tc, 3, 127); S.note("drums", 36, tc, 1, 127)
    S.chord("brass", "Dm", tc, 0.9, 120, top=5); S.note("tuba", "D1", tc, 1.5, 120); S.note("trombone", "D2", tc, 1.5, 115)
    S.chord("strings", "Dm", tc, 1.2, 110, top=5)
    t, bar = tc + 1.2, 0
    while t < k["tWeek"] - 0.6:
        c = ["Dm", "Bb", "Gm", "A"][bar % 4]
        S.chord("strings", c, t, 4 * beat, 92, top=5)
        S.note("bass", ROOT[c], t, 4 * beat, 100); S.note("tuba", ROOT[c], t, 2 * beat, 88)
        for b in range(4):
            S.note("timp", "D2" if b % 2 == 0 else "A1", t + b * beat, 0.4, 100 if b == 0 else 82)
            S.note("drums", 38, t + b * beat + beat / 2, 0.08, 70)
        S.chord("brass", c, t, beat * 0.6, 100, top=4); S.chord("brass", c, t + 1.5 * beat, beat * 0.5, 90, top=4)
        bar += 1
        t += 4 * beat
    S.cc("strings", k["tKilled"], k["tWeek"], 110, 80)

    # D. Moscow: bells, a held major chord turning hollow; near-silence on "empty"
    S.chord("slow", "Bb", k["tWeek"] - 0.2, k["tEmpty"] - k["tWeek"] + 0.2, 70, top=5)
    S.note("bass", "Bb1", k["tWeek"] - 0.2, k["tEmpty"] - k["tWeek"], 70)
    for i, (p, v) in enumerate([("D3", 110), ("A2", 100), ("D3", 95)]):
        S.note("bells", p, k["tMoscow"] + i * 1.25, 4, v)
    S.note("slow", "A5", k["tEmpty"] - 0.1, k["tNight"] - k["tEmpty"] + 0.2, 45)

    # E. the fire: low brass swell, choir, timpani roll into "burn"
    tn = k["tNight"]
    S.note("trombone", "D2", tn - 0.3, k["tWaits"] - tn + 0.3, 80); S.note("tuba", "D1", tn - 0.3, k["tWaits"] - tn + 0.3, 85)
    S.note("trombone", "Eb2", tn + 0.5, k["tWaits"] - tn - 0.5, 70)
    S.cc("trombone", tn - 0.3, k["tBurn"], 40, 125); S.cc("tuba", tn - 0.3, k["tBurn"], 40, 125)
    S.chord("choir", "Dm", tn, k["tWaits"] - tn + 0.5, 85, top=5)
    S.cc("choir", tn, k["tBurn"] + 0.5, 50, 120)
    S.roll("timp", "D2", k["tBurn"] - 1.2, k["tBurn"] - 0.02, 40, 118, rate=16)
    S.note("timp", "D2", k["tBurn"], 2, 127); S.note("drums", 57, k["tBurn"], 3, 110)

    # F. waiting + the order to retreat: pizzicato clock, lament, slow muffled march
    tw = q(k["tWaits"])
    t = tw
    while t < k["tRetreat2"] - 0.3:
        S.note("pizz", "D3" if int(round((t - tw) / beat)) % 2 == 0 else "A2", t, 0.3, 85)
        t += beat
    lament = [("A4", 2), ("G4", 1), ("F4", 1), ("E4", 2), ("D4", 2), ("F4", 1), ("E4", 1), ("D4", 1), ("C#4", 1), ("D4", 4)]
    tt = tw
    for p, d in lament:
        if tt > k["tWinter"] - 0.6:
            break
        S.note("cello", m(p) - 12, tt, d * beat * 0.98, 95)
        tt += d * beat
    for i, c in enumerate(["Dm", "Gm", "A", "Dm", "Bb", "A"]):
        t = tw + i * 4 * beat * 0.5
        if t > k["tWinter"] - 0.6:
            break
        S.chord("slow", c, t, 2 * beat, 65, top=4)
    t = q(k["tRetreat2"])
    while t < k["tWinter"] - 0.4:
        S.note("drums", 37, t, 0.1, 75); S.note("timp", "D2", t, 0.5, 70)
        t += 2 * beat
    S.chord("horn", "Dm", k["tRetreat2"], 2.2, 80, top=3)

    # G. winter: cold and sparse; celesta, oohs, low drone; a tense ostinato under the Cossack raids
    tw = k["tWinter"] - 0.2
    S.note("bass", "D1", tw, dur - tw, 70); S.cc("bass", tw, tw + 2, 30, 90)
    S.chord("oohs", "Dm9", tw, k["tBerezina"] - tw, 70, top=5)
    cel = ["A5", "D6", "F5", "E6", "A5", "C6", "D6", "F5", "A5", "E5"]
    for i, p in enumerate(cel):
        t = tw + 0.4 + i * 0.75
        if t > k["tCossacks"] - 0.3:
            break
        S.note("celesta", p, t, 1.2, 60)
    t = k["tCossacks"] - 0.4
    while t < k["tBerezina"] - 0.2:
        S.note("trem", "D3", t, beat / 2, 80); S.note("trem", "D3", t + beat / 2, beat / 2, 70)
        t += beat
    for i in range(6):
        S.note("timp", "A1", k["tCossacks"] - 0.35 + i * 0.22 + 0.45, 0.4, 90)

    # H. the Berezina: rising tension, a stab on "lost"
    tb = k["tBerezina"] - 0.3
    S.note("trem", "D3", tb, k["tOf"] - tb, 80); S.note("trem", "Eb3", tb, k["tOf"] - tb, 70); S.note("trem", "A3", tb, k["tOf"] - tb, 70)
    S.cc("trem", tb, k["tOf"] - 0.2, 60, 125)
    S.roll("timp", "D2", k["tOf"] - 2.2, k["tOf"] - 0.1, 30, 110)
    S.chord("brass", "Dm", k["tOf"] - 0.05, 0.7, 105, top=4)

    # I. finale: grand and sad; full strings, horns, choir; settle on D minor under the closing title
    t = k["tOf"]
    for c, d in [("Dm", 1.6), ("Bb", 1.6), ("Gm", 1.4), ("A", 1.4)]:
        S.chord("strings", c, t, d, 92, top=5); S.chord("choir", c, t, d, 80, top=4)
        S.chord("horn", c, t, d, 85, top=3); S.note("bass", ROOT[c], t, d, 95)
        t += d
    end = k["end"]
    S.chord("strings", "Dm", t, end - t, 95, top=5); S.chord("choir", "Dm", t, end - t, 78, top=4); S.note("bass", "D1", t, end - t, 95)
    S.cc("strings", t + 1.5, end, 110, 30); S.cc("choir", t + 1.5, end, 110, 20)
    S.note("timp", "D2", k["tBack"] + 0.6, 2.5, 115); S.note("drums", 57, k["tBack"] + 0.6, 3, 100)
    return S


SCORES = {"napoleon1812": napoleon1812}


def render(spec, dur):
    S = SCORES[spec["score"]](spec["marks"], dur)
    with tempfile.TemporaryDirectory() as d:
        mid, wav = os.path.join(d, "s.mid"), os.path.join(d, "s.wav")
        S.write(mid)
        subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.7", "-r", str(SR), "-F", wav, SF2, mid], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        x, sr = sf.read(wav, always_2d=True)
    assert sr == SR
    x = x[:, :2] if x.shape[1] >= 2 else np.repeat(x, 2, 1)
    out = np.zeros((int(dur * SR), 2))
    out[: min(len(out), len(x))] = x[: len(out)]
    return out / (np.abs(out).max() + 1e-9)
