#!/bin/bash
cd "$(dirname "$0")"
( LAT=-12.67047 LON=132.8325 ALT=38 node stills.js > stills.log 2>&1; echo EXIT >> stills.log ) &
( node spin.js 0 2 > spinA.log 2>&1; echo EXIT >> spinA.log ) &
( node spin.js 1 2 > spinB.log 2>&1; echo EXIT >> spinB.log ) &
wait
echo "stills $(ls stills/k*.png | wc -l) spin $(ls spin/s*.png | wc -l)" > pipe.log
python3 zoom.py register > reg.log 2>&1
python3 zoom.py render zoom.mp4 > rZ.log 2>&1
STEMS=1 python3 build.py x >> pipe.log 2>&1
python3 build.py x >> pipe.log 2>&1
O=/home/user/Musteribulun42/crocodile_hotel_short_en.mp4
ffmpeg -y -v error -i raw.mov -vn -c:a pcm_s16le raw.wav
J=$(ffmpeg -v info -i raw.wav -af loudnorm=I=-14:TP=-3:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
set -- $(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -y -v error -i raw.mov -i raw.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-3:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true,aresample=192000,alimiter=limit=0.63:attack=1:release=60:level=false,aresample=48000" -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart $O
echo DONE >> pipe.log
