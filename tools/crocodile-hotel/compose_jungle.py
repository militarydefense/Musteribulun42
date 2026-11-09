#!/usr/bin/env python3
"""Original 'jungle adventure / suspense' cue for the Crocodile Hotel Short (A minor, 104 BPM).
Low tom grooves, wooden marimba ostinato, shaker, warm pad, tension rise into the reveal
(the crocodile shape appears from above) then full groove + brass-like stab hits.
All synthesised, no samples.  usage: compose_jungle.py out.wav  (env REVEAL, TOTAL)"""
import os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; BPM = 104.0; BEAT = 60 / BPM; BAR = 4 * BEAT
TOTAL = float(os.environ.get('TOTAL', 28.0)); REVEAL = float(os.environ.get('REVEAL', 12.2))
L = int((TOTAL + 2) * SR); rng = np.random.default_rng(77); T = np.arange(L) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def put(b, t0, x, g=1.0):
    i = int(t0 * SR)
    if i >= len(b) or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    j = min(len(b), i + len(x)); b[i:j] += g * x[:j - i]
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def reverb(x, rt, wet):
    n = int(rt * SR); t = np.arange(n) / SR
    ir = lp(rng.standard_normal(n) * np.exp(-t * 6.9 / rt), 5000); ir /= np.sqrt((ir ** 2).sum())
    return x + wet * fftconvolve(x, ir)[:len(x)]
def tom(f0, dec=9):
    n = int(0.6 * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.5 * np.exp(-t * 25))) / SR
    return np.tanh(1.6 * np.sin(ph) * np.exp(-t * dec)) + lp(rng.standard_normal(n), 1200) * np.exp(-t * 50) * 0.3
def marimba(m, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 28)
            + 0.15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)) * np.minimum(1, t * 900)
def shaker(dur=0.06):
    n = int(dur * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 5000) * np.sin(np.pi * t / dur) ** 2
def stab(notes, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(2 * ((midi(m) * (1 + d) * t + rng.random()) % 1) - 1 for m in notes for d in (-0.005, 0, 0.005)) / (3 * len(notes))
    return lp(x, 1800) * np.exp(-t * 5) * np.minimum(1, t * 400)

toms = np.zeros(L); mar = np.zeros(L); shk = np.zeros(L); pad = np.zeros(L); fx = np.zeros(L); stb = np.zeros(L); bass = np.zeros(L)
CH = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]]     # Am F G E
ROOT = [33, 29, 31, 28]
PAT = [0, 2, 1, 2, 0, 2, 1, 3]                                      # marimba ostinato over chord tones
nb = int(np.ceil(TOTAL / BAR)) + 1
for b in range(nb):
    t0 = b * BAR; c = b % 4; full = t0 >= REVEAL - 1e-6; pre = REVEAL - BAR * 2 <= t0 < REVEAL
    if t0 >= TOTAL: break
    # pad (always)
    n = int((BAR + 0.4) * SR); tt = np.arange(n) / SR
    pd = sum(np.sin(2 * np.pi * midi(m) * tt) + 0.4 * np.sin(2 * np.pi * midi(m) * 2.003 * tt) for m in CH[c]) / 4
    put(pad, t0, lp(pd, 1500) * np.minimum(1, tt / 0.4) * np.minimum(1, (BAR + 0.4 - tt) / 0.4), 0.35 if not full else 0.45)
    # toms: sparse before, tribal groove after reveal
    hits = [0, 2.5] if not full else [0, 0.75, 1.5, 2, 2.5, 3.25, 3.5]
    for h in hits: put(toms, t0 + h * BEAT, tom(70 if h % 1 else 55), 0.6 if not full else 0.85)
    # marimba 8ths (from bar 1), louder after reveal
    if b >= 1:
        notes = CH[c] + [CH[c][0] + 12]
        for s8 in range(8): put(mar, t0 + s8 * BEAT / 2, marimba(notes[PAT[s8]] + 12), 0.22 if not full else 0.3)
    # shaker 16ths after reveal, 8ths in pre-build
    if full or pre:
        div = 16 if full else 8
        for k in range(div): put(shk, t0 + k * BAR / div, shaker(), 0.12 if k % 2 else 0.2)
    if full:
        n = int(BAR * SR); tt = np.arange(n) / SR
        put(bass, t0, np.tanh(2 * np.sin(2 * np.pi * midi(ROOT[c] + 12) * tt)) * np.exp(-tt * 1.2), 0.35)
        put(stb, t0, stab([m + 12 for m in CH[c]]), 0.45)
# rise into the reveal + impact
n = int(2 * BAR * SR); t = np.arange(n) / SR; src = rng.standard_normal(n); sw = np.zeros(n)
for k in range(0, n, 2400):
    fc = 300 + 6000 * (k / n) ** 2; seg = lp(src[max(0, k - 4800):k + 2400], fc); sw[k:k + 2400] = seg[-len(sw[k:k + 2400]):]
put(fx, REVEAL - 2 * BAR, sw * (t / t[-1]) ** 2.3, 0.5)
n = int(2.2 * SR); t = np.arange(n) / SR
put(fx, REVEAL, np.tanh(2.5 * np.sin(2 * np.pi * (34 + 60 * np.exp(-t * 7)) * t)) * np.exp(-t * 2.0), 1.0)
put(fx, 0.15, tom(45, 3), 0.9)                                       # hook boom
put(fx, 3.4, tom(40, 3), 0.7)                                        # cut to eye
gap = np.ones(L); g0 = int((REVEAL - BEAT) * SR); g1 = int(REVEAL * SR); gap[g0:g1] = 0.15
pad = reverb(pad, 3.0, 0.4); mar = reverb(mar, 1.8, 0.3); stb = reverb(stb, 2.0, 0.35)
mix = (toms * 0.8 + mar + shk * 0.5 + pad + bass + stb * 0.9) * gap + fx * 0.9
mix = hp(mix, 28)
w = (mar + shk * 0.5 + pad * 0.5) * 0.25; dl = int(0.012 * SR); wd = np.concatenate([np.zeros(dl), w[:-dl]])
st = np.stack([mix + wd, mix - wd], 1)[: int(TOTAL * SR)]
fo = int(1.2 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st * 1.1); st = st / np.abs(st).max() * 10 ** (-1 / 20)
with wave.open(sys.argv[1], 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1], TOTAL, 'reveal', REVEAL)
