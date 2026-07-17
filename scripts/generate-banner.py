#!/usr/bin/env python3
"""Generate the homepage masthead wordmark (owner reference: the NEOVIM
dashboard logo — solid chunky pixel letters, purple, with a dark offset
shadow copy behind).

Renders bold text at a deliberately low resolution so letterforms quantize
into chunky pixels, then emits two layers of run-merged SVG <rect>s:
a shadow copy offset down-right in var(--bg2), and the front copy in
var(--purple). CSS variables inside inline SVG resolve against the page
theme, so the mark adapts to light/dark for free.

Also emits the same pixel grid as an ASCII `#` file — scripts/generate-og.py
draws the OG image's wordmark from that (PIL can't use CSS vars).

Outputs are committed; rerun manually if the wordmark changes.
"""
from PIL import Image, ImageDraw, ImageFont

TEXT = "TANJAL SHUKLA"
SVG_OUT = "src/assets/banner.svg"
ASCII_OUT = "src/assets/banner_ascii.txt"
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

FONT_SIZE = 13  # low-res on purpose: this is what pixelates the letterforms
THRESHOLD = 128
SHADOW_DX, SHADOW_DY = 1.4, 1.4  # in pixel-grid units

font = ImageFont.truetype(FONT_PATH, FONT_SIZE)
tmp = Image.new("L", (10, 10), 255)
bbox = ImageDraw.Draw(tmp).textbbox((0, 0), TEXT, font=font)
w = bbox[2] - bbox[0] + 2
h = bbox[3] - bbox[1] + 2

img = Image.new("L", (w, h), 255)
ImageDraw.Draw(img).text((1 - bbox[0], 1 - bbox[1]), TEXT, font=font, fill=0)
px = img.load()

grid = [[px[x, y] < THRESHOLD for x in range(w)] for y in range(h)]

# Trim blank rows/cols.
rows_on = [y for y in range(h) if any(grid[y])]
cols_on = [x for x in range(w) if any(grid[y][x] for y in range(h))]
y0, y1 = rows_on[0], rows_on[-1]
x0, x1 = cols_on[0], cols_on[-1]
grid = [row[x0 : x1 + 1] for row in grid[y0 : y1 + 1]]
gh, gw = len(grid), len(grid[0])

# Merge horizontal runs of on-pixels into single rects.
runs = []
for y in range(gh):
    x = 0
    while x < gw:
        if grid[y][x]:
            start = x
            while x < gw and grid[y][x]:
                x += 1
            runs.append((start, y, x - start))
        else:
            x += 1

rects = "".join(f'<rect x="{x}" y="{y}" width="{wd}" height="1"/>' for x, y, wd in runs)
vb_w = gw + SHADOW_DX + 0.6
vb_h = gh + SHADOW_DY + 0.6
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb_w} {vb_h}" '
    f'shape-rendering="crispEdges">'
    f'<g fill="var(--bg2)" transform="translate({SHADOW_DX},{SHADOW_DY})">{rects}</g>'
    f'<g fill="var(--purple)">{rects}</g>'
    f"</svg>"
)
with open(SVG_OUT, "w", encoding="utf-8") as f:
    f.write(svg + "\n")

# ASCII twin for the OG image (doubled cells to fix monospace aspect).
lines = ["".join("##" if on else "  " for on in row).rstrip() for row in grid]
with open(ASCII_OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"wrote {SVG_OUT} ({len(runs)} rects, {gw}x{gh}) and {ASCII_OUT}")
