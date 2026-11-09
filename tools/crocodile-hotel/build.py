#!/usr/bin/env python3
"""Final assembly of the Pripyat film.
segA (AI: wheel, reactor, class) -> Earth zoom -> segB (AI aerial) -> 360 at the wheel.
Unified grade on the real footage so all shots share one look, motivated xfades,
titles, attribution, VO + ducked music, -14 LUFS.   usage: build.py out.mp4"""
import os, subprocess, sys, json
OUT = sys.argv[1]
FONT = '/usr/share/fonts/opentype/inter/Inter-Black.otf'; FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
X = 0.3
DUR = {'A': 6.2, 'Z': 14.0, 'B': 10.7}
oZ = DUR['A'] - X; oB = oZ + DUR['Z'] - X; TOTAL = oB + DUR['B']; W1 = oB + 5.8
# one look for real footage: cool desaturated shadows, warm-neutral highs, grain, vignette
LOOK = ("eq=saturation=1.05:contrast=1.04:gamma=1.0,colorbalance=rs=0.03:bs=-0.03:rh=0.03:bh=-0.03,noise=alls=6:allf=t,vignette=PI/6")
TEXT = [  # (start, end, text, size, y, colour)
    (0.3, 3.2, "WOULD YOU SLEEP\nINSIDE THIS?", 104, 230, 'white'),
    (3.5, 5.9, "IN AUSTRALIA,\nYOU CAN", 104, 230, '#ffd23f'),
    (oZ + 3.3, 13.5, "KAKADU, AUSTRALIA", 80, 250, 'white'),
    (13.7, 16.1, "IT'S A 250 m\nCROCODILE", 110, 230, '#ffd23f'),
    (16.2, oB + 0.2, "ENTER THROUGH\nITS JAWS", 100, 230, 'white'),
    (oB + 0.5, W1, "INSPIRED BY GINGA,\nA SPIRIT ANCESTOR", 76, 230, 'white'),
    (W1 + 0.4, TOTAL, "Would you stay\nhere?", 104, 230, 'white'),
]
ATTR = [(0, oZ + X / 2, 'AI visualization'), (oZ + X / 2, oB + X / 2, 'Imagery: Google Earth'), (oB + X / 2, TOTAL, 'AI visualization, not the real hotel')]
VO = [(0.2, 'v0'), (3.5, 'v1'), (6.3, 'v2'), (13.6, 'v3'), (16.2, 'v4'), (oB + 0.75, 'v5'), (W1 + 0.75, 'v6')]

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
vf = (f"[0:v]setpts=PTS-STARTPTS[a];[1:v]{LOOK},setpts=PTS-STARTPTS[z];[2:v]setpts=PTS-STARTPTS[b];"
      f"[a][z]xfade=transition=fade:duration={X}:offset={oZ}[az];"
      f"[az][b]xfade=transition=fade:duration={X}:offset={oB},format=yuv420p," + ",".join(dts) + "[v]")
ins = ['-i', 'segA.mp4', '-i', 'zoom.mp4', '-i', 'segB.mp4', '-i', 'music.wav']
vo = []
for k, (t0, f) in enumerate(VO):
    ins += ['-i', f'tts/{f}.mp3']; ms = int(t0 * 1000)
    vo.append(f"[{4 + k}:a]aresample=48000,adelay={ms}|{ms},apad=whole_dur={TOTAL}[v{k}]")
n = len(VO)
af = (";".join(vo) + ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0,volume=1.6,asplit=2[vo0][sc];"
      "[vo0]adelay=70|70[vo];"
      f"[3:a]aresample=48000,atrim=0:{TOTAL},volume=0.62[m];"
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
