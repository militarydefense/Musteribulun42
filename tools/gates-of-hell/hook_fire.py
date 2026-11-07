#!/usr/bin/env python3
"""3 s hook from the real Street View photo of the burning crater:
slow push-in, flickering flames, heat shimmer, rising embers, punchy text,
then a white flash into the globe.  usage: hook_fire.py hookimg.png out.mp4"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OW, OH, FPS, DUR = 1080, 1920, 60, 3.0
src = cv2.imread(sys.argv[1]).astype(np.float32)[:-150]
H0, W0 = src.shape[:2]
# vertical crop centred on the brightest flame region
hsv = cv2.cvtColor(src.astype(np.uint8), cv2.COLOR_BGR2HSV)
fl = ((hsv[..., 0] < 25) & (hsv[..., 1] > 120) & (hsv[..., 2] > 170)).astype(np.float32)
fl[: int(fl.shape[0] * 0.5)] = 0
ys, xs = np.nonzero(fl)
fx, fy = (float(np.median(xs)), float(np.median(ys))) if len(xs) else (W0 / 2, H0 / 2)
cw = int(H0 * 9 / 16); x0 = int(np.clip(fx - cw / 2, 0, W0 - cw))
crop = src[:, x0:x0 + cw]; flm = fl[:, x0:x0 + cw]
base = cv2.resize(crop, (OW, OH), interpolation=cv2.INTER_CUBIC)
flame = cv2.resize(flm, (OW, OH), interpolation=cv2.INTER_LINEAR)
flame = cv2.GaussianBlur(flame, (0, 0), 6)
fcx, fcy = (fx - x0) * OW / cw, fy * OH / H0
print('flame centre', round(fcx), round(fcy), 'flame px', len(xs))
# grade: warmer, darker sky, more contrast
g = base / 255.0
g = np.clip((g - 0.5) * 1.2 + 0.45, 0, 1) ** 1.1
g = g * np.array([0.85, 0.95, 1.12])          # BGR -> warm
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
vig = np.clip(1 - 0.85 * ((((xx - fcx) / OW) ** 2 + ((yy - fcy) / OH) ** 2) * 1.6), 0.25, 1)[..., None]
base = (g * 255) * vig
glowmap = cv2.GaussianBlur(flame, (0, 0), 45)
spin0 = cv2.resize(cv2.imread('spin/s000.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
rng = np.random.default_rng(5)
emb = [dict(x=fcx + rng.normal(0, 90), y=fcy + rng.uniform(-10, 30), vx=rng.normal(0, 25), vy=-rng.uniform(120, 320),
            t0=rng.uniform(0, 2.6), r=rng.uniform(2, 5.5), life=rng.uniform(0.9, 1.8)) for _ in range(160)]
FB = '/usr/share/fonts/opentype/inter/Inter-Black.otf'; FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
_f = {}
def font(p, s):
    if (p, s) not in _f: _f[(p, s)] = ImageFont.truetype(p, s)
    return _f[(p, s)]
def smooth(x): x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def pop(t, t0):
    u = (t - t0) / 0.22
    if u <= 0: return 0.0
    if u >= 1: return 1.0
    return 0.55 + 0.55 * math.sin(u * math.pi * 0.75) / math.sin(math.pi * 0.75) * (1 - 0.15 * u)
def scale_about(img, s, x0c, y0c, dx=0, dy=0):
    M = np.array([[s, 0, x0c - s * x0c + dx], [0, s, y0c - s * y0c + dy]], np.float32)
    return cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def text(fr, blocks):
    pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).convert('RGBA')
    for lines, y, size, sc in blocks:
        if sc <= 0: continue
        f = font(FB, max(8, int(size * sc))); layer = Image.new('RGBA', pil.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(layer)
        lh = size * sc * 1.08; y0 = y + size * (1 - sc) * len(lines) * 0.5
        for i, (t, c) in enumerate(lines):
            w = dr.textlength(t, font=f)
            dr.text(((OW - w) / 2, y0 + i * lh), t, font=f, fill=c + (255,), stroke_width=max(2, int(9 * sc)), stroke_fill=(0, 0, 0, 255))
        pil = Image.alpha_composite(pil, layer)
    dr = ImageDraw.Draw(pil)
    dr.text((40, OH - 90), 'Photo: Sanju Mehta / Google Street View', font=font(FS, 28), fill=(255, 255, 255, 220), stroke_width=3, stroke_fill=(0, 0, 0, 255))
    return cv2.cvtColor(np.asarray(pil.convert('RGB')), cv2.COLOR_RGB2BGR).astype(np.float32)

N = int(DUR * FPS)
p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                      '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', sys.argv[2]], stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS
    # flicker: sum of noisy sines
    fk = 1.0 + 0.35 * math.sin(t * 23) * math.sin(t * 7.3 + 1) + 0.25 * math.sin(t * 41 + 2) + 0.15 * rng.standard_normal()
    fr = base + flame[..., None] * np.array([40, 140, 255]) * 0.55 * fk + glowmap[..., None] * np.array([10, 60, 180]) * 0.9 * fk
    # heat shimmer above the crater
    amp = 3.5 * np.exp(-((yy - (fcy - 120)) / 160) ** 2) * np.exp(-((xx - fcx) / 330) ** 2)
    mx = (xx + amp * np.sin(yy / 9.0 + t * 14)).astype(np.float32); my = (yy + amp * 0.6 * np.cos(xx / 11.0 + t * 11)).astype(np.float32)
    fr = cv2.remap(fr.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    # embers
    el = np.zeros((OH, OW), np.float32)
    for e in emb:
        a = t - e['t0']
        if 0 < a < e['life']:
            x = e['x'] + e['vx'] * a + 12 * math.sin(a * 6 + e['r']); y = e['y'] + e['vy'] * a
            al = (1 - a / e['life'])
            cv2.circle(el, (int(x), int(y)), max(1, int(e['r'])), al, -1, cv2.LINE_AA)
    eg = el + cv2.GaussianBlur(el, (0, 0), 7) * 2.5
    fr = fr + eg[..., None] * np.array([90, 200, 255])
    # camera: push-in towards the fire + tiny handheld shake
    s = 1.0 + 0.22 * smooth(t / DUR)
    fr = scale_about(fr, s, fcx, fcy, math.sin(t * 31) * 3, math.cos(t * 27) * 3)
    blocks = [([("This hole has been", (255, 255, 255))], 230, 90, pop(t, 0.12)),
              ([("BURNING", (40, 150, 255)[::-1])], 330, 170, pop(t, 0.45)),
              ([("for 54 YEARS", (255, 255, 255))], 520, 110, pop(t, 0.75))]
    if t > 1.55: blocks.append(([("...and it's about", (255, 255, 255)), ("to go OUT", (255, 70, 60))], 1400, 96, pop(t, 1.55)))
    fr = text(fr, blocks)
    w = smooth((t - (DUR - 0.22)) / 0.22)
    if w > 0:
        fr = scale_about(fr, 1 + 0.6 * w, OW / 2, OH / 2) * (1 - w) + spin0 * w
        fr = fr * (1 - 0.6 * math.sin(math.pi * w)) + 255 * 0.6 * math.sin(math.pi * w)
    p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
p.stdin.close(); p.wait(); print('ok', sys.argv[2])
