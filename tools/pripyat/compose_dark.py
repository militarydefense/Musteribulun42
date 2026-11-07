#!/usr/bin/env python3
"""Original dark ambient cue for the Pripyat film (E minor, free time).
Sub drone, detuned string pad, sparse felt-piano motif, music-box hook,
Geiger counter that intensifies over the reactor shot, low boom hits on cuts,
wind/air bed. All synthesised (no samples).  usage: compose_dark.py out.wav"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; TOTAL = 33.3; L = int((TOTAL + 3) * SR); rng = np.random.default_rng(31)
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def put(b, t0, x, g=1.0):
    i = int(t0 * SR); j = min(len(b), i + len(x))
    if i < len(b): b[i:j] += g * x[:j - i]
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def reverb(x, rt, wet):
    n = int(rt * SR); t = np.arange(n) / SR
    ir = lp(rng.standard_normal(n) * np.exp(-t * 6.9 / rt), 5000); ir /= np.sqrt((ir ** 2).sum())
    return x + wet * fftconvolve(x, ir)[:len(x)]
T = np.arange(L) / SR
# timeline (s): wheel 0-4.2 | reactor 4.2-8.6 | class 8.6-14 | zoom 14-17.6 | aerial 17.6-22.4 | 360 22.4-30
pad = np.zeros(L); piano = np.zeros(L); box = np.zeros(L); geig = np.zeros(L); hits = np.zeros(L); air = np.zeros(L)

# sub drone E1 + B1, swelling at the reactor and zoom
env = np.interp(T, [0, 1.5, 3.8, 6.6, 10.6, 17.9, 21.2, 25.7, 31.8, 33.3], [0.3, 0.55, 0.5, 0.95, 0.7, 0.95, 0.6, 0.55, 0.5, 0.0])
drone = (np.sin(2 * np.pi * midi(28) * T) + 0.5 * np.sin(2 * np.pi * midi(35) * T + 1) + 0.25 * np.sin(2 * np.pi * midi(40) * T * 1.002)) * env
# string pad: Em - Cmaj7 - Am(add9) - B(sus) blocks following the cuts
CH = [(0, [52, 55, 59, 64]), (3.8, [48, 52, 55, 59]), (6.6, [47, 52, 54, 59]), (10.6, [45, 52, 57, 59]), (14.4, [45, 48, 52, 57]), (17.9, [47, 52, 54, 59]), (21.2, [48, 55, 59, 64]), (25.7, [52, 55, 59, 66])]
for k, (t0, notes) in enumerate(CH):
    t1 = CH[k + 1][0] if k + 1 < len(CH) else TOTAL
    n = int((t1 - t0 + 1.2) * SR); t = np.arange(n) / SR
    x = sum(2 * ((midi(m) * (1 + d) * t + rng.random()) % 1) - 1 for m in notes for d in (-0.004, 0.0, 0.004)) / (3 * len(notes))
    e = np.minimum(1, t / 0.9) * np.minimum(1, (t1 - t0 + 1.2 - t) / 1.2)
    put(pad, t0, lp(x, 900) * e, 0.5)
# felt piano: sparse descending motif (original)
def piano_n(m, dur=3.0, v=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    x = sum(a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (1.6 + 1.3 * h)) for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)))
    return lp(x, 2600) * np.minimum(1, t * 300) * v
MOTIF = [(0.3, 76), (1.15, 74), (2.0, 71), (3.8, 67), (4.9, 72), (10.8, 69), (12.0, 71), (13.2, 64), (14.6, 64), (21.4, 76), (22.8, 79), (24.2, 74), (26.2, 76), (27.8, 71), (29.6, 67), (31.2, 64)]
for t0, m in MOTIF: put(piano, t0, piano_n(m, 3.2, 0.8))
# music-box shimmer on the wheel (hook) and the final 360 (wheel again)
def boxn(m):
    n = int(1.6 * SR); t = np.arange(n) / SR; f = midi(m)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 4.2 * t) * np.exp(-t * 9)) * np.exp(-t * 3.2)
for i, m in enumerate([88, 86, 83, 79, 83, 86]): put(box, 0.5 + i * 0.55, boxn(m), 0.22)
for i, m in enumerate([88, 86, 83, 79]): put(box, 26.2 + i * 0.7, boxn(m), 0.2)
# Geiger counter: Poisson clicks, rate ramps over the reactor shot, fades in class
rate = np.interp(T, [0, 3.8, 4.4, 6.6, 10.4, 12.0, 14.4, 17.9, 33.3], [0, 0, 4, 10, 40, 6, 3, 0, 0])
p = rate / SR; clicks = rng.random(L) < p
cl = np.zeros(L); cl[clicks] = 1.0
ck = hp(rng.standard_normal(int(0.004 * SR)), 2500) * np.exp(-np.arange(int(0.004 * SR)) / SR * 900)
geig = np.convolve(cl, ck)[:L]
# hits: low booms on hook title, reactor, zoom arrival
def boom(dec=2.2, f0=34):
    n = int(2.5 * SR); t = np.arange(n) / SR
    return np.tanh(2 * np.sin(2 * np.pi * (f0 + 40 * np.exp(-t * 8)) * t) * np.exp(-t * dec)) + lp(rng.standard_normal(n), 300) * np.exp(-t * 6) * 0.4
for t0, g in ((0.18, 0.9), (3.8, 0.7), (6.6, 1.0), (14.6, 0.8), (17.9, 0.8), (25.7, 0.7)): put(hits, t0, boom(), g)
# reverse swell into the zoom
n = int(1.4 * SR); t = np.arange(n) / SR
sw = np.zeros(n); src = rng.standard_normal(n)
for k in range(0, n, 2400):
    fc = 300 + 5000 * (k / n) ** 2; sw[k:k + 2400] = lp(src[max(0, k - 4800):k + 2400], fc)[-len(sw[k:k + 2400]):]
put(hits, 17.9 - 1.4, sw * (t / t[-1]) ** 2.5 * 0.6)
# wind / air bed
air = bp(rng.standard_normal(L), 200, 1800) * (0.06 + 0.04 * np.sin(2 * np.pi * 0.11 * T)) * np.interp(T, [0, 1, 32, 33.3], [0, 1, 1, 0])
for k in range(6):
    n = int(0.05 * SR); tt = np.arange(n) / SR
    put(hits, 3.9 + k * 0.45, bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt * 120) * (1.0 if k < 4 else 0.4), 0.5)
pad = reverb(pad, 4.0, 0.5); piano = reverb(piano, 3.5, 0.55); box = reverb(box, 3.0, 0.6)
mix = drone * 0.45 + pad * 0.9 + piano * 0.55 + box + geig * 0.35 + hits * 0.8 + air
mix = hp(mix, 25)
w = (pad * 0.9 + piano * 0.4 + box) * 0.25; dl = int(0.014 * SR); wd = np.concatenate([np.zeros(dl), w[:-dl]])
st = np.stack([mix + wd, mix - wd], 1)[: int(TOTAL * SR)]
fo = int(1.5 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st * 1.05); st = st / np.abs(st).max() * 10 ** (-1 / 20)
with wave.open(sys.argv[1], 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1])
