#!/usr/bin/env python3
"""Assemble: spin+zoom (zoom_spin.mp4) -> dive transition -> 360 ground pan,
then on-screen text, attribution, voice-over and sound design.
usage: assemble.py dive              -> dive.mp4 (needs zoom_spin.mp4 + ground.mp4)
       assemble.py final tr|en out.mp4
"""
import sys, os, math, subprocess, json
import numpy as np, cv2

GE = '.'; TTS = 'tts'
OW, OH, FPS = 1080, 1920, 60
HOOK = 3.0
SH = HOOK - 1.6   # shift of everything after the hook vs. the 1.6 s plan
Z_END = HOOK + 12.0  # end of hook+spin+zoom
DIVE = 0.9
G_DUR = 9.5
TOTAL = Z_END + DIVE + G_DUR
FONT = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'

def last_frame(fn):
    cap = cv2.VideoCapture(fn); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.set(cv2.CAP_PROP_POS_FRAMES, n - 1); ok, f = cap.read(); return f

def first_frame(fn):
    cap = cv2.VideoCapture(fn); ok, f = cap.read(); return f

def scale_about(img, s, cx, cy):
    M = np.array([[s, 0, cx - s*cx], [0, s, cy - s*cy]], np.float32)
    return cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

def smooth(x): x = min(max(x, 0.0), 1.0); return x*x*(3 - 2*x)

