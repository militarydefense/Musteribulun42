#!/usr/bin/env python3
"""2.5D cinematic renderer: photoreal plate + monocular depth ->
parallax camera (dolly / truck / pedestal / crane), depth-based atmosphere,
camera-driven shutter motion blur (sub-frames only when the camera moves),
1.5x supersampled float buffer, then ONE unified post pass:
bloom (quarter-res) -> exposure -> ACES filmic -> grade -> grain -> sRGB.

usage: render25d.py shots.json out.mp4 [first_frame last_frame]   (frames at 60 fps)
shots.json: list of shots; each shot:
 {"img":..., "dur":s, "focus":[x,y] (0..1), "zoom":[s0,s1], "truck":[x0,x1], "ped":[y0,y1],
  "dolly":[d0,d1] (depth-weighted push), "fog":{"col":[r,g,b],"amt":a,"pow":p},
  "grade":{"lift":[..],"gain":[..],"sat":s,"exp":e}, "ease":"inout|in|out|lin",
  "tin":"speed"|"cross", "tout":"speed"|"cross"}
"""
import sys, json, math, subprocess
import numpy as np, cv2

FPS = 60; OW, OH = 1080, 1920; SS = 1.5
RW, RH = int(OW * SS), int(OH * SS)
SHOTS = json.load(open(sys.argv[1])); OUT = sys.argv[2]
cv2.setNumThreads(4)

def srgb2lin(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
def lin2srgb(x): x = np.clip(x, 0, 1); return np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)
def aces(x):   # Narkowicz ACES filmic fit (input linear, ~0.6 exposure pre-scale)
    a, b, c, d, e = 2.51, 0.03, 2.43, 0.59, 0.14
    return np.clip((x * (a * x + b)) / (x * (c * x + d) + e), 0, 1)
def ease(u, kind):
    u = min(max(u, 0.0), 1.0)
    if kind == 'lin': return u
    if kind == 'in': return u * u
    if kind == 'out': return 1 - (1 - u) ** 2
    return u * u * (3 - 2 * u) if kind == 'inout' else u

