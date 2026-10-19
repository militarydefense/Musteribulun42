#!/usr/bin/env bash
# Usage: finalize.sh <build dir> <thumbnail.png> <out.mp4> [cover seconds]
# Muxes video + mix (normalized to -14 LUFS) and appends the thumbnail as a short
# final frame so it can be picked as the Shorts cover in the YouTube app.
set -euo pipefail
build=$1 thumb=$2 out=$3 cover=${4:-0.2}
ffmpeg -y -loglevel error -i "$build/video_noaudio.mp4" -i "$build/mix.wav" \
  -loop 1 -framerate 30 -t "$cover" -i "$thumb" -f lavfi -t "$cover" -i anullsrc=r=48000:cl=stereo \
  -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,aformat=channel_layouts=stereo[va];[2:v]scale=1080:1920,setsar=1,format=yuv420p[tv];[0:v][va][tv][3:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart "$out"
