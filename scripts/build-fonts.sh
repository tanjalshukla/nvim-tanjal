#!/usr/bin/env bash
# Regenerate the subsetted JetBrains Mono woff2 files in public/fonts/.
#
# The spec budgets fonts at <=120KB total. JetBrains Mono's Fontsource latin
# build is already small (~24KB/weight unsubsetted) but its Unicode coverage
# is much narrower than a font like Iosevka: no box-drawing, no arrows, no
# bullet circle, no sun/moon. Rather than let any of those glyphs silently
# fall back to the system font (which is how the v1 Iosevka build's "font
# doesn't look right" bug happened), the site avoids them entirely —
# CSS-drawn circles for dot markers, inline SVG for arrows/hamburger/sun/moon,
# ASCII tree connectors (the same `|--`/`` `-- `` convention `tree
# --charset ascii` uses) instead of box-drawing characters.
#
# UNICODES must cover every non-ASCII character actually used as real text
# content anywhere in src/ or site.config.ts. Recheck coverage with:
#   python3 -c "
#   import re,glob
#   chars=set()
#   for fn in glob.glob('src/**/*.astro',recursive=True)+['site.config.ts']:
#       chars |= {c for c in open(fn,encoding='utf-8').read() if ord(c)>0x7E}
#   print(sorted(f'U+{ord(c):04X}' for c in chars))
#   "
# ...then cross-check each codepoint is actually in JetBrains Mono's cmap
# before relying on it as real text (see fonttools getBestCmap()).
#
# Requires: pyftsubset (pip install fonttools brotli)
set -euo pipefail

SRC="node_modules/@fontsource/jetbrains-mono/files"
OUT="public/fonts"
# Basic Latin + no-break space + section sign (comments only) + middle dot
# (separator, used constantly) + dashes/smart quotes/bullet/ellipsis.
UNICODES="U+0020-007E,U+00A0,U+00A7,U+00B7,U+2013-2014,U+2018-201F,U+2022,U+2026"

mkdir -p "$OUT"

for weight in 400 700; do
  pyftsubset "$SRC/jetbrains-mono-latin-${weight}-normal.woff2" \
    --flavor=woff2 \
    --output-file="$OUT/jetbrains-mono-latin-${weight}.woff2" \
    --unicodes="$UNICODES" \
    --layout-features='*' \
    --no-hinting \
    --desubroutinize
done

du -h "$OUT"/*.woff2
