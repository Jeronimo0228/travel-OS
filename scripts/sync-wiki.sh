#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP=$(mktemp -d)
REMOTE="${REMOTE:-git@github.com-jeronimo0228:Jeronimo0228/travel-OS.wiki.git}"
if ! git clone "$REMOTE" "$TMP" 2>/tmp/wiki-clone.err; then
  echo "Wiki remota aún no existe. Activa Wiki en Settings del repo y reintenta."
  cat /tmp/wiki-clone.err || true
  exit 1
fi
rsync -a --delete --exclude .git "$ROOT/wiki/" "$TMP/"
cd "$TMP"
git add -A
if git diff --cached --quiet; then
  echo "Wiki sin cambios"
  exit 0
fi
git -c user.name="Jeronimo0228" -c user.email="jeronimorestrepo48@gmail.com" commit -m "docs: sync sprint wiki"
git push origin HEAD
echo "Wiki publicada"
