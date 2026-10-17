"""Assemble a video's scene.html from the shared kit in video1/src/scene.html.

Usage: build_scene.py <scenes.js> <out.html> <title> <HIGHLIGHT|WORDS|...>
Keeps the drawing kit and caption/main code from video1 and swaps in the video's SCENES and caption highlights.
"""
import json
import sys
from pathlib import Path

scenes, out, title, hl = sys.argv[1:5]
kit = (Path(__file__).parent / "scene.html").read_text()
head = kit[:kit.index("const SCENES = {")]
tail = kit[kit.index("// ---------- captions ----------"):]
head = head.replace('"Your Credit Card Is Lying to You"', json.dumps(title))
start = tail.index("const HL = new Set(")
end = tail.index(";", start) + 1
tail = tail[:start] + f"const HL = new Set({json.dumps(hl.split('|'))});" + tail[end:]
Path(out).write_text(head + Path(scenes).read_text() + "\n" + tail)
