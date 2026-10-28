"""Avatar (800x800) and YouTube banner (2560x1440, safe area 1546x423) for @cut.counter from clean scene stills."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE.parent / "releases" / "cutcounter"
OUT.mkdir(parents=True, exist_ok=True)
BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
BOLD = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
GOLD = (255, 194, 74)
still = lambda name: Image.open(HERE / "out" / name).convert("RGB")


def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, *im.size), r, fill=255)
    out = Image.new("RGBA", im.size); out.paste(im, (0, 0), m); return out


# avatar: the sliced bar with the knife, centred for the circle crop
a = still("brand_2.10.png").crop((0, 480, 900, 1380)).resize((800, 800), Image.LANCZOS)
v = Image.new("L", (800, 800), 0)
ImageDraw.Draw(v).ellipse((-160, -160, 960, 960), fill=255)
v = v.filter(ImageFilter.GaussianBlur(120))
a = Image.composite(a, Image.new("RGB", a.size, (16, 11, 8)), v)
a.save(OUT / "avatar_800.png")

# banner
W, H = 2560, 1440
b = Image.new("RGB", (W, H))
d = ImageDraw.Draw(b)
for y in range(H):
    k = y / H
    d.line([(0, y), (W, y)], fill=(int(24 + 20 * k), int(18 + 16 * k), int(14 + 13 * k)))
bricks = b.copy(); bd = ImageDraw.Draw(bricks)
for y in range(0, 560, 64):                                      # faint brick wall, fading out downwards
    for x in range(-((y // 64) % 2) * 64, W, 128):
        bd.rectangle((x + 4, y + 4, x + 124, y + 60), fill=(44, 34, 27))
mask = Image.new("L", (W, H), 0)
for y in range(560):
    ImageDraw.Draw(mask).line([(0, y), (W, y)], fill=int(255 * (1 - y / 560) ** 1.3))
b = Image.composite(bricks, b, mask)
d = ImageDraw.Draw(b)
X0, Y0 = 507, 508                                                # safe area origin (1546 x 423)
d.text((X0 + 30, Y0 + 50), "CUT COUNTER", font=ImageFont.truetype(BLACK, 100), fill="white")
d.text((X0 + 34, Y0 + 190), "10 cuts vs 1,000 cuts", font=ImageFont.truetype(BOLD, 54), fill=GOLD)
d.text((X0 + 34, Y0 + 272), "How many pieces can one", font=ImageFont.truetype(BOLD, 34), fill=(225, 218, 210))
d.text((X0 + 34, Y0 + 316), "object become?", font=ImageFont.truetype(BOLD, 34), fill=(225, 218, 210))
tiles = [("brand_0.20_noknife.png", "1 PIECE"), ("brand_5.20_noknife.png", "35 PIECES"), ("brand_42.30_noknife.png", "238,457")]
lab = ImageFont.truetype(BLACK, 30)
for i, (name, label) in enumerate(tiles):
    t = rounded(still(name).crop((60, 560, 860, 1360)).resize((230, 230), Image.LANCZOS), 22)
    x, y = 1300 + i * 250, Y0 + 45
    b.paste(t, (x, y), t)
    w = d.textlength(label, font=lab)
    d.text((x + 115 - w / 2, y + 248), label, font=lab, fill=GOLD if i == 2 else "white")
    if i < 2:
        d.text((x + 233, y + 90), "›", font=ImageFont.truetype(BLACK, 40), fill=(200, 190, 180))
b.save(OUT / "banner_2560x1440.png")
# preview of what YouTube shows on phones (the safe area)
b.crop((X0, Y0, X0 + 1546, Y0 + 423)).save(OUT / "banner_safe_area_preview.png")
print("ok")
