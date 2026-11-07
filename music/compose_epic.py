#!/usr/bin/env python3
"""Original cinematic/epic trailer cue (D minor, 90 BPM): taiko, brass drones, string
ostinato, 'braam' hits. Synthesised from scratch (no samples).
Hook (0..START): match strike, ignition whoosh, ticking clock under the year counter,
flames dying -> silence. Build START..DROP, braam + full drums at DROP.
usage: START=3.0 DROP=15.2 compose_epic.py out.wav total"""
import os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve

SR = 48000; BPM = 90.0; BEAT = 60 / BPM; BAR = 4 * BEAT
START = float(os.environ.get('START', 3.0)); DROP = float(os.environ.get('DROP', 15.2))
TOTAL = float(sys.argv[2]) if len(sys.argv) > 2 else 25.4
L = int((TOTAL + 2) * SR); rng = np.random.default_rng(21); T = np.arange(L) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def put(b, t0, x, g=1.0):
    i = int(t0 * SR)
    if i >= len(b) or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    j = min(len(b), i + len(x)); b[i:j] += g * x[:j - i]
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def lpv(x, fc):
    y = x.copy(); fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    for _ in range(2):
        out = np.empty_like(y); zi = np.zeros(1)
        for i in range(0, len(y), 480):
            a = 1 - np.exp(-2 * np.pi * fc[i] / SR); out[i:i+480], zi = lfilter([a], [1, -(1 - a)], y[i:i+480], zi=zi)
        y = out
    return y
def saw(f, n, ph=0.0): t = np.arange(n) / SR; return 2 * ((f * t + ph) % 1) - 1
def reverb(x, rt=3.0, wet=0.4):
    n = int(rt * SR); t = np.arange(n) / SR
    ir = lp(rng.standard_normal(n) * np.exp(-t * 6.9 / rt), 4500); ir /= np.sqrt((ir ** 2).sum())
    return x + wet * fftconvolve(x, ir)[:len(x)]

# D minor: i - VI - III - VII  (Dm Bb F C), one chord per bar
ROOT = [38, 34, 41, 36]; CH = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]
taiko = np.zeros(L); brass = np.zeros(L); strings = np.zeros(L); fx = np.zeros(L); tick = np.zeros(L); perc = np.zeros(L)

def taiko_s(f0=55, dec=7):
    n = int(0.9 * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * dec); skin = lp(rng.standard_normal(n), 900) * np.exp(-t * 40) * 0.5
    return np.tanh(2.0 * (body + skin))
def brass_s(notes, dur, bright):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in notes:
        for d in (-0.004, 0, 0.004): x += saw(midi(m) * (1 + d), n, rng.random())
    x /= 3 * len(notes)
    env = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    return lp(x, 300 + 1500 * bright) * env
