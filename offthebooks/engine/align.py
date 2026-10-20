"""Time a narration file against an episode script and build voice.wav + timings.json.

Usage: python3 -I align.py <narration audio> <script.json> <build dir> [tempo]
tempo (e.g. 1.12) speeds the narration up without changing its pitch.

script.json is a list of items, in reading order:
  {"shot": "s1", "say": "...", "show": "..."}   a narrated line ("show" = caption text, defaults to "say")
  {"shot": "title", "card": 2.4}                 a silent card: inserts that many seconds of silence
Word times come from faster-whisper; script words are matched to them in order, so the
captions always show the script's spelling ($50,000,000) while timing follows the voice.
"""
import difflib
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

src, script_path, out = sys.argv[1:4]
TEMPO = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
OUT = Path(out)
OUT.mkdir(parents=True, exist_ok=True)
items = json.load(open(script_path))
SR = 44100

raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
pcm = np.frombuffer(raw, np.int16)
x16 = pcm.astype(np.float32) / 32768
# whisper wants 16 kHz
idx = np.arange(0, len(x16), SR / 16000).astype(int)
model = WhisperModel("small", compute_type="int8")
segs, _ = model.transcribe(x16[idx], language="en", word_timestamps=True)
heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
# script words (spoken form) with a pointer back to their line
said = []
for li, it in enumerate(items):
    if "say" in it:
        for wi, w in enumerate(it["say"].split()):
            said.append((li, wi, norm(w)))
m = difflib.SequenceMatcher(None, [s[2] for s in said], [norm(h[0]) for h in heard], autojunk=False)
times = [None] * len(said)
for a, b, n in m.get_matching_blocks():
    for k in range(n):
        times[a + k] = heard[b + k][1:]
# fill unmatched words by interpolating between neighbours
known = [i for i, t in enumerate(times) if t]
for i, t in enumerate(times):
    if t is None:
        p = max([k for k in known if k < i], default=None)
        q = min([k for k in known if k > i], default=None)
        s = times[p][1] if p is not None else 0.0
        e = times[q][0] if q is not None else s + .3
        times[i] = (s, e)
print(f"matched {len(known)}/{len(said)} script words")

line_span = {}
for (li, wi, _), (s, e) in zip(said, times):
    a, b = line_span.get(li, (s, e))
    line_span[li] = (min(a, s), max(b, e))

# cut each line out of the source (a little padding) and join with short, even pauses
lines_idx = sorted(line_span)
chunk = {li: (max(0.0, line_span[li][0] - .06), min(len(pcm) / SR, line_span[li][1] + .12)) for li in lines_idx}
PAUSE, SHOT_PAUSE = .12, .3

audio, t, lines, shots = [], 0.0, [], {}
for li, it in enumerate(items):
    if "card" in it:
        audio.append(np.zeros(int(it["card"] * SR), np.int16))
        shots.setdefault(it["shot"], [t, t + it["card"]])
        shots[it["shot"]][1] = t + it["card"]
        lines.append({"shot": it["shot"], "card": True, "start": round(t, 3), "end": round(t + it["card"], 3), "words": []})
        t += it["card"]
        continue
    c0, c1 = chunk[li]
    prev = items[li - 1] if li else None
    if prev is not None and "say" in prev:
        gap = PAUSE if prev["shot"] == it["shot"] else SHOT_PAUSE
        audio.append(np.zeros(int(gap * SR), np.int16)); t += gap
    off = t - c0
    audio.append(pcm[int(c0 * SR): int(c1 * SR)])
    shown = it.get("show", it["say"]).split()
    sw = [(s, e) for (l, _, _), (s, e) in zip(said, times) if l == li]
    if len(shown) != len(sw):  # caption words differ from spoken words: spread over the line evenly
        s0, s1 = line_span[li]
        step = (s1 - s0) / len(shown)
        sw = [(s0 + k * step, s0 + (k + 1) * step) for k in range(len(shown))]
    words = [{"w": w, "s": round(s + off, 3), "e": round(e + off, 3)} for w, (s, e) in zip(shown, sw)]
    a, b = line_span[li]
    lines.append({"shot": it["shot"], "text": " ".join(shown), "start": round(a + off, 3), "end": round(b + off, 3), "words": words})
    shots.setdefault(it["shot"], [t, 0])
    t += c1 - c0
    shots[it["shot"]][1] = t

with wave.open(str(OUT / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(np.concatenate(audio).tobytes())
json.dump({"duration": round(t, 3), "lines": lines, "shots": shots}, open(OUT / "timings.json", "w"), indent=1)
print("total", round(t, 2), "s")
for k, (a, b) in shots.items():
    print(f"  {k:8s} {a:6.2f} - {b:6.2f}")
