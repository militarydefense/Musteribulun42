"""Synthesize the music bed and sound effects and mix them under the voiceover.

Usage: python3 -I mix.py <episode build dir>
Reads voice.wav, timings.json and events.json (written by render.js), writes mix.wav (stereo, 48 kHz).
Music: a dark D-minor pulse that ducks under the voice and drops out for "silence" cues.
"""
import json
import subprocess
import sys
import wave

import numpy as np

build = sys.argv[1]
SR = 48000
T = json.load(open(f"{build}/timings.json"))
EV = json.load(open(f"{build}/events.json"))
total = T["duration"] + .4
N = int(total * SR)
rng = np.random.default_rng(42)
t_all = np.arange(N) / SR


def load_voice():
    with wave.open(f"{build}/voice.wav") as f:
        sr = f.getframerate(); x = np.frombuffer(f.readframes(f.getnframes()), np.int16) / 32768
    idx = np.arange(int(len(x) * SR / sr)) * sr / SR
    v = np.interp(idx, np.arange(len(x)), x)
    out = np.zeros(N); out[:min(N, len(v))] = v[:N]
    return out


def smooth(x, k):
    k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, mode="same")


def hp(x, k=8):  # crude high-pass
    return x - smooth(x, k)


def env(n, a, r, curve=1.0):
    e = np.ones(n); a = min(int(a * SR), n); r = min(int(r * SR), n - a)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r) ** curve
    return e


def noise(n): return rng.normal(0, 1, n)
def tt(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440 * 2 ** ((m - 69) / 12)


# ---------------- sound effects ----------------
def whoosh(d=.5):
    t = tt(d); x = noise(len(t))
    dark, bright = smooth(x, 24), hp(smooth(x, 3), 10)
    k = np.sin(np.pi * t / d)
    return (dark * (1 - k) * 2.5 + bright * k * 1.2) * k ** 2


def hit(d=1.4):
    t = tt(d)
    f = 38 + 90 * np.exp(-t * 18)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    x[:int(.03 * SR)] += noise(int(.03 * SR)) * np.linspace(1, 0, int(.03 * SR)) * .8
    return np.tanh(x * 2.2) * .9


def boom():
    x = hit(2.6)
    tail = noise(len(x)) * np.exp(-tt(2.6) * 2.2) * .12
    return x + smooth(tail, 20)


def tick():
    t = tt(.03); return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 260)


def stamp():
    t = tt(.35)
    body = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 18)
    slap = hp(noise(len(t)), 4) * np.exp(-t * 60)
    return np.tanh((body * 1.2 + slap * .7) * 1.5)


def cash_drop():
    t = tt(1.1)
    bell = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((1760, .5), (2637, .35), (3520, .2))) * np.exp(-t * 5)
    drawer = smooth(noise(len(t)), 6) * np.exp(-t * 14) * .6
    coins = np.zeros(len(t))
    for k in range(6):
        s = int((.08 + k * .07 + rng.uniform(0, .03)) * SR); m = int(.05 * SR)
        coins[s:s + m] += np.sin(2 * np.pi * rng.uniform(3000, 5000) * tt(.05)) * np.exp(-tt(.05) * 90) * .4
    return (bell + drawer + coins) * .8


def count_roll(d=.9):
    x = np.zeros(int(d * SR)); t = 0.0; gap = .09
    while t < d - .03:
        s = int(t * SR); c = tick(); x[s:s + len(c)] += c[:len(x) - s] * .8
        t += gap; gap = max(.028, gap * .86)
    return x


def scratch():
    t = tt(.35); return hp(noise(len(t)), 3) * env(len(t), .02, .1) * (0.6 + .4 * np.sin(2 * np.pi * 28 * t)) * .5


def static(d=.6):
    t = tt(d); return hp(noise(len(t)), 2) * env(len(t), .02, .3) * .35


def pin():
    t = tt(.25); return np.sin(2 * np.pi * 820 * t) * np.exp(-t * 40) + np.sin(2 * np.pi * 1640 * t) * np.exp(-t * 60) * .3


def beep():
    t = tt(.32); b = np.sin(2 * np.pi * 1450 * t) * .5
    b[int(.11 * SR):int(.17 * SR)] = 0
    return b * env(len(t), .005, .02)


def riser(d=1.6):
    t = tt(d); k = t / d
    tone = np.sin(2 * np.pi * np.cumsum(120 + 1100 * k ** 2) / SR) * k ** 2 * .35
    air = smooth(noise(len(t)), 3) * k ** 3 * .5
    return tone + air


def typekey():
    t = tt(.06); return (np.sin(2 * np.pi * 1900 * t) * .4 + hp(noise(len(t)), 3) * .6) * np.exp(-t * 120)


def thud():
    t = tt(.6); return np.tanh(np.sin(2 * np.pi * (60 + 40 * np.exp(-t * 30)) * t) * np.exp(-t * 9) * 2) + smooth(noise(len(t)), 10) * np.exp(-t * 20) * .5


def drawer():
    t = tt(.55); return smooth(noise(len(t)), 25) * env(len(t), .05, .2) * (1 + .5 * np.sin(2 * np.pi * 14 * t)) * 1.5


def drone(d=9.5):
    t = tt(d); lfo = .6 + .4 * np.sin(2 * np.pi * .3 * t)
    x = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .25 * np.sin(2 * np.pi * 110.3 * t)) * lfo
    return x * env(len(t), 1.2, 2.5) * .35


SYN = {"whoosh": whoosh, "hit": hit, "boom": boom, "tick": tick, "stamp": stamp, "cash_drop": cash_drop, "count": count_roll,
       "scratch": scratch, "static": static, "pin": pin, "beep": beep, "riser": riser, "riser_short": lambda: riser(1.2),
       "type": typekey, "thud": thud, "drawer": drawer, "drone": drone, "swoosh_up": lambda: riser(.5) * 1.2}

