#!/usr/bin/env python3
"""Generate the OG image (SPEC.md §10): a designed static "screenshot" of
the editor window, 1200x630, committed to public/og.png. Rerun manually if
the site's look or wordmark changes. Uses Menlo (closest system monospace
to JetBrains Mono available as a PIL-loadable file) — the woff2 subsets in
public/fonts can't be loaded by PIL.
"""
from PIL import Image, ImageDraw, ImageFont

# v3 dark palette (src/styles/global.css) — keep in sync manually.
BG_D = (5, 5, 5)
BG0 = (10, 10, 10)
BG1 = (20, 20, 20)
BG2 = (28, 28, 30)
BG3 = (39, 39, 42)
FG = (237, 237, 237)
GREY = (90, 90, 96)
LIGHT_GREY = (154, 154, 162)
GREEN = (74, 222, 128)
PURPLE = (167, 139, 250)
CYAN = (34, 211, 238)
ACCENTS = [(248, 113, 113), GREEN, (251, 191, 36), (124, 129, 247), PURPLE, CYAN]

W, H = 1200, 630
img = Image.new("RGB", (W, H), BG_D)
d = ImageDraw.Draw(img)

mono = lambda s: ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", s)

# Window frame
wx0, wy0, wx1, wy1 = 80, 60, W - 80, H - 60
d.rounded_rectangle([wx0, wy0, wx1, wy1], radius=6, fill=BG0, outline=BG3, width=2)

# Bufferline strip
d.rectangle([wx0 + 2, wy0 + 2, wx1 - 2, wy0 + 40], fill=BG2)
d.rectangle([wx0 + 2, wy0 + 2, wx0 + 190, wy0 + 40], fill=BG0)
d.ellipse([wx0 + 18, wy0 + 16, wx0 + 28, wy0 + 26], fill=GREEN)
d.text((wx0 + 40, wy0 + 11), "index.md", font=mono(16), fill=FG)

# Explorer pane
ex1 = wx0 + 220
d.rectangle([wx0 + 2, wy0 + 42, ex1, wy1 - 2], fill=BG1)
d.text((wx0 + 24, wy0 + 64), "~/tanjal", font=mono(15), fill=CYAN)
files = ["index.md", "now.md", "library.md", "research.md", "motions.md", "resume.pdf"]
for i, name in enumerate(files):
    conn = "`--" if i == len(files) - 1 else "|--"
    d.text((wx0 + 24, wy0 + 96 + i * 28), conn, font=mono(15), fill=GREY)
    color = FG if i == 0 else LIGHT_GREY
    d.text((wx0 + 72, wy0 + 96 + i * 28), name, font=mono(15), fill=color)

# Pixel wordmark — solid rects from the committed banner grid (each "##"
# cell in banner_ascii.txt is one pixel), matching the site's SVG mark.
with open("src/assets/banner_ascii.txt") as f:
    banner = [line[::2] for line in f.read().rstrip("\n").split("\n")]
cell = 6
bx, by = ex1 + 60, wy0 + 130
shadow_off = int(cell * 1.4)


def draw_mark(ox, oy, color):
    for gy, row in enumerate(banner):
        for gx, ch in enumerate(row):
            if ch == "#":
                x, y = ox + gx * cell, oy + gy * cell
                d.rectangle([x, y, x + cell - 1, y + cell - 1], fill=color)


draw_mark(bx + shadow_off, by + shadow_off, BG2)
draw_mark(bx, by, PURPLE)
banner_h = len(banner) * cell

# Tagline under wordmark
d.text(
    (bx + 4, by + banner_h + 46),
    '"SDE @ Amazon"',
    font=mono(15),
    fill=GREEN,
)

# Accent strip
for i, c in enumerate(ACCENTS):
    x = bx + 4 + i * 30
    y = by + banner_h + 94
    d.ellipse([x, y, x + 14, y + 14], fill=c)

# Statusline
d.rectangle([wx0 + 2, wy1 - 40, wx1 - 2, wy1 - 2], fill=BG1)
d.rectangle([wx0 + 2, wy1 - 40, wx0 + 130, wy1 - 2], fill=GREEN)
d.text((wx0 + 16, wy1 - 33), "[ NORMAL ]", font=mono(14), fill=BG0)
d.text((wx0 + 150, wy1 - 33), "~/tanjal/index.md", font=mono(14), fill=LIGHT_GREY)
d.text((wx1 - 110, wy1 - 33), "Top 1:1", font=mono(14), fill=GREY)

img.save("public/og.png", optimize=True)
print("wrote public/og.png")