class Plate:
    def __init__(self, sh):
        im = cv2.imread(sh['img'], cv2.IMREAD_COLOR)
        dp = np.load(sh['img'].rsplit('.', 1)[0] + '_depth.npy').astype(np.float32)
        ih, iw = im.shape[:2]
        # cover-fit into RWxRH with margin for camera moves
        m = sh.get('margin', 1.12)
        sc = max(RW / iw, RH / ih) * m
        W, H = int(round(iw * sc)), int(round(ih * sc))
        lin = srgb2lin(im.astype(np.float32) / 255.0)
        self.img = cv2.resize(lin.astype(np.float32), (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
        # unsharp to restore micro-detail lost in upscale
        bl = cv2.GaussianBlur(self.img, (0, 0), 1.2 * sc)
        self.img = np.clip(self.img + 0.35 * (self.img - bl), 0, None).astype(np.float32)
        d = cv2.resize(dp, (W, H), interpolation=cv2.INTER_CUBIC)
        # edge-aware depth: guided-ish smoothing keeps silhouettes, kills noise
        d = cv2.bilateralFilter(d, 9, 0.08, 7)
        self.depth = d.astype(np.float32); self.W, self.H = W, H
        self.bright = None
        g = cv2.cvtColor(np.clip(self.img, 0, 1), cv2.COLOR_BGR2GRAY)
        self.bright = np.clip((g - 0.55) / 0.45, 0, 1).astype(np.float32)
        fog = sh.get('fog', {})
        self.fog_col = srgb2lin(np.array(fog.get('col', [0.6, 0.62, 0.66]), np.float32)[::-1]).astype(np.float32)
        self.fog_amt = fog.get('amt', 0.0); self.fog_pow = fog.get('pow', 2.0)
        yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
        self.xx, self.yy = xx, yy

    def cam(self, sh, u):
        e = ease(u, sh.get('ease', 'inout'))
        L = lambda k, dflt: (lambda a: a[0] + (a[1] - a[0]) * e)(sh.get(k, dflt))
        return dict(zoom=L('zoom', [1, 1]), truck=L('truck', [0, 0]), ped=L('ped', [0, 0]), dolly=L('dolly', [0, 0]))

    def prep_fog(self):
        if not hasattr(self, 'scat'):
            sm = cv2.resize(self.img * self.bright[..., None], (self.W // 4, self.H // 4), interpolation=cv2.INTER_AREA)
            sm = cv2.GaussianBlur(sm, (0, 0), 10) * 1.5
            self.scat = cv2.resize(sm, (self.W, self.H), interpolation=cv2.INTER_LINEAR).astype(np.float32)

    def maps(self, sh, c, iters=2, step=1):
        fx, fy = sh.get('focus', [0.5, 0.5])
        cx, cy = fx * self.W, fy * self.H
        z, tx, ty, dl = c['zoom'], c['truck'] * RW, c['ped'] * RH, c['dolly']
        ox = self.xx[::step, ::step] - RW / 2; oy = self.yy[::step, ::step] - RH / 2
        d = np.full_like(ox, 0.5)
        for _ in range(iters):
            s = z * (1.0 + dl * d)
            mx = (cx + (ox - tx * d) / s).astype(np.float32); my = (cy + (oy - ty * d) / s).astype(np.float32)
            d = cv2.remap(self.depth, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        return mx, my, d

    def shade(self, mx, my, d):
        col = cv2.remap(self.img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        if self.fog_amt > 0:
            self.prep_fog()
            scat = cv2.remap(self.scat, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            f = (self.fog_amt * (1 - np.clip(d, 0, 1)) ** self.fog_pow)[..., None]
            col = col * (1 - f) + (self.fog_col + scat) * f
        return col

def post(lin, sh, t, rng):
    """single unified pass at output res (input already downsampled from SS buffer)"""
    g = sh.get('grade', {})
    x = lin * (2 ** g.get('exp', 0.0))
    small = cv2.resize(x, (OW // 4, OH // 4), interpolation=cv2.INTER_AREA)
    hi = np.clip(small - g.get('bloom_th', 0.8), 0, None)
    bloom = cv2.GaussianBlur(hi, (0, 0), 6) + cv2.GaussianBlur(hi, (0, 0), 18) * 0.6
    x = x + cv2.resize(bloom, (OW, OH), interpolation=cv2.INTER_LINEAR) * g.get('bloom', 0.25)
    x = aces(x * 0.8)
    lift = np.array(g.get('lift', [0, 0, 0]), np.float32)[::-1]; gain = np.array(g.get('gain', [1, 1, 1]), np.float32)[::-1]
    x = np.clip(x * gain + lift * (1 - x), 0, 1)
    lum = (x * np.array([0.0722, 0.7152, 0.2126], np.float32)).sum(-1, keepdims=True)
    x = lum + (x - lum) * g.get('sat', 1.0)
    out = lin2srgb(x)
    # film grain: luma-weighted, fine, temporally random
    gn = rng.standard_normal((OH, OW, 1)).astype(np.float32)
    gn = cv2.GaussianBlur(gn, (0, 0), 0.6)[..., None]
    out = out + gn * g.get('grain', 0.018) * (0.4 + 0.6 * (1 - np.abs(out - 0.5) * 2))
    # vignette
    out = out * VIG
    return np.clip(out, 0, 1)

yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
VIG = np.clip(1 - 0.16 * (((xx - OW / 2) / (OW / 2)) ** 2 + ((yy - OH / 2) / (OH / 2)) ** 2) ** 1.4, 0, 1)[..., None]

def shot_frame(pl, sh, u, du, rng):
    """camera-driven shutter motion blur: per-pixel camera motion vectors, extra
    colour taps along them only when the camera actually moves (180-degree shutter)"""
    mx, my, d = pl.maps(sh, pl.cam(sh, u))
    mxs, mys, _ = pl.maps(sh, pl.cam(sh, min(u + du * 0.5, 1.0)), iters=2, step=8)
    mx0s, my0s = mx[::8, ::8], my[::8, ::8]
    disp = float(np.percentile(np.hypot(mxs - mx0s, mys - my0s), 90)) * (RW / pl.W)
    n = int(min(5, math.ceil(disp / 1.2)))
    col = pl.shade(mx, my, d)
    if n >= 2:
        dx = cv2.resize(mxs - mx0s, (RW, RH), interpolation=cv2.INTER_LINEAR)
        dy = cv2.resize(mys - my0s, (RW, RH), interpolation=cv2.INTER_LINEAR)
        acc = col.copy()
        for k in range(1, n):
            a = k / (n - 1)
            acc += cv2.remap(pl.img, mx + dx * a, my + dy * a, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT) * 1.0
        blur = acc / n
        if pl.fog_amt > 0:   # keep haze identical: blur only the surface term
            f = (pl.fog_amt * (1 - np.clip(d, 0, 1)) ** pl.fog_pow)[..., None]
            surf = cv2.remap(pl.img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
            col = col + (blur - surf) * (1 - f)
        else:
            col = blur
    return cv2.resize(col, (OW, OH), interpolation=cv2.INTER_AREA), n

XF = 0.3   # transition length (s)
def main():
    starts = np.cumsum([0] + [s['dur'] for s in SHOTS]); total = starts[-1]
    N = int(round(total * FPS))
    f0, f1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, N)
    plates = {}
    rng = np.random.default_rng(f0 + 7)
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
    for f in range(f0, f1):
        t = f / FPS; k = min(int(np.searchsorted(starts, t, side='right') - 1), len(SHOTS) - 1)
        sh = SHOTS[k]
        if k not in plates:
            plates = {j: v for j, v in plates.items() if j >= k - 1}; plates[k] = Plate(sh)
        pre = XF if k > 0 else 0.0
        u = (t - starts[k] + pre) / (sh['dur'] + pre); du = 1 / (FPS * (sh['dur'] + pre))
        fr, _ = shot_frame(plates[k], sh, u, du, rng)
        # motivated transition: last XF s of a shot dissolve into the next shot's already-moving camera
        rem = starts[k + 1] - t
        if rem < XF and k + 1 < len(SHOTS):
            nx = SHOTS[k + 1]
            if k + 1 not in plates: plates[k + 1] = Plate(nx)
            w = (1 - rem / XF); w = w * w * (3 - 2 * w)
            un = (t - starts[k + 1] + XF) / (nx['dur'] + XF)
            nf, _ = shot_frame(plates[k + 1], nx, max(un, 0.0), 1 / (FPS * (nx['dur'] + XF)), rng)
            fr = fr * (1 - w) + nf * w
            g = sh if w < 0.5 else nx
        else:
            g = sh
        out = post(fr, g, t, rng)
        p.stdin.write((out * 255 + 0.5).astype(np.uint8).tobytes())
        if f % 60 == 0: print('frame', f, '/', f1, flush=True)
    p.stdin.close(); p.wait(); print('ok', OUT)

if __name__ == '__main__':
    main()
