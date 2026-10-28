"""Channel logo for @cut.counter: the cut bar under a warm spotlight inside a gold ring, the knife breaking out of the ring."""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = Path(__file__).parent
OUT = HERE.parent / "releases" / "cutcounter"
S = 1600
base = Image.open(HERE / "out" / "logo_render.png").convert("RGB")
mask = Image.open(HERE / "out" / "logo_mask.png").convert("L").point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(1.2))

# warm spotlight behind the bar
glow = Image.new("L", (S, S), 0)
ImageDraw.Draw(glow).ellipse((200, 220, 1400, 1420), fill=255)
glow = glow.filter(ImageFilter.GaussianBlur(220))
warm = Image.new("RGB", (S, S), (92, 62, 40))
dark = base.convert("L").point(lambda v: max(0, 255 - v * 4))   # only the dark ground takes the light, not the soap
lit = ImageChops.add(base, ImageChops.multiply(warm, Image.merge("RGB", [ImageChops.multiply(glow, dark)] * 3)))

# darker outside the ring
C, R, RW = S // 2, 735, 30
outside = Image.new("L", (S, S), 255)
ImageDraw.Draw(outside).ellipse((C - R, C - R, C + R, C + R), fill=0)
img = Image.composite(Image.new("RGB", (S, S), (14, 10, 8)), lit, outside.filter(ImageFilter.GaussianBlur(4)))

# gold ring with a soft inner shadow
d = ImageDraw.Draw(img)
shadow = Image.new("L", (S, S), 0)
ImageDraw.Draw(shadow).ellipse((C - R + 10, C - R + 10, C + R - 10, C + R - 10), outline=170, width=26)
img = Image.composite(Image.new("RGB", (S, S), (0, 0, 0)), img, shadow.filter(ImageFilter.GaussianBlur(14)))
ring = Image.new("RGB", (S, S))
rd = ImageDraw.Draw(ring)
for i in range(RW):                                         # simple vertical gold gradient
    t = i / RW
    rd.ellipse((C - R - RW // 2 + i, C - R - RW // 2 + i, C + R + RW // 2 - i, C + R + RW // 2 - i), outline=(int(255 - 40 * t), int(205 - 60 * t), int(95 - 45 * t)), width=2)
ring_mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(ring_mask).ellipse((C - R - RW // 2, C - R - RW // 2, C + R + RW // 2, C + R + RW // 2), outline=255, width=RW)
img = Image.composite(ring, img, ring_mask)

# the knife in front of the ring
img = Image.composite(base, img, mask)
img.save(OUT / "logo_1600.png")
img.resize((800, 800), Image.LANCZOS).save(OUT / "avatar_800.png")
print("ok")
