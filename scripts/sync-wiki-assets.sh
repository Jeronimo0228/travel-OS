#!/usr/bin/env bash
# Update GitHub Wiki asset URLs that point into this repo's documentation/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=$(mktemp -d)
REMOTE="${REMOTE:-git@github.com-jeronimo0228:Jeronimo0228/travel-OS.wiki.git}"
git clone "$REMOTE" "$TMP"
cd "$TMP"
find . -name '*.md' -print0 | xargs -0 sed -i \
  -e 's|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/documentation/mockups/screenshots/|g' \
  -e 's|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/documentation/mockups/screenshots/|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/documentation/mockups/screenshots/|g' \
  -e 's|/blob/main/documentation/ceremonies/|/blob/main/documentation/ceremonies/|g' \
  -e 's|/blob/main/documentation/ceremonias/|/blob/main/documentation/ceremonies/|g' \
  -e 's|/tree/main/docs/|/tree/main/documentation/|g' \
  -e 's|/tree/main/documentation/|/tree/main/documentation/|g'
git add -A
if git diff --cached --quiet; then
  echo "Wiki assets already up to date"
  exit 0
fi
git -c user.name="Jeronimo0228" -c user.email="jeronimorestrepo48@gmail.com" \
  commit -m "docs: point wiki assets to documentation/"
git push origin HEAD
echo "Wiki assets updated"