def dive():
    a = last_frame(f'{GE}/zoom_spin.mp4').astype(np.float32)
    g = first_frame('ground.mp4').astype(np.float32)
    # target: the big round shelter (largest bright blob)
    cx, cy = OW / 2, OH / 2
    print('dive target', cx, cy)
    N = int(round(DIVE * FPS))
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', 'dive.mp4'], stdin=subprocess.PIPE)
    for i in range(N):
        u = (i + 1) / N
        # aerial: accelerate into the shelter with zoom blur, drifting target to centre
        s = math.exp(smooth(u / 0.75) * math.log(6.0))
        tx, ty = cx + (OW/2 - cx) * smooth(u / 0.75), cy + (OH/2 - cy) * smooth(u / 0.75)
        acc = np.zeros_like(a)
        taps = 7
        for j in range(taps):
            sj = s * (1 - 0.06 * smooth(u * 1.6) * j / (taps - 1))
            M = np.array([[sj, 0, tx - sj*cx], [0, sj, ty - sj*cy]], np.float32)
            acc += cv2.warpAffine(a, M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        air = acc / taps
        # ground: arrives from slightly zoomed + blurred to sharp, scale 1 at the end
        w = smooth((u - 0.40) / 0.45)
        gs = 1.0 + 0.25 * (1 - smooth((u - 0.40) / 0.60))
        gr = scale_about(g, gs, OW/2, OH/2)
        bl = 1 - smooth((u - 0.55) / 0.45)
        if bl > 0.02:
            gr = cv2.GaussianBlur(gr, (0, 0), 6 * bl)
        fr = air * (1 - w) + gr * w
        flash = 0.22 * math.exp(-((u - 0.62) / 0.12) ** 2)
        fr = fr * (1 - flash) + 255 * flash
        p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()


def hook():
    """3 s 'classified satellite feed' hook: dark grade, scanlines, grain, HUD,
    red line tracing the formation, then a white flash into the globe."""
    from PIL import Image, ImageDraw, ImageFont
    im = cv2.imread(os.environ.get('HOOK_STILL', 'stills/k07.png')).astype(np.float32)
    sc = OW / im.shape[1]
    im = cv2.resize(im, (OW, OH), interpolation=cv2.INTER_CUBIC)
    raw = json.load(open('outline.json'))
    if isinstance(raw[0][0], (int, float)): raw = [raw]
    RINGS = []
    for poly in raw:
        P = np.array(poly, float) * [OW / 1060, OH / 1884]
        for _ in range(3):
            Q = np.roll(P, -1, 0); P = np.concatenate([0.75*P + 0.25*Q, 0.25*P + 0.75*Q], 1).reshape(-1, 2)
        P = np.vstack([P, P[:1]])
        seg = np.hypot(*np.diff(P, axis=0).T); cum = np.concatenate([[0], np.cumsum(seg)])
        RINGS.append((P, seg, cum))
    # grade: desaturate, cool/dark tint, contrast
    g = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None]
    base = 0.35 * im + 0.65 * g
    base = (base - 128) * 1.25 + 110
    base = base * np.array([1.08, 1.0, 0.86])  # BGR: slight teal
    yy, xx = np.mgrid[0:OH, 0:OW]
    vig = np.clip(1 - 0.75 * ((((xx-OW/2)/(OW/2))**2 + ((yy-OH/2)/(OH/2))**2) / 2) ** 1.2, 0, 1)[..., None]
    scan = (1 - 0.13 * ((yy % 4) < 2))[..., None]
    spin0 = cv2.resize(cv2.imread('spin/s000.png'), (OW, OH), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    f_small = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', 34)
    f_rec = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', 40)
    rng = np.random.default_rng(3)
    N = int(round(HOOK * FPS))
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', 'hook.mp4'], stdin=subprocess.PIPE)
    for i in range(N):
        t = i / FPS; u = i / (N - 1)
        s = 1.0 + 0.09 * smooth(u)
        fr = scale_about(base, s, OW/2, OH/2)
        # moving scan band
        band = 18 * np.exp(-((yy - ((t * 900) % (OH + 400) - 200)) / 60.0) ** 2)[..., None]
        fr = fr * scan * vig + band
        fr += rng.normal(0, 9, (OH, OW, 1)).astype(np.float32)
        # outline drawing (0.3 .. 2.1 s), then pulse
        prog = smooth((t - 0.3) / 1.8)
        if prog > 0:
            layer = np.zeros((OH, OW), np.float32); tips = []
            for ri, (P, seg, cum) in enumerate(RINGS):
                pr = smooth((t - 0.3 - 0.25 * ri) / 1.5)
                if pr <= 0: continue
                L = pr * cum[-1]; k = np.searchsorted(cum, L)
                Pk = P[:max(k, 1)]
                if k < len(P):
                    r = (L - cum[k-1]) / max(seg[k-1], 1e-6); Pk = np.vstack([Pk, P[k-1] + r * (P[k] - P[k-1])])
                Ps = (s * (Pk - [OW/2, OH/2]) + [OW/2, OH/2]).astype(np.int32)
                cv2.polylines(layer, [Ps], False, 1.0, 8, cv2.LINE_AA)
                if pr < 1: tips.append(Ps[-1])
            pulse = 1.0 + (0.5 * math.sin(2*math.pi*3*(t-2.1)) ** 2 if t > 2.1 else 0)
            glow = cv2.GaussianBlur(layer, (0, 0), 14) * 2.2 * pulse
            col = np.array([40, 40, 255], np.float32)
            fr = fr * (1 - np.clip(layer, 0, 1)[..., None]) + col * layer[..., None] + col * np.clip(glow, 0, 1.2)[..., None] * 0.6
            # tip spark
            for tp in tips:
                cv2.circle(fr, tuple(int(v) for v in tp), 11, (200, 220, 255), -1, cv2.LINE_AA)
        # HUD
        pil = Image.fromarray(cv2.cvtColor(fr.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(pil)
        if int(t * 2) % 2 == 0: d.ellipse((60, 150, 90, 180), fill=(255, 40, 40))
        d.text((104, 142), 'REC', font=f_rec, fill=(255, 255, 255))
        d.text((60, 205), 'SATELLITE FEED // CLASSIFIED', font=f_small, fill=(255, 255, 255, 200))
        fs = int(t * FPS) % FPS
        d.text((OW - 330, 150), f'00:00:{int(t):02d}:{fs:02d}', font=f_rec, fill=(255, 255, 255))
        d.text((60, OH - 150), '21.1240\u00b0N  11.4020\u00b0W   ALT 100 km', font=f_small, fill=(255, 255, 255))
        for (x0, y0, dx, dy) in ((40, 120, 1, 1), (OW-40, 120, -1, 1), (40, OH-100, 1, -1), (OW-40, OH-100, -1, -1)):
            d.line((x0, y0, x0 + 70*dx, y0), fill=(255, 255, 255), width=5); d.line((x0, y0, x0, y0 + 70*dy), fill=(255, 255, 255), width=5)
        fr = cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR).astype(np.float32)
        # last 0.22 s: punch-in + white flash into the globe
        w = smooth((t - (HOOK - 0.22)) / 0.22)
        if w > 0:
            fr = scale_about(fr, 1 + 0.6 * w, OW/2, OH/2) * (1 - w) + spin0 * w
            fr = fr * (1 - 0.6 * math.sin(math.pi * w)) + 255 * 0.6 * math.sin(math.pi * w)
        p.stdin.write(fr.clip(0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()

TEXT = {
 'en': dict(
   texts=[(3.15, 8.4, "Karakum Desert,\nTurkmenistan", 72, 250),
          (8.6, Z_END, "THE GATES\nOF HELL", 112, 220),
          (8.7, Z_END - 0.1, "1971: a Soviet drill\nhit a gas pocket", 66, 1300),
          (15.9, 19.3, "They set it on fire,\nhoping it would stop\nin weeks...", 64, 1300),
          (19.4, 23.0, "54 years later:\nthe flames are\nfinally dying", 64, 1300),
          (23.0, TOTAL, "Would you visit\nbefore it's gone?", 74, 1300)],
   attr_air='Imagery: Google Earth', attr_gnd='Street View: Sanju Mehta / Google',
   vo=[(0.3, 'en_0.mp3'), (3.1, 'en_1.mp3'), (8.7, 'en_2.mp3'), (15.9, 'en_3.mp3'), (19.4, 'en_4.mp3')]),
}

def final(lang, out):
    C = TEXT[lang]
    V = os.environ.get('VARIANT')
    if V:
        C = dict(C); C['texts'] = C['texts'][1:]
        C['vo'] = [((1.35, 'en_0.mp3') if V == 'A' else (0.45, 'en_0B.mp3'))] + C['vo'][1:]
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'hook.mp4', '-i', f'{GE}/zoom_spin.mp4', '-i', 'dive.mp4', '-i', 'ground.mp4',
                    '-filter_complex', '[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v]', '-map', '[v]',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', 'base.mp4'], check=True)
    os.makedirs(f'ftxt_{lang}', exist_ok=True)
    dts = []
    for i, (s, e, t, size, y) in enumerate(C['texts']):
        fp = f'ftxt_{lang}/{i}.txt'; open(fp, 'w').write(t)
        if s == 0: al = f"if(gt(t,{e}-0.25),({e}-t)/0.25,1)"
        else: al = f"if(lt(t,{s}+0.25),(t-{s})/0.25,if(gt(t,{e}-0.25),({e}-t)/0.25,1))"
        dts.append(f"drawtext=fontfile={FONT}:expansion=none:textfile={fp}:fontcolor=white:fontsize={size}"
                   f":line_spacing=18:borderw=7:bordercolor=black@0.9:shadowx=0:shadowy=6:shadowcolor=black@0.5"
                   f":x=(w-text_w)/2:y={y}:alpha='{al}':enable='between(t,{s},{e})'")
    for nm, txt, s, e in (('a1', C['attr_air'], HOOK, Z_END + DIVE * 0.5), ('a2', C['attr_gnd'], Z_END + DIVE * 0.5, TOTAL)):
        fp = f'ftxt_{lang}/{nm}.txt'; open(fp, 'w').write(txt)
        dts.append(f"drawtext=fontfile={FONT}:expansion=none:textfile={fp}:fontcolor=white@0.85:fontsize=30"
                   f":borderw=3:bordercolor=black@0.8:x=w-text_w-34:y=h-80:enable='between(t,{s},{e})'")
    LAND, DV = HOOK + 8.5, Z_END
    drone = ("aevalsrc='0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.2*t))+0.10*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.13*t+1))"
             f"+0.07*sin(2*PI*110*t)+0.04*sin(2*PI*164.8*t)*(0.5+0.5*sin(2*PI*0.07*t))':s=48000:d={TOTAL}")
    boom = lambda T, g: f"{g}*gt(t,{T})*sin(2*PI*(36+80*exp(-10*(t-{T})))*(t-{T}))*exp(-2.8*(t-{T}))"
    hits = f"aevalsrc='{boom(0.02, 0.6)}+{boom(LAND, 0.9)}+{boom(DV + DIVE*0.65, 0.8)}':s=48000:d={TOTAL}"
    MUSIC = os.environ.get('MUSIC')
    HH = {'A': [(0.12, 0.8), (1.28, 1.0), (2.0, 0.5)], 'B': [(0.75, 0.9), (2.3, 0.9)]}.get(os.environ.get('VARIANT'), [(0.3, 0.0)])
    hits = ("aevalsrc='" + "+".join(boom(a, b) for a, b in HH) + f"+{boom(LAND, 0.5)}':s=48000:d={TOTAL}") if MUSIC else hits
    ins = ['-i', 'base.mp4'] + (['-i', MUSIC] if MUSIC else ['-f', 'lavfi', '-i', drone]) + [
           '-f', 'lavfi', '-i', f'anoisesrc=color=pink:amplitude=0.6:s=48000:d={TOTAL}', '-f', 'lavfi', '-i', hits]
    vo_f = []
    for k, (t0, fn) in enumerate(C['vo']):
        ins += ['-i', f'{TTS}/{fn}']
        vo_f.append(f"[{4+k}:a]aresample=48000,adelay={int(t0*1000)}|{int(t0*1000)},apad=whole_dur={TOTAL}[v{k}]")
    nv = len(C['vo'])
    fc = ("[0:v]" + ",".join(dts) + "[v];" 
          + ("[1:a]aresample=48000,volume=0.78[dr];" if MUSIC else "[1:a]lowpass=f=700,aecho=0.8:0.6:140:0.3[dr];") +
          "[2:a]highpass=f=250,lowpass=f=2600,"
          f"volume='0.02+0.50*exp(-pow((t-{HOOK + 5.4})/2.0,2))+0.65*exp(-pow((t-{DV+0.45})/0.35,2))':eval=frame[wh];"
          "[3:a]lowpass=f=300[hit];"
          "[dr][wh][hit]amix=inputs=3:normalize=0,volume=0.45[bg];"
          + ";".join(vo_f) + ";"
          + "".join(f"[v{k}]" for k in range(nv)) + f"amix=inputs={nv}:normalize=0,volume=1.6,asplit=2[vo0][sc];[vo0]adelay=70|70[vo];"
          + ("[bg][sc]sidechaincompress=threshold=0.006:ratio=14:attack=8:release=380:makeup=1[bgd];" if MUSIC else "[bg][sc]sidechaincompress=threshold=0.06:ratio=3:attack=30:release=450:makeup=1[bgd];") +
          "[bgd][vo]amix=inputs=2:normalize=0,"
          f"afade=t=in:d=0.3,afade=t=out:st={TOTAL-0.7}:d=0.7,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    if os.environ.get('STEMS'):
        fs = fc.split('[v];', 1)[1].replace('[bgd][vo]amix=inputs=2:normalize=0,', '[vo]anullsink;[bgd]').replace('loudnorm=I=-14:TP=-1.5:LRA=11[a]', 'anull[a]')
        subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', fs, '-map', '[a]', '-t', f'{TOTAL}', '-ac', '1', '-ar', '16000', f'stem_bg_{lang}.wav'], check=True)
        fv = fc.split('[v];', 1)[1].replace('[bgd][vo]amix=inputs=2:normalize=0,', '[bgd]anullsink;[vo]').replace('loudnorm=I=-14:TP=-1.5:LRA=11[a]', 'anull[a]')
        subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', fv, '-map', '[a]', '-t', f'{TOTAL}', '-ac', '1', '-ar', '16000', f'stem_vo_{lang}.wav'], check=True)
        return
    cmd = ['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', f'{TOTAL}',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M',
           '-x264-params', 'keyint=2000:min-keyint=2000:scenecut=0', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '60',
           '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out]
    subprocess.run(cmd, check=True)
    print('ok', out, 'total', TOTAL)

if __name__ == '__main__':
    if sys.argv[1] == 'hook': hook()
    elif sys.argv[1] == 'dive': dive()
    else: final(sys.argv[2], sys.argv[3])
