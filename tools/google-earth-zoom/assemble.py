#!/usr/bin/env python3
"""Assemble: spin+zoom (zoom_spin.mp4) -> dive transition -> 360 ground pan,
then on-screen text, attribution, voice-over and sound design.
usage: assemble.py dive              -> dive.mp4 (needs zoom_spin.mp4 + ground.mp4)
       assemble.py final tr|en out.mp4
"""
import sys, os, math, subprocess, json
import numpy as np, cv2

GE = '../ge'; TTS = '../tts'
OW, OH, FPS = 1080, 1920, 60
Z_END = 19.0        # end of spin+zoom clip
DIVE = 0.9
G_DUR = 11.1
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
    gray = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    m = (gray > 225).astype(np.uint8); m[:300] = 0; m[-300:] = 0
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); cx, cy = cen[k]
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

TEXT = {
 'tr': dict(
   texts=[(0.0, 3.4, "Bu tepenin altında\nPİRAMİTLERDEN ESKİ\nbir şey var...", 84, 1280),
          (7.1, 11.7, "Şanlıurfa, Türkiye", 76, 260),
          (14.9, 19.0, "GÖBEKLİTEPE", 124, 250),
          (15.6, 19.6, "Yaklaşık 11.600 yıllık.\nStonehenge'den\n6.000 yıldan fazla eski.", 70, 1300),
          (20.3, 25.2, "Onu yapanlar\nçiftçi değil,\navcı-toplayıcılardı.", 70, 1300),
          (25.4, TOTAL, "Büyük kısmı hâlâ\ntoprağın altında.\nOrada başka ne var?", 70, 1300)],
   attr_air='Görüntü: Google Earth', attr_gnd='Street View: Gezgin / Google',
   vo=[(0.2, 'tr_0.mp3'), (5.4, 'tr_1.mp3'), (15.2, 'tr_2.mp3'), (20.2, 'tr_3.mp3'), (25.3, 'tr_4.mp3')]),
 'en': dict(
   texts=[(0.0, 3.4, "Under this hill lies\nsomething OLDER\nTHAN THE PYRAMIDS...", 74, 1290),
          (7.1, 11.7, "Şanlıurfa, Türkiye", 76, 260),
          (14.9, 19.0, "GÖBEKLI TEPE", 124, 250),
          (15.6, 19.6, "About 11,600 years old.\nMore than 6,000 years\nolder than Stonehenge.", 70, 1300),
          (20.3, 25.2, "It wasn't built\nby farmers, but by\nhunter-gatherers.", 70, 1300),
          (25.4, TOTAL, "Most of it is still\nburied underground.\nWhat else is down there?", 70, 1300)],
   attr_air='Imagery: Google Earth', attr_gnd='Street View: Gezgin / Google',
   vo=[(0.25, 'en_0.mp3'), (5.0, 'en_1.mp3'), (15.4, 'en_2.mp3'), (20.4, 'en_3.mp3'), (25.8, 'en_4.mp3')]),
}

def final(lang, out):
    C = TEXT[lang]
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{GE}/zoom_spin.mp4', '-i', 'dive.mp4', '-i', 'ground.mp4',
                    '-filter_complex', '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]', '-map', '[v]',
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
    for nm, txt, s, e in (('a1', C['attr_air'], 0, Z_END + DIVE * 0.5), ('a2', C['attr_gnd'], Z_END + DIVE * 0.5, TOTAL)):
        fp = f'ftxt_{lang}/{nm}.txt'; open(fp, 'w').write(txt)
        dts.append(f"drawtext=fontfile={FONT}:expansion=none:textfile={fp}:fontcolor=white@0.85:fontsize=30"
                   f":borderw=3:bordercolor=black@0.8:x=w-text_w-34:y=h-80:enable='between(t,{s},{e})'")
    LAND, DV = 16.3, Z_END
    drone = ("aevalsrc='0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.2*t))+0.10*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.13*t+1))"
             f"+0.07*sin(2*PI*110*t)+0.04*sin(2*PI*164.8*t)*(0.5+0.5*sin(2*PI*0.07*t))':s=48000:d={TOTAL}")
    boom = lambda T, g: f"{g}*gt(t,{T})*sin(2*PI*(36+80*exp(-10*(t-{T})))*(t-{T}))*exp(-2.8*(t-{T}))"
    hits = f"aevalsrc='{boom(0.02, 0.6)}+{boom(LAND, 0.9)}+{boom(DV + DIVE*0.65, 0.8)}':s=48000:d={TOTAL}"
    ins = ['-i', 'base.mp4', '-f', 'lavfi', '-i', drone,
           '-f', 'lavfi', '-i', f'anoisesrc=color=pink:amplitude=0.6:s=48000:d={TOTAL}', '-f', 'lavfi', '-i', hits]
    vo_f = []
    for k, (t0, fn) in enumerate(C['vo']):
        ins += ['-i', f'{TTS}/{fn}']
        vo_f.append(f"[{4+k}:a]aresample=48000,adelay={int(t0*1000)}|{int(t0*1000)},apad=whole_dur={TOTAL}[v{k}]")
    nv = len(C['vo'])
    fc = ("[0:v]" + ",".join(dts) + "[v];"
          "[1:a]lowpass=f=700,aecho=0.8:0.6:140:0.3[dr];"
          "[2:a]highpass=f=250,lowpass=f=2600,"
          f"volume='0.02+0.50*exp(-pow((t-13.7)/2.0,2))+0.65*exp(-pow((t-{DV+0.45})/0.35,2))':eval=frame[wh];"
          "[3:a]lowpass=f=300[hit];"
          "[dr][wh][hit]amix=inputs=3:normalize=0,volume=0.45[bg];"
          + ";".join(vo_f) + ";"
          + "".join(f"[v{k}]" for k in range(nv)) + f"amix=inputs={nv}:normalize=0,volume=1.6,asplit=2[vo][sc];"
          "[bg][sc]sidechaincompress=threshold=0.06:ratio=3:attack=30:release=450:makeup=1[bgd];"
          "[bgd][vo]amix=inputs=2:normalize=0,"
          f"afade=t=in:d=0.3,afade=t=out:st={TOTAL-1.5}:d=1.5,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
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
    if sys.argv[1] == 'dive': dive()
    else: final(sys.argv[2], sys.argv[3])
