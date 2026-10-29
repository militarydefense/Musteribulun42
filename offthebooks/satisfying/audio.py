"""Sound for scene.html, built from recorded chops instead of synthesis.
1. `python3 -I audio.py extract <clip.wav>`  finds every chop (onset) in a recording of a knife cutting soap on a board
   and saves each one to assets/chops/chop_NN.wav.
2. `python3 -I audio.py`  places one chop exactly at every cut time from out/timeline.json (the knife touches the
   board then), picks a different recording each time with a small pitch change, shortens chops when cuts come fast
   so they do not smear, adds a quiet kitchen room tone and one soft chime when the last round is done.
Falls back to layered recorded foley (wood knock + paper slide from engine/sfx) if no chops were extracted."""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
HERE = Path(__file__).parent
import os
OUT, CHOPS = HERE / os.environ.get("OUTDIR", "out"), HERE / "assets" / "chops"
rng = np.random.default_rng(23)


def read(path):
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
        sr = w.getframerate()
    if sr != SR:
        x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x


def write(path, x, ch=1):
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype(np.int16)
    if ch == 2:
        data = np.repeat(data[:, None], 2, axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


PRE = .25                                                   # every sample: 250 ms of blade-through-soap, then the board knock


def extract(src):
    """Find the board knocks (low-frequency transients) and keep PRE seconds before each one plus its ring-out."""
    x = read(src)
    spec = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    low = np.fft.irfft(np.where(f < 450, spec, 0), len(x))
    hop = SR // 400
    env = np.sqrt(np.convolve(low ** 2, np.ones(hop) / hop, "same"))[::hop]
    thr = env.max() * .22
    knocks, i = [], 0
    while i < len(env):
        if env[i] > thr:
            j = i + int(.05 * 400); k = i + int(np.argmax(env[i:j]))
            knocks.append(k * hop); i = k + int(.12 * 400)
        else:
            i += 1
    CHOPS.mkdir(parents=True, exist_ok=True)
    for old in CHOPS.glob("chop_*.wav"):
        old.unlink()
    n = 0
    for k in knocks:
        s0 = k - int(PRE * SR); e0 = k + int(.16 * SR)
        if s0 < 0 or e0 > len(x):
            continue
        c = x[s0:e0].copy()
        fi = int(.01 * SR); c[:fi] *= np.linspace(0, 1, fi)
        fo = int(.06 * SR); c[-fo:] *= np.linspace(1, 0, fo)
        write(CHOPS / f"chop_{n:02d}.wav", c / np.abs(c).max() * .9); n += 1
    print("extracted", n, "knocks at", [round(k / SR, 2) for k in knocks])


def bank():
    files = sorted(CHOPS.glob("chop_*.wav"))
    if files:
        xs = [read(f) for f in files]
        k = int(PRE * SR)
        pre = [np.sqrt((x[:int(.2 * SR)] ** 2).mean()) for x in xs]
        slow = [x for x, p in zip(xs, pre) if p >= .05]        # blade audibly sliding through the soap before the knock
        fast = [x for x, p in zip(xs, pre) if p < .05]         # clean hits
        return (slow or fast, fast), f"recorded chops ({len(slow)} slow, {len(fast)} fast)"
    sfx = HERE.parent / "engine" / "sfx"
    knocks = [read(f) for f in sorted(sfx.glob("knock_*.wav"))]
    papers = [read(f) for f in sorted(sfx.glob("paper_*.wav"))]
    out = []
    for i in range(12):
        k = knocks[i % len(knocks)][: int(.16 * SR)]
        p = papers[(i * 5) % len(papers)][: int(.07 * SR)]
        p = p * np.linspace(1, 0, len(p)) ** 2
        c = np.zeros(int(.2 * SR)); d = int(.02 * SR)
        c[: len(p)] += p * .55
        c[d:d + len(k)] += k[: len(c) - d]
        out.append(c / np.abs(c).max() * .9)
    return (out, out), "foley fallback"


def build():
    tl = json.loads((OUT / "timeline.json").read_text())
    N = int((tl["duration"] + .3) * SR)
    mix = np.zeros(N)
    chops, kind = bank()
    cuts = np.array(tl["cuts"])
    nxt = np.append(np.diff(cuts), 1.0)
    prev = np.insert(np.diff(cuts), 0, 1.0)
    for i, t in enumerate(cuts):
        pool = chops[0] if prev[i] >= .3 else chops[1]
        c = pool[rng.integers(len(pool))]
        pitch = rng.uniform(.95, 1.05)
        c = np.interp(np.arange(0, len(c) - 1, pitch), np.arange(len(c)), c)
        knock = int(PRE / pitch * SR)                             # where the board knock sits in this sample
        pre = int(min(PRE, max(.012, prev[i] * .6)) / pitch * SR)    # slow cuts: the whole slide; fast: just the hit
        post = int(min(.16, max(.03, nxt[i] * 1.2)) * SR)
        c = c[max(0, knock - pre): knock + post].copy()
        fi = min(len(c), int(.006 * SR)); c[:fi] *= np.linspace(0, 1, fi)
        fo = min(len(c), int(.02 * SR)); c[-fo:] *= np.linspace(1, 0, fo)
        rate = 1 / max(min(prev[i], nxt[i]), 1e-3)
        gain = min(1.0, 4.0 / rate) ** .5
        s = int(t * SR) - pre
        if s < 0 or s >= N:
            continue
        e = min(N, s + len(c)); mix[s:e] += c[: e - s] * gain
    # quiet room tone so the pauses between rounds are not dead silent
    room = np.cumsum(rng.standard_normal(N)); room -= np.convolve(room, np.ones(4800) / 4800, "same")
    mix += room / np.abs(room).max() * .012
    t = np.arange(int(1.6 * SR)) / SR
    chime = (np.sin(2 * np.pi * 1318.5 * t) + .5 * np.sin(2 * np.pi * 1975.5 * t)) * np.exp(-t / .5)
    s = int((cuts[-1] + .15) * SR); mix[s:s + len(chime)] += chime[: N - s] * .18
    mix /= np.abs(mix).max() + 1e-9
    write(OUT / "audio.wav", mix * .9, ch=2)
    print("audio", round(N / SR, 2), "s,", len(cuts), "chops from", kind)


if __name__ == "__main__":
    extract(sys.argv[2]) if sys.argv[1:2] == ["extract"] else build()
