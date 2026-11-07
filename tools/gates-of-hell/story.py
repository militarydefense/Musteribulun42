#!/usr/bin/env python3
"""Animated story section from 5 AI stills (rig, collapse, torch, flames, tourists).
Ken Burns moves, film grain + flicker for 1971 scenes, shake on the collapse, debris,
flame flicker, embers, flash transitions. Starts from the last zoom frame, ends on the
first ground frame.  usage: story.py zoom.mp4 ground.mp4 out.mp4"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OW, OH, FPS = 1080, 1920, 60
ZOOM, GROUND, OUT = sys.argv[1:4]
def load(i): return cv2.resize(cv2.imread(f's{i}.png'), (OW, OH), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
IM = {i: load(i) for i in range(1, 6)}
def warmmask(im):
    hsv = cv2.cvtColor(im.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    m = np.clip((hsv[..., 2] - 150) / 80, 0, 1) * (hsv[..., 0] < 30) * np.clip((hsv[..., 1] - 60) / 80, 0, 1)
    return cv2.GaussianBlur(m, (0, 0), 3)[..., None]
WM = {i: warmmask(IM[i]) for i in (3, 4, 5)}
def frame_at(fn, which):
    cap = cv2.VideoCapture(fn); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n - 1 if which == 'last' else 0); ok, f = cap.read(); return f.astype(np.float32)
Z_LAST, G_FIRST = frame_at(ZOOM, 'last'), frame_at(GROUND, 'first')
SC = [(1, 2.6), (2, 2.7), (3, 3.0), (4, 1.5), (5, 3.0)]
TOTAL = sum(d for _, d in SC)
rng = np.random.default_rng(12)
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'; font = ImageFont.truetype(FS, 28)

def smooth(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def cam(im, s, x0, y0, dx=0, dy=0, rot=0):
    M = cv2.getRotationMatrix2D((x0, y0), rot, s); M[0, 2] += dx + (OW / 2 - x0) * 0; M[1, 2] += dy
    return cv2.warpAffine(im, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def grain(fr, amt):
    return fr + rng.normal(0, amt, (OH // 2, OW // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1)
def embers(state, t, area, n_new, col=(80, 190, 255), up=(150, 380)):
    x0, x1, y0, y1 = area
    for _ in range(n_new):
        state.append(dict(x=rng.uniform(x0, x1), y=rng.uniform(y0, y1), vx=rng.normal(0, 20), vy=-rng.uniform(*up), t0=t, r=rng.uniform(1.5, 4), life=rng.uniform(0.7, 1.6)))
    el = np.zeros((OH, OW), np.float32); keep = []
    for e in state:
        a = t - e['t0']
        if a < e['life']:
            keep.append(e); x = e['x'] + e['vx'] * a + 10 * math.sin(a * 6 + e['r']); y = e['y'] + e['vy'] * a
            cv2.circle(el, (int(x), int(y)), max(1, int(e['r'])), 1 - a / e['life'], -1, cv2.LINE_AA)
    state[:] = keep
    return (el + cv2.GaussianBlur(el, (0, 0), 6) * 2.5)[..., None] * np.array(col)
def flicker(im, wm, t, amt=0.25):
    fk = 1 + amt * (math.sin(t * 23) * math.sin(t * 7.3 + 1) + 0.6 * math.sin(t * 41 + 2))
    return im + im * wm * (fk - 1)

debris = [dict(x=rng.uniform(380, 820), y=rng.uniform(500, 1300), vy=rng.uniform(350, 800), r=rng.uniform(2, 5)) for _ in range(55)]
E = {k: [] for k in range(6)}

def scene(i, u, t, d):
    im = IM[i]
    if i == 1:   # 1971 rig: slow push-in, light film grain only
        return grain(cam(im, 1.0 + 0.08 * smooth(u), 560, 800), 5)
    if i == 2:   # collapse: gentle decaying tremor + slow push-in
        sh = 5 * math.exp(-u * 2.5) + 0.6
        dx, dy = sh * math.sin(t * 17), sh * math.cos(t * 13)
        return grain(cam(im, 1.04 + 0.08 * smooth(u), 520, 900, dx, dy), 5)
    if i == 3:   # torch: slow push towards the torch
        return cam(im, 1.0 + 0.08 * smooth(u), 640, 1040)
    if i == 4:   # close flames: slow push, very subtle heat haze
        amp = 1.2; mx = (xx + amp * np.sin(yy / 9 + t * 8)).astype(np.float32); my = (yy + amp * 0.5 * np.cos(xx / 11 + t * 6)).astype(np.float32)
        fr = cv2.remap(im, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        return cam(fr, 1.03 + 0.08 * smooth(u), 540, 1000)
    if i == 5:   # tourists: slow pull-out to reveal
        return cam(im, 1.12 - 0.12 * smooth(u), 540, 1250)

p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                      '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
N = int(round(TOTAL * FPS)); starts = np.cumsum([0] + [d for _, d in SC])
for f in range(N):
    t = f / FPS; k = int(np.searchsorted(starts, t, side='right') - 1); k = min(k, len(SC) - 1)
    i, d = SC[k]; u = (t - starts[k]) / d
    fr = scene(i, u, t, d)
    # transitions: flash + punch at each cut, from zoom at start, into ground at end
    a = t - starts[k]
    if a < 0.18:
        w = 1 - a / 0.18
        prev = Z_LAST if k == 0 else None
        if prev is not None: fr = fr * (1 - w) + prev * w
        fr = fr + 255 * 0.25 * w ** 2
    rem = TOTAL - t
    if rem < 0.3:
        w = smooth(1 - rem / 0.3); fr = fr * (1 - w) + G_FIRST * w + 255 * 0.4 * math.sin(math.pi * w)
    pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
    if rem > 0.3:
        ImageDraw.Draw(pil).text((40, OH - 90), 'AI reconstruction', font=font, fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    p.stdin.write(cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR).tobytes())
p.stdin.close(); p.wait(); print('ok', OUT, TOTAL)
