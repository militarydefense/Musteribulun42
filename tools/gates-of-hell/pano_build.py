#!/usr/bin/env python3
"""Stitch Street View captures (known headings) into a cylindrical panorama and
render a smooth 360 pan as perspective 1080x1920 frames.
usage: pano_build.py calib            -> find focal length that best aligns neighbours
       pano_build.py build F          -> pano.png
       pano_build.py render out.mp4 dur yaw0 [fov]
"""
import sys, os, math, glob, subprocess, json
import numpy as np, cv2

IW, IH = 2800, 2200          # capture size (dsf 2)
CX, CY = IW / 2, IH / 2
Y0, Y1 = 150, 1990           # usable rows (skip Earth UI bars)
STEP = 10

def imgs():
    fs = sorted(glob.glob('pano/h*.png'))
    return [(int(f[-7:-4]), f) for f in fs]

def proj_maps(f, F, alpha_lim, Wp, Hp, h_deg):
    """pano pixel -> image pixel maps for one capture (only within +-alpha_lim)."""
    th = (np.arange(Wp) + 0.5) / Wp * 2 * np.pi
    v = np.arange(Hp) - Hp / 2 + 0.5
    a = (th - math.radians(h_deg) + np.pi) % (2 * np.pi) - np.pi
    x = f * np.tan(np.clip(a, -1.5, 1.5))
    X = np.broadcast_to(CX + x, (Hp, Wp))
    Y = CY + (v[:, None] / F) * (f / np.cos(np.clip(a, -1.5, 1.5)))[None, :]
    ok = (np.abs(a) < alpha_lim)[None, :] & (Y >= Y0) & (Y <= Y1) & (X >= 2) & (X <= IW - 3)
    return X.astype(np.float32), Y.astype(np.float32), ok, a

def calib():
    L = imgs()
    a = cv2.imread(L[0][1]); b = cv2.imread(L[1][1])
    best = None
    for f in np.arange(1000, 1260, 10):
        F = f; Wp = int(round(2 * np.pi * F)); Hp = 1600
        lim = math.atan(CX / f) - 0.02
        Xa, Ya, oka, _ = proj_maps(f, F, lim, Wp, Hp, L[0][0])
        Xb, Yb, okb, _ = proj_maps(f, F, lim, Wp, Hp, L[1][0])
        cols = np.where((oka & okb).any(0))[0]
        c0, c1 = cols.min(), cols.max()
        ra = cv2.remap(a, Xa[:, c0:c1], Ya[:, c0:c1], cv2.INTER_LINEAR).astype(np.float32)
        rb = cv2.remap(b, Xb[:, c0:c1], Yb[:, c0:c1], cv2.INTER_LINEAR).astype(np.float32)
        m = (oka & okb)[:, c0:c1]
        err = float(np.abs(ra - rb)[m].mean())
        print(f'f={f} err={err:.2f}', flush=True)
        if best is None or err < best[1]: best = (f, err)
    print('BEST', best)

def build(f):
    L = imgs(); F = f
    Wp = int(round(2 * np.pi * F)); Hp = int(2 * F * (CY - Y0) / f) // 2 * 2
    acc = np.zeros((Hp, Wp, 3), np.float64); wsum = np.zeros((Hp, Wp), np.float64)
    lim = math.atan((CX - 4) / f)
    for h, fn in L:
        im = cv2.imread(fn).astype(np.float32)
        X, Y, ok, a = proj_maps(f, F, lim, Wp, Hp, h)
        cols = np.where(ok.any(0))[0]
        # handle wrap: process in contiguous chunks
        segs = np.split(cols, np.where(np.diff(cols) > 1)[0] + 1)
        for s in segs:
            c0, c1 = s.min(), s.max() + 1
            r = cv2.remap(im, X[:, c0:c1], Y[:, c0:c1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            w = (np.cos(a[c0:c1]) ** 8)[None, :] * ok[:, c0:c1]
            # soften vertical edges of valid band
            acc[:, c0:c1] += r * w[..., None]; wsum[:, c0:c1] += w
        print('placed', h, flush=True)
    pano = (acc / np.maximum(wsum, 1e-9)[..., None]).clip(0, 255).astype(np.uint8)
    cv2.imwrite('pano.png', pano)
    json.dump(dict(f=float(f), F=float(F), Wp=Wp, Hp=Hp, holes=int((wsum < 1e-6).sum())), open('pano.json', 'w'))
    print('pano', pano.shape, 'holes', int((wsum < 1e-6).sum()))

def render(out, dur, yaw0, vfov=78.0, fps=60):
    meta = json.load(open('pano.json')); F, Wp, Hp = meta['F'], meta['Wp'], meta['Hp']
    pano = cv2.imread('pano.png').astype(np.float32)
    pad = 400
    pano = np.concatenate([pano[:, -pad:], pano, pano[:, :pad]], 1)
    OW, OH = 1080, 1920
    fo = (OH / 2) / math.tan(math.radians(vfov / 2))
    xs = np.arange(OW) - OW / 2 + 0.5; ys = np.arange(OH) - OH / 2 + 0.5
    ang = np.arctan(xs / fo)                                  # per column yaw offset
    vrow = (F * ys[:, None] / np.sqrt(xs[None, :] ** 2 + fo ** 2)) + Hp / 2 - 0.5
    vrow = vrow.astype(np.float32)
    n = int(round(dur * fps))
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(fps),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for i in range(n):
        u = i / (n - 1)
        TURNS = float(os.environ.get('TURNS', 1.0)); LIN = float(os.environ.get('LIN', 0.0))
        e = LIN * u + (1 - LIN) * (0.5 - 0.5 * math.cos(math.pi * u))   # mostly linear, soft ends
        yaw = math.radians(yaw0) + e * 2 * math.pi * TURNS
        col = ((yaw + ang) % (2 * np.pi)) / (2 * np.pi) * Wp - 0.5 + pad
        X = np.broadcast_to(col[None, :], (OH, OW)).astype(np.float32)
        fr = cv2.remap(pano, X, vrow, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()

if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'calib': calib()
    elif c == 'build': build(float(sys.argv[2]))
    elif c == 'render': render(sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), *(float(x) for x in sys.argv[5:6]))
