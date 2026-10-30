"""Sound for pomegranate.html, built from the same recorded knife chops as audio.py.
Every knife stroke: the blade-through-the-fruit part of a recorded chop (no board knock, the fruit is in the air) with a
short crisp click on top. Every landing: a deep thump (the low part of a board knock) and a burst of crunchy clicks that
dies away while the pieces and seeds scatter. Quiet between rounds, like the reference.
`OUTDIR=out_pom python3 -I pom_audio.py`  →  <OUTDIR>/audio.wav"""
import json
import os
from pathlib import Path

import numpy as np

from audio import SR, PRE, bank, write

HERE = Path(__file__).parent
OUT = HERE / os.environ.get("OUTDIR", "out_pom")
rng = np.random.default_rng(31)


def band(x, lo, hi):
    spec = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.where((f >= lo) & (f <= hi), spec, 0), len(x))


def fade(c, i=.004, o=.02):
    c = c.copy(); a = min(len(c), int(i * SR)); b = min(len(c), int(o * SR))
    c[:a] *= np.linspace(0, 1, a); c[len(c) - b:] *= np.linspace(1, 0, b); return c


def add(mix, s, c, g):
    if s < 0 or s >= len(mix):
        return
    e = min(len(mix), s + len(c)); mix[s:e] += c[: e - s] * g


def build():
    tl = json.loads((OUT / "timeline.json").read_text())
    N = int((tl["duration"] + .3) * SR)
    mix = np.zeros(N)
    (slow, fast), _ = bank()
    k = int(PRE * SR)
    swish = [band(x[:k], 900, 9000) for x in slow + fast]                 # blade through the fruit, before the knock
    clicks = [band(x[k - int(.004 * SR): k + int(.03 * SR)], 1500, 9000) for x in fast]
    thumps = [band(x[k - int(.01 * SR): k + int(.25 * SR)], 40, 320) for x in fast]
    cuts = np.array(tl["cuts"]); gaps = np.append(np.diff(cuts), 1.0); prev = np.insert(np.diff(cuts), 0, 1.0)
    for i, t in enumerate(cuts):
        rate = 1 / max(min(prev[i], gaps[i]), 1e-3)
        g = min(1.0, 5.0 / rate) ** .5
        ln = int(min(.14, max(.03, prev[i] * .8)) * SR)
        s = swish[rng.integers(len(swish))]; s = fade(s[-ln:], .01, .01)
        add(mix, int(t * SR) - len(s), s, 3.0 * g)
        c = clicks[rng.integers(len(clicks))]
        add(mix, int(t * SR), fade(c), 1.6 * g)
    for imp in tl["impacts"]:
        t, n = imp["t"], imp["n"]
        th = thumps[rng.integers(len(thumps))]
        add(mix, int(t * SR), fade(th / (np.abs(th).max() + 1e-9), .002, .08), .9)
        m = int(6 + 22 * np.log2(n + 1))                                   # crunch of the pieces, dying away
        for j in range(m):
            dt = rng.exponential(.12 if n < 10 else .22)
            c = clicks[rng.integers(len(clicks))]
            pitch = rng.uniform(.9, 1.3); c = np.interp(np.arange(0, len(c) - 1, pitch), np.arange(len(c)), c)
            add(mix, int((t + dt) * SR), fade(c), .45 * np.exp(-dt / .45) * rng.uniform(.4, 1))
    room = np.cumsum(rng.standard_normal(N)); room -= np.convolve(room, np.ones(4800) / 4800, "same")
    mix += room / np.abs(room).max() * .004
    mix /= np.abs(mix).max() + 1e-9
    write(OUT / "audio.wav", mix * .9, ch=2)
    print("audio", round(N / SR, 2), "s,", len(cuts), "strokes,", len(tl["impacts"]), "impacts")


if __name__ == "__main__":
    build()
