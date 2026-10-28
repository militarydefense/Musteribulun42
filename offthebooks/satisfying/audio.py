"""Synthesised ASMR track for scene.html: one knife chop per cut, a soft set-down thud when a fresh bar starts,
a chime when the last round finishes. Reads out/timeline.json, writes out/audio.wav.
Chops are not looped samples: each has its own random pitch/length so fast runs sound like real rapid chopping."""
import json
import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).parent / "out"
tl = json.loads((OUT / "timeline.json").read_text())
N = int((tl["duration"] + 0.5) * SR)
mix = np.zeros(N, np.float64)
rng = np.random.default_rng(11)


def add(sig, t, gain=1.0):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    mix[i:j] += sig[: j - i] * gain


def noise_burst(ms, lo, hi, decay):
    n = int(ms / 1000 * SR)
    x = rng.standard_normal(n)
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(spec, n)
    env = np.exp(-np.arange(n) / (decay / 1000 * SR))
    return x / (np.abs(x).max() + 1e-9) * env


def thock(f0, f1, ms, decay):
    n = int(ms / 1000 * SR)
    t = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / (decay / 1000))


def layer(*parts):
    out = np.zeros(max(len(x) for x in parts))
    for x in parts:
        out[:len(x)] += x
    return out


def chop():
    p = rng.uniform(.9, 1.12)
    return layer(noise_burst(10, 3500, 9000, 2.5) * .55,     # steel edge touching the soap
                 noise_burst(45 * p, 1200, 4200, 14) * .45,  # blade sliding through soap
                 thock(190 * p, 120 * p, 90, 26) * .9,       # edge hitting the wooden board
                 thock(95 * p, 80 * p, 120, 40) * .35)


cuts = np.array(tl["cuts"])
gaps = np.diff(np.concatenate([[cuts[0] - 1], cuts]))
for t, g in zip(cuts, gaps):
    rate = 1 / max(g, 1e-3)
    gain = min(1.0, 5.0 / rate) ** .55                      # dense runs blend into a texture instead of clipping
    add(chop(), t + rng.uniform(-.004, .004), gain)

for r in tl["rounds"]:                                       # a fresh bar is set down
    add(layer(thock(78, 62, 220, 70) * .8, noise_burst(30, 400, 2000, 8) * .25), r["t0"] + .04)

last = tl["cuts"][-1]                                        # done: a small bright chime
t = np.arange(int(1.6 * SR)) / SR
chime = (np.sin(2 * np.pi * 1318.5 * t) + .6 * np.sin(2 * np.pi * 1975.5 * t) + .3 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t / .45)
add(chime * .25, last + .12)

mix /= np.abs(mix).max() + 1e-9
mix *= .89
st = np.repeat((mix * 32767).astype(np.int16)[:, None], 2, axis=1)
with wave.open(str(OUT / "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print("audio", round(N / SR, 2), "s,", len(cuts), "chops")
