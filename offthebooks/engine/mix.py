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
    return tone  # tone only: a noise sweep on top sounds like a whoosh


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


# ---- 23 Oct: more specific sounds (each on-screen element gets its own) ----
def _put(x, s, y):  # add y into x at sample s, clipped to x
    m = min(len(y), len(x) - s)
    if m > 0 and s >= 0: x[s:s + m] += y[:m]


def _lib_or(name, fallback):
    return from_lib(name) if name in LIB else fallback()


def knock3(d=None):  # knock-knock-knock on a door, recorded takes
    x = np.zeros(int(.8 * SR))
    for k, (o, g) in enumerate(((0, 1), (.19, .85), (.36, .95))):
        h = _lib_or("knock", thud) * g; s = int(o * SR); _put(x, s, (h))
    return x


def keyboard(d=1.6):  # office keyboard typing: uneven bursts of key clicks, the odd spacebar
    x = np.zeros(int(d * SR)); t = rng.uniform(0, .05)
    while t < d - .06:
        s = int(t * SR); kt = tt(.035)
        key = (hp(noise(len(kt)), 2) * .6 + np.sin(2 * np.pi * rng.uniform(1700, 2600) * kt) * .25) * np.exp(-kt * rng.uniform(140, 220))
        if rng.random() < .12: key = key * .6 + np.sin(2 * np.pi * 180 * kt) * np.exp(-kt * 60) * .5  # spacebar
        _put(x, s, key * rng.uniform(.45, 1))
        t += rng.uniform(.06, .14) if rng.random() > .15 else rng.uniform(.22, .4)
    return x * 1.3


def ring(d=1.9):  # mobile phone ringtone: two trilling bursts
    t = tt(d); x = np.zeros(len(t))
    for o in (0, 1.0):
        m = (t >= o) & (t < o + .75)
        tr = .5 + .5 * np.sign(np.sin(2 * np.pi * 18 * (t - o)))
        x[m] += ((np.sin(2 * np.pi * 1320 * t) + .6 * np.sin(2 * np.pi * 1760 * t)) * tr)[m] * .32
    return x * env(len(t), .005, .05)


def buzz(d=.75):  # phone vibrating on a desk / in a pocket
    t = tt(d); am = (np.sin(2 * np.pi * 28 * t) > -.2).astype(float)
    x = (np.sin(2 * np.pi * 155 * t) + .4 * np.sin(2 * np.pi * 310 * t)) * am
    gate = ((t % .38) < .28).astype(float)
    return smooth(x * gate, 8) * env(len(t), .01, .05) * .7


def rec_beep(d=None):  # voice recorder "start" beep: two rising tones
    out = []
    for f in (880, 1320):
        t = tt(.11); out.append(np.sin(2 * np.pi * f * t) * env(len(t), .004, .03) * .45); out.append(np.zeros(int(.03 * SR)))
    return np.concatenate(out)


def crickets(d=6.0):  # night ambience: a few crickets chirping at different rates
    t = tt(d); x = np.zeros(len(t))
    for c in range(3):
        f, rate, ph = rng.uniform(4300, 5200), rng.uniform(.55, .9), rng.uniform(0, 1)
        for start in np.arange(ph * rate, d, rate):
            for p in range(int(rng.integers(3, 5))):
                s = int((start + p * .034) * SR); pt = tt(.022)
                _put(x, s, (np.sin(2 * np.pi * f * pt) * np.sin(np.pi * pt / .022)) * rng.uniform(.5, 1) * .4)
    return x * env(len(t), .6, .8)


def fill(d=1.1):  # digital bar filling up: stepping blips that climb, then a confirm chime
    x = np.zeros(int((d + .3) * SR)); n = max(6, int(d / .045))
    for i in range(n):
        f = 500 * 2 ** (i / n * 1.6); bt = tt(.03); s = int(i * d / n * SR)
        b = np.sign(np.sin(2 * np.pi * f * bt)) * np.exp(-bt * 90) * .22
        _put(x, s, (b))
    ct = tt(.28); s = int(d * SR)
    ch = (np.sin(2 * np.pi * 1760 * ct) + .5 * np.sin(2 * np.pi * 2640 * ct)) * np.exp(-ct * 14) * .3
    _put(x, s, (ch))
    return smooth(x, 2)


