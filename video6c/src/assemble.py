"""Assemble the full-AI cut: clips trimmed to scene spans + text overlay + audio + cover frame.

Usage: assemble.py  (expects assets/clip1.mp4 .. clip7.mp4 and build/overlay/)
Scene spans come from build/timings.json; scene 7 runs to the end (scenes 7 + 8 share one clip).
"""
import json
import subprocess

T = json.load(open("build/timings.json"))
total = T["duration"] + T["outro"]
starts = [0.0] + [l["start"] - .15 for l in T["lines"][1:]]
cuts = [starts[0], starts[1], starts[2], starts[3], starts[4], starts[5], starts[6], total]  # 7 clips
parts = []
for i in range(7):
    dur = cuts[i + 1] - cuts[i]
    out = f"build/seg{i + 1}.mp4"
    # slow a clip down slightly if it is shorter than its slot, then trim to the slot
    probe = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                  f"assets/clip{i + 1}.mp4"], capture_output=True, text=True).stdout)
    stretch = max(1.0, dur / (probe - .05))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"assets/clip{i + 1}.mp4", "-vf",
                    f"setpts={stretch:.4f}*PTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,trim=0:{dur:.3f},setpts=PTS-STARTPTS,format=yuv420p",
                    "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "17", out], check=True)
    parts.append(out)
    print(f"clip{i + 1}: slot {dur:.2f}s, source {probe:.2f}s, stretch {stretch:.3f}")
open("build/concat.txt", "w").write("".join(f"file '{p.split('/')[-1]}'\n" for p in parts))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "build/concat.txt",
                "-c", "copy", "build/base.mp4"], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "build/base.mp4", "-framerate", "30", "-i", "build/overlay/o_%04d.png",
                "-filter_complex", "[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v]", "-map", "[v]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "17", "build/video_noaudio.mp4"], check=True)
print("base video", total, "s")
