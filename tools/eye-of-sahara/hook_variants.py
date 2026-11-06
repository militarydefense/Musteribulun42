#!/usr/bin/env python3
"""Animated previews of hook A (Atlantis map -> real rings) and hook B (eye opens).
usage: anim.py A|B out.mp4   (writes 3 s hook video, no audio)"""
import sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

OW, OH, FPS, DUR = 1080, 1920, 60, 3.0
MODE, OUT = sys.argv[1], sys.argv[2]
sat = cv2.resize(cv2.imread('../stills/k06.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
spin0 = cv2.resize(cv2.imread('../spin/s000.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
cx, cy = 545 * OW / 1060, 905 * OH / 1884
R = [r * OW / 1060 for r in (350, 235, 145, 70)]
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
d = np.hypot(xx - cx, yy - cy)
vig = np.clip(1 - 0.6 * ((((xx-OW/2)/(OW/2))**2 + ((yy-OH/2)/(OH/2))**2) / 2), 0, 1)[..., None]
FB = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
fonts = {}
def font(p, s):
    if (p, s) not in fonts: fonts[(p, s)] = ImageFont.truetype(p, s)
    return fonts[(p, s)]

def smooth(x): x = min(max(x, 0.0), 1.0); return x*x*(3-2*x)
def pop(t, t0):                       # scale bounce 0.6 -> 1.08 -> 1
    u = (t - t0) / 0.25
    if u <= 0: return 0.0
    if u >= 1: return 1.0
    return 0.6 + 0.48 * math.sin(u * math.pi * 0.75) / math.sin(math.pi * 0.75) * (1 - 0.15 * u)

def scale_about(img, s, x0=OW/2, y0=OH/2, dx=0, dy=0):
    M = np.array([[s, 0, x0 - s*x0 + dx], [0, s, y0 - s*y0 + dy]], np.float32)
    return cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def draw_text(fr, blocks):
    """blocks: list of (lines[(text,rgb)], y, size, scale, alpha)"""
    pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
    for lines, y, size, sc, al in blocks:
        if sc <= 0 or al <= 0: continue
        f = font(FB, max(8, int(size * sc)))
        layer = Image.new('RGBA', pil.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(layer)
        lh = size * sc * 1.08; y0 = y + size * (1 - sc) * len(lines) * 0.5
        for i, (t, c) in enumerate(lines):
            w = dr.textlength(t, font=f)
            dr.text(((OW - w) / 2, y0 + i * lh), t, font=f, fill=c + (int(255*al),), stroke_width=max(2, int(8*sc)), stroke_fill=(0, 0, 0, int(255*al)))
        pil = Image.alpha_composite(pil.convert('RGBA'), layer).convert('RGB')
    return cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR).astype(np.float32)

def small(fr, txt):
    pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)); dr = ImageDraw.Draw(pil)
    dr.text((40, OH - 90), txt, font=font(FS, 30), fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    return cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR).astype(np.float32)

# ---------------- A: Atlantis map ----------------
def atlantis(t):
    sea = np.array([95, 48, 12], np.float32); water = np.array([215, 150, 45], np.float32)
    land = np.array([115, 175, 205], np.float32); green = np.array([80, 145, 95], np.float32)
    img = np.zeros((OH, OW, 3), np.float32) + sea + (np.sin(xx/23.0 + yy/31.0 + t*3) * 7)[..., None]
    grow = smooth(t / 0.7) * (R[0] + 60)                      # rings grow outward
    bands = [(R[0]+40, water), (R[0], land), (R[0]-45, water), (R[1], green), (R[1]-35, water), (R[2], land), (R[2]-30, water), (R[3], green)]
    for r, col in bands:
        rr = min(r, grow)
        m = (d < rr)[..., None]
        ripple = (np.sin(d/6.0 - t*8) * 6)[..., None] if col is water else 0
        img = np.where(m, col + ripple, img)
    canal = ((np.abs(xx - cx) < 14) & (yy > cy) & (yy < cy + min(R[0] + 300, grow * 1.9)))
    img[canal] = water
    g = np.exp(-(d / (38 + 8 * math.sin(t * 9))) ** 2)[..., None]
    img = img * (1 - 0.75 * g) + np.array([190, 235, 255]) * 0.75 * g
    edge = np.exp(-((d - grow) / 10) ** 2)[..., None] * (1 - smooth((t - 0.6) / 0.2))
    img = img + 120 * edge
    return img * vig

def frame_A(t):
    s = 1.0 + 0.07 * smooth(t / DUR); sh = (math.sin(t*37)*3, math.cos(t*29)*3)
    if t < 1.2:
        fr = atlantis(t)
        fr = scale_about(fr, s, dx=sh[0], dy=sh[1])
        fr = draw_text(fr, [([("Plato described", (255,255,255)), ("ATLANTIS", (90,205,255)), ("like this...", (255,255,255))], 210, 112, pop(t, 0.12), 1)])
        return small(fr, 'Illustration')
    # 1.2..2.2 radial wipe map -> satellite, rings flash
    u = smooth((t - 1.2) / 0.55)
    rad = u * (R[0] + 900)
    m = np.clip((rad - d) / 60, 0, 1)[..., None]
    fr = atlantis(1.2) * (1 - m) + sat * m
    for r in R[:3]:
        fr += 160 * np.exp(-((d - r) / 9) ** 2)[..., None] * math.exp(-((t - 1.55) / 0.18) ** 2)
    fl = 0.45 * math.exp(-((t - 1.25) / 0.06) ** 2)
    fr = fr * (1 - fl) + 255 * fl
    fr = scale_about(fr, s + 0.03 * smooth((t-1.2)/1.0), dx=sh[0]*2, dy=sh[1]*2)
    blocks = [([("...and THIS", (255,255,255)), ("is in the Sahara", (255,255,255))], 210, 106, pop(t, 1.28), 1)]
    if t > 2.0: blocks.append(([("40 km WIDE 😳".replace(' 😳', ''), (255,138,31))], 1440, 124, pop(t, 2.0), 1))
    fr = draw_text(fr, blocks)
    if t < 1.7: fr = small(fr, 'Illustration')
    return fr

# ---------------- B: eye opens ----------------
def eyelid(open_, scale=1.0):
    a = R[0] * 1.55 * scale; b = R[0] * 1.05 * open_ * scale
    tt = np.clip(1 - ((xx - cx) / a) ** 2, 0, 1); top = cy - b * np.sqrt(tt); bot = cy + b * np.sqrt(tt)
    inside = ((yy > top) & (yy < bot) & (np.abs(xx - cx) < a)).astype(np.float32)
    return cv2.GaussianBlur(inside, (0, 0), 5)[..., None]

def frame_B(t):
    skin = np.zeros((OH, OW, 3), np.float32) + np.array([18, 22, 32])
    # opening 0.35-0.85, blink 1.75-2.0, expand 2.35-2.85
    o = smooth((t - 0.35) / 0.5)
    if 1.75 < t < 2.0: o = 1 - math.sin(math.pi * (t - 1.75) / 0.25) * 0.95
    grow = 1 + 3.2 * smooth((t - 2.35) / 0.5) ** 2
    iris = scale_about(sat, 1.0 + 0.05 * smooth(t / DUR), cx, cy)
    # pupil dilation: darken centre slightly then release
    dil = 0.35 * math.exp(-((t - 1.2) / 0.3) ** 2)
    iris = iris * (1 - dil * np.exp(-(d / 70) ** 2)[..., None])
    m = eyelid(max(o, 0.02), grow)
    fr = iris * m + skin * (1 - m)
    hl = np.exp(-(((xx - (cx + R[1]*0.5)) / 45) ** 2 + ((yy - (cy - R[1]*0.5)) / 30) ** 2))[..., None] * o * (1 / grow)
    fr = fr + 210 * hl
    # red glow rim when it 'looks' at you
    rim = np.exp(-((d - R[0]*1.02) / 25) ** 2)[..., None] * math.exp(-((t - 0.95) / 0.2) ** 2)
    fr = fr + np.array([20, 20, 140]) * rim
    sh = (math.sin(t*41)*4*o, math.cos(t*33)*4*o)
    fr = scale_about(fr, 1.0, dx=sh[0], dy=sh[1])
    if t < 2.3:
        blocks = [([("Something in the Sahara", (255,255,255))], 230, 78, pop(t, 0.05), 1),
                  ([("is WATCHING...", (255,80,80))], 230 + 93, 86, pop(t, 0.75), 1)]
    else:
        blocks = [([("A 40 km EYE", (255,138,31)), ("visible from space", (255,255,255))], 1460, 100, pop(t, 2.3), 1)]
    return draw_text(fr, blocks)

f = frame_A if MODE == 'A' else frame_B
N = int(DUR * FPS)
p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                      '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS
    fr = f(t)
    w = smooth((t - (DUR - 0.22)) / 0.22)                    # punch + flash into globe
    if w > 0:
        fr = scale_about(fr, 1 + 0.6 * w) * (1 - w) + spin0 * w
        fr = fr * (1 - 0.6 * math.sin(math.pi * w)) + 255 * 0.6 * math.sin(math.pi * w)
    p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
p.stdin.close(); p.wait(); print('ok', OUT)
