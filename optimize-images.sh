#!/bin/bash
# Makes the site's pictures light: every screenshot in img/screens becomes a WebP next to its original, the two big porthole pictures become WebPs, small WebP
# copies of them are made for the 38 px logo in every header and footer, and the link-preview card is a JPEG (chat apps read JPEG and PNG, not always WebP).
# Run it after adding or replacing a picture:   ./optimize-images.sh      (needs cwebp: brew install webp)
set -euo pipefail
cd "$(dirname "$0")/img"
command -v cwebp >/dev/null || { echo "cwebp not found (brew install webp)"; exit 1; }
for f in screens/*.jpg screens/*.png; do [ -e "$f" ] || continue; cwebp -quiet -q 80 -m 6 "$f" -o "${f%.*}.webp"; done
for f in porthole-sunset porthole-night; do
  cwebp -quiet -q 82 -m 6 "$f.png" -o "$f.webp"
  cwebp -quiet -q 85 -m 6 -resize 96 96 "$f.png" -o "$f-96.webp"
done
sips -s format jpeg -s formatOptions 82 og-image.png --out og-image.jpg >/dev/null
du -sh . screens | sed 's/^/  /'
