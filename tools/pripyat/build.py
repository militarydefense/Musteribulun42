#!/usr/bin/env python3
"""Final assembly of the Pripyat film.
segA (AI: wheel, reactor, class) -> Earth zoom -> segB (AI aerial) -> 360 at the wheel.
Unified grade on the real footage so all shots share one look, motivated xfades,
titles, attribution, VO + ducked music, -14 LUFS.   usage: build.py out.mp4"""
import os, subprocess, sys, json
OUT = sys.argv[1]
FONT = '/usr/share/fonts/opentype/inter/Inter-Black.otf'; FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
X = 0.3
DUR = {'A': 14.0, 'Z': 3.6, 'B': 4.8, 'G': 7.6}
oZ = DUR['A'] - X; oB = oZ + DUR['Z'] - X; oG = oB + DUR['B'] - X; TOTAL = oG + DUR['G']
# one look for real footage: cool desaturated shadows, warm-neutral highs, grain, vignette
LOOK = ("eq=saturation=0.88:contrast=1.04:gamma=0.98,colorbalance=rs=-0.03:bs=0.04:rh=0.02:bh=-0.01,"
        "noise=alls=7:allf=t,vignette=PI/5")
TEXT = [  # (start, end, text, size, y, colour)
    (0.25, 4.0, "THIS RIDE\nNEVER OPENED", 120, 230, 'white'),
    (4.45, 8.5, "APRIL 26, 1986\n1:23 AM", 96, 230, '#ffb347'),
    (8.85, 11.4, "50,000 PEOPLE\nLEFT IN ONE DAY", 92, 230, 'white'),
    (11.5, oZ + 0.1, "NO ONE\nCAME BACK", 120, 230, '#ff5a4e'),
    (oZ + 0.4, oB, "PRIPYAT, UKRAINE", 80, 250, 'white'),
    (oB + 0.3, oG, "40 YEARS LATER", 96, 230, 'white'),
    (oG + 2.2, TOTAL, "Would you\nwalk here?", 96, 1350, 'white'),
]
ATTR = [(0, oZ + X / 2, 'AI reconstruction'), (oZ + X / 2, oB + X / 2, 'Imagery: Google Earth'),
        (oB + X / 2, oG + X / 2, 'AI reconstruction'), (oG + X / 2, TOTAL, 'Street View: Nikolai Fomin / Google')]
VO = [(0.15, 'v0'), (4.55, 'v1'), (9.0, 'v2'), (14.95, 'v3'), (17.85, 'v4'), (22.3, 'v5')]

os.makedirs('ftxt', exist_ok=True)
dts = []
for i, (s, e, t, size, y, c) in enumerate(TEXT):
    fp = f'ftxt/{i}.txt'; open(fp, 'w').write(t)
    al = f"if(lt(t,{s}+0.18),(t-{s})/0.18,if(gt(t,{e}-0.22),({e}-t)/0.22,1))"
    dts.append(f"drawtext=fontfile={FONT}:expansion=none:textfile={fp}:fontcolor={c}:fontsize={size}:line_spacing=14:text_align=C"
               f":borderw=8:bordercolor=black@0.85:shadowx=0:shadowy=8:shadowcolor=black@0.5"
               f":x=(w-text_w)/2:y={y}:alpha='{al}':enable='between(t,{s},{e})'")
for i, (s, e, t) in enumerate(ATTR):
    fp = f'ftxt/a{i}.txt'; open(fp, 'w').write(t)
    dts.append(f"drawtext=fontfile={FS}:expansion=none:textfile={fp}:fontcolor=white@0.85:fontsize=28"
               f":borderw=3:bordercolor=black@0.8:x=40:y=h-90:enable='between(t,{s},{e})'")
vf = (f"[0:v]setpts=PTS-STARTPTS[a];[1:v]{LOOK},setpts=PTS-STARTPTS[z];[2:v]setpts=PTS-STARTPTS[b];[3:v]{LOOK},setpts=PTS-STARTPTS[g];"
      f"[a][z]xfade=transition=fade:duration={X}:offset={oZ}[az];"
      f"[az][b]xfade=transition=fade:duration={X}:offset={oB}[azb];"
      f"[azb][g]xfade=transition=fade:duration={X}:offset={oG},format=yuv420p," + ",".join(dts) + "[v]")
ins = ['-i', 'segA.mp4', '-i', 'zoom.mp4', '-i', 'segB.mp4', '-i', 'ground.mp4', '-i', 'dark.wav']
vo = []
for k, (t0, f) in enumerate(VO):
    ins += ['-i', f'tts/{f}.mp3']; ms = int(t0 * 1000)
    vo.append(f"[{5 + k}:a]aresample=48000,adelay={ms}|{ms},apad=whole_dur={TOTAL}[v{k}]")
n = len(VO)
af = (";".join(vo) + ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0,volume=1.6,asplit=2[vo0][sc];"
      "[vo0]adelay=70|70[vo];"
      f"[4:a]aresample=48000,atrim=0:{TOTAL},volume=0.62[m];"
      "[m][sc]sidechaincompress=threshold=0.004:ratio=16:attack=8:release=380:makeup=1[md];"
      f"[md][vo]amix=inputs=2:normalize=0,afade=t=out:st={TOTAL - 1.2}:d=1.2,aformat=channel_layouts=stereo[a]")
if os.environ.get('STEMS'):
    for nm, rep in (('vo', '[md]anullsink;[vo]'), ('bg', '[vo]anullsink;[md]')):
        f2 = af.replace('[md][vo]amix=inputs=2:normalize=0,', rep)
        subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins[8:] + [], check=False) if False else None
        subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', f2, '-map', '[a]', '-t', f'{TOTAL}', '-ac', '1', '-ar', '16000', f'stem_{nm}.wav'], check=True)
    sys.exit()
subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', vf + ';' + af, '-map', '[v]', '-map', '[a]', '-t', f'{TOTAL}',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '14M', '-bufsize', '28M', '-profile:v', 'high',
                '-pix_fmt', 'yuv420p', '-r', '60', '-c:a', 'pcm_s16le', '-ar', '48000', 'raw.mov'], check=True)
print('ok raw.mov total', round(TOTAL, 2))
