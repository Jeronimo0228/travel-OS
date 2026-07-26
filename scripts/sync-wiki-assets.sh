#!/usr/bin/env bash
# Actualiza en la GitHub Wiki las URLs de assets que viven en documentacion/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=$(mktemp -d)
REMOTE="${REMOTE:-git@github.com-jeronimo0228:Jeronimo0228/travel-OS.wiki.git}"
git clone "$REMOTE" "$TMP"
cd "$TMP"
# Migrate old screenshot paths if present
find . -name '*.md' -print0 | xargs -0 sed -i \
  's|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/docs/mockups/screenshots/|raw.githubusercontent.com/Jeronimo0228/travel-OS/main/documentacion/mockups/screenshots/|g'
find . -name '*.md' -print0 | xargs -0 sed -i \
  's|/blob/main/docs/ceremonias/|/blob/main/documentacion/ceremonias/|g'
find . -name '*.md' -print0 | xargs -0 sed -i \
  's|/tree/main/docs/|/tree/main/documentacion/|g'
git add -A
if git diff --cached --quiet; then
  echo "Wiki sin cambios de assets"
  exit 0
fi
git -c user.name="Jeronimo0228" -c user.email="jeronimorestrepo48@gmail.com" \
  commit -m "docs: point wiki assets to documentacion/"
git push origin HEAD
echo "Wiki assets actualizados"
