"""Assemble an episode's scene.html and its image folder.

Usage: python3 -I build.py <episode dir>
Reads <ep>/shots.js and <ep>/assets/*.png (except the character sheet and thumbnail), writes <ep>/build/scene.html and <ep>/build/img/*.jpg
(resized to 1350 px wide so the camera can push in without loading 2K PNGs every frame).
"""
import sys
from pathlib import Path

from PIL import Image

ep = Path(sys.argv[1]).resolve()
engine = Path(__file__).resolve().parent
out = ep / "build"
(out / "img").mkdir(parents=True, exist_ok=True)
kit = (engine / "kit.html").read_text()
kit = kit.replace("url(FONTS/", f"url({(engine / 'fonts').as_uri()}/")
shots = (ep / "shots.js").read_text()
if "/*COMMON*/" in shots:  # story clips share helpers in ../common/story.js
    shots = shots.replace("/*COMMON*/", (ep.parent / "common" / "story.js").read_text())
(out / "scene.html").write_text(kit.replace("/*EPISODE*/", shots))
for png in sorted((ep / "assets").glob("*.png")):
    if png.stem.startswith(("lucky", "thumbnail")):
        continue
    dst = out / "img" / (png.stem + ".jpg")
    if dst.exists() and dst.stat().st_mtime > png.stat().st_mtime:
        continue
    im = Image.open(png).convert("RGB")
    im = im.resize((1350, round(im.height * 1350 / im.width)), Image.LANCZOS)
    im.save(dst, quality=92)
    print("img", dst.name, im.size)
print("wrote", out / "scene.html")
