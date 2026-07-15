#!/usr/bin/env bash
# Regenerate the subsetted Iosevka woff2 files in public/fonts/.
#
# Fontsource's full Iosevka latin build is ~960KB per weight (Iosevka ships an
# enormous glyph set for programming ligatures/symbols we never use). The spec
# budgets fonts at <=120KB total, so we subset down to basic Latin plus the
# handful of extra glyphs the site actually renders (bullet, box-drawing pipe,
# arrow, sun/moon toggle icons, dashes/quotes, ellipsis).
#
# Requires: pyftsubset (pip install fonttools brotli)
set -euo pipefail

SRC="node_modules/@fontsource/iosevka/files"
OUT="public/fonts"
UNICODES="U+0020-007E,U+00A0,U+2013-2014,U+2018-201F,U+2022,U+25CF,U+2502,U+2197,U+2600,U+263E,U+2026"

mkdir -p "$OUT"

for weight in 400 700; do
  pyftsubset "$SRC/iosevka-latin-${weight}-normal.woff2" \
    --flavor=woff2 \
    --output-file="$OUT/iosevka-latin-${weight}.woff2" \
    --unicodes="$UNICODES" \
    --layout-features='*' \
    --no-hinting \
    --desubroutinize
done

du -h "$OUT"/*.woff2
