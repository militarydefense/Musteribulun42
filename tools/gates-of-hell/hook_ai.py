#!/usr/bin/env python3
"""Hook from the AI-generated night image: spark -> ignition from darkness -> push-in with
flicker, heat shimmer and embers -> 1971..2025 counter -> fire dies -> flash into globe.
usage: hook_ai.py src.png out.mp4   |   hook_ai.py src.png thumb out.png"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OW, OH, FPS, DUR = 1080, 1920, 60, 3.0
img = cv2.resize(cv2.imread(sys.argv[1]), (OW, OH), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
hsv = cv2.cvtColor(img.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
H, Sa, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
warm = np.clip((Sa - 70) / 80, 0, 1) * (H < 32) * np.clip((V - 40) / 120, 0, 1)        # fire-lit areas
hot = np.clip((V - 200) / 50, 0, 1) * (H < 35) * np.clip((Sa - 60) / 80, 0, 1)            # actual flames
ry = np.arange(OH, dtype=np.float32)[:, None]
region = ((ry > 820) & (ry < 1450)).astype(np.float32)
warm = np.maximum(warm, np.clip((V - 150) / 60, 0, 1) * region)
warm = cv2.GaussianBlur(warm.astype(np.float32), (0, 0), 3)[..., None]
hot = cv2.GaussianBlur(hot.astype(np.float32), (0, 0), 2)[..., None]
cool = img * (1 - warm) + img * warm * 0.04                                                 # scene with fire 'off'
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
CX, CY = 540, 1170                                                                          # crater centre / silhouette area
FOCUS = (530, 1250)
rng = np.random.default_rng(4)
emb = [dict(x=rng.uniform(80, 1000), y=rng.uniform(1080, 1330), vx=rng.normal(0, 20), vy=-rng.uniform(150, 380),
            t0=rng.uniform(0.35, 2.6), r=rng.uniform(1.5, 4), life=rng.uniform(0.8, 1.8)) for _ in range(200)]
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
def scale_about(im, s, x0, y0, dx=0, dy=0):
    M = np.array([[s, 0, x0 - s * x0 + dx], [0, s, y0 - s * y0 + dy]], np.float32)
    return cv2.warpAffine(im, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def text(fr, blocks, label='AI visualization'):
    pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).convert('RGBA')
    for lines, y, size, sc in blocks:
        if sc <= 0: continue
        f = font(FB, max(8, int(size * sc))); layer = Image.new('RGBA', pil.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        lh = size * sc * 1.08; y0 = y + size * (1 - sc) * len(lines) * 0.5
        for i, (tx, c) in enumerate(lines):
            w = d.textlength(tx, font=f)
            d.text(((OW - w) / 2, y0 + i * lh), tx, font=f, fill=c + (255,), stroke_width=max(2, int(9 * sc)), stroke_fill=(0, 0, 0, 255))
        pil = Image.alpha_composite(pil, layer)
    if label:
        ImageDraw.Draw(pil).text((40, OH - 90), label, font=font(FS, 28), fill=(255, 255, 255, 220), stroke_width=3, stroke_fill=(0, 0, 0, 255))
    return cv2.cvtColor(np.asarray(pil.convert('RGB')), cv2.COLOR_RGB2BGR).astype(np.float32)

def intensity(t):
    if t < 0.25: return 0.0
    if t < 0.6: return 1.25 * smooth((t - 0.25) / 0.35)
    if t < 1.9: return 1.25 - 0.25 * smooth((t - 0.6) / 0.4)
    k = smooth((t - 1.9) / 0.8)
    return max(0.05, 1.0 - 0.95 * k + 0.18 * math.sin(t * 47) * (1 - k))
def skylevel(t):
    return 0.0 if t < 0.2 else 0.35 + 0.65 * smooth((t - 0.2) / 0.5)

def scene(t, I):
    fk = 1.0 + 0.10 * math.sin(t * 23) * math.sin(t * 7.3 + 1) + 0.07 * math.sin(t * 41 + 2)
    Ie = I * fk
    fr = cool * skylevel(t) + (img - cool) * min(Ie, 1.0) + img * hot * max(Ie - 1, 0) * 0.6
    # heat shimmer above the crater
    amp = 3.0 * np.exp(-((yy - 900) / 130) ** 2) * min(Ie, 1)
    mx = (xx + amp * np.sin(yy / 8.0 + t * 15)).astype(np.float32); my = (yy + amp * 0.5 * np.cos(xx / 10.0 + t * 12)).astype(np.float32)
    fr = cv2.remap(fr.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    el = np.zeros((OH, OW), np.float32)
    for e in emb:
        a = t - e['t0']
        if 0 < a < e['life']:
            x = e['x'] + e['vx'] * a + 10 * math.sin(a * 6 + e['r']); y = e['y'] + e['vy'] * a
            cv2.circle(el, (int(x), int(y)), max(1, int(e['r'])), 1 - a / e['life'], -1, cv2.LINE_AA)
    fr = fr + ((el + cv2.GaussianBlur(el, (0, 0), 6) * 2.5) * min(Ie, 1.2))[..., None] * np.array([80, 190, 255])
    return fr

def frame(t):
    I = intensity(t); fr = scene(t, I)
    if 0.16 < t < 0.32:
        sp = math.exp(-((t - 0.24) / 0.03) ** 2)
        sl = np.zeros((OH, OW), np.float32); cv2.circle(sl, (CX, CY), 6, 1.0, -1, cv2.LINE_AA)
        fr = fr + ((sl * 1.5 + cv2.GaussianBlur(sl, (0, 0), 25) * 60 + cv2.GaussianBlur(sl, (0, 0), 80) * 120) * sp)[..., None] * np.array([90, 190, 255])
    if 0.25 < t < 0.45: fr = fr + 110 * math.exp(-((t - 0.3) / 0.05) ** 2)
    s = (1.45 - 0.45 * smooth((t - 0.25) / 0.6)) if t < 0.85 else 1.0 + 0.16 * smooth((t - 0.85) / 2.15)
    fr = scale_about(fr, s, FOCUS[0], FOCUS[1], math.sin(t * 31) * 2.5, math.cos(t * 27) * 2.5)
    blocks = []
    if t > 0.4:
        yr = int(round(1971 + (2025 - 1971) * smooth((t - 0.45) / 1.3)))
        blocks += [([(str(yr), (255, 150, 40))], 230, 240, pop(t, 0.4)), ([("STILL BURNING", (255, 255, 255))], 500, 100, pop(t, 0.6))]
    if t > 1.95: blocks.append(([("...and it's about", (255, 255, 255)), ("to go OUT", (255, 70, 60))], 680, 100, pop(t, 1.95)))
    return text(fr, blocks)

if __name__ == '__main__':
    if sys.argv[2] == 'thumb':
        fr = scale_about(scene(1.0, 1.1), 1.06, FOCUS[0], FOCUS[1])
        cv2.imwrite(sys.argv[3], fr.clip(0, 255).astype(np.uint8)); sys.exit()
    spin0 = cv2.resize(cv2.imread('../spin/s000.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', sys.argv[2]], stdin=subprocess.PIPE)
    for i in range(int(DUR * FPS)):
        t = i / FPS; fr = frame(t)
        w = smooth((t - (DUR - 0.22)) / 0.22)
        if w > 0:
            fr = scale_about(fr, 1 + 0.6 * w, OW / 2, OH / 2) * (1 - w) + spin0 * w
            fr = fr * (1 - 0.6 * math.sin(math.pi * w)) + 255 * 0.6 * math.sin(math.pi * w)
        p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait(); print('ok', sys.argv[2])