def stac(m, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(saw(midi(m) * (1 + d), n, rng.random()) for d in (-0.003, 0.003)) / 2
    return bp(x, 200, 3000) * np.exp(-t * 28)
def braam(dur=2.6):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in (26, 38, 45, 50):
        for d in (-0.006, 0, 0.006): x += saw(midi(m) * (1 + d), n, rng.random())
    x /= 12; env = np.minimum(1, t / 0.03) * np.exp(-t * 0.9)
    return np.tanh(2.5 * lpv(x, 400 + 2600 * np.exp(-t * 1.5))) * env

# ---------------- hook sound design ----------------
n = int(0.25 * SR); t = np.arange(n) / SR                                   # match strike
put(fx, 0.12, hp(rng.standard_normal(n), 1800) * np.exp(-((t - 0.03) / 0.03) ** 2) * 0.9)
n = int(0.6 * SR); t = np.arange(n) / SR                                    # ignition whoosh
put(fx, 0.22, lpv(rng.standard_normal(n), 300 + 4000 * np.exp(-t * 4)) * np.minimum(1, t / 0.05) * np.exp(-t * 3) * 1.4)
put(taiko, 0.28, taiko_s(48, 4), 1.1)                                       # boom on ignition
for k in range(int((1.85 - 0.45) / 0.09)):                                   # ticking under the counter
    n = int(0.03 * SR); t = np.arange(n) / SR
    put(tick, 0.45 + k * 0.09, hp(rng.standard_normal(n), 3000) * np.exp(-t * 200) * (0.5 + 0.5 * k / 15))
put(taiko, 1.95, taiko_s(42, 3), 1.0)                                       # 'go OUT' hit
n = int((START - 0.28) * SR); t = np.arange(n) / SR                         # low fire rumble under the hook
put(fx, 0.28, lp(rng.standard_normal(n), 160) * np.minimum(1, t / 0.3) * (1 - np.clip((t - 1.7) / 0.9, 0, 1)) * 0.8)

# ---------------- build + drop ----------------
nb = int(np.ceil((TOTAL - START) / BAR)) + 1
for b in range(nb):
    t0 = START + b * BAR; c = b % 4; drop = t0 >= DROP - 1e-6
    if t0 >= TOTAL: break
    prog = min(max((t0 - START) / max(DROP - START, 1), 0), 1)
    put(brass, t0, brass_s([ROOT[c] + 12, ROOT[c] + 19], BAR + 0.1, prog if not drop else 1.0), 0.55 if not drop else 0.8)
    if drop: put(brass, t0, brass_s(CH[c], BAR + 0.1, 0.9), 0.5)
    # string ostinato 16ths (starts quiet, grows)
    pat = [0, 0, 12, 0, 7, 0, 12, 7]
    for s16 in range(16):
        put(strings, t0 + s16 * BEAT / 4, stac(ROOT[c] + 24 + pat[s16 % 8]), (0.10 + 0.25 * prog) if not drop else 0.38)
    # taiko pattern
    hits = [0, 1.5, 2, 3, 3.5] if drop else ([0, 2] if prog < 0.5 else [0, 1.5, 2, 3])
    for h in hits: put(taiko, t0 + h * BEAT, taiko_s(55 if h % 1 == 0 else 70, 7), 0.9 if drop else 0.5 + 0.4 * prog)
    if drop:
        for s8 in range(8): put(perc, t0 + s8 * BEAT / 2, hp(rng.standard_normal(int(0.04 * SR)), 5000) * np.exp(-np.arange(int(0.04 * SR)) / SR * 90), 0.25)
# riser + braam
n = int(2 * BAR * SR); t = np.arange(n) / SR
put(fx, DROP - 2 * BAR, lpv(rng.standard_normal(n), 300 + 6000 * (t / t[-1]) ** 2) * (t / t[-1]) ** 2.2 * 0.6)
for k in range(8): put(taiko, DROP - BAR + k * BEAT / 2, taiko_s(70, 9), 0.4 + 0.07 * k)    # drum roll into drop
put(fx, DROP, braam(), 1.3); put(taiko, DROP, taiko_s(40, 2.5), 1.3)
gap = np.ones(L); g0 = int((DROP - 0.35) * SR); g1 = int(DROP * SR); gap[g0:g1] = 0.1

# ---------------- mix ----------------
brass = reverb(brass, 3.2, 0.45); strings = reverb(strings, 2.4, 0.3); taiko_r = reverb(taiko, 2.8, 0.35)
mix = (taiko_r * 0.75 + brass * 1.1 + strings * 0.9 + perc * 0.5 + tick * 0.5) * gap + fx * 0.9
mix = hp(mix, 30)
w = (strings * 0.9 + brass * 0.4) * 0.3; dl = int(0.013 * SR)
wd = np.concatenate([np.zeros(dl), w[:-dl]])
st = np.stack([mix + wd, mix - wd], 1)[: int(TOTAL * SR)]
fo = int(1.2 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st * 1.1); st = st / np.abs(st).max() * 10 ** (-1 / 20)
with wave.open(sys.argv[1], 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1], TOTAL, 's, drop', DROP)
