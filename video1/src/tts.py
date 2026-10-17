"""Render the voiceover line by line with Piper and write timings.json for captions/animation.

Usage: tts.py <voice.onnx> <outdir> [script.json]
script.json is a list of {"scene", "say", "show"?, "pause"}; without it the Video 1 script below is used.
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICE = sys.argv[1]
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

# (scene, text, pause_after_seconds)
LINES = [
    (1, "This card makes you spend up to twice as much.", 0.15),
    (1, "And your brain doesn't even notice.", 0.45),
    (2, "At M.I.T., researchers auctioned tickets to a sold-out basketball game.", 0.35),
    (3, "Half the bidders could only pay in cash.", 0.2),
    (3, "The other half? Credit card.", 0.4),
    (4, "The card group bid up to double.", 0.2),
    (4, "Same seats. Same game. Twice the price.", 0.5),
    (5, "Psychologists call it, the pain of paying.", 0.25),
    (5, "When you hand over cash, brain regions linked to pain light up.", 0.15),
    (5, "You feel the loss.", 0.45),
    (6, "But a tap? A swipe? No pain.", 0.2),
    (6, "The money leaves, and the feeling never arrives.", 0.5),
    (7, "That's why casinos use chips.", 0.15),
    (7, "Why apps save your card.", 0.15),
    (7, "Why buy now, pay later exists.", 0.2),
    (7, "They remove the pain, on purpose.", 0.5),
    (8, "The fix? For one week, pay for every want in cash.", 0.2),
    (8, "Feel every dollar leave.", 0.45),
    (9, "Follow for more ways your brain is secretly spending your money.", 0.6),
]
# Caption text (what is shown on screen) when it differs from the spoken text
DISPLAY = {"At M.I.T., researchers auctioned tickets to a sold-out basketball game.":
           "At MIT, researchers auctioned tickets to a sold-out basketball game."}

if len(sys.argv) > 3:
    script = json.load(open(sys.argv[3]))
    LINES = [(l["scene"], l["say"], l["pause"]) for l in script]
    DISPLAY = {l["say"]: l["show"] for l in script if "show" in l}

voice = PiperVoice.load(VOICE)
sr = voice.config.sample_rate
cfg = SynthesisConfig(length_scale=1.06, noise_scale=0.6, noise_w_scale=0.7)
lead = 0.25
audio = [np.zeros(int(lead * sr), dtype=np.int16)]
t = lead
timings = []
for scene, text, pause in LINES:
    pcm = np.concatenate([c.audio_int16_array for c in voice.synthesize(text, syn_config=cfg)])
    # trim leading/trailing near-silence so captions hit the actual speech
    nz = np.where(np.abs(pcm) > 400)[0]
    pcm = pcm[max(nz[0] - int(0.02 * sr), 0): nz[-1] + int(0.05 * sr)]
    dur = len(pcm) / sr
    shown = DISPLAY.get(text, text)
    words = shown.split()
    weights = [len(w.strip(".,?!")) + 2 for w in words]
    total = sum(weights)
    acc, wt = t, []
    for w, k in zip(words, weights):
        d = dur * k / total
        wt.append({"w": w, "s": round(acc, 3), "e": round(acc + d, 3)})
        acc += d
    timings.append({"scene": scene, "text": shown, "start": round(t, 3), "end": round(t + dur, 3), "words": wt})
    audio += [pcm, np.zeros(int((pause + 0.12) * sr), dtype=np.int16)]
    t += dur + pause + 0.12

full = np.concatenate(audio)
with wave.open(str(OUT / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes(full.tobytes())
scenes = {}
for l in timings:
    s = scenes.setdefault(l["scene"], [l["start"], l["end"]]); s[1] = l["end"]
json.dump({"duration": round(t, 3), "lines": timings, "scenes": scenes}, open(OUT / "timings.json", "w"), indent=1)
print("total", round(t, 2), "s")
for k, v in scenes.items(): print(k, v)
