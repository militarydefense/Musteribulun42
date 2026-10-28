"""Professional YouTube banner for @cut.counter: native 2560x1440 3D render + typography inside the 1546x423 safe area."""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE.parent / "releases" / "cutcounter"
BLACK, BOLD, SEMI = ("/usr/share/fonts/opentype/inter/Inter-Black.otf", "/usr/share/fonts/opentype/inter/Inter-Bold.otf",
                     "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf")
GOLD = (255, 194, 74)
X0, Y0, SW, SH = 507, 508, 1546, 423

b = Image.open(HERE / "out" / "banner_render.png").convert("RGB")
W, H = b.size
# vignette: keeps the eye on the safe strip
v = Image.new("L", (W, H), 0)
ImageDraw.Draw(v).ellipse((-W * .15, H * .05, W * 1.15, H * .95), fill=255)
v = v.filter(ImageFilter.GaussianBlur(260))
b = Image.composite(b, Image.new("RGB", b.size, (12, 9, 7)), v)
# soft dark panel behind the title for contrast
panel = Image.new("L", (W, H), 0)
ImageDraw.Draw(panel).rounded_rectangle((X0 - 60, Y0 - 30, X0 + 560, Y0 + SH + 30), 60, fill=110)
panel = panel.filter(ImageFilter.GaussianBlur(60))
b = Image.composite(Image.new("RGB", b.size, (10, 7, 5)), b, panel)

d = ImageDraw.Draw(b)
big = ImageFont.truetype(BLACK, 88)
d.text((X0 + 30, Y0 + 40), "CUT", font=big, fill="white")
d.text((X0 + 30, Y0 + 128), "COUNTER", font=big, fill=GOLD)
d.rounded_rectangle((X0 + 34, Y0 + 250, X0 + 154, Y0 + 256), 3, fill=GOLD)
sm = ImageFont.truetype(SEMI, 31)
d.text((X0 + 34, Y0 + 282), "10 cuts vs 1,000 cuts.", font=sm, fill=(236, 230, 222))
q = ImageFont.truetype(SEMI, 26)
d.text((X0 + 34, Y0 + 326), "How many pieces can", font=q, fill=(190, 182, 172))
d.text((X0 + 34, Y0 + 360), "one object become?", font=q, fill=(190, 182, 172))

# piece counts under each bar, on dark pills
pos = json.loads((HERE / "out" / "banner_labels.json").read_text())
labels = [("1 PIECE", "white"), ("35 PIECES", "white"), ("238,457 PIECES", GOLD)]
lf = ImageFont.truetype(BLACK, 28)
for (x, y), (text, col) in zip(pos, labels):
    w = d.textlength(text, font=lf)
    y = min(y + 18, Y0 + SH - 52)
    pill = Image.new("RGBA", (int(w + 44), 50), (0, 0, 0, 0))
    ImageDraw.Draw(pill).rounded_rectangle((0, 0, w + 44, 50), 25, fill=(14, 10, 8, 215))
    b.paste(pill, (int(x - w / 2 - 22), int(y)), pill)
    d.text((x - w / 2, y + 9), text, font=lf, fill=col)
b.save(OUT / "banner_2560x1440.png")
b.crop((X0, Y0, X0 + SW, Y0 + SH)).save(OUT / "banner_safe_area_preview.png")
print("ok")
