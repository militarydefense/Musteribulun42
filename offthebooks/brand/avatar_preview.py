"""Preview avatars as Instagram shows them: a circle at profile size and at feed size.

Usage: python3 -I avatar_preview.py <out.jpg> <avatar1.png> [avatar2.png ...]
"""
import sys

from PIL import Image, ImageDraw

out, srcs = sys.argv[1], sys.argv[2:]
sizes = (320, 110, 44)
pad = 24
sheet = Image.new("RGB", (len(srcs) * (sum(sizes) + pad * 4), max(sizes) + pad * 2), (250, 250, 250))
x = pad
for src in srcs:
    im = Image.open(src).convert("RGB")
    for s in sizes:
        a = im.resize((s * 4, s * 4), Image.LANCZOS)
        m = Image.new("L", a.size, 0)
        ImageDraw.Draw(m).ellipse((0, 0, *a.size), fill=255)
        a = a.resize((s, s), Image.LANCZOS)
        m = m.resize((s, s), Image.LANCZOS)
        sheet.paste(a, (x, pad + (max(sizes) - s) // 2), m)
        x += s + pad
    x += pad
sheet.save(out, quality=90)
