"""Assemble scene.html: shared drawing kit + captions/main from video1, scenes from scenes.js."""
import re
from pathlib import Path

here = Path(__file__).parent
kit = (here / "../../video1/src/scene.html").read_text()
head = kit[:kit.index("const SCENES = {")]
tail = kit[kit.index("// ---------- captions ----------"):]
head = head.replace('"Your Credit Card Is Lying to You"', '"Why $9.99 Feels So Much Cheaper"')
tail = re.sub(r"const HL = new Set\(\[.*?\]\);",
              "const HL = new Set(['MORE', '$39', 'LAZY.', 'NINE', 'STOPS.', '$9.', '$10.', 'LEFT-DIGIT', 'EFFECT.', 'ROUND', 'ALWAYS.', 'WHY…', 'SALES.']);", tail)
(here / "scene.html").write_text(head + (here / "scenes.js").read_text() + "\n" + tail)
