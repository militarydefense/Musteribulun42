#!/usr/bin/env python3
"""Overlay texts + sound design on zoom_raw.mp4 -> final Short."""
import os, subprocess, sys

SRC, OUT = 'zoom_raw2.mp4', sys.argv[1]
LANG = 'en' if '--en' in sys.argv[2:] else 'tr'
TOTAL = 30.0
LAND = 12.8   # moment the camera settles over the site
FONT = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
TEXTS_EN = [
    (0.0, 3.4, "Under this hill lies\nsomething OLDER\nTHAN THE PYRAMIDS...", 74, 1290),
    (3.6, 8.2, "Şanlıurfa, Türkiye", 76, 260),
    (11.4, 15.6, "GÖBEKLI TEPE", 124, 250),
    (15.6, 20.4, "About 11,600 years old.\nMore than 6,000 years\nolder than Stonehenge.", 70, 1300),
    (20.4, 25.2, "It wasn't built\nby farmers, but by\nhunter-gatherers.", 70, 1300),
    (25.2, 30.0, "Most of it is still\nburied underground.\nWhat else is down there?", 70, 1300),
]
TEXTS = [
    (0.0, 3.4, "Bu tepenin altında\nPİRAMİTLERDEN ESKİ\nbir şey var...", 84, 1280),
    (3.6, 8.2, "Şanlıurfa, Türkiye", 76, 260),
    (11.4, 15.6, "GÖBEKLİTEPE", 124, 250),
    (15.6, 20.4, "Yaklaşık 11.600 yıllık.\nStonehenge'den\n6.000 yıldan fazla eski.", 70, 1300),
    (20.4, 25.2, "Onu yapanlar\nçiftçi değil,\navcı-toplayıcılardı.", 70, 1300),
    (25.2, 30.0, "Büyük kısmı hâlâ\ntoprağın altında.\nOrada başka ne var?", 70, 1300),
]
if LANG == 'en': TEXTS = TEXTS_EN
os.makedirs('ftxt', exist_ok=True)
dts = []
for i, (s, e, text, size, y) in enumerate(TEXTS):
    p = f'ftxt/{i}.txt'; open(p, 'w').write(text)
    fi = 0.0 if s == 0 else 0.25
    alpha = f"if(lt(t,{s}+{fi}),(t-{s})/{max(fi,0.001)},if(gt(t,{e}-0.25),({e}-t)/0.25,1))" if s > 0 else f"if(gt(t,{e}-0.25),({e}-t)/0.25,1)"
    dts.append(
        f"drawtext=fontfile={FONT}:expansion=none:textfile={p}:fontcolor=white:fontsize={size}"
        f":line_spacing=18:borderw=7:bordercolor=black@0.9:shadowx=0:shadowy=6:shadowcolor=black@0.5"
        f":x=(w-text_w)/2:y={y}:alpha='{alpha}':enable='between(t,{s},{e})'")
open('ftxt/attr.txt', 'w').write('Imagery: Google Earth' if LANG == 'en' else 'Görüntü: Google Earth')
dts.append(f"drawtext=fontfile={FONT}:expansion=none:textfile=ftxt/attr.txt:fontcolor=white@0.85"
           f":fontsize=30:borderw=3:bordercolor=black@0.8:x=w-text_w-34:y=h-80")

drone = ("aevalsrc='0.16*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.2*t))"
         "+0.10*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.13*t+1))"
         "+0.07*sin(2*PI*110*t)+0.04*sin(2*PI*164.8*t)*(0.5+0.5*sin(2*PI*0.07*t))'"
         f":s=48000:d={TOTAL}")
boom = lambda T, g: (f"{g}*gt(t,{T})*sin(2*PI*(36+80*exp(-10*(t-{T})))*(t-{T}))*exp(-2.8*(t-{T}))")
hits = f"aevalsrc='{boom(0.02, 0.7)}+{boom(LAND, 1.0)}':s=48000:d={TOTAL}"
fc = (
    "[0:v]" + ",".join(dts) + "[v];"
    "[1:a]lowpass=f=700,aecho=0.8:0.6:140:0.3[dr];"
    "[2:a]highpass=f=250,lowpass=f=2600,"
    f"volume='0.02+0.55*exp(-pow((t-10.2)/2.0,2))':eval=frame[wh];"
    "[3:a]lowpass=f=300[hit];"
    "[dr][wh][hit]amix=inputs=3:normalize=0,"
    f"afade=t=in:d=0.4,afade=t=out:st={TOTAL-2.5}:d=2.5,volume=1.15,alimiter=limit=0.79:level=false[a]"
)
cmd = ['ffmpeg', '-y', '-v', 'error', '-i', SRC,
       '-f', 'lavfi', '-i', drone,
       '-f', 'lavfi', '-i', f'anoisesrc=color=pink:amplitude=0.6:s=48000:d={TOTAL}',
       '-f', 'lavfi', '-i', hits,
       '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-t', str(TOTAL),
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-maxrate', '10M', '-bufsize', '20M', '-x264-params', 'keyint=600:min-keyint=60', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '60',
       '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', OUT]
subprocess.run(cmd, check=True)
print('ok', OUT)
