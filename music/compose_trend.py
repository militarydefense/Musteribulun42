#!/usr/bin/env python3
"""Original dark, bass-heavy club/phonk-style groove for zoomtosecrets (100 BPM, Bb minor).
Synthesised from scratch (no samples). Structure for a Short:
  0 .. START        : eerie intro (sub drones + reverse swell) under the hook
  START .. DROP     : main groove (808 glides, kick, clap, hats, pluck hook)
  DROP .. end       : drop: full groove + extra lead layer and wider 808
usage: START=3.0 DROP=22.2 compose_trend.py out.wav total_seconds"""
import os, sys, wave
import numpy as np
from scipy.signal import lfilter, butter, sosfilt

SR = 48000
BPM = 100.0; BEAT = 60 / BPM; BAR = 4 * BEAT
START = float(os.environ.get('START', 3.0))
DROP = float(os.environ.get('DROP', START + 8 * BAR))
TOTAL = float(sys.argv[2]) if len(sys.argv) > 2 else 35.0
L = int((TOTAL + 1) * SR)
rng = np.random.default_rng(11)
T = np.arange(L) / SR

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def put(buf, t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig)); buf[i:j] += g * sig[:j - i]
def lpf(x, fc, order=2):
    if np.ndim(fc) == 0:
        return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)
    # time-varying one-pole x2, blockwise
    y = x.astype(float).copy(); fc = np.asarray(fc, float)
    for _ in range(2):
        out = np.empty_like(y); zi = np.zeros(1); B = 480
        for i in range(0, len(y), B):
            a = 1 - np.exp(-2*np.pi*fc[i]/SR)
            out[i:i+B], zi = lfilter([a], [1, -(1-a)], y[i:i+B], zi=zi)
        y = out
    return y
def hpf(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)

# Bb minor: i - VI - III - VII  ->  Bbm  Gb  Db  Ab   (roots, one per bar)
ROOTS = [46, 42, 49, 44]           # Bb2 Gb2 Db3 Ab2 (mid-bass 808)
CH = [[58, 61, 65], [54, 58, 61], [61, 65, 68], [56, 60, 63]]
# original 1-bar pluck motifs (16th grid, None = rest)
HOOK = [
    [70, None, None, 73, None, 70, None, None, 68, None, 65, None, None, None, 68, None],
    [66, None, None, 70, None, 66, None, None, 65, None, 61, None, None, None, 63, None],
    [73, None, None, 77, None, 73, None, None, 72, None, 68, None, None, None, 70, None],
    [72, None, None, 68, None, 70, None, None, 65, None, None, None, 63, None, 65, None],
]

kick = np.zeros(L); clap = np.zeros(L); hats = np.zeros(L); sub = np.zeros(L)
pl = np.zeros(L); pad = np.zeros(L); lead = np.zeros(L); fx = np.zeros(L); stab = np.zeros(L)

def k_s():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 42 + 120 * np.exp(-t * 32); ph = 2*np.pi*np.cumsum(f)/SR
    return np.tanh(2.2 * np.sin(ph) * np.exp(-t * 7)) + 0.3 * np.exp(-t * 400) * rng.standard_normal(n)
