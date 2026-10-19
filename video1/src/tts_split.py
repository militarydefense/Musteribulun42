"""Turn one narration file (e.g. ElevenLabs) into voice.wav + timings.json by splitting it at its longest pauses.

Usage: tts_split.py <narration audio> <outdir> <script.json>
The script's lines must be read in order in the audio; the len(lines)-1 longest silences become line breaks.
Speech starts at 0.0 s and pauses are re-timed to each line's "pause" value.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

src, out, script_path = sys.argv[1:4]
OUT = Path(out)
OUT.mkdir(parents=True, exist_ok=True)
script = json.load(open(script_path))
SR = 44100
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32)

# 10 ms frame energy -> voiced mask
hop = SR // 100
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same"))[::hop]
voiced = rms > max(300.0, np.percentile(rms, 95) * 0.06)
idx = np.where(voiced)[0]
start, end = idx[0], idx[-1]
gaps = []  # (length, gap_start, gap_end) in frames
i = start
while i < end:
    if not voiced[i]:
        j = i
        while j < end and not voiced[j]:
            j += 1
        gaps.append((j - i, i, j))
        i = j
    i += 1
need = len(script) - 1
cuts = sorted(sorted(gaps, reverse=True)[:need], key=lambda g: g[1])
if len(cuts) != need:
    sys.exit(f"found {len(cuts)} pauses, need {need}")
bounds = [start] + [c for g in cuts for c in (g[1], g[2])] + [end]
segments = [(bounds[k], bounds[k + 1]) for k in range(0, len(bounds), 2)]

audio, t, timings = [], 0.0, []
for line, (a, b) in zip(script, segments):
    pcm = x[max(a * hop - int(.01 * SR), 0): b * hop + int(.04 * SR)].astype(np.int16)
    dur = len(pcm) / SR
    shown = line.get("show", line["say"])
    words = shown.split()
    weights = [len(w.strip(".,?!…")) + 2 for w in words]
    acc, wt = t, []
    for w, n in zip(words, weights):
        d = dur * n / sum(weights)
        wt.append({"w": w, "s": round(acc, 3), "e": round(acc + d, 3)})
        acc += d
    timings.append({"scene": line["scene"], "text": shown, "start": round(t, 3), "end": round(t + dur, 3), "words": wt})
    audio += [pcm, np.zeros(int(line["pause"] * SR), np.int16)]
    t += dur + line["pause"]

with wave.open(str(OUT / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(np.concatenate(audio).tobytes())
scenes = {}
for l in timings:
    s = scenes.setdefault(l["scene"], [l["start"], l["end"]]); s[1] = l["end"]
json.dump({"duration": round(t, 3), "lines": timings, "scenes": scenes}, open(OUT / "timings.json", "w"), indent=1)
print("total", round(t, 2), "s;", "segments", [round((b - a) / 100, 2) for a, b in segments])
