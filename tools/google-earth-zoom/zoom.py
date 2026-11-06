#!/usr/bin/env python3
"""Seamless 60fps zoom from a stack of nadir stills (k00 = closest).
usage: zoom.py register            -> writes reg.json (still->global affines)
       zoom.py render out.mp4 [t0 t1]  -> pipes frames to ffmpeg (video only)
       zoom.py frame t out.png
"""
import json, sys, math, subprocess
import numpy as np, cv2

PLAN = json.load(open('plan.json'))
N = len(PLAN)
W, H = 1060, 1884          # still size
OW, OH = 1080, 1920        # output size
FPS = 60

def load(k):
    return cv2.imread(f'stills/k{k:02d}.png', cv2.IMREAD_COLOR)

def sim(s, a_deg, cx=W/2, cy=H/2):
    a = math.radians(a_deg); c, si = s*math.cos(a), s*math.sin(a)
    # maps p -> C + sR(p - C)
    return np.array([[c, -si, cx - c*cx + si*cy], [si, c, cy - si*cx - c*cy], [0, 0, 1]], np.float64)

def register():
    A = [np.eye(3)]
    out = []
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
    f = 0.25
    prev = load(0)
    for k in range(N - 1):
        far = load(k + 1)
        dn, df = PLAN[k][1], PLAN[k+1][1]
        dh = PLAN[k+1][2] - PLAN[k][2]
        g1 = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(prev, None, fx=f, fy=f, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY), (5,5), 0)
        g2 = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(far, None, fx=f, fy=f, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY), (5,5), 0)
        best = None
        for sign in (1, -1):
            init = sim(dn/df, sign*dh, W*f/2, H*f/2)[:2].astype(np.float32)
            try:
                rho, Wm = cv2.findTransformECC(g1, g2, init.copy(), cv2.MOTION_AFFINE, crit, None, 5)
            except cv2.error:
                rho, Wm = -1, init
            if best is None or rho > best[0]:
                best = (rho, Wm, sign)
            if dh == 0: break
        rho, Wm, sign = best
        M = np.vstack([Wm.astype(np.float64), [0, 0, 1]])
        M[0, 2] /= f; M[1, 2] /= f              # near(px) -> far(px), full res
        s = math.sqrt(abs(np.linalg.det(M[:2, :2])))
        ok = rho > 0.5 and abs(s - dn/df) < 0.08
        if not ok:   # fall back to nominal geometry
            M = sim(dn/df, sign*dh)
        A.append(A[-1] @ np.linalg.inv(M))
        out.append(dict(k=k, rho=float(rho), scale=s, nominal=dn/df, sign=sign, ok=bool(ok)))
        print(f'k{k:02d}->k{k+1:02d} rho={rho:.3f} s={s:.4f} (nom {dn/df:.4f}) sign={sign} ok={ok}', flush=True)
        prev = far
    json.dump(dict(A=[a.tolist() for a in A], info=out), open('reg.json', 'w'))

# ---------------- camera path ----------------
def pchip(xs, ys):
    xs, ys = np.asarray(xs, float), np.asarray(ys, float)
    h = np.diff(xs); d = np.diff(ys) / h
    m = np.zeros_like(ys)
    for i in range(1, len(xs) - 1):
        if d[i-1] * d[i] > 0:
            w1, w2 = 2*h[i] + h[i-1], h[i] + 2*h[i-1]
            m[i] = (w1 + w2) / (w1/d[i-1] + w2/d[i])
    m[0], m[-1] = 0.0, d[-1] * 0.6
    def f(x):
        i = int(np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2))
        t = (x - xs[i]) / h[i]; t = min(max(t, 0.0), 1.0)
        h00, h10, h01, h11 = 2*t**3-3*t**2+1, t**3-2*t**2+t, -2*t**3+3*t**2, t**3-t**2
        return h00*ys[i] + h10*h[i]*m[i] + h01*ys[i+1] + h11*h[i]*m[i+1]
    return f

KEYS = json.load(open('path.json'))  # {"t":[...], "D":[...], "spin_end": deg}
logD = pchip(KEYS['t'], [math.log(v) for v in KEYS['D']])
TOTAL = KEYS['t'][-1]

def smooth(x): x = min(max(x, 0.0), 1.0); return x*x*(3 - 2*x)