def clap_s():
    n = int(0.35 * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    env = np.zeros(n)
    for d in (0, 0.009, 0.018, 0.027): env += (t >= d) * np.exp(-(t - d).clip(0) * (60 if d < 0.027 else 13))
    return hpf(lpf(x * env, 6000), 900) * 0.8
def hat_s(dur=0.04):
    n = int(dur * SR); t = np.arange(n) / SR
    return hpf(rng.standard_normal(n), 7000, 4) * np.exp(-t * (1 / dur) * 4)
def pluck_s(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    x = sum(np.sign(np.sin(2*np.pi*f*(1+d)*t + p)) for d, p in ((0, 0), (0.006, 1.3), (-0.006, 2.1))) / 3
    x = 0.6 * x + 0.4 * np.sin(2*np.pi*2*f*t)
    return lpf(x, 3200) * np.exp(-t * 9)
def e808(n_from, n_to, dur, glide=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f0, f1 = midi(n_from), midi(n_to)
    gl = np.clip((t - (dur - glide)) / max(glide, 1e-3), 0, 1) if glide > 0 else np.zeros(n)
    f = f0 * (f1 / f0) ** (gl * gl * (3 - 2 * gl))
    ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sin(ph) + 0.35 * np.sin(2*ph) + 0.18 * np.sin(3*ph)
    env = np.minimum(1, t * 300) * np.minimum(1, (dur - t) * 60)
    return np.tanh(3.0 * x) * env

K, C = k_s(), clap_s()
# ---------------- intro (hook): sub drone + eerie pad + reverse swell ----------------
n = int(START * SR); t = np.arange(n) / SR
drone = 0.5 * np.sin(2*np.pi*midi(46)*t) * np.minimum(1, t / 0.4)
eerie = sum(np.sin(2*np.pi*midi(m)*t*(1 + 0.003*np.sin(2*np.pi*0.7*t + m))) for m in (70, 73, 77)) / 3
put(sub, 0, drone, 0.8); put(pad, 0, lpf(eerie, 1800) * np.minimum(1, t / 1.0), 0.25)
sw = int(1.2 * SR); ts = np.arange(sw) / SR
put(fx, START - 1.2, lpf(rng.standard_normal(sw), 500 + 6000 * (ts / ts[-1]) ** 2) * (ts / ts[-1]) ** 3, 0.5)
put(kick, 1.15, K, 0.9)                       # hit with the hook title

# ---------------- groove ----------------
nbars = int(np.ceil((TOTAL - START) / BAR)) + 1
for b in range(nbars):
    t0 = START + b * BAR; c = b % 4; drop = t0 >= DROP - 1e-6
    if t0 >= TOTAL: break
    # stop-gap: last beat before the drop is silent except fx
    gap = (DROP - BEAT - 1e-6) <= t0 + 3 * BEAT < DROP and not drop
    # kick: 1, (2&), 3, (4a in odd bars)
    for bt in [0, 1.5, 2] + ([3.5] if b % 2 else []):
        if gap and bt >= 3: continue
        put(kick, t0 + bt * BEAT, K, 1.0)
    for bt in (1, 3):
        if gap and bt == 3: continue
        put(clap, t0 + bt * BEAT, C, 0.9)
    # hats: 8ths with 16th/triplet rolls at bar end
    for s8 in range(8):
        if gap and s8 >= 6: continue
        put(hats, t0 + s8 * BEAT / 2, hat_s(), 0.35 if s8 % 2 == 0 else 0.22)
    if b % 2 == 1 and not gap:
        for r in range(6): put(hats, t0 + 3 * BEAT + r * BEAT / 6, hat_s(0.025), 0.18 + 0.03 * r)
    # 808: root on 1, re-hit on 2&, glide into next root at end of bar
    nxt = ROOTS[(c + 1) % 4]
    put(sub, t0, e808(ROOTS[c], ROOTS[c], 1.5 * BEAT), 0.95)
    if not gap:
        put(sub, t0 + 1.5 * BEAT, e808(ROOTS[c], ROOTS[c] + 12 if b % 2 else ROOTS[c], 1.0 * BEAT, glide=0.12 if b % 2 else 0), 0.85)
        put(sub, t0 + 2.5 * BEAT, e808(ROOTS[c], nxt, 1.5 * BEAT, glide=0.25), 0.9)
    # pluck hook
    for s16, m in enumerate(HOOK[c]):
        if m is None or (gap and s16 >= 12): continue
        put(pl, t0 + s16 * BEAT / 4, pluck_s(m, BEAT * 0.45), 0.32 if not drop else 0.36)
    # offbeat chord stabs (mid range)
    for bt in (0.5, 1.75, 2.5, 3.5):
        if gap and bt >= 3: continue
        n = int(0.16 * SR); tt = np.arange(n) / SR
        stb = sum(2 * ((midi(m) * (1 + d) * tt) % 1) - 1 for m in CH[c] for d in (-0.005, 0.005)) / 6
        put(stab, t0 + bt * BEAT, lpf(stb, 2600) * np.exp(-tt * 18), 0.5)
    # pad (quiet, dark)
    n = int(BAR * SR); tt = np.arange(n) / SR
    pd = sum(np.sin(2*np.pi*midi(m)*tt) + 0.5*np.sin(2*np.pi*midi(m)*1.003*tt) for m in CH[c]) / 6
    put(pad, t0, lpf(pd, 1400) * np.minimum(1, tt / 0.15) * np.minimum(1, (BAR - tt) / 0.2), 0.16)
    # drop: extra octave lead doubling the hook
    if drop:
        for s16, m in enumerate(HOOK[c]):
            if m is None: continue
            put(lead, t0 + s16 * BEAT / 4, pluck_s(m + 12, BEAT * 0.35), 0.20)

# impact on the drop + riser before it
n = int(2.0 * SR); t = np.arange(n) / SR
put(fx, DROP, np.sin(2*np.pi*(30 + 50*np.exp(-t*5))*t) * np.exp(-t*1.8), 1.0)
n = int(2 * BAR * SR); t = np.arange(n) / SR
put(fx, DROP - 2 * BAR, lpf(rng.standard_normal(n), 400 + 7000*(t/t[-1])**2) * (t/t[-1])**2 * 0.6, 0.6)

# ---------------- mix: sidechain 808/pad under kick, bus glue ----------------
side = np.ones(L)
for i in np.nonzero(np.abs(np.diff(np.concatenate([[0], (kick > 0.5).astype(int)]))) > 0)[0][::2]:
    m = min(L - i, int(0.18 * SR)); side[i:i+m] = np.minimum(side[i:i+m], np.linspace(0.45, 1, m))
pre = T < DROP
mix = (kick * 0.80 + clap * 0.60 + hats * 0.45 + hpf(sub, 70) * 0.34 * side + pl * 1.45 + pad * 1.8 * side + stab * 0.9 * side
       + lead * np.where(pre, 0, 1) + fx * 0.6)
mix = lpf(mix, 11000)
mid = sosfilt(butter(2, [300, 1800], 'band', fs=SR, output='sos'), mix)
mix = mix + 0.9 * mid           # +~5 dB presence in the mids
# stereo: hats/pluck/lead slightly wide via short delay
w = (hats * 0.45 + pl * 0.8 + lead + pad * 0.9 * side) * 0.25
dl = int(0.012 * SR)
left = mix + np.concatenate([np.zeros(dl), w[:-dl]]); right = mix - np.concatenate([np.zeros(dl), w[:-dl]]) + 2 * w * 0
st = np.stack([left, right], 1)[: int(TOTAL * SR)]
fo = int(1.0 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st * 1.1); st = st / np.abs(st).max() * 10 ** (-1 / 20)
with wave.open(sys.argv[1], 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1], 'seconds', TOTAL, 'start', START, 'drop', round(DROP, 2), 'bpm', BPM)
