#!/usr/bin/env python3
"""Original melodic EDM cue for zoomtosecrets (G minor, 140 BPM), timed to the
Göbekli Tepe Short: build-up during the zoom, drop on the dive (t=19.45 s).
Everything is synthesized here from scratch -> no third-party samples.
usage: compose.py out.wav [total_seconds]"""
import sys, numpy as np, wave

SR = 48000
BPM = 140.0
BEAT = 60 / BPM; BAR = 4 * BEAT
DROP_T = 19.45
TOTAL = float(sys.argv[2]) if len(sys.argv) > 2 else 31.0
PRE = 12 * BAR - DROP_T           # music starts PRE seconds before video t=0
L = int((TOTAL + PRE + 2) * SR)
rng = np.random.default_rng(42)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def t_of(bar, beat=0.0): return bar * BAR + beat * BEAT
def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a*SR), int(d*SR), int(r*SR); sl = max(int(sus_len*SR) - a - d, 0)
    e = np.concatenate([np.linspace(0, 1, a, False), np.linspace(1, s, d, False), np.full(sl, s), np.linspace(s, 0, r)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

def saw(f, n, detune=0.0, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * (1 + detune) * t + phase) % 1.0) - 1

def lp_slow(x, cutoff):
    """one-pole low-pass, cutoff may be array"""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y

def lp(x, cutoff):
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    # block-wise constant cutoff (10 ms) with scipy for speed, state carried over
    from scipy.signal import lfilter
    y = np.empty_like(x); zi = np.zeros(1); B = 480
    for i in range(0, len(x), B):
        a = 1 - np.exp(-2*np.pi*float(c[i])/SR)
        y[i:i+B], zi = lfilter([a], [1, -(1-a)], x[i:i+B], zi=zi)
    return y
def lp_fast(x, cutoff):  # constant cutoff, 2 poles, vectorised via scipy-like lfilter fallback
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    from numpy.lib.stride_tricks import sliding_window_view  # noqa
    y = x.copy()
    for _ in range(2):
        out = np.empty_like(y); s = 0.0
        # chunked recursion
        for i in range(0, len(y), 4096):
            seg = y[i:i+4096]; o = np.empty_like(seg)
            for j in range(len(seg)):
                s += a * (seg[j] - s); o[j] = s
            out[i:i+4096] = o
        y = out
    return y

def add(buf, start_s, sig, gain=1.0):
    i = int((start_s + PRE) * SR)
    if i >= len(buf): return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(len(buf), i + len(sig)); buf[i:j] += gain * sig[:j - i]

# ---------------- harmony (original progression in G minor) ----------------
# i - VI - III - VII  :  Gm  Eb  Bb  F    (one chord per bar, 4-bar loop)
CHORDS = [[55, 58, 62], [51, 55, 58], [58, 62, 65], [53, 57, 60]]
ROOTS = [43, 39, 46, 41]
# original lead motif (scale degrees of G minor), 8th notes, one bar each, 4-bar phrase
LEAD = [
    [74, None, 70, 72, 74, None, 77, 74],
    [75, None, 74, 72, 70, None, 67, None],
    [70, None, 72, 74, 77, None, 74, 72],
    [72, None, 70, 69, 70, None, None, None],
]

pad = np.zeros(L); bass = np.zeros(L); lead = np.zeros(L); arp = np.zeros(L)
kick = np.zeros(L); snare = np.zeros(L); hats = np.zeros(L); fx = np.zeros(L)
side = np.ones(L)

def supersaw(notes, dur, voices=5, spread=0.012):
    n = int(dur * SR); x = np.zeros(n)
    for m in notes:
        f = midi(m)
        for v in range(voices):
            d = spread * (v - (voices - 1) / 2) / ((voices - 1) / 2)
            x += saw(f, n, d, rng.random())
    return x / (len(notes) * voices)

def pluck(m, dur, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = 0.6 * saw(midi(m), n, 0.004) + 0.4 * saw(midi(m), n, -0.004, 0.3) + 0.25 * np.sin(2*np.pi*midi(m+12)*t)
    e = np.exp(-t * 7.0)
    return x * e * (0.4 + 0.6 * bright)

def kick_s():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 6.5) + 0.25 * np.exp(-t * 300) * rng.standard_normal(n)

def snare_s():
    n = int(0.3 * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n); noise = noise - np.concatenate([[0], noise[:-1]]) * 0.6
    return 0.55 * noise * np.exp(-t * 16) + 0.5 * np.sin(2*np.pi*190*t) * np.exp(-t * 30)

def hat_s(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - np.concatenate([[0], x[:-1]])
    return x * np.exp(-t * (14 if open_ else 70)) * 0.5

K, S_, H, HO = kick_s(), snare_s(), hat_s(), hat_s(True)
total_bars = int(np.ceil((TOTAL + PRE) / BAR)) + 1

for bar in range(total_bars):
    c = bar % 4; t0 = t_of(bar) - PRE
    build = bar < 12; drop = bar >= 12
    prog = min(bar / 11.0, 1.0)                     # 0..1 during build
    # ----- pad / chords -----
    ch = supersaw(CHORDS[c], BAR + 0.05)
    add(pad, t0, ch * env_adsr(len(ch), 0.05 if drop else 0.4, 0.2, 0.85, 0.3, BAR),
        0.60 if drop else 0.14 + 0.20 * prog)
    # ----- bass -----
    if bar >= 4:
        for b8 in range(8):
            if drop or b8 % 2 == 0:
                n = int(BEAT / 2 * SR) if drop else int(BEAT * SR)
                tt = np.arange(n) / SR
                x = 0.7 * np.sin(2*np.pi*midi(ROOTS[c])*tt) + 0.35 * saw(midi(ROOTS[c]), n) * (0.4 if drop else 0.15)
                add(bass, t0 + b8 * BEAT / 2, x * np.minimum(1, tt * 200) * np.exp(-tt * 3), 0.60 if drop else 0.12 + 0.18 * prog)
    # ----- arpeggio (build) -----
    if 2 <= bar < 12 or drop:
        notes = CHORDS[c] + [CHORDS[c][0] + 12]
        for s16 in range(16):
            m = notes[[0, 1, 2, 3, 2, 1, 2, 3][s16 % 8]] + 12
            add(arp, t0 + s16 * BEAT / 4, pluck(m, BEAT / 4 * 0.95, prog), (0.05 + 0.12 * prog) if build else 0.10)
    # ----- lead (from bar 8 softly, full on drop) -----
    if bar >= 8:
        ph = LEAD[c]
        for i8, m in enumerate(ph):
            if m is None: continue
            ln = 1
            while i8 + ln < 8 and ph[i8 + ln] is None and ln < 2: ln += 1
            add(lead, t0 + i8 * BEAT / 2, pluck(m, BEAT / 2 * ln * 1.1, 1.0), 0.34 if drop else 0.16)
    # ----- drums -----
    if bar >= 4 and build:
        for b in range(4 if bar >= 8 else 1): add(kick, t0 + b * BEAT, K, (0.25 + 0.35 * prog) if (6 <= bar < 11) else 0.0)
    if drop:
        for b in range(4):
            add(kick, t0 + b * BEAT, K, 1.0)
            st = int((t0 + b * BEAT + PRE) * SR); dl = int(0.28 * SR)
            if 0 <= st < L:
                e = np.linspace(0.25, 1, min(dl, L - st)) ** 1.5; side[st:st + len(e)] = np.minimum(side[st:st + len(e)], e)
        for b in (1, 3): add(snare, t0 + b * BEAT, S_, 0.75)
    if bar >= 6:
        for s8 in range(8):
            add(hats, t0 + s8 * BEAT / 2 + (BEAT / 4 if not drop else 0), H, 0.22 if drop else 0.10 + 0.08 * prog)
        if drop:
            for b in range(4): add(hats, t0 + b * BEAT + BEAT / 2, HO, 0.18)
    # snare roll into the drop (bars 10-11)
    if bar in (10, 11):
        div = 8 if bar == 10 else 16
        for k in range(div * (1 if bar == 10 else 1)):
            g = 0.25 + 0.5 * (k / div) * (0.6 if bar == 10 else 1.0)
            add(snare, t0 + k * BAR / div, S_[: int(0.12 * SR)], g)

# ----- FX: riser into drop, downlifter + impact on the drop -----
n = int(2 * BAR * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
riser = lp(noise, 300 + 9000 * (t / t[-1]) ** 2) * (t / t[-1]) ** 2
add(fx, DROP_T - 2 * BAR, riser, 0.35)
n = int(2.5 * SR); t = np.arange(n) / SR
impact = np.sin(2*np.pi*(32 + 60*np.exp(-t*6))*t) * np.exp(-t * 1.6) + 0.3 * lp(rng.standard_normal(n), 2000) * np.exp(-t * 2.5)
add(fx, DROP_T, impact, 0.9)

# pre-drop gap: duck everything except fx for the last half beat
gap = np.ones(L); g0 = int((DROP_T - BEAT * 0.5 + PRE) * SR); g1 = int((DROP_T + PRE) * SR)
gap[g0:g1] = 0.15
# ----- filters / mix -----
tt = (np.arange(L) / SR) - PRE
pre_drop = tt < DROP_T
cut = np.where(pre_drop, 500 + 5500 * np.clip((tt + PRE) / (DROP_T + PRE), 0, 1) ** 2.2, 9000)
pad_f = lp(pad, cut) * side
arp_f = lp(arp, np.where(pre_drop, 1200 + 6000 * np.clip((tt + PRE) / (DROP_T + PRE), 0, 1) ** 2, 8000))
bass_f = bass * np.where(pre_drop, 1.0, side)
mix = ((pad_f * 1.0 + arp_f * 1.0 + lead * 0.9 * np.where(pre_drop, 1, 0.75 + 0.25 * side)
       + bass_f * 1.0 + kick * 0.9 + snare * 0.55 + hats * 0.5) * gap + fx * 0.8)
# short stereo width via Haas on pad/arp
right = mix.copy(); d = int(0.011 * SR)
right[d:] = mix[d:] - 0.25 * (pad_f + arp_f)[d:] + 0.25 * (pad_f + arp_f)[:-d]
left = mix
st = np.stack([left, right], 1)[int(PRE * SR): int((PRE + TOTAL) * SR)]
# fade out last 2 s, soft-clip, normalize to -1 dBFS peak
n = len(st); fo = int(2.0 * SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st * 1.2)
st = st / np.abs(st).max() * 10 ** (-1 / 20)
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], 'seconds', n / SR, 'drop at', DROP_T, 'bpm', BPM)
