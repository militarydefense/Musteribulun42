"""Kokoro voiceover (default voice af_heart) with the same outputs as tts.py: voice.wav + timings.json.

Usage: tts_kokoro.py <kokoro.onnx> <voices.bin> <outdir> <script.json> [voice] [speed]
script.json is a list of {"scene", "say", "show"?, "pause"}.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro

model, voices, out, script_path = sys.argv[1:5]
voice = sys.argv[5] if len(sys.argv) > 5 else "af_heart"
speed = float(sys.argv[6]) if len(sys.argv) > 6 else 1.05
OUT = Path(out)
OUT.mkdir(parents=True, exist_ok=True)
script = json.load(open(script_path))

k = Kokoro(model, voices)
lead, gap = 0.25, 0.12
sr = 24000
audio = [np.zeros(int(lead * sr), dtype=np.int16)]
t = lead
timings = []
for line in script:
    samples, sr = k.create(line["say"], voice=voice, speed=speed, lang="en-gb" if voice.startswith("b") else "en-us")
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    # trim leading/trailing near-silence so captions hit the actual speech
    nz = np.where(np.abs(pcm) > 400)[0]
    pcm = pcm[max(nz[0] - int(0.02 * sr), 0): nz[-1] + int(0.05 * sr)]
    dur = len(pcm) / sr
    shown = line.get("show", line["say"])
    words = shown.split()
    weights = [len(w.strip(".,?!…")) + 2 for w in words]
    total = sum(weights)
    acc, wt = t, []
    for w, n in zip(words, weights):
        d = dur * n / total
        wt.append({"w": w, "s": round(acc, 3), "e": round(acc + d, 3)})
        acc += d
    timings.append({"scene": line["scene"], "text": shown, "start": round(t, 3), "end": round(t + dur, 3), "words": wt})
    pause = line["pause"] + gap
    audio += [pcm, np.zeros(int(pause * sr), dtype=np.int16)]
    t += dur + pause

with wave.open(str(OUT / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes(np.concatenate(audio).tobytes())
scenes = {}
for l in timings:
    s = scenes.setdefault(l["scene"], [l["start"], l["end"]]); s[1] = l["end"]
json.dump({"duration": round(t, 3), "lines": timings, "scenes": scenes}, open(OUT / "timings.json", "w"), indent=1)
print("total", round(t, 2), "s")
