#!/usr/bin/env python3
"""Night version of the real crater photo: starry sky, crater filled with animated fire,
rim light, warm ground glow, rising smoke and embers, a silhouette on the rim.
Hook timeline: spark -> ignition -> 1971..2025 counter -> flames die -> flash to globe.
usage: hook_night.py hookimg.png out.mp4 [still t out.png]"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OW, OH, FPS, DUR = 1080, 1920, 60, 3.0
src = cv2.imread(sys.argv[1]).astype(np.float32)[:-150]
H0, W0 = src.shape[:2]
ECX, ECY, EW, EH, HOR = 875, 1231, 1007, 135, 720          # crater ellipse + horizon (source px)
CW = 1500; X0 = int(np.clip(ECX - CW / 2, 0, W0 - CW)); CH = int(CW * 16 / 9)
S = OW / CW
canvas = np.zeros((CH, CW, 3), np.float32); off = CH - H0
canvas[off:] = src[:, X0:X0 + CW]
img = cv2.resize(canvas, (OW, OH), interpolation=cv2.INTER_AREA)
cx, cy = (ECX - X0) * S, (ECY + off) * S; ax, ay = EW / 2 * S, EH / 2 * S * 2.3; hor = (HOR + off) * S
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
rng = np.random.default_rng(9)

# ---- ground: darken to night, keep texture
gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
ground = (0.4 * img + 0.6 * gray) * 0.16 * np.array([1.25, 1.0, 0.85])
# ---- sky: gradient + stars + faint milky band
t_sky = np.clip(yy / hor, 0, 1)[..., None]
sky = np.array([38, 14, 6]) * (1 - t_sky) + np.array([70, 34, 18]) * t_sky
stars = np.zeros((OH, OW), np.float32)
for _ in range(900):
    x, y = rng.uniform(0, OW), rng.uniform(0, hor - 20); r = rng.choice([0.6, 0.8, 1.0, 1.4, 2.0], p=[.4, .3, .15, .1, .05])
    cv2.circle(stars, (int(x), int(y)), max(1, int(r)), float(rng.uniform(0.3, 1.0)), -1, cv2.LINE_AA)
stars = stars + cv2.GaussianBlur(stars, (0, 0), 2.5) * 1.5
band = np.exp(-(((xx - OW * 0.65) * 0.6 + (yy - hor * 0.35) * 0.8) / 160) ** 2) * (yy < hor)
sky = sky + stars[..., None] * 200 + band[..., None] * np.array([40, 30, 28])
dune = hor + 10 * np.sin(xx / 140.0) + 6 * np.sin(xx / 53.0 + 1)
skym = np.clip((dune + 6 - yy) / 14, 0, 1)[..., None]
night = sky * skym + ground * (1 - skym)
haze = np.exp(-((yy - hor) / 45) ** 2)[..., None] * np.array([60, 45, 40])
night = night + haze
# ---- geometry masks
e = ((xx - cx) / ax) ** 2 + ((yy - cy) / ay) ** 2
inside = np.clip((1 - e) * 6, 0, 1)
rim = np.exp(-((np.sqrt(e) - 1) / 0.06) ** 2) * (yy > cy - ay * 0.2)       # lit far wall / rim
dist = np.sqrt(((xx - cx) / (ax * 1.0)) ** 2 + ((yy - cy) / (ay * 3.2)) ** 2)
groundglow = np.clip(1 - dist / 1.9, 0, 1) ** 2.6 * (yy > hor)
skyglow = np.exp(-((xx - cx) / 420) ** 2) * np.exp(-((yy - (cy - 40)) / 520) ** 2)
# ---- silhouette (front rim, slightly right of centre)
sil = Image.new('L', (OW, OH), 0); dr = ImageDraw.Draw(sil)
px, py = cx + 25, cy + ay * 1.06; h = 100
dr.ellipse((px - 11, py - h, px + 11, py - h + 23), fill=255)                         # head
dr.polygon([(px - 21, py - h + 24), (px + 21, py - h + 24), (px + 17, py - h * 0.42), (px - 17, py - h * 0.42)], fill=255)  # torso
dr.polygon([(px - 15, py - h * 0.44), (px - 2, py - h * 0.44), (px - 6, py), (px - 15, py)], fill=255)   # legs
dr.polygon([(px + 2, py - h * 0.44), (px + 15, py - h * 0.44), (px + 15, py), (px + 6, py)], fill=255)
dr.polygon([(px - 21, py - h + 26), (px - 28, py - h * 0.5), (px - 22, py - h * 0.48)], fill=255)    # arms
dr.polygon([(px + 21, py - h + 26), (px + 28, py - h * 0.5), (px + 22, py - h * 0.48)], fill=255)
silm = cv2.GaussianBlur(np.asarray(sil, np.float32) / 255, (0, 0), 0.8)
shadow = Image.new('L', (OW, OH), 0); ImageDraw.Draw(shadow).polygon([(px - 14, py), (px + 14, py), (px + 70, OH), (px - 40, OH)], fill=170)
shadowm = cv2.GaussianBlur(np.asarray(shadow, np.float32) / 255, (0, 0), 8)
# ---- noise helpers for fire/smoke
def noise(shape, scale, seed):
    r = np.random.default_rng(seed); h, w = shape
    n = r.standard_normal((h // scale + 3, w // scale + 3)).astype(np.float32)
    return cv2.resize(n, (w + 3 * scale + 64, h + 3 * scale + 64), interpolation=cv2.INTER_CUBIC)
NZ = [noise((OH, OW), s, k) for k, s in enumerate((48, 20, 9))]
def fbm(t, speed, sx=0, sy=0):
    acc = 0
    for k, (n, s) in enumerate(zip(NZ, (48, 20, 9))):
        dy = int((t * speed * (k + 1) * 0.6) % s * 3) if speed else 0
        acc = acc + n[dy + sy: dy + sy + OH, sx: sx + OW] * (0.5 ** k)
    return acc
def fire(t, I):
    n = fbm(t, 60)
    tex = np.clip(0.8 + 0.28 * n, 0.35, 1.6)
    depth = np.clip((yy - (cy - ay)) / (2 * ay), 0, 1)
    r_ = np.sqrt(np.clip(e, 0, 1))
    wall = 0.35 + 0.9 * r_ ** 2 * (1 - 0.6 * depth)        # glowing walls, far wall brightest
    floor = np.exp(-((xx - cx) / (ax * 0.35)) ** 2 - ((yy - (cy + ay * 0.25)) / (ay * 0.3)) ** 2) * 0.9
    heat = inside * tex * (wall + floor) * I
    col = np.stack([40 + 60 * heat, 120 + 140 * heat, 255 * np.ones_like(heat)], -1)
    return heat[..., None] * col * 1.25
def smoke(t, I):
    n = fbm(t * 0.6, 25, 7, 11)
    col = np.clip(0.5 + 0.5 * n, 0, 1)
    plume = np.exp(-((xx - cx - 30 * np.sin(yy / 260 + t)) / (ax * 0.35 + (cy - yy).clip(0) * 0.12)) ** 2)
    v = plume * col * np.clip((cy - yy) / 300, 0, 1) * np.clip((yy - (cy - 750)) / 450, 0, 1) * np.clip((cy - yy) / 60, 0, 1) * 0.55
    return v * (0.35 + 0.65 * min(I, 1)), v
emb = [dict(x=cx + rng.normal(0, ax * 0.4), y=cy + rng.uniform(-ay, ay * 0.5), vx=rng.normal(0, 20), vy=-rng.uniform(140, 380),
            t0=rng.uniform(0.3, 2.7), r=rng.uniform(1.5, 4.5), life=rng.uniform(0.8, 1.8)) for _ in range(220)]

def scene(t, I, L):
    fk = 1.0 + 0.18 * math.sin(t * 23) * math.sin(t * 7.3 + 1) + 0.12 * math.sin(t * 41 + 2)
    Ie = I * fk
    fr = night * L
    light = groundglow[..., None] * np.array([40, 110, 255]) * 1.15 * Ie + skyglow[..., None] * np.array([20, 50, 140]) * 0.5 * Ie
    fr = fr + light * (1 - inside[..., None])
    fr = fr * (1 - inside[..., None]) + fire(t, Ie) + inside[..., None] * np.array([5, 20, 60]) * Ie
    fr = fr + rim[..., None] * np.array([60, 170, 255]) * 1.2 * Ie
    sv, sm = smoke(t, I)
    fr = fr * (1 - 0.5 * sm[..., None]) + sv[..., None] * np.array([60, 110, 200]) * (0.5 + 0.8 * Ie)
    el = np.zeros((OH, OW), np.float32)
    for e_ in emb:
        a = t - e_['t0']
        if 0 < a < e_['life']:
            x = e_['x'] + e_['vx'] * a + 10 * math.sin(a * 6 + e_['r']); y = e_['y'] + e_['vy'] * a
            cv2.circle(el, (int(x), int(y)), max(1, int(e_['r'])), 1 - a / e_['life'], -1, cv2.LINE_AA)
    fr = fr + ((el + cv2.GaussianBlur(el, (0, 0), 6) * 2.5) * min(Ie, 1.3))[..., None] * np.array([90, 200, 255])
    fr = fr * (1 - shadowm[..., None] * 0.6 * min(Ie, 1))
    fr = fr * (1 - silm[..., None]) + silm[..., None] * np.array([4, 4, 6])
    # bloom
    br = np.clip(fr - 200, 0, None)
    fr = fr + cv2.GaussianBlur(br, (0, 0), 22) * 0.9
    return fr

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
def scale_about(img, s, x0, y0, dx=0, dy=0):
    M = np.array([[s, 0, x0 - s * x0 + dx], [0, s, y0 - s * y0 + dy]], np.float32)
    return cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
def text(fr, blocks, label=True):
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
        ImageDraw.Draw(pil).text((40, OH - 90), 'Illustration based on a photo by Sanju Mehta / Google Street View', font=font(FS, 26),
                                 fill=(255, 255, 255, 210), stroke_width=3, stroke_fill=(0, 0, 0, 255))
    return cv2.cvtColor(np.asarray(pil.convert('RGB')), cv2.COLOR_RGB2BGR).astype(np.float32)

def intensity(t):
    if t < 0.25: return 0.0
    if t < 0.6: return 1.5 * smooth((t - 0.25) / 0.35)
    if t < 1.9: return 1.5 - 0.5 * smooth((t - 0.6) / 0.4)
    k = smooth((t - 1.9) / 0.8)
    return max(0.06, 1.0 - 0.94 * k + 0.2 * math.sin(t * 47) * (1 - k))
def dark(t):
    if t < 0.25: return 0.0
    return 0.3 + 0.7 * smooth((t - 0.25) / 0.4)

def frame(t):
    I = intensity(t); fr = scene(t, I, dark(t))
    if 0.16 < t < 0.32:
        sp = math.exp(-((t - 0.24) / 0.03) ** 2)
        sl = np.zeros((OH, OW), np.float32); cv2.circle(sl, (int(cx), int(cy)), 6, 1.0, -1, cv2.LINE_AA)
        fr = fr + ((sl * 1.5 + cv2.GaussianBlur(sl, (0, 0), 25) * 60 + cv2.GaussianBlur(sl, (0, 0), 80) * 120) * sp)[..., None] * np.array([90, 190, 255])
    if 0.25 < t < 0.45: fr = fr + 120 * math.exp(-((t - 0.3) / 0.05) ** 2)
    # camera: starts close on the fire, pulls back to reveal, then slow push-in towards the crater
    s = (1.6 - 0.6 * smooth((t - 0.25) / 0.6)) if t < 0.85 else 1.0 + 0.14 * smooth((t - 0.85) / 2.15)
    fr = scale_about(fr, s, cx, cy - 60, math.sin(t * 31) * 2.5, math.cos(t * 27) * 2.5)
    blocks = []
    if t > 0.4:
        yr = int(round(1971 + (2025 - 1971) * smooth((t - 0.45) / 1.3)))
        blocks += [([(str(yr), (255, 150, 40))], 250, 240, pop(t, 0.4)), ([("STILL BURNING", (255, 255, 255))], 520, 100, pop(t, 0.6))]
    if t > 1.95: blocks.append(([("...and it's about", (255, 255, 255)), ("to go OUT", (255, 70, 60))], 700, 100, pop(t, 1.95)))
    return text(fr, blocks)

if __name__ == '__main__':
    if len(sys.argv) > 3 and sys.argv[3] == 'still':
        t = float(sys.argv[4]); I = 1.25
        fr = scale_about(scene(t, I, 1.0), 1.12, cx, cy - 60)
        cv2.imwrite(sys.argv[5], fr.clip(0, 255).astype(np.uint8)); sys.exit()
    spin0 = cv2.resize(cv2.imread('spin/s000.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
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
