"""Time a narration file against an episode script and build voice.wav + timings.json.

Usage: python3 -I align.py <narration audio> <script.json> <build dir> [tempo]
tempo (e.g. 1.12) speeds the narration up without changing its pitch.

script.json is a list of items, in reading order:
  {"shot": "s1", "say": "...", "show": "..."}   a narrated line ("show" = caption text, defaults to "say")
  {"shot": "title", "card": 2.4}                 a silent card: inserts that many seconds of silence
Word times come from faster-whisper; script words are matched to them in order, so the
captions always show the script's spelling ($50,000,000) while timing follows the voice.

Lines are cut at the quietest point between them (never by guessed word times), so a line can
never replay the end of the line before it. The finished voice.wav is transcribed again and
compared with the script; the run fails if words were repeated or dropped.
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
PAUSE, SHOT_PAUSE = .08, .16

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    """1234567 -> ['one', 'million', 'two', 'hundred', 'thirty', 'four', 'thousand', ...]"""
    if n < 20:
        return [ONES[n]]
    if n < 100:
        return [TENS[n // 10]] + (num_words(n % 10) if n % 10 else [])
    if n < 1000:
        return [ONES[n // 100], "hundred"] + (num_words(n % 100) if n % 100 else [])
    for size, name in ((10 ** 9, "billion"), (10 ** 6, "million"), (1000, "thousand")):
        if n >= size:
            return num_words(n // size) + [name] + (num_words(n % size) if n % size else [])


def tokens(word):
    """Normalized spoken tokens of one written word: 'thirty-seven' and '37' both -> ['thirty', 'seven']."""
    out = []
    for part in re.split(r"[-–]", word.lower()):
        digits = re.sub(r"[^0-9]", "", part)
        if digits and re.fullmatch(r"[$]?[0-9][0-9,]*(\.[0-9]+)?[%.,?!]*", part):
            out += num_words(int(digits))
            if "%" in part:
                out.append("percent")
        else:
            t = re.sub(r"[^a-z0-9]", "", part)
            if t:
                out.append(t)
    return out


def load(path, tempo):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-af", f"atempo={tempo}", "-ac", "1", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16)


model = WhisperModel("small", compute_type="int8")


def transcribe(pcm):
    x = pcm.astype(np.float32) / 32768
    x16 = x[np.arange(0, len(x), SR / 16000).astype(int)]
    segs, _ = model.transcribe(x16, language="en", word_timestamps=True)
    heard = []  # (token, start, end); a word that expands to several tokens shares its time span
    for s in segs:
        for w in s.words:
            toks = tokens(w.word.strip())
            for k, tk in enumerate(toks):
                d = (w.end - w.start) / len(toks)
                heard.append((tk, w.start + k * d, w.start + (k + 1) * d))
    return heard


pcm = load(src, TEMPO)
heard = transcribe(pcm)

# script tokens with a pointer back to (line, word)
said = []
for li, it in enumerate(items):
    if "say" in it:
        for wi, w in enumerate(it["say"].split()):
            for tk in tokens(w):
                said.append((li, wi, tk))
m = difflib.SequenceMatcher(None, [s[2] for s in said], [h[0] for h in heard], autojunk=False)
times = [None] * len(said)
for a, b, n in m.get_matching_blocks():
    for k in range(n):
        times[a + k] = heard[b + k][1:]
print(f"matched {sum(t is not None for t in times)}/{len(said)} script tokens")

# frame energy (10 ms) to find the quiet point between two lines
hop = SR // 100
rms = np.sqrt(np.convolve(pcm.astype(np.float32) ** 2, np.ones(hop) / hop, mode="same"))[::hop]
voiced_level = max(300.0, np.percentile(rms, 95) * .06)


def quietest(a, b):
    """Time (s) of the lowest-energy 100 ms window between a and b."""
    i0, i1 = int(a * 100), max(int(a * 100) + 1, int(b * 100))
    seg = np.convolve(rms[i0:i1], np.ones(10) / 10, mode="same") if i1 - i0 > 10 else rms[i0:i1]
    return (i0 + int(np.argmin(seg))) / 100 if len(seg) else a


spoken = [li for li, it in enumerate(items) if "say" in it]
known = {li: [t for (l, _, _), t in zip(said, times) if l == li and t] for li in spoken}
first = {li: min(t[0] for t in known[li]) for li in spoken if known[li]}
last = {li: max(t[1] for t in known[li]) for li in spoken if known[li]}
# whisper sometimes skips a short line (often the very first one): take the voiced audio between its neighbours
hop_ = SR // 100
_rms = np.sqrt(np.convolve(pcm.astype(np.float32) ** 2, np.ones(hop_) / hop_, mode="same"))[::hop_]
_level = max(300.0, np.percentile(_rms, 95) * .06)
for k, li in enumerate(spoken):
    if known[li]:
        continue
    lo = last[spoken[k - 1]] if k else 0.0
    hi = next((first[l] for l in spoken[k + 1:] if l in first), len(pcm) / SR)
    v = np.where(_rms[int(lo * 100):int(hi * 100)] > _level)[0]
    if not len(v):
        sys.exit(f"line {li} ({items[li]['say']!r}) has no audio between {lo:.2f} and {hi:.2f}")
    # the line ends at the last long silence before the next line
    first[li] = lo + v[0] / 100
    gaps = np.where(np.diff(v) > 15)[0]
    last[li] = lo + (v[gaps[-1]] if len(gaps) else v[-1]) / 100
    print(f"line {li} not heard by whisper; using voiced audio {first[li]:.2f}-{last[li]:.2f}")
# cut points: between the last heard word of a line and the first heard word of the next
cuts = {}
for a, b in zip(spoken, spoken[1:]):
    if first[b] < last[a] - .3:
        sys.exit(f"lines {a} and {b} overlap in the audio ({last[a]:.2f} > {first[b]:.2f})")
    # whisper often glues the last word of a line to the next one; look a little to both sides
    lo, hi = min(last[a], first[b]), max(last[a], first[b])
    cuts[(a, b)] = quietest(lo - .25, hi + .25) if hi - lo < .15 else quietest(lo, hi)


def trim(c0, c1):
    """Shrink a chunk to its voiced part plus a short margin."""
    i0, i1 = int(c0 * 100), int(c1 * 100)
    v = np.where(rms[i0:i1] > voiced_level)[0]
    if not len(v):
        return c0, c1
    return max(c0, (i0 + v[0]) / 100 - .05), min(c1, (i0 + v[-1]) / 100 + .1)


chunk = {}
for k, li in enumerate(spoken):
    c0 = cuts[(spoken[k - 1], li)] if k else 0.0
    c1 = cuts[(li, spoken[k + 1])] if k + 1 < len(spoken) else len(pcm) / SR
    chunk[li] = trim(c0, c1)

# word times for captions: matched tokens give the word span, unmatched words are spread inside the chunk
word_t = {}
for (li, wi, _), t in zip(said, times):
    if t:
        a, b = word_t.get((li, wi), t)
        word_t[(li, wi)] = (min(a, t[0]), max(b, t[1]))

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
        gap = it.get("pause", PAUSE if prev["shot"] == it["shot"] else SHOT_PAUSE)  # "pause": dramatic silence before a line
        audio.append(np.zeros(int(gap * SR), np.int16)); t += gap
    off = t - c0
    audio.append(pcm[int(c0 * SR): int(c1 * SR)])
    say = it["say"].split()
    spans = []
    for wi in range(len(say)):  # fill gaps between matched words linearly
        spans.append(word_t.get((li, wi)))
    s0, s1 = max(c0, first[li]), min(c1, last[li])
    for wi, sp in enumerate(spans):
        if sp is None:
            p = next((spans[k][1] for k in range(wi - 1, -1, -1) if spans[k]), s0)
            q = next((spans[k][0] for k in range(wi + 1, len(spans)) if spans[k]), s1)
            n_gap = sum(1 for k in range(wi, len(spans)) if spans[k] is None and all(spans[j] is None for j in range(wi, k + 1)))
            spans[wi] = (p, p + max(.08, (q - p) / max(1, n_gap)))
    # a word matched to the wrong whisper token can land outside this line's audio: keep it inside
    spans = [(min(max(a, c0), c1), min(max(b, c0 + .05), c1)) for a, b in spans]
    shown = it.get("show", it["say"]).split()
    if len(shown) == len(say):
        sw = spans
    else:  # caption words differ from spoken words: spread over the line evenly
        step = (s1 - s0) / len(shown)
        sw = [(s0 + k * step, s0 + (k + 1) * step) for k in range(len(shown))]
    words = [{"w": w, "s": round(s + off, 3), "e": round(e + off, 3)} for w, (s, e) in zip(shown, sw)]
    lines.append({"shot": it["shot"], "text": " ".join(shown), "start": round(s0 + off, 3), "end": round(s1 + off, 3), "words": words})
    shots.setdefault(it["shot"], [t, 0])
    t += c1 - c0
    shots[it["shot"]][1] = t

voice = np.concatenate(audio)
with wave.open(str(OUT / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(voice.tobytes())
json.dump({"duration": round(t, 3), "lines": lines, "shots": shots}, open(OUT / "timings.json", "w"), indent=1)
print("total", round(t, 2), "s")
for k, (a, b) in shots.items():
    print(f"  {k:8s} {a:6.2f} - {b:6.2f}")

# self-check: the finished voice must read the script once, in order, with nothing repeated or dropped
check = [h[0] for h in transcribe(voice)]
want = [s[2] for s in said]
problems = []
for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, want, check, autojunk=False).get_opcodes():
    if op == "insert" and b1 - b0 >= 2:
        problems.append(f"extra audio: {' '.join(check[b0:b1])!r}")
    elif op == "delete" and a1 - a0 >= 2:
        problems.append(f"missing audio: {' '.join(want[a0:a1])!r}")
    elif op == "replace" and (b1 - b0) - (a1 - a0) >= 2:
        problems.append(f"extra audio: {' '.join(check[b0:b1])!r} (script: {' '.join(want[a0:a1])!r})")
if problems:
    print("VOICE CHECK FAILED:\n  " + "\n  ".join(problems))
    sys.exit(1)
print("voice check: ok")
