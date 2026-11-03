"""Hard-candy sound: the usual knife track from audio.py, plus a sharp candy crack on every cut.
A crack = a few very short bursts of bright noise (the candy splitting) and a tiny glassy ring, all within ~30 ms of the
cut, so it lands exactly when the knife goes through. Fast cuts get shorter, quieter cracks so they do not smear.
`OUTDIR=out_lolli python3 -I candy_audio.py`  →  <OUTDIR>/audio.wav"""
import json
import os
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import audio  # noqa: E402

SR = audio.SR
OUT = Path(__file__).parent / os.environ.get("OUTDIR", "out")
rng = np.random.default_rng(41)


def band(x, lo, hi):
    spec = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.where((f >= lo) & (f <= hi), spec, 0), len(x))


def crack(short):
    n = int((.03 if short else .07) * SR)
    c = np.zeros(n)
    for _ in range(rng.integers(2, 4) if short else rng.integers(3, 7)):
        t0 = int(rng.uniform(0, .006 if short else .022) * SR)
        ln = int(rng.uniform(.004, .012) * SR)
        if t0 + ln >= n:
            continue
        burst = rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln * rng.uniform(.15, .35)))
        c[t0:t0 + ln] += burst * rng.uniform(.5, 1)
    c = band(c, 1800, 11000)
    t = np.arange(n) / SR
    c += .25 * np.sin(2 * np.pi * rng.uniform(3200, 5200) * t) * np.exp(-t / .012)   # glassy ring
    return c / (np.abs(c).max() + 1e-9)


def build():
    audio.OUT = OUT
    audio.build()                                                    # knife track (written to OUT/audio.wav)
    base = audio.read(OUT / "audio.wav")
    tl = json.loads((OUT / "timeline.json").read_text())
    cuts = np.array(tl["cuts"]); prev = np.insert(np.diff(cuts), 0, 1.0); nxt = np.append(np.diff(cuts), 1.0)
    mix = base * .55
    for i, t in enumerate(cuts):
        rate = 1 / max(min(prev[i], nxt[i]), 1e-3)
        c = crack(rate > 12) * min(1.0, 5.0 / rate) ** .5
        s = int(t * SR) - int(.002 * SR)
        if 0 <= s < len(mix):
            e = min(len(mix), s + len(c)); mix[s:e] += c[: e - s] * .9
    mix /= np.abs(mix).max() + 1e-9
    audio.write(OUT / "audio.wav", mix * .9, ch=2)
    print("candy audio", round(len(mix) / SR, 2), "s,", len(cuts), "cracks")


if __name__ == "__main__":
    build()
