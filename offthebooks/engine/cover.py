"""Episode cover (Reels / Shorts thumbnail) in the series template.

Usage: python3 -I cover.py <scene image> <part number> "<TITLE LINE 1|LINE 2>" <out.png> [focus_y] [series name]
focus_y (0..1) picks which part of the scene stays visible under the title (default 0.6).
Everything that matters sits inside the 1080x1440 band Instagram keeps in the profile grid.
"""
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, part, title, out = sys.argv[1:5]
focus = float(sys.argv[5]) if len(sys.argv) > 5 else .6
series = sys.argv[6] if len(sys.argv) > 6 else "NOBODY CAN KNOW"
W, H = 1080, 1920
NAVY, GOLD = (14, 20, 36), (245, 197, 24)
# one accent per part, cycling, so the grid reads as a numbered shelf
ACCENTS = [(245, 197, 24), (88, 196, 255), (255, 98, 146), (88, 214, 141), (167, 139, 250), (255, 150, 64), (240, 84, 84)]
accent = ACCENTS[(int(part) - 1) % len(ACCENTS)]
BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

im = Image.open(src).convert("RGB")
s = max(W / im.width, H / im.height) * 1.05
im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
top = round((im.height - H) * focus)
left = (im.width - W) // 2
im = im.crop((left, top, left + W, top + H))

# dark band behind the title, fading into the scene
shade = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(shade)
for y in range(H):
    a = 235 if y < 700 else max(0, int(235 * (1 - (y - 700) / 380)))
    d.line((0, y, W, y), fill=a)
im = Image.composite(Image.new("RGB", (W, H), NAVY), im, shade)
d = ImageDraw.Draw(im)

F = lambda size: ImageFont.truetype(BLACK, size)
x = 70
d.text((x, 290), series, font=ImageFont.truetype(MONO, 34), fill=(200, 205, 215))
d.text((x, 395), "PART", font=F(130), fill="white")
pw = d.textlength("PART", font=F(130))
# big number with a soft glow
num = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(num).text((x + pw + 30, 300), part, font=F(290), fill=accent + (255,))
glow = num.filter(ImageFilter.GaussianBlur(18))
im.paste(Image.new("RGB", (W, H), accent), (0, 0), glow.split()[3].point(lambda v: v * .45))
im.paste(num, (0, 0), num)
d = ImageDraw.Draw(im)
d.rectangle((x, 600, x + 110, 612), fill=accent)
y = 640
for line in title.split("|"):
    size = 112
    while d.textlength(line, font=F(size)) > W - 2 * x:
        size -= 4
    d.text((x, y), line, font=F(size), fill="white", stroke_width=3, stroke_fill=NAVY)
    y += size + 10
im.save(out)
print("cover", out, "accent", accent)