class Stack:
    def __init__(self):
        reg = json.load(open('reg.json'))
        self.A = [np.array(a) for a in reg['A']]
        self.imgs = [None] * N
        self.pyr = [None] * N
        self.logd = np.array([math.log(p[1]) for p in PLAN])
        cen = np.array([W/2, H/2, 1.0])
        self.c = np.array([(a @ cen)[:2] for a in self.A])
        self.phi = np.unwrap(np.array([math.atan2(a[1, 0], a[0, 0]) for a in self.A]))
        self.sig = np.array([math.sqrt(abs(np.linalg.det(a[:2, :2]))) for a in self.A])
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = 0.10 * W
        e = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy]) / r
        self.feather = np.clip(e, 0, 1) ** 1.5
    def img(self, k):
        if self.imgs[k] is None:
            im = load(k).astype(np.float32)
            self.imgs[k] = im
            p = [im]
            for _ in range(4):
                p.append(cv2.pyrDown(p[-1]))
            self.pyr[k] = p
        return self.imgs[k]
    def interp(self, arr, ld):
        x = self.logd
        return np.array([np.interp(ld, x, arr[:, j]) for j in range(arr.shape[1])]) if arr.ndim == 2 else np.interp(ld, x, arr)
    def view(self, t):
        ld = logD(t)
        c = self.interp(self.c, ld)
        phi = float(self.interp(self.phi, ld)) + math.radians(KEYS.get('spin_end', 0)) * smooth((t - KEYS['t'][-3]) / (TOTAL - KEYS['t'][-3]))
        # global px per output px; still k spans W px of its own at sigma_k global/px
        sig = math.exp(np.interp(ld, self.logd, np.log(self.sig)) + (ld - np.interp(ld, self.logd, self.logd)))
        s = sig * W / OW
        cs, sn = s*math.cos(phi), s*math.sin(phi)
        V = np.array([[cs, -sn, c[0] - cs*OW/2 + sn*OH/2], [sn, cs, c[1] - sn*OW/2 - cs*OH/2], [0, 0, 1]])
        return V, ld
    def frame(self, t):
        V, ld = self.view(t)
        corners = np.array([[0, 0, 1], [OW, 0, 1], [0, OH, 1], [OW, OH, 1]], float).T
        # finest still that fully covers the view
        base = N - 1
        for k in range(N):
            q = np.linalg.inv(self.A[k]) @ V @ corners
            if q[0].min() >= 0 and q[1].min() >= 0 and q[0].max() <= W - 1 and q[1].max() <= H - 1:
                base = k; break
        out = None
        # draw one coarser level underneath so switching the covering still is seamless
        start = min(base + 1, N - 1)
        for k in range(start, max(-1, base - 5), -1):
            M = np.linalg.inv(self.A[k]) @ V          # output px -> still px
            spp = math.sqrt(abs(np.linalg.det(M[:2, :2])))   # still px per output px
            rel = 1.0 / spp * W / OW                    # still width / view width
            a_fade = smooth((rel - 0.30) / 0.45)
            if k != start and a_fade <= 0: break
            self.img(k)
            lvl = 0
            while spp > 1.6 and lvl < 4:
                spp /= 2; lvl += 1
            src = self.pyr[k][lvl]
            Ml = np.diag([0.5**lvl, 0.5**lvl, 1.0]) @ M
            Ml[0, 2] += 0.5**lvl * 0 ; Ml[1, 2] += 0
            warped = cv2.warpAffine(src, Ml[:2], (OW, OH), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
            if out is None:
                out = warped
                continue
            fm = cv2.warpAffine(self.feather, M[:2], (OW, OH), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderValue=0)
            a = (fm * a_fade)[..., None]
            out = out * (1 - a) + warped * a
        return np.clip(out, 0, 255).astype(np.uint8)

def render(path, t0=0.0, t1=None):
    st = Stack()
    t1 = TOTAL if t1 is None else t1
    n = int(round((t1 - t0) * FPS))
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(st.frame(t0 + i / FPS).tobytes())
        if i % 120 == 0: print('frame', i, '/', n, flush=True)
    p.stdin.close(); p.wait()

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'register': register()
    elif cmd == 'render': render(sys.argv[2], *(float(x) for x in sys.argv[3:5]))
    elif cmd == 'frame': cv2.imwrite(sys.argv[3], Stack().frame(float(sys.argv[2])))
