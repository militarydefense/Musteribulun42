"""Synthesize background music + sound effects and mix them under the voiceover."""
import json, sys, wave
import numpy as np

build = sys.argv[1]
SR = 44100
T = json.load(open(f"{build}/timings.json"))
OUTRO = T.get("outro", 3.4)
total = T["duration"] + OUTRO
N = int(total * SR)
rng = np.random.default_rng(7)

def load_voice():
    with wave.open(f"{build}/voice.wav") as f:
        sr = f.getframerate(); x = np.frombuffer(f.readframes(f.getnframes()), np.int16) / 32768
    idx = np.arange(int(len(x) * SR / sr)) * sr / SR
    return np.interp(idx, np.arange(len(x)), x)

def env(n, a, r):
    e = np.ones(n); a = min(int(a * SR), n); r = min(int(r * SR), n - a)
    e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e

def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")

# ---- music: Am F C G pad + soft beat, 96 bpm ----
t = np.arange(N) / SR
beat = 60 / 96
chords = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
music = np.zeros(N)
bar = beat * 4
for i in range(int(total / bar) + 1):
    s = int(i * bar * SR); n = min(int(bar * SR), N - s)
    if n <= 0: break
    tt = np.arange(n) / SR
    for m in chords[i % 4]:
        f = 440 * 2 ** ((m - 69) / 12)
        music[s:s + n] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt + .5)) * env(n, .4, .5) * .09
    fb = 440 * 2 ** ((chords[i % 4][0] - 12 - 69) / 12)
    music[s:s + n] += np.sin(2 * np.pi * fb * tt) * env(n, .05, .3) * .12
for k in range(int(total / beat)):
    s = int(k * beat * SR)
    n = min(int(.25 * SR), N - s)
    tt = np.arange(n) / SR
    music[s:s + n] += np.sin(2 * np.pi * (50 + 80 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * .35
    h = int((k + .5) * beat * SR); m = min(int(.05 * SR), N - h)
    if m > 0: music[h:h + m] += rng.normal(0, 1, m) * np.exp(-np.arange(m) / SR * 80) * .04
music = music / np.abs(music).max()

# ---- SFX ----
sfx = np.zeros(N)
def put(x, at, gain):
    s = int(at * SR); e = min(s + len(x), N)
    if s < N: sfx[s:e] += x[:e - s] * gain
def whoosh(d=.45):
    n = int(d * SR); x = lowpass(rng.normal(0, 1, n), 12); return x * np.sin(np.linspace(0, np.pi, n)) ** 2
def kaching():
    n = int(.9 * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt) for f in (2093, 2637, 3136)) * np.exp(-tt * 6)
    x[: int(.06 * SR)] += rng.normal(0, 1, int(.06 * SR)) * .8
    return x / 3
def ding(f=1318):
    n = int(.8 * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * f * tt) + .4 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 5)
def zap():
    n = int(.6 * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 70 * tt)) * rng.normal(0, 1, n) * np.exp(-tt * 4) * (np.sin(2 * np.pi * 18 * tt) > 0)
def thud():
    n = int(.5 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * (45 + 120 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 9)
def click():
    n = int(.06 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 70)
def riser(d):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(200 + 900 * (tt / d) ** 2) / SR) * (tt / d) * .5 + lowpass(rng.normal(0, 1, n), 6) * (tt / d) * .4

L = {}
for l in T["lines"]: L.setdefault(l["scene"], []).append(l["start"])
s0 = {k: (0 if k == 1 else v[0] - .15) for k, v in L.items()}
def word(w, after=0):
    for l in T["lines"]:
        for x in l["words"]:
            if x["s"] >= after and "".join(c for c in x["w"].lower() if c.isalnum() or c == "$") == w:
                return x["s"]
    return total + 1
put(whoosh(.35), 0, .5); put(thud(), .4, 1.0)
for k in range(2, 8): put(whoosh(), s0[k] - .2, .3)
for i in range(8): put(click(), word("1985") - .4 + i * .17, .35)
put(ding(1568), word("1985") + .8, .4); put(thud(), word("purpose"), .8)
put(zap(), word("losing"), .2); put(thud(), word("raise"), .6); put(thud(), word("kill"), .9)
put(click(), word("product"), .6); put(ding(1760), word("you", L[3][0]), .5)
put(kaching(), word("store"), .4); put(whoosh(.4), word("renewing"), .4)
put(riser(.8), word("memberships"), .3); put(kaching(), word("most"), .5)
put(thud(), word("loss"), .9)
put(ding(1318), s0[7] + .05, .4); put(whoosh(.4), total - .55, .45)
sfx = sfx / max(np.abs(sfx).max(), 1e-6)

# ---- mix with ducking ----
voice = np.zeros(N); v = load_voice(); voice[:len(v)] = v[:N]
venv = lowpass(np.abs(voice), int(.15 * SR))
duck = 1 - .55 * np.clip(venv / (venv.max() * .25), 0, 1)
out = voice * 1.0 + music * .16 * duck + sfx * .30
out *= env(N, .02, .25)
out = out / np.abs(out).max() * .93
with wave.open(f"{build}/mix.wav", "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((out * 32767).astype(np.int16).tobytes())
print("mix seconds", round(total, 2))