# recorded CC0 foley (engine/sfx/<name>_<n>.wav): a random take, slightly re-pitched, every time it is used
import glob, os
LIB = {}
for f in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx", "*.wav")):
    LIB.setdefault(os.path.basename(f).rsplit("_", 1)[0], []).append(f)
last_take = {}


def from_lib(name):
    takes = sorted(LIB[name])
    k = int(rng.integers(len(takes)))
    if len(takes) > 1 and k == last_take.get(name):  # never the same take twice in a row
        k = (k + 1) % len(takes)
    last_take[name] = k
    with wave.open(takes[k]) as f:
        x = np.frombuffer(f.readframes(f.getnframes()), np.int16) / 32768
        sr = f.getframerate()
    rate = sr / SR * rng.uniform(.92, 1.08)
    return np.interp(np.arange(0, len(x), rate), np.arange(len(x)), x) / (np.abs(x).max() + 1e-9) * .8


def soft_whoosh():  # quieter, randomized length and colour so cuts never sound identical
    d = rng.uniform(.3, .55); t = tt(d); x = noise(len(t))
    dark, bright = smooth(x, int(rng.integers(14, 34))), hp(smooth(x, 3), 10)
    k = np.sin(np.pi * t / d)
    return (dark * (1 - k) * 2 + bright * k * rng.uniform(.4, 1.0)) * k ** 2 * .6


SYN["whoosh"] = soft_whoosh
sfx = np.zeros(N)
mutes = []
for e in EV:
    if e["name"] == "silence":
        mutes.append((e["t"], e["t"] + e["gain"])); continue
    x = (from_lib(e["name"]) if e["name"] in LIB else SYN[e["name"]]()) * e["gain"]
    s = int(e["t"] * SR)
    if s < 0: x = x[-s:]; s = 0
    m = min(len(x), N - s)
    if m > 0: sfx[s:s + m] += x[:m]

# ---------------- music ----------------
BPM = 84; beat = 60 / BPM; bar = beat * 4
prog_ = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]  # Dm Bb Gm A
music = np.zeros(N)
for i in range(int(total / bar) + 1):
    s = int(i * bar * SR); n = min(int(bar * SR), N - s)
    if n <= 0: break
    t = np.arange(n) / SR
    ch = prog_[i % 4]
    pad = sum(np.sin(2 * np.pi * midi(m) * t + .3 * np.sin(2 * np.pi * .5 * t)) + .5 * np.sin(2 * np.pi * midi(m) * 1.005 * t) for m in ch)
    music[s:s + n] += pad * env(n, .6, .7) * .05
    # sub bass on beats 1 and 3
    for b in (0, 2):
        bs = int(b * beat * SR); bn = min(int(beat * 1.6 * SR), n - bs)
        if bn > 0:
            bt = np.arange(bn) / SR
            music[s + bs:s + bs + bn] += np.sin(2 * np.pi * midi(ch[0] - 24) * bt) * np.exp(-bt * 2.2) * .32
    # pluck arpeggio on 8ths
    for k in range(8):
        ps = int(k * beat / 2 * SR); pn = min(int(.35 * SR), n - ps)
        if pn > 0:
            pt = np.arange(pn) / SR; note = ch[k % 3] + 12 + (12 if k in (3, 7) else 0)
            music[s + ps:s + ps + pn] += np.sin(2 * np.pi * midi(note) * pt) * np.exp(-pt * 9) * .045
for k in range(int(total / (beat / 2))):  # hats + soft kick
    s = int(k * beat / 2 * SR)
    m = min(int(.04 * SR), N - s)
    if m > 0: music[s:s + m] += hp(noise(m), 2) * np.exp(-np.arange(m) / SR * 120) * (.05 if k % 2 else .025)
    if k % 4 == 0:
        m = min(int(.25 * SR), N - s); kt = np.arange(m) / SR
        music[s:s + m] += np.sin(2 * np.pi * (48 + 70 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 10) * .3
music /= np.abs(music).max() + 1e-9
# a recorded bed (assets/music.mp3 next to the build dir, or engine/music/bed.mp3) replaces the synth
for bed in (os.path.join(build, "..", "assets", "music.mp3"), os.path.join(os.path.dirname(os.path.abspath(__file__)), "music", "bed.mp3")):
    if os.path.exists(bed):
        raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", bed, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                             capture_output=True, check=True).stdout
        b = np.frombuffer(raw, np.int16) / 32768
        b = np.tile(b, N // len(b) + 1)[:N]
        music = b / (np.abs(b).max() + 1e-9) * .7  # a full mix sits louder than the synth bed
        print("music bed:", os.path.normpath(bed))
        break

# music comes in after the hook's first line and drops out for silences
gain = np.ones(N)
gain *= np.clip((t_all - 1.2) / 1.5, .25, 1)
for a, b in mutes:
    sa, sb = int(a * SR), int(b * SR)
    gain[sa:sb] = 0
    r = int(.4 * SR); gain[sb:sb + r] *= np.linspace(0, 1, min(r, N - sb))
voice = load_voice()
venv = smooth(np.abs(voice), int(.12 * SR))
duck = 1 - .55 * np.clip(venv / (np.percentile(venv, 90) + 1e-9), 0, 1)
duck = smooth(duck, int(.08 * SR))
mix = voice * 1.0 + music * gain * duck * .22 + sfx * .28
mix = np.tanh(mix * 1.1) * .95
st = np.stack([mix, mix], 1)
with wave.open(f"{build}/mix.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix", round(total, 2), "s,", len(EV), "cues")