def typewriter(d=1.0):  # typewriter keys, ends with the carriage bell
    x = np.zeros(int((d + .5) * SR)); t = 0.0
    while t < d:
        s = int(t * SR); kt = tt(.05)
        k = hp(noise(len(kt)), 2) * np.exp(-kt * 160) * .7 + np.sin(2 * np.pi * 130 * kt) * np.exp(-kt * 70) * .5
        _put(x, s, k * rng.uniform(.6, 1))
        t += rng.uniform(.07, .12)
    bt = tt(.45); s = int(d * SR)
    bell = (np.sin(2 * np.pi * 2350 * bt) + .4 * np.sin(2 * np.pi * 4700 * bt)) * np.exp(-bt * 9) * .28
    _put(x, s, (bell))
    return x


SYN.update({"knock3": knock3, "keyboard": keyboard, "ring": ring, "buzz": buzz, "rec_beep": rec_beep,
            "crickets": crickets, "fill": fill, "typewriter": typewriter})
sfx = np.zeros(N)
mutes = []
for e in EV:
    if e["name"] == "silence":
        mutes.append((e["t"], e["t"] + e["gain"])); continue
    if e["name"] in LIB: x = from_lib(e["name"])
    else: x = SYN[e["name"]](e["d"]) if "d" in e else SYN[e["name"]]()
    x = x * e["gain"]
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
gain *= np.clip(.7 + t_all / 3, .7, 1)  # music is there from the first frame
for a, b in mutes:
    sa, sb = int(a * SR), int(b * SR)
    gain[sa:sb] = 0
    r = int(.4 * SR); gain[sb:sb + r] *= np.linspace(0, 1, min(r, N - sb))
DUCK = float(os.environ.get('DUCK', .25))
voice = load_voice()
venv = smooth(np.abs(voice), int(.12 * SR))
duck = 1 - DUCK * np.clip(venv / (np.percentile(venv, 90) + 1e-9), 0, 1)


def level(x):  # mean short-term rms (dB) of the active parts
    r = np.sqrt(np.convolve(x ** 2, np.ones(SR // 10) / (SR // 10), mode="same"))[::SR // 10]
    return 20 * np.log10(np.mean(r[r > 1e-4]) + 1e-9)


# music sits MUSIC_DB below the voice before ducking (about 5 dB below it under speech); 23 Oct: raised from 8 dB
# after measuring both competitors (their background sits ~8-11 dB under the voice, ours was ~17)
MUSIC_DB = float(os.environ.get('MUSIC_DB', 2.5))
music *= 10 ** ((level(voice) - MUSIC_DB - level(music[:len(voice)])) / 20)
duck = smooth(duck, int(.08 * SR))
# sound effects: louder, and the music dips under them (about 6 dB) and comes back when they end
SFX_GAIN = float(os.environ.get('SFX_GAIN', .42))
senv = smooth(np.abs(sfx), int(.03 * SR))
sduck_raw = np.clip(senv / (np.percentile(senv[senv > 1e-4], 90) if (senv > 1e-4).any() else 1), 0, 1)
# fast attack, slow release (~350 ms) so the music does not pump
rel = np.exp(-1 / (.35 * SR)); hold = np.empty_like(sduck_raw); acc = 0.0
for i, v in enumerate(sduck_raw[::32]):
    acc = v if v > acc else acc * rel ** 32
    hold[i * 32:(i + 1) * 32] = acc
sduck = 1 - .5 * hold[:N]
mix = voice * 1.0 + music * gain * duck * sduck + sfx * SFX_GAIN
mix = np.tanh(mix * 1.1) * .95
st = np.stack([mix, mix], 1)
with wave.open(f"{build}/mix.wav", "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix", round(total, 2), "s,", len(EV), "cues")
