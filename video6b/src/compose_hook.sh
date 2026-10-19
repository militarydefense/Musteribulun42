#!/usr/bin/env bash
# Usage: compose_hook.sh <ai_clip.mp4> <cut seconds>
# Replaces the first <cut> seconds of build/video_noaudio.mp4 with the AI clip (scaled to 1080x1920)
# plus the transparent text/caption layer in build/overlay, writing build/video_hooked.mp4.
set -euo pipefail
clip=$1 cut=$2
ffmpeg -y -loglevel error -i "$clip" -framerate 30 -i build/overlay/o_%04d.png \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,trim=0:$cut,setpts=PTS-STARTPTS,format=yuv420p[a];[a][1:v]overlay=0:0:shortest=1,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 build/hook_part.mp4
ffmpeg -y -loglevel error -ss "$cut" -i build/video_noaudio.mp4 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p build/rest_part.mp4
printf "file 'hook_part.mp4'\nfile 'rest_part.mp4'\n" > build/concat.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i build/concat.txt -c copy build/video_hooked.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 build/video_hooked.mp4
